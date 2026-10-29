"use client";

import { useState, useEffect, useMemo } from "react";
import {
  ShieldCheck,
  ShieldAlert,
  Package,
  MessageSquare,
  Store,
  Star,
  Search,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Send,
  Check,
} from "lucide-react";
import { Review, Store as StoreType, DisputeTicket } from "@/types/domain";
import { storeService } from "@/services/storeService";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function AdminAuditPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stores, setStores] = useState<StoreType[]>([]);
  const [disputes, setDisputes] = useState<DisputeTicket[]>([]);
  const [activeTab, setActiveTab] = useState<"all" | "violations" | "low_rating" | "disputes">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);
  const [reviewedIds, setReviewedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const s = storeService.getState();
    setReviews(s.reviews);
    setStores(s.stores);
    setDisputes(s.disputes || []);

    const unsub = storeService.subscribe(() => {
      const updated = storeService.getState();
      setReviews(updated.reviews);
      setStores(updated.stores);
      setDisputes(updated.disputes || []);
    });
    return unsub;
  }, []);

  const storeMap = useMemo(() => {
    const map = new Map<string, string>();
    stores.forEach((st) => map.set(st.id, st.name));
    return map;
  }, [stores]);

  // Derived metrics (strictly calculated, no fake statistics - Anti-Slop R-17/C-5)
  const totalReviews = reviews.length;
  const compliantCount = reviews.filter((r) => r.usedOfficialRescueBox).length;
  const violationCount = reviews.filter((r) => !r.usedOfficialRescueBox).length;
  const complianceRate = totalReviews > 0 ? Math.round((compliantCount / totalReviews) * 100) : 100;
  const avgRating =
    totalReviews > 0
      ? (reviews.reduce((acc, r) => acc + r.rating, 0) / totalReviews).toFixed(1)
      : "0.0";

  // Filtered reviews
  const filteredReviews = useMemo(() => {
    return reviews.filter((rev) => {
      const storeName = storeMap.get(rev.storeId) || "";
      const matchesSearch =
        rev.buyerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rev.comment.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rev.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        storeName.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      if (activeTab === "violations") return !rev.usedOfficialRescueBox;
      if (activeTab === "low_rating") return rev.rating <= 3;
      return true;
    });
  }, [reviews, searchQuery, activeTab, storeMap]);

  const handleMarkReviewed = (id: string) => {
    setReviewedIds((prev) => new Set(prev).add(id));
    setActionFeedback("Ulasan berhasil ditandai telah diperiksa.");
    setTimeout(() => setActionFeedback(null), 3000);
  };

  const handleIssueWarning = (storeName: string, orderId: string) => {
    setActionFeedback(`Peringatan kepatuhan wadah berhasil diterbitkan untuk mitra ${storeName} (Pesanan ${orderId}).`);
    setTimeout(() => setActionFeedback(null), 4000);
  };

  return (
    <div className="space-y-6 w-full">
      {/* Feedback Banner */}
      {actionFeedback && (
        <div className="p-3.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-xs font-medium flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="size-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
            <span>{actionFeedback}</span>
          </div>
          <button
            onClick={() => setActionFeedback(null)}
            className="text-xs hover:underline cursor-pointer"
          >
            Tutup
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-[10px] uppercase font-bold tracking-wider border-purple-500/30 text-purple-700 dark:text-purple-300">
              Audit Ulasan Pembeli
            </Badge>
          </div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-foreground mt-1">
            Audit Kepatuhan Wadah & Sengketa (Ulasan Pembeli)
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Pengawasan standar penggunaan kemasan resmi Rescue Box dan resolusi sengketa langsung dari laporan ulasan nyata pembeli.
          </p>
        </div>
      </div>

      {/* Metric Scoreboard (Anti-Slop C-5, Tabular Nums) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card className="border-border shadow-2xs">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="size-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-600 dark:text-purple-400 shrink-0">
              <MessageSquare className="size-5" />
            </div>
            <div>
              <span className="text-[11px] font-medium text-muted-foreground block">
                Total Ulasan Masuk
              </span>
              <span className="text-xl font-black tracking-tight tabular-nums text-foreground">
                {totalReviews}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border shadow-2xs">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="size-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
              <ShieldCheck className="size-5" />
            </div>
            <div>
              <span className="text-[11px] font-medium text-muted-foreground block">
                Kepatuhan Box Resmi
              </span>
              <span className="text-xl font-black tracking-tight tabular-nums text-emerald-700 dark:text-emerald-400">
                {complianceRate}%
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border shadow-2xs">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="size-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-600 dark:text-rose-400 shrink-0">
              <ShieldAlert className="size-5" />
            </div>
            <div>
              <span className="text-[11px] font-medium text-muted-foreground block">
                Pelanggaran Wadah
              </span>
              <span className={`text-xl font-black tracking-tight tabular-nums ${violationCount > 0 ? "text-rose-600 dark:text-rose-400" : "text-foreground"}`}>
                {violationCount}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border shadow-2xs">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="size-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
              <Star className="size-5" />
            </div>
            <div>
              <span className="text-[11px] font-medium text-muted-foreground block">
                Rata-rata Rating
              </span>
              <span className="text-xl font-black tracking-tight tabular-nums text-foreground">
                {avgRating} <span className="text-xs font-normal text-muted-foreground">/ 5.0</span>
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Separator />

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Cari ulasan pembeli, nama toko mitra, atau nomor pesanan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-card text-xs sm:text-sm"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <Button
            variant={activeTab === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveTab("all")}
            className="text-xs h-9 cursor-pointer shrink-0"
          >
            Semua ({totalReviews})
          </Button>
          <Button
            variant={activeTab === "violations" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveTab("violations")}
            className={`text-xs h-9 cursor-pointer shrink-0 ${
              violationCount > 0 && activeTab !== "violations" ? "text-rose-600 border-rose-300 dark:border-rose-800" : ""
            }`}
          >
            Pelanggaran Wadah ({violationCount})
          </Button>
          <Button
            variant={activeTab === "low_rating" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveTab("low_rating")}
            className="text-xs h-9 cursor-pointer shrink-0"
          >
            Rating Rendah (≤3)
          </Button>
          <Button
            variant={activeTab === "disputes" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveTab("disputes")}
            className="text-xs h-9 cursor-pointer shrink-0"
          >
            Sengketa ({disputes.length})
          </Button>
        </div>
      </div>

      {/* Main Content Area */}
      {activeTab === "disputes" ? (
        <Card className="border border-border shadow-xs">
          <CardHeader className="p-4 sm:p-5 border-b border-border">
            <CardTitle className="text-sm font-bold">Tiket Sengketa Transaksi</CardTitle>
            <CardDescription className="text-xs">
              Komplain pembeli yang membutuhkan mediasi dan keputusan pelepasan dana escrow admin.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            {disputes.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                <CheckCircle2 className="size-8 mx-auto text-emerald-600 dark:text-emerald-400 mb-2" />
                <p className="text-sm font-medium text-foreground">Tidak Ada Sengketa Aktif</p>
                <p className="text-xs mt-1">Semua pesanan berjalan tertib dan tidak ada komplain yang tertunda.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {disputes.map((disp) => (
                  <div key={disp.id} className="p-4 rounded-xl border border-border bg-card space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-foreground font-mono">{disp.orderId}</span>
                      <Badge variant="outline" className="text-[10px] font-bold">
                        {disp.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{disp.reason}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredReviews.length === 0 ? (
            <Card className="border border-border shadow-xs">
              <CardContent className="p-12 text-center text-muted-foreground">
                <Package className="size-8 mx-auto text-muted-foreground/50 mb-2" />
                <p className="text-sm font-medium text-foreground">Tidak Ada Ulasan yang Cocok</p>
                <p className="text-xs mt-1">
                  {activeTab === "violations"
                    ? "Seluruh mitra toko terkonfirmasi patuh menggunakan wadah resmi Rescue Box."
                    : "Coba sesuaikan kata kunci pencarian atau filter tab."}
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredReviews.map((rev) => {
              const storeName = storeMap.get(rev.storeId) || "Toko Mitra Rerasa";
              const isReviewed = reviewedIds.has(rev.id);
              const dateObj = new Date(rev.createdAt);
              const formattedDate = !isNaN(dateObj.getTime())
                ? dateObj.toLocaleDateString("id-ID", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : rev.createdAt;

              return (
                <Card
                  key={rev.id}
                  className={`border transition-all ${
                    !rev.usedOfficialRescueBox
                      ? "border-rose-500/30 bg-rose-500/5 dark:bg-rose-950/10"
                      : "border-border bg-card"
                  } shadow-2xs`}
                >
                  <CardContent className="p-4 sm:p-5 space-y-3">
                    {/* Top row: Buyer, Store, Order & Compliance Badge */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="size-8 rounded-full bg-muted border border-border flex items-center justify-center font-bold text-xs text-foreground shrink-0">
                          {rev.buyerName.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-xs sm:text-sm text-foreground truncate">
                              {rev.buyerName}
                            </span>
                            <span className="text-[11px] text-muted-foreground">•</span>
                            <span className="text-xs text-muted-foreground flex items-center gap-1 font-medium truncate">
                              <Store className="size-3 shrink-0 text-amber-600 dark:text-amber-400" />
                              {storeName}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-[11px] text-muted-foreground mt-0.5 tabular-nums">
                            <span>Pesanan:</span>
                            <span className="font-mono font-semibold text-foreground bg-muted/60 px-1 rounded border border-border">
                              {rev.orderId}
                            </span>
                            <span>•</span>
                            <span>{formattedDate} WIB</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {rev.usedOfficialRescueBox ? (
                          <Badge
                            variant="outline"
                            className="bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border-emerald-500/30 text-[11px] font-bold py-1 px-2.5 flex items-center gap-1.5"
                          >
                            <ShieldCheck className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                            ✓ Wadah Box Resmi
                          </Badge>
                        ) : (
                          <Badge
                            className="bg-rose-600 text-white border-transparent text-[11px] font-bold py-1 px-2.5 flex items-center gap-1.5"
                          >
                            <ShieldAlert className="size-3.5 text-white" />
                            ✗ Pelanggaran Wadah
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Middle: Rating Stars & Buyer Review Quote */}
                    <div className="p-3 rounded-lg bg-background/80 border border-border/80 space-y-1.5">
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`size-3.5 ${
                              star <= rev.rating
                                ? "fill-amber-400 text-amber-500"
                                : "text-muted-foreground/30"
                            }`}
                          />
                        ))}
                        <span className="text-xs font-bold text-foreground ml-1.5 tabular-nums">
                          {rev.rating}.0
                        </span>
                      </div>
                      <blockquote className="text-xs text-foreground/90 italic leading-relaxed">
                        &quot;{rev.comment}&quot;
                      </blockquote>
                    </div>

                    {/* Bottom row: Operational Action Buttons */}
                    <div className="flex items-center justify-between pt-1 flex-wrap gap-2">
                      <div className="text-[11px] text-muted-foreground">
                        {isReviewed ? (
                          <span className="text-emerald-700 dark:text-emerald-400 flex items-center gap-1 font-semibold">
                            <Check className="size-3.5" /> Telah ditinjau oleh Admin
                          </span>
                        ) : (
                          <span>Status: Menunggu evaluasi audit</span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {!rev.usedOfficialRescueBox && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleIssueWarning(storeName, rev.orderId)}
                            className="text-xs h-7 gap-1.5 border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950/30 cursor-pointer"
                          >
                            <AlertTriangle className="size-3" />
                            Peringatkan Mitra
                          </Button>
                        )}
                        <Button
                          variant={isReviewed ? "secondary" : "outline"}
                          size="sm"
                          onClick={() => handleMarkReviewed(rev.id)}
                          disabled={isReviewed}
                          className="text-xs h-7 gap-1.5 cursor-pointer"
                        >
                          <Check className="size-3" />
                          {isReviewed ? "Selesai" : "Tandai Diperiksa"}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
