# Guide éditeur — Publications Brice Merlin MIAFFO

## Démarrer le CMS en local

1. Copier `cms/.env.example` vers `cms/.env`.
2. Remplacer les valeurs `replace-with-*` par des valeurs locales fortes. Ne jamais commiter `cms/.env`.
3. Vérifier `EDITORIAL_ALLOWED_ROLES`. En local, le compte QA peut être Super Admin ; en production, créer le rôle Strapi `Editorial Editor` puis l’associer à Brice.
4. Depuis la racine :

```powershell
docker compose --env-file cms/.env -f cms/docker-compose.yml up --build -d
```

5. Ouvrir **http://127.0.0.1:1337/editorial/**.
6. Utiliser un compte local autorisé pour la QA. Aucun compte de production ne doit être inventé.

Le portail personnalisé est l’interface quotidienne. Il ne faut pas ouvrir `/admin` pour rédiger, traduire, importer un média, prévisualiser, publier ou supprimer une publication. `/admin` est réservé à la maintenance technique, aux réglages de permissions et aux opérations de secours.

La boîte locale de capture est disponible sur `http://127.0.0.1:8025`. Le test reproductible des formulaires est `npm run test:smtp` depuis la racine.

## Utiliser le portail éditorial

### Créer et modifier

1. Cliquer sur **Nouvelle publication**.
2. Choisir la langue, le format et la catégorie.
3. Saisir le titre, le résumé et les tags. Le slug est proposé automatiquement et reste modifiable.
4. Ajouter les blocs Texte, Titre, Citation, Encadré, Image et PDF.
5. Compléter les champs d’étude : méthodologie, périmètre, limites et références.
6. Renseigner les métadonnées SEO et l’image de couverture depuis la médiathèque.
7. Cliquer sur **Enregistrer le brouillon**. Le contenu peut être rouvert et modifié sans publication.

### Traduire et prévisualiser

1. Depuis une publication française enregistrée, cliquer sur **Préparer la traduction anglaise**.
2. Traduire les champs dans l’éditeur English.
3. Cliquer sur **Prévisualiser** : l’aperçu est privé et nécessite la session du portail.
4. Publier chaque langue séparément après relecture.

### Publier, dépublier et supprimer

- **Publier** rend la langue sélectionnée publique sans reconstruire le frontend.
- **Dépublier** retire la langue des pages publiques, du sitemap et du flux RSS.
- **Supprimer** supprime la publication et toutes ses traductions ; cette action demande confirmation.

Un brouillon n’apparaît jamais dans les pages publiques. Les recherches, filtres et pages de liste passent par l’API du portail.

### Médias

La médiathèque accepte les fichiers JPG, PNG, WebP, AVIF et PDF de 12 Mo maximum. Un média peut être ouvert depuis la liste ou sélectionné comme couverture/bloc. Un fichier rejeté n’est pas enregistré. Les URL brutes `/uploads/*` ne sont pas publiques ; les images et PDF publiés passent par le proxy CMS contrôlé par publication.

## Scénario QA reproductible

Le scénario suivant exige uniquement un compte local temporaire transmis par l’environnement, jamais par Git. Le rôle Strapi `Editor` est suffisant pour le portail personnalisé :

```powershell
$editorialQaEmail = 'compte-local@example.test'
$editorialQaPassword = 'mot-de-passe-local'
$env:EDITORIAL_QA_EMAIL = $editorialQaEmail
$env:EDITORIAL_QA_PASSWORD = $editorialQaPassword
npm run test:editorial:local
Remove-Item Env:EDITORIAL_QA_EMAIL,Env:EDITORIAL_QA_PASSWORD
```

Il vérifie la connexion par cookie, la création, la réouverture, les blocs, la traduction EN, l’aperçu, la publication FR/EN, la dépublication et la suppression complète.

## Sauvegarde

```powershell
./cms/scripts/backup.ps1
./cms/scripts/restore.ps1 -InputFile ./backups/brice-portfolio-YYYYMMDD-HHmmss.dump
```

Pour vérifier automatiquement un dump sans toucher à la base active :

```powershell
pwsh -NoProfile -File ./cms/scripts/verify-backup.ps1
```

PostgreSQL et les uploads doivent être sauvegardés ensemble. La restauration doit être testée sur une instance locale séparée avant toute mise en production.
