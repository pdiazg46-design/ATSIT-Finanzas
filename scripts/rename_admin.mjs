import { createClient } from "@libsql/client";
import dotenv from "dotenv";

dotenv.config({ path: '.env.local' });
dotenv.config();

async function main() {
    console.log("🔄 Actualizando usuario Admin a nombre simple...");

    let url = process.env.DATABASE_URL;
    let authToken = process.env.DATABASE_AUTH_TOKEN;

    // Header 
    console.log("-----------------------------------------------------");

    // Interactive Prompt if Token is missing
    if (!authToken) {
        console.log("⚠️  AVISO: No encontré el token en .env");
        console.log("   Por favor, PEGA TU TOKEN (el que empieza con eyJ...) aquí y presiona ENTER:");

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

    // Check URL
    if (!url || url.startsWith('file:')) {
        console.log("⚠️  AVISO: Necesitamos la URL de Turso (libsql://...).");
        const readline = (await import('readline')).createInterface({
            input: process.stdin,
            output: process.stdout
        });
        console.log("   Pega la URL aquí:");
        url = await new Promise(resolve => {
            readline.question('> ', (answer) => {
                readline.close();
                resolve(answer.trim());
            });
        });
    }

    // Clean and Connect
    const finalUrl = url?.replace("libsql://", "https://");
    const finalToken = authToken?.replace(/^['"]|['"]$/g, '');

    if (!finalUrl || !finalToken) {
        console.error("❌ Faltan credenciales.");
        return;
    }

    const db = createClient({ url: finalUrl, authToken: finalToken });

    try {
        // Update the main admin user to use 'Patricio' as the identifier (stored in email column for compatibility)
        await db.execute({
            sql: "UPDATE users SET email = 'Patricio', name = 'Patricio' WHERE email = 'pdiazg46@gmail.com'",
            args: []
        });
        console.log("✅ Actualizado: Ahora puedes ingresar como 'Patricio'");
    } catch (e) {
        console.error("Error:", e.message);
    }
}

main();
