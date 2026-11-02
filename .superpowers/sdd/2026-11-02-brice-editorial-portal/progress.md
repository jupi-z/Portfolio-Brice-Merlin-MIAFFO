# SDD ledger — plan: docs/superpowers/plans/2026-11-02-brice-editorial-portal.md

Base: c27e961

Ruling: use a local Strapi admin plugin page as the simplified portal — the user explicitly chose Strapi-native styling and integrated administration, so this avoids a second authentication system and keeps RBAC in Strapi.

Pre-flight: Task 1 contract -> Task 2 server/API; Task 2 session/data contracts -> Tasks 3-5 admin UI and content workflows; Task 6 depends on the plugin permissions created by Tasks 2-5; Task 7 consumes all prior test and documentation outputs.

Task 1 completed: native Strapi Design System selected; portal contract helpers and tests added. Dedicated custom theme tokens were intentionally omitted because the portal inherits Strapi’s native theme.
Task 2/3 initial slice: local plugin registration, French-first dashboard, safe publication summary, and guided draft form implemented. CMS build passed after correcting Strapi’s kebab-case plugin key and Design System component names.
