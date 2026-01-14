const Database = require('better-sqlite3');
const { createClient } = require('@libsql/client');
const dotenv = require('dotenv');

dotenv.config();

// 1. Conectar a Base de Datos Local (Origen)
// Asumimos que la backup o la original se llama 'finance.db' antes de conectar la nube.
// Si ahora .db conecta a la nube, necesitamos que el usuario tenga el archivo local accesible.
// El usuario debería tener el archivo físico 'finance.db' en la carpeta.
const localDb = new Database('finance.db', { readonly: true });

// 2. Conectar a Base de Datos Nube (Destino)
const cloudClient = createClient({
    url: process.env.DATABASE_URL,
    authToken: process.env.DATABASE_AUTH_TOKEN
});

async function migrate() {
    console.log('--- Iniciando Migración de Datos ---');

    try {
        // --- Migrar Empleados ---
        const employees = localDb.prepare('SELECT * FROM employees').all();
        console.log(`Encontrados ${employees.length} empleados.`);
        for (const emp of employees) {
            await cloudClient.execute({
                sql: `INSERT INTO employees (id, first_name, last_name, organization, position, email, phone_mobile, phone_work, address, city, notes) 
                      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                      ON CONFLICT(id) DO NOTHING`,
                args: [emp.id, emp.first_name, emp.last_name, emp.organization, emp.position, emp.email, emp.phone_mobile, emp.phone_work, emp.address, emp.city, emp.notes]
            });
        }

        // --- Migrar Proyectos ---
        const projects = localDb.prepare('SELECT * FROM projects').all();
        console.log(`Encontrados ${projects.length} proyectos.`);
        for (const proj of projects) {
            await cloudClient.execute({
                sql: `INSERT INTO projects (id, name, description, owner_id, category, status, priority, start_date, end_date, expected_income, expected_utility, budget_days, notes, observations, last_action_at, is_archived) 
                      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                      ON CONFLICT(id) DO NOTHING`,
                args: [proj.id, proj.name, proj.description, proj.owner_id, proj.category, proj.status, proj.priority, proj.start_date, proj.end_date, proj.expected_income, proj.expected_utility, proj.budget_days, proj.notes, proj.observations, proj.last_action_at, proj.is_archived]
            });
        }

        // --- Migrar Movimientos y Documentos ---
        const movements = localDb.prepare('SELECT * FROM movements').all();
        for (const mov of movements) {
            await cloudClient.execute({
                sql: `INSERT INTO movements (id, name, type) VALUES (?, ?, ?) ON CONFLICT(id) DO NOTHING`,
                args: [mov.id, mov.name, mov.type]
            });
        }
        const documents = localDb.prepare('SELECT * FROM documents').all();
        for (const doc of documents) {
            await cloudClient.execute({
                sql: `INSERT INTO documents (id, name) VALUES (?, ?) ON CONFLICT(id) DO NOTHING`,
                args: [doc.id, doc.name]
            });
        }

        // --- Migrar Tareas ---
        const tasks = localDb.prepare('SELECT * FROM tasks').all();
        console.log(`Encontrados ${tasks.length} tareas/movimientos.`);
        for (const task of tasks) {
            await cloudClient.execute({
                sql: `INSERT INTO tasks (id, project_id, title, employee_id, movement_id, document_id, doc_number, status, net_value, tax_value, total_value, cost_days, start_date, due_date, payment_date, description, observations, last_action_at) 
                      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                      ON CONFLICT(id) DO NOTHING`,
                args: [task.id, task.project_id, task.title, task.employee_id, task.movement_id, task.document_id, task.doc_number, task.status, task.net_value, task.tax_value, task.total_value, task.cost_days, task.start_date, task.due_date, task.payment_date, task.description, task.observations, task.last_action_at]
            });
        }

        // --- Migrar Pagos IVA ---
        const vatPayments = localDb.prepare('SELECT * FROM vat_payments').all();
        console.log(`Encontrados ${vatPayments.length} pagos de IVA.`);
        for (const pay of vatPayments) {
            await cloudClient.execute({
                sql: `INSERT INTO vat_payments (id, payment_date, amount, notes, created_at) 
                      VALUES (?, ?, ?, ?, ?)
                      ON CONFLICT(id) DO NOTHING`,
                args: [pay.id, pay.payment_date, pay.amount, pay.notes, pay.created_at]
            });
        }


        console.log('--- Migración Completada Exitosamente ---');

    } catch (e) {
        console.error('Error durante la migración:', e);
    }
}

migrate();
