import { Suspense } from "react";
import { LandingPage } from "@/components/landing/LandingPage";

export default function RootPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-stone-100 dark:bg-stone-950" />}>
      <LandingPage />
    </Suspense>
  );
}
