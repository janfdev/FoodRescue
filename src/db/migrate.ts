import { migrate } from "drizzle-orm/node-postgres/migrator";
import { db, pool } from "./index";

async function runMigration() {
  console.log("=== RUNNING DRIZZLE MIGRATIONS ===");
  try {
    await migrate(db, { migrationsFolder: "./src/db/migrations" });
    console.log("✓ Drizzle migrations applied successfully.");
  } catch (error) {
    console.error("✗ Migration failed:", error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigration();
