-- ============================================================
-- 005_create_orders.sql
-- ============================================================
-- Orders + order_items. The unit_price is captured at purchase
-- time so that future price changes don't affect past orders.
-- ============================================================

CREATE TABLE IF NOT EXISTS orders (
  id               SERIAL PRIMARY KEY,
  user_id          INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  total_amount     DECIMAL(10, 2) NOT NULL CHECK (total_amount >= 0),
  status           VARCHAR(30) NOT NULL DEFAULT 'pending'
                   CHECK (status IN ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled')),
  shipping_address TEXT NOT NULL,
  phone            VARCHAR(20) NOT NULL,
  created_at       TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS order_items (
  id         SERIAL PRIMARY KEY,
  order_id   INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE SET NULL,
  quantity   INTEGER NOT NULL CHECK (quantity > 0),
  unit_price DECIMAL(10, 2) NOT NULL,
  subtotal   DECIMAL(10, 2) NOT NULL
);

CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_order_items_order ON order_items(order_id);
