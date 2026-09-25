import { db } from './src/lib/db';
import { products } from './src/db/schema';
import { desc } from 'drizzle-orm';

async function checkDb() {
  try {
    const allProducts = await db.select().from(products).orderBy(desc(products.createdAt)).limit(1);
    console.log(JSON.stringify(allProducts[0], null, 2));
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkDb();
