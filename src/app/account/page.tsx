"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { storeService, DEFAULT_INITIAL_STATE } from "@/services/storeService";
import { User as UserType } from "@/types/domain";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import {
  ArrowLeft,
  ShieldCheck,
  Building2,
  Receipt,
  LogOut,
  ShoppingBag,
  User,
  ChevronRight,
  Pencil,
  Bell,
} from "lucide-react";
import { EditProfileModal } from "@/components/account/EditProfileModal";
import { usePwa } from "@/components/pwa/PwaProvider";
import { resolveUserAvatar } from "@/lib/avatar";
import { useSession, signOut } from "@/lib/auth-client";
import { requestNotificationPermission, sendLocalNotification } from "@/lib/notification";

export default function AccountPage() {
  const router = useRouter();
  const [state, setState] = useState(DEFAULT_INITIAL_STATE);
  const [mounted, setMounted] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const { isInstalled, isStandalone, openInstallGuide } = usePwa();
  const { data: session } = useSession();
  const [notifPermission, setNotifPermission] = useState<string>("default");

  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      setNotifPermission(Notification.permission);
    }
  }, []);

  const handleEnableNotification = async () => {
    const res = await requestNotificationPermission();
    setNotifPermission(res);
    if (res === "granted") {
      sendLocalNotification("Notifikasi Aktif!", {
        body: "Anda akan menerima pemberitahuan langsung saat pesanan siap diambil di toko.",
      });
    }
  };

  useEffect(() => {
    setMounted(true);
    setState(storeService.getState());
    const unsub = storeService.subscribe(() => {
      setState(storeService.getState());
    });
    return unsub;
  }, []);

  const { currentUser: simulatedUser, orders, stores } = state;
  const currentUser: UserType = session?.user
    ? {
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
      }
    : simulatedUser;

  useEffect(() => {
    if (session?.user && session.user.id !== state.currentUser.id) {
      storeService.setCurrentUser(currentUser);
    }
  }, [session, currentUser, state.currentUser.id]);
  const currentStore = currentUser.storeId
    ? stores.find((s) => s.id === currentUser.storeId)
    : null;

  const myOrdersCount = orders.filter(
    (o) =>
      o.buyerId === currentUser.id ||
      o.buyerName.toLowerCase() === currentUser.name.toLowerCase() ||
      o.buyerPhone === currentUser.phone
  ).length;

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (err) {
      console.warn("Logout error:", err);
    }
    storeService.resetToDefault();
    router.push("/login");
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
              <Avatar className="size-14">
                <AvatarImage src={resolveUserAvatar(currentUser.avatarUrl, currentUser.name)} alt={currentUser.name} />
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
              <div className="flex items-center gap-1.5">
                <span className="text-muted-foreground">Peran:</span>
                <Badge
                  variant="secondary"
                  className="font-bold text-[10px] capitalize bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border border-emerald-500/20"
                >
                  {currentUser.role.replace("_", " ")}
                </Badge>
              </div>

              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsEditModalOpen(true)}
                className="h-7 text-[11px] font-bold rounded-lg gap-1.5 border-emerald-600/30 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-500/10 cursor-pointer"
              >
                <Pencil className="size-3" />
                <span>Ubah Profil</span>
              </Button>
            </div>
          </Card>

          {/* Edit Profile Modal */}
          <EditProfileModal
            isOpen={isEditModalOpen}
            onClose={() => setIsEditModalOpen(false)}
            user={currentUser}
            store={currentStore}
          />

          {/* Role Portal Banners */}
          {currentUser.role === "admin" && (
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
                    Pusat Kendali Admin
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
                    Serah terima pesanan kasir, atur surprise bag, dan box B2B
                  </span>
                </div>
              </div>
              <ChevronRight className="size-4 text-muted-foreground" />
            </Link>
          )}

          {/* PWA Application Status Card */}
          <div
            onClick={openInstallGuide}
            className="flex items-center justify-between p-3 rounded-2xl bg-muted/40 border border-border/80 hover:bg-muted/70 transition-colors cursor-pointer text-xs"
          >
            <div className="flex items-center gap-2.5">
              <div className="size-9 rounded-xl overflow-hidden shadow-2xs shrink-0 border border-border">
                <Image
                  src="/icons/icon-96x96.png"
                  alt="Rerasa PWA Logo"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <span className="font-extrabold text-foreground block">
                  Aplikasi Rerasa (PWA)
                </span>
                <span className="text-[10px] text-muted-foreground block">
                  {isStandalone || isInstalled
                    ? "Sudah Terpasang di Perangkat ✓"
                    : "Klik untuk pasang atau panduan instalasi"}
                </span>
              </div>
            </div>
            <Badge
              variant={isStandalone || isInstalled ? "default" : "outline"}
              className={`text-[9px] font-bold ${
                isStandalone || isInstalled
                  ? "bg-emerald-600 text-white"
                  : "border-emerald-600 text-emerald-700 dark:text-emerald-400"
              }`}
            >
              {isStandalone || isInstalled ? "Terpasang ✓" : "Pasang App"}
            </Badge>
          </div>

          {/* Web Push Notification Setting */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-muted/40 border border-border/80 text-xs">
            <div className="flex items-center gap-2.5">
              <div className="size-9 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 flex items-center justify-center shrink-0">
                <Bell className="size-4" />
              </div>
              <div>
                <span className="font-extrabold text-foreground block">
                  Notifikasi Pengambilan Makanan
                </span>
                <span className="text-[10px] text-muted-foreground block">
                  {notifPermission === "granted"
                    ? "Notifikasi web aktif dan siap menerima peringatan"
                    : "Aktifkan agar tahu saat pesanan siap diambil"}
                </span>
              </div>
            </div>
            {notifPermission === "granted" ? (
              <Badge className="bg-emerald-600 text-white text-[9px] font-bold">
                Aktif ✓
              </Badge>
            ) : (
              <Button
                size="sm"
                variant="outline"
                onClick={handleEnableNotification}
                className="h-7 text-[10px] font-bold border-amber-500/40 text-amber-800 dark:text-amber-300 hover:bg-amber-500/10 cursor-pointer"
              >
                Izinkan
              </Button>
            )}
          </div>

          {/* Menu Navigasi Akun */}
          <Card className="p-2 border-border/80 rounded-2xl shadow-2xs space-y-1 bg-card text-xs">
            <Link
              href="/history"
              className="flex items-center justify-between p-2.5 rounded-xl hover:bg-muted font-semibold text-foreground transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <Receipt className="size-4 text-emerald-700" />
                <span>Riwayat Pesanan Saya</span>
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

            {session?.user ? (
              <button
                type="button"
                onClick={handleLogout}
                className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-destructive/10 text-destructive font-semibold transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <LogOut className="size-4" />
                  <span>Keluar dari Akun</span>
                </div>
                <ChevronRight className="size-3.5 text-destructive/70" />
              </button>
            ) : (
              <Link
                href="/login"
                className="flex items-center justify-between p-2.5 rounded-xl hover:bg-muted font-semibold text-foreground transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <LogOut className="size-4 text-muted-foreground" />
                  <span>Masuk / Daftarkan Akun Baru</span>
                </div>
                <ChevronRight className="size-3.5 text-muted-foreground" />
              </Link>
            )}
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
            href="/history"
            className="flex flex-col items-center gap-0.5 text-muted-foreground hover:text-foreground transition-colors"
          >
            <Receipt className="size-5" />
            <span className="text-[10px] font-bold">Riwayat</span>
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
