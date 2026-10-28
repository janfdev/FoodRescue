import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { orders, escrowAccounts } from "@/db/schema";
import { storeService } from "@/services/storeService";
import { desc } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const buyerId = searchParams.get("buyerId");
    const storeId = searchParams.get("storeId");

    // Coba baca dari DB jika terkoneksi
    if (process.env.DATABASE_URL || process.env.POSTGRES_URL) {
      try {
        const rows = await db.select().from(orders).orderBy(desc(orders.createdAt));
        let filtered = rows;
        if (buyerId) {
          filtered = filtered.filter((o) => o.buyerId === buyerId);
        }
        if (storeId) {
          filtered = filtered.filter((o) => o.storeId === storeId);
        }

        if (filtered.length > 0) {
          return NextResponse.json({
            success: true,
            source: "database",
            data: filtered,
          });
        }
      } catch (dbErr) {
        console.warn("DB offline, fallback ke storeService:", dbErr);
      }
    }

    // Fallback ke storeService
    let list = storeService.getState().orders;
    if (buyerId) {
      list = list.filter((o) => o.buyerId === buyerId);
    }
    if (storeId) {
      list = list.filter((o) => o.storeId === storeId);
    }

    return NextResponse.json({
      success: true,
      source: "simulation",
      data: list,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Terjadi kesalahan server";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { bagId, quantity = 1, paymentMethod = "QRIS" } = body;

    if (!bagId) {
      return NextResponse.json(
        { success: false, error: "Field bagId wajib disertakan" },
        { status: 400 }
      );
    }

    // Buat pesanan lewat storeService (yang juga menangani validasi kuota, escrow, dan PIN)
    const newOrder = storeService.createOrder(bagId, quantity, paymentMethod);

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
      } catch (dbErr) {
        console.warn("Dual-write DB gagal, order tetap tersimpan di in-memory:", dbErr);
      }
    }

    return NextResponse.json({
      success: true,
      data: newOrder,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Gagal membuat pesanan";
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
