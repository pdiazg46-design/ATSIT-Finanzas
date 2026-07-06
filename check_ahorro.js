require('dotenv').config();
const { createClient } = require('@libsql/client');

const client = createClient({
    url: process.env.DATABASE_URL.replace('libsql://', 'https://'),
    authToken: process.env.DATABASE_AUTH_TOKEN.replace(/^['"]|['"]$/g, ''),
});

async function main() {
    try {
        // 1. Obtener la información del proyecto "Ahorro 10%"
        const resProj = await client.execute("SELECT id, name, is_archived FROM projects WHERE name LIKE '%Ahorro%'");
        console.log("Proyectos encontrados:");
        console.log(resProj.rows);

        // 2. Obtener los tipos de movimientos con nombre "Ahorro 10%"
        const resMov = await client.execute("SELECT id, name, type FROM movements WHERE name LIKE '%Ahorro%'");
        console.log("\nTipos de Movimientos encontrados:");
        console.log(resMov.rows);

        // 3. Contar tareas del proyecto Ahorro 10% (ID 77) por año
        const resTasksByYear = await client.execute(`
            SELECT 
                strftime('%Y', start_date) as year,
                COUNT(*) as count,
                SUM(net_value) as sum_net,
                SUM(total_value) as sum_total
            FROM tasks 
            WHERE project_id = 77
            GROUP BY year
        `);
        console.log("\nTareas del proyecto ID 77 por año:");
        console.log(resTasksByYear.rows);

        // 4. Sumar tareas del proyecto ID 77 que ocurrieron en 2026
        const resTasks2026 = await client.execute(`
            SELECT 
                COUNT(*) as count,
                SUM(CASE WHEN net_value > 0 THEN net_value ELSE 0 END) as income_net,
                SUM(CASE WHEN net_value < 0 THEN ABS(net_value) ELSE 0 END) as expense_net
            FROM tasks
            WHERE project_id = 77 AND start_date BETWEEN '2026-01-01' AND '2026-12-31'
        `);
        console.log("\nSuma de tareas de 2026 del proyecto ID 77:");
        console.log(resTasks2026.rows);

        // 5. Ver si hay tareas asociadas a proyectos archivados o si el proyecto ID 77 tiene más tareas de las que creemos
        const resTasksAll = await client.execute(`
            SELECT 
                COUNT(*) as count,
                SUM(CASE WHEN net_value > 0 THEN net_value ELSE 0 END) as income_net,
                SUM(CASE WHEN net_value < 0 THEN ABS(net_value) ELSE 0 END) as expense_net
            FROM tasks
            WHERE project_id = 77
        `);
        console.log("\nSuma de TODAS las tareas del proyecto ID 77 (histórico):");
        console.log(resTasksAll.rows);

    } catch (e) {
        console.error("Error:", e);
    } finally {
        client.close();
    }
}

main();
