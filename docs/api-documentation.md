# SecureTalk API Documentation

## Introduction

SecureTalk est une application de messagerie sécurisée qui permet aux utilisateurs de communiquer de manière privée et sécurisée. Cette documentation détaille les endpoints de l'API, les modèles de données, et les fonctionnalités disponibles pour l'intégration frontend-backend.

## Base URL

```
https://api.securetalk.com/api/v1
```

Pour le développement local :

```
http://localhost:8080/api/v1
```

## Authentification

L'API utilise l'authentification JWT (JSON Web Token). Pour accéder aux endpoints protégés, vous devez inclure le token JWT dans l'en-tête de la requête :

```
Authorization: Bearer <token>
```

### Endpoints d'authentification

#### Inscription

```
POST /auth/register
```

**Corps de la requête :**

```json
{
  "username": "string",
  "email": "string",
  "password": "string",
  "firstName": "string (optionnel)",
  "lastName": "string (optionnel)"
}
```

**Réponse :**

```json
{
  "id": "number",
  "username": "string",
  "email": "string",
  "token": "string",
  "roles": ["USER", "ADMIN", "MODERATOR"]
}
```

#### Connexion

```
POST /auth/login
```

**Corps de la requête :**

```json
{
  "username": "string",
  "password": "string"
}
```

**Réponse :**

```json
{
  "id": "number",
  "username": "string",
  "email": "string",
  "token": "string",
  "roles": ["USER", "ADMIN", "MODERATOR"]
}
```

#### Rafraîchir le token

```
POST /auth/refresh
```

**Corps de la requête :**

```json
{
  "refreshToken": "string"
}
```

**Réponse :**

```json
{
  "token": "string",
  "refreshToken": "string"
}
```

#### Déconnexion

```
POST /auth/logout
```

**Corps de la requête :**

```json
{
  "refreshToken": "string"
}
```

**Réponse :**

```
Status: 200 OK
```

## Utilisateurs

### Récupérer les utilisateurs

```
GET /users
```

**Paramètres de requête :**

- `page` (optionnel) : Numéro de page (défaut : 0)
- `size` (optionnel) : Nombre d'éléments par page (défaut : 20)
- `sort` (optionnel) : Champ de tri (défaut : "username,asc")
- `query` (optionnel) : Recherche par nom d'utilisateur ou email
- `role` (optionnel) : Filtrer par rôle (USER, ADMIN, MODERATOR, ALL)
- `status` (optionnel) : Filtrer par statut (online, offline, all)

**Réponse :**

```json
{
  "users": [
    {
      "id": "number",
      "username": "string",
      "email": "string",
      "firstName": "string",
      "lastName": "string",
      "bio": "string",
      "avatar": "string",
      "roles": [
        {
          "id": "number",
          "name": "string"
        }
      ],
      "enabled": "boolean",
      "isOnline": "boolean",
      "lastSeen": "date",
      "createdAt": "date",
      "updatedAt": "date",
      "totalMessages": "number",
      "totalConnections": "number",
      "lastLogin": "date",
      "isPrivate": "boolean",
      "allowMessages": "boolean",
      "showOnlineStatus": "boolean"
    }
  ],
  "total": "number",
  "page": "number",
  "size": "number",
  "totalPages": "number",
  "hasNext": "boolean",
  "hasPrevious": "boolean"
}
```

### Récupérer un utilisateur par ID

```
GET /users/{id}
```

**Réponse :**

```json
{
  "id": "number",
  "username": "string",
  "email": "string",
  "firstName": "string",
  "lastName": "string",
  "bio": "string",
  "avatar": "string",
  "roles": [
    {
      "id": "number",
      "name": "string"
    }
  ],
  "enabled": "boolean",
  "isOnline": "boolean",
  "lastSeen": "date",
  "createdAt": "date",
  "updatedAt": "date",
  "totalMessages": "number",
  "totalConnections": "number",
  "lastLogin": "date",
  "isPrivate": "boolean",
  "allowMessages": "boolean",
  "showOnlineStatus": "boolean"
}
```

### Mettre à jour un utilisateur

```
PUT /users/{id}
```

**Corps de la requête :**

```json
{
  "firstName": "string",
  "lastName": "string",
  "bio": "string",
  "avatar": "string",
  "isPrivate": "boolean",
  "allowMessages": "boolean",
  "showOnlineStatus": "boolean"
}
```

**Réponse :**

```json
{
  "id": "number",
  "username": "string",
  "email": "string",
  "firstName": "string",
  "lastName": "string",
  "bio": "string",
  "avatar": "string",
  "roles": [
    {
      "id": "number",
      "name": "string"
    }
  ],
  "enabled": "boolean",
  "isOnline": "boolean",
  "lastSeen": "date",
  "createdAt": "date",
  "updatedAt": "date",
  "totalMessages": "number",
  "totalConnections": "number",
  "lastLogin": "date",
  "isPrivate": "boolean",
  "allowMessages": "boolean",
  "showOnlineStatus": "boolean"
}
```

### Supprimer un utilisateur

```
DELETE /users/{id}
```

**Réponse :**

```
Status: 204 No Content
```

## Messages

### Récupérer les conversations

```
GET /messages/conversations
```

**Paramètres de requête :**

- `page` (optionnel) : Numéro de page (défaut : 0)
- `size` (optionnel) : Nombre d'éléments par page (défaut : 20)

**Réponse :**

```json
{
  "conversations": [
    {
      "id": "number",
      "participantId": "number",
      "participantUsername": "string",
      "participantAvatar": "string",
      "lastMessage": {
        "id": "number",
        "content": "string",
        "senderId": "number",
        "recipientId": "number",
        "timestamp": "date",
        "read": "boolean",
        "reactions": [
          {
            "id": "number",
            "userId": "number",
            "type": "string",
            "timestamp": "date"
          }
        ]
      },
      "unreadCount": "number",
      "lastActivity": "date",
      "isOnline": "boolean"
    }
  ],
  "total": "number",
  "page": "number",
  "size": "number",
  "totalPages": "number",
  "hasNext": "boolean",
  "hasPrevious": "boolean"
}
```

### Récupérer les messages d'une conversation

```
GET /messages/conversations/{userId}
```

**Paramètres de requête :**

- `page` (optionnel) : Numéro de page (défaut : 0)
- `size` (optionnel) : Nombre d'éléments par page (défaut : 20)

**Réponse :**

```json
{
  "messages": [
    {
      "id": "number",
      "content": "string",
      "senderId": "number",
      "recipientId": "number",
      "timestamp": "date",
      "read": "boolean",
      "reactions": [
        {
          "id": "number",
          "userId": "number",
          "type": "string",
          "timestamp": "date"
        }
      ]
    }
  ],
  "total": "number",
  "page": "number",
  "size": "number",
  "totalPages": "number",
  "hasNext": "boolean",
  "hasPrevious": "boolean"
}
```

### Envoyer un message

```
POST /messages
```

**Corps de la requête :**

```json
{
  "recipientId": "number",
  "content": "string"
}
```

**Réponse :**

```json
{
  "id": "number",
  "content": "string",
  "senderId": "number",
  "recipientId": "number",
  "timestamp": "date",
  "read": "boolean",
  "reactions": []
}
```

### Marquer un message comme lu

```
PUT /messages/{id}/read
```

**Réponse :**

```json
{
  "id": "number",
  "content": "string",
  "senderId": "number",
  "recipientId": "number",
  "timestamp": "date",
  "read": true,
  "reactions": [
    {
      "id": "number",
      "userId": "number",
      "type": "string",
      "timestamp": "date"
    }
  ]
}
```

### Ajouter une réaction à un message

```
POST /messages/{id}/reactions
```

**Corps de la requête :**

```json
{
  "type": "string"
}
```

**Réponse :**

```json
{
  "id": "number",
  "userId": "number",
  "type": "string",
  "timestamp": "date"
}
```

### Supprimer une réaction

```
DELETE /messages/{messageId}/reactions/{reactionId}
```

**Réponse :**

```
Status: 204 No Content
```

### Rechercher des messages

```
GET /messages/search
```

**Paramètres de requête :**

- `query` : Terme de recherche
- `page` (optionnel) : Numéro de page (défaut : 0)
- `size` (optionnel) : Nombre d'éléments par page (défaut : 20)

**Réponse :**

```json
{
  "results": [
    {
      "messageId": "number",
      "content": "string",
      "senderId": "number",
      "senderUsername": "string",
      "recipientId": "number",
      "recipientUsername": "string",
      "timestamp": "date",
      "conversationId": "number"
    }
  ],
  "total": "number",
  "page": "number",
  "size": "number",
  "totalPages": "number",
  "hasNext": "boolean",
  "hasPrevious": "boolean"
}
```

## Connexions utilisateur

### Récupérer les connexions

```
GET /connections
```

**Paramètres de requête :**

- `status` (optionnel) : Filtrer par statut (pending, accepted, blocked, all)
- `page` (optionnel) : Numéro de page (défaut : 0)
- `size` (optionnel) : Nombre d'éléments par page (défaut : 20)

**Réponse :**

```json
{
  "connections": [
    {
      "id": "number",
      "user": {
        "id": "number",
        "username": "string",
        "firstName": "string",
        "lastName": "string",
        "avatar": "string",
        "isOnline": "boolean",
        "lastSeen": "date"
      },
      "connectedAt": "date",
      "status": "string",
      "isBlocked": "boolean"
    }
  ],
  "total": "number",
  "page": "number",
  "size": "number",
  "totalPages": "number",
  "hasNext": "boolean",
  "hasPrevious": "boolean"
}
```

### Créer une connexion

```
POST /connections
```

**Corps de la requête :**

```json
{
  "userId": "number"
}
```

**Réponse :**

```json
{
  "id": "number",
  "user": {
    "id": "number",
    "username": "string",
    "firstName": "string",
    "lastName": "string",
    "avatar": "string",
    "isOnline": "boolean",
    "lastSeen": "date"
  },
  "connectedAt": "date",
  "status": "pending",
  "isBlocked": false
}
```

### Mettre à jour le statut d'une connexion

```
PUT /connections/{id}/status
```

**Corps de la requête :**

```json
{
  "status": "accepted | blocked"
}
```

**Réponse :**

```json
{
  "id": "number",
  "user": {
    "id": "number",
    "username": "string",
    "firstName": "string",
    "lastName": "string",
    "avatar": "string",
    "isOnline": "boolean",
    "lastSeen": "date"
  },
  "connectedAt": "date",
  "status": "string",
  "isBlocked": "boolean"
}
```

### Supprimer une connexion

```
DELETE /connections/{id}
```

**Réponse :**

```
Status: 204 No Content
```

## Notifications

### Récupérer les notifications

```
GET /notifications
```

**Paramètres de requête :**

- `read` (optionnel) : Filtrer par statut de lecture (true, false, all)
- `page` (optionnel) : Numéro de page (défaut : 0)
- `size` (optionnel) : Nombre d'éléments par page (défaut : 20)

**Réponse :**

```json
{
  "notifications": [
    {
      "id": "number",
      "type": "message | connection_request | connection_accepted | system",
      "content": "string",
      "senderId": "number",
      "senderUsername": "string",
      "senderAvatar": "string",
      "timestamp": "date",
      "read": "boolean",
      "metadata": {
        "messageId": "number",
        "connectionId": "number"
      }
    }
  ],
  "total": "number",
  "page": "number",
  "size": "number",
  "totalPages": "number",
  "hasNext": "boolean",
  "hasPrevious": "boolean"
}
```

### Marquer une notification comme lue

```
PUT /notifications/{id}/read
```

**Réponse :**

```json
{
  "id": "number",
  "type": "string",
  "content": "string",
  "senderId": "number",
  "senderUsername": "string",
  "senderAvatar": "string",
  "timestamp": "date",
  "read": true,
  "metadata": {
    "messageId": "number",
    "connectionId": "number"
  }
}
```

### Marquer toutes les notifications comme lues

```
PUT /notifications/read-all
```

**Réponse :**

```
Status: 200 OK
```

## Codes d'erreur

| Code | Description |
|------|-------------|
| 400 | Requête invalide |
| 401 | Non autorisé - Authentification requise |
| 403 | Accès interdit - Droits insuffisants |
| 404 | Ressource non trouvée |
| 409 | Conflit - La ressource existe déjà |
| 422 | Entité non traitable - Validation échouée |
| 429 | Trop de requêtes - Rate limiting |
| 500 | Erreur serveur interne |

## Modèles de données

### User

```json
{
  "id": "number",
  "username": "string",
  "email": "string",
  "firstName": "string",
  "lastName": "string",
  "bio": "string",
  "avatar": "string",
  "roles": [
    {
      "id": "number",
      "name": "USER | ADMIN | MODERATOR"
    }
  ],
  "enabled": "boolean",
  "isOnline": "boolean",
  "lastSeen": "date",
  "createdAt": "date",
  "updatedAt": "date",
  "totalMessages": "number",
  "totalConnections": "number",
  "lastLogin": "date",
  "isPrivate": "boolean",
  "allowMessages": "boolean",
  "showOnlineStatus": "boolean"
}
```

### Message

```json
{
  "id": "number",
  "content": "string",
  "senderId": "number",
  "recipientId": "number",
  "timestamp": "date",
  "read": "boolean",
  "reactions": [
    {
      "id": "number",
      "userId": "number",
      "type": "string",
      "timestamp": "date"
    }
  ]
}
```

### Conversation

```json
{
  "id": "number",
  "participantId": "number",
  "participantUsername": "string",
  "participantAvatar": "string",
  "lastMessage": {
    "id": "number",
    "content": "string",
    "senderId": "number",
    "recipientId": "number",
    "timestamp": "date",
    "read": "boolean"
  },
  "unreadCount": "number",
  "lastActivity": "date",
  "isOnline": "boolean"
}
```

### UserConnection

```json
{
  "id": "number",
  "user": {
    "id": "number",
    "username": "string",
    "firstName": "string",
    "lastName": "string",
    "avatar": "string",
    "isOnline": "boolean",
    "lastSeen": "date"
  },
  "connectedAt": "date",
  "status": "pending | accepted | blocked",
  "isBlocked": "boolean"
}
```

### Notification

```json
{
  "id": "number",
  "type": "message | connection_request | connection_accepted | system",
  "content": "string",
  "senderId": "number",
  "senderUsername": "string",
  "senderAvatar": "string",
  "timestamp": "date",
  "read": "boolean",
  "metadata": {
    "messageId": "number",
    "connectionId": "number"
  }
}
```

## Sécurité

L'API SecureTalk implémente plusieurs niveaux de sécurité :

1. **Authentification JWT** : Tous les endpoints protégés nécessitent un token JWT valide.
2. **Expiration des tokens** : Les tokens JWT expirent après 24 heures.
3. **Refresh tokens** : Possibilité de rafraîchir les tokens sans avoir à se reconnecter.
4. **HTTPS** : Toutes les communications sont chiffrées via HTTPS.
5. **Validation des entrées** : Toutes les entrées utilisateur sont validées côté serveur.
6. **Rate limiting** : Protection contre les attaques par force brute.
7. **CORS** : Configuration stricte des origines autorisées.
8. **Autorisations basées sur les rôles** : Contrôle d'accès granulaire basé sur les rôles utilisateur.
