import { db, pool } from "./index";
import {
  users,
  stores,
  surpriseBags,
  rescueBoxPackages,
  auditLogs,
  orders,
  escrowAccounts,
  rescueBoxOrders,
  reviews,
} from "./schema";
import {
  SEED_USERS,
  SEED_STORES,
  SEED_SURPRISE_BAGS,
  SEED_BOX_PACKAGES,
  SEED_ORDERS,
  SEED_BOX_ORDERS,
  SEED_REVIEWS,
} from "../services/seedData";

async function runSeed() {
  console.log("=== RUNNING FOODRESCUE PRODUCTION SEEDER ===");

  try {
    if (!process.env.DATABASE_URL && !process.env.POSTGRES_URL) {
      console.warn("⚠️ Warning: No DATABASE_URL or POSTGRES_URL defined. Skipping remote seed.");
      return;
    }

    // 1. Seed User (Admin)
    console.log(`-> Seeding ${SEED_USERS.length} user (Admin)...`);
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

    // 2. Seed Stores
    console.log(`-> Seeding ${SEED_STORES.length} stores with authentic Cirebon locations & logos...`);
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
        .onConflictDoNothing();
    }

    // 3. Seed Surprise Bags
    console.log(`-> Seeding ${SEED_SURPRISE_BAGS.length} active surprise bags...`);
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

    // 4. Seed Box Packages
    console.log("-> Seeding B2B Rescue Box packages...");
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

    // 5. Seed Orders & Escrow
    console.log(`-> Seeding ${SEED_ORDERS.length} foundational orders...`);
    for (const o of SEED_ORDERS) {
      await db
        .insert(orders)
        .values({
          id: o.id,
          buyerId: o.buyerId,
          buyerName: o.buyerName,
          buyerPhone: o.buyerPhone,
          storeId: o.storeId,
          storeName: o.storeName,
          bagId: o.bagId,
          bagTitle: o.bagTitle,
          quantity: o.quantity,
          unitPrice: o.unitPrice,
          subtotalPrice: o.unitPrice * o.quantity,
          adminFee: 1000,
          totalPrice: o.totalPrice,
          platformFee: o.platformFee,
          sellerEarning: o.sellerEarning,
          status: o.status as any,
          paymentMethod: o.paymentMethod,
          paidAt: o.paidAt ? new Date(o.paidAt) : null,
          pickupCode: o.pickupCode,
          pickupQrData: o.pickupQrData,
          completedAt: o.completedAt ? new Date(o.completedAt) : null,
          isChatLocked: o.isChatLocked ?? false,
        })
        .onConflictDoNothing();

      if (o.status === "PAID") {
        await db
          .insert(escrowAccounts)
          .values({
            id: `escrow-${o.id}`,
            orderId: o.id,
            heldAmount: o.totalPrice,
            status: "HELD",
          })
          .onConflictDoNothing();
      }
    }

    // 6. Seed Box Orders
    console.log(`-> Seeding ${SEED_BOX_ORDERS.length} rescue box orders...`);
    for (const bo of SEED_BOX_ORDERS) {
      await db
        .insert(rescueBoxOrders)
        .values({
          id: bo.id,
          storeId: bo.storeId,
          storeName: bo.storeName,
          packageId: bo.packageId,
          quantityPcs: bo.quantityPcs,
          totalPrice: bo.totalPrice,
          shippingAddress: bo.shippingAddress,
          trackingNumber: bo.trackingNumber,
          status: bo.status as any,
          orderedAt: new Date(bo.orderedAt),
        })
        .onConflictDoNothing();
    }

    // 7. Seed Reviews
    console.log(`-> Seeding ${SEED_REVIEWS.length} customer reviews...`);
    for (const r of SEED_REVIEWS) {
      await db
        .insert(reviews)
        .values({
          id: r.id,
          orderId: r.orderId,
          storeId: r.storeId,
          buyerId: r.buyerId,
          buyerName: r.buyerName,
          rating: r.rating,
          comment: r.comment,
          usedOfficialRescueBox: r.usedOfficialRescueBox ?? true,
          createdAt: new Date(r.createdAt),
        })
        .onConflictDoNothing();
    }

    // 8. Seed Initial Audit Logs
    console.log("-> Seeding foundational audit log entries...");
    await db
      .insert(auditLogs)
      .values([
        {
          id: "audit-seed-01",
          actorId: "usr-admin-01",
          actorName: "Admin Rerasa",
          actorRole: "admin",
          action: "STORE_APPROVED",
          entityType: "store",
          entityId: "store-ruby-bakery",
          details: "Verifikasi dokumen KYC dan gerai Ruby Bakery & Cake disetujui",
          ipAddress: "127.0.0.1",
        },
        {
          id: "audit-seed-02",
          actorId: "usr-buyer-01",
          actorName: "Dimas Anggara",
          actorRole: "buyer",
          action: "ORDER_PAID",
          entityType: "order",
          entityId: "RB-8492",
          details: "Transaksi berhasil via QRIS Rp 26.000, dana escrow diamankan",
          ipAddress: "182.253.12.44",
        },
      ])
      .onConflictDoNothing();

    console.log("✓ Database seeding completed successfully with all entities.");
  } catch (error) {
    console.error("✗ Seeding failed:", error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runSeed();
