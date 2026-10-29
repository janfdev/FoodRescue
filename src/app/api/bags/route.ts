import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { surpriseBags } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const storeId = searchParams.get("storeId");

    // Ambil data surprise bags aktif langsung dari PostgreSQL database
    if (process.env.DATABASE_URL || process.env.POSTGRES_URL) {
      try {
        const rows = await db
          .select()
          .from(surpriseBags)
          .where(eq(surpriseBags.isActive, true));
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
      } catch (dbErr) {
        console.warn("DB query error for surpriseBags:", dbErr);
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
