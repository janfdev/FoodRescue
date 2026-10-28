import { SuperAdminAppView } from "@/components/admin/SuperAdminAppView";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Super Admin Dashboard - SisaRasa Cirebon",
  description: "Pusat kendali operasional, verifikasi KYC mitra, rekber escrow, dan inventori Rescue Box Cirebon Raya",
};

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-stone-50/60 dark:bg-zinc-950 flex flex-col">
      {/* Top Bar for Back Navigation */}
      <div className="bg-card border-b border-border px-4 py-2.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-xs">
          <Link
            href="/"
            className="flex items-center gap-1.5 font-bold text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="size-3.5" />
            <span>Kembali ke Beranda</span>
          </Link>
          <div className="flex items-center gap-4">
            <span className="font-mono text-[11px] text-muted-foreground">Pusat Kendali Super Admin Cirebon</span>
            <Link
              href="/seller"
              className="text-orange-600 font-bold hover:underline"
            >
              Lihat Portal Mitra
            </Link>
            <Link
              href="/buyer"
              className="text-emerald-700 font-bold hover:underline"
            >
              Lihat App Buyer
            </Link>
          </div>
        </div>
      </div>

      <div className="w-full flex-1">
        <SuperAdminAppView />
      </div>
    </div>
  );
}
