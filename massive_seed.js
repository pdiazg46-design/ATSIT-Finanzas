const { drizzle } = require('drizzle-orm/better-sqlite3');
const Database = require('better-sqlite3');
const { projects, employees, movements, documents, tasks } = require('./lib/schema_cjs');

const sqlite = new Database('finance.db');
const db = drizzle(sqlite);

async function seed() {
    console.log('--- REINICIANDO BASE DE DATOS ---');

    // 1. Limpieza total (Orden para respetar FK)
    db.delete(tasks).run();
    db.delete(projects).run();
    db.delete(employees).run();
    db.delete(movements).run();
    db.delete(documents).run();
    console.log('✓ Base de datos limpiada.');

    // 2. Crear Empleados solicitados
    const empFran = await db.insert(employees).values({
        firstName: 'Francisca',
        lastName: 'Díaz',
        organization: 'Tangente',
        position: 'Socio',
        email: 'fran@tangente.cl'
    }).returning().get();

    const empAndrea = await db.insert(employees).values({
        firstName: 'Andrea',
        lastName: 'Rodriguez',
        organization: 'Constructora Beta',
        position: 'Arquitecta'
    }).returning().get();

    const emps = [empFran, empAndrea];
    console.log('✓ Empleados creados: Francisca y Andrea.');

    // 3. Crear Movimientos y Documentos
    const movList = [
        { name: 'Servicios Profesionales', type: 'Gasto' },
        { name: 'Retiro', type: 'Gasto' },
        { name: 'Mano de obra', type: 'Gasto' },
        { name: 'Materiales', type: 'Gasto' },
        { name: 'Gastos Varios', type: 'Gasto' },
        { name: 'Insumos Oficina', type: 'Gasto' },
        { name: 'Venta de Proyecto', type: 'Ingreso' }
    ];
    const createdMovements = await Promise.all(
        movList.map(m => db.insert(movements).values(m).returning().get())
    );

    const docList = [
        'Factura Electrónica',
        'Boleta',
        'Boleta Honorarios',
        'Comprobante Pago',
        'Transferencia'
    ];
    const createdDocs = await Promise.all(
        docList.map(name => db.insert(documents).values({ name }).returning().get())
    );
    console.log('✓ Movimientos y documentos base creados.');

    // 4. Crear 15 Proyectos Pilotos
    const projectList = [];
    const categories = ['Habitacional', 'Comercial', 'Remodelación', 'Diseño', 'Consultoría'];

    for (let i = 1; i <= 3; i++) {
        const owner = emps[Math.floor(Math.random() * emps.length)];
        const income = Math.floor(Math.random() * 8000000) + 2000000;

        const proj = await db.insert(projects).values({
            name: `Proyecto Piloto ${i.toString().padStart(2, '0')}`,
            description: `Simulación de proyecto ${categories[i % categories.length]} para pruebas masivas.`,
            ownerId: owner.id,
            category: categories[i % categories.length],
            expectedIncome: income,
            expectedUtility: income * 0.3,
            startDate: `01-01-2025`,
            status: Math.random() > 0.2 ? 'En curso' : 'Completado',
            observations: Math.random() > 0.5 ? 'Observación de prueba: Este proyecto tiene notas importantes sobre su ejecución financiera.' : null,
            lastActionAt: `2025-01-${(Math.floor(Math.random() * 20) + 1).toString().padStart(2, '0')} 10:00:00`
        }).returning().get();
        projectList.push(proj);
    }
    console.log('✓ 3 proyectos pilotos creados.');

    // 5. Crear 500 Tareas/Movimientos
    console.log('Generando 500 tareas (esto puede tomar unos segundos)...');

    const concepts = [
        'Pago proveedores', 'Anticipo materiales', 'Honorarios especialistas',
        'Gasto farmacia', 'Almuerzo equipo', 'Flete materiales', 'Compra herramientas',
        'Ingreso etapa 1', 'Ingreso aprobación plano', 'Retiro personal', 'Sueldo cuadrilla'
    ];

    for (let i = 0; i < 500; i++) {
        const proj = projectList[Math.floor(Math.random() * projectList.length)];
        const emp = emps[Math.floor(Math.random() * emps.length)];
        const mov = createdMovements[Math.floor(Math.random() * createdMovements.length)];
        const doc = createdDocs[Math.floor(Math.random() * createdDocs.length)];

        // Determinar si es ingreso o gasto (85% gastos, 15% ingresos)
        const isIncome = Math.random() > 0.85;

        let netValue;
        if (isIncome) {
            // Ingresos entre 500.000 y 3.000.000
            netValue = Math.floor(Math.random() * 2500000) + 500000;
        } else {
            // Gastos entre 10.000 y 200.000 (negativo)
            const expense = Math.floor(Math.random() * 190000) + 10000;
            netValue = -expense;
        }

        // 19% IVA solo si es Factura Electrónica (id 1 en docList habitualmente)
        const taxValue = doc.name === 'Factura Electrónica' ? Math.round(netValue * 0.19) : 0;
        const totalValue = netValue + taxValue;

        await db.insert(tasks).values({
            projectId: proj.id,
            title: concepts[Math.floor(Math.random() * concepts.length)] + ' #' + i,
            employeeId: emp.id,
            movementId: mov.id,
            documentId: doc.id,
            docNumber: Math.floor(Math.random() * 99999).toString(),
            status: 'Completado',
            netValue: netValue,
            taxValue: taxValue,
            totalValue: totalValue,
            startDate: `10-01-2025`,
            paymentDate: `10-01-2025`,
            observations: Math.random() > 0.7 ? 'Tarea con observación pendiente.' : null,
            lastActionAt: `2025-01-${(Math.floor(Math.random() * 20) + 1).toString().padStart(2, '0')} 14:30:00`
        });
    }

    console.log('✓ 500 tareas generadas exitosamente.');
    console.log('--- SEED MASIVO COMPLETADO ---');
}

seed().catch(err => {
    console.error('Error durante el seed:', err);
    process.exit(1);
});
