require('dotenv').config();
const { createClient } = require('@libsql/client');

const client = createClient({
    url: process.env.DATABASE_URL.replace('libsql://', 'https://'),
    authToken: process.env.DATABASE_AUTH_TOKEN.replace(/^['"]|['"]$/g, ''),
});

async function main() {
    try {
        const rs = await client.execute({
            sql: "SELECT t.id, t.title, t.net_value, t.tax_value, t.total_value, m.name as movement_name, m.type as movement_type FROM tasks t LEFT JOIN movements m ON t.movement_id = m.id WHERE t.project_id = 83",
            args: []
        });
        
        const tasks = rs.rows;
        
        console.log("=== Análisis de Montos de Sky Costanera ===");
        console.log("Total de registros:", tasks.length);

        let sumNet = 0;
        let sumTotal = 0;
        let sumNetOnlyVisibleInPbi = 0;

        // Lista de conceptos que aparecen en la foto de Power BI
        const visibleConcepts = [
            "ahorro 10%", "cuadratura de caja", "Alimentación equipo montaje", "Alimentación Snak ", 
            "Bebestibles montaje", "compra corchetera", "Desde Sky a casa andrea y fran", "Pago FLETE 1 ",
            "UBER casa Fran a sky ", "uber compra materiales", "Uber de casa a Lotus ", "Uber de Lotus a casa ",
            "Uber desde sky a casa ANDREA", "Uber desde sky FRAN Y PANCA", "Uber desde taller a sky ", "Uber sky Panca "
        ];

        tasks.forEach(t => {
            sumNet += t.net_value || 0;
            sumTotal += t.total_value || 0;

            const isVisible = visibleConcepts.some(c => t.title.toLowerCase().trim() === c.toLowerCase().trim());
            if (isVisible) {
                sumNetOnlyVisibleInPbi += t.net_value || 0;
            }
        });

        console.log("Suma Total de net_value (todos los movimientos):", sumNet);
        console.log("Suma Total de total_value (todos los movimientos):", sumTotal);
        console.log("Suma de net_value de los mostrados en la captura de Power BI:", sumNetOnlyVisibleInPbi);

        // Agrupación por tipo de movimiento
        const byMovementName = {};
        tasks.forEach(t => {
            const key = `${t.movement_name} (${t.movement_type})`;
            if (!byMovementName[key]) {
                byMovementName[key] = { net: 0, total: 0, count: 0 };
            }
            byMovementName[key].net += t.net_value || 0;
            byMovementName[key].total += t.total_value || 0;
            byMovementName[key].count++;
        });

        console.log("\nResumen por Tipo de Movimiento (Suma net_value):");
        console.log(JSON.stringify(byMovementName, null, 2));

    } catch (e) {
        console.error("Error:", e);
    } finally {
        client.close();
    }
}

main();
