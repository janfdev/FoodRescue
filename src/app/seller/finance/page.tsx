"use client";

import { useState, useEffect, useMemo } from "react";
import { Store, Order, WithdrawalRequest } from "@/types/domain";
import { storeService } from "@/services/storeService";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CheckCircle2, ArrowDownRight, ArrowUpRight, Clock, Building2, Wallet, DollarSign, PackageCheck } from "lucide-react";

export default function SellerFinancePage() {
  const [store, setStore] = useState<Store | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState<number>(50000);
  const [withdrawSuccess, setWithdrawSuccess] = useState(false);

  const syncData = () => {
    const state = storeService.getState();
    const activeStoreId = state.currentUser?.storeId || "store-ruby-bakery";
    const currentStore = activeStoreId ? state.stores.find((s) => s.id === activeStoreId) || null : null;
    setStore(currentStore);
    if (activeStoreId) {
      setOrders(state.orders.filter((o) => o.storeId === activeStoreId));
      setWithdrawals(state.withdrawals.filter((w) => w.storeId === activeStoreId));
    }
  };

  useEffect(() => {
    syncData();
    const unsub = storeService.subscribe(syncData);
    return unsub;
  }, []);

  // Metrik Finansial Akumulatif
  const completedOrders = useMemo(() => {
    return orders.filter((o) => o.status === "COMPLETED");
  }, [orders]);

  const totalGrossRevenue = useMemo(() => {
    return completedOrders.reduce((sum, o) => sum + (o.subtotalPrice || o.totalPrice), 0);
  }, [completedOrders]);

  const totalNetEarnings = useMemo(() => {
    return completedOrders.reduce((sum, o) => sum + (o.sellerEarning || Math.round((o.totalPrice || 0) * 0.9)), 0);
  }, [completedOrders]);

  const totalPlatformCommission = useMemo(() => {
    return completedOrders.reduce((sum, o) => sum + (o.platformFee || Math.round((o.totalPrice || 0) * 0.1)), 0);
  }, [completedOrders]);

  const totalWithdrawnAmount = useMemo(() => {
    return withdrawals
      .filter((w) => w.status === "APPROVED")
      .reduce((sum, w) => sum + w.amount, 0);
  }, [withdrawals]);

  const totalPendingWithdrawal = useMemo(() => {
    return withdrawals
      .filter((w) => w.status === "PENDING")
      .reduce((sum, w) => sum + w.amount, 0);
  }, [withdrawals]);

  // Saldo Dompet Bersih: Total Hak Bersih - Total Penarikan (Approved + Pending)
  const currentAvailableBalance = Math.max(0, totalNetEarnings - totalWithdrawnAmount - totalPendingWithdrawal);

  // Combined Mutasi History (Orders Completed as Credit, Withdrawals as Debit)
  const mutationHistory = useMemo(() => {
    type MutationItem = {
      id: string;
      date: string;
      type: "CREDIT" | "DEBIT";
      title: string;
      desc: string;
      amount: number;
      status: string;
    };

    const list: MutationItem[] = [];

    // Credit from completed orders
    completedOrders.forEach((o) => {
      list.push({
        id: o.id,
        date: o.completedAt || o.paidAt || o.createdAt || new Date().toISOString(),
        type: "CREDIT",
        title: `Pencairan Pesanan ${o.id}`,
        desc: `${o.bagTitle} (Qty: ${o.quantity})`,
        amount: o.sellerEarning || Math.round((o.totalPrice || 0) * 0.9),
        status: "SELESAI"
      });
    });

    // Debit from withdrawals
    withdrawals.forEach((w) => {
      list.push({
        id: w.id,
        date: w.requestedAt || new Date().toISOString(),
        type: "DEBIT",
        title: `Penarikan Dana ke ${w.bankName}`,
        desc: `No. Rek: ${w.accountNumber} a/n ${w.accountHolder}`,
        amount: w.amount,
        status: w.status === "APPROVED" ? "DICAIRKAN" : "MENUNGGU_APPROVAL"
      });
    });

    // Sort newest first
    return list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [completedOrders, withdrawals]);

  const handleOpenWithdrawDialog = () => {
    setWithdrawAmount(currentAvailableBalance);
    setIsWithdrawing(true);
  };

  const handleWithdrawSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!store) return;
    if (withdrawAmount > currentAvailableBalance) {
      alert(`Nominal penarikan (Rp ${withdrawAmount.toLocaleString("id-ID")}) melebihi saldo dompet yang tersedia (Rp ${currentAvailableBalance.toLocaleString("id-ID")}).`);
      return;
    }
    if (withdrawAmount < 10000) {
      alert("Minimal penarikan dana adalah Rp 10.000.");
      return;
    }
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

  if (!store) {
    return (
      <div className="space-y-6 w-full">
        <div>
          <h2 className="text-xl font-black text-foreground tracking-tight">
            Saldo Dompet & Penarikan Dana
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Kelola saldo pendapatan dari pesanan fisik yang telah divalidasi dan ajukan pencairan ke rekening bank
          </p>
        </div>

        <Card className="border-border p-8 text-center space-y-3 bg-muted/20">
          <div className="size-12 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center mx-auto">
            <CheckCircle2 className="size-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-foreground">Data Keuangan Gerai Belum Tersedia</h3>
            <p className="text-xs text-muted-foreground max-w-md mx-auto">
              Akun Anda belum memiliki gerai aktif yang terdaftar. Saldo dompet dan riwayat penarikan dana akan muncul setelah toko Anda diverifikasi dan menyelesaikan pesanan.
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
          Saldo Dompet & Penarikan Dana
        </h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          Kelola saldo pendapatan dari pesanan fisik yang telah divalidasi dan ajukan pencairan ke rekening bank
        </p>
      </div>

      {/* Grid Kartu Utama: Saldo Dompet & Rekening Bank */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-6 space-y-4">
          <Card className="border-border shadow-md bg-gradient-to-br from-emerald-800 to-teal-950 text-white">
            <CardContent className="p-6 space-y-4">
              <div>
                <span className="text-xs font-mono uppercase tracking-wider text-emerald-200">
                  Saldo Dompet Tersedia (Siap Ditarik)
                </span>
                <p className="text-3xl font-black mt-1 tabular-nums">
                  Rp {currentAvailableBalance.toLocaleString("id-ID")}
                </p>
                <p className="text-xs text-emerald-100/80 mt-1">
                  Akumulasi dana bersih dari {completedOrders.length} pesanan fisik yang telah divalidasi kasir.
                </p>
              </div>

              <Button
                onClick={handleOpenWithdrawDialog}
                disabled={currentAvailableBalance < 10000}
                className="w-full bg-white text-emerald-950 hover:bg-emerald-50 font-bold text-xs py-2.5 shadow-sm cursor-pointer"
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
          <Card className="border-border shadow-xs h-full flex flex-col justify-between">
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
                  {store.bankAccount ? store.bankAccount.bankName : "Belum Mengisi Rekening"}
                </span>
              </div>

              <div className="p-3 bg-muted/40 rounded-xl space-y-1">
                <span className="text-muted-foreground text-[11px] block">Nomor Rekening</span>
                <span className="font-mono font-bold text-foreground text-sm block">
                  {store.bankAccount ? store.bankAccount.accountNumber : "-"}
                </span>
              </div>

              <div className="p-3 bg-muted/40 rounded-xl space-y-1">
                <span className="text-muted-foreground text-[11px] block">Nama Pemilik Rekening</span>
                <span className="font-bold text-foreground text-sm block">
                  {store.bankAccount ? store.bankAccount.accountHolder : "-"}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Rangkuman 4 Metrik Akumulatif */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="p-3.5 border-border shadow-2xs space-y-1 bg-card">
          <span className="text-[10px] text-muted-foreground font-bold block">Total Pesanan Selesai</span>
          <p className="text-lg font-black text-foreground tabular-nums">
            {completedOrders.length} Pesanan
          </p>
          <span className="text-[10px] text-emerald-600 font-semibold block">Telah serah-terima</span>
        </Card>

        <Card className="p-3.5 border-border shadow-2xs space-y-1 bg-card">
          <span className="text-[10px] text-muted-foreground font-bold block">Total Omzet Kotor</span>
          <p className="text-lg font-black text-foreground tabular-nums">
            Rp {totalGrossRevenue.toLocaleString("id-ID")}
          </p>
          <span className="text-[10px] text-muted-foreground block">Sebelum komisi</span>
        </Card>

        <Card className="p-3.5 border-border shadow-2xs space-y-1 bg-card">
          <span className="text-[10px] text-muted-foreground font-bold block">Total Komisi Platform (10%)</span>
          <p className="text-lg font-black text-amber-700 dark:text-amber-400 tabular-nums">
            Rp {totalPlatformCommission.toLocaleString("id-ID")}
          </p>
          <span className="text-[10px] text-muted-foreground block">Fee operasional Rerasa</span>
        </Card>

        <Card className="p-3.5 border-border shadow-2xs space-y-1 bg-card">
          <span className="text-[10px] text-muted-foreground font-bold block">Total Hak Bersih Masuk</span>
          <p className="text-lg font-black text-emerald-700 dark:text-emerald-400 tabular-nums">
            Rp {totalNetEarnings.toLocaleString("id-ID")}
          </p>
          <span className="text-[10px] text-emerald-600 font-semibold block">90% hak mitra gerai</span>
        </Card>
      </div>

      {/* Tabel Riwayat Mutasi Dompet */}
      <Card className="border-border shadow-xs overflow-hidden">
        <CardHeader className="p-4 px-5 border-b border-border bg-muted/30">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-sm font-black">
                Riwayat Mutasi Saldo & Pencairan Escrow
              </CardTitle>
              <CardDescription className="text-xs">
                Log transparansi seluruh dana pesanan yang masuk dan penarikan yang diajukan
              </CardDescription>
            </div>
            <Badge variant="outline" className="text-[10px] font-mono">
              {mutationHistory.length} Transaksi
            </Badge>
          </div>
        </CardHeader>

        <div className="overflow-x-auto">
          {mutationHistory.length === 0 ? (
            <div className="p-8 text-center text-xs text-muted-foreground">
              Belum ada mutasi saldo. Mutasi otomatis tercatat setiap kali kasir menyelesaikan serah terima pesanan.
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/40 border-b border-border text-[11px] text-muted-foreground font-bold uppercase">
                <tr>
                  <th className="p-3 px-4">Tipe Mutasi</th>
                  <th className="p-3">Keterangan</th>
                  <th className="p-3">Waktu</th>
                  <th className="p-3 text-right">Nominal (Net)</th>
                  <th className="p-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {mutationHistory.map((item, idx) => {
                  const isCredit = item.type === "CREDIT";
                  return (
                    <tr key={`${item.id}-${idx}`} className="hover:bg-muted/20">
                      <td className="p-3 px-4">
                        <div className="flex items-center gap-2">
                          <div
                            className={`size-6 rounded-full flex items-center justify-center shrink-0 ${
                              isCredit
                                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400"
                                : "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400"
                            }`}
                          >
                            {isCredit ? (
                              <ArrowDownRight className="size-3.5" />
                            ) : (
                              <ArrowUpRight className="size-3.5" />
                            )}
                          </div>
                          <div>
                            <span className="font-bold text-foreground block">
                              {item.title}
                            </span>
                            <span className="font-mono text-[10px] text-muted-foreground">
                              {item.id}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="p-3 text-muted-foreground">
                        {item.desc}
                      </td>

                      <td className="p-3 text-muted-foreground tabular-nums">
                        {new Date(item.date).toLocaleString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit"
                        })}
                      </td>

                      <td className="p-3 text-right font-black tabular-nums">
                        <span
                          className={
                            isCredit
                              ? "text-emerald-700 dark:text-emerald-400"
                              : "text-amber-700 dark:text-amber-400"
                          }
                        >
                          {isCredit ? "+ " : "- "}Rp {item.amount.toLocaleString("id-ID")}
                        </span>
                      </td>

                      <td className="p-3 text-right">
                        <Badge
                          variant={
                            item.status === "SELESAI" || item.status === "DICAIRKAN"
                              ? "default"
                              : "secondary"
                          }
                          className={`text-[9px] font-bold ${
                            item.status === "SELESAI" || item.status === "DICAIRKAN"
                              ? "bg-emerald-600 text-white"
                              : "bg-amber-500/20 text-amber-800 dark:text-amber-300"
                          }`}
                        >
                          {item.status}
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </Card>

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
                min={10000}
                max={currentAvailableBalance}
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(Number(e.target.value))}
                className="font-bold tabular-nums"
              />
              <p className="text-[10px] text-muted-foreground mt-1">
                Maksimal saldo: Rp {currentAvailableBalance.toLocaleString("id-ID")}
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
              <Button type="submit" size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer">
                Kirim Pengajuan
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
