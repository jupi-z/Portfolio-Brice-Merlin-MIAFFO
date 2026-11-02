# Rapport QA local — 2 novembre 2026

## État exécuté

| Vérification | Résultat |
|---|---|
| Docker Engine / Compose | PASS — Engine 29.8.2, Compose 5.5.1 |
| PostgreSQL | PASS — PostgreSQL 16 Alpine, conteneur healthy, volume persistant |
| Strapi | PASS — 5.60.0, build admin réussi, `/_health` HTTP 204, `/admin` HTTP 200 |
| Mailpit | PASS — `axllent/mailpit:v1.32.0`, UI 8025, SMTP 1025, volume persistant |
| `npm test` | PASS — contenu bilingue, rendu et tests serveur |
| `npm run build` | PASS — TypeScript, Vite et prerender FR/EN |
| `npm run build --prefix cms` | PASS — compilation TypeScript et panneau Strapi |
| Configuration Compose | PASS — PostgreSQL, Strapi, Mailpit sur réseau privé |
| Internationalisation Strapi | PASS — locales English et Français créées dans l'interface |
| Configuration Email Strapi | PASS — provider Nodemailer, Mailpit détecté |
| Test de connexion Strapi | PASS — interface « Connected » |
| Test d'envoi Strapi | PASS — message capturé par Mailpit |
| Formulaire contact FR/EN | PASS — HTTP 200, UTF-8 et Reply-To capturés |
| Échappement HTML | PASS — balises utilisateur échappées dans le HTML |
| Validation, origine, honeypot, rate-limit | PASS — réponses dédiées et aucun faux envoi |
| Timeout / erreur SMTP | PASS — chemins d'erreur dédiés et tests de configuration |
| Publications publiques | PASS antérieur — publié uniquement, brouillons exclus |
| SEO éditorial | PASS partiel — canonical, Open Graph, Twitter et hreflang SSR renforcés |
| Pagination et sitemap | PASS code — pages paginées et collecte multi-pages |
| Sauvegarde/restauration PostgreSQL | PASS antérieur — dump/restauration locaux vérifiés |

## Administration temporaire

Un compte administrateur local de QA a été créé uniquement pour le parcours graphique. Aucun compte de production, identifiant Hostinger ou secret n'a été créé ni versionné. Les messages Mailpit de test sont supprimés par le test reproductible.

La création exhaustive de publications, médias, PDF et d'un rôle éditeur doit rester exécutée dans une session QA locale dédiée avant l'ouverture de la PR finale; elle n'est pas déclarée comme entièrement passée sans preuve correspondante.

## Dépendances et limites restantes

- La livraison Internet Hostinger, SPF/DKIM/DMARC et la réception réelle ne peuvent être validées avant la création des comptes de production par Brice.
- `npm audit --omit=dev --audit-level=high` frontend : 0 vulnérabilité. `npm audit --prefix cms --omit=dev --audit-level=high` Strapi 5.60.0 : 43 vulnérabilités transitives (dont 25 high), notamment via Nodemailer, webpack-dev-middleware et zod. Aucun `npm audit fix --force` n'a été appliqué, car l'outil propose des changements majeurs incompatibles; elles doivent être requalifiées lors d'une montée de version Strapi.
- Les tests graphiques multi-navigateurs, les 12 formations sur toutes les tailles et la restauration des médias doivent être validés dans l'environnement QA local complet; aucune validation visuelle non exécutée n'est présentée comme PASS.
