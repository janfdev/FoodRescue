"use client";

import { Suspense, useState, useEffect, useRef, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { storeService } from "@/services/storeService";
import { Order, ChatMessage } from "@/types/domain";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { resolveUserAvatar } from "@/lib/avatar";
import {
  ArrowLeft,
  ChevronRight,
  Send,
  Lock,
  Clock,
  Building2,
  ShieldCheck,
  MapPin,
  CheckCircle2,
} from "lucide-react";

function ChatContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get("orderId");

  const [state, setState] = useState(storeService.getState());
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
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

  const loadMessages = () => {
    if (!orderId) return;
    const list = storeService.getChatMessages(orderId);
    setMessages(list);
  };

  useEffect(() => {
    loadMessages();
    const unsub = storeService.subscribe(loadMessages);
    return unsub;
  }, [orderId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const currentUser = state.currentUser;

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || !order || order.isChatLocked) return;

    try {
      storeService.sendChatMessage(order.id, inputText.trim());
      setInputText("");
    } catch (err: unknown) {
      console.error("Error sending message:", err);
    }
  };

  const handleQuickSend = (text: string) => {
    if (!order || order.isChatLocked) return;
    storeService.sendChatMessage(order.id, text);
  };

  const formatTime = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
    } catch {
      return "";
    }
  };

  if (!orderId || !order) {
    return (
      <div className="min-h-screen bg-stone-100/70 dark:bg-stone-950 flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-6 text-center space-y-4">
          <p className="text-sm font-bold text-foreground">Pesanan tidak ditemukan atau link chat tidak valid.</p>
          <Button
            onClick={() => router.push("/history")}
            className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs"
          >
            Kembali ke Riwayat Pesanan
          </Button>
        </Card>
      </div>
    );
  }

  const isBuyer = currentUser.role === "buyer";
  const chatPartnerName = isBuyer ? order.storeName : order.buyerName;
  const partnerAvatarUrl = useMemo(() => {
    return resolveUserAvatar(undefined, chatPartnerName);
  }, [chatPartnerName]);

  return (
    <div className="min-h-screen bg-stone-100/70 dark:bg-stone-950 flex justify-center py-0 sm:py-6">
      {/* Mobile Frame Container */}
      <div className="w-full max-w-md bg-background min-h-screen sm:min-h-0 sm:rounded-3xl sm:border sm:border-border sm:shadow-lg flex flex-col justify-between overflow-hidden">
        {/* Header with Breadcrumb & Back */}
        <header className="sticky top-0 z-20 bg-background/95 backdrop-blur-xs border-b border-border/60 px-3 py-2.5 space-y-1.5 shrink-0">
          {/* Breadcrumb Bar */}
          <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-[10px] text-muted-foreground px-1 overflow-x-auto scrollbar-none">
            <Link href="/" className="hover:text-foreground transition-colors shrink-0">
              Beranda
            </Link>
            <ChevronRight className="size-2.5 shrink-0 text-muted-foreground/60" />
            <Link href="/history" className="hover:text-foreground transition-colors shrink-0">
              Riwayat
            </Link>
            <ChevronRight className="size-2.5 shrink-0 text-muted-foreground/60" />
            <span className="font-bold text-foreground truncate shrink-0 max-w-[140px]">
              Chat {order.id}
            </span>
          </nav>

          {/* Top Bar with Navigation Back */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <button
                type="button"
                onClick={() => router.back()}
                className="size-8 rounded-full hover:bg-muted flex items-center justify-center transition-colors shrink-0"
                aria-label="Kembali"
              >
                <ArrowLeft className="size-4 text-foreground" />
              </button>

              <Avatar className="size-8 rounded-full border border-border/80 shrink-0">
                <AvatarImage src={partnerAvatarUrl} alt={chatPartnerName} />
                <AvatarFallback className="bg-emerald-700 text-white font-bold text-xs">
                  {chatPartnerName.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h1 className="font-extrabold text-xs text-foreground truncate">
                    {chatPartnerName}
                  </h1>
                  <Badge variant="outline" className="text-[9px] px-1 py-0 border-emerald-600/40 text-emerald-700 dark:text-emerald-400 font-mono">
                    {order.id}
                  </Badge>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                  <span className="size-1.5 rounded-full bg-emerald-500 shrink-0" />
                  <span className="truncate">{isBuyer ? "Mitra Toko Siap Membalas" : "Pelanggan Aktif"}</span>
                </div>
              </div>
            </div>

            <Link
              href="/history"
              className="text-[10px] font-bold text-emerald-700 hover:text-emerald-800 dark:text-emerald-400 px-2 py-1 rounded-md hover:bg-emerald-500/10 transition-colors shrink-0"
            >
              Lihat Tiket
            </Link>
          </div>
        </header>

        {/* Pinned Order Context Header Banner */}
        <div className="bg-muted/40 border-b border-border/60 p-2.5 px-3 flex items-center justify-between gap-2 shrink-0">
          <div className="min-w-0">
            <span className="text-[11px] font-extrabold text-foreground block truncate">
              {order.bagTitle} ({order.quantity} Porsi)
            </span>
            <div className="flex items-center gap-2 text-[10px] text-muted-foreground mt-0.5">
              <span className="flex items-center gap-1">
                <Clock className="size-3 text-amber-600 shrink-0" />
                <span>Status: {order.status}</span>
              </span>
              <span>-</span>
              <span className="font-semibold text-emerald-700 dark:text-emerald-400 tabular-nums">
                Rp {order.totalPrice.toLocaleString("id-ID")}
              </span>
            </div>
          </div>

          <div className="text-right shrink-0">
            <span className="text-[9px] text-muted-foreground block uppercase font-bold">PIN Kasir:</span>
            <span className="font-mono text-sm font-black text-amber-800 dark:text-amber-400 tracking-wider tabular-nums bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 rounded-md inline-block">
              {order.pickupCode}
            </span>
          </div>
        </div>

        {/* Message Feed Area */}
        <main className="flex-1 overflow-y-auto p-3 space-y-3">
          {/* Security & Official Packaging Notice */}
          <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center space-y-1">
            <p className="text-[10px] font-bold text-emerald-800 dark:text-emerald-300 flex items-center justify-center gap-1">
              <ShieldCheck className="size-3 text-emerald-600" />
              <span>Saluran Resmi Penjemputan Makanan SisaRasa</span>
            </p>
            <p className="text-[9px] text-muted-foreground leading-tight">
              Gunakan chat ini untuk konfirmasi kedatangan & patokan toko. Dana aman di rekening bersama (Escrow).
            </p>
          </div>

          {messages.length === 0 ? (
            <div className="py-12 text-center space-y-2">
              <p className="text-xs font-bold text-foreground">Belum ada percakapan</p>
              <p className="text-[11px] text-muted-foreground max-w-xs mx-auto">
                Kirim pesan ke kasir toko untuk konfirmasi penjemputan makanan surplus Anda
              </p>
            </div>
          ) : (
            messages.map((msg) => {
              if (msg.senderRole === "system") {
                return (
                  <div key={msg.id} className="flex justify-center my-2">
                    <div className="bg-muted/80 border border-border/80 text-foreground text-[10px] px-3.5 py-1.5 rounded-xl text-center max-w-[90%] flex items-center gap-1.5 shadow-2xs">
                      <ShieldCheck className="size-3.5 text-emerald-600 shrink-0" />
                      <span className="leading-snug">{msg.text}</span>
                    </div>
                  </div>
                );
              }

              const isMe = msg.senderRole === currentUser.role;
              const avatarSrc = resolveUserAvatar(
                isMe ? currentUser.avatarUrl : msg.senderAvatarUrl,
                msg.senderName
              );

              return (
                <div
                  key={msg.id}
                  className={`flex items-end gap-2 ${
                    isMe ? "justify-end" : "justify-start"
                  }`}
                >
                  {!isMe && (
                    <Avatar className="size-7 rounded-full border border-border/80 shrink-0 mb-0.5">
                      <AvatarImage src={avatarSrc} alt={msg.senderName} />
                      <AvatarFallback className="text-[9px] font-bold bg-muted text-foreground">
                        {msg.senderName.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  )}

                  <div
                    className={`flex flex-col ${
                      isMe ? "items-end" : "items-start"
                    } max-w-[78%]`}
                  >
                    <div className="flex items-center gap-1 mb-1 px-1">
                      <span className="text-[10px] font-bold text-muted-foreground truncate max-w-[120px]">
                        {msg.senderName}
                      </span>
                      <span className="text-[9px] text-muted-foreground/75">
                        ({msg.senderRole === "seller" ? "Mitra Toko" : "Pelanggan"})
                      </span>
                    </div>

                    <div
                      className={`rounded-2xl px-3.5 py-2 text-xs leading-relaxed shadow-2xs ${
                        isMe
                          ? "bg-emerald-700 text-white rounded-br-xs"
                          : "bg-muted border border-border/70 text-foreground rounded-bl-xs"
                      }`}
                    >
                      <p className="break-words">{msg.text}</p>
                      <span
                        className={`block text-[9px] mt-1 text-right tabular-nums ${
                          isMe ? "text-emerald-200" : "text-muted-foreground"
                        }`}
                      >
                        {formatTime(msg.timestamp)}
                      </span>
                    </div>
                  </div>

                  {isMe && (
                    <Avatar className="size-7 rounded-full border border-emerald-600/40 shrink-0 mb-0.5">
                      <AvatarImage src={avatarSrc} alt={currentUser.name} />
                      <AvatarFallback className="text-[9px] font-bold bg-emerald-700 text-white">
                        {currentUser.name.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </main>

        {/* Quick Suggestion Chips */}
        {!order.isChatLocked && (
          <div className="px-3 py-1.5 bg-background border-t border-border/40 overflow-x-auto scrollbar-none flex items-center gap-1.5 shrink-0">
            {[
              "Halo kak, saya sedang otw ke toko",
              "Tolong siapkan paketnya ya kak",
              "Apakah patokan toko sesuai maps?",
              "Saya sudah sampai di depan kasir",
            ].map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleQuickSend(preset)}
                className="text-[10px] font-semibold bg-muted/60 hover:bg-muted text-foreground border border-border/60 rounded-full px-2.5 py-1 whitespace-nowrap shrink-0 transition-colors"
              >
                {preset}
              </button>
            ))}
          </div>
        )}

        {/* Sticky Input Bar or Locked Notice */}
        <footer className="p-3 bg-background border-t border-border/80 shrink-0">
          {order.isChatLocked ? (
            <div className="flex items-center justify-center gap-1.5 p-2 bg-muted/50 rounded-xl text-xs text-muted-foreground font-semibold">
              <Lock className="size-3.5 text-muted-foreground" />
              <span>Sesi chat telah ditutup karena pesanan telah selesai.</span>
            </div>
          ) : (
            <form onSubmit={handleSend} className="flex items-center gap-2">
              <Input
                type="text"
                placeholder={`Tulis pesan ke ${chatPartnerName}...`}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="text-xs h-9 rounded-full bg-muted/40 border-border/80 focus-visible:ring-1 focus-visible:ring-emerald-700"
              />
              <Button
                type="submit"
                disabled={!inputText.trim()}
                className="size-9 rounded-full bg-emerald-700 hover:bg-emerald-800 text-white p-0 shrink-0 flex items-center justify-center disabled:opacity-40 shadow-2xs"
                aria-label="Kirim Pesanan"
              >
                <Send className="size-4" />
              </Button>
            </form>
          )}
        </footer>
      </div>
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-stone-100 dark:bg-stone-950 flex items-center justify-center p-4">
          <p className="text-xs text-muted-foreground font-semibold">Memuat percakapan...</p>
        </div>
      }
    >
      <ChatContent />
    </Suspense>
  );
}
