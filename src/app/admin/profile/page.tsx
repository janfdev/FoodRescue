"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { storeService } from "@/services/storeService";
import { resolveUserAvatar } from "@/lib/avatar";
import { User } from "@/types/domain";
import { SEED_USERS } from "@/services/seedData";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  ShieldCheck,
  Save,
  Check,
  Phone,
  Mail,
  Camera,
  Loader2,
  Lock,
} from "lucide-react";

export default function AdminProfilePage() {
  const [state, setState] = useState(storeService.getState());
  const [user, setUser] = useState<User | null>(null);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");

  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    const syncState = () => {
      const currentState = storeService.getState();
      setState(currentState);

      const currentUser =
        currentState.currentUser?.role === "admin"
          ? currentState.currentUser
          : SEED_USERS.find((u) => u.role === "admin") ||
            currentState.currentUser || {
              id: "user-admin-1",
              name: "Admin Rerasa (Head of Ops Cirebon)",
              email: "admin@rerasa.com",
              role: "admin" as const,
              phone: "081234567890",
              avatarUrl: "https://api.dicebear.com/10.x/adventurer-neutral/svg?seed=AdminRerasa",
              status: "ACTIVE" as const,
            };
      setUser(currentUser);

      if (currentUser) {
        setName(currentUser.name);
        setPhone(currentUser.phone || "");
        setAvatarUrl(currentUser.avatarUrl || "");
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
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("folder", "admins");

      const res = await fetch("/api/upload", {
        method: "POST",
        body: fd,
      });

      if (res.ok) {
        const data = await res.json();
        if (data.url) setAvatarUrl(data.url);
      }
    } catch {
      setAvatarUrl(URL.createObjectURL(file));
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSaving(true);
    try {
      storeService.updateUserProfile(user.id, {
        name,
        phone,
        avatarUrl,
      });

      setIsSaving(false);
      setSaveSuccess(true);
      toast.success("Profil Admin berhasil diperbarui!");
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      setIsSaving(false);
      toast.error("Gagal menyimpan profil admin.");
      console.warn("Gagal update profil:", err);
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12 font-sans">
      {/* Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-xs font-bold text-purple-700 uppercase tracking-wider">
          <ShieldCheck className="size-4" />
          <span>Pengaturan Super Admin</span>
        </div>
        <h1 className="text-2xl font-black text-foreground tracking-tight">
          Profil & Kredensial Administrator
        </h1>
        <p className="text-xs text-muted-foreground">
          Kelola nama representasi resmi dan nomor kontak darurat platform Rerasa Cirebon.
        </p>
      </div>

      {saveSuccess && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center gap-2">
          <Check className="size-4 shrink-0 text-emerald-600" />
          <span>Profil Administrator berhasil diperbarui!</span>
        </div>
      )}

      <form onSubmit={handleSaveProfile} className="space-y-6">
        {/* Avatar Card */}
        <Card className="border-border shadow-xs rounded-3xl overflow-hidden">
          <CardHeader className="pb-3 border-b border-border/60">
            <CardTitle className="text-sm font-black text-foreground">
              Foto Profil Administrator
            </CardTitle>
            <CardDescription className="text-xs">
              Avatar resmi yang tampil pada log audit sistem dan verifikasi mitra.
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-4 space-y-4">
            <div className="flex items-center gap-4">
              <Avatar className="size-16 rounded-2xl border border-border shrink-0">
                <AvatarImage src={resolveUserAvatar(avatarUrl, name)} alt={name} />
                <AvatarFallback className="bg-purple-700 text-white font-bold text-lg rounded-2xl">
                  {name.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <div className="space-y-1.5 flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="text-xs h-9 max-w-xs file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-xs file:font-bold file:bg-purple-50 file:text-purple-700 dark:file:bg-purple-950 dark:file:text-purple-300"
                  />
                  {isUploading && <Loader2 className="size-4 animate-spin text-purple-600 shrink-0" />}
                </div>
                <span className="text-[10px] text-muted-foreground block">
                  Unggah gambar persegi untuk identitas akun administrator.
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Data Akun */}
        <Card className="border-border shadow-xs rounded-3xl overflow-hidden">
          <CardHeader className="pb-3 border-b border-border/60">
            <CardTitle className="text-sm font-black text-foreground">
              Informasi Pribadi & Kontak
            </CardTitle>
            <CardDescription className="text-xs">
              Kontak resmi untuk verifikasi transaksi rekber escrow dan eskalasi sengketa.
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-4 space-y-4">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-muted-foreground block">
                Nama Lengkap Administrator
              </label>
              <Input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="text-xs h-9"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-muted-foreground block">
                Nomor Telepon / WhatsApp Darurat
              </label>
              <Input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="text-xs h-9 tabular-nums"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-muted-foreground block">
                Alamat Email (Akun Utama)
              </label>
              <Input
                type="email"
                value={user.email}
                disabled
                className="text-xs h-9 bg-muted/50 cursor-not-allowed"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-muted-foreground block">
                Tingkat Hak Akses (Role)
              </label>
              <div className="flex items-center gap-2">
                <Badge className="bg-purple-700 text-white font-mono text-xs px-2.5 py-1">
                  SUPER ADMIN PLATFORM
                </Badge>
                <span className="text-[11px] text-muted-foreground">
                  Akses penuh ke Escrow Vault, Audit Trail, & Persetujuan Mitra.
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex justify-end gap-3 pt-2">
          <Button
            type="submit"
            disabled={isSaving || isUploading}
            className="bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs h-10 px-6 shadow-xs rounded-xl gap-2"
          >
            {isSaving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
            <span>Simpan Perubahan Admin</span>
          </Button>
        </div>
      </form>
    </div>
  );
}
