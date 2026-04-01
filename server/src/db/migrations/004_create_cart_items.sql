-- ============================================================
-- 004_create_cart_items.sql
-- ============================================================
-- Cart is stored in the DB (not localStorage) so it persists
-- across devices. Unique constraint prevents duplicate entries.
-- ============================================================

CREATE TABLE IF NOT EXISTS cart_items (
  id         SERIAL PRIMARY KEY,
  user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity   INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

CREATE INDEX idx_cart_user ON cart_items(user_id);
