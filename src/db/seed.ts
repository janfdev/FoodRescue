import { db, pool } from "./index";
import { users } from "./schema";
import { SEED_USERS } from "../services/seedData";

async function runSeed() {
  console.log("=== RUNNING FOODRESCUE PRODUCTION SEEDER (USERS ONLY) ===");

  try {
    if (!process.env.DATABASE_URL && !process.env.POSTGRES_URL) {
      console.warn("⚠️ Warning: No DATABASE_URL or POSTGRES_URL defined. Skipping remote seed.");
      return;
    }

    // Seed Users (Admin, Buyer, Seller)
    console.log(`-> Seeding ${SEED_USERS.length} users into database...`);
    for (const u of SEED_USERS) {
      await db
        .insert(users)
        .values({
          id: u.id,
          name: u.name,
          email: u.email,
          phone: u.phone,
          role: u.role,
          status: u.status || "ACTIVE",
          avatarUrl: u.avatarUrl,
          storeId: u.storeId,
        })
        .onConflictDoUpdate({
          target: users.id,
          set: {
            name: u.name,
            email: u.email,
            phone: u.phone,
            role: u.role,
            status: u.status || "ACTIVE",
            avatarUrl: u.avatarUrl,
            storeId: u.storeId,
          },
        });
    }

    console.log(`✓ Successfully seeded ${SEED_USERS.length} users.`);
  } catch (error) {
    console.error("✗ Seeding failed:", error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runSeed();
