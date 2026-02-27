import { db } from '@/lib/db';
import { projects, tasks, vatPayments } from '@/lib/schema';
import { eq, sql, and, isNotNull, not } from 'drizzle-orm';
import { Briefcase, DollarSign, Wallet, TrendingUp, ChevronRight, Scale, PieChart } from 'lucide-react';
import Link from 'next/link';

export default async function DashboardPage() {
  // Financial KPIs - Excluding archived records

  // 1. Expected Income (No changes)
  const projectStats = await db.select({
    totalExpected: sql<number>`SUM(${projects.expectedIncome})`,
    count: sql<number>`COUNT(*)`
  })
    .from(projects)
    .where(eq(projects.isArchived, false))
    .get();

  // 2. CASH BASIS CALCULATION (Real Money in Bank)
  // Income: Tasks with paymentDate (Gross Value)
  const cashIncomeResult = await db.select({
    amount: sql<number>`SUM(${tasks.totalValue})`
  })
    .from(tasks)
    .where(and(
      isNotNull(tasks.paymentDate),
      not(eq(tasks.paymentDate, '')),
      sql`${tasks.netValue} > 0`
    ))
    .get();

  // Expenses: Tasks with paymentDate (Gross Value)
  const cashExpensesResult = await db.select({
    amount: sql<number>`SUM(${tasks.totalValue})`
  })
    .from(tasks)
    .where(and(
      isNotNull(tasks.paymentDate),
      not(eq(tasks.paymentDate, '')),
      sql`${tasks.netValue} < 0`
    ))
    .get();

  // VAT Payments (Always paid)
  const totalVatPaymentsResult = await db.select({
    amount: sql<number>`SUM(${vatPayments.amount})`
  }).from(vatPayments).get();

  const cashIncome = cashIncomeResult?.amount || 0;
  const cashExpensesCommon = Math.abs(cashExpensesResult?.amount || 0); // Expenses in DB might be negative, ensure positive for math
  const cashVatPayments = totalVatPaymentsResult?.amount || 0;

  const totalCashExpenses = cashExpensesCommon + cashVatPayments;
  const cashBalance = cashIncome - totalCashExpenses;


  // 3. ACCRUAL BASIS (Devengado - Only for Reference)
  const taskStats = await db.select({
    totalIVA: sql<number>`SUM(${tasks.taxValue})`,
  })
    .from(tasks)
    .leftJoin(projects, eq(tasks.projectId, projects.id))
    .where(eq(projects.isArchived, false))
    .get();


  const totalAccruedIva = taskStats?.totalIVA || 0;
  const pendingIva = totalAccruedIva - cashVatPayments;

  // Active Projects Preview
  const activeProjects = await db.select({
    id: projects.id,
    name: projects.name,
    expected: projects.expectedIncome,
    // Real Income: Only paid tasks (Neto, sin IVA de facturas emitidas)
    real: sql<number>`COALESCE(SUM(CASE WHEN ${tasks.netValue} > 0 AND ${tasks.paymentDate} IS NOT NULL AND ${tasks.paymentDate} != '' THEN ${tasks.netValue} ELSE 0 END), 0)`,
    // Balance: Income - Expenses (Paid) -> Efectivo libre
    balance: sql<number>`COALESCE(SUM(
      CASE 
        WHEN ${tasks.paymentDate} IS NOT NULL AND ${tasks.paymentDate} != '' 
        THEN (CASE WHEN ${tasks.documentId} = 44 THEN ${tasks.totalValue} ELSE ${tasks.netValue} END)
        ELSE 0 
      END
    ), 0)`,
    status: projects.status
  })
    .from(projects)
    .leftJoin(tasks, eq(projects.id, tasks.projectId))
    .where(eq(projects.isArchived, false))
    .groupBy(projects.id)
    .limit(5)
    .all();

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(val || 0);
  };

  return (
    <div className="space-y-6 md:space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header>
        <h2 className="text-2xl md:text-4xl font-extrabold text-white tracking-tight">Dashboard General</h2>
        <p className="text-sm md:text-base text-slate-400 mt-1">Resumen de Flujo de Efectivo (Criterio: Percibido)</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        <div className="glass-card p-5 md:p-8 border-emerald-500/20 bg-emerald-500/5">
          <div className="flex justify-between items-start mb-3 md:mb-4">
            <div className="p-2 md:p-3 bg-emerald-500/10 rounded-2xl text-emerald-400">
              <TrendingUp size={24} className="md:w-7 md:h-7" />
            </div>
            <span className="text-[10px] md:text-xs font-bold text-emerald-500/60 uppercase tracking-widest">Ingresos Percibidos</span>
          </div>
          <p className="text-2xl md:text-3xl font-black text-white">{formatCurrency(cashIncome)}</p>
          <p className="text-xs md:text-sm text-slate-500 mt-2 font-medium">Cobrados (con IVA)</p>
        </div>

        <div className="glass-card p-5 md:p-8 border-rose-500/20 bg-rose-500/5">
          <div className="flex justify-between items-start mb-3 md:mb-4">
            <div className="p-2 md:p-3 bg-rose-500/10 rounded-2xl text-rose-400">
              <Wallet size={24} className="md:w-7 md:h-7" />
            </div>
            <span className="text-[10px] md:text-xs font-bold text-rose-500/60 uppercase tracking-widest">Gastos Reales</span>
          </div>
          <p className="text-2xl md:text-3xl font-black text-white">{formatCurrency(totalCashExpenses)}</p>
          <p className="text-xs md:text-sm text-slate-500 mt-2 font-medium">Pagados + IVA SII</p>
        </div>

        <Link href="/reports/bank-audit" className="glass-card p-5 md:p-8 border-sky-500/20 bg-sky-500/5 hover:bg-sky-500/10 transition-colors group relative cursor-pointer block">
          <div className="absolute top-4 right-4 animate-pulse">
            <div className="w-2 h-2 bg-sky-400 rounded-full"></div>
          </div>
          <div className="flex justify-between items-start mb-3 md:mb-4">
            <div className="p-2 md:p-3 bg-sky-500/10 rounded-2xl text-sky-400">
              <Scale size={24} className="md:w-7 md:h-7" />
            </div>
            <span className="text-[10px] md:text-xs font-bold text-sky-500/60 uppercase tracking-widest">Saldo en Banco</span>
          </div>
          <p className={`text-2xl md:text-3xl font-black ${cashBalance >= 0 ? 'text-sky-400' : 'text-rose-400'}`}>
            {formatCurrency(cashBalance)}
          </p>
          <p className="flex items-center gap-1 text-xs md:text-sm text-sky-400/60 mt-2 font-bold uppercase tracking-wide group-hover:text-sky-300">
            Auditar Saldo <ChevronRight size={14} />
          </p>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        <section className="lg:col-span-2 glass-card p-0 overflow-hidden">
          <div className="p-4 md:p-6 border-b border-white/5 flex justify-between items-center bg-white/2 cursor-default">
            <h3 className="text-lg md:text-xl font-bold flex items-center gap-2 md:gap-3 text-white">
              <Briefcase size={20} className="md:w-[22px] md:h-[22px] text-sky-400" />
              Proyectos (Flujo Real)
            </h3>
            <Link href="/projects" className="text-[10px] md:text-xs font-bold text-sky-400 hover:text-white transition-colors uppercase tracking-widest flex items-center gap-1">
              Ver todos <ChevronRight size={14} />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[9px] md:text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-white/5 bg-white/1">
                  <th className="px-4 py-3 md:px-6 md:py-4">Nombre</th>
                  <th className="px-4 py-3 md:px-6 md:py-4 text-right">Ingreso (Cobrado)</th>
                  <th className="px-4 py-3 md:px-6 md:py-4 text-right">Saldo (Real)</th>
                  <th className="px-4 py-3 md:px-6 md:py-4 text-center">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {activeProjects.map((p: any) => (
                  <tr key={p.id} className="hover:bg-white/5 transition-colors group">
                    <td className="px-4 py-3 md:px-6 md:py-4">
                      <Link href={`/projects/${p.id}`} className="text-sm font-bold text-white group-hover:text-sky-400 transition-colors block truncate max-w-[120px] md:max-w-none">
                        {p.name}
                      </Link>
                      <p className="text-[9px] md:text-[10px] text-slate-500 font-medium">Esperado: {formatCurrency(p.expected || 0)}</p>
                    </td>
                    <td className="px-4 py-3 md:px-6 md:py-4 text-sm text-right text-emerald-400 font-bold whitespace-nowrap">{formatCurrency(p.real)}</td>
                    <td className={`px-4 py-3 md:px-6 md:py-4 text-sm text-right font-black whitespace-nowrap ${p.balance >= 0 ? 'text-sky-400' : 'text-rose-400'}`}>
                      {formatCurrency(p.balance)}
                    </td>
                    <td className="px-4 py-3 md:px-6 md:py-4 text-center">
                      <span className="px-2 py-1 rounded text-[8px] md:text-[9px] font-black uppercase bg-white/5 text-slate-400 border border-white/10 group-hover:border-sky-500/50 transition-colors">
                        {p.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="glass-card p-6 md:p-8 flex flex-col justify-center items-center text-center space-y-3 md:space-y-4">
          <div className="w-16 h-16 md:w-20 md:h-20 bg-amber-500/10 rounded-full flex items-center justify-center text-amber-500 mb-2">
            <PieChart size={32} className="md:w-10 md:h-10" />
          </div>
          <h3 className="text-xl md:text-2xl font-black text-white">IVA por Pagar</h3>
          <p className="text-3xl md:text-4xl font-black text-amber-400">{formatCurrency(pendingIva)}</p>
          <div className="text-xs md:text-sm text-slate-500 font-medium">
            <p>Acumulado: {formatCurrency(totalAccruedIva)}</p>
            <p className="text-emerald-500">Pagado: {formatCurrency(cashVatPayments)}</p>
          </div>
          <Link href="/reports/iva" className="mt-4 px-6 py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 rounded-full text-xs font-bold transition-all">
            Ver detalle tributario
          </Link>
        </section>
      </div>
    </div>
  );
}
