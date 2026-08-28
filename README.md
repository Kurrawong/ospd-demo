# Prez Demo

This repository builds and runs a self-contained Prez stack using Docker Compose,
following the same pattern as the `detsi-vocabs` project:

- a Prez API image containing this repository's custom endpoint and profile definitions;
- a separately built Prez UI image served by Nginx; and
- a remote, authenticated Fuseki dataset used as the RDF backend.

The stack does not create a local Fuseki container and does not load RDF data.

## Prerequisites

- [Docker](https://docs.docker.com/engine/install/), including Docker Compose
- [Task](https://taskfile.dev/installation/)

## Configuration

Create the local environment file:

```bash
cp docker/.env.example docker/.env
```

Set the remote Fuseki password in `docker/.env`:

```dotenv
SPARQL_PASSWORD=replace-me
```

The default non-secret settings are:

```dotenv
PREZ_VERSION=4.23.7
PREZ_UI_VERSION=4.3.3
PREZ_API_ENDPOINT=http://localhost:8000
SPARQL_ENDPOINT=https://fuseki.dev.kurrawong.ai/ospd/sparql
SPARQL_USERNAME=ospd
```

`docker/.env` is ignored by Git.

## Running the stack

Build both images:

```bash
task stack:build
```

Start the stack:

```bash
task stack:up
```

Open the catalogue UI at <http://localhost:3000/catalogs>.

Other stack commands are:

```bash
task stack:restart
task stack:logs
task stack:down
task stack:clean
```

`stack:clean` removes stack-owned Docker volumes. It does not modify the remote
Fuseki dataset.

## Running with the Azure Functions emulator

This mode runs the Prez API through Azure Functions Core Tools on port 7071 and
serves a separate UI image configured to use that port. It continues to query the
remote Fuseki backend; it does not build or copy a local RDF database.

Prerequisites in addition to Docker and Task are:

- Python 3.12
- [uv](https://docs.astral.sh/uv/)
- Azure Functions Core Tools 4

Create the untracked local Function settings and set the Fuseki password:

```bash
cp prez/local.settings.example.json prez/local.settings.json
```

Build the Functions environment and UI image:

```bash
task functions:build
```

The normal container stack and Functions mode both use port 3000, so stop the
normal stack before starting Functions mode:

```bash
task stack:down
task functions:dev
```

`functions:dev` starts the Functions-mode UI in Docker and runs Azure Functions
Core Tools in the foreground. The services are then available at:

- Prez UI: <http://localhost:3000/catalogs>
- Emulated Function App: <http://localhost:7071>

Press Ctrl+C to stop the Functions host, then stop its UI with:

```bash
task functions:down
```

The lower-level equivalents are:

```bash
task functions:up
task prez:dev
```

## Services

- **Prez UI:** <http://localhost:3000>
- **Prez API:** <http://localhost:8000>
- **Fuseki:** remote service configured by `SPARQL_ENDPOINT`

## Image layout

The root `Dockerfile` extends the selected Prez image and copies the configuration
under `prez/config` into the image. The files are stored directly in this repository
so Docker builds do not depend on absolute symlinks or another source checkout.

`prez-ui-docker/Dockerfile` creates a Prez UI application at the selected version,
generates the static site, and copies it into an Nginx runtime image.

`docker-compose.yml` builds and runs the two images. The browser-facing API endpoint
is embedded into the static UI at build time through `PREZ_API_ENDPOINT`.

The `functions` Compose profile builds only the UI, targeting the local Azure
Functions host at port 7071. The Python Function App under `prez/` merges Prez's
packaged reference data with `prez/config` before assembling the ASGI application.
