import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';

export function getDataDirectory(): string {
    // Web / Vercel cloud mode
    if (process.env.VERCEL || process.env.NEXT_PUBLIC_VERCEL_ENV) {
        return process.cwd();
    }

    // Desktop App mode: store user data in %APPDATA%/ATSIT-Finanzas-Data
    const appData = process.env.APPDATA || process.env.HOME || process.cwd();
    const dataDir = join(appData, 'ATSIT-Finanzas-Data');
    if (!existsSync(dataDir)) {
        try {
            mkdirSync(dataDir, { recursive: true });
        } catch (e) {
            return process.cwd();
        }
    }
    return dataDir;
}
