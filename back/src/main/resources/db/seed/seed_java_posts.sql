-- Script de seed manuel (hors Flyway) : insere 200 posts sur le topic "Java" avec des created_at etalees sur les 2 dernieres annees.
-- Prerequis : au moins un utilisateur existant en base. Usage : mysql -u <user> -p <db> < seed_java_posts.sql

INSERT INTO posts (title, content, created_at, user_id, topic_id)
WITH RECURSIVE seq (n) AS (
    SELECT 1
    UNION ALL
    SELECT n + 1 FROM seq WHERE n < 200
)
SELECT
    CONCAT('Article Java #', n),
    CONCAT('Contenu de demonstration pour l''article Java numero ', n, '. Ce post a ete genere automatiquement a des fins de test.'),
    NOW(),
    (SELECT user_id FROM users ORDER BY user_id LIMIT 1),
    (SELECT topic_id FROM topics WHERE title = 'Java')
FROM seq;
