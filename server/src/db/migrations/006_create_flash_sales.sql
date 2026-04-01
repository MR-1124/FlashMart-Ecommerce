-- ============================================================
-- 006_create_flash_sales.sql
-- ============================================================
-- Flash sales have a time window and their own stock/pricing.
-- flash_sale_items links products to a sale with a sale price
-- and limited stock independent of the product's regular stock.
-- ============================================================

CREATE TABLE IF NOT EXISTS flash_sales (
  id          SERIAL PRIMARY KEY,
  title       VARCHAR(255) NOT NULL,
  description TEXT,
  start_time  TIMESTAMP NOT NULL,
  end_time    TIMESTAMP NOT NULL,
  is_active   BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMP NOT NULL DEFAULT NOW(),
  CHECK (end_time > start_time)
);

CREATE TABLE IF NOT EXISTS flash_sale_items (
  id            SERIAL PRIMARY KEY,
  flash_sale_id INTEGER NOT NULL REFERENCES flash_sales(id) ON DELETE CASCADE,
  product_id    INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  sale_price    DECIMAL(10, 2) NOT NULL CHECK (sale_price >= 0),
  sale_stock    INTEGER NOT NULL DEFAULT 0 CHECK (sale_stock >= 0),
  sold_count    INTEGER NOT NULL DEFAULT 0 CHECK (sold_count >= 0),
  UNIQUE(flash_sale_id, product_id)
);

CREATE INDEX idx_flash_sales_time ON flash_sales(start_time, end_time);
CREATE INDEX idx_flash_sale_items_sale ON flash_sale_items(flash_sale_id);
