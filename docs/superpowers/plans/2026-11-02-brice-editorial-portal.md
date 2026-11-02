# Brice Editorial Portal Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a simple French-first editorial portal at `/gestion` that lets Brice manage bilingual publications without using the technical Strapi back office.

**Architecture:** Keep Strapi 5/PostgreSQL as the source of truth and add an application-specific Strapi admin extension at `/admin/plugins/editorial-portal`. The extension uses Strapi's existing admin session, RBAC and fetch client, plus `@strapi/design-system`; it does not create a second login or public-facing application. The custom page uses a guided editorial information architecture while the public page templates remain untouched.

**Tech Stack:** React 18, TypeScript, existing Vite build, Express, Strapi 5 admin/content-manager APIs, PostgreSQL, Node built-in test runner, Docker Compose, Playwright/CUA verification.

**Spec:** `docs/superpowers/specs/2026-11-02-brice-editorial-portal-design.md`

## Global Constraints

- V1 manages publications only; formations, expertises and profile pages remain out of scope.
- The interface is French-first; publication content remains bilingual FR/EN.
- Media can be replaced or archived; permanent deletion is not exposed in V1.
- Strapi Design System components and patterns are reused; public portfolio templates are not reused as the admin information architecture.
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
- Create: `src/admin/strapi-admin-theme.css`
- Create: `src/admin/admin-types.ts`
- Test: `tests/admin-contract.test.mjs`

**Interfaces:**
- `AdminLocale = 'fr'` initially, with typed labels for navigation, statuses, actions and errors.
- `PublicationDraft` and `PublicationSummary` types mirror only the fields the portal displays or submits.
- `AdminStatus = 'draft' | 'published' | 'translation-missing' | 'archived'`.

- [ ] Write contract tests for required publication fields, status labels, supported formats and FR-first copy.
- [ ] Define the admin data types without importing Strapi internals into React.
- [ ] Add the Strapi Design System dependency at a compatible pinned version, import its components/icons in the portal, and keep `strapi-admin-theme.css` limited to page composition and any required font/layout bridge; do not copy public page markup.
- [ ] Run `node --test tests/admin-contract.test.mjs` and confirm the contract tests pass.
- [ ] Commit `feat: define editorial portal contract and visual tokens` and push; verify the remote SHA.

### Task 2: Add the secured Strapi plugin boundary

**Files:**
- Create: `cms/src/plugins/editorial-portal/server/src/index.ts`
- Create: `cms/src/plugins/editorial-portal/server/src/routes/index.ts`
- Create: `cms/src/plugins/editorial-portal/server/src/controllers/editorial.ts`
- Modify: `cms/config/plugins.ts`
- Test: `tests/admin-session.test.mjs`
- Test: `tests/admin-api.integration.test.mjs`

**Interfaces:**
- `GET /editorial-portal/publications` returns only the authenticated editor's safe summaries.
- `POST/PATCH /editorial-portal/publications` creates or updates a draft through the Document Service.
- `POST /editorial-portal/publications/:documentId/publish`, `/unpublish`, `/locales` and `/archive` perform explicit actions.
- `POST /editorial-portal/media` validates and stores image/PDF uploads through Strapi's upload service.
- `GET /editorial-portal/preview/:documentId/:locale` returns authenticated preview data with no public cache.

- [ ] Write failing tests for authenticated admin routes, role checks, published/draft filtering and normalized errors.
- [ ] Implement the local plugin server routes with Strapi admin authentication and Document Service calls; never create a second token or session mechanism.
- [ ] Add plugin permissions and restrict write actions to the dedicated editor permission scope.
- [ ] Add request size limits, file validation and audit-safe logs.
- [ ] Run the plugin server tests with a mocked Strapi service, then run the Docker integration test against local Strapi.
- [ ] Commit `feat: add secured Strapi editorial plugin boundary` and push; verify the remote SHA.

### Task 3: Build the independent portal shell and dashboard

**Files:**
- Create: `cms/src/admin/app.tsx`
- Create: `cms/src/plugins/editorial-portal/admin/src/index.ts`
- Create: `cms/src/plugins/editorial-portal/admin/src/pages/App.tsx`
- Create: `cms/src/plugins/editorial-portal/admin/src/pages/HomePage.tsx`
- Create: `cms/src/plugins/editorial-portal/admin/src/components/PortalLayout.tsx`
- Create: `cms/src/plugins/editorial-portal/admin/src/strapi-admin-theme.css`
- Test: `tests/admin-ui.test.mjs`

- [ ] Write UI tests for `/admin/plugins/editorial-portal`, dashboard empty state, navigation, native Strapi session and responsive layout landmarks.
- [ ] Register the local admin plugin through `cms/src/admin/app.tsx` and `app.addMenuLink`, preserving the native Strapi authentication and shell.
- [ ] Add a dedicated portal page with simple French navigation: Tableau de bord, Publications, Médias, Aide, Déconnexion.
- [ ] Use Strapi Design System components through `strapi-admin-theme.css` and `admin.css`; do not import or compose public templates as admin screens.
- [ ] Add light/dark mode, keyboard focus, skip link, semantic headings, responsive desktop/tablet/mobile layout and plain-language status badges.
- [ ] Add server fallback so a direct `/gestion` request serves the application without changing public locale fallbacks.
- [ ] Run the Strapi admin build, UI tests and a browser check at 390px, 768px and desktop widths.
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
