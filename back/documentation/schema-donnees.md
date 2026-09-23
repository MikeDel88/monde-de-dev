# Schéma de données

Ce document décrit l'état final du schéma de base de données (MySQL) après application de toutes les migrations Flyway (`V1` → `V13`, voir `src/main/resources/db/migrations/`). Les migrations Flyway constituent la source de vérité (`spring.jpa.hibernate.ddl-auto=validate`) : les entités JPA ne font que valider ce schéma.

Le schéma comprend 5 tables : `users`, `topics`, `posts`, `comments`, `subscriptions`.

## Table `users`

| Colonne | Type | Nullable | Unique | Défaut | Clé |
|---|---|---|---|---|---|
| user_id | BIGINT AUTO_INCREMENT | NOT NULL | — | — | PK (`pk_users`) |
| name | VARCHAR(255) | NOT NULL | UNIQUE (`uq_users_name`) | — | — |
| email | VARCHAR(255) | NOT NULL | UNIQUE (`uq_users_email`) | — | — |
| password | VARCHAR(255) | NOT NULL | — | — | — |
| role | VARCHAR(50) | NOT NULL | — | `'USER'` | — |
| created_at | TIMESTAMP | NOT NULL | — | `now()` | — |
| updated_at | TIMESTAMP | NOT NULL | — | `now()` | — |

**Index**

| Nom | Colonnes | Type |
|---|---|---|
| pk_users | user_id | Index unique (PK) |
| uq_users_email | email | Index unique |
| uq_users_name | name | Index unique |

## Table `topics`

| Colonne | Type | Nullable | Unique | Défaut | Clé |
|---|---|---|---|---|---|
| topic_id | BIGINT AUTO_INCREMENT | NOT NULL | — | — | PK (`pk_topics`) |
| title | VARCHAR(255) | NOT NULL | UNIQUE (`uq_topics_title`) | — | — |
| description | TEXT | NOT NULL | — | — | — |
| created_at | TIMESTAMP | NOT NULL | — | `now()` | — |
| updated_at | TIMESTAMP | NOT NULL | — | `now()` | — |

**Index**

| Nom | Colonnes | Type |
|---|---|---|
| pk_topics | topic_id | Index unique (PK) |
| uq_topics_title | title | Index unique |

## Table `posts`

| Colonne | Type | Nullable | Unique | Défaut | Clé |
|---|---|---|---|---|---|
| post_id | BIGINT AUTO_INCREMENT | NOT NULL | — | — | PK (`pk_posts`) |
| title | VARCHAR(255) | NOT NULL | — | — | — |
| content | TEXT | NOT NULL | — | — | — |
| user_id | BIGINT | NOT NULL | — | — | FK `fk_post_user` → `users(user_id)` |
| topic_id | BIGINT | NOT NULL | — | — | FK `fk_post_topic` → `topics(topic_id)` |
| created_at | TIMESTAMP | NOT NULL | — | `now()` | — |
| updated_at | TIMESTAMP | NOT NULL | — | `now()` | — |

> Note : une colonne `date` existait à la création de la table (V3) mais a été supprimée en V11 ; elle n'apparaît donc plus dans le schéma final.

**Index**

| Nom | Colonnes | Type |
|---|---|---|
| pk_posts | post_id | Index unique (PK) |
| idx_posts_user_id | user_id | Index (FK) |
| idx_posts_topic_post_id | topic_id, post_id DESC | Index composite |

## Table `comments`

| Colonne | Type | Nullable | Unique | Défaut | Clé |
|---|---|---|---|---|---|
| comment_id | BIGINT AUTO_INCREMENT | NOT NULL | — | — | PK (`pk_comments`) |
| content | TEXT | NOT NULL | — | — | — |
| user_id | BIGINT | NOT NULL | — | — | FK `fk_comment_user` → `users(user_id)` |
| post_id | BIGINT | NOT NULL | — | — | FK `fk_comment_post` → `posts(post_id)` |
| created_at | TIMESTAMP | NOT NULL | — | `now()` | — |
| updated_at | TIMESTAMP | NOT NULL | — | `now()` | — |

> Note : une colonne `date` existait à la création de la table (V4) mais a été supprimée en V11 ; elle n'apparaît donc plus dans le schéma final.

**Index**

| Nom | Colonnes | Type |
|---|---|---|
| pk_comments | comment_id | Index unique (PK) |
| idx_comments_post_id | post_id | Index (FK) |
| idx_comments_user_id | user_id | Index (FK) |

## Table `subscriptions`

Table de jointure pure (relation many-to-many entre `users` et `topics`) : pas de clé primaire de substitution, pas de colonnes d'audit (`created_at`/`updated_at`).

| Colonne | Type | Nullable | Unique | Défaut | Clé |
|---|---|---|---|---|---|
| topic_id | BIGINT | NOT NULL | Composite (`uq_subscriptions_topic_user`) | — | FK `fk_subscription_topic` → `topics(topic_id)` ON DELETE CASCADE |
| user_id | BIGINT | NOT NULL | Composite (`uq_subscriptions_topic_user`) | — | FK `fk_subscription_user` → `users(user_id)` ON DELETE CASCADE |

**Index**

| Nom | Colonnes | Type |
|---|---|---|
| uq_subscriptions_topic_user | topic_id, user_id | Index unique composite |
| idx_subscriptions_user_id | user_id | Index (FK) |

## Relations

| Relation | Cardinalité | Implémentation |
|---|---|---|
| User — Post | 1 — N | `posts.user_id` (FK, sans cascade) |
| Topic — Post | 1 — N | `posts.topic_id` (FK, cascade `ALL` côté JPA Topic→Post) |
| Post — Comment | 1 — N | `comments.post_id` (FK, cascade `ALL` côté JPA Post→Comment) |
| User — Comment | 1 — N | `comments.user_id` (FK, sans cascade) |
| User — Topic | N — N | Table de jointure `subscriptions` (`ON DELETE CASCADE` en base, sans cascade JPA) |
