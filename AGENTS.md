# AGENTS.md — Instructions obligatoires pour Codex

Ce dépôt est exclusivement consacré au **portfolio personnel de Brice Merlin MIAFFO**.

## Mission actuelle

Lire en entier **[docs/CODEX_IMPLEMENTATION_MISSION.md](docs/CODEX_IMPLEMENTATION_MISSION.md)** avant toute implémentation. Ce document est le cahier des charges exhaustif et la source de vérité pour le périmètre, l'architecture, le CMS, le blog, le bilinguisme, le référencement, les tests et la livraison. Ne pas demander au propriétaire de recoller des instructions dans le chat.

### Règles impératives

1. **Design verrouillé :** conserver rigoureusement la **V2 Premium validée**, notamment `src/original-v2.css`, `src/templates/`, le portrait, le responsive, et les modes clair/sombre. Ne pas repartir de zéro, réutiliser la V3 rejetée ou réinventer l'identité ; voir `docs/DESIGN_LOCK.md`.
2. **FR/EN intégral :** tous contenus, nouvelles pages, publications, métadonnées, navigation et messages d'erreur doivent être traduits humainement. Préserver les routes existantes `/fr/` et `/en/`.
3. **Blog réel :** permettre à Brice de publier indépendamment des articles, analyses, études, rapports, livres blancs, cas pratiques, notes, interventions, fichiers médias et PDF via CMS. Strapi 5 Community Edition + PostgreSQL est le premier choix à vérifier et installer. Respecter brouillons, permissions, traductions et référencement dynamique.
4. **Deux dépôts distincts :** ne pas modifier `jupi-z/MYM-ADVISOR`. Ne pas attribuer à Brice les 36 formations collectives : seules les 12 nominativement attribuées dans les sources fournies le sont sur son site.
5. **Aucun contenu inventé :** ne pas fabriquer témoignages, logos, prix, études publiées, résultats chiffrés, diplômes, partenaires, emails, validations ou confirmations de livraison.
6. **Travail directement sur GitHub :** avant de commencer, `git status`, inspection des branches et `git fetch origin` ; préserver les changements de Codex et le travail concurrent. Chaque réalisation terminée doit être commitée **et poussée au dépôt distant** avec message explicite, jamais uniquement laissée en local. Créer/actualiser une PR de revue ; ne pas fusionner sans tests. Archiver les rapports, décisions, procédures et résultats de tests **dans le dépôt GitHub**.
7. **Sécurité et véracité :** aucun secret dans les commits ou le frontend, aucune réponse de formulaire disant « transmis » avant confirmation serveur, aucun brouillon CMS accessible publiquement. Ne pas prétendre que les tests, le déploiement ou la livraison SMTP fonctionnent sans vérification réelle.
8. **Autonomie d'exécution :** exécuter le développement, les tests et les commits sans s'arrêter à un simple plan ; demander des accès ou autorisations seulement si techniquement indispensables, en terminant le reste du travail.

## Repères vérifiés

- Branche actuelle de travail : `feature/portfolio-v2-1-fr-en` ; PR GitHub #1 est en brouillon au moment de la rédaction. Vérifier l'état réel avant tout changement.
- `main` contient un ancien prototype et n'est pas la cible de développement de la V2.1 avant validation.
- Les références de design sont `src/original-v2.css`, `src/templates/`, `src/enhancements.css`, `public/assets/brice-miaffo-portrait.webp`, `docs/DESIGN_LOCK.md`.
- Les 12 formations et langues sont dans `src/content/`.
- API contact : `server/index.mjs`; prérendu : `scripts/prerender.mjs`.

**Lis le cahier des charges complet maintenant et suis-le jusqu'à des commits poussés et vérifiés sur GitHub.**

## Mission active — validation locale exhaustive et SMTP Hostinger (2 novembre 2026)

**Priorité de travail la plus récente :** lire et exécuter intégralement [docs/CODEX_LOCAL_QA_HOSTINGER_SMTP.md](docs/CODEX_LOCAL_QA_HOSTINGER_SMTP.md) avant de préparer une quelconque production. Cette mission précise et complète les tâches restantes du cahier des charges précédent.

Le propriétaire confirme **Hostinger comme fournisseur SMTP cible**, sans avoir encore confirmé si la boîte relèvera de Hostinger Email ou Titan Email. Vérifier les paramètres officiels de chaque service, préparer les deux profils selon la boîte réellement choisie plus tard et prouver en local tous les parcours e-mail via capture SMTP. **Il ne souhaite créer aucun vrai compte de production pour le moment** : utiliser des identités, données et secrets de développement temporaires seulement. Aucun déploiement ni changement DNS, aucun merge dans `main` à ce stade.

Terminer et tester à 100 % **ce qui est testable localement** : site FR/EN, publication via interface Strapi, médias, stockage, droits, migrations, sécurité, tests E2E, contact SMTP capturé, performance, accessibilité, CI et rollback. Ne pas prétendre avoir validé l'envoi réel Hostinger ni l'exploitation en production sans les comptes et secrets correspondants.

Tous les résultats, corrections, scripts, tests et guides doivent être **commités et poussés au dépôt GitHub**, avec compte rendu précis sur la PR.
