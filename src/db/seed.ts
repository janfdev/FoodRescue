import { db, pool } from "./index";
import { users, stores } from "./schema";
import { SEED_USERS, SEED_STORES } from "../services/seedData";

async function runSeed() {
  console.log("=== RUNNING FOODRESCUE PRODUCTION SEEDER ===");

  try {
    if (!process.env.DATABASE_URL && !process.env.POSTGRES_URL) {
      console.warn("⚠️ Warning: No DATABASE_URL or POSTGRES_URL defined. Skipping remote seed.");
      return;
    }

    // 1. Seed Stores (Gerai Mitra Penjual dengan info operasional lengkap)
    // Field: Nama Gerai, Kawasan/Area, Alamat Fisik, Jam Mulai & Selesai Pickup
    const sellerStores = SEED_STORES.filter((s) => s.id === "store-ruby-bakery");
    console.log(`-> Seeding ${sellerStores.length} seller store(s) into database...`);
    for (const s of sellerStores) {
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
          logoUrl: s.logoUrl,
          imageUrl: s.imageUrl,
          pickupStartTime: s.pickupStartTime,
          pickupEndTime: s.pickupEndTime,
          boxComplianceRate: s.boxComplianceRate,
          boxesSoldTotal: s.boxesSoldTotal,
          currentBoxStock: s.currentBoxStock,
          walletBalance: s.walletBalance,
          bankAccount: s.bankAccount,
          kycDetails: s.kycDetails,
        })
        .onConflictDoUpdate({
          target: stores.id,
          set: {
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
            logoUrl: s.logoUrl,
            imageUrl: s.imageUrl,
            pickupStartTime: s.pickupStartTime,
            pickupEndTime: s.pickupEndTime,
            boxComplianceRate: s.boxComplianceRate,
            boxesSoldTotal: s.boxesSoldTotal,
            currentBoxStock: s.currentBoxStock,
            walletBalance: s.walletBalance,
            bankAccount: s.bankAccount,
            kycDetails: s.kycDetails,
          },
        });
    }
    console.log(`✓ Successfully seeded ${sellerStores.length} seller store(s).`);

    // 2. Seed Users (Admin, Buyer, Seller)
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
