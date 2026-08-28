ARG PREZ_VERSION=4.23.7

FROM ghcr.io/rdflib/prez:${PREZ_VERSION}

# The base image merges overrides from /app/reference_data with Prez's
# packaged reference data when the container starts.
COPY prez/config/ /app/reference_data/
