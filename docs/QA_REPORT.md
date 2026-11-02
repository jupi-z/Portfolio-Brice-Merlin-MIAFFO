# Rapport QA — 2 novembre 2026

## Vérifications passées

| Commande / parcours | Résultat |
|---|---|
| `npm ci --no-audit --no-fund` | OK |
| `npm test` | OK — contenu bilingue, rendu, adapter et intégration serveur |
| `npm run typecheck` | OK |
| `npm run build` | OK — 12 pages prerenderées FR/EN |
| `npm run build --prefix cms` | OK — Strapi 5.60.0 admin compilé |
| `docker compose ... config --quiet` | OK |
| serveur Express `/health` | HTTP 200 |
| API `/api/publications` sans CMS | HTTP 200, liste vide sûre |
| `/fr/perspectives/` sans CMS | HTTP 200, état éditorial neutre/indisponible |
| slug inexistant ou non publié | HTTP 404 |
| sitemap XML et RSS FR | HTTP 200 |
| Accueil FR clair | Vérifié visuellement dans le navigateur |
| Accueil EN sombre | Vérifié visuellement dans le navigateur |
| Portrait, navigation, formations et alternance de langue | Vérifiés dans l’arbre d’accessibilité |

## Blocage d’exécution CMS

Docker CLI et Compose sont installés, mais le daemon Docker Desktop ne répond pas :

```text
failed to connect to the docker API at npipe:////./pipe/dockerDesktopLinuxEngine
```

Le démarrage réel de PostgreSQL/Strapi, la création du premier administrateur, le test d’un brouillon puis sa publication ne peuvent donc pas être déclarés vérifiés sur cette machine. La configuration, le schéma, les scripts et la procédure sont versionnés dans `cms/` et documentés.

## Audit dépendances

- Le frontend/API ne conserve plus Nodemailer vulnérable : version exacte `10.3.1`.
- Strapi 5.60.0 conserve des alertes transitives remontées par `npm audit`; les correctifs proposés impliquent des changements majeurs vers des versions incompatibles. Aucun `npm audit fix --force` n’a été appliqué.

## À refaire sur une machine avec Docker actif

```powershell
docker compose --env-file cms/.env -f cms/docker-compose.yml up --build -d
Invoke-WebRequest http://127.0.0.1:1337/admin
```

Puis créer l’administrateur, le rôle éditeur et le token de lecture CMS selon `docs/CMS_EDITOR_GUIDE.md`, rédiger une publication factice FR/EN, la publier, puis vérifier ses deux URLs, le sitemap, le RSS et l’absence de la version brouillon.
