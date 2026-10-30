"use client";

import { useState, useEffect, useMemo } from "react";
import { RescueBoxOrder, RescueBoxPackage } from "@/types/domain";
import { storeService } from "@/services/storeService";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
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
  Plus,
  Pencil,
  Trash2,
} from "lucide-react";

export default function AdminBoxesPage() {
  const [boxOrders, setBoxOrders] = useState<RescueBoxOrder[]>([]);
  const [boxPackages, setBoxPackages] = useState<RescueBoxPackage[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [editingResi, setEditingResi] = useState<{ id: string; trackingNumber: string } | null>(null);

  // Modal Package Management
  const [isPkgModalOpen, setIsPkgModalOpen] = useState(false);
  const [editingPkg, setEditingPkg] = useState<RescueBoxPackage | null>(null);
  const [pkgName, setPkgName] = useState("");
  const [pkgQuantity, setPkgQuantity] = useState(100);
  const [pkgPrice, setPkgPrice] = useState(140000);
  const [pkgDimensions, setPkgDimensions] = useState("20 x 20 x 8 cm");
  const [pkgDescription, setPkgDescription] = useState("");

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

  const openAddPkgModal = () => {
    setEditingPkg(null);
    setPkgName("");
    setPkgQuantity(100);
    setPkgPrice(140000);
    setPkgDimensions("20 x 20 x 8 cm");
    setPkgDescription("Bahan kraft anti-minyak ramah lingkungan food grade");
    setIsPkgModalOpen(true);
  };

  const openEditPkgModal = (pkg: RescueBoxPackage) => {
    setEditingPkg(pkg);
    setPkgName(pkg.name);
    setPkgQuantity(pkg.quantityPcs);
    setPkgPrice(pkg.price);
    setPkgDimensions(pkg.dimensions);
    setPkgDescription(pkg.description);
    setIsPkgModalOpen(true);
  };

  const handleSavePackage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pkgName.trim() || pkgQuantity <= 0 || pkgPrice <= 0) {
      showToast.error("Nama, kuantitas, dan harga wajib diisi dengan benar.");
      return;
    }

    if (editingPkg) {
      storeService.updateBoxPackage(editingPkg.id, {
        name: pkgName.trim(),
        quantityPcs: pkgQuantity,
        price: pkgPrice,
        dimensions: pkgDimensions.trim(),
        description: pkgDescription.trim(),
      });
      showToast.success("Paket kemasan berhasil diperbarui!");
    } else {
      storeService.addBoxPackage({
        name: pkgName.trim(),
        quantityPcs: pkgQuantity,
        price: pkgPrice,
        dimensions: pkgDimensions.trim(),
        description: pkgDescription.trim(),
      });
      showToast.success("Paket kemasan baru berhasil ditambahkan!");
    }

    setIsPkgModalOpen(false);
    syncData();
  };

  const handleDeletePackage = (pkgId: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus paket kemasan ini?")) {
      storeService.deleteBoxPackage(pkgId);
      showToast.success("Paket kemasan berhasil dihapus.");
      syncData();
    }
  };

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
            Perlu Pengiriman (Pending)
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-amber-600 tabular-nums">
              {pendingCount}
            </span>
            <span className="text-xs text-muted-foreground font-semibold">Menunggu Resi</span>
          </div>
        </Card>

        <Card className="border-border shadow-xs p-4 space-y-1">
          <span className="text-[10px] uppercase font-bold text-muted-foreground block">
            Selesai Terkirim
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-blue-600 tabular-nums">
              {deliveredCount}
            </span>
            <span className="text-xs text-muted-foreground font-semibold">Tiba di Mitra</span>
          </div>
        </Card>
      </div>

      {/* Bagian Manajemen Paket Box B2B (Create/Manage Harga & Paket) */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-extrabold text-foreground flex items-center gap-1.5">
              <Package className="size-4 text-emerald-600" />
              <span>Katalog Paket Suplai Kemasan Resmi (B2B)</span>
            </h3>
            <p className="text-xs text-muted-foreground">
              Atur kuantitas (misal 50, 100, 200, 500 pcs) dan harga per paket kemasan yang dapat dibeli oleh mitra penjual.
            </p>
          </div>
          <Button
            size="sm"
            onClick={openAddPkgModal}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-8 px-3 rounded-lg shrink-0 cursor-pointer shadow-xs"
          >
            <Plus className="size-3.5 mr-1.5" />
            <span>Tambah Paket Box</span>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {boxPackages.map((pkg) => (
            <Card key={pkg.id} className="border-border shadow-xs p-4 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="font-mono text-[10px] border-emerald-500/40 text-emerald-700">
                    {pkg.quantityPcs} Pcs
                  </Badge>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => openEditPkgModal(pkg)}
                      className="p-1 text-muted-foreground hover:text-purple-600 cursor-pointer"
                      title="Edit paket"
                    >
                      <Pencil className="size-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeletePackage(pkg.id)}
                      className="p-1 text-muted-foreground hover:text-red-600 cursor-pointer"
                      title="Hapus paket"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-black text-foreground">{pkg.name}</h4>
                  <p className="text-[11px] text-muted-foreground line-clamp-2 mt-0.5">
                    {pkg.description}
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-border/60 mt-3 flex items-baseline justify-between">
                <span className="text-[10px] text-muted-foreground font-mono">{pkg.dimensions}</span>
                <span className="text-sm font-black text-emerald-700 dark:text-emerald-400 tabular-nums">
                  Rp {pkg.price.toLocaleString("id-ID")}
                </span>
              </div>
            </Card>
          ))}
        </div>
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

        {/* Responsive View: Cards for Mobile (< md), Table for Desktop (>= md) */}
        <div className="md:hidden space-y-3">
          {filteredOrders.length === 0 ? (
            <Card className="p-8 text-center text-muted-foreground text-xs">
              {boxOrders.length === 0
                ? "Belum ada pesanan Rescue Box dari mitra toko."
                : "Tidak ada pesanan kemasan yang cocok dengan pencarian/filter."}
            </Card>
          ) : (
            filteredOrders.map((bo) => (
              <Card key={bo.id} className="p-4 border-border shadow-xs space-y-3 bg-card">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="font-mono font-black text-xs text-foreground block">
                      {bo.id}
                    </span>
                    <span className="font-extrabold text-xs text-foreground block mt-0.5">
                      {bo.storeName}
                    </span>
                    <span className="text-[10px] text-muted-foreground block line-clamp-1">
                      {bo.shippingAddress}
                    </span>
                  </div>
                  <Badge
                    className={`text-[9px] font-bold shrink-0 ${
                      bo.status === "DELIVERED"
                        ? "bg-emerald-600 text-white"
                        : bo.status === "SHIPPED"
                        ? "bg-blue-600 text-white"
                        : "bg-amber-600 text-white"
                    }`}
                  >
                    {bo.status === "DELIVERED"
                      ? "Terkirim"
                      : bo.status === "SHIPPED"
                      ? "Dalam Pengiriman"
                      : "Menunggu Resi"}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-muted/30 border border-border/70 text-xs">
                  <div>
                    <span className="text-[10px] text-muted-foreground block">Jumlah Box:</span>
                    <span className="font-mono font-black text-foreground">{bo.quantityPcs} pcs</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-muted-foreground block">Total Tagihan:</span>
                    <span className="font-mono font-black text-emerald-700 dark:text-emerald-400">
                      Rp {bo.totalPrice.toLocaleString("id-ID")}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-1 border-t border-border/60">
                  <span className="text-[10px] text-muted-foreground font-mono">
                    Resi: {bo.trackingNumber || "Belum ada resi"}
                  </span>
                  {bo.status !== "DELIVERED" && (
                    <Button
                      size="sm"
                      onClick={() => handleUpdateStatus(bo.id, bo.status === "PENDING" ? "SHIPPED" : "DELIVERED")}
                      className="text-[10px] font-bold h-7 px-2.5 bg-purple-700 hover:bg-purple-800 text-white"
                    >
                      {bo.status === "PENDING" ? "Kirim Box" : "Tandai Selesai"}
                    </Button>
                  )}
                </div>
              </Card>
            ))
          )}
        </div>

        {/* Tabel Manajemen Box Desktop (>= md) */}
        <Card className="hidden md:block border-border shadow-xs overflow-hidden">
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

      {/* Modal Tambah / Edit Paket Box */}
      <Dialog open={isPkgModalOpen} onOpenChange={setIsPkgModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-black">
              {editingPkg ? "Edit Paket Rescue Box" : "Tambah Paket Rescue Box"}
            </DialogTitle>
            <DialogDescription className="text-xs">
              Tentukan kuantitas box dan harga paket grosir B2B untuk mitra toko.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSavePackage} className="space-y-3.5 py-2">
            <div>
              <label className="text-[11px] font-bold text-muted-foreground uppercase block mb-1">
                Nama Paket
              </label>
              <Input
                value={pkgName}
                onChange={(e) => setPkgName(e.target.value)}
                placeholder="Contoh: Paket Jumbo 500 Pcs"
                className="h-8 text-xs font-semibold"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-muted-foreground uppercase block mb-1">
                  Kuantitas (Pcs)
                </label>
                <Input
                  type="number"
                  min={1}
                  value={pkgQuantity}
                  onChange={(e) => setPkgQuantity(parseInt(e.target.value, 10) || 0)}
                  className="h-8 text-xs font-mono font-bold"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-muted-foreground uppercase block mb-1">
                  Harga B2B (Rp)
                </label>
                <Input
                  type="number"
                  min={1000}
                  step={1000}
                  value={pkgPrice}
                  onChange={(e) => setPkgPrice(parseInt(e.target.value, 10) || 0)}
                  className="h-8 text-xs font-mono font-bold"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-muted-foreground uppercase block mb-1">
                Dimensi Ukuran
              </label>
              <Input
                value={pkgDimensions}
                onChange={(e) => setPkgDimensions(e.target.value)}
                placeholder="Contoh: 20 x 20 x 8 cm"
                className="h-8 text-xs font-mono"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-muted-foreground uppercase block mb-1">
                Deskripsi & Spesifikasi Bahan
              </label>
              <Input
                value={pkgDescription}
                onChange={(e) => setPkgDescription(e.target.value)}
                placeholder="Contoh: Bahan kraft anti-minyak ramah lingkungan food grade"
                className="h-8 text-xs"
              />
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsPkgModalOpen(false)}
                className="h-8 text-xs"
              >
                Batal
              </Button>
              <Button
                type="submit"
                size="sm"
                className="h-8 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
              >
                {editingPkg ? "Simpan Perubahan" : "Terbitkan Paket"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
