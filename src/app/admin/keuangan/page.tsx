"use client";

import { useState, useEffect } from "react";
import { RescueBoxOrder, WithdrawalRequest } from "@/types/domain";
import { storeService } from "@/services/storeService";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";

export default function AdminKeuanganPage() {
  const [boxOrders, setBoxOrders] = useState<RescueBoxOrder[]>([]);
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);

  const syncData = () => {
    const state = storeService.getState();
    setBoxOrders(state.boxOrders);
    setWithdrawals(state.withdrawals);
  };

  useEffect(() => {
    syncData();
    const unsub = storeService.subscribe(syncData);
    return unsub;
  }, []);

  const handleApproveWithdrawal = (wdId: string) => {
    storeService.approveWithdrawal(wdId);
    syncData();
  };

  return (
    <div className="space-y-6 w-full">
      <div>
        <h2 className="text-xl font-black text-foreground tracking-tight">
          Persetujuan Pencairan Dana (Withdrawal) Mitra
        </h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          Verifikasi rekening bank tujuan dan eksekusi transfer dana dompet toko
        </p>
      </div>

      <div className="space-y-3">
        {withdrawals.length === 0 ? (
          <div className="p-8 text-center bg-card border border-dashed border-border rounded-2xl text-xs text-muted-foreground">
            Tidak ada permohonan pencairan dana saat ini.
          </div>
        ) : (
          withdrawals.map((w) => (
            <Card key={w.id} className="border-border shadow-xs">
              <CardContent className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-sm text-foreground">{w.storeName}</span>
                    <span className="text-xs font-mono text-muted-foreground">({w.id})</span>
                    <Badge
                      variant={w.status === "APPROVED" ? "default" : "secondary"}
                      className={`text-[10px] font-bold ${
                        w.status === "APPROVED" ? "bg-emerald-600 text-white" : "bg-amber-500 text-white"
                      }`}
                    >
                      {w.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Rekening: <strong>{w.bankName}</strong> • {w.accountNumber} a/n {w.accountHolder}
                  </p>
                  <p className="text-base font-black text-emerald-700 dark:text-emerald-400 tabular-nums">
                    Rp {w.amount.toLocaleString("id-ID")}
                  </p>
                </div>

                <div>
                  {w.status === "PENDING" ? (
                    <Button
                      size="sm"
                      onClick={() => handleApproveWithdrawal(w.id)}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs"
                    >
                      Transfer & Setujui (Approve)
                    </Button>
                  ) : (
                    <span className="text-xs text-muted-foreground font-semibold flex items-center gap-1.5">
                      <CheckCircle2 className="size-4 text-emerald-600" />
                      Telah Ditransfer
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* B2B Logistics Table */}
      <div className="pt-4">
        <h3 className="font-extrabold text-sm text-foreground mb-3">
          Logistik Kemasan Rescue Box B2B
        </h3>
        <Card className="border-border shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/50 border-b border-border text-[11px] text-muted-foreground font-bold uppercase tracking-wider">
                <tr>
                  <th className="p-3.5 px-4">ID Pesanan</th>
                  <th className="p-3.5">Nama Toko</th>
                  <th className="p-3.5">Jumlah Box</th>
                  <th className="p-3.5">Total Tagihan</th>
                  <th className="p-3.5">Resi Pengiriman</th>
                  <th className="p-3.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {boxOrders.map((bo) => (
                  <tr key={bo.id} className="hover:bg-muted/20">
                    <td className="p-3.5 px-4 font-mono font-bold text-foreground">{bo.id}</td>
                    <td className="p-3.5 font-semibold text-foreground">{bo.storeName}</td>
                    <td className="p-3.5 font-bold tabular-nums">{bo.quantityPcs} pcs</td>
                    <td className="p-3.5 font-bold tabular-nums">
                      Rp {bo.totalPrice.toLocaleString("id-ID")}
                    </td>
                    <td className="p-3.5 font-mono text-muted-foreground">{bo.trackingNumber}</td>
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
