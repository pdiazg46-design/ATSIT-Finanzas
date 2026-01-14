'use server';

import { db } from './db';
import { tasks, documents, movements, projects, employees } from './schema';
import { eq, desc, and, not, sql } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export interface IvaItem {
    id: number;
    date: string | null;
    docNumber: string | null;
    documentName: string;
    movementType: string | null; // 'Ingreso' | 'Gasto'
    netValue: number | null;
    taxValue: number | null;
    totalValue: number | null;
    projectName: string | null;
}

export async function getIvaReportData(month?: string) {
    // If month is provided (e.g., '2025-01'), we could filter by it.
    // For now, let's fetch all relevant tax movements and group them in the UI or here.

    // We want tasks that have a taxValue != 0 OR where the document is relevant to tax (Factura).
    // Usually taxValue != 0 is the best indicator if our seed/logic is consistent.

    const results = await db
        .select({
            id: tasks.id,
            date: tasks.startDate, // Using startDate as the transaction date
            docNumber: tasks.docNumber,
            documentName: documents.name,
            movementType: movements.type,
            netValue: tasks.netValue,
            taxValue: tasks.taxValue,
            totalValue: tasks.totalValue,
            projectName: projects.name,
        })
        .from(tasks)
        .leftJoin(documents, eq(tasks.documentId, documents.id))
        .leftJoin(movements, eq(tasks.movementId, movements.id))
        .leftJoin(projects, eq(tasks.projectId, projects.id))
        .where(not(eq(tasks.taxValue, 0)))
        .orderBy(desc(tasks.startDate));

    return results as IvaItem[];
}

export interface WithdrawalItem {
    id: number;
    date: string | null;
    projectName: string;
    employeeName: string;
    amount: number | null;
}

export async function getWithdrawalsData() {
    // Fetch movements named 'Retiro'
    const results = await db
        .select({
            id: tasks.id,
            date: tasks.startDate,
            projectName: projects.name, // Does this work directly? Need to check imports
            // Actually projects is not imported in report-actions currently? 
            // Better to use leftJoin projects
            employeeName: sql<string>`${employees.firstName} || ' ' || ${employees.lastName}`,
            amount: tasks.netValue, // Withdrawals are expenses, usually negative. We'll report absolute values.
        })
        .from(tasks)
        .leftJoin(movements, eq(tasks.movementId, movements.id))
        .leftJoin(projects, eq(tasks.projectId, projects.id))
        .leftJoin(employees, eq(tasks.employeeId, employees.id))
        .where(eq(movements.name, 'Retiro'))
        .orderBy(desc(tasks.startDate));

    return results as WithdrawalItem[];
}
