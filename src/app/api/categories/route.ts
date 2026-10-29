import { NextResponse } from "next/server";
import { db } from "@/db";
import { stores, surpriseBags } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  try {
    const categorySet = new Set<string>();

    if (process.env.DATABASE_URL || process.env.POSTGRES_URL) {
      try {
        // 1. Ambil distinct kategori dari stores aktif di database
        const storeRows = await db
          .select({ category: stores.category })
          .from(stores)
          .where(eq(stores.status, "ACTIVE"));
        for (const r of storeRows) {
          if (r.category) categorySet.add(r.category);
        }

        // 2. Ambil distinct kategori dari surprise bags aktif di database
        const bagRows = await db
          .select({ category: surpriseBags.category })
          .from(surpriseBags)
          .where(eq(surpriseBags.isActive, true));
        for (const b of bagRows) {
          if (b.category) categorySet.add(b.category);
        }
      } catch (dbErr) {
        console.warn("Gagal membaca kategori dari database:", dbErr);
      }
    }

    const sortedList = Array.from(categorySet).sort((a, b) => a.localeCompare(b, "id"));
    const finalCategories = ["Semua", ...sortedList];

    return NextResponse.json({
      success: true,
      source: "database",
      total: finalCategories.length,
      data: finalCategories,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Gagal mengambil daftar kategori",
      },
      { status: 500 }
    );
  }
}
