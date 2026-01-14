import LoginForm from '@/components/LoginForm';
import { db } from '@/lib/db';
import { users } from '@/lib/schema';
import { sql } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export default async function LoginPage() {
    // DIAGNOSTIC TELEMETRY 🛰️
    let dbStatus = "unknown";
    let userCount = -1;
    let envCheck = {
        url: !!process.env.DATABASE_URL,
        token: !!process.env.DATABASE_AUTH_TOKEN
    };
    let errorDetails = "";

    try {
        if (!process.env.DATABASE_URL) {
            dbStatus = "missing_env";
        } else {
            // Attempt connection probe
            try {
                const countResult = await db.select({ count: sql<number>`count(*)` }).from(users).get();
                userCount = countResult?.count || 0;
                dbStatus = "connected";
            } catch (e: any) {
                dbStatus = "connection_failed";
                errorDetails = e.message;
            }
        }
    } catch (e: any) {
        dbStatus = "critical_failure";
        errorDetails = e.message;
    }

    return (
        <main className="flex items-center justify-center md:h-screen bg-slate-900">
            <div className="relative mx-auto flex w-full max-w-[400px] flex-col space-y-4 p-4 md:-mt-32">

                {/* HEADS UP DISPLAY (HUD) */}
                <div className={`p-4 rounded-lg text-xs font-mono mb-4 border ${dbStatus === 'connected' && userCount > 0 ? 'bg-emerald-950/50 border-emerald-500/50 text-emerald-400' :
                    dbStatus === 'connected' && userCount === 0 ? 'bg-amber-950/50 border-amber-500/50 text-amber-400' :
                        'bg-rose-950/50 border-rose-500/50 text-rose-400'
                    }`}>
                    <h3 className="font-bold border-b border-white/10 pb-1 mb-2">ESTADO DEL SISTEMA</h3>
                    <div className="grid grid-cols-2 gap-2">
                        <span>ENV VARS:</span>
                        <span>{envCheck.url ? "✅ DETECTED" : "❌ MISSING"}</span>

                        <span>DATABASE:</span>
                        <span>
                            {dbStatus === 'connected' ? "✅ ONLINE" :
                                dbStatus === 'missing_env' ? "❌ NO CONFIG" : "❌ ERROR"}
                        </span>

                        <span>USUARIOS:</span>
                        <span>{userCount >= 0 ? userCount : "N/A"}</span>
                    </div>
                    {errorDetails && <div className="mt-2 pt-2 border-t border-white/10 opacity-75">{errorDetails.substring(0, 100)}...</div>}
                </div>

                <div className="flex h-20 w-full items-end rounded-lg bg-indigo-600 p-3 md:h-36">
                    <div className="w-32 text-white md:w-36">
                        <h1 className="text-2xl font-bold">Tangente</h1>
                        <p className="text-xs text-indigo-200">Gestión Financiera</p>
                    </div>
                </div>

                <LoginForm />

                <div className="text-center pt-4">
                    {/* ALWAYS SHOW DIAGNOSTIC TOOLS IN DEBUG MODE */}
                    <div className="mt-4 bg-white/5 p-3 rounded-lg border border-indigo-500/30">
                        <p className="text-indigo-300 font-bold mb-1 text-xs uppercase tracking-wider">Herramientas de Recuperación</p>
                        <a href="/api/seed?secret=PatricioTangente2026" className="text-xs text-white bg-indigo-600 hover:bg-indigo-500 px-3 py-2 rounded block transition-colors">
                            {userCount > 0 ? "RESETEAR CONTRASEÑA ADMIN (Seed)" : "INICIALIZAR BASE DE DATOS"}
                        </a>
                        <p className="text-[10px] text-gray-400 mt-2">
                            Esto asignará la clave <strong>123456</strong> al usuario Admin.
                        </p>
                    </div>

                    {dbStatus === 'missing_env' && (
                        <div className="bg-rose-950/50 p-3 rounded-lg border border-rose-500/50">
                            <p className="text-rose-300 font-bold mb-1">❌ ERROR CRÍTICO</p>
                            <p className="text-xs text-rose-200">
                                Faltan las variables de entorno en Vercel (Settings &rarr; Environment Variables).
                                <br />DATABASE_URL y DATABASE_AUTH_TOKEN son requeridas.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}
