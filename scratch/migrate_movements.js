const { createClient } = require('@libsql/client');

async function run() {
    const client = createClient({
        url: 'file:finance.db'
    });

    console.log('--- MIGRACIÓN Y ESTANDARIZACIÓN DE MOVIMIENTOS ---');

    try {
        // 1. Verificación de seguridad para tareas vinculadas a Ahorro 10% (ID 67)
        console.log('1. Verificando tareas asociadas a "Ahorro 10%" (ID 67)...');
        const tasksWithAhorro = await client.execute('SELECT COUNT(*) as count FROM tasks WHERE movement_id = 67');
        const countAhorro = tasksWithAhorro.rows[0].count || 0;
        
        if (countAhorro > 0) {
            console.log(`   ⚠ Se encontraron ${countAhorro} tareas vinculadas a Ahorro 10%. Reasignándolas a "Otros Gastos" (ID 64)...`);
            await client.execute('UPDATE tasks SET movement_id = 64 WHERE movement_id = 67');
            console.log('   ✓ Tareas reasignadas.');
        } else {
            console.log('   ✓ Ninguna tarea vinculada a Ahorro 10%.');
        }

        // 2. Ejecutar actualizaciones de nombres y tipos
        console.log('2. Actualizando movimientos en base de datos...');
        
        const updates = [
            { id: 60, name: 'Servicios Profesionales / Contratistas', type: 'Gasto' },
            { id: 62, name: 'Remuneraciones / Honorarios', type: 'Gasto' },
            { id: 63, name: 'Materiales / Insumos', type: 'Gasto' },
            { id: 64, name: 'Otros Gastos', type: 'Gasto' },
            { id: 65, name: 'Gastos de Oficina / Gastos Comunes', type: 'Gasto' },
            { id: 66, name: 'Venta Materiales / Servicios', type: 'Ingreso' },
            { id: 68, name: 'Gastos Financieros', type: 'Gasto' },
            { id: 69, name: 'Aporte de Capital', type: 'Ingreso' },
            { id: 70, name: 'Otros Ingresos', type: 'Ingreso' } // Cambio de Gasto a Ingreso
        ];

        for (const upd of updates) {
            console.log(`   → Seteando ID ${upd.id} a "${upd.name}" (${upd.type})...`);
            await client.execute({
                sql: 'UPDATE movements SET name = ?, type = ? WHERE id = ?',
                args: [upd.name, upd.type, upd.id]
            });
        }
        console.log('   ✓ Movimientos actualizados con éxito.');

        // 3. Eliminar definitivamente el tipo de movimiento Ahorro 10%
        console.log('3. Eliminando el tipo de movimiento "Ahorro 10%" (ID 67)...');
        await client.execute('DELETE FROM movements WHERE id = 67');
        console.log('   ✓ Tipo de movimiento "Ahorro 10%" eliminado de la base de datos.');

        // 4. Mostrar el catálogo final
        console.log('\n--- CATÁLOGO FINAL DE MOVIMIENTOS ---');
        const finalMovements = await client.execute('SELECT * FROM movements ORDER BY type DESC, name ASC');
        console.table(finalMovements.rows);

    } catch (error) {
        console.error('❌ Error en la migración:', error);
    } finally {
        await client.close();
    }
}

run().catch(console.error);
