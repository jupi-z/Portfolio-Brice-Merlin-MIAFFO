# Portfolio Editorial Platform Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver a tested, documented bilingual Premium V2 portfolio with a real Strapi/PostgreSQL editorial workflow and server-rendered publications.

**Architecture:** Preserve the React/Vite V2 frontend and add a server-only publication adapter in Express. Run Strapi 5 and PostgreSQL as an isolated `cms/` service; public reads use a server token and published-only filters.

**Tech Stack:** React 18, TypeScript, Vite, Express, Node 22, Strapi 5 Community Edition, PostgreSQL, Docker Compose, Node built-in test runner, Playwright/browser verification.

**Spec:** `docs/superpowers/specs/2026-11-02-portfolio-editorial-design.md` and `docs/CODEX_IMPLEMENTATION_MISSION.md`.

## Global Constraints

- Preserve `src/original-v2.css`, `src/templates/`, `src/enhancements.css`, the approved portrait, responsive behavior and themes.
- FR and EN are complete and human-reviewable; never fall back to content in the wrong language.
- Only published CMS content is public; drafts never enter API, sitemap, RSS or search.
- No secrets, personal data, fake content or production claims are committed.
- Do not modify `jupi-z/MYM-ADVISOR`.
- Every completed task ends with tests, a commit, a push, and remote SHA verification.

## Review Focus

- Draft and unpublished translations: assert 404 and no sitemap/RSS/API leakage.
- CMS outage or malformed CMS payload: assert a safe empty editorial state and no unsafe HTML.
- Locale mismatch: assert no French content under an English route and only published alternates.
- Unsafe slugs/HTML/media: assert validation and sanitized output.
- Mobile/theme navigation and existing V2 rendering: assert no regression in FR/EN, light/dark and responsive controls.

### Task 1: Repair and baseline the V2.1 application

**Files:** `src/App.tsx`, `package.json`, `package-lock.json`, `scripts/test-*`, `docs/TESTING.md`.

- [ ] Add a regression test for server-rendered home expertise markup and run it RED.
- [ ] Fix the selected expertise type mismatch minimally and run the test GREEN.
- [ ] Generate and commit the lockfile; make CI use `npm ci`.
- [ ] Run typecheck, content test and build; commit and push.

### Task 2: Add Strapi CMS and PostgreSQL infrastructure

**Files:** `cms/package.json`, `cms/config/*`, `cms/src/api/publication/*`, `cms/src/components/*`, `cms/docker-compose.yml`, `cms/Dockerfile`, `cms/.env.example`, docs.

- [ ] Define the Publications collection, components, i18n and draft/publish configuration.
- [ ] Define least-privilege public read permissions and documented editor/admin setup.
- [ ] Add internal PostgreSQL healthcheck, persistent volumes and backup/restore scripts.
- [ ] Verify Compose config and CMS boot/admin health locally.
- [ ] Commit and push the CMS milestone.

### Task 3: Build the public publication adapter and server routes

**Files:** `server/publications.mjs`, `server/index.mjs`, `src/content/*`, `src/templates/perspectives.html`, `src/templates/publication.html`, `src/App.tsx`.

- [ ] Add server-only Strapi client with timeout, schema validation and safe structured-block rendering.
- [ ] Add list/detail routes, locale-aware translation handling, search/filter/pagination and related content.
- [ ] Add publication metadata, Article JSON-LD, canonical/hreflang, sitemap and RSS.
- [ ] Add fallback behavior when CMS is unavailable and 404 behavior for draft/unknown slugs.
- [ ] Add integration tests and commit/push.

### Task 4: Contact, security and production documentation

**Files:** `server/index.mjs`, `.env.example`, `docs/DEPLOYMENT.md`, `docs/CMS_EDITOR_GUIDE.md`, `docs/SECURITY.md`, `README.md`.

- [ ] Harden headers, origin checks, rate limits, request size, safe logs and SMTP fallback states.
- [ ] Centralize configurable contact values without inventing unconfirmed data.
- [ ] Document Docker, migrations, backups, CMS editor workflow, deploy and rollback.
- [ ] Commit and push.

### Task 5: Functional, visual and delivery verification

**Files:** `tests/*`, `docs/QA_REPORT.md`, `docs/screenshots/*`.

- [ ] Run the complete test suite and browser checks in FR/EN, light/dark, mobile/tablet/desktop.
- [ ] Verify prerender HTML, hydration, API, 404, sitemap, RSS, CMS draft invisibility and contact simulation.
- [ ] Save screenshots and evidence in the repository.
- [ ] Perform final review, update PR #1, attach the PR, and report exact commits and remaining external blockers.
