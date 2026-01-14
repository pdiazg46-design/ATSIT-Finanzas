
import { db } from '@/lib/db';
import { users } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const secret = searchParams.get('secret');

        if (secret !== 'PatricioTangente2026') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const email = 'pdiazg46@gmail.com';
        const password = await bcrypt.hash('123456', 10);

        // Check if user exists
        const existingUser = await db.select().from(users).where(eq(users.email, email)).get();

        if (existingUser) {
            return NextResponse.json({ message: 'User already exists', user: existingUser });
        }

        // Create user
        const newUser = await db.insert(users).values({
            name: 'Patricio Díaz',
            email,
            password,
            role: 'admin',
        }).returning().get();

        return NextResponse.json({ message: 'User created successfully', user: newUser });
    } catch (error) {
        console.error('Seed error:', error);
        return NextResponse.json({ error: 'Failed to seed user', details: String(error) }, { status: 500 });
    }
}
