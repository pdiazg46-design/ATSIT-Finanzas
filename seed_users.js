const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');

const db = new Database('finance.db');

async function main() {
    // 1. Create table if not exists (in case schema migration hasn't run yet)
    db.prepare(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE,
            password TEXT NOT NULL,
            role TEXT DEFAULT 'user',
            created_at TEXT
        )
    `).run();

    // 2. Hash password
    const hashedPassword = await bcrypt.hash('123456', 10);
    const email = 'pdiazg46@gmail.com';

    // 3. Insert or Update Admin
    const info = db.prepare(`
        INSERT INTO users (name, email, password, role, created_at)
        VALUES (@name, @email, @password, 'admin', datetime('now'))
        ON CONFLICT(email) DO UPDATE SET password = @password
    `).run({
        name: 'Administrador',
        email: email,
        password: hashedPassword
    });

    console.log(`Usuario creado/actualizado: ${email}`);
    console.log('Password: (123456)');
}

main();
