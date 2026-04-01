-- ============================================================
-- 003_create_products.sql
-- ============================================================
-- Products with category FK, stock tracking, and popularity.
-- avg_rating and total_sold support sorting by popularity.
-- ============================================================

CREATE TABLE IF NOT EXISTS products (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(255) NOT NULL,
  description TEXT,
  price       DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
  stock       INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
  image_url   VARCHAR(500),
  category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
  avg_rating  DECIMAL(3, 2) DEFAULT 0,
  total_sold  INTEGER NOT NULL DEFAULT 0,
  is_active   BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_price ON products(price);
CREATE INDEX idx_products_name ON products(name);
CREATE INDEX idx_products_active ON products(is_active);
