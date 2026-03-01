# ── Stage 1: install deps ─────────────────────────────────────────────────────
# The API runs its TypeScript source directly with tsx (tsconfig has noEmit:true).
# The full monorepo is needed because packages/db and packages/types are workspace:* deps.
FROM node:22-alpine AS deps
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@9.15.1 --activate

# Manifests first → dependency layer cached until lockfile changes
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY apps/api/package.json       apps/api/
COPY packages/db/package.json    packages/db/
COPY packages/types/package.json packages/types/

# Install all deps including devDeps (tsx is a devDependency)
RUN pnpm install --frozen-lockfile

# ── Stage 2: runtime ─────────────────────────────────────────────────────────
FROM node:22-alpine
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@9.15.1 --activate

# Copy installed deps from previous stage
COPY --from=deps /app/node_modules      node_modules/

# Copy source
COPY package.json pnpm-workspace.yaml ./
COPY apps/api/    apps/api/
COPY packages/    packages/
COPY tsconfig.base.json ./

ENV NODE_ENV=production

# Uploads are mounted as a named volume at runtime
RUN mkdir -p /app/uploads/images /app/uploads/videos

EXPOSE 3001
CMD ["node_modules/.bin/tsx", "apps/api/src/index.ts"]
