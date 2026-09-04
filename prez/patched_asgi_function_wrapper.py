from copy import copy
from typing import Union

import azure.functions as func
from azure.functions import HttpRequest
from azure.functions._abc import Context
from azure.functions._http_asgi import AsgiMiddleware, AsgiRequest, AsgiResponse
from azure.functions._http_wsgi import WsgiMiddleware
from azure.functions.decorators.http import HttpMethod


HOP_BY_HOP_HEADERS = frozenset(
    {
        "connection",
        "keep-alive",
        "proxy-authenticate",
        "proxy-authorization",
        "proxy-connection",
        "te",
        "trailer",
        "transfer-encoding",
        "upgrade",
    }
)


def _remove_hop_by_hop_headers(response: func.HttpResponse) -> func.HttpResponse:
    """Remove headers that cannot survive Azure's buffered ASGI conversion."""
    connection_headers = response.headers.getlist("connection")
    connection_tokens = {
        token.strip().lower()
        for value in connection_headers
        for token in value.split(",")
        if token.strip()
    }

    for header_name in HOP_BY_HOP_HEADERS | connection_tokens:
        del response.headers[header_name]

    return response


class PatchedAsgiMiddleware(AsgiMiddleware):
    """Preserve ASGI lifespan state when handling an Azure Functions request."""

    async def _handle_async(self, req, context):
        asgi_request = AsgiRequest(req, context)
        scope = asgi_request.to_asgi_http_scope()
        scope["state"] = copy(self.state)
        asgi_response = await AsgiResponse.from_app(
            self._app,
            scope,
            req.get_body(),
        )
        return _remove_hop_by_hop_headers(asgi_response.to_func_response())


class AsgiFunctionApp(func.AsgiFunctionApp):
    """Expose the complete Prez ASGI application without a doubled route slash."""

    def __init__(self, app, http_auth_level):
        super(AsgiFunctionApp, self).__init__(
            None,
            http_auth_level=http_auth_level,
        )
        self._function_builders.clear()
        self.middleware = PatchedAsgiMiddleware(app)
        self._add_http_app(self.middleware)
        self.startup_task_done = False

    def _add_http_app(
        self,
        http_middleware: Union[AsgiMiddleware, WsgiMiddleware],
        function_name: str = None,
    ) -> None:
        asgi_middleware: AsgiMiddleware = http_middleware

        @self.http_type(http_type="asgi")
        @self.route(
            methods=(method for method in HttpMethod),
            auth_level=self.auth_level,
            route="{*route}",
        )
        async def http_app_func(req: HttpRequest, context: Context):
            if not self.startup_task_done:
                success = await asgi_middleware.notify_startup()
                if not success:
                    raise RuntimeError("ASGI middleware startup failed")
                self.startup_task_done = True

            return await asgi_middleware.handle_async(req, context)
