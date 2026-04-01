-- ============================================================
-- 002_create_categories.sql
-- ============================================================

CREATE TABLE IF NOT EXISTS categories (
  id         SERIAL PRIMARY KEY,
  name       VARCHAR(100) NOT NULL UNIQUE,
  slug       VARCHAR(100) NOT NULL UNIQUE,
  created_at TIMESTAMP    NOT NULL DEFAULT NOW()
);
