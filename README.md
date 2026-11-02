# Brice Merlin MIAFFO · Portfolio Premium V2.1 (FR / EN)

Production-oriented React/TypeScript project based **strictly on the approved V2**. No redesign of the approved editorial art direction. Maintained separately from the MYM-ADVISOR repository.

## Start

```bash
npm install
npm run dev
```

URLs: `/fr/` (French), `/en/` (English); each of the six pages has its own language-specific URL.

## Build & run with server-side contact API

```bash
npm run test:content
npm run build
cp .env.example .env      # fill the SMTP settings; never commit this file
npm start
```

Use environment variables in your process manager; **this project does not automatically load `.env` in Node**. Example on Node 22: `node --env-file=.env server/index.mjs` or export them through systemd / Docker / VPS. No SMTP secrets are ever used in the client.

### Existing design is locked

- `src/original-v2.css` is the exact stylesheet of the approved V2.
- `src/templates/` keeps the page structure and classes of the original HTML, with translatable text placeholders.
- `src/enhancements.css` only adds the FR/EN control and contact delivery states.
- `public/assets/brice-miaffo-portrait.webp` preserves the original approved V2 portrait.
- `src/content/static-fr.json`, `static-en.json` contain every static text fragment from the original V2.
- `src/content/catalogue-fr.json`, `catalogue-en.json` contain the 12 programmes, 4 expertise areas, and 4 career records in both languages.

The source templates are intentionally used through React components and a controlled `dangerouslySetInnerHTML` boundary to guarantee pixel and DOM fidelity to V2. The content is **first-party, checked-in, immutable design material**, not user-supplied HTML. Event interaction, language routing, modal state and contact form handling are managed by React. A later refactor to JSX can be done after acceptance, but it must not silently change the design.

### Routes & SEO

- `/fr/`, `/fr/parcours/`, `/fr/expertises/`, `/fr/formations/`, `/fr/perspectives/`, `/fr/contact/`
- Matching `/en/` routes.
- Page titles, metadata, canonical, `hreflang`, Person + WebPage JSON-LD update with navigation.
- History API URLs require host rewriting to index.html. The included Node server and two static-host rewrite examples support this.

**Production SEO caveat:** HTML currently renders on the client. Fully server-rendered/prerendered markup should be added if indexing guarantees are critical; client-side metadata alone does not guarantee search indexing.

### Forms

`POST /api/contact` validates fields and performs SMTP delivery through server-only credentials. The UI announces success **only after the server confirms delivery**. When not configured or unreachable, it provides a mailto fallback and an error state.

Environment: `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`, `CONTACT_TO`, `ALLOWED_ORIGIN`, `PUBLIC_SITE_URL`, and `PORT`.

Production deployment requires a working Node server for forms; deploying the frontend alone on a static host will not enable email delivery. The privacy and legal notices, permissions for names and photos, and commercial routing require final confirmation.

### Editorial sourcing & validations

The 12 programmes were selected because the provided 2026–2027 catalogue explicitly attributes their delivery to Brice Miaffo (nos. 1, 2, 3, 8–12, 24, 34–36). Do not attribute the entire 36-programme collective catalogue to him. Statements about professional experience and diplomas are based on the supplied CV and MYM Advisor repository; independent verification of supporting records is pending. The original catalogue is marked confidential and should not be published in full.

### Important

**No deployment is claimed.** Hosting, domain/DNS, SMTP credentials, legal validation and a real build/runtime verification require resources or approvals beyond the source code.
