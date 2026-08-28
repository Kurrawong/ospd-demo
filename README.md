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
