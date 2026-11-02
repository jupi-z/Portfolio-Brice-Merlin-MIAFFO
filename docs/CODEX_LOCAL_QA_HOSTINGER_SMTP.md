
# CODEX — Stabilisation intégrale locale, préproduction et SMTP Hostinger

**Date : 2026-11-02 — Priorité actuelle du propriétaire.**
**Statut : instruction normative à exécuter, pas un rapport de tests.**

## 0. Objectif et limites impératives

Transformer le code V2.1 existant en un système réellement opérationnel, robuste et testé **de bout en bout, en local** : site React/Express, blog Strapi 5, PostgreSQL, publication FR/EN, données, médias, formulaires et messagerie **préconfigurée pour Hostinger**.

- Le propriétaire **créera lui-même les vrais comptes et secrets de production lorsque le système sera prêt à être déployé**. Ne créer ni compte, boîte mail ni token réel de production ; ne pas demander les identifiants Hostinger à ce stade.
- On peut utiliser **des identités de test temporaires exclusivement locales**, des secrets de développement forts et les outils de capture SMTP locale, sans expédier de vrais messages ni mélanger les bases de test et de production. Nettoyer les données après les tests ; ne jamais commiter les identifiants ni les sauvegardes contenant des secrets.
- Ne pas changer DNS, serveur de production, accès externe, sous-domaine public ou dépôt MYM-ADVISOR. Ne pas fusionner dans `main` avant autorisation. Conserver **à l'identique le design V2 Premium**, le portrait, le responsive, le mode sombre et les textes confirmés.
- **Toutes les réalisations, scripts, tests et procédures doivent être ajoutés au dépôt GitHub** `jupi-z/Portfolio-Brice-Merlin-MIAFFO`, depuis `feature/portfolio-v2-1-fr-en` (ou branche dérivée avec PR adaptée), commitées et poussées. Préserver les changements locaux non commitées ; ne pas forcer les pushs. Mettre à jour la PR #1 et son statut de brouillon.
- Lire d'abord `AGENTS.md`, `docs/CODEX_IMPLEMENTATION_MISSION.md`, `docs/QA_REPORT.md`, `docs/SECURITY.md`, `docs/CMS_EDITOR_GUIDE.md`, `docs/DEPLOYMENT.md`, `docs/DESIGN_LOCK.md`, puis vérifier Git et exécuter le socle de tests.
- Objectif "100 % de l'existant" = **aucune fonctionnalité déclarée terminée sans preuve de son bon fonctionnement dans le périmètre testable et sans secrets de production**. Signaler les tests qui nécessitent un vrai domaine/compte au lieu de déclarer 100 % en production.

## 1. Audit initial et reproductibilité

1. Vérifier `git status`, branche, refs distantes, configuration locale, PR, Node/npm, Docker Engine, Compose, ports ; ne pas supprimer les données de travail de l'utilisateur.
2. Lancer une **installation propre** frontend + CMS avec lockfiles, typecheck, tests, builds, CI, commandes de lancement et arrêt reproductibles sous Windows/PowerShell et sous Linux si pertinent. Documenter les versions réellement vérifiées.
3. Déployer le stack local PostgreSQL/Strapi/Express et la capture SMTP via Docker ; ajouter scripts `dev:stack`, `test:integration`/équivalents cohérents avec le projet pour que la procédure soit reproductible après redémarrage, sans exposer PostgreSQL.
4. Vérifier readiness/health, connexion DB, migrations, cycle restart, arrêt propre, logs sans secret, erreurs de port, mode dev vs production. Les erreurs de configuration doivent être explicites, jamais silencieuses.
5. Revoir les caveats périmés du README et documenter l'architecture effective ; garantir que les résultats de tests sont reproductibles sans dépendre d'une session Codex.

## 2. SMTP : fournisseur visé Hostinger, validation locale sans vrai compte

**Ne pas supposer quel service e-mail Hostinger est associé au domaine.** Les paramètres sont différents :

- **Hostinger Email** : `smtp.hostinger.com`, port `465` avec SSL/TLS implicite ; alternative `587` en STARTTLS si nécessaire.
- **Titan Email vendu via Hostinger** : `smtp.titan.email`, port `465` SSL/TLS ou `587` STARTTLS.
- Paramètres officiels : https://www.hostinger.com/support/1575756-how-to-get-email-account-configuration-details-for-hostinger-email/ et https://support.hostinger.com/en/articles/5966022-how-to-get-email-account-configuration-details-for-titan-email
- L'adresse utilisateur SMTP est **l'adresse entière de la boîte** ; le secret est **celui de la boîte mail**, pas l'authentification Hostinger hPanel ; vérifier les détails exacts dans l'espace Hostinger seulement à la mise en production.

**À implémenter maintenant :**

1. Ajouter un mode transport SMTP explicite configurable pour **Hostinger Email / Titan Email / capture locale** (soit un profil sûr, soit uniquement des variables standard validées), en préservant compatibilité avec `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`, `CONTACT_TO`, `ALLOWED_ORIGIN`. Documenter le port, `secure=true` pour 465, `secure=false` + STARTTLS requis pour 587, timeout, vérification de certificat et absence de fallback non chiffré. Ne jamais mettre `rejectUnauthorized:false`.
2. Séparer les identifiants de l'expéditeur (`SMTP_USER` / `SMTP_FROM`) et la réponse du visiteur (`replyTo`) ; ne pas permettre au formulaire de forger l'adresse expéditrice. Les valeurs `SMTP_FROM` et `CONTACT_TO` restent des **placeholders**, pas d'adresse inventée.
3. Vérifier **les formulaires du site FR/EN** avec un **service SMTP local de capture** (Mailpit/MailHog ou équivalent) : succès serveur seulement après acceptation SMTP, présence du nom, objet, langue et contenu, encodage UTF-8, Reply-To, HTML+texte, test d'envoi FR/EN, absence de doublons accidentels, erreur de connexion, timeout, erreur d'auth, erreur SMTP 4xx/5xx, serveur non configuré et messages utilisateur pertinents.
4. Tester les validations : champs manquants, mail incorrect, tailles limites, caractères spéciaux, injection HTML et entêtes, CSRF/Origin selon architecture, anti-spam/honeypot, rate-limiting et gestion derrière reverse proxy. **Le honeypot peut renvoyer une réponse neutre aux bots** mais jamais une preuve de remise pour un utilisateur légitime. Pas de log de données personnelles, mots de passe ou contenu des e-mails.
5. Ajouter des tests API/transport automatisés déterministes et lancer les tests E2E de formulaires avec une boîte de capture **sans envoyer de mail réel** ; renseigner les résultats exacts, identifiants de tests anonymisés et limitations.
6. Vérifier également les **e-mails transactionnels Strapi** (invitation admin, réinitialisation de mot de passe, si disponibles et requis), en configurant un fournisseur SMTP compatible et testé via capture locale ; ne pas seulement traiter l'API Express. Le cas échéant, documenter une limite explicite si une fonctionnalité n'est pas prise en charge par l'édition installée.
7. Fournir des fichiers `.env.example` complets pour le serveur et `cms/`, un guide Hostinger pas-à-pas de bascule **sans secrets**, ainsi qu'une checklist des vérifications DNS **SPF/DKIM/DMARC/MX** en précisant que les enregistrements exacts doivent être relevés dans le panneau du service mail choisi ; ne pas inventer d'enregistrements ni modifier le DNS maintenant.
8. Fournir une vérification future de connexion/émission réelle (étape production bloquée par la création de la boîte et les secrets) clairement distincte des tests SMTP simulés localement.

## 3. Administration CMS, permissions et cycle éditorial complet

1. Tester **depuis l'interface graphique Strapi**, pas seulement via le Document Service : ouverture de `/admin`, création d'un **administrateur local de développement temporaire**, création d'un éditeur local (si autorisé dans l'édition installée), connexion/déconnexion, droits minimaux et refus d'accès hors permissions. Ne pas générer les futurs comptes de Brice ; documenter les étapes de création à réaliser au moment de la mise en production.
2. Publier des contenus de test **FR et EN liés** de chacun des types éditoriaux : article, étude/rapport, note, étude de cas, guide, intervention. Utiliser des valeurs manifestement fictives ("DEMO TEST") jamais présentées comme des réalisations de Brice.
3. Pour chacun : créer, éditer, sauvegarder, prévisualiser dans un contexte authentifié sans fuite des brouillons, publier FR seulement, publier EN, corriger, dépublier une langue, republier, supprimer ; vérifier le rendu sur le site sans `npm run build` à chaque changement.
4. Tester tous les composants de contenu configurés : titres, paragraphes, images, citation, encadré, tableau, téléchargement ; **réel upload PDF/image**, accès, alt text, métadonnées, taille/MIME, erreurs de fichiers interdits, insertion dans les pages, nettoyage et restitution correcte après redémarrage.
5. Tester par une requête anonyme que ni brouillons, ni versions non publiées, ni documents non autorisés, ni endpoints d'administration ne sont accessibles publiquement. **Attention** : le fait de masquer un brouillon dans les API ne rend pas automatiquement un fichier téléversé confidentiel ; ne pas placer de fichiers confidentiels dans l'upload public avant un vrai dispositif d'accès sécurisé.
6. Vérifier le token CMS à privilèges minimaux stocké côté serveur Express uniquement, le chemin de lecture et la séparation des environnements, le CORS et la configuration de Strapi ; documenter comment le propriétaire configurera les rôles et secrets **plus tard**.
7. Vérifier persistence PostgreSQL + médias, restaurations qui conservent cohérence documents/fichiers, reprise après redémarrage et scénario de rollback. Sauvegardes réellement éprouvées, protégées et non commitées.
8. Nettoyer les publications de test et comptes locaux temporaires selon une procédure sûre ; **ne jamais effacer de données existantes inconnues** ou personnelles sans sauvegarde/consentement.

## 4. Audit fonctionnel public complet (V2 Premium et nouvelles pages)

1. Parcourir les 6 pages historiques et les **12 formations** sur desktop, tablette et mobile, FR/EN, thème clair/sombre ; tester navigation clavier, boutons, liens, recherches/filtres, modales, validation de formulaire, menu mobile, retour arrière et changement de langue en conservant la page.
2. Parcourir la **liste des publications et une fiche complète** dans les mêmes conditions ; le SSR éditorial doit réellement conserver la cohérence V2 Premium (navigation mobile, sélecteur FR/EN, commutateur de thème, style, responsive et accessibilité). Le code actuel de `server/editorial-pages.mjs` rend un en-tête distinct de React : vérifier son comportement et corriger tout écart ; ne pas refaire la direction artistique.
3. Tester recherche par titre, filtres catégories/tags/types, pagination et cas extrêmes (zéro article, 1, 9, >24, >100, pages suivantes, très longs titres, accents, slugs FR/EN différents), absence de résultats, pagination CMS et stabilité des liens. Vérifier spécifiquement `server/publications.mjs` et `server/index.mjs` : le code actuel borne `pageSize` à 24 et le sitemap demande 100 ; vérifier que **tous** les contenus publiés figurent dans le sitemap via pagination, sans fuite de brouillons.
4. Tester les **images et documents** du CMS en rendu réel : URL absolues/relatives, proxy/CDN et politique CSP. Vérifier `populate` des médias dans les blocs et les relations Strapi 5 ; s'assurer que les assets sont affichés et téléchargés après redémarrage et sous deux langues.
5. Tester contexte du changement de langue d'une fiche : mène à la traduction réellement publiée, sinon lien de retour raisonnable ; **pas de 404 ni de traduction inventée** ; configurer `hreflang` et canonical sur fiches et listings correctement.
6. SEO : HTML SSR réellement visible sans exécution JS, titres/descriptions, robots, `noindex` éditorial, données structurées valides (Article/Report), canonical, `hreflang`, Open Graph/Twitter images, liens absolus, sitemap XML paginé et flux RSS. Tester publication/dépublication et mise à jour **sans rebuild**.
7. Tester accessibilité minimale (clavier, focus, contrastes, images/alt, légendes, dialogues, aria) et mesures de performance (LCP, CLS, poids des assets, cache et timeouts) avec outils disponibles. Corriger les vrais défauts et documenter toute limite de l'environnement.
8. Inspecter liens de contact existants, numéro, adresse e-mail, diplômes, expériences, traductions, droit au portrait et contenus de la partie formation : marquer les données non validées comme "validation client requise" dans un registre de publication, **ne jamais remplacer par des affirmations inventées**.

## 5. Sécurité, résilience, fiabilité

- Vérifier contrôle d'accès sur les routes CMS, tokens, CORS, rate limit robuste derrière proxy, XSS, HTML échappé, URL non sûres, SSRF éventuelle, injections dans recherches/slugs, upload, gestion d'erreurs sans divulgation de secrets et headers HTTP/CSP.
- Verrouiller le CMS d'admin hors exposition Internet pendant les essais ; PostgreSQL non publié ; fichiers `.env`, médias privés, dumps et credentials ignorés par Git. Auditer l'historique récent pour secrets accidentels et signaler toute exposition sans diffuser les valeurs.
- Exécuter `npm audit` à la racine et dans `cms/`, classer les alertes par vulnérabilité réellement applicable, correctif compatible et risque résiduel ; **aucun `--force` non maîtrisé**.
- Ajouter des tests de régression automatisés pour les bugs corrigés, faire tourner le pipeline GitHub Actions comprenant (autant que possible) **tests frontend, API, CMS, SMTP local, build, lint/typecheck et migrations de test** ; aucun test ne doit dépendre d'une boîte ou d'un domaine de production.
- Tester démarrage sans CMS, CMS lent, panne PostgreSQL, reprise, indisponibilité SMTP, JSON invalide, burst de requêtes, reboot Docker. Le site public doit dégrader proprement ses fonctionnalités sans déclarer des actions réussies à tort.

## 6. Documentation, livrables GitHub, critères d'acceptation

Livrer dans GitHub (ne pas fournir seulement un rapport de chat) :

1. **Procédure de développement reproductible** Windows/PowerShell et commandes Node/Docker : initialisation, lancement, arrêt, migrations, restauration, nettoyage données démo, captures SMTP, endpoints de santé et logs.
2. **Guide Hostinger SMTP** avec les deux fournisseurs possibles, ports/chiffrement, placeholders `.env`, démarches de configuration réelle **à faire ultérieurement**, DNS SPF/DKIM/DMARC, test réel à effectuer lorsque le propriétaire créera la boîte.
3. **Guide Strapi éditeur FR/EN** illustrant publication, traduction, images, fichiers, rôles, sauvegarde, prévisualisation et suppression, sans secrets ni données privées.
4. **Matrice QA exhaustive** dans `docs/QA_REPORT.md` ou nouveau rapport : cas de test, commandes, environnement, résultat observé, lien vers script/test/capture si possible ; catégories **PASS / FAIL / NON TESTÉ (dépendance externe)** ; pas de "100%" non justifié.
5. **Checklist de mise en production** uniquement **préparée** : DNS/HTTPS, serveur Node, Strapi/PostgreSQL, secrets, mailbox Hostinger, serveur SMTP, domaines, compte administrateur réel Brice, consentement photo/publications, validation juridique, monitoring, sauvegardes, tests de réception et rollback.
6. **Preuves GitHub :** commits atomiques poussés sur branche distante, CI passée et PR #1 mise à jour avec statut honnête. Ne pas merger `main` ni déployer sans autorisation.

**Définition de terminé à ce stade :** toutes les fonctions localement testables du site, blog, API, DB, administration et transport SMTP local ont été vérifiées de bout en bout, les bugs connus corrigés, et les résultats versionnés. La vraie délivrabilité Hostinger, création des comptes réels, domaine, approbations juridiques et déploiement sont **explicitement différés** par le propriétaire. Les points non testables sont documentés comme tels ; aucune promesse de 100 % en production.

## 7. Synthèse demandée à Codex

Exécuter réellement, sans s'arrêter à la rédaction d'un plan. À la fin, ne transmettre qu'un compte rendu bref : numéro du dernier commit poussé, état de la PR/CI, tests PASS/FAIL, fonctionnalités validées en interface graphique, bugs corrigés, alertes résiduelles et actions qui exigeront plus tard l'intervention du propriétaire. Écrire tous les détails dans GitHub.
