const Database = require('better-sqlite3');
const db = new Database('finance.db');

console.log('Testing VAT DB CRUD...');
try {
    // 1. Insert
    const info = db.prepare("INSERT INTO vat_payments (payment_date, amount, notes) VALUES (?, ?, ?)").run('2023-01-01', 1000, 'Original Note');
    const id = info.lastInsertRowid;
    console.log('Inserted ID:', id);

    // 2. Update
    db.prepare("UPDATE vat_payments SET amount = ?, notes = ? WHERE id = ?").run(2000, 'Updated Note', id);
    const updated = db.prepare("SELECT * FROM vat_payments WHERE id = ?").get(id);
    console.log('Updated Row:', updated);

    if (updated.amount !== 2000 || updated.notes !== 'Updated Note') {
        throw new Error('Update failed');
    }

    // 3. Delete
    db.prepare("DELETE FROM vat_payments WHERE id = ?").run(id);
    const deleted = db.prepare("SELECT * FROM vat_payments WHERE id = ?").get(id);
    console.log('Deleted Row (should be undefined):', deleted);

    if (deleted) {
        throw new Error('Delete failed');
    }

    console.log('CRUD Test Passed!');
} catch (e) {
    console.error('Error:', e);
}
