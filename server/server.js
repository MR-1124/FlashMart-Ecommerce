// ============================================================
// server.js — Entry point
// ============================================================
// Starts the Express server on the configured port.
// Separated from app.js so the app can be imported for testing.
// ============================================================

const app = require('./src/app');
const config = require('./src/config/env');

const PORT = config.port;

app.listen(PORT, () => {
  console.log(`
  ⚡ FlashMart API Server
  ─────────────────────────
  🌐 URL:         http://localhost:${PORT}
  🏥 Health:      http://localhost:${PORT}/api/health
  📦 Environment: ${config.nodeEnv}
  ─────────────────────────
  `);
});
