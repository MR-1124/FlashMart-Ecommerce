// ============================================================
// src/routes/healthRoutes.js — Health check for ALB
// ============================================================
// The ALB pings this endpoint every 30s. If it returns 200,
// the instance is "healthy". If it fails, traffic is rerouted.
// Also returns basic server info useful for debugging which
// instance is responding.
// ============================================================

const { Router } = require('express');
const os = require('os');
const { pool } = require('../config/db');

const router = Router();

router.get('/', async (req, res) => {
  let dbStatus = 'connected';
  try {
    await pool.query('SELECT 1');
  } catch {
    dbStatus = 'disconnected';
  }

  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()) + 's',
    hostname: os.hostname(),
    database: dbStatus,
    memory: {
      used: Math.round(process.memoryUsage().rss / 1024 / 1024) + ' MB',
    },
  });
});

module.exports = router;
