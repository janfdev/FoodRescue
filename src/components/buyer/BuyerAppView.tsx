"use client";

import { useState, useEffect } from "react";
import { Store, SurpriseBag, Order, StoreCategory } from "@/types/domain";
import { storeService } from "@/services/storeService";
import { BuyerPickupTicketModal } from "./BuyerPickupTicketModal";
import { BuyerReviewModal } from "./BuyerReviewModal";
import { ChatModal } from "@/components/shared/ChatModal";
import { useHorizontalScroll } from "@/hooks/useHorizontalScroll";
import {
  Compass,
  ShoppingBag,
  Leaf,
  Clock,
  MapPin,
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  QrCode,
  MessageSquare,
  Star,
  ChevronRight,
  Info,
  User as UserIcon,
  Receipt,
  LogOut,
  Mail,
  Phone
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export function BuyerAppView() {
  const [activeTab, setActiveTab] = useState<"explore" | "orders" | "impact" | "profile">("explore");
  const [selectedCategory, setSelectedCategory] = useState<string>("Semua");
  const [stores, setStores] = useState<Store[]>([]);
  const [surpriseBags, setSurpriseBags] = useState<SurpriseBag[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [currentUser, setCurrentUser] = useState(storeService.getState().currentUser);
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginName, setLoginName] = useState("");

  // Modals state
  const [selectedBagForDetail, setSelectedBagForDetail] = useState<SurpriseBag | null>(null);
  const [activeTicketOrder, setActiveTicketOrder] = useState<Order | null>(null);
  const [activeChatOrder, setActiveChatOrder] = useState<Order | null>(null);
  const [activeReviewOrder, setActiveReviewOrder] = useState<Order | null>(null);

  // Checkout modal
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Order["paymentMethod"]>("QRIS");
  const buyerCategoriesRef = useHorizontalScroll<HTMLDivElement>();

  const syncData = () => {
    const state = storeService.getState();
    setStores(state.stores.filter((s) => s.status === "ACTIVE"));
    setSurpriseBags(state.surpriseBags);
    setOrders(state.orders.filter((o) => o.buyerId === state.currentUser.id));
    setCurrentUser(state.currentUser);
  };

  useEffect(() => {
    syncData();
    const unsub = storeService.subscribe(syncData);
    return unsub;
  }, []);

  const categories: (string | StoreCategory)[] = [
    "Semua",
    "Bakery & Pastry",
    "Makanan Berat",
    "Kafe & Minuman",
    "Swalayan & Buah"
  ];

  const filteredBags = surpriseBags.filter((b) => {
    if (!b.isActive) return false;
    if (selectedCategory === "Semua") return true;
    return b.category === selectedCategory;
  });

  const handleCheckoutConfirm = () => {
    if (!isLoggedIn) {
      setShowAuthModal(true);
      return;
    }
    if (!selectedBagForDetail) return;
    try {
      const order = storeService.createOrder(selectedBagForDetail.id, selectedPayment);
      setSelectedBagForDetail(null);
      setIsCheckingOut(false);
      setActiveTicketOrder(order);
    } catch (e: unknown) {
      if (e instanceof Error) {
        alert(e.message);
      }
    }
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail.trim()) return;
    setIsLoggedIn(true);
    setShowAuthModal(false);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setActiveTab("explore");
  };

  const getStoreForBag = (storeId: string) => stores.find((s) => s.id === storeId);

  // Personal Impact calculation
  const completedOrders = orders.filter((o) => o.status === "COMPLETED");
  const personalKgSaved = Math.round(completedOrders.length * 0.8 * 10) / 10;
  const personalMoneySaved = completedOrders.reduce((acc, o) => {
    const bag = surpriseBags.find((b) => b.id === o.bagId);
    return acc + (bag ? bag.originalPrice - o.totalPrice : 35000);
  }, 0);

  return (
    <div className="w-full max-w-md mx-auto bg-background min-h-screen border-x border-border flex flex-col shadow-xl relative pb-20">
      {/* Top Location Bar */}
      <div className="p-3.5 px-4 bg-card border-b border-border flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-1.5 min-w-0">
          <MapPin className="size-4 text-emerald-600 shrink-0" />
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Lokasi Pengambilan
            </p>
            <p className="text-xs font-bold text-foreground truncate">
              Cirebon Kota • Radius 5 km
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isLoggedIn ? (
            <button
              type="button"
              onClick={() => setActiveTab("profile")}
              className="flex items-center gap-1.5 bg-muted/60 hover:bg-muted p-1 px-2.5 rounded-full text-xs font-bold transition-colors"
            >
              <UserIcon className="size-3.5 text-emerald-600" />
              <span className="max-w-[80px] truncate">{currentUser.name.split(" ")[0]}</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setShowAuthModal(true)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-extrabold px-3 py-1 rounded-full shadow-xs"
            >
              Masuk
            </button>
          )}
        </div>
      </div>

      {/* Main Tab Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === "explore" && (
          <div className="space-y-4 p-4">
            {/* Banner Edukasi Penyelamat */}
            <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white p-4 rounded-2xl shadow-sm space-y-1 relative overflow-hidden">
              <div className="relative z-10">
                <span className="text-[10px] font-extrabold uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-full">
                  Food Rescue Cirebon
                </span>
                <h3 className="font-extrabold text-sm mt-1">
                  Selamatkan Makanan Lezat Hari Ini
                </h3>
                <p className="text-[11px] text-white/90 leading-relaxed mt-0.5">
                  Beli surplus makanan dari resto & bakery favorit di Cirebon dengan harga terjangkau sebelum toko tutup.
                </p>
              </div>
            </div>

            {/* Kategori Filter */}
            <div
              ref={buyerCategoriesRef}
              className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none cursor-grab active:cursor-grabbing select-none"
            >
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                    selectedCategory === cat
                      ? "bg-emerald-600 text-white shadow-xs font-bold"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* List Surprise Bag Card */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-foreground">
                  Paket Tersedia ({filteredBags.length})
                </span>
                <span className="text-muted-foreground text-[11px]">
                  Diperbarui real-time
                </span>
              </div>

              {filteredBags.length === 0 ? (
                <div className="bg-muted/40 border border-dashed border-border rounded-2xl p-8 text-center space-y-2">
                  <p className="text-xs font-bold text-muted-foreground">
                    Belum ada surplus makanan di kategori ini
                  </p>
                  <p className="text-[11px] text-muted-foreground/80">
                    Mitra toko biasanya menginput sisa kuota menjelang sore (17:00 - 19:00).
                  </p>
                </div>
              ) : (
                filteredBags.map((bag) => {
                  const store = getStoreForBag(bag.storeId);
                  const discountPct = Math.round(
                    ((bag.originalPrice - bag.discountedPrice) / bag.originalPrice) * 100
                  );

                  return (
                    <div
                      key={bag.id}
                      onClick={() => setSelectedBagForDetail(bag)}
                      className="bg-card border border-border rounded-2xl p-4 shadow-xs hover:border-emerald-500/50 transition-all cursor-pointer space-y-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                            <span className="font-semibold text-emerald-600 truncate">
                              {store?.name || "Mitra Cirebon"}
                            </span>
                            <span>•</span>
                            <span className="truncate">{store?.area}</span>
                          </div>
                          <h4 className="font-extrabold text-sm text-foreground tracking-tight mt-0.5 leading-snug">
                            {bag.title}
                          </h4>
                        </div>
                        <span className="bg-red-500/10 text-red-600 dark:text-red-400 font-extrabold text-[11px] px-2 py-0.5 rounded-md shrink-0">
                          Hemat {discountPct}%
                        </span>
                      </div>

                      {/* Jam Ambil & Kuota */}
                      <div className="flex items-center justify-between text-[11px] bg-muted/40 p-2 px-3 rounded-xl">
                        <div className="flex items-center gap-1.5 text-muted-foreground font-medium">
                          <Clock className="size-3.5 text-amber-500" />
                          <span>Ambil: {bag.pickupWindow}</span>
                        </div>
                        <span className="font-bold text-foreground">
                          Sisa {bag.quotaRemaining} paket
                        </span>
                      </div>

                      {/* Harga & Tombol */}
                      <div className="flex items-center justify-between pt-1">
                        <div>
                          <span className="text-[10px] text-muted-foreground line-through tabular-nums mr-1.5">
                            Rp {bag.originalPrice.toLocaleString("id-ID")}
                          </span>
                          <span className="text-base font-black text-emerald-600 tabular-nums">
                            Rp {bag.discountedPrice.toLocaleString("id-ID")}
                          </span>
                        </div>

                        <Button
                          type="button"
                          size="sm"
                          className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs"
                        >
                          Pesan
                        </Button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* Tab Pesanan Saya */}
        {activeTab === "orders" && (
          <div className="p-4 space-y-3">
            <h3 className="font-extrabold text-sm text-foreground">
              Riwayat & Tiket Pengambilan ({orders.length})
            </h3>

            {orders.length === 0 ? (
              <div className="p-10 text-center space-y-2 bg-muted/30 rounded-2xl border border-dashed border-border">
                <ShoppingBag className="size-8 text-muted-foreground mx-auto" />
                <p className="text-xs font-bold text-foreground">Belum ada pesanan aktif</p>
                <p className="text-[11px] text-muted-foreground">
                  Pilih paket surprise bag di tab Jelajah untuk mulai menyelamatkan makanan.
                </p>
              </div>
            ) : (
              orders.map((order) => {
                const store = stores.find((s) => s.id === order.storeId);
                const isPaid = order.status === "PAID" || order.status === "READY_FOR_PICKUP";
                const isCompleted = order.status === "COMPLETED";

                return (
                  <div
                    key={order.id}
                    className="bg-card border border-border rounded-2xl p-4 shadow-xs space-y-3"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <div>
                        <span className="font-extrabold text-foreground">{order.storeName}</span>
                        <p className="text-[11px] text-muted-foreground mt-0.5">{order.bagTitle}</p>
                      </div>
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          isPaid
                            ? "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
                            : isCompleted
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {isPaid ? "Siap Diambil" : isCompleted ? "Selesai Diambil" : order.status}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs border-t border-border/60 pt-2.5">
                      <span className="text-muted-foreground text-[11px]">
                        Total (Escrow):{" "}
                        <strong className="text-foreground tabular-nums">
                          Rp {order.totalPrice.toLocaleString("id-ID")}
                        </strong>
                      </span>

                      <div className="flex items-center gap-1.5">
                        {/* Tombol Chat */}
                        <button
                          type="button"
                          onClick={() => setActiveChatOrder(order)}
                          className="p-1.5 rounded-lg bg-muted hover:bg-muted/80 text-foreground transition-colors"
                          title="Chat Toko"
                        >
                          <MessageSquare className="size-4" />
                        </button>

                        {/* Tombol Tiket QR/PIN */}
                        {isPaid && (
                          <button
                            type="button"
                            onClick={() => setActiveTicketOrder(order)}
                            className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-xl text-xs font-bold transition-colors shadow-xs"
                          >
                            <QrCode className="size-3.5" />
                            <span>Lihat Tiket (PIN {order.pickupCode})</span>
                          </button>
                        )}

                        {/* Tombol Ulasan */}
                        {isCompleted && (
                          <button
                            type="button"
                            onClick={() => setActiveReviewOrder(order)}
                            className="flex items-center gap-1 bg-amber-500 hover:bg-amber-600 text-white px-2.5 py-1.5 rounded-xl text-xs font-bold transition-colors shadow-xs"
                          >
                            <Star className="size-3.5" />
                            <span>Beri Ulasan</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Tab Dampak Saya */}
        {activeTab === "impact" && (
          <div className="p-4 space-y-4">
            <div className="bg-gradient-to-br from-emerald-600 to-teal-800 text-white p-5 rounded-2xl space-y-3">
              <div className="flex items-center gap-2">
                <Leaf className="size-5" />
                <h3 className="font-extrabold text-sm">Dampak Penyelamat Makanan Anda</h3>
              </div>
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="bg-white/10 rounded-xl p-3">
                  <p className="text-[10px] text-white/80 font-bold uppercase tracking-wider">
                    Makanan Diselamatkan
                  </p>
                  <p className="text-xl font-black mt-0.5 tabular-nums">
                    {completedOrders.length} Paket
                  </p>
                  <p className="text-[10px] text-white/70 mt-0.5">±{personalKgSaved} kg limbah dicegah</p>
                </div>

                <div className="bg-white/10 rounded-xl p-3">
                  <p className="text-[10px] text-white/80 font-bold uppercase tracking-wider">
                    Penghematan Anda
                  </p>
                  <p className="text-xl font-black mt-0.5 tabular-nums">
                    Rp {personalMoneySaved.toLocaleString("id-ID")}
                  </p>
                  <p className="text-[10px] text-white/70 mt-0.5">dari harga normal resto</p>
                </div>
              </div>
            </div>

            <div className="bg-card border border-border rounded-2xl p-4 space-y-2 text-xs">
              <h4 className="font-bold text-foreground">Mengapa Food Rescue Penting?</h4>
              <p className="text-muted-foreground leading-relaxed text-[11px]">
                Di Cirebon Raya, puluhan kilogram makanan berkualitas terbuang setiap malam hanya karena tidak terjual sebelum jam tutup. Dengan membeli Surprise Bag di SisaRasa, Anda membantu pedagang lokal menutupi biaya operasional dan mencegah emisi gas metana di TPA.
              </p>
            </div>
          </div>
        )}

        {/* Tab Profil Pembeli */}
        {activeTab === "profile" && (
          <div className="p-4 space-y-4">
            <Card className="border-border shadow-xs">
              <CardContent className="p-5 space-y-4">
                <div className="flex items-center gap-3.5">
                  <Avatar className="size-12">
                    <AvatarFallback className="bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-black text-lg border border-emerald-200 dark:border-emerald-800">
                      {currentUser.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-extrabold text-base text-foreground truncate">
                      {currentUser.name}
                    </h3>
                    <p className="text-xs text-muted-foreground truncate flex items-center gap-1 mt-0.5">
                      <Mail className="size-3" />
                      <span>{currentUser.email}</span>
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5 pt-2 border-t border-border">
                  <div className="bg-muted/40 p-2.5 rounded-xl">
                    <span className="text-[10px] text-muted-foreground font-semibold block">Nomor Ponsel</span>
                    <span className="text-xs font-bold text-foreground font-mono">{currentUser.phone}</span>
                  </div>
                  <div className="bg-muted/40 p-2.5 rounded-xl">
                    <span className="text-[10px] text-muted-foreground font-semibold block">Peran Akun</span>
                    <span className="text-xs font-bold text-emerald-600 uppercase font-mono">{currentUser.role}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Menu Aksi Profil */}
            <div className="bg-card border border-border rounded-2xl p-2 divide-y divide-border text-xs">
              <button
                type="button"
                onClick={() => setActiveTab("orders")}
                className="w-full p-3 flex items-center justify-between hover:bg-muted/30 rounded-xl transition-colors text-left"
              >
                <div className="flex items-center gap-2.5">
                  <Receipt className="size-4 text-emerald-600" />
                  <span className="font-bold text-foreground">Riwayat Pembelian</span>
                </div>
                <span className="text-[11px] text-muted-foreground font-mono">{orders.length} pesanan</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("impact")}
                className="w-full p-3 flex items-center justify-between hover:bg-muted/30 rounded-xl transition-colors text-left"
              >
                <div className="flex items-center gap-2.5">
                  <Leaf className="size-4 text-emerald-600" />
                  <span className="font-bold text-foreground">Dampak Penyelamatan Saya</span>
                </div>
                <span className="text-[11px] text-emerald-600 font-bold">{personalKgSaved} kg</span>
              </button>

              <button
                type="button"
                onClick={handleLogout}
                className="w-full p-3 flex items-center justify-between hover:bg-red-500/10 text-red-600 rounded-xl transition-colors text-left"
              >
                <div className="flex items-center gap-2.5">
                  <LogOut className="size-4" />
                  <span className="font-bold">Keluar Akun</span>
                </div>
                <ChevronRight className="size-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Detail & Checkout Sheet */}
      {selectedBagForDetail && (
        <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-card border border-border w-full max-w-md rounded-t-3xl sm:rounded-3xl p-5 space-y-4 shadow-2xl animate-in slide-in-from-bottom duration-200">
            <div className="flex items-start justify-between gap-3 border-b border-border pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">
                  {selectedBagForDetail.category}
                </span>
                <h3 className="font-extrabold text-base text-foreground mt-0.5">
                  {selectedBagForDetail.title}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {getStoreForBag(selectedBagForDetail.storeId)?.name}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedBagForDetail(null)}
                className="size-7 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground"
              >
                ✕
              </button>
            </div>

            {/* Disclaimer Surprise Bag */}
            <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 p-3 rounded-xl flex items-start gap-2.5 text-[11px] text-amber-800 dark:text-amber-300">
              <Info className="size-4 shrink-0 text-amber-600 mt-0.5" />
              <p className="leading-relaxed">
                <strong>Konsep Surprise Bag:</strong> Isi makanan bervariasi tergantung surplus harian toko hari ini. Makanan dijamin layak, bersih, dan higienis.
              </p>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              {selectedBagForDetail.description}
            </p>

            <div className="bg-muted/50 p-3 rounded-xl space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Batas Jam Pengambilan:</span>
                <span className="font-bold text-foreground">
                  {selectedBagForDetail.pickupWindow}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Sisa Kuota:</span>
                <span className="font-bold text-emerald-600">
                  {selectedBagForDetail.quotaRemaining} paket tersisa
                </span>
              </div>
            </div>

            {/* Price & Checkout Trigger */}
            <div className="flex items-center justify-between pt-2">
              <div>
                <p className="text-[10px] text-muted-foreground line-through tabular-nums">
                  Rp {selectedBagForDetail.originalPrice.toLocaleString("id-ID")}
                </p>
                <p className="text-lg font-black text-emerald-600 tabular-nums">
                  Rp {selectedBagForDetail.discountedPrice.toLocaleString("id-ID")}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsCheckingOut(true)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-xs transition-colors"
              >
                Lanjut Pembayaran
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mock Payment Gateway Dialog */}
      {isCheckingOut && selectedBagForDetail && (
        <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card border border-border w-full max-w-sm rounded-3xl p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-extrabold text-sm text-foreground">
                Pembayaran Aman (Escrow)
              </h3>
              <button
                type="button"
                onClick={() => setIsCheckingOut(false)}
                className="text-muted-foreground hover:text-foreground text-xs"
              >
                Batal
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Paket</span>
                <span className="font-bold text-foreground truncate max-w-[180px]">
                  {selectedBagForDetail.title}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Tagihan</span>
                <span className="font-black text-emerald-600 tabular-nums text-sm">
                  Rp {selectedBagForDetail.discountedPrice.toLocaleString("id-ID")}
                </span>
              </div>
            </div>

            {/* Pilihan Metode Pembayaran */}
            <div className="space-y-1.5 pt-1">
              <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                Metode Pembayaran
              </p>
              {(["QRIS", "GoPay", "ShopeePay", "BCA_VA"] as Order["paymentMethod"][]).map(
                (m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setSelectedPayment(m)}
                    className={`w-full p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-between transition-all ${
                      selectedPayment === m
                        ? "bg-emerald-50 dark:bg-emerald-950/50 border-emerald-600 text-emerald-800 dark:text-emerald-300 font-bold"
                        : "border-border text-foreground hover:bg-muted"
                    }`}
                  >
                    <span>{m === "BCA_VA" ? "Virtual Account BCA" : m}</span>
                    {selectedPayment === m && <span className="text-emerald-600 font-bold">✓</span>}
                  </button>
                )
              )}
            </div>

            <div className="bg-muted/40 p-2.5 rounded-xl text-[11px] text-muted-foreground flex items-center gap-2">
              <ShieldCheck className="size-4 text-emerald-600 shrink-0" />
              <span>Dana disimpan di Rekber sampai Anda mengambil makanan di toko.</span>
            </div>

            <Button
              type="button"
              onClick={handleCheckoutConfirm}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs py-3 h-auto"
            >
              Simulasi 1-Klik Bayar Sekarang
            </Button>
          </div>
        </div>
      )}

      {/* Ticket Modal */}
      {activeTicketOrder && (
        <BuyerPickupTicketModal
          order={activeTicketOrder}
          store={stores.find((s) => s.id === activeTicketOrder.storeId)}
          onClose={() => setActiveTicketOrder(null)}
          onOpenChat={() => {
            setActiveChatOrder(activeTicketOrder);
            setActiveTicketOrder(null);
          }}
        />
      )}

      {/* Chat Modal */}
      {activeChatOrder && (
        <ChatModal
          order={activeChatOrder}
          onClose={() => setActiveChatOrder(null)}
        />
      )}

      {/* Review Modal */}
      {activeReviewOrder && (
        <BuyerReviewModal
          order={activeReviewOrder}
          onClose={() => setActiveReviewOrder(null)}
          onSuccess={syncData}
        />
      )}

      {/* Auth Modal (Masuk Akun Pembeli) */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card border border-border w-full max-w-sm rounded-3xl p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h3 className="font-extrabold text-base text-foreground">Masuk Akun Pembeli</h3>
                <p className="text-xs text-muted-foreground">Simulasi autentikasi SisaRasa Cirebon</p>
              </div>
              <button
                type="button"
                onClick={() => setShowAuthModal(false)}
                className="size-7 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleLoginSubmit} className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-muted-foreground block mb-1">
                  Nama Lengkap
                </label>
                <Input
                  type="text"
                  required
                  value={loginName || currentUser.name}
                  onChange={(e) => setLoginName(e.target.value)}
                  placeholder="Budi Santoso"
                  className="text-xs font-medium"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-muted-foreground block mb-1">
                  Email Akun
                </label>
                <Input
                  type="email"
                  required
                  value={loginEmail || currentUser.email}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="budi.cirebon@gmail.com"
                  className="text-xs font-medium"
                />
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs"
                >
                  Masuk Sekarang
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bottom Navigation Bar */}
      <nav className="absolute bottom-0 left-0 right-0 bg-card/95 backdrop-blur-md border-t border-border flex items-center justify-around py-2 px-3 z-30">
        <button
          type="button"
          onClick={() => setActiveTab("explore")}
          className={`flex flex-col items-center gap-1 text-[10px] font-semibold transition-colors ${
            activeTab === "explore" ? "text-emerald-600 font-bold" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Compass className="size-5" />
          <span>Jelajah</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("orders")}
          className={`flex flex-col items-center gap-1 text-[10px] font-semibold transition-colors relative ${
            activeTab === "orders" ? "text-emerald-600 font-bold" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <ShoppingBag className="size-5" />
          <span>Pesanan</span>
          {orders.some((o) => o.status === "PAID") && (
            <span className="size-2 rounded-full bg-emerald-500 absolute top-0 right-2" />
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("impact")}
          className={`flex flex-col items-center gap-1 text-[10px] font-semibold transition-colors ${
            activeTab === "impact" ? "text-emerald-600 font-bold" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Leaf className="size-5" />
          <span>Dampak</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("profile")}
          className={`flex flex-col items-center gap-1 text-[10px] font-semibold transition-colors ${
            activeTab === "profile" ? "text-emerald-600 font-bold" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <UserIcon className="size-5" />
          <span>Profil</span>
        </button>
      </nav>
    </div>
  );
}
