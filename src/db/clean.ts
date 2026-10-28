import { pool } from "./index";

async function runClean() {
  console.log("=== EMPTYING / TRUNCATING DATABASE TABLES ===");
  try {
    if (!process.env.DATABASE_URL && !process.env.POSTGRES_URL) {
      console.warn("⚠️ Warning: No DATABASE_URL or POSTGRES_URL defined. Skipping clean.");
      return;
    }

    const client = await pool.connect();
    try {
      console.log("-> Truncating all tables with CASCADE...");
      await client.query(`
        TRUNCATE TABLE 
          dispute_tickets,
          withdrawal_requests,
          reviews,
          rescue_box_orders,
          rescue_box_packages,
          chat_messages,
          escrow_accounts,
          orders,
          surprise_bags,
          stores,
          users
        CASCADE;
      `);
      console.log("✓ All tables emptied cleanly.");
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("✗ Failed to clean database:", error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runClean();
