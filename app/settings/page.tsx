import { getCompanySettings } from '@/lib/company-data';
import SettingsForm from '@/components/SettingsForm';
import UsersManager from '@/components/UsersManager';
import { getUsers, hasPermission, PERMISSIONS } from '@/lib/user-actions';

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
    const settings = await getCompanySettings();
    const isAdmin = await hasPermission(PERMISSIONS.ADMIN);

    let users: any[] = [];
    if (isAdmin) {
        try {
            users = await getUsers();
        } catch (e) {
            console.error("Failed to load users", e);
        }
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <header>
                <h2 className="text-3xl font-bold text-white mb-2">Configuración</h2>
                <p className="text-slate-400">Personaliza la identidad y datos de tu empresa</p>
            </header>

            <SettingsForm initialSettings={settings} />

            {isAdmin && (
                <UsersManager initialUsers={users} />
            )}
        </div>
    );
}
