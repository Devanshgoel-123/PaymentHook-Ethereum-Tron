import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "../src/db/schema";

let pool: Pool;
let db: ReturnType<typeof drizzle>;

beforeAll(async () => {
  pool = new Pool({ connectionString: process.env.DATABASE_URL });
  db = drizzle(pool, { schema });

  await db.delete(schema.MonitoringSessions);
  await db.delete(schema.activeUsers);
});

afterEach(async () => {
  await db.delete(schema.MonitoringSessions);
  await db.delete(schema.activeUsers);
});

afterAll(async () => {
  await pool.end();
});

export { db };
