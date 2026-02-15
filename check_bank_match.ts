
import 'dotenv/config';
import { db } from './lib/db';
import { vatPayments, tasks } from './lib/schema';
import { sql, eq, and, like } from 'drizzle-orm';

async function verifySpecifics() {
    console.log('--- BUSCANDO TRANSACCIONES ESPECÍFICAS ---');

    // 1. Check for SII Payment 128.349
    const siiPayment = await db.select()
        .from(vatPayments)
        .where(eq(vatPayments.amount, 128349))
        .all();

    console.log(`Pago SII $128.349 encontrado: ${siiPayment.length > 0 ? 'SÍ' : 'NO'}`);
    if (siiPayment.length > 0) console.table(siiPayment);

    // 2. Check for "WIX.COM" (39.563)
    // Note: Amount might be negative or positive depending on storage
    const wixTask = await db.select({
        id: tasks.id, title: tasks.title, net: tasks.netValue, total: tasks.totalValue, date: tasks.paymentDate
    })
        .from(tasks)
        .where(like(tasks.title, '%WIX%'))
        .all();

    console.log(`Compra WIX encontrada: ${wixTask.length > 0 ? 'SÍ' : 'NO'}`);
    console.table(wixTask);

    // 3. Check Global Balance again
    const income = await db.select({ amount: sql<number>`SUM(${tasks.totalValue})` }).from(tasks).where(sql`${tasks.netValue} > 0 AND ${tasks.paymentDate} IS NOT NULL`).get();
    const expenses = await db.select({ amount: sql<number>`SUM(${tasks.totalValue})` }).from(tasks).where(sql`${tasks.netValue} < 0 AND ${tasks.paymentDate} IS NOT NULL`).get();
    const vat = await db.select({ amount: sql<number>`SUM(${vatPayments.amount})` }).from(vatPayments).get();

    const bal = (income?.amount || 0) - (Math.abs(expenses?.amount || 0) + (vat?.amount || 0));
    console.log(`SALDO CALCULADO APP: ${bal}`);
}

verifySpecifics();
