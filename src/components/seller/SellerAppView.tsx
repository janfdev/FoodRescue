"use client";

import { useState, useEffect } from "react";
import {
  Store,
  SurpriseBag,
  Order,
  RescueBoxPackage,
  RescueBoxOrder,
} from "@/types/domain";
import { storeService } from "@/services/storeService";
import { ChatModal } from "@/components/shared/ChatModal";
import {
  Store as StoreIcon,
  Package,
  QrCode,
  DollarSign,
  Box,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  Truck,
  MessageSquare,
  ShieldCheck,
  Send,
  Search,
  Plus,
  TrendingUp,
  Receipt,
  Wallet,
  Check,
  X,
  ChevronDown,
  Building2,
  Bell,
  SlidersHorizontal,
  ChevronRight,
  Sun,
  Moon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  AreaChart,
  Area,
} from "recharts";

type SellerTab = "pos" | "bags" | "orders" | "boxes" | "finance";

export function SellerAppView() {
  const [activeTab, setActiveTab] = useState<SellerTab>("pos");
  const [storesList, setStoresList] = useState<Store[]>([]);
  const [selectedStoreId, setSelectedStoreId] = useState<string>("store-ruby-bakery");
  const [store, setStore] = useState<Store | null>(null);
  const [surpriseBags, setSurpriseBags] = useState<SurpriseBag[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [boxPackages, setBoxPackages] = useState<RescueBoxPackage[]>([]);
  const [boxOrders, setBoxOrders] = useState<RescueBoxOrder[]>([]);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState("");

  // POS verification state
  const [pickupCodeInput, setPickupCodeInput] = useState("");
  const [verifyResult, setVerifyResult] = useState<{ success: boolean; message: string } | null>(null);

  // Chat modal
  const [activeChatOrder, setActiveChatOrder] = useState<Order | null>(null);

  // Withdrawal modal state
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState<number>(100000);
  const [withdrawSuccess, setWithdrawSuccess] = useState(false);

  // Quick Add Bag Dialog
  const [isAddingBag, setIsAddingBag] = useState(false);
  const [newBagTitle, setNewBagTitle] = useState("");
  const [newBagQuota, setNewBagQuota] = useState(5);
  const [newBagOrigPrice, setNewBagOrigPrice] = useState(60000);
  const [newBagDiscPrice, setNewBagDiscPrice] = useState(25000);

  // B2B Order state
  const [boxOrderSuccess, setBoxOrderSuccess] = useState(false);

  const syncData = () => {
    const state = storeService.getState();
    setStoresList(state.stores.filter((s) => s.status === "ACTIVE"));
    const currentStore = state.stores.find((s) => s.id === selectedStoreId) || state.stores[0];
    setStore(currentStore);
    if (currentStore) {
      setSurpriseBags(state.surpriseBags.filter((b) => b.storeId === currentStore.id));
      setOrders(state.orders.filter((o) => o.storeId === currentStore.id));
      setBoxOrders(state.boxOrders.filter((b) => b.storeId === currentStore.id));
    }
    setBoxPackages(state.boxPackages);
  };

  useEffect(() => {
    syncData();
    const unsub = storeService.subscribe(syncData);
    return unsub;
  }, [selectedStoreId]);

  if (!store) return null;

  // Handle Cashier PIN verification
  const handleVerify = (codeToVerify?: string) => {
    const code = codeToVerify || pickupCodeInput;
    if (!code.trim()) return;

    const res = storeService.verifyPickup(code);
    setVerifyResult(res);
    setPickupCodeInput("");
    syncData();

    setTimeout(() => {
      setVerifyResult(null);
    }, 4500);
  };

  // Handle Quota update
  const handleQuotaChange = (bagId: string, newQuota: number, isActive: boolean) => {
    storeService.updateBagQuota(bagId, newQuota, isActive);
    syncData();
  };

  // Handle B2B Box Buy
  const handleBuyBoxes = (pkg: RescueBoxPackage) => {
    storeService.orderRescueBoxes(store.id, pkg.id, store.address);
    setBoxOrderSuccess(true);
    syncData();
    setTimeout(() => setBoxOrderSuccess(false), 3500);
  };

  // Handle Withdrawal
  const handleWithdrawSubmit = (e: React.FormEvent) => {
    e.preventDefault();
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

  const pendingPickupOrders = orders.filter(
    (o) => o.status === "PAID" || o.status === "READY_FOR_PICKUP"
  );
  const isBoxLow = store.currentBoxStock < 10 || store.boxesSoldTotal % 50 >= 40;

  return (
    <div className="w-full min-h-[calc(100vh-45px)] bg-stone-50/60 dark:bg-zinc-950 flex flex-col md:flex-row font-sans">
      {/* ─── SIDEBAR KIRI DESKTOP (STYLE @bagui/dashboard-store) ────────────────── */}
      <aside className="w-full md:w-64 bg-card border-r border-border shrink-0 p-4 flex flex-col justify-between">
        <div className="space-y-6">
          {/* Store Switcher & Brand Header */}
          <div className="space-y-3">
            <div className="flex items-center gap-3 px-2">
              <div className="size-10 rounded-xl bg-orange-600 text-white flex items-center justify-center font-black text-lg shadow-xs shrink-0">
                <StoreIcon className="size-5" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="font-extrabold text-sm text-foreground block truncate">
                  {store.name}
                </span>
                <span className="text-[10px] font-mono text-muted-foreground uppercase block truncate">
                  {store.area} • Mitra Aktif
                </span>
              </div>
            </div>

            {/* Store Switcher Dropdown */}
            <div className="px-2">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">
                Pilih Mitra Usaha
              </label>
              <select
                value={selectedStoreId}
                onChange={(e) => setSelectedStoreId(e.target.value)}
                className="w-full bg-muted/50 border border-border rounded-lg text-xs font-semibold p-1.5 text-foreground focus:outline-none focus:ring-1 focus:ring-orange-500"
              >
                {storesList.map((st) => (
                  <option key={st.id} value={st.id}>
                    {st.name} ({st.area})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <Separator />

          {/* Navigation Menu */}
          <nav className="space-y-1">
            <button
              type="button"
              onClick={() => setActiveTab("pos")}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-colors ${
                activeTab === "pos"
                  ? "bg-orange-100 text-orange-900 dark:bg-orange-950/80 dark:text-orange-300 shadow-2xs"
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <QrCode className="size-4" />
                <span>Kasir PIN & Pickup</span>
              </div>
              {pendingPickupOrders.length > 0 && (
                <Badge variant="destructive" className="text-[10px] px-1.5 py-0 font-mono">
                  {pendingPickupOrders.length}
                </Badge>
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("bags")}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-colors ${
                activeTab === "bags"
                  ? "bg-orange-100 text-orange-900 dark:bg-orange-950/80 dark:text-orange-300 shadow-2xs"
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Package className="size-4" />
                <span>Katalog Surprise Bag</span>
              </div>
              <span className="text-[10px] text-muted-foreground font-mono">
                {surpriseBags.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("orders")}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-colors ${
                activeTab === "orders"
                  ? "bg-orange-100 text-orange-900 dark:bg-orange-950/80 dark:text-orange-300 shadow-2xs"
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Receipt className="size-4" />
                <span>Riwayat Pesanan</span>
              </div>
              <span className="text-[10px] text-muted-foreground font-mono">
                {orders.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("boxes")}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-colors ${
                activeTab === "boxes"
                  ? "bg-orange-100 text-orange-900 dark:bg-orange-950/80 dark:text-orange-300 shadow-2xs"
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Box className="size-4" />
                <span>Toko Box Resmi B2B</span>
              </div>
              {isBoxLow && (
                <span className="size-2 rounded-full bg-red-500 animate-pulse" />
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("finance")}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-colors ${
                activeTab === "finance"
                  ? "bg-orange-100 text-orange-900 dark:bg-orange-950/80 dark:text-orange-300 shadow-2xs"
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Wallet className="size-4" />
                <span>Saldo & Rekening</span>
              </div>
            </button>
          </nav>
        </div>

        {/* Box Stock Alert at Bottom Sidebar */}
        <div className="pt-4 border-t border-border/80 space-y-2">
          <div className="p-3 bg-muted/40 rounded-xl space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground font-semibold">Stok Rescue Box:</span>
              <strong
                className={`tabular-nums font-black ${
                  store.currentBoxStock < 10 ? "text-red-600" : "text-emerald-600"
                }`}
              >
                {store.currentBoxStock} pcs
              </strong>
            </div>
            <div className="flex items-center justify-between text-[11px] text-muted-foreground">
              <span>Kepatuhan Box:</span>
              <span className="font-bold text-foreground">{store.boxComplianceRate}%</span>
            </div>
          </div>
        </div>
      </aside>

      {/* ─── KONTEN UTAMA DASHBOARD MITRA ────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Header Bar */}
        <header className="h-16 border-b border-border bg-card/70 backdrop-blur-md px-6 flex items-center justify-between gap-4 sticky top-0 z-20">
          <div>
            <h1 className="text-base font-black text-foreground capitalize">
              {activeTab === "pos"
                ? "Kasir POS & Verifikasi PIN"
                : activeTab === "bags"
                ? "Manajemen Kuota Surprise Bag"
                : activeTab === "orders"
                ? "Daftar Transaksi Pesanan"
                : activeTab === "boxes"
                ? "Distribusi Kemasan Resmi Rescue Box"
                : "Saldo & Penarikan Pendapatan"}
            </h1>
            <p className="text-[11px] text-muted-foreground -mt-0.5">
              Portal Operasional Harian Mitra Kuliner Cirebon Raya
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            {activeTab === "bags" && (
              <Button
                size="sm"
                onClick={() => setIsAddingBag(true)}
                className="bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs gap-1.5 shadow-xs"
              >
                <Plus className="size-3.5" />
                <span>Tambah Paket</span>
              </Button>
            )}

            <Button
              size="sm"
              variant="outline"
              onClick={() => setActiveTab("finance")}
              className="font-bold text-xs gap-1.5"
            >
              <Wallet className="size-3.5 text-emerald-600" />
              <span>Rp {store.walletBalance.toLocaleString("id-ID")}</span>
            </Button>
          </div>
        </header>

        {/* 4 Key Stat Cards Row (Inspired by @bagui/dashboard-store) */}
        <div className="p-6 pb-2 grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-border shadow-xs">
            <CardContent className="p-4 space-y-1">
              <div className="flex items-center justify-between text-muted-foreground">
                <span className="text-[11px] font-bold uppercase tracking-wider">Saldo Siap Tarik</span>
                <DollarSign className="size-4 text-emerald-600" />
              </div>
              <p className="text-xl font-black text-foreground tabular-nums">
                Rp {store.walletBalance.toLocaleString("id-ID")}
              </p>
              <p className="text-[10px] text-emerald-600 font-semibold">Net setelah fee platform 12%</p>
            </CardContent>
          </Card>

          <Card className="border-border shadow-xs">
            <CardContent className="p-4 space-y-1">
              <div className="flex items-center justify-between text-muted-foreground">
                <span className="text-[11px] font-bold uppercase tracking-wider">Makanan Terjual</span>
                <TrendingUp className="size-4 text-blue-600" />
              </div>
              <p className="text-xl font-black text-foreground tabular-nums">
                {store.boxesSoldTotal} Porsi
              </p>
              <p className="text-[10px] text-muted-foreground">Surplus berhasil diselamatkan</p>
            </CardContent>
          </Card>

          <Card className="border-border shadow-xs">
            <CardContent className="p-4 space-y-1">
              <div className="flex items-center justify-between text-muted-foreground">
                <span className="text-[11px] font-bold uppercase tracking-wider">Stok Kemasan Box</span>
                <Box className="size-4 text-orange-600" />
              </div>
              <p className="text-xl font-black text-foreground tabular-nums">
                {store.currentBoxStock} Pcs
              </p>
              <p className="text-[10px] text-muted-foreground">Wadah higienis resmi</p>
            </CardContent>
          </Card>

          <Card className="border-border shadow-xs">
            <CardContent className="p-4 space-y-1">
              <div className="flex items-center justify-between text-muted-foreground">
                <span className="text-[11px] font-bold uppercase tracking-wider">Kepatuhan Box</span>
                <ShieldCheck className="size-4 text-purple-600" />
              </div>
              <p className="text-xl font-black text-purple-600 tabular-nums">
                {store.boxComplianceRate}%
              </p>
              <p className="text-[10px] text-muted-foreground">Berdasarkan ulasan pembeli</p>
            </CardContent>
          </Card>
        </div>

        {/* Dynamic Panel Content */}
        <div className="p-6 pt-2 space-y-6">
          {/* 1. TAB POS KASIR */}
          {activeTab === "pos" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Input Verifikasi PIN Cepat */}
              <div className="lg:col-span-5">
                <Card className="border-border shadow-xs">
                  <CardHeader className="p-5 pb-3">
                    <CardTitle className="text-sm font-extrabold flex items-center gap-2">
                      <QrCode className="size-4 text-emerald-600" />
                      <span>Input PIN Verifikasi Kasir</span>
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Minta pembeli menyebutkan 4-digit PIN tiket saat pengambilan barang
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="p-5 pt-0 space-y-4">
                    <div className="flex gap-2">
                      <Input
                        type="text"
                        placeholder="PIN 4-Digit..."
                        value={pickupCodeInput}
                        onChange={(e) => setPickupCodeInput(e.target.value)}
                        className="font-mono text-center tracking-widest text-lg font-bold"
                        maxLength={8}
                      />
                      <Button
                        type="button"
                        onClick={() => handleVerify()}
                        disabled={!pickupCodeInput.trim()}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs"
                      >
                        Verifikasi
                      </Button>
                    </div>

                    {verifyResult && (
                      <div
                        className={`p-3 rounded-xl text-xs font-semibold flex items-start gap-2 ${
                          verifyResult.success
                            ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300"
                            : "bg-red-100 dark:bg-red-950/60 text-red-800 dark:text-red-300 border border-red-300"
                        }`}
                      >
                        {verifyResult.success ? (
                          <CheckCircle2 className="size-4 shrink-0 mt-0.5 text-emerald-600" />
                        ) : (
                          <AlertTriangle className="size-4 shrink-0 mt-0.5 text-red-600" />
                        )}
                        <span>{verifyResult.message}</span>
                      </div>
                    )}

                    <div className="p-3 bg-muted/40 rounded-xl text-xs text-muted-foreground space-y-1">
                      <p className="font-bold text-foreground">Ketentuan Escrow:</p>
                      <p className="text-[11px] leading-relaxed">
                        Dana pembelian ditahan di sistem rekber dan akan langsung masuk ke saldo dompet toko saat PIN berhasil diverifikasi di kasir.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Antrean Pesanan Siap Ambil */}
              <div className="lg:col-span-7">
                <Card className="border-border shadow-xs overflow-hidden">
                  <CardHeader className="p-4 px-5 pb-3 border-b border-border/80 flex flex-row items-center justify-between">
                    <div>
                      <CardTitle className="text-sm font-extrabold">
                        Antrean Pesanan Menunggu Ambil
                      </CardTitle>
                      <CardDescription className="text-xs">
                        Pesanan aktif yang sudah dibayar dan siap diambil hari ini
                      </CardDescription>
                    </div>
                    <Badge variant="secondary" className="font-mono text-xs">
                      {pendingPickupOrders.length} Pesanan
                    </Badge>
                  </CardHeader>

                  <div className="overflow-x-auto">
                    {pendingPickupOrders.length === 0 ? (
                      <div className="p-12 text-center text-xs text-muted-foreground">
                        Tidak ada pesanan menunggu diambil saat ini.
                      </div>
                    ) : (
                      <table className="w-full text-left text-xs">
                        <thead className="bg-muted/40 border-b border-border text-[11px] text-muted-foreground font-bold uppercase">
                          <tr>
                            <th className="p-3 px-4">Pembeli</th>
                            <th className="p-3">Paket</th>
                            <th className="p-3">Earning (Net)</th>
                            <th className="p-3">PIN</th>
                            <th className="p-3 text-right">Aksi Kasir</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border/60">
                          {pendingPickupOrders.map((ord) => (
                            <tr key={ord.id} className="hover:bg-muted/20">
                              <td className="p-3 px-4">
                                <span className="font-bold text-foreground block">{ord.buyerName}</span>
                                <span className="text-[10px] text-muted-foreground font-mono">{ord.id}</span>
                              </td>
                              <td className="p-3">
                                <span className="font-medium text-foreground block">{ord.bagTitle}</span>
                                <span className="text-[10px] text-muted-foreground">Qty: {ord.quantity}</span>
                              </td>
                              <td className="p-3 font-bold tabular-nums text-emerald-600">
                                Rp {ord.sellerEarning.toLocaleString("id-ID")}
                              </td>
                              <td className="p-3 font-mono font-bold text-foreground">
                                {ord.pickupCode}
                              </td>
                              <td className="p-3 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => setActiveChatOrder(ord)}
                                    className="size-8 p-0 text-muted-foreground hover:text-foreground"
                                    title="Buka Chat Pembeli"
                                  >
                                    <MessageSquare className="size-3.5 text-purple-600" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    onClick={() => handleVerify(ord.pickupCode)}
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-7 px-2.5"
                                  >
                                    Validasi
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </Card>
              </div>
            </div>
          )}

          {/* 2. TAB KATALOG SURPRISE BAG */}
          {activeTab === "bags" && (
            <div className="space-y-4">
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
                              <span>{bag.pickupWindow} WIB</span>
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
                                bag.isActive ? "bg-emerald-600 hover:bg-emerald-700" : ""
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
          )}

          {/* 3. TAB RIWAYAT PESANAN & ANALITIK */}
          {activeTab === "orders" && (
            <div className="space-y-6">
              {/* Dua Chart Analitik Toko */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Chart 1: Omzet Harian Toko */}
                <Card className="lg:col-span-7 border-border shadow-xs">
                  <CardHeader className="p-4 px-5 pb-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-sm font-black">
                          Tren Omzet & Pendapatan Bersih (Net)
                        </CardTitle>
                        <CardDescription className="text-xs">
                          Pendapatan toko 7 hari terakhir setelah potongan fee 12%
                        </CardDescription>
                      </div>
                      <Badge variant="outline" className="text-[10px] font-mono border-orange-500/40 text-orange-700">
                        Minggu Ini
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 pt-2">
                    <div className="h-56 w-full text-xs">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                          data={[
                            { day: "Sen", net: 180000 },
                            { day: "Sel", net: 220000 },
                            { day: "Rab", net: 310000 },
                            { day: "Kam", net: 290000 },
                            { day: "Jum", net: 450000 },
                            { day: "Sab", net: 580000 },
                            { day: "Min", net: 490000 },
                          ]}
                          margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
                        >
                          <defs>
                            <linearGradient id="colorNet" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#ea580c" stopOpacity={0.3} />
                              <stop offset="95%" stopColor="#ea580c" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                          <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                          <YAxis tick={{ fontSize: 10 }} />
                          <RechartsTooltip
                            formatter={(value: any) => [
                              `Rp ${Number(value).toLocaleString("id-ID")}`,
                              "Net Earning",
                            ]}
                            contentStyle={{
                              backgroundColor: "var(--card)",
                              borderColor: "var(--border)",
                              borderRadius: "0.75rem",
                              fontSize: "12px",
                            }}
                          />
                          <Area
                            type="monotone"
                            dataKey="net"
                            stroke="#ea580c"
                            strokeWidth={2}
                            fillOpacity={1}
                            fill="url(#colorNet)"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                {/* Chart 2: Distribusi Jam Sibuk Pengambilan */}
                <Card className="lg:col-span-5 border-border shadow-xs">
                  <CardHeader className="p-4 px-5 pb-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-sm font-black">
                          Jam Sibuk Pengambilan (Pickup)
                        </CardTitle>
                        <CardDescription className="text-xs">
                          Frekuensi penjemputan paket oleh pembeli
                        </CardDescription>
                      </div>
                      <Badge variant="outline" className="text-[10px] font-mono border-blue-500/40 text-blue-700">
                        WIB
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 pt-2">
                    <div className="h-56 w-full text-xs">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={[
                            { jam: "17:00", porsi: 3 },
                            { jam: "18:00", porsi: 8 },
                            { jam: "19:00", porsi: 19 },
                            { jam: "20:00", porsi: 26 },
                            { jam: "21:00", porsi: 12 },
                          ]}
                          margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                          <XAxis dataKey="jam" tick={{ fontSize: 11 }} />
                          <YAxis tick={{ fontSize: 10 }} />
                          <RechartsTooltip
                            formatter={(value: any) => [`${value} Porsi`, "Porsi Diambil"]}
                            contentStyle={{
                              backgroundColor: "var(--card)",
                              borderColor: "var(--border)",
                              borderRadius: "0.75rem",
                              fontSize: "12px",
                            }}
                          />
                          <Bar
                            dataKey="porsi"
                            fill="#0284c7"
                            radius={[6, 6, 0, 0]}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Tabel Pesanan */}
              <Card className="border-border shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-muted/40 border-b border-border text-[11px] text-muted-foreground font-bold uppercase">
                      <tr>
                        <th className="p-3.5 px-4">ID Pesanan</th>
                        <th className="p-3.5">Nama Pembeli</th>
                        <th className="p-3.5">Paket Makanan</th>
                        <th className="p-3.5">Net Diterima</th>
                        <th className="p-3.5">Status Transaksi</th>
                        <th className="p-3.5 text-right">Komunikasi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60">
                      {orders.map((ord) => (
                        <tr key={ord.id} className="hover:bg-muted/20">
                          <td className="p-3.5 px-4 font-mono font-bold text-foreground">{ord.id}</td>
                          <td className="p-3.5 font-semibold text-foreground">{ord.buyerName}</td>
                          <td className="p-3.5 text-foreground">{ord.bagTitle}</td>
                          <td className="p-3.5 font-black text-emerald-600 tabular-nums">
                            Rp {ord.sellerEarning.toLocaleString("id-ID")}
                          </td>
                          <td className="p-3.5">
                            <Badge
                              variant={ord.status === "COMPLETED" ? "default" : "secondary"}
                              className={`text-[10px] font-bold ${
                                ord.status === "COMPLETED" ? "bg-emerald-600" : ""
                              }`}
                            >
                              {ord.status === "COMPLETED" ? "Selesai (Dana Masuk)" : "Menunggu Ambil"}
                            </Badge>
                          </td>
                          <td className="p-3.5 text-right">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setActiveChatOrder(ord)}
                              className="text-xs font-semibold gap-1 text-purple-600"
                            >
                              <MessageSquare className="size-3.5" />
                              <span>Chat</span>
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          )}

          {/* 4. TAB TOKO BOX RESMI B2B */}
          {activeTab === "boxes" && (
            <div className="space-y-6">
              {boxOrderSuccess && (
                <div className="p-3 bg-emerald-100 dark:bg-emerald-950/70 border border-emerald-300 dark:border-emerald-800 rounded-xl text-xs font-semibold text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                  <CheckCircle2 className="size-4 shrink-0 text-emerald-600" />
                  <span>Pesanan Rescue Box berhasil diproses! Stok kemasan Anda telah diperbarui.</span>
                </div>
              )}

              {/* Grid Paket Box */}
              <div>
                <h3 className="font-extrabold text-sm text-foreground mb-3">
                  Pesan Paket Kemasan Rescue Box Resmi
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
                          Wadah ramah lingkungan berlogo SisaRasa & segel higienitas
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
          )}

          {/* 5. TAB SALDO & REKENING (FINANCE) */}
          {activeTab === "finance" && (
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
                        Dana hasil pesanan fisik yang telah divalidasi kasir.
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
          )}
        </div>
      </main>

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

      {/* Chat Modal */}
      {activeChatOrder && (
        <ChatModal
          order={activeChatOrder}
          onClose={() => setActiveChatOrder(null)}
        />
      )}
    </div>
  );
}
