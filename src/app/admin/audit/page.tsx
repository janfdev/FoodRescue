"use client";

import { useState, useEffect } from "react";
import { Review } from "@/types/domain";
import { storeService } from "@/services/storeService";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export default function AdminAuditPage() {
  const [reviews, setReviews] = useState<Review[]>([]);

  useEffect(() => {
    setReviews(storeService.getState().reviews);
    const unsub = storeService.subscribe(() => {
      setReviews(storeService.getState().reviews);
    });
    return unsub;
  }, []);

  return (
    <div className="space-y-6 w-full">
      <div>
        <h2 className="text-xl font-black text-foreground tracking-tight">
          Audit Kepatuhan Kemasan & Resolusi Sengketa
        </h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          Pengawasan checklist kepatuhan kemasan resmi Rescue Box dari ulasan nyata pembeli
        </p>
      </div>

      <div className="space-y-3">
        <h3 className="font-extrabold text-sm text-foreground">
          Hasil Validasi Penggunaan Wadah Resmi SisaRasa / Rerasa oleh Pembeli
        </h3>
        <div className="space-y-2">
          {reviews.map((rev) => (
            <Card key={rev.id} className="border-border shadow-2xs">
              <CardContent className="p-3.5 text-xs flex items-center justify-between gap-3">
                <div>
                  <span className="font-bold text-foreground">{rev.buyerName}</span>
                  <p className="text-[11px] text-muted-foreground italic mt-0.5">
                    &quot;{rev.comment}&quot;
                  </p>
                </div>
                <Badge
                  variant={rev.usedOfficialRescueBox ? "outline" : "destructive"}
                  className={`text-[10px] font-bold shrink-0 ${
                    rev.usedOfficialRescueBox ? "border-emerald-500 text-emerald-700 dark:text-emerald-300" : ""
                  }`}
                >
                  {rev.usedOfficialRescueBox ? "✓ Box Resmi Terpasang" : "✗ Tidak Pakai Box Resmi"}
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
