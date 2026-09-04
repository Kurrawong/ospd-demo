# LD Client

This is a small single-page web application that queries the OSPD Prez SPARQL
endpoint.

## Configuration

Set `VITE_SPARQL_ENDPOINT` to the complete SPARQL endpoint before building. The
default `/api/sparql` supports the local reverse proxy; deployed builds use the
dev Function App's public `/sparql` URL.

```bash
cp .env.example .env
```

## Build

```bash
npm ci
npm run build
npm run test:build
```

## Run

```bash
npm run dev
```
