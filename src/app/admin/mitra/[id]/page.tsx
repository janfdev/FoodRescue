"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Store,
  MapPin,
  Clock,
  Phone,
  Building2,
  CheckCircle,
  XCircle,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { storeService } from "@/services/storeService";
import { Store as StoreType } from "@/types/domain";
import showToast from "@/lib/toast";

function AdminMitraVerificationContent() {
  const params = useParams();
  const router = useRouter();
  const storeId = params?.id as string;

  const [store, setStore] = useState<StoreType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const currentState = storeService.getState();
    const found = currentState.stores.find((s) => s.id === storeId);
    setStore(found || null);
    setLoading(false);
  }, [storeId]);

  const handleApprove = () => {
    if (!store) return;
    storeService.updateStoreStatus(store.id, "ACTIVE");
    showToast.success(`Gerai ${store.name} resmi disetujui & aktif!`);
    setTimeout(() => {
      router.push("/admin/mitra");
    }, 800);
  };

  const handleReject = () => {
    if (!store) return;
    storeService.updateStoreStatus(store.id, "SUSPENDED");
    showToast.error(`Pendaftaran gerai ${store.name} ditangguhkan / ditolak.`);
    setTimeout(() => {
      router.push("/admin/mitra");
    }, 800);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="size-8 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!store) {
    return (
      <div className="max-w-2xl mx-auto p-8 text-center space-y-4">
        <AlertTriangle className="size-10 text-amber-500 mx-auto" />
        <h2 className="text-lg font-bold text-foreground">Data Mitra Tidak Ditemukan</h2>
        <p className="text-xs text-muted-foreground">
          Mitra dengan ID {storeId} tidak terdaftar di sistem.
        </p>
        <Link href="/admin/mitra">
          <Button variant="outline" size="sm" className="text-xs">
            Kembali ke Daftar Mitra
          </Button>
        </Link>
      </div>
    );
  }

  const kyc = store.kycDetails;

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-16 font-sans">
      {/* Top Bar Navigation & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/mitra"
            className="size-9 rounded-xl border border-border bg-card hover:bg-muted flex items-center justify-center text-foreground transition-colors"
          >
            <ArrowLeft className="size-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-foreground tracking-tight">{store.name}</h1>
              <Badge
                className={`text-[10px] font-bold ${
                  store.status === "ACTIVE"
                    ? "bg-emerald-600 text-white"
                    : store.status === "SUSPENDED"
                    ? "bg-red-600 text-white"
                    : "bg-amber-500 text-white"
                }`}
              >
                {store.status === "PENDING_APPROVAL" ? "MENUNGGU VERIFIKASI" : store.status === "ACTIVE" ? "AKTIF" : "DIBEKUKAN"}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              ID Registrasi: <span className="font-mono">{store.id}</span> • Kategori: {store.category}
            </p>
          </div>
        </div>

        {store.status === "PENDING_APPROVAL" && (
          <div className="flex items-center gap-2.5">
            <Button
              type="button"
              variant="outline"
              onClick={handleReject}
              className="border-red-500/40 text-red-600 hover:bg-red-500/10 hover:text-red-700 text-xs font-bold gap-1.5 h-9 rounded-xl cursor-pointer"
            >
              <XCircle className="size-4" />
              <span>Tolak Mitra</span>
            </Button>
            <Button
              type="button"
              onClick={handleApprove}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold gap-1.5 h-9 rounded-xl shadow-xs cursor-pointer"
            >
              <CheckCircle className="size-4" />
              <span>Setujui & Aktifkan</span>
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Kolom Kiri: Foto Fisik Usaha */}
        <Card className="border-border shadow-xs rounded-3xl overflow-hidden">
          <CardHeader className="pb-3 border-b border-border/60">
            <CardTitle className="text-sm font-black text-foreground flex items-center justify-between">
              <span>Foto Plang Gerai Fisik (KYC)</span>
              {kyc?.storeFrontImage && (
                <a
                  href={kyc.storeFrontImage}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] font-bold text-purple-600 hover:underline inline-flex items-center gap-1"
                >
                  <ExternalLink className="size-3" />
                  <span>Buka Resolusi Penuh</span>
                </a>
              )}
            </CardTitle>
            <CardDescription className="text-xs">
              Bukti autentik toko fisik beroperasi di wilayah Cirebon Raya tanpa membutuhkan KTP pribadi.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 space-y-3">
            <div className="aspect-video w-full rounded-2xl overflow-hidden bg-muted border border-border relative">
              <img
                src={kyc?.storeFrontImage || "/images/foods/roti-danish-pastry.jpg"}
                alt={`Plang Toko ${store.name}`}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-3 bg-muted/40 rounded-2xl border border-border text-xs space-y-1">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                Catatan Operasional Toko:
              </span>
              <p className="text-muted-foreground leading-relaxed">
                {kyc?.notes || "Mitra mendaftar mandiri via alur Lightweight KYC Cirebon Raya."}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Kolom Kanan: Rincian Lokasi, Kontak & Rekening Bank */}
        <div className="space-y-6">
          <Card className="border-border shadow-xs rounded-3xl overflow-hidden">
            <CardHeader className="pb-3 border-b border-border/60">
              <CardTitle className="text-sm font-black text-foreground flex items-center gap-2">
                <Store className="size-4 text-purple-600" />
                <span>Identitas Kontak & Jam Operasional</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-3 text-xs">
              <div className="flex items-start gap-3">
                <MapPin className="size-4 text-muted-foreground shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-foreground block">{store.address}</span>
                  <span className="text-muted-foreground">Kecamatan/Wilayah: {store.area}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Clock className="size-4 text-muted-foreground shrink-0" />
                <div>
                  <span className="text-muted-foreground">Jendela Pickup Surplus: </span>
                  <strong className="text-foreground">{store.pickupStartTime || "19:00"} - {store.pickupEndTime || "21:00"} WIB</strong>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Phone className="size-4 text-muted-foreground shrink-0" />
                <div>
                  <span className="text-muted-foreground">WhatsApp PIC / Kasir: </span>
                  <strong className="text-foreground font-mono">
                    {store.bankAccount?.accountNumber ? "Terverifikasi" : "Belum Tersedia"}
                  </strong>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border shadow-xs rounded-3xl overflow-hidden">
            <CardHeader className="pb-3 border-b border-border/60">
              <CardTitle className="text-sm font-black text-foreground flex items-center gap-2">
                <Building2 className="size-4 text-emerald-600" />
                <span>Rekening Penampung Hasil Penjualan</span>
              </CardTitle>
              <CardDescription className="text-xs">
                Rekening resmi perbankan penampung pencairan saldo escrow Rerasa.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4 space-y-3 text-xs">
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 rounded-2xl border border-emerald-500/20 space-y-1">
                <span className="text-[10px] font-bold text-emerald-800 dark:text-emerald-400 uppercase tracking-wider block">
                  Nama Bank & Nomor Rekening:
                </span>
                <p className="text-base font-black text-emerald-900 dark:text-emerald-300 font-mono tracking-wide">
                  {store.bankAccount ? `${store.bankAccount.bankName} - ${store.bankAccount.accountNumber}` : "Belum Didaftarkan"}
                </p>
                <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                  Atas Nama (Pemegang Rekening): {store.bankAccount?.accountHolder || store.kycDetails?.ownerName || store.name}
                </p>
              </div>

              <div className="flex items-center gap-2 text-[11px] text-muted-foreground pt-1">
                <ShieldCheck className="size-4 text-emerald-600 shrink-0" />
                <span>Verifikasi rekening otomatis terikat ke e-KYC perbankan nasional.</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function AdminMitraVerificationPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="size-8 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <AdminMitraVerificationContent />
    </Suspense>
  );
}
