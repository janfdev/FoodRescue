import { SellerAppView } from "@/components/seller/SellerAppView";

export const metadata = {
  title: "Portal Mitra Toko (Seller) - Rerasa Cirebon",
  description: "Kelola kuota makanan surplus harian, kasir POS verifikasi tiket QR/PIN, B2B order Rescue Box, dan penarikan saldo dompet",
};

export default function SellerPage() {
  return (
    <div className="min-h-screen bg-stone-50/60 dark:bg-zinc-950 flex flex-col">
      <SellerAppView />
    </div>
  );
}
