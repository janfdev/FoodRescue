import { db, pool } from "./index";
import { users, stores, surpriseBags, rescueBoxPackages } from "./schema";
import { SEED_USERS, SEED_STORES, SEED_SURPRISE_BAGS, SEED_BOX_PACKAGES } from "../services/seedData";

async function runSeed() {
  const isFullDemo = process.env.SEED_FULL_DEMO === "true";
  console.log(`=== RUNNING DATABASE SEED (${isFullDemo ? "FULL DEMO" : "MINIMAL BOOTSTRAP"}) ===`);

  try {
    if (!process.env.DATABASE_URL && !process.env.POSTGRES_URL) {
      console.warn("⚠️ Warning: No DATABASE_URL or POSTGRES_URL defined. Skipping remote seed.");
      return;
    }

    // 1. Minimal Bootstrap: Super Admin
    console.log("-> Seeding initial Super Admin...");
    await db
      .insert(users)
      .values({
        id: "user-admin-1",
        name: "Ahmad Fauzi",
        email: "admin@rerasa.com",
        phone: "082111222333",
        role: "super_admin",
        status: "ACTIVE",
        avatarUrl: "https://api.dicebear.com/10.x/adventurer-neutral/svg?seed=AhmadFauzi",
      })
      .onConflictDoNothing();

    // 2. Full Demo Data (Only if explicitly requested)
    if (isFullDemo) {
      console.log("-> Seeding demo users...");
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
          .onConflictDoNothing();
      }

      console.log("-> Seeding demo stores...");
      for (const s of SEED_STORES) {
        await db
          .insert(stores)
          .values({
            id: s.id,
            name: s.name,
            category: s.category,
            address: s.address,
            area: s.area,
            latitude: s.latitude,
            longitude: s.longitude,
            rating: s.rating.toString(),
            reviewCount: s.reviewCount,
            isOpen: s.isOpen,
            status: s.status,
            pickupStartTime: s.pickupStartTime,
            pickupEndTime: s.pickupEndTime,
            boxComplianceRate: s.boxComplianceRate,
            boxesSoldTotal: s.boxesSoldTotal,
            currentBoxStock: s.currentBoxStock,
            walletBalance: s.walletBalance,
            bankAccount: s.bankAccount,
            kycDetails: s.kycDetails,
          })
          .onConflictDoNothing();
      }

      console.log("-> Seeding demo surprise bags...");
      for (const b of SEED_SURPRISE_BAGS) {
        await db
          .insert(surpriseBags)
          .values({
            id: b.id,
            storeId: b.storeId,
            title: b.title,
            category: b.category,
            description: b.description,
            imageUrl: b.imageUrl,
            originalPrice: b.originalPrice,
            discountedPrice: b.discountedPrice,
            quotaToday: b.quotaToday,
            quotaRemaining: b.quotaRemaining,
            isActive: b.isActive,
            isLastCall: b.isLastCall || false,
            pickupWindow: b.pickupWindow,
            estimatedWeightKg: b.estimatedWeightKg,
            allergensWarning: b.allergensWarning,
          })
          .onConflictDoNothing();
      }

      console.log("-> Seeding rescue box packages...");
      for (const pkg of SEED_BOX_PACKAGES) {
        await db
          .insert(rescueBoxPackages)
          .values({
            id: pkg.id,
            name: pkg.name,
            description: pkg.description,
            quantityPcs: pkg.quantityPcs,
            price: pkg.price,
            dimensions: pkg.dimensions,
          })
          .onConflictDoNothing();
      }
    }

    console.log("✓ Database seeding completed successfully.");
  } catch (error) {
    console.error("✗ Seeding failed:", error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runSeed();
