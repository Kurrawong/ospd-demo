# Prez configuration

The endpoint and profile definitions under `config/` are copied into the Prez API
image by the repository's root `Dockerfile`.

## Azure Functions

This directory is also an Azure Functions Python project. It wraps Prez's ASGI
application, uses the remote SPARQL repository configured in `local.settings.json`,
and merges `config/` with Prez's packaged reference data at startup.

From the repository root, prepare and run it with:

```bash
task prez:uv:sync
task prez:dev
```

The local Functions host listens on <http://localhost:7071>. Copy
`local.settings.example.json` to the ignored `local.settings.json` before first use.

For Azure deployment, the repository workflow exports `uv.lock` to a temporary
`requirements.txt`, installs the locked dependencies under `.python_packages`,
and deploys this directory without an Azure remote build. Configure deployed
values as Function App settings through Terraform; Azure does not publish or read
`local.settings.json`. See the repository root README for the required Azure and
GitHub settings.

Prez supplies wildcard CORS headers. The Function App and its clients therefore
do not configure a second CORS layer, and browser requests must not include
credentials.
