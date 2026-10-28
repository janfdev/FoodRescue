"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { Order, ChatMessage } from "@/types/domain";
import { storeService } from "@/services/storeService";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { resolveUserAvatar } from "@/lib/avatar";
import { X, Send, Lock, Clock, ShieldCheck } from "lucide-react";

interface ChatModalProps {
  order: Order;
  onClose: () => void;
}

export function ChatModal({ order, onClose }: ChatModalProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [isLocked, setIsLocked] = useState(order.isChatLocked);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const currentUser = storeService.getState().currentUser;
  const partnerName = currentUser.role === "buyer" ? order.storeName : order.buyerName;
  const partnerAvatarUrl = useMemo(() => {
    return resolveUserAvatar(undefined, partnerName);
  }, [partnerName]);

  const loadMessages = () => {
    const list = storeService.getChatMessages(order.id);
    setMessages(list);
  };

  useEffect(() => {
    loadMessages();
    const unsub = storeService.subscribe(loadMessages);
    return unsub;
  }, [order.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isLocked) return;

    try {
      storeService.sendChatMessage(order.id, inputText.trim());
      setInputText("");
    } catch (err: unknown) {
      if (err instanceof Error) {
        setIsLocked(true);
      }
    }
  };

  const formatTime = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
    } catch {
      return "";
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-card border border-border w-full max-w-lg rounded-2xl shadow-2xl flex flex-col h-[85vh] max-h-[640px] overflow-hidden">
        {/* Header */}
        <div className="bg-muted/50 border-b border-border p-3.5 px-4 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <Avatar className="size-9 rounded-full border border-border shrink-0">
              <AvatarImage src={partnerAvatarUrl} alt={partnerName} />
              <AvatarFallback className="bg-emerald-700 text-white font-bold text-xs">
                {partnerName.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-foreground truncate">
                  {partnerName}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary/10 text-primary">
                  {order.id}
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground truncate font-medium mt-0.5">
                {order.bagTitle}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="size-8 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-colors shrink-0"
          >
            <X className="size-4.5" />
          </button>
        </div>

        {/* Escrow & Coordination Notice */}
        <div className="bg-blue-50/70 dark:bg-blue-950/40 border-b border-blue-100 dark:border-blue-900/50 px-4 py-2 flex items-center gap-2 text-[11px] text-blue-700 dark:text-blue-300 font-medium shrink-0">
          <ShieldCheck className="size-4 shrink-0 text-blue-600 dark:text-blue-400" />
          <span>Gunakan ruang pesan ini untuk koordinasi kedatangan pickup makanan.</span>
        </div>

        {/* Messages Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((msg) => {
            if (msg.senderRole === "system") {
              return (
                <div key={msg.id} className="flex justify-center my-2">
                  <div className="bg-muted border border-border/80 text-foreground text-[11px] px-3.5 py-1.5 rounded-xl text-center max-w-[85%] font-medium flex items-center gap-1.5 shadow-2xs">
                    <ShieldCheck className="size-3.5 text-emerald-600 shrink-0" />
                    <span>{msg.text}</span>
                  </div>
                </div>
              );
            }

            const isMe =
              (currentUser.role === "buyer" && msg.senderRole === "buyer") ||
              (currentUser.role === "seller" && msg.senderRole === "seller");

            const avatarSrc = resolveUserAvatar(
              isMe ? currentUser.avatarUrl : msg.senderAvatarUrl,
              msg.senderName
            );

            return (
              <div
                key={msg.id}
                className={`flex items-end gap-2 ${isMe ? "justify-end" : "justify-start"}`}
              >
                {!isMe && (
                  <Avatar className="size-7 rounded-full border border-border/70 shrink-0 mb-1">
                    <AvatarImage src={avatarSrc} alt={msg.senderName} />
                    <AvatarFallback className="text-[9px] font-bold bg-muted text-foreground">
                      {msg.senderName.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                )}

                <div className={`flex flex-col ${isMe ? "items-end" : "items-start"} max-w-[78%]`}>
                  <div className="flex items-center gap-1 mb-1 px-1">
                    <span className="text-[10px] font-bold text-muted-foreground truncate max-w-[120px]">
                      {msg.senderName}
                    </span>
                    <span className="text-[9px] text-muted-foreground/75">
                      ({msg.senderRole === "seller" ? "Mitra Toko" : "Pelanggan"})
                    </span>
                  </div>

                  <div
                    className={`rounded-2xl p-3 text-xs shadow-2xs leading-relaxed ${
                      isMe
                        ? "bg-emerald-600 text-white rounded-br-xs"
                        : "bg-muted text-foreground rounded-bl-xs border border-border"
                    }`}
                  >
                    <p className="whitespace-pre-wrap break-words">{msg.text}</p>
                    <span
                      className={`block text-[9px] mt-1 text-right tabular-nums ${
                        isMe ? "text-emerald-100" : "text-muted-foreground"
                      }`}
                    >
                      {formatTime(msg.timestamp)}
                    </span>
                  </div>
                </div>

                {isMe && (
                  <Avatar className="size-7 rounded-full border border-emerald-600/40 shrink-0 mb-1">
                    <AvatarImage src={avatarSrc} alt={currentUser.name} />
                    <AvatarFallback className="text-[9px] font-bold bg-emerald-700 text-white">
                      {currentUser.name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Auto-Lock Banner if locked */}
        {isLocked ? (
          <div className="bg-amber-50 dark:bg-amber-950/50 border-t border-amber-200 dark:border-amber-900/60 p-3 px-4 flex items-center gap-2 text-xs text-amber-800 dark:text-amber-300 shrink-0">
            <Lock className="size-4 text-amber-600 shrink-0" />
            <span className="font-medium text-[11px]">
              Chat telah terkunci otomatis (24 jam setelah pesanan selesai).
            </span>
          </div>
        ) : (
          /* Input Box */
          <form
            onSubmit={handleSend}
            className="p-3 bg-muted/30 border-t border-border flex items-center gap-2 shrink-0"
          >
            <input
              type="text"
              placeholder="Ketik pesan koordinasi..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="flex-1 bg-background border border-border rounded-xl px-3.5 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
            <button
              type="submit"
              disabled={!inputText.trim()}
              className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shrink-0"
            >
              <span>Kirim</span>
              <Send className="size-3.5" />
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
