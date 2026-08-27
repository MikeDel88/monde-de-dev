ALTER TABLE subscriptions DROP FOREIGN KEY fk_subscription_user;
ALTER TABLE subscriptions DROP FOREIGN KEY fk_subscription_topic;
ALTER TABLE subscriptions ADD CONSTRAINT fk_subscription_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE;
ALTER TABLE subscriptions ADD CONSTRAINT fk_subscription_topic FOREIGN KEY (topic_id) REFERENCES topics(topic_id) ON DELETE CASCADE;
