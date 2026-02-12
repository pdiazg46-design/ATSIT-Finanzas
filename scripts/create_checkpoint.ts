
import { copyFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';

const BACKUP_DIR = 'backups';
const FILES_TO_BACKUP = [
    'finance.db',
    'company-settings.json',
    '.env',
    'components/AddTaskModal.tsx'
];

function createCheckpoint() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const checkpointDir = join(BACKUP_DIR, `checkpoint-${timestamp}`);

    if (!existsSync(BACKUP_DIR)) {
        mkdirSync(BACKUP_DIR);
    }
    mkdirSync(checkpointDir);

    console.log(`Creating checkpoint at ${checkpointDir}...`);

    FILES_TO_BACKUP.forEach(file => {
        if (existsSync(file)) {
            const dest = join(checkpointDir, file.replace(/\//g, '_'));
            copyFileSync(file, dest);
            console.log(`Included: ${file}`);
        } else {
            console.warn(`Skipped (not found): ${file}`);
        }
    });

    console.log('Checkpoint created successfully.');
}

createCheckpoint();
