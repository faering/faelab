# Dev Log

This is a narrative dev log for the portfolio site.

The goal here is different from `CHANGELOG.md`: it’s meant to show decision-making, iteration, and the “why” behind the implementation.

---

## 0.1.0-alpha (2026-01-24) — Establishing the foundation

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

- [ ] Create a Postgres database to store projects metadata (and path to real image storage).
- [ ] Define a Prisma schema for the project entries.
- [ ] Create a custom CMS UI with drag-and-drop feature for images.
- [ ] Wire the contact form to a real delivery mechanism (email service/backend).
- [ ] Improve accessibility and keyboard navigation across all interactive elements.

---

## Notes for future me

- Keep the “why” as visible as the “what”: the docs should reinforce professionalism.
- Prefer evolving the schema + data layer first, then updating UI.
- Avoid overengineering: this is a portfolio, but it should feel production-quality.
