import { Suspense } from "react";
import { LandingPage } from "@/components/landing/LandingPage";

export const metadata = {
  title: "Aplikasi Penyelamat Makanan - SisaRasa Cirebon",
  description: "Selamatkan paket surprise bag surplus makanan berkualitas hemat s/d 70% di Cirebon Raya",
};

export default function BuyerPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-stone-100 dark:bg-stone-950" />}>
      <LandingPage />
    </Suspense>
  );
}
