"use client";

import { useState, useEffect } from "react";
import { Store, Order, RescueBoxOrder, WithdrawalRequest, Review } from "@/types/domain";
import { storeService } from "@/services/storeService";
import { ChatModal } from "@/components/shared/ChatModal";
import {
  Shield,
  TrendingUp,
  Store as StoreIcon,
  Box,
  CreditCard,
  MessageSquare,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Sparkles,
  Truck,
  Leaf
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export function SuperAdminAppView() {
  const [activeTab, setActiveTab] = useState<"overview" | "stores" | "boxes" | "withdrawals" | "audit">("overview");

  const [stores, setStores] = useState<Store[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [boxOrders, setBoxOrders] = useState<RescueBoxOrder[]>([]);
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [metrics, setMetrics] = useState(storeService.getImpactMetrics());

  // Chat inspection modal for dispute resolution
  const [inspectedChatOrder, setInspectedChatOrder] = useState<Order | null>(null);

  const syncData = () => {
    const state = storeService.getState();
    setStores(state.stores);
    setOrders(state.orders);
    setBoxOrders(state.boxOrders);
    setWithdrawals(state.withdrawals);
    setReviews(state.reviews);
    setMetrics(storeService.getImpactMetrics());
  };

  useEffect(() => {
    syncData();
    const unsub = storeService.subscribe(syncData);
    return unsub;
  }, []);

  const handleApproveStore = (storeId: string) => {
    storeService.updateStoreStatus(storeId, "ACTIVE");
    syncData();
  };

  const handleSuspendStore = (storeId: string) => {
    storeService.updateStoreStatus(storeId, "SUSPENDED");
    syncData();
  };

  const handleApproveWithdrawal = (wdId: string) => {
    storeService.approveWithdrawal(wdId);
    syncData();
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Admin Title & Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Shield className="size-6 text-purple-600" />
            <h1 className="font-black text-xl text-foreground tracking-tight">
              Pusat Kendali Super Admin SisaRasa
            </h1>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Wilayah Operasional: Cirebon Raya (Kota & Kabupaten)
          </p>
        </div>

        {/* Tab Switcher with shadcn Tabs */}
        <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-xl border border-border overflow-x-auto">
          <Button
            type="button"
            variant={activeTab === "overview" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("overview")}
            className="text-xs font-bold"
          >
            Ikhtisar & Dampak
          </Button>
          <Button
            type="button"
            variant={activeTab === "stores" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("stores")}
            className="text-xs font-bold gap-1.5"
          >
            <span>Mitra Toko</span>
            {stores.filter((s) => s.status === "PENDING_APPROVAL").length > 0 && (
              <Badge variant="destructive" className="text-[10px] px-1.5 py-0">
                {stores.filter((s) => s.status === "PENDING_APPROVAL").length}
              </Badge>
            )}
          </Button>
          <Button
            type="button"
            variant={activeTab === "boxes" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("boxes")}
            className="text-xs font-bold"
          >
            Logistik Rescue Box
          </Button>
          <Button
            type="button"
            variant={activeTab === "withdrawals" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("withdrawals")}
            className="text-xs font-bold gap-1.5"
          >
            <span>Pencairan Dana</span>
            {withdrawals.filter((w) => w.status === "PENDING").length > 0 && (
              <Badge variant="destructive" className="text-[10px] px-1.5 py-0">
                {withdrawals.filter((w) => w.status === "PENDING").length}
              </Badge>
            )}
          </Button>
          <Button
            type="button"
            variant={activeTab === "audit" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("audit")}
            className="text-xs font-bold"
          >
            Audit Kepatuhan & Sengketa
          </Button>
        </div>
      </div>

      {/* Tab: Overview & Impact Metrics */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* 4 Key Metric Cards with shadcn Card */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="border-border shadow-xs">
              <CardContent className="p-4 space-y-1">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span className="text-xs font-bold uppercase tracking-wider">
                    Makanan Diselamatkan
                  </span>
                  <Leaf className="size-4 text-emerald-600" />
                </div>
                <p className="text-2xl font-black text-foreground tabular-nums">
                  {metrics.totalMealsSaved} Porsi
                </p>
                <p className="text-[11px] text-emerald-600 font-medium">
                  ±{metrics.estimatedKgSaved} kg limbah organik dicegah
                </p>
              </CardContent>
            </Card>

            <Card className="border-border shadow-xs">
              <CardContent className="p-4 space-y-1">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span className="text-xs font-bold uppercase tracking-wider">
                    GMV Transaksi Makanan
                  </span>
                  <TrendingUp className="size-4 text-blue-600" />
                </div>
                <p className="text-2xl font-black text-foreground tabular-nums">
                  Rp {metrics.gmv.toLocaleString("id-ID")}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  Perputaran nilai surplus resto
                </p>
              </CardContent>
            </Card>

            <Card className="border-border shadow-xs">
              <CardContent className="p-4 space-y-1">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span className="text-xs font-bold uppercase tracking-wider">
                    Take-Rate Platform (12%)
                  </span>
                  <CreditCard className="size-4 text-purple-600" />
                </div>
                <p className="text-2xl font-black text-purple-600 tabular-nums">
                  Rp {metrics.platformRevenue.toLocaleString("id-ID")}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  Komisi transaksi diselesaikan
                </p>
              </CardContent>
            </Card>

            <Card className="border-border shadow-xs">
              <CardContent className="p-4 space-y-1">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span className="text-xs font-bold uppercase tracking-wider">
                    Rescue Box B2B Terjual
                  </span>
                  <Box className="size-4 text-orange-600" />
                </div>
                <p className="text-2xl font-black text-orange-600 tabular-nums">
                  {metrics.totalBoxesSold} Pcs
                </p>
                <p className="text-[11px] text-muted-foreground">
                  Kemasan resmi berlogo tersalurkan
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Summary of Active vs Pending Stores */}
          <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
            <h3 className="font-extrabold text-sm text-foreground">
              Status Mitra Kuliner Cirebon Raya
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {stores.map((s) => (
                <div
                  key={s.id}
                  className="bg-muted/30 border border-border/80 rounded-xl p-3.5 space-y-2 text-xs"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-foreground">{s.name}</h4>
                      <p className="text-[11px] text-muted-foreground">{s.area}</p>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        s.status === "ACTIVE"
                          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                          : s.status === "PENDING_APPROVAL"
                          ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                          : "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300"
                      }`}
                    >
                      {s.status}
                    </span>
                  </div>

                  <div className="flex justify-between text-[11px] pt-1 border-t border-border/40">
                    <span className="text-muted-foreground">Kepatuhan Box Resmi:</span>
                    <strong className="text-emerald-600 tabular-nums">{s.boxComplianceRate}%</strong>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab: Mitra Store Approval & Moderation */}
      {activeTab === "stores" && (
        <div className="space-y-4">
          <h3 className="font-extrabold text-sm text-foreground">
            Verifikasi & Moderasi Mitra Kuliner
          </h3>

          <div className="space-y-3">
            {stores.map((st) => (
              <div
                key={st.id}
                className="bg-card border border-border rounded-2xl p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-sm text-foreground">{st.name}</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        st.status === "ACTIVE"
                          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                          : st.status === "PENDING_APPROVAL"
                          ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                          : "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300"
                      }`}
                    >
                      {st.status}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {st.address} • Pemilik: {st.kycDetails?.ownerName || "Mitra Terdaftar"}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    Jam Pickup: {st.pickupStartTime} - {st.pickupEndTime} WIB • Stok Kemasan:{" "}
                    <strong className="text-foreground tabular-nums">{st.currentBoxStock} pcs</strong>
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {st.status === "PENDING_APPROVAL" && (
                    <Button
                      size="sm"
                      onClick={() => handleApproveStore(st.id)}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs gap-1"
                    >
                      <CheckCircle2 className="size-3.5" />
                      <span>Setujui Kemitraan (Approve)</span>
                    </Button>
                  )}

                  {st.status === "ACTIVE" && (
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleSuspendStore(st.id)}
                      className="text-xs font-bold shadow-xs gap-1"
                    >
                      <XCircle className="size-3.5" />
                      <span>Bekukan (Suspend)</span>
                    </Button>
                  )}

                  {st.status === "SUSPENDED" && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleApproveStore(st.id)}
                      className="text-xs font-bold"
                    >
                      Pulihkan Mitra
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: B2B Rescue Box Logistics */}
      {activeTab === "boxes" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-sm text-foreground">
              Manajemen Distribusi Kemasan Resmi Rescue Box B2B
            </h3>
            <span className="text-xs text-muted-foreground">
              Gudang Logistik Cirebon Hub
            </span>
          </div>

          <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-muted/50 border-b border-border text-[11px] text-muted-foreground font-bold uppercase tracking-wider">
                  <tr>
                    <th className="p-3.5 px-4">ID Pesanan</th>
                    <th className="p-3.5">Nama Mitra Toko</th>
                    <th className="p-3.5">Jumlah Box</th>
                    <th className="p-3.5">Total Tagihan</th>
                    <th className="p-3.5">No. Resi SiCepat</th>
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
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                          {bo.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Pencairan Dana (Withdrawals) */}
      {activeTab === "withdrawals" && (
        <div className="space-y-4">
          <h3 className="font-extrabold text-sm text-foreground">
            Persetujuan Penarikan Dana (Withdrawal) Mitra
          </h3>

          <div className="space-y-3">
            {withdrawals.length === 0 ? (
              <div className="p-6 text-center bg-muted/30 border border-dashed border-border rounded-2xl text-xs text-muted-foreground">
                Tidak ada permintaan penarikan dana pending.
              </div>
            ) : (
              withdrawals.map((w) => (
                <div
                  key={w.id}
                  className="bg-card border border-border rounded-2xl p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-sm text-foreground">{w.storeName}</span>
                      <span className="text-xs font-mono text-muted-foreground">({w.id})</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          w.status === "APPROVED"
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                            : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                        }`}
                      >
                        {w.status}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Rekening: {w.bankName} • {w.accountNumber} a/n {w.accountHolder}
                    </p>
                    <p className="text-base font-black text-emerald-600 tabular-nums">
                      Rp {w.amount.toLocaleString("id-ID")}
                    </p>
                  </div>

                  <div>
                    {w.status === "PENDING" ? (
                      <button
                        type="button"
                        onClick={() => handleApproveWithdrawal(w.id)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors shadow-xs"
                      >
                        Transfer & Setujui (Approve)
                      </button>
                    ) : (
                      <span className="text-xs text-muted-foreground font-semibold flex items-center gap-1.5">
                        <CheckCircle2 className="size-4 text-emerald-600" />
                        Telah Ditransfer
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Tab: Audit Log & Dispute */}
      {activeTab === "audit" && (
        <div className="space-y-6">
          {/* Dispute Orders & Chat Inspection */}
          <div className="space-y-3">
            <h3 className="font-extrabold text-sm text-foreground">
              Audit Riwayat Chat Transaksi (Sengketa & Koordinasi)
            </h3>
            <p className="text-xs text-muted-foreground">
              Super Admin berwenang menginspeksi ruang chat pesanan untuk menyelesaikan komplain ketidakhadiran atau keterlambatan pickup.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {orders.map((ord) => (
                <div
                  key={ord.id}
                  className="bg-card border border-border rounded-2xl p-3.5 text-xs space-y-2 shadow-2xs"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-extrabold text-foreground">{ord.id}</span>
                      <p className="text-muted-foreground text-[11px] mt-0.5">
                        {ord.buyerName} ↔ {ord.storeName}
                      </p>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                      {ord.status}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setInspectedChatOrder(ord)}
                    className="w-full bg-muted hover:bg-muted/80 text-foreground font-bold text-xs py-2 rounded-xl flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <MessageSquare className="size-3.5 text-purple-600" />
                    <span>Inspeksi Log Chat Pesanan</span>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Audit Kepatuhan Kemasan dari Ulasan Pembeli */}
          <div className="space-y-3 pt-4 border-t border-border">
            <h3 className="font-extrabold text-sm text-foreground">
              Hasil Validasi Kepatuhan Rescue Box oleh Pembeli
            </h3>
            <div className="space-y-2">
              {reviews.map((rev) => (
                <div
                  key={rev.id}
                  className="bg-card border border-border rounded-xl p-3 text-xs flex items-center justify-between gap-3"
                >
                  <div>
                    <span className="font-bold text-foreground">{rev.buyerName}</span>
                    <p className="text-[11px] text-muted-foreground italic mt-0.5">
                      &quot;{rev.comment}&quot;
                    </p>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-1 rounded-lg shrink-0 ${
                      rev.usedOfficialRescueBox
                        ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                        : "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300"
                    }`}
                  >
                    {rev.usedOfficialRescueBox ? "✓ Box Resmi Terpasang" : "✗ Tidak Pakai Box Resmi"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Chat Inspector Modal */}
      {inspectedChatOrder && (
        <ChatModal
          order={inspectedChatOrder}
          onClose={() => setInspectedChatOrder(null)}
        />
      )}
    </div>
  );
}
