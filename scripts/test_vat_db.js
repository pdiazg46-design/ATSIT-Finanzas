const Database = require('better-sqlite3');
const db = new Database('finance.db');

console.log('Testing VAT DB...');
try {
    const info = db.prepare("INSERT INTO vat_payments (payment_date, amount, notes) VALUES (?, ?, ?)").run('2023-01-01', 1000, 'Test Note');
    console.log('Inserted row:', info);
    const rows = db.prepare("SELECT * FROM vat_payments ORDER BY id DESC LIMIT 1").all();
    console.log('Retrieved rows:', rows);
    // Cleanup
    db.prepare("DELETE FROM vat_payments WHERE id = ?").run(info.lastInsertRowid);
    console.log('Cleaned up test row.');
} catch (e) {
    console.error('Error:', e);
}
