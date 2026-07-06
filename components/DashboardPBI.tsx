'use client';

import { useState, useMemo } from 'react';
import { Briefcase, DollarSign, Wallet, TrendingUp, TrendingDown, ChevronRight, Scale, PieChart, Filter, RefreshCw, Search, Calendar, ChevronLeft, ArrowUpDown } from 'lucide-react';
import Link from 'next/link';
import ExportButtons from '@/components/ExportButtons';

interface Project {
  id: number;
  name: string;
  status: string | null;
  isArchived: boolean | null;
  expectedIncome: number | null;
}

interface MovementType {
  id: number;
  name: string;
  type: string | null;
}

interface TaskMovement {
  id: number;
  title: string;
  netValue: number | null;
  totalValue: number | null;
  startDate: string | null;
  documentId: number | null;
  projectId: number;
  projectName: string | null;
  projectIsArchived: boolean | null;
  movementId: number | null;
  movementName: string | null;
  movementType: string | null;
  observations: string | null;
}

interface VatPayment {
  id: number;
  paymentDate: string;
  amount: number;
  notes: string | null;
}

interface DashboardPBIProps {
  initialProjects: Project[];
  initialMovements: MovementType[];
  initialTasks: TaskMovement[];
  initialVatPayments: VatPayment[];
}

export default function DashboardPBI({
  initialProjects,
  initialMovements,
  initialTasks,
  initialVatPayments
}: DashboardPBIProps) {
  // --- Estados de Filtros ---
  const [showArchived, setShowArchived] = useState(false);
  const [projectSearch, setProjectSearch] = useState('');
  const [movementSearch, setMovementSearch] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Rango de fechas por defecto: todo el año actual
  const currentYear = new Date().getFullYear();
  const [startDate, setStartDate] = useState(`${currentYear}-01-01`);
  const [endDate, setEndDate] = useState(`${currentYear}-12-31`);

  // Listas con elementos virtuales integrados (SII para IVA)
  const projectsList = useMemo(() => {
    const list = [...initialProjects];
    if (initialVatPayments.length > 0) {
      list.push({
        id: -99,
        name: 'Impuestos (SII)',
        status: 'Completado',
        isArchived: false,
        expectedIncome: 0
      });
    }
    return list;
  }, [initialProjects, initialVatPayments]);

  const movementsList = useMemo(() => {
    const list = [...initialMovements];
    if (initialVatPayments.length > 0) {
      list.push({
        id: -99,
        name: 'Pago IVA',
        type: 'Gasto'
      });
    }
    return list;
  }, [initialMovements, initialVatPayments]);

  // Selección de IDs para los filtros reactivos (Set vacío = Mostrar Todos por defecto)
  const [selectedProjects, setSelectedProjects] = useState<Set<number>>(new Set());
  const [selectedMovements, setSelectedMovements] = useState<Set<number>>(new Set());

  // --- Paginación y Ordenamiento ---
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;
  const [sortColumn, setSortColumn] = useState<string>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // --- Normalización de Transacciones ---
  const normalizedMovements = useMemo(() => {
    const items = [
      ...initialTasks.map((t: any) => {
        const val = t.netValue ?? t.totalValue ?? 0;
        const isInc = t.movementType ? t.movementType.toLowerCase() === 'ingreso' : val > 0;
        return {
          id: `task-${t.id}`,
          dateStr: t.startDate || '',
          date: t.startDate ? new Date(t.startDate) : null,
          projectId: t.projectId,
          projectName: t.projectName || 'Sin Proyecto',
          projectIsArchived: !!t.projectIsArchived,
          movementId: t.movementId,
          movementName: t.movementName || 'Sin Especificar',
          title: t.title,
          observations: t.observations || '',
          amount: val,
          isIncome: isInc,
          typeLabel: isInc ? 'Ingreso' : 'Egreso'
        };
      }),
      ...initialVatPayments.map((p: any) => {
        return {
          id: `payment-${p.id}`,
          dateStr: p.paymentDate || '',
          date: p.paymentDate ? new Date(p.paymentDate) : null,
          projectId: -99,
          projectName: 'Impuestos (SII)',
          projectIsArchived: false,
          movementId: -99,
          movementName: 'Pago IVA',
          title: 'Pago IVA Mensual',
          observations: p.notes || '',
          amount: -p.amount,
          isIncome: false,
          typeLabel: 'Egreso'
        };
      })
    ];
    return items;
  }, [initialTasks, initialVatPayments]);

  // --- Filtrado Reactivo ---
  const filteredMovements = useMemo(() => {
    return normalizedMovements.filter(item => {
      // Filtro de proyectos archivados
      if (!showArchived && item.projectIsArchived) return false;

      // Filtro por Selección de Proyecto
      if (selectedProjects.size > 0 && !selectedProjects.has(item.projectId)) return false;

      // Filtro por Selección de Tipo de Movimiento
      if (selectedMovements.size > 0 && !selectedMovements.has(item.movementId)) return false;

      // Filtro por Rango de Fechas
      if (startDate && item.dateStr && item.dateStr < startDate) return false;
      if (endDate && item.dateStr && item.dateStr > endDate) return false;

      // Filtro por Búsqueda Global
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const titleMatch = item.title.toLowerCase().includes(q);
        const obsMatch = item.observations.toLowerCase().includes(q);
        const projMatch = item.projectName.toLowerCase().includes(q);
        const movMatch = item.movementName.toLowerCase().includes(q);
        if (!titleMatch && !obsMatch && !projMatch && !movMatch) return false;
      }

      return true;
    });
  }, [normalizedMovements, selectedProjects, selectedMovements, startDate, endDate, searchQuery, showArchived]);

  // --- KPIs Dinámicos ---
  const kpis = useMemo(() => {
    let income = 0;
    let expense = 0;

    filteredMovements.forEach(item => {
      const val = Math.abs(item.amount);
      if (item.isIncome) {
        income += val;
      } else {
        expense += val;
      }
    });

    return {
      income,
      expense,
      net: income - expense
    };
  }, [filteredMovements]);

  // --- Desglose Porcentual de Gastos (Analítica de Crecimiento) ---
  const expenseDistribution = useMemo(() => {
    const expenses = filteredMovements.filter(item => !item.isIncome);
    const totalExp = expenses.reduce((acc, item) => acc + Math.abs(item.amount), 0);

    const groups: Record<string, { name: string; amount: number }> = {};
    expenses.forEach(item => {
      const key = item.movementName;
      if (!groups[key]) {
        groups[key] = { name: key, amount: 0 };
      }
      groups[key].amount += Math.abs(item.amount);
    });

    return Object.values(groups)
      .map(g => ({
        ...g,
        percentage: totalExp > 0 ? (g.amount / totalExp) * 100 : 0
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [filteredMovements]);

  // --- Ranking de Rentabilidad de Proyectos ---
  const projectRanking = useMemo(() => {
    const projectsData: Record<number, { id: number; name: string; income: number; expense: number; isArchived: boolean }> = {};

    projectsList.forEach(p => {
      if (!showArchived && p.isArchived) return;
      if (selectedProjects.size > 0 && !selectedProjects.has(p.id)) return;
      projectsData[p.id] = { id: p.id, name: p.name, income: 0, expense: 0, isArchived: !!p.isArchived };
    });

    filteredMovements.forEach(item => {
      if (!projectsData[item.projectId]) {
        projectsData[item.projectId] = { id: item.projectId, name: item.projectName, income: 0, expense: 0, isArchived: item.projectIsArchived };
      }
      const val = Math.abs(item.amount);
      if (item.isIncome) {
        projectsData[item.projectId].income += val;
      } else {
        projectsData[item.projectId].expense += val;
      }
    });

    return Object.values(projectsData)
      .map(p => ({
        ...p,
        net: p.income - p.expense
      }))
      .filter(p => p.income > 0 || p.expense > 0)
      .sort((a, b) => b.net - a.net);
  }, [filteredMovements, projectsList, selectedProjects, showArchived]);

  // --- Ordenamiento de Registros ---
  const sortedMovements = useMemo(() => {
    const sorted = [...filteredMovements];
    sorted.sort((a: any, b: any) => {
      let valA = a[sortColumn];
      let valB = b[sortColumn];

      if (sortColumn === 'date') {
        const timeA = a.date ? a.date.getTime() : 0;
        const timeB = b.date ? b.date.getTime() : 0;
        return sortDirection === 'asc' ? timeA - timeB : timeB - timeA;
      }

      if (typeof valA === 'string') {
        return sortDirection === 'asc'
          ? valA.localeCompare(valB)
          : valB.localeCompare(valA);
      }

      return sortDirection === 'asc' ? valA - valB : valB - valA;
    });
    return sorted;
  }, [filteredMovements, sortColumn, sortDirection]);

  // --- Paginación ---
  const totalPages = Math.ceil(sortedMovements.length / itemsPerPage);
  const paginatedMovements = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedMovements.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedMovements, currentPage]);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // --- Acciones de Selección ---
  const toggleProject = (id: number) => {
    const next = new Set(selectedProjects);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedProjects(next);
    setCurrentPage(1);
  };

  const toggleMovement = (id: number) => {
    const next = new Set(selectedMovements);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedMovements(next);
    setCurrentPage(1);
  };

  const selectAllProjects = () => {
    const visibleProj = projectsList.filter(p => showArchived ? true : !p.isArchived).map(p => p.id);
    setSelectedProjects(new Set(visibleProj));
    setCurrentPage(1);
  };

  const clearProjects = () => {
    setSelectedProjects(new Set());
    setCurrentPage(1);
  };

  const selectAllMovements = () => {
    setSelectedMovements(new Set(movementsList.map(m => m.id)));
    setCurrentPage(1);
  };

  const clearMovements = () => {
    setSelectedMovements(new Set());
    setCurrentPage(1);
  };

  const handleResetAllFilters = () => {
    setShowArchived(false);
    setSelectedProjects(new Set());
    setSelectedMovements(new Set());
    setStartDate(`${currentYear}-01-01`);
    setEndDate(`${currentYear}-12-31`);
    setSearchQuery('');
    setProjectSearch('');
    setMovementSearch('');
    setCurrentPage(1);
  };

  // --- Formateadores ---
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(val || 0);
  };

  const formatDate = (date: Date | null) => {
    if (!date || isNaN(date.getTime())) return '-';
    return date.toLocaleDateString('es-CL');
  };

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('desc');
    }
    setCurrentPage(1);
  };

  // Filtrado de listas de selección rápida
  const filteredProjectsForFilter = projectsList.filter(p => {
    if (!showArchived && p.isArchived) return false;
    return p.name.toLowerCase().includes(projectSearch.toLowerCase());
  });

  const filteredMovementsForFilter = movementsList.filter(m =>
    m.name.toLowerCase().includes(movementSearch.toLowerCase())
  );

  const exportColumns = [
    { header: 'Fecha', key: 'dateStr', format: 'date' as const },
    { header: 'Proyecto', key: 'projectName' },
    { header: 'Tipo Movimiento', key: 'movementName' },
    { header: 'Concepto/Título', key: 'title' },
    { header: 'Tipo', key: 'typeLabel' },
    { header: 'Monto', key: 'amount', format: 'currency' as const },
  ];

  const exportSummary = [
    { label: 'Total Ingresos Netos', value: formatCurrency(kpis.income) },
    { label: 'Total Egresos Netos', value: formatCurrency(kpis.expense) },
    { label: 'Saldo Neto Consolidado', value: formatCurrency(kpis.net) }
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl md:text-4xl font-extrabold text-white tracking-tight">Dashboard General</h2>
          <p className="text-sm md:text-base text-slate-400 mt-1">Consola de Análisis Financiero de la Empresa (Criterio Neto Real)</p>
        </div>
        <button
          onClick={handleResetAllFilters}
          className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white rounded-lg text-xs font-bold transition-all border border-white/10"
        >
          <RefreshCw size={14} />
          Restablecer Filtros
        </button>
      </header>

      {/* --- DISEÑO DE DOS COLUMNAS (ESTILO POWER BI) --- */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 items-start">
        
        {/* === COLUMNA IZQUIERDA: PANEL DE CONTROL DE FILTROS === */}
        <aside className="xl:col-span-1 glass-card p-5 space-y-6 border-white/10">
          <div className="flex items-center gap-2 text-sky-400 font-bold border-b border-white/5 pb-3">
            <Filter size={18} />
            <h3 className="text-sm uppercase tracking-wider text-slate-300">Filtros de Análisis</h3>
          </div>

          {/* Filtro Rango de Fechas */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Calendar size={12} /> Período de Tiempo
            </label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-[10px] text-slate-500 font-bold">Desde</span>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => { setStartDate(e.target.value); setCurrentPage(1); }}
                  className="w-full bg-slate-900/50 border border-white/10 rounded px-2 py-1 text-xs text-white focus:ring-1 focus:ring-sky-500 focus:outline-none"
                />
              </div>
              <div>
                <span className="text-[10px] text-slate-500 font-bold">Hasta</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => { setEndDate(e.target.value); setCurrentPage(1); }}
                  className="w-full bg-slate-900/50 border border-white/10 rounded px-2 py-1 text-xs text-white focus:ring-1 focus:ring-sky-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Switch de Mostrar Archivados */}
          <div className="flex items-center justify-between bg-white/2 p-2.5 rounded-lg border border-white/5">
            <span className="text-xs font-bold text-slate-300">Proyectos Históricos</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={showArchived}
                onChange={(e) => {
                  setShowArchived(e.target.checked);
                  setCurrentPage(1);
                }}
                className="sr-only peer" 
              />
              <div className="w-9 h-5 bg-slate-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-slate-400 after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-sky-500 peer-checked:after:bg-white"></div>
            </label>
          </div>

          {/* Selector de Proyectos */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Proyectos ({selectedProjects.size})</label>
              <div className="flex gap-2">
                <button onClick={selectAllProjects} className="text-[9px] text-sky-400 hover:underline">Todos</button>
                <button onClick={clearProjects} className="text-[9px] text-slate-500 hover:underline">Ninguno</button>
              </div>
            </div>
            <div className="relative">
              <Search className="absolute left-2 top-2.5 text-slate-500" size={12} />
              <input
                type="text"
                placeholder="Buscar proyecto..."
                value={projectSearch}
                onChange={(e) => setProjectSearch(e.target.value)}
                className="w-full bg-slate-900/50 border border-white/10 rounded pl-7 pr-2 py-1.5 text-xs text-white focus:ring-1 focus:ring-sky-500 focus:outline-none"
              />
            </div>
            <div className="max-h-[160px] overflow-y-auto space-y-1 bg-slate-950/20 p-2 rounded-lg border border-white/5 scrollbar-thin">
              {filteredProjectsForFilter.map(p => (
                <label key={p.id} className="flex items-center gap-2 text-xs text-slate-300 hover:text-white cursor-pointer py-0.5">
                  <input
                    type="checkbox"
                    checked={selectedProjects.has(p.id)}
                    onChange={() => toggleProject(p.id)}
                    className="rounded border-white/10 bg-slate-900 text-sky-500 focus:ring-0 focus:ring-offset-0"
                  />
                  <span className={`truncate ${p.isArchived ? 'text-slate-500 italic line-through' : ''}`}>{p.name}</span>
                </label>
              ))}
              {filteredProjectsForFilter.length === 0 && (
                <p className="text-[10px] text-slate-500 italic text-center py-2">No se encontraron proyectos</p>
              )}
            </div>
          </div>

          {/* Selector de Tipos de Movimiento */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tipos Movimiento ({selectedMovements.size})</label>
              <div className="flex gap-2">
                <button onClick={selectAllMovements} className="text-[9px] text-sky-400 hover:underline">Todos</button>
                <button onClick={clearMovements} className="text-[9px] text-slate-500 hover:underline">Ninguno</button>
              </div>
            </div>
            <div className="relative">
              <Search className="absolute left-2 top-2.5 text-slate-500" size={12} />
              <input
                type="text"
                placeholder="Buscar tipo..."
                value={movementSearch}
                onChange={(e) => setMovementSearch(e.target.value)}
                className="w-full bg-slate-900/50 border border-white/10 rounded pl-7 pr-2 py-1.5 text-xs text-white focus:ring-1 focus:ring-sky-500 focus:outline-none"
              />
            </div>
            <div className="max-h-[160px] overflow-y-auto space-y-1 bg-slate-950/20 p-2 rounded-lg border border-white/5 scrollbar-thin">
              {filteredMovementsForFilter.map(m => (
                <label key={m.id} className="flex items-center gap-2 text-xs text-slate-300 hover:text-white cursor-pointer py-0.5">
                  <input
                    type="checkbox"
                    checked={selectedMovements.has(m.id)}
                    onChange={() => toggleMovement(m.id)}
                    className="rounded border-white/10 bg-slate-900 text-sky-500 focus:ring-0 focus:ring-offset-0"
                  />
                  <span>{m.name}</span>
                </label>
              ))}
              {filteredMovementsForFilter.length === 0 && (
                <p className="text-[10px] text-slate-500 italic text-center py-2">No se encontraron tipos</p>
              )}
            </div>
          </div>
        </aside>

        {/* === COLUMNA DERECHA: DASHBOARD DE MÉTRICAS Y TABLA DE DATOS === */}
        <main className="xl:col-span-3 space-y-6">
          
          {/* --- BLOQUE DE INDICADORES (KPIs REACTIVOS) --- */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass-card p-6 flex items-center justify-between border-emerald-500/20 bg-emerald-500/5">
              <div>
                <p className="text-xs text-slate-500 uppercase font-bold tracking-widest">Ingresos Netos</p>
                <h3 className="text-2xl md:text-3xl font-black text-emerald-400 mt-1">{formatCurrency(kpis.income)}</h3>
                <p className="text-[10px] text-slate-400 mt-1">Consolidados del período</p>
              </div>
              <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-400">
                <TrendingUp size={24} />
              </div>
            </div>

            <div className="glass-card p-6 flex items-center justify-between border-rose-500/20 bg-rose-500/5">
              <div>
                <p className="text-xs text-slate-500 uppercase font-bold tracking-widest">Egresos Netos</p>
                <h3 className="text-2xl md:text-3xl font-black text-rose-400 mt-1">{formatCurrency(kpis.expense)}</h3>
                <p className="text-[10px] text-slate-400 mt-1">Gastos + Impuesto IVA</p>
              </div>
              <div className="w-12 h-12 bg-rose-500/10 rounded-xl flex items-center justify-center text-rose-400">
                <TrendingDown size={24} />
              </div>
            </div>

            <div className="glass-card p-6 flex items-center justify-between border-sky-500/20 bg-sky-500/5">
              <div>
                <p className="text-xs text-slate-500 uppercase font-bold tracking-widest">Saldo Neto Consolidado</p>
                <h3 className={`text-2xl md:text-3xl font-black mt-1 ${kpis.net >= 0 ? 'text-sky-400' : 'text-rose-500'}`}>
                  {formatCurrency(kpis.net)}
                </h3>
                <p className="text-[10px] text-slate-400 mt-1">Margen Operacional Neto</p>
              </div>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${kpis.net >= 0 ? 'bg-sky-500/10 text-sky-400' : 'bg-rose-500/10 text-rose-400'}`}>
                {kpis.net >= 0 ? <Scale size={24} /> : <TrendingDown size={24} />}
              </div>
            </div>
          </div>

          {/* --- SECCIÓN DE ANALÍTICAS AVANZADAS --- */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Widget: Distribución de Gastos */}
            <section className="glass-card p-5 space-y-4 border-white/5">
              <h3 className="text-base font-bold text-white flex items-center gap-2 border-b border-white/5 pb-2">
                <PieChart size={18} className="text-rose-400" />
                Distribución de Egresos por Categoría
              </h3>
              <div className="space-y-3 max-h-[250px] overflow-y-auto scrollbar-thin pr-1">
                {expenseDistribution.map((item, idx) => (
                  <div key={item.name} className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-slate-300">{idx + 1}. {item.name}</span>
                      <span className="text-slate-400 font-medium">
                        {formatCurrency(item.amount)} <span className="text-[10px] text-slate-500 font-bold">({item.percentage.toFixed(1)}%)</span>
                      </span>
                    </div>
                    <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-white/5">
                      <div 
                        className="bg-rose-500/80 h-full rounded-full transition-all duration-1000" 
                        style={{ width: `${item.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
                {expenseDistribution.length === 0 && (
                  <p className="text-xs text-slate-500 italic text-center py-8">No hay egresos registrados en el período filtrado</p>
                )}
              </div>
            </section>

            {/* Widget: Ranking de Rentabilidad de Proyectos */}
            <section className="glass-card p-5 space-y-4 border-white/5">
              <h3 className="text-base font-bold text-white flex items-center gap-2 border-b border-white/5 pb-2">
                <Briefcase size={18} className="text-sky-400" />
                Rentabilidad de Proyectos
              </h3>
              <div className="overflow-y-auto max-h-[250px] scrollbar-thin space-y-2">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="text-slate-500 font-bold uppercase tracking-wider border-b border-white/5">
                      <th className="pb-2">Proyecto</th>
                      <th className="pb-2 text-right text-emerald-400">Ingresos</th>
                      <th className="pb-2 text-right text-rose-400">Egresos</th>
                      <th className="pb-2 text-right">Utilidad</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {projectRanking.map(p => (
                      <tr key={p.id} className="hover:bg-white/2 transition-colors">
                        <td className="py-2.5 font-bold text-slate-300 truncate max-w-[120px] sm:max-w-none">
                          {p.isArchived ? (
                            <span className="text-slate-500 italic line-through">{p.name}</span>
                          ) : (
                            <Link href={`/projects/${p.id}`} className="hover:text-sky-400 transition-colors">
                              {p.name}
                            </Link>
                          )}
                        </td>
                        <td className="py-2.5 text-right text-emerald-400/90 font-medium">{p.income > 0 ? formatCurrency(p.income) : '-'}</td>
                        <td className="py-2.5 text-right text-rose-400/90 font-medium">{p.expense > 0 ? formatCurrency(p.expense) : '-'}</td>
                        <td className={`py-2.5 text-right font-black ${p.net >= 0 ? 'text-sky-400' : 'text-rose-500'}`}>
                          {formatCurrency(p.net)}
                        </td>
                      </tr>
                    ))}
                    {projectRanking.length === 0 && (
                      <tr>
                        <td colSpan={4} className="text-center py-8 text-slate-500 italic">No hay movimientos por proyecto</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </div>

          {/* --- TABLA DETALLADA INTERACTIVA --- */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                Detalle de Movimientos Filtrados
                <span className="text-xs bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full font-bold">
                  {sortedMovements.length} transacciones
                </span>
              </h3>
              
              <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center w-full sm:w-auto justify-end">
                {/* Buscador global */}
                <div className="relative w-full sm:w-60">
                  <Search className="absolute left-2.5 top-2.5 text-slate-500" size={14} />
                  <input
                    type="text"
                    placeholder="Filtrar concepto, proyecto..."
                    value={searchQuery}
                    onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                    className="w-full bg-slate-900/50 border border-white/10 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white focus:ring-1 focus:ring-sky-500 focus:outline-none"
                  />
                </div>
                {/* Botón de exportación cliente */}
                <ExportButtons
                  data={sortedMovements}
                  columns={exportColumns}
                  fileName={`dashboard_export_${startDate}_a_${endDate}`}
                  title={`Resumen Financiero: ${startDate} a ${endDate}`}
                  summary={exportSummary}
                />
              </div>
            </div>

            {/* Tabla */}
            <div className="glass-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-white/5 text-slate-300">
                    <tr className="border-b border-white/5">
                      <th 
                        onClick={() => handleSort('date')}
                        className="p-3 text-xs md:text-sm font-semibold cursor-pointer hover:bg-white/5 transition-colors select-none"
                      >
                        <div className="flex items-center gap-1.5">
                          Fecha <ArrowUpDown size={12} className="text-slate-500" />
                        </div>
                      </th>
                      <th 
                        onClick={() => handleSort('projectName')}
                        className="p-3 text-xs md:text-sm font-semibold cursor-pointer hover:bg-white/5 transition-colors select-none"
                      >
                        <div className="flex items-center gap-1.5">
                          Proyecto <ArrowUpDown size={12} className="text-slate-500" />
                        </div>
                      </th>
                      <th 
                        onClick={() => handleSort('movementName')}
                        className="p-3 text-xs md:text-sm font-semibold cursor-pointer hover:bg-white/5 transition-colors select-none"
                      >
                        <div className="flex items-center gap-1.5">
                          Tipo Movimiento <ArrowUpDown size={12} className="text-slate-500" />
                        </div>
                      </th>
                      <th 
                        onClick={() => handleSort('title')}
                        className="p-3 text-xs md:text-sm font-semibold cursor-pointer hover:bg-white/5 transition-colors select-none"
                      >
                        <div className="flex items-center gap-1.5">
                          Concepto <ArrowUpDown size={12} className="text-slate-500" />
                        </div>
                      </th>
                      <th 
                        onClick={() => handleSort('amount')}
                        className="p-3 text-right text-xs md:text-sm font-semibold cursor-pointer hover:bg-white/5 transition-colors select-none"
                      >
                        <div className="flex items-center gap-1.5 justify-end">
                          Monto (Neto) <ArrowUpDown size={12} className="text-slate-500" />
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {paginatedMovements.map((item: any) => {
                      return (
                        <tr key={item.id} className="hover:bg-white/5 transition-colors">
                          <td className="p-3 text-slate-400 whitespace-nowrap text-xs md:text-sm">
                            {formatDate(item.date)}
                          </td>
                          <td className="p-3 text-slate-300 font-bold text-xs md:text-sm">
                            {item.projectId === -99 ? (
                              <span>{item.projectName}</span>
                            ) : (
                              <Link href={`/projects/${item.projectId}`} className="hover:text-sky-400 hover:underline">
                                {item.projectName}
                              </Link>
                            )}
                          </td>
                          <td className="p-3 text-slate-400 text-xs md:text-sm">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-900 border border-white/5">
                              {item.movementName}
                            </span>
                          </td>
                          <td className="p-3 text-slate-400 text-xs md:text-sm">
                            <div className="flex flex-col">
                              <span>{item.title}</span>
                              {item.observations && (
                                <span className="text-[10px] text-slate-500 truncate max-w-[200px] md:max-w-none">
                                  {item.observations}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className={`p-3 text-right font-black text-xs md:text-sm ${item.isIncome ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {formatCurrency(Math.abs(item.amount))}
                          </td>
                        </tr>
                      );
                    })}
                    {paginatedMovements.length === 0 && (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-slate-500 italic">
                          No se encontraron transacciones que coincidan con los filtros aplicados.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Paginador */}
            {totalPages > 1 && (
              <div className="flex justify-between items-center text-xs text-slate-400 pt-2">
                <span>Página {currentPage} de {totalPages}</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="p-1.5 bg-white/5 hover:bg-white/10 rounded disabled:opacity-30 disabled:hover:bg-white/5 transition-all"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  {Array.from({ length: totalPages }).map((_, idx) => {
                    const page = idx + 1;
                    // Mostrar sólo las páginas cercanas a la actual para no saturar la UI
                    if (page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1) {
                      return (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`px-2.5 py-1 rounded font-bold transition-all ${currentPage === page ? 'bg-sky-500 text-white' : 'bg-white/5 hover:bg-white/10'}`}
                        >
                          {page}
                        </button>
                      );
                    }
                    if (page === 2 || page === totalPages - 1) {
                      return <span key={page} className="px-1">...</span>;
                    }
                    return null;
                  })}
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="p-1.5 bg-white/5 hover:bg-white/10 rounded disabled:opacity-30 disabled:hover:bg-white/5 transition-all"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
