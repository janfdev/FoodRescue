"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import {
  Leaf,
  Clock,
  Sparkles,
  ShieldCheck,
  ArrowRight,
  Store,
  MapPin,
  Search,
  CheckCircle2,
  Lock,
  QrCode,
  Coffee,
  Utensils,
  Wheat,
  Apple,
  ChevronRight,
  HelpCircle,
  TrendingDown,
  Building2,
  CalendarClock,
  Receipt,
  MessageSquare,
  Phone,
  User,
  ShoppingBag,
  Ticket,
  LogIn,
  LogOut,
  Check,
  Sparkle,
  ChevronDown
} from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { QRCodeSVG } from "qrcode.react";
import { storeService } from "@/services/storeService";
import { SEED_USERS } from "@/services/seedData";
import { ChatModal } from "@/components/shared/ChatModal";
import { SurpriseBag, Order, User as UserType } from "@/types/domain";

export function LandingPage({ initialShowTickets = false }: { initialShowTickets?: boolean }) {
  const [state, setState] = useState(storeService.getState());
  const [selectedArea, setSelectedArea] = useState<string>("Semua");
  const [selectedCategory, setSelectedCategory] = useState<string>("Semua");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Guest Checkout State
  const [selectedCheckoutBag, setSelectedCheckoutBag] = useState<SurpriseBag | null>(null);
  const [guestName, setGuestName] = useState<string>("");
  const [guestPhone, setGuestPhone] = useState<string>("");
  const [isSubmittingOrder, setIsSubmittingOrder] = useState<boolean>(false);

  // Active Ticket Modal State
  const [activeTicketOrder, setActiveTicketOrder] = useState<Order | null>(null);
  const [showTicketsDrawer, setShowTicketsDrawer] = useState<boolean>(initialShowTickets);
  const [activeChatOrder, setActiveChatOrder] = useState<Order | null>(null);

  // User Auth State
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);

  // Sync state & LocalStorage Session
  useEffect(() => {
    const unsub = storeService.subscribe(() => {
      setState(storeService.getState());
    });

    try {
      const savedUserStr = localStorage.getItem("foodrescue_auth_user");
      if (savedUserStr) {
        const parsed = JSON.parse(savedUserStr);
        setCurrentUser(parsed);
        setGuestName(parsed.name);
        setGuestPhone(parsed.phone);
      } else {
        const savedName = localStorage.getItem("foodrescue_guest_name");
        const savedPhone = localStorage.getItem("foodrescue_guest_phone");
        if (savedName) setGuestName(savedName);
        if (savedPhone) setGuestPhone(savedPhone);
      }
    } catch {
      // ignore
    }

    return unsub;
  }, []);

  const handleLoginUser = (u: UserType) => {
    setCurrentUser(u);
    setGuestName(u.name);
    setGuestPhone(u.phone);
    try {
      localStorage.setItem("foodrescue_auth_user", JSON.stringify(u));
      localStorage.setItem("foodrescue_guest_name", u.name);
      localStorage.setItem("foodrescue_guest_phone", u.phone);
    } catch {}
    setIsAuthModalOpen(false);
  };

  const handleLogoutUser = () => {
    setCurrentUser(null);
    try {
      localStorage.removeItem("foodrescue_auth_user");
    } catch {}
  };

  const stores = state.stores.filter((s) => s.status === "ACTIVE");
  const bags = state.surpriseBags.filter((b) => b.isActive);
  const metrics = storeService.getImpactMetrics();

  // Active guest orders
  const myOrders = useMemo(() => {
    return state.orders.filter(
      (o) =>
        (guestPhone && o.buyerPhone === guestPhone) ||
        (guestName && o.buyerName.toLowerCase() === guestName.toLowerCase()) ||
        o.buyerId === state.currentUser.id
    );
  }, [state.orders, guestPhone, guestName, state.currentUser]);

  const activeMyOrders = myOrders.filter(
    (o) => o.status === "PAID" || o.status === "READY_FOR_PICKUP"
  );

  const areas = ["Semua", "Tuparev", "Kesambi", "Pekiringan", "Karanggetas", "Siliwangi"];

  const filteredBags = useMemo(() => {
    return bags.filter((bag) => {
      const store = stores.find((s) => s.id === bag.storeId);
      const matchArea =
        selectedArea === "Semua" ||
        (store?.area && store.area.toLowerCase().includes(selectedArea.toLowerCase()));
      const matchCategory =
        selectedCategory === "Semua" || bag.category === selectedCategory;
      const matchSearch =
        !searchQuery.trim() ||
        bag.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        store?.name.toLowerCase().includes(searchQuery.toLowerCase());

      return matchArea && matchCategory && matchSearch;
    });
  }, [bags, stores, selectedArea, selectedCategory, searchQuery]);

  // Handle Instant Guest Checkout
  const handleConfirmOrder = () => {
    if (!selectedCheckoutBag) return;
    const finalName = guestName.trim() || "Warga Cirebon";
    const finalPhone = guestPhone.trim() || "081234567890";

    try {
      setIsSubmittingOrder(true);
      localStorage.setItem("foodrescue_guest_name", finalName);
      localStorage.setItem("foodrescue_guest_phone", finalPhone);

      const order = storeService.createOrder(selectedCheckoutBag.id, "QRIS", {
        name: finalName,
        phone: finalPhone,
      });

      setSelectedCheckoutBag(null);
      setActiveTicketOrder(order);
    } catch (e: any) {
      alert(e?.message || "Gagal memproses pesanan");
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50/60 dark:bg-zinc-950 text-foreground flex flex-col font-sans selection:bg-emerald-500/20">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-md border-b border-border/70">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/" className="size-9 rounded-xl overflow-hidden shadow-xs shrink-0 block">
              <img
                src="/brand/rerasa-mascot-r.svg"
                alt="Rerasa Logo"
                className="w-full h-full object-cover"
              />
            </Link>
            <div>
              <Link href="/" className="font-black text-lg tracking-tight text-emerald-900 dark:text-emerald-400 block hover:opacity-90 transition-opacity">
                Rerasa
              </Link>
              <span className="text-[10px] block font-semibold text-amber-700 dark:text-amber-500 uppercase tracking-wider -mt-1">
                Cirebon Raya
              </span>
            </div>
          </div>

          {/* Center Nav Links (Anti-Slop Content-Driven Navigation) */}
          <nav className="hidden md:flex items-center gap-6">
            <a
              href="#katalog"
              className="text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
            >
              Jelajah Katalog
            </a>
            <a
              href="#cara-kerja"
              className="text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
            >
              Cara Kerja
            </a>
            <a
              href="#mitra"
              className="text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
            >
              Mitra Kuliner
            </a>
            <a
              href="#dampak"
              className="text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
            >
              Dampak Pangan
            </a>
          </nav>

          {/* Header Right: Profile Popover or Login Button */}
          <div className="flex items-center gap-3">
            {currentUser ? (
              <Popover>
                <PopoverTrigger className="flex items-center gap-2 p-1.5 px-2.5 rounded-xl border border-border bg-card hover:bg-muted/50 text-xs font-bold transition-colors shadow-2xs">
                  <Avatar size="sm" className="size-6 rounded-full border border-border">
                    <AvatarImage src={currentUser.avatarUrl} alt={currentUser.name} />
                    <AvatarFallback className="bg-emerald-700 text-white font-black text-[10px]">
                      {currentUser.name
                        .split(" ")
                        .map((w) => w[0])
                        .slice(0, 2)
                        .join("")
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="max-w-[110px] truncate hidden sm:inline text-foreground">
                    {currentUser.name}
                  </span>
                  <ChevronDown className="size-3 text-muted-foreground" />
                </PopoverTrigger>
                <PopoverContent align="end" className="w-64 p-3 space-y-2.5 bg-card border border-border shadow-md">
                  {/* User Profile Header */}
                  <div className="space-y-1 pb-2 border-b border-border">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-foreground text-xs block truncate">
                        {currentUser.name}
                      </span>
                      <Badge
                        variant={
                          currentUser.role === "super_admin"
                            ? "default"
                            : currentUser.role === "seller"
                            ? "secondary"
                            : "outline"
                        }
                        className={`text-[9px] font-bold ${
                          currentUser.role === "super_admin"
                            ? "bg-purple-700 text-white"
                            : currentUser.role === "seller"
                            ? "bg-orange-600 text-white"
                            : "text-emerald-700 border-emerald-600"
                        }`}
                      >
                        {currentUser.role === "super_admin"
                          ? "Super Admin"
                          : currentUser.role === "seller"
                          ? "Mitra Toko"
                          : "Pelanggan"}
                      </Badge>
                    </div>
                    <span className="text-[10px] text-muted-foreground font-mono block truncate">
                      {currentUser.email}
                    </span>
                  </div>

                  {/* Dynamic Destination based on Role */}
                  <div className="space-y-1">
                    {currentUser.role === "super_admin" && (
                      <Link
                        href="/admin"
                        className="flex items-center gap-2 w-full p-2 rounded-lg text-xs font-bold text-purple-700 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/40 transition-colors"
                      >
                        <ShieldCheck className="size-4" />
                        <span>Pusat Kendali Admin</span>
                      </Link>
                    )}

                    {currentUser.role === "seller" && (
                      <Link
                        href="/seller"
                        className="flex items-center gap-2 w-full p-2 rounded-lg text-xs font-bold text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-950/40 transition-colors"
                      >
                        <Store className="size-4" />
                        <span>Dashboard Toko (POS)</span>
                      </Link>
                    )}

                    <button
                      type="button"
                      onClick={() => setShowTicketsDrawer(true)}
                      className="flex items-center justify-between w-full p-2 rounded-lg text-xs font-medium text-foreground hover:bg-muted transition-colors text-left"
                    >
                      <div className="flex items-center gap-2">
                        <Receipt className="size-4 text-emerald-600" />
                        <span>Tiket & Riwayat Pesanan</span>
                      </div>
                      {activeMyOrders.length > 0 && (
                        <Badge variant="default" className="bg-emerald-700 text-white text-[10px] px-1.5 py-0 font-mono">
                          {activeMyOrders.length}
                        </Badge>
                      )}
                    </button>
                  </div>

                  <Separator />

                  {/* Logout Button */}
                  <button
                    type="button"
                    onClick={handleLogoutUser}
                    className="flex items-center gap-2 w-full p-2 rounded-lg text-xs font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors text-left"
                  >
                    <LogOut className="size-4" />
                    <span>Keluar Akun (Logout)</span>
                  </button>
                </PopoverContent>
              </Popover>
            ) : (
              <Link
                href="/login"
                className={buttonVariants({
                  size: "sm",
                  className: "bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs gap-1.5 shadow-xs",
                })}
              >
                <LogIn className="size-3.5" />
                <span>Masuk</span>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section: Editorial & Authentic Impact */}
      <section className="border-b border-border/80 bg-gradient-to-b from-stone-100/50 via-background to-background dark:from-zinc-900/40 dark:via-background dark:to-background py-12 sm:py-16">
        <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-7 flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-400">
                Inisiatif Pangan Berkelanjutan Cirebon
              </span>
              <Tooltip>
                <TooltipTrigger className="size-5 inline-flex items-center justify-center rounded-full text-muted-foreground hover:text-foreground">
                  <HelpCircle className="size-3.5" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs">Menyelamatkan makanan surplus layak santap dari TPA Kopiluhur</p>
                </TooltipContent>
              </Tooltip>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight text-foreground">
              Selamatkan Makanan Surplus Cirebon Sebelum Jam Tutup.
            </h1>

            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-xl">
              Setiap sore dan malam, toko roti, resto empal gentong, dan kafe di Cirebon mengemas porsi surplus segar dalam Surprise Bag. Dapatkan diskon 50% hingga 70% dengan proteksi rekening penjamin platform tanpa perlu registrasi berbelit.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <a
                href="#katalog"
                className={buttonVariants({
                  size: "lg",
                  className: "bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm shadow-sm gap-2",
                })}
              >
                <span>Beli Surprise Bag Sekarang</span>
                <ArrowRight className="size-4" />
              </a>
              <Link
                href="/seller"
                className={buttonVariants({
                  size: "lg",
                  variant: "outline",
                  className: "font-semibold text-sm",
                })}
              >
                Daftarkan Usaha Kuliner
              </Link>
            </div>

            {/* Verifiable Impact Ledger */}
            <div id="dampak" className="grid grid-cols-3 gap-3 pt-4 scroll-mt-24">
              <div className="p-3.5 rounded-xl border border-border bg-card shadow-2xs space-y-0.5">
                <span className="text-2xl font-black text-emerald-700 dark:text-emerald-400 tabular-nums block">
                  {metrics.totalMealsSaved}+
                </span>
                <span className="text-xs font-medium text-muted-foreground">
                  Porsi Makanan Diselamatkan
                </span>
              </div>
              <div className="p-3.5 rounded-xl border border-border bg-card shadow-2xs space-y-0.5">
                <span className="text-2xl font-black text-amber-600 dark:text-amber-500 tabular-nums block">
                  {stores.length} Mitra
                </span>
                <span className="text-xs font-medium text-muted-foreground">
                  Toko Aktif Cirebon
                </span>
              </div>
              <div className="p-3.5 rounded-xl border border-border bg-card shadow-2xs space-y-0.5">
                <span className="text-2xl font-black text-emerald-700 dark:text-emerald-400 tabular-nums block">
                  {metrics.estimatedKgSaved} kg
                </span>
                <span className="text-xs font-medium text-muted-foreground">
                  Limbah Organik Dicegah
                </span>
              </div>
            </div>
          </div>

          {/* Right Hero Card: Transparansi Escrow & Jaminan Kualitas */}
          <div id="cara-kerja" className="lg:col-span-5 scroll-mt-24">
            <Card className="border-border shadow-md bg-card">
              <CardHeader className="p-5 pb-3">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="border-emerald-600/30 text-emerald-700 dark:text-emerald-400 font-bold text-[11px]">
                    Sistem Rekber Resmi
                  </Badge>
                  <span className="text-xs font-mono text-muted-foreground">Escrow Protected</span>
                </div>
                <CardTitle className="text-base font-extrabold mt-1">
                  Kepastian Serah Terima Fisik di Kasir
                </CardTitle>
                <CardDescription className="text-xs leading-relaxed">
                  Dana pembayaran Anda aman tertahan di rekening penjamin platform sampai Anda datang ke toko dan kasir memvalidasi PIN 4-digit Anda.
                </CardDescription>
              </CardHeader>

              <CardContent className="p-5 pt-0 space-y-3 text-xs">
                <div className="space-y-2 border-t border-border/60 pt-3">
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="size-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-foreground block">100% Layak & Higienis</strong>
                      <span className="text-muted-foreground text-[11px]">Bukan sisa piring kotor. Semua makanan dikemas dari etalase bersih toko.</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <QrCode className="size-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-foreground block">Verifikasi PIN 4-Digit</strong>
                      <span className="text-muted-foreground text-[11px]">Toko baru menerima dana setelah kasir mencocokkan kode pickup Anda.</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <ShieldCheck className="size-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-foreground block">Kemasan Resmi Rescue Box</strong>
                      <span className="text-muted-foreground text-[11px]">Audit kepatuhan wadah makanan resmi pada setiap ulasan pembeli.</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <a
                    href="#katalog"
                    className={buttonVariants({
                      className: "w-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs text-center justify-center",
                    })}
                  >
                    Mulai Selamatkan Makanan Sekarang
                  </a>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Live Interactive Explorer Directly on Landing Page */}
      <section id="katalog" className="py-12 max-w-6xl mx-auto px-4 w-full space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black text-foreground tracking-tight">
              Katalog Surprise Bag Hari Ini di Cirebon
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              Pilih area dan jenis makanan untuk memesan langsung tanpa antre dan tanpa registrasi rumit
            </p>
          </div>

          {/* Search Box */}
          <div className="w-full md:w-72 relative">
            <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Cari toko roti, nasi jamblang..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 text-xs"
            />
          </div>
        </div>

        {/* Filter Area & Kategori */}
        <div className="space-y-3">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            <span className="text-xs font-bold text-muted-foreground mr-1 shrink-0">Kawasan:</span>
            {areas.map((area) => (
              <Button
                key={area}
                type="button"
                variant={selectedArea === area ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedArea(area)}
                className={`text-xs h-7 px-3 rounded-full font-semibold ${
                  selectedArea === area
                    ? "bg-emerald-700 hover:bg-emerald-800 text-white"
                    : "border-border text-muted-foreground"
                }`}
              >
                {area}
              </Button>
            ))}
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <span className="text-xs font-bold text-muted-foreground mr-1 shrink-0">Kategori:</span>
            {[
              { id: "Semua", label: "Semua Kategori", icon: Utensils },
              { id: "Bakery & Pastry", label: "Roti & Pastry", icon: Wheat },
              { id: "Makanan Berat", label: "Makanan Berat", icon: Utensils },
              { id: "Kafe & Minuman", label: "Kafe & Minuman", icon: Coffee },
              { id: "Swalayan & Buah", label: "Bahan Segar", icon: Apple },
            ].map((cat) => {
              const Icon = cat.icon;
              return (
                <Button
                  key={cat.id}
                  type="button"
                  variant={selectedCategory === cat.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`text-xs h-7 px-3 rounded-full font-semibold gap-1.5 ${
                    selectedCategory === cat.id
                      ? "bg-stone-800 text-white dark:bg-stone-200 dark:text-stone-900"
                      : "border-border text-muted-foreground"
                  }`}
                >
                  <Icon className="size-3" />
                  <span>{cat.label}</span>
                </Button>
              );
            })}
          </div>
        </div>

        {/* Live Card Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredBags.length === 0 ? (
            <div className="col-span-full p-12 text-center border border-dashed border-border rounded-2xl bg-card space-y-2">
              <p className="text-sm font-bold text-foreground">Tidak ada paket yang sesuai filter</p>
              <p className="text-xs text-muted-foreground">
                Coba pilih kawasan lain atau tunggu mitra mengunggah sisa kuota sore ini.
              </p>
            </div>
          ) : (
            filteredBags.map((bag) => {
              const store = stores.find((s) => s.id === bag.storeId);
              const discountPct = Math.round(
                ((bag.originalPrice - bag.discountedPrice) / bag.originalPrice) * 100
              );

              return (
                <Card
                  key={bag.id}
                  className="border-border shadow-xs hover:border-emerald-600/50 transition-colors flex flex-col justify-between overflow-hidden"
                >
                  {bag.imageUrl && (
                    <div className="relative h-44 w-full overflow-hidden bg-muted">
                      <img
                        src={bag.imageUrl}
                        alt={bag.title}
                        className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                        loading="lazy"
                      />
                      {/* Urgency Badge: Quota & Pickup Urgency */}
                      <div className="absolute top-2.5 left-2.5">
                        {bag.quotaRemaining <= 3 ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-600 text-white shadow-xs flex items-center gap-1">
                            <Clock className="size-3" />
                            <span>Sisa {bag.quotaRemaining} paket</span>
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-800/90 backdrop-blur-xs text-white shadow-xs flex items-center gap-1">
                            <Clock className="size-3" />
                            <span>Ambil Sore Ini</span>
                          </span>
                        )}
                      </div>

                      <div className="absolute top-2.5 right-2.5">
                        <Badge variant="secondary" className="font-bold text-[10px] bg-background/90 backdrop-blur-xs text-amber-700 dark:text-amber-400 shadow-2xs">
                          Hemat {discountPct}%
                        </Badge>
                      </div>
                    </div>
                  )}

                  <CardHeader className="p-4 pb-2 space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-emerald-700 dark:text-emerald-400 truncate">
                        {store?.name || "Mitra Cirebon"}
                      </span>
                      {!bag.imageUrl && (
                        <Badge variant="secondary" className="text-[10px] font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-900">
                          Hemat {discountPct}%
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="text-sm font-extrabold text-foreground leading-snug">
                      {bag.title}
                    </CardTitle>
                    <CardDescription className="text-xs line-clamp-2">
                      {bag.description}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="p-4 pt-1 space-y-3">
                    <div className="p-2.5 rounded-lg bg-muted/40 border border-border/50 text-[11px] space-y-1.5">
                      <div className="flex items-center justify-between text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <MapPin className="size-3 text-muted-foreground" />
                          <span>{store?.area || "Cirebon Kota"}</span>
                        </span>
                        <span className={`font-bold tabular-nums ${bag.quotaRemaining <= 3 ? "text-amber-700 dark:text-amber-400" : "text-foreground"}`}>
                          Sisa {bag.quotaRemaining} paket
                        </span>
                      </div>
                      <div className="flex items-center justify-between pt-1 border-t border-border/40 text-[10px]">
                        <span className="flex items-center gap-1 text-amber-700 dark:text-amber-400 font-semibold">
                          <Clock className="size-3 text-amber-600 shrink-0" />
                          <span>Ambil: {bag.pickupWindow}</span>
                        </span>
                        <span className="text-muted-foreground font-mono">
                          Hari ini
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <div>
                        <span className="text-[10px] text-muted-foreground line-through tabular-nums block">
                          Rp {bag.originalPrice.toLocaleString("id-ID")}
                        </span>
                        <span className="text-base font-black text-emerald-700 dark:text-emerald-400 tabular-nums">
                          Rp {bag.discountedPrice.toLocaleString("id-ID")}
                        </span>
                      </div>

                      {/* Instant Guest Checkout Button */}
                      <Button
                        size="sm"
                        onClick={() => setSelectedCheckoutBag(bag)}
                        className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs"
                      >
                        Pesan
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </section>

      {/* Edukasi Konsep & Mitra Kuliner Cirebon */}
      <section id="mitra" className="py-12 border-t border-border bg-card scroll-mt-24">
        <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-500">
              Konteks Usaha Kuliner
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-foreground tracking-tight">
              Mengapa Makanan Berkualitas Bisa Tersisa Setiap Hari?
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Toko roti ternama harus memanggang dalam takaran batch penuh di pagi hari agar etalase terlihat melimpah. Resto dan kafe wajib menyiapkan bahan segar harian yang tidak boleh dijual kembali esok hari karena standar kualitas.
            </p>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Rerasa menjembatani surplus segar tersebut langsung ke konsumen Cirebon sebelum jam operasional berakhir, sehingga pedagang memulihkan biaya bahan baku dan tidak ada makanan higienis yang terbuang sia-sia.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-4 rounded-xl border border-border bg-background space-y-1.5">
              <Building2 className="size-5 text-emerald-700" />
              <strong className="text-foreground block font-bold">Mitra Terverifikasi</strong>
              <p className="text-muted-foreground text-[11px] leading-relaxed">
                Setiap mitra melalui pemeriksaan identitas KYC, higienitas dapur, dan kepatuhan wadah.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-border bg-background space-y-1.5">
              <CalendarClock className="size-5 text-amber-600" />
              <strong className="text-foreground block font-bold">Waktu Ambil Terjadwal</strong>
              <p className="text-muted-foreground text-[11px] leading-relaxed">
                Jendela pengambilan diatur saat toko bersiap tutup (19:30 - 21:30) sehingga tertib dan praktis.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto bg-background border-t border-border py-8">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <span className="font-bold text-foreground">Rerasa Cirebon Raya</span>
            <Separator orientation="vertical" className="h-3" />
            <span>Inisiatif Nol Makanan Terbuang</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setShowTicketsDrawer(true)}
              className="hover:text-emerald-700 transition-colors font-medium"
            >
              Tiket Saya
            </button>
            <Link href="/seller" className="hover:text-emerald-700 transition-colors">
              Portal Mitra
            </Link>
            <Link href="/admin" className="hover:text-emerald-700 transition-colors">
              Super Admin
            </Link>
          </div>
        </div>
      </footer>

      {/* ─── MODAL DIALOG GUEST CHECKOUT (TANPA LOGIN WAJIB) ──────────────────── */}
      <Dialog
        open={!!selectedCheckoutBag}
        onOpenChange={(open) => !open && setSelectedCheckoutBag(null)}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Pesan Surprise Bag (Guest Checkout)</DialogTitle>
            <DialogDescription>
              {selectedCheckoutBag?.title} • Jam Ambil: {selectedCheckoutBag?.pickupWindow} WIB
            </DialogDescription>
          </DialogHeader>

          {selectedCheckoutBag && (
            <div className="space-y-4 pt-2 text-xs">
              <div className="p-3.5 bg-muted/40 rounded-xl space-y-1.5 border border-border/60">
                <div className="flex justify-between text-muted-foreground">
                  <span>Harga Normal Toko:</span>
                  <span className="line-through tabular-nums">
                    Rp {selectedCheckoutBag.originalPrice.toLocaleString("id-ID")}
                  </span>
                </div>
                <div className="flex justify-between font-medium text-foreground">
                  <span>Harga Paket Rerasa (Diskon):</span>
                  <span className="tabular-nums font-bold text-emerald-700 dark:text-emerald-400">
                    Rp {selectedCheckoutBag.discountedPrice.toLocaleString("id-ID")}
                  </span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <span>Biaya Layanan Aplikasi</span>
                    <span className="text-[10px] text-muted-foreground/80">(Pemeliharaan & Escrow)</span>
                  </span>
                  <span className="font-mono tabular-nums text-foreground font-semibold">
                    Rp 1.000
                  </span>
                </div>
                <Separator className="my-1.5" />
                <div className="flex justify-between font-black text-sm">
                  <span className="text-foreground">Total Pembayaran:</span>
                  <span className="text-emerald-700 dark:text-emerald-400 tabular-nums">
                    Rp {(selectedCheckoutBag.discountedPrice + 1000).toLocaleString("id-ID")}
                  </span>
                </div>
              </div>

              {/* Data Identitas Cepat Tanpa Password */}
              <div className="space-y-3">
                <div>
                  <label className="text-[11px] font-bold text-muted-foreground block mb-1">
                    Nama Pembeli (untuk tiket kasir)
                  </label>
                  <div className="relative">
                    <User className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="Contoh: Fauzan / Rizqi"
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      className="pl-9 text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-muted-foreground block mb-1">
                    Nomor WhatsApp / HP (akses tiket pickup)
                  </label>
                  <div className="relative">
                    <Phone className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      type="tel"
                      placeholder="08xxxxxxxxxx"
                      value={guestPhone}
                      onChange={(e) => setGuestPhone(e.target.value)}
                      className="pl-9 text-xs"
                    />
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1">
                    PIN 4-digit tiket akan langsung muncul di layar dan tersimpan otomatis di sesi Anda.
                  </p>
                </div>

                <div className="p-3 border border-emerald-500/30 bg-emerald-500/5 rounded-xl space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-emerald-800 dark:text-emerald-300">
                    <ShieldCheck className="size-4" />
                    <span>Rekening Penjamin (Escrow) Aktif</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground leading-relaxed">
                    Dana pembayaran Anda ditahan aman di sistem sampai Anda mengambil makanan di toko dan kasir memvalidasi PIN Anda.
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-border">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedCheckoutBag(null)}
                >
                  Batal
                </Button>
                <Button
                  type="button"
                  size="sm"
                  disabled={isSubmittingOrder}
                  onClick={handleConfirmOrder}
                  className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold"
                >
                  Bayar & Dapatkan Tiket
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ─── MODAL TIKET RESMI PENJEMPUTAN (PICKUP VOUCHER) ────────────────────── */}
      <Dialog
        open={!!activeTicketOrder}
        onOpenChange={(open) => !open && setActiveTicketOrder(null)}
      >
        <DialogContent className="max-w-sm text-center">
          <DialogHeader>
            <DialogTitle className="text-center">Tiket Pengambilan Resmi</DialogTitle>
            <DialogDescription className="text-center">
              Tunjukkan PIN 4-digit atau QR Code ini kepada kasir saat mengambil paket
            </DialogDescription>
          </DialogHeader>

          {activeTicketOrder && (
            <div className="space-y-4 pt-2 text-xs">
              {/* Box PIN 4-Digit Besar */}
              <div className="p-4 bg-muted/60 border border-border rounded-2xl space-y-1">
                <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">
                  PIN Pengambilan Kasir
                </span>
                <span className="text-4xl font-black font-mono tracking-widest text-emerald-700 dark:text-emerald-400 block tabular-nums">
                  {activeTicketOrder.pickupCode}
                </span>
                <span className="text-[10px] text-muted-foreground block font-mono">
                  Order ID: {activeTicketOrder.id}
                </span>
              </div>

              {/* Dynamic QR Code */}
              <div className="flex justify-center p-3 bg-white rounded-xl border border-border/80 w-fit mx-auto shadow-2xs">
                <QRCodeSVG
                  value={activeTicketOrder.pickupQrData}
                  size={140}
                  level="M"
                />
              </div>

              {/* Detail Toko */}
              <div className="p-3 bg-muted/30 rounded-xl text-left space-y-1">
                <span className="font-extrabold text-foreground block">{activeTicketOrder.storeName}</span>
                <p className="text-[11px] text-muted-foreground">{activeTicketOrder.bagTitle}</p>
                <p className="text-[10px] text-emerald-600 font-semibold pt-1">
                  Status: Menunggu Pengambilan di Toko
                </p>
              </div>

              <div className="flex flex-col gap-2 pt-1">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    const ord = activeTicketOrder;
                    setActiveTicketOrder(null);
                    setActiveChatOrder(ord);
                  }}
                  className="w-full text-xs font-bold gap-1.5"
                >
                  <MessageSquare className="size-3.5 text-purple-600" />
                  <span>Chat dengan Kasir Toko</span>
                </Button>
                <Button
                  type="button"
                  onClick={() => setActiveTicketOrder(null)}
                  className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs"
                >
                  Simpan & Tutup Tiket
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ─── DRAWER / MODAL DAFTAR TIKET SAYA ─────────────────────────────────── */}
      <Dialog open={showTicketsDrawer} onOpenChange={setShowTicketsDrawer}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Tiket & Riwayat Pesanan Saya</DialogTitle>
            <DialogDescription>
              Daftar pesanan aktif dan riwayat penyelamatan makanan Anda di Cirebon
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-2 text-xs max-h-[60vh] overflow-y-auto">
            {myOrders.length === 0 ? (
              <div className="p-8 text-center bg-muted/30 border border-dashed border-border rounded-2xl space-y-2">
                <ShoppingBag className="size-8 mx-auto text-muted-foreground/60" />
                <p className="font-bold text-foreground">Belum ada pesanan</p>
                <p className="text-muted-foreground text-[11px]">
                  Pilih paket Surprise Bag pada katalog di beranda untuk memulai!
                </p>
              </div>
            ) : (
              myOrders.map((ord) => (
                <Card key={ord.id} className="border-border shadow-xs">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-black text-foreground text-sm">{ord.storeName}</span>
                          <Badge
                            variant={ord.status === "COMPLETED" ? "default" : "secondary"}
                            className={`text-[10px] font-bold ${
                              ord.status === "COMPLETED" ? "bg-emerald-600" : "bg-amber-500 text-white"
                            }`}
                          >
                            {ord.status === "COMPLETED" ? "Selesai" : "Siap Diambil"}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">{ord.bagTitle}</p>
                      </div>

                      <span className="font-black text-emerald-700 dark:text-emerald-400 tabular-nums text-sm">
                        Rp {ord.totalPrice.toLocaleString("id-ID")}
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-2.5 bg-muted/40 rounded-xl">
                      <div>
                        <span className="text-[10px] text-muted-foreground block">PIN Pengambilan:</span>
                        <span className="font-mono font-black text-base text-foreground tracking-wider">
                          {ord.pickupCode}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setShowTicketsDrawer(false);
                            setActiveChatOrder(ord);
                          }}
                          className="size-8 p-0 text-muted-foreground hover:text-foreground"
                          title="Chat Toko"
                        >
                          <MessageSquare className="size-4 text-purple-600" />
                        </Button>

                        <Button
                          size="sm"
                          onClick={() => {
                            setShowTicketsDrawer(false);
                            setActiveTicketOrder(ord);
                          }}
                          className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold h-8"
                        >
                          Buka Tiket
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* ─── MODAL AUTH & GOOGLE OAUTH LOGIN ─────────────────────────────────── */}
      <Dialog open={isAuthModalOpen} onOpenChange={setIsAuthModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Masuk ke Akun Rerasa</DialogTitle>
            <DialogDescription>
              Hubungkan akun untuk menyimpan riwayat pesanan dan porsi makanan yang Anda selamatkan
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-2 text-xs">
            {/* Google OAuth Button */}
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                const googleUser = SEED_USERS.find((u) => u.email === "fauzan@gmail.com") || SEED_USERS[0];
                handleLoginUser(googleUser);
              }}
              className="w-full h-11 border-border font-bold gap-2.5 text-xs shadow-xs hover:bg-muted/60"
            >
              <svg className="size-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Lanjutkan dengan Akun Google</span>
            </Button>

            <div className="flex items-center gap-2 my-2">
              <Separator className="flex-1" />
              <span className="text-[10px] text-muted-foreground uppercase font-bold">
                Atau Pilih Akun Demo
              </span>
              <Separator className="flex-1" />
            </div>

            {/* Quick Demo Seed Logins */}
            <div className="space-y-2">
              {[
                {
                  label: "Fauzan Rizqi Noor (Pembeli / Warga Cirebon)",
                  email: "fauzan@gmail.com",
                  badge: "Pelanggan",
                  badgeColor: "bg-emerald-600",
                  userObj: SEED_USERS.find((u) => u.email === "fauzan@gmail.com")!,
                },
                {
                  label: "Siti Rahmawati (Ruby Bakery & Cake)",
                  email: "ruby@rerasa.com",
                  badge: "Mitra Toko",
                  badgeColor: "bg-orange-600",
                  userObj: SEED_USERS.find((u) => u.email === "ruby@rerasa.com")!,
                },
                {
                  label: "Ahmad Fauzi (Head of Ops Cirebon)",
                  email: "admin@rerasa.com",
                  badge: "Super Admin",
                  badgeColor: "bg-purple-700",
                  userObj: SEED_USERS.find((u) => u.email === "admin@rerasa.com")!,
                },
              ].map((acc) => (
                <button
                  key={acc.email}
                  type="button"
                  onClick={() => handleLoginUser(acc.userObj)}
                  className="w-full flex items-center justify-between p-3 rounded-xl border border-border hover:bg-muted/50 transition-colors text-left"
                >
                  <div className="min-w-0 pr-2">
                    <span className="font-extrabold text-foreground block truncate">
                      {acc.label}
                    </span>
                    <span className="text-[10px] text-muted-foreground font-mono block">
                      {acc.email}
                    </span>
                  </div>
                  <Badge className={`${acc.badgeColor} text-white text-[10px] shrink-0 font-bold`}>
                    {acc.badge}
                  </Badge>
                </button>
              ))}
            </div>
          </div>
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
