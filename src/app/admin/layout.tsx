"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Shield,
  LayoutDashboard,
  Store as StoreIcon,
  Receipt,
  Wallet,
  Users,
  Boxes,
  Settings,
  ArrowLeft,
  ChevronDown,
  LogOut,
  Menu,
  X,
  UserCheck,
  History,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { storeService } from "@/services/storeService";
import { resolveUserAvatar } from "@/lib/avatar";
import { EditProfileModal } from "@/components/account/EditProfileModal";

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [state, setState] = useState(storeService.getState());
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);

  useEffect(() => {
    const unsub = storeService.subscribe(() => {
      setState(storeService.getState());
    });
    return unsub;
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const adminUser = state.currentUser;

  const initials = adminUser?.name
    ? adminUser.name
        .split(" ")
        .map((w) => w[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "AD";

  const handleLogout = () => {
    storeService.logoutUser();
    router.push("/login");
  };

  const pendingStoresCount = state.stores.filter((s) => s.status === "PENDING_APPROVAL").length;
  const pendingWdCount = state.withdrawals.filter((w) => w.status === "PENDING").length;

  const navItems = [
    {
      href: "/admin",
      label: "Beranda & Analitik",
      icon: LayoutDashboard,
      badge: null,
      exact: true,
    },
    {
      href: "/admin/mitra",
      label: "Mitra Menunggu",
      icon: StoreIcon,
      badge: pendingStoresCount > 0 ? pendingStoresCount : null,
      badgeColor: "bg-red-600 text-white",
      exact: false,
    },
    {
      href: "/admin/transaksi",
      label: "Daftar Transaksi",
      icon: Receipt,
      badge: state.orders.length,
      badgeColor: "bg-muted text-muted-foreground",
      exact: false,
    },
    {
      href: "/admin/keuangan",
      label: "Keuangan & Payout",
      icon: Wallet,
      badge: pendingWdCount > 0 ? pendingWdCount : null,
      badgeColor: "bg-red-600 text-white",
      exact: false,
    },
    {
      href: "/admin/users",
      label: "Manajemen User",
      icon: Users,
      badge: null,
      exact: false,
    },
    {
      href: "/admin/boxes",
      label: "Manajemen Rescue Box",
      icon: Boxes,
      badge: state.boxOrders.filter((b) => b.status === "PENDING" || b.status === "PROCESSING").length || null,
      badgeColor: "bg-blue-600 text-white",
      exact: false,
    },
    {
      href: "/admin/audit",
      label: "Ulasan & Wadah Mitra",
      icon: Settings,
      badge: null,
      exact: false,
    },
    {
      href: "/admin/audit-logs",
      label: "Audit Trail System",
      icon: History,
      badge: null,
      exact: true,
    },
    {
      href: "/admin/profile",
      label: "Profil & Pengaturan",
      icon: Settings,
      badge: null,
      exact: true,
    },
  ];

  const activeNavItem = navItems.find((item) =>
    item.exact ? pathname === item.href : pathname === item.href || pathname.startsWith(item.href + "/")
  ) || navItems[0];

  return (
    <div className="w-full h-screen bg-stone-50/60 dark:bg-zinc-950 flex flex-col md:flex-row font-sans overflow-hidden">

      {/* ─── STICKY MOBILE TOPBAR (< MD) ─────────────────────────────────── */}
      <header className="md:hidden sticky top-0 z-30 bg-card/95 backdrop-blur-md border-b border-border px-3.5 py-2.5 flex items-center justify-between shadow-2xs">
        <div className="flex items-center gap-2.5 min-w-0">
          <Link href="/" className="size-8 rounded-lg overflow-hidden shrink-0 border border-purple-500/30">
            <img
              src="/icons/icon-96x96.png"
              alt="Rerasa Logo"
              className="w-full h-full object-cover"
            />
          </Link>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-xs text-foreground truncate">
                Rerasa Admin
              </span>
              <Badge variant="outline" className="text-[9px] font-bold px-1 py-0 border-purple-500/30 text-purple-700 dark:text-purple-300">
                {activeNavItem.label}
              </Badge>
            </div>
            <span className="text-[9px] text-muted-foreground block truncate">
              Command Center Cirebon
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {(pendingStoresCount > 0 || pendingWdCount > 0) && (
            <span className="size-2 rounded-full bg-red-600 animate-pulse" />
          )}

          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="size-8 rounded-lg border border-border bg-muted/50 hover:bg-muted flex items-center justify-center text-foreground transition-colors cursor-pointer"
            aria-label="Toggle Menu Admin"
          >
            {isMobileMenuOpen ? <X className="size-4" /> : <Menu className="size-4" />}
          </button>
        </div>
      </header>

      {/* ─── MOBILE DRAWER MENU (< MD) ───────────────────────────────────── */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-x-0 top-13 z-40 bg-card/98 border-b border-border shadow-xl p-4 space-y-4 max-h-[calc(100vh-3.5rem)] overflow-y-auto animate-in fade-in slide-in-from-top-2">
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
                      ? "bg-purple-100 text-purple-900 dark:bg-purple-950/80 dark:text-purple-300 shadow-2xs"
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

          <div className="flex items-center justify-between text-xs pt-1">
            <Link
              href="/admin/profile"
              className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground font-semibold"
            >
              <Settings className="size-3.5 text-purple-600" />
              <span>Profil Admin</span>
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

      {/* ─── SIDEBAR KIRI PERSISTEN DESKTOP (>= MD) ───────────────────────── */}
      <aside className="hidden md:flex w-64 bg-card border-r border-border shrink-0 p-4 flex-col justify-between h-screen sticky top-0 overflow-y-auto">
        <div className="space-y-6">
          {/* Logo & Brand Header */}
          <div className="flex items-center gap-3 px-2">
            <Link href="/" className="size-9 rounded-xl overflow-hidden shadow-xs shrink-0 block border border-purple-500/30">
              <img
                src="/icons/icon-96x96.png"
                alt="Rerasa Logo"
                className="w-full h-full object-cover"
              />
            </Link>
            <div>
              <span className="font-extrabold text-sm text-foreground block tracking-tight">
                Rerasa Admin
              </span>
              <span className="text-[10px] font-mono text-muted-foreground uppercase block -mt-0.5">
                Penyelamat Makanan
              </span>
            </div>
          </div>

          <Separator />

          {/* Navigation Links with Active URL Match */}
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
                      ? "bg-purple-100 text-purple-900 dark:bg-purple-950/80 dark:text-purple-300 shadow-2xs"
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

        {/* Interactive Profile Card with Popover & Avatar */}
        <div className="pt-4 border-t border-border/80">
          <Popover>
            <PopoverTrigger className="w-full flex items-center justify-between p-2 rounded-xl bg-muted/40 hover:bg-muted/70 transition-colors border border-border/60 text-left cursor-pointer">
              <div className="flex items-center gap-2.5 min-w-0">
                <Avatar className="size-8 rounded-full border border-border">
                  <AvatarImage src={resolveUserAvatar(adminUser?.avatarUrl, adminUser?.name || "Admin")} alt={adminUser?.name || "Admin"} />
                  <AvatarFallback className="bg-red-600 text-white font-bold text-xs">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <span className="text-xs font-bold text-foreground block truncate">
                    {adminUser?.name || "Super Admin"}
                  </span>
                  <span className="text-[10px] text-muted-foreground block truncate font-mono">
                    Super Admin
                  </span>
                </div>
              </div>
              <ChevronDown className="size-3.5 text-muted-foreground shrink-0 ml-1" />
            </PopoverTrigger>

            <PopoverContent align="start" side="top" className="w-60 p-3 space-y-2.5 bg-card border border-border shadow-lg">
              <div className="space-y-1 pb-2 border-b border-border">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-foreground text-xs block truncate">
                    {adminUser?.name || "Super Admin"}
                  </span>
                  <Badge variant="secondary" className="text-[9px] bg-red-600 text-white font-mono">
                    Admin
                  </Badge>
                </div>
                <span className="text-[10px] text-muted-foreground font-mono block truncate">
                  {adminUser?.email || "admin@rerasa.com"}
                </span>
              </div>

              <div className="space-y-1">
                <Link
                  href="/admin/users"
                  className="flex items-center gap-2 w-full p-2 rounded-lg text-xs font-medium text-foreground hover:bg-muted transition-colors"
                >
                  <Users className="size-3.5 text-purple-600" />
                  <span>Manajemen User</span>
                </Link>
                <Link
                  href="/admin/profile"
                  className="flex items-center gap-2 w-full p-2 rounded-lg text-xs font-medium text-foreground hover:bg-muted transition-colors text-left"
                >
                  <Settings className="size-3.5 text-purple-600" />
                  <span>Profil & Pengaturan</span>
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

      {/* ─── KONTEN HALAMAN ROUTE MASING-MASING ────────────────────────────── */}
      <main className="flex-1 min-w-0 p-3 sm:p-5 md:p-8 h-full overflow-y-auto overflow-x-hidden">
        {children}
      </main>

      {/* Edit Profile Modal for Admin */}
      {isEditProfileOpen && adminUser && (
        <EditProfileModal
          isOpen={isEditProfileOpen}
          onClose={() => setIsEditProfileOpen(false)}
          user={adminUser}
        />
      )}
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center bg-background">
          <div className="size-8 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <AdminLayoutContent>{children}</AdminLayoutContent>
    </Suspense>
  );
}
