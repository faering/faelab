# ── Stage 1: build ──────────────────────────────────────────────────────────
FROM node:22-alpine AS builder
WORKDIR /app

# Activate the exact pnpm version declared in package.json
RUN corepack enable && corepack prepare pnpm@9.15.1 --activate

# Copy workspace manifests first so dependency layer is cached separately
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY apps/frontend/package.json  apps/frontend/
COPY apps/api/package.json       apps/api/
COPY packages/db/package.json    packages/db/
COPY packages/types/package.json packages/types/

RUN pnpm install --frozen-lockfile

# Copy source (full monorepo needed for workspace:* type deps)
COPY apps/frontend/ apps/frontend/
COPY apps/api/      apps/api/
COPY packages/      packages/
COPY tsconfig.base.json ./

# VITE_API_BASE_URL must be baked in at build time (e.g. https://yourdomain.com)
ARG  VITE_API_BASE_URL
ENV  VITE_API_BASE_URL=$VITE_API_BASE_URL

RUN pnpm --filter ./apps/frontend build

# ── Stage 2: serve ───────────────────────────────────────────────────────────
FROM nginx:alpine
COPY --from=builder /app/apps/frontend/dist /usr/share/nginx/html
COPY apps/frontend/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
