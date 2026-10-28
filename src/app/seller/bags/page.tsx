"use client";

import { useState, useEffect } from "react";
import { SurpriseBag } from "@/types/domain";
import { storeService } from "@/services/storeService";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Clock } from "lucide-react";

export default function SellerBagsPage() {
  const [surpriseBags, setSurpriseBags] = useState<SurpriseBag[]>([]);

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

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h2 className="text-xl font-black text-foreground tracking-tight">
          Manajemen Kuota Surprise Bag
        </h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          Atur sisa porsi surplus harian yang siap diselamatkan pembeli sebelum jam operasional berakhir
        </p>
      </div>

      <Card className="border-border shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/40 border-b border-border text-[11px] text-muted-foreground font-bold uppercase">
              <tr>
                <th className="p-3.5 px-4">Nama Paket & Kategori</th>
                <th className="p-3.5">Jadwal Pengambilan</th>
                <th className="p-3.5">Harga Normal & Diskon</th>
                <th className="p-3.5">Atur Sisa Kuota</th>
                <th className="p-3.5">Status Penjualan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {surpriseBags.map((bag) => (
                <tr key={bag.id} className="hover:bg-muted/20">
                  <td className="p-3.5 px-4">
                    <span className="font-extrabold text-foreground text-sm block">
                      {bag.title}
                    </span>
                    <span className="text-[11px] text-muted-foreground block mt-0.5">
                      {bag.category} • {bag.description}
                    </span>
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
                    <div className="flex items-center gap-2">
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
                        className="size-7 p-0 font-bold"
                      >
                        -
                      </Button>
                      <span className="font-black tabular-nums w-8 text-center text-sm">
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
                        className="size-7 p-0 font-bold"
                      >
                        +
                      </Button>
                    </div>
                  </td>
                  <td className="p-3.5">
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
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
