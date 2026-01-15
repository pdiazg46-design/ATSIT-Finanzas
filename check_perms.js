const Database = require('better-sqlite3');
const db = new Database('finance.db');

const users = db.prepare("SELECT id, name, email, permissions FROM users").all();

console.log("--- USERS & PERMISSIONS ---");
users.forEach(u => {
    console.log(`User: ${u.name} (${u.email})`);
    console.log(`Permissions: ${u.permissions}`);
    console.log("---------------------------");
});
