"use client";

import { Flame, Clock, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SurpriseBag, Store } from "@/types/domain";
import { CartItem } from "@/services/cartService";

interface FlashSaleSectionProps {
  bags: SurpriseBag[];
  stores: Store[];
  cartItems: CartItem[];
  isLoading: boolean;
  scrollRef: React.RefObject<HTMLDivElement | null>;
  onSelectBag: (bag: SurpriseBag) => void;
  onAddToCart: (e: React.MouseEvent, bag: SurpriseBag) => void;
}

export function FlashSaleSection({
  bags,
  stores,
  cartItems,
  isLoading,
  scrollRef,
  onSelectBag,
  onAddToCart,
}: FlashSaleSectionProps) {
  return (
    <section className="space-y-1.5">
      <div className="px-3 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Flame className="size-3.5 text-amber-600 fill-amber-600" />
          <h3 className="font-black text-xs text-foreground">
            Segera Habis Malam Ini
          </h3>
          <Badge className="bg-amber-600 text-white text-[9px] font-black px-1 py-0">
            Diskon s/d 70%
          </Badge>
        </div>
        <span className="text-[10px] text-muted-foreground">Sebelum toko tutup</span>
      </div>

      <div
        ref={scrollRef}
        className="w-full overflow-x-auto pb-1 px-3 scrollbar-none scroll-smooth cursor-grab active:cursor-grabbing select-none [&_*]:cursor-grab [&_*]:active:cursor-grabbing"
      >
        <div className="flex items-stretch gap-2.5 w-max">
          {isLoading && bags.length === 0 ? (
            <div className="flex items-center gap-2 py-4">
              {[1, 2].map((n) => (
                <div key={n} className="w-56 h-32 rounded-2xl bg-muted/60 animate-pulse border border-border/50" />
              ))}
            </div>
          ) : bags.length === 0 ? (
            <div className="py-4 px-2 text-xs text-muted-foreground italic">
              Belum ada menu last-call malam ini di database.
            </div>
          ) : (
            bags.map((bag) => {
              const store = stores.find((s) => s.id === bag.storeId);
              const isSoldOut = bag.quotaRemaining <= 0;
              const inCartQty = cartItems.find((i) => i.bag.id === bag.id)?.quantity || 0;

              return (
                <div
                  key={`flash-${bag.id}`}
                  onClick={() => onSelectBag(bag)}
                  className={`w-56 p-2.5 rounded-2xl border flex flex-col justify-between shrink-0 shadow-2xs transition-all cursor-pointer ${
                    isSoldOut
                      ? "bg-muted/40 border-border opacity-75 grayscale"
                      : "bg-gradient-to-br from-amber-500/10 via-card to-background border-amber-500/30 hover:border-amber-500/60"
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <div className="relative size-16 rounded-xl overflow-hidden border border-border/80 shrink-0 bg-muted">
                      <img
                        src={bag.imageUrl || "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400"}
                        alt={bag.title}
                        className="size-full object-cover"
                      />
                      {isSoldOut && (
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-[1px] flex items-center justify-center">
                          <span className="text-[8px] font-black uppercase text-white bg-zinc-950/90 px-1 py-0.5 rounded border border-white/20">
                            Habis
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0 space-y-0.5">
                      <span className="text-[9px] font-bold text-amber-700 dark:text-amber-400 block truncate">
                        {store?.name || "Mitra Toko"}
                      </span>
                      <h4 className="font-extrabold text-[11px] text-foreground leading-tight line-clamp-2">
                        {bag.title}
                      </h4>
                      <span className="text-[9px] text-muted-foreground flex items-center gap-0.5">
                        <Clock className="size-2.5 text-amber-600 shrink-0" />
                        <span>{bag.pickupWindow}</span>
                      </span>
                    </div>
                  </div>

                  <div className="mt-2.5 pt-2 border-t border-border/60 flex items-center justify-between">
                    <div>
                      <span className="text-[9px] text-muted-foreground line-through tabular-nums block">
                        Rp {bag.originalPrice.toLocaleString("id-ID")}
                      </span>
                      <span className="text-xs font-black text-amber-700 dark:text-amber-400 tabular-nums">
                        Rp {bag.discountedPrice.toLocaleString("id-ID")}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                      <Button
                        size="sm"
                        disabled={isSoldOut}
                        onClick={(e) => onAddToCart(e, bag)}
                        className="h-7 px-2 text-[10px] font-bold rounded-lg bg-amber-600 hover:bg-amber-700 text-white relative shadow-2xs cursor-pointer"
                      >
                        <Plus className="size-3 mr-0.5" />
                        <span>Ambil</span>
                        {inCartQty > 0 && (
                          <span className="size-3.5 rounded-full bg-stone-950 text-white text-[8px] font-black flex items-center justify-center absolute -top-1 -right-1">
                            {inCartQty}
                          </span>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
}
