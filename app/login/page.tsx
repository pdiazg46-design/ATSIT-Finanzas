import LoginForm from '@/components/LoginForm';
import RegisterAdminForm from '@/components/RegisterAdminForm';
import { getCompanySettings } from '@/lib/company-data';
import { db } from '@/lib/db';
import { users } from '@/lib/schema';

export const dynamic = 'force-dynamic';

export default async function LoginPage() {
    const settings = await getCompanySettings();
    
    let hasUsers = false;
    try {
        const usersList = await db.select().from(users).all();
        hasUsers = usersList.length > 0;
    } catch (e) {
        console.warn("DB not ready or users table empty during login check. This is normal on first run:", e);
    }

    return (
        <main className="relative min-h-screen flex items-center justify-center bg-slate-950 p-4 overflow-hidden">
            {/* Ambient Background Glows */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-sky-500/10 rounded-full blur-[100px] pointer-events-none" />

            <div className="relative w-full max-w-[420px] z-10">
                {/* Main Glassmorphic Card */}
                <div className="glass-card p-8 rounded-2xl border border-white/10 shadow-2xl bg-slate-900/60 backdrop-blur-xl">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="w-12 h-12 bg-gradient-to-tr from-indigo-500 to-sky-500 rounded-xl mx-auto flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-indigo-500/20 mb-4">
                            {settings.name.charAt(0)}
                        </div>
                        <h1 className="bg-gradient-to-r from-indigo-400 via-sky-400 to-emerald-400 bg-clip-text text-transparent font-black tracking-tight text-3xl mb-1">
                            {settings.name}
                        </h1>
                        <p className="text-xs text-slate-400 tracking-wider uppercase font-semibold">
                            Gestión Financiera
                        </p>
                    </div>

                    {/* Form */}
                    {hasUsers ? (
                        <LoginForm />
                    ) : (
                        <RegisterAdminForm />
                    )}
                </div>
            </div>
        </main>
    );
}
