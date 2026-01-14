import { createClient } from "@libsql/client";
import dotenv from "dotenv";
import fs from "fs";

// Load environment variables
dotenv.config({ path: '.env.local' });
dotenv.config();

// Helper to log to file and console
function log(msg) {
    console.log(msg);
    try {
        fs.appendFileSync("migration_log.txt", msg + "\n");
    } catch (e) { }
}

async function main() {
    // Clear log
    fs.writeFileSync("migration_log.txt", "INICIO MIGRACION " + new Date().toISOString() + "\n");

    log("🚀 INICIANDO MIGRACIÓN DE DATOS REALES A PRODUCCIÓN...");
    log("-----------------------------------------------------");

    // 1. Verify Local DB
    if (!fs.existsSync("finance.db")) {
        log("❌ ERROR: No encuentro el archivo 'finance.db' en la raíz.");
        log("   Asegúrate de estar en la carpeta correcta: " + process.cwd());
        return;
    }
    log("✅ Base de datos local encontrada: finance.db");

    // 2. Setup Local Source
    const local = createClient({
        url: "file:finance.db",
    });

    // 3. Setup Remote Destination
    let remoteUrl = process.env.DATABASE_URL;
    let remoteToken = process.env.DATABASE_AUTH_TOKEN;

    // Interactive Prompt if Token is missing
    if (!remoteToken) {
        log("⚠️  AVISO: No encontré DATABASE_AUTH_TOKEN en el archivo .env");
        log("   Por favor, PEGA TU TOKEN (el que empieza con eyJ...) aquí y presiona ENTER:");

        const readline = (await import('readline')).createInterface({
            input: process.stdin,
            output: process.stdout
        });

        remoteToken = await new Promise(resolve => {
            readline.question('> ', (answer) => {
                readline.close();
                resolve(answer.trim());
            });
        });

        log("   ✅ Token recibido manualmente.");
    }

    // Sanitize Token
    const cleanToken = remoteToken?.replace(/^['"]|['"]$/g, '');

    // If remote URL is still local file (default in .env), ask for it or fail?
    // Usually DATABASE_URL in .env is 'file:finance.db'. We need the TURSO URL.
    // The user probably has 'file:finance.db' in .env based on my view_file.
    // We need to ask for the URL too if it looks local.

    if (!remoteUrl || remoteUrl.startsWith('file:')) {
        log("⚠️  AVISO: DATABASE_URL parece ser local (" + remoteUrl + "). Necesitamos la URL de Turso.");
        // Try to construct it or ask? Let's ask to be safe, or check if they have it elsewhere.
        // But typically Vercel env vars aren't in local .env unless pasted.

        // Let's assume they might stick to the local one if we don't ask.
        // Actually, if they only paste the token, we still need the URL.
        // Let's ask for the URL if it's missing or file:

        const readline = (await import('readline')).createInterface({
            input: process.stdin,
            output: process.stdout
        });

        log("   Por favor, PEGA LA URL DE LA BASE DE DATOS (libsql://... o https://...) y presiona ENTER:");
        remoteUrl = await new Promise(resolve => {
            readline.question('> ', (answer) => {
                readline.close();
                resolve(answer.trim());
            });
        });
    }

    if (!remoteUrl || !cleanToken) {
        log("❌ ERROR: Faltan credenciales.");
        return;
    }
    log(`✅ Destino remoto configurado: ${remoteUrl.split(':')[0]}://...`);

    // Force HTTPS for stability
    const finalRemoteUrl = remoteUrl.replace("libsql://", "https://");
    const remote = createClient({
        url: finalRemoteUrl,
        authToken: cleanToken,
    });

    // 4. Define Tables in Order (Dependencies first)
    const tables = [
        "users",        // Users first
        "movements",    // No deps
        "documents",    // No deps
        "employees",    // Referenced by projects
        "projects",     // Referenced by tasks
        "tasks",        // References everything
        "vat_payments"  // Standalone usually
    ];

    // 5. Migrate Loop
    for (const table of tables) {
        log(`\n📦 Procesando tabla: ${table.toUpperCase()}...`);
        try {
            // Read Local
            const result = await local.execute(`SELECT * FROM ${table}`);
            const rows = result.rows;

            if (rows.length === 0) {
                log(`   ⚠️  Tabla vacía localmente. Saltando.`);
                continue;
            }

            log(`   📥 Leídos ${rows.length} registros locales.`);

            // Build Insert SQL
            const columns = result.columns;
            const placeholders = columns.map(() => "?").join(", ");

            // Upsert: INSERT OR REPLACE to overwrite the initial seed admin or empty state
            const sql = `INSERT OR REPLACE INTO ${table} (${columns.join(", ")}) VALUES (${placeholders})`;

            let count = 0;
            let errors = 0;

            for (const row of rows) {
                try {
                    const values = columns.map(c => row[c]);
                    await remote.execute({ sql, args: values });
                    count++;
                    if (count % 5 === 0 || count === rows.length) {
                        process.stdout.write(`\r   📤 Guardando... ${count}/${rows.length}`);
                    }
                } catch (insertErr) {
                    errors++;
                    // console.error(`Err row ${row.id}:`, insertErr.message);
                }
            }
            log(`\n   ✅ ${table} completada. (${count} éxitos, ${errors} fallos)`);

        } catch (e) {
            if (e.message.includes('no such table')) {
                log(`   ⚠️  La tabla ${table} no existe en local o remoto.`);
            } else {
                log(`\n❌ Error fatal en tabla ${table}: ${e.message}`);
            }
        }
    }

    log("\n-----------------------------------------------------");
    log("✨ MIGRACIÓN FINALIZADA");
    log("   Ahora entra a la web y recarga para ver tus datos.");
}

main().catch(err => log("FATAL: " + err))
    .finally(() => {
        log("\nPresiona CTRL+C para salir...");
        // Keep alive to see output
        setInterval(() => { }, 1000);
    });
