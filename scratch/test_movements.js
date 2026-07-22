const { createClient } = require('@libsql/client');

async function main() {
    const client = createClient({
        url: 'file:finance.db'
    });

    console.log('--- AUDITORÍA DE TIPOS DE MOVIMIENTOS ---');

    const movements = await client.execute('SELECT * FROM movements');
    console.log('\nMovements in Database:');
    console.table(movements.rows);

    const taskCounts = await client.execute(`
        SELECT m.id, m.name, m.type, COUNT(t.id) as task_count
        FROM movements m
        LEFT JOIN tasks t ON t.movement_id = m.id
        GROUP BY m.id
    `);
    console.log('\nTasks associated with each movement:');
    console.table(taskCounts.rows);

    const ahorroTasks = await client.execute(`
        SELECT t.id, t.title, p.name as project_name, t.net_value
        FROM tasks t
        JOIN projects p ON t.project_id = p.id
        JOIN movements m ON t.movement_id = m.id
        WHERE m.name LIKE '%Ahorro%'
    `);
    console.log('\nTasks details for Ahorro 10%:');
    console.table(ahorroTasks.rows);

    await client.close();
}

main().catch(console.error);
