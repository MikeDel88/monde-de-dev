CREATE TABLE posts (
    post_id BIGINT AUTO_INCREMENT NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    date DATETIME(6) NOT NULL,
    user_id BIGINT NOT NULL,
    topic_id BIGINT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    updated_at TIMESTAMP NOT NULL DEFAULT now(),
    CONSTRAINT pk_posts PRIMARY KEY (post_id)
);

ALTER TABLE posts ADD CONSTRAINT fk_post_user FOREIGN KEY (user_id) REFERENCES users(user_id);
ALTER TABLE posts ADD CONSTRAINT fk_post_topic FOREIGN KEY (topic_id) REFERENCES topics(topic_id);
