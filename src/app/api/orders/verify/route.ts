import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { orders, escrowAccounts } from "@/db/schema";
import { storeService } from "@/services/storeService";
import { recordAuditLog } from "@/lib/audit";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { orderId, pin, sellerStoreId } = body;
    const target = (orderId || pin || "").trim();

    if (!target) {
      return NextResponse.json(
        { success: false, error: "Field orderId wajib disertakan" },
        { status: 400 }
      );
    }

    // Security Gate: Verifikasi bahwa seller berhak atas order tersebut jika storeId dikirim
    const currentOrder = storeService
      .getState()
      .orders.find((o) => o.id === target || o.pickupCode === target);
    if (!currentOrder) {
      return NextResponse.json(
        { success: false, error: "Pesanan tidak ditemukan" },
        { status: 404 }
      );
    }

    if (sellerStoreId && currentOrder.storeId !== sellerStoreId) {
      return NextResponse.json(
        {
          success: false,
          error: "Akses ditolak: Anda tidak memiliki wewenang memverifikasi pesanan dari gerai lain.",
        },
        { status: 403 }
      );
    }

    // Eksekusi serah terima pesanan via storeService
    const result = storeService.confirmOrderHandover(target);

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

    // Catat ke Audit Log jika berhasil
    if (verifiedOrder) {
      recordAuditLog({
        actorId: verifiedOrder.storeId,
        actorName: verifiedOrder.storeName || "Kasir Toko",
        actorRole: "seller",
        action: "ORDER_HANDED_OVER",
        entityType: "order",
        entityId: verifiedOrder.id,
        details: `Serah terima ${verifiedOrder.id} selesai. Escrow dirilis Rp ${(verifiedOrder.sellerEarning || 0).toLocaleString("id-ID")} ke dompet mitra`,
      }).catch((err) => console.warn("Gagal merekam audit log handover:", err));
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
