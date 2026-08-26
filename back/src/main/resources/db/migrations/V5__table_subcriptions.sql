create table subscriptions
(
    topic_id bigint not null,
    user_id    bigint not null
);

ALTER TABLE subscriptions ADD CONSTRAINT fk_subscription_user FOREIGN KEY (user_id) REFERENCES users(user_id);
ALTER TABLE subscriptions ADD CONSTRAINT fk_subscription_topic FOREIGN KEY (topic_id) REFERENCES topics(topic_id);
