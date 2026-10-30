"use client";

import { use, useEffect, useState, useRef, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { storeService } from "@/services/storeService";
import { Order, ChatMessage } from "@/types/domain";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { resolveUserAvatar } from "@/lib/avatar";
import {
  ArrowLeft,
  Shield,
  ShieldCheck,
  Building2,
  User,
  Clock,
  Lock,
  Receipt,
  MapPin,
  Phone,
  CheckCircle2,
} from "lucide-react";

interface AdminChatDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function AdminChatDetailPage({ params }: AdminChatDetailPageProps) {
  const router = useRouter();
  const resolvedParams = use(params);
  const orderId = resolvedParams.id;

  const [state, setState] = useState(storeService.getState());
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const unsub = storeService.subscribe(() => {
      setState(storeService.getState());
    });
    return unsub;
  }, []);

  const order = useMemo(() => {
    return state.orders.find((o) => o.id === orderId) || null;
  }, [state.orders, orderId]);

  const syncMessages = () => {
    if (!orderId) return;
    const list = storeService.getChatMessages(orderId);
    setMessages(list);
  };

  useEffect(() => {
    syncMessages();
    const unsub = storeService.subscribe(syncMessages);
    return unsub;
  }, [orderId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!order) {
    return (
      <div className="w-full max-w-4xl mx-auto space-y-4 font-sans py-8">
        <Link
          href="/admin/transaksi"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="size-4" />
          <span>Kembali ke Daftar Transaksi</span>
        </Link>
        <Card className="p-8 text-center border-border shadow-xs">
          <h2 className="text-sm font-bold text-foreground">
            Transaksi ID &quot;{orderId}&quot; tidak ditemukan.
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            Data pesanan mungkin telah dihapus atau belum tercatat pada state sistem.
          </p>
        </Card>
      </div>
    );
  }

  const buyerAvatar = resolveUserAvatar(undefined, order.buyerName);
  const storeAvatar = resolveUserAvatar(undefined, order.storeName);

  return (
    <div className="w-full space-y-4 font-sans">
      {/* Top Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <Link
            href="/admin/transaksi"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-purple-600 transition-colors"
          >
            <ArrowLeft className="size-3.5" />
            <span>Kembali ke Daftar Transaksi</span>
          </Link>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black text-foreground tracking-tight">
              Audit Percakapan Interaktif
            </h1>
            <Badge variant="outline" className="font-mono text-xs font-bold border-purple-500/40 text-purple-700 dark:text-purple-300">
              {order.id}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            Ruang audit mandiri pengawas platform untuk membaca arsip koordinasi penjemputan makanan surplus
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge
            variant={
              order.status === "COMPLETED"
                ? "default"
                : order.status === "PAID"
                ? "secondary"
                : "outline"
            }
            className={`text-xs font-bold px-3 py-1 ${
              order.status === "COMPLETED" ? "bg-emerald-600 text-white" : ""
            }`}
          >
            {order.status === "COMPLETED" ? "Pesanan Selesai" : "Status: " + order.status}
          </Badge>
        </div>
      </div>

      {/* Main Grid: Detail Transaksi & Log Percakapan */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Kolom Kiri: Metadata Transaksi & Pihak Terlibat */}
        <div className="lg:col-span-4 space-y-4">
          <Card className="border-border shadow-xs overflow-hidden">
            <CardHeader className="bg-muted/40 p-4 border-b border-border">
              <CardTitle className="text-xs font-black text-foreground uppercase tracking-wider flex items-center gap-2">
                <Receipt className="size-3.5 text-purple-600" />
                <span>Ringkasan Pesanan</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3.5 text-xs">
              <div>
                <span className="text-[10px] uppercase font-bold text-muted-foreground block">
                  Paket Makanan
                </span>
                <span className="font-extrabold text-foreground text-sm block">
                  {order.bagTitle}
                </span>
                <span className="text-[11px] text-muted-foreground">
                  Qty: {order.quantity} porsi
                </span>
              </div>

              <div className="pt-2 border-t border-border/70 flex justify-between items-baseline">
                <span className="text-muted-foreground font-semibold">Total Nilai:</span>
                <span className="font-black text-sm text-foreground tabular-nums">
                  Rp {order.totalPrice.toLocaleString("id-ID")}
                </span>
              </div>

              <div className="flex justify-between items-baseline text-[11px]">
                <span className="text-muted-foreground font-medium">Komisi Platform:</span>
                <span className="font-bold text-purple-600 tabular-nums">
                  Rp {order.platformFee.toLocaleString("id-ID")}
                </span>
              </div>

              <div className="flex justify-between items-baseline text-[11px]">
                <span className="text-muted-foreground font-medium">Metode Pembayaran:</span>
                <Badge variant="outline" className="font-mono text-[10px]">
                  {order.paymentMethod}
                </Badge>
              </div>

              <div className="pt-2 border-t border-border/70 space-y-1">
                <span className="text-[10px] uppercase font-bold text-muted-foreground block">
                  PIN Pengambilan
                </span>
                <div className="bg-muted/50 p-2 rounded-lg font-mono font-black text-center text-sm tracking-widest text-foreground">
                  {order.pickupPin}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Kartu Pihak: Pembeli & Mitra */}
          <Card className="border-border shadow-xs p-4 space-y-3 text-xs">
            <div className="flex items-center gap-3">
              <Avatar className="size-9 shrink-0 border border-border">
                <AvatarImage src={buyerAvatar} alt={order.buyerName} />
                <AvatarFallback className="font-bold text-xs bg-blue-600 text-white">
                  {order.buyerName.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <span className="text-[10px] font-bold text-blue-600 uppercase block">
                  Pembeli (Pelanggan)
                </span>
                <span className="font-extrabold text-foreground block truncate">
                  {order.buyerName}
                </span>
                <span className="text-[10px] text-muted-foreground font-mono block">
                  {order.buyerPhone}
                </span>
              </div>
            </div>

            <div className="border-t border-border/60 pt-3 flex items-center gap-3">
              <Avatar className="size-9 shrink-0 border border-border">
                <AvatarImage src={storeAvatar} alt={order.storeName} />
                <AvatarFallback className="font-bold text-xs bg-orange-600 text-white">
                  {order.storeName.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <span className="text-[10px] font-bold text-orange-600 uppercase block">
                  Mitra Kuliner (Penjual)
                </span>
                <span className="font-extrabold text-foreground block truncate">
                  {order.storeName}
                </span>
                <span className="text-[10px] text-muted-foreground block truncate">
                  {order.storeAddress}
                </span>
              </div>
            </div>
          </Card>
        </div>

        {/* Kolom Kanan: Full Audit Chat Log */}
        <div className="lg:col-span-8">
          <Card className="border-border shadow-xs flex flex-col h-[650px] overflow-hidden">
            {/* Header Log Chat */}
            <div className="p-3.5 px-4 bg-muted/40 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="size-4 text-purple-600" />
                <span className="text-xs font-black text-foreground">
                  Arsip Percakapan Transaksi
                </span>
                <Badge variant="outline" className="text-[10px] font-mono">
                  {messages.length} Pesan
                </Badge>
              </div>

              {order.isChatLocked ? (
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-amber-600">
                  <Lock className="size-3.5" />
                  <span>Ruang Obrolan Terkunci (Selesai)</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-600">
                  <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Obrolan Masih Aktif</span>
                </div>
              )}
            </div>

            {/* Area Daftar Pesan */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-stone-50/40 dark:bg-zinc-950/40">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-muted-foreground">
                  <Clock className="size-8 stroke-1 text-muted-foreground/60 mb-2" />
                  <p className="text-xs font-bold text-foreground">Belum Ada Percakapan</p>
                  <p className="text-[11px] text-muted-foreground max-w-xs mt-0.5">
                    Pembeli dan Mitra Toko belum saling bertukar pesan untuk pesanan ini.
                  </p>
                </div>
              ) : (
                messages.map((msg) => {
                  const isBuyer = msg.senderRole === "buyer";
                  return (
                    <div
                      key={msg.id}
                      className={`flex gap-2.5 max-w-[85%] ${
                        isBuyer ? "mr-auto" : "ml-auto flex-row-reverse"
                      }`}
                    >
                      <Avatar className="size-7 shrink-0 mt-0.5 border border-border">
                        <AvatarImage src={msg.senderAvatarUrl} alt={msg.senderName} />
                        <AvatarFallback
                          className={`text-[9px] font-black text-white ${
                            isBuyer ? "bg-blue-600" : "bg-orange-600"
                          }`}
                        >
                          {msg.senderName.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>

                      <div className="space-y-1">
                        <div
                          className={`flex items-baseline gap-2 text-[10px] ${
                            isBuyer ? "text-left" : "text-right flex-row-reverse"
                          }`}
                        >
                          <span className="font-bold text-foreground">{msg.senderName}</span>
                          <span className="text-[9px] uppercase px-1 rounded bg-muted text-muted-foreground font-semibold">
                            {msg.senderRole === "buyer" ? "Pembeli" : "Mitra Toko"}
                          </span>
                          <span className="text-muted-foreground text-[9px] tabular-nums">
                            {new Date(msg.timestamp).toLocaleTimeString("id-ID", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>

                        <div
                          className={`p-3 rounded-2xl text-xs leading-relaxed shadow-2xs ${
                            isBuyer
                              ? "bg-card text-foreground border border-border rounded-tl-xs"
                              : "bg-purple-600 text-white rounded-tr-xs"
                          }`}
                        >
                          {msg.text}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Footer Status Pengawas */}
            <div className="p-3 bg-muted/60 border-t border-border flex items-center justify-between text-[11px] text-muted-foreground">
              <span className="flex items-center gap-1.5 font-medium">
                <Shield className="size-3.5 text-purple-600 shrink-0" />
                <span>Mode Audit Admin: Tampilan ini read-only untuk melindungi integritas percakapan.</span>
              </span>
              <span className="font-mono text-[10px] tabular-nums">
                Audit Status: LOCKED
              </span>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
