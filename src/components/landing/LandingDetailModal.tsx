"use client";

import { Clock, Store as StoreIcon } from "lucide-react";
import { SurpriseBag, Store } from "@/types/domain";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface LandingDetailModalProps {
  bag: SurpriseBag;
  store?: Store;
  inCartQty: number;
  onClose: () => void;
  onAddToCart: (e: React.MouseEvent, bag: SurpriseBag) => void;
}

export function LandingDetailModal({
  bag,
  store,
  inCartQty,
  onClose,
  onAddToCart,
}: LandingDetailModalProps) {
  const isSoldOut = bag.quotaRemaining <= 0;
  const discountPct = Math.round(
    ((bag.originalPrice - bag.discountedPrice) / bag.originalPrice) * 100
  );

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-card border border-border w-full max-w-md rounded-t-3xl sm:rounded-3xl p-5 space-y-4 shadow-2xl animate-in slide-in-from-bottom duration-200 overflow-hidden max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header with Close Button */}
        <div className="flex items-start justify-between gap-3 border-b border-border pb-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="size-10 rounded-xl overflow-hidden border border-border shrink-0 bg-muted">
              <img
                src={store?.logoUrl || store?.imageUrl || "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=200"}
                alt={store?.name || "Mitra"}
                className="size-full object-cover"
              />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 block">
                {bag.category}
              </span>
              <h3 className="font-extrabold text-sm text-foreground truncate">
                {store?.name || "Mitra Kuliner"}
              </h3>
              <span className="text-[10px] text-muted-foreground block truncate">
                {store?.area || "Cirebon"}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="size-7 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground cursor-pointer text-xs font-bold"
          >
            ✕
          </button>
        </div>

        {/* Bag Hero Image & Discount */}
        <div className="relative h-44 w-full rounded-2xl overflow-hidden bg-muted border border-border/80">
          <img
            src={bag.imageUrl || "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800"}
            alt={bag.title}
            className="size-full object-cover"
          />
          <div className="absolute top-2 left-2 flex gap-1">
            <span className="px-2 py-0.5 rounded-lg text-xs font-black bg-amber-600 text-white shadow-md">
              Diskon {discountPct}%
            </span>
            {bag.isLastCall && (
              <span className="px-2 py-0.5 rounded-lg text-xs font-black bg-zinc-950/90 text-amber-300 shadow-md">
                Last Call
              </span>
            )}
          </div>
          {isSoldOut && (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-[1px] flex items-center justify-center">
              <span className="px-3 py-1 rounded bg-zinc-950 text-white border border-white/20 text-xs font-black tracking-wider uppercase">
                Habis Terjual Hari Ini
              </span>
            </div>
          )}
        </div>

        {/* Bag Title & Description */}
        <div className="space-y-1">
          <h4 className="font-black text-base text-foreground leading-snug">
            {bag.title}
          </h4>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {bag.description || "Menu surplus harian berkualitas prima, dikemas higienis dalam wadah terstandarisasi."}
          </p>
        </div>

        {/* Pickup Window & Store Info */}
        <div className="p-3 rounded-2xl bg-muted/40 border border-border/60 space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground flex items-center gap-1.5 font-medium">
              <Clock className="size-3.5 text-amber-600" />
              <span>Jadwal Pengambilan:</span>
            </span>
            <span className="font-bold text-foreground font-mono">
              {bag.pickupWindow}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-muted-foreground flex items-center gap-1.5 font-medium">
              <StoreIcon className="size-3.5 text-orange-600" />
              <span>Alamat Gerai:</span>
            </span>
            <span className="font-bold text-foreground text-right truncate max-w-[200px]">
              {store?.address || "Jl. Tuparev, Cirebon"}
            </span>
          </div>

          <div className="flex items-center justify-between pt-1 border-t border-border/50">
            <span className="text-muted-foreground font-medium">Sisa Porsi:</span>
            <span className={`font-black tabular-nums ${isSoldOut ? "text-rose-600" : "text-emerald-600"}`}>
              {isSoldOut ? "Habis" : `${bag.quotaRemaining} paket`}
            </span>
          </div>
        </div>

        {/* Pricing Summary */}
        <div className="flex items-center justify-between pt-1 border-t border-border">
          <div>
            <span className="text-[10px] text-muted-foreground line-through block tabular-nums">
              Rp {bag.originalPrice.toLocaleString("id-ID")}
            </span>
            <div className="text-lg font-black text-emerald-700 dark:text-emerald-400 tabular-nums">
              Rp {bag.discountedPrice.toLocaleString("id-ID")}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={isSoldOut}
              onClick={(e) => onAddToCart(e, bag)}
              className="text-xs font-bold border-emerald-600 text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 relative cursor-pointer"
            >
              + Keranjang
              {inCartQty > 0 && (
                <span className="size-4.5 rounded-full bg-amber-500 text-stone-950 text-[10px] font-black flex items-center justify-center tabular-nums absolute -top-1.5 -right-1.5 shadow-xs">
                  {inCartQty}
                </span>
              )}
            </Button>

            <Link
              href={`/checkout?bagId=${bag.id}&quantity=1`}
              className={`px-4 py-2 rounded-xl text-xs font-black text-white transition-colors cursor-pointer ${
                isSoldOut
                  ? "bg-muted text-muted-foreground pointer-events-none"
                  : "bg-emerald-700 hover:bg-emerald-800 shadow-md"
              }`}
            >
              Beli Sekarang
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
