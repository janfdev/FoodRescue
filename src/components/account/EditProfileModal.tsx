"use client";

import { useState, useEffect } from "react";
import { User, Store } from "@/types/domain";
import { storeService } from "@/services/storeService";
import { resolveUserAvatar } from "@/lib/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Camera,
  Lock,
  Loader2,
  Check,
  ShieldCheck,
  Building2,
  AlertTriangle,
} from "lucide-react";

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  store?: Store | null;
}

export function EditProfileModal({
  isOpen,
  onClose,
  user,
  store,
}: EditProfileModalProps) {
  const [name, setName] = useState(user.name);
  const [phone, setPhone] = useState(user.phone || "");
  const [avatarUrl, setAvatarUrl] = useState(resolveUserAvatar(user.avatarUrl, user.name));
  
  // Seller-specific state
  const [storeName, setStoreName] = useState(store?.name || "");
  const [storeArea, setStoreArea] = useState(store?.area || "Tuparev");
  const [pickupStartTime, setPickupStartTime] = useState(store?.pickupStartTime || "19:00");
  const [pickupEndTime, setPickupEndTime] = useState(store?.pickupEndTime || "21:00");
  const [storeAddress, setStoreAddress] = useState(store?.address || "");

  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const isSeller = user.role === "seller";
  const isAdmin = user.role === "admin" || (user.role as string) === "super_admin";

  const [cirebonAreas, setCirebonAreas] = useState<string[]>([
    "Tuparev",
    "Kesambi",
    "Pekiringan",
    "Karanggetas",
    "Kejaksan",
    "Siliwangi",
    "Kartini",
    "Harjamukti",
    "Kedawung",
  ]);

  useEffect(() => {
    fetch("/api/locations")
      .then((res) => res.json())
      .then((json) => {
        if (json.success && Array.isArray(json.data)) {
          const list = json.data.filter((item: string) => item.toLowerCase() !== "semua lokasi" && item.toLowerCase() !== "semua");
          if (list.length > 0) {
            setCirebonAreas(Array.from(new Set(list)));
          }
        }
      })
      .catch((err) => console.warn("Failed fetching locations:", err));
  }, []);

  // Handle Photo Upload directly to Dahono S3 API
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        if (data.url) {
          setAvatarUrl(data.url);
        }
      } else {
        // Fallback local reader for preview
        const reader = new FileReader();
        reader.onload = (evt) => {
          if (evt.target?.result) {
            setAvatarUrl(evt.target.result as string);
          }
        };
        reader.readAsDataURL(file);
      }
    } catch {
      const reader = new FileReader();
      reader.onload = (evt) => {
        if (evt.target?.result) {
          setAvatarUrl(evt.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = () => {
    setIsSaving(true);

    const updateData = {
      name,
      phone,
      avatarUrl,
      ...(isSeller
        ? {
            storeData: {
              name: storeName,
              phone,
              area: storeArea,
              pickupStartTime,
              pickupEndTime,
              address: storeAddress,
            },
          }
        : {}),
    };

    storeService.updateUserProfile(user.id, updateData);

    setIsSaving(false);
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      onClose();
    }, 600);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md w-full max-h-[90vh] overflow-y-auto p-4 sm:p-6 rounded-3xl">
        <DialogHeader className="text-left space-y-1">
          <DialogTitle className="text-base font-black flex items-center justify-between">
            <span>Ubah Profil Akun</span>
            <Badge
              variant="outline"
              className="text-[10px] font-bold capitalize bg-muted/60"
            >
              {user.role.replace("_", " ")}
            </Badge>
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Perbarui data diri dan preferensi penjemputan makanan Anda
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Avatar Upload with Live S3 Preview */}
          <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-muted/40 border border-border/70">
            <div className="relative group shrink-0">
              <Avatar className="size-16 rounded-2xl ring-2 ring-emerald-600/30 overflow-hidden">
                <AvatarImage src={avatarUrl} alt={name} className="object-cover" />
                <AvatarFallback className="bg-emerald-700 text-white font-black text-lg">
                  {name.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <label
                htmlFor="avatar-file-input"
                className="absolute -bottom-1 -right-1 size-7 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white flex items-center justify-center cursor-pointer shadow-sm transition-transform active:scale-90"
              >
                {isUploading ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <Camera className="size-3.5" />
                )}
                <input
                  id="avatar-file-input"
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
              </label>
            </div>

            <div className="min-w-0 flex-1">
              <span className="text-xs font-black block text-foreground">
                {isSeller ? "Logo Gerai & Avatar" : "Foto Profil"}
              </span>
              <span className="text-[10px] text-muted-foreground block leading-tight mt-0.5">
                Format PNG atau JPG. Tersimpan aman di cloud storage Dahono S3.
              </span>
            </div>
          </div>

          {/* Form Fields: General (All Users) */}
          <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-[11px] font-black uppercase tracking-wider text-muted-foreground">
                {isSeller ? "Nama Pengelola / Kasir" : "Nama Lengkap"}
              </label>
              <Input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Masukkan nama"
                className="h-9 text-xs rounded-xl"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-black uppercase tracking-wider text-muted-foreground">
                Nomor WhatsApp Aktif
              </label>
              <Input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0812xxxx"
                className="h-9 text-xs rounded-xl font-mono"
              />
              <span className="text-[9px] text-muted-foreground block">
                Digunakan untuk konfirmasi pesanan dan status penjemputan
              </span>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-black uppercase tracking-wider text-muted-foreground">
                  Email Akun (Terkunci)
                </label>
                <span className="text-[9px] text-muted-foreground flex items-center gap-1 font-semibold">
                  <Lock className="size-2.5" /> Terikat Akun
                </span>
              </div>
              <Input
                type="email"
                value={user.email}
                disabled
                className="h-9 text-xs rounded-xl bg-muted/60 text-muted-foreground cursor-not-allowed"
              />
            </div>
          </div>

          {/* Form Fields: Seller Specific */}
          {isSeller && (
            <div className="p-3 rounded-2xl bg-orange-500/10 border border-orange-500/20 space-y-3">
              <div className="flex items-center gap-1.5 pb-1 border-b border-orange-500/20 text-orange-800 dark:text-orange-300">
                <Building2 className="size-3.5" />
                <span className="text-xs font-black">Data Toko Mitra Kuliner</span>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-foreground">
                  Nama Gerai / Brand
                </label>
                <Input
                  type="text"
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  className="h-8 text-xs rounded-lg bg-background"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-foreground">
                    Wilayah Cirebon
                  </label>
                  <select
                    value={storeArea}
                    onChange={(e) => setStoreArea(e.target.value)}
                    className="w-full h-8 px-2 text-xs rounded-lg border border-border bg-background font-semibold"
                  >
                    {cirebonAreas.map((area) => (
                      <option key={area} value={area}>
                        {area}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-foreground">
                    Jam Ambil (Mulai - Selesai)
                  </label>
                  <div className="flex items-center gap-1">
                    <Input
                      type="text"
                      value={pickupStartTime}
                      onChange={(e) => setPickupStartTime(e.target.value)}
                      placeholder="19:00"
                      className="h-8 text-xs rounded-lg bg-background font-mono text-center"
                    />
                    <span className="text-xs text-muted-foreground">-</span>
                    <Input
                      type="text"
                      value={pickupEndTime}
                      onChange={(e) => setPickupEndTime(e.target.value)}
                      placeholder="21:00"
                      className="h-8 text-xs rounded-lg bg-background font-mono text-center"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-foreground">
                  Alamat Lengkap & Patokan
                </label>
                <Input
                  type="text"
                  value={storeAddress}
                  onChange={(e) => setStoreAddress(e.target.value)}
                  placeholder="Contoh: Jl. Tuparev No. 88 (depan Alfamart)"
                  className="h-8 text-xs rounded-lg bg-background"
                />
              </div>

              {/* Locked Bank Account Guard */}
              <div className="p-2 rounded-xl bg-background/80 border border-orange-500/30 flex items-start gap-2">
                <Lock className="size-3 text-orange-600 shrink-0 mt-0.5" />
                <div className="text-[9px] text-muted-foreground leading-tight">
                  <strong className="text-foreground font-black block">Rekening Escrow Terlindungi:</strong>
                  Perubahan rekening bank pencairan wajib diajukan ke Super Admin demi mencegah pencurian dana penjualan.
                </div>
              </div>
            </div>
          )}

          {/* Admin Specific Notice */}
          {isAdmin && (
            <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center gap-2 text-xs text-purple-900 dark:text-purple-300">
              <ShieldCheck className="size-4 shrink-0" />
              <span className="text-[10px] font-bold leading-tight">
                Akun Command Center memiliki hak akses penuh audit dan rekber escrow seluruh Cirebon.
              </span>
            </div>
          )}
        </div>

        <DialogFooter className="flex items-center justify-end gap-2 pt-2 border-t border-border">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            className="text-xs h-8 rounded-xl font-bold"
          >
            Batal
          </Button>

          <Button
            type="button"
            onClick={handleSave}
            disabled={isSaving || isUploading}
            className="text-xs h-8 rounded-xl font-black bg-emerald-700 hover:bg-emerald-800 text-white gap-1.5 shadow-sm cursor-pointer"
          >
            {saveSuccess ? (
              <>
                <Check className="size-3.5" />
                <span>Tersimpan!</span>
              </>
            ) : isSaving ? (
              <>
                <Loader2 className="size-3.5 animate-spin" />
                <span>Menyimpan...</span>
              </>
            ) : (
              <span>Simpan Perubahan</span>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
