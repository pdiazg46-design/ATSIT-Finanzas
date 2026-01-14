import { createClient } from "@libsql/client";
import dotenv from "dotenv";
import fs from "fs";

// Load environment variables
dotenv.config({ path: '.env.local' });
dotenv.config();

async function main() {
    console.log("🛡️  Agregando sistema de permisos a la Base de Datos...");

    // Interactive creds if missing
    let url = process.env.DATABASE_URL;
    let authToken = process.env.DATABASE_AUTH_TOKEN;

    if (!authToken) {
        console.log("   Por favor, PEGA TU TOKEN (el que empieza con eyJ...) aquí:");
        const readline = (await import('readline')).createInterface({
            input: process.stdin,
            output: process.stdout
        });
        authToken = await new Promise(resolve => {
            readline.question('> ', (answer) => {
                readline.close();
                resolve(answer.trim());
            });
        });
    }

    // FORCE HTTPS
    const finalUrl = url?.replace("libsql://", "https://");
    const finalToken = authToken?.replace(/^['"]|['"]$/g, '');

    if (!finalUrl || !finalToken) {
        console.error("❌ Faltan credenciales.");
        return;
    }

    const db = createClient({ url: finalUrl, authToken: finalToken });

    try {
        // 1. Add permissions column
        console.log("   Ejecutando ALTER TABLE...");
        await db.execute(`ALTER TABLE users ADD COLUMN permissions TEXT`);
        console.log("   ✅ Columna 'permissions' agregada.");
    } catch (e) {
        if (e.message.includes("duplicate column")) {
            console.log("   ⚠️ La columna ya existía. Continuando...");
        } else {
            console.error("   ❌ Error al alterar tabla:", e.message);
        }
    }

    try {
        // 2. Grant ADMIN to Patricio
        console.log("   Asignando superpoderes a Patricio...");
        // JSON array with all permissions
        const adminPerms = JSON.stringify(['ADMIN', 'MANAGE_PROJECTS', 'MANAGE_TASKS', 'MANAGE_EMPLOYEES']);

        await db.execute({
            sql: "UPDATE users SET permissions = ? WHERE name = 'Patricio' OR email = 'pdiazg46@gmail.com'",
            args: [adminPerms]
        });
        console.log("   ✅ Patricio ahora es Administrador Total.");

    } catch (e) {
        console.error("   ❌ Error asignando admin:", e.message);
    }

    console.log("✨ BASE DE DATOS ACTUALIZADA CON PERMISOS");
}

main();
