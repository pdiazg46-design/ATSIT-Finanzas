const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'finance.db');
const db = new Database(dbPath);

console.log('Adding audit trail columns to database...');

try {
    // Add columns to projects table
    db.exec(`
        ALTER TABLE projects ADD COLUMN observations TEXT;
    `);
    console.log('✓ Added observations column to projects table');
} catch (err) {
    if (err.message.includes('duplicate column name')) {
        console.log('✓ observations column already exists in projects table');
    } else {
        console.error('Error adding observations to projects:', err.message);
    }
}

try {
    db.exec(`
        ALTER TABLE projects ADD COLUMN last_action_at TEXT;
    `);
    console.log('✓ Added last_action_at column to projects table');
} catch (err) {
    if (err.message.includes('duplicate column name')) {
        console.log('✓ last_action_at column already exists in projects table');
    } else {
        console.error('Error adding last_action_at to projects:', err.message);
    }
}

try {
    // Add columns to tasks table
    db.exec(`
        ALTER TABLE tasks ADD COLUMN observations TEXT;
    `);
    console.log('✓ Added observations column to tasks table');
} catch (err) {
    if (err.message.includes('duplicate column name')) {
        console.log('✓ observations column already exists in tasks table');
    } else {
        console.error('Error adding observations to tasks:', err.message);
    }
}

try {
    db.exec(`
        ALTER TABLE tasks ADD COLUMN last_action_at TEXT;
    `);
    console.log('✓ Added last_action_at column to tasks table');
} catch (err) {
    if (err.message.includes('duplicate column name')) {
        console.log('✓ last_action_at column already exists in tasks table');
    } else {
        console.error('Error adding last_action_at to tasks:', err.message);
    }
}

db.close();
console.log('\n✅ Migration completed successfully!');
