# Conception — éditeur éditorial type Office et SEO automatisé

## Intention

Transformer le portail éditorial personnalisé en un espace de rédaction familier pour un utilisateur non technique. Brice doit pouvoir rédiger, mettre en forme, illustrer, traduire, prévisualiser et publier une publication sans devoir comprendre Strapi, les composants, les slugs ou les métadonnées SEO.

Le périmètre concerne uniquement l’expérience du back-office personnalisé. Le design Premium V2, les routes publiques, le rendu éditorial et les contrats de données existants restent préservés.

## Objectifs

- Remplacer le formulaire à champs successifs par une surface de rédaction centrale inspirée des usages Word/Office.
- Fournir une barre d’outils claire pour le formatage courant et un menu d’insertion pour les éléments avancés.
- Permettre le déplacement, la suppression et la réédition des blocs sans manipulation technique.
- Sauvegarder automatiquement les brouillons et afficher clairement leur état.
- Réduire au minimum les réglages SEO manuels tout en conservant un panneau d’options avancées.
- Conserver les publications déjà créées, leurs traductions, médias et URLs.
- Garder le portail indépendant de l’interface frontend Strapi pour l’usage quotidien.

## Hors périmètre

- Aucun redesign du site public Premium V2.
- Aucun remplacement de PostgreSQL, Strapi ou du modèle de publication.
- Aucune création de compte ou de service de production.
- Aucune génération automatique de contenu éditorial ou de traduction sans validation humaine.

## Approches étudiées

### A — Éditeur document central avec blocs structurés (retenue)

Une zone de rédaction principale présente le contenu dans l’ordre de lecture. Une barre d’outils et un menu d’insertion créent les blocs structurés déjà supportés par le site : texte, titre, citation, encadré, tableau, image et PDF. Un panneau latéral regroupe les propriétés de publication, la traduction et le SEO.

Cette approche apporte les habitudes Office attendues sans migration du modèle Strapi. Elle limite le risque de régression et permet de rendre progressivement les contenus existants éditables.

### B — Formulaire actuel simplement remaquillé

Cette option serait plus rapide mais conserverait la logique de champs techniques et les nombreux clics. Elle ne répond pas au besoin de rédaction familière et n’est donc pas retenue.

### C — Bibliothèque d’éditeur riche externe avec migration complète

Une bibliothèque spécialisée pourrait offrir davantage de raccourcis et de comportements natifs, mais ajouterait une dépendance, une migration de format et un risque de divergence entre l’éditeur, le SSR et les publications existantes. Elle pourra être réévaluée si l’option A atteint une limite réelle.

## Expérience cible

### Surface principale

- Barre supérieure : retour, statut du brouillon, dernière sauvegarde, prévisualisation et action de publication.
- Barre d’outils : paragraphe, titres, gras, italique, listes, lien, citation, encadré, tableau, image et document.
- Document central lisible, avec blocs visuellement proches du rendu public.
- Bouton d’insertion entre les blocs et raccourci `/` pour rechercher un type de contenu.
- Chaque bloc possède des actions discrètes : déplacer vers le haut/bas, dupliquer, supprimer.
- Les champs secondaires sont masqués par défaut et accessibles au bon moment.

### Panneau latéral

Onglets simples :

- **Publication** : langue, format, catégorie, tags, date, mise en avant et autorisation.
- **Traduction** : état FR/EN, création de la version anglaise et indication de synchronisation.
- **SEO** : score lisible, aperçu Google/réseaux sociaux et options avancées.

### Brouillons et autosauvegarde

- Le premier enregistrement crée le brouillon avec le slug généré.
- Après une modification, une sauvegarde différée est déclenchée automatiquement lorsque l’utilisateur cesse de saisir.
- L’utilisateur peut toujours forcer « Enregistrer maintenant ».
- L’interface indique `Modifications non enregistrées`, `Enregistrement…`, `Brouillon enregistré` ou `Erreur — réessayer`.
- Une protection contre la fermeture avec modifications non enregistrées est ajoutée.
- Les erreurs d’authentification renouvellent la session puis reprennent l’enregistrement sans perdre les champs locaux.

## Automatisation SEO

- Slug généré depuis le titre tant que l’utilisateur ne l’a pas explicitement personnalisé.
- Temps de lecture calculé à partir du nombre de mots, avec possibilité de correction exceptionnelle dans les options avancées.
- Résumé suggéré depuis le premier contenu significatif, toujours validable et modifiable.
- Titre SEO proposé depuis le titre éditorial et limité à une longueur lisible.
- Description SEO proposée depuis le résumé et limitée à une longueur adaptée.
- Texte alternatif obligatoire pour les images publiées ; proposition basée sur le contexte, avec validation humaine.
- Canonical, `hreflang`, sitemap, RSS et JSON-LD générés côté serveur à partir de la publication publiée.
- Les contrôles vérifient automatiquement : titre, résumé, longueur, slug, image, alt, liens, traduction et indexabilité.
- Les réglages `noIndex`, titre SEO, description SEO et image sociale restent disponibles dans « Options avancées ».
- Aucun secret, jeton ou réglage SEO serveur n’est exposé au navigateur.

## Compatibilité de données

L’éditeur continue d’écrire les champs actuels de `publication` et les composants structurés existants. La nouvelle surface convertit les éléments visuels en ces mêmes blocs avant l’appel API. Le serveur reste l’autorité pour la validation, la publication, les relations FR/EN, la confidentialité des médias et le SEO public.

Les contenus existants sont ouverts dans l’éditeur avec une conversion réversible vers la nouvelle surface. Aucun champ inconnu n’est supprimé lors d’une modification partielle.

## Vérifications prévues

- Tests unitaires de génération de slug, temps de lecture, suggestions SEO, sérialisation et désérialisation des blocs.
- Test d’autosauvegarde, reprise après erreur réseau, renouvellement de session et avertissement de sortie.
- Test de création et modification FR, traduction EN, prévisualisation, publication et dépublication.
- Test des blocs texte, titres, listes, liens, citation, encadré, tableau, image et PDF.
- Test de non-régression sur les publications déjà présentes et leurs URLs publiques.
- Test des métadonnées, canonical, `hreflang`, sitemap, RSS, JSON-LD et `noIndex`.
- Vérification visuelle desktop, tablette, mobile, mode clair et mode sombre du portail.
- Compilation, tests automatisés, scénario local complet et audit de sécurité avant commit.

## Décisions d’implémentation

- Le stockage reste Strapi/PostgreSQL.
- Le portail reste servi depuis Strapi, avec session HttpOnly existante.
- L’éditeur sera construit dans les fichiers du portail personnalisé avant d’introduire une dépendance externe.
- Les champs techniques seront regroupés dans des sections secondaires plutôt que supprimés du modèle.
- Toute automatisation restera explicable et modifiable par Brice.
