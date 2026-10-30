"use client";

import { useState, useEffect } from "react";
import { RescueBoxPackage, RescueBoxOrder, Store } from "@/types/domain";
import { storeService } from "@/services/storeService";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { CheckCircle2, Box, TrendingDown, AlertCircle, Sparkles } from "lucide-react";

export default function SellerBoxesPage() {
  const [store, setStore] = useState<Store | null>(null);
  const [boxPackages, setBoxPackages] = useState<RescueBoxPackage[]>([]);
  const [boxOrders, setBoxOrders] = useState<RescueBoxOrder[]>([]);
  const [boxOrderSuccess, setBoxOrderSuccess] = useState(false);

  const syncData = () => {
    const state = storeService.getState();
    const activeStoreId = state.currentUser?.storeId || "store-ruby-bakery";
    const current = activeStoreId ? state.stores.find((s) => s.id === activeStoreId) || null : null;
    setStore(current);
    setBoxPackages(state.boxPackages);
    setBoxOrders(state.boxOrders);
  };

  useEffect(() => {
    syncData();
    const unsub = storeService.subscribe(syncData);
    return unsub;
  }, []);

  const handleBuyBoxes = (pkg: RescueBoxPackage) => {
    if (!store) return;
    storeService.orderRescueBoxes(store.id, pkg.id, store.address);
    setBoxOrderSuccess(true);
    syncData();
    setTimeout(() => setBoxOrderSuccess(false), 3500);
  };

  if (!store) {
    return (
      <div className="space-y-6 w-full">
        <div>
          <h2 className="text-xl font-black text-foreground tracking-tight">
            Toko Suplai Kemasan Resmi Rescue Box B2B
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Pesan wadah ramah lingkungan berlogo resmi Rerasa untuk menjamin kepatuhan audit dan higienitas makanan
          </p>
        </div>

        <Card className="border-border p-8 text-center space-y-3 bg-muted/20">
          <div className="size-12 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center mx-auto">
            <AlertCircle className="size-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-foreground">Profil Gerai Toko Belum Terhubung</h3>
            <p className="text-xs text-muted-foreground max-w-md mx-auto">
              Akun Anda belum terhubung ke toko aktif atau gerai toko masih dalam proses verifikasi admin. Silakan lengkapi pendaftaran gerai terlebih dahulu untuk melakukan pembelian Rescue Box.
            </p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full">
      <div>
        <h2 className="text-xl font-black text-foreground tracking-tight">
          Toko Suplai Kemasan Resmi Rescue Box B2B
        </h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          Pesan wadah ramah lingkungan berlogo resmi Rerasa untuk menjamin kepatuhan audit dan higienitas makanan
        </p>
      </div>

      {boxOrderSuccess && (
        <div className="p-3 bg-emerald-100 dark:bg-emerald-950/70 border border-emerald-300 dark:border-emerald-800 rounded-xl text-xs font-semibold text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="size-4 shrink-0 text-emerald-600" />
          <span>Pesanan Rescue Box berhasil diproses! Stok kemasan Anda telah diperbarui.</span>
        </div>
      )}

      {/* Kalkulator Cerdas Kebutuhan Kemasan & Sisa Stok */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        <Card className="md:col-span-4 border-border shadow-xs bg-card p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-muted-foreground uppercase">
              Sisa Stok Kemasan Anda
            </span>
            <Box className="size-4 text-emerald-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-foreground tabular-nums">
              {store.currentBoxStock || 0}
            </span>
            <span className="text-xs font-bold text-muted-foreground">Pcs Box Tersedia</span>
          </div>
          <p className="text-[11px] text-muted-foreground">
            Wajib digunakan untuk mengemas seluruh pesanan Surprise Bag demi kepatuhan audit.
          </p>
        </Card>

        <Card className="md:col-span-8 border-border shadow-xs bg-muted/30 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="size-4 text-amber-500" />
              <h4 className="text-xs font-extrabold text-foreground">
                Prediksi Depletion & Rekomendasi Restock B2B
              </h4>
            </div>
            <Badge variant="outline" className="text-[10px] font-bold border-amber-500/40 text-amber-600">
              Rata-rata 5 box / hari
            </Badge>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-card p-3 rounded-xl border border-border/70">
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                <TrendingDown className="size-3.5 text-amber-500" />
                <span>
                  Estimasi Habis:{" "}
                  <strong className="text-amber-600 tabular-nums">
                    {Math.max(1, Math.round(((store.currentBoxStock || 15) / 5) * 10) / 10)} Hari Lagi
                  </strong>
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Rekomendasi sistem: Pesan <strong>Paket Reguler (100 Box)</strong> untuk mengamankan operasional 20 hari ke depan.
              </p>
            </div>

            {boxPackages.length > 1 && (
              <Button
                size="sm"
                onClick={() => handleBuyBoxes(boxPackages[1])}
                className="bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs h-8 px-3 rounded-lg shrink-0 cursor-pointer shadow-2xs"
              >
                Pesan 100 Box Rekomendasi
              </Button>
            )}
          </div>
        </Card>
      </div>

      {/* Grid Paket Box */}
      <div>
        <h3 className="font-extrabold text-sm text-foreground mb-3">
          Pilihan Paket Kemasan Resmi
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {boxPackages.map((pkg) => (
            <Card key={pkg.id} className="border-border shadow-xs flex flex-col justify-between">
              <CardHeader className="p-4 pb-2">
                <Badge variant="outline" className="w-fit text-[10px] font-mono mb-1">
                  {pkg.quantityPcs} Pcs Box
                </Badge>
                <CardTitle className="text-sm font-extrabold">{pkg.name}</CardTitle>
                <CardDescription className="text-xs">
                  Wadah ramah lingkungan berlogo Rerasa & segel higienitas
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 pt-1 flex items-center justify-between">
                <span className="text-base font-black text-orange-600 tabular-nums">
                  Rp {pkg.price.toLocaleString("id-ID")}
                </span>
                <Button
                  size="sm"
                  onClick={() => handleBuyBoxes(pkg)}
                  className="bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs"
                >
                  Pesan Paket
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Riwayat Kiriman SiCepat */}
      <div>
        <h3 className="font-extrabold text-sm text-foreground mb-3">
          Riwayat Pengiriman Kemasan Resmi
        </h3>
        <Card className="border-border shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/40 border-b border-border text-[11px] text-muted-foreground font-bold uppercase">
                <tr>
                  <th className="p-3.5 px-4">ID Pesanan</th>
                  <th className="p-3.5">Jumlah Box</th>
                  <th className="p-3.5">Total Harga</th>
                  <th className="p-3.5">Nomor Resi Pengiriman</th>
                  <th className="p-3.5">Status Pengiriman</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {boxOrders.map((bo) => (
                  <tr key={bo.id} className="hover:bg-muted/20">
                    <td className="p-3.5 px-4 font-mono font-bold text-foreground">{bo.id}</td>
                    <td className="p-3.5 font-bold tabular-nums">{bo.quantityPcs} pcs</td>
                    <td className="p-3.5 font-bold tabular-nums">
                      Rp {bo.totalPrice.toLocaleString("id-ID")}
                    </td>
                    <td className="p-3.5 font-mono text-muted-foreground">
                      {bo.trackingNumber}
                    </td>
                    <td className="p-3.5">
                      <Badge variant="secondary" className="text-[10px] font-bold">
                        {bo.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
