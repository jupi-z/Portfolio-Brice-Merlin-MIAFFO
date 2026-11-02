# Portail éditorial simplifié — design proposé

## Intention

Permettre à Brice de gérer ses publications sans connaître Strapi, les composants, les relations ou les paramètres techniques. Le portail public Premium V2 reste inchangé. Strapi devient le moteur éditorial en arrière-plan et reste accessible uniquement pour la maintenance technique.

## Objectifs

- Offrir une interface principale en français, avec possibilité de basculer en anglais.
- Permettre de créer, modifier, traduire, prévisualiser, publier et dépublier une publication.
- Couvrir les formats article, étude, rapport, analyse, guide et intervention.
- Gérer les images, PDF, catégories, mots-clés et métadonnées SEO sans jargon.
- Préremplir les champs techniques : slug, temps de lecture, type Schema.org, canonical et liens de langue.
- Afficher des erreurs compréhensibles et confirmer clairement chaque action sensible.
- Conserver l’authentification, les permissions et le stockage dans Strapi/PostgreSQL.
- Ajouter un parcours d’accueil guidé permettant une première publication sans documentation externe.
- Reprendre le langage visuel Premium V2 sans réutiliser mécaniquement les templates publics : le portail aura sa propre structure d’administration et ses propres composants fonctionnels.

## Parcours utilisateur cible

1. Brice ouvre `/gestion` et voit les brouillons, publications récentes et traductions manquantes.
2. Il clique sur « Nouvelle publication ».
3. Il choisit un format avec une explication en langage courant.
4. Il rédige le titre, le résumé et le contenu dans un éditeur structuré simplifié.
5. Il ajoute éventuellement une image ou un PDF avec contrôle du format et de la taille.
6. Le portail propose automatiquement le slug, les métadonnées SEO et le temps de lecture.
7. Brice visualise la page dans le design public Premium V2.
8. Il enregistre en brouillon, crée la traduction anglaise ou publie une langue séparément.
9. Le tableau de bord indique l’état exact : brouillon, publié, traduction manquante ou dépublié.

## Écrans prévus

- Connexion : une seule entrée claire, sans exposition des détails Strapi.
- Tableau de bord : indicateurs simples, liste des publications et actions principales.
- Liste des publications : recherche, filtre par statut/type/langue, pagination et actions rapides.
- Assistant de création/édition : étapes courtes, aide contextuelle et validation progressive.
- Éditeur de contenu : blocs nommés en langage métier, déplacement simple, aperçu du résultat.
- Gestion des langues : vue FR/EN côte à côte avec état de publication de chaque version.
- Bibliothèque média : ajout d’image/PDF, aperçu, nom lisible, suppression protégée.
- Prévisualisation : rendu public exact, non indexé et réservé à l’utilisateur connecté.
- Paramètres limités : profil et déconnexion uniquement pour Brice.

## Architecture proposée

- Ajouter un portail React dédié au même projet, sous une route isolée `/gestion`.
- Ajouter des routes serveur Express protégées par session, avec appels serveur vers Strapi.
- Ne jamais exposer le token CMS au navigateur.
- Réutiliser les modèles Strapi Publication et les composants média existants.
- Réutiliser le rendu éditorial public pour garantir une prévisualisation fidèle.
- Conserver le public FR/EN, le sitemap, le RSS et les règles published-only actuels.
- Prévoir une permission éditoriale limitée aux publications et médias ; aucune permission d’administration système.
- Ajouter des journaux d’audit minimaux pour publication, dépublication et suppression.

## Direction visuelle du portail

Le portail réutilisera les tokens visuels du portfolio — palette, typographies, contrastes, rayons, bordures, espacements et principes clair/sombre — afin de rester cohérent avec l’identité Premium V2. Il ne réutilisera pas les templates de pages publiques (`home`, `parcours`, `expertises`, `formations`, `contact`) comme structure d'écran : un back office doit privilégier la lisibilité, les étapes et les actions éditoriales.

## Sécurité et confidentialité

- Session HTTP-only, SameSite et protection CSRF.
- Contrôle serveur de chaque action, même si le bouton est masqué dans l’interface.
- Aucun brouillon, média privé ou aperçu accessible sans authentification.
- Validation stricte des fichiers, taille maximale et types MIME autorisés.
- Confirmation renforcée pour dépublication et suppression.
- Aucun secret dans le frontend, le dépôt ou les paramètres URL.

## Hors périmètre

- Aucun redesign du portfolio public Premium V2.
- Aucun remplacement de Strapi ou de PostgreSQL.
- Aucun compte ou service de production créé automatiquement.
- Aucun éditeur libre non contrôlé permettant d’injecter du HTML arbitraire.
- Pas de gestion initiale des formations, de la page d’accueil ou des expertises dans le même lot, sauf décision contraire avant le plan d’implémentation.

## Approches considérées

1. **Strapi personnalisé uniquement** : moins de code, mais l’utilisateur resterait exposé à une interface technique. Non retenu.
2. **Portail éditorial dédié au-dessus de Strapi** : effort maîtrisé, expérience claire, conservation du modèle et du public existants. Retenu.
3. **Migration vers un autre CMS** : risque de migration, de régression et de perte du travail actuel. Non retenu.

## Décisions encore nécessaires avant l’implémentation

- V1 confirmée : publications uniquement ; les formations, expertises et pages de profil restent hors périmètre.
- Les médias sont remplaçables ou archivables ; la suppression définitive n'est pas proposée dans l'interface initiale.
- L'interface V1 est française ; les contenus peuvent rester bilingues FR/EN.
