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
  Receipt,
  MessageSquare,
  ShoppingBag,
  User,
  CheckCircle2,
  Star,
  ShieldCheck,
  PackageCheck,
  X,
} from "lucide-react";

export default function HistoryPage() {
  const router = useRouter();
  const [state, setState] = useState(storeService.getState());
  const [activeTab, setActiveTab] = useState<"aktif" | "riwayat">("aktif");
  const [activeChatOrder, setActiveChatOrder] = useState<Order | null>(null);
  const [reviewOrder, setReviewOrder] = useState<Order | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [usedRescueBox, setUsedRescueBox] = useState(true);

  useEffect(() => {
    const unsub = storeService.subscribe(() => {
      setState(storeService.getState());
    });
    return unsub;
  }, []);

  const { orders, reviews, currentUser } = state;

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
          <h1 className="font-extrabold text-sm text-foreground">Riwayat Pesanan</h1>
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
              <span>Pesanan Aktif</span>
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
              <span>Riwayat Selesai ({completedOrders.length})</span>
            </button>
          </div>
        </div>

        {/* Content Body */}
        <main className="flex-1 overflow-y-auto p-4 space-y-3.5">
          {displayOrders.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <div className="size-12 rounded-full bg-muted flex items-center justify-center mx-auto text-muted-foreground">
                <Receipt className="size-6 stroke-1" />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-bold text-foreground">
                  {activeTab === "aktif" ? "Belum ada pesanan aktif" : "Belum ada riwayat pesanan"}
                </p>
                <p className="text-[11px] text-muted-foreground max-w-xs mx-auto">
                  {activeTab === "aktif"
                    ? "Pilih makanan surplus di beranda untuk menyelamatkan pangan hari ini."
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
                    {ord.status === "COMPLETED" ? "Selesai Diambil" : "Siap Ambil di Toko"}
                  </Badge>
                </div>

                {/* QR Code & Presentation for Active Orders */}
                {ord.status !== "COMPLETED" ? (
                  <div className="p-3.5 bg-muted/40 rounded-xl border border-border/60 text-center space-y-3">
                    <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block">
                      Tunjukkan No. Pesanan atau QR ke Kasir
                    </span>

                    <div className="inline-block p-2.5 bg-white rounded-xl border border-border/80 shadow-2xs">
                      <QRCodeSVG value={ord.pickupQrData} size={110} />
                    </div>

                    <div>
                      <span className="text-[10px] text-muted-foreground block">Nomor Pesanan:</span>
                      <span className="font-mono text-xl font-black text-emerald-700 dark:text-emerald-400 tracking-wider block tabular-nums">
                        {ord.id}
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

                {/* Actions & Compliance Review */}
                <div className="pt-1 space-y-1.5">
                  {ord.status === "COMPLETED" && (
                    <>
                      {reviews.some((r) => r.orderId === ord.id) ? (
                        <div className="p-2 rounded-xl bg-muted/60 border border-border/80 flex items-center justify-between text-xs">
                          <div className="flex items-center gap-1.5">
                            <PackageCheck className="size-3.5 text-emerald-700" />
                            <span className="text-[11px] font-bold text-foreground">
                              {reviews.find((r) => r.orderId === ord.id)?.usedOfficialRescueBox
                                ? "Wadah Resmi Terverifikasi"
                                : "Kemasan Non-Standar"}
                            </span>
                          </div>
                          <span className="flex items-center gap-0.5 text-amber-600 font-black text-[11px]">
                            <Star className="size-3 fill-amber-500 text-amber-500" />
                            <span>{reviews.find((r) => r.orderId === ord.id)?.rating}</span>
                          </span>
                        </div>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => {
                            setReviewOrder(ord);
                            setRating(5);
                            setComment("");
                            setUsedRescueBox(true);
                          }}
                          className="w-full text-xs font-bold gap-1.5 h-8 bg-emerald-700 hover:bg-emerald-800 text-white shadow-2xs"
                        >
                          <PackageCheck className="size-3.5" />
                          <span>Cek Kepatuhan Wadah & Beri Ulasan</span>
                        </Button>
                      )}
                    </>
                  )}

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push(`/chat?orderId=${ord.id}`)}
                    className="w-full text-xs font-bold gap-1.5 h-8 border-border hover:bg-emerald-500/10 hover:text-emerald-800 dark:hover:text-emerald-300"
                  >
                    <MessageSquare className="size-3.5 text-emerald-700" />
                    <span>Buka Chat dengan Kasir</span>
                  </Button>
                </div>
              </Card>
            ))
          )}
        </main>

        {/* Modal Evaluasi Kepatuhan Wadah Ramah Lingkungan */}
        {reviewOrder && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="w-full max-w-sm rounded-3xl bg-card border border-border shadow-2xl p-4 space-y-3.5 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between pb-2 border-b border-border">
                <div className="space-y-0.5">
                  <h3 className="font-extrabold text-xs text-foreground">
                    Audit Kepatuhan & Ulasan
                  </h3>
                  <span className="text-[10px] text-muted-foreground block truncate">
                    {reviewOrder.storeName} ({reviewOrder.id})
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setReviewOrder(null)}
                  className="size-7 rounded-full hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground"
                >
                  <X className="size-4" />
                </button>
              </div>

              {/* 1. Pertanyaan Wadah Ramah Lingkungan */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-foreground block">
                  Apakah kasir menyerahkan makanan menggunakan wadah resmi Rescue Box?
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setUsedRescueBox(true)}
                    className={`p-2.5 rounded-xl border text-left text-xs space-y-0.5 transition-all cursor-pointer ${
                      usedRescueBox
                        ? "bg-emerald-700 text-white border-emerald-700 font-bold shadow-2xs"
                        : "bg-muted/40 hover:bg-muted text-foreground border-border/80"
                    }`}
                  >
                    <span className="block font-black text-[11px]">Ya, Sesuai Standar</span>
                    <span className={`block text-[9px] ${usedRescueBox ? "text-emerald-100" : "text-muted-foreground"}`}>
                      Wadah Rescue Box
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setUsedRescueBox(false)}
                    className={`p-2.5 rounded-xl border text-left text-xs space-y-0.5 transition-all cursor-pointer ${
                      !usedRescueBox
                        ? "bg-rose-700 text-white border-rose-700 font-bold shadow-2xs"
                        : "bg-muted/40 hover:bg-muted text-foreground border-border/80"
                    }`}
                  >
                    <span className="block font-black text-[11px]">Tidak Sesuai</span>
                    <span className={`block text-[9px] ${!usedRescueBox ? "text-rose-100" : "text-muted-foreground"}`}>
                      Plastik Sekali Pakai
                    </span>
                  </button>
                </div>
              </div>

              {/* 2. Rating Bintang */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-foreground block">
                  Kualitas & Kesegaran Makanan
                </label>
                <div className="flex items-center gap-2 justify-center py-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="p-1 hover:scale-110 transition-transform cursor-pointer"
                    >
                      <Star
                        className={`size-6 ${
                          star <= rating
                            ? "fill-amber-500 text-amber-500"
                            : "text-muted-foreground/40"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. Catatan Ulasan */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-foreground block">
                  Komentar Anda (Opsional)
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Ceritakan kondisi makanan dan keramahan staf kasir..."
                  className="w-full text-xs p-2 rounded-xl bg-muted/40 border border-border/80 focus:ring-1 focus:ring-emerald-600 focus:outline-hidden min-h-[60px]"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setReviewOrder(null)}
                  className="flex-1 text-xs h-8.5 rounded-xl"
                >
                  Batal
                </Button>
                <Button
                  size="sm"
                  onClick={() => {
                    storeService.submitReview(
                      reviewOrder.id,
                      rating,
                      comment.trim() || "Kualitas makanan sangat baik dan layak konsumsi.",
                      usedRescueBox
                    );
                    setReviewOrder(null);
                  }}
                  className="flex-1 text-xs font-bold h-8.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white"
                >
                  Simpan Evaluasi
                </Button>
              </div>
            </div>
          </div>
        )}

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
            href="/history"
            className="flex flex-col items-center gap-0.5 text-emerald-700 dark:text-emerald-400 relative"
          >
            <Receipt className="size-5" />
            <span className="text-[10px] font-extrabold">Riwayat</span>
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
