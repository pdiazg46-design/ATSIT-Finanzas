import LoginForm from '@/components/LoginForm';

export const dynamic = 'force-dynamic';

export default function LoginPage() {
    return (
        <main className="flex items-center justify-center md:h-screen bg-slate-900">
            <div className="relative mx-auto flex w-full max-w-[400px] flex-col space-y-2.5 p-4 md:-mt-32">
                <div className="flex h-20 w-full items-end rounded-lg bg-indigo-600 p-3 md:h-36">
                    <div className="w-32 text-white md:w-36">
                        <h1 className="text-2xl font-bold">Tangente</h1>
                        <p className="text-xs text-indigo-200">Gestión Financiera</p>
                    </div>
                </div>

                <LoginForm />

                <div className="text-center pt-4">
                    <p className="text-xs text-gray-500 mb-2">¿Primera vez aquí?</p>
                    {/* Discreet Admin Recovery Link */}
                    <a href="/api/seed?secret=PatricioTangente2026" className="text-[10px] text-slate-700 hover:text-indigo-500 transition-colors">
                        Restaurar Sistema (Admin)
                    </a>
                </div>
            </div>
        </main>
    );
}
