ARG NODE_VERSION=22-alpine
ARG PNPM_VERSION=10.12.1
ARG PREZ_UI_VERSION=4.3.3
ARG NUXT_PUBLIC_PREZ_API_ENDPOINT=http://localhost:8000

FROM node:${NODE_VERSION} AS build

ARG PNPM_VERSION
ARG PREZ_UI_VERSION
ARG NUXT_PUBLIC_PREZ_API_ENDPOINT

ENV PNPM_HOME=/pnpm
ENV PATH=/pnpm:$PATH
ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0
ENV NUXT_PUBLIC_PREZ_API_ENDPOINT=${NUXT_PUBLIC_PREZ_API_ENDPOINT}

RUN corepack enable && corepack prepare pnpm@${PNPM_VERSION} --activate
RUN pnpm dlx create-prez-app@${PREZ_UI_VERSION} /app

WORKDIR /app
RUN pnpm install
RUN NODE_OPTIONS="--max-old-space-size=4096" pnpm generate

FROM nginx:alpine

COPY nginx.conf /etc/nginx/nginx.conf
COPY --from=build /app/.output/public /usr/share/nginx/html

EXPOSE 3000

CMD ["nginx", "-g", "daemon off;"]
