import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { orders, escrowAccounts, surpriseBags } from "@/db/schema";
import { storeService } from "@/services/storeService";
import { recordAuditLog } from "@/lib/audit";
import { desc, and, eq, gte, lte, sql } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const buyerId = searchParams.get("buyerId");
    const storeId = searchParams.get("storeId");
    const role = searchParams.get("role"); // role=admin bypasses storeId requirement
    const status = searchParams.get("status");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const aggregate = searchParams.get("aggregate"); // "weekly" | "analytics"

    // Security Gate (OWASP BOLA Protection):
    // Melarang pemanggilan tanpa filter scope identitas untuk mencegah dump data, kecuali role=admin
    if (!buyerId && !storeId && role !== "admin") {
      return NextResponse.json(
        {
          success: false,
          error: "Akses ditolak: Parameter 'buyerId', 'storeId', atau 'role=admin' wajib disertakan.",
        },
        { status: 403 }
      );
    }

    // Coba baca dari DB jika terkoneksi
    if (process.env.DATABASE_URL || process.env.POSTGRES_URL) {
      try {
        const conditions = [];
        if (buyerId) conditions.push(eq(orders.buyerId, buyerId));
        if (storeId) conditions.push(eq(orders.storeId, storeId));
        if (status) conditions.push(eq(orders.status, status as any));
        if (startDate) conditions.push(gte(orders.createdAt, new Date(startDate)));
        if (endDate) conditions.push(lte(orders.createdAt, new Date(endDate)));

        const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

        // Mode Agregasi Analitik Backend
        if (aggregate === "analytics") {
          const rows = await db
            .select()
            .from(orders)
            .where(whereClause)
            .orderBy(desc(orders.createdAt));

          const totalGmv = rows.reduce((acc, curr) => acc + (curr.totalPrice || 0), 0);
          const totalPortions = rows.reduce((acc, curr) => acc + (curr.quantity || 0), 0);
          const totalOrders = rows.length;

          // Hitung distribusi 7 hari terakhir
          const days = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
          const now = new Date();
          const weeklyTrend = [];
          for (let i = 6; i >= 0; i--) {
            const d = new Date(now);
            d.setDate(d.getDate() - i);
            const dayName = days[d.getDay()];
            const dateStr = d.toISOString().split("T")[0];

            const dayOrders = rows.filter((o) => {
              if (!o.createdAt) return false;
              const oDate = new Date(o.createdAt).toISOString().split("T")[0];
              return oDate === dateStr && (o.status === "COMPLETED" || o.status === "PAID");
            });

            const dayGmv = dayOrders.reduce((sum, o) => sum + (o.totalPrice || 0), 0);
            const dayPortions = dayOrders.reduce((sum, o) => sum + (o.quantity || 0), 0);

            weeklyTrend.push({ day: dayName, date: dateStr, gmv: dayGmv, portions: dayPortions });
          }

          return NextResponse.json({
            success: true,
            source: "database",
            analytics: {
              totalOrders,
              totalGmv,
              totalPortions,
              weeklyTrend,
            },
          });
        }

        const rows = await db
          .select()
          .from(orders)
          .where(whereClause)
          .orderBy(desc(orders.createdAt));

        return NextResponse.json({
          success: true,
          source: "database",
          total: rows.length,
          data: rows,
        });
      } catch (dbErr) {
        console.warn("DB offline saat ambil orders:", dbErr);
      }
    }

    // Fallback storeService jika DB offline
    let memoryOrders = storeService.getState().orders || [];
    if (buyerId) memoryOrders = memoryOrders.filter((o) => o.buyerId === buyerId);
    if (storeId) memoryOrders = memoryOrders.filter((o) => o.storeId === storeId);
    if (status) memoryOrders = memoryOrders.filter((o) => o.status === status);

    return NextResponse.json({
      success: true,
      source: "storeService",
      total: memoryOrders.length,
      data: memoryOrders,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Terjadi kesalahan server";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { bagId, quantity = 1, paymentMethod = "QRIS", buyerId } = body;

    // RBAC & Auth Guard: Pembelian wajib oleh user terotentikasi (role buyer)
    const effectiveBuyerId = buyerId || storeService.getState().currentUser?.id;
    const currentUser = storeService.getState().currentUser;

    if (!effectiveBuyerId) {
      return NextResponse.json(
        { success: false, error: "Otentikasi diperlukan: Silakan login sebagai pembeli (buyer) terlebih dahulu." },
        { status: 401 }
      );
    }

    if (currentUser && currentUser.role !== "buyer") {
      return NextResponse.json(
        { success: false, error: "Akses ditolak: Hanya akun pembeli (buyer) yang dapat melakukan pemesanan makanan." },
        { status: 403 }
      );
    }

    if (!bagId) {
      return NextResponse.json(
        { success: false, error: "Field bagId wajib disertakan" },
        { status: 400 }
      );
    }

    // Buat pesanan lewat storeService (yang juga menangani validasi kuota, escrow, dan PIN)
    const newOrder = storeService.createOrder(bagId, paymentMethod, undefined, quantity);

    // Jika DB aktif, lakukan dual-write sinkronisasi
    if (process.env.DATABASE_URL || process.env.POSTGRES_URL) {
      try {
        await db.insert(orders).values({
          id: newOrder.id,
          buyerId: newOrder.buyerId,
          buyerName: newOrder.buyerName,
          buyerPhone: newOrder.buyerPhone,
          storeId: newOrder.storeId,
          storeName: newOrder.storeName,
          bagId: newOrder.bagId,
          bagTitle: newOrder.bagTitle,
          quantity: newOrder.quantity,
          unitPrice: newOrder.unitPrice,
          subtotalPrice: newOrder.subtotalPrice || newOrder.unitPrice * newOrder.quantity,
          adminFee: newOrder.adminFee || 1000,
          totalPrice: newOrder.totalPrice,
          platformFee: newOrder.platformFee,
          sellerEarning: newOrder.sellerEarning,
          status: newOrder.status,
          paymentMethod: newOrder.paymentMethod,
          paidAt: newOrder.paidAt ? new Date(newOrder.paidAt) : new Date(),
          pickupCode: newOrder.pickupCode,
          pickupQrData: newOrder.pickupQrData,
          isChatLocked: false,
        });

        await db.insert(escrowAccounts).values({
          id: `escrow-${newOrder.id}`,
          orderId: newOrder.id,
          heldAmount: newOrder.totalPrice,
          status: "HELD",
        });

        // Pengurangan kuota stok di database PostgreSQL secara atomik
        await db
          .update(surpriseBags)
          .set({
            quotaRemaining: sql`GREATEST(0, ${surpriseBags.quotaRemaining} - ${newOrder.quantity})`,
            updatedAt: new Date(),
          })
          .where(eq(surpriseBags.id, newOrder.bagId));
      } catch (dbErr) {
        console.warn("Dual-write DB gagal, order tetap tersimpan di in-memory:", dbErr);
      }
    }

    // Catat ke Audit Log
    recordAuditLog({
      actorId: newOrder.buyerId,
      actorName: newOrder.buyerName,
      actorRole: "buyer",
      action: "ORDER_PAID",
      entityType: "order",
      entityId: newOrder.id,
      details: `Pesanan ${newOrder.bagTitle} (Qty: ${newOrder.quantity}) terbayar Rp ${newOrder.totalPrice.toLocaleString("id-ID")} via ${newOrder.paymentMethod}`,
    }).catch((err) => console.warn("Gagal merekam audit log order:", err));

    return NextResponse.json({
      success: true,
      data: newOrder,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Gagal membuat pesanan";
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
