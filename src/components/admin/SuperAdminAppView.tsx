"use client";

import { useState, useEffect } from "react";
import { Store, Order, RescueBoxOrder, WithdrawalRequest, Review, User } from "@/types/domain";
import { storeService } from "@/services/storeService";
import { SEED_USERS } from "@/services/seedData";
import { ChatModal } from "@/components/shared/ChatModal";
import {
  Shield,
  TrendingUp,
  Store as StoreIcon,
  Box,
  CreditCard,
  MessageSquare,
  CheckCircle2,
  XCircle,
  Clock,
  Leaf,
  LayoutDashboard,
  Receipt,
  Wallet,
  Settings,
  Image as ImageIcon,
  Eye,
  Building2,
  Check,
  X,
  FileCheck,
  Users,
  Search,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  UserX
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  AreaChart,
  Area,
} from "recharts";

type AdminTab = "beranda" | "mitra" | "transaksi" | "keuangan" | "users" | "pengaturan";

export function SuperAdminAppView() {
  const [activeTab, setActiveTab] = useState<AdminTab>("mitra");

  const [stores, setStores] = useState<Store[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [boxOrders, setBoxOrders] = useState<RescueBoxOrder[]>([]);
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [metrics, setMetrics] = useState(storeService.getImpactMetrics());

  // User Management State with Pagination
  const [users, setUsers] = useState<User[]>(SEED_USERS);
  const [userSearch, setUserSearch] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState<string>("all");
  const [userPage, setUserPage] = useState(1);
  const userPageSize = 5;

  const handleToggleUserStatus = (userId: string) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          const nextStatus = u.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE";
          return { ...u, status: nextStatus };
        }
        return u;
      })
    );
  };

  // Filtered and Paginated Users
  const filteredUsers = users.filter((u) => {
    const matchSearch =
      !userSearch.trim() ||
      u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.phone.includes(userSearch);
    const matchRole = userRoleFilter === "all" || u.role === userRoleFilter;
    return matchSearch && matchRole;
  });

  const totalUserPages = Math.ceil(filteredUsers.length / userPageSize) || 1;
  const paginatedUsers = filteredUsers.slice(
    (userPage - 1) * userPageSize,
    userPage * userPageSize
  );

  // Modal inspection states
  const [selectedKycStore, setSelectedKycStore] = useState<Store | null>(null);
  const [inspectedChatOrder, setInspectedChatOrder] = useState<Order | null>(null);

  const syncData = () => {
    const state = storeService.getState();
    setStores(state.stores);
    setOrders(state.orders);
    setBoxOrders(state.boxOrders);
    setWithdrawals(state.withdrawals);
    setReviews(state.reviews);
    setMetrics(storeService.getImpactMetrics());
  };

  useEffect(() => {
    syncData();
    const unsub = storeService.subscribe(syncData);
    return unsub;
  }, []);

  const handleApproveStore = (storeId: string) => {
    storeService.updateStoreStatus(storeId, "ACTIVE");
    setSelectedKycStore(null);
    syncData();
  };

  const handleRejectOrSuspendStore = (storeId: string) => {
    storeService.updateStoreStatus(storeId, "SUSPENDED");
    setSelectedKycStore(null);
    syncData();
  };

  const handleApproveWithdrawal = (wdId: string) => {
    storeService.approveWithdrawal(wdId);
    syncData();
  };

  const pendingStores = stores.filter((s) => s.status === "PENDING_APPROVAL");
  const pendingStoresCount = pendingStores.length;
  const pendingWdCount = withdrawals.filter((w) => w.status === "PENDING").length;

  return (
    <div className="w-full min-h-[calc(100vh-45px)] bg-stone-50/60 dark:bg-zinc-950 flex flex-col md:flex-row">
      {/* ─── SIDEBAR KIRI (DESAIN SESUAI PRD & DOKUMEN UI) ────────────────────────── */}
      <aside className="w-full md:w-64 bg-card border-r border-border shrink-0 p-4 flex flex-col justify-between">
        <div className="space-y-6">
          {/* Logo & Operational Zone */}
          <div className="flex items-center gap-3 px-2">
            <Link href="/" className="size-9 rounded-xl overflow-hidden shadow-xs shrink-0 block">
              <img
                src="/brand/rerasa-mascot-r.svg"
                alt="Rerasa Logo"
                className="w-full h-full object-cover"
              />
            </Link>
            <div>
              <span className="font-extrabold text-sm text-foreground block tracking-tight">
                Rerasa Admin
              </span>
              <span className="text-[10px] font-mono text-muted-foreground uppercase block -mt-0.5">
                Cirebon Command
              </span>
            </div>
          </div>

          <Separator />

          {/* 5 Menu Utama Sesuai Dokumen Desain */}
          <nav className="space-y-1">
            <button
              type="button"
              onClick={() => setActiveTab("beranda")}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-colors ${
                activeTab === "beranda"
                  ? "bg-purple-100 text-purple-900 dark:bg-purple-950/80 dark:text-purple-300 shadow-2xs"
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <LayoutDashboard className="size-4" />
                <span>Beranda</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("mitra")}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-colors ${
                activeTab === "mitra"
                  ? "bg-purple-100 text-purple-900 dark:bg-purple-950/80 dark:text-purple-300 shadow-2xs"
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <StoreIcon className="size-4" />
                <span>Mitra Menunggu</span>
              </div>
              {pendingStoresCount > 0 && (
                <Badge variant="destructive" className="text-[10px] px-1.5 py-0 font-mono">
                  {pendingStoresCount}
                </Badge>
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("transaksi")}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-colors ${
                activeTab === "transaksi"
                  ? "bg-purple-100 text-purple-900 dark:bg-purple-950/80 dark:text-purple-300 shadow-2xs"
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Receipt className="size-4" />
                <span>Daftar Transaksi</span>
              </div>
              <span className="text-[10px] text-muted-foreground font-mono">{orders.length}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("keuangan")}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-colors ${
                activeTab === "keuangan"
                  ? "bg-purple-100 text-purple-900 dark:bg-purple-950/80 dark:text-purple-300 shadow-2xs"
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Wallet className="size-4" />
                <span>Keuangan & Payout</span>
              </div>
              {pendingWdCount > 0 && (
                <Badge variant="destructive" className="text-[10px] px-1.5 py-0 font-mono">
                  {pendingWdCount}
                </Badge>
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab("users");
                setUserPage(1);
              }}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-colors ${
                activeTab === "users"
                  ? "bg-purple-100 text-purple-900 dark:bg-purple-950/80 dark:text-purple-300 shadow-2xs"
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Users className="size-4" />
                <span>Manajemen User</span>
              </div>
              <span className="text-[10px] text-muted-foreground font-mono">{users.length}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("pengaturan")}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-colors ${
                activeTab === "pengaturan"
                  ? "bg-purple-100 text-purple-900 dark:bg-purple-950/80 dark:text-purple-300 shadow-2xs"
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Settings className="size-4" />
                <span>Pengaturan & Sengketa</span>
              </div>
            </button>
          </nav>

          <Separator />

          {/* Clean Quick Link ke Beranda */}
          <div className="px-1">
            <Link
              href="/"
              className="flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground p-2 rounded-xl hover:bg-muted/50 transition-colors"
            >
              <ArrowLeft className="size-3.5" />
              <span>Kembali ke Beranda</span>
            </Link>
          </div>
        </div>

        {/* User Card */}
        <div className="pt-4 border-t border-border/80">
          <div className="flex items-center gap-3 p-2 bg-muted/30 rounded-xl">
            <div className="size-8 rounded-full bg-purple-700 text-white flex items-center justify-center font-bold text-xs">
              A
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-xs font-bold text-foreground block truncate">Ahmad Fauzi</span>
              <span className="text-[10px] text-muted-foreground block truncate">Head of Ops Cirebon</span>
            </div>
          </div>
        </div>
      </aside>

      {/* ─── KONTEN UTAMA ─────────────────────────────────────────────────────────── */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        {/* 1. TAB MITRA MENUNGGU (KYC APPROVAL) SESUAI SPESIFIKASI DOKUMEN DESAIN */}
        {activeTab === "mitra" && (
          <div className="space-y-6 max-w-5xl">
            <div>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-black text-foreground tracking-tight">
                    Mitra Menunggu Persetujuan (KYC)
                  </h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Tabel verifikasi pendaftar baru usaha kuliner Cirebon Raya lengkap dengan bukti foto fisik
                  </p>
                </div>
                {pendingStoresCount > 0 && (
                  <Badge variant="outline" className="bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-300 font-bold text-xs">
                    {pendingStoresCount} Pendaftar Baru Menunggu
                  </Badge>
                )}
              </div>
            </div>

            {/* TABEL MITRA MENUNGGU (SESUAI DOKUMEN DESAIN) */}
            <Card className="border-border shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-muted/50 border-b border-border text-[11px] text-muted-foreground font-bold uppercase tracking-wider">
                    <tr>
                      <th className="p-4">Nama Toko & Kategori</th>
                      <th className="p-4">Alamat Usaha</th>
                      <th className="p-4">Foto Bukti Usaha</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right">Aksi Verifikasi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {stores.map((st) => {
                      const isPending = st.status === "PENDING_APPROVAL";
                      return (
                        <tr
                          key={st.id}
                          className={`hover:bg-muted/20 transition-colors ${
                            isPending ? "bg-amber-500/5 font-medium" : ""
                          }`}
                        >
                          {/* Nama Toko */}
                          <td className="p-4">
                            <span className="font-extrabold text-foreground block text-sm">
                              {st.name}
                            </span>
                            <span className="text-[11px] text-muted-foreground block mt-0.5">
                              {st.category} • Pemilik: {st.kycDetails?.ownerName || "Mitra Cirebon"}
                            </span>
                          </td>

                          {/* Alamat */}
                          <td className="p-4 max-w-[220px]">
                            <span className="text-foreground font-medium block truncate">
                              {st.address}
                            </span>
                            <span className="text-[10px] text-muted-foreground block mt-0.5 font-mono">
                              Kawasan: {st.area}
                            </span>
                          </td>

                          {/* Foto Bukti Usaha (Thumbnail + Dialog Trigger) */}
                          <td className="p-4">
                            <button
                              type="button"
                              onClick={() => setSelectedKycStore(st)}
                              className="flex items-center gap-2 p-1.5 px-2.5 rounded-lg border border-border bg-card hover:bg-muted text-foreground text-xs font-semibold shadow-2xs transition-colors"
                              title="Klik untuk membuka bukti foto KTP dan Toko"
                            >
                              <ImageIcon className="size-3.5 text-purple-600 shrink-0" />
                              <span>Lihat Bukti Foto</span>
                              <Eye className="size-3 text-muted-foreground ml-1" />
                            </button>
                          </td>

                          {/* Status */}
                          <td className="p-4">
                            <Badge
                              variant={
                                st.status === "ACTIVE"
                                  ? "default"
                                  : st.status === "PENDING_APPROVAL"
                                  ? "secondary"
                                  : "destructive"
                              }
                              className={`text-[10px] font-bold ${
                                st.status === "ACTIVE"
                                  ? "bg-emerald-600 text-white"
                                  : st.status === "PENDING_APPROVAL"
                                  ? "bg-amber-500 text-white"
                                  : ""
                              }`}
                            >
                              {st.status === "PENDING_APPROVAL"
                                ? "Menunggu Approval"
                                : st.status === "ACTIVE"
                                ? "Aktif Beroperasi"
                                : "Dibekukan"}
                            </Badge>
                          </td>

                          {/* Aksi Sesuai Dokumen Desain: Tombol "Approve" (Hijau) & "Reject/Suspend" (Merah) */}
                          <td className="p-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {st.status === "PENDING_APPROVAL" ? (
                                <>
                                  <Button
                                    size="sm"
                                    onClick={() => handleApproveStore(st.id)}
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs gap-1 h-8"
                                  >
                                    <Check className="size-3.5" />
                                    <span>Approve</span>
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => handleRejectOrSuspendStore(st.id)}
                                    className="text-xs font-bold shadow-xs gap-1 h-8"
                                  >
                                    <X className="size-3.5" />
                                    <span>Reject</span>
                                  </Button>
                                </>
                              ) : st.status === "ACTIVE" ? (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleRejectOrSuspendStore(st.id)}
                                  className="text-red-600 border-red-200 hover:bg-red-50 dark:hover:bg-red-950/40 text-xs font-bold h-8"
                                >
                                  Bekukan Toko
                                </Button>
                              ) : (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleApproveStore(st.id)}
                                  className="text-emerald-700 border-emerald-300 hover:bg-emerald-50 text-xs font-bold h-8"
                                >
                                  Pulihkan Mitra
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

        {/* 2. TAB BERANDA (OVERVIEW & METRIK DAMPAK) */}
        {activeTab === "beranda" && (
          <div className="space-y-6 max-w-5xl">
            <div>
              <h2 className="text-xl font-black text-foreground tracking-tight">
                Ikhtisar Platform & Dampak Sosial
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Konsolidasi perputaran pangan dan kesehatan ekosistem Rerasa Cirebon Raya
              </p>
            </div>

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
                          <linearGradient id="colorGmv" x1="0" y1="0" x2="0" y2="1">
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
                          fill="url(#colorGmv)"
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
        )}

        {/* 3. TAB DAFTAR TRANSAKSI (ESCROW LEDGER) */}
        {activeTab === "transaksi" && (
          <div className="space-y-6 max-w-5xl">
            <div>
              <h2 className="text-xl font-black text-foreground tracking-tight">
                Daftar Transaksi & Rekening Penjamin (Escrow)
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Audit status pemesanan, kode PIN verifikasi fisik kasir, dan penahanan dana
              </p>
            </div>

            <Card className="border-border shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-muted/50 border-b border-border text-[11px] text-muted-foreground font-bold uppercase tracking-wider">
                    <tr>
                      <th className="p-3.5 px-4">ID Pesanan</th>
                      <th className="p-3.5">Pembeli</th>
                      <th className="p-3.5">Mitra Toko</th>
                      <th className="p-3.5">Total & Komisi</th>
                      <th className="p-3.5">PIN Pickup</th>
                      <th className="p-3.5">Status Escrow</th>
                      <th className="p-3.5 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {orders.map((ord) => (
                      <tr key={ord.id} className="hover:bg-muted/20">
                        <td className="p-3.5 px-4 font-mono font-bold text-foreground">{ord.id}</td>
                        <td className="p-3.5">
                          <span className="font-semibold block text-foreground">{ord.buyerName}</span>
                          <span className="text-[10px] text-muted-foreground font-mono">{ord.buyerPhone}</span>
                        </td>
                        <td className="p-3.5">
                          <span className="font-semibold block text-foreground">{ord.storeName}</span>
                          <span className="text-[10px] text-muted-foreground">{ord.bagTitle}</span>
                        </td>
                        <td className="p-3.5 tabular-nums">
                          <span className="font-bold text-foreground block">
                            Rp {ord.totalPrice.toLocaleString("id-ID")}
                          </span>
                          <span className="text-[10px] text-purple-600 block">
                            Fee: Rp {ord.platformFee.toLocaleString("id-ID")}
                          </span>
                        </td>
                        <td className="p-3.5 font-mono font-bold text-foreground">{ord.pickupCode}</td>
                        <td className="p-3.5">
                          <Badge
                            variant={
                              ord.status === "COMPLETED"
                                ? "default"
                                : ord.status === "PAID"
                                ? "secondary"
                                : "outline"
                            }
                            className={`text-[10px] font-bold ${
                              ord.status === "COMPLETED" ? "bg-emerald-600" : ""
                            }`}
                          >
                            {ord.status === "COMPLETED" ? "Dana Dilepas" : "Dana Ditahan (Held)"}
                          </Badge>
                        </td>
                        <td className="p-3.5 text-right">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setInspectedChatOrder(ord)}
                            className="text-xs font-semibold gap-1.5 text-purple-600 hover:text-purple-700"
                          >
                            <MessageSquare className="size-3.5" />
                            <span>Log Chat</span>
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

        {/* 4. TAB KEUANGAN & PENCAIRAN (WITHDRAWAL) */}
        {activeTab === "keuangan" && (
          <div className="space-y-6 max-w-5xl">
            <div>
              <h2 className="text-xl font-black text-foreground tracking-tight">
                Persetujuan Pencairan Dana (Withdrawal) Mitra
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Verifikasi rekening bank tujuan dan eksekusi transfer dana dompet toko
              </p>
            </div>

            <div className="space-y-3">
              {withdrawals.length === 0 ? (
                <div className="p-8 text-center bg-card border border-dashed border-border rounded-2xl text-xs text-muted-foreground">
                  Tidak ada permohonan pencairan dana saat ini.
                </div>
              ) : (
                withdrawals.map((w) => (
                  <Card key={w.id} className="border-border shadow-xs">
                    <CardContent className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-sm text-foreground">{w.storeName}</span>
                          <span className="text-xs font-mono text-muted-foreground">({w.id})</span>
                          <Badge
                            variant={w.status === "APPROVED" ? "default" : "secondary"}
                            className={`text-[10px] font-bold ${
                              w.status === "APPROVED" ? "bg-emerald-600" : "bg-amber-500 text-white"
                            }`}
                          >
                            {w.status}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Rekening: <strong>{w.bankName}</strong> • {w.accountNumber} a/n {w.accountHolder}
                        </p>
                        <p className="text-base font-black text-emerald-700 dark:text-emerald-400 tabular-nums">
                          Rp {w.amount.toLocaleString("id-ID")}
                        </p>
                      </div>

                      <div>
                        {w.status === "PENDING" ? (
                          <Button
                            size="sm"
                            onClick={() => handleApproveWithdrawal(w.id)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs"
                          >
                            Transfer & Setujui (Approve)
                          </Button>
                        ) : (
                          <span className="text-xs text-muted-foreground font-semibold flex items-center gap-1.5">
                            <CheckCircle2 className="size-4 text-emerald-600" />
                            Telah Ditransfer
                          </span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>

            {/* B2B Logistics Table */}
            <div className="pt-4">
              <h3 className="font-extrabold text-sm text-foreground mb-3">
                Logistik Kemasan Rescue Box B2B
              </h3>
              <Card className="border-border shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-muted/50 border-b border-border text-[11px] text-muted-foreground font-bold uppercase tracking-wider">
                      <tr>
                        <th className="p-3.5 px-4">ID Pesanan</th>
                        <th className="p-3.5">Nama Toko</th>
                        <th className="p-3.5">Jumlah Box</th>
                        <th className="p-3.5">Total Tagihan</th>
                        <th className="p-3.5">Resi Pengiriman</th>
                        <th className="p-3.5">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60">
                      {boxOrders.map((bo) => (
                        <tr key={bo.id} className="hover:bg-muted/20">
                          <td className="p-3.5 px-4 font-mono font-bold text-foreground">{bo.id}</td>
                          <td className="p-3.5 font-semibold text-foreground">{bo.storeName}</td>
                          <td className="p-3.5 font-bold tabular-nums">{bo.quantityPcs} pcs</td>
                          <td className="p-3.5 font-bold tabular-nums">
                            Rp {bo.totalPrice.toLocaleString("id-ID")}
                          </td>
                          <td className="p-3.5 font-mono text-muted-foreground">{bo.trackingNumber}</td>
                          <td className="p-3.5">
                            <Badge variant="secondary" className="text-[10px] font-bold">
                              {bo.status}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* 5. TAB MANAJEMEN USER DENGAN PAGINATION (SESUAI REQUEST) */}
        {activeTab === "users" && (
          <div className="space-y-6 max-w-5xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-black text-foreground tracking-tight">
                  Manajemen Pengguna Terdaftar
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Daftar akun Super Admin, Mitra Toko, dan Pelanggan Rerasa Cirebon Raya
                </p>
              </div>

              {/* Search User */}
              <div className="w-full sm:w-64 relative">
                <Search className="size-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Cari nama, email, hp..."
                  value={userSearch}
                  onChange={(e) => {
                    setUserSearch(e.target.value);
                    setUserPage(1);
                  }}
                  className="pl-9 text-xs h-8"
                />
              </div>
            </div>

            {/* Filter Role Buttons */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
              <span className="font-bold text-muted-foreground mr-1 text-[11px]">Filter Peran:</span>
              {[
                { id: "all", label: "Semua Akun" },
                { id: "super_admin", label: "Super Admin" },
                { id: "seller", label: "Mitra Toko" },
                { id: "buyer", label: "Pelanggan" },
              ].map((role) => (
                <Button
                  key={role.id}
                  type="button"
                  size="sm"
                  variant={userRoleFilter === role.id ? "default" : "outline"}
                  onClick={() => {
                    setUserRoleFilter(role.id);
                    setUserPage(1);
                  }}
                  className={`text-xs h-7 px-3 rounded-full font-semibold ${
                    userRoleFilter === role.id
                      ? "bg-purple-700 hover:bg-purple-800 text-white"
                      : "text-muted-foreground border-border"
                  }`}
                >
                  {role.label}
                </Button>
              ))}
            </div>

            {/* User Data Table */}
            <Card className="border-border shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-muted/50 border-b border-border text-[11px] text-muted-foreground font-bold uppercase tracking-wider">
                    <tr>
                      <th className="p-3.5 px-4">Nama & Email</th>
                      <th className="p-3.5">Peran (Role)</th>
                      <th className="p-3.5">No. Telepon / WA</th>
                      <th className="p-3.5">Toko / Afiliasi</th>
                      <th className="p-3.5">Status Akun</th>
                      <th className="p-3.5 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {paginatedUsers.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-xs text-muted-foreground">
                          Tidak ada pengguna yang sesuai kriteria pencarian.
                        </td>
                      </tr>
                    ) : (
                      paginatedUsers.map((u) => {
                        const associatedStore = stores.find((s) => s.id === u.storeId);
                        const isActive = u.status !== "SUSPENDED";
                        return (
                          <tr key={u.id} className="hover:bg-muted/20">
                            <td className="p-3.5 px-4">
                              <span className="font-extrabold text-foreground block text-sm">
                                {u.name}
                              </span>
                              <span className="text-[11px] text-muted-foreground font-mono block mt-0.5">
                                {u.email}
                              </span>
                            </td>
                            <td className="p-3.5">
                              <Badge
                                variant={
                                  u.role === "super_admin"
                                    ? "default"
                                    : u.role === "seller"
                                    ? "secondary"
                                    : "outline"
                                }
                                className={`text-[10px] font-bold ${
                                  u.role === "super_admin"
                                    ? "bg-purple-700 text-white"
                                    : u.role === "seller"
                                    ? "bg-orange-500 text-white"
                                    : "border-emerald-600 text-emerald-700"
                                }`}
                              >
                                {u.role === "super_admin"
                                  ? "Super Admin"
                                  : u.role === "seller"
                                  ? "Mitra Toko"
                                  : "Pelanggan"}
                              </Badge>
                            </td>
                            <td className="p-3.5 font-mono text-muted-foreground">
                              {u.phone || "-"}
                            </td>
                            <td className="p-3.5">
                              {associatedStore ? (
                                <span className="font-semibold text-foreground">
                                  {associatedStore.name}
                                </span>
                              ) : (
                                <span className="text-muted-foreground text-[11px]">Personal</span>
                              )}
                            </td>
                            <td className="p-3.5">
                              <Badge
                                variant={isActive ? "default" : "destructive"}
                                className={`text-[10px] font-bold ${
                                  isActive ? "bg-emerald-600 text-white" : ""
                                }`}
                              >
                                {isActive ? "Aktif" : "Dibekukan"}
                              </Badge>
                            </td>
                            <td className="p-3.5 text-right">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleToggleUserStatus(u.id)}
                                className={`text-xs font-bold h-7 px-2.5 ${
                                  isActive
                                    ? "text-red-600 border-red-200 hover:bg-red-50"
                                    : "text-emerald-700 border-emerald-300 hover:bg-emerald-50"
                                }`}
                              >
                                {isActive ? "Bekukan" : "Aktifkan"}
                              </Button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination Footer Sesuai Request */}
              <div className="p-3.5 px-4 bg-muted/30 border-t border-border flex items-center justify-between text-xs">
                <span className="text-muted-foreground">
                  Menampilkan <strong>{paginatedUsers.length}</strong> dari <strong>{filteredUsers.length}</strong> akun
                </span>

                <div className="flex items-center gap-1.5">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={userPage <= 1}
                    onClick={() => setUserPage((p) => Math.max(1, p - 1))}
                    className="size-7 p-0"
                  >
                    <ChevronLeft className="size-3.5" />
                  </Button>
                  <span className="px-2 text-xs font-semibold text-foreground font-mono">
                    Halaman {userPage} / {totalUserPages}
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={userPage >= totalUserPages}
                    onClick={() => setUserPage((p) => Math.min(totalUserPages, p + 1))}
                    className="size-7 p-0"
                  >
                    <ChevronRight className="size-3.5" />
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* 6. TAB PENGATURAN & AUDIT SENGKETA */}
        {activeTab === "pengaturan" && (
          <div className="space-y-6 max-w-5xl">
            <div>
              <h2 className="text-xl font-black text-foreground tracking-tight">
                Pengaturan Sistem & Resolusi Sengketa
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Pengawasan komplain penjemputan dan checklist kepatuhan kemasan dari ulasan pembeli
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="font-extrabold text-sm text-foreground">
                Audit Kepatuhan Penggunaan Rescue Box dari Ulasan Pembeli
              </h3>
              <div className="space-y-2">
                {reviews.map((rev) => (
                  <Card key={rev.id} className="border-border shadow-2xs">
                    <CardContent className="p-3 text-xs flex items-center justify-between gap-3">
                      <div>
                        <span className="font-bold text-foreground">{rev.buyerName}</span>
                        <p className="text-[11px] text-muted-foreground italic mt-0.5">
                          &quot;{rev.comment}&quot;
                        </p>
                      </div>
                      <Badge
                        variant={rev.usedOfficialRescueBox ? "outline" : "destructive"}
                        className={`text-[10px] font-bold shrink-0 ${
                          rev.usedOfficialRescueBox ? "border-emerald-500 text-emerald-700 dark:text-emerald-300" : ""
                        }`}
                      >
                        {rev.usedOfficialRescueBox ? "✓ Box Resmi Terpasang" : "✗ Tidak Pakai Box Resmi"}
                      </Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ─── DIALOG MODAL INSPEKSI FOTO BUKTI USAHA (KYC STORE INSPECTOR) ────── */}
      <Dialog open={!!selectedKycStore} onOpenChange={(open) => !open && setSelectedKycStore(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Verifikasi Dokumen Bukti Usaha</DialogTitle>
            <DialogDescription>
              {selectedKycStore?.name} • Pemilik: {selectedKycStore?.kycDetails?.ownerName || "Mitra Cirebon"}
            </DialogDescription>
          </DialogHeader>

          {selectedKycStore && (
            <div className="space-y-4 text-xs pt-2">
              <div className="grid grid-cols-2 gap-3 p-3 bg-muted/40 rounded-xl">
                <div>
                  <span className="text-muted-foreground text-[10px] block">Nomor Induk KTP</span>
                  <span className="font-mono font-bold text-foreground">
                    {selectedKycStore.kycDetails?.ktpNumber || "3274012903890002"}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground text-[10px] block">Waktu Pengajuan</span>
                  <span className="font-mono text-muted-foreground">
                    {selectedKycStore.kycDetails?.submittedAt
                      ? new Date(selectedKycStore.kycDetails.submittedAt).toLocaleDateString("id-ID")
                      : "Terdaftar"}
                  </span>
                </div>
              </div>

              {/* Showcase 2 Bukti Fisik: Foto KTP & Foto Toko */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <span className="font-bold text-foreground block">1. Foto KTP Pemilik</span>
                  <div className="h-36 rounded-xl border border-border bg-slate-100 dark:bg-slate-900 flex flex-col items-center justify-center p-3 text-center gap-1.5">
                    <Shield className="size-8 text-purple-600/70" />
                    <span className="text-[11px] font-mono text-muted-foreground">KTP-NIK-TERVERIFIKASI</span>
                    <span className="text-[10px] text-emerald-600 font-semibold">Tercatat di Dukcapil</span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <span className="font-bold text-foreground block">2. Foto Tampak Depan Toko</span>
                  <div className="h-36 rounded-xl border border-border bg-slate-100 dark:bg-slate-900 flex flex-col items-center justify-center p-3 text-center gap-1.5">
                    <Building2 className="size-8 text-emerald-600/70" />
                    <span className="text-[11px] font-semibold text-foreground">{selectedKycStore.name}</span>
                    <span className="text-[10px] text-muted-foreground">{selectedKycStore.address}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                {selectedKycStore.status === "PENDING_APPROVAL" ? (
                  <>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleRejectOrSuspendStore(selectedKycStore.id)}
                      className="text-xs font-bold"
                    >
                      Tolak Kemitraan (Reject)
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleApproveStore(selectedKycStore.id)}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold"
                    >
                      Setujui Kemitraan (Approve)
                    </Button>
                  </>
                ) : (
                  <Button size="sm" variant="outline" onClick={() => setSelectedKycStore(null)}>
                    Tutup Pratinjau
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Chat Inspector Modal */}
      {inspectedChatOrder && (
        <ChatModal
          order={inspectedChatOrder}
          onClose={() => setInspectedChatOrder(null)}
        />
      )}
    </div>
  );
}
