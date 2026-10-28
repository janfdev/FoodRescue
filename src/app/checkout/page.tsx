"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { storeService } from "@/services/storeService";
import { SurpriseBag, Store, Order } from "@/types/domain";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { QRCodeSVG } from "qrcode.react";
import {
  ArrowLeft,
  Clock,
  QrCode,
  Banknote,
  Building2,
  CheckCircle2,
} from "lucide-react";

function CheckoutContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const bagId = searchParams.get("bagId");

  const [bag, setBag] = useState<SurpriseBag | null>(null);
  const [store, setStore] = useState<Store | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState<"QRIS" | "COD" | "VA">("QRIS");
  const [guestName, setGuestName] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);

  useEffect(() => {
    // Read cached guest details
    const savedName = localStorage.getItem("rerasa_guest_name");
    const savedPhone = localStorage.getItem("rerasa_guest_phone");
    if (savedName) setGuestName(savedName);
    if (savedPhone) setGuestPhone(savedPhone);

    if (bagId) {
      const state = storeService.getState();
      const foundBag = state.surpriseBags.find((b) => b.id === bagId);
      if (foundBag) {
        setBag(foundBag);
        const foundStore = state.stores.find((s) => s.id === foundBag.storeId);
        if (foundStore) setStore(foundStore);
      }
    }
  }, [bagId]);

  if (!bagId || !bag || !store) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-6 text-center space-y-4">
          <p className="text-sm font-bold text-foreground">Paket makanan tidak ditemukan atau kuota telah habis.</p>
          <Button onClick={() => router.push("/")} className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold">
            Kembali ke Katalog Beranda
          </Button>
        </Card>
      </div>
    );
  }

  const discountPct = Math.round(((bag.originalPrice - bag.discountedPrice) / bag.originalPrice) * 100);
  const subtotal = bag.discountedPrice * quantity;
  const adminFee = 1000;
  const total = subtotal + adminFee;
  const totalNormal = bag.originalPrice * quantity;
  const totalSavings = totalNormal - subtotal;

  const handleConfirmOrder = () => {
    const finalName = guestName.trim() || "Warga Cirebon";
    const finalPhone = guestPhone.trim() || "081234567890";

    localStorage.setItem("rerasa_guest_name", finalName);
    localStorage.setItem("rerasa_guest_phone", finalPhone);

    try {
      setIsSubmitting(true);
      const newOrder = storeService.createOrder(
        bag.id,
        paymentMethod === "COD" ? "TUNAI_KASIR" : paymentMethod === "VA" ? "TRANSFER_VA" : "QRIS",
        { name: finalName, phone: finalPhone },
        quantity
      );
      setConfirmedOrder(newOrder);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Terjadi kesalahan saat memproses pesanan";
      alert(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // If order is completed, show the Instant Pickup Ticket Voucher
  if (confirmedOrder) {
    return (
      <div className="min-h-screen bg-stone-100 dark:bg-stone-950 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md bg-card border border-border rounded-3xl shadow-lg p-6 space-y-6">
          <div className="text-center space-y-2">
            <div className="size-12 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 mx-auto flex items-center justify-center">
              <CheckCircle2 className="size-7" />
            </div>
            <h2 className="text-lg font-black text-foreground">Pesanan Berhasil Diselamatkan!</h2>
            <p className="text-xs text-muted-foreground">
              Tunjukkan tiket voucher digital ini kepada staf kasir saat mengambil makanan
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-muted/50 border border-border/80 space-y-3">
            <div className="flex justify-between items-center text-xs pb-2 border-b border-border/60">
              <span className="text-muted-foreground">Nomor Order:</span>
              <span className="font-mono font-bold text-foreground">{confirmedOrder.id}</span>
            </div>

            <div className="text-center space-y-1">
              <span className="text-[11px] text-muted-foreground uppercase tracking-wider block font-semibold">
                Status Pesanan
              </span>
              <div className="inline-block px-4 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-xs font-extrabold text-emerald-800 dark:text-emerald-300">
                Terbayar • Siap Diambil di Toko
              </div>
            </div>

            <div className="flex justify-center p-3 bg-white rounded-xl border border-border/60 w-fit mx-auto">
              <QRCodeSVG value={confirmedOrder.pickupQrData} size={130} />
            </div>

            <div className="space-y-1 text-xs pt-2 border-t border-border/60">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Mitra:</span>
                <span className="font-bold text-foreground">{store.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Paket ({confirmedOrder.quantity} porsi):</span>
                <span className="font-semibold text-foreground text-right">{bag.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Jam Ambil:</span>
                <span className="font-bold text-amber-700 dark:text-amber-400">{bag.pickupWindow}</span>
              </div>
              <div className="flex justify-between pt-1 font-bold text-sm">
                <span>Total Bayar:</span>
                <span className="text-emerald-700 dark:text-emerald-400">
                  Rp {confirmedOrder.totalPrice.toLocaleString("id-ID")}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Button
              onClick={() => router.push(`/chat?orderId=${confirmedOrder.id}`)}
              className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs"
            >
              Chat Kasir Toko Sekarang
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push("/history")}
              className="w-full text-xs font-semibold"
            >
              Lihat Riwayat Pesanan
            </Button>
            <Button
              variant="ghost"
              onClick={() => router.push("/")}
              className="w-full text-xs font-medium text-muted-foreground"
            >
              Kembali ke Beranda
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-100/70 dark:bg-stone-950 flex justify-center py-0 sm:py-6">
      {/* Mobile Frame Container */}
      <div className="w-full max-w-md bg-background min-h-screen sm:min-h-0 sm:rounded-3xl sm:border sm:border-border sm:shadow-lg flex flex-col justify-between overflow-hidden">
        {/* Sticky App Header */}
        <div className="sticky top-0 z-20 bg-background/95 backdrop-blur-xs border-b border-border/60 px-4 py-3 flex items-center justify-between">
          <button
            type="button"
            onClick={() => router.back()}
            className="size-9 rounded-full hover:bg-muted flex items-center justify-center transition-colors"
          >
            <ArrowLeft className="size-5 text-foreground" />
          </button>
          <h1 className="font-extrabold text-sm text-foreground">Konfirmasi Pesanan</h1>
          <div className="size-9" /> {/* Spacer */}
        </div>

        {/* Content Body */}
        <div className="p-4 space-y-4 flex-1 overflow-y-auto">
          {/* Card Rincian Paket */}
          <Card className="p-3.5 border-border shadow-2xs space-y-3">
            <div className="flex items-start gap-3">
              <img
                src={bag.imageUrl || "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600"}
                alt={bag.title}
                className="size-20 rounded-xl object-cover border border-border/80 shrink-0"
              />
              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 truncate">
                    {store.name}
                  </span>
                  <Badge variant="secondary" className="text-[9px] font-bold bg-amber-500/15 text-amber-800 dark:text-amber-400 border border-amber-500/30 px-1 py-0">
                    Hemat {discountPct}%
                  </Badge>
                </div>
                <h3 className="font-extrabold text-xs text-foreground leading-snug line-clamp-2">
                  {bag.title}
                </h3>
                <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                  <Clock className="size-3 text-amber-600 shrink-0" />
                  <span>Ambil: {bag.pickupWindow}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-border/60 text-xs">
              <span className="text-muted-foreground">Harga Satuan Porsi:</span>
              <div className="text-right">
                <span className="text-[10px] text-muted-foreground line-through mr-1.5 tabular-nums">
                  Rp {bag.originalPrice.toLocaleString("id-ID")}
                </span>
                <span className="font-black text-emerald-700 dark:text-emerald-400 tabular-nums">
                  Rp {bag.discountedPrice.toLocaleString("id-ID")}
                </span>
              </div>
            </div>
          </Card>

          {/* Stepper Hitung Jumlah Kuantitas Porsi */}
          <Card className="p-3.5 border-border shadow-2xs space-y-2.5">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-extrabold text-xs text-foreground block">Jumlah Porsi Pesanan</span>
                <span className="text-[11px] text-muted-foreground">
                  Tersedia {bag.quotaRemaining} porsi surplus hari ini
                </span>
              </div>

              <div className="flex items-center gap-2.5 bg-muted/50 p-1 rounded-xl border border-border/60">
                <button
                  type="button"
                  disabled={quantity <= 1}
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="size-7 rounded-lg bg-background hover:bg-muted font-bold text-xs flex items-center justify-center border border-border/60 disabled:opacity-40 transition-colors"
                >
                  -
                </button>
                <span className="font-black text-sm tabular-nums w-6 text-center text-foreground">
                  {quantity}
                </span>
                <button
                  type="button"
                  disabled={quantity >= bag.quotaRemaining}
                  onClick={() => setQuantity((q) => Math.min(bag.quotaRemaining, q + 1))}
                  className="size-7 rounded-lg bg-background hover:bg-muted font-bold text-xs flex items-center justify-center border border-border/60 disabled:opacity-40 transition-colors"
                >
                  +
                </button>
              </div>
            </div>
          </Card>

          {/* Pemilihan Metode Pembayaran */}
          <Card className="p-3.5 border-border shadow-2xs space-y-2.5">
            <span className="font-extrabold text-xs text-foreground block">Pilih Metode Pembayaran</span>
            <div className="space-y-2">
              {[
                {
                  id: "QRIS",
                  title: "QRIS Instan (Simulasi)",
                  desc: "Scan QR dari mobile banking / e-wallet mana saja",
                  icon: QrCode,
                  recommended: true,
                },
                {
                  id: "COD",
                  title: "Bayar Tunai di Kasir (COD)",
                  desc: "Bayar langsung ke staf saat ambil makanan di gerai",
                  icon: Banknote,
                },
                {
                  id: "VA",
                  title: "Virtual Account Bank",
                  desc: "BCA, Mandiri, BNI, atau BRI",
                  icon: Building2,
                },
              ].map((opt) => {
                const Icon = opt.icon;
                const isSelected = paymentMethod === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setPaymentMethod(opt.id as "QRIS" | "COD" | "VA")}
                    className={`w-full text-left p-2.5 rounded-xl border transition-all flex items-start gap-2.5 ${
                      isSelected
                        ? "border-emerald-600 bg-emerald-500/10 dark:bg-emerald-950/40"
                        : "border-border/70 hover:bg-muted/40"
                    }`}
                  >
                    <div
                      className={`size-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                        isSelected
                          ? "bg-emerald-600 text-white"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      <Icon className="size-3.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-xs text-foreground">{opt.title}</span>
                        {opt.recommended && (
                          <Badge className="bg-emerald-700 text-white text-[9px] font-bold px-1 py-0">
                            Paling Cepat
                          </Badge>
                        )}
                      </div>
                      <span className="text-[11px] text-muted-foreground block truncate">{opt.desc}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </Card>

          {/* Formulir Informasi Pengambil */}
          <Card className="p-3.5 border-border shadow-2xs space-y-2.5">
            <span className="font-extrabold text-xs text-foreground block">Informasi Pengambil</span>
            <div className="space-y-2">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-muted-foreground block">
                  Nama Pemesan
                </label>
                <Input
                  type="text"
                  placeholder="Contoh: Fauzan"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  className="text-xs h-8"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-muted-foreground block">
                  Nomor WhatsApp
                </label>
                <Input
                  type="tel"
                  placeholder="Contoh: 081234567890"
                  value={guestPhone}
                  onChange={(e) => setGuestPhone(e.target.value)}
                  className="text-xs h-8"
                />
              </div>
            </div>
          </Card>

          {/* Rincian Kalkulasi Biaya Transparan */}
          <Card className="p-3.5 border-border shadow-2xs space-y-2 text-xs bg-muted/20">
            <span className="font-extrabold text-xs text-foreground block">Rincian Pembayaran</span>
            <div className="flex justify-between text-muted-foreground">
              <span>Subtotal Makanan ({quantity} porsi)</span>
              <span className="tabular-nums font-semibold text-foreground">
                Rp {subtotal.toLocaleString("id-ID")}
              </span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Biaya Layanan Aplikasi</span>
              <span className="tabular-nums font-semibold text-foreground">
                Rp {adminFee.toLocaleString("id-ID")}
              </span>
            </div>
            <div className="flex justify-between text-amber-700 dark:text-amber-400 font-semibold pt-1 border-t border-border/50">
              <span>Hemat Penyelamatan Pangan</span>
              <span className="tabular-nums">
                -Rp {totalSavings.toLocaleString("id-ID")}
              </span>
            </div>
            <div className="flex justify-between font-black text-sm pt-1 border-t border-border text-foreground">
              <span>Total Tagihan</span>
              <span className="text-emerald-700 dark:text-emerald-400 tabular-nums">
                Rp {total.toLocaleString("id-ID")}
              </span>
            </div>
          </Card>
        </div>

        {/* Sticky Bottom Bar */}
        <div className="p-4 bg-background border-t border-border/80 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <div>
              <span className="text-[10px] text-muted-foreground block">Total Pembayaran</span>
              <span className="text-base font-black text-emerald-700 dark:text-emerald-400 tabular-nums">
                Rp {total.toLocaleString("id-ID")}
              </span>
            </div>

            <Button
              disabled={isSubmitting}
              onClick={handleConfirmOrder}
              className="bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs h-10 px-5 rounded-xl shadow-xs"
            >
              {isSubmitting ? "Memproses..." : "Bayar & Simpan Pesanan"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-stone-100 dark:bg-stone-950 flex items-center justify-center p-4">
          <p className="text-xs text-muted-foreground font-semibold">Memuat formulir checkout...</p>
        </div>
      }
    >
      <CheckoutContent />
    </Suspense>
  );
}
