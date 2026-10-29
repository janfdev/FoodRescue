import { NextRequest, NextResponse } from "next/server";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getBucketName } from "@/lib/s3";

function getS3Client(): S3Client | null {
  const accessKeyId =
    process.env.DAHONO_S3_ACCESS_KEY ||
    process.env.S3_ACCESS_KEY_ID ||
    process.env.ACCESS_KEY;
  const secretAccessKey =
    process.env.DAHONO_S3_SECRET_KEY ||
    process.env.S3_SECRET_ACCESS_KEY ||
    process.env.SECRET_KEY;

  if (!accessKeyId || !secretAccessKey) return null;

  const endpoint =
    process.env.DAHONO_S3_ENDPOINT ||
    process.env.S3_ENDPOINT_URL ||
    process.env.ENDPOINT_URL ||
    "https://s3.dahono.com";

  const region =
    process.env.DAHONO_S3_REGION ||
    process.env.S3_REGION ||
    "us-east-1";

  return new S3Client({
    region,
    endpoint,
    credentials: { accessKeyId, secretAccessKey },
    forcePathStyle: true,
  });
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const key = searchParams.get("key");

  if (!key) {
    return NextResponse.json({ error: "Missing key parameter" }, { status: 400 });
  }

  // Sanitasi key sederhana agar tidak ada traversal keluar
  if (key.includes("..")) {
    return NextResponse.json({ error: "Invalid key format" }, { status: 400 });
  }

  const s3 = getS3Client();
  const bucket = getBucketName();

  if (!s3) {
    return NextResponse.json({ error: "S3 storage not configured" }, { status: 500 });
  }

  try {
    const command = new GetObjectCommand({
      Bucket: bucket,
      Key: key,
    });

    const response = await s3.send(command);

    if (!response.Body) {
      return NextResponse.json({ error: "File body is empty" }, { status: 404 });
    }

    const contentType = response.ContentType || "application/octet-stream";
    const bodyStream = response.Body.transformToWebStream();

    return new NextResponse(bodyStream, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error: any) {
    console.error("Failed to stream from S3 Dahono:", error?.message);
    return NextResponse.json(
      { error: "Media file not found or inaccessible" },
      { status: 404 }
    );
  }
}
