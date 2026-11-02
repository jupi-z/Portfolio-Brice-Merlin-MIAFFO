# Portfolio Editorial Platform Design

## Intent

Finish the approved Premium V2 portfolio without changing its visual language, while adding a real FR/EN editorial workflow that Brice can operate without a developer.

## Goals

- Keep the existing React/Vite public application and Premium V2 CSS/templates.
- Provide Strapi 5 Community Edition with PostgreSQL as the editorial source of truth.
- Support publication types, rich structured blocks, media, PDFs, SEO fields, relations, translations, draft/publish and restricted public access.
- Render published publications server-side through the existing Express runtime, with 404 for missing or draft slugs and a CMS-unavailable fallback to an empty editorial state.
- Preserve all existing FR/EN routes, themes, training data and contact safeguards.
- Add reproducible local Docker setup, security documentation, tests, screenshots and deployment instructions.

## Non-goals

- No redesign, no migration to Next.js, no modification of `jupi-z/MYM-ADVISOR`.
- No invented articles, claims, legal text, credentials, contacts or production SMTP/DNS state.
- No public exposure of PostgreSQL or CMS administration.

## Approaches considered

1. **Client-only CMS fetch:** simplest, but published articles would not be reliably indexable and draft leakage risk would be higher. Rejected.
2. **Replace the app with Next.js:** strong SSR, but violates the locked React/Vite/V2 constraint and creates needless redesign risk. Rejected.
3. **Strapi 5 + PostgreSQL behind Express with server-rendered publication routes:** preserves the approved frontend, gives Brice a real admin, and lets the existing runtime own public filtering, SEO and security. Selected.

## Architecture

The public app keeps the existing V2 template/CSS boundary. Express serves prerendered static pages and owns `/api/publications`, publication HTML pages, sitemap and RSS. It queries Strapi with a server-only read token and requests `status=published` plus the requested locale. Strapi runs in `cms/` with its own Dockerfile and Compose file; PostgreSQL is internal-only and volumes persist database, uploads and backups.

Publication content is represented as sanitized structured blocks at the application boundary. The public adapter rejects drafts, unknown locales, unsafe slugs and unsupported media before rendering. Translation links are emitted only when the CMS returns the corresponding published locale.

## Acceptance

- `npm run typecheck`, `npm run test:content`, `npm run test:server`, `npm run build` and browser checks pass.
- `docker compose -f cms/docker-compose.yml config` passes without secrets.
- The CMS schema and setup guide let an editor create FR/EN drafts, attach media/PDFs, preview privately and publish without code changes.
- Published content is indexable server-side; drafts and unknown slugs return 404 and do not appear in sitemap/RSS/API.
