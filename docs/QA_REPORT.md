# Rapport QA — 2 novembre 2026 — reprise Docker

## Vérifications passées

| Commande / parcours | Résultat |
|---|---|
| `npm ci --no-audit --no-fund` | OK |
| `npm test` | OK — contenu bilingue, rendu, adapter et intégration serveur |
| `npm run typecheck` | OK |
| `npm run build` | OK — 12 pages prerenderées FR/EN |
| `npm run build --prefix cms` | OK — Strapi 5.60.0 admin compilé |
| `docker compose ... config --quiet` | OK |
| `docker version` / `docker compose version` | OK — Engine 29.8.2 / Compose 5.5.1 |
| PostgreSQL 16 `healthy` + `pg_isready` | OK |
| Strapi `/_health` | HTTP 204 |
| Strapi `/admin` | HTTP 200, Content-Security-Policy et X-Frame-Options présents |
| Migrations Strapi 5.60.0 | OK — migrations de document, locale et brouillon exécutées |
| API CMS publiée vide | HTTP 200, aucune donnée confidentielle |
| Brouillon FR via Document Service | Invisible dans l’API publique et la fiche |
| Publication FR + localisation EN liée | Pages SSR, API, sitemap et RSS vérifiés |
| Modification publiée sans reconstruction | OK — titre, blocs et SEO reflétés par le serveur immédiatement |
| Dépublication puis suppression des données factices | OK — API vide, fiche HTTP 404, sitemap/RSS propres |
| Sauvegarde/restauration PostgreSQL | OK — dump 231210 octets, restauration et `pg_isready` confirmés |
| serveur Express `/health` | HTTP 200 |
| API `/api/publications` sans CMS | HTTP 200, liste vide sûre |
| `/fr/perspectives/` sans CMS | HTTP 200, état éditorial neutre/indisponible |
| slug inexistant ou non publié | HTTP 404 |
| sitemap XML et RSS FR | HTTP 200 |
| `POST /api/contact` validation / SMTP absent / honeypot | HTTP 400 / 503 / 200, sans faux succès |
| Accueil FR clair | Vérifié visuellement dans le navigateur |
| Accueil EN sombre | Vérifié visuellement dans le navigateur |
| Portrait, navigation, formations et alternance de langue | Vérifiés dans l’arbre d’accessibilité |

## Vérifications CMS et limite restante

Docker Desktop est maintenant opérationnel. PostgreSQL 16 et Strapi Community 5.60.0 démarrent dans le réseau privé Docker, avec volume de base persistant et uploads montés localement.

Le parcours de contenu a été vérifié avec Strapi Document Service et des données factices temporaires : brouillon, publication FR, traduction EN, SSR, SEO, sitemap, RSS, modification sans rebuild, dépublication et suppression.

La création du premier compte administrateur et le contrôle manuel du rôle éditeur restent volontairement non exécutés, conformément à la consigne de ne pas créer un compte Brice avec des identifiants inventés. L’écran `/admin` est accessible et affiche la procédure officielle de création.

Le CMS démarre avec l’avertissement de développement suivant, sans impact sur les publications :

```text
[email]: The "sendmail" email provider is still supported...
```

## Audit dépendances

- Le frontend/API ne conserve plus Nodemailer vulnérable : version exacte `10.3.1`.
- Strapi 5.60.0 conserve des alertes transitives remontées par `npm audit`; les correctifs proposés impliquent des changements majeurs vers des versions incompatibles. Aucun `npm audit fix --force` n’a été appliqué.

## Action restante pour l’administration

```powershell
docker compose --env-file cms/.env -f cms/docker-compose.yml up --build -d
Invoke-WebRequest http://127.0.0.1:1337/admin
```

Puis créer l’administrateur, le rôle éditeur et le token de lecture CMS selon `docs/CMS_EDITOR_GUIDE.md`, rédiger une publication factice FR/EN, la publier, puis vérifier ses deux URLs, le sitemap, le RSS et l’absence de la version brouillon.
