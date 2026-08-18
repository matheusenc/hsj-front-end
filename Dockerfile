# syntax=docker/dockerfile:1

FROM node:22-alpine AS build
WORKDIR /app

# O lockfile vem antes do código para o npm ci virar camada cacheada.
COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

# O build é estático (outputMode: static), então basta servir arquivos.
FROM caddy:2-alpine AS runtime

COPY --from=build /app/dist/hsj-angular/browser /srv
COPY docker/Caddyfile /etc/caddy/Caddyfile

EXPOSE 8080
