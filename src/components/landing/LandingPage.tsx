"use client";

import Link from "next/link";
import {
  Leaf,
  Clock,
  Sparkles,
  ShieldCheck,
  ArrowRight,
  Store,
  ChevronRight,
  HelpCircle,
} from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-foreground flex flex-col font-sans">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-background/90 backdrop-blur-md border-b border-border">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="size-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black text-lg shadow-xs">
              S
            </div>
            <div>
              <span className="font-black text-lg tracking-tight text-emerald-800 dark:text-emerald-400">
                SisaRasa
              </span>
              <span className="text-[10px] block font-mono font-bold text-amber-600 dark:text-amber-400 -mt-1">
                CIREBON RAYA
              </span>
            </div>
          </div>

          {/* Quick Nav Links with shadcn Button styling */}
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/seller"
              className={buttonVariants({ variant: "ghost", size: "sm", className: "text-xs font-bold gap-1.5" })}
            >
              <Store className="size-3.5 text-emerald-600" />
              <span>Portal Mitra</span>
            </Link>
            <Link
              href="/admin"
              className={buttonVariants({ variant: "ghost", size: "sm", className: "text-xs font-bold gap-1.5" })}
            >
              <ShieldCheck className="size-3.5 text-purple-600" />
              <span>Super Admin</span>
            </Link>
            <Link
              href="/buyer"
              className={buttonVariants({ size: "sm", className: "bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-xs gap-1.5" })}
            >
              <span>Buka Aplikasi</span>
              <ArrowRight className="size-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-emerald-50/60 via-background to-slate-50 dark:from-emerald-950/20 dark:via-background dark:to-slate-950 py-12 sm:py-20 border-b border-border/60">
        <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 flex flex-col gap-5">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-emerald-100/80 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border-emerald-300/60 dark:border-emerald-800 gap-1.5 py-1 px-3 text-xs font-bold rounded-full">
                <Leaf className="size-3.5 text-emerald-600" />
                <span>Gerakan Penyelamatan Makanan Cirebon</span>
              </Badge>
              <Tooltip>
                <TooltipTrigger className="size-6 inline-flex items-center justify-center rounded-lg hover:bg-muted text-muted-foreground transition-colors">
                  <HelpCircle className="size-3.5" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs">Inisiatif food waste reduction mandiri di Cirebon Raya</p>
                </TooltipContent>
              </Tooltip>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight text-foreground">
              Nikmati Makanan Lezat,{" "}
              <span className="text-emerald-600 dark:text-emerald-400">Hemat s/d 70%</span>,{" "}
              Cegah Makanan Terbuang.
            </h1>

            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-xl">
              Setiap hari bakery, resto, dan kafe favorit di Cirebon memiliki surplus hidangan berkualitas yang belum terjual. Selamatkan paket surprise bag sebelum jam tutup dengan sistem pembayaran rekber terpercaya.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
              <Link
                href="/buyer"
                className={buttonVariants({ size: "lg", className: "bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md gap-2" })}
              >
                <span>Selamatkan Makanan Terdekat</span>
                <ArrowRight className="size-4" />
              </Link>
              <Link
                href="/seller"
                className={buttonVariants({ size: "lg", variant: "outline", className: "font-bold text-sm" })}
              >
                Daftar Sebagai Mitra Toko
              </Link>
            </div>

            {/* Social Impact Numbers using shadcn Card */}
            <div className="grid grid-cols-3 gap-3 pt-4">
              <Card className="border-border shadow-xs">
                <CardHeader className="p-3 pb-1">
                  <CardTitle className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 tabular-nums">
                    185+
                  </CardTitle>
                  <CardDescription className="text-[11px] font-semibold text-muted-foreground">
                    Porsi Terselamatkan
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="border-border shadow-xs">
                <CardHeader className="p-3 pb-1">
                  <CardTitle className="text-xl sm:text-2xl font-black text-amber-500 tabular-nums">
                    6 Mitra
                  </CardTitle>
                  <CardDescription className="text-[11px] font-semibold text-muted-foreground">
                    Kuliner Cirebon
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="border-border shadow-xs">
                <CardHeader className="p-3 pb-1">
                  <CardTitle className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 tabular-nums">
                    96%
                  </CardTitle>
                  <CardDescription className="text-[11px] font-semibold text-muted-foreground">
                    Kepatuhan Box Resmi
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>

          {/* Right Mobile App Preview Showcase */}
          <div className="lg:col-span-5 flex justify-center">
            <Card className="w-full max-w-xs border-4 border-slate-800 dark:border-slate-700 rounded-[36px] shadow-2xl p-3 overflow-hidden bg-background">
              <div className="bg-emerald-600 text-white p-3.5 rounded-2xl flex flex-col gap-1">
                <div className="flex items-center justify-between text-[10px] font-bold opacity-90">
                  <span>SisaRasa Cirebon</span>
                  <Badge variant="secondary" className="bg-white/20 text-white border-0 text-[10px]">
                    LIVE
                  </Badge>
                </div>
                <h4 className="font-extrabold text-sm">Surprise Bag Hari Ini</h4>
                <p className="text-[10px] opacity-90">Ruby Bakery, Kopi Nako, Nasi Jamblang</p>
              </div>

              <div className="p-3 flex flex-col gap-2.5">
                <div className="bg-muted/40 p-2.5 rounded-xl border border-border flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold block text-foreground">
                      Roti Manis & Pastry
                    </span>
                    <span className="text-[10px] text-muted-foreground">Ruby Bakery (Tuparev)</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] line-through text-muted-foreground block">Rp 65.000</span>
                    <span className="text-xs font-extrabold text-emerald-600">Rp 22.000</span>
                  </div>
                </div>

                <div className="bg-muted/40 p-2.5 rounded-xl border border-border flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold block text-foreground">
                      Croissant & Pastry Kafe
                    </span>
                    <span className="text-[10px] text-muted-foreground">Kopi Nako (Kesambi)</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] line-through text-muted-foreground block">Rp 75.000</span>
                    <span className="text-xs font-extrabold text-emerald-600">Rp 25.000</span>
                  </div>
                </div>

                <Link
                  href="/buyer"
                  className={buttonVariants({ className: "w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs mt-1" })}
                >
                  Buka Aplikasi Pembeli
                </Link>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Kategori Bulat Sesuai Panduan Dokumen Desain */}
      <section className="py-12 bg-background border-b border-border">
        <div className="max-w-6xl mx-auto px-4 flex flex-col gap-6">
          <div className="text-center max-w-xl mx-auto flex flex-col gap-1">
            <h2 className="text-xl sm:text-2xl font-black text-foreground tracking-tight">
              Kategori Penyelamatan Makanan
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Pilihan hidangan berkualitas tinggi dari berbagai jenis usaha kuliner Cirebon
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Card className="hover:border-amber-500/50 transition-colors bg-amber-50/40 dark:bg-amber-950/20">
              <Link href="/buyer?category=Bakery%20%26%20Pastry" className="p-5 flex flex-col items-center text-center gap-2 block">
                <div className="size-14 rounded-full bg-amber-500/10 text-amber-600 flex items-center justify-center font-black text-xl">
                  🥐
                </div>
                <h3 className="font-extrabold text-sm text-foreground">
                  Roti & Pastry
                </h3>
                <p className="text-[11px] text-muted-foreground">
                  Sisa batch panggangan harian toko roti ternama
                </p>
              </Link>
            </Card>

            <Card className="hover:border-emerald-500/50 transition-colors bg-emerald-50/40 dark:bg-emerald-950/20">
              <Link href="/buyer?category=Makanan%20Berat" className="p-5 flex flex-col items-center text-center gap-2 block">
                <div className="size-14 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-black text-xl">
                  🍲
                </div>
                <h3 className="font-extrabold text-sm text-foreground">
                  Makanan Berat
                </h3>
                <p className="text-[11px] text-muted-foreground">
                  Nasi jamblang, empal gentong, dan lauk siap saji
                </p>
              </Link>
            </Card>

            <Card className="hover:border-blue-500/50 transition-colors bg-blue-50/40 dark:bg-blue-950/20">
              <Link href="/buyer?category=Kafe%20%26%20Minuman" className="p-5 flex flex-col items-center text-center gap-2 block">
                <div className="size-14 rounded-full bg-blue-500/10 text-blue-600 flex items-center justify-center font-black text-xl">
                  ☕
                </div>
                <h3 className="font-extrabold text-sm text-foreground">
                  Kafe & Minuman
                </h3>
                <p className="text-[11px] text-muted-foreground">
                  Pastry showcase, cake potong, & minuman segar
                </p>
              </Link>
            </Card>

            <Card className="hover:border-orange-500/50 transition-colors bg-orange-50/40 dark:bg-orange-950/20">
              <Link href="/buyer?category=Swalayan%20%26%20Buah" className="p-5 flex flex-col items-center text-center gap-2 block">
                <div className="size-14 rounded-full bg-orange-500/10 text-orange-600 flex items-center justify-center font-black text-xl">
                  🍎
                </div>
                <h3 className="font-extrabold text-sm text-foreground">
                  Bahan Segar & Buah
                </h3>
                <p className="text-[11px] text-muted-foreground">
                  Buah potong matang optimal dan roti gandum
                </p>
              </Link>
            </Card>
          </div>
        </div>
      </section>

      {/* Alur Kerja 3 Langkah menggunakan Card shadcn */}
      <section className="py-12 sm:py-16 bg-slate-50 dark:bg-slate-950 border-b border-border">
        <div className="max-w-6xl mx-auto px-4 flex flex-col gap-10">
          <div className="text-center max-w-xl mx-auto flex flex-col gap-1">
            <h2 className="text-xl sm:text-2xl font-black text-foreground tracking-tight">
              Cara Kerja Sederhana & Aman
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Transaksi dilindungi rekening bersama (Rekber) sampai makanan Anda terima secara fisik
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-border shadow-xs">
              <CardHeader className="p-6 pb-2">
                <div className="size-10 rounded-xl bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 flex items-center justify-center font-black text-sm mb-3">
                  1
                </div>
                <CardTitle className="text-base font-extrabold">
                  Pilih Toko & Surprise Bag
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 pt-0 text-xs text-muted-foreground leading-relaxed">
                Buka daftar mitra Cirebon terdekat. Pilih paket hemat dengan diskon 50-70% dan cek jendela waktu pengambilan.
              </CardContent>
            </Card>

            <Card className="border-border shadow-xs">
              <CardHeader className="p-6 pb-2">
                <div className="size-10 rounded-xl bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 flex items-center justify-center font-black text-sm mb-3">
                  2
                </div>
                <CardTitle className="text-base font-extrabold">
                  Bayar Aman (Escrow Rekber)
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 pt-0 text-xs text-muted-foreground leading-relaxed">
                Bayar instan via QRIS atau E-Wallet. Dana ditahan oleh platform dan baru diteruskan ke toko setelah makanan Anda ambil.
              </CardContent>
            </Card>

            <Card className="border-border shadow-xs">
              <CardHeader className="p-6 pb-2">
                <div className="size-10 rounded-xl bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 flex items-center justify-center font-black text-sm mb-3">
                  3
                </div>
                <CardTitle className="text-base font-extrabold">
                  Ambil di Toko dengan QR/PIN
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 pt-0 text-xs text-muted-foreground leading-relaxed">
                Tunjukkan 4-digit PIN atau QR Code ke kasir mitra saat jam pickup. Makanan diserahkan dalam kemasan higienis resmi Rescue Box.
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto bg-background border-t border-border py-8">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <span className="font-bold text-foreground">SisaRasa Food Rescue</span>
            <Separator orientation="vertical" className="h-3" />
            <span>Inisiatif Nol Makanan Terbuang Cirebon Raya</span>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/buyer" className="hover:text-emerald-600 transition-colors">
              Aplikasi Pembeli
            </Link>
            <Link href="/seller" className="hover:text-emerald-600 transition-colors">
              Portal Mitra Toko
            </Link>
            <Link href="/admin" className="hover:text-emerald-600 transition-colors">
              Super Admin
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
