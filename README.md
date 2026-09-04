# OSPD Demo

This repo contains the configuration needed for [KurrawongAI](https://kurrawong.ai)'s system demonstration for the 
[Open Geospatial Consortium](https://www.ogc.org)'s [Open Science Persistent Demonstrator 2026](https://docs.ogc.org/request/2026/CFP_OSPD_2026.html) program.

## The tool

The tool used here is [Prez](https://prez.dev/), which is a Linked Data API and UI that makes RDF data available on the
web for humans and machines.

For this demo, the Prez API is deployed to Azure using a Function App. Prez UI
and the LD Client are hosted by separate Azure Static Web Apps. The database
containing the RDF data is KurrawongAI's shared
[Fuseki](https://jena.apache.org/documentation/fuseki2/) demo server.

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

The dev environment uses three independently deployed Azure resources:

- Prez runs in a Python 3.12 Function App on the Flex Consumption plan.
- Prez UI is a generated Nuxt site hosted by Azure Static Web Apps.
- LD Client is a generated Vite site hosted by a second Azure Static Web App.

Publishing a GitHub Release whose tag is a semantic version such as `v1.2.3`
starts `.github/workflows/release.yml`. Prereleases are also deployed. The three
jobs run in parallel and do not depend on one another, so a failure in one does
not stop the others. The workflow as a whole is unsuccessful if any job fails.

The workflow always checks out the release tag. To roll back, rerun the deployment
jobs for an earlier release.

### Terraform responsibilities

Provision the following separately with Terraform before publishing a release:

- The Linux Flex Consumption Function App, configured for Functions runtime 4
  and Python 3.12, including its storage and Application Insights resources.
- A user-assigned managed identity with `Website Contributor` scoped only to the
  Function App.
- A federated credential for the GitHub OIDC subject
  `repo:Kurrawong/ospd-demo:environment:dev` and audience
  `api://AzureADTokenExchange`.
- Two Azure Static Web Apps dedicated to dev. Releases update the production
  slot of each dev resource.
- All Function App runtime settings and secrets.

The Function App requires these workload settings:

```text
SPARQL_REPO_TYPE=remote
SPARQL_ENDPOINT=https://fuseki.dev.kurrawong.ai/ospd/sparql
SPARQL_USERNAME=ospd
SPARQL_PASSWORD=<secret or Key Vault reference>
ENABLE_SPARQL_ENDPOINT=true
FUNCTION_APP_AUTH_LEVEL=ANONYMOUS
FUNCTION_APP_ROOT_PATH=
```

The browser applications cannot safely contain a Function key, so the HTTP
function is anonymous. Prez supplies wildcard CORS itself; do not configure a
second CORS policy on the Function App. CORS is not an authentication or
rate-limiting mechanism.

Terraform owns infrastructure and runtime configuration. The GitHub workflow
only packages and deploys application code.

### GitHub `dev` environment

Create a GitHub environment named `dev`. Its deployment policy must allow the
repository's release tags and match the subject used by the Azure federated
credential.

Configure these environment variables:

```text
AZURE_CLIENT_ID=<user-assigned managed identity client ID>
AZURE_TENANT_ID=<Microsoft Entra tenant ID>
AZURE_SUBSCRIPTION_ID=<Azure subscription ID>
AZURE_FUNCTION_APP_NAME=<Function App resource name>
PREZ_API_ENDPOINT=https://<Function App hostname>
LD_CLIENT_SPARQL_ENDPOINT=https://<Function App hostname>/sparql
PREZ_UI_URL=https://<Prez UI Static Web App hostname>
LD_CLIENT_URL=https://<LD Client Static Web App hostname>
```

Configure these environment secrets using the deployment tokens from the two
Static Web Apps:

```text
PREZ_UI_SWA_DEPLOYMENT_TOKEN=<Prez UI deployment token>
LD_CLIENT_SWA_DEPLOYMENT_TOKEN=<LD Client deployment token>
```

No Azure client secret or publish profile is used. The Function job authenticates
with GitHub OIDC; the two frontend jobs use only their resource-specific Static
Web Apps deployment tokens.

### Release jobs

The Prez job exports the committed `uv.lock`, installs its dependencies into
`prez/.python_packages`, tests the Function entry point, stages a ZIP according
to `prez/.funcignore`, and deploys that prebuilt package. Azure does not perform
a remote dependency build. The job then waits for `PREZ_API_ENDPOINT/health` to
succeed.

The Prez UI job installs the locked pnpm dependencies, typechecks the application,
generates `prez-ui/.output/public` using `PREZ_API_ENDPOINT`, and deploys that
prebuilt directory.

The LD Client job installs its locked npm dependencies, builds `ld-client/dist`
using `LD_CLIENT_SPARQL_ENDPOINT`, verifies that all referenced assets are
present, and deploys that prebuilt directory.

Both frontend jobs check their stable public URL after deployment. Every job adds
its release tag, source commit, destination, and result to the workflow summary.

## Image layout

The root `Dockerfile` extends the selected Prez image and copies the configuration
under `prez/config` into the image. The files are stored directly in this repository
so Docker builds do not depend on absolute symlinks or another source checkout.

`prez-ui/` is the canonical OSPD UI source. `prez-ui-docker/Dockerfile` builds
that source and copies the generated static site into an Nginx runtime image for
local Docker Compose use.

`docker-compose.yml` builds and runs the two images. The browser-facing API endpoint
is embedded into the static UI at build time through `PREZ_API_ENDPOINT`.

The `functions` Compose profile builds only the UI, targeting the local Azure
Functions host at port 7071. The Python Function App under `prez/` merges Prez's
packaged reference data with `prez/config` before assembling the ASGI application.

Docker images are local-development artifacts. The release workflow neither
builds nor publishes container images.

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
