import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { stores } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");

    // Ambil data toko aktif langsung dari PostgreSQL database
    if (process.env.DATABASE_URL || process.env.POSTGRES_URL) {
      try {
        const rows = await db.select().from(stores).where(eq(stores.status, "ACTIVE"));
        let filtered = rows;
        if (category && category !== "Semua") {
          filtered = filtered.filter((s) => s.category === category);
        }
        return NextResponse.json({
          success: true,
          source: "database",
          total: filtered.length,
          data: filtered,
        });
      } catch (dbErr) {
        console.warn("DB query error for stores:", dbErr);
      }
    }

    return NextResponse.json({
      success: true,
      source: "empty",
      total: 0,
      data: [],
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Terjadi kesalahan server";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
