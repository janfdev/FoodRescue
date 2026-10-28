"use client";

import { useState, useEffect } from "react";
import { UserRole } from "@/types/domain";
import { storeService } from "@/services/storeService";
import { RoleSwitcherHeader } from "@/components/layout/RoleSwitcherHeader";
import { BuyerAppView } from "@/components/buyer/BuyerAppView";
import { SellerAppView } from "@/components/seller/SellerAppView";
import { SuperAdminAppView } from "@/components/admin/SuperAdminAppView";
import { RotateCcw } from "lucide-react";

export default function HomePage() {
  const [currentRole, setCurrentRole] = useState<UserRole>("buyer");
  const [savedMeals, setSavedMeals] = useState<number>(185);

  const syncState = () => {
    const state = storeService.getState();
    setCurrentRole(state.currentUser.role);
    setSavedMeals(storeService.getImpactMetrics().totalMealsSaved);
  };

  useEffect(() => {
    syncState();
    const unsub = storeService.subscribe(syncState);
    return unsub;
  }, []);

  const handleRoleChange = (role: UserRole) => {
    storeService.switchRole(role);
    syncState();
  };

  const handleReset = () => {
    if (confirm("Reset seluruh data simulasi SisaRasa Cirebon ke kondisi awal?")) {
      storeService.resetToDefault();
      syncState();
    }
  };

  return (
    <div className="min-h-screen bg-muted/20 text-foreground flex flex-col font-sans selection:bg-emerald-500/20 selection:text-emerald-700">
      {/* Top Role Switcher Header */}
      <RoleSwitcherHeader
        currentRole={currentRole}
        onSelectRole={handleRoleChange}
        savedMealsCount={savedMeals}
      />

      {/* Main Persona Workspaces */}
      <main className="flex-1 flex flex-col items-center justify-start p-0 sm:py-6">
        {currentRole === "buyer" && <BuyerAppView />}
        {currentRole === "seller" && <SellerAppView />}
        {currentRole === "super_admin" && <SuperAdminAppView />}
      </main>

      {/* Floating Demo Reset Button at Bottom-Right */}
      <div className="fixed bottom-3 right-3 z-50">
        <button
          type="button"
          onClick={handleReset}
          className="bg-card/90 hover:bg-card border border-border shadow-lg px-2.5 py-1.5 rounded-xl text-[11px] font-bold text-muted-foreground hover:text-foreground flex items-center gap-1.5 backdrop-blur-xs transition-colors"
          title="Reset Data Simulasi"
        >
          <RotateCcw className="size-3 text-muted-foreground" />
          <span>Reset Demo</span>
        </button>
      </div>
    </div>
  );
}
