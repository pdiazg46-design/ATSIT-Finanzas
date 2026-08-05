import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import { getDataDirectory } from './paths';
import { CountryPreset, SOUTH_AMERICA_PRESETS } from './country-presets';

export type { CountryPreset };
export { SOUTH_AMERICA_PRESETS };

export interface CompanySettings {
    name: string;
    businessName: string; // Razón Social
    rut: string;          // Tax ID / RUT / NIT
    address: string;
    phone: string;
    email: string;
    website: string;
    description: string;
    isConfigured: boolean;
    country: string;
    currency: string;
    currencySymbol: string;
    locale: string;
    vatRate: number;
    honorariumRate: number;
    honorariumTaxMode: 'net_based' | 'gross_based';
    taxName: string;
    taxReportName: string;
}

const defaultSettings: CompanySettings = {
    name: 'ATSIT Finanzas',
    businessName: 'ATSIT SpA',
    rut: '',
    address: '',
    phone: '',
    email: '',
    website: '',
    description: 'Sistema de Gestión de Proyectos',
    isConfigured: true,
    country: 'Chile',
    currency: 'CLP',
    currencySymbol: '$',
    locale: 'es-CL',
    vatRate: 0.19,
    honorariumRate: 0.1525,
    honorariumTaxMode: 'net_based',
    taxName: 'IVA',
    taxReportName: 'Formulario F29'
};

const DATA_FILE = join(getDataDirectory(), 'company-settings.json');

export async function getCompanySettings(): Promise<CompanySettings> {
    try {
        if (!existsSync(DATA_FILE)) {
            if (process.env.NODE_ENV !== 'production') {
                await writeFile(DATA_FILE, JSON.stringify(defaultSettings, null, 2));
            }
            return defaultSettings;
        }
        const data = await readFile(DATA_FILE, 'utf-8');
        const parsed = JSON.parse(data);
        return { ...defaultSettings, ...parsed };
    } catch (error) {
        console.error('Failed to read company settings:', error);
        return defaultSettings;
    }
}

export async function saveCompanySettings(settings: Partial<CompanySettings>) {
    try {
        const current = await getCompanySettings();
        const updated = { ...current, ...settings };
        await writeFile(DATA_FILE, JSON.stringify(updated, null, 2));
        return { success: true };
    } catch (error) {
        console.error('Failed to save company settings:', error);
        return { success: false, error: 'Failed to save settings' };
    }
}
