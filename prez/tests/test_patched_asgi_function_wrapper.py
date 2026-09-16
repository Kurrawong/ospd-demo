import unittest

from azure.functions import HttpRequest

from patched_asgi_function_wrapper import PatchedAsgiMiddleware


class PatchedAsgiMiddlewareTests(unittest.IsolatedAsyncioTestCase):
    async def test_buffers_body_without_forwarding_hop_by_hop_headers(self):
        async def streaming_app(scope, receive, send):
            self.assertEqual("http", scope["type"])
            await send(
                {
                    "type": "http.response.start",
                    "status": 200,
                    "headers": [
                        (b"content-type", b"application/sparql-results+json"),
                        (b"transfer-encoding", b"chunked"),
                        (b"connection", b"close, x-upstream-connection"),
                        (b"x-upstream-connection", b"remove-me"),
                        (b"keep-alive", b"timeout=5"),
                        (b"proxy-authenticate", b"Basic"),
                        (b"proxy-authorization", b"Basic dGVzdA=="),
                        (b"proxy-connection", b"close"),
                        (b"te", b"trailers"),
                        (b"trailer", b"x-checksum"),
                        (b"upgrade", b"websocket"),
                    ],
                }
            )
            await send(
                {
                    "type": "http.response.body",
                    "body": b'{"boolean":',
                    "more_body": True,
                }
            )
            await send(
                {
                    "type": "http.response.body",
                    "body": b"true}",
                    "more_body": False,
                }
            )

        request = HttpRequest(
            method="GET",
            url="https://function.example/sparql",
            body=b"",
        )

        response = await PatchedAsgiMiddleware(streaming_app).handle_async(request)

        self.assertEqual(200, response.status_code)
        self.assertEqual(b'{"boolean":true}', response.get_body())
        self.assertEqual(
            "application/sparql-results+json",
            response.headers["content-type"],
        )
        for header_name in (
            "connection",
            "keep-alive",
            "proxy-authenticate",
            "proxy-authorization",
            "proxy-connection",
            "te",
            "trailer",
            "transfer-encoding",
            "upgrade",
            "x-upstream-connection",
        ):
            with self.subTest(header_name=header_name):
                self.assertNotIn(header_name, response.headers)


if __name__ == "__main__":
    unittest.main()
