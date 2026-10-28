"use client";

import { useState, useMemo } from "react";
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
  CalendarClock
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
import { storeService } from "@/services/storeService";

export function LandingPage() {
  const state = storeService.getState();
  const [selectedArea, setSelectedArea] = useState<string>("Semua");
  const [selectedCategory, setSelectedCategory] = useState<string>("Semua");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const stores = state.stores.filter((s) => s.status === "ACTIVE");
  const bags = state.surpriseBags.filter((b) => b.isActive);
  const metrics = storeService.getImpactMetrics();

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

  return (
    <div className="min-h-screen bg-stone-50/60 dark:bg-zinc-950 text-foreground flex flex-col font-sans selection:bg-emerald-500/20">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-md border-b border-border/70">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-xl bg-emerald-700 text-white flex items-center justify-center font-black text-lg shadow-xs">
              S
            </div>
            <div>
              <span className="font-black text-lg tracking-tight text-emerald-900 dark:text-emerald-400">
                SisaRasa
              </span>
              <span className="text-[10px] block font-semibold text-amber-700 dark:text-amber-500 uppercase tracking-wider -mt-1">
                Cirebon Raya
              </span>
            </div>
          </div>

          {/* Quick Access Links */}
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/seller"
              className={buttonVariants({
                variant: "ghost",
                size: "sm",
                className: "text-xs font-semibold gap-1.5",
              })}
            >
              <Store className="size-3.5 text-emerald-700 dark:text-emerald-400" />
              <span className="hidden sm:inline">Portal Mitra</span>
            </Link>
            <Link
              href="/admin"
              className={buttonVariants({
                variant: "ghost",
                size: "sm",
                className: "text-xs font-semibold gap-1.5",
              })}
            >
              <ShieldCheck className="size-3.5 text-purple-600" />
              <span className="hidden sm:inline">Super Admin</span>
            </Link>
            <Link
              href="/buyer"
              className={buttonVariants({
                size: "sm",
                className:
                  "bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-xs gap-1.5",
              })}
            >
              <span>Aplikasi Pembeli</span>
              <ArrowRight className="size-3.5" />
            </Link>
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
              Setiap sore dan malam, toko roti, resto empal gentong, dan kafe di Cirebon mengemas porsi surplus segar dalam Surprise Bag. Dapatkan diskon 50% hingga 70% dengan proteksi rekening penjamin platform.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                href="/buyer"
                className={buttonVariants({
                  size: "lg",
                  className: "bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm shadow-sm gap-2",
                })}
              >
                <span>Buka Katalog Makanan Hari Ini</span>
                <ArrowRight className="size-4" />
              </Link>
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
            <div className="grid grid-cols-3 gap-3 pt-4">
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
          <div className="lg:col-span-5">
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
                  Dana pembayaran Anda aman tertahan di rekening penjamin platform sampai Anda datang ke toko dan memverifikasi pesanan.
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
                  <Link
                    href="/buyer"
                    className={buttonVariants({
                      className: "w-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs text-center justify-center",
                    })}
                  >
                    Mulai Selamatkan Makanan Sekarang
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Live Interactive Explorer Directly on Landing Page */}
      <section className="py-12 max-w-6xl mx-auto px-4 w-full space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black text-foreground tracking-tight">
              Katalog Surprise Bag Hari Ini di Cirebon
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              Pilih area dan jenis makanan untuk melihat paket surplus yang siap diambil sore/malam ini
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
                  className="border-border shadow-xs hover:border-emerald-600/50 transition-colors flex flex-col justify-between"
                >
                  <CardHeader className="p-4 pb-2 space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-emerald-700 dark:text-emerald-400 truncate">
                        {store?.name || "Mitra Cirebon"}
                      </span>
                      <Badge variant="secondary" className="text-[10px] font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-900">
                        Hemat {discountPct}%
                      </Badge>
                    </div>
                    <CardTitle className="text-sm font-extrabold text-foreground leading-snug">
                      {bag.title}
                    </CardTitle>
                    <CardDescription className="text-xs line-clamp-2">
                      {bag.description}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="p-4 pt-1 space-y-3">
                    <div className="p-2.5 rounded-lg bg-muted/40 border border-border/50 text-[11px] space-y-1">
                      <div className="flex items-center justify-between text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <MapPin className="size-3 text-muted-foreground" />
                          <span>{store?.area || "Cirebon Kota"}</span>
                        </span>
                        <span className="font-bold text-foreground">
                          Sisa {bag.quotaRemaining} paket
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Clock className="size-3 text-amber-600" />
                        <span>Jam Ambil: {bag.pickupWindow}</span>
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

                      <Link
                        href={`/buyer?bag=${bag.id}`}
                        className={buttonVariants({
                          size: "sm",
                          className: "bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs",
                        })}
                      >
                        Pesan
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </section>

      {/* Edukasi Konsep: Mengapa Food Rescue Terjadi di Cirebon? */}
      <section className="py-12 border-t border-border bg-card">
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
              SisaRasa menjembatani surplus segar tersebut langsung ke konsumen Cirebon sebelum jam operasional berakhir, sehingga pedagang memulihkan biaya bahan baku dan tidak ada makanan higienis yang terbuang sia-sia.
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
            <span className="font-bold text-foreground">SisaRasa Cirebon Raya</span>
            <Separator orientation="vertical" className="h-3" />
            <span>Inisiatif Nol Makanan Terbuang</span>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/buyer" className="hover:text-emerald-700 transition-colors">
              Aplikasi Pembeli
            </Link>
            <Link href="/seller" className="hover:text-emerald-700 transition-colors">
              Portal Mitra
            </Link>
            <Link href="/admin" className="hover:text-emerald-700 transition-colors">
              Super Admin
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
