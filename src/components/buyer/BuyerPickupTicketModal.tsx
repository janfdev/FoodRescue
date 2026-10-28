"use client";

import { Order, Store } from "@/types/domain";
import { QRCodeSVG } from "qrcode.react";
import { X, Clock, MapPin, ShieldCheck, AlertCircle } from "lucide-react";

interface BuyerPickupTicketModalProps {
  order: Order;
  store?: Store;
  onClose: () => void;
  onOpenChat: () => void;
}

export function BuyerPickupTicketModal({
  order,
  store,
  onClose,
  onOpenChat
}: BuyerPickupTicketModalProps) {
  return (
    <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-card border border-border w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-emerald-600 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="size-5" />
            <span className="font-extrabold text-sm tracking-tight">
              Tiket Pengambilan Makanan
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="size-7 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 flex flex-col items-center text-center space-y-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              ID Pesanan
            </span>
            <p className="font-extrabold text-lg text-foreground tracking-tight">
              {order.id}
            </p>
          </div>

          {/* QR Code Canvas */}
          <div className="bg-white p-4 rounded-2xl border-2 border-dashed border-emerald-500/40 shadow-xs flex items-center justify-center">
            <QRCodeSVG
              value={order.pickupQrData}
              size={180}
              level="H"
              includeMargin={false}
            />
          </div>

          {/* Status Badge */}
          <div className="w-full bg-emerald-500/10 border border-emerald-500/25 rounded-2xl p-3">
            <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
              Status Pembayaran
            </p>
            <p className="text-sm font-black text-emerald-700 dark:text-emerald-400 mt-1">
              Terbayar • Langsung Ambil di Toko
            </p>
          </div>

          {/* Toko & Alamat */}
          <div className="w-full text-left bg-card border border-border rounded-xl p-3 space-y-2 text-xs">
            <div className="flex items-start gap-2">
              <MapPin className="size-4 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-foreground">{order.storeName}</p>
                <p className="text-muted-foreground text-[11px] mt-0.5">
                  {store?.address || "Wilayah Cirebon Raya"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1 border-t border-border/60 text-muted-foreground text-[11px]">
              <Clock className="size-3.5 text-amber-500 shrink-0" />
              <span>
                Jam Ambil:{" "}
                <strong className="text-foreground">
                  {store?.pickupStartTime || "19:30"} - {store?.pickupEndTime || "21:30"} WIB
                </strong>
              </span>
            </div>
          </div>

          {/* Notice */}
          <div className="flex items-start gap-2 text-left bg-muted/60 border border-border p-2.5 rounded-xl text-[11px] text-muted-foreground">
            <AlertCircle className="size-4 text-emerald-600 shrink-0 mt-0.5" />
            <p>
              Tunjukkan nomor pesanan ini atau QR Code ke kasir toko saat mengambil paket makanan Anda.
            </p>
          </div>

          <div className="w-full flex gap-2 pt-1">
            <button
              type="button"
              onClick={onOpenChat}
              className="flex-1 bg-muted hover:bg-muted/80 text-foreground py-2.5 rounded-xl font-bold text-xs transition-colors"
            >
              Hubungi Toko (Chat)
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-xl font-bold text-xs transition-colors"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
