from prez.app import assemble_app

from response_header_middleware import ResponseHeaderMiddleware


def create_app():
    """Assemble Prez with repository-owned response sanitization."""
    return ResponseHeaderMiddleware(assemble_app())
