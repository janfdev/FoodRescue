"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Store as StoreIcon,
  QrCode,
  Package,
  Receipt,
  Box,
  Wallet,
  ArrowLeft,
  ChevronDown,
  LogOut,
  Menu,
  X,
  Settings,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { storeService } from "@/services/storeService";
import { resolveUserAvatar } from "@/lib/avatar";
import { EditProfileModal } from "@/components/account/EditProfileModal";
import { Store } from "@/types/domain";

const SellerLayoutContent = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const pathname = usePathname();
  const [store, setStore] = useState<Store | null>(null);
  const [pendingOrdersCount, setPendingOrdersCount] = useState<number>(0);
  const [state, setState] = useState(storeService.getState());
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);

  const syncData = () => {
    const currentState = storeService.getState();
    setState(currentState);
    // Toko merchant mitra yang terasosiasi dengan user seller
    const sellerStoreId = currentState.currentUser?.storeId;
    const current = sellerStoreId ? currentState.stores.find((s) => s.id === sellerStoreId) || null : null;
    setStore(current);
    if (current) {
      const pending = currentState.orders.filter(
        (o) => o.storeId === current.id && (o.status === "PAID" || o.status === "READY_FOR_PICKUP")
      );
      setPendingOrdersCount(pending.length);
    } else {
      setPendingOrdersCount(0);
    }
  };

  useEffect(() => {
    syncData();
    const unsub = storeService.subscribe(syncData);
    return unsub;
  }, []);

  // Close mobile drawer on route transition
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const activeStore = store;

  const sellerUser = state.currentUser;

  const initials = sellerUser?.name
    ? sellerUser.name
        .split(" ")
        .map((w) => w[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "SE";

  const handleLogout = () => {
    storeService.logoutUser();
    router.push("/login");
  };

  const isBoxLow = (activeStore?.currentBoxStock || 0) < 10 || (activeStore?.boxesSoldTotal || 0) % 50 >= 40;

  const navItems = [
    {
      href: "/seller",
      label: "Kasir POS & Pickup",
      icon: QrCode,
      badge: pendingOrdersCount > 0 ? pendingOrdersCount : null,
      badgeColor: "bg-red-600 text-white",
      exact: true,
    },
    {
      href: "/seller/bags",
      label: "Katalog Surprise Bag",
      icon: Package,
      badge: null,
      exact: false,
    },
    {
      href: "/seller/orders",
      label: "Riwayat & Analitik",
      icon: Receipt,
      badge: null,
      exact: false,
    },
    {
      href: "/seller/boxes",
      label: "Toko Box Resmi B2B",
      icon: Box,
      badge: isBoxLow ? "Low" : null,
      badgeColor: "bg-amber-600 text-white",
      exact: false,
    },
    {
      href: "/seller/finance",
      label: "Keuangan & Rekening",
      icon: Wallet,
      badge: null,
      badgeColor: "",
    },
    {
      href: "/seller/profile",
      label: "Pengaturan & Profil",
      icon: Settings,
      badge: null,
      badgeColor: "",
    },
  ];

  const activeNavItem = navItems.find((item) =>
    item.exact ? pathname === item.href : pathname === item.href || pathname.startsWith(item.href + "/")
  ) || navItems[0];

  const activeStoreName = activeStore?.name || "Mitra Toko";
  const activeStoreArea = activeStore?.area || "Cirebon";
  const activeStoreWallet = activeStore?.walletBalance || 0;
  const activeStoreLogo = activeStore?.logoUrl || sellerUser?.avatarUrl || "";

  return (
    <div className="w-full h-screen bg-stone-50/60 dark:bg-zinc-950 flex flex-col md:flex-row font-sans overflow-hidden" suppressHydrationWarning>

      {/* ─── STICKY MOBILE TOPBAR (< MD) ─────────────────────────────────── */}
      <header className="md:hidden sticky top-0 z-30 bg-card/95 backdrop-blur-md border-b border-border px-3.5 py-2.5 flex items-center justify-between shadow-2xs" suppressHydrationWarning>
        <div className="flex items-center gap-2.5 min-w-0">
          <Link href="/seller/profile" className="size-8 rounded-lg overflow-hidden border border-border shrink-0 shadow-xs block">
            <Avatar className="size-full rounded-lg">
              <AvatarImage
                src={resolveUserAvatar(activeStoreLogo, activeStoreName)}
                alt={activeStoreName}
                className="object-cover size-full"
              />
              <AvatarFallback className="bg-orange-600 text-white font-bold text-xs rounded-lg">
                {activeStoreName.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </Link>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-xs text-foreground truncate max-w-[120px]">
                {activeStoreName}
              </span>
              <Badge variant="outline" className="text-[9px] font-bold px-1 py-0 border-orange-500/30 text-orange-700 dark:text-orange-300">
                {activeNavItem.label}
              </Badge>
            </div>
            <span className="text-[9px] text-muted-foreground block truncate">
              {activeStoreArea} • Mitra Aktif
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/seller/finance"
            className="flex items-center gap-1 text-[11px] font-black tabular-nums py-1 px-2 rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20"
          >
            <Wallet className="size-3 shrink-0" />
            <span>Rp {activeStoreWallet.toLocaleString("id-ID")}</span>
          </Link>

          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="size-8 rounded-lg border border-border bg-muted/50 hover:bg-muted flex items-center justify-center text-foreground transition-colors cursor-pointer relative"
            aria-label="Toggle Menu Mitra"
          >
            {pendingOrdersCount > 0 && (
              <span className="absolute -top-1 -right-1 size-2 rounded-full bg-red-600 animate-pulse" />
            )}
            {isMobileMenuOpen ? <X className="size-4" /> : <Menu className="size-4" />}
          </button>
        </div>
      </header>

      {/* ─── MOBILE DRAWER MENU (< MD) ───────────────────────────────────── */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-x-0 top-13 z-40 bg-card/98 border-b border-border shadow-xl p-4 space-y-4 max-h-[calc(100vh-3.5rem)] overflow-y-auto animate-in fade-in slide-in-from-top-2">
          {/* Nav Items */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = item.exact
                ? pathname === item.href
                : pathname === item.href || pathname.startsWith(item.href + "/");

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-colors ${
                    isActive
                      ? "bg-orange-100 text-orange-900 dark:bg-orange-950/80 dark:text-orange-300 shadow-2xs"
                      : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="size-4" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== null && (
                    <Badge
                      className={`text-[10px] px-1.5 py-0 font-mono ${
                        item.badgeColor || ""
                      }`}
                    >
                      {item.badge}
                    </Badge>
                  )}
                </Link>
              );
            })}
          </nav>

          <Separator />

          {/* Box Stock Alert Micro Card */}
          <div className="p-3 bg-muted/40 rounded-xl space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground font-semibold">Stok Kemasan Box:</span>
              <strong
                className={`tabular-nums font-black ${
                  (activeStore?.currentBoxStock || 0) < 10 ? "text-red-600" : "text-emerald-600"
                }`}
              >
                {activeStore?.currentBoxStock || 0} pcs
              </strong>
            </div>
            <div className="flex items-center justify-between text-[11px] text-muted-foreground">
              <span>Kepatuhan Box Standar:</span>
              <span className="font-bold text-foreground">{activeStore?.boxComplianceRate || 100}%</span>
            </div>
          </div>

          <Separator />

          <div className="flex items-center justify-between text-xs pt-1">
            <Link
              href="/seller/profile"
              className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground font-semibold"
            >
              <Settings className="size-3.5 text-orange-600" />
              <span>Profil Gerai</span>
            </Link>

            <Link
              href="/"
              className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground font-semibold"
            >
              <ArrowLeft className="size-3.5" />
              <span>Ke Beranda</span>
            </Link>

            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-1 text-red-600 font-bold"
            >
              <LogOut className="size-3.5" />
              <span>Keluar</span>
            </button>
          </div>
        </div>
      )}

      {/* ─── SIDEBAR KIRI DESKTOP PERSISTEN (>= MD) ────────────────────────── */}
      <aside className="hidden md:flex w-64 bg-card border-r border-border shrink-0 p-4 flex-col justify-between h-screen sticky top-0 overflow-y-auto" suppressHydrationWarning>
        <div className="space-y-6">
          {/* Store Brand Header */}
          <div className="space-y-3">
            <div className="flex items-center gap-3 px-2">
              <Link href="/seller/profile" className="size-10 rounded-xl overflow-hidden border border-border shadow-xs shrink-0 block">
                <Avatar className="size-full rounded-xl">
                  <AvatarImage
                    src={resolveUserAvatar(activeStoreLogo, activeStoreName)}
                    alt={activeStoreName}
                    className="object-cover size-full"
                  />
                  <AvatarFallback className="bg-orange-600 text-white font-bold text-xs rounded-xl">
                    {activeStoreName.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </Link>
              <div className="min-w-0 flex-1">
                <span className="font-extrabold text-sm text-foreground block truncate">
                  {activeStoreName}
                </span>
                <span className="text-[10px] font-mono text-muted-foreground uppercase block truncate">
                  {activeStoreArea} • Mitra Aktif
                </span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Navigation Links with Active URL match */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = item.exact
                ? pathname === item.href
                : pathname === item.href || pathname.startsWith(item.href + "/");

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-colors ${
                    isActive
                      ? "bg-orange-100 text-orange-900 dark:bg-orange-950/80 dark:text-orange-300 shadow-2xs"
                      : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="size-4" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== null && (
                    <Badge
                      className={`text-[10px] px-1.5 py-0 font-mono ${
                        item.badgeColor || ""
                      }`}
                    >
                      {item.badge}
                    </Badge>
                  )}
                </Link>
              );
            })}
          </nav>

          <Separator />
        </div>

        {/* Box Stock Alert & Interactive Profile Card with Popover */}
        <div className="pt-4 border-t border-border/80 space-y-3">
          <div className="p-3 bg-muted/40 rounded-xl space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground font-semibold">Stok Rescue Box:</span>
              <strong
                className={`tabular-nums font-black ${
                  (activeStore?.currentBoxStock || 0) < 10 ? "text-red-600" : "text-emerald-600"
                }`}
              >
                {activeStore?.currentBoxStock || 0} pcs
              </strong>
            </div>
            <div className="flex items-center justify-between text-[11px] text-muted-foreground">
              <span>Kepatuhan Box:</span>
              <span className="font-bold text-foreground">{activeStore?.boxComplianceRate || 100}%</span>
            </div>
          </div>

          {/* Interactive Profile Popover */}
          <Popover>
            <PopoverTrigger className="w-full flex items-center justify-between p-2 rounded-xl bg-muted/40 hover:bg-muted/70 transition-colors border border-border/60 text-left cursor-pointer">
              <div className="flex items-center gap-2.5 min-w-0">
                <Avatar className="size-8 rounded-full border border-border">
                  <AvatarImage src={resolveUserAvatar(sellerUser?.avatarUrl, sellerUser?.name || "Mitra")} alt={sellerUser?.name || "Mitra"} />
                  <AvatarFallback className="bg-orange-600 text-white font-bold text-xs">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <span className="text-xs font-bold text-foreground block truncate">
                    {sellerUser?.name || "Mitra Toko"}
                  </span>
                  <span className="text-[10px] text-muted-foreground block truncate">
                    Pemilik / PIC Gerai
                  </span>
                </div>
              </div>
              <ChevronDown className="size-3.5 text-muted-foreground shrink-0 ml-1" />
            </PopoverTrigger>

            <PopoverContent align="start" side="top" className="w-60 p-3 space-y-2.5 bg-card border border-border shadow-lg">
              <div className="space-y-1 pb-2 border-b border-border">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-foreground text-xs block truncate">
                    {sellerUser?.name || "Mitra Toko"}
                  </span>
                  <Badge variant="secondary" className="text-[9px] bg-orange-600 text-white font-mono">
                    Mitra
                  </Badge>
                </div>
                <span className="text-[10px] text-muted-foreground font-mono block truncate">
                  {sellerUser?.email || "seller@rerasa.com"}
                </span>
              </div>

              <div className="space-y-1">
                <Link
                  href="/seller/finance"
                  className="flex items-center gap-2 w-full p-2 rounded-lg text-xs font-medium text-foreground hover:bg-muted transition-colors"
                >
                  <Wallet className="size-3.5 text-emerald-600" />
                  <span>Saldo & Rekening</span>
                </Link>
                <Link
                  href="/seller/profile"
                  className="flex items-center gap-2 w-full p-2 rounded-lg text-xs font-medium text-foreground hover:bg-muted transition-colors text-left"
                >
                  <Settings className="size-3.5 text-orange-600" />
                  <span>Profil & Toko</span>
                </Link>
                <Link
                  href="/"
                  className="flex items-center gap-2 w-full p-2 rounded-lg text-xs font-medium text-foreground hover:bg-muted transition-colors"
                >
                  <ArrowLeft className="size-3.5 text-emerald-600" />
                  <span>Kembali ke Beranda</span>
                </Link>
              </div>

              <Separator />

              <button
                type="button"
                onClick={handleLogout}
                className="flex items-center gap-2 w-full p-2 rounded-lg text-xs font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors text-left cursor-pointer"
              >
                <LogOut className="size-3.5" />
                <span>Keluar Akun (Logout)</span>
              </button>
            </PopoverContent>
          </Popover>
        </div>
      </aside>

      {/* ─── KONTEN UTAMA ROUTE SELLER ─────────────────────────────────────── */}
      <main className="flex-1 flex flex-col min-w-0 h-full overflow-y-auto overflow-x-hidden">
        {/* Desktop Header Bar */}
        <header className="hidden md:flex h-16 border-b border-border bg-card/70 backdrop-blur-md px-6 items-center justify-between gap-4 sticky top-0 z-20">
          <div>
            <h1 className="text-base font-black text-foreground">
              Portal Operasional Mitra
            </h1>
            <p className="text-[11px] text-muted-foreground -mt-0.5">
              {activeStoreName} • Wilayah {activeStoreArea}
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              href="/seller/finance"
              className="inline-flex items-center gap-1.5 text-xs font-bold p-1 px-3 rounded-lg border border-border bg-card hover:bg-muted/50"
            >
              <Wallet className="size-3.5 text-emerald-600" />
              <span>Rp {activeStoreWallet.toLocaleString("id-ID")}</span>
            </Link>
          </div>
        </header>

        <div className="p-3 sm:p-5 md:p-6 min-w-0 flex-1">{children}</div>
      </main>

      {/* Edit Profile & Store Modal for Seller */}
      {isEditProfileOpen && sellerUser && (
        <EditProfileModal
          isOpen={isEditProfileOpen}
          onClose={() => setIsEditProfileOpen(false)}
          user={sellerUser}
          store={activeStore || undefined}
        />
      )}
    </div>
  );
};

export default function SellerLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="size-6 border-2 border-orange-600 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <SellerLayoutContent>{children}</SellerLayoutContent>
    </Suspense>
  );
}
