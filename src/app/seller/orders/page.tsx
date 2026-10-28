"use client";

import { useState, useEffect } from "react";
import { Order } from "@/types/domain";
import { storeService } from "@/services/storeService";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { MessageSquare } from "lucide-react";
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
  const [activeChatOrder, setActiveChatOrder] = useState<Order | null>(null);

  const syncData = () => {
    setOrders(storeService.getState().orders);
  };

  useEffect(() => {
    syncData();
    const unsub = storeService.subscribe(syncData);
    return unsub;
  }, []);

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h2 className="text-xl font-black text-foreground tracking-tight">
          Riwayat Transaksi & Analitik Toko
        </h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          Pantau tren omzet harian, pola jam sibuk penjemputan, dan riwayat pesanan yang telah divalidasi
        </p>
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
                  Pendapatan toko 7 hari terakhir setelah potongan fee platform 12%
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
                  data={[
                    { day: "Sen", net: 180000 },
                    { day: "Sel", net: 220000 },
                    { day: "Rab", net: 310000 },
                    { day: "Kam", net: 290000 },
                    { day: "Jum", net: 450000 },
                    { day: "Sab", net: 580000 },
                    { day: "Min", net: 490000 },
                  ]}
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
                  data={[
                    { jam: "17:00", porsi: 3 },
                    { jam: "18:00", porsi: 8 },
                    { jam: "19:00", porsi: 19 },
                    { jam: "20:00", porsi: 26 },
                    { jam: "21:00", porsi: 12 },
                  ]}
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
