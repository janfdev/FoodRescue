"use client";

import { useState, useEffect } from "react";
import { Leaf, TrendingUp, CreditCard, Box, AlertTriangle, ArrowRight, ShieldCheck, Wallet, Sparkles } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
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
import { storeService } from "@/services/storeService";

export default function AdminOverviewPage() {
  const [state, setState] = useState(storeService.getState());
  const metrics = storeService.getImpactMetrics();

  useEffect(() => {
    const unsub = storeService.subscribe(() => {
      setState(storeService.getState());
    });
    return unsub;
  }, []);

  const stores = state.stores;
  const pendingKycStores = stores.filter((s) => s.status === "PENDING_APPROVAL");
  const pendingDisbursements = (state.withdrawals || []).filter((d) => d.status === "PENDING");
  const lowBoxStores = stores.filter((s) => (s.currentBoxStock || 0) < 10);

  return (
    <div className="space-y-6 w-full">
      <div>
        <h2 className="text-xl font-black text-foreground tracking-tight">
          Ikhtisar Platform & Dampak Sosial
        </h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          Konsolidasi perputaran pangan dan kesehatan ekosistem Rerasa Cirebon Raya
        </p>
      </div>

      {/* Pusat Tindakan Mendesak Super Admin */}
      {(pendingKycStores.length > 0 || pendingDisbursements.length > 0 || lowBoxStores.length > 0) && (
        <Card className="border-amber-500/40 bg-amber-500/5 shadow-xs p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="size-4 text-amber-600" />
              <h3 className="text-xs font-black text-foreground uppercase tracking-wider">
                Tindakan Mendesak Menunggu Keputusan Admin
              </h3>
            </div>
            <Badge className="bg-amber-600 text-white font-mono text-[10px]">
              {pendingKycStores.length + pendingDisbursements.length + lowBoxStores.length} Butuh Aksi
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
            {pendingKycStores.length > 0 && (
              <Link
                href="/admin/mitra"
                className="p-3 bg-card rounded-xl border border-border/80 hover:border-amber-500/60 transition-all flex items-center justify-between group"
              >
                <div className="space-y-0.5">
                  <span className="text-[11px] font-extrabold text-foreground block">
                    Verifikasi KYC Mitra
                  </span>
                  <span className="text-[10px] text-muted-foreground block">
                    <strong className="text-amber-600 tabular-nums">{pendingKycStores.length}</strong> toko menunggu aktivasi
                  </span>
                </div>
                <ArrowRight className="size-4 text-muted-foreground group-hover:text-amber-600 group-hover:translate-x-0.5 transition-all" />
              </Link>
            )}

            {pendingDisbursements.length > 0 && (
              <Link
                href="/admin/keuangan"
                className="p-3 bg-card rounded-xl border border-border/80 hover:border-amber-500/60 transition-all flex items-center justify-between group"
              >
                <div className="space-y-0.5">
                  <span className="text-[11px] font-extrabold text-foreground block">
                    Pencairan Dana Escrow
                  </span>
                  <span className="text-[10px] text-muted-foreground block">
                    <strong className="text-purple-600 tabular-nums">{pendingDisbursements.length}</strong> transfer menunggu bukti
                  </span>
                </div>
                <ArrowRight className="size-4 text-muted-foreground group-hover:text-purple-600 group-hover:translate-x-0.5 transition-all" />
              </Link>
            )}

            {lowBoxStores.length > 0 && (
              <Link
                href="/admin/boxes"
                className="p-3 bg-card rounded-xl border border-border/80 hover:border-amber-500/60 transition-all flex items-center justify-between group"
              >
                <div className="space-y-0.5">
                  <span className="text-[11px] font-extrabold text-foreground block">
                    Kritis Stok Kemasan Box
                  </span>
                  <span className="text-[10px] text-muted-foreground block">
                    <strong className="text-rose-600 tabular-nums">{lowBoxStores.length}</strong> toko stok di bawah 10 pcs
                  </span>
                </div>
                <ArrowRight className="size-4 text-muted-foreground group-hover:text-rose-600 group-hover:translate-x-0.5 transition-all" />
              </Link>
            )}
          </div>
        </Card>
      )}

      {/* 4 Kartu Metrik Utama */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-border shadow-xs">
          <CardContent className="p-4 space-y-1">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-bold uppercase tracking-wider">Makanan Diselamatkan</span>
              <Leaf className="size-4 text-emerald-600" />
            </div>
            <p className="text-2xl font-black text-foreground tabular-nums">
              {metrics.totalMealsSaved} Porsi
            </p>
            <p className="text-[11px] text-emerald-600 font-medium">
              ±{metrics.estimatedKgSaved} kg limbah organik dicegah
            </p>
          </CardContent>
        </Card>

        <Card className="border-border shadow-xs">
          <CardContent className="p-4 space-y-1">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-bold uppercase tracking-wider">GMV Transaksi</span>
              <TrendingUp className="size-4 text-blue-600" />
            </div>
            <p className="text-2xl font-black text-foreground tabular-nums">
              Rp {metrics.gmv.toLocaleString("id-ID")}
            </p>
            <p className="text-[11px] text-muted-foreground">Nilai perputaran surplus resto</p>
          </CardContent>
        </Card>

        <Card className="border-border shadow-xs">
          <CardContent className="p-4 space-y-1">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-bold uppercase tracking-wider">Komisi Platform (12%)</span>
              <CreditCard className="size-4 text-purple-600" />
            </div>
            <p className="text-2xl font-black text-purple-600 tabular-nums">
              Rp {metrics.platformRevenue.toLocaleString("id-ID")}
            </p>
            <p className="text-[11px] text-muted-foreground">Take-rate transaksi diselesaikan</p>
          </CardContent>
        </Card>

        <Card className="border-border shadow-xs">
          <CardContent className="p-4 space-y-1">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-bold uppercase tracking-wider">Rescue Box B2B</span>
              <Box className="size-4 text-amber-600" />
            </div>
            <p className="text-2xl font-black text-amber-600 tabular-nums">
              {metrics.totalBoxesSold} Pcs
            </p>
            <p className="text-[11px] text-muted-foreground">Kemasan resmi tersalurkan</p>
          </CardContent>
        </Card>
      </div>

      {/* Dua Chart Analitik Recharts Super Admin */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2">
        {/* Chart 1: Tren GMV & Porsi Makanan Diselamatkan 7 Hari Terakhir */}
        <Card className="lg:col-span-7 border-border shadow-xs">
          <CardHeader className="p-4 px-5 pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm font-black">
                  Tren Penyelamatan Pangan Mingguan
                </CardTitle>
                <CardDescription className="text-xs">
                  Porsi makanan diselamatkan (porsi) vs GMV transaksi (Rp)
                </CardDescription>
              </div>
              <Badge variant="outline" className="text-[10px] font-mono border-emerald-500/40 text-emerald-700">
                7 Hari Terakhir
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-2">
            <div className="h-64 w-full text-xs">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={[
                    { day: "Sen", porsi: 38, gmv: 950000 },
                    { day: "Sel", porsi: 45, gmv: 1125000 },
                    { day: "Rab", porsi: 52, gmv: 1300000 },
                    { day: "Kam", porsi: 61, gmv: 1525000 },
                    { day: "Jum", porsi: 78, gmv: 1950000 },
                    { day: "Sab", porsi: 94, gmv: 2350000 },
                    { day: "Min", porsi: 84, gmv: 2100000 },
                  ]}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorGmvAdmin" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#059669" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#059669" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <RechartsTooltip
                    formatter={(value: any, name: any) => [
                      name === "gmv"
                        ? `Rp ${Number(value).toLocaleString("id-ID")}`
                        : `${value} Porsi`,
                      name === "gmv" ? "GMV Transaksi" : "Porsi Diselamatkan",
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
                    dataKey="gmv"
                    stroke="#059669"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorGmvAdmin)"
                    name="gmv"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Chart 2: Kepatuhan Box Resmi per Mitra Toko */}
        <Card className="lg:col-span-5 border-border shadow-xs">
          <CardHeader className="p-4 px-5 pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm font-black">
                  Kepatuhan Box Mitra Toko
                </CardTitle>
                <CardDescription className="text-xs">
                  Rasio kepatuhan wadah resmi Rerasa (%)
                </CardDescription>
              </div>
              <Badge variant="outline" className="text-[10px] font-mono border-purple-500/40 text-purple-700">
                Audit Ulasan
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-2">
            <div className="h-64 w-full text-xs">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={stores.slice(0, 6).map((s) => ({
                    name: s.name.split(" ")[0],
                    compliance: s.boxComplianceRate,
                  }))}
                  margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis domain={[80, 100]} tick={{ fontSize: 10 }} />
                  <RechartsTooltip
                    formatter={(value: any) => [`${value}%`, "Kepatuhan Box"]}
                    contentStyle={{
                      backgroundColor: "var(--card)",
                      borderColor: "var(--border)",
                      borderRadius: "0.75rem",
                      fontSize: "12px",
                    }}
                  />
                  <Bar
                    dataKey="compliance"
                    fill="#7c3aed"
                    radius={[6, 6, 0, 0]}
                    name="compliance"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
