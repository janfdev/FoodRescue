/**
 * DiceBear Adventurer Neutral Avatar Helper
 * Sesuai spesifikasi: https://api.dicebear.com/10.x/adventurer-neutral/svg
 */

export const DICEBEAR_ADVENTURER_NEUTRAL_BASE =
  "https://api.dicebear.com/10.x/adventurer-neutral/svg";

/**
 * Menghasilkan URL avatar default Adventurer Neutral berdasarkan seed (nama/email user).
 * Jika seed kosong, mengembalikan URL base default.
 */
export function getDefaultAvatar(seed?: string): string {
  if (!seed || !seed.trim()) {
    return DICEBEAR_ADVENTURER_NEUTRAL_BASE;
  }
  // Sanitasi seed agar aman digunakan di query params
  const cleanSeed = seed.trim().replace(/[^a-zA-Z0-9_-]/g, "");
  return `${DICEBEAR_ADVENTURER_NEUTRAL_BASE}?seed=${encodeURIComponent(cleanSeed || seed.trim())}`;
}

/**
 * Mengembalikan avatar user aktif: jika user sudah upload avatar kustom (misal S3),
 * gunakan avatarUrl tersebut. Jika belum ada atau masih warisan format lama,
 * gunakan avatar resmi DiceBear Adventurer Neutral.
 */
export function resolveUserAvatar(avatarUrl?: string | null, seed?: string): string {
  if (avatarUrl && avatarUrl.trim() && !avatarUrl.includes("9.x/notionists")) {
    return avatarUrl;
  }
  return getDefaultAvatar(seed);
}
