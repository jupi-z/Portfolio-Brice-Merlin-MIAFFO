# Portfolio — Brice Merlin MIAFFO

Portfolio personnel professionnel de Brice Merlin MIAFFO, pensé pour un futur sous-domaine du cabinet M-Y-M Advisor.

## État du projet (02 novembre 2026)

**Prototype interactif V1 — direction visuelle et éditoriale.** Ce n'est pas encore une version de production.

- `index.html` : prototype autonome (HTML/CSS/JavaScript), sans dépendance d'exécution.
- Navigation entre six vues : Accueil, Parcours, Expertises, Formations, Perspectives et Contact.
- Douze formations explicitement attribuées à Brice Miaffo dans le catalogue 2026–2027 ; filtre par domaine et fiches dépliables.
- Responsive testé aux largeurs 390, 768 et 1440 px ; menu mobile, navigation et filtres fonctionnels.
- La prise de contact utilise volontairement `mailto:`. Aucun formulaire fictif n'annonce un message envoyé.

## Démarrage

Ouvrir `index.html` dans le navigateur, ou le servir depuis un serveur statique. Les liens internes du prototype utilisent le fragment d'URL (`#/accueil`, etc.) pour fonctionner même sans serveur.

## Portrait officiel

L'emplacement du portrait est prévu dans `assets/brice-miaffo.png`. Le dépôt privé `jupi-z/MYM-ADVISOR` contient une photographie décrite comme officielle à `public/images/brice-miaffo.png`. **Cette photographie n'a pas été copiée dans ce dépôt** : il faudra obtenir ou exporter les octets originaux avec les permissions appropriées et confirmer la réutilisation.

Si le portrait est absent, un traitement typographique `BM` est utilisé comme repli.

## Sources & limites éditoriales

- `CV Brice MIAFFO 2026 ENABEL.docx` (fourni dans la conversation).
- `Catalogue_Complet_2026-2027ok (1).pdf` (catalogue M-Y-M Advisor / SPE-Fin Québec 2026–2027, fourni dans la conversation).
- `jupi-z/MYM-ADVISOR/src/content/brice.ts` et `docs/brice-miaffo-editorial-review.md`.

Le catalogue collectif propose 36 formations, mais le portfolio n'attribue personnellement à Brice Miaffo que les numéros **1, 2, 3, 8, 9, 10, 11, 12, 24, 34, 35 et 36** explicitement crédités à son nom.

**Avant publication :** valider avec l'intéressé les dates, l'intitulé des diplômes, le statut de la formation en IA, les chiffres de performance, les droits des visuels, les contacts à exposer et le circuit des demandes commerciales. Le catalogue original est signalé confidentiel ; ne pas le publier directement.

## Limites techniques V1

Ce prototype n'a ni gestion de contenu, ni backend, ni formulaire serveur, ni pipeline CI/CD, ni variantes linguistiques complètes, ni déploiement DNS. Une phase d'industrialisation suivra l'approbation de la direction artistique et du contenu.

Le dépôt `jupi-z/MYM-ADVISOR` demeure indépendant et n'est pas modifié par cette première version.
