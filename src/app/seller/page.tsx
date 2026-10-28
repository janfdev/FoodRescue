import { SellerAppView } from "@/components/seller/SellerAppView";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Portal Mitra Toko (Seller) - SisaRasa Cirebon",
  description: "Kelola kuota makanan surplus harian, kasir POS verifikasi tiket QR/PIN, B2B order Rescue Box, dan penarikan saldo dompet",
};

export default function SellerPage() {
  return (
    <div className="min-h-screen bg-stone-50/60 dark:bg-zinc-950 flex flex-col">
      {/* Top Bar for Back Navigation */}
      <div className="w-full bg-card border-b border-border px-4 py-2.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-xs">
          <Link
            href="/"
            className="flex items-center gap-1.5 font-bold text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="size-3.5" />
            <span>Kembali ke Beranda</span>
          </Link>
          <div className="flex items-center gap-4">
            <span className="font-mono text-[11px] text-muted-foreground">Portal Mitra Kuliner (POS & Inventory)</span>
            <Link
              href="/admin"
              className="text-purple-600 font-bold hover:underline"
            >
              Ke Super Admin
            </Link>
            <Link
              href="/buyer"
              className="text-emerald-700 font-bold hover:underline"
            >
              Ke App Buyer
            </Link>
          </div>
        </div>
      </div>

      <div className="w-full flex-1">
        <SellerAppView />
      </div>
    </div>
  );
}
