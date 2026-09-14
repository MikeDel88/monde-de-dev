CREATE INDEX idx_posts_topic_date_post_id ON posts (topic_id, date DESC, post_id DESC);
