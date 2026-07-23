const crypto = require('crypto');

const MASTER_SECRET = 'ATSIT-MASTER-KEY-SECRET-FINANZA-2026';

function generateKeyForHwid(hwid) {
    if (!hwid) return 'Error: Debes ingresar el HWID del cliente.';
    const raw = `${hwid.trim().toUpperCase()}-${MASTER_SECRET}`;
    const hash = crypto.createHash('sha256').update(raw).digest('hex').substring(0, 16).toUpperCase();
    return `KEY-${hash.substring(0, 4)}-${hash.substring(4, 8)}-${hash.substring(8, 12)}-${hash.substring(12, 16)}`;
}

const inputHwid = process.argv[2];

if (!inputHwid) {
    console.log('====================================================');
    console.log('      GENERADOR DE LICENCIAS ATSIT FINANZAS');
    console.log('====================================================');
    console.log('Uso: node scratch/generar_licencia.js HWID-XXXX-XXXX-XXXX-XXXX');
    console.log('Ejemplo: node scratch/generar_licencia.js HWID-A4F8-92B1-4812\n');
    console.log('CLAVES MAESTRAS UNIVERSALES:');
    console.log(' - ATSIT-PRO-2026-FULL');
    console.log(' - ATSIT-FULL-2026');
    console.log('====================================================');
} else {
    const key = generateKeyForHwid(inputHwid);
    console.log('====================================================');
    console.log('      LICENCIA GENERADA EXITOSAMENTE');
    console.log('====================================================');
    console.log(`ID de Equipo (HWID): ${inputHwid.trim().toUpperCase()}`);
    console.log(`Clave de Activación: ${key}`);
    console.log('====================================================');
}
