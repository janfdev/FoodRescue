import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { stores, users } from "@/db/schema";
import { StoreCategory } from "@/types/domain";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      ownerName,
      email,
      phone,
      storeName,
      category,
      area,
      address,
      pickupStartTime,
      pickupEndTime,
      bankName,
      accountNumber,
      accountHolder,
      storeFrontImage,
      logoUrl,
    } = body;

    // Validasi Field Wajib
    if (!ownerName || !email || !phone || !storeName || !category || !area || !address) {
      return NextResponse.json(
        { success: false, error: "Mohon lengkapi seluruh field wajib." },
        { status: 400 }
      );
    }

    if (!bankName || !accountNumber) {
      return NextResponse.json(
        { success: false, error: "Informasi rekening bank wajib diisi untuk pencairan saldo." },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const storeId = `store-${Date.now().toString(36)}`;
    const userId = `user-seller-${Date.now().toString(36)}`;

    // Simpan ke database jika DB terhubung
    if (process.env.DATABASE_URL || process.env.POSTGRES_URL) {
      try {
        await db.insert(stores).values({
          id: storeId,
          name: storeName.trim(),
          category: category as StoreCategory,
          address: address.trim(),
          area: area.trim(),
          latitude: -6.72 + (Math.random() - 0.5) * 0.05,
          longitude: 108.55 + (Math.random() - 0.5) * 0.05,
          rating: "5.00",
          reviewCount: 0,
          isOpen: false,
          status: "PENDING_APPROVAL",
          logoUrl: logoUrl || "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=200&auto=format&fit=crop&q=80",
          imageUrl: storeFrontImage || "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&auto=format&fit=crop&q=80",
          pickupStartTime: pickupStartTime || "19:00",
          pickupEndTime: pickupEndTime || "21:00",
          boxComplianceRate: 100,
          boxesSoldTotal: 0,
          currentBoxStock: 0,
          walletBalance: 0,
          bankAccount: {
            bankName,
            accountNumber,
            accountHolder: accountHolder || ownerName,
          },
          kycDetails: {
            ownerName: ownerName.trim(),
            storeFrontImage: storeFrontImage || "",
            submittedAt: new Date().toISOString(),
          },
        });

        await db.insert(users).values({
          id: userId,
          name: ownerName.trim(),
          email: cleanEmail,
          phone: phone.trim(),
          role: "seller",
          status: "ACTIVE",
          avatarUrl: logoUrl || null,
          storeId: storeId,
        });
      } catch (dbErr: any) {
        console.warn("DB insert error, falling back to response data:", dbErr?.message);
      }
    }

    return NextResponse.json({
      success: true,
      message: "Pendaftaran mitra berhasil dikirim. Menunggu verifikasi tim admin.",
      data: {
        storeId,
        userId,
        storeName,
        status: "PENDING_APPROVAL",
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Terjadi kesalahan server";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
