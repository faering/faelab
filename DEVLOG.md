# Dev Log

This is a narrative dev log for the portfolio site.

The goal here is different from `CHANGELOG.md`: it’s meant to show decision-making, iteration, and the “why” behind the implementation.

---

## 0.1.0-alpha (24-01-2026) — Establishing the foundation

### What I set out to build

This portfolio site exists to communicate professionalism through both the content *and* the craft:

- A fast, modern front-end stack.
- A clean, readable codebase.
- A polished UI that works across screen sizes.
- A Projects experience that’s actually usable (not just a static list).

### Why this stack

- **Vite**: fast local dev, modern defaults, and a frictionless build setup.
- **React**: component composition fits the shape of a portfolio (sections, cards, reusable UI patterns).
- **React Router**: simple route-level separation between the landing page and the “All Projects” page.
- **TypeScript**: improves maintainability and makes refactors safer as the project grows.
- **Tailwind CSS**: rapid iteration with consistent styling + easy responsive and dark-mode variants.
- **Zod**: runtime validation for project data, not just compile-time typing.

### Key design choices (and what they buy me)

#### 1) “Schema-first” project data

I wanted projects to feel like real, structured content — not ad-hoc objects sprinkled throughout components.

- I defined a `ProjectSchema` with Zod and inferred the TypeScript type from it.
- For the Featured Projects section, I validate at runtime before rendering.

This approach makes the project list easier to evolve (adding fields, tightening constraints, etc.) without silent UI breakage.

#### 2) Data/config separation

Instead of hardcoding personal details and project entries directly in UI components:

- Personal/contact/social info lives in a central config module.
- Projects live in a dedicated data module.

That separation keeps components focused on layout and interaction, and it makes future data sources (CMS/API) easier to swap in.

#### 3) Dark mode as a first-class feature

Dark mode is not just a cosmetic toggle — it’s part of the UX polish.

- Tailwind is configured for class-based dark mode.
- Theme choice is persisted in `localStorage` so the site “remembers me”.

The goal is to make the site feel like a well-made product, not a throwaway demo.

#### 4) The Projects page is treated like a small app

A portfolio’s credibility lives and dies by the Projects section, so I gave it real interaction:

- **Two view modes** (grid + list) so visitors can browse visually or scan quickly.
- **Filtering** by Tags and Tools/Tech Stack to find relevant work quickly.
- **Persistence** of the selected view mode so it behaves like a preference.
- **Empty state** so the UI stays helpful even when filters return no matches.

I also cared about small interaction details:

- Filter dropdown closes on outside click and on Escape.
- Controls are labeled (e.g., aria-label on view mode buttons).

### UI direction

The UI is intentionally modern and clean:

- Gradients and soft backgrounds to add depth.
- A consistent accent color direction (I went for pastel colors i.e. purple/pink) across sections.
- Responsive section layout and typography so it scales from mobile to desktop.

### What’s next

- [x] Create a Postgres database to store projects metadata (and path to real image storage).
- [ ] Define a Prisma schema for the project entries. (NOT NEEDED)
- [x] Create a custom CMS UI with drag-and-drop feature for images.
- [ ] Wire the contact form to a real delivery mechanism (email service/backend).
- [ ] Improve accessibility and keyboard navigation across all interactive elements.

---

## Notes for future me

- Keep the “why” as visible as the “what”: the docs should reinforce professionalism.
- Prefer evolving the schema + data layer first, then updating UI.
- Avoid overengineering: this is a portfolio, but it should feel production-quality.

---

## 0.1.0 (30-01-2026) — From static data to real content (DB + tRPC)

### What I set out to fix

The portfolio looked polished, but the data layer still smelled like a demo:

- Projects were hardcoded and bundled into the frontend.
- The “CMS” UI existed as a UX prototype, but didn’t represent the source of truth.

The goal for today was to make Projects feel like real content:

- **Read from a real database** (Postgres) in the actual user-facing views.
- **Edit via a real API** (tRPC) from inside the existing Projects-page modal.
- Keep the UI constraints that make the CMS feel product-grade (discard guards, route scoping, safe defaults).

### Design approach: staged migration, not a big bang

I intentionally migrated in steps to reduce risk and isolate issues:

1) **Wire the tRPC client + React Query** first.
2) Add a **temporary “connectivity status”** indicator so I can prove the frontend can reach the API before switching core UI.
3) Switch the read paths:
	 - landing “Featured Projects”
	 - `/projects` page
4) Only then switch the CMS list/editor to database-backed CRUD.

This “prove the pipe works first” pattern prevents the most annoying failure mode: being unsure whether the bug is in UI logic, API routing, network, or types.

### Why tRPC (and why schema-first still matters)

The Projects feature benefits from end-to-end typing because it has lots of small moving parts:

- tags/tools filters
- optional fields (image/repo/live)
- featured flag
- create/update constraints

Using **tRPC + shared Zod schemas** means:

- The API contract is enforced at runtime and at compile-time.
- The frontend can evolve forms safely without drifting from the backend.
- The API can throw meaningful validation errors (e.g. missing required fields) that the UI can show without custom mapping glue.

### Debugging note: “API is running” is not the same as “browser can call it”

One of the early frictions was the CMS showing the API as offline while the server was clearly up on `localhost:3001`.

Even for local dev, a browser request is still subject to cross-origin rules, preflight checks, and the exact URL used by the client.

So part of making the system feel real was treating local networking like production:

- the API explicitly enables CORS for dev origins
- the client uses a single base URL (`VITE_API_BASE_URL` overrideable)

This is one of those details that separates “it works on my machine” from “it’s reliably testable”.

### Result: Projects now come from the database everywhere

At the end of the iteration:

- **Landing page Featured Projects** are loaded via `projects.list` and displayed from DB data.
	- If any projects are marked `featured`, those are used.
	- Otherwise a small fallback slice is shown so the section doesn’t look empty during early content entry.

- **Projects page** grid/list + filtering are driven by DB data.
	- Filter options are derived from the fetched projects.
	- Loading and error states are explicit (no silent empties).

- **CMS modal** now uses DB-backed `list/create/update/delete`.
	- The list is the source of truth; no more local seed data.
	- Mutations update the cached list so the UI stays responsive without full reloads.

### UX guardrails I kept (because CMS needs to feel safe)

The CMS is still intentionally an in-page modal inside `/projects`, and it keeps the “don’t lose my work” behavior:

- Persist open/view/draft state across reloads (so accidental refresh doesn’t punish editing).
- Protect against accidental loss via discard confirmation (with “No” as the safe default).
- Close/reset behavior is scoped to the route (navigating away from `/projects` should not leave a CMS “hanging around”).

### What’s next

Now that the CMS edits real DB data, the next wins are about making it feel production-grade:

- [ ] Add a dedicated `health/ping` API procedure (instead of using `projects.list` as the connectivity probe)
- [ ] Improve error display for mutations (field-level where possible, toast/banner globally)
  - [ ] Live URL and Repo URL fields should conduct checks to see if real URL (i.e. https//www.example.com)
- [ ] Add image handling strategy (upload + storage)
- [x] Add authentication gates for CMS actions (even a lightweight first pass)
- [ ] Deployment readiness: env config, database migrations workflow, and runtime logging

## 0.1.0 (31-01-2026) — Authentication

### Auth plan (admin-only, GitHub OAuth)

I decided to move ahead with a GitHub OAuth flow for the CMS, with a strict admin allowlist and a development-only bypass flag.

**Short-term (admin-only):**

- GitHub OAuth App with callback to the API (`/auth/github/callback`).
- Admin allowlist by GitHub login or ID in env.
- Server-side sessions (HttpOnly cookie), checked by tRPC context.
- CMS UI gated by `/auth/me`.

**Developer ergonomics:**

- `AUTH_DEV_BYPASS=true` for local development (never in production).
- Emits a startup warning when bypass is enabled.

**Longer-term path:**

- Replace admin allowlist with a users table.
- Add `owner_id` to projects and scope CMS queries by owner.
- Use OAuth to create/lookup users on first login.

### Considerations made today (and why)

I wanted a simple admin login now, with a clean path to GitHub OAuth later. That means the auth flow needs to be **switchable** via config rather than hardcoded.

Key decisions:

- **Auth method switch** (`AUTH_METHOD=local|github`) so I can use local admin credentials now and flip to OAuth later without rewiring the UI or API routes.
- **Server-side sessions in the DB** (`auth_sessions`) so sessions survive restarts and work the same for local and OAuth auth.
- **Users table as the source of truth**, even for local admin, so the data model is already shaped for multi-user portfolios.

What changed in the product UX:

- CMS now shows **local admin login** when `AUTH_METHOD=local`, otherwise GitHub login.
- Added **search** to the CMS list.
- Added **search + sort** to the public Projects page (Funnel icon with dropdown).

Why this direction:

- It keeps development fast (local admin) while making the eventual OAuth switch a configuration change, not a rewrite.
- It aligns the data layer (users + sessions + owner_id) with the multi-user roadmap.

__Future__
- [ ] Add CMS UI to modify Skills & Expertise section on Homepage
- [ ] Create a new page, _Technology_, where various software tools shown along with links to each tool
- [ ] Create a new page, _Ideas_, where ideas can easily be unfolded and to keep all ideas in the same location
- [ ] Add autocompletion in CMS UI (where applicable)
- [ ] Check if Turborepo can be used to separate build of apps in monorepo and if Vite can still be used for the frontend
