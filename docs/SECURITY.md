# Sécurité et véracité

- `CMS_API_TOKEN` est lu uniquement par Express.
- PostgreSQL est sur un réseau Docker privé et n’a pas de port publié.
- Les routes publiques CMS imposent `status=published` côté contrôleur.
- Le serveur revalide le type, la locale, le slug, la date de publication et les blocs avant rendu.
- Les blocs éditoriaux sont rendus depuis des champs structurés et échappés ; le HTML riche du nouvel éditeur est limité à une liste de balises et d’URL sûres côté serveur, avec attributs d’événements supprimés.
- Les fichiers téléchargés sont limités par taille, extension et type MIME dans le portail et Strapi ; la limite par défaut est de 12 Mo.
- Les fichiers d’upload bruts `/uploads/*` sont bloqués ; un média n’est servi publiquement que par le proxy `public-media/:id` lorsqu’il est référencé par une publication publiée. Les fichiers de brouillon et les médias orphelins restent privés.
- Le portail éditorial utilise une session serveur avec cookies `HttpOnly`, `SameSite=Lax` et expiration ; aucun JWT administrateur n’est stocké dans le navigateur.
- Les routes quotidiennes du portail sont protégées par validation de session et ne dépendent pas de l’interface frontend Strapi.
- Les routes éditoriales exigent un rôle autorisé par `EDITORIAL_ALLOWED_ROLES` ; le rôle Strapi `Editor` existant fonctionne en local, tandis que `Editorial Editor` est le rôle recommandé pour la production, sans privilèges techniques inutiles.
- Les uploads du portail acceptent uniquement JPG, PNG, WebP, AVIF et PDF, avec une limite de 12 Mo par fichier.
- Les erreurs affichées par le portail sont écrites avec `textContent` afin de ne pas injecter de HTML provenant de l’API ou des noms de fichiers.
- L’autosauvegarde ne s’exécute que pour un brouillon déjà créé et conserve l’état local si la requête échoue ; le premier enregistrement reste explicite.
- Le formulaire contact conserve validation, limite de taille, honeypot, limitation par IP et confirmation SMTP avant succès.
- Aucun secret, token, base, upload ou `.env` ne doit être commité.
- Les logs SMTP ne contiennent que le message d’erreur fournisseur, jamais le nom, l’email ou le contenu du demandeur.
- Les textes métier, diplômes, contacts, droits d’images, mentions légales et traductions doivent être validés humainement avant publication.
