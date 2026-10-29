"use client";

import { UserRole } from "@/types/domain";
import { User, Store, Shield, Sparkles } from "lucide-react";

interface RoleSwitcherHeaderProps {
  currentRole: UserRole;
  onSelectRole: (role: UserRole) => void;
  savedMealsCount?: number;
}

export function RoleSwitcherHeader({
  currentRole,
  onSelectRole,
  savedMealsCount = 185
}: RoleSwitcherHeaderProps) {
  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border shadow-xs">
      <div className="max-w-6xl mx-auto px-4 py-2.5 flex flex-wrap items-center justify-between gap-3">
        {/* Brand */}
        <div className="flex items-center gap-2.5">
          <div className="size-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-sm shadow-xs shadow-emerald-600/30">
            SR
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-base tracking-tight text-foreground">
                SisaRasa
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                Cirebon
              </span>
            </div>
            <p className="text-[10px] text-muted-foreground font-medium">
              Platform Penyelamat Makanan Layak
            </p>
          </div>
        </div>

        {/* Quick Role Switcher Buttons */}
        <div className="flex items-center gap-1 bg-muted/70 p-1 rounded-xl border border-border">
          <button
            type="button"
            onClick={() => onSelectRole("buyer")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              currentRole === "buyer"
                ? "bg-background text-foreground shadow-xs font-bold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <User className="size-3.5 text-blue-500" />
            <span>Pembeli (Budi)</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectRole("seller")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              currentRole === "seller"
                ? "bg-background text-foreground shadow-xs font-bold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Store className="size-3.5 text-orange-500" />
            <span>Mitra (Ruby Bakery)</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectRole("admin")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              currentRole === "admin"
                ? "bg-background text-foreground shadow-xs font-bold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Shield className="size-3.5 text-purple-500" />
            <span>Admin</span>
          </button>
        </div>

        {/* Quick Impact Metric Badge */}
        <div className="hidden md:flex items-center gap-2 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 px-3 py-1.5 rounded-xl">
          <Sparkles className="size-3.5 text-emerald-600 dark:text-emerald-400" />
          <span className="text-xs font-medium text-emerald-900 dark:text-emerald-300">
            <strong className="font-bold tabular-nums">{savedMealsCount}</strong> porsi terselamatkan
          </span>
        </div>
      </div>
    </header>
  );
}
