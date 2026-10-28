"use client";

import { useState, useEffect } from "react";
import { Store, SurpriseBag, Order, RescueBoxPackage, RescueBoxOrder } from "@/types/domain";
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
  Send
} from "lucide-react";

export function SellerAppView() {
  const [activeTab, setActiveTab] = useState<"pos" | "bags" | "boxes" | "finance">("pos");
  const [store, setStore] = useState<Store | null>(null);
  const [surpriseBags, setSurpriseBags] = useState<SurpriseBag[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [boxPackages, setBoxPackages] = useState<RescueBoxPackage[]>([]);
  const [boxOrders, setBoxOrders] = useState<RescueBoxOrder[]>([]);

  // POS verification state
  const [pickupCodeInput, setPickupCodeInput] = useState("");
  const [verifyResult, setVerifyResult] = useState<{ success: boolean; message: string } | null>(null);

  // Chat modal
  const [activeChatOrder, setActiveChatOrder] = useState<Order | null>(null);

  // Withdrawal modal state
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState<number>(100000);
  const [withdrawSuccess, setWithdrawSuccess] = useState(false);

  // B2B Order state
  const [selectedBoxPkg, setSelectedBoxPkg] = useState<RescueBoxPackage | null>(null);
  const [boxOrderSuccess, setBoxOrderSuccess] = useState(false);

  const syncData = () => {
    const state = storeService.getState();
    const myStore = state.stores.find((s) => s.id === "store-ruby-bakery") || state.stores[0];
    setStore(myStore);
    setSurpriseBags(state.surpriseBags.filter((b) => b.storeId === myStore.id));
    setOrders(state.orders.filter((o) => o.storeId === myStore.id));
    setBoxPackages(state.boxPackages);
    setBoxOrders(state.boxOrders.filter((b) => b.storeId === myStore.id));
  };

  useEffect(() => {
    syncData();
    const unsub = storeService.subscribe(syncData);
    return unsub;
  }, []);

  if (!store) return null;

  // Handle Cashier PIN/QR verification
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
    setSelectedBoxPkg(null);
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

  const pendingPickupOrders = orders.filter((o) => o.status === "PAID" || o.status === "READY_FOR_PICKUP");
  const isBoxLow = store.currentBoxStock < 10 || store.boxesSoldTotal % 50 >= 40;

  return (
    <div className="w-full max-w-md mx-auto bg-background min-h-screen border-x border-border flex flex-col shadow-xl relative pb-20">
      {/* Store Header Bar */}
      <div className="p-3.5 px-4 bg-card border-b border-border flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="size-9 rounded-xl bg-orange-500/10 text-orange-600 flex items-center justify-center font-bold shrink-0">
            <StoreIcon className="size-5" />
          </div>
          <div className="min-w-0">
            <h2 className="text-xs font-black text-foreground truncate">{store.name}</h2>
            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground mt-0.5">
              <span>{store.area}</span>
              <span>•</span>
              <span className="text-emerald-600 font-bold">Kepatuhan Box {store.boxComplianceRate}%</span>
            </div>
          </div>
        </div>

        <div className="text-right shrink-0">
          <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider block">
            Stok Box
          </span>
          <span
            className={`text-xs font-black tabular-nums px-2 py-0.5 rounded-full ${
              store.currentBoxStock < 10
                ? "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300"
                : "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
            }`}
          >
            {store.currentBoxStock} pcs
          </span>
        </div>
      </div>

      {/* Auto-Reminder Banner if Box is low */}
      {isBoxLow && (
        <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2 flex items-center justify-between gap-2 text-xs text-amber-800 dark:text-amber-300">
          <div className="flex items-center gap-1.5 min-w-0">
            <AlertTriangle className="size-4 shrink-0 text-amber-600" />
            <span className="text-[11px] font-medium truncate">
              Stok Rescue Box menipis ({store.currentBoxStock} pcs). Re-order sekarang!
            </span>
          </div>
          <button
            type="button"
            onClick={() => setActiveTab("boxes")}
            className="text-[10px] font-bold bg-amber-600 text-white px-2 py-1 rounded-md shrink-0 hover:bg-amber-700"
          >
            Beli Box
          </button>
        </div>
      )}

      {/* Main Tab Views */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Tab POS Kasir (Scan QR / Input PIN) */}
        {activeTab === "pos" && (
          <div className="space-y-4">
            <div className="bg-card border border-border rounded-2xl p-4 shadow-xs space-y-3">
              <div className="flex items-center gap-2">
                <QrCode className="size-5 text-emerald-600" />
                <div>
                  <h3 className="font-extrabold text-sm text-foreground">
                    Verifikasi Pengambilan Kasir
                  </h3>
                  <p className="text-[11px] text-muted-foreground">
                    Masukkan PIN 4-Digit pembeli atau scan QR untuk cairkan dana Escrow
                  </p>
                </div>
              </div>

              {/* Input Form */}
              <div className="flex gap-2 pt-1">
                <input
                  type="text"
                  placeholder="Masukkan 4-Digit PIN..."
                  value={pickupCodeInput}
                  onChange={(e) => setPickupCodeInput(e.target.value)}
                  className="flex-1 bg-background border border-border rounded-xl px-3.5 py-2.5 text-sm font-mono tracking-widest text-center text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  maxLength={10}
                />
                <button
                  type="button"
                  onClick={() => handleVerify()}
                  disabled={!pickupCodeInput.trim()}
                  className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white px-4 py-2.5 rounded-xl font-bold text-xs shadow-xs transition-colors"
                >
                  Verifikasi
                </button>
              </div>

              {/* Result Notice */}
              {verifyResult && (
                <div
                  className={`p-3 rounded-xl text-xs font-semibold flex items-start gap-2 animate-in fade-in ${
                    verifyResult.success
                      ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800"
                      : "bg-red-100 dark:bg-red-950/60 text-red-800 dark:text-red-300 border border-red-300 dark:border-red-800"
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
            </div>

            {/* Antrean Pesanan Menunggu Ambil */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-extrabold text-foreground">
                  Menunggu Pengambilan ({pendingPickupOrders.length})
                </span>
                <span className="text-[11px] text-muted-foreground">Klik untuk tes instan</span>
              </div>

              {pendingPickupOrders.length === 0 ? (
                <div className="p-6 text-center bg-muted/30 border border-dashed border-border rounded-2xl">
                  <p className="text-xs font-semibold text-muted-foreground">
                    Tidak ada pesanan menunggu diambil saat ini.
                  </p>
                </div>
              ) : (
                pendingPickupOrders.map((ord) => (
                  <div
                    key={ord.id}
                    className="bg-card border border-border rounded-2xl p-3.5 shadow-2xs space-y-2.5"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-extrabold text-foreground">{ord.buyerName}</span>
                          <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded-md font-mono text-muted-foreground">
                            {ord.id}
                          </span>
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-0.5">{ord.bagTitle}</p>
                      </div>

                      <div className="text-right">
                        <span className="text-xs font-black text-emerald-600 tabular-nums">
                          Rp {ord.sellerEarning.toLocaleString("id-ID")}
                        </span>
                        <span className="block text-[10px] text-muted-foreground">
                          Potongan fee 12%
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-border/50 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-muted-foreground">
                          PIN: <strong className="font-mono text-foreground">{ord.pickupCode}</strong>
                        </span>
                        <button
                          type="button"
                          onClick={() => setActiveChatOrder(ord)}
                          className="p-1 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground"
                          title="Chat Buyer"
                        >
                          <MessageSquare className="size-3.5" />
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleVerify(ord.pickupCode)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold px-3 py-1.5 rounded-xl transition-colors shadow-2xs"
                      >
                        Validasi Pengambilan
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Tab Manajemen Kuota Surprise Bag */}
        {activeTab === "bags" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs">
              <h3 className="font-extrabold text-foreground">Atur Kuota Surplus Harian</h3>
              <span className="text-[11px] text-muted-foreground">Update langsung aktif</span>
            </div>

            {surpriseBags.map((bag) => (
              <div
                key={bag.id}
                className="bg-card border border-border rounded-2xl p-4 shadow-xs space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">
                      {bag.category}
                    </span>
                    <h4 className="font-extrabold text-sm text-foreground mt-0.5">
                      {bag.title}
                    </h4>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      Jam Ambil: {bag.pickupWindow}
                    </p>
                  </div>

                  {/* Toggle Active Switch */}
                  <button
                    type="button"
                    onClick={() => handleQuotaChange(bag.id, bag.quotaRemaining, !bag.isActive)}
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition-all ${
                      bag.isActive
                        ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {bag.isActive ? "Aktif Dijual" : "Nonaktif"}
                  </button>
                </div>

                {/* Quota Counter Stepper */}
                <div className="bg-muted/40 p-3 rounded-xl flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-foreground">Sisa Kuota Hari Ini</p>
                    <p className="text-[10px] text-muted-foreground">
                      Berdasarkan surplus roti layak konsumsi
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        handleQuotaChange(bag.id, Math.max(0, bag.quotaRemaining - 1), bag.isActive)
                      }
                      className="size-7 rounded-lg bg-card border border-border flex items-center justify-center font-bold text-sm hover:bg-muted"
                    >
                      -
                    </button>
                    <span className="text-base font-black tabular-nums w-7 text-center">
                      {bag.quotaRemaining}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        handleQuotaChange(bag.id, bag.quotaRemaining + 1, bag.isActive)
                      }
                      className="size-7 rounded-lg bg-card border border-border flex items-center justify-center font-bold text-sm hover:bg-muted"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="text-muted-foreground">Harga Jual Diskon:</span>
                  <span className="font-extrabold text-foreground tabular-nums">
                    Rp {bag.discountedPrice.toLocaleString("id-ID")}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab Toko Suplai B2B Rescue Box */}
        {activeTab === "boxes" && (
          <div className="space-y-4">
            <div className="bg-card border border-border rounded-2xl p-4 shadow-xs space-y-2">
              <div className="flex items-center gap-2">
                <Box className="size-5 text-orange-500" />
                <div>
                  <h3 className="font-extrabold text-sm text-foreground">
                    Toko Suplai B2B Rescue Box
                  </h3>
                  <p className="text-[11px] text-muted-foreground">
                    Kemasan ramah lingkungan resmi berlogo SisaRasa untuk menjaga higienitas
                  </p>
                </div>
              </div>

              <div className="bg-muted/40 p-2.5 rounded-xl flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Stok Fisik Tersedia:</span>
                <span className="font-black text-foreground tabular-nums">
                  {store.currentBoxStock} pcs
                </span>
              </div>
            </div>

            {boxOrderSuccess && (
              <div className="p-3 bg-emerald-100 dark:bg-emerald-950/70 border border-emerald-300 dark:border-emerald-800 rounded-xl text-xs font-semibold text-emerald-800 dark:text-emerald-300 flex items-center gap-2 animate-in fade-in">
                <CheckCircle2 className="size-4 shrink-0 text-emerald-600" />
                <span>Pesanan Rescue Box berhasil dikirim ke alamat toko! Stok box bertambah.</span>
              </div>
            )}

            {/* Pilihan Paket Box */}
            <div className="space-y-2.5">
              <h4 className="font-bold text-xs text-foreground">Pilihan Paket Box Resmi</h4>
              {boxPackages.map((pkg) => (
                <div
                  key={pkg.id}
                  className="bg-card border border-border rounded-2xl p-3.5 shadow-2xs flex items-center justify-between gap-3 hover:border-orange-500/50 transition-colors"
                >
                  <div>
                    <span className="font-extrabold text-xs text-foreground">{pkg.name}</span>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      {pkg.quantityPcs} pcs kemasan food-grade
                    </p>
                    <span className="text-xs font-black text-orange-600 tabular-nums mt-1 block">
                      Rp {pkg.price.toLocaleString("id-ID")}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleBuyBoxes(pkg)}
                    className="bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold px-3 py-2 rounded-xl transition-colors shadow-2xs shrink-0"
                  >
                    Beli Paket
                  </button>
                </div>
              ))}
            </div>

            {/* Riwayat Pengiriman Box */}
            <div className="space-y-2 pt-2">
              <h4 className="font-bold text-xs text-foreground">Riwayat Kiriman Box B2B</h4>
              {boxOrders.map((bo) => (
                <div
                  key={bo.id}
                  className="bg-card border border-border rounded-xl p-3 text-xs space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-foreground">{bo.quantityPcs} Pcs Kemasan</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                      {bo.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                    <Truck className="size-3.5 text-primary shrink-0" />
                    <span className="font-mono text-foreground">{bo.trackingNumber}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab Keuangan & Withdrawal */}
        {activeTab === "finance" && (
          <div className="space-y-4">
            {/* Saldo Dompet */}
            <div className="bg-gradient-to-br from-emerald-700 to-teal-900 text-white p-5 rounded-2xl space-y-3">
              <div>
                <span className="text-[10px] text-white/80 font-bold uppercase tracking-wider">
                  Saldo Siap Tarik (Net)
                </span>
                <p className="text-2xl font-black mt-0.5 tabular-nums">
                  Rp {store.walletBalance.toLocaleString("id-ID")}
                </p>
                <p className="text-[11px] text-white/80 mt-1">
                  Sudah dipotong komisi platform 12% secara otomatis.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsWithdrawing(true)}
                disabled={store.walletBalance < 50000}
                className="w-full bg-white text-emerald-900 font-extrabold text-xs py-2.5 rounded-xl shadow-xs hover:bg-white/90 disabled:opacity-50 transition-colors"
              >
                Tarik Dana ke Rekening ({store.bankAccount?.bankName} {store.bankAccount?.accountNumber})
              </button>
            </div>

            {withdrawSuccess && (
              <div className="p-3 bg-emerald-100 dark:bg-emerald-950/70 border border-emerald-300 dark:border-emerald-800 rounded-xl text-xs font-semibold text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="size-4 shrink-0 text-emerald-600" />
                <span>Pengajuan penarikan dana berhasil diteruskan ke Super Admin.</span>
              </div>
            )}

            {/* Metrik Finansial */}
            <div className="bg-card border border-border rounded-2xl p-4 space-y-3 text-xs">
              <h4 className="font-bold text-foreground">Ringkasan Penjualan</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Porsi Terjual</span>
                  <span className="font-bold text-foreground tabular-nums">
                    {store.boxesSoldTotal} porsi
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Persentase Kepatuhan Kemasan</span>
                  <span className="font-bold text-emerald-600 tabular-nums">
                    {store.boxComplianceRate}%
                  </span>
                </div>
                <div className="flex justify-between border-t border-border pt-2">
                  <span className="text-muted-foreground">Status Rekening</span>
                  <span className="font-medium text-foreground">
                    {store.bankAccount?.bankName} - {store.bankAccount?.accountHolder}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal Withdrawal Form */}
      {isWithdrawing && (
        <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card border border-border w-full max-w-sm rounded-3xl p-5 space-y-4 shadow-2xl">
            <h3 className="font-extrabold text-sm text-foreground">Tarik Saldo Pendapatan</h3>
            <form onSubmit={handleWithdrawSubmit} className="space-y-3 text-xs">
              <div>
                <label className="text-[11px] font-bold text-muted-foreground">Jumlah Penarikan (Rp)</label>
                <input
                  type="number"
                  min={50000}
                  max={store.walletBalance}
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(Number(e.target.value))}
                  className="w-full bg-background border border-border rounded-xl p-2.5 mt-1 font-bold tabular-nums text-foreground focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
                <p className="text-[10px] text-muted-foreground mt-1">
                  Maksimal saldo: Rp {store.walletBalance.toLocaleString("id-ID")}
                </p>
              </div>

              <div className="bg-muted/40 p-3 rounded-xl text-[11px] space-y-1">
                <p className="font-bold text-foreground">Tujuan Transfer:</p>
                <p className="text-muted-foreground">
                  {store.bankAccount?.bankName} • {store.bankAccount?.accountNumber} a/n {store.bankAccount?.accountHolder}
                </p>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsWithdrawing(false)}
                  className="flex-1 bg-muted hover:bg-muted/80 text-foreground py-2.5 rounded-xl font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-xl font-bold"
                >
                  Kirim Pengajuan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Chat Modal */}
      {activeChatOrder && (
        <ChatModal
          order={activeChatOrder}
          onClose={() => setActiveChatOrder(null)}
        />
      )}

      {/* Seller Bottom Navigation */}
      <nav className="absolute bottom-0 left-0 right-0 bg-card/95 backdrop-blur-md border-t border-border flex items-center justify-around py-2 px-3 z-30">
        <button
          type="button"
          onClick={() => setActiveTab("pos")}
          className={`flex flex-col items-center gap-1 text-[10px] font-semibold transition-colors ${
            activeTab === "pos" ? "text-orange-600 font-bold" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <QrCode className="size-5" />
          <span>Kasir PIN</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("bags")}
          className={`flex flex-col items-center gap-1 text-[10px] font-semibold transition-colors ${
            activeTab === "bags" ? "text-orange-600 font-bold" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Package className="size-5" />
          <span>Kuota Harian</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("boxes")}
          className={`flex flex-col items-center gap-1 text-[10px] font-semibold transition-colors relative ${
            activeTab === "boxes" ? "text-orange-600 font-bold" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Box className="size-5" />
          <span>Toko Box B2B</span>
          {isBoxLow && (
            <span className="size-2 rounded-full bg-red-500 absolute top-0 right-2" />
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("finance")}
          className={`flex flex-col items-center gap-1 text-[10px] font-semibold transition-colors ${
            activeTab === "finance" ? "text-orange-600 font-bold" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <DollarSign className="size-5" />
          <span>Keuangan</span>
        </button>
      </nav>
    </div>
  );
}
