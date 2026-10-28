"use client";

import { useState, useEffect } from "react";
import { Store } from "@/types/domain";
import { storeService } from "@/services/storeService";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CheckCircle2 } from "lucide-react";

export default function SellerFinancePage() {
  const [store, setStore] = useState<Store | null>(null);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState<number>(100000);
  const [withdrawSuccess, setWithdrawSuccess] = useState(false);

  const syncData = () => {
    setStore(storeService.getState().stores[0]);
  };

  useEffect(() => {
    syncData();
    const unsub = storeService.subscribe(syncData);
    return unsub;
  }, []);

  const handleWithdrawSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!store) return;
    try {
      storeService.requestWithdrawal(store.id, withdrawAmount);
      setWithdrawSuccess(true);
      setIsWithdrawing(false);
      syncData();
      setTimeout(() => setWithdrawSuccess(false), 3500);
    } catch (e: unknown) {
      if (e instanceof Error) {
        alert(e.message);
      }
    }
  };

  if (!store) return null;

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h2 className="text-xl font-black text-foreground tracking-tight">
          Saldo Dompet & Penarikan Dana
        </h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          Kelola saldo pendapatan dari pesanan fisik yang telah divalidasi dan ajukan pencairan ke rekening bank
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-6 space-y-4">
          <Card className="border-border shadow-md bg-gradient-to-br from-emerald-800 to-teal-950 text-white">
            <CardContent className="p-6 space-y-4">
              <div>
                <span className="text-xs font-mono uppercase tracking-wider text-emerald-200">
                  Saldo Dompet Mitra
                </span>
                <p className="text-3xl font-black mt-1 tabular-nums">
                  Rp {store.walletBalance.toLocaleString("id-ID")}
                </p>
                <p className="text-xs text-emerald-100/80 mt-1">
                  Dana hasil pesanan fisik yang telah divalidasi kasir (net setelah potongan komisi 12%).
                </p>
              </div>

              <Button
                onClick={() => setIsWithdrawing(true)}
                disabled={store.walletBalance < 50000}
                className="w-full bg-white text-emerald-950 hover:bg-emerald-50 font-bold text-xs py-2.5 shadow-sm"
              >
                Ajukan Penarikan Dana (Withdrawal)
              </Button>
            </CardContent>
          </Card>

          {withdrawSuccess && (
            <div className="p-3 bg-emerald-100 dark:bg-emerald-950/70 border border-emerald-300 dark:border-emerald-800 rounded-xl text-xs font-semibold text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="size-4 shrink-0 text-emerald-600" />
              <span>Permohonan penarikan dana berhasil diteruskan ke Super Admin.</span>
            </div>
          )}
        </div>

        <div className="lg:col-span-6">
          <Card className="border-border shadow-xs">
            <CardHeader className="p-5 pb-3">
              <CardTitle className="text-sm font-extrabold">Rekening Bank Terdaftar</CardTitle>
              <CardDescription className="text-xs">
                Rekening tujuan pencairan dana yang telah divalidasi KYC
              </CardDescription>
            </CardHeader>

            <CardContent className="p-5 pt-0 space-y-3 text-xs">
              <div className="p-3 bg-muted/40 rounded-xl space-y-1">
                <span className="text-muted-foreground text-[11px] block">Nama Bank</span>
                <span className="font-extrabold text-foreground text-sm block">
                  {store.bankAccount?.bankName || "BCA Cirebon"}
                </span>
              </div>

              <div className="p-3 bg-muted/40 rounded-xl space-y-1">
                <span className="text-muted-foreground text-[11px] block">Nomor Rekening</span>
                <span className="font-mono font-bold text-foreground text-sm block">
                  {store.bankAccount?.accountNumber || "134-8902-111"}
                </span>
              </div>

              <div className="p-3 bg-muted/40 rounded-xl space-y-1">
                <span className="text-muted-foreground text-[11px] block">Nama Pemilik Rekening</span>
                <span className="font-bold text-foreground text-sm block">
                  {store.bankAccount?.accountHolder || "Ruby Bakery & Cake"}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Modal Dialog Form Penarikan Dana (Withdrawal) */}
      <Dialog open={isWithdrawing} onOpenChange={setIsWithdrawing}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Tarik Saldo Pendapatan Mitra</DialogTitle>
            <DialogDescription>
              Dana akan ditransfer oleh Super Admin ke rekening bank terdaftar Anda
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleWithdrawSubmit} className="space-y-4 pt-2 text-xs">
            <div>
              <label className="text-[11px] font-bold text-muted-foreground block mb-1">
                Jumlah Penarikan (Rp)
              </label>
              <Input
                type="number"
                min={50000}
                max={store.walletBalance}
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(Number(e.target.value))}
                className="font-bold tabular-nums"
              />
              <p className="text-[10px] text-muted-foreground mt-1">
                Maksimal saldo: Rp {store.walletBalance.toLocaleString("id-ID")}
              </p>
            </div>

            <div className="bg-muted/40 p-3 rounded-xl text-xs space-y-1">
              <span className="font-bold text-foreground block">Tujuan Transfer:</span>
              <span className="text-muted-foreground block">
                {store.bankAccount?.bankName} • {store.bankAccount?.accountNumber} a/n{" "}
                {store.bankAccount?.accountHolder}
              </span>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-border">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsWithdrawing(false)}>
                Batal
              </Button>
              <Button type="submit" size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold">
                Kirim Pengajuan
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
