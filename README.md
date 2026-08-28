# OSPD Demo

This repo contains the configuration needed for [KurrawongAI](https://kurrawong.ai)'s system demonstration for the 
[Open Geospatial Consortium](https://www.ogc.org)'s [Open Science Persistent Demonstrator 2026](https://docs.ogc.org/request/2026/CFP_OSPD_2026.html) program.

## The tool

The tool used here is [Prez](https://prez.dev/), which is a Linked Data API and UI that makes RDF data available on the
web for humans and machines.

For this demo, the Prez API is deployed to the Azure Cloud using a Functions app and the UI is an Azure static web app.
the database containing the RDF data is KurrawongAI's shared [Fuseki](https://jena.apache.org/documentation/fuseki2/) demo
server.

Prez is the same tool used by the OGC for their [Definitions Server](https://defs.opengis.net), so the data and config
demoed here could easily be absorbed into that system.

## Running

### Prerequisites

- [Docker](https://docs.docker.com/engine/install/), including Docker Compose
- [Task](https://taskfile.dev/installation/)

### Configuration

Create the local environment file:

```bash
cp docker/.env.example docker/.env
```

Set the remote Fuseki password in `docker/.env`: all the other config is already added to `docker/.env.example` for
Prez to be able to access the data in KurrawongAI's Fuseki.

### Running the stack

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

### Running with the Azure Functions emulator

This mode runs the Prez API through Azure Functions Core Tools on port 7071 and
serves a separate UI image configured to use that port.

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

Then:

```bash
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

## Services

- **Prez UI:** <http://localhost:3000>
- **Prez API:** <http://localhost:8000>
- **Fuseki:** remote service configured by `SPARQL_ENDPOINT`

## Deploying to Azure

Production uses two independent Azure resources:

- Prez runs in a Python 3.12 Azure Function App on the Flex Consumption plan.
- PrezUI is generated as a client-side Nuxt site and deployed to Azure Static Web Apps.

The workflows under `.github/workflows/` deploy both applications when relevant
files change on `main`. Create the Azure resources before enabling the workflows.

### Function App

Create a Linux Flex Consumption Function App using Functions runtime 4, Python
3.12, a storage account, and Application Insights. Configure these application
settings in Azure:

```text
FUNCTIONS_WORKER_RUNTIME=python
AzureWebJobsFeatureFlags=EnableWorkerIndexing
SPARQL_REPO_TYPE=remote
SPARQL_ENDPOINT=https://fuseki.dev.kurrawong.ai/ospd/sparql
SPARQL_USERNAME=ospd
SPARQL_PASSWORD=<secret>
ENABLE_SPARQL_ENDPOINT=true
FUNCTION_APP_AUTH_LEVEL=ANONYMOUS
FUNCTION_APP_ROOT_PATH=
CORS_ALLOWED_ORIGIN=https://<static-web-app-hostname>
```

The Function must be anonymous because a Function key cannot safely be embedded
in the static browser application. Store the SPARQL password in Azure application
settings or use a Key Vault reference. Do not publish `local.settings.json`.

The deployment workflow uses GitHub OIDC. Configure a federated Azure identity
for this repository and grant it permission to deploy to the Function App. Add
these GitHub Actions secrets:

```text
AZURE_CLIENT_ID
AZURE_TENANT_ID
AZURE_SUBSCRIPTION_ID
```

Add this GitHub Actions repository variable:

```text
AZURE_FUNCTION_APP_NAME=<Function App resource name>
```

The workflow exports the locked `uv` environment to `requirements.txt` and asks
Azure to perform the Linux remote build. The generated file remains ignored
locally.

### Static Web App

Create an Azure Static Web App and obtain its deployment token. Add this GitHub
Actions secret:

```text
AZURE_STATIC_WEB_APPS_API_TOKEN=<deployment token>
```

Add the public Function endpoint as a GitHub Actions repository variable. It has
no `/api` suffix because `prez/host.json` sets an empty Functions route prefix:

```text
PREZ_API_ENDPOINT=https://<Function App resource name>.azurewebsites.net
```

The UI workflow installs the locked pnpm dependencies, runs `pnpm generate`, and
deploys `prez-ui/.output/public`. `staticwebapp.config.json` provides the fallback
needed when browser routes such as `/catalogs` are opened directly.

After Azure assigns the Static Web App hostname, set `CORS_ALLOWED_ORIGIN` on the
Function App to that exact origin. If a custom UI domain is added later, update
both that setting and any configured Azure platform CORS rules. Do not configure
both the application middleware and Azure platform CORS to emit duplicate CORS
headers.

### Deployment checks

After the first deployment, verify:

```text
https://<Function App resource name>.azurewebsites.net/health
https://<Function App resource name>.azurewebsites.net/catalogs
https://<Static Web App hostname>/catalogs
```

Browser network requests from PrezUI should go directly to the Function hostname,
must not contain `localhost` or `/api`, and must return exactly one matching
`Access-Control-Allow-Origin` header.

### Infracode deployment

These apps are deployed via terraform in the shared-fuseki-vm repo: `ospd-demo.tf`. See the deploying instructions in 
that repo's README file, _OSPD Demo_ section.

## Image layout

The root `Dockerfile` extends the selected Prez image and copies the configuration
under `prez/config` into the image. The files are stored directly in this repository
so Docker builds do not depend on absolute symlinks or another source checkout.

`prez-ui-docker/Dockerfile` creates a Prez UI application at the selected version,
applies the OSPD components and pages from `prez-ui-docker/overrides`, generates
the static site, and copies it into an Nginx runtime image.

`docker-compose.yml` builds and runs the two images. The browser-facing API endpoint
is embedded into the static UI at build time through `PREZ_API_ENDPOINT`.

The `functions` Compose profile builds only the UI, targeting the local Azure
Functions host at port 7071. The Python Function App under `prez/` merges Prez's
packaged reference data with `prez/config` before assembling the ASGI application.
Both deployment modes wrap Prez with repository-owned response middleware that
removes upstream hop-by-hop headers and emits browser-safe CORS headers. Set
`CORS_ALLOWED_ORIGIN` to the deployed Prez UI origin in Azure.

## License & Copyright

The license for this profile is the standard OGC software license: 

* [Apache 2.0 License](http://www.apache.org/licenses/LICENSE-2.0)

Copyright has not yet been established.

## Contacts

The lead developer of this work is:

**Dr Nicholas Car**  
_Data Architect_  
[KurrawongAI](https://kurrawong.ai)  
<nick@kurrawong.ai> 

You can also leave comments/requests
