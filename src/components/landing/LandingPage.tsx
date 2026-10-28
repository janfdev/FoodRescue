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
  MessageSquare,
  ShoppingBag,
  Ticket,
  LogOut,
  ChevronDown,
  ShieldCheck,
  Building2,
  Check,
  User,
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
  const [isLastCallOnly, setIsLastCallOnly] = useState<boolean>(false);

  // Active Ticket Modal State
  const [activeTicketOrder, setActiveTicketOrder] = useState<Order | null>(null);
  const [showTicketsDrawer, setShowTicketsDrawer] = useState<boolean>(initialShowTickets);
  const [activeChatOrder, setActiveChatOrder] = useState<Order | null>(null);
  const [isAreaPickerOpen, setIsAreaPickerOpen] = useState<boolean>(false);

  useEffect(() => {
    const unsub = storeService.subscribe(() => {
      setState(storeService.getState());
    });
    return unsub;
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

  const cirebonAreas = [
    "Semua",
    "Tuparev",
    "Kesambi",
    "Pekiringan",
    "Karanggetas",
    "Kejaksan",
  ];

  // Filtering live catalog
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
      const matchLastCall = !isLastCallOnly || Boolean(bag.isLastCall);

      return matchArea && matchCategory && matchSearch && matchLastCall;
    });
  }, [bags, stores, selectedArea, selectedCategory, searchQuery, isLastCallOnly]);

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
              <PopoverContent align="start" className="w-56 p-2 space-y-1">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground px-2 py-1 block">
                  Pilih Wilayah Penjemputan
                </span>
                {cirebonAreas.map((area) => (
                  <button
                    key={area}
                    type="button"
                    onClick={() => {
                      setSelectedArea(area);
                      setIsAreaPickerOpen(false);
                    }}
                    className={`w-full text-left text-xs px-2.5 py-1.5 rounded-lg flex items-center justify-between font-medium ${
                      selectedArea === area
                        ? "bg-emerald-700 text-white font-bold"
                        : "hover:bg-muted text-foreground"
                    }`}
                  >
                    <span>{area === "Semua" ? "Semua Wilayah Cirebon" : area}</span>
                    {selectedArea === area && <Check className="size-3.5" />}
                  </button>
                ))}
              </PopoverContent>
            </Popover>

            {/* Profile Popover with Notionists Avatar */}
            <Popover>
              <PopoverTrigger className="size-8 rounded-full ring-2 ring-emerald-600/30 hover:ring-emerald-600 transition-all flex items-center justify-center overflow-hidden bg-muted">
                <Avatar className="size-full">
                  <AvatarImage
                    src={currentUser.avatarUrl}
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
                    <AvatarImage src={currentUser.avatarUrl} alt={currentUser.name} />
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

                  <button
                    type="button"
                    onClick={() => setShowTicketsDrawer(true)}
                    className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-muted font-medium text-foreground transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <Ticket className="size-3.5 text-emerald-700" />
                      <span>Tiket Penyelamatan Saya</span>
                    </span>
                    {activeTicketsCount > 0 && (
                      <Badge className="size-4 p-0 flex items-center justify-center bg-emerald-700 text-white text-[9px] font-bold rounded-full">
                        {activeTicketsCount}
                      </Badge>
                    )}
                  </button>
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
        <main className="flex-1 overflow-y-auto space-y-3.5 pb-4">
          {/* Spotlight Banner: Last Call Food */}
          <div className="px-3 pt-2">
            <div className="p-3 rounded-2xl bg-gradient-to-r from-amber-500/15 via-amber-500/10 to-transparent border border-amber-500/30 flex items-center justify-between gap-2.5">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="size-8 rounded-xl bg-amber-600 text-white flex items-center justify-center shrink-0 font-bold shadow-2xs">
                  <Clock className="size-4" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-black text-xs text-foreground truncate">
                      Last Call Food Malam Ini
                    </span>
                    <Badge className="bg-amber-600 text-white text-[9px] font-black px-1 py-0">
                      s/d -70%
                    </Badge>
                  </div>
                  <span className="text-[10px] text-muted-foreground block truncate">
                    Paket cuci gudang toko roti & resto sebelum tutup
                  </span>
                </div>
              </div>

              <Button
                size="sm"
                variant={isLastCallOnly ? "default" : "outline"}
                onClick={() => setIsLastCallOnly(!isLastCallOnly)}
                className={`text-[10px] h-7 px-2.5 rounded-lg font-extrabold shrink-0 ${
                  isLastCallOnly
                    ? "bg-amber-600 hover:bg-amber-700 text-white"
                    : "border-amber-600/40 text-amber-800 dark:text-amber-300"
                }`}
              >
                {isLastCallOnly ? "Semua" : "Last Call"}
              </Button>
            </div>
          </div>

          {/* Quick Category Bubbles (Horizontal Scrollable) */}
          <div className="w-full overflow-x-auto pb-1 px-3 scrollbar-none scroll-smooth">
            <div className="flex items-center gap-1.5 w-max">
              {[
                { id: "Semua", label: "Semua", icon: Utensils },
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
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold shrink-0 transition-colors ${
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

          {/* Section Heading & Result Count */}
          <div className="px-3 flex items-center justify-between text-xs">
            <span className="font-extrabold text-foreground">
              Paket Makanan di Sekitarmu
            </span>
            <span className="text-[10px] text-muted-foreground">
              {filteredBags.length} paket siap ambil
            </span>
          </div>

          {/* 2-Column Marketplace Product Grid (Compact & Dense) */}
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

                        {/* Price & Action Button */}
                        <div className="pt-1 border-t border-border/50 space-y-1">
                          <div className="flex items-baseline gap-1">
                            <span className="font-black text-[11px] text-emerald-700 dark:text-emerald-400 tabular-nums">
                              Rp {bag.discountedPrice.toLocaleString("id-ID")}
                            </span>
                            <span className="text-[8px] text-muted-foreground line-through tabular-nums">
                              Rp {bag.originalPrice.toLocaleString("id-ID")}
                            </span>
                          </div>

                          <Link
                            href={`/checkout?bagId=${bag.id}`}
                            className="block w-full h-6 leading-6 text-center text-[10px] font-black bg-emerald-700 hover:bg-emerald-800 text-white rounded-md shadow-2xs transition-colors"
                          >
                            Ambil
                          </Link>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </main>

        {/* Floating Bottom App Navigation */}
        <nav className="fixed bottom-0 sm:absolute z-30 left-0 right-0 max-w-md mx-auto bg-background/95 backdrop-blur-xs border-t border-border/80 px-4 py-2 flex items-center justify-around">
          <button
            type="button"
            onClick={() => {
              setSelectedArea("Semua");
              setSelectedCategory("Semua");
              setIsLastCallOnly(false);
            }}
            className="flex flex-col items-center gap-0.5 text-emerald-700 dark:text-emerald-400"
          >
            <ShoppingBag className="size-5" />
            <span className="text-[10px] font-extrabold">Jelajah</span>
          </button>

          <button
            type="button"
            onClick={() => setShowTicketsDrawer(true)}
            className="flex flex-col items-center gap-0.5 text-muted-foreground hover:text-foreground relative transition-colors"
          >
            <Ticket className="size-5" />
            <span className="text-[10px] font-bold">Tiket Saya</span>
            {activeTicketsCount > 0 && (
              <span className="size-2 rounded-full bg-emerald-600 absolute top-0 right-3" />
            )}
          </button>

          <Link
            href={
              currentUser.role === "super_admin"
                ? "/admin"
                : currentUser.role === "seller"
                ? "/seller"
                : "/login"
            }
            className="flex flex-col items-center gap-0.5 text-muted-foreground hover:text-foreground transition-colors"
          >
            <User className="size-5" />
            <span className="text-[10px] font-bold">
              {currentUser.role === "super_admin"
                ? "Admin"
                : currentUser.role === "seller"
                ? "Toko"
                : "Akun"}
            </span>
          </Link>
        </nav>

        {/* Dialog Modal Tiket Saya */}
        <Dialog open={showTicketsDrawer} onOpenChange={setShowTicketsDrawer}>
          <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Tiket Penyelamatan Makanan</DialogTitle>
              <DialogDescription>
                Daftar pesanan voucher aktif Anda untuk diambil di gerai mitra kuliner Cirebon
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 pt-2">
              {userOrders.length === 0 ? (
                <div className="py-8 text-center text-xs text-muted-foreground space-y-1">
                  <Ticket className="size-8 mx-auto opacity-40" />
                  <p className="font-bold text-foreground">Belum ada pesanan aktif</p>
                  <p>Pilih makanan surplus di beranda untuk memulai penyelamatan pangan.</p>
                </div>
              ) : (
                userOrders.map((ord) => (
                  <Card
                    key={ord.id}
                    className="p-3.5 border-border shadow-2xs space-y-2.5 cursor-pointer hover:border-emerald-600 transition-colors"
                    onClick={() => setActiveTicketOrder(ord)}
                  >
                    <div className="flex items-start justify-between text-xs">
                      <div>
                        <span className="font-black text-foreground block">{ord.storeName}</span>
                        <span className="text-[11px] text-muted-foreground">{ord.bagTitle}</span>
                      </div>
                      <Badge
                        variant={ord.status === "COMPLETED" ? "secondary" : "default"}
                        className={`text-[10px] font-bold ${
                          ord.status === "COMPLETED"
                            ? ""
                            : "bg-emerald-700 text-white"
                        }`}
                      >
                        {ord.status === "COMPLETED" ? "Sudah Diambil" : "Siap Ambil"}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-1 border-t border-border/60">
                      <div className="flex items-center gap-1 font-mono font-bold text-amber-800 dark:text-amber-400">
                        <span>PIN:</span>
                        <span className="bg-amber-500/15 px-2 py-0.5 rounded-md">
                          {ord.pickupCode}
                        </span>
                      </div>
                      <span className="font-bold text-emerald-700 dark:text-emerald-400">
                        Rp {ord.totalPrice.toLocaleString("id-ID")}
                      </span>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </DialogContent>
        </Dialog>

        {/* Modal Detail Voucher Tiket Aktif dengan QR Code */}
        {activeTicketOrder && (
          <Dialog
            open={Boolean(activeTicketOrder)}
            onOpenChange={(open) => !open && setActiveTicketOrder(null)}
          >
            <DialogContent className="max-w-sm text-center">
              <DialogHeader>
                <DialogTitle className="text-center">Tiket Pengambilan Kasir</DialogTitle>
                <DialogDescription className="text-center">
                  Tunjukkan kode QR atau PIN ini kepada kasir {activeTicketOrder.storeName}
                </DialogDescription>
              </DialogHeader>

              <div className="py-2 space-y-4">
                <div className="inline-block p-4 rounded-2xl bg-white border border-border shadow-xs">
                  <QRCodeSVG value={activeTicketOrder.pickupQrData} size={150} />
                </div>

                <div className="space-y-1">
                  <span className="text-[11px] text-muted-foreground uppercase font-bold tracking-wider block">
                    PIN 4-Digit Kasir
                  </span>
                  <div className="inline-block px-6 py-2 rounded-xl bg-amber-500/15 border border-amber-500/30 font-mono text-3xl font-black text-amber-800 dark:text-amber-400 tracking-widest">
                    {activeTicketOrder.pickupCode}
                  </div>
                </div>

                <div className="p-3 bg-muted/40 rounded-xl text-left text-xs space-y-1 border border-border/60">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Order ID:</span>
                    <span className="font-mono font-bold">{activeTicketOrder.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Menu:</span>
                    <span className="font-semibold truncate max-w-[180px]">{activeTicketOrder.bagTitle}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Jumlah:</span>
                    <span className="font-bold">{activeTicketOrder.quantity} porsi</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Tagihan:</span>
                    <span className="font-bold text-emerald-700 dark:text-emerald-400">
                      Rp {activeTicketOrder.totalPrice.toLocaleString("id-ID")}
                    </span>
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setActiveChatOrder(activeTicketOrder)}
                  className="w-full text-xs font-bold gap-1.5"
                >
                  <MessageSquare className="size-3.5 text-emerald-700" />
                  <span>Buka Chat dengan Toko Mitra</span>
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}

        {/* Modal Chat dengan Toko Mitra */}
        {activeChatOrder && (
          <ChatModal
            order={activeChatOrder}
            onClose={() => setActiveChatOrder(null)}
          />
        )}
      </div>
    </div>
  );
}
