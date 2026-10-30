import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { reviews, stores, orders } from "@/db/schema";
import { storeService } from "@/services/storeService";
import { eq, desc } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const storeId = searchParams.get("storeId");

    // Jika DB PostgreSQL aktif, baca dari DB
    if (process.env.DATABASE_URL || process.env.POSTGRES_URL) {
      try {
        const query = db.select().from(reviews).orderBy(desc(reviews.createdAt));
        const rows = storeId
          ? await query.where(eq(reviews.storeId, storeId))
          : await query;

        if (rows && rows.length > 0) {
          return NextResponse.json({
            success: true,
            source: "database",
            total: rows.length,
            data: rows,
          });
        }
      } catch (dbErr) {
        console.warn("DB query error for reviews, falling back to storeService:", dbErr);
      }
    }

    // Fallback storeService in-memory
    let memoryReviews = storeService.getState().reviews || [];
    if (storeId) {
      memoryReviews = memoryReviews.filter((r) => r.storeId === storeId);
    }

    return NextResponse.json({
      success: true,
      source: "storeService",
      total: memoryReviews.length,
      data: memoryReviews,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Gagal mengambil data ulasan";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { orderId, rating, comment, usedRescueBox } = body;

    if (!orderId || !rating) {
      return NextResponse.json(
        { success: false, error: "Field orderId dan rating wajib diisi" },
        { status: 400 }
      );
    }

    // Eksekusi review lewat storeService
    const newReview = storeService.submitReview(orderId, Number(rating), comment || "", Boolean(usedRescueBox));

    // Sinkronisasi ke DB jika online
    if (process.env.DATABASE_URL || process.env.POSTGRES_URL) {
      try {
        await db.insert(reviews).values({
          id: newReview.id,
          orderId: newReview.orderId,
          storeId: newReview.storeId,
          buyerId: newReview.buyerId,
          buyerName: newReview.buyerName,
          rating: newReview.rating,
          comment: newReview.comment,
          usedOfficialRescueBox: newReview.usedOfficialRescueBox,
          createdAt: new Date(newReview.createdAt),
        });

        // Recalculate dan update boxComplianceRate di DB
        const allStoreReviews = await db
          .select()
          .from(reviews)
          .where(eq(reviews.storeId, newReview.storeId));
        if (allStoreReviews.length > 0) {
          const compliantCount = allStoreReviews.filter((r) => r.usedOfficialRescueBox).length;
          const rate = Math.round((compliantCount / allStoreReviews.length) * 100);
          await db
            .update(stores)
            .set({ boxComplianceRate: rate })
            .where(eq(stores.id, newReview.storeId));
        }
      } catch (dbErr) {
        console.warn("Dual-write review DB gagal:", dbErr);
      }
    }

    return NextResponse.json({
      success: true,
      data: newReview,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Gagal menyimpan ulasan";
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
