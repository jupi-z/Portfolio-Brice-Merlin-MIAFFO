# Back office éditorial complet — Plan d'implémentation

> **Pour les agents d'exécution :** utiliser `superpowers:executing-plans` ou `superpowers:subagent-driven-development` pour exécuter ce plan lot par lot. Chaque lot doit être testé, documenté, commité et poussé avant de passer au suivant.

**Objectif :** fournir à Brice un back office éditorial autonome, compréhensible par un non-technicien, permettant de gérer toutes les publications et tous les médias sans utiliser l'interface frontend de Strapi.

**Architecture :** le portail personnalisé reste l'unique interface quotidienne. Une API serveur dédiée agit comme BFF et utilise Strapi côté serveur via le Document Service et le service Upload. Le navigateur ne reçoit jamais de JWT administrateur : il utilise une session serveur protégée par cookie HttpOnly. Strapi Admin reste limité à la maintenance technique.

**Technologies :** Strapi 5, PostgreSQL 16, Node.js, serveur public existant, HTML/CSS/JavaScript du portail actuel, tests Node et tests navigateur à ajouter.

**Spécification :** `AGENTS.md`, `docs/CODEX_IMPLEMENTATION_MISSION.md`, `docs/CODEX_LOCAL_QA_HOSTINGER_SMTP.md`, `docs/QA_REPORT.md`.

## Contraintes globales

- Préserver strictement le design Premium V2 existant.
- Supporter intégralement le français et l'anglais.
- Ne pas dépendre de l'interface frontend de Strapi pour les opérations quotidiennes.
- Ne jamais stocker de JWT administrateur dans `localStorage` ou `sessionStorage`.
- Ne jamais publier de secret, compte réel ou donnée de production.
- Les brouillons et médias sensibles doivent rester privés.
- Toute fonctionnalité doit avoir un test automatisé ou un scénario navigateur reproductible.
- Chaque lot validé doit être documenté, commité et poussé sur `feature/portfolio-v2-1-fr-en`.

## Points de vigilance

- Un utilisateur doit pouvoir créer, modifier, traduire, prévisualiser, publier, dépublier, archiver et restaurer une publication sans connaître Strapi.
- Une erreur réseau, un fichier invalide ou une session expirée doit produire un message compréhensible et ne pas perdre le contenu saisi.
- Une publication non publiée ne doit apparaître ni sur les pages publiques, ni dans le sitemap, ni dans le RSS.
- Une traduction incomplète doit être visible dans le tableau de bord et bloquer sa publication si les règles éditoriales l'exigent.
- Les pages éditoriales doivent utiliser le même contrat visuel, thème, navigation et responsive que Premium V2.

---

### Lot 1 — Assainissement et sécurité de l'architecture

**Fichiers :**
- Modifier : `cms/public/editorial/portal.js`, `cms/public/editorial/index.html`, `cms/public/editorial/portal.css`
- Créer ou modifier : `cms/src/plugins/editorial-portal/`
- Modifier : `docs/SECURITY.md`, `docs/CMS_EDITOR_GUIDE.md`
- Tester : `tests/editorial-auth.test.mjs`, `tests/editorial-portal-shell.test.mjs`

**Résultat attendu :** session serveur BFF avec cookie HttpOnly, expiration, déconnexion, protection des routes et suppression du token administrateur du navigateur. Le lien vers Strapi Admin est retiré du parcours quotidien.

**Validation :** connexion, expiration, déconnexion, accès anonyme refusé, absence de JWT dans le stockage navigateur, permissions refusées pour un utilisateur non autorisé.

### Lot 2 — API métier complète des publications

**Fichiers :**
- Modifier : `cms/src/plugins/editorial-portal/strapi-server.js`
- Créer : `cms/src/plugins/editorial-portal/validation.js`, `cms/src/plugins/editorial-portal/serializers.js`
- Tester : `tests/editorial-publications-api.test.mjs`

**Interfaces :**
- `GET /editorial-api/publications`
- `POST /editorial-api/publications`
- `GET /editorial-api/publications/:documentId`
- `PUT /editorial-api/publications/:documentId`
- `DELETE /editorial-api/publications/:documentId`
- `POST /editorial-api/publications/:documentId/duplicate`
- `POST /editorial-api/publications/:documentId/publish`
- `POST /editorial-api/publications/:documentId/unpublish`
- `POST /editorial-api/publications/:documentId/archive`
- `POST /editorial-api/publications/:documentId/restore`

**Résultat attendu :** CRUD complet, statuts explicites, validations métier, erreurs structurées, recherche, filtres, tri et pagination côté serveur.

**Validation :** création, modification, suppression, duplication, archivage, restauration, pagination sur un grand volume et refus des opérations non autorisées.

### Lot 3 — Éditeur riche par blocs

**Fichiers :**
- Modifier : `cms/public/editorial/index.html`, `cms/public/editorial/portal.js`, `cms/public/editorial/portal.css`
- Modifier : schémas sous `cms/src/components/` et `cms/src/api/publication/`
- Tester : `tests/editorial-editor.test.mjs`, tests navigateur du parcours de saisie

**Résultat attendu :** écran d'édition simple avec titre, slug, résumé, auteur, catégorie, tags, durée de lecture, contenu par blocs, références, méthodologie, périmètre, données, limites, contenus associés et mise en avant.

**Validation :** insertion, réorganisation, modification et suppression de chaque type de bloc ; validation des champs obligatoires ; conservation du contenu lors d'une erreur réseau ; brouillon sauvegardé sans publication.

### Lot 4 — Médias, images et PDF

**Fichiers :**
- Créer : `cms/src/plugins/editorial-portal/media.js`
- Modifier : API et portail éditorial
- Tester : `tests/editorial-media.test.mjs`

**Résultat attendu :** médiathèque avec upload, sélection, remplacement, suppression contrôlée, aperçu, texte alternatif, légende, fichiers PDF, validation MIME/taille et séparation public/privé.

**Validation :** image et PDF valides, fichier interdit, fichier trop volumineux, média privé inaccessible anonymement, média utilisé par une publication non supprimable sans confirmation.

### Lot 5 — Bilinguisme et workflow éditorial

**Fichiers :**
- Modifier : API, modèles de traduction et portail
- Créer : `cms/public/editorial/i18n.js`
- Tester : `tests/editorial-locales.test.mjs`

**Résultat attendu :** édition FR/EN côte à côte, indicateur de complétude, slugs indépendants, métadonnées SEO par langue, publication et dépublication par locale, duplication FR vers EN comme point de départ.

**Validation :** création FR, traduction EN, modification indépendante, publication des deux, dépublication d'une seule langue, absence de lien vers une traduction inexistante.

### Lot 6 — Aperçu, SEO et publication contrôlée

**Fichiers :**
- Modifier : `server/editorial-pages.mjs`, `server/index.mjs`
- Créer : endpoints d'aperçu signé et composant d'aperçu SEO
- Tester : `tests/editorial-preview-seo.test.mjs`

**Résultat attendu :** aperçu privé signé, métadonnées title/description/image/canonical, `hreflang`, Open Graph, Twitter cards, `noindex`, sitemap et RSS cohérents avec le statut publié.

**Validation :** brouillon visible uniquement avec aperçu autorisé ; brouillon absent des pages publiques, sitemap et RSS ; publication présente immédiatement sans rebuild manuel ; dépublication supprimée des mêmes surfaces.

### Lot 7 — Interface quotidienne et ergonomie non technique

**Fichiers :**
- Modifier : portail éditorial et CSS
- Créer : composants de tableau de bord, bibliothèque de médias, boîte de confirmation, notifications
- Tester : tests navigateur desktop/tablette/mobile

**Résultat attendu :** navigation limitée aux tâches utiles : tableau de bord, publications, nouvelle publication, médias, catégories/tags, réglages éditoriaux. Les libellés sont compréhensibles et les options avancées sont regroupées.

**Validation :** parcours complet réalisable sans vocabulaire Strapi ; responsive ; thème clair/sombre ; clavier ; focus visible ; messages d'erreur accessibles.

### Lot 8 — Cohérence Premium V2 du site public

**Fichiers :**
- Modifier : `server/editorial-pages.mjs`, `server/publications.mjs`, composants de layout existants
- Tester : `tests/editorial-visual-contract.test.mjs` et scénarios navigateur

**Résultat attendu :** pages de liste, détail, recherche et erreur alignées avec le header, footer, navigation, thème, typographie, espacements et responsive Premium V2, sans redesign.

**Validation :** comparaison desktop/mobile en clair/sombre, navigation FR/EN, liens internes, pages 404, contenu long et images lentes.

### Lot 9 — Permissions, audit et résilience

**Fichiers :**
- Modifier : plugin serveur, configuration Strapi et Docker
- Créer : journal d'audit et scripts de sauvegarde/restauration
- Tester : `tests/editorial-permissions.test.mjs`, procédures PostgreSQL et médias

**Résultat attendu :** rôle éditeur limité, rôle administrateur séparé, journal des actions, limites d'upload, rate limiting, logs sans secrets, sauvegarde PostgreSQL et archive médias restaurables.

**Validation :** tests avec comptes locaux temporaires, refus de chaque opération interdite, restauration dans une base vierge, vérification de la présence des médias.

### Lot 10 — Validation finale et documentation

**Fichiers :**
- Modifier : `docs/QA_REPORT.md`, `docs/CMS_EDITOR_GUIDE.md`, `docs/SECURITY.md`, `docs/DEPLOYMENT.md`
- Créer : `docs/EDITORIAL_OPERATIONS.md`, scénarios QA et fixtures temporaires

**Validation finale obligatoire :**

- tests unitaires et d'intégration ;
- build frontend et build Strapi ;
- tests navigateur ;
- parcours FR/EN complet ;
- médias et PDF ;
- publication/dépublication sans rebuild ;
- sitemap/RSS/SEO/hreflang ;
- clair/sombre et trois tailles d'écran ;
- audit dépendances ;
- sauvegarde/restauration ;
- nettoyage des données de test ;
- vérification Git distante et mise à jour de la PR #1.

## Définition de terminé

Le projet ne sera déclaré terminé que si Brice peut réaliser depuis le portail personnalisé, sans ouvrir Strapi Admin :

1. créer une publication ;
2. rédiger son contenu complet ;
3. ajouter une image et un PDF ;
4. créer ou modifier la traduction anglaise ;
5. prévisualiser les deux versions ;
6. renseigner le SEO ;
7. publier ;
8. modifier après publication ;
9. dépublier ou archiver ;
10. retrouver et filtrer ses publications ;
11. restaurer une version ou une sauvegarde ;
12. effectuer ces opérations avec des permissions limitées.

Chaque point devra être démontré par un test ou une preuve navigateur enregistrée dans le rapport QA.
