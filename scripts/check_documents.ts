
import { db } from '../lib/db';
import { documents } from '../lib/schema';

async function main() {
    const docs = await db.select().from(documents).all();
    console.log('Documents in DB:');
    console.table(docs);
}

main().catch(console.error);
