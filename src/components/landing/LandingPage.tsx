"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import {
  Clock,
  MapPin,
  Search,
  Coffee,
  Utensils,
  Wheat,
  Apple,
  ShoppingBag,
  Receipt,
  LogOut,
  ChevronDown,
  ShieldCheck,
  Building2,
  Check,
  User,
  Plus,
  Flame,
  Sparkles,
  Store as StoreIcon,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { storeService } from "@/services/storeService";
import { cartService } from "@/services/cartService";
import { FloatingCartBar } from "@/components/cart/FloatingCartBar";
import { useHorizontalScroll } from "@/hooks/useHorizontalScroll";
import { SEED_USERS } from "@/services/seedData";
import { resolveUserAvatar } from "@/lib/avatar";
import { User as UserType, SurpriseBag } from "@/types/domain";

export function LandingPage() {
  const [state, setState] = useState(storeService.getState());
  const [selectedArea, setSelectedArea] = useState<string>("Semua");
  const [selectedStoreId, setSelectedStoreId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("Semua");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isLastCallOnly, setIsLastCallOnly] = useState<boolean>(false);
  const [isAreaPickerOpen, setIsAreaPickerOpen] = useState<boolean>(false);
  const [areaSearchQuery, setAreaSearchQuery] = useState<string>("");
  const [availableAreas, setAvailableAreas] = useState<string[]>([
    "Semua",
    "Tuparev",
    "Kesambi",
    "Pekiringan",
    "Karanggetas",
    "Kejaksan",
    "Siliwangi",
    "Kartini",
    "Harjamukti",
    "Kedawung",
  ]);
  const [flyingDot, setFlyingDot] = useState<{ id: string; startX: number; startY: number } | null>(null);

  const flashSaleRef = useHorizontalScroll<HTMLDivElement>();
  const storesRef = useHorizontalScroll<HTMLDivElement>();
  const categoriesRef = useHorizontalScroll<HTMLDivElement>();

  useEffect(() => {
    const unsub = storeService.subscribe(() => {
      setState(storeService.getState());
    });
    return unsub;
  }, []);

  // Fetch dynamic locations from database / API
  useEffect(() => {
    fetch("/api/locations")
      .then((res) => res.json())
      .then((json) => {
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          const list = json.data.map((item: string) =>
            item.toLowerCase() === "semua lokasi" ? "Semua" : item
          );
          setAvailableAreas(Array.from(new Set(["Semua", ...list])));
        }
      })
      .catch((err) => {
        console.warn("Fallback to preset areas:", err);
      });
  }, []);

  const { surpriseBags: bags, stores, currentUser, orders } = state;

  // Active user orders
  const userOrders = useMemo(() => {
    return orders.filter(
      (o) =>
        o.buyerId === currentUser.id ||
        o.buyerName.toLowerCase() === currentUser.name.toLowerCase() ||
        o.buyerPhone === currentUser.phone
    );
  }, [orders, currentUser]);

  const activeTicketsCount = useMemo(() => {
    return userOrders.filter(
      (o) => o.status === "PAID" || o.status === "READY_FOR_PICKUP"
    ).length;
  }, [userOrders]);

  const handleSwitchUser = (user: UserType) => {
    storeService.setCurrentUser(user);
  };

  const filteredAreas = useMemo(() => {
    if (!areaSearchQuery.trim()) return availableAreas;
    return availableAreas.filter((a) =>
      a.toLowerCase().includes(areaSearchQuery.toLowerCase())
    );
  }, [availableAreas, areaSearchQuery]);

  // Filtering live catalog
  const filteredBags = useMemo(() => {
    return bags.filter((bag) => {
      const store = stores.find((s) => s.id === bag.storeId);
      const matchArea =
        selectedArea === "Semua" ||
        (store?.area && store.area.toLowerCase().includes(selectedArea.toLowerCase()));
      const matchStore = !selectedStoreId || bag.storeId === selectedStoreId;
      const matchCategory =
        selectedCategory === "Semua" || bag.category === selectedCategory;
      const matchSearch =
        !searchQuery.trim() ||
        bag.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        store?.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchLastCall = !isLastCallOnly || Boolean(bag.isLastCall);

      return matchArea && matchStore && matchCategory && matchSearch && matchLastCall;
    });
  }, [bags, stores, selectedArea, selectedStoreId, selectedCategory, searchQuery, isLastCallOnly]);

  // Flash Sale / Last Call Items for the Top Promo Carousel
  const flashSaleBags = useMemo(() => {
    return bags.filter((b) => b.isLastCall || b.quotaRemaining <= 3);
  }, [bags]);

  const handleAddToCart = (e: React.MouseEvent, bag: SurpriseBag) => {
    const store = stores.find((s) => s.id === bag.storeId);
    if (!store) return;

    // Trigger fly-to-cart animation
    const rect = e.currentTarget.getBoundingClientRect();
    const dot = {
      id: `${bag.id}-${Date.now()}`,
      startX: rect.left + rect.width / 2,
      startY: rect.top,
    };
    setFlyingDot(dot);

    // Add to cart
    cartService.addItem(bag, store, 1);

    setTimeout(() => {
      setFlyingDot(null);
    }, 550);
  };

  return (
    <div className="min-h-screen bg-stone-100/70 dark:bg-stone-950 flex justify-center py-0 sm:py-6 selection:bg-emerald-500/20">
      {/* Centered Mobile App Container */}
      <div className="w-full max-w-md bg-background min-h-screen sm:min-h-0 sm:rounded-3xl sm:border sm:border-border sm:shadow-xl flex flex-col justify-between relative overflow-hidden pb-16">
        
        {/* Sticky App Header */}
        <header className="sticky top-0 z-30 bg-background/95 backdrop-blur-xs border-b border-border/60 px-3.5 pt-3 pb-2.5 space-y-2">
          {/* Top Bar: Location Switcher & Profile Avatar */}
          <div className="flex items-center justify-between gap-2">
            {/* Location Selector Button */}
            <Popover open={isAreaPickerOpen} onOpenChange={setIsAreaPickerOpen}>
              <PopoverTrigger className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-muted/60 hover:bg-muted text-xs font-bold text-foreground border border-border/60 transition-colors shrink-0 max-w-[240px]">
                <MapPin className="size-3.5 text-emerald-700 dark:text-emerald-400 shrink-0" />
                <span className="truncate">
                  {selectedArea === "Semua" ? "Cirebon Kota (Semua Area)" : selectedArea}
                </span>
                <ChevronDown className="size-3 text-muted-foreground shrink-0" />
              </PopoverTrigger>
              <PopoverContent align="start" className="w-64 p-2 space-y-2">
                <div className="px-1 pt-1 text-[11px] font-black text-muted-foreground uppercase tracking-wider">
                  Pilih Wilayah Penjemputan
                </div>
                <div className="relative px-0.5">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                  <Input
                    placeholder="Cari nama area Cirebon..."
                    value={areaSearchQuery}
                    onChange={(e) => setAreaSearchQuery(e.target.value)}
                    className="pl-7.5 h-8 text-xs bg-muted/40"
                  />
                </div>
                <div className="max-h-52 overflow-y-auto space-y-0.5 px-0.5">
                  {filteredAreas.length === 0 ? (
                    <div className="py-3 text-center text-xs text-muted-foreground">
                      Wilayah tidak ditemukan.
                    </div>
                  ) : (
                    filteredAreas.map((area) => (
                      <button
                        key={area}
                        type="button"
                        onClick={() => {
                          setSelectedArea(area);
                          setIsAreaPickerOpen(false);
                          setAreaSearchQuery("");
                        }}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                          selectedArea === area
                            ? "bg-emerald-700 text-white font-bold"
                            : "hover:bg-muted text-foreground"
                        }`}
                      >
                        <span>{area === "Semua" ? "Semua Wilayah Cirebon" : area}</span>
                        {selectedArea === area && <Check className="size-3.5" />}
                      </button>
                    ))
                  )}
                </div>
              </PopoverContent>
            </Popover>

            {/* Profile Popover with Avatar */}
            <Popover>
              <PopoverTrigger className="size-8 rounded-full ring-2 ring-emerald-600/30 hover:ring-emerald-600 transition-all flex items-center justify-center overflow-hidden bg-muted">
                <Avatar className="size-full">
                  <AvatarImage
                    src={resolveUserAvatar(currentUser.avatarUrl, currentUser.name)}
                    alt={currentUser.name}
                    className="object-cover"
                  />
                  <AvatarFallback className="text-[11px] font-black bg-emerald-700 text-white">
                    {currentUser.name.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-64 p-3 space-y-3">
                <div className="flex items-center gap-2.5 pb-2 border-b border-border">
                  <Avatar className="size-10 shrink-0">
                    <AvatarImage src={resolveUserAvatar(currentUser.avatarUrl, currentUser.name)} alt={currentUser.name} />
                    <AvatarFallback className="text-xs font-bold bg-emerald-700 text-white">
                      {currentUser.name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <span className="font-extrabold text-xs block truncate text-foreground">
                      {currentUser.name}
                    </span>
                    <span className="text-[10px] text-muted-foreground block truncate">
                      {currentUser.email}
                    </span>
                    <Badge variant="secondary" className="text-[9px] font-bold mt-0.5 px-1.5 py-0 capitalize">
                      {currentUser.role.replace("_", " ")}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-1 text-xs">
                  {currentUser.role === "super_admin" && (
                    <Link
                      href="/admin"
                      className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted font-bold text-foreground transition-colors"
                    >
                      <ShieldCheck className="size-3.5 text-emerald-700" />
                      <span>Masuk Command Center Admin</span>
                    </Link>
                  )}

                  {currentUser.role === "seller" && (
                    <Link
                      href="/seller"
                      className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted font-bold text-foreground transition-colors"
                    >
                      <Building2 className="size-3.5 text-emerald-700" />
                      <span>Masuk Portal Mitra Kuliner</span>
                    </Link>
                  )}

                  <Link
                    href="/history"
                    className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-muted font-medium text-foreground transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <Receipt className="size-3.5 text-emerald-700" />
                      <span>Riwayat Pesanan Saya</span>
                    </span>
                    {activeTicketsCount > 0 && (
                      <Badge className="size-4 p-0 flex items-center justify-center bg-emerald-700 text-white text-[9px] font-bold rounded-full">
                        {activeTicketsCount}
                      </Badge>
                    )}
                  </Link>
                </div>

                <div className="pt-2 border-t border-border space-y-1">
                  <span className="text-[10px] font-bold text-muted-foreground block px-1">
                    Ganti Akun Simulasi:
                  </span>
                  <div className="grid grid-cols-3 gap-1">
                    {SEED_USERS.map((u) => (
                      <button
                        key={u.id}
                        type="button"
                        onClick={() => handleSwitchUser(u)}
                        className={`text-[10px] py-1 px-1.5 rounded-md font-bold truncate transition-colors ${
                          currentUser.id === u.id
                            ? "bg-emerald-700 text-white"
                            : "bg-muted/60 hover:bg-muted text-foreground"
                        }`}
                      >
                        {u.role === "super_admin" ? "Admin" : u.role === "seller" ? "Mitra" : "Buyer"}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-2 border-t border-border">
                  <Link
                    href="/login"
                    className="w-full flex items-center justify-center gap-1.5 text-xs text-muted-foreground hover:text-foreground font-semibold py-1"
                  >
                    <LogOut className="size-3" />
                    <span>Halaman Masuk Dedicated</span>
                  </Link>
                </div>
              </PopoverContent>
            </Popover>
          </div>

          {/* Search Input */}
          <div className="relative">
            <Search className="size-3.5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              type="text"
              placeholder="Cari roti, resto, atau area Cirebon..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="text-xs h-8 pl-8 pr-3 rounded-full bg-muted/40 border-border/60 focus-visible:ring-1 focus-visible:ring-emerald-700"
            />
          </div>
        </header>

        {/* Scrollable Content Body */}
        <main className="flex-1 overflow-y-auto space-y-3.5 pb-24">
          
          {/* 1. Eco & Food Rescue Impact Ticker */}
          <div className="px-3 pt-2">
            <div className="p-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 min-w-0">
                <span className="size-2 rounded-full bg-emerald-600 animate-pulse shrink-0" />
                <span className="text-[11px] font-bold text-emerald-950 dark:text-emerald-200 truncate">
                  Dampak Cirebon: <strong className="font-black tabular-nums">1.420+ Porsi</strong> Diselamatkan
                </span>
              </div>
              <Badge variant="outline" className="text-[9px] font-black border-emerald-600/40 text-emerald-800 dark:text-emerald-300 shrink-0">
                -2,8 Ton CO2
              </Badge>
            </div>
          </div>

          {/* 2. Urgent Flash Sale Carousel (Horizontal Cards) */}
          <section className="space-y-1.5">
            <div className="px-3 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Flame className="size-3.5 text-amber-600 fill-amber-600" />
                <h3 className="font-black text-xs text-foreground">
                  Segera Habis Malam Ini
                </h3>
                <Badge className="bg-amber-600 text-white text-[9px] font-black px-1 py-0">
                  s/d -70%
                </Badge>
              </div>
              <span className="text-[10px] text-muted-foreground">Sebelum toko tutup</span>
            </div>

            <div
              ref={flashSaleRef}
              className="w-full overflow-x-auto pb-1 px-3 scrollbar-none scroll-smooth cursor-grab active:cursor-grabbing select-none [&_*]:cursor-grab [&_*]:active:cursor-grabbing"
            >
              <div className="flex items-stretch gap-2.5 w-max">
                {flashSaleBags.map((bag) => {
                  const store = stores.find((s) => s.id === bag.storeId);
                  const discountPct = Math.round(
                    ((bag.originalPrice - bag.discountedPrice) / bag.originalPrice) * 100
                  );

                  return (
                    <div
                      key={`flash-${bag.id}`}
                      className="w-56 p-2.5 rounded-2xl bg-gradient-to-br from-amber-500/10 via-card to-background border border-amber-500/30 flex flex-col justify-between shrink-0 shadow-2xs hover:border-amber-500/60 transition-all"
                    >
                      <div className="flex items-start gap-2">
                        <img
                          src={bag.imageUrl || "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400"}
                          alt={bag.title}
                          className="size-16 rounded-xl object-cover border border-border/80 shrink-0"
                        />
                        <div className="flex-1 min-w-0 space-y-0.5">
                          <span className="text-[9px] font-bold text-amber-700 dark:text-amber-400 block truncate">
                            {store?.name}
                          </span>
                          <h4 className="font-extrabold text-[11px] text-foreground leading-tight line-clamp-2">
                            {bag.title}
                          </h4>
                          <span className="text-[9px] text-muted-foreground flex items-center gap-0.5">
                            <Clock className="size-2.5 text-amber-600 shrink-0" />
                            <span>{bag.pickupWindow}</span>
                          </span>
                        </div>
                      </div>

                      <div className="mt-2 pt-2 border-t border-border/50 flex items-center justify-between">
                        <div>
                          <div className="flex items-baseline gap-1">
                            <span className="font-black text-xs text-emerald-700 dark:text-emerald-400 tabular-nums">
                              Rp {bag.discountedPrice.toLocaleString("id-ID")}
                            </span>
                            <span className="text-[8px] text-muted-foreground line-through tabular-nums">
                              Rp {bag.originalPrice.toLocaleString("id-ID")}
                            </span>
                          </div>
                          <span className="text-[8px] font-bold text-amber-800 dark:text-amber-300">
                            Sisa {bag.quotaRemaining} porsi
                          </span>
                        </div>

                        <Button
                          size="sm"
                          onClick={(e) => handleAddToCart(e, bag)}
                          className="h-6 text-[10px] font-black bg-amber-600 hover:bg-amber-700 text-white rounded-lg px-2 gap-1 shadow-2xs cursor-pointer"
                        >
                          <Plus className="size-3" />
                          <span>Cart</span>
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          {/* 3. Popular Store Quick Bubbles (Mitra Cirebon) */}
          <section className="space-y-1.5">
            <div className="px-3 flex items-center justify-between">
              <span className="font-black text-xs text-foreground flex items-center gap-1.5">
                <StoreIcon className="size-3 text-emerald-700" />
                <span>Mitra Kuliner Populer</span>
              </span>
              {selectedStoreId && (
                <button
                  type="button"
                  onClick={() => setSelectedStoreId(null)}
                  className="text-[10px] font-bold text-emerald-700 hover:underline"
                >
                  Lihat Semua Toko
                </button>
              )}
            </div>

            <div
              ref={storesRef}
              className="w-full overflow-x-auto pb-1 px-3 scrollbar-none scroll-smooth cursor-grab active:cursor-grabbing select-none [&_*]:cursor-grab [&_*]:active:cursor-grabbing"
            >
              <div className="flex items-center gap-2 w-max">
                {stores.slice(0, 5).map((st) => {
                  const isSelected = selectedStoreId === st.id;
                  return (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() =>
                        setSelectedStoreId(isSelected ? null : st.id)
                      }
                      className={`flex items-center gap-2 p-1.5 pr-3 rounded-full border transition-all shrink-0 cursor-grab active:cursor-grabbing ${
                        isSelected
                          ? "bg-emerald-700 text-white border-emerald-700 shadow-2xs"
                          : "bg-muted/50 hover:bg-muted text-foreground border-border/70"
                      }`}
                    >
                      <Avatar className="size-6 shrink-0">
                        <AvatarFallback className="text-[9px] font-black bg-emerald-800 text-white">
                          {st.name.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="text-left">
                        <span className="text-[11px] font-extrabold block leading-none truncate max-w-[110px]">
                          {st.name}
                        </span>
                        <span className={`text-[8px] leading-tight block truncate ${isSelected ? "text-emerald-100" : "text-muted-foreground"}`}>
                          {st.area}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </section>

          {/* 4. Quick Category Bubbles */}
          <div
            ref={categoriesRef}
            className="w-full overflow-x-auto pb-1 px-3 scrollbar-none scroll-smooth cursor-grab active:cursor-grabbing select-none [&_*]:cursor-grab [&_*]:active:cursor-grabbing"
          >
            <div className="flex items-center gap-1.5 w-max">
              {[
                { id: "Semua", label: "Semua Kategori", icon: Utensils },
                { id: "Bakery & Pastry", label: "Roti & Pastry", icon: Wheat },
                { id: "Makanan Berat", label: "Makanan Berat", icon: Utensils },
                { id: "Kafe & Minuman", label: "Kafe & Kopi", icon: Coffee },
                { id: "Swalayan & Buah", label: "Bahan Segar", icon: Apple },
              ].map((cat) => {
                const Icon = cat.icon;
                const isSelected = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold shrink-0 transition-colors cursor-grab active:cursor-grabbing ${
                      isSelected
                        ? "bg-emerald-700 text-white shadow-2xs"
                        : "bg-muted/50 hover:bg-muted text-muted-foreground border border-border/50"
                    }`}
                  >
                    <Icon className="size-3" />
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 5. 3-Step Micro Guide (How It Works) */}
          <div className="px-3">
            <div className="p-3 rounded-2xl bg-muted/40 border border-border/70 space-y-2">
              <span className="text-[10px] font-black uppercase text-muted-foreground tracking-wider block">
                3 Langkah Penyelamatan Pangan SisaRasa
              </span>
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-2 rounded-xl bg-background border border-border/60 space-y-1">
                  <div className="size-6 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 mx-auto flex items-center justify-center font-black text-[11px]">
                    1
                  </div>
                  <span className="font-bold text-[10px] block leading-tight text-foreground">
                    Pilih Surprise Bag
                  </span>
                  <span className="text-[8px] text-muted-foreground block leading-none">
                    Hemat s/d 70%
                  </span>
                </div>

                <div className="p-2 rounded-xl bg-background border border-border/60 space-y-1">
                  <div className="size-6 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 mx-auto flex items-center justify-center font-black text-[11px]">
                    2
                  </div>
                  <span className="font-bold text-[10px] block leading-tight text-foreground">
                    Bayar QRIS Instan
                  </span>
                  <span className="text-[8px] text-muted-foreground block leading-none">
                    Dana Escrow Aman
                  </span>
                </div>

                <div className="p-2 rounded-xl bg-background border border-border/60 space-y-1">
                  <div className="size-6 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 mx-auto flex items-center justify-center font-black text-[11px]">
                    3
                  </div>
                  <span className="font-bold text-[10px] block leading-tight text-foreground">
                    Ambil di Toko
                  </span>
                  <span className="text-[8px] text-muted-foreground block leading-none">
                    Tunjukkan No. Pesanan
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 6. Section Heading & Result Count */}
          <div className="px-3 flex items-center justify-between text-xs pt-1">
            <span className="font-extrabold text-foreground">
              Paket Makanan di Sekitarmu
            </span>
            <span className="text-[10px] text-muted-foreground">
              {filteredBags.length} paket siap ambil
            </span>
          </div>

          {/* 7. 2-Column Marketplace Product Grid (Dense & Actionable) */}
          <div className="px-3">
            {filteredBags.length === 0 ? (
              <div className="py-12 text-center space-y-2">
                <ShoppingBag className="size-8 text-muted-foreground mx-auto stroke-1" />
                <p className="text-xs font-bold text-foreground">Tidak ada paket makanan aktif</p>
                <p className="text-[11px] text-muted-foreground max-w-xs mx-auto">
                  Coba ubah filter kategori atau pilih wilayah Cirebon lainnya
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setSelectedArea("Semua");
                    setSelectedStoreId(null);
                    setSelectedCategory("Semua");
                    setSearchQuery("");
                    setIsLastCallOnly(false);
                  }}
                  className="text-xs font-semibold"
                >
                  Reset Semua Filter
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {filteredBags.map((bag) => {
                  const store = stores.find((s) => s.id === bag.storeId);
                  const discountPct = Math.round(
                    ((bag.originalPrice - bag.discountedPrice) / bag.originalPrice) * 100
                  );

                  return (
                    <Card
                      key={bag.id}
                      className="border-border/80 rounded-xl shadow-2xs overflow-hidden flex flex-col justify-between hover:border-emerald-600/40 transition-all group bg-card"
                    >
                      {/* Compact Photo */}
                      <div className="relative h-24 sm:h-28 w-full overflow-hidden bg-muted">
                        <img
                          src={bag.imageUrl || "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600"}
                          alt={bag.title}
                          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                        />

                        {/* Top Overlay Badges */}
                        <div className="absolute top-1 left-1 flex flex-col gap-0.5 items-start">
                          <span className="px-1 py-0.5 rounded text-[8px] font-black bg-amber-600 text-white shadow-2xs leading-none">
                            -{discountPct}%
                          </span>
                          {bag.isLastCall && (
                            <span className="px-1 py-0.5 rounded text-[7px] font-black bg-stone-900/90 text-amber-300 shadow-2xs uppercase leading-none">
                              Last Call
                            </span>
                          )}
                        </div>

                        {/* Quota Indicator */}
                        <div className="absolute bottom-1 left-1">
                          <span className="px-1 py-0.5 rounded text-[8px] font-bold bg-background/90 backdrop-blur-xs text-foreground shadow-2xs leading-none">
                            Sisa {bag.quotaRemaining}
                          </span>
                        </div>
                      </div>

                      {/* Compact Card Information */}
                      <div className="p-2 space-y-1 flex-1 flex flex-col justify-between">
                        <div className="space-y-0.5">
                          <span className="text-[9px] font-bold text-emerald-700 dark:text-emerald-400 block truncate leading-tight">
                            {store?.name || "Mitra Cirebon"}
                          </span>
                          <h4 className="font-extrabold text-[10px] text-foreground leading-tight line-clamp-2 min-h-[24px]">
                            {bag.title}
                          </h4>
                          <span className="flex items-center gap-0.5 text-[8px] text-muted-foreground truncate">
                            <Clock className="size-2 text-amber-600 shrink-0" />
                            <span>{bag.pickupWindow}</span>
                          </span>
                        </div>

                        {/* Price & Dual Action Buttons (Tambah Keranjang & Beli Langsung) */}
                        <div className="pt-1 border-t border-border/50 space-y-1.5">
                          <div className="flex items-baseline gap-1">
                            <span className="font-black text-[11px] text-emerald-700 dark:text-emerald-400 tabular-nums">
                              Rp {bag.discountedPrice.toLocaleString("id-ID")}
                            </span>
                            <span className="text-[8px] text-muted-foreground line-through tabular-nums">
                              Rp {bag.originalPrice.toLocaleString("id-ID")}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-1">
                            <button
                              type="button"
                              onClick={(e) => handleAddToCart(e, bag)}
                              className="h-6 flex items-center justify-center gap-0.5 rounded-md bg-muted/80 hover:bg-muted text-foreground text-[9px] font-bold border border-border/70 transition-colors cursor-pointer"
                            >
                              <Plus className="size-2.5" />
                              <span>Cart</span>
                            </button>

                            <Link
                              href={`/checkout?bagId=${bag.id}`}
                              className="h-6 flex items-center justify-center rounded-md bg-emerald-700 hover:bg-emerald-800 text-white text-[9px] font-black shadow-2xs transition-colors"
                            >
                              Beli
                            </Link>
                          </div>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </main>

        {/* Dynamic Flying Dot Indicator Animation */}
        {flyingDot && (
          <div
            className="fixed z-50 pointer-events-none size-4 rounded-full bg-amber-500 shadow-md animate-bounce"
            style={{
              left: flyingDot.startX,
              top: flyingDot.startY,
              transition: "all 0.5s cubic-bezier(0.2, 0.8, 0.2, 1)",
            }}
          />
        )}

        {/* Floating Cart Bar (Sticky above navigation) */}
        <FloatingCartBar />

        {/* Floating Bottom App Navigation */}
        <nav className="fixed bottom-0 sm:absolute z-30 left-0 right-0 max-w-md mx-auto bg-background/95 backdrop-blur-xs border-t border-border/80 px-4 py-2 flex items-center justify-around">
          <Link
            href="/"
            onClick={() => {
              setSelectedArea("Semua");
              setSelectedStoreId(null);
              setSelectedCategory("Semua");
              setIsLastCallOnly(false);
            }}
            className="flex flex-col items-center gap-0.5 text-emerald-700 dark:text-emerald-400"
          >
            <ShoppingBag className="size-5" />
            <span className="text-[10px] font-extrabold">Jelajah</span>
          </Link>

          <Link
            href="/history"
            className="flex flex-col items-center gap-0.5 text-muted-foreground hover:text-foreground relative transition-colors"
          >
            <Receipt className="size-5" />
            <span className="text-[10px] font-bold">Riwayat</span>
            {activeTicketsCount > 0 && (
              <span className="size-2 rounded-full bg-emerald-600 absolute top-0 right-3" />
            )}
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
