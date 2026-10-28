"use client";

import { useState, useEffect } from "react";
import { Order } from "@/types/domain";
import { storeService } from "@/services/storeService";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { QrCode, CheckCircle2, AlertTriangle, MessageSquare } from "lucide-react";
import { ChatModal } from "@/components/shared/ChatModal";

export default function SellerPosPage() {
  const [pickupCodeInput, setPickupCodeInput] = useState("");
  const [verifyResult, setVerifyResult] = useState<{ success: boolean; message: string } | null>(null);
  const [activeChatOrder, setActiveChatOrder] = useState<Order | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);

  const syncData = () => {
    setOrders(storeService.getState().orders);
  };

  useEffect(() => {
    syncData();
    const unsub = storeService.subscribe(syncData);
    return unsub;
  }, []);

  const handleVerify = (orderIdToVerify?: string) => {
    const targetId = orderIdToVerify || pickupCodeInput;
    if (!targetId.trim()) return;

    const res = storeService.confirmOrderHandover(targetId);
    setVerifyResult(res);
    setPickupCodeInput("");
    syncData();

    setTimeout(() => {
      setVerifyResult(null);
    }, 4500);
  };

  const pendingPickupOrders = orders.filter(
    (o) => o.status === "PAID" || o.status === "READY_FOR_PICKUP"
  );

  return (
    <div className="space-y-6 w-full">
      <div>
        <h2 className="text-xl font-black text-foreground tracking-tight">
          Kasir POS & Serah Terima Pesanan
        </h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          Konfirmasi serah terima makanan surplus saat pembeli datang mengambil langsung ke toko
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Input Verifikasi Cepat No Pesanan */}
        <div className="lg:col-span-5">
          <Card className="border-border shadow-xs">
            <CardHeader className="p-5 pb-3">
              <CardTitle className="text-sm font-extrabold flex items-center gap-2">
                <QrCode className="size-4 text-emerald-600" />
                <span>Konfirmasi No. Pesanan</span>
              </CardTitle>
              <CardDescription className="text-xs">
                Masukkan No. Pesanan pembeli untuk menyelesaikan serah terima makanan
              </CardDescription>
            </CardHeader>

            <CardContent className="p-5 pt-0 space-y-4">
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="Contoh: RB-8492"
                  value={pickupCodeInput}
                  onChange={(e) => setPickupCodeInput(e.target.value)}
                  className="font-mono text-center tracking-wider text-base font-bold uppercase"
                  maxLength={12}
                />
                <Button
                  type="button"
                  onClick={() => handleVerify()}
                  disabled={!pickupCodeInput.trim()}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs"
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
                <p className="font-bold text-foreground">Alur Serah Terima Instan:</p>
                <p className="text-[11px] leading-relaxed">
                  Seperti Gojek / GrabFood, pembeli yang telah membayar langsung datang ke toko. Klik <strong>Serahkan</strong> untuk mencairkan dana bersih (88%) ke saldo dompet toko.
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
              <Badge variant="secondary" className="font-mono text-xs">
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
                      <th className="p-3">No. Pesanan</th>
                      <th className="p-3">Paket</th>
                      <th className="p-3">Earning (Net)</th>
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
                        <td className="p-3 font-mono font-bold text-emerald-700 dark:text-emerald-400">
                          {ord.id}
                        </td>
                        <td className="p-3">
                          <span className="font-medium text-foreground block">{ord.bagTitle}</span>
                          <span className="text-[10px] text-muted-foreground">Qty: {ord.quantity}</span>
                        </td>
                        <td className="p-3 font-bold tabular-nums text-emerald-600">
                          Rp {ord.sellerEarning.toLocaleString("id-ID")}
                        </td>
                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setActiveChatOrder(ord)}
                              className="size-8 p-0 text-muted-foreground hover:text-foreground"
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
