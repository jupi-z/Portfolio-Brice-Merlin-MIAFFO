# Sécurité et véracité

- `CMS_API_TOKEN` est lu uniquement par Express.
- PostgreSQL est sur un réseau Docker privé et n’a pas de port publié.
- Les routes publiques CMS imposent `status=published` côté contrôleur.
- Le serveur revalide le type, la locale, le slug, la date de publication et les blocs avant rendu.
- Les blocs éditoriaux sont rendus depuis des champs structurés et échappés ; le HTML arbitraire n’est pas accepté.
- Les fichiers téléchargés sont limités par taille et type dans le schéma CMS et l’upload local.
- Le formulaire contact conserve validation, limite de taille, honeypot, limitation par IP et confirmation SMTP avant succès.
- Aucun secret, token, base, upload ou `.env` ne doit être commité.
- Les logs SMTP ne contiennent que le message d’erreur fournisseur, jamais le nom, l’email ou le contenu du demandeur.
- Les textes métier, diplômes, contacts, droits d’images, mentions légales et traductions doivent être validés humainement avant publication.
