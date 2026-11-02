# Office-like Editorial Editor and Automatic SEO Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the technical publication form with a familiar document editor and automate routine SEO while preserving the existing Strapi data model and Premium V2 public site.

**Architecture:** Keep the current custom Strapi-served portal and API contracts. Add pure editor/SEO utilities for deterministic behavior, rebuild the publication view around a document canvas plus contextual side panel, and keep `portal.js` as the session/navigation coordinator. Persist the same structured publication blocks and let the server remain authoritative for public SEO output.

**Tech Stack:** Vanilla JavaScript modules, semantic HTML, CSS using the existing Strapi-inspired tokens, Node’s built-in test runner, Strapi 5, PostgreSQL 16.

**Spec:** `docs/superpowers/specs/2026-11-02-office-editor-seo-design.md`

## Global Constraints

- Preserve the Premium V2 public design and all existing public URLs.
- Do not replace Strapi/PostgreSQL or expose Strapi’s technical admin as the daily editor.
- Keep session cookies HttpOnly and never store admin tokens in browser storage.
- Keep drafts and private media inaccessible through public routes.
- Do not commit secrets, production credentials, fake production content, or Hostinger credentials.
- Keep French and English workflows and existing publication components compatible.

## Review Focus

- Empty or malformed blocks must be rejected before persistence and must not create orphan rows.
- Autosave failures and session refresh must preserve local edits and show a recoverable state.
- Existing publications with unknown/optional fields must round-trip without data loss.
- SEO suggestions must never overwrite an intentional manual slug or advanced override.
- Mobile and dark-mode editor layouts must remain usable without changing the public Premium V2 pages.

---

### Task 1: Pure editor and SEO utilities

**Files:**
- Create: `cms/public/editorial/editor-utils.js`
- Test: `tests/editor-utils.test.mjs`
- Modify: `package.json` only if a focused test script is useful

**Interfaces:**
- Produces `slugifyTitle(value) -> string`.
- Produces `estimateReadingTime(blocks) -> number`.
- Produces `suggestSeo({ title, excerpt, blocks }) -> { metaTitle, metaDescription }`.
- Produces `normalizeEditorBlock(block) -> block` and `serializeEditorBlocks(blocks) -> array`.

- [ ] Write failing tests for accented slug generation, word-count reading time, SEO length limits, and round-trip serialization of text/table/media blocks.
- [ ] Run `node --test tests/editor-utils.test.mjs` and verify the new behaviors fail because the module is missing.
- [ ] Implement the smallest pure utilities without DOM or fetch dependencies.
- [ ] Run the focused test and then `npm test`.
- [ ] Commit `feat(editorial): add deterministic editor and SEO utilities`.

### Task 2: Office-like document surface

**Files:**
- Modify: `cms/public/editorial/index.html`
- Modify: `cms/public/editorial/portal.css`
- Modify: `cms/public/editorial/portal.js`

**Interfaces:**
- Consumes the utilities from Task 1.
- Produces toolbar actions, insertion menu, document canvas, block move/duplicate/delete controls, and contextual panel state without changing API payload shape.

- [ ] Add failing DOM-level assertions to `tests/editorial-shell.test.mjs` for the toolbar, document canvas, autosave status, side-panel tabs, and all seven supported block actions.
- [ ] Run the focused test and confirm the current technical form lacks the required selectors/labels.
- [ ] Rebuild the publication view with a document canvas and compact metadata panels; retain accessible labels and keyboard focus order.
- [ ] Implement toolbar commands that map to structured blocks, block movement/duplication/deletion, and a slash/insertion menu.
- [ ] Add responsive and dark-mode styles using the existing Strapi-inspired tokens; do not alter public-site CSS.
- [ ] Run focused tests, `npm test`, and the production build.
- [ ] Commit `feat(editorial): add office-like document editor`.

### Task 3: Automatic draft saving and recovery

**Files:**
- Modify: `cms/public/editorial/portal.js`
- Modify: `cms/public/editorial/index.html`
- Modify: `cms/public/editorial/portal.css`
- Modify: `tests/editorial-editor.test.mjs`

**Interfaces:**
- Produces `scheduleAutosave()` with a debounced save cycle, visible status states, explicit save, and retry-safe session refresh.

- [ ] Add failing tests for dirty-state detection, debounced save scheduling, manual save cancellation, and preserving draft values after a rejected save.
- [ ] Run the focused tests and verify failure before implementation.
- [ ] Implement autosave only after the first draft has a `documentId`; require explicit first save for a new publication.
- [ ] Add a `beforeunload` warning only while unsaved changes exist.
- [ ] Implement retry status without clearing the document canvas or silently discarding edits.
- [ ] Run focused tests and the full suite.
- [ ] Commit `feat(editorial): add resilient draft autosave`.

### Task 4: Automatic SEO panel and server-safe defaults

**Files:**
- Modify: `cms/public/editorial/portal.js`
- Modify: `cms/public/editorial/index.html`
- Modify: `cms/public/editorial/portal.css`
- Modify: `cms/src/plugins/editorial-portal/strapi-server.js` only if server-side defaulting is required
- Modify: `tests/editorial-editor.test.mjs`
- Modify: `scripts/test-editorial-local.mjs`

**Interfaces:**
- Produces a plain-language SEO panel with live preview, automatic suggestions, explicit advanced overrides, and no technical requirement to publish.

- [ ] Add failing tests for automatic slug/reading-time/meta suggestions, manual override preservation, image-alt warnings, and `noIndex` behavior.
- [ ] Run focused tests and confirm the expected failures.
- [ ] Wire the utility outputs to the editor without overwriting values the user manually changed.
- [ ] Add the live Google/social preview and plain-language checklist.
- [ ] Ensure the existing server-generated canonical, hreflang, sitemap, RSS, and JSON-LD remain authoritative and are covered by the local workflow.
- [ ] Run the full local FR/EN publication scenario with public base URL.
- [ ] Commit `feat(editorial): automate routine SEO controls`.

### Task 5: Full verification, documentation, and delivery

**Files:**
- Modify: `docs/CMS_EDITOR_GUIDE.md`
- Modify: `docs/QA_REPORT.md`
- Modify: `docs/SECURITY.md` if the new client behavior changes security notes

- [ ] Run `npm test`, `npm run build`, root dependency audit, syntax checks, CMS build, Docker health checks, local editorial workflow, public FR/EN workflow, and PostgreSQL backup/restore.
- [ ] Verify the editor visually at desktop, tablet, mobile, light and dark mode; inspect browser console logs for errors.
- [ ] Verify no QA data or generated files remain.
- [ ] Update the guide with the Office-like workflow and explain which SEO fields are automatic versus advanced overrides.
- [ ] Commit `docs(editorial): document the office-like workflow`.
- [ ] Push every commit to `feature/portfolio-v2-1-fr-en` and update PR #1 with exact test evidence and remaining production-only dependencies.
