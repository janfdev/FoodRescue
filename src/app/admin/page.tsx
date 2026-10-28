import { SuperAdminAppView } from "@/components/admin/SuperAdminAppView";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Super Admin Dashboard - SisaRasa Cirebon",
  description: "Pusat kendali operasional, verifikasi KYC mitra, rekber escrow, dan inventori Rescue Box Cirebon Raya",
};

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Top Bar for Back Navigation */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 py-2.5">
        <div className="max-w-6xl mx-auto flex items-center justify-between text-xs">
          <Link
            href="/"
            className="flex items-center gap-1.5 font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="size-3.5" />
            <span>Kembali ke Beranda</span>
          </Link>
          <div className="flex items-center gap-3">
            <span className="font-mono text-[11px] text-muted-foreground">Role: super_admin</span>
            <Link
              href="/seller"
              className="text-emerald-600 font-bold hover:underline"
            >
              Lihat Portal Seller
            </Link>
            <Link
              href="/buyer"
              className="text-emerald-600 font-bold hover:underline"
            >
              Lihat App Buyer
            </Link>
          </div>
        </div>
      </div>

      <SuperAdminAppView />
    </div>
  );
}
