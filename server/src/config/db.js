// ============================================================
// src/config/db.js — PostgreSQL connection pool
// ============================================================
// Uses the 'pg' library's Pool class for connection pooling.
// A pool reuses connections instead of creating one per query,
// which is critical when behind an auto-scaling load balancer.
// ============================================================

const { Pool } = require('pg');
const config = require('./env');

const pool = new Pool({
  host: config.db.host,
  port: config.db.port,
  database: config.db.name,
  user: config.db.user,
  password: config.db.password,
  max: 20,              // max connections in pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

// Log successful connection (only once at startup)
pool.on('connect', () => {
  console.log('📦 Connected to PostgreSQL');
});

pool.on('error', (err) => {
  console.error('❌ PostgreSQL pool error:', err.message);
});

// Helper: run a single query
const query = (text, params) => pool.query(text, params);

// Helper: get a client from the pool (for transactions)
const getClient = () => pool.connect();

module.exports = { pool, query, getClient };
