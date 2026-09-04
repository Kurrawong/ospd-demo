ARG NODE_VERSION=22-alpine
ARG PNPM_VERSION=10.12.1
ARG NUXT_PUBLIC_PREZ_API_ENDPOINT=http://localhost:3000/api

FROM node:${NODE_VERSION} AS build

ARG PNPM_VERSION
ARG NUXT_PUBLIC_PREZ_API_ENDPOINT

ENV PNPM_HOME=/pnpm
ENV PATH=/pnpm:$PATH
ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0
ENV NUXT_PUBLIC_PREZ_API_ENDPOINT=${NUXT_PUBLIC_PREZ_API_ENDPOINT}

RUN corepack enable \
    && corepack prepare pnpm@${PNPM_VERSION} --activate

WORKDIR /app

COPY prez-ui/package.json prez-ui/pnpm-lock.yaml prez-ui/pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

COPY prez-ui/ ./
RUN NODE_OPTIONS="--max-old-space-size=4096" pnpm generate

FROM nginx:alpine

# The official Nginx entrypoint substitutes PREZ_UPSTREAM into this template
# when the container starts.
COPY prez-ui-docker/nginx.conf /etc/nginx/templates/nginx.conf.template
ENV NGINX_ENVSUBST_OUTPUT_DIR=/etc/nginx

COPY --from=build /app/.output/public /usr/share/nginx/html

EXPOSE 3000

CMD ["nginx", "-g", "daemon off;"]
