"use client";

import { useEffect, useState } from "react";
import { Download, X, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

export function PwaProvider({ children }: { children: React.ReactNode }) {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // 1. Detect if running as installed standalone PWA
    if (
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true
    ) {
      setIsStandalone(true);
    }

    // 2. Register Native Service Worker
    if ("serviceWorker" in navigator && process.env.NODE_ENV !== "development") {
      navigator.serviceWorker
        .register("/sw.js")
        .then((reg) => {
          console.log("[PWA] Service Worker registered with scope:", reg.scope);
        })
        .catch((err) => {
          console.warn("[PWA] Service Worker registration failed:", err);
        });
    }

    // 3. Capture PWA install prompt
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!installPrompt) return;
    await installPrompt.prompt();
    const choice = await installPrompt.userChoice;
    if (choice.outcome === "accepted") {
      setInstallPrompt(null);
    }
  };

  return (
    <>
      {children}

      {/* Floating PWA Install Banner */}
      {!isStandalone && !isDismissed && installPrompt && (
        <aside
          aria-label="Install Rerasa PWA"
          className="fixed top-3 left-1/2 -translate-x-1/2 z-50 w-full max-w-sm px-3 animate-in fade-in slide-in-from-top-4 duration-300 pointer-events-auto"
        >
          <div className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-stone-900/95 dark:bg-stone-900/95 text-white shadow-xl border border-emerald-500/30 backdrop-blur-md">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="size-8 rounded-xl bg-emerald-600 flex items-center justify-center shrink-0 shadow-inner">
                <Sparkles className="size-4 text-white" />
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
                onClick={handleInstallClick}
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
    </>
  );
}
