const { drizzle } = require('drizzle-orm/better-sqlite3');
const Database = require('better-sqlite3');
const { projects, employees, movements, documents, tasks } = require('./lib/schema_cjs');

const sqlite = new Database('finance.db');
const db = drizzle(sqlite);

async function seed() {
    console.log('--- GENERANDO DATOS REALISTAS DE PRUEBA ---');

    console.log('1. Limpiando base de datos...');
    db.delete(tasks).run();
    db.delete(projects).run();
    db.delete(employees).run();
    db.delete(movements).run();
    db.delete(documents).run();

    console.log('2. Creando equipo...');
    const empFran = await db.insert(employees).values({
        firstName: 'Francisca', lastName: 'Díaz', organization: 'Tangente', position: 'Socio Director',
        email: 'fran@tangente.cl', city: 'Santiago'
    }).returning().get();

    const empPatricio = await db.insert(employees).values({
        firstName: 'Patricio', lastName: 'Díaz', organization: 'Tangente', position: 'Gerente Finanzas',
        city: 'Temuco'
    }).returning().get();

    const empAndrea = await db.insert(employees).values({
        firstName: 'Andrea', lastName: 'Rodriguez', organization: 'Constructora Beta', position: 'Arquitecta Residente',
        city: 'Valparaíso'
    }).returning().get();

    const emps = [empFran, empPatricio, empAndrea];

    console.log('3. Creando catálogo de movimientos y documentos...');
    const movs = {};
    const movDefinitions = [
        { name: 'Pago Cliente (Ingreso)', type: 'Ingreso' },
        { name: 'Servicios Profesionales', type: 'Gasto' },
        { name: 'Materiales Obra', type: 'Gasto' },
        { name: 'Mano de Obra', type: 'Gasto' },
        { name: 'Arriendo Maquinaria', type: 'Gasto' },
        { name: 'Gastos Generales', type: 'Gasto' },
        { name: 'Retiros Socios', type: 'Gasto' },
        { name: 'Caja Ingreso', type: 'Ingreso' },
        { name: 'Caja Gasto', type: 'Gasto' }
    ];

    for (const def of movDefinitions) {
        movs[def.name] = await db.insert(movements).values(def).returning().get();
    }

    const docs = {};
    const docDefinitions = ['Factura Electrónica', 'Boleta Honorarios', 'Transferencia', 'Vale Vista', 'Liquidación Sueldo'];

    for (const name of docDefinitions) {
        docs[name] = await db.insert(documents).values({ name }).returning().get();
    }

    console.log('4. Creando Proyectos...');

    // Proyecto 1: Remodelación (Rentable)
    const proj1 = await db.insert(projects).values({
        name: 'Remodelación Depto. Ñuñoa 404',
        description: 'Remodelación completa de cocina y baños. Cliente: Juan Pérez.',
        ownerId: empAndrea.id,
        category: 'Remodelación',
        status: 'En curso',
        startDate: '2025-11-15',
        expectedIncome: 8500000, // 8.5M
        expectedUtility: 2500000, // ~30%
        budgetDays: 45,
        observations: 'Cliente solicitó terminar antes del 15 de Enero. Ojo con proveedores de cerámica.',
        lastActionAt: '12/01/2026, 09:30:00'
    }).returning().get();

    // Proyecto 2: Asesoría (Alto margen)
    const proj2 = await db.insert(projects).values({
        name: 'Asesoría CityLab Santiago',
        description: 'Consultoría integral para habilitación de espacios de co-work.',
        ownerId: empFran.id,
        category: 'Consultoría',
        status: 'En curso',
        startDate: '2025-12-01',
        expectedIncome: 4500000,
        expectedUtility: 4000000,
        budgetDays: 10,
        observations: 'Reunión semanal los lunes a las 10:00.',
        lastActionAt: '11/01/2026, 16:45:00'
    }).returning().get();

    // Proyecto 3: Obra Civil (Complejo, gastos altos)
    const proj3 = await db.insert(projects).values({
        name: 'Habilitación Local Comercial Mall Plaza',
        description: 'Obra gruesa y terminaciones para local de comida rápida.',
        ownerId: empPatricio.id,
        category: 'Comercial',
        status: 'Retrasado',
        startDate: '2025-10-01',
        expectedIncome: 25000000,
        expectedUtility: 5000000,
        budgetDays: 60,
        observations: 'Problemas con permisos municipales. Retraso de 2 semanas.',
        lastActionAt: '10/01/2026, 11:20:00'
    }).returning().get();

    console.log('5. Generando Transacciones Financieras...');

    const transactions = [
        // --- Proyecto 1: Ñuñoa ---
        // Ingreso inicial
        {
            projectId: proj1.id, title: 'Anticipo 50%', employeeId: empFran.id, movementId: movs['Pago Cliente (Ingreso)'].id,
            documentId: docs['Factura Electrónica'].id, docNumber: '101', netValue: 4250000, taxValue: 807500,
            status: 'Completado', date: '2025-11-15'
        },
        // Gastos
        {
            projectId: proj1.id, title: 'Compra Cerámicas', employeeId: empAndrea.id, movementId: movs['Materiales Obra'].id,
            documentId: docs['Factura Electrónica'].id, docNumber: '77492', netValue: -1200000, taxValue: 0, // Compra con IVA incluido para simplificar o exento
            totalValue: -1428000, startDate: '2025-11-20', observations: 'Proveedor: Sodimac'
        },
        {
            projectId: proj1.id, title: 'Pago Maestro Pintor', employeeId: empAndrea.id, movementId: movs['Mano de Obra'].id,
            documentId: docs['Boleta Honorarios'].id, docNumber: '44', netValue: -500000, taxValue: -68750, // Retención
            status: 'Completado', date: '2025-11-25', observations: 'Avance 50% pintura'
        },

        // --- Proyecto 2: CityLab ---
        {
            projectId: proj2.id, title: 'Pago Hito 1', employeeId: empFran.id, movementId: movs['Pago Cliente (Ingreso)'].id,
            documentId: docs['Factura Electrónica'].id, docNumber: '102', netValue: 2000000, taxValue: 380000,
            status: 'Completado', date: '2025-12-05'
        },
        {
            projectId: proj2.id, title: 'Licencias Software', employeeId: empFran.id, movementId: movs['Gastos Generales'].id,
            documentId: docs['Factura Electrónica'].id, docNumber: 'INT-993', netValue: -150000,
            status: 'Completado', date: '2025-12-10'
        },

        // --- Proyecto 3: Mall Plaza (Movimientos grandes) ---
        {
            projectId: proj3.id, title: 'Anticipo Obra', employeeId: empPatricio.id, movementId: movs['Pago Cliente (Ingreso)'].id,
            documentId: docs['Transferencia'].id, docNumber: 'TR-5502', netValue: 10000000, taxValue: 0, // Exento por alguna razón simulada
            status: 'Completado', date: '2025-10-05'
        },
        {
            projectId: proj3.id, title: 'Pago Cuadrilla Sem 1', employeeId: empAndrea.id, movementId: movs['Mano de Obra'].id,
            documentId: docs['Liquidación Sueldo'].id, docNumber: 'LIQ-001', netValue: -2500000, taxValue: 0,
            status: 'Completado', date: '2025-10-15'
        },
        {
            projectId: proj3.id, title: 'Compra Materiales Gruesos', employeeId: empAndrea.id, movementId: movs['Materiales Obra'].id,
            documentId: docs['Factura Electrónica'].id, docNumber: 'FAC-3002', netValue: -4500000, taxValue: 0,
            totalValue: -5355000, // Con IVA
            status: 'Completado', date: '2025-10-20'
        }
    ];

    for (const t of transactions) {
        // Calcular IVA smart si no viene explicito
        let tax = 0;
        let total = 0;

        if (t.taxValue !== undefined && t.totalValue !== undefined) {
            tax = t.taxValue;
            total = t.totalValue;
        } else if (t.taxValue !== undefined) {
            tax = t.taxValue;
            total = t.netValue + tax;
        } else if (t.documentId === docs['Factura Electrónica'].id) {
            tax = Math.round(t.netValue * 0.19);
            total = t.netValue + tax;
        } else {
            total = t.netValue;
        }

        await db.insert(tasks).values({
            projectId: t.projectId,
            title: t.title,
            employeeId: t.employeeId,
            movementId: t.movementId,
            documentId: t.documentId,
            docNumber: t.docNumber || 'S/N',
            status: t.status || 'Completado',
            netValue: t.netValue,
            taxValue: tax,
            totalValue: total,
            startDate: t.startDate || t.date || new Date().toISOString(),
            paymentDate: t.paymentDate || t.date || new Date().toISOString(),
            observations: t.observations,
            lastActionAt: new Date().toISOString(),
            costDays: Math.random() > 0.5 ? 1 : 0
        });
    }

    console.log('✅ SEED REALISTA COMPLETADO');
}

seed().catch(console.error);
