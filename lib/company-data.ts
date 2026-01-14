import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export interface CompanySettings {
    name: string;
    businessName: string; // Razón Social
    rut: string;          // Tax ID
    address: string;
    phone: string;
    email: string;
    website: string;
    description: string;
}

const defaultSettings: CompanySettings = {
    name: 'Tangente',
    businessName: 'Tangente SpA',
    rut: '',
    address: '',
    phone: '',
    email: '',
    website: '',
    description: 'Sistema de Gestión de Proyectos'
};

const DATA_FILE = join(process.cwd(), 'company-settings.json');

export async function getCompanySettings(): Promise<CompanySettings> {
    try {
        if (!existsSync(DATA_FILE)) {
            // In production (Vercel), we cannot write to the filesystem.
            // Just return defaults without trying to save.
            if (process.env.NODE_ENV !== 'production') {
                await writeFile(DATA_FILE, JSON.stringify(defaultSettings, null, 2));
            }
            return defaultSettings;
        }
        const data = await readFile(DATA_FILE, 'utf-8');
        return { ...defaultSettings, ...JSON.parse(data) };
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
