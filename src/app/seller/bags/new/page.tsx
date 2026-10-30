"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  PackagePlus,
  Sparkles,
  Clock,
  Coins,
  AlertCircle,
  Check,
  Flame,
  Scale,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { storeService } from "@/services/storeService";
import { StoreCategory } from "@/types/domain";
import showToast from "@/lib/toast";

const PRESET_FOOD_IMAGES = [
  {
    name: "Danish Pastry & Roti Cokelat",
    url: "/images/foods/roti-danish-pastry.jpg",
    category: "Bakery & Pastry" as StoreCategory,
  },
  {
    name: "Croissant Mentega & Kouign Amann",
    url: "/images/foods/croissant-cafe.jpg",
    category: "Bakery & Pastry" as StoreCategory,
  },
  {
    name: "Nasi Jamblang Komplit Surplus",
    url: "/images/foods/nasi-jamblang-lauk.jpg",
    category: "Makanan Berat" as StoreCategory,
  },
  {
    name: "Empal Gentong Daging Gurih",
    url: "/images/foods/empal-gentong-daging.jpg",
    category: "Makanan Berat" as StoreCategory,
  },
  {
    name: "Potongan Buah Segar Higienis",
    url: "/images/foods/buah-segar-potong.jpg",
    category: "Swalayan & Buah" as StoreCategory,
  },
];

const CATEGORIES: StoreCategory[] = [
  "Bakery & Pastry",
  "Makanan Berat",
  "Kafe & Minuman",
  "Swalayan & Buah",
];

export default function CreateSurpriseBagPage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<StoreCategory>("Bakery & Pastry");
  const [description, setDescription] = useState("");
  const [originalPrice, setOriginalPrice] = useState<number>(45000);
  const [discountedPrice, setDiscountedPrice] = useState<number>(18000);
  const [quotaToday, setQuotaToday] = useState<number>(5);
  const [estimatedWeightKg, setEstimatedWeightKg] = useState<number>(0.8);
  const [pickupWindow, setPickupWindow] = useState("19:30 - 21:00 WIB");
  const [allergensWarning, setAllergensWarning] = useState("Mengandung gandum, telur, atau susu sapi");
  const [imageUrl, setImageUrl] = useState(PRESET_FOOD_IMAGES[0].url);
  const [isLastCall, setIsLastCall] = useState(false);

  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const discountPercent =
    originalPrice > 0
      ? Math.max(0, Math.round(((originalPrice - discountedPrice) / originalPrice) * 100))
      : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMsg("Nama paket Surprise Bag wajib diisi.");
      showToast.error("Nama paket Surprise Bag wajib diisi.");
      return;
    }

    if (discountedPrice >= originalPrice) {
      setErrorMsg("Harga penyelamatan (diskon) harus lebih murah dari harga normal etalase.");
      showToast.error("Harga diskon harus lebih murah dari harga normal.");
      return;
    }

    if (quotaToday < 1) {
      setErrorMsg("Kuota porsi harian minimal 1 paket.");
      showToast.error("Kuota porsi harian minimal 1 paket.");
      return;
    }

    setIsSaving(true);
    setErrorMsg("");

    try {
      const state = storeService.getState();
      const currentStore = state.stores.find((s) => s.id === state.currentUser?.storeId);

      if (!currentStore) {
        throw new Error("Akun seller Anda belum terhubung dengan gerai toko aktif.");
      }

      storeService.addSurpriseBag({
        storeId: currentStore.id,
        title: title.trim(),
        category,
        description:
          description.trim() ||
          "Surprise Bag berisi kombinasi makanan surplus lezat berkualitas tinggi yang disiapkan segar pada hari ini.",
        originalPrice: Number(originalPrice),
        discountedPrice: Number(discountedPrice),
        quotaToday: Number(quotaToday),
        quotaRemaining: Number(quotaToday),
        pickupWindow: pickupWindow.trim() || "19:30 - 21:00 WIB",
        estimatedWeightKg: Number(estimatedWeightKg) || 0.8,
        allergensWarning: allergensWarning.trim() || undefined,
        imageUrl: imageUrl.trim() || PRESET_FOOD_IMAGES[0].url,
        isLastCall,
        isActive: true,
      });

      setIsSaving(false);
      showToast.success("Surprise Bag baru berhasil diterbitkan!");
      setTimeout(() => {
        router.push("/seller/bags");
      }, 1000);
    } catch (err: any) {
      setIsSaving(false);
      const msg = err?.message || "Gagal menerbitkan Surprise Bag.";
      setErrorMsg(msg);
      showToast.error(msg);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16 font-sans">
      {/* Navigation Top Header */}
      <div className="flex items-center justify-between">
        <Link
          href="/seller/bags"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors p-2 rounded-xl bg-card border border-border"
        >
          <ArrowLeft className="size-4" />
          <span>Kembali ke Katalog</span>
        </Link>
        <Badge variant="outline" className="text-xs font-mono border-orange-500/30 text-orange-600 bg-orange-50/50">
          Formulir Pembuatan Baru
        </Badge>
      </div>

      {/* Page Title */}
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-xs font-bold text-orange-600 uppercase tracking-wider">
          <PackagePlus className="size-4" />
          <span>Etalase Penyelamatan Pangan</span>
        </div>
        <h1 className="text-2xl font-black text-foreground tracking-tight">
          Create Surprise Bag
        </h1>
        <p className="text-xs text-muted-foreground">
          Terbitkan paket kantong misteri surplus berkualitas tinggi dengan potongan harga hemat 50% - 70% untuk warga Cirebon.
        </p>
      </div>

      {errorMsg && (
        <div className="p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-300 text-xs font-bold flex items-center gap-2">
          <AlertCircle className="size-4 shrink-0 text-red-600" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Detail Produk & Kategori */}
        <Card className="border-border shadow-xs rounded-3xl overflow-hidden">
          <CardHeader className="pb-3 border-b border-border/60">
            <CardTitle className="text-sm font-black text-foreground flex items-center gap-2">
              <Sparkles className="size-4 text-orange-600" />
              <span>Detail Informasi Paket</span>
            </CardTitle>
            <CardDescription className="text-xs">
              Tentukan nama paket, kategori kuliner, dan deskripsi singkat isi makanan surplus.
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-4 space-y-4">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-muted-foreground block">
                Nama Paket Surprise Bag *
              </label>
              <Input
                type="text"
                placeholder="misal: Surprise Bag Aneka Pastry & Roti Manis"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="text-xs h-10 font-bold"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-muted-foreground block">
                  Kategori Usaha Kuliner *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as StoreCategory)}
                  className="w-full bg-muted/50 border border-border rounded-xl text-xs font-semibold p-2.5 text-foreground focus:outline-none focus:ring-1 focus:ring-orange-500"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-muted-foreground block">
                  Peringatan Alergen Makanan
                </label>
                <Input
                  type="text"
                  placeholder="misal: Mengandung susu, gandum, atau kacang"
                  value={allergensWarning}
                  onChange={(e) => setAllergensWarning(e.target.value)}
                  className="text-xs h-10"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-muted-foreground block">
                Deskripsi Paket & Estimasi Isi
              </label>
              <textarea
                rows={3}
                placeholder="Jelaskan jenis makanan yang mungkin didapat oleh pembeli saat penjemputan sore nanti..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-muted/50 border border-border rounded-xl text-xs font-medium p-3 text-foreground focus:outline-none focus:ring-1 focus:ring-orange-500"
              />
            </div>
          </CardContent>
        </Card>

        {/* Pemilihan Foto Visual Paket */}
        <Card className="border-border shadow-xs rounded-3xl overflow-hidden">
          <CardHeader className="pb-3 border-b border-border/60">
            <CardTitle className="text-sm font-black text-foreground">
              Foto Visual Etalase Makanan
            </CardTitle>
            <CardDescription className="text-xs">
              Pilih foto preset berkualitas tinggi dari kuliner Cirebon atau masukkan tautan foto Anda.
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-4 space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {PRESET_FOOD_IMAGES.map((preset) => {
                const isSelected = imageUrl === preset.url;
                return (
                  <button
                    key={preset.url}
                    type="button"
                    onClick={() => {
                      setImageUrl(preset.url);
                      setCategory(preset.category);
                    }}
                    className={`relative rounded-2xl overflow-hidden border-2 text-left group transition-all cursor-pointer ${
                      isSelected
                        ? "border-orange-600 ring-2 ring-orange-500/20 shadow-md scale-[1.02]"
                        : "border-border hover:border-orange-300 opacity-80 hover:opacity-100"
                    }`}
                  >
                    <div className="aspect-square bg-muted">
                      <img
                        src={preset.url}
                        alt={preset.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    {isSelected && (
                      <div className="absolute top-2 right-2 size-5 bg-orange-600 text-white rounded-full flex items-center justify-center shadow-xs">
                        <Check className="size-3 stroke-[3]" />
                      </div>
                    )}
                    <div className="p-2 bg-card">
                      <p className="text-[10px] font-bold text-foreground line-clamp-1">
                        {preset.name}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="space-y-1 pt-2">
              <label className="text-[11px] font-bold text-muted-foreground block">
                Atau Tautan Gambar Kustom (Opsional)
              </label>
              <Input
                type="text"
                placeholder="https://.../foto-makanan.jpg"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="text-xs h-9 font-mono"
              />
            </div>
          </CardContent>
        </Card>

        {/* Harga & Kuota Surplus */}
        <Card className="border-border shadow-xs rounded-3xl overflow-hidden">
          <CardHeader className="pb-3 border-b border-border/60">
            <CardTitle className="text-sm font-black text-foreground flex items-center gap-2">
              <Coins className="size-4 text-emerald-600" />
              <span>Harga Penyelamatan & Kuota Porsi</span>
            </CardTitle>
            <CardDescription className="text-xs">
              Sesuai prinsip Rerasa, harga penyelamatan makanan surplus harus memberikan diskon minimal 50%.
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-4 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-muted-foreground block">
                  Harga Asli Normal (Rp) *
                </label>
                <Input
                  type="number"
                  min={5000}
                  step={1000}
                  value={originalPrice}
                  onChange={(e) => setOriginalPrice(Number(e.target.value))}
                  className="text-xs h-10 font-black tabular-nums"
                  required
                />
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 block">
                    Harga Diskon Penyelamatan (Rp) *
                  </label>
                  <Badge className="bg-orange-600 text-white font-black text-[10px] px-1.5 py-0">
                    Hemat {discountPercent}%
                  </Badge>
                </div>
                <Input
                  type="number"
                  min={1000}
                  step={1000}
                  value={discountedPrice}
                  onChange={(e) => setDiscountedPrice(Number(e.target.value))}
                  className="text-xs h-10 font-black tabular-nums text-emerald-700 dark:text-emerald-400 border-emerald-500/30"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-muted-foreground block">
                  Jumlah Porsi Hari Ini (pcs) *
                </label>
                <Input
                  type="number"
                  min={1}
                  max={50}
                  value={quotaToday}
                  onChange={(e) => setQuotaToday(Number(e.target.value))}
                  className="text-xs h-10 font-black tabular-nums"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-muted-foreground block flex items-center gap-1.5">
                  <Clock className="size-3.5 text-orange-600" />
                  <span>Jendela Ambil (Pickup) *</span>
                </label>
                <Input
                  type="text"
                  placeholder="misal: 19:30 - 21:00 WIB"
                  value={pickupWindow}
                  onChange={(e) => setPickupWindow(e.target.value)}
                  className="text-xs h-10 font-semibold"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-muted-foreground block flex items-center gap-1.5">
                  <Scale className="size-3.5 text-emerald-600" />
                  <span>Estimasi Bobot per Porsi (Kg) *</span>
                </label>
                <Input
                  type="number"
                  step="0.1"
                  min="0.1"
                  max="5.0"
                  value={estimatedWeightKg}
                  onChange={(e) => setEstimatedWeightKg(Number(e.target.value))}
                  className="text-xs h-10 font-black tabular-nums"
                  required
                />
                <span className="text-[9px] text-muted-foreground block">
                  Dasar hitungan reduksi limbah TPA
                </span>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-2xl bg-muted/40 border border-border">
                <input
                  type="checkbox"
                  id="flashSaleToggle"
                  checked={isLastCall}
                  onChange={(e) => setIsLastCall(e.target.checked)}
                  className="size-4 text-orange-600 rounded border-border focus:ring-orange-500 cursor-pointer"
                />
                <label htmlFor="flashSaleToggle" className="cursor-pointer select-none">
                  <span className="text-xs font-bold text-foreground flex items-center gap-1">
                    <Flame className="size-3.5 text-red-600" />
                    Tandai Flash Sale (Last Call)
                  </span>
                  <span className="text-[10px] text-muted-foreground block">
                    Beri tanda kilat darurat untuk makanan segera habis.
                  </span>
                </label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Controls */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Link href="/seller/bags">
            <Button type="button" variant="outline" className="text-xs font-bold px-4 h-10 rounded-xl cursor-pointer">
              Batal
            </Button>
          </Link>
          <Button
            type="submit"
            disabled={isSaving}
            className="text-xs font-black px-6 h-10 bg-orange-600 hover:bg-orange-700 text-white rounded-xl shadow-xs cursor-pointer inline-flex items-center gap-1.5"
          >
            {isSaving ? (
              <>
                <div className="size-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Menerbitkan...</span>
              </>
            ) : (
              <>
                <PackagePlus className="size-4" />
                <span>Create Surprise Bag</span>
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
