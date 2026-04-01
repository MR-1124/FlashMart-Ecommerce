// ============================================================
// src/db/seed.js — Seed database with demo data
// ============================================================
// Creates an admin user, categories, and ~20 products.
// Safe to re-run (uses INSERT ... ON CONFLICT DO NOTHING).
// Run with: npm run seed
// ============================================================

const bcrypt = require('bcryptjs');
const { pool } = require('../config/db');

async function seed() {
  console.log('🌱 Seeding database...\n');

  // ---------- Admin User ----------
  const adminPassword = await bcrypt.hash('Admin@123', 12);
  await pool.query(
    `INSERT INTO users (name, email, password_hash, role)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (email) DO NOTHING`,
    ['Admin', 'admin@flashmart.com', adminPassword, 'admin']
  );
  console.log('  ✅ Admin user created (admin@flashmart.com / Admin@123)');

  // ---------- Demo User ----------
  const userPassword = await bcrypt.hash('User@123', 12);
  await pool.query(
    `INSERT INTO users (name, email, password_hash, role)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (email) DO NOTHING`,
    ['John Doe', 'user@flashmart.com', userPassword, 'user']
  );
  console.log('  ✅ Demo user created (user@flashmart.com / User@123)');

  // ---------- Categories ----------
  const categories = [
    { name: 'Electronics', slug: 'electronics' },
    { name: 'Fashion', slug: 'fashion' },
    { name: 'Home & Living', slug: 'home-living' },
    { name: 'Sports & Outdoors', slug: 'sports-outdoors' },
    { name: 'Books & Stationery', slug: 'books-stationery' },
  ];

  for (const cat of categories) {
    await pool.query(
      `INSERT INTO categories (name, slug)
       VALUES ($1, $2)
       ON CONFLICT (name) DO NOTHING`,
      [cat.name, cat.slug]
    );
  }
  console.log(`  ✅ ${categories.length} categories created`);

  // ---------- Get category IDs ----------
  const catResult = await pool.query('SELECT id, slug FROM categories ORDER BY id');
  const catMap = {};
  for (const row of catResult.rows) {
    catMap[row.slug] = row.id;
  }

  // ---------- Products ----------
  const products = [
    // Electronics
    { name: 'Wireless Bluetooth Earbuds Pro', description: 'Premium noise-cancelling earbuds with 30-hour battery life, deep bass, and crystal-clear calls. IPX5 waterproof.', price: 2999, stock: 150, category: 'electronics', image_url: '/images/earbuds.jpg' },
    { name: 'Smart Watch Ultra', description: 'Advanced fitness tracking with heart rate monitor, GPS, SpO2 sensor, and 14-day battery life. AMOLED display.', price: 4999, stock: 80, category: 'electronics', image_url: '/images/smartwatch.jpg' },
    { name: 'USB-C Fast Charger 65W', description: 'GaN technology charger compatible with laptops, phones, and tablets. Compact foldable design.', price: 1499, stock: 200, category: 'electronics', image_url: '/images/charger.jpg' },
    { name: 'Mechanical Gaming Keyboard', description: 'RGB backlit mechanical keyboard with Cherry MX switches, programmable macros, and aluminum frame.', price: 3499, stock: 60, category: 'electronics', image_url: '/images/keyboard.jpg' },
    { name: 'Portable Bluetooth Speaker', description: '360° surround sound with 20W output, waterproof IPX7, and 12-hour playtime. Perfect for outdoors.', price: 1999, stock: 120, category: 'electronics', image_url: '/images/speaker.jpg' },

    // Fashion
    { name: 'Classic Denim Jacket', description: 'Timeless medium-wash denim jacket with brass buttons, chest pockets, and comfortable stretch fit.', price: 2499, stock: 100, category: 'fashion', image_url: '/images/denim-jacket.jpg' },
    { name: 'Premium Cotton T-Shirt Pack (3)', description: 'Set of 3 100% organic cotton t-shirts in black, white, and grey. Minimal design, premium quality.', price: 999, stock: 300, category: 'fashion', image_url: '/images/tshirt-pack.jpg' },
    { name: 'Running Shoes Air Max', description: 'Lightweight mesh running shoes with responsive cushioning, breathable design, and durable rubber sole.', price: 3999, stock: 75, category: 'fashion', image_url: '/images/running-shoes.jpg' },
    { name: 'Leather Crossbody Bag', description: 'Genuine leather crossbody bag with adjustable strap, multiple compartments, and brass hardware.', price: 1799, stock: 90, category: 'fashion', image_url: '/images/crossbody-bag.jpg' },

    // Home & Living
    { name: 'Aromatherapy Essential Oil Diffuser', description: 'Ultrasonic cool mist diffuser with colour-changing LED lights, timer, and auto shut-off. 300ml capacity.', price: 1299, stock: 130, category: 'home-living', image_url: '/images/diffuser.jpg' },
    { name: 'Memory Foam Pillow Set (2)', description: 'Contoured memory foam pillows with cooling gel layer from breathable bamboo covers. Ergonomic support.', price: 1999, stock: 110, category: 'home-living', image_url: '/images/pillows.jpg' },
    { name: 'Stainless Steel Water Bottle 1L', description: 'Double-wall vacuum insulated bottle keeps drinks cold 24h or hot 12h. BPA-free, leak-proof design.', price: 699, stock: 250, category: 'home-living', image_url: '/images/water-bottle.jpg' },
    { name: 'Smart LED Desk Lamp', description: 'Eye-care desk lamp with 5 brightness levels, 3 color temperatures, USB charging port, and touch controls.', price: 1599, stock: 85, category: 'home-living', image_url: '/images/desk-lamp.jpg' },

    // Sports & Outdoors
    { name: 'Yoga Mat Premium 6mm', description: 'Non-slip TPE yoga mat with alignment lines, carrying strap, and antimicrobial surface. Eco-friendly.', price: 899, stock: 180, category: 'sports-outdoors', image_url: '/images/yoga-mat.jpg' },
    { name: 'Resistance Bands Set (5)', description: 'Set of 5 latex resistance bands with different resistance levels. Includes door anchor and carry bag.', price: 599, stock: 220, category: 'sports-outdoors', image_url: '/images/resistance-bands.jpg' },
    { name: 'Camping Headlamp Rechargeable', description: '1000 lumens rechargeable headlamp with motion sensor, red light mode, and USB-C charging. IPX6.', price: 799, stock: 140, category: 'sports-outdoors', image_url: '/images/headlamp.jpg' },
    { name: 'Insulated Hiking Backpack 40L', description: 'Durable nylon hiking backpack with hydration bladder compartment, rain cover, and padded straps.', price: 2799, stock: 55, category: 'sports-outdoors', image_url: '/images/hiking-backpack.jpg' },

    // Books & Stationery
    { name: 'The Pragmatic Programmer', description: 'Classic guide to software craftsmanship. Covers best practices, design patterns, and career advice for developers.', price: 499, stock: 200, category: 'books-stationery', image_url: '/images/pragmatic-programmer.jpg' },
    { name: 'Premium Notebook Set (3)', description: 'A5 hardcover notebooks with 200 pages each, dotted grid, ribbon bookmark, and pen holder. Acid-free paper.', price: 349, stock: 350, category: 'books-stationery', image_url: '/images/notebook-set.jpg' },
    { name: 'Japanese Brush Pen Set', description: 'Set of 12 brush pens with flexible nylon tips. Vibrant archival ink, ideal for lettering and illustration.', price: 449, stock: 170, category: 'books-stationery', image_url: '/images/brush-pen-set.jpg' },
  ];

  for (const product of products) {
    await pool.query(
      `INSERT INTO products (name, description, price, stock, image_url, category_id, total_sold, avg_rating)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT DO NOTHING`,
      [
        product.name,
        product.description,
        product.price,
        product.stock,
        product.image_url,
        catMap[product.category],
        Math.floor(Math.random() * 500),        // random total_sold for demo
        (3.5 + Math.random() * 1.5).toFixed(2),  // random rating 3.5–5.0
      ]
    );
  }
  console.log(`  ✅ ${products.length} products created`);

  // ---------- Flash Sale (demo — starts now, ends in 24h) ----------
  const now = new Date();
  const endTime = new Date(now.getTime() + 24 * 60 * 60 * 1000);

  const saleResult = await pool.query(
    `INSERT INTO flash_sales (title, description, start_time, end_time, is_active)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id`,
    [
      'Mega Flash Sale 🔥',
      'Up to 50% off on selected electronics and fashion! Limited stock only.',
      now.toISOString(),
      endTime.toISOString(),
      true,
    ]
  );
  const saleId = saleResult.rows[0].id;

  // Add some products to the flash sale with discounted prices
  const flashProducts = await pool.query(
    `SELECT id, price FROM products WHERE category_id = $1 LIMIT 4`,
    [catMap['electronics']]
  );

  for (const fp of flashProducts.rows) {
    const salePrice = (fp.price * 0.6).toFixed(2); // 40% off
    await pool.query(
      `INSERT INTO flash_sale_items (flash_sale_id, product_id, sale_price, sale_stock, sold_count)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT DO NOTHING`,
      [saleId, fp.id, salePrice, 20, 0]
    );
  }
  console.log('  ✅ Flash sale created with 4 discounted products');

  console.log('\n✅ Seeding completed successfully!');
  await pool.end();
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
