"use client";

import { useState, useEffect } from "react";
import { RescueBoxPackage, RescueBoxOrder, Store } from "@/types/domain";
import { storeService } from "@/services/storeService";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { CheckCircle2, Box } from "lucide-react";

export default function SellerBoxesPage() {
  const [store, setStore] = useState<Store | null>(null);
  const [boxPackages, setBoxPackages] = useState<RescueBoxPackage[]>([]);
  const [boxOrders, setBoxOrders] = useState<RescueBoxOrder[]>([]);
  const [boxOrderSuccess, setBoxOrderSuccess] = useState(false);

  const syncData = () => {
    const state = storeService.getState();
    const current = state.stores[0];
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

  if (!store) return null;

  return (
    <div className="space-y-6 max-w-5xl">
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
