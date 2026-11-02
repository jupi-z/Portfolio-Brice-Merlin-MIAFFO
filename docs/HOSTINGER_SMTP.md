# SMTP Hostinger — préparation sans secrets

Le code utilise Nodemailer et ne dépend d'aucun fournisseur particulier. En local, le profil `mailpit` capture les messages sur `127.0.0.1:1025`. En production, seuls les variables d'environnement changent.

## Profils prêts

| Service | `SMTP_HOST` | Port 465 | Port 587 |
|---|---|---|---|
| Hostinger Email | `smtp.hostinger.com` | `SMTP_SECURE=true`, TLS implicite | `SMTP_SECURE=false`, `SMTP_REQUIRE_TLS=true` |
| Titan Email | `smtp.titan.email` | `SMTP_SECURE=true`, TLS implicite | `SMTP_SECURE=false`, `SMTP_REQUIRE_TLS=true` |

Dans les deux cas, `SMTP_USER` est l'adresse complète de la boîte et `SMTP_PASS` son mot de passe. `SMTP_TLS_REJECT_UNAUTHORIZED` doit rester à `true`. Les timeouts sont configurables par `SMTP_CONNECTION_TIMEOUT_MS`, `SMTP_GREETING_TIMEOUT_MS` et `SMTP_SOCKET_TIMEOUT_MS`.

## Mise en service future

1. Créer la boîte et récupérer les paramètres dans le panneau Hostinger/Titan.
2. Configurer SPF, DKIM et DMARC selon les enregistrements fournis par le panneau choisi; ne pas copier de valeurs génériques.
3. Renseigner les variables dans le gestionnaire de secrets du serveur, jamais dans Git.
4. Tester d'abord avec une adresse de réception contrôlée, puis vérifier la réception réelle, les en-têtes SPF/DKIM/DMARC et les erreurs de rejet.
5. Configurer les mêmes variables dans `cms/.env` pour les invitations et réinitialisations Strapi.

Aucune boîte, aucun identifiant et aucun test de livraison Internet n'est créé dans la phase locale.

Références fournisseurs : [Hostinger Email](https://support.hostinger.com/en/articles/1583227-how-to-use-a-free-email-service), [paramètres SMTP Hostinger](https://support.hostinger.com/en/articles/4762447-how-to-use-a-free-email-service), [Titan Email](https://support.hostinger.com/en/articles/6307615-how-to-set-up-titan-email-on-an-email-client).
