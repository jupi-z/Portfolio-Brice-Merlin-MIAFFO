# Déploiement

## Services

- Frontend et SSR éditorial : Node 22/24 + Express depuis la racine.
- CMS : Strapi 5.60.0 dans `cms/`.
- Base : PostgreSQL 16 interne au réseau Docker.
- SMTP : uniquement côté serveur, jamais dans React.

## Vérifications avant mise en ligne

```powershell
npm ci --no-audit --no-fund
npm test
npm run typecheck
npm run build
docker compose --env-file cms/.env -f cms/docker-compose.yml config --quiet
```

Configurer séparément les variables de production de la racine (`PUBLIC_SITE_URL`, `ALLOWED_ORIGIN`, `CMS_URL`, `CMS_API_TOKEN`, SMTP) et celles de `cms/.env`. Ne pas copier les valeurs de développement en production.

Le serveur Express doit être utilisé pour les routes `/fr/perspectives/`, `/en/perspectives/`, les fiches dynamiques, `/sitemap.xml` et les flux RSS. Un hébergement purement statique ne peut pas interroger Strapi ni livrer les publications sans générateur externe.

## Reverse proxy

Publier uniquement le frontend/Express et l’admin CMS derrière HTTPS et une authentification adaptée. Ne pas exposer le port PostgreSQL. Restreindre l’admin CMS à une URL privée ou à une protection réseau ; ne pas donner de token d’administration au frontend.

## Limites externes

La mise en production reste conditionnée à la configuration DNS/HTTPS, au serveur, au token de lecture CMS, au SMTP réel, aux coordonnées confirmées, aux mentions légales et à la validation des contenus/traductions.
