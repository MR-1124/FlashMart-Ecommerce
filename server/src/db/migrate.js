// ============================================================
// src/db/migrate.js — Database migration runner
// ============================================================
// Reads all .sql files from the migrations/ folder in order
// and executes them. Uses IF NOT EXISTS so it's safe to re-run.
// Run with: npm run migrate
// ============================================================

const fs = require('fs');
const path = require('path');
const { pool } = require('../config/db');

async function migrate() {
  const migrationsDir = path.join(__dirname, 'migrations');
  const files = fs.readdirSync(migrationsDir)
    .filter((f) => f.endsWith('.sql'))
    .sort();

  console.log(`📋 Found ${files.length} migration files\n`);

  for (const file of files) {
    const filePath = path.join(migrationsDir, file);
    const sql = fs.readFileSync(filePath, 'utf-8');

    try {
      await pool.query(sql);
      console.log(`  ✅ ${file}`);
    } catch (err) {
      console.error(`  ❌ ${file}: ${err.message}`);
      process.exit(1);
    }
  }

  console.log('\n✅ All migrations completed successfully!');
  await pool.end();
  process.exit(0);
}

migrate();
