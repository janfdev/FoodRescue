"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  ArrowLeft,
  Store as StoreIcon,
  CheckCircle2,
  Building2,
  Clock,
  CreditCard,
  Camera,
  Loader2,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useRegisterSeller } from "@/hooks/use-queries";
import { StoreCategory } from "@/types/domain";

const CATEGORIES: StoreCategory[] = [
  "Bakery & Pastry",
  "Makanan Berat",
  "Kafe & Minuman",
  "Swalayan & Buah",
];

const DEFAULT_AREAS = [
  "Tuparev, Cirebon",
  "Kesambi, Cirebon",
  "Pekiringan, Cirebon",
  "Karanggetas, Cirebon",
  "Kejaksan, Cirebon",
  "Siliwangi, Cirebon",
  "Kartini, Cirebon",
  "Harjamukti, Cirebon",
  "Kedawung, Cirebon",
];

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

export default function RegisterSellerPage() {
  const router = useRouter();
  const { registerSeller } = useRegisterSeller();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Step 1: Akun Pengelola
  const [ownerName, setOwnerName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  // Step 2: Identitas Toko & Lokasi
  const [storeName, setStoreName] = useState("");
  const [category, setCategory] = useState<StoreCategory>("Bakery & Pastry");
  const [area, setArea] = useState("Tuparev, Cirebon");
  const [address, setAddress] = useState("");
  const [pickupStartTime, setPickupStartTime] = useState("19:00");
  const [pickupEndTime, setPickupEndTime] = useState("21:00");

  // Step 3: Verifikasi Fisik & Rekening
  const [storeFrontImage, setStoreFrontImage] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [bankName, setBankName] = useState("BCA");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountHolder, setAccountHolder] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  // Ambil lokasi unik jika ada dari API
  const [availableAreas, setAvailableAreas] = useState<string[]>(DEFAULT_AREAS);
  useEffect(() => {
    fetch("/api/locations")
      .then((res) => res.json())
      .then((json) => {
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          const list = json.data.filter((item: string) => !item.toLowerCase().includes("semua"));
          if (list.length > 0) {
            setAvailableAreas(Array.from(new Set([...list, ...DEFAULT_AREAS])));
          }
        }
      })
      .catch(() => {});
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, target: "store" | "logo") => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("folder", target === "store" ? "stores" : "kyc");

      const res = await fetch("/api/upload", {
        method: "POST",
        body: fd,
      });

      if (res.ok) {
        const data = await res.json();
        if (data.url) {
          if (target === "store") setStoreFrontImage(data.url);
          else setLogoUrl(data.url);
        }
      }
    } catch {
      // Fallback object URL untuk preview lokal
      const url = URL.createObjectURL(file);
      if (target === "store") setStoreFrontImage(url);
      else setLogoUrl(url);
    } finally {
      setIsUploading(false);
    }
  };

  const handleNextStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ownerName.trim() || !email.trim() || !phone.trim() || !password.trim()) {
      setErrorMsg("Mohon lengkapi seluruh data akun pengelola.");
      return;
    }
    setErrorMsg("");
    setStep(2);
  };

  const handleNextStep2 = (e: React.FormEvent) => {
    e.preventDefault();
    if (!storeName.trim() || !address.trim()) {
      setErrorMsg("Nama gerai dan alamat lengkap wajib diisi.");
      return;
    }
    setErrorMsg("");
    setStep(3);
  };

  const handleSubmitFinal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bankName.trim() || !accountNumber.trim()) {
      setErrorMsg("Informasi rekening bank wajib diisi untuk pencairan saldo penjualan.");
      toast.error("Informasi rekening bank wajib diisi.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg("");

    try {
      await registerSeller({
        ownerName,
        email,
        phone,
        storeName,
        category,
        area,
        address,
        pickupStartTime,
        pickupEndTime,
        bankName,
        accountNumber,
        accountHolder: accountHolder || ownerName,
        storeFrontImage,
        logoUrl,
      });

      setIsSubmitting(false);
      setIsSuccess(true);
      toast.success("Pendaftaran mitra berhasil dikirim!");
    } catch (err: any) {
      setIsSubmitting(false);
      const msg = err?.message || "Gagal mengirimkan formulir pendaftaran.";
      setErrorMsg(msg);
      toast.error(msg);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50/70 dark:bg-zinc-950 flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-xl space-y-4">
        {/* Back Link */}
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="size-3.5" />
          <span>Kembali ke Halaman Masuk</span>
        </Link>

        {/* Brand Header */}
        <div className="text-center space-y-1.5">
          <div className="size-12 rounded-2xl bg-orange-600/10 text-orange-600 flex items-center justify-center mx-auto ring-1 ring-orange-600/20">
            <StoreIcon className="size-6" />
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-foreground tracking-tight">
            Pendaftaran Kemitraan Toko
          </h1>
          <p className="text-xs text-muted-foreground max-w-md mx-auto">
            Bergabunglah dengan ekosistem penyelamatan surplus pangan Cirebon Raya. Ubah potensi surplus menjadi pendapatan tambahan.
          </p>
        </div>

        {/* Success State */}
        {isSuccess ? (
          <Card className="border-border shadow-xs rounded-3xl p-6 sm:p-8 text-center space-y-4">
            <div className="size-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="size-10" />
            </div>
            <div className="space-y-1.5">
              <h2 className="text-lg font-black text-foreground">
                Pendaftaran Berhasil Dikirim!
              </h2>
              <p className="text-xs text-muted-foreground leading-relaxed max-w-sm mx-auto">
                Terima kasih <strong>{ownerName}</strong>. Toko <strong>{storeName}</strong> sedang dalam antrean verifikasi tim Super Admin Rerasa Cirebon (maksimal 1x24 jam kerja).
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-muted/40 border border-border/70 text-left space-y-1.5 text-xs">
              <span className="font-extrabold text-foreground block">
                Apa langkah selanjutnya?
              </span>
              <ul className="list-disc list-inside text-muted-foreground space-y-1 text-[11px]">
                <li>Tim admin memeriksa kesesuaian lokasi fisik gerai Anda.</li>
                <li>Setelah disetujui, Anda dapat langsung login dengan email <strong>{email}</strong>.</li>
                <li>Anda dapat langsung menerbitkan Surprise Bag dan memesan wadah resmi Rescue Box.</li>
              </ul>
            </div>

            <div className="pt-2">
              <Button
                onClick={() => router.push("/login")}
                className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs h-10 shadow-xs"
              >
                Kembali ke Halaman Masuk
              </Button>
            </div>
          </Card>
        ) : (
          <Card className="border-border shadow-xs rounded-3xl overflow-hidden">
            <CardHeader className="pb-3 border-b border-border/60">
              {/* Stepper Progress */}
              <div className="flex items-center justify-between text-xs font-bold text-muted-foreground mb-2">
                <span className={step >= 1 ? "text-orange-600" : ""}>1. Akun Pengelola</span>
                <ChevronRight className="size-3 text-muted-foreground" />
                <span className={step >= 2 ? "text-orange-600" : ""}>2. Identitas Gerai</span>
                <ChevronRight className="size-3 text-muted-foreground" />
                <span className={step >= 3 ? "text-orange-600" : ""}>3. Foto & Pencairan</span>
              </div>
              <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-orange-600 h-full transition-all duration-300"
                  style={{ width: `${(step / 3) * 100}%` }}
                />
              </div>
            </CardHeader>

            <CardContent className="pt-5 space-y-4">
              {errorMsg && (
                <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-800 dark:text-red-300 text-xs font-medium">
                  {errorMsg}
                </div>
              )}

              {/* STEP 1: AKUN PENGELOLA */}
              {step === 1 && (
                <form onSubmit={handleNextStep1} className="space-y-3.5">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-muted-foreground block">
                      Nama Lengkap Pemilik / Penanggung Jawab
                    </label>
                    <Input
                      type="text"
                      placeholder="Contoh: Siti Rahmawati"
                      value={ownerName}
                      onChange={(e) => setOwnerName(e.target.value)}
                      className="text-xs h-9"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-muted-foreground block">
                      Alamat Email Operasional
                    </label>
                    <Input
                      type="email"
                      placeholder="toko@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="text-xs h-9"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-muted-foreground block">
                      Nomor WhatsApp Aktif (Untuk Koordinasi Kasir)
                    </label>
                    <Input
                      type="tel"
                      placeholder="0812xxxxxxxx"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="text-xs h-9"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-muted-foreground block">
                      Kata Sandi Akun
                    </label>
                    <Input
                      type="password"
                      placeholder="Minimal 6 karakter"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="text-xs h-9"
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs h-10 shadow-xs mt-2"
                  >
                    Lanjut ke Data Toko
                  </Button>
                </form>
              )}

              {/* STEP 2: IDENTITAS GERAI & OPERASIONAL */}
              {step === 2 && (
                <form onSubmit={handleNextStep2} className="space-y-3.5">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-muted-foreground block">
                      Nama Gerai / Toko
                    </label>
                    <Input
                      type="text"
                      placeholder="Contoh: Ruby Bakery & Cake"
                      value={storeName}
                      onChange={(e) => setStoreName(e.target.value)}
                      className="text-xs h-9"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-muted-foreground block">
                      Kategori Usaha
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value as StoreCategory)}
                      className="w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    >
                      {CATEGORIES.map((c) => (
                        <option key={c} value={c} className="bg-background text-foreground">
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-muted-foreground block">
                      Kawasan / Wilayah Cirebon
                    </label>
                    <select
                      value={area}
                      onChange={(e) => setArea(e.target.value)}
                      className="w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    >
                      {availableAreas.map((a) => (
                        <option key={a} value={a} className="bg-background text-foreground">
                          {a}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-muted-foreground block">
                      Alamat Lengkap Toko (Untuk Penjemputan Makanan)
                    </label>
                    <Input
                      type="text"
                      placeholder="Contoh: Jl. Tuparev No. 88 (seberang SPBU)"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="text-xs h-9"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-muted-foreground block">
                        Mulai Pickup
                      </label>
                      <Input
                        type="time"
                        value={pickupStartTime}
                        onChange={(e) => setPickupStartTime(e.target.value)}
                        className="text-xs h-9"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-muted-foreground block">
                        Selesai Pickup
                      </label>
                      <Input
                        type="time"
                        value={pickupEndTime}
                        onChange={(e) => setPickupEndTime(e.target.value)}
                        className="text-xs h-9"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setStep(1)}
                      className="w-1/3 text-xs h-10"
                    >
                      Kembali
                    </Button>
                    <Button
                      type="submit"
                      className="w-2/3 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs h-10 shadow-xs"
                    >
                      Lanjut ke Foto & Rekening
                    </Button>
                  </div>
                </form>
              )}

              {/* STEP 3: FOTO GERAI & REKENING PENCAIRAN */}
              {step === 3 && (
                <form onSubmit={handleSubmitFinal} className="space-y-3.5">
                  <div className="p-3 rounded-2xl bg-muted/40 border border-border/70 space-y-2">
                    <span className="text-xs font-black block text-foreground">
                      Pilihan Logo Gerai
                    </span>
                    <span className="text-[10px] text-muted-foreground block">
                      Pilih dari preset logo restoran ZonaLogo atau unggah logo Anda:
                    </span>
                    <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                      {RESTAURANT_CHAIN_LOGOS.map((brand) => (
                        <button
                          key={brand.name}
                          type="button"
                          onClick={() => setLogoUrl(brand.url)}
                          className={`size-10 shrink-0 rounded-xl p-1 border transition-all ${
                            logoUrl === brand.url
                              ? "border-orange-600 bg-orange-50 dark:bg-orange-950/40 ring-2 ring-orange-600/30 scale-105"
                              : "border-border/70 hover:border-orange-600/50 bg-background"
                          }`}
                        >
                          <img src={brand.url} alt={brand.name} className="size-full object-contain" />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Foto Depan Toko / Banner */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-muted-foreground block">
                      Foto Tampak Depan Gerai / Plang Toko (Opsional/Direkomendasikan)
                    </label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileUpload(e, "store")}
                        className="text-xs h-9 file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-xs file:font-bold file:bg-orange-50 file:text-orange-700 dark:file:bg-orange-950 dark:file:text-orange-300"
                      />
                      {isUploading && <Loader2 className="size-4 animate-spin text-orange-600 shrink-0" />}
                    </div>
                    <span className="text-[10px] text-muted-foreground block">
                      Membantu Super Admin memastikan keberadaan fisik gerai Anda tanpa perlu meminta KTP.
                    </span>
                  </div>

                  {/* Rekening Pencairan Dana */}
                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-muted-foreground block">
                        Nama Bank
                      </label>
                      <select
                        value={bankName}
                        onChange={(e) => setBankName(e.target.value)}
                        className="w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                      >
                        <option value="BCA">BCA</option>
                        <option value="Mandiri">Bank Mandiri</option>
                        <option value="BRI">BRI</option>
                        <option value="BNI">BNI</option>
                        <option value="BSI">BSI</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-muted-foreground block">
                        Nomor Rekening
                      </label>
                      <Input
                        type="text"
                        placeholder="134-xxxxxxxx"
                        value={accountNumber}
                        onChange={(e) => setAccountNumber(e.target.value)}
                        className="text-xs h-9"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-muted-foreground block">
                      Nama Pemilik Rekening
                    </label>
                    <Input
                      type="text"
                      placeholder={`Atas nama: ${ownerName || "Nama Pemilik"}`}
                      value={accountHolder}
                      onChange={(e) => setAccountHolder(e.target.value)}
                      className="text-xs h-9"
                    />
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setStep(2)}
                      className="w-1/3 text-xs h-10"
                    >
                      Kembali
                    </Button>
                    <Button
                      type="submit"
                      disabled={isSubmitting || isUploading}
                      className="w-2/3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs h-10 shadow-xs"
                    >
                      {isSubmitting ? "Mengirim Pendaftaran..." : "Kirim Pendaftaran Toko"}
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
