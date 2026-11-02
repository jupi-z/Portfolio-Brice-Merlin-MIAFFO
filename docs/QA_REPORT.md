# Rapport QA local — 2 novembre 2026

## État exécuté

| Vérification | Résultat |
|---|---|
| Docker Engine / Compose | PASS — Engine 29.8.2, Compose 5.5.1 |
| PostgreSQL | PASS — PostgreSQL 16 Alpine, conteneur healthy, volume persistant |
| Strapi | PASS — 5.60.0, build admin réussi, `/_health` HTTP 204, `/admin` HTTP 200 |
| Mailpit | PASS — `axllent/mailpit:v1.32.0`, UI 8025, SMTP 1025, volume persistant |
| `npm test` | PASS — 16/16 tests : contenu bilingue, rendu, sécurité média et tests serveur |
| `npm run build` | PASS — TypeScript, Vite et prerender FR/EN |
| `npm run build --prefix cms` | PASS — compilation TypeScript et panneau Strapi |
| Portail éditorial personnalisé | PASS local — session HttpOnly, CRUD, blocs, recherche/filtres, traduction EN, aperçu privé, publication/dépublication |
| Médiathèque personnalisée | PASS — upload WebP/PDF, rejet d’un fichier non autorisé, bloc média incomplet, accès privé et exposition publique uniquement après publication vérifiés |
| `npm run test:editorial:local` | PASS — scénario exécuté avec le rôle limité Strapi `Editor`, création/réouverture/traduction/aperçu/publication/dépublication/suppression, médias WebP/PDF et confidentialité des uploads |
| Pages publiques locales FR/EN | PASS — fiches, liste, canonical/hreflang, sitemap, RSS, publication sans rebuild et 404 après dépublication |
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
| Pagination et sitemap | PASS — pagination serveur du portail et collecte multi-pages publiques |
| Sauvegarde/restauration PostgreSQL | PASS — `cms/scripts/verify-backup.ps1`, dump puis restauration dans une base temporaire isolée |

## Administration temporaire

Un compte administrateur local de QA a été créé uniquement pour le parcours graphique. Aucun compte de production, identifiant Hostinger ou secret n'a été créé ni versionné. Les messages Mailpit de test sont supprimés par le test reproductible.

Le scénario API éditorial complet est passé localement. Le portail a aussi été ouvert dans le navigateur local et l’éditeur complet a été vérifié visuellement. Le compte QA local utilise maintenant le rôle Strapi limité `Editor` ; le rôle dédié `Editorial Editor` reste recommandé pour la production.

## Dépendances et limites restantes

- La livraison Internet Hostinger, SPF/DKIM/DMARC et la réception réelle ne peuvent être validées avant la création des comptes de production par Brice.
- `npm audit --omit=dev --audit-level=high` frontend : 0 vulnérabilité. `npm audit --prefix cms --omit=dev --audit-level=high` Strapi 5.60.0 : 43 vulnérabilités transitives (dont 25 high), notamment via Nodemailer, webpack-dev-middleware et zod. Aucun `npm audit fix --force` n'a été appliqué, car l'outil propose des changements majeurs incompatibles; elles doivent être requalifiées lors d'une montée de version Strapi.
- Les tests graphiques multi-navigateurs, les 12 formations sur toutes les tailles et la restauration indépendante des médias doivent encore être validés dans l'environnement QA local complet; aucune validation non exécutée n'est présentée comme PASS.
