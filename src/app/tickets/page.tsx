"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { storeService } from "@/services/storeService";
import { Order, Store } from "@/types/domain";
import { QRCodeSVG } from "qrcode.react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ChatModal } from "@/components/shared/ChatModal";
import {
  ArrowLeft,
  Clock,
  MapPin,
  ExternalLink,
  MessageSquare,
  ShoppingBag,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

export default function TicketsPage() {
  const router = useRouter();
  const [state, setState] = useState(storeService.getState());
  const [activeChatOrder, setActiveChatOrder] = useState<Order | null>(null);
  const [now, setNow] = useState<number>(0);

  useEffect(() => {
    setNow(Date.now());
    const unsub = storeService.subscribe(() => {
      setState(storeService.getState());
    });
    const interval = setInterval(() => setNow(Date.now()), 30000); // 30s tick for countdown
    return () => {
      unsub();
      clearInterval(interval);
    };
  }, []);

  const { orders, stores, currentUser } = state;

  // Filter orders belonging to current user that are ready for pickup
  const activeTickets = useMemo(() => {
    return orders.filter((o) => {
      const matchBuyer =
        o.buyerId === currentUser.id ||
        o.buyerName.toLowerCase() === currentUser.name.toLowerCase() ||
        (currentUser.phone && o.buyerPhone === currentUser.phone);
      const isPickupReady = o.status === "PAID" || o.status === "READY_FOR_PICKUP";
      return matchBuyer && isPickupReady;
    });
  }, [orders, currentUser]);

  return (
    <div className="min-h-screen bg-stone-100/70 dark:bg-stone-950 flex justify-center py-0 sm:py-6 selection:bg-emerald-500/20">
      {/* Mobile Frame Container */}
      <div className="w-full max-w-md bg-background min-h-screen sm:min-h-0 sm:rounded-3xl sm:border sm:border-border sm:shadow-xl flex flex-col justify-between relative overflow-hidden pb-16">
        {/* Sticky App Header */}
        <header className="sticky top-0 z-20 bg-background/95 backdrop-blur-xs border-b border-border/60 px-4 py-3 flex items-center justify-between">
          <Link
            href="/"
            className="size-8 rounded-full hover:bg-muted flex items-center justify-center transition-colors"
          >
            <ArrowLeft className="size-4 text-foreground" />
          </Link>
          <div className="text-center">
            <h1 className="font-extrabold text-sm text-foreground">Tiket Pengambilan</h1>
            <span className="text-[10px] text-muted-foreground block">
              Digital Boarding Pass Kasir
            </span>
          </div>
          <Link
            href="/history"
            className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 hover:underline"
          >
            Riwayat
          </Link>
        </header>

        {/* Content Body */}
        <main className="p-4 space-y-4 flex-1 overflow-y-auto">
          {activeTickets.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <div className="size-16 rounded-3xl bg-muted/70 flex items-center justify-center mx-auto text-muted-foreground border border-border/70">
                <ShoppingBag className="size-8 stroke-1" />
              </div>
              <div className="space-y-1">
                <h3 className="font-extrabold text-sm text-foreground">
                  Belum Ada Tiket Penjemputan Aktif
                </h3>
                <p className="text-xs text-muted-foreground max-w-xs mx-auto leading-relaxed">
                  Pesanan makanan surplus yang berhasil Anda bayar akan tampil di sini sebagai tiket fisik untuk divalidasi kasir.
                </p>
              </div>
              <Button
                onClick={() => router.push("/")}
                className="bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs h-9 px-5 rounded-xl shadow-xs"
              >
                Jelajah Makanan Sekarang
              </Button>
            </div>
          ) : (
            activeTickets.map((order) => {
              const store = stores.find((s) => s.id === order.storeId);
              const pin = order.pickupPin || "4829";
              const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                order.storeName + " " + (store?.address || "Cirebon")
              )}`;

              return (
                <div
                  key={order.id}
                  className="rounded-3xl border border-emerald-500/30 bg-gradient-to-b from-card via-card to-emerald-500/5 shadow-md overflow-hidden"
                >
                  {/* Boarding Pass Header */}
                  <div className="bg-emerald-700 text-white p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Sparkles className="size-3.5 text-amber-300" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-emerald-100">
                          Pickup Pass Resmi
                        </span>
                      </div>
                      <Badge className="bg-white/20 hover:bg-white/30 text-white text-[9px] font-black border-none uppercase">
                        {order.status === "READY_FOR_PICKUP" ? "Siap Diambil" : "Lunas: Menunggu Jam Ambil"}
                      </Badge>
                    </div>

                    <div>
                      <h2 className="font-black text-base leading-tight truncate">
                        {order.storeName}
                      </h2>
                      <span className="text-xs text-emerald-100 font-medium line-clamp-1">
                        {order.bagTitle} ({order.quantity} porsi)
                      </span>
                    </div>
                  </div>

                  {/* Perforated Divider Ticket Effect */}
                  <div className="relative py-2 px-4 flex items-center justify-between">
                    <div className="absolute -left-3 size-6 rounded-full bg-stone-100/70 dark:bg-stone-950 border-r border-border" />
                    <div className="w-full border-b-2 border-dashed border-border/80 my-2" />
                    <div className="absolute -right-3 size-6 rounded-full bg-stone-100/70 dark:bg-stone-950 border-l border-border" />
                  </div>

                  {/* Core Ticket Content: Large PIN & Dynamic QR */}
                  <div className="p-4 pt-1 space-y-4 text-center">
                    {/* Monospace 4-Digit PIN */}
                    <div className="space-y-1">
                      <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground block">
                        Tunjukkan PIN 4-Digit ke Kasir
                      </span>
                      <div className="inline-block py-1.5 px-6 rounded-2xl bg-muted/60 border border-border">
                        <span className="text-4xl font-black font-mono tracking-widest text-emerald-700 dark:text-emerald-400 tabular-nums">
                          {pin}
                        </span>
                      </div>
                      <span className="text-[10px] text-muted-foreground block">
                        Kasir akan memasukkan PIN ini untuk serah terima paket
                      </span>
                    </div>

                    {/* QR Code Container */}
                    <div className="flex flex-col items-center justify-center p-3.5 rounded-2xl bg-white border border-border shadow-xs w-fit mx-auto">
                      <QRCodeSVG
                        value={JSON.stringify({
                          orderId: order.id,
                          pin,
                          storeId: order.storeId,
                        })}
                        size={140}
                        level="M"
                      />
                      <span className="text-[9px] font-mono font-bold text-stone-600 mt-2">
                        {order.id}
                      </span>
                    </div>

                    {/* Pickup Details & Time Window */}
                    <Card className="p-3 text-left space-y-2 border-border/80 bg-muted/30 text-xs">
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-0.5 min-w-0">
                          <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wide block">
                            Lokasi Outlet
                          </span>
                          <span className="font-extrabold text-foreground block truncate">
                            {order.storeName}
                          </span>
                          <p className="text-[11px] text-muted-foreground line-clamp-2">
                            {store?.address || "Cirebon Kota"}
                          </p>
                        </div>
                        <a
                          href={mapsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="shrink-0 size-8 rounded-lg bg-emerald-50 dark:bg-emerald-950 border border-emerald-500/30 flex items-center justify-center text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 transition-colors"
                          title="Buka Navigasi Google Maps"
                        >
                          <MapPin className="size-4" />
                        </a>
                      </div>

                      <div className="pt-2 border-t border-border/50 flex items-center justify-between text-[11px]">
                        <span className="flex items-center gap-1 font-bold text-amber-700 dark:text-amber-400">
                          <Clock className="size-3.5" />
                          <span>
                            Jam Ambil:{" "}
                            {(order as unknown as { pickupWindow?: string }).pickupWindow ||
                              "19:30 - 21:00 WIB"}
                          </span>
                        </span>
                        <span className="font-black text-emerald-700 dark:text-emerald-400 tabular-nums">
                          Rp {order.totalPrice.toLocaleString("id-ID")}
                        </span>
                      </div>
                    </Card>

                    {/* Escrow Guarantee Note */}
                    <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-left flex items-center gap-2">
                      <ShieldCheck className="size-4 text-emerald-700 dark:text-emerald-400 shrink-0" />
                      <span className="text-[10px] text-emerald-950 dark:text-emerald-200 font-semibold leading-tight">
                        Dana aman di Rekber Escrow sampai Anda menerima makanan secara utuh di kasir.
                      </span>
                    </div>

                    {/* Action Buttons: Direct Maps & Chat */}
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <a
                        href={mapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="h-9 rounded-xl bg-muted/80 hover:bg-muted text-foreground font-bold text-xs flex items-center justify-center gap-1.5 border border-border transition-colors"
                      >
                        <ExternalLink className="size-3.5 text-muted-foreground" />
                        <span>Google Maps</span>
                      </a>

                      <Button
                        variant="outline"
                        onClick={() => setActiveChatOrder(order)}
                        className="h-9 rounded-xl font-bold text-xs gap-1.5 border-border"
                      >
                        <MessageSquare className="size-3.5 text-emerald-700" />
                        <span>Chat Toko</span>
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </main>

        {/* Chat Modal for Active Ticket Coordination */}
        {activeChatOrder && (
          <ChatModal
            order={activeChatOrder}
            onClose={() => setActiveChatOrder(null)}
          />
        )}
      </div>
    </div>
  );
}
