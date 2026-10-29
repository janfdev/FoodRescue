import { NextRequest, NextResponse } from "next/server";
import { uploadToS3 } from "@/lib/s3";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB maximum
const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/svg+xml",
]);
const ALLOWED_FOLDERS = new Set(["kyc", "stores", "products", "uploads"]);

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    let folder = (formData.get("folder") as string) || "kyc";

    if (!file) {
      return NextResponse.json(
        { error: "No file provided in form data" },
        { status: 400 }
      );
    }

    // 1. Validasi Ukuran File (Max 5MB)
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `Ukuran file terlalu besar. Maksimum diperbolehkan adalah 5MB.` },
        { status: 400 }
      );
    }

    // 2. Validasi MIME Type (Hanya format gambar yang sah)
    if (!ALLOWED_MIME_TYPES.has(file.type)) {
      return NextResponse.json(
        {
          error: `Tipe file '${file.type}' tidak didukung. Harap unggah gambar JPG, PNG, atau WEBP.`,
        },
        { status: 400 }
      );
    }

    // 3. Sanitasi Folder & Cegah Path Traversal
    folder = folder.toLowerCase().replace(/[^a-z0-9_-]/g, "");
    if (!ALLOWED_FOLDERS.has(folder)) {
      folder = "uploads";
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const result = await uploadToS3(buffer, file.name, file.type, folder);

    return NextResponse.json({
      success: true,
      url: result.url,
      key: result.key,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to upload file" },
      { status: 500 }
    );
  }
}
