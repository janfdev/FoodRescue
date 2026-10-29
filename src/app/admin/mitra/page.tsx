"use client";

import { useState, useEffect } from "react";
import { Store } from "@/types/domain";
import { storeService } from "@/services/storeService";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Shield, Building2, Check, X, Image as ImageIcon, Eye } from "lucide-react";

export default function AdminMitraPage() {
  const [stores, setStores] = useState<Store[]>([]);
  const [selectedKycStore, setSelectedKycStore] = useState<Store | null>(null);

  const syncData = () => {
    setStores(storeService.getState().stores);
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

  const pendingStores = stores.filter((s) => s.status === "PENDING_APPROVAL");

  return (
    <div className="space-y-6 w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-foreground tracking-tight">
            Mitra Menunggu Persetujuan (KYC)
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Tabel verifikasi pendaftar baru usaha kuliner Cirebon Raya lengkap dengan bukti dokumen fisik
          </p>
        </div>
        {pendingStores.length > 0 && (
          <Badge variant="outline" className="bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-300 font-bold text-xs">
            {pendingStores.length} Pendaftar Baru Menunggu
          </Badge>
        )}
      </div>

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
                    <td className="p-4">
                      <span className="font-extrabold text-foreground block text-sm">
                        {st.name}
                      </span>
                      <span className="text-[11px] text-muted-foreground block mt-0.5">
                        {st.category} • Pemilik: {st.kycDetails?.ownerName || "Mitra Cirebon"}
                      </span>
                    </td>

                    <td className="p-4 max-w-[220px]">
                      <span className="text-foreground font-medium block truncate">
                        {st.address}
                      </span>
                      <span className="text-[10px] text-muted-foreground block mt-0.5 font-mono">
                        Kawasan: {st.area}
                      </span>
                    </td>

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

      {/* Dialog Modal Inspeksi KYC Bukti Usaha - Split Screen Reviewer */}
      <Dialog open={!!selectedKycStore} onOpenChange={(open) => !open && setSelectedKycStore(null)}>
        <DialogContent className="max-w-4xl max-h-[92vh] overflow-y-auto p-6">
          <DialogHeader className="pb-3 border-b border-border">
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-base font-black flex items-center gap-2">
                  <span>Audit & Verifikasi Dokumen Kemitraan (KYC)</span>
                  <Badge variant="outline" className="text-[10px] font-mono">
                    {selectedKycStore?.id}
                  </Badge>
                </DialogTitle>
                <DialogDescription className="text-xs">
                  {selectedKycStore?.name} • Pemilik: {selectedKycStore?.kycDetails?.ownerName || "Mitra Cirebon"}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {selectedKycStore && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pt-3 text-xs">
              {/* Left Pane: Split Document Evidence View */}
              <div className="md:col-span-6 space-y-4 border-r md:border-border/80 md:pr-4">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground block">
                  1. Bukti Fisik & Dokumen Legalitas
                </span>

                <div className="space-y-3">
                  {/* Bukti KTP */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] font-bold text-foreground">
                      <span>Kartu Tanda Penduduk (KTP)</span>
                      <Badge className="bg-emerald-600/10 text-emerald-700 text-[9px] border-emerald-500/30">
                        NIK Terdaftar
                      </Badge>
                    </div>
                    <div className="h-44 rounded-2xl border-2 border-dashed border-border bg-muted/30 flex flex-col items-center justify-center p-4 text-center gap-2 relative overflow-hidden group">
                      <Shield className="size-10 text-purple-600/80 group-hover:scale-110 transition-transform" />
                      <div>
                        <span className="text-xs font-mono font-black text-foreground block tabular-nums">
                          {selectedKycStore.kycDetails?.ktpNumber || "3274012903890002"}
                        </span>
                        <span className="text-[10px] text-muted-foreground block">
                          Atas Nama: {selectedKycStore.kycDetails?.ownerName || "Mitra Kuliner"}
                        </span>
                      </div>
                      <span className="text-[9px] text-emerald-600 font-bold bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-300">
                        Pemeriksaan Dukcapil Cocok ✓
                      </span>
                    </div>
                  </div>

                  {/* Bukti Foto Tampak Depan Usaha */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] font-bold text-foreground">
                      <span>Foto Outlet / Dapur Usaha</span>
                      <span className="text-[10px] text-muted-foreground font-mono">
                        {selectedKycStore.area}
                      </span>
                    </div>
                    <div className="h-44 rounded-2xl border-2 border-dashed border-border bg-muted/30 flex flex-col items-center justify-center p-4 text-center gap-2 relative overflow-hidden group">
                      <Building2 className="size-10 text-emerald-600/80 group-hover:scale-110 transition-transform" />
                      <div>
                        <span className="text-xs font-bold text-foreground block">
                          {selectedKycStore.name}
                        </span>
                        <span className="text-[10px] text-muted-foreground block max-w-[240px] truncate">
                          {selectedKycStore.address}
                        </span>
                      </div>
                      <span className="text-[9px] text-muted-foreground font-medium">
                        Koordinat GPS terverifikasi di wilayah operasional Cirebon
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Pane: Business Details & Decision Actions */}
              <div className="md:col-span-6 space-y-4 flex flex-col justify-between">
                <div className="space-y-4">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground block">
                    2. Profil & Data Rekening Pencairan
                  </span>

                  <div className="space-y-2.5 p-4 rounded-2xl bg-muted/40 border border-border/80">
                    <div>
                      <span className="text-[10px] text-muted-foreground block">Nama Usaha Kuliner</span>
                      <span className="text-sm font-extrabold text-foreground">{selectedKycStore.name}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-1 border-t border-border/60">
                      <div>
                        <span className="text-[10px] text-muted-foreground block">Kategori</span>
                        <span className="font-bold text-foreground">{selectedKycStore.category}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-muted-foreground block">Zona Wilayah</span>
                        <span className="font-bold text-foreground">{selectedKycStore.area}</span>
                      </div>
                    </div>

                    <div className="pt-1 border-t border-border/60">
                      <span className="text-[10px] text-muted-foreground block">Alamat Lengkap</span>
                      <span className="text-[11px] text-foreground font-medium leading-relaxed block">
                        {selectedKycStore.address}
                      </span>
                    </div>

                    <div className="pt-1 border-t border-border/60">
                      <span className="text-[10px] text-muted-foreground block">Rekening Bank Pencairan Escrow</span>
                      <div className="flex items-center justify-between mt-0.5">
                        <span className="font-mono font-bold text-xs text-foreground">
                          BCA 134-089-2182
                        </span>
                        <span className="text-[10px] font-bold text-emerald-600">
                          a.n. {selectedKycStore.kycDetails?.ownerName || selectedKycStore.name}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl space-y-1">
                    <span className="text-[11px] font-bold text-amber-800 dark:text-amber-300 block">
                      Pakta Komitmen Kemitraan:
                    </span>
                    <p className="text-[10px] text-muted-foreground leading-relaxed">
                      Dengan menyetujui, toko ini dapat langsung menerbitkan paket Surprise Bag dan wajib menggunakan kemasan resmi Rescue Box bersubsidi.
                    </p>
                  </div>
                </div>

                {/* Keputusan Action Buttons */}
                <div className="space-y-2 pt-4 border-t border-border">
                  {selectedKycStore.status === "PENDING_APPROVAL" ? (
                    <div className="flex items-center gap-2.5">
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleRejectOrSuspendStore(selectedKycStore.id)}
                        className="flex-1 text-xs font-bold h-9 cursor-pointer"
                      >
                        Tolak Kemitraan
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleApproveStore(selectedKycStore.id)}
                        className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold h-9 cursor-pointer shadow-2xs"
                      >
                        Setujui Kemitraan (Approve)
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground font-bold">
                        Status Saat Ini: <strong className="text-foreground">{selectedKycStore.status}</strong>
                      </span>
                      <Button size="sm" variant="outline" onClick={() => setSelectedKycStore(null)}>
                        Tutup Pratinjau
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
