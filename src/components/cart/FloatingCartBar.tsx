"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { cartService, CartItem } from "@/services/cartService";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  ShoppingBag,
  Trash2,
  X,
  ArrowRight,
  Clock,
  Sparkles,
  CheckCircle2,
} from "lucide-react";

export function FloatingCartBar() {
  const router = useRouter();
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [bouncing, setBouncing] = useState(false);

  useEffect(() => {
    const update = () => {
      setItems([...cartService.getItems()]);
      setBouncing(true);
      setTimeout(() => setBouncing(false), 400);
    };
    update();
    const unsub = cartService.subscribe(update);
    return unsub;
  }, []);

  const totalCount = items.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = items.reduce((sum, i) => sum + i.bag.discountedPrice * i.quantity, 0);
  const totalSavings = items.reduce(
    (sum, i) => sum + (i.bag.originalPrice - i.bag.discountedPrice) * i.quantity,
    0
  );
  const currentStore = items.length > 0 ? items[0].store : null;

  if (totalCount === 0) return null;

  const handleProceedCheckout = () => {
    if (items.length === 0) return;
    const firstItem = items[0];
    router.push(`/checkout?bagId=${firstItem.bag.id}&quantity=${totalCount}`);
  };

  return (
    <>
      {/* Floating Bottom Bar (Mobile view above bottom nav) */}
      <aside aria-label="Keranjang Belanja" className="fixed bottom-16 left-0 right-0 z-40 max-w-md mx-auto px-3 pointer-events-none animate-in fade-in slide-in-from-bottom-3 duration-300">
        <div className="pointer-events-auto bg-emerald-800 dark:bg-emerald-950 text-white rounded-2xl p-2.5 px-3.5 shadow-xl border border-emerald-600/50 flex items-center justify-between gap-3 backdrop-blur-md">
          {/* Cart Icon & Counter Badge */}
          <button
            id="cart-target-icon"
            type="button"
            onClick={() => setIsOpen(true)}
            className="flex items-center gap-2.5 min-w-0 text-left cursor-pointer"
          >
            <div className="relative shrink-0">
              <div
                className={`size-9 rounded-xl bg-emerald-700 dark:bg-emerald-800 flex items-center justify-center transition-transform duration-200 ${
                  bouncing ? "scale-125 bg-amber-500 text-stone-900" : "scale-100"
                }`}
              >
                <ShoppingBag className="size-4.5" />
              </div>
              <Badge
                className={`absolute -top-1.5 -right-1.5 size-5 p-0 flex items-center justify-center bg-amber-500 text-stone-950 text-[10px] font-black rounded-full shadow-2xs tabular-nums transition-transform duration-200 ${
                  bouncing ? "scale-130" : "scale-100"
                }`}
              >
                {totalCount}
              </Badge>
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-black text-xs truncate">
                  {totalCount} Paket ({currentStore?.name})
                </span>
              </div>
              <div className="flex items-center gap-1 text-[11px] text-emerald-200 font-bold tabular-nums">
                <span>Rp {totalPrice.toLocaleString("id-ID")}</span>
                <span className="text-[10px] text-amber-300 font-normal">
                  (Hemat Rp {totalSavings.toLocaleString("id-ID")})
                </span>
              </div>
            </div>
          </button>

          {/* Quick Action Button */}
          <div className="flex items-center gap-1.5 shrink-0">
            <Button
              size="sm"
              onClick={handleProceedCheckout}
              className="bg-amber-500 hover:bg-amber-600 text-stone-950 font-black text-xs h-8 px-3.5 rounded-xl shadow-xs gap-1 cursor-pointer"
            >
              <span>Bayar</span>
              <ArrowRight className="size-3" />
            </Button>
          </div>
        </div>
      </aside>

      {/* Cart Drawer / Bottom Sheet Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end justify-center animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-background rounded-t-3xl border-t border-border shadow-2xl flex flex-col max-h-[85vh] overflow-hidden animate-in slide-in-from-bottom duration-300">
            {/* Header */}
            <div className="p-4 border-b border-border flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <div className="size-7 rounded-lg bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 flex items-center justify-center">
                  <ShoppingBag className="size-4" />
                </div>
                <div>
                  <h3 className="font-black text-xs text-foreground">
                    Keranjang Makanan Penyelamatan
                  </h3>
                  <p className="text-[10px] text-muted-foreground">
                    Mitra: {currentStore?.name}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="size-7 rounded-full hover:bg-muted flex items-center justify-center transition-colors text-muted-foreground"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Item List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {items.map((item) => (
                <div
                  key={item.bag.id}
                  className="p-3 rounded-2xl bg-muted/40 border border-border/70 space-y-2.5"
                >
                  <div className="flex items-start gap-2.5">
                    <img
                      src={
                        item.bag.imageUrl ||
                        "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400"
                      }
                      alt={item.bag.title}
                      className="size-14 rounded-xl object-cover border border-border/60 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-xs text-foreground truncate">
                        {item.bag.title}
                      </h4>
                      <p className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                        <Clock className="size-3 text-amber-600 shrink-0" />
                        <span>Jam Ambil: {item.bag.pickupWindow}</span>
                      </p>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="font-extrabold text-xs text-emerald-700 dark:text-emerald-400 tabular-nums">
                          Rp {item.bag.discountedPrice.toLocaleString("id-ID")}
                        </span>
                        <span className="line-through text-[10px] text-muted-foreground tabular-nums">
                          Rp {item.bag.originalPrice.toLocaleString("id-ID")}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => cartService.removeItem(item.bag.id)}
                      className="text-muted-foreground hover:text-red-600 p-1 transition-colors"
                      aria-label="Hapus item"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>

                  {/* Quantity Stepper */}
                  <div className="flex items-center justify-between pt-1 border-t border-border/50 text-xs">
                    <span className="text-[10px] text-muted-foreground">
                      Sisa Kuota: {item.bag.quotaRemaining} porsi
                    </span>
                    <div className="flex items-center gap-2 bg-background border border-border/80 rounded-lg p-0.5">
                      <button
                        type="button"
                        onClick={() =>
                          cartService.updateQuantity(item.bag.id, item.quantity - 1)
                        }
                        className="size-6 rounded-md hover:bg-muted font-bold text-xs flex items-center justify-center transition-colors"
                      >
                        -
                      </button>
                      <span className="font-black text-xs tabular-nums w-4 text-center">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        disabled={item.quantity >= item.bag.quotaRemaining}
                        onClick={() =>
                          cartService.updateQuantity(item.bag.id, item.quantity + 1)
                        }
                        className="size-6 rounded-md hover:bg-muted font-bold text-xs flex items-center justify-center disabled:opacity-40 transition-colors"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {/* Rincian Finansial Transparan */}
              <div className="p-3 rounded-2xl bg-muted/25 border border-border/60 space-y-1.5 text-xs">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal Pesanan</span>
                  <span className="font-semibold text-foreground tabular-nums">
                    Rp {totalPrice.toLocaleString("id-ID")}
                  </span>
                </div>
                <div className="flex justify-between text-amber-700 dark:text-amber-400 font-semibold">
                  <span>Hemat Penyelamatan Pangan</span>
                  <span className="tabular-nums">
                    -Rp {totalSavings.toLocaleString("id-ID")}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-black pt-1.5 border-t border-border/60 text-foreground">
                  <span>Total Bayar</span>
                  <span className="text-emerald-700 dark:text-emerald-400 tabular-nums">
                    Rp {(totalPrice + 1000).toLocaleString("id-ID")}
                  </span>
                </div>
                <p className="text-[9px] text-muted-foreground text-right">
                  *Termasuk biaya platform Rp 1.000
                </p>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="p-4 bg-background border-t border-border space-y-2 shrink-0">
              <Button
                onClick={() => {
                  setIsOpen(false);
                  handleProceedCheckout();
                }}
                className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs h-10 rounded-xl shadow-xs"
              >
                Lanjut ke Pembayaran (Rp {(totalPrice + 1000).toLocaleString("id-ID")})
              </Button>
              <Button
                variant="ghost"
                onClick={() => cartService.clearCart()}
                className="w-full text-xs text-muted-foreground font-semibold h-7"
              >
                Kosongkan Keranjang
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
