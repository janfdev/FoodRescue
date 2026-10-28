"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Shield,
  LayoutDashboard,
  Store as StoreIcon,
  Receipt,
  Wallet,
  Users,
  Settings,
  ArrowLeft
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { storeService } from "@/services/storeService";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [state, setState] = useState(storeService.getState());

  useEffect(() => {
    const unsub = storeService.subscribe(() => {
      setState(storeService.getState());
    });
    return unsub;
  }, []);

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
      href: "/admin/audit",
      label: "Audit & Sengketa",
      icon: Settings,
      badge: null,
      exact: false,
    },
  ];

  return (
    <div className="w-full min-h-screen bg-stone-50/60 dark:bg-zinc-950 flex flex-col md:flex-row font-sans">
      {/* ─── SIDEBAR KIRI PERSISTEN ────────────────────────────────────────── */}
      <aside className="w-full md:w-64 bg-card border-r border-border shrink-0 p-4 flex flex-col justify-between">
        <div className="space-y-6">
          {/* Logo & Brand Header */}
          <div className="flex items-center gap-3 px-2">
            <Link href="/" className="size-9 rounded-xl overflow-hidden shadow-xs shrink-0 block">
              <img
                src="/brand/rerasa-mascot-r.svg"
                alt="Rerasa Logo"
                className="w-full h-full object-cover"
              />
            </Link>
            <div>
              <span className="font-extrabold text-sm text-foreground block tracking-tight">
                Rerasa Admin
              </span>
              <span className="text-[10px] font-mono text-muted-foreground uppercase block -mt-0.5">
                Cirebon Command
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

          {/* Clean Quick Link ke Beranda */}
          <div className="px-1">
            <Link
              href="/"
              className="flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground p-2 rounded-xl hover:bg-muted/50 transition-colors"
            >
              <ArrowLeft className="size-3.5" />
              <span>Kembali ke Beranda</span>
            </Link>
          </div>
        </div>

        {/* User Card */}
        <div className="pt-4 border-t border-border/80">
          <div className="flex items-center gap-3 p-2 bg-muted/30 rounded-xl">
            <div className="size-8 rounded-full bg-purple-700 text-white flex items-center justify-center font-bold text-xs">
              A
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-xs font-bold text-foreground block truncate">Ahmad Fauzi</span>
              <span className="text-[10px] text-muted-foreground block truncate">Head of Ops Cirebon</span>
            </div>
          </div>
        </div>
      </aside>

      {/* ─── KONTEN HALAMAN ROUTE MASING-MASING ────────────────────────────── */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
