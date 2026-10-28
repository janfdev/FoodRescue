"use client";

import { useEffect, useState, createContext, useContext } from "react";
import { Download, X, CheckCircle2, Share, Laptop, Smartphone, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

interface PwaContextType {
  isInstalled: boolean;
  isStandalone: boolean;
  canInstall: boolean;
  isIos: boolean;
  openInstallGuide: () => void;
  triggerInstall: () => Promise<void>;
}

const PwaContext = createContext<PwaContextType>({
  isInstalled: false,
  isStandalone: false,
  canInstall: false,
  isIos: false,
  openInstallGuide: () => {},
  triggerInstall: async () => {},
});

export const usePwa = () => useContext(PwaContext);

export function PwaProvider({ children }: { children: React.ReactNode }) {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);

  useEffect(() => {
    // 1. Deteksi Standalone Mode (Aplikasi dibuka dari icon PWA terpasang)
    const checkStandalone = () => {
      const isStandaloneMode =
        window.matchMedia("(display-mode: standalone)").matches ||
        (window.navigator as unknown as { standalone?: boolean }).standalone === true;
      setIsStandalone(isStandaloneMode);
      if (isStandaloneMode) {
        setIsInstalled(true);
        localStorage.setItem("rerasa_pwa_installed", "true");
      }
    };
    checkStandalone();

    // 2. Deteksi apakah sebelumnya sudah pernah berhasil diinstall
    if (typeof window !== "undefined" && localStorage.getItem("rerasa_pwa_installed") === "true") {
      setIsInstalled(true);
    }

    // 3. Deteksi Sistem Operasi iOS (Safari Apple tidak mendukung beforeinstallprompt)
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isAppleIos = /iphone|ipad|ipod/.test(userAgent);
    setIsIos(isAppleIos);

    // 4. Registrasi Native Service Worker (di semua mode termasuk localhost)
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((reg) => {
          console.log("[PWA] Service Worker aktif dengan cakupan:", reg.scope);
        })
        .catch((err) => {
          console.warn("[PWA] Registrasi Service Worker gagal:", err);
        });
    }

    // 5. Tangkap event prompt instalasi Chromium
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
    };

    // 6. Tangkap event ketika user sukses menginstall PWA
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsStandalone(true);
      setInstallPrompt(null);
      localStorage.setItem("rerasa_pwa_installed", "true");
      console.log("[PWA] Aplikasi Rerasa sukses terpasang di perangkat.");
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const triggerInstall = async () => {
    if (installPrompt) {
      await installPrompt.prompt();
      const choice = await installPrompt.userChoice;
      if (choice.outcome === "accepted") {
        setIsInstalled(true);
        localStorage.setItem("rerasa_pwa_installed", "true");
        setInstallPrompt(null);
      }
    } else {
      // Jika browser tidak memberikan prompt native (misal iOS atau sudah terpasang)
      setIsGuideOpen(true);
    }
  };

  const openInstallGuide = () => {
    setIsGuideOpen(true);
  };

  return (
    <PwaContext.Provider
      value={{
        isInstalled,
        isStandalone,
        canInstall: !!installPrompt,
        isIos,
        openInstallGuide,
        triggerInstall,
      }}
    >
      {children}

      {/* Floating PWA Install Banner (Hanya muncul jika belum standalone, belum diinstall, dan belum di-dismiss) */}
      {!isStandalone && !isInstalled && !isDismissed && installPrompt && (
        <aside
          aria-label="Install Rerasa PWA"
          className="fixed top-3 left-1/2 -translate-x-1/2 z-50 w-full max-w-sm px-3 animate-in fade-in slide-in-from-top-4 duration-300 pointer-events-auto"
        >
          <div className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-stone-900/95 dark:bg-stone-900/95 text-white shadow-xl border border-emerald-500/30 backdrop-blur-md">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="size-9 rounded-xl overflow-hidden shrink-0 border border-emerald-500/30 bg-emerald-950/40 p-0.5 shadow-xs">
                <img
                  src="/icons/icon-96x96.png"
                  alt="Logo Rerasa"
                  className="size-full object-cover rounded-lg"
                />
              </div>
              <div className="min-w-0">
                <span className="text-xs font-black block leading-tight truncate">
                  Pasang Aplikasi Rerasa
                </span>
                <span className="text-[10px] text-stone-300 block leading-tight truncate">
                  Akses instan & hemat kuota porsi surplus
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <Button
                size="sm"
                onClick={triggerInstall}
                className="h-7 px-2.5 text-[11px] font-black bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg gap-1 shadow-sm cursor-pointer"
              >
                <Download className="size-3" />
                <span>Pasang</span>
              </Button>
              <button
                type="button"
                onClick={() => setIsDismissed(true)}
                className="size-7 flex items-center justify-center rounded-lg text-stone-400 hover:text-white transition-colors cursor-pointer"
                aria-label="Tutup Banner Install"
              >
                <X className="size-3.5" />
              </button>
            </div>
          </div>
        </aside>
      )}

      {/* Dialog Panduan & Status PWA */}
      <Dialog open={isGuideOpen} onOpenChange={setIsGuideOpen}>
        <DialogContent className="max-w-md w-full p-5 rounded-3xl space-y-4">
          <DialogHeader className="text-left space-y-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <img
                  src="/icons/icon-96x96.png"
                  alt="Rerasa Logo"
                  className="size-7 rounded-lg border border-emerald-500/30"
                />
                <DialogTitle className="text-sm font-black">
                  Status Aplikasi Rerasa PWA
                </DialogTitle>
              </div>
              {isStandalone || isInstalled ? (
                <Badge className="bg-emerald-600 text-white text-[10px] font-bold">
                  Terpasang ✓
                </Badge>
              ) : (
                <Badge variant="outline" className="text-[10px] font-bold">
                  Web App
                </Badge>
              )}
            </div>
            <DialogDescription className="text-xs text-muted-foreground">
              Progressive Web App (PWA) untuk penyelamatan pangan surplus di Cirebon.
            </DialogDescription>
          </DialogHeader>

          {/* Kondisi 1: Aplikasi sudah terpasang */}
          {isStandalone || isInstalled ? (
            <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/30 space-y-2">
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="size-5 text-emerald-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="text-xs font-black text-emerald-900 dark:text-emerald-200">
                    Aplikasi Sudah Terpasang di Perangkat Ini
                  </h4>
                  <p className="text-[11px] text-emerald-800/80 dark:text-emerald-300/80 leading-relaxed">
                    Browser sengaja tidak lagi memunculkan popup instalasi karena aplikasi Rerasa sudah terpasang secara native di sistem Anda.
                  </p>
                </div>
              </div>
              <div className="text-[10px] text-emerald-700 dark:text-emerald-400 font-mono pt-1 border-t border-emerald-500/20">
                Lokasi: Layar Utama / Home Screen / Start Menu
              </div>
            </div>
          ) : isIos ? (
            /* Kondisi 2: Perangkat iOS (iPhone / iPad) */
            <div className="p-3.5 rounded-2xl bg-muted/50 border border-border space-y-3">
              <div className="flex items-center gap-2 text-xs font-black text-foreground">
                <Smartphone className="size-4 text-emerald-600" />
                <span>Cara Pasang di iPhone / iPad (Safari)</span>
              </div>
              <ol className="text-xs text-muted-foreground space-y-2 list-decimal list-inside">
                <li>
                  Ketuk tombol <strong className="text-foreground">Bagikan (Share)</strong>{" "}
                  <Share className="size-3.5 inline mx-0.5 text-blue-500" /> di bilah navigasi Safari.
                </li>
                <li>
                  Gulir ke bawah lalu pilih menu{" "}
                  <strong className="text-foreground">"Tambah ke Layar Utama" (Add to Home Screen)</strong>.
                </li>
                <li>
                  Ketuk <strong className="text-foreground">Tambah (Add)</strong> di pojok kanan atas.
                </li>
              </ol>
            </div>
          ) : (
            /* Kondisi 3: Desktop Chrome / Edge */
            <div className="p-3.5 rounded-2xl bg-muted/50 border border-border space-y-3">
              <div className="flex items-center gap-2 text-xs font-black text-foreground">
                <Laptop className="size-4 text-emerald-600" />
                <span>Cara Pasang di Desktop (Chrome / Edge)</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Jika popup belum muncul otomatis, Anda dapat mengeklik ikon instalasi{" "}
                <Download className="size-3.5 inline mx-0.5 text-emerald-600" /> di sebelah kanan bilah alamat (URL bar) browser Anda.
              </p>
              {installPrompt && (
                <Button
                  onClick={triggerInstall}
                  className="w-full h-8 text-xs font-black bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl gap-1.5"
                >
                  <Download className="size-3.5" />
                  <span>Pasang Sekarang Melalui Browser</span>
                </Button>
              )}
            </div>
          )}

          <div className="pt-2 flex justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsGuideOpen(false)}
              className="text-xs font-bold rounded-xl"
            >
              Tutup
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </PwaContext.Provider>
  );
}
