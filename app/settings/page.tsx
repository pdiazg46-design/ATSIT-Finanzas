import { getCompanySettings } from '@/lib/company-data';
import SettingsTabContainer from '@/components/SettingsTabContainer';
import { getUsers, hasPermission } from '@/lib/user-actions';
import { getMovements, getDocuments } from '@/lib/catalog-actions';
import { PERMISSIONS } from '@/lib/permissions';

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
    let settings = {
        name: 'ATSIT Finanzas',
        businessName: 'ATSIT SpA',
        description: '',
        phone: '',
        address: '',
        website: '',
        email: '',
        rut: ''
    };
    let isAdmin = false;
    let users: any[] = [];
    let movements: any[] = [];
    let documents: any[] = [];
    let hasError = false;

    try {
        try {
            settings = await getCompanySettings();
        } catch (e) {
            console.error("Failed to load company settings:", e);
        }

        try {
            movements = await getMovements();
            documents = await getDocuments();
        } catch (e) {
            console.error("Failed to load catalog data:", e);
        }

        if (process.env.DATABASE_URL || true) {
            try {
                isAdmin = await hasPermission(PERMISSIONS.ADMIN);
                if (isAdmin) {
                    users = await getUsers();
                }
            } catch (e) {
                console.warn("DB operations failed during settings load:", e);
            }
        }
    } catch (criticalError) {
        console.error("CRITICAL SETTINGS PAGE ERROR:", criticalError);
        hasError = true;
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <header>
                <h2 className="text-3xl font-bold text-white mb-1">Configuración del Sistema</h2>
                <p className="text-slate-400 text-sm">Personaliza la identidad, categorías financieras, documentos y equipo</p>
                {hasError && (
                    <div className="bg-amber-900/20 text-amber-200 text-xs p-2 rounded mt-2">
                        Modo Seguro (Error de Carga): Algunas funciones pueden estar deshabilitadas.
                    </div>
                )}
            </header>

            <SettingsTabContainer
                initialSettings={settings}
                initialUsers={users}
                initialMovements={movements}
                initialDocuments={documents}
                isAdmin={isAdmin}
            />
        </div>
    );
}
