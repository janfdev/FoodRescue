import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { surpriseBags } from "@/db/schema";
import { storeService } from "@/services/storeService";
import { eq } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const storeId = searchParams.get("storeId");

    // Coba baca dari DB jika terkoneksi
    if (process.env.DATABASE_URL || process.env.POSTGRES_URL) {
      try {
        const rows = await db.select().from(surpriseBags).where(eq(surpriseBags.isActive, true));
        let filtered = rows;
        if (storeId) {
          filtered = filtered.filter((b) => b.storeId === storeId);
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

    // Fallback ke storeService state
    let list = storeService.getState().surpriseBags.filter((b) => b.isActive);
    if (storeId) {
      list = list.filter((b) => b.storeId === storeId);
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
