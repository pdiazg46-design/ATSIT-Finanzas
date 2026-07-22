import { getCompanySettings } from '@/lib/company-data';
import SettingsForm from '@/components/SettingsForm';
import UsersManager from '@/components/UsersManager';
import { getUsers, hasPermission } from '@/lib/user-actions';
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
    let hasError = false;

    try {
        // Attempt to load settings
        try {
            settings = await getCompanySettings();
        } catch (e) {
            console.error("Failed to load company settings:", e);
        }

        // Attempt to check permissions and load users
        if (process.env.DATABASE_URL) {
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
        <div className="max-w-4xl mx-auto space-y-8">
            <header>
                <h2 className="text-3xl font-bold text-white mb-2">Configuración</h2>
                <p className="text-slate-400">Personaliza la identidad y datos de tu empresa</p>
                {hasError && (
                    <div className="bg-amber-900/20 text-amber-200 text-xs p-2 rounded mt-2">
                        Modo Seguro (Error de Carga): Algunas funciones pueden estar deshabilitadas.
                    </div>
                )}
            </header>

            <SettingsForm initialSettings={settings} />

            {isAdmin && (
                <UsersManager initialUsers={users} />
            )}
        </div>
    );
}
