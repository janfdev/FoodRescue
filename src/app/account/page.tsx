"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { storeService } from "@/services/storeService";
import { SEED_USERS } from "@/services/seedData";
import { User as UserType } from "@/types/domain";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  ShieldCheck,
  Building2,
  Ticket,
  LogOut,
  ShoppingBag,
  User,
  ChevronRight,
  Sparkles,
} from "lucide-react";

export default function AccountPage() {
  const router = useRouter();
  const [state, setState] = useState(storeService.getState());

  useEffect(() => {
    const unsub = storeService.subscribe(() => {
      setState(storeService.getState());
    });
    return unsub;
  }, []);

  const { currentUser, orders } = state;

  const myOrdersCount = orders.filter(
    (o) =>
      o.buyerId === currentUser.id ||
      o.buyerName.toLowerCase() === currentUser.name.toLowerCase() ||
      o.buyerPhone === currentUser.phone
  ).length;

  const handleSwitchUser = (user: UserType) => {
    storeService.setCurrentUser(user);
  };

  return (
    <div className="min-h-screen bg-stone-100/70 dark:bg-stone-950 flex justify-center py-0 sm:py-6 selection:bg-emerald-500/20">
      {/* Mobile Frame Container */}
      <div className="w-full max-w-md bg-background min-h-screen sm:min-h-0 sm:rounded-3xl sm:border sm:border-border sm:shadow-xl flex flex-col justify-between relative overflow-hidden pb-16">
        {/* Sticky App Header */}
        <header className="sticky top-0 z-20 bg-background/95 backdrop-blur-xs border-b border-border/60 px-4 py-3 flex items-center justify-between">
          <Link
            href="/"
            className="size-8 rounded-full hover:bg-muted flex items-center justify-center transition-colors"
          >
            <ArrowLeft className="size-4 text-foreground" />
          </Link>
          <h1 className="font-extrabold text-sm text-foreground">Akun & Profil</h1>
          <div className="size-8" /> {/* Spacer */}
        </header>

        {/* Content Body */}
        <main className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* User Profile Card */}
          <Card className="p-4 border-border/80 rounded-2xl shadow-2xs space-y-3 bg-card">
            <div className="flex items-center gap-3">
              <Avatar className="size-14 rounded-2xl ring-2 ring-emerald-600/30">
                <AvatarImage src={currentUser.avatarUrl} alt={currentUser.name} />
                <AvatarFallback className="bg-emerald-700 text-white font-black text-sm">
                  {currentUser.name.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <div className="min-w-0 flex-1 space-y-0.5">
                <div className="flex items-center gap-2">
                  <h2 className="font-black text-sm text-foreground truncate">
                    {currentUser.name}
                  </h2>
                </div>
                <span className="text-xs text-muted-foreground block truncate">
                  {currentUser.email}
                </span>
                <span className="text-[11px] text-muted-foreground font-mono block">
                  {currentUser.phone}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-border/60 text-xs">
              <span className="text-muted-foreground">Peran Akun:</span>
              <Badge
                variant="secondary"
                className="font-bold text-[10px] capitalize bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border border-emerald-500/20"
              >
                {currentUser.role.replace("_", " ")}
              </Badge>
            </div>
          </Card>

          {/* Role Portal Banners */}
          {currentUser.role === "super_admin" && (
            <Link
              href="/admin"
              className="flex items-center justify-between p-3.5 rounded-2xl bg-gradient-to-r from-purple-500/15 via-purple-500/10 to-transparent border border-purple-500/30 hover:border-purple-500/50 transition-all text-xs"
            >
              <div className="flex items-center gap-2.5">
                <div className="size-9 rounded-xl bg-purple-700 text-white flex items-center justify-center shrink-0">
                  <ShieldCheck className="size-5" />
                </div>
                <div>
                  <span className="font-extrabold text-foreground block">
                    Pusat Kendali Super Admin
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    Verifikasi KYC mitra, rekber escrow, dan audit
                  </span>
                </div>
              </div>
              <ChevronRight className="size-4 text-muted-foreground" />
            </Link>
          )}

          {currentUser.role === "seller" && (
            <Link
              href="/seller"
              className="flex items-center justify-between p-3.5 rounded-2xl bg-gradient-to-r from-orange-500/15 via-orange-500/10 to-transparent border border-orange-500/30 hover:border-orange-500/50 transition-all text-xs"
            >
              <div className="flex items-center gap-2.5">
                <div className="size-9 rounded-xl bg-orange-600 text-white flex items-center justify-center shrink-0">
                  <Building2 className="size-5" />
                </div>
                <div>
                  <span className="font-extrabold text-foreground block">
                    Portal Mitra Kuliner (POS)
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    Validasi PIN kasir, atur surprise bag, dan box B2B
                  </span>
                </div>
              </div>
              <ChevronRight className="size-4 text-muted-foreground" />
            </Link>
          )}

          {/* Menu Navigasi Akun */}
          <Card className="p-2 border-border/80 rounded-2xl shadow-2xs space-y-1 bg-card text-xs">
            <Link
              href="/tickets"
              className="flex items-center justify-between p-2.5 rounded-xl hover:bg-muted font-semibold text-foreground transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <Ticket className="size-4 text-emerald-700" />
                <span>Tiket & Riwayat Pesanan Saya</span>
              </div>
              <div className="flex items-center gap-1.5">
                {myOrdersCount > 0 && (
                  <Badge className="bg-emerald-700 text-white text-[9px] font-bold px-1.5 py-0">
                    {myOrdersCount}
                  </Badge>
                )}
                <ChevronRight className="size-3.5 text-muted-foreground" />
              </div>
            </Link>

            <Link
              href="/login"
              className="flex items-center justify-between p-2.5 rounded-xl hover:bg-muted font-semibold text-foreground transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <LogOut className="size-4 text-muted-foreground" />
                <span>Masuk dengan Akun Lain / Google</span>
              </div>
              <ChevronRight className="size-3.5 text-muted-foreground" />
            </Link>
          </Card>

          {/* Quick Demo Role Switcher */}
          <Card className="p-3.5 border-border/80 rounded-2xl shadow-2xs space-y-2.5 bg-muted/20">
            <div className="flex items-center gap-1.5">
              <Sparkles className="size-3.5 text-amber-600" />
              <span className="font-extrabold text-xs text-foreground">
                Ganti Akun Demo Simulasi
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Beralih peran instan tanpa perlu memasukkan kata sandi
            </p>

            <div className="space-y-1.5 pt-1">
              {SEED_USERS.map((u) => {
                const isCurrent = currentUser.id === u.id;
                return (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => handleSwitchUser(u)}
                    className={`w-full flex items-center justify-between p-2 rounded-xl text-left transition-colors border ${
                      isCurrent
                        ? "bg-emerald-700 text-white border-emerald-700"
                        : "bg-card hover:bg-muted border-border/70 text-foreground"
                    }`}
                  >
                    <div className="min-w-0 pr-2">
                      <span className="font-bold text-xs block truncate">{u.name}</span>
                      <span className={`text-[10px] block truncate ${isCurrent ? "text-emerald-100" : "text-muted-foreground"}`}>
                        {u.email}
                      </span>
                    </div>
                    <Badge
                      className={`text-[9px] font-bold capitalize shrink-0 ${
                        isCurrent
                          ? "bg-white text-emerald-800"
                          : u.role === "super_admin"
                          ? "bg-purple-700 text-white"
                          : u.role === "seller"
                          ? "bg-orange-600 text-white"
                          : "bg-emerald-700 text-white"
                      }`}
                    >
                      {u.role.replace("_", " ")}
                    </Badge>
                  </button>
                );
              })}
            </div>
          </Card>
        </main>

        {/* Floating Bottom App Navigation */}
        <nav className="fixed bottom-0 sm:absolute z-20 left-0 right-0 max-w-md mx-auto bg-background/95 backdrop-blur-xs border-t border-border/80 px-4 py-2 flex items-center justify-around">
          <Link
            href="/"
            className="flex flex-col items-center gap-0.5 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ShoppingBag className="size-5" />
            <span className="text-[10px] font-bold">Jelajah</span>
          </Link>

          <Link
            href="/tickets"
            className="flex flex-col items-center gap-0.5 text-muted-foreground hover:text-foreground transition-colors"
          >
            <Ticket className="size-5" />
            <span className="text-[10px] font-bold">Tiket Saya</span>
          </Link>

          <Link
            href="/account"
            className="flex flex-col items-center gap-0.5 text-emerald-700 dark:text-emerald-400"
          >
            <User className="size-5" />
            <span className="text-[10px] font-extrabold">Akun</span>
          </Link>
        </nav>
      </div>
    </div>
  );
}
