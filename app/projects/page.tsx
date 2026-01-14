import { db } from '@/lib/db';
import { projects, employees, tasks } from '@/lib/schema';
import { eq, sql, desc } from 'drizzle-orm';
import ProjectList from '@/components/ProjectList';
import AddProjectButton from '@/components/AddProjectButton';

export const dynamic = 'force-dynamic';

export default async function ProjectsPage() {
    const allProjects = await db.select({
        id: projects.id,
        name: projects.name,
        category: projects.category,
        status: projects.status,
        priority: projects.priority,
        startDate: projects.startDate,
        expectedIncome: projects.expectedIncome,
        isArchived: projects.isArchived,
        lastActionAt: projects.lastActionAt,
        ownerName: sql<string>`${employees.firstName} || ' ' || ${employees.lastName}`,
        balance: sql<number>`COALESCE(SUM(${tasks.totalValue}), 0)`,
        netBalance: sql<number>`COALESCE(SUM(${tasks.netValue}), 0)`,
        taxBalance: sql<number>`COALESCE(SUM(${tasks.taxValue}), 0)`,
    })
        .from(projects)
        .leftJoin(employees, eq(projects.ownerId, employees.id))
        .leftJoin(tasks, eq(projects.id, tasks.projectId))
        .groupBy(projects.id)
        .orderBy(
            sql`CASE 
                WHEN ${projects.name} IN ('Gastos Comunes', 'Ahorro 10%') THEN 0 
                ELSE 1 
            END`,
            desc(projects.lastActionAt)
        )
        .all();

    const allEmployees = await db.select().from(employees).all();

    const activeProjectStats = allProjects.filter(p => !p.isArchived);
    const totalNet = activeProjectStats.reduce((sum, p) => sum + (p.netBalance || 0), 0);
    // const totalTax = activeProjectStats.reduce((sum, p) => sum + (p.taxBalance || 0), 0);

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(val || 0);
    };

    return (
        <div className="space-y-8">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-white">Proyectos</h2>
                    <p className="text-slate-400">Panel de control y gestión de portafolio de Tangente</p>
                </div>
                <div className="flex items-center gap-6">
                    <div className="text-right hidden md:block">
                        <p className="text-[10px] font-bold text-sky-400/80 uppercase tracking-widest">Disponible Proyecto</p>
                        <p className="text-xl font-black text-sky-400">{formatCurrency(totalNet)}</p>
                    </div>
                    {/* Removed VAT display */}
                    <AddProjectButton employees={allEmployees} />
                </div>
            </header>

            <ProjectList projects={allProjects as any[]} />
        </div>
    );
}
