import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
    secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || 'atsit-finanzas-secret-key-2026-prod-fallback',
    trustHost: true,
    pages: {
        signIn: '/login',
    },
    callbacks: {
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user;
            const isOnDashboard = nextUrl.pathname.startsWith('/dashboard') ||
                nextUrl.pathname.startsWith('/projects') ||
                nextUrl.pathname.startsWith('/reports') ||
                nextUrl.pathname === '/'; // Protect root too if needed

            if (isOnDashboard) {
                if (isLoggedIn) return true;
                return false; // Redirect unauthenticated users to login page
            } else if (isLoggedIn) {
                // If user is logged in and on login page, redirect to dashboard
                if (nextUrl.pathname === '/login') {
                    return Response.redirect(new URL('/', nextUrl));
                }
            }
            return true;
        },
    },
    providers: [], // Configured in auth.ts
} satisfies NextAuthConfig;
