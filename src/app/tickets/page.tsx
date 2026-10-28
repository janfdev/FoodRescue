"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { storeService } from "@/services/storeService";
import { Order } from "@/types/domain";
import { QRCodeSVG } from "qrcode.react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ChatModal } from "@/components/shared/ChatModal";
import {
  ArrowLeft,
  Ticket,
  Clock,
  MessageSquare,
  ShoppingBag,
  User,
  CheckCircle2,
} from "lucide-react";

export default function TicketsPage() {
  const router = useRouter();
  const [state, setState] = useState(storeService.getState());
  const [activeTab, setActiveTab] = useState<"aktif" | "riwayat">("aktif");
  const [activeChatOrder, setActiveChatOrder] = useState<Order | null>(null);

  useEffect(() => {
    const unsub = storeService.subscribe(() => {
      setState(storeService.getState());
    });
    return unsub;
  }, []);

  const { orders, currentUser } = state;

  const userOrders = useMemo(() => {
    return orders.filter(
      (o) =>
        o.buyerId === currentUser.id ||
        o.buyerName.toLowerCase() === currentUser.name.toLowerCase() ||
        o.buyerPhone === currentUser.phone
    );
  }, [orders, currentUser]);

  const activeOrders = useMemo(() => {
    return userOrders.filter(
      (o) => o.status === "PAID" || o.status === "READY_FOR_PICKUP"
    );
  }, [userOrders]);

  const completedOrders = useMemo(() => {
    return userOrders.filter(
      (o) => o.status === "COMPLETED" || o.status === "CANCELLED"
    );
  }, [userOrders]);

  const displayOrders = activeTab === "aktif" ? activeOrders : completedOrders;

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
          <h1 className="font-extrabold text-sm text-foreground">Tiket Penyelamatan Makanan</h1>
          <div className="size-8" /> {/* Spacer */}
        </header>

        {/* Tab Switcher */}
        <div className="px-4 pt-3 pb-1">
          <div className="grid grid-cols-2 p-1 bg-muted/60 rounded-xl border border-border/50 text-xs">
            <button
              type="button"
              onClick={() => setActiveTab("aktif")}
              className={`py-1.5 rounded-lg font-bold transition-all flex items-center justify-center gap-1.5 ${
                activeTab === "aktif"
                  ? "bg-background text-foreground shadow-2xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <span>Tiket Aktif</span>
              {activeOrders.length > 0 && (
                <span className="size-4 rounded-full bg-emerald-700 text-white text-[9px] flex items-center justify-center font-mono">
                  {activeOrders.length}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("riwayat")}
              className={`py-1.5 rounded-lg font-bold transition-all ${
                activeTab === "riwayat"
                  ? "bg-background text-foreground shadow-2xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <span>Riwayat ({completedOrders.length})</span>
            </button>
          </div>
        </div>

        {/* Content Body */}
        <main className="flex-1 overflow-y-auto p-4 space-y-3.5">
          {displayOrders.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <div className="size-12 rounded-full bg-muted flex items-center justify-center mx-auto text-muted-foreground">
                <Ticket className="size-6 stroke-1" />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-bold text-foreground">
                  {activeTab === "aktif" ? "Belum ada tiket aktif" : "Belum ada riwayat pesanan"}
                </p>
                <p className="text-[11px] text-muted-foreground max-w-xs mx-auto">
                  {activeTab === "aktif"
                    ? "Pilih makanan surplus di beranda untuk menyelamatkan pangan dan mendapatkan voucher digital."
                    : "Pesanan yang telah Anda ambil di kasir akan tercatat di sini."}
                </p>
              </div>
              {activeTab === "aktif" && (
                <Button
                  onClick={() => router.push("/")}
                  className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold px-4 h-8 rounded-lg"
                >
                  Jelajah Makanan Surplus
                </Button>
              )}
            </div>
          ) : (
            displayOrders.map((ord) => (
              <Card key={ord.id} className="border-border/80 rounded-2xl shadow-2xs overflow-hidden bg-card space-y-3 p-4">
                {/* Store Header & Status */}
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-extrabold text-xs text-foreground block">{ord.storeName}</span>
                    <span className="text-[11px] text-muted-foreground">{ord.bagTitle}</span>
                  </div>
                  <Badge
                    className={`text-[9px] font-bold px-1.5 py-0.5 ${
                      ord.status === "COMPLETED"
                        ? "bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300"
                        : "bg-emerald-700 text-white"
                    }`}
                  >
                    {ord.status === "COMPLETED" ? "Sudah Diambil" : "Siap Ambil di Toko"}
                  </Badge>
                </div>

                {/* QR Code & PIN Presentation for Active Tickets */}
                {ord.status !== "COMPLETED" ? (
                  <div className="p-3.5 bg-muted/40 rounded-xl border border-border/60 text-center space-y-3">
                    <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block">
                      Tunjukkan PIN atau QR ke Kasir
                    </span>

                    <div className="inline-block p-2.5 bg-white rounded-xl border border-border/80 shadow-2xs">
                      <QRCodeSVG value={ord.pickupQrData} size={110} />
                    </div>

                    <div>
                      <span className="text-[10px] text-muted-foreground block">PIN 4-Digit Kasir:</span>
                      <span className="font-mono text-2xl font-black text-amber-800 dark:text-amber-400 tracking-widest block tabular-nums">
                        {ord.pickupCode}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-2 text-xs text-emerald-800 dark:text-emerald-300">
                    <CheckCircle2 className="size-4 shrink-0" />
                    <span className="text-[11px] font-medium">Makanan telah berhasil diserahterimakan di kasir.</span>
                  </div>
                )}

                {/* Order Details */}
                <div className="space-y-1 text-xs pt-1 border-t border-border/60">
                  <div className="flex justify-between text-muted-foreground text-[11px]">
                    <span>Nomor Order:</span>
                    <span className="font-mono font-bold text-foreground">{ord.id}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground text-[11px]">
                    <span>Jumlah Porsi:</span>
                    <span className="font-semibold text-foreground">{ord.quantity} porsi</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground text-[11px]">
                    <span>Metode Bayar:</span>
                    <span className="font-medium text-foreground">{ord.paymentMethod}</span>
                  </div>
                  <div className="flex justify-between font-bold text-xs pt-1 border-t border-border/40 text-foreground">
                    <span>Total Tagihan:</span>
                    <span className="text-emerald-700 dark:text-emerald-400 tabular-nums">
                      Rp {ord.totalPrice.toLocaleString("id-ID")}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setActiveChatOrder(ord)}
                    className="w-full text-xs font-bold gap-1.5 h-8 border-border"
                  >
                    <MessageSquare className="size-3.5 text-emerald-700" />
                    <span>Obrolan Kasir Toko</span>
                  </Button>
                </div>
              </Card>
            ))
          )}
        </main>

        {/* Floating Bottom App Navigation */}
        <nav className="fixed bottom-0 sm:absolute z-20 left-0 right-0 max-w-md mx-auto bg-background/95 backdrop-blur-xs border-t border-border/80 px-4 py-2 flex items-center justify-around">
          <Link
            href="/"
            className="flex flex-col items-center gap-0.5 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ShoppingBag className="size-5" />
            <span className="text-[10px] font-bold">Jelajah</span>
          </Link>

          <Link
            href="/tickets"
            className="flex flex-col items-center gap-0.5 text-emerald-700 dark:text-emerald-400 relative"
          >
            <Ticket className="size-5" />
            <span className="text-[10px] font-extrabold">Tiket Saya</span>
            {activeOrders.length > 0 && (
              <span className="size-2 rounded-full bg-emerald-600 absolute top-0 right-3" />
            )}
          </Link>

          <Link
            href="/account"
            className="flex flex-col items-center gap-0.5 text-muted-foreground hover:text-foreground transition-colors"
          >
            <User className="size-5" />
            <span className="text-[10px] font-bold">Akun</span>
          </Link>
        </nav>

        {/* In-App Chat Modal */}
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
