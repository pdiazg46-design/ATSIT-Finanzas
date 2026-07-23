import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import { networkInterfaces } from 'os';
import crypto from 'crypto';

export interface LicenseData {
    installedAt: string;
    licenseType: 'DEMO' | 'FULL';
    licenseKey?: string;
    boundHwid?: string;
}

import { getDataDirectory } from './paths';

const LICENSE_FILE = join(getDataDirectory(), 'license.json');
const MASTER_SECRET = 'ATSIT-MASTER-KEY-SECRET-FINANZA-2026';

// 1. Get Hardware ID (MAC Address based fingerprint)
export function getHardwareId(): string {
    try {
        const nets = networkInterfaces();
        let macAddress = '';

        for (const name of Object.keys(nets)) {
            for (const net of nets[name] || []) {
                if (!net.internal && net.mac && net.mac !== '00:00:00:00:00:00') {
                    macAddress = net.mac;
                    break;
                }
            }
            if (macAddress) break;
        }

        const raw = `ATSIT-${process.platform}-${macAddress || 'DEFAULT-MAC-ADDRESS'}`;
        const hash = crypto.createHash('sha256').update(raw).digest('hex').substring(0, 16).toUpperCase();
        return `HWID-${hash.substring(0, 4)}-${hash.substring(4, 8)}-${hash.substring(8, 12)}-${hash.substring(12, 16)}`;
    } catch (e) {
        return 'HWID-0000-0000-0000-0000';
    }
}

// 2. Generate valid License Key for a specific Hardware ID
export function generateKeyForHwid(hwid: string): string {
    const raw = `${hwid.trim()}-${MASTER_SECRET}`;
    const hash = crypto.createHash('sha256').update(raw).digest('hex').substring(0, 16).toUpperCase();
    return `KEY-${hash.substring(0, 4)}-${hash.substring(4, 8)}-${hash.substring(8, 12)}-${hash.substring(12, 16)}`;
}

const DEFAULT_LICENSE: LicenseData = {
    installedAt: new Date().toISOString(),
    licenseType: 'DEMO'
};

export async function getLicenseData(): Promise<LicenseData> {
    try {
        if (!existsSync(LICENSE_FILE)) {
            await writeFile(LICENSE_FILE, JSON.stringify(DEFAULT_LICENSE, null, 2));
            return DEFAULT_LICENSE;
        }
        const data = await readFile(LICENSE_FILE, 'utf-8');
        return { ...DEFAULT_LICENSE, ...JSON.parse(data) };
    } catch (error) {
        return DEFAULT_LICENSE;
    }
}

export async function checkLicenseStatus() {
    const currentHwid = getHardwareId();
    const data = await getLicenseData();

    if (data.licenseType === 'FULL') {
        // Verify if license key is valid for THIS specific hardware ID or universal master key
        const expectedKey = generateKeyForHwid(currentHwid);
        const isUniversalMaster = ['ATSIT-PRO-2026-FULL', 'ATSIT-LIFETIME-UNLOCK', 'ATSIT-FULL-2026'].includes(data.licenseKey || '');
        const isHwidMatched = data.licenseKey === expectedKey && data.boundHwid === currentHwid;

        if (isUniversalMaster || isHwidMatched) {
            return {
                isExpired: false,
                isFull: true,
                daysRemaining: 9999,
                installedAt: data.installedAt,
                hardwareId: currentHwid
            };
        } else {
            // Hardware mismatch! Someone copied license.json to another PC!
            console.warn(`[LICENSE LOCK]: License hardware mismatch. Current HWID: ${currentHwid}, Bound HWID: ${data.boundHwid}`);
            return {
                isExpired: true,
                isFull: false,
                daysRemaining: 0,
                installedAt: data.installedAt,
                hardwareId: currentHwid,
                hardwareMismatch: true
            };
        }
    }

    const installDate = new Date(data.installedAt).getTime();
    const now = Date.now();
    const elapsedDays = Math.floor((now - installDate) / (1000 * 60 * 60 * 24));
    const daysRemaining = Math.max(0, 15 - elapsedDays);
    const isExpired = elapsedDays >= 15;

    return {
        isExpired,
        isFull: false,
        daysRemaining,
        installedAt: data.installedAt,
        hardwareId: currentHwid
    };
}

export async function activateFullLicense(key: string) {
    const currentHwid = getHardwareId();
    const cleanKey = key.trim().toUpperCase();
    const expectedKey = generateKeyForHwid(currentHwid);
    const universalKeys = ['ATSIT-PRO-2026-FULL', 'ATSIT-LIFETIME-UNLOCK', 'ATSIT-FULL-2026'];

    if (cleanKey === expectedKey || universalKeys.includes(cleanKey)) {
        const data = await getLicenseData();
        const updated: LicenseData = {
            ...data,
            licenseType: 'FULL',
            licenseKey: cleanKey,
            boundHwid: currentHwid
        };
        await writeFile(LICENSE_FILE, JSON.stringify(updated, null, 2));
        return { success: true, message: '¡Licencia de Por Vida Activada Correctamente para este equipo!' };
    }
    return { success: false, message: 'Clave de activación no válida para el ID de este equipo.' };
}
