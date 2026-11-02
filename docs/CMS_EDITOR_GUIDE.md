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

Le portail personnalisé est conçu comme un document bureautique : une page centrale pour rédiger, une barre d’outils pour mettre en forme et un panneau latéral pour les réglages. Les termes techniques de Strapi ne sont pas nécessaires pour le travail quotidien.

### Créer et modifier

1. Cliquer sur **Nouvelle publication**.
2. Choisir la langue, le format et la catégorie dans l’onglet **Publication**.
3. Saisir le titre, le résumé et les tags. L’adresse web, le temps de lecture et les suggestions SEO sont calculés automatiquement.
4. Rédiger dans la zone centrale comme dans un document : gras, italique, listes, liens, titres, citations et encadrés sont disponibles dans la barre d’outils.
5. Utiliser les boutons **+ Texte**, **+ Titre**, **+ Image** et **+ PDF** pour ajouter des éléments. Chaque élément peut être déplacé, dupliqué ou supprimé.
6. Ajouter une image ou un PDF depuis la médiathèque. Pour une image, le texte alternatif est obligatoire pour obtenir un contrôle SEO positif.
7. Compléter les champs d’étude dans **Options avancées** uniquement lorsque le format le nécessite : méthodologie, périmètre, limites et références.
8. Cliquer sur **Enregistrer** pour créer le premier brouillon. Ensuite, les modifications sont sauvegardées automatiquement après une courte pause ; le statut en haut de l’éditeur indique si le brouillon est enregistré ou s’il reste une action à faire.

### SEO automatique

L’onglet **SEO** présente une checklist lisible et un aperçu du résultat public. Le titre SEO et la description SEO sont proposés depuis le titre, le résumé et le contenu ; ils restent toujours modifiables. Le slug est proposé depuis le titre, et le temps de lecture est calculé depuis les blocs.

Les réglages avancés ne sont nécessaires que dans les cas particuliers : slug éditorial imposé, titre ou description SEO personnalisés, ou option **Ne pas indexer cette page**. Les balises canonical, Open Graph, Twitter, `hreflang`, sitemap, flux RSS et données structurées sont générées par le site public à partir de la publication publiée.

### Traduire et prévisualiser

1. Depuis une publication française enregistrée, ouvrir l’onglet **Traduction** puis cliquer sur **Préparer la traduction anglaise**.
2. Traduire les champs dans l’éditeur English ; les deux versions restent indépendantes afin d’éviter d’écraser une traduction relue.
3. Cliquer sur **Prévisualiser** : l’aperçu est privé et nécessite la session du portail.
4. Publier chaque langue séparément après relecture. Une modification ou une dépublication est visible sur le site sans reconstruire le frontend.

### Publier, dépublier et supprimer

- **Publier** rend la langue sélectionnée publique sans reconstruire le frontend.
- **Dépublier** retire la langue des pages publiques, du sitemap et du flux RSS.
- **Supprimer** supprime la publication et toutes ses traductions ; cette action demande confirmation.

Un brouillon n’apparaît jamais dans les pages publiques. Les recherches, filtres et pages de liste passent par l’API du portail. Le panneau **Mes publications** permet de retrouver les contenus par statut, langue, format et catégorie.

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
