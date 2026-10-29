"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Lock, Mail, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { storeService } from "@/services/storeService";
import { authClient } from "@/lib/auth-client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setErrorMsg("Silakan masukkan alamat email Anda.");
      return;
    }

    setIsLoading(true);
    setErrorMsg("");

    setTimeout(() => {
      try {
        const loggedInUser = storeService.loginWithEmail(email);
        setIsLoading(false);

        // Redirect based on role
        if (loggedInUser.role === "admin" || (loggedInUser.role as string) === "super_admin") {
          router.push("/admin");
        } else if (loggedInUser.role === "seller") {
          router.push("/seller");
        } else {
          router.push("/");
        }
      } catch (err: any) {
        setIsLoading(false);
        setErrorMsg(err?.message || "Gagal masuk ke akun.");
      }
    }, 400);
  };

  const handleQuickAutofill = (seedEmail: string, defaultPass: string) => {
    setEmail(seedEmail);
    setPassword(defaultPass);
    setErrorMsg("");
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setErrorMsg("");
    try {
      // Panggil Better-Auth Google OAuth
      const res = await authClient.signIn.social({
        provider: "google",
        callbackURL: "/",
      });
      if (res?.error) {
        if (res.error.code === "PROVIDER_NOT_FOUND" || res.error.status === 404) {
          setErrorMsg("Google OAuth belum dikonfigurasi di server. Silakan gunakan formulir email & kata sandi di bawah.");
          return;
        }
        setErrorMsg(res.error.message || "Gagal masuk dengan Google");
      }
    } catch (err: unknown) {
      console.warn("Google OAuth backend belum aktif:", err);
      setErrorMsg("Koneksi OAuth tidak tersedia. Silakan gunakan login email & kata sandi.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50/70 dark:bg-zinc-950 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md space-y-4">
        {/* Back Link */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="size-3.5" />
          <span>Kembali ke Beranda</span>
        </Link>

        {/* Brand Header */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-block size-14 rounded-2xl overflow-hidden shadow-sm mx-auto">
            <img
              src="/brand/rerasa-mascot-r.svg"
              alt="Rerasa Logo"
              className="w-full h-full object-cover"
            />
          </Link>
          <h1 className="text-2xl font-black text-foreground tracking-tight">
            Masuk ke Rerasa
          </h1>
          <p className="text-xs text-muted-foreground">
            Platform Penyelamatan Makanan Surplus Cirebon Raya
          </p>
        </div>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <Card className="border-border shadow-md">
          <CardHeader className="p-6 pb-4">
            <CardTitle className="text-base font-extrabold text-foreground">
              Otentikasi Akun
            </CardTitle>
            <CardDescription className="text-xs">
              Gunakan email & kata sandi, atau pilih akun demo untuk masuk instan
            </CardDescription>
          </CardHeader>

          <CardContent className="p-6 pt-0 space-y-4">
            {errorMsg && (
              <div className="p-3 rounded-xl bg-red-100 dark:bg-red-950/60 border border-red-300 dark:border-red-800 text-red-800 dark:text-red-300 text-xs font-semibold">
                {errorMsg}
              </div>
            )}

            {/* Google 1-Click Login */}
            <Button
              type="button"
              variant="outline"
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="w-full h-11 border-border font-bold gap-2.5 text-xs shadow-2xs hover:bg-muted/60"
            >
              <svg className="size-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Lanjutkan dengan Akun Google</span>
            </Button>

            <div className="flex items-center gap-2 my-2">
              <Separator className="flex-1" />
              <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                Atau Email Terdaftar
              </span>
              <Separator className="flex-1" />
            </div>

            {/* Email & Password Form */}
            <form onSubmit={handleLoginSubmit} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-muted-foreground block">
                  Alamat Email
                </label>
                <div className="relative">
                  <Mail className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder="nama@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-9 text-xs"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-muted-foreground block">
                    Kata Sandi
                  </label>
                  <span className="text-[10px] text-muted-foreground">Demo pass: apa saja</span>
                </div>
                <div className="relative">
                  <Lock className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-9 pr-9 text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs h-10 shadow-xs"
              >
                {isLoading ? "Memproses Masuk..." : "Masuk ke Akun"}
              </Button>
            </form>

            <Separator className="my-2" />

            {/* Quick Demo Seed User Autofill Pills */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-foreground block">
                Pilih Akun Demo Instan:
              </span>
              <div className="grid grid-cols-1 gap-1.5">
                {[
                  {
                    name: "Fauzan Rizqi (Pelanggan / Buyer)",
                    email: "fauzan@gmail.com",
                    pass: "buyer123",
                    badge: "Pelanggan",
                    color: "border-emerald-600/40 hover:bg-emerald-50 dark:hover:bg-emerald-950/40",
                  },
                  {
                    name: "Siti Rahmawati (Ruby Bakery Tuparev)",
                    email: "ruby@rerasa.com",
                    pass: "seller123",
                    badge: "Mitra Toko",
                    color: "border-orange-500/40 hover:bg-orange-50 dark:hover:bg-orange-950/40",
                  },
                  {
                    name: "Admin Rerasa (Head of Ops Cirebon)",
                    email: "admin@rerasa.com",
                    pass: "admin123",
                    badge: "Admin",
                    color: "border-purple-600/40 hover:bg-purple-50 dark:hover:bg-purple-950/40",
                  },
                ].map((item) => (
                  <button
                    key={item.email}
                    type="button"
                    onClick={() => handleQuickAutofill(item.email, item.pass)}
                    className={`flex items-center justify-between p-2.5 rounded-xl border text-xs text-left transition-colors ${item.color}`}
                  >
                    <div className="min-w-0 pr-2">
                      <strong className="block text-foreground truncate">{item.name}</strong>
                      <span className="font-mono text-[10px] text-muted-foreground">{item.email}</span>
                    </div>
                    <Badge variant="outline" className="text-[10px] shrink-0 font-bold">
                      {item.badge}
                    </Badge>
                  </button>
                ))}
              </div>
            </div>

            {/* SELLER REGISTRATION BANNER / CALL TO ACTION */}
            <div className="mt-5 p-3.5 rounded-2xl bg-orange-500/10 border border-orange-500/25 flex items-center justify-between gap-3">
              <div className="space-y-0.5 min-w-0">
                <span className="text-xs font-black text-orange-950 dark:text-orange-200 block">
                  Punya Usaha Kuliner di Cirebon?
                </span>
                <span className="text-[11px] text-orange-800/80 dark:text-orange-300/80 block leading-tight">
                  Ubah surplus makanan jadi pendapatan tambahan tanpa risiko.
                </span>
              </div>
              <Link
                href="/register-seller"
                className="shrink-0 px-3 py-1.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-xs transition-colors"
              >
                Daftar Mitra Toko &rarr;
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
