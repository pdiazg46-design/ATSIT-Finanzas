'use server';

import { db } from './db';
import { vatPayments } from './schema';
import { desc, eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export async function addVatPayment(formData: FormData) {
    const amount = parseFloat(formData.get('amount') as string);
    const date = formData.get('date') as string;
    const notes = formData.get('notes') as string;

    await db.insert(vatPayments).values({
        amount,
        paymentDate: date,
        notes,
        createdAt: new Date().toISOString(),
    });

    revalidatePath('/pagos-iva');
}

export async function getVatPayments() {
    return await db.select().from(vatPayments).orderBy(desc(vatPayments.paymentDate));
}

export async function deleteVatPayment(id: number) {
    await db.delete(vatPayments).where(eq(vatPayments.id, id));
    revalidatePath('/pagos-iva');
}

export async function updateVatPayment(id: number, formData: FormData) {
    const amount = parseFloat(formData.get('amount') as string);
    const date = formData.get('date') as string;
    const notes = formData.get('notes') as string;

    await db.update(vatPayments)
        .set({
            amount,
            paymentDate: date,
            notes,
        })
        .where(eq(vatPayments.id, id));

    revalidatePath('/pagos-iva');
}
