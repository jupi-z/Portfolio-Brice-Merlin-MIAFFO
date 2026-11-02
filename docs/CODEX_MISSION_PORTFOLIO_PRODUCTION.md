# Mission Codex — Portfolio Brice Merlin MIAFFO (V2.1 → production)

## Source de vérité et priorité
- Dépôt: `jupi-z/Portfolio-Brice-Merlin-MIAFFO`.
- Branche de référence applicative: `feature/portfolio-v2-1-fr-en` (PR #1 en brouillon vers `main`). Ne pas supposer que `main` contient la V2.1 : vérifier les refs et commits.
- Référence esthétique immuable: `design/portfolio-premium-v2`, `docs/DESIGN_LOCK.md`, `src/original-v2.css`, `src/templates/`, portrait approuvé dans `public/assets/`. **Ne pas reprendre la V3 rejetée, ne pas redessiner la V2.**
- Préserver le dépôt `MYM-ADVISOR` (aucune modification). Le portfolio est un site personnel distinct, destiné à un sous-domaine du cabinet.
- Le site doit être **entièrement français et anglais**, y compris interface d'administration utile, contenus éditoriaux, erreurs, SEO et formulaires. Routes existantes `/fr/`, `/en/`, leurs six pages et changement de langue conservant la page.
- Le présent document est la spécification de réalisation. Tenir ce document et le README à jour au fil du travail.

## Démarrage sans destruction
1. Examiner `git status`, la branche courante, les commits et changements non poussés de Codex. Ne jamais écraser un travail local. Vérifier PR #1 et la V2.1.
2. Installer les dépendances, lancer `npm run typecheck`, `npm run test:content`, `npm run build`, puis le serveur et des tests navigateur desktop/mobile, FR/EN, clair/sombre. Enregistrer les échecs avant corrections.
3. Faire des commits atomiques et pousser **toutes** les réalisations dans ce dépôt, sur une branche dédiée basée sur la V2.1 (ou la branche Codex existante si approprié), avec PR vers la bonne branche d'intégration. Ne pas fusionner automatiquement dans `main` et ne pas réécrire son historique. Ne jamais ajouter de secrets, .env réels, contenus confidentiels ni dumps de production.
4. Établir un inventaire des contenus et fonctionnalités déjà présents, corriger plutôt que dupliquer.

## Résultat produit
Un portfolio public premium fidèle à la V2, utilisable en FR/EN, plus un **véritable espace éditorial** permettant à Brice, sans développeur, de gérer:
- Articles / tribunes / analyses (finance d'entreprise, banque, crédit, stratégie, gouvernance).
- Études et rapports, livres blancs, notes techniques et ressources téléchargeables.
- Études de cas (sans divulguer de données confidentielles), conférences, interventions, presse, vidéos, publications pédagogiques.
- Catégories, tags, auteur(s), date, image de couverture, médias, PDF, sources, bibliographie, SEO, liens associés, contenus mis en avant.
- Brouillons, aperçu sécurisé, publication, dépublication, corrections, archivage et éventuelle planification (seulement si effectivement prise en charge).
- Deux traductions éditoriales indépendantes (FR/EN) et état de publication propre à chaque langue. Ne jamais inventer automatiquement une traduction ni montrer une version non publiée.

## Architecture proposée
- Conserver React/TypeScript/Vite, Tailwind/DaisyUI déjà présents et la V2 graphique.
- **Privilégier Strapi 5 Community Edition + PostgreSQL** pour le CMS headless, sous réserve de compatibilité réelle. Documenter toute alternative justifiée avant adoption; ne pas construire un CMS maison si une solution maintenue répond au besoin.
- CMS, base de données et stockage médias distincts du frontend, API de lecture publique filtrée aux publications autorisées, administration authentifiée et contrôles d'accès stricts.
- Prévoir environnement local reproductible (par exemple Docker Compose pour PostgreSQL/CMS, scripts npm, seed de développement clairement fictif), migrations/schémas et sauvegardes documentées.
- Aucun secret ni clé d'admin exposé dans les variables `VITE_*` ou dans le bundle public. Ne pas exposer le back-office à l'indexation.
- API publique en lecture seule, pagination, recherche, filtres et limitation des champs, protection contre injections/XSS, validation serveur, tailles/types de fichiers, droits d'accès aux médias privés.
- Un article publié doit apparaître sur le site **sans nouveau commit ni reconstruction manuelle**. Choisir une stratégie de rendu compatible SEO (SSR, rendu à la requête, ISR ou mécanisme éprouvé) et la mettre en œuvre, y compris sur les URL dynamiques.

## Interfaces publiques
- Faire évoluer « Perspectives » en véritable portail « Perspectives & Publications » / « Insights & Publications »; garder les pages existantes et leur design.
- Page index: publication mise en avant, filtres type/catégorie, recherche, pagination, états vides, dates, langues, images adaptées.
- Pages de détail: titre, chapô, auteur, date, temps de lecture si calculé, corps structuré, citations, notes/sources, documents téléchargeables autorisés, contenus associés, partage et navigation.
- Réutiliser la grammaire graphique V2 (couleurs, rythme éditorial, typo, espacements, interactions); pas de cartes génériques, ombres décoratives, faux chiffres ni refonte de la page d'accueil.
- Accessibilité clavier, focus visible, contrastes, formulaires étiquetés, responsive, préférences reduced-motion, images avec alt.
- Aucun faux article présenté comme un travail réel de Brice. Les fixtures de développement doivent être explicitement fictives et non publiées en production.

## Bilinguisme & référencement
- Chaque page statique et chaque publication publiée a son URL stable par langue, slug localisé, titre/description/canonical/OG/Twitter et données structurées pertinentes (Person, WebPage, Article/ScholarlyArticle selon le type).
- `hreflang` réciproque seulement entre versions publiées existantes; sitemaps dynamiques ou régénérés automatiquement lors des publications; robots.txt correct; 404 et redirections maîtrisées.
- Préserver les 12 formations réellement attribuées à Brice selon les sources déjà documentées; **ne pas lui attribuer l'ensemble du catalogue collectif de 36 formations**. Vérifier diplômes, expériences, citations, médias et permissions avant diffusion; ne pas exposer le catalogue confidentiel intégral.
- Garder FR/EN pour les six pages, formations, fiches, menu, formulaires, confirmations et messages d'erreur. La langue active doit survivre aux navigations.

## Contact et sécurité
- Terminer `POST /api/contact`: validation, erreurs compréhensibles, confirmation uniquement après livraison SMTP confirmée, anti-spam et limitation de débit adaptée au déploiement (pas uniquement mémoire locale en multi-instance), tests de panne, journaux sans données sensibles.
- Vérifier les coordonnées publiques et la politique de confidentialité auprès du propriétaire avant production.
- Protéger CMS et API: auth, rôles, permissions, CORS/origin, en-têtes de sécurité, dépendances à jour, fichiers uploadés, limites et sauvegardes; pas de comptes ni mots de passe de démonstration en production.
- Mettre en place un contrôle de santé et des instructions de récupération / restauration.

## Qualité, livraison et GitHub
- Tests automatisés: types, lint, contenu et parité FR/EN, build, API/CMS, permissions publication/brouillon, traduction non publiée, SEO, formulaires.
- Tests navigateur Playwright (ou équivalent) desktop/mobile sur les 2 langues, 2 thèmes, navigation, recherches, article détaillé, PDF, clavier, erreurs et administration. Captures comparatives avec V2 pour éviter les régressions visuelles.
- CI GitHub Actions sur PR; versions des dépendances verrouillées; documentation de développement, déploiement, variables d'environnement, HTTPS/DNS/sous-domaine, SMTP, stockage médias, sauvegardes, migrations et gestion quotidienne des publications.
- Déploiement réel **seulement avec accès et autorisation disponibles**. Ne pas inventer DNS, SMTP, credentials ni succès de tests.
- À la fin: pousser les commits, ouvrir/actualiser une PR, indiquer SHA/branche/PR, tests exécutés et résultats, parcours de publication validé, points bloquants et seules informations externes réellement manquantes. Ne pas dire « prêt pour production » si les tests, contenus, sécurité ou accès ne sont pas validés.

## Ordre d'exécution
A. Audit et baseline V2.1; B. socle CMS/DB et rôles; C. modèle de publication bilingue et médias; D. API publique + pages dynamiques; E. SEO/rendu; F. formulaires et sécurité; G. tests/CI; H. documentation et PR.

**Exécuter réellement le code, pas seulement proposer un plan. Ne pas interrompre le travail pour des choix de détail raisonnables. Demander uniquement les secrets, autorisations et informations factuelles impossibles à déduire du dépôt.**
