# Changelog

All notable changes to this project will be documented in this file.

This project aims to follow the spirit of [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and uses [Semantic Versioning](https://semver.org/spec/v2.0.0.html) (including pre-releases).

## [Unreleased]

### Added

- tRPC client integration with React Query and API connectivity checks in the CMS.
- GitHub OAuth admin login (server-side sessions) with optional dev bypass.
- Configurable auth method (`AUTH_METHOD=local|github`) and local admin login flow.
- Database-backed users and sessions tables for future multi-user support.
- Projects CMS now uses database-backed CRUD via tRPC.
- CMS search bar for quick project filtering.
- Projects page search + sort (Funnel dropdown).

### Changed

- Featured and Projects pages now load projects from the database (tRPC) instead of local static data.
- CMS save/delete now return to the list view by default.

### Fixed

- CORS + cookie handling for browser-based API requests.

### Remaining

- Wire up the contact form to a real delivery mechanism (email service / backend).
- Improve accessibility and keyboard navigation across interactive controls.

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

[Unreleased]: https://github.com/faering/portfolio-website/compare/0.1.0-alpha...HEAD
[0.1.0-alpha]: https://github.com/faering/portfolio-website/releases/tag/0.1.0-alpha
