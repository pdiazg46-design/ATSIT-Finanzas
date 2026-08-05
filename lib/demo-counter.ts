import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import { getDataDirectory } from './paths';

export interface DemoStats {
    totalDownloads: number;
    totalProjectLaunches: number;
    lastAccessedAt: string;
    version: string;
}

const COUNTER_FILE = join(getDataDirectory(), 'demo-downloads-counter.json');

const defaultStats: DemoStats = {
    totalDownloads: 124, // Base initial demo counter for display
    totalProjectLaunches: 1,
    lastAccessedAt: new Date().toISOString(),
    version: '1.1.0'
};

export async function getDemoStats(): Promise<DemoStats> {
    try {
        if (!existsSync(COUNTER_FILE)) {
            await writeFile(COUNTER_FILE, JSON.stringify(defaultStats, null, 2));
            return defaultStats;
        }
        const data = await readFile(COUNTER_FILE, 'utf-8');
        return { ...defaultStats, ...JSON.parse(data) };
    } catch {
        return defaultStats;
    }
}

export async function recordProjectLaunch(): Promise<DemoStats> {
    try {
        const stats = await getDemoStats();
        const updated: DemoStats = {
            ...stats,
            totalProjectLaunches: (stats.totalProjectLaunches || 0) + 1,
            lastAccessedAt: new Date().toISOString()
        };
        await writeFile(COUNTER_FILE, JSON.stringify(updated, null, 2));
        return updated;
    } catch {
        return defaultStats;
    }
}

export async function recordDemoDownload(): Promise<DemoStats> {
    try {
        const stats = await getDemoStats();
        const updated: DemoStats = {
            ...stats,
            totalDownloads: (stats.totalDownloads || 0) + 1,
            lastAccessedAt: new Date().toISOString()
        };
        await writeFile(COUNTER_FILE, JSON.stringify(updated, null, 2));
        return updated;
    } catch {
        return defaultStats;
    }
}
