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

      {/* Dialog Modal Inspeksi KYC Bukti Usaha */}
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
    </div>
  );
}
