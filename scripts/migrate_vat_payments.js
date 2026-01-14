const Database = require('better-sqlite3');
const db = new Database('finance.db');

console.log('Running migration: create vat_payments table...');

try {
    db.prepare(`
      CREATE TABLE IF NOT EXISTS vat_payments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        payment_date TEXT NOT NULL,
        amount REAL NOT NULL DEFAULT 0,
        notes TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `).run();
    console.log('Migration completed successfully.');
} catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
}
