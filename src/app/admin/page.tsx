import { SuperAdminAppView } from "@/components/admin/SuperAdminAppView";

export const metadata = {
  title: "Super Admin Command Center - Rerasa Cirebon",
  description: "Pusat kendali operasional, verifikasi KYC mitra, manajemen pengguna, rekber escrow, dan inventori Rescue Box Cirebon Raya",
};

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-stone-50/60 dark:bg-zinc-950 flex flex-col">
      <SuperAdminAppView />
    </div>
  );
}
