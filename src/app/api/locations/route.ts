import { NextResponse } from "next/server";
import { db } from "@/db";
import { stores } from "@/db/schema";
import { storeService } from "@/services/storeService";

export async function GET() {
  try {
    const locationsSet = new Set<string>();

    // 1. Ambil dari database PostgreSQL jika aktif
    if (process.env.DATABASE_URL || process.env.POSTGRES_URL) {
      try {
        const rows = await db.select({ area: stores.area }).from(stores);
        for (const r of rows) {
          if (r.area) locationsSet.add(r.area.trim());
        }
      } catch (dbErr) {
        console.warn("DB offline, fallback ke storeService:", dbErr);
      }
    }

    // 2. Ambil dari storeService
    const currentStores = storeService.getState().stores;
    for (const s of currentStores) {
      if (s.area) locationsSet.add(s.area.trim());
    }

    // Default curated area Cirebon Raya
    const defaultAreas = [
      "Semua Lokasi",
      "Tuparev",
      "Kartini",
      "Siliwangi",
      "Kesambi",
      "Harjamukti",
      "Kedawung",
      "Plered",
      "Sumber",
      "Pekiringan",
      "Karanggetas",
      "Kejaksan",
    ];

    for (const a of defaultAreas) {
      if (a !== "Semua Lokasi") {
        locationsSet.add(a);
      }
    }

    const sortedList = Array.from(locationsSet).sort();
    const finalLocations = ["Semua Lokasi", ...sortedList];

    return NextResponse.json({
      success: true,
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
