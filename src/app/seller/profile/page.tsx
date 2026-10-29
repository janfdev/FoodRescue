"use client";

import { useState, useEffect } from "react";
import showToast from "@/lib/toast";
import { storeService } from "@/services/storeService";
import { resolveUserAvatar } from "@/lib/avatar";
import { Store, User } from "@/types/domain";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Store as StoreIcon,
  Save,
  Check,
  Building2,
  Clock,
  MapPin,
  Phone,
  Mail,
  Camera,
  Loader2,
} from "lucide-react";

const RESTAURANT_CHAIN_LOGOS = [
  { name: "Burger King", url: "/images/restaurant-chains/burger-king/burger-king-preview.png" },
  { name: "KFC", url: "/images/restaurant-chains/kfc/kfc-preview.png" },
  { name: "McDonald's", url: "/images/restaurant-chains/mcdonalds/mcdonalds-preview.png" },
  { name: "Pizza Hut", url: "/images/restaurant-chains/pizza-hut/pizza-hut-preview.png" },
  { name: "Wendy's", url: "/images/restaurant-chains/wendys/wendys-preview.png" },
  { name: "Yoshinoya", url: "/images/restaurant-chains/yoshinoya/yoshinoya-preview.png" },
  { name: "Domino's", url: "/images/restaurant-chains/dominos/dominos-preview.png" },
  { name: "Popeyes", url: "/images/restaurant-chains/popeyes/popeyes-preview.png" },
];

export default function SellerProfilePage() {
  const [state, setState] = useState(storeService.getState());
  const [store, setStore] = useState<Store | null>(null);
  const [user, setUser] = useState<User | null>(null);

  // Form states
  const [ownerName, setOwnerName] = useState("");
  const [phone, setPhone] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");

  const [storeName, setStoreName] = useState("");
  const [storeArea, setStoreArea] = useState("");
  const [storeAddress, setStoreAddress] = useState("");
  const [pickupStartTime, setPickupStartTime] = useState("19:00");
  const [pickupEndTime, setPickupEndTime] = useState("21:00");

  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    const syncState = () => {
      const currentState = storeService.getState();
      setState(currentState);
      const activeStore = currentState.currentUser?.storeId
        ? currentState.stores.find((s) => s.id === currentState.currentUser?.storeId) || null
        : null;
      setStore(activeStore);

      const currentUser = currentState.currentUser || null;
      setUser(currentUser);

      if (currentUser) {
        setOwnerName(currentUser.name);
        setPhone(currentUser.phone || "");
        setAvatarUrl(currentUser.avatarUrl || "");
      }

      if (activeStore) {
        setStoreName(activeStore.name);
        setStoreArea(activeStore.area);
        setStoreAddress(activeStore.address);
        setPickupStartTime(activeStore.pickupStartTime || "19:00");
        setPickupEndTime(activeStore.pickupEndTime || "21:00");
        if (activeStore.logoUrl) {
          setAvatarUrl(activeStore.logoUrl);
        }
      }
    };

    syncState();
    const unsub = storeService.subscribe(syncState);
    return unsub;
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const toastId = "upload-avatar";
    showToast.loading("Mengunggah foto logo gerai...", { id: toastId });
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("folder", "stores");

      const res = await fetch("/api/upload", {
        method: "POST",
        body: fd,
      });

      if (res.ok) {
        const data = await res.json();
        if (data.url) {
          setAvatarUrl(data.url);
          showToast.success("Logo gerai berhasil diunggah!", { id: toastId });
        }
      } else {
        setAvatarUrl(URL.createObjectURL(file));
        showToast.success("Logo lokal berhasil dipilih!", { id: toastId });
      }
    } catch {
      setAvatarUrl(URL.createObjectURL(file));
      showToast.success("Logo lokal berhasil dipilih!", { id: toastId });
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !store) return;

    setIsSaving(true);
    try {
      // Update User Profile & associated Store Data
      storeService.updateUserProfile(user.id, {
        name: ownerName,
        phone,
        avatarUrl,
        storeData: {
          name: storeName,
          phone,
          area: storeArea,
          address: storeAddress,
          pickupStartTime,
          pickupEndTime,
        },
      });

      setIsSaving(false);
      setSaveSuccess(true);
      showToast.success("Profil gerai dan penanggung jawab berhasil disimpan!");
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      setIsSaving(false);
      showToast.error("Gagal menyimpan profil gerai.");
      console.warn("Gagal menyimpan profil:", err);
    }
  };

  if (!store || !user) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12 font-sans">
      {/* Page Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-xs font-bold text-orange-600 uppercase tracking-wider">
          <StoreIcon className="size-4" />
          <span>Pengaturan Portal Mitra</span>
        </div>
        <h1 className="text-2xl font-black text-foreground tracking-tight">
          Profil Gerai & Penanggung Jawab
        </h1>
        <p className="text-xs text-muted-foreground">
          Kelola informasi kontak kasir operasional, logo brand etalase, dan jendela waktu penjemputan makanan surplus.
        </p>
      </div>

      {saveSuccess && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center gap-2">
          <Check className="size-4 shrink-0 text-emerald-600" />
          <span>Profil gerai dan data penanggung jawab berhasil diperbarui!</span>
        </div>
      )}

      <form onSubmit={handleSaveProfile} className="space-y-6">
        {/* Identitas Logo & Brand */}
        <Card className="border-border shadow-xs rounded-3xl overflow-hidden">
          <CardHeader className="pb-3 border-b border-border/60">
            <CardTitle className="text-sm font-black text-foreground">
              Logo Gerai & Preset Brand
            </CardTitle>
            <CardDescription className="text-xs">
              Pilih logo resmi restoran dari ZonaLogo atau unggah logo khusus Anda.
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-4 space-y-4">
            <div className="flex items-center gap-4">
              <Avatar className="size-16 rounded-2xl border border-border shrink-0">
                <AvatarImage src={resolveUserAvatar(avatarUrl, storeName)} alt={storeName} />
                <AvatarFallback className="bg-orange-600 text-white font-bold text-lg rounded-2xl">
                  {storeName.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <div className="space-y-1.5 flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="text-xs h-9 max-w-xs file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-xs file:font-bold file:bg-orange-50 file:text-orange-700 dark:file:bg-orange-950 dark:file:text-orange-300"
                  />
                  {isUploading && <Loader2 className="size-4 animate-spin text-orange-600 shrink-0" />}
                </div>
                <span className="text-[10px] text-muted-foreground block">
                  Format PNG / JPG / SVG, rasio 1:1 direkomendasikan.
                </span>
              </div>
            </div>

            {/* ZonaLogo Presets */}
            <div className="space-y-1.5 pt-2 border-t border-border/60">
              <span className="text-xs font-bold text-foreground block">
                Pilihan Cepat Logo Restoran (ZonaLogo):
              </span>
              <div className="flex items-center gap-2.5 overflow-x-auto pb-1.5 scrollbar-none">
                {RESTAURANT_CHAIN_LOGOS.map((brand) => (
                  <button
                    key={brand.name}
                    type="button"
                    onClick={() => setAvatarUrl(brand.url)}
                    className={`size-12 shrink-0 rounded-2xl p-1.5 border transition-all ${
                      avatarUrl === brand.url
                        ? "border-orange-600 bg-orange-50 dark:bg-orange-950/40 ring-2 ring-orange-600/30 scale-105"
                        : "border-border/70 hover:border-orange-600/50 bg-background"
                    }`}
                  >
                    <img src={brand.url} alt={brand.name} className="size-full object-contain" />
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Data Gerai & Operasional */}
        <Card className="border-border shadow-xs rounded-3xl overflow-hidden">
          <CardHeader className="pb-3 border-b border-border/60">
            <CardTitle className="text-sm font-black text-foreground">
              Informasi Operasional Gerai
            </CardTitle>
            <CardDescription className="text-xs">
              Lokasi fisik dan jadwal waktu penjemputan pesanan oleh pelanggan.
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-4 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-muted-foreground block">
                  Nama Gerai / Toko
                </label>
                <Input
                  type="text"
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  className="text-xs h-9"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-muted-foreground block">
                  Kawasan / Area Wilayah
                </label>
                <Input
                  type="text"
                  value={storeArea}
                  onChange={(e) => setStoreArea(e.target.value)}
                  className="text-xs h-9"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-muted-foreground block">
                Alamat Fisik Lengkap
              </label>
              <Input
                type="text"
                value={storeAddress}
                onChange={(e) => setStoreAddress(e.target.value)}
                className="text-xs h-9"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-muted-foreground block">
                  Jam Mulai Pickup
                </label>
                <Input
                  type="time"
                  value={pickupStartTime}
                  onChange={(e) => setPickupStartTime(e.target.value)}
                  className="text-xs h-9 tabular-nums"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-muted-foreground block">
                  Jam Selesai Pickup
                </label>
                <Input
                  type="time"
                  value={pickupEndTime}
                  onChange={(e) => setPickupEndTime(e.target.value)}
                  className="text-xs h-9 tabular-nums"
                  required
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Data Akun PIC Penanggung Jawab */}
        <Card className="border-border shadow-xs rounded-3xl overflow-hidden">
          <CardHeader className="pb-3 border-b border-border/60">
            <CardTitle className="text-sm font-black text-foreground">
              Kontak Penanggung Jawab (Kasir/Pengelola)
            </CardTitle>
            <CardDescription className="text-xs">
              Digunakan untuk notifikasi sistem dan koordinasi darurat pesanan pembeli.
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-4 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-muted-foreground block">
                  Nama Lengkap PIC
                </label>
                <Input
                  type="text"
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  className="text-xs h-9"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-muted-foreground block">
                  Nomor WhatsApp Kasir
                </label>
                <Input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="text-xs h-9 tabular-nums"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-muted-foreground block">
                Email Operasional (Hanya Baca)
              </label>
              <Input
                type="email"
                value={user.email}
                disabled
                className="text-xs h-9 bg-muted/50 cursor-not-allowed"
              />
            </div>
          </CardContent>
        </Card>

        {/* Action Button */}
        <div className="flex justify-end gap-3 pt-2">
          <Button
            type="submit"
            disabled={isSaving || isUploading}
            className="bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs h-10 px-6 shadow-xs rounded-xl gap-2"
          >
            {isSaving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
            <span>Simpan Perubahan Profil</span>
          </Button>
        </div>
      </form>
    </div>
  );
}
