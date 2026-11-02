# Rapport QA local — 2 novembre 2026

## État exécuté

| Vérification | Résultat |
|---|---|
| Docker Engine / Compose | PASS — Engine 29.8.2, Compose 5.5.1 |
| PostgreSQL | PASS — PostgreSQL 16 Alpine, conteneur healthy, volume persistant |
| Strapi | PASS — 5.60.0, build admin réussi, `/_health` HTTP 204, `/admin` HTTP 200 |
| Mailpit | PASS — `axllent/mailpit:v1.32.0`, UI 8025, SMTP 1025, volume persistant |
| `npm test` | PASS — 27/27 tests : contenu bilingue, rendu, portail éditorial, SEO, autosauvegarde, rendu riche et sécurité média |
| `npm run build` | PASS — TypeScript, Vite et prerender FR/EN |
| `npm run build --prefix cms` | PASS — compilation TypeScript et panneau Strapi |
| Portail éditorial personnalisé | PASS local — session HttpOnly, espace document, barre d’outils, blocs, déplacement/duplication/suppression, recherche/filtres, traduction EN, aperçu privé, publication/dépublication |
| Médiathèque personnalisée | PASS — upload WebP/PDF, rejet d’un fichier non autorisé, bloc média incomplet, accès privé et exposition publique uniquement après publication vérifiés |
| `npm run test:editorial:local` | PASS — scénario FR/EN exécuté avec le rôle limité Strapi `Editor`, création/réouverture, HTML riche, traduction, aperçu, publication, dépublication des deux langues, médias WebP/PDF, confidentialité et suppression |
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
| SEO éditorial | PASS — suggestions automatiques bornées, conservation des overrides manuels, checklist image-alt, canonical, Open Graph, Twitter, JSON-LD, hreflang, sitemap et RSS |
| Pagination et sitemap | PASS — pagination serveur du portail et collecte multi-pages publiques |
| Sauvegarde/restauration PostgreSQL | PASS — `cms/scripts/verify-backup.ps1`, dump puis restauration dans une base temporaire isolée |
| Nettoyage QA | PASS — publications et médias temporaires supprimés ; aucune ligne `qa-local*` ni fichier `qa_local_*` restant |
| Vérification visuelle | PASS ciblé — connexion, tableau de bord, publications, médiathèque, éditeur document de type traitement de texte, onglets Publication/Traduction/SEO et bas d’éditeur avec options avancées ; interface plein écran sans cartes, header fixe sur desktop, navigation latérale fixe avec aide ancrée en bas, surface de rédaction continue avec saisie directe et pied d’actions maintenu dans la colonne document |

## Administration temporaire

Un compte administrateur local de QA a été créé uniquement pour le parcours graphique. Aucun compte de production, identifiant Hostinger ou secret n'a été créé ni versionné. Les messages Mailpit de test sont supprimés par le test reproductible.

Le scénario API éditorial complet est passé localement. Le portail a aussi été ouvert dans le navigateur local et l’éditeur complet a été vérifié visuellement. Le compte QA local utilise maintenant le rôle Strapi limité `Editor` ; le rôle dédié `Editorial Editor` reste recommandé pour la production. Les données de test générées par le scénario ont été supprimées après vérification.

La superposition signalée dans le pied de l’éditeur a été reproduite puis corrigée : le pied d’actions était auparavant un item de la grille au même niveau que la barre latérale sticky. Il est désormais contenu dans la colonne document, tandis que les enfants flex/grid critiques peuvent se réduire et que les actions longues se réorganisent sur mobile. Une assertion de non-régression couvre cette structure dans `tests/editorial-shell.test.mjs`.

La surface de rédaction a ensuite été rapprochée d’un traitement de texte : zone document continue, corps de texte étendu, styles `Normal` / `Titre 1` / `Titre 2` / `Citation`, annuler/rétablir, mise en forme directe et conservation des blocs image/PDF/tableau. La saisie interactive et la persistance du HTML riche ont été rejouées dans le scénario éditorial local.

La référence « classic editor » fournie a été appliquée uniquement à l’intérieur de la page document : action « Ajouter un média », barre de mise en forme compacte (paragraphes, listes, citation, alignements, liens), permalien lisible avec modification assistée, zone de texte continue pour le premier bloc, insertion des blocs avancés sous le texte, compteur de mots et état du brouillon. Le shell, la sidebar, le header et le design public restent inchangés.

## Dépendances et limites restantes

- La livraison Internet Hostinger, SPF/DKIM/DMARC et la réception réelle ne peuvent être validées avant la création des comptes de production par Brice.
- `npm audit --omit=dev --audit-level=high` frontend : 0 vulnérabilité. `npm audit --prefix cms --omit=dev --audit-level=high` Strapi 5.60.0 : 43 vulnérabilités transitives (dont 25 high), notamment via Nodemailer, webpack-dev-middleware et zod. Aucun `npm audit fix --force` n'a été appliqué, car l'outil propose des changements majeurs incompatibles; elles doivent être requalifiées lors d'une montée de version Strapi.
- Les tests graphiques multi-navigateurs, la matrice complète des 12 formations sur toutes les tailles et la restauration indépendante des médias restent à compléter dans une passe QA dédiée ; aucune validation non exécutée n'est présentée comme PASS.
