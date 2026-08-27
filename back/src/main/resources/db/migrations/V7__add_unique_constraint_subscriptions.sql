ALTER TABLE subscriptions ADD CONSTRAINT uq_subscriptions_topic_user UNIQUE (topic_id, user_id);
