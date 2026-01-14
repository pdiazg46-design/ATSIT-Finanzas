"use server";

import { db } from '@/lib/db';
import { employees } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export async function upsertEmployee(data: any) {
    const { id, ...rest } = data;

    if (id) {
        await db.update(employees).set(rest).where(eq(employees.id, id));
    } else {
        await db.insert(employees).values(rest);
    }

    revalidatePath('/employees');
    revalidatePath('/projects'); // In case owner names are displayed
}

export async function deleteEmployee(id: number) {
    await db.delete(employees).where(eq(employees.id, id));
    revalidatePath('/employees');
}
