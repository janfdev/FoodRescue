"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { cartService, CartItem } from "@/services/cartService";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  ArrowLeft,
  Trash2,
  Plus,
  Minus,
  Clock,
  MapPin,
  ShieldCheck,
  ShoppingCart,
  Compass,
  Receipt,
  User,
  ArrowRight,
  Store as StoreIcon,
} from "lucide-react";

export default function CartPage() {
  const router = useRouter();
  const [items, setItems] = useState<CartItem[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setItems([...cartService.getItems()]);
    const unsub = cartService.subscribe(() => {
      setItems([...cartService.getItems()]);
    });
    return unsub;
  }, []);

  const totalCount = items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = items.reduce(
    (sum, i) => sum + i.bag.discountedPrice * i.quantity,
    0
  );
  const totalSavings = items.reduce(
    (sum, i) => sum + (i.bag.originalPrice - i.bag.discountedPrice) * i.quantity,
    0
  );
  const platformFee = items.length > 0 ? 1000 : 0;
  const totalPrice = subtotal + platformFee;
  const currentStore = items.length > 0 ? items[0].store : null;

  const handleUpdateQty = (bagId: string, currentQty: number, delta: number) => {
    const nextQty = currentQty + delta;
    if (nextQty <= 0) {
      cartService.removeItem(bagId);
    } else {
      cartService.updateQuantity(bagId, nextQty);
    }
  };

  const handleClearCart = () => {
    if (confirm("Kosongkan keranjang belanja?")) {
      cartService.clearCart();
    }
  };

  const handleProceedCheckout = () => {
    if (items.length === 0) return;
    router.push("/checkout?fromCart=true");
  };

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 text-foreground pb-24 font-sans">
      <div className="max-w-md mx-auto min-h-screen flex flex-col bg-background border-x border-border/40 shadow-xs relative">
        {/* Top App Header */}
        <header className="sticky top-0 z-30 bg-background/95 backdrop-blur-xs border-b border-border/80 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="size-8 rounded-full flex items-center justify-center hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Kembali ke Jelajah"
            >
              <ArrowLeft className="size-4.5" />
            </Link>
            <div>
              <h1 className="text-base font-black tracking-tight text-foreground">
                Keranjang Belanja
              </h1>
              <p className="text-[11px] text-muted-foreground">
                {totalCount} porsi makanan surplus dipilih
              </p>
            </div>
          </div>

          {items.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearCart}
              className="h-8 px-2 text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs gap-1 font-semibold"
            >
              <Trash2 className="size-3.5" />
              <span>Hapus</span>
            </Button>
          )}
        </header>

        {/* Content Body */}
        <main className="flex-1 p-4 space-y-4">
          {items.length === 0 ? (
            /* Empty State */
            <div className="py-16 px-4 text-center flex flex-col items-center justify-center space-y-4">
              <div className="size-20 rounded-full bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <ShoppingCart className="size-9" />
              </div>
              <div className="space-y-1.5 max-w-xs">
                <h2 className="text-base font-bold text-foreground">
                  Keranjang Masih Kosong
                </h2>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Belum ada paket makanan surplus yang Anda pilih. Mulai selamatkan
                  porsi lezat dari gerai mitra Cirebon hari ini!
                </p>
              </div>
              <Link
                href="/"
                className="mt-2 inline-flex items-center justify-center bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-xs px-5 h-10 shadow-xs transition-colors"
              >
                <Compass className="size-4 mr-1.5" />
                Mulai Jelajah
              </Link>
            </div>
          ) : (
            /* Cart Items List */
            <>
              {/* Store Identity Card */}
              {currentStore && (
                <Card className="p-3 bg-muted/30 border-border/80 rounded-2xl flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="size-9 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0">
                      <StoreIcon className="size-4.5" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-black text-foreground truncate">
                          {currentStore.name}
                        </span>
                        <Badge
                          variant="secondary"
                          className="text-[9px] px-1.5 py-0 h-4 bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold"
                        >
                          Mitra Terverifikasi
                        </Badge>
                      </div>
                      <p className="text-[11px] text-muted-foreground truncate flex items-center gap-1 mt-0.5">
                        <MapPin className="size-3 shrink-0" />
                        <span className="truncate">{currentStore.address}</span>
                      </p>
                    </div>
                  </div>
                </Card>
              )}

              {/* Items Card List */}
              <div className="space-y-2.5">
                {items.map((item) => (
                  <Card
                    key={item.bag.id}
                    className="p-3.5 border-border/80 rounded-2xl bg-card shadow-2xs space-y-3"
                  >
                    <div className="flex items-start gap-3">
                      {item.bag.imageUrl ? (
                        <div className="relative size-16 rounded-xl overflow-hidden shrink-0 border border-border">
                          <Image
                            src={item.bag.imageUrl}
                            alt={item.bag.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div className="size-16 rounded-xl bg-stone-100 dark:bg-stone-800 flex items-center justify-center text-muted-foreground shrink-0 border border-border">
                          <ShoppingCart className="size-6 text-emerald-600" />
                        </div>
                      )}

                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="text-xs font-bold text-foreground leading-snug line-clamp-2">
                            {item.bag.title}
                          </h3>
                          <button
                            type="button"
                            onClick={() => cartService.removeItem(item.bag.id)}
                            className="text-muted-foreground hover:text-rose-600 p-1 transition-colors"
                            aria-label="Hapus item"
                          >
                            <Trash2 className="size-3.5" />
                          </button>
                        </div>

                        <p className="text-[11px] text-muted-foreground line-clamp-1">
                          {item.bag.description}
                        </p>

                        <div className="flex items-center gap-1.5 text-[10px] text-amber-700 dark:text-amber-400 font-medium pt-0.5">
                          <Clock className="size-3 shrink-0" />
                          <span>
                            Ambil: {item.bag.pickupWindow}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Pricing & Quantity Stepper */}
                    <div className="flex items-center justify-between pt-2 border-t border-border/60">
                      <div>
                        <div className="text-xs font-black text-emerald-700 dark:text-emerald-400 tabular-nums">
                          Rp {item.bag.discountedPrice.toLocaleString("id-ID")}
                        </div>
                        <div className="text-[10px] text-muted-foreground line-through tabular-nums">
                          Rp {item.bag.originalPrice.toLocaleString("id-ID")}
                        </div>
                      </div>

                      {/* Stepper Buttons */}
                      <div className="flex items-center gap-2 bg-muted/60 p-1 rounded-xl border border-border/60">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            handleUpdateQty(item.bag.id, item.quantity, -1)
                          }
                          className="size-7 rounded-lg hover:bg-background text-foreground"
                          aria-label="Kurangi porsi"
                        >
                          <Minus className="size-3" />
                        </Button>
                        <span className="text-xs font-black px-1.5 tabular-nums text-foreground min-w-5 text-center">
                          {item.quantity}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          disabled={
                            item.quantity >=
                            Math.max(1, Number(item.bag.quotaRemaining ?? 99))
                          }
                          onClick={() =>
                            handleUpdateQty(item.bag.id, item.quantity, 1)
                          }
                          className="size-7 rounded-lg hover:bg-background text-foreground"
                          aria-label="Tambah porsi"
                        >
                          <Plus className="size-3" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              {/* Escrow Protection Guarantee */}
              <Card className="p-3 bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800 rounded-2xl flex items-start gap-2.5">
                <ShieldCheck className="size-4.5 text-emerald-700 dark:text-emerald-400 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <span className="text-xs font-black text-emerald-900 dark:text-emerald-300">
                    Jaminan Escrow 100% Aman
                  </span>
                  <p className="text-[11px] text-emerald-800/80 dark:text-emerald-400/80 leading-relaxed">
                    Dana pembayaran Anda ditahan di sistem rekening penampung
                    bersama dan baru diteruskan ke mitra setelah serah terima
                    pesanan terverifikasi di kasir.
                  </p>
                </div>
              </Card>

              {/* Payment Summary */}
              <Card className="p-3.5 border-border/80 rounded-2xl bg-card shadow-2xs space-y-2 text-xs">
                <span className="font-bold text-foreground text-xs block pb-1 border-b border-border/60">
                  Rincian Pembayaran
                </span>
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal ({totalCount} porsi)</span>
                  <span className="font-semibold text-foreground tabular-nums">
                    Rp {subtotal.toLocaleString("id-ID")}
                  </span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Biaya Layanan Aplikasi</span>
                  <span className="font-semibold text-foreground tabular-nums">
                    Rp {platformFee.toLocaleString("id-ID")}
                  </span>
                </div>
                {totalSavings > 0 && (
                  <div className="flex justify-between text-emerald-700 dark:text-emerald-400 font-medium">
                    <span>Total Penghematan Makanan</span>
                    <span className="font-bold tabular-nums">
                      -Rp {totalSavings.toLocaleString("id-ID")}
                    </span>
                  </div>
                )}
                <div className="flex justify-between pt-2 border-t border-border/80 font-black text-sm text-foreground">
                  <span>Total Pembayaran</span>
                  <span className="text-emerald-700 dark:text-emerald-400 tabular-nums">
                    Rp {totalPrice.toLocaleString("id-ID")}
                  </span>
                </div>
              </Card>

              {/* Checkout CTA */}
              <div className="pt-2">
                <Button
                  onClick={handleProceedCheckout}
                  className="w-full h-11 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-xs gap-2 shadow-xs cursor-pointer"
                >
                  <span>Lanjut ke Pembayaran</span>
                  <ArrowRight className="size-4" />
                </Button>
              </div>
            </>
          )}
        </main>

        {/* Floating Bottom App Navigation */}
        <nav className="fixed bottom-0 sm:absolute z-20 left-0 right-0 max-w-md mx-auto bg-background/95 backdrop-blur-xs border-t border-border/80 px-4 py-2 flex items-center justify-around">
          <Link
            href="/"
            className="flex flex-col items-center gap-0.5 text-muted-foreground hover:text-foreground transition-colors"
          >
            <Compass className="size-5" />
            <span className="text-[10px] font-bold">Jelajah</span>
          </Link>

          <Link
            href="/cart"
            className="flex flex-col items-center gap-0.5 text-emerald-700 dark:text-emerald-400 relative"
          >
            <div className="relative">
              <ShoppingCart className="size-5" />
              {totalCount > 0 && (
                <span className="size-4 rounded-full bg-amber-500 text-stone-950 text-[9px] font-black flex items-center justify-center absolute -top-1 -right-2 tabular-nums shadow-xs">
                  {totalCount}
                </span>
              )}
            </div>
            <span className="text-[10px] font-extrabold">Keranjang</span>
          </Link>

          <Link
            href="/history"
            className="flex flex-col items-center gap-0.5 text-muted-foreground hover:text-foreground transition-colors"
          >
            <Receipt className="size-5" />
            <span className="text-[10px] font-bold">Riwayat</span>
          </Link>

          <Link
            href="/account"
            className="flex flex-col items-center gap-0.5 text-muted-foreground hover:text-foreground transition-colors"
          >
            <User className="size-5" />
            <span className="text-[10px] font-bold">Akun</span>
          </Link>
        </nav>
      </div>
    </div>
  );
}
