import { db } from '@/lib/db';
import { projects, tasks } from '@/lib/schema';
import { eq, sql } from 'drizzle-orm';
import { BarChart3, PieChart, FileSpreadsheet, TrendingUp, Wallet, Banknote, Landmark } from 'lucide-react';
import Link from 'next/link';

export default async function ReportsPage() {
    return (
        <div className="space-y-8">
            <header>
                <h2 className="text-3xl font-bold text-white">Informes Financieros</h2>
                <p className="text-slate-400">Análisis detallado de Tangente 2026</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Link href="/reports/balance" className="glass-card p-6 hover:bg-white/5 transition-all group">
                    <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-400 mb-4 group-hover:scale-110 transition-transform">
                        <BarChart3 size={24} />
                    </div>
                    <h3 className="text-xl font-bold text-white">Balance de Proyectos</h3>
                    <p className="text-sm text-slate-400 mt-2">Resumen de ingresos reales vs esperados por cada proyecto activo.</p>
                </Link>

                <Link href="/reports/cashflow" className="glass-card p-6 hover:bg-white/5 transition-all group">
                    <div className="w-12 h-12 bg-sky-500/10 rounded-xl flex items-center justify-center text-sky-400 mb-4 group-hover:scale-110 transition-transform">
                        <TrendingUp size={24} />
                    </div>
                    <h3 className="text-xl font-bold text-white">Flujo de Caja</h3>
                    <p className="text-sm text-slate-400 mt-2">Seguimiento de ingresos y gastos mensuales para control de liquidez.</p>
                </Link>

                <Link href="/reports/iva" className="glass-card p-6 hover:bg-white/5 transition-all group">
                    <div className="w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center text-amber-400 mb-4 group-hover:scale-110 transition-transform">
                        <PieChart size={24} />
                    </div>
                    <h3 className="text-xl font-bold text-white">Movimiento IVA</h3>
                    <p className="text-sm text-slate-400 mt-2">Resumen de IVA acumulado por facturación para declaraciones tributarias.</p>
                </Link>

                <Link href="/reports/withdrawals" className="glass-card p-6 hover:bg-white/5 transition-all group">
                    <div className="w-12 h-12 bg-pink-500/10 rounded-xl flex items-center justify-center text-pink-400 mb-4 group-hover:scale-110 transition-transform">
                        <Wallet size={24} />
                    </div>
                    <h3 className="text-xl font-bold text-white">Retiros de Socios</h3>
                    <p className="text-sm text-slate-400 mt-2">Detalle de retiros y transferencias personales agrupados por socio.</p>
                </Link>

                <Link href="/reports/tasks" className="glass-card p-6 hover:bg-white/5 transition-all group">
                    <div className="w-12 h-12 bg-slate-500/10 rounded-xl flex items-center justify-center text-slate-400 mb-4 group-hover:scale-110 transition-transform">
                        <FileSpreadsheet size={24} />
                    </div>
                    <h3 className="text-xl font-bold text-white">Tareas Pendientes</h3>
                    <p className="text-sm text-slate-400 mt-2">Listado detallado de todas las tareas con estado 'En curso' o 'Retrasado'.</p>
                </Link>

                <Link href="/reports/honorarios" className="glass-card p-6 hover:bg-white/5 transition-all group">
                    <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center text-purple-400 mb-4 group-hover:scale-110 transition-transform">
                        <Banknote size={24} />
                    </div>
                    <h3 className="text-xl font-bold text-white">Honorarios y Retenciones</h3>
                    <p className="text-sm text-slate-400 mt-2">Detalle de boletas de honorarios y cálculo de retenciones (2da Categoría).</p>
                </Link>

                <Link href="/reports/f29" className="glass-card p-6 hover:bg-white/5 transition-all group">
                    <div className="w-12 h-12 bg-orange-500/10 rounded-xl flex items-center justify-center text-orange-400 mb-4 group-hover:scale-110 transition-transform">
                        <Landmark size={24} />
                    </div>
                    <h3 className="text-xl font-bold text-white">Simulación F29</h3>
                    <p className="text-sm text-slate-400 mt-2">Cálculo mensual de IVA (Débito/Crédito) y PPM para declaración de impuestos.</p>
                </Link>
            </div>
        </div>
    );
}
