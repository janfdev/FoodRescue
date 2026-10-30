import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { surpriseBags } from "@/db/schema";
import { storeService } from "@/services/storeService";
import { eq } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const storeId = searchParams.get("storeId");

    // Ambil data surprise bags aktif langsung dari PostgreSQL database jika ada
    if (process.env.DATABASE_URL || process.env.POSTGRES_URL) {
      try {
        const rows = await db
          .select()
          .from(surpriseBags)
          .where(eq(surpriseBags.isActive, true));
        if (rows && rows.length > 0) {
          let filtered = rows;
          if (storeId) {
            filtered = filtered.filter((b) => b.storeId === storeId);
          }
          return NextResponse.json({
            success: true,
            source: "database",
            total: filtered.length,
            data: filtered,
          });
        }
      } catch (dbErr) {
        console.warn("DB query error for surpriseBags, using storeService fallback:", dbErr);
      }
    }

    // Fallback ke storeService jika database offline / belum terisi
    let memoryBags = storeService.getSurpriseBags().filter((b) => b.isActive);
    if (storeId) {
      memoryBags = memoryBags.filter((b) => b.storeId === storeId);
    }

    return NextResponse.json({
      success: true,
      source: "storeService",
      total: memoryBags.length,
      data: memoryBags,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Terjadi kesalahan server";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
