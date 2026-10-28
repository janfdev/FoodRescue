"use client";

import { useState } from "react";
import { Order } from "@/types/domain";
import { storeService } from "@/services/storeService";
import { X, Star, Box, CheckCircle2 } from "lucide-react";

interface BuyerReviewModalProps {
  order: Order;
  onClose: () => void;
  onSuccess: () => void;
}

export function BuyerReviewModal({ order, onClose, onSuccess }: BuyerReviewModalProps) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [usedOfficialBox, setUsedOfficialBox] = useState(true);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    storeService.submitReview(order.id, rating, comment, usedOfficialBox);
    setSubmitted(true);
    setTimeout(() => {
      onSuccess();
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-card border border-border w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 px-5 border-b border-border flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-sm text-foreground tracking-tight">
              Ulasan & Kepatuhan Kemasan
            </h3>
            <p className="text-[11px] text-muted-foreground">{order.storeName}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="size-7 rounded-full hover:bg-muted flex items-center justify-center text-muted-foreground transition-colors"
          >
            <X className="size-4" />
          </button>
        </div>

        {submitted ? (
          <div className="p-8 text-center space-y-3">
            <div className="size-14 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="size-8" />
            </div>
            <p className="font-bold text-sm text-foreground">Terima Kasih!</p>
            <p className="text-xs text-muted-foreground">
              Ulasan Anda membantu menjaga standar mutu dan kebersihan kemasan resmi Rescue Box di Cirebon.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            {/* Rating Bintang */}
            <div className="space-y-1.5 text-center">
              <label className="text-xs font-bold text-muted-foreground">
                Kualitas Makanan Penyelamat
              </label>
              <div className="flex items-center justify-center gap-1.5 pt-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="p-1 text-amber-400 hover:scale-110 transition-transform"
                  >
                    <Star
                      className={`size-6 ${
                        star <= rating ? "fill-amber-400 text-amber-400" : "text-muted"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Checklist Wajib Kepatuhan Box */}
            <div className="bg-muted/50 border border-border rounded-2xl p-3.5 space-y-2">
              <div className="flex items-start gap-2.5">
                <div className="size-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
                  <Box className="size-4.5" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-bold text-foreground">
                    Verifikasi Standar Rescue Box
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
                    Apakah penjual menyerahkan makanan menggunakan kotak/kemasan resmi Rescue Food berlogo?
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1.5">
                <button
                  type="button"
                  onClick={() => setUsedOfficialBox(true)}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                    usedOfficialBox
                      ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                      : "bg-card text-muted-foreground border-border hover:bg-muted"
                  }`}
                >
                  ✓ Ya, Pakai Box Resmi
                </button>

                <button
                  type="button"
                  onClick={() => setUsedOfficialBox(false)}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                    !usedOfficialBox
                      ? "bg-red-600 text-white border-red-600 shadow-xs"
                      : "bg-card text-muted-foreground border-border hover:bg-muted"
                  }`}
                >
                  ✗ Tidak Pakai
                </button>
              </div>
            </div>

            {/* Text Comment */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-muted-foreground">
                Ceritakan Pengalaman Anda (Opsional)
              </label>
              <textarea
                rows={3}
                placeholder="Misal: Rotinya masih sangat empuk dan dapat 4 varian..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full bg-background border border-border rounded-xl p-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-xl text-xs font-bold shadow-xs transition-colors"
            >
              Kirim Ulasan & Verifikasi
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
