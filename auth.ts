import NextAuth from 'next-auth';
import { authConfig } from './auth.config';
import Credentials from 'next-auth/providers/credentials';
import { z } from 'zod';
import { db } from '@/lib/db';
import { users } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

async function getUser(email: string) {
    const user = await db.select().from(users).where(eq(users.email, email)).get();
    return user;
}

export const { handlers, auth, signIn, signOut } = NextAuth({
    ...authConfig,
    providers: [
        Credentials({
            async authorize(credentials) {
                try {
                    const parsedCredentials = z
                        .object({ email: z.string(), password: z.string().min(4) })
                        .safeParse(credentials);

                    if (parsedCredentials.success) {
                        const { email, password } = parsedCredentials.data;
                        // email field now acts as username/email identifier
                        const user = await getUser(email);
                        if (!user) return null;

                        const passwordsMatch = await bcrypt.compare(password, user.password);
                        if (passwordsMatch) {
                            return {
                                ...user,
                                id: user.id.toString(),
                            };
                        }
                    }

                    console.log('Invalid credentials');
                    return null;
                } catch (error) {
                    console.error('AUTH ERROR:', error);
                    // Throw a simple Error that can be read by the client
                    throw new Error(`INTERNAL_AUTH_ERROR: ${error instanceof Error ? error.message : String(error)}`);
                }
            },
        }),
    ],
});
