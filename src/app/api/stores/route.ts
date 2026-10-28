import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { stores } from "@/db/schema";
import { storeService } from "@/services/storeService";
import { eq } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");

    // Coba baca dari DB jika terkoneksi
    if (process.env.DATABASE_URL || process.env.POSTGRES_URL) {
      try {
        const rows = await db.select().from(stores).where(eq(stores.status, "ACTIVE"));
        let filtered = rows;
        if (category) {
          filtered = filtered.filter((s) => s.category === category);
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
    let list = storeService.getState().stores.filter((s) => s.status === "ACTIVE");
    if (category) {
      list = list.filter((s) => s.category === category);
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
