"use client";

import { useState, useEffect, useMemo } from "react";
import { RescueBoxOrder, WithdrawalRequest } from "@/types/domain";
import { storeService } from "@/services/storeService";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  CheckCircle2,
  Copy,
  Check,
  ShieldCheck,
  Wallet,
  ArrowUpRight,
  Clock,
  Landmark,
  Package,
} from "lucide-react";
import { TableToolbar } from "@/components/common/TableToolbar";
import showToast from "@/lib/toast";

export default function AdminKeuanganPage() {
  const [boxOrders, setBoxOrders] = useState<RescueBoxOrder[]>([]);
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Filter states untuk Payout Table
  const [payoutSearch, setPayoutSearch] = useState("");
  const [payoutStatus, setPayoutStatus] = useState("ALL");

  // Filter states untuk Logistics Table
  const [logisticsSearch, setLogisticsSearch] = useState("");

  const syncData = () => {
    const state = storeService.getState();
    setBoxOrders(state.boxOrders || []);
    setWithdrawals(state.withdrawals || []);
  };

  useEffect(() => {
    syncData();
    const unsub = storeService.subscribe(syncData);
    return unsub;
  }, []);

  const handleApproveWithdrawal = (wdId: string) => {
    storeService.approveWithdrawal(wdId);
    showToast.success(`Pencairan dana ${wdId} berhasil disetujui & ditransfer!`);
    syncData();
  };

  const handleCopyBankInfo = (w: WithdrawalRequest) => {
    const text = `${w.bankName} ${w.accountNumber} a/n ${w.accountHolder} - Rp ${w.amount.toLocaleString("id-ID")}`;
    navigator.clipboard.writeText(text);
    setCopiedId(w.id);
    showToast.success(`Rekening ${w.bankName} tersalin ke clipboard!`);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const state = storeService.getState();
  const allOrders = state.orders || [];
  const totalGrossMerchandiseValue = allOrders.reduce((acc, o) => acc + o.totalPrice, 0);
  const totalPlatformEarnings = allOrders
    .filter((o) => o.status === "COMPLETED")
    .reduce((acc, o) => acc + o.platformFee + (o.adminFee || 0), 0);
  const totalSellerEarningsCompleted = allOrders
    .filter((o) => o.status === "COMPLETED")
    .reduce((acc, o) => acc + o.sellerEarning, 0);

  const totalEscrowHold = allOrders
    .filter((o) => o.status === "PAID" || o.status === "READY_FOR_PICKUP")
    .reduce((acc, o) => acc + o.totalPrice, 0);
  const totalPendingPayouts = withdrawals
    .filter((w) => w.status === "PENDING")
    .reduce((acc, w) => acc + w.amount, 0);
  const totalVaultBalance = totalEscrowHold + totalPendingPayouts;

  // Filtered withdrawals
  const filteredWithdrawals = useMemo(() => {
    return withdrawals.filter((w) => {
      const matchSearch =
        w.storeName.toLowerCase().includes(payoutSearch.toLowerCase()) ||
        w.id.toLowerCase().includes(payoutSearch.toLowerCase()) ||
        w.accountHolder.toLowerCase().includes(payoutSearch.toLowerCase()) ||
        w.bankName.toLowerCase().includes(payoutSearch.toLowerCase());
      const matchStatus = payoutStatus === "ALL" || w.status === payoutStatus;
      return matchSearch && matchStatus;
    });
  }, [withdrawals, payoutSearch, payoutStatus]);

  // Filtered logistics
  const filteredLogistics = useMemo(() => {
    return boxOrders.filter((b) => {
      return (
        b.storeName.toLowerCase().includes(logisticsSearch.toLowerCase()) ||
        b.id.toLowerCase().includes(logisticsSearch.toLowerCase()) ||
        (b.trackingNumber && b.trackingNumber.toLowerCase().includes(logisticsSearch.toLowerCase()))
      );
    });
  }, [boxOrders, logisticsSearch]);

  return (
    <div className="space-y-6 w-full font-sans pb-16">
      {/* Header Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-black text-foreground tracking-tight">
            Pencairan Dana (Payout) & Kas Escrow
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Manajemen rekening bank tujuan, verifikasi transfer saldo toko, dan logistik kemasan B2B
          </p>
        </div>
      </div>

      {/* Liquidity Reserves & Vault Solvency Widget */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-border shadow-xs bg-card p-4 space-y-1 rounded-2xl">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[11px] font-bold uppercase tracking-wider">Gross Transaksi (GMV)</span>
            <Wallet className="size-4 text-emerald-600" />
          </div>
          <p className="text-xl font-black text-foreground tabular-nums">
            Rp {totalGrossMerchandiseValue.toLocaleString("id-ID")}
          </p>
          <span className="text-[10px] text-muted-foreground block">
            Nilai akumulasi seluruh pesanan
          </span>
        </Card>

        <Card className="border-border shadow-xs bg-card p-4 space-y-1 rounded-2xl">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[11px] font-bold uppercase tracking-wider">Net Revenue Platform (12%)</span>
            <ArrowUpRight className="size-4 text-emerald-600" />
          </div>
          <p className="text-xl font-black text-emerald-700 dark:text-emerald-400 tabular-nums">
            Rp {totalPlatformEarnings.toLocaleString("id-ID")}
          </p>
          <span className="text-[10px] text-emerald-600 font-bold block">
            Hak bagi hasil + biaya layanan bersih
          </span>
        </Card>

        <Card className="border-border shadow-xs bg-card p-4 space-y-1 rounded-2xl">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[11px] font-bold uppercase tracking-wider">Holding Escrow Aktif</span>
            <ShieldCheck className="size-4 text-purple-600" />
          </div>
          <p className="text-xl font-black text-purple-600 tabular-nums">
            Rp {totalEscrowHold.toLocaleString("id-ID")}
          </p>
          <span className="text-[10px] text-muted-foreground block">
            Terkunci sampai verifikasi kasir
          </span>
        </Card>

        <Card className="border-border shadow-xs bg-card p-4 space-y-1 rounded-2xl">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[11px] font-bold uppercase tracking-wider">Antrean Payout Toko</span>
            <Landmark className="size-4 text-amber-600" />
          </div>
          <p className="text-xl font-black text-amber-600 tabular-nums">
            Rp {totalPendingPayouts.toLocaleString("id-ID")}
          </p>
          <span className="text-[10px] text-muted-foreground block">
            {withdrawals.filter((w) => w.status === "PENDING").length} permohonan antre transfer
          </span>
        </Card>
      </div>

      {/* Section 1: Tabel Payout Mitra (Shadcn Data Table) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Landmark className="size-4 text-purple-600" />
            <h3 className="font-extrabold text-sm text-foreground">
              Daftar Permohonan Pencairan Dana (Payout)
            </h3>
          </div>
        </div>

        <TableToolbar
          searchQuery={payoutSearch}
          onSearchChange={setPayoutSearch}
          searchPlaceholder="Cari toko, nama pemilik rekening, atau bank..."
          statusFilter={payoutStatus}
          onStatusChange={setPayoutStatus}
          statusOptions={[
            { label: "Menunggu Transfer (PENDING)", value: "PENDING" },
            { label: "Selesai Ditransfer (APPROVED)", value: "APPROVED" },
          ]}
          totalResults={filteredWithdrawals.length}
          onResetFilters={() => {
            setPayoutSearch("");
            setPayoutStatus("ALL");
          }}
        />

        <Card className="border-border shadow-xs overflow-hidden rounded-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/50 border-b border-border text-[11px] text-muted-foreground font-bold uppercase tracking-wider">
                <tr>
                  <th className="p-3.5 px-4">ID Permohonan</th>
                  <th className="p-3.5">Nama Toko Mitra</th>
                  <th className="p-3.5">Rekening Bank Tujuan</th>
                  <th className="p-3.5">Nominal Payout</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right px-4">Aksi / Eksekusi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredWithdrawals.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-muted-foreground">
                      Tidak ada data permohonan pencairan yang sesuai dengan filter.
                    </td>
                  </tr>
                ) : (
                  filteredWithdrawals.map((w) => (
                    <tr key={w.id} className="hover:bg-muted/20 transition-colors">
                      <td className="p-3.5 px-4 font-mono font-bold text-foreground">
                        {w.id}
                      </td>
                      <td className="p-3.5">
                        <span className="font-bold text-foreground block">{w.storeName}</span>
                        <span className="text-[10px] text-muted-foreground font-mono">
                          ID Toko: {w.storeId}
                        </span>
                      </td>
                      <td className="p-3.5">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-black text-foreground">
                              {w.bankName} - {w.accountNumber}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleCopyBankInfo(w)}
                              className="size-6 rounded-md hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
                              title="Salin Nomor Rekening"
                            >
                              {copiedId === w.id ? (
                                <Check className="size-3 text-emerald-600" />
                              ) : (
                                <Copy className="size-3" />
                              )}
                            </button>
                          </div>
                          <span className="text-[10px] text-muted-foreground block">
                            a.n. {w.accountHolder}
                          </span>
                        </div>
                      </td>
                      <td className="p-3.5 font-black text-emerald-700 dark:text-emerald-400 tabular-nums text-sm">
                        Rp {w.amount.toLocaleString("id-ID")}
                      </td>
                      <td className="p-3.5">
                        <Badge
                          variant={w.status === "APPROVED" ? "default" : "secondary"}
                          className={`text-[10px] font-bold ${
                            w.status === "APPROVED"
                              ? "bg-emerald-600 text-white"
                              : "bg-amber-500 text-white"
                          }`}
                        >
                          {w.status === "APPROVED" ? "SUDAH DITRANSFER" : "MENUNGGU PROSES"}
                        </Badge>
                      </td>
                      <td className="p-3.5 text-right px-4">
                        {w.status === "PENDING" ? (
                          <Button
                            size="sm"
                            onClick={() => handleApproveWithdrawal(w.id)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs h-8 px-3 rounded-xl cursor-pointer"
                          >
                            <Check className="size-3.5 mr-1" />
                            <span>Setujui Transfer</span>
                          </Button>
                        ) : (
                          <span className="text-xs text-muted-foreground font-semibold inline-flex items-center gap-1.5">
                            <CheckCircle2 className="size-4 text-emerald-600" />
                            <span>Selesai</span>
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Section 2: Tabel B2B Logistics Kemasan Rescue Box */}
      <div className="pt-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Package className="size-4 text-emerald-600" />
            <h3 className="font-extrabold text-sm text-foreground">
              Logistik Kemasan Rescue Box B2B
            </h3>
          </div>
        </div>

        <TableToolbar
          searchQuery={logisticsSearch}
          onSearchChange={setLogisticsSearch}
          searchPlaceholder="Cari berdasarkan ID resi, nomor pesanan, atau nama toko..."
          totalResults={filteredLogistics.length}
          onResetFilters={() => setLogisticsSearch("")}
        />

        <Card className="border-border shadow-xs overflow-hidden rounded-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/50 border-b border-border text-[11px] text-muted-foreground font-bold uppercase tracking-wider">
                <tr>
                  <th className="p-3.5 px-4">ID Pesanan</th>
                  <th className="p-3.5">Nama Toko Mitra</th>
                  <th className="p-3.5">Jumlah Box</th>
                  <th className="p-3.5">Total Tagihan</th>
                  <th className="p-3.5">No. Resi Ekspedisi</th>
                  <th className="p-3.5">Status Pengiriman</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredLogistics.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-muted-foreground">
                      Tidak ada data pesanan logistik yang sesuai dengan pencarian.
                    </td>
                  </tr>
                ) : (
                  filteredLogistics.map((bo) => (
                    <tr key={bo.id} className="hover:bg-muted/20 transition-colors">
                      <td className="p-3.5 px-4 font-mono font-bold text-foreground">{bo.id}</td>
                      <td className="p-3.5 font-semibold text-foreground">{bo.storeName}</td>
                      <td className="p-3.5 font-bold tabular-nums">{bo.quantityPcs} pcs</td>
                      <td className="p-3.5 font-bold tabular-nums">
                        Rp {bo.totalPrice.toLocaleString("id-ID")}
                      </td>
                      <td className="p-3.5 font-mono text-muted-foreground">
                        {bo.trackingNumber || "RESI-REG-CRB-01"}
                      </td>
                      <td className="p-3.5">
                        <Badge variant="secondary" className="text-[10px] font-bold">
                          {bo.status}
                        </Badge>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
