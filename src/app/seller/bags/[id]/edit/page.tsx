"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Link from "next/link";
import { SurpriseBag, StoreCategory } from "@/types/domain";
import { storeService } from "@/services/storeService";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Package,
  Save,
  Check,
  Clock,
  Zap,
  Loader2,
  AlertTriangle,
  Trash2,
  Scale,
} from "lucide-react";

const CATEGORIES: StoreCategory[] = [
  "Bakery & Pastry",
  "Makanan Berat",
  "Kafe & Minuman",
  "Swalayan & Buah",
];

const FOOD_PRESET_IMAGES = [
  { name: "Roti Danish Pastry", url: "/images/foods/roti-danish-pastry.jpg" },
  { name: "Croissant Cafe", url: "/images/foods/croissant-cafe.jpg" },
  { name: "Nasi Jamblang Komplit", url: "/images/foods/nasi-jamblang-lauk.jpg" },
  { name: "Empal Gentong Daging", url: "/images/foods/empal-gentong-daging.jpg" },
  { name: "Buah Segar Potong", url: "/images/foods/buah-segar-potong.jpg" },
];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function EditSurpriseBagPage({ params }: any) {
  const router = useRouter();
  const [bagId, setBagId] = useState<string>("");

  useEffect(() => {
    if (params) {
      Promise.resolve(params).then((resolved: any) => {
        if (resolved?.id) setBagId(resolved.id);
      });
    }
  }, [params]);

  const [bag, setBag] = useState<SurpriseBag | null>(null);
  const [loading, setLoading] = useState(true);

  // Form states
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<StoreCategory>("Bakery & Pastry");
  const [description, setDescription] = useState("");
  const [originalPrice, setOriginalPrice] = useState<number>(0);
  const [discountedPrice, setDiscountedPrice] = useState<number>(0);
  const [quotaToday, setQuotaToday] = useState<number>(1);
  const [quotaRemaining, setQuotaRemaining] = useState<number>(1);
  const [estimatedWeightKg, setEstimatedWeightKg] = useState<number>(0.8);
  const [pickupWindow, setPickupWindow] = useState("");
  const [allergensWarning, setAllergensWarning] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [isLastCall, setIsLastCall] = useState(false);
  const [isActive, setIsActive] = useState(true);

  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (!bagId) return;
    const state = storeService.getState();
    const activeStoreId = state.currentUser?.storeId || "store-ruby-bakery";
    const allBags = state.surpriseBags;
    const found = allBags.find((b) => b.id === bagId && (!activeStoreId || b.storeId === activeStoreId));

    if (found) {
      setBag(found);
      setTitle(found.title);
      setCategory(found.category);
      setDescription(found.description);
      setOriginalPrice(found.originalPrice);
      setDiscountedPrice(found.discountedPrice);
      setQuotaToday(found.quotaToday);
      setQuotaRemaining(found.quotaRemaining);
      setEstimatedWeightKg(found.estimatedWeightKg || 0.8);
      setPickupWindow(found.pickupWindow);
      setAllergensWarning(found.allergensWarning || "");
      setImageUrl(found.imageUrl || "");
      setIsLastCall(Boolean(found.isLastCall));
      setIsActive(found.isActive);
    }
    setLoading(false);
  }, [bagId]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("folder", "products");

      const res = await fetch("/api/upload", {
        method: "POST",
        body: fd,
      });

      if (res.ok) {
        const data = await res.json();
        if (data.url) setImageUrl(data.url);
      }
    } catch {
      setImageUrl(URL.createObjectURL(file));
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMsg("Nama paket Surprise Bag wajib diisi.");
      toast.error("Nama paket Surprise Bag wajib diisi.");
      return;
    }
    if (discountedPrice >= originalPrice) {
      setErrorMsg("Harga penyelamatan (diskon) harus lebih murah dari harga normal etalase.");
      toast.error("Harga diskon harus lebih murah dari harga normal.");
      return;
    }

    setIsSaving(true);
    setErrorMsg("");

    try {
      storeService.updateSurpriseBag(bagId, {
        title: title.trim(),
        category,
        description: description.trim(),
        originalPrice: Number(originalPrice),
        discountedPrice: Number(discountedPrice),
        quotaToday: Number(quotaToday),
        quotaRemaining: Math.min(Number(quotaRemaining), Number(quotaToday)),
        pickupWindow: pickupWindow.trim() || "19:30 - 21:00 WIB",
        estimatedWeightKg: Number(estimatedWeightKg) || 0.8,
        allergensWarning: allergensWarning.trim() || undefined,
        imageUrl: imageUrl.trim() || undefined,
        isLastCall,
        isActive,
      });

      setIsSaving(false);
      setSaveSuccess(true);
      toast.success("Surprise Bag berhasil diperbarui!");
      setTimeout(() => {
        router.push("/seller/bags");
      }, 1200);
    } catch (err: any) {
      setIsSaving(false);
      const msg = err?.message || "Gagal menyimpan perubahan paket.";
      setErrorMsg(msg);
      toast.error(msg);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="size-6 animate-spin text-orange-600" />
      </div>
    );
  }

  if (!bag) {
    return (
      <div className="max-w-xl mx-auto py-12 text-center space-y-4">
        <AlertTriangle className="size-10 text-rose-600 mx-auto" />
        <h2 className="text-lg font-black text-foreground">Paket Tidak Ditemukan</h2>
        <p className="text-xs text-muted-foreground">
          Surprise Bag dengan ID tersebut mungkin sudah dihapus atau tidak terdaftar di sistem.
        </p>
        <Link
          href="/seller/bags"
          className="inline-flex items-center gap-2 text-xs font-bold text-orange-600 hover:underline"
        >
          <ArrowLeft className="size-3.5" />
          <span>Kembali ke Katalog Surprise Bag</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12 font-sans">
      {/* Header & Back Button */}
      <div className="space-y-2">
        <Link
          href="/seller/bags"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="size-3.5" />
          <span>Kembali ke Katalog Surprise Bag</span>
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-foreground tracking-tight">
              Edit Paket Surprise Bag
            </h1>
            <p className="text-xs text-muted-foreground">
              Perbarui harga surplus, alokasi kuota porsi harian, dan informasi alergen makanan.
            </p>
          </div>
          <Badge
            variant={isActive ? "default" : "secondary"}
            className={isActive ? "bg-emerald-600 text-white" : ""}
          >
            {isActive ? "Status: Aktif" : "Status: Nonaktif"}
          </Badge>
        </div>
      </div>

      {saveSuccess && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center gap-2">
          <Check className="size-4 shrink-0 text-emerald-600" />
          <span>Perubahan paket berhasil disimpan! Mengalihkan ke katalog...</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-300 text-xs font-bold">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Foto Produk & Presets */}
        <Card className="border-border shadow-xs rounded-3xl overflow-hidden">
          <CardHeader className="pb-3 border-b border-border/60">
            <CardTitle className="text-sm font-black text-foreground">
              Foto Etalase Makanan
            </CardTitle>
            <CardDescription className="text-xs">
              Pilih dari preset foto makanan otentik Cirebon atau unggah foto asli dari kamera kasir.
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-4 space-y-4">
            <div className="flex items-center gap-4">
              <div className="size-20 rounded-2xl border border-border overflow-hidden shrink-0 bg-muted">
                {imageUrl ? (
                  <img src={imageUrl} alt="Preview" className="size-full object-cover" />
                ) : (
                  <div className="size-full flex items-center justify-center text-muted-foreground text-xs font-bold">
                    No Image
                  </div>
                )}
              </div>

              <div className="space-y-1.5 flex-1 min-w-0">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="text-xs h-9 max-w-xs file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-xs file:font-bold file:bg-orange-50 file:text-orange-700 dark:file:bg-orange-950 dark:file:text-orange-300"
                />
                <span className="text-[10px] text-muted-foreground block">
                  Unggah foto menu display gerai hari ini.
                </span>
              </div>
            </div>

            {/* Presets */}
            <div className="space-y-1.5 pt-2 border-t border-border/60">
              <span className="text-xs font-bold text-foreground block">
                Pilihan Preset Foto Hidangan:
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {FOOD_PRESET_IMAGES.map((food) => (
                  <button
                    key={food.name}
                    type="button"
                    onClick={() => setImageUrl(food.url)}
                    className={`p-1.5 rounded-xl border text-left space-y-1 transition-all ${
                      imageUrl === food.url
                        ? "border-orange-600 bg-orange-50 dark:bg-orange-950/40 ring-1 ring-orange-600"
                        : "border-border/70 hover:border-orange-600/50"
                    }`}
                  >
                    <img src={food.url} alt={food.name} className="h-14 w-full object-cover rounded-lg" />
                    <span className="text-[10px] font-bold block truncate text-foreground">
                      {food.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Informasi Pokok */}
        <Card className="border-border shadow-xs rounded-3xl overflow-hidden">
          <CardHeader className="pb-3 border-b border-border/60">
            <CardTitle className="text-sm font-black text-foreground">
              Informasi Paket Surplus
            </CardTitle>
            <CardDescription className="text-xs">
              Judul, kategori, dan deskripsi isi surprise bag.
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-4 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-muted-foreground block">
                  Nama / Judul Paket Surprise Bag
                </label>
                <Input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="text-xs h-9"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-muted-foreground block">
                  Kategori Makanan
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as StoreCategory)}
                  className="w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c} className="bg-background text-foreground">
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-muted-foreground block">
                Deskripsi Isi Paket
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full rounded-md border border-input bg-transparent p-2.5 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-muted-foreground block">
                Catatan Alergen (Opsional)
              </label>
              <Input
                type="text"
                placeholder="Contoh: Mengandung susu, telur, atau kacang"
                value={allergensWarning}
                onChange={(e) => setAllergensWarning(e.target.value)}
                className="text-xs h-9"
              />
            </div>
          </CardContent>
        </Card>

        {/* Harga & Kuota */}
        <Card className="border-border shadow-xs rounded-3xl overflow-hidden">
          <CardHeader className="pb-3 border-b border-border/60">
            <CardTitle className="text-sm font-black text-foreground">
              Harga Penyelamatan & Kuota Porsi
            </CardTitle>
            <CardDescription className="text-xs">
              Atur harga diskon surplus (standar min diskon 50%) dan stok porsi hari ini.
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-muted-foreground block">
                  Harga Normal Etalase (Rp)
                </label>
                <Input
                  type="number"
                  value={originalPrice}
                  onChange={(e) => setOriginalPrice(Number(e.target.value))}
                  className="text-xs h-9 tabular-nums"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-muted-foreground block">
                  Harga Penyelamatan Surplus (Rp)
                </label>
                <Input
                  type="number"
                  value={discountedPrice}
                  onChange={(e) => setDiscountedPrice(Number(e.target.value))}
                  className="text-xs h-9 tabular-nums font-bold text-orange-600"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-muted-foreground block">
                  Total Kuota Porsi Hari Ini
                </label>
                <Input
                  type="number"
                  min={1}
                  value={quotaToday}
                  onChange={(e) => setQuotaToday(Number(e.target.value))}
                  className="text-xs h-9 tabular-nums"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-muted-foreground block">
                  Sisa Kuota Porsi Tersedia
                </label>
                <Input
                  type="number"
                  min={0}
                  max={quotaToday}
                  value={quotaRemaining}
                  onChange={(e) => setQuotaRemaining(Number(e.target.value))}
                  className="text-xs h-9 tabular-nums font-bold text-emerald-600"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-muted-foreground block flex items-center gap-1.5">
                  <Clock className="size-3.5 text-orange-600" />
                  <span>Jendela Jam Penjemputan (Pickup Window) *</span>
                </label>
                <Input
                  type="text"
                  placeholder="Contoh: 19:30 - 21:00 WIB"
                  value={pickupWindow}
                  onChange={(e) => setPickupWindow(e.target.value)}
                  className="text-xs h-9"
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
                  className="text-xs h-9 font-bold tabular-nums"
                  required
                />
              </div>
            </div>

            <div className="flex items-center justify-between p-3 rounded-2xl bg-muted/40 border border-border/70 pt-2">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-foreground block">
                  Flash Sale Menit Terakhir (Last Call)
                </span>
                <span className="text-[11px] text-muted-foreground block">
                  Beri lencana kilat pada katalog pembeli untuk percepatan penjualan surplus.
                </span>
              </div>
              <Button
                type="button"
                size="sm"
                variant={isLastCall ? "default" : "outline"}
                onClick={() => setIsLastCall(!isLastCall)}
                className={`text-xs font-bold h-8 gap-1 ${
                  isLastCall ? "bg-amber-600 hover:bg-amber-700 text-white" : ""
                }`}
              >
                <Zap className="size-3" />
                <span>{isLastCall ? "Aktif" : "Nonaktif"}</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex items-center justify-between gap-3 pt-2">
          <Button
            type="button"
            variant="destructive"
            onClick={() => {
              if (confirm(`Yakin ingin menghapus menu "${title}" secara permanen?`)) {
                storeService.deleteSurpriseBag(bagId);
                router.push("/seller/bags");
              }
            }}
            className="text-xs font-bold h-10 px-4 rounded-xl gap-2 cursor-pointer"
          >
            <Trash2 className="size-4" />
            <span>Hapus Menu</span>
          </Button>

          <div className="flex items-center gap-3">
            <Link
              href="/seller/bags"
              className="px-4 py-2 rounded-xl border border-border text-xs font-bold text-muted-foreground hover:bg-muted transition-colors"
            >
              Batal
            </Link>
            <Button
              type="submit"
              disabled={isSaving || isUploading}
              className="bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs h-10 px-6 shadow-xs rounded-xl gap-2"
            >
              {isSaving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
              <span>Simpan Perubahan Paket</span>
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
