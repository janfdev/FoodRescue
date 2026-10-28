import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { orders, escrowAccounts } from "@/db/schema";
import { storeService } from "@/services/storeService";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { orderId, pin } = body;

    if (!pin) {
      return NextResponse.json(
        { success: false, error: "Field pin/pickupCode wajib disertakan" },
        { status: 400 }
      );
    }

    // Eksekusi verifikasi via storeService (merilis escrow dan menambah saldo wallet seller)
    const result = storeService.verifyPickup(pin.trim());

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.message },
        { status: 400 }
      );
    }

    const verifiedOrder = result.order;

    // Dual-write ke PostgreSQL jika aktif
    if (verifiedOrder && (process.env.DATABASE_URL || process.env.POSTGRES_URL)) {
      try {
        const now = new Date();
        await db
          .update(orders)
          .set({
            status: "COMPLETED",
            completedAt: now,
            updatedAt: now,
          })
          .where(eq(orders.id, verifiedOrder.id));

        await db
          .update(escrowAccounts)
          .set({
            status: "RELEASED_TO_SELLER",
            releasedAt: now,
          })
          .where(eq(escrowAccounts.orderId, verifiedOrder.id));
      } catch (dbErr) {
        console.warn("DB update verifikasi gagal, state tersimpan di storeService:", dbErr);
      }
    }

    return NextResponse.json({
      success: true,
      message: result.message,
      data: verifiedOrder,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Gagal memverifikasi pesanan";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
