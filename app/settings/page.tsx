import { getCompanySettings } from '@/lib/company-data';
import SettingsForm from '@/components/SettingsForm';

export default async function SettingsPage() {
    const settings = await getCompanySettings();

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <header>
                <h2 className="text-3xl font-bold text-white mb-2">Configuración</h2>
                <p className="text-slate-400">Personaliza la identidad y datos de tu empresa</p>
            </header>

            <SettingsForm initialSettings={settings} />
        </div>
    );
}
