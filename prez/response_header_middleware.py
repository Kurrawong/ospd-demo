import os
from collections.abc import Awaitable, Callable
from typing import Any


ASGIMessage = dict[str, Any]
ASGIScope = dict[str, Any]
ASGIReceive = Callable[[], Awaitable[ASGIMessage]]
ASGISend = Callable[[ASGIMessage], Awaitable[None]]

HOP_BY_HOP_HEADERS = {
    b"connection",
    b"keep-alive",
    b"proxy-authenticate",
    b"proxy-authorization",
    b"te",
    b"trailer",
    b"transfer-encoding",
    b"upgrade",
}

CORS_HEADERS = {
    b"access-control-allow-credentials",
    b"access-control-allow-origin",
}


class ResponseHeaderMiddleware:
    """Make proxied Prez responses safe for ASGI hosts and browser clients."""

    def __init__(self, app: Any, allowed_origin: str | None = None) -> None:
        self.app = app
        self.allowed_origin = (
            allowed_origin
            if allowed_origin is not None
            else os.getenv("CORS_ALLOWED_ORIGIN", "http://localhost:3000")
        ).strip()

    async def __call__(
        self,
        scope: ASGIScope,
        receive: ASGIReceive,
        send: ASGISend,
    ) -> None:
        if scope["type"] != "http":
            await self.app(scope, receive, send)
            return

        async def send_sanitized(message: ASGIMessage) -> None:
            if message["type"] == "http.response.start":
                headers = [
                    (name, value)
                    for name, value in message.get("headers", [])
                    if name.lower() not in HOP_BY_HOP_HEADERS | CORS_HEADERS
                ]

                if self.allowed_origin:
                    headers.append(
                        (b"access-control-allow-origin", self.allowed_origin.encode())
                    )
                    if self.allowed_origin != "*":
                        headers.append(
                            (b"access-control-allow-credentials", b"true")
                        )

                message = {**message, "headers": headers}

            await send(message)

        await self.app(scope, receive, send_sanitized)
