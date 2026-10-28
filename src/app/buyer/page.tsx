import { BuyerAppView } from "@/components/buyer/BuyerAppView";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Aplikasi Penyelamat Makanan - SisaRasa Cirebon",
  description: "Selamatkan paket surprise bag surplus makanan berkualitas hemat s/d 70% di Cirebon Raya",
};

export default function BuyerPage() {
  return (
    <div className="min-h-screen bg-slate-100/60 dark:bg-slate-950 flex flex-col items-center">
      {/* Top Bar for Back Navigation */}
      <div className="w-full bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 py-2.5">
        <div className="max-w-md mx-auto flex items-center justify-between text-xs">
          <Link
            href="/"
            className="flex items-center gap-1.5 font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="size-3.5" />
            <span>Beranda</span>
          </Link>
          <div className="flex items-center gap-3">
            <span className="font-mono text-[11px] text-muted-foreground">Aplikasi Pembeli</span>
            <Link
              href="/seller"
              className="text-emerald-600 font-bold hover:underline"
            >
              Mitra Toko
            </Link>
          </div>
        </div>
      </div>

      <div className="w-full py-0 sm:py-6 flex justify-center">
        <BuyerAppView />
      </div>
    </div>
  );
}
