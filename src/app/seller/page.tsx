"use client";

import { useState, useEffect } from "react";
import { Order } from "@/types/domain";
import { storeService } from "@/services/storeService";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  QrCode,
  CheckCircle2,
  AlertTriangle,
  MessageSquare,
  Maximize2,
  Minimize2,
  Delete,
  Volume2,
  Sparkles,
} from "lucide-react";
import { ChatModal } from "@/components/shared/ChatModal";

function playSuccessChime() {
  try {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const audioCtx = new AudioContextClass();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.type = "sine";
    osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
    osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.12); // A5

    gain.gain.setValueAtTime(0.18, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.35);

    osc.start();
    osc.stop(audioCtx.currentTime + 0.35);
  } catch {
    // Audio restricted or uninitialized
  }
}

export default function SellerPosPage() {
  const [pickupCodeInput, setPickupCodeInput] = useState("");
  const [verifyResult, setVerifyResult] = useState<{ success: boolean; message: string } | null>(null);
  const [activeChatOrder, setActiveChatOrder] = useState<Order | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [pinDigits, setPinDigits] = useState<string[]>([]);

  const syncData = () => {
    setOrders(storeService.getState().orders);
  };

  useEffect(() => {
    syncData();
    const unsub = storeService.subscribe(syncData);
    return unsub;
  }, []);

  const handleVerify = (orderIdOrPin?: string) => {
    const targetCode = orderIdOrPin || pickupCodeInput || pinDigits.join("");
    if (!targetCode.trim()) return;

    const res = storeService.confirmOrderHandover(targetCode);
    setVerifyResult(res);
    setPickupCodeInput("");
    setPinDigits([]);
    syncData();

    if (res.success) {
      playSuccessChime();
    }

    setTimeout(() => {
      setVerifyResult(null);
    }, 4500);
  };

  const handleKeypadPress = (digit: string) => {
    if (pinDigits.length < 6) {
      const nextDigits = [...pinDigits, digit];
      setPinDigits(nextDigits);
      if (nextDigits.length === 4) {
        // Auto-verify when 4 digits are completed
        handleVerify(nextDigits.join(""));
      }
    }
  };

  const handleKeypadBackspace = () => {
    setPinDigits(pinDigits.slice(0, -1));
  };

  const handleKeypadClear = () => {
    setPinDigits([]);
  };

  const pendingPickupOrders = orders.filter(
    (o) => o.status === "PAID" || o.status === "READY_FOR_PICKUP"
  );

  return (
    <div className="space-y-6 w-full">
      {/* Top Banner & Focus Mode Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-border/60">
        <div>
          <h2 className="text-xl font-black text-foreground tracking-tight flex items-center gap-2">
            <span>Kasir POS & Serah Terima</span>
            <Badge className="bg-emerald-600/15 text-emerald-800 dark:text-emerald-300 border-emerald-600/30 text-[10px] font-bold">
              Escrow 90% Instan
            </Badge>
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Konfirmasi serah terima makanan surplus saat pembeli tiba di outlet
          </p>
        </div>

        <Button
          onClick={() => setIsFocusMode(true)}
          className="bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs h-9 px-4 rounded-xl gap-1.5 shadow-2xs cursor-pointer shrink-0"
        >
          <Maximize2 className="size-3.5" />
          <span>Mode Kasir Fokus (Layar Penuh)</span>
        </Button>
      </div>

      {/* Main Grid: Input Form & Order Queue */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Input Verifikasi Cepat No Pesanan / PIN */}
        <div className="lg:col-span-5">
          <Card className="border-border shadow-xs">
            <CardHeader className="p-5 pb-3">
              <CardTitle className="text-sm font-extrabold flex items-center gap-2">
                <QrCode className="size-4 text-emerald-600" />
                <span>Validasi PIN / No. Pesanan</span>
              </CardTitle>
              <CardDescription className="text-xs">
                Masukkan 4-digit PIN pembeli atau ID pesanan untuk mencairkan escrow
              </CardDescription>
            </CardHeader>

            <CardContent className="p-5 pt-0 space-y-4">
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="PIN atau ID (cth: 4829)"
                  value={pickupCodeInput}
                  onChange={(e) => setPickupCodeInput(e.target.value)}
                  className="font-mono text-center tracking-wider text-base font-bold uppercase tabular-nums"
                  maxLength={12}
                />
                <Button
                  type="button"
                  onClick={() => handleVerify()}
                  disabled={!pickupCodeInput.trim()}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs cursor-pointer"
                >
                  Serahkan
                </Button>
              </div>

              {verifyResult && (
                <div
                  className={`p-3 rounded-xl text-xs font-semibold flex items-start gap-2 ${
                    verifyResult.success
                      ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300"
                      : "bg-red-100 dark:bg-red-950/60 text-red-800 dark:text-red-300 border border-red-300"
                  }`}
                >
                  {verifyResult.success ? (
                    <CheckCircle2 className="size-4 shrink-0 mt-0.5 text-emerald-600" />
                  ) : (
                    <AlertTriangle className="size-4 shrink-0 mt-0.5 text-red-600" />
                  )}
                  <span>{verifyResult.message}</span>
                </div>
              )}

              <div className="p-3 bg-muted/40 rounded-xl text-xs text-muted-foreground space-y-1">
                <p className="font-bold text-foreground">Kepatuhan Penyerahan Makanan:</p>
                <p className="text-[11px] leading-relaxed">
                  Kasir wajib menyerahkan makanan menggunakan wadah resmi <strong>Rescue Box</strong>. Setelah konfirmasi, dana bersih (90%) langsung masuk ke saldo dompet toko.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Antrean Pesanan Siap Ambil */}
        <div className="lg:col-span-7">
          <Card className="border-border shadow-xs overflow-hidden">
            <CardHeader className="p-4 px-5 pb-3 border-b border-border/80 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm font-extrabold">
                  Antrean Pesanan Menunggu Ambil
                </CardTitle>
                <CardDescription className="text-xs">
                  Pesanan aktif yang sudah dibayar dan siap diambil hari ini
                </CardDescription>
              </div>
              <Badge variant="secondary" className="font-mono text-xs tabular-nums">
                {pendingPickupOrders.length} Pesanan
              </Badge>
            </CardHeader>

            <div className="overflow-x-auto">
              {pendingPickupOrders.length === 0 ? (
                <div className="p-12 text-center text-xs text-muted-foreground">
                  Tidak ada pesanan menunggu diambil saat ini.
                </div>
              ) : (
                <table className="w-full text-left text-xs">
                  <thead className="bg-muted/40 border-b border-border text-[11px] text-muted-foreground font-bold uppercase">
                    <tr>
                      <th className="p-3 px-4">Pembeli</th>
                      <th className="p-3">PIN / Order ID</th>
                      <th className="p-3">Paket</th>
                      <th className="p-3">Hak Bersih (90%)</th>
                      <th className="p-3 text-right">Aksi Kasir</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {pendingPickupOrders.map((ord) => (
                      <tr key={ord.id} className="hover:bg-muted/20">
                        <td className="p-3 px-4">
                          <span className="font-bold text-foreground block">{ord.buyerName}</span>
                          <span className="text-[10px] text-muted-foreground">{ord.buyerPhone}</span>
                        </td>
                        <td className="p-3">
                          <span className="font-mono font-black text-emerald-700 dark:text-emerald-400 block tabular-nums text-sm">
                            {ord.pickupPin || "4829"}
                          </span>
                          <span className="text-[10px] font-mono text-muted-foreground">{ord.id}</span>
                        </td>
                        <td className="p-3">
                          <span className="font-medium text-foreground block">{ord.bagTitle}</span>
                          <span className="text-[10px] text-muted-foreground">Qty: {ord.quantity}</span>
                        </td>
                        <td className="p-3 font-bold tabular-nums text-emerald-700 dark:text-emerald-400">
                          Rp {ord.sellerEarning.toLocaleString("id-ID")}
                        </td>
                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setActiveChatOrder(ord)}
                              className="size-8 p-0 text-muted-foreground hover:text-foreground cursor-pointer"
                              title="Buka Chat Pembeli"
                            >
                              <MessageSquare className="size-3.5 text-purple-600" />
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleVerify(ord.id)}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-7 px-3 cursor-pointer"
                            >
                              Serahkan
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Fullscreen POS Focus Mode Overlay */}
      {isFocusMode && (
        <div className="fixed inset-0 z-50 bg-stone-950 text-stone-100 flex flex-col justify-between p-4 sm:p-6 animate-in fade-in duration-200">
          {/* Top Focus Header */}
          <div className="flex items-center justify-between pb-4 border-b border-stone-800">
            <div className="flex items-center gap-2.5">
              <div className="size-8 rounded-xl bg-emerald-600 flex items-center justify-center text-white">
                <Sparkles className="size-4" />
              </div>
              <div>
                <h3 className="font-black text-sm tracking-tight text-white flex items-center gap-2">
                  <span>Kasir POS Focus Mode</span>
                  <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                </h3>
                <span className="text-[11px] text-stone-400">
                  Antrean: <strong className="text-emerald-400 tabular-nums">{pendingPickupOrders.length}</strong> pesanan siap ambil
                </span>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsFocusMode(false)}
              className="bg-stone-900 border-stone-700 hover:bg-stone-800 text-stone-200 text-xs font-bold gap-1.5 h-8.5 rounded-xl cursor-pointer"
            >
              <Minimize2 className="size-3.5" />
              <span>Keluar Mode Fokus</span>
            </Button>
          </div>

          {/* Central Keypad Area */}
          <div className="flex-1 flex flex-col items-center justify-center max-w-sm mx-auto w-full py-4 space-y-5">
            {/* PIN Display Boxes */}
            <div className="space-y-2 text-center w-full">
              <span className="text-[11px] font-black uppercase tracking-widest text-stone-400 block">
                Masukkan 4-Digit PIN Pembeli
              </span>
              <div className="flex items-center justify-center gap-2.5">
                {[0, 1, 2, 3].map((idx) => {
                  const digit = pinDigits[idx];
                  return (
                    <div
                      key={idx}
                      className={`size-14 rounded-2xl flex items-center justify-center text-2xl font-black font-mono tabular-nums transition-all ${
                        digit
                          ? "bg-emerald-600 text-white border-2 border-emerald-400 shadow-md scale-105"
                          : "bg-stone-900 text-stone-500 border border-stone-800"
                      }`}
                    >
                      {digit || "•"}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Notification / Verification Feedback */}
            {verifyResult && (
              <div
                className={`w-full p-3 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 animate-in zoom-in-95 ${
                  verifyResult.success
                    ? "bg-emerald-600 text-white shadow-lg"
                    : "bg-rose-600 text-white shadow-lg"
                }`}
              >
                {verifyResult.success ? (
                  <>
                    <Volume2 className="size-4 shrink-0" />
                    <span>{verifyResult.message}</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="size-4 shrink-0" />
                    <span>{verifyResult.message}</span>
                  </>
                )}
              </div>
            )}

            {/* Touch Keypad */}
            <div className="grid grid-cols-3 gap-2.5 w-full">
              {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => handleKeypadPress(num)}
                  className="h-14 rounded-2xl bg-stone-900 hover:bg-stone-800 active:scale-95 text-xl font-bold font-mono tabular-nums text-white border border-stone-800 flex items-center justify-center transition-all cursor-pointer shadow-xs"
                >
                  {num}
                </button>
              ))}

              <button
                type="button"
                onClick={handleKeypadClear}
                className="h-14 rounded-2xl bg-stone-900/60 hover:bg-stone-800 active:scale-95 text-xs font-bold text-stone-400 border border-stone-800 flex items-center justify-center transition-all cursor-pointer"
              >
                Clear
              </button>

              <button
                type="button"
                onClick={() => handleKeypadPress("0")}
                className="h-14 rounded-2xl bg-stone-900 hover:bg-stone-800 active:scale-95 text-xl font-bold font-mono tabular-nums text-white border border-stone-800 flex items-center justify-center transition-all cursor-pointer shadow-xs"
              >
                0
              </button>

              <button
                type="button"
                onClick={handleKeypadBackspace}
                className="h-14 rounded-2xl bg-stone-900/60 hover:bg-stone-800 active:scale-95 text-stone-400 border border-stone-800 flex items-center justify-center transition-all cursor-pointer"
                aria-label="Hapus digit"
              >
                <Delete className="size-5" />
              </button>
            </div>

            {/* Manual Action Button */}
            <Button
              disabled={pinDigits.length === 0}
              onClick={() => handleVerify()}
              className="w-full h-12 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm shadow-md cursor-pointer disabled:opacity-30"
            >
              Verifikasi & Serahkan Makanan
            </Button>
          </div>

          {/* Bottom Bar: Operational Note */}
          <div className="text-center text-[11px] text-stone-500 pt-3 border-t border-stone-800">
            Pastikan kemasan menggunakan wadah resmi Rescue Box bersubsidi sebelum paket diserahkan ke pelanggan.
          </div>
        </div>
      )}

      {/* Chat Modal */}
      {activeChatOrder && (
        <ChatModal
          order={activeChatOrder}
          onClose={() => setActiveChatOrder(null)}
        />
      )}
    </div>
  );
}
