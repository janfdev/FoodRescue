import { NextResponse } from "next/server";
import { db } from "@/db";
import { stores } from "@/db/schema";
import { storeService } from "@/services/storeService";
import { eq } from "drizzle-orm";

export async function GET() {
  try {
    const locationsSet = new Set<string>();

    // Ambil distinct area hanya dari toko aktif di database PostgreSQL jika ada
    if (process.env.DATABASE_URL || process.env.POSTGRES_URL) {
      try {
        const rows = await db
          .select({ area: stores.area })
          .from(stores)
          .where(eq(stores.status, "ACTIVE"));
        for (const r of rows) {
          if (r.area && r.area.trim()) {
            locationsSet.add(r.area.trim());
          }
        }
      } catch (dbErr) {
        console.warn("DB query error for stores area, using fallback:", dbErr);
      }
    }

    // Fallback dari storeService jika DB kosong
    if (locationsSet.size === 0) {
      storeService.getActiveStores().forEach((s) => {
        if (s.area && s.area.trim()) {
          locationsSet.add(s.area.trim());
        }
      });
    }

    const sortedList = Array.from(locationsSet).sort((a, b) => a.localeCompare(b, "id"));
    const finalLocations = ["Semua Lokasi", ...sortedList];

    return NextResponse.json({
      success: true,
      source: locationsSet.size > 0 ? "database" : "storeService",
      total: finalLocations.length,
      data: finalLocations,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Gagal mengambil daftar lokasi",
      },
      { status: 500 }
    );
  }
}
