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
  ShoppingCart,
  Compass,
  Receipt,
  ChevronDown,
  ShieldCheck,
  Building2,
  Check,
  User,
  Plus,
  Flame,
  Store as StoreIcon,
  ChevronRight,
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
import { storeService, DEFAULT_INITIAL_STATE } from "@/services/storeService";
import { cartService, CartItem } from "@/services/cartService";
import { FloatingCartBar } from "@/components/cart/FloatingCartBar";
import { LandingDetailModal } from "@/components/landing/LandingDetailModal";
import { FlashSaleSection } from "@/components/landing/FlashSaleSection";
import { TestimonialSection } from "@/components/landing/TestimonialSection";
import { useHorizontalScroll } from "@/hooks/useHorizontalScroll";
import { resolveUserAvatar } from "@/lib/avatar";
import { useSession } from "@/lib/auth-client";
import { User as UserType, SurpriseBag } from "@/types/domain";
import {
  useStores,
  useBags,
  useLocations,
  useCategories,
} from "@/hooks/use-queries";

export function LandingPage() {
  const [state, setState] = useState(DEFAULT_INITIAL_STATE);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [selectedArea, setSelectedArea] = useState<string>("Semua");
  const [selectedStoreId, setSelectedStoreId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("Semua");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isLastCallOnly, setIsLastCallOnly] = useState<boolean>(false);
  const [isAreaPickerOpen, setIsAreaPickerOpen] = useState<boolean>(false);
  const [areaSearchQuery, setAreaSearchQuery] = useState<string>("");
  const [flyingDot, setFlyingDot] = useState<{ startX: number; startY: number } | null>(null);
  const [selectedBagForModal, setSelectedBagForModal] = useState<SurpriseBag | null>(null);

  // SWR hooks strictly reading from database via API
  const { stores: dbStores, isLoading: isStoresLoading } = useStores();
  const { bags: dbBags, isLoading: isBagsLoading } = useBags();
  const { locations: dbLocations, isLoading: isLocationsLoading } = useLocations();
  const { categories: dbCategories, isLoading: isCategoriesLoading } = useCategories();

  const flashSaleRef = useHorizontalScroll<HTMLDivElement>();
  const storesRef = useHorizontalScroll<HTMLDivElement>();
  const categoriesRef = useHorizontalScroll<HTMLDivElement>();

  useEffect(() => {
    setState(storeService.getState());
    const unsub = storeService.subscribe(() => {
      setState(storeService.getState());
    });
    return unsub;
  }, []);

  // Synchronize cartService state dynamically
  useEffect(() => {
    setCartItems([...cartService.getItems()]);
    const unsubCart = cartService.subscribe(() => {
      setCartItems([...cartService.getItems()]);
    });
    return unsubCart;
  }, []);

  // Sync DB data into storeService for seamless cart & checkout support
  useEffect(() => {
    storeService.setStores(dbStores);
  }, [dbStores]);

  useEffect(() => {
    storeService.setSurpriseBags(dbBags);
  }, [dbBags]);

  // Dynamic available areas strictly derived from PostgreSQL database
  const availableAreas = useMemo(() => {
    if (!dbLocations || dbLocations.length === 0) return ["Semua"];
    const list = dbLocations.map((item) =>
      item.toLowerCase() === "semua lokasi" ? "Semua" : item
    );
    return Array.from(new Set(["Semua", ...list]));
  }, [dbLocations]);

  const { data: session } = useSession();
  const { orders } = state;

  // Use database entities as single source of truth
  const stores = dbStores;
  const bags = dbBags;

  // Resolusi Pengguna: Prioritas Session Login Riil (Google/Auth)
  const currentUser: UserType | null = useMemo(() => {
    if (session?.user) {
      return {
        id: session.user.id,
        name: session.user.name || "Pengguna",
        email: session.user.email || "",
        phone: ((session.user as Record<string, unknown>).phone as string) || "",
        role: (((session.user as Record<string, unknown>).role as UserType["role"])) || "buyer",
        avatarUrl:
          session.user.image ||
          ((session.user as Record<string, unknown>).avatarUrl as string) ||
          resolveUserAvatar(undefined, session.user.name || session.user.email),
        storeId: ((session.user as Record<string, unknown>).storeId as string) || undefined,
        status: "ACTIVE",
      };
    }
    return state.currentUser;
  }, [session, state.currentUser]);

  // Sinkronisasi session ke storeService untuk flow transaksi
  useEffect(() => {
    if (session?.user && currentUser && (!state.currentUser || session.user.id !== state.currentUser.id)) {
      storeService.setCurrentUser(currentUser);
    }
  }, [session, currentUser, state.currentUser]);

  // Active user orders
  const userOrders = useMemo(() => {
    if (!currentUser) return [];
    return orders.filter(
      (o) =>
        o.buyerId === currentUser.id ||
        o.buyerName.toLowerCase() === currentUser.name.toLowerCase() ||
        (currentUser.phone && o.buyerPhone === currentUser.phone)
    );
  }, [orders, currentUser]);

  const activeTicketsCount = useMemo(() => {
    return userOrders.filter(
      (o) => o.status === "PAID" || o.status === "READY_FOR_PICKUP"
    ).length;
  }, [userOrders]);

  const cartTotalCount = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + item.quantity, 0);
  }, [cartItems]);

  const filteredAreas = useMemo(() => {
    if (!areaSearchQuery.trim()) return availableAreas;
    return availableAreas.filter((a) =>
      a.toLowerCase().includes(areaSearchQuery.toLowerCase())
    );
  }, [availableAreas, areaSearchQuery]);

  // Filtering live catalog from DB
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

  // Flash Sale / Last Call Items from DB
  const flashSaleBags = useMemo(() => {
    return bags.filter((b) => b.isLastCall || b.quotaRemaining <= 3);
  }, [bags]);

  // Dynamic impact metrics calculated from real data
  const impactMetrics = useMemo(() => {
    const totalOrders = orders.filter((o) => o.status === "COMPLETED" || o.status === "PAID").length;
    const count = totalOrders > 0 ? totalOrders : bags.reduce((acc, b) => acc + (b.quotaToday - b.quotaRemaining), 0);
    const kg = Math.round(count * 0.8 * 10) / 10;
    return {
      meals: count > 0 ? `${count}+ Porsi` : "0 Porsi",
      kg: kg > 0 ? `-${kg} Kg CO2` : "0 Kg CO2",
    };
  }, [orders, bags]);

  const handleAddToCart = (e: React.MouseEvent, bag: SurpriseBag) => {
    const store = stores.find((s) => s.id === bag.storeId) || {
      id: bag.storeId,
      name: "Mitra Kuliner",
      category: bag.category,
      address: "Cirebon",
      area: "Cirebon Kota",
      latitude: -6.7172,
      longitude: 108.5412,
      rating: 4.8,
      reviewCount: 50,
      isOpen: true,
      status: "ACTIVE" as const,
      pickupStartTime: "19:00",
      pickupEndTime: "21:00",
      boxComplianceRate: 98,
      boxesSoldTotal: 100,
      currentBoxStock: 50,
      walletBalance: 0,
    };

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

  const openCartDrawer = () => {
    const trigger = document.getElementById("cart-target-icon");
    if (trigger) {
      trigger.click();
    }
  };

  // Icon mapper helper based on category name
  const getCategoryIcon = (catName: string) => {
    const lower = catName.toLowerCase();
    if (lower.includes("bakery") || lower.includes("roti") || lower.includes("pastry")) return Wheat;
    if (lower.includes("kafe") || lower.includes("kopi") || lower.includes("minuman") || lower.includes("coffee")) return Coffee;
    if (lower.includes("buah") || lower.includes("swalayan") || lower.includes("segar")) return Apple;
    return Utensils;
  };

  return (
    <div className="min-h-screen bg-stone-100/70 dark:bg-stone-950 flex justify-center py-0 sm:py-6 selection:bg-emerald-500/20">
      {/* Centered Mobile App Container */}
      <div className="w-full max-w-md bg-background min-h-screen sm:min-h-0 sm:rounded-3xl sm:border sm:border-border sm:shadow-xl flex flex-col justify-between relative overflow-hidden pb-16">

        {/* Sticky App Header */}
        <header className="sticky top-0 z-30 bg-background/95 backdrop-blur-xs border-b border-border/60 px-3.5 pt-3 pb-2.5 space-y-2">
          {/* Top Bar: Location Switcher, Cart Badge & Profile Avatar */}
          <div className="flex items-center justify-between gap-2">
            {/* Location Selector Button */}
            <Popover open={isAreaPickerOpen} onOpenChange={setIsAreaPickerOpen}>
              <PopoverTrigger className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-muted/60 hover:bg-muted text-xs font-bold text-foreground border border-border/60 transition-colors shrink-0 max-w-[210px]">
                <MapPin className="size-3.5 text-emerald-700 dark:text-emerald-400 shrink-0" />
                <span className="truncate">
                  {selectedArea === "Semua" ? "Semua Lokasi Mitra" : selectedArea}
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
                    placeholder="Cari lokasi mitra di database..."
                    value={areaSearchQuery}
                    onChange={(e) => setAreaSearchQuery(e.target.value)}
                    className="pl-7.5 h-8 text-xs bg-muted/40"
                  />
                </div>
                <div className="max-h-52 overflow-y-auto space-y-0.5 px-0.5">
                  {isLocationsLoading && availableAreas.length <= 1 ? (
                    <div className="py-3 text-center text-xs text-muted-foreground">
                      Memuat lokasi dari database...
                    </div>
                  ) : filteredAreas.length === 0 ? (
                    <div className="py-3 text-center text-xs text-muted-foreground">
                      Wilayah tidak ditemukan di database.
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
                        <span>{area === "Semua" ? "Semua Wilayah Toko" : area}</span>
                        {selectedArea === area && <Check className="size-3.5" />}
                      </button>
                    ))
                  )}
                </div>
              </PopoverContent>
            </Popover>

            {/* Right Header Section: Cart Trigger & Profile */}
            <div className="flex items-center gap-1.5 shrink-0">
              {/* Cart Button with Live Counter Badge */}
              <button
                type="button"
                onClick={openCartDrawer}
                className="relative size-8 rounded-full ring-1 ring-border/80 hover:bg-muted transition-all flex items-center justify-center text-foreground cursor-pointer"
                aria-label="Buka Keranjang Belanja"
              >
                <ShoppingCart className="size-4 text-emerald-700 dark:text-emerald-400" />
                {cartTotalCount > 0 && (
                  <span className="absolute -top-1 -right-1 size-4.5 bg-amber-500 text-stone-950 text-[10px] font-black rounded-full flex items-center justify-center tabular-nums shadow-xs">
                    {cartTotalCount}
                  </span>
                )}
              </button>

              {/* Profile Avatar Popover or Login Button */}
              {currentUser ? (
                <Popover>
                  <PopoverTrigger className="size-8 rounded-full ring-2 ring-emerald-600/30 hover:ring-emerald-600 transition-all flex items-center justify-center overflow-hidden bg-muted cursor-pointer">
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
                      {(currentUser.role === "admin" || (currentUser.role as string) === "super_admin") && (
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

                    <div className="pt-2 border-t border-border flex flex-col gap-1">
                      <Link
                        href="/account"
                        className="w-full flex items-center justify-center gap-1.5 text-xs text-foreground hover:bg-muted font-semibold py-1.5 rounded-lg transition-colors"
                      >
                        <User className="size-3.5 text-muted-foreground" />
                        <span>Profil & Pengaturan Akun</span>
                      </Link>
                    </div>
                  </PopoverContent>
                </Popover>
              ) : (
                <Link
                  href="/login"
                  className="h-8 px-3 rounded-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs inline-flex items-center gap-1.5 shadow-2xs transition-colors"
                  aria-label="Masuk ke Akun"
                >
                  <User className="size-3.5" />
                  <span>Masuk</span>
                </Link>
              )}
            </div>
          </div>

          {/* Search Input Bar with Filter Toggle */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
              <Input
                placeholder="Cari roti, makanan berat, atau nama mitra..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 h-8.5 text-xs bg-muted/40 border-border/80 focus-visible:ring-emerald-600"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Quick Filter: Last Call / Flash Sale */}
            <Button
              size="sm"
              variant={isLastCallOnly ? "default" : "outline"}
              onClick={() => setIsLastCallOnly(!isLastCallOnly)}
              className={`h-8.5 px-2.5 text-[11px] font-bold gap-1 shrink-0 transition-all cursor-pointer ${
                isLastCallOnly
                  ? "bg-amber-600 hover:bg-amber-700 text-white border-amber-600 shadow-2xs"
                  : "hover:bg-muted border-border/80 text-muted-foreground"
              }`}
            >
              <Flame className={`size-3.5 ${isLastCallOnly ? "fill-white text-white" : "text-amber-600"}`} />
              <span>Last Call</span>
            </Button>
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
                  Dampak Makanan: <strong className="font-black tabular-nums">{impactMetrics.meals}</strong> Terselamatkan
                </span>
              </div>
              <Badge variant="outline" className="text-[9px] font-black border-emerald-600/40 text-emerald-800 dark:text-emerald-300 shrink-0">
                {impactMetrics.kg}
              </Badge>
            </div>
          </div>

          {/* 2. Urgent Flash Sale Carousel (Horizontal Cards dari Database) */}
          <FlashSaleSection
            bags={flashSaleBags}
            stores={stores}
            cartItems={cartItems}
            isLoading={isBagsLoading}
            scrollRef={flashSaleRef}
            onSelectBag={setSelectedBagForModal}
            onAddToCart={handleAddToCart}
          />

          {/* 3. Popular Store Quick Bubbles (Mitra Aktif Langsung dari Database) */}
          <section className="space-y-1.5">
            <div className="px-3 flex items-center justify-between">
              <span className="font-black text-xs text-foreground flex items-center gap-1.5">
                <StoreIcon className="size-3 text-emerald-700" />
                <span>Mitra Kuliner Aktif</span>
              </span>
              <div className="flex items-center gap-2">
                {selectedStoreId && (
                  <button
                    type="button"
                    onClick={() => setSelectedStoreId(null)}
                    className="text-[10px] font-bold text-amber-700 dark:text-amber-400 hover:underline cursor-pointer"
                  >
                    Reset Filter
                  </button>
                )}
                <Link
                  href="/toko"
                  className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 hover:underline cursor-pointer flex items-center gap-0.5"
                >
                  <span>Lihat Semua Toko</span>
                  <ChevronRight className="size-2.5" />
                </Link>
              </div>
            </div>

            <div
              ref={storesRef}
              className="w-full overflow-x-auto pb-1 px-3 scrollbar-none scroll-smooth cursor-grab active:cursor-grabbing select-none [&_*]:cursor-grab [&_*]:active:cursor-grabbing"
            >
              <div className="flex items-center gap-2 w-max">
                {isStoresLoading && stores.length === 0 ? (
                  <div className="flex items-center gap-2 py-1">
                    {[1, 2, 3].map((n) => (
                      <div
                        key={n}
                        className="h-8 w-28 rounded-full bg-muted/60 animate-pulse border border-border/40"
                      />
                    ))}
                  </div>
                ) : stores.length === 0 ? (
                  <span className="text-[11px] text-muted-foreground py-1 px-2">
                    Belum ada mitra toko terdaftar di database.
                  </span>
                ) : (
                  stores.map((st) => {
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
                          {st.logoUrl && <AvatarImage src={st.logoUrl} alt={st.name} />}
                          <AvatarFallback className="text-[9px] font-black bg-emerald-800 text-white">
                            {st.name.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="text-left">
                          <span className="text-[11px] font-extrabold block leading-none truncate max-w-[120px]">
                            {st.name}
                          </span>
                          <span className={`text-[8px] leading-tight block truncate ${isSelected ? "text-emerald-100" : "text-muted-foreground"}`}>
                            {st.area}
                          </span>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          </section>

          {/* 4. Quick Category Bubbles (Langsung Dinamis dari Database) */}
          <div
            ref={categoriesRef}
            className="w-full overflow-x-auto pb-1 px-3 scrollbar-none scroll-smooth cursor-grab active:cursor-grabbing select-none [&_*]:cursor-grab [&_*]:active:cursor-grabbing"
          >
            <div className="flex items-center gap-1.5 w-max">
              {isCategoriesLoading && dbCategories.length <= 1 ? (
                <div className="flex items-center gap-1 py-1">
                  {[1, 2, 3].map((n) => (
                    <div key={n} className="h-6 w-20 rounded-full bg-muted/60 animate-pulse border border-border/40" />
                  ))}
                </div>
              ) : (
                dbCategories.map((catName) => {
                  const Icon = getCategoryIcon(catName);
                  const isSelected = selectedCategory === catName;
                  const label = catName === "Semua" ? "Semua Kategori" : catName;
                  return (
                    <button
                      key={catName}
                      type="button"
                      onClick={() => setSelectedCategory(catName)}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold shrink-0 transition-colors cursor-grab active:cursor-grabbing ${
                        isSelected
                          ? "bg-emerald-700 text-white shadow-2xs"
                          : "bg-muted/50 hover:bg-muted text-muted-foreground border border-border/50"
                      }`}
                    >
                      <Icon className="size-3" />
                      <span>{label}</span>
                    </button>
                  );
                })
              )}
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
            {isBagsLoading && bags.length === 0 ? (
              <div className="grid grid-cols-2 gap-2 py-4">
                {[1, 2, 3, 4].map((n) => (
                  <div key={n} className="h-44 rounded-xl bg-muted/60 animate-pulse border border-border/50" />
                ))}
              </div>
            ) : filteredBags.length === 0 ? (
              <div className="py-12 text-center space-y-2">
                <ShoppingBag className="size-8 text-muted-foreground mx-auto stroke-1" />
                <p className="text-xs font-bold text-foreground">Tidak ada paket makanan aktif</p>
                <p className="text-[11px] text-muted-foreground max-w-xs mx-auto">
                  Coba sesuaikan filter kategori atau pilih wilayah lainnya
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
                  className="text-xs font-semibold cursor-pointer"
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
                  const isSoldOut = bag.quotaRemaining <= 0;
                  const inCartQty = cartItems.find((i) => i.bag.id === bag.id)?.quantity || 0;

                  return (
                    <Card
                      key={bag.id}
                      onClick={() => setSelectedBagForModal(bag)}
                      className={`border-border/80 rounded-xl shadow-2xs overflow-hidden flex flex-col justify-between transition-all group bg-card cursor-pointer ${
                        isSoldOut ? "opacity-80 grayscale hover:border-border" : "hover:border-emerald-600/40"
                      }`}
                    >
                      {/* Compact Photo */}
                      <div className="relative h-24 sm:h-28 w-full overflow-hidden bg-muted">
                        <img
                          src={bag.imageUrl || "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600"}
                          alt={bag.title}
                          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                        />

                        {/* Sold Out Dark Overlay */}
                        {isSoldOut && (
                          <div className="absolute inset-0 bg-black/60 backdrop-blur-[1px] flex items-center justify-center z-10">
                            <span className="px-2 py-0.5 rounded bg-zinc-950/95 text-zinc-100 border border-white/20 text-[9px] font-black tracking-wider uppercase shadow-md">
                              Habis Terjual
                            </span>
                          </div>
                        )}

                        {/* Top Overlay Badges */}
                        <div className="absolute top-1 left-1 flex flex-col gap-0.5 items-start z-10">
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
                        <div className="absolute bottom-1 left-1 z-10">
                          <span
                            className={`px-1 py-0.5 rounded text-[8px] font-bold shadow-2xs leading-none ${
                              isSoldOut
                                ? "bg-rose-500/20 text-rose-700 dark:text-rose-300 font-black border border-rose-500/30"
                                : "bg-background/90 backdrop-blur-xs text-foreground"
                            }`}
                          >
                            {isSoldOut ? "Habis" : `Sisa ${bag.quotaRemaining}`}
                          </span>
                        </div>
                      </div>

                      {/* Compact Card Information */}
                      <div className="p-2 space-y-1 flex-1 flex flex-col justify-between">
                        <div className="space-y-0.5">
                          <span className="text-[9px] font-bold text-emerald-700 dark:text-emerald-400 block truncate leading-tight">
                            {store?.name || "Mitra Kuliner"}
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

                          {isSoldOut ? (
                            <div className="w-full h-6 flex items-center justify-center rounded-md bg-muted text-muted-foreground text-[9px] font-bold border border-border select-none">
                              Stok Habis Hari Ini
                            </div>
                          ) : (
                            <div className="grid grid-cols-2 gap-1">
                              {inCartQty > 0 ? (
                                <div className="h-6 flex items-center justify-between rounded-md bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-600/40 px-1">
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      cartService.updateQuantity(bag.id, inCartQty - 1);
                                    }}
                                    className="size-4.5 rounded flex items-center justify-center font-black text-xs text-emerald-800 dark:text-emerald-200 hover:bg-emerald-200/50 cursor-pointer"
                                    aria-label="Kurangi"
                                  >
                                    -
                                  </button>
                                  <span className="text-[10px] font-black tabular-nums text-emerald-950 dark:text-emerald-100">
                                    {inCartQty}
                                  </span>
                                  <button
                                    type="button"
                                    disabled={inCartQty >= bag.quotaRemaining}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleAddToCart(e, bag);
                                    }}
                                    className="size-4.5 rounded flex items-center justify-center font-black text-xs text-emerald-800 dark:text-emerald-200 hover:bg-emerald-200/50 cursor-pointer disabled:opacity-30"
                                    aria-label="Tambah"
                                  >
                                    +
                                  </button>
                                </div>
                              ) : (
                                <button
                                  type="button"
                                  onClick={(e) => handleAddToCart(e, bag)}
                                  className="h-6 flex items-center justify-center gap-0.5 rounded-md bg-muted/80 hover:bg-muted text-foreground text-[9px] font-bold border border-border/70 transition-colors cursor-pointer"
                                >
                                  <Plus className="size-2.5" />
                                  <span>Cart</span>
                                </button>
                              )}

                              <Link
                                href={`/checkout?bagId=${bag.id}&quantity=${inCartQty > 0 ? inCartQty : 1}`}
                                className="h-6 flex items-center justify-center rounded-md bg-emerald-700 hover:bg-emerald-800 text-white text-[9px] font-black shadow-2xs transition-colors"
                              >
                                Beli
                              </Link>
                            </div>
                          )}
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>

          {/* 7. Ulasan & Testimoni Pelanggan (Komunitas Penyelamat Pangan) */}
          <TestimonialSection reviews={state.reviews} stores={stores} />
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

        {/* ─── INTERACTIVE DETAIL MODAL SHEET / DRAWER ─────────────────────── */}
        {selectedBagForModal && (
          <LandingDetailModal
            bag={selectedBagForModal}
            store={stores.find((s) => s.id === selectedBagForModal.storeId)}
            inCartQty={cartItems.find((i) => i.bag.id === selectedBagForModal.id)?.quantity || 0}
            onClose={() => setSelectedBagForModal(null)}
            onAddToCart={handleAddToCart}
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
            <Compass className="size-5" />
            <span className="text-[10px] font-extrabold">Jelajah</span>
          </Link>

          <Link
            href="/toko"
            className="flex flex-col items-center gap-0.5 text-muted-foreground hover:text-foreground transition-colors"
          >
            <StoreIcon className="size-5" />
            <span className="text-[10px] font-bold">Toko</span>
          </Link>

          <Link
            href="/cart"
            className="flex flex-col items-center gap-0.5 text-muted-foreground hover:text-foreground relative transition-colors cursor-pointer"
          >
            <div className="relative">
              <ShoppingCart className="size-5" />
              {cartTotalCount > 0 && (
                <span className="size-4 rounded-full bg-amber-500 text-stone-950 text-[9px] font-black flex items-center justify-center absolute -top-1 -right-2 tabular-nums shadow-xs">
                  {cartTotalCount}
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
