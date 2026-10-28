# DESIGN.md — SisaRasa (Food Rescue App)

## 1. Identity & Character
- **Product:** SisaRasa / RescueBites — Platform penyelamatan makanan surplus layak konsumsi (diskon 50-70%) di Cirebon Raya.
- **Audience:**
  - Pembeli (mahasiswa, pekerja, keluarga muda yang mencari makanan lezat hemat).
  - Mitra Kuliner (toko roti, resto, kafe, swalayan yang ingin menekan food waste & memulihkan biaya modal).
  - Super Admin (tim operasional verifikasi KYC, rekber escrow, dan inventori kemasan).
- **Voice & Tone:** Hangat, terpercaya, bertanggung jawab terhadap lingkungan, efisien. Tanpa em dash, tanpa buzzword AI generic.

## 2. Color Palette (Semantic Tokens)
- **Primary Eco-Green:** `#16a34a` (Emerald-600) / `#15803d` (Emerald-700) — Melambangkan keberlanjutan dan penyelamatan makanan.
- **Warm Culinary Amber/Orange:** `#f59e0b` (Amber-500) / `#ea580c` (Orange-600) — Menggugah selera makan dan menandai diskon/harga hemat.
- **Neutral Surface & Background:**
  - Light mode: Pure white `#ffffff` cards dengan base soft cream-slate `#f8fafc`.
  - Dark mode: Slate `#0f172a` dengan elevated surfaces `#1e293b`.
- **Text:** Slate `#0f172a` (high contrast, WCAG AA compliant > 4.5:1).

## 3. Typography
- **Font Family:** Inter / Poppins (sans-serif modern), clean, legibel pada layar seluler maupun desktop.
- **Scale:**
  - Title/Display: 24px - 32px font-black
  - Section Headings: 18px - 20px font-extrabold
  - Body: 13px - 14px font-medium
  - Badges/Labels: 10px - 11px font-bold uppercase

## 4. Dials
- **ENERGY:** 2 (Balanced — hangat, ramah, meyakinkan).
- **RHYTHM:** 2 (Terstruktur rapi antar section, visual card bervariasi antara hero, kategori bulat, dan feed toko).
- **MOTION:** 1 (Subtle — hover transitions, smooth modal slide-over, zero endless pulsing loops).
