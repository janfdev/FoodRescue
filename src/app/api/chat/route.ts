import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { chatMessages, orders } from "@/db/schema";
import { storeService } from "@/services/storeService";
import { eq, asc } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get("orderId");

    if (!orderId) {
      return NextResponse.json(
        { success: false, error: "Parameter orderId wajib disertakan" },
        { status: 400 }
      );
    }

    // Coba baca dari PostgreSQL jika terkoneksi
    if (process.env.DATABASE_URL || process.env.POSTGRES_URL) {
      try {
        const rows = await db
          .select()
          .from(chatMessages)
          .where(eq(chatMessages.orderId, orderId))
          .orderBy(asc(chatMessages.createdAt));

        return NextResponse.json({
          success: true,
          source: "database",
          data: rows.map((r) => ({
            id: r.id,
            orderId: r.orderId,
            senderRole: r.senderRole,
            senderName: r.senderName,
            senderAvatarUrl: r.senderAvatarUrl || undefined,
            text: r.text,
            timestamp: r.createdAt.toISOString(),
          })),
        });
      } catch (dbErr) {
        console.warn("Koneksi DB offline saat baca chat:", dbErr);
      }
    }

    return NextResponse.json({
      success: true,
      source: "empty",
      data: [],
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Terjadi kesalahan server";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { orderId, text, senderRole, senderName, senderAvatarUrl } = body;

    if (!orderId || !text || typeof text !== "string") {
      return NextResponse.json(
        { success: false, error: "Field orderId dan text wajib diisi" },
        { status: 400 }
      );
    }

    const trimmedText = text.trim();
    if (!trimmedText) {
      return NextResponse.json(
        { success: false, error: "Teks pesan tidak boleh kosong" },
        { status: 400 }
      );
    }

    const messageId = `msg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const now = new Date();

    // 1. Simpan ke database jika aktif
    if (process.env.DATABASE_URL || process.env.POSTGRES_URL) {
      try {
        await db.insert(chatMessages).values({
          id: messageId,
          orderId,
          senderRole: senderRole || "buyer",
          senderName: senderName || "Pengguna",
          senderAvatarUrl: senderAvatarUrl || null,
          text: trimmedText,
          createdAt: now,
        });

        return NextResponse.json({
          success: true,
          source: "database",
          data: {
            id: messageId,
            orderId,
            senderRole: senderRole || "buyer",
            senderName: senderName || "Pengguna",
            senderAvatarUrl,
            text: trimmedText,
            timestamp: now.toISOString(),
          },
        });
      } catch (dbErr) {
        console.warn("Gagal simpan ke DB, fallback ke storeService:", dbErr);
      }
    }

    // 2. Fallback simpan ke storeService
    const saved = storeService.sendChatMessage(orderId, trimmedText);
    return NextResponse.json({
      success: true,
      source: "simulation",
      data: saved,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Gagal memproses pesan chat";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
