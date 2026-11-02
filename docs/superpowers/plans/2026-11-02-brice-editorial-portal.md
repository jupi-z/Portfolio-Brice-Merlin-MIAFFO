# Brice Editorial Portal Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a simple French-first editorial portal at `/gestion` that lets Brice manage bilingual publications without using the technical Strapi back office.

**Architecture:** Keep Strapi 5/PostgreSQL as the source of truth and expose a server-proxied editorial API. The browser receives only the portal session and safe publication data; Strapi admin credentials/tokens remain server-side. The portal is a separate React shell that reuses Premium V2 visual tokens and interaction language, but not the public page templates.

**Tech Stack:** React 18, TypeScript, existing Vite build, Express, Strapi 5 admin/content-manager APIs, PostgreSQL, Node built-in test runner, Docker Compose, Playwright/CUA verification.

**Spec:** `docs/superpowers/specs/2026-11-02-brice-editorial-portal-design.md`

## Global Constraints

- V1 manages publications only; formations, expertises and profile pages remain out of scope.
- The interface is French-first; publication content remains bilingual FR/EN.
- Media can be replaced or archived; permanent deletion is not exposed in V1.
- Premium V2 visual language is reused through tokens and components; public templates are not reused as the admin information architecture.
- No change to public routes, public design, existing themes or MYM-ADVISOR.
- No CMS token, Strapi admin JWT, password or production secret enters browser bundles, Git or URL parameters.
- Only authenticated users can see drafts, previews, unpublished translations or media-management actions.
- Every completed task ends with focused tests, a commit, a push and remote SHA verification.

## Review Focus

- Unauthenticated `/gestion` and API calls redirect or return 401 without leaking publication data.
- A French draft and an unpublished English translation never appear on public routes, API, sitemap or RSS.
- A session expiry during save/publish returns a clear French message and does not report a false success.
- Invalid images, PDFs, oversized files and unsafe filenames are rejected before storage.
- A failed publish, duplicate slug or Strapi outage leaves the draft intact and gives a recoverable error.

---

### Task 1: Lock the portal contract and visual foundation

**Files:**
- Modify: `docs/superpowers/specs/2026-11-02-brice-editorial-portal-design.md`
- Create: `src/admin/admin-i18n.ts`
- Create: `src/admin/admin-tokens.css`
- Create: `src/admin/admin-types.ts`
- Test: `tests/admin-contract.test.mjs`

**Interfaces:**
- `AdminLocale = 'fr'` initially, with typed labels for navigation, statuses, actions and errors.
- `PublicationDraft` and `PublicationSummary` types mirror only the fields the portal displays or submits.
- `AdminStatus = 'draft' | 'published' | 'translation-missing' | 'archived'`.

- [ ] Write contract tests for required publication fields, status labels, supported formats and FR-first copy.
- [ ] Define the admin data types without importing Strapi internals into React.
- [ ] Define Premium V2-derived tokens for navy, canvas, accent, ink, muted text, line, spacing, radius, focus and dark mode; do not copy public page markup.
- [ ] Run `node --test tests/admin-contract.test.mjs` and confirm the contract tests pass.
- [ ] Commit `feat: define editorial portal contract and visual tokens` and push; verify the remote SHA.

### Task 2: Add server-side session and Strapi proxy boundary

**Files:**
- Create: `server/admin-session.mjs`
- Create: `server/admin-editorial.mjs`
- Modify: `server/index.mjs`
- Modify: `.env.example`
- Test: `tests/admin-session.test.mjs`
- Test: `tests/admin-api.integration.test.mjs`

**Interfaces:**
- `POST /api/gestion/login` accepts `{ email, password }` and returns `{ ok: true, user }` or a generic 401.
- `POST /api/gestion/logout` clears the HTTP-only session.
- `GET /api/gestion/session` returns the minimal authenticated user or 401.
- `GET /api/gestion/publications` supports `locale`, `status`, `type`, `q`, `page` and `pageSize`.
- `POST /api/gestion/publications` creates a draft; `PATCH /api/gestion/publications/:documentId` updates it.
- `POST /api/gestion/publications/:documentId/publish`, `/unpublish`, `/locales` and `/archive` perform explicit actions.
- `POST /api/gestion/media` validates and proxies image/PDF uploads.
- `GET /api/gestion/preview/:documentId/:locale` returns authenticated preview HTML.

- [ ] Write failing tests for 401 responses, session cookie flags, generic login failures and Strapi token non-disclosure.
- [ ] Implement encrypted/signed HTTP-only session storage using `ADMIN_SESSION_SECRET`, with bounded expiry and SameSite protection; never use a browser-visible bearer token.
- [ ] Implement a narrow Strapi admin client that maps Strapi responses into the portal types and normalizes errors.
- [ ] Add CSRF/origin checks to state-changing portal requests, request size limits and audit-safe logs.
- [ ] Run the session and proxy tests with a mocked Strapi server, then run the Docker integration test against local Strapi.
- [ ] Commit `feat: add secured editorial portal API` and push; verify the remote SHA.

### Task 3: Build the independent portal shell and dashboard

**Files:**
- Create: `src/admin/AdminApp.tsx`
- Create: `src/admin/AdminLayout.tsx`
- Create: `src/admin/AdminDashboard.tsx`
- Create: `src/admin/admin.css`
- Modify: `src/main.tsx`
- Modify: `server/index.mjs`
- Test: `tests/admin-ui.test.mjs`

- [ ] Write UI tests for `/gestion`, login redirect, dashboard empty state, navigation, logout and responsive layout landmarks.
- [ ] Route `/gestion` to `AdminApp` while preserving the public `App` route behavior and hydration.
- [ ] Add a dedicated admin shell with simple French navigation: Tableau de bord, Publications, Médias, Aide, Déconnexion.
- [ ] Use the Premium V2 visual language through `admin-tokens.css` and `admin.css`; do not import or compose public templates as admin screens.
- [ ] Add light/dark mode, keyboard focus, skip link, semantic headings, responsive desktop/tablet/mobile layout and plain-language status badges.
- [ ] Add server fallback so a direct `/gestion` request serves the application without changing public locale fallbacks.
- [ ] Run typecheck, UI tests and a browser check at 390px, 768px and desktop widths.
- [ ] Commit `feat: add French-first editorial portal shell` and push; verify the remote SHA.

### Task 4: Implement the publication list and guided editor

**Files:**
- Create: `src/admin/PublicationsList.tsx`
- Create: `src/admin/PublicationWizard.tsx`
- Create: `src/admin/PublicationBlocks.tsx`
- Create: `src/admin/PublicationPreview.tsx`
- Modify: `src/admin/admin-types.ts`
- Test: `tests/admin-publications.test.mjs`

- [ ] Write tests for search, type/status/language filters, pagination, draft save, validation and unsaved-change warnings.
- [ ] Implement a list with clear French labels and actions; display translation completeness and publication status without Strapi terminology.
- [ ] Implement the wizard steps: format, language, title/summary, content blocks, media, SEO, preview and save/publish.
- [ ] Support article, study, note, case-study, guide and intervention by mapping them to business labels.
- [ ] Provide safe blocks for heading, text, quote, callout, table, image and document download; disallow arbitrary HTML.
- [ ] Generate slug, reading time, canonical, meta title and meta description with editable but validated defaults.
- [ ] Implement separate FR/EN states and explicit “Créer la version anglaise” / “Publier cette langue” actions.
- [ ] Run unit tests and a local Strapi end-to-end test covering create, draft, edit, publish and unpublish.
- [ ] Commit `feat: add guided publication workflow` and push; verify the remote SHA.

### Task 5: Implement media, preview and archive workflows

**Files:**
- Create: `src/admin/MediaLibrary.tsx`
- Create: `src/admin/ConfirmActionDialog.tsx`
- Modify: `server/admin-editorial.mjs`
- Modify: `cms/config/plugins.ts`
- Test: `tests/admin-media.test.mjs`

- [ ] Write tests for accepted image/PDF MIME types, size limits, safe filenames, replacement and archive behavior.
- [ ] Implement image/PDF upload with progress, preview and actionable French errors.
- [ ] Implement “Remplacer” and “Archiver” only; do not expose permanent deletion in the V1 interface.
- [ ] Keep archived media inaccessible to public publication rendering unless explicitly attached to a published entry.
- [ ] Implement authenticated preview using the same editorial renderer as the public site, with `noindex` and no public cache.
- [ ] Verify local upload persistence, PostgreSQL backup/restore references and media mount behavior.
- [ ] Commit `feat: add safe editorial media and preview workflow` and push; verify the remote SHA.

### Task 6: Permissions, onboarding and documentation

**Files:**
- Modify: `cms/src/index.ts`
- Modify: `docs/CMS_EDITOR_GUIDE.md`
- Create: `docs/EDITOR_PORTAL_GUIDE.md`
- Create: `docs/EDITOR_PORTAL_RUNBOOK.md`
- Test: `tests/admin-permissions.integration.test.mjs`

- [ ] Define the least-privilege editor role for publication and media operations; keep system settings inaccessible.
- [ ] Add the first-login checklist and contextual help in French.
- [ ] Document only the user-facing workflow: create, translate, preview, publish, unpublish, replace/archive media and recover from errors.
- [ ] Add a technical runbook for session secrets, Strapi migrations, backups and rollback.
- [ ] Test admin/editor permission boundaries against local Strapi and confirm drafts remain private.
- [ ] Commit `docs: document editorial portal operations` and push; verify the remote SHA.

### Task 7: Full QA, visual regression and delivery

**Files:**
- Modify: `docs/QA_REPORT.md`
- Modify: `docs/DEPLOYMENT.md`
- Modify: `README.md`
- Create: `tests/admin-e2e.test.mjs`

- [ ] Run all frontend, server, CMS, SMTP, security and accessibility tests.
- [ ] Verify public FR/EN pages and unchanged Premium V2 styling in light/dark at desktop, tablet and mobile sizes.
- [ ] Verify admin flows with a temporary local account and remove all temporary users, publications and media.
- [ ] Run `npm audit` and record unresolved CMS advisories without forced incompatible updates.
- [ ] Confirm Git status clean, remote branch SHA current, CI green and PR #1 updated while remaining unmerged.
- [ ] Commit `test: validate editorial portal end to end` and push; verify the remote SHA and update PR #1.
