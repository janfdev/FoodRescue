import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { stores } from "@/db/schema";
import { storeService } from "@/services/storeService";
import { eq } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");

    // Ambil data toko aktif langsung dari PostgreSQL database jika ada
    if (process.env.DATABASE_URL || process.env.POSTGRES_URL) {
      try {
        const rows = await db.select().from(stores).where(eq(stores.status, "ACTIVE"));
        if (rows && rows.length > 0) {
          const formatted = rows.map((s) => ({
            ...s,
            rating: Number(s.rating) || 5.0,
            latitude: Number(s.latitude) || -6.7172,
            longitude: Number(s.longitude) || 108.5412,
            walletBalance: Number(s.walletBalance) || 0,
            boxesSoldTotal: Number(s.boxesSoldTotal) || 0,
            currentBoxStock: Number(s.currentBoxStock) || 0,
            boxComplianceRate: Number(s.boxComplianceRate) || 100,
          }));

          let filtered = formatted;
          if (category && category !== "Semua") {
            filtered = filtered.filter((s) => s.category === category);
          }

          return NextResponse.json({
            success: true,
            source: "database",
            total: filtered.length,
            data: filtered,
          });
        }
      } catch (dbErr) {
        console.warn("DB query error for stores, using storeService fallback:", dbErr);
      }
    }

    // Fallback ke storeService jika database offline / belum terisi
    const fallbackStores = storeService.getActiveStores();
    let resultStores = fallbackStores.map((s) => ({
      ...s,
      rating: Number(s.rating) || 5.0,
      latitude: Number(s.latitude) || -6.7172,
      longitude: Number(s.longitude) || 108.5412,
      walletBalance: Number(s.walletBalance) || 0,
    }));

    if (category && category !== "Semua") {
      resultStores = resultStores.filter((s) => s.category === category);
    }

    return NextResponse.json({
      success: true,
      source: "storeService",
      total: resultStores.length,
      data: resultStores,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Terjadi kesalahan server";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
