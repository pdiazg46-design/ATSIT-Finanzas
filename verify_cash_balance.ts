
import 'dotenv/config';
import { db } from './lib/db';
import { tasks, vatPayments } from './lib/schema';
import { sql, and, isNotNull, not, eq } from 'drizzle-orm';

async function verifyCashBalance() {
    console.log('--- VERIFICACIÓN SALDO EN BANCO ---');

    // 1. Ingresos (Tasks con paymentDate y netValue > 0)
    const income = await db.select({ amount: sql<number>`SUM(${tasks.totalValue})` })
        .from(tasks)
        .where(and(isNotNull(tasks.paymentDate), not(eq(tasks.paymentDate, '')), sql`${tasks.netValue} > 0`))
        .get();

    // 2. Egresos (Tasks con paymentDate y netValue < 0)
    const expenses = await db.select({ amount: sql<number>`SUM(${tasks.totalValue})` })
        .from(tasks)
        .where(and(isNotNull(tasks.paymentDate), not(eq(tasks.paymentDate, '')), sql`${tasks.netValue} < 0`))
        .get();

    // 3. Pagos IVA
    const vat = await db.select({ amount: sql<number>`SUM(${vatPayments.amount})` })
        .from(vatPayments)
        .get();

    // 4. Saldo Antiguo (Neto Devengado)
    const oldBalance = await db.select({ amount: sql<number>`SUM(${tasks.netValue})` })
        .from(tasks)
        .get();

    const cashIncome = income?.amount || 0;
    const cashExpenses = Math.abs(expenses?.amount || 0); // Always positive for reading
    const cashVat = vat?.amount || 0;

    const cashBalance = cashIncome - (cashExpenses + cashVat);
    const oldBalanceVal = oldBalance?.amount || 0;

    console.log(`Ingresos Cobrados (Bruto): ${cashIncome}`);
    console.log(`Gastos Pagados (Bruto):    ${cashExpenses}`);
    console.log(`Pagos IVA SII:             ${cashVat}`);
    console.log('-----------------------------------');
    console.log(`NUEVO SALDO (BANCO):       ${cashBalance}`);
    console.log(`SALDO ANTIGUO (NETO):      ${oldBalanceVal}`);
    console.log('-----------------------------------');
    console.log(`DIFERENCIA (Descuadre):    ${oldBalanceVal - cashBalance}`);
}

verifyCashBalance();
