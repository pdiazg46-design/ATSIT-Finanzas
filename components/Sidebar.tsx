'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { LogOut, User as UserIcon } from 'lucide-react';
import { logout } from '@/lib/actions';
import LogoutButton from './LogoutButton';

export default function Sidebar({ companyName = 'Tangente', user }: { companyName?: string, user?: { name?: string | null, email?: string | null } }) {
    const pathname = usePathname();
    const [logoVersion, setLogoVersion] = useState(0);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        setLogoVersion(Date.now());
    }, []);

    // Close mobile menu when route changes
    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [pathname]);

    const NavLinks = () => (
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
                Pagos F29
            </Link>
            <Link href="/reports" className={`block p-3 rounded-lg transition-colors ${pathname.startsWith('/reports') ? 'bg-white/10 text-white' : 'hover:bg-white/5 text-slate-400 hover:text-white'}`}>
                Informes
            </Link>
        </nav>
    );

    const UserSection = () => (
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
                    <LogoutButton />
                </div>
            )}
        </div>
    );

    return (
        <>
            {/* Mobile Header */}
            <div className="md:hidden fixed top-0 inset-x-0 h-16 glass-card z-40 m-4 flex items-center justify-between px-4">
                <div className="flex items-center gap-2">
                    <div className="relative w-8 h-8">
                        <Image
                            src={logoVersion ? `/logo.png?v=${logoVersion}` : '/logo.png'}
                            alt="Logo"
                            fill
                            className="object-contain"
                            unoptimized
                        />
                    </div>
                    <span className="font-bold text-white text-lg truncate max-w-[150px]">{companyName}</span>
                </div>
                <button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
                >
                    {isMobileMenuOpen ? <LogOut size={24} className="rotate-180" /> : <div className="space-y-1.5">
                        <span className="block w-6 h-0.5 bg-white"></span>
                        <span className="block w-6 h-0.5 bg-white"></span>
                        <span className="block w-6 h-0.5 bg-white"></span>
                    </div>}
                </button>
            </div>

            {/* Mobile Menu Overlay */}
            {isMobileMenuOpen && (
                <div className="fixed inset-0 z-50 md:hidden bg-slate-900/95 backdrop-blur-xl p-6 flex flex-col pt-24 animate-in fade-in slide-in-from-top-10 duration-200">
                    <button
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="absolute top-6 right-6 p-2 text-slate-400 hover:text-white"
                    >
                        <LogOut size={24} className="rotate-45" />
                    </button>
                    <NavLinks />
                    <UserSection />
                </div>
            )}

            {/* Desktop Sidebar */}
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

                <NavLinks />
                <UserSection />
            </aside>
        </>
    );
}
