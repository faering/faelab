# Changelog

All notable changes to this project will be documented in this file.

This project aims to follow the spirit of [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and uses [Semantic Versioning](https://semver.org/spec/v2.0.0.html) (including pre-releases).

## [Unreleased]

### Added

- **CI/CD pipeline**
  - `build.yml`: builds and pushes `api` and `frontend` images to GHCR in parallel (matrix strategy) on every push to `main` and on `v*.*.*` tag pushes; uses `docker/metadata-action` to derive semver tags (`1.2.3`, `1.2`, `1`, `latest`) on tag pushes and `main` + `sha-*` on branch pushes; `VITE_API_BASE_URL` baked into the frontend image at build time from repository variables (`STAGING_API_BASE_URL` / `PROD_API_BASE_URL`); per-service GHA layer cache
  - `deploy-staging.yml`: triggered automatically after a successful build on `main`; derives `sha-<short>` image tag from the triggering commit and SSH-deploys to the staging environment
  - `deploy-prod.yml`: manual `workflow_dispatch` trigger with a `version` input; validates semver format then SSH-deploys the specified image tag; gated by a GitHub Environment required-reviewer approval step
  - GitHub Environments (`staging`, `production`) with scoped secrets (`DEPLOY_HOST`, `DEPLOY_USER`, `DEPLOY_SSH_KEY`, `GHCR_PAT`) and variables (`DEPLOY_PATH`, `DEPLOY_SSH_PORT`, `GHCR_USER`); production environment has a required-reviewer approval gate
  - Dedicated `deploy` system user on the VPS with Docker group membership and restricted SSH access; Ed25519 key pair for GitHub Actions authentication
  - `docker-compose.staging.yml` override: staging nginx binds to host ports `8080`/`8443`, distinct container names, separate loopback ports for Postgres (`5433`) and pgAdmin (`5051`); layered on top of `docker-compose.prod.yml` so only differences are expressed
  - `docker/nginx/nginx.staging.conf`: staging-specific nginx vhost for `staging.faelab.com`; identical routing to prod config
  - Both deploy workflows updated with explicit `--project-name` (`faelab-prod` / `faelab-staging`) to namespace containers, volumes, and networks between the two stacks
  - Cloudflare Origin Rule routes `staging.faelab.com` to VPS port `8443` — standard HTTPS port from browser perspective; no non-standard port exposure to visitors
- **Production infrastructure**
  - Multi-stage Dockerfiles for `apps/api` and `apps/frontend` with monorepo-aware build contexts
  - Docker Compose overlay structure: base (`docker-compose.yml`), dev (`docker-compose.dev.yml`), prod (`docker-compose.prod.yml`)
  - `web` / `internal` Docker network split: Postgres is air-gapped on an `internal: true` network with no outside route
  - nginx reverse proxy container for production: path-based routing (`/trpc`, `/auth`, `/api`, `/uploads` → API; catch-all → frontend), `client_max_body_size 110m` for video uploads, `CF-Connecting-IP` passthrough for Cloudflare deployments
  - nginx config inside the frontend container to serve the Vite static build and rewrite all paths to `index.html` for client-side routing
  - Docker secrets support: `_FILE` convention loader in `env.ts` maps `*_FILE` env vars to their base name by reading the file at runtime — works transparently across local `.env`, CI plain env vars, and Docker secrets
  - `.env.example` files for `apps/api` and root documenting all required environment variables
  - `.dockerignore` to exclude `node_modules`, uploads, and secrets from build context
- **Site Content Management System**
  - Full CMS for homepage content (Hero, About, Skills sections)
  - Database-backed site profiles with CRUD operations via tRPC
  - Profile presets system: save and load multiple site configurations
  - Real-time preview of content changes in CMS
- **File Upload System**
  - Drag-and-drop file uploader component for images and videos
  - Backend multipart file handling with `@fastify/multipart`
  - Static file serving for uploaded assets at `/uploads/images/*` and `/uploads/videos/*`
  - Automatic file cleanup when updating or deleting content
  - Upload validation: 5MB max for images, 100MB max for videos
  - Support for JPEG, PNG, WebP, GIF images and MP4, WebM, MOV videos
- **Videos Feature**
  - Database schema for videos table (title, description, videoUrl, thumbnailUrl, duration, tags, featured)
  - Complete CRUD API via tRPC for video management
  - Public Videos page (`/videos`) with grid layout and video cards
  - CMS integration: Videos section in CMS modal for content management
  - Video preview with HTML5 player and thumbnail support
  - Duration display in MM:SS format
  - **Professional Video Player**
    - Custom VideoPlayer abstraction layer (enables easy migration between player libraries)
    - Plyr-react implementation with full control bar (play, progress, volume, settings, fullscreen)
    - VideoModal component with full-screen overlay and backdrop blur
    - VideoDetails component displaying metadata (title, description, duration, tags, published date)
    - Custom Plyr CSS theming: purple color scheme (purple-500 primary, purple-700 accent)
    - Dark mode support with automatic theme switching
    - Responsive modal sizing (90vh max-height, scrollable content)
- **Video Player Accessibility**
  - Focus management: auto-focus on modal open, restore focus on close
  - Focus trap: Tab/Shift+Tab navigation cycles within modal
  - Full ARIA support: `aria-labelledby`, `aria-describedby`, `aria-modal`, `role="dialog"`
  - Keyboard shortcuts: ESC to close, Tab to navigate, Enter to activate
  - Improved close button labels with keyboard hints
  - Screen reader optimized with semantic HTML and ARIA live regions
  - Error handling UI foundation with graceful error display
- tRPC client integration with React Query and API connectivity checks in the CMS.
- GitHub OAuth admin login (server-side sessions) with optional dev bypass.
- Configurable auth method (`AUTH_METHOD=local|github`) and local admin login flow.
- Database-backed users and sessions tables for future multi-user support.
- Projects CMS now uses database-backed CRUD via tRPC.
- CMS search bar for quick project filtering.
- Projects page search + sort (Funnel dropdown).

### Changed

- `docker-compose.prod.yml` `api` and `frontend` services now reference pre-built GHCR images (`ghcr.io/faering/faelab/{api,frontend}:${IMAGE_TAG}`) instead of building on the server; `VITE_API_BASE_URL` removed from compose (baked into image at CI build time).
- Project renamed from `portfolio` to `faelab` — repository, container names, TypeScript imports, and default content values updated throughout.
- Featured and Projects pages now load projects from the database (tRPC) instead of local static data.
- CMS save/delete now return to the list view by default.
- CMS now includes three main sections: Home, Projects, and Videos.
- Projects CMS now uses FileUploader component for image uploads.
- Navigation header includes Videos link between Projects and Contact.

### Fixed

- Docker Compose dev override now moves Postgres and pgAdmin off the `internal` network onto an ordinary bridge network, fixing silent port-binding failures on Docker Desktop / WSL2.
- CORS + cookie handling for browser-based API requests.
- File cleanup prevents orphaned uploads when content is updated or deleted.
- Removed leftover `ALTER TABLE` migration fragment from `migrations.sql`.
- Added debug logging to the authentication flow to improve diagnosability.

## [0.1.0-alpha] - 2026-01-24

First public alpha of the portfolio site: core pages, theme system, and a fully usable Projects experience.

### Added

- Vite + React + TypeScript project foundation.
- Tailwind CSS styling pipeline (PostCSS) with class-based dark mode.
- Router-backed navigation with a landing page (`/`) and a dedicated Projects page (`/projects`).
- Dark mode toggle with persisted preference (`localStorage`).
- Landing page sections:
  - Hero
  - About
  - Skills
  - Featured Projects (with CTA linking to the full Projects page)
  - Contact
- Projects data model + validation:
  - Zod schema (`ProjectSchema`) provides runtime validation and inferred TypeScript types.
  - Featured Projects validates incoming project data at runtime before rendering.
- Projects page UX:
  - Grid/List view modes with persisted selection (`localStorage`).
  - Filtering by Tags and Tools/Tech Stack (multi-select) with a “reset filters” action.
  - Empty state when filters yield no matches.

### Tech Stack

- Build tooling: Vite
- UI: React
- Routing: React Router (`react-router-dom`)
- Styling: Tailwind CSS (+ PostCSS)
- Language: TypeScript
- Validation: Zod (project schema)

### Design Notes

- Component-first structure (reusable cards/sections) to keep UI concerns isolated.
- Schema-first project data approach (Zod) to make project entries safer to evolve.
- Preference persistence (theme + view mode) to make the site feel “app-like”.

### Known Limitations (Alpha)

- Contact form currently resets locally and logs to the console; it is not wired to an email/back-end service yet.
- Projects have to be manually added in `src/data/Projects.tsx` (CMS upcoming in future release)

[Unreleased]: https://github.com/faering/faelab/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/faering/faelab/compare/0.1.0-alpha...v0.1.0
[0.1.0-alpha]: https://github.com/faering/faelab/releases/tag/0.1.0-alpha
