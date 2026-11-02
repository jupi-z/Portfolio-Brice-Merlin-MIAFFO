# Opérations éditoriales quotidiennes

Le portail `http://127.0.0.1:1337/editorial/` est l’interface de travail de Brice. Il est volontairement séparé de l’interface technique Strapi.

## Parcours recommandé

1. Créer un brouillon français.
2. Ajouter le contenu par blocs et les médias depuis **Médiathèque**.
3. Renseigner le SEO, les références et les champs d’étude utiles.
4. Enregistrer puis rouvrir le brouillon pour contrôler la persistance.
5. Préparer et compléter la version anglaise.
6. Prévisualiser chaque langue.
7. Publier après relecture.

## Règles simples

- Ne jamais copier de secret dans un champ éditorial.
- Ne pas publier une étude sans titre, résumé, catégorie et bloc de contenu.
- Ajouter un texte alternatif à chaque image.
- Vérifier les liens et les PDF avant publication.
- Utiliser la dépublication plutôt que supprimer lorsqu’un contenu doit être conservé.
- La suppression retire toutes les traductions du document et doit rester exceptionnelle.

## En cas de problème

- Session expirée : se reconnecter au portail ; le contenu déjà enregistré reste disponible.
- Fichier refusé : vérifier le format et la taille, puis réessayer depuis la médiathèque.
- Publication absente du site : contrôler le statut et la langue ; aucun rebuild manuel n’est requis.
- Erreur persistante : conserver l’heure et le message affiché, puis consulter les logs du conteneur CMS sans transmettre de secret.

## Rôles et accès

Le portail n’accepte que les rôles listés dans `EDITORIAL_ALLOWED_ROLES`. Le rôle `Editorial Editor` doit être créé et attribué par un administrateur technique lors de la préparation de la production. Les médias ne sont supprimables que lorsqu’ils ne sont utilisés par aucune publication, afin d’éviter de casser une page publiée.
