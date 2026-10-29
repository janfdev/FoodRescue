export function getClientIp(req: Request): string {
  const headers = req.headers;

  // 1. Cloudflare True Client IP (High Trust behind Cloudflare Proxy)
  const cfIp = headers.get("cf-connecting-ip");
  if (cfIp && cfIp.trim()) {
    return cfIp.trim();
  }

  // 2. Standard X-Forwarded-For (Ambil IP klien pertama di urutan terdepan)
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded && forwarded.trim()) {
    const firstIp = forwarded.split(",")[0].trim();
    if (firstIp) return firstIp;
  }

  // 3. Fallback X-Real-IP / Fastly / AWS ALB
  const realIp = headers.get("x-real-ip");
  if (realIp && realIp.trim()) {
    return realIp.trim();
  }

  return "127.0.0.1";
}
