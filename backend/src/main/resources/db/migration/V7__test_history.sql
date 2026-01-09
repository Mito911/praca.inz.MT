CREATE TABLE IF NOT EXISTS test_history (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL,
  user_id BIGINT NOT NULL,
  language_id BIGINT NOT NULL,
  category_id BIGINT NULL,
  mode VARCHAR(20) NOT NULL,
  direction VARCHAR(30) NOT NULL,
  total INT NOT NULL,
  correct INT NOT NULL
);

CREATE INDEX IF NOT EXISTS ix_test_history_user_created
  ON test_history(user_id, created_at DESC);
