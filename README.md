# Portfolio Brice Merlin MIAFFO — Prototype premium V2

**Statut : prototype frontend interactif, en revue.** La branche `main` conserve la version précédente.

## Prévisualiser

Ouvrir le fichier [index.html](./index.html) dans un navigateur. Le portrait, les styles personnalisés et les scripts sont intégrés directement dans ce fichier ; les polices web et les composants daisyUI v5 sont chargés via CDN lorsqu'une connexion est disponible. Les styles de repli assurent le fonctionnement principal hors réseau.

## Fonctionnalités

- Six pages : Accueil, Parcours, Expertises, Formations, Perspectives et Contact.
- Interface éditoriale originale, responsive, modes clair et sombre persistants.
- Portrait en tenue jaune moutarde provenant d'une image précédemment fournie pour ce projet, sans filtre altérant ses couleurs.
- 12 formations nommément attribuées à Brice Miaffo dans le catalogue M-Y-M Advisor / SPE-Fin Québec 2026–2027, avec recherche, filtrage et détail.
- Formulaire qui **prépare un e-mail** et n'annonce jamais un envoi fictif.
- Les coordonnées sont à valider avant publication.
- Le site du cabinet M-Y-M Advisor n'est pas modifié.

## Technologies

HTML5, CSS3, JavaScript, [daisyUI v5](https://daisyui.com/docs/cdn/) pour les composants de base (`btn`, `input`, `select`, `textarea`, `modal`), habillage sur mesure. Un futur passage en build de production devra compiler localement les ressources au lieu du CDN.

## Validation

Le prototype a été testé sous Chromium aux résolutions 1440, 810 et 390 pixels ; aucune erreur JS et aucun débordement horizontal observés. La navigation, les filtres des 12 formations, les fiches et la bascule de thème ont été contrôlés.

**Avant déploiement** : approuver l'interface et les textes, confirmer droits du portrait, diplômes et références, préparer backend/formulaires, SEO définitif, politique de confidentialité et sous-domaine.

Sources de travail : CV Brice MIAFFO 2026 ENABEL, Catalogue Complet 2026–2027, `jupi-z/MYM-ADVISOR/src/content/brice.ts`.
