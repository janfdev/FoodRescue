"use client";

import { useState, useEffect } from "react";
import { Order, SurpriseBag } from "@/types/domain";
import { storeService } from "@/services/storeService";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import {
  MessageSquare,
  PackageOpen,
  AlertCircle,
  TrendingUp,
  CheckCircle2,
  Scale,
  Sparkles,
  ShoppingBag,
} from "lucide-react";
import { ChatModal } from "@/components/shared/ChatModal";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  AreaChart,
  Area,
} from "recharts";

export default function SellerOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [bags, setBags] = useState<SurpriseBag[]>([]);
  const [activeChatOrder, setActiveChatOrder] = useState<Order | null>(null);

  const syncData = () => {
    const state = storeService.getState();
    const activeStoreId = state.currentUser?.storeId || "store-ruby-bakery";
    const storeOrders = state.orders.filter((o) => o.storeId === activeStoreId);
    const storeBags = state.surpriseBags.filter((b) => b.storeId === activeStoreId);

    setOrders(storeOrders);
    setBags(storeBags);
  };

  useEffect(() => {
    syncData();
    const unsub = storeService.subscribe(syncData);
    return unsub;
  }, []);

  // Helper ekstraksi jam Jakarta (WIB / UTC+7) secara deterministik
  const getWibHour = (dateInput?: string): number | null => {
    if (!dateInput) return null;
    try {
      const d = new Date(dateInput);
      if (isNaN(d.getTime())) return null;

      // Ambil format jam berdasarkan timezone 'Asia/Jakarta'
      const wibHourStr = new Intl.DateTimeFormat("en-US", {
        timeZone: "Asia/Jakarta",
        hour: "numeric",
        hour12: false,
      }).format(d);

      const parsed = parseInt(wibHourStr, 10);
      return isNaN(parsed) ? null : (parsed === 24 ? 0 : parsed);
    } catch {
      return null;
    }
  };

  // Kalkulasi data chart murni dari riwayat pesanan riil toko (Zona Waktu Asia/Jakarta)
  const weeklyEarningsData = (() => {
    const days = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
    const now = new Date();
    const result = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dayName = days[d.getDay()];

      // Format YYYY-MM-DD berbasis Asia/Jakarta
      const wibDateParts = new Intl.DateTimeFormat("en-CA", {
        timeZone: "Asia/Jakarta",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }).format(d);

      const dayOrders = orders.filter((o) => {
        const orderDate = o.completedAt || o.paidAt || o.createdAt;
        if (!orderDate) return false;

        const orderWibDate = new Intl.DateTimeFormat("en-CA", {
          timeZone: "Asia/Jakarta",
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        }).format(new Date(orderDate));

        return orderWibDate === wibDateParts && (o.status === "COMPLETED" || o.status === "PAID");
      });

      // Net pendapatan seller = 90% dari subtotal
      const dayNet = dayOrders.reduce(
        (sum, o) => sum + (o.sellerEarning || (o.totalPrice - (o.platformFee || Math.round(o.totalPrice * 0.10)))),
        0
      );

      result.push({ day: dayName, net: dayNet });
    }
    return result;
  })();

  // Kalkulasi distribusi jam sibuk penjemputan berbasis Waktu Indonesia Barat (WIB / Asia/Jakarta)
  const pickupTimeData = (() => {
    const timeSlots = ["16:00", "17:00", "18:00", "19:00", "20:00", "21:00", "22:00"];

    return timeSlots.map((slot) => {
      const slotHour = parseInt(slot.split(":")[0], 10);
      const porsiCount = orders
        .filter((o) => {
          if (o.status !== "COMPLETED" && o.status !== "READY_FOR_PICKUP" && o.status !== "PAID") {
            return false;
          }

          // 1. Ekstraksi jam riil WIB dari timestamp transaksi (prioritas jam pesanan selesai/terbayar)
          const dateStr = o.completedAt || o.paidAt || o.createdAt;
          const wibH = getWibHour(dateStr);
          if (wibH !== null && wibH === slotHour) {
            return true;
          }

          // 2. Fallback: Ekstraksi jam awal dari pickupWindow (misal: "19:30 - 21:00 WIB" -> 19)
          if (o.pickupWindow) {
            const startHourMatch = o.pickupWindow.match(/^(\d{1,2}):/);
            if (startHourMatch) {
              const startH = parseInt(startHourMatch[1], 10);
              if (startH === slotHour) return true;
            }
          }

          return false;
        })
        .reduce((sum, o) => sum + (o.quantity || 1), 0);

      return { jam: slot, porsi: porsiCount };
    });
  })();

  // 1. Makanan berlebih setiap hari (Surplus Harian Toko)
  const dailySurplusPortions = bags.reduce((sum, b) => sum + (b.quotaToday || 0), 0);
  const dailySurplusKg = bags.reduce(
    (sum, b) => sum + (b.quotaToday || 0) * (b.estimatedWeightKg || 0.8),
    0
  );

  // 2. Pesanan selesai & makanan berhasil diselamatkan
  const completedOrders = orders.filter((o) => o.status === "COMPLETED");
  const rescuedPortions = completedOrders.reduce((sum, o) => sum + (o.quantity || 1), 0);
  const rescuedKg = completedOrders.reduce((sum, o) => {
    const bag = bags.find((b) => b.id === o.bagId);
    const weight = bag?.estimatedWeightKg || 0.8;
    return sum + (o.quantity || 1) * weight;
  }, 0);

  // 3. Pendapatan yang berhasil dipulihkan (Recovered Revenue)
  const recoveredRevenue = completedOrders.reduce(
    (sum, o) => sum + (o.sellerEarning || Math.round(o.totalPrice * 0.9)),
    0
  );
  const retailSaved = completedOrders.reduce((sum, o) => sum + (o.totalPrice || 0), 0);

  // 4. Analisis menu yang paling sering tersisa & efisiensi penyelamatan
  const menuEfficiency = bags.map((b) => {
    const soldCount = completedOrders
      .filter((o) => o.bagId === b.id)
      .reduce((sum, o) => sum + (o.quantity || 1), 0);
    const remaining = b.quotaRemaining;
    const rescueRate = b.quotaToday > 0 ? Math.round((soldCount / b.quotaToday) * 100) : 0;
    return {
      id: b.id,
      title: b.title,
      quotaToday: b.quotaToday,
      quotaRemaining: remaining,
      soldCount,
      rescueRate,
      estimatedWeightKg: b.estimatedWeightKg || 0.8,
    };
  }).sort((a, b) => b.quotaRemaining - a.quotaRemaining);

  const mostSurplusMenu = menuEfficiency.length > 0 ? menuEfficiency[0] : null;
  const overallRescueRate = dailySurplusPortions > 0 ? Math.round((rescuedPortions / dailySurplusPortions) * 100) : 0;

  return (
    <div className="space-y-6 w-full">
      <div>
        <h2 className="text-xl font-black text-foreground tracking-tight">
          Riwayat Transaksi & Analitik Toko
        </h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          Pantau tren omzet harian, efisiensi surplus pangan, dan riwayat pesanan yang telah divalidasi
        </p>
      </div>

      {/* 4 Kartu KPI Utama: Efisiensi Surplus & Pemulihan Nilai */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Metrik 1: Makanan Berlebih Setiap Hari */}
        <Card className="p-4 border-border shadow-2xs space-y-2 bg-card relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-muted-foreground flex items-center gap-1.5">
              <PackageOpen className="size-3.5 text-orange-600" />
              <span>Surplus Harian</span>
            </span>
            <Badge variant="outline" className="text-[9px] font-mono border-orange-500/30 text-orange-700 dark:text-orange-400">
              Kuota / Hari
            </Badge>
          </div>
          <div>
            <p className="text-2xl font-black text-foreground tabular-nums tracking-tight">
              {dailySurplusPortions} Porsi
            </p>
            <p className="text-[11px] text-muted-foreground mt-0.5 flex items-center gap-1 font-medium">
              <Scale className="size-3 text-muted-foreground/70" />
              <span>~{dailySurplusKg.toFixed(1)} Kg estimasi bobot fisik</span>
            </p>
          </div>
          <div className="text-[10px] text-orange-600 font-semibold bg-orange-500/10 px-2 py-1 rounded-md">
            Total porsi surplus terdaftar hari ini
          </div>
        </Card>

        {/* Metrik 2: Menu Paling Sering Tersisa */}
        <Card className="p-4 border-border shadow-2xs space-y-2 bg-card relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-muted-foreground flex items-center gap-1.5">
              <AlertCircle className="size-3.5 text-amber-600" />
              <span>Sering Tersisa</span>
            </span>
            <Badge variant="outline" className="text-[9px] font-mono border-amber-500/30 text-amber-700 dark:text-amber-400">
              Sisa Terbanyak
            </Badge>
          </div>
          <div>
            <p className="text-base font-black text-foreground tracking-tight truncate" title={mostSurplusMenu?.title || "Belum ada menu"}>
              {mostSurplusMenu ? mostSurplusMenu.title : "Semua Terjual"}
            </p>
            <p className="text-[11px] text-muted-foreground mt-0.5 font-medium">
              {mostSurplusMenu ? `${mostSurplusMenu.quotaRemaining} porsi sisa dari ${mostSurplusMenu.quotaToday} kuota` : "0 porsi tersisa"}
            </p>
          </div>
          <div className="text-[10px] text-amber-600 font-semibold bg-amber-500/10 px-2 py-1 rounded-md truncate">
            {mostSurplusMenu ? `Prioritas flash sale: sisa ${mostSurplusMenu.quotaRemaining} porsi` : "Stok optimal"}
          </div>
        </Card>

        {/* Metrik 3: Pendapatan Berhasil Dipulihkan */}
        <Card className="p-4 border-border shadow-2xs space-y-2 bg-card relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-muted-foreground flex items-center gap-1.5">
              <TrendingUp className="size-3.5 text-emerald-600" />
              <span>Dana Dipulihkan</span>
            </span>
            <Badge variant="outline" className="text-[9px] font-mono border-emerald-500/30 text-emerald-700 dark:text-emerald-400">
              Hak Bersih (90%)
            </Badge>
          </div>
          <div>
            <p className="text-2xl font-black text-emerald-700 dark:text-emerald-400 tabular-nums tracking-tight">
              Rp {recoveredRevenue.toLocaleString("id-ID")}
            </p>
            <p className="text-[11px] text-muted-foreground mt-0.5 font-medium">
              Dari nilai ritel Rp {retailSaved.toLocaleString("id-ID")}
            </p>
          </div>
          <div className="text-[10px] text-emerald-700 dark:text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-1 rounded-md">
            Dana masuk dompet dari pesanan selesai
          </div>
        </Card>

        {/* Metrik 4: Banyak Makanan Berhasil Diselamatkan */}
        <Card className="p-4 border-border shadow-2xs space-y-2 bg-card relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-muted-foreground flex items-center gap-1.5">
              <CheckCircle2 className="size-3.5 text-blue-600" />
              <span>Makanan Selamat</span>
            </span>
            <Badge variant="outline" className="text-[9px] font-mono border-blue-500/30 text-blue-700 dark:text-blue-400">
              Rate: {overallRescueRate}%
            </Badge>
          </div>
          <div>
            <p className="text-2xl font-black text-foreground tabular-nums tracking-tight">
              {rescuedPortions} Porsi
            </p>
            <p className="text-[11px] text-muted-foreground mt-0.5 flex items-center gap-1 font-medium">
              <Scale className="size-3 text-muted-foreground/70" />
              <span>{rescuedKg.toFixed(1)} Kg sampah organik dicegah</span>
            </p>
          </div>
          <div className="text-[10px] text-blue-700 dark:text-blue-400 font-semibold bg-blue-500/10 px-2 py-1 rounded-md">
            {rescuedPortions} porsi sukses terselamatkan
          </div>
        </Card>
      </div>

      {/* Dua Chart Analitik Toko */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Chart 1: Omzet Harian Toko */}
        <Card className="lg:col-span-7 border-border shadow-xs">
          <CardHeader className="p-4 px-5 pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm font-black">
                  Tren Omzet & Pendapatan Bersih (Net)
                </CardTitle>
                <CardDescription className="text-xs">
                  Pendapatan toko 7 hari terakhir setelah potongan fee platform 10%
                </CardDescription>
              </div>
              <Badge variant="outline" className="text-[10px] font-mono border-orange-500/40 text-orange-700">
                Minggu Ini
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-2">
            <div className="h-56 w-full text-xs">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={weeklyEarningsData}
                  margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorNetSeller" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ea580c" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#ea580c" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <RechartsTooltip
                    formatter={(value: any) => [
                      `Rp ${Number(value).toLocaleString("id-ID")}`,
                      "Net Earning",
                    ]}
                    contentStyle={{
                      backgroundColor: "var(--card)",
                      borderColor: "var(--border)",
                      borderRadius: "0.75rem",
                      fontSize: "12px",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="net"
                    stroke="#ea580c"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorNetSeller)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Chart 2: Distribusi Jam Sibuk Pengambilan */}
        <Card className="lg:col-span-5 border-border shadow-xs">
          <CardHeader className="p-4 px-5 pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm font-black">
                  Jam Sibuk Pengambilan (Pickup)
                </CardTitle>
                <CardDescription className="text-xs">
                  Frekuensi kedatangan pembeli mengambil pesanan
                </CardDescription>
              </div>
              <Badge variant="outline" className="text-[10px] font-mono border-blue-500/40 text-blue-700">
                WIB
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-2">
            <div className="h-56 w-full text-xs">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={pickupTimeData}
                  margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis dataKey="jam" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <RechartsTooltip
                    formatter={(value: any) => [`${value} Porsi`, "Porsi Diambil"]}
                    contentStyle={{
                      backgroundColor: "var(--card)",
                      borderColor: "var(--border)",
                      borderRadius: "0.75rem",
                      fontSize: "12px",
                    }}
                  />
                  <Bar
                    dataKey="porsi"
                    fill="#0284c7"
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Komposisi & Efisiensi Penyelamatan Menu Surplus */}
      <Card className="border-border shadow-xs p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-border/70">
          <div>
            <h3 className="text-sm font-black text-foreground flex items-center gap-2">
              <ShoppingBag className="size-4 text-emerald-600" />
              <span>Komposisi &amp; Efisiensi Penyelamatan Menu Surplus</span>
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Analisis per menu untuk mendeteksi makanan yang paling sering tersisa dan persentase keberhasilan penyelamatan
            </p>
          </div>
          <Badge variant="outline" className="text-[10px] font-mono border-emerald-500/30 text-emerald-700 dark:text-emerald-400 self-start sm:self-auto">
            {menuEfficiency.length} Menu Terdaftar
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
          {menuEfficiency.map((item) => (
            <div
              key={item.id}
              className="p-3.5 rounded-xl border border-border/80 bg-muted/20 space-y-2.5"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="font-bold text-xs text-foreground block truncate">
                    {item.title}
                  </span>
                  <span className="text-[10px] text-muted-foreground block">
                    Bobot per porsi: {item.estimatedWeightKg} kg • Kuota harian: {item.quotaToday} porsi
                  </span>
                </div>
                {item.quotaRemaining > 0 ? (
                  <Badge variant="secondary" className="text-[9px] font-mono bg-amber-500/15 text-amber-700 dark:text-amber-400 shrink-0">
                    Sisa {item.quotaRemaining} Porsi
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="text-[9px] font-mono bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 shrink-0">
                    Habis Terjual
                  </Badge>
                )}
              </div>

              {/* Progress Bar Efisiensi Penyelamatan */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[10px] font-semibold">
                  <span className="text-muted-foreground">Terselamatkan: {item.soldCount} dari {item.quotaToday} porsi</span>
                  <span className="font-mono text-emerald-700 dark:text-emerald-400">{item.rescueRate}%</span>
                </div>
                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-600 rounded-full transition-all"
                    style={{ width: `${Math.min(100, Math.max(0, item.rescueRate))}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-1 text-[10px] text-muted-foreground border-t border-border/50">
                <span>Status Stok:</span>
                <span className="font-semibold text-foreground">
                  {item.quotaRemaining > 0 ? `${item.quotaRemaining} porsi butuh diselamatkan` : "Zero Waste Tercapai"}
                </span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Tabel Pesanan */}
      <Card className="border-border shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/40 border-b border-border text-[11px] text-muted-foreground font-bold uppercase">
              <tr>
                <th className="p-3.5 px-4">ID Pesanan</th>
                <th className="p-3.5">Nama Pembeli</th>
                <th className="p-3.5">Paket Makanan</th>
                <th className="p-3.5">Net Diterima</th>
                <th className="p-3.5">Status Transaksi</th>
                <th className="p-3.5 text-right">Komunikasi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {orders.map((ord) => (
                <tr key={ord.id} className="hover:bg-muted/20">
                  <td className="p-3.5 px-4 font-mono font-bold text-foreground">{ord.id}</td>
                  <td className="p-3.5 font-semibold text-foreground">{ord.buyerName}</td>
                  <td className="p-3.5 text-foreground">{ord.bagTitle}</td>
                  <td className="p-3.5 font-black text-emerald-600 tabular-nums">
                    Rp {ord.sellerEarning.toLocaleString("id-ID")}
                  </td>
                  <td className="p-3.5">
                    <Badge
                      variant={ord.status === "COMPLETED" ? "default" : "secondary"}
                      className={`text-[10px] font-bold ${
                        ord.status === "COMPLETED" ? "bg-emerald-600 text-white" : ""
                      }`}
                    >
                      {ord.status === "COMPLETED" ? "Selesai (Dana Masuk)" : "Menunggu Ambil"}
                    </Badge>
                  </td>
                  <td className="p-3.5 text-right">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setActiveChatOrder(ord)}
                      className="text-xs font-semibold gap-1 text-purple-600"
                    >
                      <MessageSquare className="size-3.5" />
                      <span>Chat</span>
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

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
