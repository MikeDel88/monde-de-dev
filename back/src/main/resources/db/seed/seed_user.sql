-- Utilisateur de base requis par seed_java_posts.sql (qui rattache les posts au premier utilisateur trouve).
-- Mot de passe en clair : "Password123!" (hash bcrypt ci-dessous, compatible BCryptPasswordEncoder).
-- Idempotent : ne fait rien si l'email existe deja.

INSERT INTO users (name, email, password)
SELECT 'seed_user', 'seed@monde-de-dev.local', '$2y$10$AJKATYuzGVRq1cU3J8eny.D9xxrNEb1G7KYEZk8spJB0bt8lUJv32'
WHERE NOT EXISTS (
    SELECT 1 FROM users WHERE email = 'seed@monde-de-dev.local'
);
