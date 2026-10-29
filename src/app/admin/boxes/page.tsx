"use client";

import { useState, useEffect, useMemo } from "react";
import { RescueBoxOrder, RescueBoxPackage } from "@/types/domain";
import { storeService } from "@/services/storeService";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { TableToolbar } from "@/components/common/TableToolbar";
import showToast from "@/lib/toast";
import {
  Package,
  Truck,
  CheckCircle2,
  Clock,
  Send,
  Boxes,
  Building2,
  Receipt,
  Search,
  Check,
  AlertCircle,
} from "lucide-react";

export default function AdminBoxesPage() {
  const [boxOrders, setBoxOrders] = useState<RescueBoxOrder[]>([]);
  const [boxPackages, setBoxPackages] = useState<RescueBoxPackage[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [editingResi, setEditingResi] = useState<{ id: string; trackingNumber: string } | null>(null);

  const syncData = () => {
    const state = storeService.getState();
    setBoxOrders(state.boxOrders || []);
    setBoxPackages(state.boxPackages || []);
  };

  useEffect(() => {
    syncData();
    const unsub = storeService.subscribe(syncData);
    return unsub;
  }, []);

  const handleUpdateStatus = (orderId: string, newStatus: RescueBoxOrder["status"]) => {
    storeService.updateRescueBoxOrderStatus(orderId, newStatus);
    showToast.success(`Status pesanan kemasan diperbarui ke ${newStatus}!`);
    syncData();
  };

  const handleSaveTrackingNumber = (orderId: string) => {
    if (!editingResi || !editingResi.trackingNumber.trim()) return;
    storeService.updateRescueBoxOrderStatus(orderId, "SHIPPED", editingResi.trackingNumber.trim());
    showToast.success("Nomor resi ekspedisi berhasil diperbarui!");
    setEditingResi(null);
    syncData();
  };

  // Metrics
  const totalOrders = boxOrders.length;
  const totalPcsSold = boxOrders.reduce((sum, o) => sum + (o.quantityPcs || 0), 0);
  const pendingCount = boxOrders.filter((o) => o.status === "PENDING" || o.status === "PROCESSING").length;
  const shippedCount = boxOrders.filter((o) => o.status === "SHIPPED").length;
  const deliveredCount = boxOrders.filter((o) => o.status === "DELIVERED").length;

  const filteredOrders = useMemo(() => {
    return boxOrders.filter((bo) => {
      const matchSearch =
        bo.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        bo.storeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (bo.trackingNumber && bo.trackingNumber.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchStatus = statusFilter === "ALL" || bo.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [boxOrders, searchQuery, statusFilter]);

  return (
    <div className="space-y-6 w-full font-sans">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 uppercase tracking-wider mb-1">
          <Boxes className="size-4" />
          <span>Rantai Pasok B2B Logistik</span>
        </div>
        <h1 className="text-xl font-black text-foreground tracking-tight">
          Manajemen & Pengiriman Rescue Box
        </h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Kelola pesanan suplai kemasan resmi ramah lingkungan dari mitra toko untuk menjaga kepatuhan wadah dan audit higienitas makanan.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <Card className="border-border shadow-xs p-4 space-y-1">
          <span className="text-[10px] uppercase font-bold text-muted-foreground block">
            Total Pesanan Box
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-foreground tabular-nums">
              {totalOrders}
            </span>
            <span className="text-xs text-muted-foreground font-semibold">Pesanan</span>
          </div>
        </Card>

        <Card className="border-border shadow-xs p-4 space-y-1">
          <span className="text-[10px] uppercase font-bold text-muted-foreground block">
            Volume Kemasan Tersalurkan
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-emerald-600 tabular-nums">
              {totalPcsSold}
            </span>
            <span className="text-xs text-muted-foreground font-semibold">Pcs Box</span>
          </div>
        </Card>

        <Card className="border-border shadow-xs p-4 space-y-1">
          <span className="text-[10px] uppercase font-bold text-muted-foreground block">
            Dalam Pengiriman Ekspedisi
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-blue-600 tabular-nums">
              {shippedCount}
            </span>
            <span className="text-xs text-muted-foreground font-semibold">Pesanan Aktif</span>
          </div>
        </Card>

        <Card className="border-border shadow-xs p-4 space-y-1">
          <span className="text-[10px] uppercase font-bold text-muted-foreground block">
            Terkirim & Diterima Mitra
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-foreground tabular-nums">
              {deliveredCount}
            </span>
            <span className="text-xs text-muted-foreground font-semibold">Selesai</span>
          </div>
        </Card>
      </div>

      {/* Toolbar & Filter */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <TableToolbar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            searchPlaceholder="Cari ID pesanan, nama toko mitra, atau no resi..."
            totalResults={filteredOrders.length}
            onResetFilters={() => {
              setSearchQuery("");
              setStatusFilter("ALL");
            }}
          />

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {["ALL", "PENDING", "PROCESSING", "SHIPPED", "DELIVERED"].map((st) => (
              <Button
                key={st}
                size="sm"
                variant={statusFilter === st ? "default" : "outline"}
                onClick={() => setStatusFilter(st)}
                className={`text-xs font-bold h-8 px-2.5 rounded-lg cursor-pointer ${
                  statusFilter === st
                    ? "bg-purple-700 text-white"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {st === "ALL" ? "Semua Status" : st}
              </Button>
            ))}
          </div>
        </div>

        {/* Tabel Manajemen Box */}
        <Card className="border-border shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/50 border-b border-border text-[11px] text-muted-foreground font-bold uppercase tracking-wider">
                <tr>
                  <th className="p-3.5 px-4">ID Pesanan</th>
                  <th className="p-3.5">Nama Toko Mitra</th>
                  <th className="p-3.5">Jumlah Box</th>
                  <th className="p-3.5">Total Tagihan</th>
                  <th className="p-3.5">No. Resi Ekspedisi</th>
                  <th className="p-3.5">Status Pengiriman</th>
                  <th className="p-3.5 text-right">Aksi Admin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-muted-foreground">
                      {boxOrders.length === 0
                        ? "Belum ada pesanan Rescue Box dari mitra toko."
                        : "Tidak ada pesanan kemasan yang cocok dengan pencarian/filter."}
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((bo) => (
                    <tr key={bo.id} className="hover:bg-muted/20 transition-colors">
                      <td className="p-3.5 px-4 font-mono font-bold text-foreground">{bo.id}</td>
                      <td className="p-3.5">
                        <span className="font-extrabold text-foreground block">{bo.storeName}</span>
                        <span className="text-[10px] text-muted-foreground block truncate max-w-xs">
                          {bo.shippingAddress}
                        </span>
                      </td>
                      <td className="p-3.5 font-bold tabular-nums">
                        {bo.quantityPcs} pcs
                      </td>
                      <td className="p-3.5 font-bold tabular-nums text-foreground">
                        Rp {bo.totalPrice.toLocaleString("id-ID")}
                      </td>
                      <td className="p-3.5">
                        {editingResi?.id === bo.id ? (
                          <div className="flex items-center gap-1.5">
                            <Input
                              value={editingResi.trackingNumber}
                              onChange={(e) =>
                                setEditingResi({ ...editingResi, trackingNumber: e.target.value })
                              }
                              className="h-7 text-xs font-mono max-w-[150px]"
                              placeholder="Masukkan resi..."
                            />
                            <Button
                              size="sm"
                              onClick={() => handleSaveTrackingNumber(bo.id)}
                              className="h-7 px-2 text-[10px] bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer"
                            >
                              <Check className="size-3" />
                            </Button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-xs text-muted-foreground">
                              {bo.trackingNumber || "-"}
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                setEditingResi({
                                  id: bo.id,
                                  trackingNumber: bo.trackingNumber || "",
                                })
                              }
                              className="text-[10px] text-purple-600 hover:underline cursor-pointer font-semibold"
                            >
                              Ubah
                            </button>
                          </div>
                        )}
                      </td>
                      <td className="p-3.5">
                        <Badge
                          variant={bo.status === "DELIVERED" ? "default" : "secondary"}
                          className={`text-[10px] font-bold ${
                            bo.status === "DELIVERED"
                              ? "bg-emerald-600 text-white"
                              : bo.status === "SHIPPED"
                              ? "bg-blue-600 text-white"
                              : ""
                          }`}
                        >
                          {bo.status}
                        </Badge>
                      </td>
                      <td className="p-3.5 text-right space-x-1">
                        {bo.status !== "DELIVERED" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleUpdateStatus(bo.id, "DELIVERED")}
                            className="text-[11px] h-7 px-2.5 font-bold text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950 border-emerald-500/40 cursor-pointer"
                          >
                            <CheckCircle2 className="size-3 mr-1" />
                            <span>Tandai Diterima</span>
                          </Button>
                        )}
                        {bo.status === "DELIVERED" && (
                          <span className="text-[11px] text-muted-foreground font-semibold inline-flex items-center gap-1">
                            <CheckCircle2 className="size-3.5 text-emerald-600" />
                            <span>Selesai</span>
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
