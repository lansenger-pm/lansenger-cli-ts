[English](README.md) | [简体中文](README.zhHans.md) | [繁体中文](README.zhHant.md) | [繁体中文香港](README.zhHantHK.md) | [Français](README.fr.md)

# Lansenger CLI (TypeScript)

Outil en ligne de commande Lansenger — interagissez avec les API Lansenger directement depuis le terminal : envoyez des messages, gérez des groupes, interrogez le personnel/les départements, gérez les calendriers et les tâches, et plus encore.

La syntaxe des commandes est identique aux versions Python et Go. Installez n'importe laquelle.

## Installation

```bash
npm install -g lansenger-cli
```

Ou compiler depuis les sources :

```bash
git clone https://github.com/lansenger-pm/lansenger-cli-ts.git
cd lansenger-cli-ts
npm install
npm run build
npm link
```

Nécessite Node.js ≥ 18.0.0.

## Démarrage rapide

### 1. Configurer les identifiants

Sauvegardez les identifiants via `config set` (stockés par profil dans `~/.lansenger/sdk_state.json`, clés masquées, permissions fichier 0600) :

```bash
lansenger config set app_id YOUR_APP_ID
lansenger config set app_secret YOUR_APP_SECRET
lansenger config set api_gateway_url https://apigw.lx.qianxin.com/open/apigw
```

**Authentification OAuth2 (remplissez si vous avez besoin d'un userToken)** :

```bash
lansenger config set passport_url https://passport.lx.qianxin.com
lansenger config set redirect_uri http://localhost:8765   # URI de redirection OAuth2 (défaut)
```

**Réception des callbacks (remplissez si vous devez analyser/vérifier les webhooks)** :

```bash
lansenger config set encoding_key YOUR_ENCODING_KEY
lansenger config set callback_token YOUR_CALLBACK_TOKEN
```

Vous pouvez également configurer via les variables d'environnement (compatible CI/CD) :

```bash
export LANSENGER_APP_ID=YOUR_APP_ID
export LANSENGER_APP_SECRET=YOUR_APP_SECRET
export LANSENGER_ENCODING_KEY=YOUR_ENCODING_KEY
export LANSENGER_CALLBACK_TOKEN=YOUR_CALLBACK_TOKEN
```

### 2. Voir la configuration

```bash
lansenger config show
```

### 3. Vérification de santé

```bash
lansenger health check
```

## Aperçu des commandes

| Groupe | Description | Sous-commandes |
|--------|------|--------|
| `config` | Gérer les identifiants | `set`, `show`, `clear`, `list-profiles`, `delete-profile`, `list-users` |
| `message` | Envoyer et gérer les messages | `send-text`, `send-markdown`, `send-file`, `send-image-url`, `send-link-card`, `send-app-articles`, `send-app-card`, `send-oacard`, `send-bot-message`, `send-group-message`, `send-account-message`, `send-user-message`, `update-dynamic-card`, `revoke`, `query-groups`, `send-reminder` |
| `group` | Gérer les groupes | `create`, `info`, `members`, `list`, `check`, `update`, `update-members`, `dismiss` |
| `staff` | Interroger le personnel | `basic-info`, `detail`, `ancestors`, `id-mapping`, `org-extra-fields`, `search`, `org-info` |
| `department` | Interroger les départements | `detail`, `children`, `staffs` |
| `calendar` | Calendrier et planification | `primary`, `create-schedule`, `fetch-schedule`, `delete-schedule`, `list-schedules`, `attendees`, `add-attendees`, `delete-attendees`, `update-schedule`, `attendee-meta` |
| `todo` | Gestion des tâches | `create`, `update`, `update-status`, `delete`, `list`, `fetch-by-id`, `fetch-by-source`, `status-counts`, `executor-status`, `add-executors`, `delete-executors`, `executor-list` |
| `oauth` | Authentification OAuth2 | `authorize-url`, `exchange-code`, `refresh-token`, `user-info`, `parse-callback`, `validate-state` |
| `callback` | Analyse des callbacks | `parse-payload`, `decrypt-payload`, `verify-signature`, `event-types` |
| `media` | Fichiers média | `upload`, `upload-app`, `download`, `download-to-file`, `path` |
| `streaming` | Messages streaming (IA) | `create`, `fetch` |
| `chat` | Conversations et messages | `list`, `messages` |
| `health` | Vérification de connexion | `check` |

## Exemples courants

### Messagerie

```bash
# Envoyer un message texte
lansenger message send-text chat123 "Hello World"

# Envoyer un message Markdown
lansenger message send-markdown chat123 "**Gras** texte"

# Envoyer un fichier
lansenger message send-file chat123 /path/to/file.pdf

# Envoyer une image depuis une URL
lansenger message send-image-url chat123 https://example.com/photo.jpg

# Envoyer une carte lien
lansenger message send-link-card chat123 "Annonce" https://example.com --desc "Cliquez pour plus de détails"

# Envoyer une carte applicative
lansenger message send-app-card chat123 "Titre" --content "Texte" --card-link https://example.com

# Envoyer plusieurs articles
lansenger message send-app-articles chat123 '{"title":"Article 1","url":"https://a.com"}' '{"title":"Article 2","url":"https://b.com"}'

# Envoyer une carte d'approbation
lansenger message send-oacard chat123 "Titre" --head "Notification" --field '{"key":"Demandeur","value":"Jean"}'

# Envoyer dans un groupe avec @all
lansenger message send-text group123 "Annonce" --group --mention-all

# @mention spécifique
lansenger message send-text group123 "Veuillez vérifier" --group --mention staff001

# Diffusion via le canal robot
lansenger message send-bot-message text '{"content":"Avis"}' --chat-id user001 --chat-id user002

# Canal message de groupe (user_token facultatif)
lansenger message send-group-message group123 text '{"content":"Message"}'

# Envoyer en tant qu'utilisateur (nécessite user_token)
lansenger message send-group-message group123 text '{"content":"Message"}' --user-token YOUR_USER_TOKEN --sender-id staff001

# Canal compte public
lansenger message send-account-message text '{"content":"Message"}' --chat-id user001 --account-id acct001

# Canal utilisateur (nécessite user_token)
lansenger message send-user-message user001 text '{"content":"Message privé"}' --user-token YOUR_USER_TOKEN

# Révoquer des messages
lansenger message revoke msg001 msg002

# Envoyer un rappel
lansenger message send-reminder msg001 --type 1 --type 2 --user staff001 --user staff002

# Lister les IDs de groupe
lansenger message query-groups --page 1 --size 100
```

### Gestion des groupes

```bash
# Créer un groupe
lansenger group create "Groupe Projet" org001 --staff staff001 --staff staff002

# Voir les infos
lansenger group info group123

# Voir les membres
lansenger group members group123

# Lister les groupes (robot peut lister ses groupes)
lansenger group list

# Lister en tant qu'utilisateur (nécessite user_token)
lansenger group list --user-token YOUR_USER_TOKEN

# Vérifier l'appartenance
lansenger group check group123 --staff-id staff001

# Mettre à jour
lansenger group update group123 --name "Nouveau" --desc "Description"

# Ajouter/supprimer
lansenger group update-members group123 --add staff003 --remove staff001
```

### Interrogation du personnel

```bash
# Infos de base
lansenger staff basic-info staff001

# Infos détaillées
lansenger staff detail staff001

# Rechercher
lansenger staff search ZhangSan

# Mapping d'ID
lansenger staff id-mapping org001 phone 13800138000

# Infos organisation
lansenger staff org-info org001
```

### Départements

```bash
# Détail
lansenger department detail dept001

# Enfants
lansenger department children dept001

# Personnel
lansenger department staffs dept001
```

### Conversations et messages

```bash
# Liste des conversations (nécessite user_token)
lansenger chat list --user-token YOUR_USER_TOKEN

# Groupes seulement
lansenger chat list --type 2 --user-token YOUR_USER_TOKEN

# Rechercher
lansenger chat list --keyword ZhangSan --user-token YOUR_USER_TOKEN

# Messages privés
lansenger chat messages --staff-id staff001 --user-token YOUR_USER_TOKEN

# Messages de groupe (robot peut récupérer)
lansenger chat messages --group-id group123

# Messages de groupe en tant qu'utilisateur
lansenger chat messages --group-id group123 --user-token YOUR_USER_TOKEN
```

### Calendrier

```bash
# Calendrier principal
lansenger calendar primary --user-token YOUR_USER_TOKEN

# Créer un événement (start/end en secondes Unix)
lansenger calendar create-schedule cal001 "Réunion" 1747539600 1747543200 \
  '[{"staffId":"staff001","attendeeFlag":"yes"}]' \
  --desc "Standup" --user-token YOUR_USER_TOKEN

# Lister
lansenger calendar list-schedules cal001 1747539600 1747603200 --user-token YOUR_TOKEN

# Détail
lansenger calendar fetch-schedule cal001 schedule001 --user-token YOUR_TOKEN

# Supprimer
lansenger calendar delete-schedule cal001 schedule001 --user-token YOUR_TOKEN
```

### Tâches

```bash
# Créer
lansenger todo create "Approuver document" https://app.com/doc https://app.com/doc \
  "staff001,staff002" org001 --desc "À réviser" --type 2

# Mettre à jour le statut
lansenger todo update-status task001 22 org001

# Statut d'exécutant
lansenger todo executor-status '[{"executorId":"staff001","status":"22"}]' org001 --task-id task001

# Lister
lansenger todo list org001 --status 21,22

# Supprimer
lansenger todo delete task001 org001
```

### Authentification OAuth2

```bash
# URL d'autorisation
lansenger oauth authorize-url https://yourapp.com/callback --scope basic_userinfor

# Échanger le code
lansenger oauth exchange-code AUTH_CODE --redirect-uri https://yourapp.com/callback

# Rafraîchir le token
lansenger oauth refresh-token YOUR_REFRESH_TOKEN

# Infos utilisateur
lansenger oauth user-info YOUR_USER_TOKEN

# Parser l'URL de callback
lansenger oauth parse-callback "code=xxx&state=yyy"

# Valider le state
lansenger oauth validate-state yyy yyy
```

### Callbacks

```bash
# Types d'événements
lansenger callback event-types

# Parser le payload
lansenger callback parse-payload ENCRYPTED_DATA --encoding-key YOUR_KEY

# Déchiffrer
lansenger callback decrypt-payload ENCRYPTED_DATA --encoding-key YOUR_KEY

# Vérifier la signature
lansenger callback verify-signature TIMESTAMP NONCE SIGNATURE --encoding-key YOUR_KEY
```

### Fichiers média

```bash
# Uploader un fichier
lansenger media upload /path/to/file.pdf --media-type 3

# Uploader un média app/robot
lansenger media upload-app /path/to/file.pdf --media-type file

# Télécharger un média
lansenger media download-to-file MEDIA_ID --output /path/to/save.pdf
```

### Messages en streaming

```bash
# Créer un message streaming
lansenger streaming create user123 single stream-session-001

# Statut du message
lansenger streaming fetch MSG_ID
```

## Options globales

| Option | Description |
|------|------|
| `--json` / `-j` | Sortie JSON brute |
| `--profile` / `-P` | Profil d'identifiants (défaut : `default`) |
| `--as <staff_id>` | Charge et rafraîchit automatiquement le jeton utilisateur pour le staff_id spécifié depuis le stockage des identifiants |

```bash
# Sortie JSON
lansenger -j staff basic-info staff001

# Profil spécifique
lansenger -P my-bot message send-text chat123 "Hello"
```

## Profils multi-applications / multi-bots

```bash
# Configurer le premier robot
lansenger config set app_id xxx1 --profile my-bot
lansenger config set app_secret xxx1 --profile my-bot

# Configurer la deuxième application
lansenger config set app_id xxx2 --profile my-app
lansenger config set app_secret xxx2 --profile my-app
lansenger config set encoding_key yyy2 --profile my-app
lansenger config set callback_token zzz2 --profile my-app

# Utiliser un profil spécifique
lansenger -P my-bot message send-text chat123 "Hello"
lansenger -P my-app callback parse-payload DATA

# Lister les profils
lansenger config list-profiles

# Supprimer un profil (bascule automatiquement vers default si actif)
lansenger config delete-profile my-bot

# Voir les détails
lansenger config show --profile my-app
```

## Sécurité

- Identifiants stockés dans `~/.lansenger/sdk_state.json` avec permissions `0600`
- `config show` masque les secrets (`***`)
- Variables d'environnement supportées pour CI/CD

## Identité et Permissions

### Matrice des Capacités par Identité

La plateforme Lansenger propose trois types d'identité avec différents accès API :

| Command Domain | Personal Bot | Org App (Self-built) | Org App + Bot | Notes |
|--------|:---:|:---:|:---:|------|
| `message send-text/markdown/file/...` (bot DM) | **Y** | N | **Y** | Seuls les bots peuvent envoyer des DMs bot |
| `message send-text --group` (group chat) | N* | N | **Y** | L'API bot personnel le supporte mais pas encore de fonction rejoindre-groupe |
| `message send-group-message` | N* | N | **Y** | Identique à ci-dessus |
| `message send-account-message` (public account) | N | **Y** | **Y** | Nécessite la capacité compte public |
| `message send-user-message` (user-to-user) | N | **Y** | **Y** | Nécessite userToken + OAuth2 |
| `message revoke` | **Y** | **Y** | **Y** | Révoquer ses propres messages |
| `staff *` (contacts read-only) | N | **Y** | **Y** | `search` nécessite en plus userToken |
| `department *` | N | **Y** | **Y** | Applications niveau org uniquement |
| `calendar *` | N | **Y** | **Y** | Avec userToken = identité utilisateur ; sans = identité bot |
| `todo *` | N | **Y** | **Y** | Applications niveau org uniquement |
| `chat list/messages` | N | **Y** | **Y** | Applications niveau org uniquement |
| `group *` (group management V2) | N | N | **Y** | Nécessite que le bot soit dans le groupe |
| `media upload` | **Y** | **Y** | **Y** | Téléversement général |
| `media upload-app` | N | **Y** | **Y** | Applis auto-hébergées seulement (pas ISV) |
| `media download/path` | **Y** | **Y** | **Y** | Téléchargement général |
| `oauth *` | N | **Y** | **Y** | Applications niveau org uniquement |
| `streaming *` | N | **Y** | **Y** | Applications niveau org uniquement |
| `callback *` (event parsing) | N/A | N/A | N/A | Opération pure de données, aucune identité requise |

> \* **N\*** = Capacité API existante, mais fonction rejoindre-groupe pas encore disponible.

> **Personal Bot** peut seulement envoyer/recevoir des messages et téléverser/télécharger des fichiers. Ne peut pas accéder aux contacts, groupes, calendriers ou OAuth2.
>
> **Org App vs Org App + Bot** : Même appID/appSecret. La seule différence est les canaux de messagerie — seuls les bots peuvent envoyer des DMs bot et des messages de groupe (car seuls les bots peuvent rejoindre les groupes). Toutes les autres API (contacts, calendrier, tâches, conversations, OAuth2, streaming) fonctionnent de manière identique pour les deux. Actuellement, seules les applications auto-hébergées supportent la capacité bot.

### Permissions du Centre Développeur

Au-delà du type d'identité, les appels API spécifiques dépendent aussi des interrupteurs de permission dans le Centre Développeur Lansenger. L'organisation peut restreindre l'accès développeur, nécessitant l'assistance d'un administrateur.

**Permissions de Base (activées par défaut) :**

| Permission | Description |
|------|------|
| Obtenir les infos utilisateur de base | Obtenir les infos de base du personnel pour la connexion système/appli |
| Envoyer des messages de notification | Obtenir les canaux de messagerie de l'org pour envoyer des messages aux personnes/groupes |

**Permissions Avancées (désactivées par défaut, doivent être activées manuellement) :**

| Permission | Description | Commande Impactée |
|------|------|-------------|
| Contacts lecture seule | Accès en lecture aux contacts | `staff`, `department` |
| Contacts édition | Accès en édition aux contacts | `staff` (créer/mettre à jour/supprimer) |
| Infos sensibles - Téléphone | Accès aux numéros de téléphone | `staff` (detail, id-mapping) |
| Infos sensibles - Email | Accès aux emails | `staff` (detail, id-mapping) |
| Infos sensibles - N° d'identité | Accès aux numéros d'identité | `staff` |
| Infos sensibles - ID employé | Accès aux IDs employé | `staff` |
| Mapper attribut unique vers staff ID | Mapper tél/email/ID employé vers staff ID | `staff` (id-mapping) |
| Édition d'application | Créer et mettre à jour des applications | Gestion Centre Développeur |
| Groupes lecture seule | Accès en lecture aux groupes | `group` (infos/membres) |
| Groupes édition | Accès en édition aux groupes | `group` (créer/màj/dissoudre/membres) |
| Calendrier lecture seule | Accès en lecture au calendrier et événements | `calendar` (requête) |
| Calendrier édition | Accès en édition au calendrier et événements | `calendar` (créer/màj/supprimer) |
| Téléverser média | Permission de téléversement de fichiers média | `media` (upload, upload-app) |
| Lecture modèles Workbench | Accès en lecture aux modèles workbench | — |
| Écriture modèles Workbench | Accès en écriture aux modèles workbench | — |

En cas d'erreur de permission, vérifiez d'abord que le type d'identité supporte l'opération, puis invitez l'utilisateur à activer la permission avancée correspondante dans le Centre Développeur (contacter l'admin de l'org si l'accès est impossible).

## Compatibilité CLI

```bash
# Python CLI
pip install lansenger-cli

# Go CLI
go install github.com/lansenger-pm/lansenger-sdk-go/cmd/lansenger@latest

# TypeScript CLI
npm install -g lansenger-cli
```

## Relation avec le SDK

Ce CLI est construit sur `LansengerClient` de [lansenger-sdk-ts](https://github.com/lansenger-pm/lansenger-sdk-ts), couvrant toutes les API du SDK sans le modifier.

## Licence

Licence MIT
