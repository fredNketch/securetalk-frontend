# Schéma de la Base de Données SecureTalk

## Introduction

Ce document décrit le schéma de la base de données utilisée par l'application SecureTalk. La base de données est conçue pour stocker les informations des utilisateurs, les messages, les connexions entre utilisateurs, et les notifications.

## Diagramme Entité-Relation

```
+----------------+       +-------------------+       +----------------+
|     USERS      |       |     MESSAGES      |       | USER_CONNECTIONS|
+----------------+       +-------------------+       +----------------+
| id             |<----->| id                |       | id             |
| username       |       | content           |       | user_id        |
| email          |       | sender_id         |<----->| connected_id   |
| password       |       | recipient_id      |       | status         |
| first_name     |       | timestamp         |       | connected_at   |
| last_name      |       | read              |       | is_blocked     |
| bio            |       +-------------------+       +----------------+
| avatar         |                ^                          ^
| enabled        |                |                          |
| is_online      |                |                          |
| last_seen      |       +-------------------+               |
| created_at     |       | MESSAGE_REACTIONS |               |
| updated_at     |       +-------------------+               |
| last_login     |       | id                |               |
| is_private     |       | message_id        |               |
| allow_messages |       | user_id           |               |
| show_status    |       | type              |               |
+----------------+       | timestamp         |               |
        ^                +-------------------+               |
        |                                                    |
        |                +-------------------+               |
        |                |   NOTIFICATIONS   |               |
        +--------------->| id                |<--------------+
        |                | type              |
        |                | content           |
        |                | sender_id         |
        |                | recipient_id      |
        |                | timestamp         |
        |                | read              |
        |                | metadata          |
        |                +-------------------+
        |
        |                +-------------------+
        |                |    USER_ROLES     |
        +--------------->| user_id           |
                         | role_id           |
                         +-------------------+
                                  ^
                                  |
                         +-------------------+
                         |      ROLES        |
                         +-------------------+
                         | id                |
                         | name              |
                         | description       |
                         +-------------------+
```

## Tables

### Users

Stocke les informations des utilisateurs.

| Colonne          | Type         | Contraintes                 | Description                                     |
|------------------|--------------|-----------------------------|-------------------------------------------------|
| id               | BIGINT       | PK, AUTO_INCREMENT          | Identifiant unique de l'utilisateur             |
| username         | VARCHAR(50)  | UNIQUE, NOT NULL            | Nom d'utilisateur                               |
| email            | VARCHAR(100) | UNIQUE, NOT NULL            | Adresse email                                   |
| password         | VARCHAR(255) | NOT NULL                    | Mot de passe hashé                              |
| first_name       | VARCHAR(50)  | NULL                        | Prénom                                          |
| last_name        | VARCHAR(50)  | NULL                        | Nom de famille                                  |
| bio              | TEXT         | NULL                        | Biographie                                      |
| avatar           | VARCHAR(255) | NULL                        | URL de l'avatar                                 |
| enabled          | BOOLEAN      | NOT NULL, DEFAULT TRUE      | Compte actif ou désactivé                       |
| is_online        | BOOLEAN      | NOT NULL, DEFAULT FALSE     | Statut en ligne                                 |
| last_seen        | TIMESTAMP    | NULL                        | Dernière activité                               |
| created_at       | TIMESTAMP    | NOT NULL                    | Date de création du compte                      |
| updated_at       | TIMESTAMP    | NULL                        | Date de dernière mise à jour                    |
| last_login       | TIMESTAMP    | NULL                        | Date de dernière connexion                      |
| is_private       | BOOLEAN      | NOT NULL, DEFAULT FALSE     | Profil privé ou public                          |
| allow_messages   | BOOLEAN      | NOT NULL, DEFAULT TRUE      | Autoriser les messages                          |
| show_status      | BOOLEAN      | NOT NULL, DEFAULT TRUE      | Afficher le statut en ligne                     |

### Roles

Définit les rôles disponibles dans l'application.

| Colonne      | Type         | Contraintes                 | Description                                     |
|--------------|--------------|-----------------------------|-------------------------------------------------|
| id           | BIGINT       | PK, AUTO_INCREMENT          | Identifiant unique du rôle                      |
| name         | VARCHAR(50)  | UNIQUE, NOT NULL            | Nom du rôle (USER, ADMIN, MODERATOR)           |
| description  | VARCHAR(255) | NULL                        | Description du rôle                             |

### User_Roles

Table de jointure entre utilisateurs et rôles (relation many-to-many).

| Colonne      | Type         | Contraintes                 | Description                                     |
|--------------|--------------|-----------------------------|-------------------------------------------------|
| user_id      | BIGINT       | PK, FK (users.id)           | Référence à l'utilisateur                       |
| role_id      | BIGINT       | PK, FK (roles.id)           | Référence au rôle                               |

### Messages

Stocke les messages échangés entre utilisateurs.

| Colonne      | Type         | Contraintes                 | Description                                     |
|--------------|--------------|-----------------------------|-------------------------------------------------|
| id           | BIGINT       | PK, AUTO_INCREMENT          | Identifiant unique du message                   |
| content      | TEXT         | NOT NULL                    | Contenu du message                              |
| sender_id    | BIGINT       | FK (users.id), NOT NULL     | Expéditeur du message                           |
| recipient_id | BIGINT       | FK (users.id), NOT NULL     | Destinataire du message                         |
| timestamp    | TIMESTAMP    | NOT NULL                    | Date d'envoi                                    |
| read         | BOOLEAN      | NOT NULL, DEFAULT FALSE     | Statut de lecture                               |

### Message_Reactions

Stocke les réactions aux messages.

| Colonne      | Type         | Contraintes                 | Description                                     |
|--------------|--------------|-----------------------------|-------------------------------------------------|
| id           | BIGINT       | PK, AUTO_INCREMENT          | Identifiant unique de la réaction               |
| message_id   | BIGINT       | FK (messages.id), NOT NULL  | Référence au message                            |
| user_id      | BIGINT       | FK (users.id), NOT NULL     | Utilisateur ayant réagi                         |
| type         | VARCHAR(50)  | NOT NULL                    | Type de réaction (like, love, etc.)             |
| timestamp    | TIMESTAMP    | NOT NULL                    | Date de la réaction                             |

### User_Connections

Stocke les connexions entre utilisateurs.

| Colonne      | Type         | Contraintes                 | Description                                     |
|--------------|--------------|-----------------------------|-------------------------------------------------|
| id           | BIGINT       | PK, AUTO_INCREMENT          | Identifiant unique de la connexion              |
| user_id      | BIGINT       | FK (users.id), NOT NULL     | Utilisateur qui a initié la connexion           |
| connected_id | BIGINT       | FK (users.id), NOT NULL     | Utilisateur connecté                            |
| status       | VARCHAR(20)  | NOT NULL                    | Statut (pending, accepted, blocked)             |
| connected_at | TIMESTAMP    | NOT NULL                    | Date de la connexion                            |
| is_blocked   | BOOLEAN      | NOT NULL, DEFAULT FALSE     | Indique si l'utilisateur est bloqué             |

### Notifications

Stocke les notifications des utilisateurs.

| Colonne      | Type         | Contraintes                 | Description                                     |
|--------------|--------------|-----------------------------|-------------------------------------------------|
| id           | BIGINT       | PK, AUTO_INCREMENT          | Identifiant unique de la notification           |
| type         | VARCHAR(50)  | NOT NULL                    | Type de notification                            |
| content      | TEXT         | NOT NULL                    | Contenu de la notification                      |
| sender_id    | BIGINT       | FK (users.id), NULL         | Expéditeur de la notification                   |
| recipient_id | BIGINT       | FK (users.id), NOT NULL     | Destinataire de la notification                 |
| timestamp    | TIMESTAMP    | NOT NULL                    | Date de la notification                         |
| read         | BOOLEAN      | NOT NULL, DEFAULT FALSE     | Statut de lecture                               |
| metadata     | JSON         | NULL                        | Métadonnées additionnelles                      |

### Refresh_Tokens

Stocke les tokens de rafraîchissement pour l'authentification.

| Colonne      | Type         | Contraintes                 | Description                                     |
|--------------|--------------|-----------------------------|-------------------------------------------------|
| id           | BIGINT       | PK, AUTO_INCREMENT          | Identifiant unique du token                     |
| user_id      | BIGINT       | FK (users.id), NOT NULL     | Utilisateur associé                             |
| token        | VARCHAR(255) | UNIQUE, NOT NULL            | Token de rafraîchissement                       |
| expiry_date  | TIMESTAMP    | NOT NULL                    | Date d'expiration                               |

## Index

Pour optimiser les performances, les index suivants sont créés :

1. Index sur `users.username` et `users.email` pour accélérer les recherches
2. Index sur `messages.sender_id` et `messages.recipient_id` pour accélérer les requêtes de conversation
3. Index sur `user_connections.user_id` et `user_connections.connected_id` pour accélérer les recherches de connexion
4. Index sur `notifications.recipient_id` pour accélérer les requêtes de notification

## Contraintes d'intégrité

1. Contrainte de clé étrangère sur `messages.sender_id` et `messages.recipient_id` référençant `users.id`
2. Contrainte de clé étrangère sur `message_reactions.message_id` référençant `messages.id`
3. Contrainte de clé étrangère sur `message_reactions.user_id` référençant `users.id`
4. Contrainte de clé étrangère sur `user_connections.user_id` et `user_connections.connected_id` référençant `users.id`
5. Contrainte de clé étrangère sur `notifications.sender_id` et `notifications.recipient_id` référençant `users.id`
6. Contrainte de clé étrangère sur `user_roles.user_id` référençant `users.id`
7. Contrainte de clé étrangère sur `user_roles.role_id` référençant `roles.id`
8. Contrainte de clé étrangère sur `refresh_tokens.user_id` référençant `users.id`

## Création automatique de la base de données

La base de données est créée automatiquement au démarrage du backend grâce à Hibernate et Spring Boot. Le fichier `application.properties` ou `application.yml` contient la configuration de la base de données et les paramètres suivants :

```properties
# Configuration de la base de données
spring.datasource.url=jdbc:mysql://localhost:3306/securetalk?createDatabaseIfNotExist=true
spring.datasource.username=root
spring.datasource.password=password

# Configuration Hibernate
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql=true
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQL8Dialect
```

Avec la configuration `spring.jpa.hibernate.ddl-auto=update`, Hibernate va :
1. Créer automatiquement les tables si elles n'existent pas
2. Mettre à jour le schéma si des modifications sont détectées
3. Préserver les données existantes

Pour une installation en production, il est recommandé de changer cette valeur à `validate` une fois que le schéma est stabilisé.

## Données initiales

Lors du premier démarrage, le backend initialise la base de données avec des données par défaut :

1. Création des rôles : USER, ADMIN, MODERATOR
2. Création d'un compte administrateur par défaut (à modifier après la première connexion)
   - Username: admin
   - Password: admin123
   - Roles: [ADMIN, USER]

Ces données initiales sont créées via un `CommandLineRunner` dans la configuration Spring Boot.
