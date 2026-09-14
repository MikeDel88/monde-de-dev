CREATE INDEX idx_posts_topic_post_id ON posts (topic_id, post_id DESC);
DROP INDEX idx_posts_topic_date_post_id ON posts;
