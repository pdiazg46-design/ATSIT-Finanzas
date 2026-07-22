"use server";

import { db } from '@/lib/db';
import { employees } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export async function upsertEmployee(data: any) {
    const { id, ...rest } = data;

    let result;
    if (id) {
        result = await db.update(employees).set(rest).where(eq(employees.id, id)).returning().get();
    } else {
        result = await db.insert(employees).values(rest).returning().get();
    }

    revalidatePath('/employees');
    revalidatePath('/projects'); // In case owner names are displayed
    return result;
}

export async function deleteEmployee(id: number) {
    await db.delete(employees).where(eq(employees.id, id));
    revalidatePath('/employees');
}
