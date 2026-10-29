"use client";

import { useMemo } from "react";
import { Review, Store } from "@/types/domain";
import { Star, CheckCircle, Quote } from "lucide-react";
import { useHorizontalScroll } from "@/hooks/useHorizontalScroll";

interface TestimonialSectionProps {
  reviews: Review[];
  stores: Store[];
}

export function TestimonialSection({ reviews, stores }: TestimonialSectionProps) {
  const scrollRef = useHorizontalScroll<HTMLDivElement>();

  const storeMap = useMemo(() => {
    const map = new Map<string, string>();
    stores.forEach((st) => map.set(st.id, st.name));
    return map;
  }, [stores]);

  if (!reviews || reviews.length === 0) return null;

  return (
    <section className="space-y-2 pt-2">
      <div className="px-3 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Quote className="size-3.5 text-emerald-600 fill-emerald-600/20" />
          <h3 className="font-black text-xs text-foreground">
            Ulasan Penyelamat Makanan
          </h3>
        </div>
        <span className="text-[10px] text-muted-foreground">Kepatuhan Rescue Box 100%</span>
      </div>

      <div
        ref={scrollRef}
        className="w-full overflow-x-auto pb-2 px-3 scrollbar-none scroll-smooth cursor-grab active:cursor-grabbing select-none [&_*]:cursor-grab [&_*]:active:cursor-grabbing"
      >
        <div className="flex items-stretch gap-2.5 w-max">
          {reviews.map((rev) => {
            const storeName = storeMap.get(rev.storeId) || "Mitra Kuliner";
            return (
              <div
                key={rev.id}
                className="w-64 p-3 rounded-2xl border border-border/80 bg-card/60 backdrop-blur-xs flex flex-col justify-between shrink-0 shadow-2xs hover:border-emerald-600/30 transition-all"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`size-3 ${
                            i < rev.rating
                              ? "text-amber-500 fill-amber-500"
                              : "text-muted-foreground/30"
                          }`}
                        />
                      ))}
                    </div>
                    {rev.usedOfficialRescueBox && (
                      <span className="inline-flex items-center gap-0.5 text-[8px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 px-1 py-0.5 rounded border border-emerald-500/20">
                        <CheckCircle className="size-2.5" />
                        <span>Rescue Box</span>
                      </span>
                    )}
                  </div>

                  <p className="text-[11px] text-foreground/90 leading-relaxed italic line-clamp-3">
                    &ldquo;{rev.comment}&rdquo;
                  </p>
                </div>

                <div className="pt-2 mt-2 border-t border-border/50 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-foreground block">
                      {rev.buyerName}
                    </span>
                    <span className="text-[8px] text-muted-foreground block truncate max-w-[150px]">
                      {storeName}
                    </span>
                  </div>
                  <span className="text-[8px] text-muted-foreground font-mono">
                    {rev.orderId}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
