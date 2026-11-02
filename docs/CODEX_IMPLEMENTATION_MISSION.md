# MISSION CODEX — Portfolio professionnel Brice Merlin MIAFFO

**Objectif :** finaliser le véritable site professionnel bilingue (FR/EN) de Brice Merlin MIAFFO, à partir de la V2 Premium **déjà validée**, et construire une plateforme éditoriale administrable pour publier articles, analyses, études, rapports, guides, notes, études de cas, interventions et ressources.

## 0. Contexte impératif

Tu disposes déjà du dépôt local et du serveur démarré. Travaille **dans ce dépôt existant**, sans réinitialiser le projet ni repartir de zéro.

- Dépôt : `https://github.com/jupi-z/Portfolio-Brice-Merlin-MIAFFO`
- Référence de développement actuelle : `feature/portfolio-v2-1-fr-en` (PR #1, en brouillon lors du dernier contrôle). Vérifie le checkout local, le statut Git et les éventuels commits plus récents avant toute modification. Ne présume pas que le local correspond exactement à GitHub.
- La **V2 Premium** est la référence graphique approuvée. La V3 reconstruite ultérieurement a été explicitement **rejetée** : ne pas en réutiliser la direction artistique.
- Sources existantes : `src/original-v2.css`, `src/templates/`, `src/enhancements.css`, `src/content/*`, `public/assets/brice-miaffo-portrait.webp` et `docs/DESIGN_LOCK.md`.
- Technologies existantes : React, TypeScript, Vite, daisyUI, Express, Nodemailer ; 12 routes statiques FR/EN et script de prérendu.
- Le projet MYM-ADVISOR constitue un site distinct. **Ne modifie pas** le dépôt `jupi-z/MYM-ADVISOR` dans cette mission.
- Le futur site public sera placé sur un sous-domaine du cabinet ; `https://brice.mymadvisor.ca` est la valeur configurée dans le code, mais vérifie DNS, possession et déploiement avant de la considérer comme effective.

**Règle absolue :** ne pas redessiner la V2. Conserver la composition, les proportions, la typographie, le portrait, la palette, les sections, les animations et les thèmes clair/sombre. Toute nouvelle page doit prolonger exactement son langage visuel, sans « cards » génériques, sans gros effets de verre, sans ombres décoratives ni faux chiffres marketing. Sauvegarder des captures avant/après pour prouver la fidélité.

## 1. D'abord : audit et socle fonctionnel

1. Contrôle l'état de Git (`git status`, branche, historique, travail non commité), la PR #1, les dépendances et le serveur déjà démarré. Préserve intégralement le travail local existant.
2. Exécute les scripts disponibles : installation reproductible, `npm run typecheck`, `npm run test:content`, `npm run build`, démarrage/healthcheck du serveur de production. Répare les défauts réellement observés et note les commandes exactes dans le rapport.
3. Vérifie le parcours visiteur des six pages, les 12 formations, les modales, les deux langues, les liens, la navigation mobile et le changement de thème. Utilise des contrôles desktop/tablette/mobile, avec captures comparatives V2/V2.1.
4. Identifie dans le code tout champ ou lien sensible/à confirmer avant publication (notamment les contacts personnels dans `src/templates/contact.html`, les références, diplômes et années d'expérience). Ne remplace pas une donnée incertaine par une invention. Centralise les valeurs configurables et signale celles nécessitant une validation du client.
5. Passe en revue le rendu du prérendu : HTML réellement indexable, hydration sans erreur, titre/description distincts par page, canonical et `hreflang` corrects. Ne te contente pas d'un commentaire disant que c'est fait.

## 2. CMS : un véritable espace de publication autonome

**Préférence technique : Strapi 5 Community Edition auto-hébergée + PostgreSQL**, dans un dossier `cms/` ou un service isolé clairement documenté. Strapi est choisi pour éviter de développer un panneau d'administration propriétaire et parce qu'il offre administration de contenu, médias, FR/EN et brouillon/publication. Vérifie compatibilité Node, versions, licence, dépendances et documentation officielle avant installation. Ne substitue pas un autre CMS sans justification écrite fondée sur une contrainte réelle de l'environnement. Ne remplace pas React/Vite et ne reconstruis pas le site public en Next.js juste pour ajouter un blog.

Implémente une stack locale reproductible (Docker Compose PostgreSQL + CMS si Docker disponible ; sinon chemin de lancement local vérifié et documenté). En production, secrets en variables d'environnement, bases/volumes/uploads persistants, versions figées et backups/restauration documentés. Ne commite aucun secret, `.env`, donnée personnelle ou base de données. N'expose pas PostgreSQL publiquement.

### Modèle de contenu

Une collection principale « Publications », avec un **type éditorial** parmi :

- Article / analyse professionnelle
- Étude / rapport / livre blanc
- Note technique / point de vue
- Étude de cas / retour d'expérience
- Guide / ressource pratique
- Conférence / intervention / interview

Prévoir au minimum : ID stable, type, locale FR/EN, titre, slug unique par langue, surtitre, résumé, contenu riche structuré, image de couverture, texte alternatif de l'image, auteur (Brice par défaut mais pas attribué automatiquement à des tiers), catégorie, tags, date de publication, date de mise à jour, statut éditorial, temps de lecture estimé, mise en avant, documents attachés (PDF autorisés), références bibliographiques/liens sources, publications liées, métadonnées SEO (titre, description, image sociale), champs optionnels spécifiques aux études (méthodologie, périmètre, date des données, limites) et aux cas (autorisation de publication, anonymisation si besoin).

Concevoir un modèle de blocs lisible et durable : titres H2/H3, paragraphes, listes, citations attribuées, liens, images avec légendes/alt, tableaux responsives, notes, bibliographie, encadrés sobres, pièces jointes. **Ne jamais rendre du HTML non fiable avec `dangerouslySetInnerHTML` sans assainissement robuste.** Vérifier les capacités exactes de l'éditeur du CMS et utiliser son système de blocs/natifs quand possible.

### Workflow éditorial et accès

- Un compte administrateur de configuration, et au moins un profil éditeur destiné à Brice ; permissions limitées au strict besoin.
- Brice doit pouvoir créer, modifier, supprimer/archiver, prévisualiser, enregistrer un brouillon, publier/dépublier, ajouter des illustrations et PDF, organiser catégories/tags, et créer ses traductions sans écrire une ligne de code.
- Les brouillons **ne doivent jamais être accessibles publiquement** ni apparaître dans les recherches, le sitemap, le flux RSS ou les APIs publiques. Les previews doivent exiger une authentification/un lien temporaire protégé.
- Les contenus publiés doivent être modifiables en conservant le fonctionnement du site. Ne pas exiger un redéploiement manuel du code pour chaque publication.
- Restreindre les permissions publiques de l'API aux seules données publiées et aux champs nécessaires. Valider les fichiers, tailles et types MIME, protéger l'administration et documenter la sauvegarde des contenus et médias.
- Aucun témoignage, partenaire, logo, récompense, résultat chiffré, qualification ou « étude publiée » fictifs. Pas d'articles imaginaires mis en ligne pour remplir le design.

## 3. Bilinguisme intégral du site ET des publications

Les deux langues sont **FR et EN** ; pas de traduction automatique silencieuse. Prévoir la traduction de l'interface, des catégories, des articles, des résumés, du SEO et des légendes, avec relecture humaine avant publication.

Routes publiques existantes à préserver : `/fr/`, `/en/`, `/fr/parcours/`, `/en/parcours/`, etc. La rubrique existante « Perspectives » doit devenir l'entrée vers les publications :

- Liste : `/fr/perspectives/` et `/en/perspectives/` (garder les chemins existants pour ne pas casser les liens).
- Fiche : `/fr/perspectives/:slug/` et `/en/perspectives/:slug/` ; les slugs peuvent être différents selon la langue.
- Le sélecteur de langue maintient le même article lorsqu'une traduction **publiée** existe. Si elle n'existe pas, il dirige vers la liste de la langue choisie en expliquant brièvement que la traduction n'est pas disponible ; ne jamais afficher du français sous une URL `en` ou vice-versa.
- `html lang`, canonical, alternates/hreflang uniquement pour les traductions effectivement disponibles, titres, descriptions et médias sociaux dans la bonne langue.

## 4. Interfaces publiques du pôle éditorial — fidèle à V2

Créer des vues publiques soignées, distinctes d'un blog WordPress générique, avec le design system V2 :

1. **Liste des publications** : mise en avant du dernier contenu réellement publié ; choix par format, catégorie, recherche et pagination ; images optimisées ; auteurs/dates/types/temps de lecture ; état vide élégant sans chiffres inventés.
2. **Page de lecture** : typographie éditoriale premium, largeur de lecture mesurée, hiérarchie claire, éventuel sommaire, blocs médias, citations sourcées, bibliographie, date de mise à jour, références, PDF à télécharger lorsqu'autorisé, contenus apparentés et partage par URL.
3. **Études et rapports** : présentation soignée de l'abstrait, du périmètre, de la méthodologie et des limites, avec fichiers téléchargeables lorsque disponibles.
4. **Accueil** : remplacer les faux « sujets d'articles » ou placeholders par les derniers contenus effectivement publiés, ou par un état éditorial neutre si le CMS est vide.
5. **Parcours / expertises / formations** : ne modifier que ce qui est nécessaire pour créer des liens contextuels vers les publications pertinentes, sans bouleverser l'organisation et le design approuvés.

Toutes les interfaces sont responsives, accessibles au clavier, compatibles clair/sombre et intégralement FR/EN. Aucun nouveau style « template IA ».

## 5. Référencement, performances et publication sans développeur

Le projet prérend aujourd'hui 12 pages statiques. Étends la stratégie pour que **les nouvelles publications soient réellement indexables** et accessibles publiquement sans intervention manuelle : privilégie rendu serveur (SSR) sur les routes éditoriales dynamiques, ou génération statique déclenchée automatiquement et de manière fiable par un événement de publication CMS. Explique le choix et implémente-le réellement. Un simple rendu client avec balises SEO injectées en JavaScript n'est pas une livraison suffisante pour cette exigence.

Implémenter :
- HTTP 200 pour les contenus publiés, 404 pour slug inexistant/non publié, sitemap XML dynamique (y compris les traductions disponibles), canonicals absolus corrects ;
- Open Graph / Twitter cards et images de couverture ;
- données structurées `Article` ou `BlogPosting` selon le format, `Person` pour l'auteur et relations avec `Organization` seulement si justifiées ; ne pas annoncer de publication « scientifique évaluée par les pairs » sans preuve ;
- RSS distinct FR et EN si compatible avec l'architecture ;
- images responsive, chargement différé des médias hors écran, tailles et formats adaptés ; gestion saine des liens externes ; accessibilité WCAG applicable.

Conserver le référencement des douze pages existantes et mettre à jour la sitemap sans supprimer les URLs déjà publiées.

## 6. Fonctionnalités professionnelles et intégration M-Y-M Advisor

- Finaliser `POST /api/contact` en conservant SMTP côté serveur. Vérifier son fonctionnement dans un environnement de test contrôlé et l'affichage d'un succès **uniquement après confirmation**. Gérer indisponibilité, validation, protection anti-spam, logs qui n'exposent pas les données sensibles et message de repli. Sans secrets SMTP réels, ne pas déclarer « envoi en production vérifié ».
- Prévoir des sujets distincts : demande de conseil, financement, masterclass, conférence, presse, demande de document. Les demandes du portfolio peuvent être dirigées vers M-Y-M Advisor si la règle commerciale le prévoit.
- Vérifier les contacts : le code comporte des coordonnées personnelles et le cabinet affiche d'autres coordonnées. Ne pas inventer la « bonne » valeur. Centraliser et documenter les confirmations nécessaires.
- Pour les formations, conserver seulement les 12 programmes nommément attribués à Brice dans le catalogue remis. Ne pas recopier les 36 formations du cabinet ni publier le PDF confidentiel en l'état.
- Prévoir une page de confidentialité et des mentions légales adaptées à l'éditeur réel, mais **ne pas inventer de mentions juridiques**, d'adresse, de consentement ou de conformité. Utiliser des champs à compléter, clairement identifiés hors production.

## 7. Architecture, sécurité et qualité

- Maintenir une séparation nette entre frontend public, API contact, CMS et stockage. Centraliser les types/données récupérées du CMS dans une couche dédiée ; ne pas mélanger HTML de template V2 et contenu éditorial non fiable.
- Ne pas exposer de token d'administration, secret CMS, credential SMTP, clés personnelles ou jeton de preview dans le client.
- Authentification sécurisée pour l'admin, permissions les plus limitées, CSP et protections raisonnables, CORS restrictif, validation des entrées, uploads limités, URL-safe slugs, anti-spam côté serveur, logging non intrusif, sauvegardes de base et médias.
- Ne jamais utiliser de base de données de démonstration comme base de production. Fournir données de test **clairement factices** dans un environnement isolé, non visible publiquement.
- Ajouter tests automatisés raisonnables (unitaires, intégration API, E2E navigateur) : accès visiteur FR/EN, thèmes, menu, formations, liste blog, fiche article, article sans traduction, brouillon invisible, lien d'édition non exposé, 404, sitemap/SEO, contact simulé sans envoi externe, affichage mobile/tablette/desktop.
- Vérifier les contrastes, la navigation clavier, les états de chargement/erreur, les images manquantes, et le comportement si le CMS est inaccessible.

## 8. Ordre d'exécution et critères d'acceptation

**Travaille réellement dans le code**, sans t'arrêter à une analyse, et sans me demander une nouvelle validation entre les étapes qui ne requièrent pas de secret ou d'autorisation externe.

Ordre conseillé : (A) audit/compilation/régressions V2.1 ; (B) CMS local + schémas + comptes/permissions ; (C) intégration API et pages publiques bilingues ; (D) SSR/SEO dynamique ; (E) contact / sécurité ; (F) tests/QA / documentation ; (G) commits propres + PR de revue.

La mission est acceptable seulement si :
1. Le site actuel fonctionne et ressemble à la V2 validée sur desktop/mobile en FR/EN et clair/sombre.
2. L'administration CMS s'ouvre localement et un éditeur peut créer un brouillon, joindre une image ou un PDF, rédiger la traduction, prévisualiser et publier sans modifier le code.
3. Après publication d'un article de test FR et de sa version EN, les deux pages publiques sont visibles, leur recherche fonctionne, elles ont des métadonnées complètes ; la version non publiée reste invisible. Le test utilise des données factices rétractées ensuite.
4. Une nouvelle publication apparaît sans relancer manuellement un build par un développeur ; explique et démontre le mécanisme.
5. Tests de compilation, types, contenu, API et navigateurs réellement exécutés, avec résultats consignés ; pas de revendications non vérifiées.
6. Les dossiers sont documentés, les variables décrites dans des `.env.example`, les commandes d'installation/développement/migration/déploiement sont reproductibles.
7. Le dépôt M-Y-M Advisor et les branches V2 historiques restent inchangés.

## 9. Livraison et compte rendu attendu

À la fin de ton travail :
- Résumé des fonctionnalités effectivement réalisées, avec fichiers principaux et commits.
- Lien vers la branche/PR sans fusion non testée ; jamais écraser un travail concurrent.
- Instructions exactes pour démarrer le site, le CMS et la base, créer le premier administrateur, puis publier un article FR et EN.
- Captures de l'accueil, de la liste, de la lecture d'article et des vues mobiles dans les deux thèmes.
- Résultats des commandes de tests, liste des défauts restants et de tout point non testé.
- **Une courte liste de bloqueurs externes seulement** : accès DNS/VPS, SMTP, choix des coordonnées validées, informations légales, droits du portrait, approbation des contenus et des traductions. Aucun secret ne doit être demandé dans le chat ni commité.

**Rappel final :** ce travail doit compléter et industrialiser le Portfolio Premium V2 approuvé — **ne jamais en profiter pour proposer un nouveau design**. Priorité absolue au portfolio personnel de Brice ; M-Y-M Advisor ne sert que de référence institutionnelle.

## Sources officielles de vérification technique

- Strapi 5 : https://docs.strapi.io/cms/quick-start
- Strapi internationalisation : https://docs.strapi.io/cms/features/internationalization
- Strapi brouillons : https://docs.strapi.io/cms/features/draft-and-publish
- Strapi Docker : https://docs.strapi.io/cms/installation/docker
- Google Search Central, localisations : https://developers.google.com/search/docs/specialty/international/localized-versions


## 10. RÈGLE DE LIVRAISON GITHUB EN CONTINU (instruction explicite du propriétaire)

**Toutes les réalisations doivent être écrites, vérifiées, commitées et poussées directement vers ce dépôt GitHub.** Il ne suffit pas de créer des fichiers dans l'environnement Codex, dans un ZIP ou dans une démonstration locale. Pour chaque jalon fonctionnel : tests -> commit explicite -> \`git push origin <branche-de-travail>\` -> vérification de la présence du commit distant -> rapport d'avancement GitHub. Utilise une branche de travail distincte si celle en cours comporte des changements non stabilisés, et relie-la à une pull request vers \`main\` ; respecte les travaux locaux non commitées et les commits d'autrui. Ne pas fusionner une PR qui n'a pas passé les contrôles.

Commence par lire ce document et \`AGENTS.md\` **depuis le dépôt GitHub**, puis synchronise prudemment ta copie locale avec \`origin\`. Si une modification locale concurrente existe, la sauvegarder avant de changer de branche ou de faire un rebase. N'écrase aucun code existant. Documente dans le dépôt chaque décision d'architecture, configuration, changement de schéma, route API, procédure de démarrage, migration et test. Les instructions et la documentation doivent résider dans GitHub, pas dans une annexe privée au chat.

Si une action externe exige de vrais secrets, le contrôle du DNS, un consentement sur les médias ou un accès à l'hébergement, effectue tout ce qui est testable sans eux, versionne le code et les exemples de configuration, puis signale clairement le blocage ; **ne commite aucun secret et ne simule pas une mise en production**.
