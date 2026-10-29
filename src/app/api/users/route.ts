import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { desc, eq } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    if (process.env.DATABASE_URL || process.env.POSTGRES_URL) {
      try {
        const rows = await db.select().from(users).orderBy(desc(users.createdAt));
        return NextResponse.json({
          success: true,
          source: "database",
          data: rows.map((r) => ({
            id: r.id,
            name: r.name,
            email: r.email,
            phone: r.phone,
            role: r.role,
            status: r.status,
            avatarUrl: r.avatarUrl || r.image,
            storeId: r.storeId || undefined,
          })),
        });
      } catch (dbErr) {
        console.warn("DB offline saat ambil users:", dbErr);
      }
    }

    return NextResponse.json({
      success: true,
      source: "empty",
      data: [],
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Gagal mengambil daftar pengguna";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, status, role } = body;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "userId wajib disertakan" },
        { status: 400 }
      );
    }

    const updatePayload: Record<string, any> = { updatedAt: new Date() };
    if (status) updatePayload.status = status;
    if (role) updatePayload.role = role;

    if (process.env.DATABASE_URL || process.env.POSTGRES_URL) {
      try {
        await db
          .update(users)
          .set(updatePayload)
          .where(eq(users.id, userId));

        return NextResponse.json({
          success: true,
          message: `Pengguna berhasil diperbarui`,
        });
      } catch (dbErr) {
        console.warn("Gagal update user ke DB:", dbErr);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Pengguna disimulasikan berhasil diperbarui`,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Gagal memperbarui pengguna";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
