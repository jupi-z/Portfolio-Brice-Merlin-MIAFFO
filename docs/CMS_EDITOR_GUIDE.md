# Guide éditeur — Publications Brice Merlin MIAFFO

## Démarrer le CMS en local

1. Copier `cms/.env.example` vers `cms/.env`.
2. Remplacer toutes les valeurs `replace-with-*` par des valeurs locales fortes. Ne jamais commiter `cms/.env`.
3. Depuis la racine (PostgreSQL, Strapi et Mailpit) :

```powershell
docker compose --env-file cms/.env -f cms/docker-compose.yml up --build -d
```

4. Ouvrir `http://127.0.0.1:1337/admin` et créer le premier administrateur.
5. Dans Settings > Global Settings > Internationalization, vérifier les locales `fr` et `en`.
6. Dans Settings > Users & Permissions, créer un rôle éditeur limité à Publication et Media.
7. Créer un token API de lecture uniquement, limité à `Publication.find` et `Publication.findOne`, puis placer sa valeur dans `CMS_API_TOKEN` du `.env` racine du serveur public.

La boîte locale de capture est disponible sur `http://127.0.0.1:8025`. Elle ne délivre aucun message vers Internet. Vérifier la connexion et l'envoi de test dans Settings > Email plugin > Configuration.

Le test reproductible des formulaires est `npm run test:smtp` depuis la racine. Il exige Mailpit démarré, capture un message français et un message anglais, contrôle les sujets puis supprime les messages de test.

## Créer et publier une publication

Dans Content Manager > Publication :

1. Choisir le type éditorial, le titre, le slug, le résumé, la catégorie et le temps de lecture.
2. Composer le contenu avec les blocs Heading, Rich text, Image, Quote, Callout, Table ou Download.
3. Renseigner l’alt text de chaque image et ne téléverser que des fichiers autorisés et utiles.
4. Enregistrer le français comme brouillon, puis créer la localisation anglaise dans la même entrée.
5. Vérifier les métadonnées SEO et les champs d’étude/cas lorsque pertinents.
6. Prévisualiser localement, demander la relecture humaine, puis publier séparément chaque langue.

Un brouillon n’apparaît ni dans la liste publique, ni dans les recherches, ni dans le sitemap, ni dans le flux RSS. Une traduction non publiée n’est pas proposée comme lien alternatif.

## Sauvegarde

```powershell
./cms/scripts/backup.ps1
./cms/scripts/restore.ps1 -InputFile ./backups/brice-portfolio-YYYYMMDD-HHmmss.dump
```

Les volumes PostgreSQL et les uploads doivent être sauvegardés ensemble. PostgreSQL reste sur le réseau Docker privé et n’est pas publié sur Internet.

Les scripts de sauvegarde/restauration utilisent le flux binaire PowerShell 7 et ciblent explicitement `cms/.env` et `cms/docker-compose.yml`. Ils ont été vérifiés localement avec un dump PostgreSQL non conservé dans Git.
