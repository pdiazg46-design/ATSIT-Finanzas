import { db } from './lib/db.js';
import { users } from './lib/schema.js';

try {
    const list = await db.select().from(users).all();
    console.log('--- USUARIOS REGISTRADOS EN BASE DE DATOS ---');
    console.log(list.map(u => ({ id: u.id, name: u.name, email: u.email, role: u.role })));
} catch (e) {
    console.error('Error:', e);
}
