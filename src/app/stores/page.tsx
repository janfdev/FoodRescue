"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Search,
  Store as StoreIcon,
  MapPin,
  Clock,
  Star,
  Package,
  ShieldCheck,
  ChevronRight,
  Compass,
  ShoppingCart,
  Receipt,
  User,
  SlidersHorizontal,
  ExternalLink,
  CheckCircle2
} from "lucide-react";
import { storeService } from "@/services/storeService";
import { cartService } from "@/services/cartService";
import { Store, SurpriseBag, StoreCategory } from "@/types/domain";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

const CATEGORIES: ("Semua" | StoreCategory)[] = [
  "Semua",
  "Bakery & Pastry",
  "Makanan Berat",
  "Kafe & Minuman",
  "Swalayan & Buah"
];

export default function StoresDirectoryPage() {
  const router = useRouter();
  const [state, setState] = useState(storeService.getState());
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<"Semua" | StoreCategory>("Semua");
  const [selectedArea, setSelectedArea] = useState<string>("Semua");
  const [onlyOpen, setOnlyOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    const syncData = () => {
      setState(storeService.getState());
      setCartCount(cartService.getItems().reduce((acc, curr) => acc + curr.quantity, 0));
    };
    syncData();
    const unsubStore = storeService.subscribe(syncData);
    const unsubCart = cartService.subscribe(syncData);
    return () => {
      unsubStore();
      unsubCart();
    };
  }, []);

  // Distinct areas from active stores
  const distinctAreas = useMemo(() => {
    const set = new Set<string>();
    state.stores.forEach((s) => {
      if (s.area) set.add(s.area);
    });
    return ["Semua", ...Array.from(set)];
  }, [state.stores]);

  // Filtered stores
  const filteredStores = useMemo(() => {
    return state.stores.filter((store) => {
      // Must not be suspended
      if (store.status === "SUSPENDED") return false;

      // Category filter
      if (selectedCategory !== "Semua" && store.category !== selectedCategory) {
        return false;
      }

      // Area filter
      if (selectedArea !== "Semua" && store.area !== selectedArea) {
        return false;
      }

      // Open status filter
      if (onlyOpen && !store.isOpen) {
        return false;
      }

      // Search Query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = store.name.toLowerCase().includes(q);
        const matchArea = store.area.toLowerCase().includes(q);
        const matchAddr = store.address.toLowerCase().includes(q);
        const matchCat = store.category.toLowerCase().includes(q);
        if (!matchName && !matchArea && !matchAddr && !matchCat) {
          return false;
        }
      }

      return true;
    });
  }, [state.stores, selectedCategory, selectedArea, onlyOpen, searchQuery]);

  // Bags count lookup per store
  const bagCountMap = useMemo(() => {
    const map = new Map<string, number>();
    state.surpriseBags.forEach((bag) => {
      if (bag.isActive && bag.quotaRemaining > 0) {
        map.set(bag.storeId, (map.get(bag.storeId) || 0) + 1);
      }
    });
    return map;
  }, [state.surpriseBags]);

  return (
    <div className="min-h-screen bg-stone-100/70 dark:bg-stone-950 flex justify-center py-0 sm:py-6 selection:bg-emerald-500/20">
      {/* Centered Mobile-First Container */}
      <div className="w-full max-w-md bg-background min-h-screen sm:min-h-0 sm:rounded-3xl sm:border sm:border-border sm:shadow-xl flex flex-col justify-between relative overflow-hidden pb-16">
        
        {/* Sticky App Header */}
        <header className="sticky top-0 z-30 bg-background/95 backdrop-blur-xs border-b border-border/60 px-3.5 pt-3 pb-2.5 space-y-2">
          {/* Top Bar with Back Action & Title */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.push("/")}
                className="size-8 rounded-full border border-border/60 bg-card hover:bg-muted"
                aria-label="Kembali ke Beranda"
              >
                <ArrowLeft className="size-4 text-foreground" />
              </Button>
              <div>
                <h1 className="font-extrabold text-sm text-foreground flex items-center gap-1.5 leading-none">
                  <StoreIcon className="size-3.5 text-emerald-700" />
                  <span>Mitra Kuliner Resmi</span>
                </h1>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  {state.stores.filter((s) => s.status === "ACTIVE").length} Toko Aktif di Cirebon Raya
                </p>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push("/register-seller")}
              className="text-[10px] font-bold h-7 px-2.5 rounded-full border-emerald-600/30 text-emerald-800 dark:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20"
            >
              + Gabung Mitra
            </Button>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Cari toko, nama jalan, atau kuliner..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 h-8 text-xs rounded-xl bg-muted/40 border-border/60 focus-visible:ring-1 focus-visible:ring-emerald-600"
            />
          </div>

          {/* Category Filter Pills (Horizontal Scrollable) */}
          <div className="w-full overflow-x-auto pb-0.5 scrollbar-none">
            <div className="flex items-center gap-1.5 w-max">
              {CATEGORIES.map((cat) => {
                const isSelected = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition-all border shrink-0 ${
                      isSelected
                        ? "bg-emerald-700 text-white border-emerald-700 shadow-2xs"
                        : "bg-card text-muted-foreground border-border/70 hover:border-border hover:text-foreground"
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>
        </header>

        {/* Scrollable Content Body */}
        <main className="flex-1 overflow-y-auto p-3 space-y-3 pb-24">
          
          {/* Secondary Filter: Area & Open Status Toggle */}
          <div className="flex items-center justify-between gap-2 px-1 text-xs">
            {/* Area Pills or Selector */}
            <div className="flex items-center gap-1 overflow-x-auto scrollbar-none py-0.5 max-w-[70%]">
              <span className="text-[10px] font-semibold text-muted-foreground shrink-0 flex items-center gap-0.5">
                <MapPin className="size-2.5" />
                <span>Area:</span>
              </span>
              {distinctAreas.map((area) => (
                <button
                  key={area}
                  type="button"
                  onClick={() => setSelectedArea(area)}
                  className={`text-[9px] px-2 py-0.5 rounded-md font-bold whitespace-nowrap transition-colors ${
                    selectedArea === area
                      ? "bg-emerald-600/15 text-emerald-800 dark:text-emerald-300 border border-emerald-600/30"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {area}
                </button>
              ))}
            </div>

            {/* Only Open Toggle */}
            <button
              type="button"
              onClick={() => setOnlyOpen(!onlyOpen)}
              className={`text-[9px] font-bold px-2 py-1 rounded-lg border transition-all shrink-0 ${
                onlyOpen
                  ? "bg-emerald-600 text-white border-emerald-600"
                  : "bg-muted/40 text-muted-foreground border-border/60 hover:text-foreground"
              }`}
            >
              {onlyOpen ? "✓ Buka Saja" : "Semua Status"}
            </button>
          </div>

          {/* Result Count Info */}
          <div className="px-1 flex items-center justify-between text-[11px] text-muted-foreground">
            <span>Menampilkan <strong>{filteredStores.length}</strong> mitra kuliner</span>
            {(selectedCategory !== "Semua" || selectedArea !== "Semua" || searchQuery || onlyOpen) && (
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory("Semua");
                  setSelectedArea("Semua");
                  setSearchQuery("");
                  setOnlyOpen(false);
                }}
                className="text-[10px] font-bold text-emerald-700 hover:underline cursor-pointer"
              >
                Reset Filter
              </button>
            )}
          </div>

          {/* Empty State */}
          {filteredStores.length === 0 && (
            <Card className="p-8 text-center border-dashed border-border/80 bg-muted/20 space-y-3">
              <div className="size-12 rounded-2xl bg-muted/60 flex items-center justify-center mx-auto text-muted-foreground">
                <StoreIcon className="size-6" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-xs text-foreground">Tidak Ada Mitra yang Sesuai</h3>
                <p className="text-[10px] text-muted-foreground">
                  Coba ubah kata kunci pencarian atau reset filter kategori kuliner.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedCategory("Semua");
                  setSelectedArea("Semua");
                  setSearchQuery("");
                  setOnlyOpen(false);
                }}
                className="text-xs font-bold rounded-xl"
              >
                Tampilkan Semua Toko
              </Button>
            </Card>
          )}

          {/* Store List Cards */}
          <div className="space-y-2.5">
            {filteredStores.map((store) => {
              const activeBagCount = bagCountMap.get(store.id) || 0;
              const isPending = store.status === "PENDING_APPROVAL";

              return (
                <Card
                  key={store.id}
                  className="p-3 border border-border/70 hover:border-emerald-600/40 bg-card rounded-2xl shadow-2xs hover:shadow-xs transition-all space-y-2.5"
                >
                  {/* Top Header: Logo, Store Name, Badges */}
                  <div className="flex items-start gap-3">
                    {/* SVG Branded Logo Badge */}
                    <div className="size-14 rounded-2xl overflow-hidden shrink-0 border border-border/60 bg-muted/20 p-1 flex items-center justify-center shadow-2xs">
                      {store.logoUrl ? (
                        <img
                          src={store.logoUrl}
                          alt={store.name}
                          className="size-full object-contain"
                        />
                      ) : (
                        <div className="size-full bg-emerald-600 text-white font-black text-sm flex items-center justify-center rounded-xl">
                          {store.name.slice(0, 2).toUpperCase()}
                        </div>
                      )}
                    </div>

                    {/* Store Title & Details */}
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center justify-between gap-1">
                        <Badge
                          variant="secondary"
                          className="text-[9px] font-bold px-1.5 py-0 bg-muted text-muted-foreground"
                        >
                          {store.category}
                        </Badge>
                        
                        {/* Open / Closed Status Badge */}
                        {isPending ? (
                          <Badge variant="outline" className="text-[9px] font-bold border-amber-500/40 text-amber-700 bg-amber-500/10">
                            Menunggu Verifikasi
                          </Badge>
                        ) : store.isOpen ? (
                          <span className="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded-full border border-emerald-500/20">
                            <span className="size-1.5 rounded-full bg-emerald-600 animate-pulse" />
                            <span>Buka</span>
                          </span>
                        ) : (
                          <span className="text-[9px] font-bold text-muted-foreground bg-muted/60 px-1.5 py-0.5 rounded-full">
                            Tutup
                          </span>
                        )}
                      </div>

                      <h2 className="font-extrabold text-xs text-foreground truncate leading-tight">
                        {store.name}
                      </h2>

                      <p className="text-[10px] text-muted-foreground flex items-center gap-1 truncate">
                        <MapPin className="size-2.5 text-emerald-700 shrink-0" />
                        <span>{store.area}</span>
                        <span>•</span>
                        <span className="truncate">{store.address}</span>
                      </p>
                    </div>
                  </div>

                  {/* Highlights Bar: Rating, Pickup Window, Box Compliance */}
                  <div className="grid grid-cols-3 gap-1.5 py-1.5 px-2 rounded-xl bg-muted/30 border border-border/40 text-[10px]">
                    <div className="flex items-center gap-1">
                      <Star className="size-3 fill-amber-400 text-amber-400 shrink-0" />
                      <span className="font-bold text-foreground tabular-nums">
                        {store.rating.toFixed(1)}
                      </span>
                      <span className="text-[8px] text-muted-foreground">
                        ({store.reviewCount})
                      </span>
                    </div>

                    <div className="flex items-center gap-1 text-muted-foreground truncate">
                      <Clock className="size-2.5 text-amber-600 shrink-0" />
                      <span className="text-[9px] font-medium truncate">
                        {store.pickupStartTime} - {store.pickupEndTime}
                      </span>
                    </div>

                    <div className="flex items-center justify-end gap-1 text-emerald-700 dark:text-emerald-400 font-bold text-[9px]">
                      <ShieldCheck className="size-2.5 shrink-0" />
                      <span>{store.boxComplianceRate || 100}% Box</span>
                    </div>
                  </div>

                  {/* Bottom Action Footer */}
                  <div className="pt-1 border-t border-border/50 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1 text-[10px]">
                      <Package className="size-3 text-emerald-700 shrink-0" />
                      {activeBagCount > 0 ? (
                        <span className="font-bold text-emerald-800 dark:text-emerald-300">
                          {activeBagCount} Paket Tersedia
                        </span>
                      ) : (
                        <span className="text-muted-foreground">
                          Paket belum terbit
                        </span>
                      )}
                    </div>

                    {/* View Store Catalog CTA */}
                    <Button
                      size="sm"
                      onClick={() => router.push(`/?storeId=${store.id}`)}
                      className="h-7 px-3 text-[10px] font-bold rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white flex items-center gap-1"
                    >
                      <span>Lihat Menu</span>
                      <ChevronRight className="size-3" />
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        </main>

        {/* Floating Bottom App Navigation */}
        {/* Floating Bottom App Navigation (4 Primary Tabs) */}
        <nav className="fixed bottom-0 sm:absolute z-30 left-0 right-0 max-w-md mx-auto bg-background/95 backdrop-blur-xs border-t border-border/80 px-4 py-2 flex items-center justify-around">
          <Link
            href="/"
            className="flex flex-col items-center gap-0.5 text-muted-foreground hover:text-foreground transition-colors"
          >
            <Compass className="size-5" />
            <span className="text-[10px] font-bold">Jelajah</span>
          </Link>

          <Link
            href="/cart"
            className="flex flex-col items-center gap-0.5 text-muted-foreground hover:text-foreground relative transition-colors cursor-pointer"
          >
            <div className="relative">
              <ShoppingCart className="size-5" />
              {cartCount > 0 && (
                <span className="size-4 rounded-full bg-amber-500 text-stone-950 text-[9px] font-black flex items-center justify-center absolute -top-1 -right-2 tabular-nums shadow-xs">
                  {cartCount}
                </span>
              )}
            </div>
            <span className="text-[10px] font-bold">Keranjang</span>
          </Link>

          <Link
            href="/history"
            className="flex flex-col items-center gap-0.5 text-muted-foreground hover:text-foreground relative transition-colors"
          >
            <Receipt className="size-5" />
            <span className="text-[10px] font-bold">Riwayat</span>
          </Link>

          <Link
            href="/account"
            className="flex flex-col items-center gap-0.5 text-muted-foreground hover:text-foreground transition-colors"
          >
            <User className="size-5" />
            <span className="text-[10px] font-bold">Akun</span>
          </Link>
        </nav>
      </div>
    </div>
  );
}
