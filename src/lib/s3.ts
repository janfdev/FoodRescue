import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

function getS3Client(): S3Client | null {
  const accessKeyId =
    process.env.DAHONO_S3_ACCESS_KEY ||
    process.env.S3_ACCESS_KEY_ID ||
    process.env.ACCESS_KEY;
  const secretAccessKey =
    process.env.DAHONO_S3_SECRET_KEY ||
    process.env.S3_SECRET_ACCESS_KEY ||
    process.env.SECRET_KEY;

  if (!accessKeyId || !secretAccessKey) {
    return null;
  }

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
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
    forcePathStyle: true, // Required for Dahono / S3-compatible endpoints
  });
}

export function getBucketName(): string {
  return (
    process.env.DAHONO_S3_BUCKET ||
    process.env.S3_BUCKET_NAME ||
    process.env.S3_BUCKET ||
    "foodrescue"
  );
}

export async function uploadToS3(
  fileBuffer: Buffer,
  fileName: string,
  contentType: string,
  folder = "uploads"
): Promise<{ url: string; key: string }> {
  const s3 = getS3Client();
  const bucket = getBucketName();
  const cleanFileName = `${Date.now()}-${fileName.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
  const key = `${folder}/${cleanFileName}`;

  if (!s3) {
    // Fallback URL jika S3 env belum diatur (safe fallback for local test/preview)
    return {
      url: `/uploads/${cleanFileName}`,
      key,
    };
  }

  await s3.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: fileBuffer,
      ContentType: contentType,
    })
  );

  const endpoint =
    process.env.DAHONO_S3_ENDPOINT ||
    process.env.S3_ENDPOINT_URL ||
    process.env.ENDPOINT_URL ||
    "https://s3.dahono.com";

  const publicUrl = `${endpoint.replace(/\/$/, "")}/${bucket}/${key}`;

  return {
    url: publicUrl,
    key,
  };
}
