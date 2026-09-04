import importlib
import os
import pathlib
import unittest

import httpx
from azure.functions import AuthLevel, HttpMethod


os.environ.setdefault("SPARQL_REPO_TYPE", "remote")
os.environ.setdefault("SPARQL_ENDPOINT", "https://example.invalid/sparql")
os.environ.setdefault("SPARQL_USERNAME", "ospd")
os.environ.setdefault("SPARQL_PASSWORD", "test-only")
os.environ.setdefault("ENABLE_SPARQL_ENDPOINT", "true")
os.environ.setdefault("FUNCTION_APP_AUTH_LEVEL", "ANONYMOUS")

function_app = importlib.import_module("function_app")


class FunctionAppTests(unittest.TestCase):
    def test_http_function_is_registered(self):
        functions = function_app.app.get_functions()

        self.assertEqual(1, len(functions))
        trigger = next(
            binding
            for binding in functions[0].get_bindings()
            if binding.get_dict_repr()["type"] == "httpTrigger"
        ).get_dict_repr()
        self.assertEqual("{*route}", trigger["route"])
        self.assertEqual(AuthLevel.ANONYMOUS, trigger["authLevel"])
        self.assertEqual(
            {
                HttpMethod.DELETE,
                HttpMethod.GET,
                HttpMethod.HEAD,
                HttpMethod.OPTIONS,
                HttpMethod.PATCH,
                HttpMethod.POST,
                HttpMethod.PUT,
            },
            set(trigger["methods"]),
        )

    def test_custom_reference_data_is_packaged(self):
        reference_data_dir = pathlib.Path(os.environ["PREZ_REFERENCE_DATA_DIR"])

        self.assertTrue(
            (
                reference_data_dir
                / "endpoints"
                / "data_endpoints_default"
                / "default_endpoints.ttl"
            ).is_file()
        )
        self.assertTrue(
            (reference_data_dir / "profiles" / "geoac-default.ttl").is_file()
        )


class CorsTests(unittest.IsolatedAsyncioTestCase):
    async def asyncSetUp(self):
        self.client = httpx.AsyncClient(
            transport=httpx.ASGITransport(app=function_app.prez_app),
            base_url="https://function.example",
        )

    async def asyncTearDown(self):
        await self.client.aclose()

    async def test_preflight_request_allows_any_origin(self):
        origin = "https://prez-ui.example"
        response = await self.client.options(
            "/health",
            headers={
                "Origin": origin,
                "Access-Control-Request-Method": "GET",
            },
        )

        self.assertEqual(200, response.status_code)
        self.assertEqual(
            [origin], response.headers.get_list("Access-Control-Allow-Origin")
        )

    async def test_normal_response_allows_any_origin(self):
        response = await self.client.get(
            "/not-a-real-prez-route",
            headers={"Origin": "https://ld-client.example"},
        )

        self.assertEqual(404, response.status_code)
        self.assertEqual(
            ["*"], response.headers.get_list("Access-Control-Allow-Origin")
        )


if __name__ == "__main__":
    unittest.main()
