"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Compass,
  ShoppingBag,
  Leaf,
  Clock,
  MapPin,
  Sparkles,
  ShieldCheck,
  Star,
  User,
  ArrowRight,
  Receipt,
  Store,
  ChevronRight,
  LogOut,
  UtensilsCrossed
} from "lucide-react";

export function LandingPage() {
  const [selectedArea, setSelectedArea] = useState("Cirebon Kota");

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="size-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black text-lg shadow-sm">
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

          {/* Quick Nav Links */}
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/seller"
              className="px-3 py-1.5 rounded-lg text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1.5"
            >
              <Store className="size-3.5 text-emerald-600" />
              <span>Portal Mitra</span>
            </Link>
            <Link
              href="/admin"
              className="px-3 py-1.5 rounded-lg text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1.5"
            >
              <ShieldCheck className="size-3.5 text-purple-600" />
              <span>Super Admin</span>
            </Link>
            <Link
              href="/buyer"
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-xs font-extrabold shadow-sm transition-all flex items-center gap-1.5"
            >
              <span>Buka Aplikasi</span>
              <ArrowRight className="size-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-emerald-50/60 via-white to-slate-50 dark:from-emerald-950/20 dark:via-slate-900 dark:to-slate-950 py-12 sm:py-20 border-b border-slate-200/60 dark:border-slate-800/60">
        <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-5">
            <div className="inline-flex items-center gap-2 bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-300/60 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 px-3 py-1 rounded-full text-xs font-bold">
              <Leaf className="size-3.5 text-emerald-600" />
              <span>Gerakan Penyelamatan Makanan Cirebon</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight text-slate-900 dark:text-white">
              Nikmati Makanan Lezat,{" "}
              <span className="text-emerald-600 dark:text-emerald-400">Hemat s/d 70%</span>,{" "}
              Cegah Makanan Terbuang.
            </h1>

            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed max-w-xl">
              Setiap hari bakery, resto, dan kafe favorit di Cirebon memiliki surplus hidangan berkualitas yang belum terjual. Selamatkan paket surprise bag sebelum jam tutup dengan sistem pembayaran rekber terpercaya.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
              <Link
                href="/buyer"
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3.5 rounded-xl font-bold text-sm shadow-md hover:shadow-lg transition-all text-center flex items-center justify-center gap-2"
              >
                <span>Selamatkan Makanan Terdekat</span>
                <ArrowRight className="size-4" />
              </Link>
              <Link
                href="/seller"
                className="bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 px-5 py-3.5 rounded-xl font-bold text-sm transition-all text-center"
              >
                Daftar Sebagai Mitra Toko
              </Link>
            </div>

            {/* Social Impact Numbers */}
            <div className="grid grid-cols-3 gap-3 pt-6 border-t border-slate-200 dark:border-slate-800">
              <div className="p-3 bg-white dark:bg-slate-800/80 rounded-xl border border-slate-200/80 dark:border-slate-700">
                <span className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 block tabular-nums">
                  185+
                </span>
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                  Porsi Terselamatkan
                </span>
              </div>
              <div className="p-3 bg-white dark:bg-slate-800/80 rounded-xl border border-slate-200/80 dark:border-slate-700">
                <span className="text-xl sm:text-2xl font-black text-amber-500 block tabular-nums">
                  6 Mitra
                </span>
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                  Kuliner Aktif Cirebon
                </span>
              </div>
              <div className="p-3 bg-white dark:bg-slate-800/80 rounded-xl border border-slate-200/80 dark:border-slate-700">
                <span className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 block tabular-nums">
                  96%
                </span>
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                  Kepatuhan Box Resmi
                </span>
              </div>
            </div>
          </div>

          {/* Right Mobile App Preview Showcase */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="w-full max-w-xs bg-white dark:bg-slate-900 border-4 border-slate-800 dark:border-slate-700 rounded-[36px] shadow-2xl p-3 overflow-hidden">
              <div className="bg-emerald-600 text-white p-3.5 rounded-2xl space-y-1">
                <div className="flex items-center justify-between text-[10px] font-bold opacity-90">
                  <span>SisaRasa Cirebon</span>
                  <span className="bg-white/20 px-2 py-0.5 rounded-full">LIVE</span>
                </div>
                <h4 className="font-extrabold text-sm">Surprise Bag Hari Ini</h4>
                <p className="text-[10px] opacity-90">Ruby Bakery, Kopi Nako, Nasi Jamblang Mang Dul</p>
              </div>

              <div className="p-3 space-y-2.5">
                <div className="bg-slate-50 dark:bg-slate-800/80 p-2.5 rounded-xl border border-slate-200/70 dark:border-slate-700 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold block text-slate-800 dark:text-slate-200">
                      Roti Manis & Pastry
                    </span>
                    <span className="text-[10px] text-slate-500">Ruby Bakery (Tuparev)</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] line-through text-slate-400 block">Rp 65.000</span>
                    <span className="text-xs font-extrabold text-emerald-600">Rp 22.000</span>
                  </div>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/80 p-2.5 rounded-xl border border-slate-200/70 dark:border-slate-700 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold block text-slate-800 dark:text-slate-200">
                      Croissant & Pastry Kafe
                    </span>
                    <span className="text-[10px] text-slate-500">Kopi Nako (Kesambi)</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] line-through text-slate-400 block">Rp 75.000</span>
                    <span className="text-xs font-extrabold text-emerald-600">Rp 25.000</span>
                  </div>
                </div>

                <Link
                  href="/buyer"
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-xl text-xs font-bold text-center block transition-colors"
                >
                  Buka Aplikasi Pembeli
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Kategori Bulat Sesuai Panduan Dokumen Desain */}
      <section className="py-12 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-6xl mx-auto px-4 space-y-6">
          <div className="text-center max-w-xl mx-auto space-y-1">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Kategori Penyelamatan Makanan
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Pilihan hidangan berkualitas tinggi dari berbagai jenis usaha kuliner Cirebon
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Link
              href="/buyer?category=Bakery%20%26%20Pastry"
              className="p-5 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 text-center hover:scale-[1.02] transition-transform space-y-2 group"
            >
              <div className="size-14 rounded-full bg-amber-500/10 text-amber-600 mx-auto flex items-center justify-center font-black text-xl group-hover:bg-amber-500 group-hover:text-white transition-colors">
                🥐
              </div>
              <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-200">
                Roti & Pastry
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Sisa batch panggangan harian toko roti ternama
              </p>
            </Link>

            <Link
              href="/buyer?category=Makanan%20Berat"
              className="p-5 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-900/40 text-center hover:scale-[1.02] transition-transform space-y-2 group"
            >
              <div className="size-14 rounded-full bg-emerald-500/10 text-emerald-600 mx-auto flex items-center justify-center font-black text-xl group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                🍲
              </div>
              <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-200">
                Makanan Berat
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Nasi jamblang, empal gentong, dan lauk siap saji
              </p>
            </Link>

            <Link
              href="/buyer?category=Kafe%20%26%20Minuman"
              className="p-5 rounded-2xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200/60 dark:border-blue-900/40 text-center hover:scale-[1.02] transition-transform space-y-2 group"
            >
              <div className="size-14 rounded-full bg-blue-500/10 text-blue-600 mx-auto flex items-center justify-center font-black text-xl group-hover:bg-blue-600 group-hover:text-white transition-colors">
                ☕
              </div>
              <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-200">
                Kafe & Minuman
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Pastry showcase, cake potong, & minuman segar
              </p>
            </Link>

            <Link
              href="/buyer?category=Swalayan%20%26%20Buah"
              className="p-5 rounded-2xl bg-orange-50/60 dark:bg-orange-950/20 border border-orange-200/60 dark:border-orange-900/40 text-center hover:scale-[1.02] transition-transform space-y-2 group"
            >
              <div className="size-14 rounded-full bg-orange-500/10 text-orange-600 mx-auto flex items-center justify-center font-black text-xl group-hover:bg-orange-600 group-hover:text-white transition-colors">
                🍎
              </div>
              <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-200">
                Bahan Segar & Buah
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Buah potong matang optimal dan roti gandum
              </p>
            </Link>
          </div>
        </div>
      </section>

      {/* Alur Kerja 3 Langkah */}
      <section className="py-12 sm:py-16 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-6xl mx-auto px-4 space-y-10">
          <div className="text-center max-w-xl mx-auto space-y-1">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Cara Kerja Sederhana & Aman
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Transaksi dilindungi rekening bersama (Rekber) sampai makanan Anda terima secara fisik
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="size-10 rounded-xl bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 flex items-center justify-center font-black text-sm">
                1
              </div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                Pilih Toko & Surprise Bag
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Buka daftar mitra Cirebon terdekat. Pilih paket hemat dengan diskon 50-70% dan cek jendela waktu pengambilan.
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="size-10 rounded-xl bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 flex items-center justify-center font-black text-sm">
                2
              </div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                Bayar Aman (Escrow Rekber)
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Bayar instan via QRIS atau E-Wallet. Dana ditahan oleh platform dan baru diteruskan ke toko setelah makanan Anda ambil.
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="size-10 rounded-xl bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 flex items-center justify-center font-black text-sm">
                3
              </div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                Ambil di Toko dengan QR/PIN
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Tunjukkan 4-digit PIN atau QR Code ke kasir mitra saat jam pickup. Makanan diserahkan dalam kemasan higienis resmi Rescue Box.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-8">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-700 dark:text-slate-300">SisaRasa Food Rescue</span>
            <span>•</span>
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
