CREATE TABLE comments (
    comment_id BIGINT AUTO_INCREMENT NOT NULL,
    content TEXT NOT NULL,
    date DATETIME(6) NOT NULL,
    user_id BIGINT NOT NULL,
    post_id BIGINT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    updated_at TIMESTAMP NOT NULL DEFAULT now(),
    CONSTRAINT pk_comments PRIMARY KEY (comment_id)
);

ALTER TABLE comments ADD CONSTRAINT fk_comment_user FOREIGN KEY (user_id) REFERENCES users(user_id);
ALTER TABLE comments ADD CONSTRAINT fk_comment_post FOREIGN KEY (post_id) REFERENCES posts(post_id);
