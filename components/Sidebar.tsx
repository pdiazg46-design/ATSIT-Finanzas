import { usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { LogOut, User as UserIcon } from 'lucide-react';
import { signOut } from 'next-auth/react';

export default function Sidebar({ companyName = 'Tangente', user }: { companyName?: string, user?: { name?: string | null, email?: string | null } }) {
    const pathname = usePathname();
    const [logoVersion, setLogoVersion] = useState(0);

    useEffect(() => {
        setLogoVersion(Date.now());
    }, []);

    return (
        <aside className="w-64 glass-card m-4 p-6 hidden md:flex flex-col h-[calc(100vh-2rem)] sticky top-4">
            <div className="flex flex-col items-center gap-3 mb-6 w-full shrink-0">
                <div className="relative w-full h-32 hover:scale-105 transition-transform duration-300">
                    <Image
                        src={logoVersion ? `/logo.png?v=${logoVersion}` : '/logo.png'}
                        alt="Company Logo"
                        fill
                        className="object-contain drop-shadow-[0_0_25px_rgba(14,165,233,0.4)]"
                        priority
                        unoptimized
                    />
                </div>
                <h1 className="text-xl font-bold premium-gradient-text tracking-wide text-center leading-tight">{companyName}</h1>
            </div>

            <nav className="flex-1 space-y-2 overflow-y-auto min-h-0">
                <Link href="/dashboard" className={`block p-3 rounded-lg transition-colors ${pathname === '/dashboard' ? 'bg-white/10 text-white' : 'hover:bg-white/5 text-slate-400 hover:text-white'}`}>
                    Dashboard
                </Link>
                <Link href="/projects" className={`block p-3 rounded-lg transition-colors ${pathname.startsWith('/projects') ? 'bg-white/10 text-white' : 'hover:bg-white/5 text-slate-400 hover:text-white'}`}>
                    Proyectos
                </Link>
                <Link href="/history" className={`block p-3 rounded-lg transition-colors ${pathname.startsWith('/history') ? 'bg-white/10 text-white' : 'hover:bg-white/5 text-slate-400 hover:text-white'}`}>
                    Historial
                </Link>
                <Link href="/employees" className={`block p-3 rounded-lg transition-colors ${pathname.startsWith('/employees') ? 'bg-white/10 text-white' : 'hover:bg-white/5 text-slate-400 hover:text-white'}`}>
                    Empleados
                </Link>
                <Link href="/pagos-iva" className={`block p-3 rounded-lg transition-colors ${pathname.startsWith('/pagos-iva') ? 'bg-white/10 text-white' : 'hover:bg-white/5 text-slate-400 hover:text-white'}`}>
                    Pagos IVA
                </Link>
                <Link href="/reports" className={`block p-3 rounded-lg transition-colors ${pathname.startsWith('/reports') ? 'bg-white/10 text-white' : 'hover:bg-white/5 text-slate-400 hover:text-white'}`}>
                    Informes
                </Link>
            </nav>

            <div className="pt-4 border-t border-white/5 mt-4 shrink-0 space-y-3">
                <Link href="/settings" className={`block p-3 rounded-lg transition-colors ${pathname.startsWith('/settings') ? 'bg-white/10 text-white' : 'hover:bg-white/5 text-slate-400 hover:text-white'}`}>
                    Configuración
                </Link>

                {user && (
                    <div className="bg-white/5 rounded-xl p-3">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                                <UserIcon size={16} />
                            </div>
                            <div className="overflow-hidden">
                                <p className="text-sm font-bold text-white truncate">{user.name}</p>
                                <p className="text-xs text-slate-500 truncate">{user.email}</p>
                            </div>
                        </div>
                        <button
                            onClick={() => signOut()}
                            className="w-full flex items-center justify-center gap-2 text-xs font-bold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 p-2 rounded-lg transition-colors"
                        >
                            <LogOut size={14} />
                            Cerrar Sesión
                        </button>
                    </div>
                )}
            </div>
        </aside>
    );
}
