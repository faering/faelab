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
- [x] Add image handling strategy (upload + storage)
- [x] Add authentication gates for CMS actions (even a lightweight first pass)
- [x] Deployment readiness: env config, database migrations workflow, and runtime logging

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

## 0.1.0 (05-02-2026) — Site Content Management & File Uploads

### What I set out to build

The portfolio needed two critical capabilities:

1. **Content Management**: A real CMS for the homepage (not just Projects)
2. **Media Handling**: Professional file uploads for images and videos

The goal was to make the entire site editable through the CMS while maintaining the polish and safety guardrails established in earlier iterations.

### Site Content Management System

#### Why homepage content needed its own data model

Until now, homepage content (Hero section, About, Skills) was hardcoded in components. This made even simple text changes require a code deploy.

I built a **site profiles** system with:

- **Database schema** (`site_profile` table) for Hero, About, Skills, and Contact sections
- **tRPC router** (`siteContent`) with CRUD operations
- **CMS UI** with tabbed sections matching the homepage structure
- **Profile presets**: Save multiple configurations and switch between them

The preset system was key: it lets me experiment with different portfolio configurations (personal vs. professional tone, different skill emphasis) without losing previous versions.

#### Design decisions

**Why nested data structures?**

The About section has multiple paragraphs, badges, and highlights. Instead of flattening these into separate tables with foreign keys, I used Postgres JSON columns:

```sql
about_paragraphs JSONB NOT NULL DEFAULT '[]'
about_badges JSONB NOT NULL DEFAULT '[]'
about_highlights JSONB NOT NULL DEFAULT '[]'
```

This keeps the data model aligned with how the UI thinks about content ("About is a list of paragraphs") while avoiding join complexity for what's essentially document data.

**Why profile presets?**

I wanted the ability to A/B test different portfolio configurations without manually backing up content. The preset system (`site_profile_presets` table) stores named snapshots of entire site profiles.

This is particularly useful for:
- Seasonal content variations (e.g., highlighting different projects)
- Testing tone and messaging without losing the original
- Quick rollback if an edit doesn't work out

### File Upload System

#### The problem: "Just use image URLs" doesn't scale

The original Projects schema used `z.string().url()` for images, assuming external hosting. But for a real portfolio CMS, that's friction:

- External hosting adds setup overhead
- It's easy to accidentally delete images that are still in use
- No control over image availability or performance

I needed **first-class file upload** integrated into the CMS workflow.

#### Implementation strategy

**Backend (Fastify plugin):**

- `@fastify/multipart` for streaming uploads
- `@fastify/static` for serving uploaded files
- REST endpoints for upload/delete (not tRPC, because file streaming)
- Authentication check on all upload endpoints
- Automatic file cleanup when content is updated/deleted

**Frontend (React component):**

- `FileUploader` component with drag-and-drop UX
- Progress tracking via XMLHttpRequest (fetch doesn't support upload progress)
- Image preview and video icon placeholders
- Delete/replace functionality
- File validation (size, type) before upload

**Key detail: Automatic cleanup**

When a project image is updated, the old file must be deleted. I implemented this in the service layer:

```typescript
// Before update: get old image URL
const existing = await getProjectById(id);
if (existing?.image && existing.image !== data.image) {
  oldImageUrl = existing.image;
}

// After successful update: delete old file
if (row && oldImageUrl) {
  deleteUploadedFile(oldImageUrl);
}
```

This prevents orphaned files from accumulating in the uploads directory.

#### Why drag-and-drop matters

The FileUploader component prioritizes **discoverability**:

- Large drop zone with clear visual feedback
- Click-to-browse fallback for users who don't know about drag-and-drop
- Instant preview after upload (for images)
- Progress bar for large files
- Replace/delete buttons on hover

This makes the CMS feel like a real content management system, not a developer tool.

### Videos Feature

#### Why a separate Videos section

Originally, I considered adding video URLs to Projects. But videos deserve their own space because:

1. **Different content type**: Videos are demos, tutorials, or talks — not always tied to a specific project
2. **Different metadata**: Videos have duration, thumbnails, and benefit from dedicated preview UI
3. **Performance**: Video files are large; they need their own upload handling and storage strategy

#### Architecture

**Database schema** (`videos` table):
- Core fields: `title`, `description`, `videoUrl`, `thumbnailUrl`
- Metadata: `duration` (seconds), `tags`, `featured`
- Timestamps: `created_at`, `updated_at`
- Owner tracking: `owner_id` (foreign key to users)

**Backend service:**
- CRUD operations mirroring the Projects pattern
- Automatic cleanup of both video AND thumbnail on delete/update
- Duration validation (must be positive integer)

**Public page** (`/videos`):
- Grid layout with video cards
- Thumbnail preview with duration badge
- Featured badge for highlighted videos
- Tag filtering (future enhancement)

**CMS integration:**
- Videos tab in CMS modal (alongside Home and Projects)
- Dual FileUploader: one for video, one for thumbnail
- Video preview with HTML5 player
- Duration input field (seconds) with validation

#### Why thumbnails are separate uploads

I could auto-generate thumbnails from video frames, but manual thumbnails are better:

- Control over the exact frame shown
- Can use edited/branded thumbnails
- Faster page load (don't need to load video for preview)

### What I learned

**File upload is harder than it looks:**

The happy path (upload → save URL → done) is simple. But production-ready uploads need:

- Streaming (don't buffer entire file in memory)
- Progress feedback (users need to know large files are uploading)
- Validation (size, type, auth)
- Cleanup (don't leak files on update/delete)
- Error handling (network failures, disk space, etc.)

**CMS complexity scales with content types:**

Every new content type (Projects, Site Content, Videos) adds:

- Database schema
- Backend service with CRUD + validation
- tRPC router
- Frontend editor with form, validation, and state management
- Integration into CMS shell (tabs, dirty state, search)

This is why the CMS architecture matters: consistent patterns make adding new content types mechanical rather than exploratory.

### What's next

Now that the CMS can manage all major content types, the next priorities are:

- [ ] **Video player**: Play videos on the website using a custom built video player
- [ ] **Video playlists/categories**: Group related videos together
- [ ] **Image optimization**: Automatic resizing/compression on upload
- [ ] **Bulk operations**: Delete multiple items, bulk tag editing
- [ ] **Content preview**: See how changes look before saving
- [ ] **Audit log**: Track who changed what and when

---

## 0.1.0 (06-02-2026) — Professional Video Player Implementation

### What I set out to build

The Videos feature existed end-to-end (database, API, page), but videos were displayed as clickable cards with a basic HTML5 player preview. To turn this into a real viewing experience, I needed:

1. **A proper video player** with professional controls (play, progress, volume, speed, fullscreen)
2. **Modal presentation** so viewers focus on the video without page distractions
3. **Accessibility** so all users can navigate and watch (keyboard users, screen reader users)
4. **Future flexibility** so switching player libraries (Plyr → react-player) doesn't require rewriting consuming code

### Why I chose Plyr (not Video.js or custom)

I evaluated four options:

**Video.js** (industry standard):
- ✓ Mature, heavily used in production
- ✗ 250KB bundle (large for a portfolio site)
- ✗ Verbose API and configuration

**Custom HTML5 player**:
- ✓ Total control, minimal bundle impact
- ✗ Significant dev time for accessibility + cross-browser quirks
- ✗ Would need to maintain keyboard/screen reader support manually

**react-player** (unified API):
- ✓ Supports multiple sources (YouTube, Vimeo, MP4, HLS, etc.)
- ✓ Simple API and good documentation
- ✓ Active maintenance
- ✗ ~100KB bundle (overkill for single MP4 source)
- ✗ Extra abstraction layer for simple use cases
- ✗ Less accessibility-focused than Plyr

**Plyr** (lightweight + modern):
- ✓ Only 20KB (5-6x smaller than Video.js, lighter than react-player)
- ✓ Excellent accessibility out-of-the-box
- ✓ Clean, simple API
- ✓ Built for modern browsers
- ✗ Smaller ecosystem than Video.js (acceptable for a portfolio)

**Decision**: Plyr. It's the best fit for a portfolio: professional feature set, lightweight, and accessibility-first. The abstraction layer also makes it easy to swap to react-player later if multi-source support becomes a requirement.

### Architecture: 5-phase implementation with modular design

I chose a phased approach because each phase builds independently, making testing and debugging straightforward:

#### Phase 1: Foundation (VideoPlayer abstraction)

Created three files:

1. **VideoPlayer.tsx** - Abstract interface defining the public API
   ```typescript
   export interface VideoPlayerProps {
     src: string;
     poster?: string;
     title?: string;
     autoplay?: boolean;
     controls?: boolean;
   }
   ```

2. **PlyrVideoPlayer.tsx** - Implementation wrapping plyr-react
   - Configures Plyr with controls, keyboard support, and quality/speed options
   - Adapts plyr-react to the VideoPlayer interface

3. **index.ts** - Barrel export hiding implementation details
   - Consumers import `{ VideoPlayer }` from `@/components/VideoPlayer`
   - Library switch (Plyr → react-player) requires changing only the barrel export
   - Future migration path is documented in comments

**Why this abstraction matters:**

The consumer (VideoModal) never knows which player library is in use. If we later decide to switch to react-player or custom player, we only change `PlyrVideoPlayer.tsx` and the barrel export. VideoModal needs zero changes.

This is especially important for a portfolio: libraries might go unmaintained, or requirements might change (e.g., need HLS stream support). The abstraction buys flexibility without refactoring consuming code.

#### Phase 2: Modal & Details Components

Created two sibling components:

1. **VideoModal.tsx** - Full-screen overlay with player + metadata
   - Backdrop with blur effect
   - Centered modal with responsive sizing (max-w-5xl, max-h-90vh)
   - Close button with visual feedback
   - Body scroll lock when open

2. **VideoDetails.tsx** - Reusable metadata display
   - Title and description
   - Badges (Featured, Duration)
   - Tag list with styled pills
   - Published date
   - Designed to be reusable on future dedicated video pages

**Architectural note**: VideoDetails is separate from VideoModal because it might be used in other contexts (e.g., a dedicated `/videos/:id` page with a sidebar). Keeping it independent makes future UI expansions easier.

#### Phase 3: Integration with VideosPage

Connected the modal to the VideosPage with state management:

- `selectedVideo` state tracks which video was clicked
- `isModalOpen` state controls modal visibility
- Video cards are clickable (added `cursor-pointer` and `onClick` handler)
- Modal closes via ESC key, backdrop click, or close button
- 200ms delay on close allows fade animation before clearing selected video

**Key detail**: Auto-opening the modal on card click creates a polished "just works" UX. The modal handles all the ceremony (loading, error states, accessibility).

#### Phase 4: Custom Plyr Theming

Added comprehensive CSS to `index.css` for:

- **Color theming**: Purple primary (matching site palette) in light mode and dark mode
- **Control styling**: Smooth hover scales, rounded corners, visual feedback
- **Progress bar**: Purple gradient with buffered progress visualization
- **Tooltips & badges**: Themed to match the site
- **Responsive sizing**: Smaller controls on mobile

**Why CSS variables over Tailwind:**

Plyr has deeply nested DOM (progress bar, tooltips, settings menus) that Tailwind can't easily target. Using CSS variables in a custom stylesheet lets us:

- Override Plyr's internal colors consistently
- Maintain a single source of truth (CSS variables already defined in `:root`)
- Respect dark mode automatically (`.dark` selector applies both component and Plyr overrides)

#### Phase 5: Accessibility & Keyboard Navigation

This was the most important phase because a video player that only works with a mouse isn't accessible.

**Focus Management:**
- Auto-focus the close button when modal opens (keyboard users know where they are)
- Restore focus to the previously focused element when modal closes (maintains navigation flow)
- Visual focus ring on buttons (not just hover state)

**Focus Trap:**
- Tab key cycles through focusable elements within the modal
- Shift+Tab goes backward
- When Tab reaches the last focusable element, wraps to the first
- When Shift+Tab reaches the first element, wraps to the last

This prevents keyboard users from accidentally focusing elements outside the modal while it's open.

**ARIA Labels & Attributes:**
- `role="dialog"` identifies the element as a modal
- `aria-modal="true"` indicates to screen readers that the rest of the page is inert
- `aria-labelledby` links the dialog to its title
- `aria-describedby` links the dialog to its description region
- Hidden `<h2 id="video-modal-title">` for screen reader users (not displayed visually)
- `aria-live="polite"` on the details section announces content changes

**Keyboard Shortcuts:**
- ESC to close (already had this, improved implementation)
- Tab/Shift+Tab to navigate focusable elements
- Enter/Space to activate buttons
- All standard browser keyboard interactions work

**Implementation Note:**

The focus trap required careful event handling:

```typescript
const handleKeyDown = (event: KeyboardEvent) => {
  if (event.key !== 'Tab' || !isOpen || !modalRef.current) return;

  const focusableElements = modalRef.current.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );

  // Wrap at start/end
};
```

This ensures keyboard users can't tab outside the modal while it's open.

### What surprised me

**Plyr's default behavior is solid:**

I initially over-engineered the VideoPlayer component with event listeners for `onPlay`, `onPause`, `onEnded`, and `onTimeUpdate`. But VideoModal doesn't need those events—Plyr handles all interaction internally.

Removing unnecessary code made the component simpler and more reliable. This is a reminder that abstractions should only expose what consumers actually need.

**Accessibility requires thoughtful state management:**

The focus trap works because we manage:
- `previousActiveElement` (store focus before modal opens)
- Modal ref (query focusable elements within it)
- Event listeners (capture Tab key and wrap focus)

Without this coordination, keyboard navigation feels broken. With it, the modal feels as polished as any desktop application.

### What's next

The video player is production-ready. Future enhancements:

- [ ] Dedicated `/videos/:id` page with URL-shareable video links
- [ ] Video playlists/categories sidebar
- [ ] Video analytics (view count, watch time heatmap)
- [ ] Related videos recommendations
- [ ] Transcript/caption support
- [ ] Custom player skins for different site sections

The abstraction layer makes all of these possible without refactoring the core player component.

---

---

## 0.1.0 (27-02-2026) — Project Rename: portfolio → faelab

### A name that fits

The project started as a simple portfolio site, but at some point it quietly became something more than that — a full-stack platform with a CMS, file uploads, video hosting, authentication, and a proper data layer. Calling it "portfolio" had started to feel wrong.

`faelab` felt right: something personal, memorable, and not self-limiting. It doesn't describe a use case; it describes a place where things are built.

The rename happened before production deployment, which was exactly the right moment. Once a domain, Docker images, and nginx configs are in place, names become expensive to change. Doing it here meant touching:

- The GitHub repository name
- Docker container names (`faelab_postgres`, `faelab_api`, etc.)
- TypeScript internal imports and workspace package references
- Default content values that still said "portfolio" in example text

It's a small change in scope but a meaningful one in intent. The project now has a name that can grow with it.

---

## 0.1.0 (01-03-2026) — Production Infrastructure: Docker, Nginx, and Secrets

### What I set out to do

Everything had been running locally. The app worked, the CMS worked, uploads worked — but none of it existed anywhere except a development machine. The missing piece was an infrastructure layer that could run this on a real VPS.

The goal for today: containerize the full stack and wire it up for deployment on a Hetzner server sitting behind Cloudflare.

### Restructuring Docker Compose

The existing `docker-compose.yml` only handled Postgres and pgAdmin. I extended it to cover the full production topology, but with a structure that keeps environment-specific concerns out of the base file:

**Base** (`docker-compose.yml`) defines only what's always true: Postgres, pgAdmin, named volumes, and the network topology. It doesn't expose any ports. It doesn't define the application services. It's stable.

**Dev override** (`docker-compose.dev.yml`) exposes Postgres and pgAdmin ports directly to the host — but doesn't add `api` or `frontend`. In dev, those run natively with `pnpm dev` for hot-reload. Docker is only for infrastructure.

**Prod override** (`docker-compose.prod.yml`) adds nginx, frontend, and api with `restart: unless-stopped`. Only ports 80 and 443 are publicly exposed, through nginx. Postgres and pgAdmin are bound to `127.0.0.1` only — accessible via SSH tunnel, invisible to the internet.

The usage is explicit:
```
# Local dev
docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d

# Production
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

### The network split matters

I defined two Docker networks: `web` and `internal`.

`internal: true` means no gateway to the outside internet — containers on that network can only talk to each other. Postgres lives here. It is physically unreachable from anywhere outside the cluster, regardless of firewall rules, because the network itself has no route out.

The API sits in *both* networks: it needs to reach Postgres (`internal`) and receive HTTP traffic from nginx (`web`). nginx and the frontend sit in `web` only.

One hard-won lesson: on Docker Desktop / WSL2, port bindings on `internal` networks fail silently. The containers start, the command succeeds, but traffic never arrives. Moving Postgres and pgAdmin onto an ordinary bridge network for the dev override was the fix. This behaviour is technically correct — the internal network has no host gateway by design — but the silence makes it feel like a bug.

### Dockerfiles for a monorepo

Both apps live in a pnpm monorepo with `workspace:*` dependencies. This creates a Dockerfile constraint: each app's build context must include the full monorepo, not just the app directory, because `packages/db` and `packages/types` are dependencies that live at the workspace root.

**API** (2-stage):
1. Copy manifests → `pnpm install --frozen-lockfile` — this layer caches until the lockfile changes, not until any source file changes
2. Copy source → run directly with `tsx` — no TypeScript compile step because `noEmit: true` in tsconfig; the source *is* the runtime

**Frontend** (2-stage):
1. Copy manifests + source → `pnpm build` — Vite compiles to a static `dist/`
2. `nginx:alpine` serves the `dist/` folder with a custom config that rewrites all paths to `index.html` so client-side routing works

The frontend image bakes `VITE_API_BASE_URL` in at build time via a build `ARG`. This is a Vite constraint: `import.meta.env.VITE_*` is statically replaced at compile time. There is no mechanism to inject these values into a pre-built bundle at runtime. The implication is real: the frontend Docker image is environment-specific. One image per target, not one image deployed everywhere. Worth knowing up front.

### Secrets: the `_FILE` convention

Storing secrets as plain environment variables in `docker-compose.yml` is problematic — they show up in `docker inspect`, logs, and shell history. Docker secrets mount files at `/run/secrets/<name>`, but applications typically expect environment variables, not file paths.

I implemented a secrets loader in `env.ts` that bridges this gap using the `_FILE` suffix convention:

```typescript
// Any env var ending in _FILE is treated as a path to a secrets file.
// AUTH_ADMIN_PASSWORD_FILE=/run/secrets/auth_admin_password
// → process.env.AUTH_ADMIN_PASSWORD = <file contents>
```

The loader runs after `dotenv` so local `.env` values always take precedence. If there's no `.env` file at all (as in a Docker container), it fails gracefully and the secrets come from Docker's mounted files instead.

This means the application code is completely unaware of how secrets are delivered. The same env var names work in local dev (`.env` file), in CI (plain env vars), and in production (Docker secrets via `_FILE` loader). No conditional logic in application code, no different code paths per environment.

### Nginx: routing and Cloudflare

The nginx container inside the cluster handles path-based routing to the right service:

- `/trpc`, `/auth`, `/api`, `/uploads` → `api:3001`
- Everything else → `frontend:80`

Since Cloudflare terminates TLS before the request reaches the VPS, nginx only needs to listen on port 80 inside the cluster. `real_ip_header CF-Connecting-IP` restores the actual visitor IP from Cloudflare's header so the API logs and rate-limiting see real addresses instead of Cloudflare proxy IPs.

Two configuration details that would cause subtle production bugs if missed:

- `client_max_body_size 110m` — without this, nginx silently rejects video uploads (up to 100MB) with a 413 before the request reaches the API
- `proxy_cache_valid 200 1d` on the `/uploads` location — images and videos don't change after upload, so caching them at the proxy layer reduces load on the API for repeat requests

### What's next

The infrastructure is in place. The next step is actually deploying — provisioning the Hetzner VPS, configuring DNS via Cloudflare, and running the prod compose stack for the first time.

The remaining rough edge is the nginx HTTPS block: the config currently redirects all port 80 traffic to HTTPS but the 443 server block is a placeholder. This needs to be completed before the first real deployment with traffic.

---

## 0.1.0 (01-03-2026) — CI/CD: Build, Push, and Deploy via GitHub Actions

### What I set out to do

With the infrastructure layer done, the remaining gap was the delivery pipeline: how does a commit on `main` become a running container on the VPS without manual steps?

The goal was a fully automated path from `git push` to running containers, with a clear separation between staging (automatic) and production (intentional, gated).

### Versioning strategy: unified semver on git tags

Because `api` and `frontend` are deployed together from the same compose file, they share a single version. Individual package versions in each `package.json` exist for tooling purposes but don't drive the image tagging.

**Git tags are the source of truth for production releases.** Pushing `v1.2.3` produces semver-tagged images. Pushing to `main` produces `main` + `sha-*` tagged images for staging. There's no automation that derives version numbers — versions are explicit, intentional acts.

This approach was chosen over per-service versioning because it matches how the stack is actually deployed: as a unit. A compatibility matrix between `api:x.y.z` and `frontend:a.b.c` would add overhead with no benefit for a single-owner monorepo.

### Build workflow (`build.yml`)

Triggers:
- Push to `main` → staging-grade build
- Push of a `v*.*.*` tag → production-grade build

Both `api` and `frontend` are built in parallel using a matrix strategy. `fail-fast: false` means one service failing mid-push doesn't cancel the other.

Image tagging is handled by `docker/metadata-action`, which derives tags from git context:

| Trigger | Tags produced |
|---|---|
| `v1.2.3` tag | `1.2.3`, `1.2`, `1`, `latest`, `sha-a1b2c3d` |
| `main` push | `main`, `sha-a1b2c3d` |

The SHA tag is always included, on both paths. It's what staging actually deploys — an immutable reference to a specific build, not a mutable `main` pointer.

**`VITE_API_BASE_URL` is environment-specific at build time**, not runtime. Because Vite statically substitutes `import.meta.env.VITE_*` into the bundle, it must be baked in when the image is built. A `Resolve build args` step selects the right URL based on whether the trigger is a tag (prod URL) or a branch push (staging URL), sourced from repository-level variables:

- `STAGING_API_BASE_URL` — e.g. `https://staging.domain.com`
- `PROD_API_BASE_URL` — e.g. `https://domain.com`

This means the frontend image is environment-specific by design — one image targets staging, another targets prod. This isn't a workaround; it's a consequence of how Vite works, documented explicitly.

Layer caching uses GitHub Actions cache with per-service scopes (`scope=api`, `scope=frontend`) so the two services don't share or evict each other's cache.

### Deploy workflows: staging and production

Two separate workflows, intentionally different in how they trigger.

**`deploy-staging.yml`** triggers automatically via `workflow_run` after a successful build on `main`. It derives the image tag as `sha-<short>` from the triggering commit — the same tag `docker/metadata-action` produced — and SSHes into the VPS to pull and restart the stack.

**`deploy-prod.yml`** is `workflow_dispatch` only — it never runs automatically. You provide a `version` input (e.g. `1.2.3`), the workflow validates it matches semver format, then SSHes in and deploys that exact image tag.

Both workflows need docker-compose to reference images rather than build contexts. `docker-compose.prod.yml` was updated accordingly:

```yaml
api:
  image: ghcr.io/faering/faelab/api:${IMAGE_TAG:?IMAGE_TAG is required}
frontend:
  image: ghcr.io/faering/faelab/frontend:${IMAGE_TAG:?IMAGE_TAG is required}
```

`IMAGE_TAG` is passed as an env var at deploy time. On staging it's `sha-xxxxxxx`; on prod it's the semver string.

### GitHub Environments and secret scoping

Both workflows reference a GitHub Environment (`staging`, `production`). Environments provide two things that matter here:

1. **Scoped secrets and variables**: `DEPLOY_HOST`, `DEPLOY_USER`, `DEPLOY_SSH_KEY`, `GHCR_PAT`, `DEPLOY_PATH`, and `DEPLOY_SSH_PORT` are set per-environment. The staging workflow literally cannot access the prod server's credentials, regardless of how workflows are triggered.

2. **Approval gate on production**: The `production` environment is configured with Required Reviewers. `deploy-prod.yml` pauses before the deploy job and sends an approval notification. Production never advances without an explicit human confirmation.

The full set of credentials per environment:

| | `staging` | `production` |
|---|---|---|
| Secret `DEPLOY_HOST` | VPS IP | VPS IP (same server) |
| Secret `DEPLOY_USER` | `deploy` | `deploy` |
| Secret `DEPLOY_SSH_KEY` | Ed25519 private key | same key |
| Secret `GHCR_PAT` | Classic PAT, `read:packages` scope | same |
| Variable `DEPLOY_PATH` | `/home/deploy/faelab-staging` | `/home/deploy/faelab` |
| Variable `DEPLOY_SSH_PORT` | custom port | same |
| Variable `GHCR_USER` | `faering` | `faering` |

`GHCR_PAT` is a classic token (not fine-grained) because fine-grained tokens don't support the `read:packages` scope needed for `docker login ghcr.io` from an external host. Classic tokens aren't deprecated for this use case.

### VPS preparation: Docker installation and deploy user

Docker was not pre-installed on the Hetzner VPS. Installation from the official apt repository (see [Docker Official Docs](https://docs.docker.com/engine/install/ubuntu/#install-using-the-repository)):

```bash
# GPG key and apt source
sudo apt update && sudo apt install ca-certificates curl
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc

sudo tee /etc/apt/sources.list.d/docker.sources <<EOF
Types: deb
URIs: https://download.docker.com/linux/ubuntu
Suites: $(. /etc/os-release && echo "${UBUNTU_CODENAME:-$VERSION_CODENAME}")
Components: stable
Signed-By: /etc/apt/keyrings/docker.asc
EOF

sudo apt update
sudo apt install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```

A dedicated `deploy` system user owns the deploy directories and is the only account that runs docker commands during deployment:

```bash
sudo useradd --system --create-home --shell /bin/bash deploy
sudo usermod -aG docker deploy
sudo mkdir -p /home/deploy/faelab /home/deploy/faelab-staging
sudo chown -R deploy:deploy /home/deploy/faelab /home/deploy/faelab-staging
```

SSH access for `deploy` was added to `sshd_config` via `AllowUsers`. The SSH key pair used by GitHub Actions was generated locally with `ssh-keygen` and the public key placed in `/home/deploy/.ssh/authorized_keys` via the admin user (since `deploy` had no credentials yet when the key was first installed — a classic chicken-and-egg that requires bootstrapping via any already-authorised user).

### What the full delivery path looks like

```
git push origin main
  → build.yml: builds api + frontend, pushes sha-xxxxxxx + main tags to GHCR
  → deploy-staging.yml: SSH into VPS as deploy, pulls sha-xxxxxxx, restarts stack
  → staging.domain.com reflects the new commit

git tag v1.2.3 && git push origin v1.2.3
  → build.yml: builds api + frontend, pushes 1.2.3 + 1.2 + 1 + latest + sha tags
  → deploy-prod.yml: manual trigger, enter "1.2.3", approve in GitHub UI
  → domain.com updated
```

### What's next

The pipeline is wired. The remaining steps before first real traffic:

- [ ] Clone repo and create `.env` + secrets files on the VPS at both deploy paths
- [ ] Complete the nginx HTTPS server block (currently a placeholder)
- [ ] Push to `main` and verify the staging deploy runs end-to-end
- [ ] Tag `v0.1.0` and perform the first production deploy

## Future

- [x] Add CMS UI to modify Skills & Expertise section on Homepage *(completed 0.2.0)*
- [ ] Create a new page, *Technology*, where various software tools shown along with links to each tool
- [ ] Create a new page, *Ideas*, where ideas can easily be unfolded and to keep all ideas in the same location
- [ ] Add autocompletion in CMS UI (where applicable)
- [ ] Check if Turborepo can be used to separate build of apps in monorepo and if Vite can still be used for the frontend
- [ ] Add video playlist/categorization feature
- [ ] Image optimization on upload
- [ ] Batch operations in CMS (bulk delete, bulk tag editing)
