"use client";

import { useState, useEffect, useMemo } from "react";
import { SurpriseBag, StoreCategory } from "@/types/domain";
import { storeService } from "@/services/storeService";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { TableToolbar } from "@/components/common/TableToolbar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Clock, Plus, Upload, Image as ImageIcon, Zap, Pencil } from "lucide-react";
import Link from "next/link";

export default function SellerBagsPage() {
  const [surpriseBags, setSurpriseBags] = useState<SurpriseBag[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Form states for new Surprise Bag
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<StoreCategory>("Bakery & Pastry");
  const [description, setDescription] = useState("");
  const [originalPrice, setOriginalPrice] = useState<number>(50000);
  const [discountedPrice, setDiscountedPrice] = useState<number>(20000);
  const [quotaToday, setQuotaToday] = useState<number>(5);
  const [pickupWindow, setPickupWindow] = useState("19:30 - 21:00 WIB");
  const [allergensWarning, setAllergensWarning] = useState("Mengandung gandum dan susu");
  const [imageUrl, setImageUrl] = useState("https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&auto=format&fit=crop&q=80");
  const [isLastCall, setIsLastCall] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const syncData = () => {
    setSurpriseBags(storeService.getState().surpriseBags);
  };

  useEffect(() => {
    syncData();
    const unsub = storeService.subscribe(syncData);
    return unsub;
  }, []);

  const handleQuotaChange = (bagId: string, newQuota: number, isActive: boolean) => {
    storeService.updateBagQuota(bagId, newQuota, isActive);
    syncData();
  };

  const handleToggleFlashSale = (bagId: string, isLastCall: boolean) => {
    storeService.toggleBagFlashSale(bagId, isLastCall);
    syncData();
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "products");

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        if (data.url) {
          setImageUrl(data.url);
        }
      }
    } catch {
      // Keep existing URL fallback
    } finally {
      setIsUploading(false);
    }
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const currentStore = storeService.getState().stores[0];

    storeService.addSurpriseBag({
      storeId: currentStore?.id || "store-ruby-bakery",
      title: title.trim(),
      category,
      description: description.trim() || "Paket surplus segar etalase hari ini, higienis dan siap santap.",
      imageUrl: imageUrl.trim() || undefined,
      originalPrice: Number(originalPrice),
      discountedPrice: Number(discountedPrice),
      quotaToday: Number(quotaToday),
      quotaRemaining: Number(quotaToday),
      isActive: true,
      isLastCall: Boolean(isLastCall),
      pickupWindow: pickupWindow.trim() || "19:30 - 21:00 WIB",
      estimatedWeightKg: 0.8,
      allergensWarning: allergensWarning.trim() || undefined,
    });

    setIsAddModalOpen(false);
    setTitle("");
    setDescription("");
    syncData();
  };

  const discountPercent = Math.round(((originalPrice - discountedPrice) / originalPrice) * 100);

  const filteredBags = useMemo(() => {
    return surpriseBags.filter((b) => {
      const matchSearch =
        b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.pickupWindow.toLowerCase().includes(searchQuery.toLowerCase());
      const matchCategory = categoryFilter === "ALL" || b.category === categoryFilter;
      const matchStatus =
        statusFilter === "ALL" ||
        (statusFilter === "ACTIVE" && b.isActive && b.quotaRemaining > 0) ||
        (statusFilter === "SOLDOUT" && b.quotaRemaining === 0) ||
        (statusFilter === "INACTIVE" && !b.isActive);
      return matchSearch && matchCategory && matchStatus;
    });
  }, [surpriseBags, searchQuery, categoryFilter, statusFilter]);

  return (
    <div className="space-y-6 w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-foreground tracking-tight">
            Manajemen Kuota Surprise Bag
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Atur sisa porsi surplus harian yang siap diselamatkan pembeli sebelum jam operasional berakhir
          </p>
        </div>

        <Link href="/seller/bags/new">
          <Button className="bg-orange-600 hover:bg-orange-700 text-white font-black text-xs gap-1.5 shadow-xs cursor-pointer">
            <Plus className="size-4" />
            <span>Create Surprise Bag</span>
          </Button>
        </Link>
      </div>

      <TableToolbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Cari nama paket makanan atau deskripsi..."
        categoryFilter={categoryFilter}
        onCategoryChange={setCategoryFilter}
        categoryOptions={[
          { label: "Bakery & Pastry", value: "Bakery & Pastry" },
          { label: "Restoran & Kafe", value: "Restoran & Kafe" },
          { label: "Hotel & Buffet", value: "Hotel & Buffet" },
          { label: "Supermarket & Buah", value: "Supermarket & Buah" },
          { label: "Katering", value: "Katering" },
        ]}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        statusOptions={[
          { label: "Aktif (Tersedia)", value: "ACTIVE" },
          { label: "Habis Terjual (Sold Out)", value: "SOLDOUT" },
          { label: "Nonaktif", value: "INACTIVE" },
        ]}
        totalResults={filteredBags.length}
        onResetFilters={() => {
          setSearchQuery("");
          setCategoryFilter("ALL");
          setStatusFilter("ALL");
        }}
      />

      <Card className="border-border shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/40 border-b border-border text-[11px] text-muted-foreground font-bold uppercase">
              <tr>
                <th className="p-3.5 px-4">Foto & Paket</th>
                <th className="p-3.5">Jadwal Pengambilan</th>
                <th className="p-3.5">Harga Normal & Diskon</th>
                <th className="p-3.5">Atur Sisa Kuota</th>
                <th className="p-3.5">Flash Sale</th>
                <th className="p-3.5">Status Penjualan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filteredBags.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-muted-foreground">
                    Tidak ada paket Surprise Bag yang sesuai dengan filter pencarian.
                  </td>
                </tr>
              ) : (
                filteredBags.map((bag) => (
                  <tr key={bag.id} className="hover:bg-muted/20">
                  <td className="p-3.5 px-4">
                    <div className="flex items-center gap-3">
                      {bag.imageUrl ? (
                        <img
                          src={bag.imageUrl}
                          alt={bag.title}
                          className="size-12 rounded-lg object-cover border border-border shrink-0"
                        />
                      ) : (
                        <div className="size-12 rounded-lg bg-muted flex items-center justify-center border border-border shrink-0 text-muted-foreground">
                          <ImageIcon className="size-5" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-extrabold text-foreground text-sm block truncate">
                            {bag.title}
                          </span>
                          {bag.isLastCall && (
                            <Badge className="bg-amber-600 text-white text-[9px] font-bold px-1.5 py-0">
                              Last Call
                            </Badge>
                          )}
                        </div>
                        <span className="text-[11px] text-muted-foreground block mt-0.5 truncate max-w-xs">
                          {bag.category} • {bag.description}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="p-3.5 text-muted-foreground">
                    <span className="flex items-center gap-1.5 text-foreground font-medium">
                      <Clock className="size-3.5 text-amber-600" />
                      <span>{bag.pickupWindow}</span>
                    </span>
                  </td>
                  <td className="p-3.5">
                    <span className="text-[11px] text-muted-foreground line-through tabular-nums block">
                      Rp {bag.originalPrice.toLocaleString("id-ID")}
                    </span>
                    <span className="text-sm font-black text-emerald-600 tabular-nums">
                      Rp {bag.discountedPrice.toLocaleString("id-ID")}
                    </span>
                  </td>
                  <td className="p-3.5">
                    <div className="space-y-1.5 min-w-[140px]">
                      <div className="flex items-center gap-1.5">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            handleQuotaChange(
                              bag.id,
                              Math.max(0, bag.quotaRemaining - 1),
                              bag.isActive
                            )
                          }
                          className="size-6 p-0 font-bold cursor-pointer"
                        >
                          -
                        </Button>
                        <span className="font-black tabular-nums w-7 text-center text-xs text-foreground">
                          {bag.quotaRemaining}
                        </span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            handleQuotaChange(
                              bag.id,
                              bag.quotaRemaining + 1,
                              bag.isActive
                            )
                          }
                          className="size-6 p-0 font-bold cursor-pointer"
                        >
                          +
                        </Button>

                        {bag.quotaRemaining > 0 && (
                          <button
                            type="button"
                            onClick={() => handleQuotaChange(bag.id, 0, bag.isActive)}
                            className="text-[9px] font-bold text-rose-600 hover:text-rose-700 hover:underline cursor-pointer ml-1"
                            title="Tandai porsi habis terjual sekarang"
                          >
                            Habiskan
                          </button>
                        )}
                      </div>

                      {/* Quota Progress Bar Indicator */}
                      <div className="space-y-0.5">
                        <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden border border-border/40">
                          <div
                            className={`h-full transition-all rounded-full ${
                              bag.quotaRemaining === 0
                                ? "bg-rose-500 w-full"
                                : bag.quotaRemaining <= 2
                                ? "bg-amber-500"
                                : "bg-emerald-600"
                            }`}
                            style={{
                              width:
                                bag.quotaRemaining === 0
                                  ? "100%"
                                  : `${Math.min(100, Math.round((bag.quotaRemaining / (bag.quotaToday || 5)) * 100))}%`,
                            }}
                          />
                        </div>
                        <div className="flex items-center justify-between text-[8px] font-bold">
                          <span
                            className={
                              bag.quotaRemaining === 0
                                ? "text-rose-600 dark:text-rose-400"
                                : bag.quotaRemaining <= 2
                                ? "text-amber-700 dark:text-amber-400"
                                : "text-emerald-700 dark:text-emerald-400"
                            }
                          >
                            {bag.quotaRemaining === 0
                              ? "Habis Terjual"
                              : bag.quotaRemaining <= 2
                              ? "Sisa Kritis"
                              : "Stok Aman"}
                          </span>
                          <span className="text-muted-foreground tabular-nums">
                            {bag.quotaRemaining}/{bag.quotaToday}
                          </span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="p-3.5">
                    <Button
                      size="sm"
                      variant={bag.isLastCall ? "default" : "outline"}
                      onClick={() => handleToggleFlashSale(bag.id, !bag.isLastCall)}
                      className={`text-[11px] font-bold h-7 gap-1 cursor-pointer ${
                        bag.isLastCall
                          ? "bg-amber-600 hover:bg-amber-700 text-white"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <Zap className="size-3" />
                      {bag.isLastCall ? "Flash Sale Aktif" : "Buka Flash Sale"}
                    </Button>
                  </td>
                  <td className="p-3.5">
                    <div className="flex items-center gap-1.5">
                      <Button
                        size="sm"
                        variant={bag.isActive ? "default" : "secondary"}
                        onClick={() =>
                          handleQuotaChange(
                            bag.id,
                            bag.quotaRemaining,
                            !bag.isActive
                          )
                        }
                        className={`text-xs font-bold ${
                          bag.isActive ? "bg-emerald-600 hover:bg-emerald-700 text-white" : ""
                        }`}
                      >
                        {bag.isActive ? "Aktif Dijual" : "Nonaktif"}
                      </Button>
                      <Link
                        href={`/seller/bags/${bag.id}/edit`}
                        className="inline-flex items-center gap-1 text-xs font-bold h-8 px-2.5 rounded-md border border-border bg-background hover:bg-muted text-foreground transition-colors"
                      >
                        <Pencil className="size-3 text-orange-600" />
                        <span>Edit</span>
                      </Link>
                    </div>
                  </td>
                </tr>
              ))
            )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modal Terbitkan Surprise Bag Baru */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Terbitkan Surprise Bag Sore Ini</DialogTitle>
            <DialogDescription>
              Tambahkan paket porsi surplus harian toko Anda agar langsung tampil di katalog Rerasa
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAddSubmit} className="space-y-4 pt-2 text-xs">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-muted-foreground block">
                Nama Paket Makanan
              </label>
              <Input
                type="text"
                placeholder="Contoh: Surprise Bag: Danish Pastry & Roti Gandum"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-muted-foreground block">
                  Kategori Kuliner
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as StoreCategory)}
                  className="w-full bg-background border border-border rounded-lg text-xs p-2 text-foreground focus:outline-none focus:ring-1 focus:ring-emerald-600"
                >
                  <option value="Bakery & Pastry">Bakery & Pastry</option>
                  <option value="Makanan Berat">Makanan Berat</option>
                  <option value="Kafe & Minuman">Kafe & Minuman</option>
                  <option value="Swalayan & Buah">Swalayan & Buah</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-muted-foreground block">
                  Jadwal Pengambilan (Pickup Window)
                </label>
                <Input
                  type="text"
                  placeholder="Contoh: 19:30 - 21:00 WIB"
                  value={pickupWindow}
                  onChange={(e) => setPickupWindow(e.target.value)}
                  className="text-xs"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-muted-foreground block">
                Deskripsi Isi Paket
              </label>
              <Input
                type="text"
                placeholder="Contoh: Paket berisi 3 pcs croissant dan roti manis segar hari ini"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="text-xs"
              />
            </div>

            {/* Skema Harga Normal vs Diskon */}
            <div className="p-3.5 bg-muted/40 rounded-xl space-y-3 border border-border/60">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-muted-foreground block">
                    Harga Normal Toko (Rp)
                  </label>
                  <Input
                    type="number"
                    min={10000}
                    step={1000}
                    value={originalPrice}
                    onChange={(e) => setOriginalPrice(Number(e.target.value))}
                    className="font-bold tabular-nums text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-muted-foreground block">
                    Harga Diskon Rerasa (Rp)
                  </label>
                  <Input
                    type="number"
                    min={5000}
                    step={1000}
                    value={discountedPrice}
                    onChange={(e) => setDiscountedPrice(Number(e.target.value))}
                    className="font-bold tabular-nums text-xs text-emerald-700 dark:text-emerald-400"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-1 border-t border-border/50">
                <span className="text-muted-foreground">Persentase Penghematan Pembeli:</span>
                <Badge variant="secondary" className="font-bold text-amber-700 bg-amber-50 dark:bg-amber-950/60 border border-amber-200">
                  Hemat {discountPercent > 0 ? discountPercent : 50}%
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-muted-foreground block">
                  Kuota Porsi Hari Ini
                </label>
                <Input
                  type="number"
                  min={1}
                  max={50}
                  value={quotaToday}
                  onChange={(e) => setQuotaToday(Number(e.target.value))}
                  className="font-bold tabular-nums text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-muted-foreground block">
                  Peringatan Alergen (Opsional)
                </label>
                <Input
                  type="text"
                  placeholder="Contoh: Mengandung gandum/telur"
                  value={allergensWarning}
                  onChange={(e) => setAllergensWarning(e.target.value)}
                  className="text-xs"
                />
              </div>
            </div>

            {/* Foto Produk dengan URL / Upload */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-muted-foreground block">
                Foto Makanan Produk
              </label>
              <div className="flex items-center gap-3">
                <div className="size-16 rounded-xl overflow-hidden bg-muted border border-border shrink-0">
                  <img
                    src={imageUrl}
                    alt="Preview"
                    className="size-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600";
                    }}
                  />
                </div>
                <div className="flex-1 space-y-1.5">
                  <Input
                    type="url"
                    placeholder="URL Gambar Produk..."
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="text-xs"
                  />
                  <div className="flex items-center gap-2">
                    <label className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-border bg-card hover:bg-muted text-[11px] font-semibold cursor-pointer">
                      <Upload className="size-3 text-muted-foreground" />
                      <span>{isUploading ? "Mengunggah..." : "Unggah Berkas Baru"}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>
                    <span className="text-[10px] text-muted-foreground font-mono">Format JPG/PNG</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Last Call Food Toggle Checkbox */}
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30">
              <input
                type="checkbox"
                id="isLastCallToggle"
                checked={isLastCall}
                onChange={(e) => setIsLastCall(e.target.checked)}
                className="size-4 mt-0.5 rounded accent-amber-600 cursor-pointer"
              />
              <label htmlFor="isLastCallToggle" className="cursor-pointer text-xs space-y-0.5">
                <span className="font-extrabold text-amber-800 dark:text-amber-400 block">
                  Tandai sebagai Last Call Food (Cuci Gudang Jelang Tutup)
                </span>
                <span className="text-[11px] text-muted-foreground block leading-relaxed">
                  Paket ini akan ditampilkan di seksi penawaran kilat beranda untuk pembeli yang mencari makanan malam ini.
                </span>
              </label>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-border">
              <Link href="/seller/bags/new">
                <Button
                  type="button"
                  size="sm"
                  className="bg-orange-600 hover:bg-orange-700 text-white font-bold"
                  onClick={() => setIsAddModalOpen(false)}
                >
                  Buka Halaman Form Create
                </Button>
              </Link>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
