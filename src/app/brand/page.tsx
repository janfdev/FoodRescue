import Link from "next/link";
import { ArrowLeft, Check, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export const metadata = {
  title: "Eksplorasi Konsep Logo - Rerasa Cirebon",
  description: "3 Opsi Logo Vektor Resmi Rerasa dengan Integrasi Simbol Makanan & Keberlanjutan Pangan",
};

export default function BrandLogosPage() {
  const concepts = [
    {
      id: "A",
      name: "The Cloche Monogram (R + Tudung Saji Hangat)",
      type: "Combination Mark (Letterform + Cloche)",
      tag: "Rekomendasi Utama",
      tagColor: "bg-emerald-600",
      svgPath: "/brand/concept-a-cloche-r.svg",
      lockupPath: "/brand/rerasa-lockup-a.svg",
      description:
        "Monogram huruf R yang lengkungan atasnya membentuk tudung saji restoran (cloche) dengan pegangan bulat di puncak, dan kaki R bertransformasi menjadi pucuk daun keberlanjutan.",
      philosophy:
        "Melambangkan makanan berkualitas prima dan higienis yang diselamatkan dari etalase toko untuk dinikmati kembali dalam keadaan hangat.",
      strengths: [
        "Sangat jelas terbaca sebagai huruf 'R' pada resolusi kecil (16px favicon)",
        "Secara instan mengomunikasikan kategori makanan siap santap & restoran",
        "Kombinasi warna Emerald Green & Warm Saffron terasa organik dan terpercaya",
      ],
    },
    {
      id: "B",
      name: "The Nurturing Bowl (Mangkuk Saji & Uap Sirkular R)",
      type: "Pictorial Mark (Bowl + Circular Steam)",
      tag: "Paling Hangat & Tradisional",
      tagColor: "bg-amber-600",
      svgPath: "/brand/concept-b-bowl-leaf.svg",
      description:
        "Mangkuk saji keramik emas yang menampung kepulan uap aroma hidangan berbentuk siluet huruf R dan dihiasi daun rempah hijau di puncaknya.",
      philosophy:
        "Terinspirasi dari tradisi kuliner berkuah dan hangat khas Cirebon (seperti Empal Gentong), melambangkan mangkuk keberkahan pangan yang tidak terbuang sia-sia.",
      strengths: [
        "Memberi kesan hangat, ramah, dan lezat (*comfort food*)",
        "Sangat cocok untuk kampanye sosial anti-food-waste di Cirebon",
        "Siluet mangkuk kokoh dan seimbang di berbagai latar belakang",
      ],
    },
    {
      id: "C",
      name: "The Cutlery Ribbon (Pita Siluet R & Sendok Garpu)",
      type: "Emblem Cutlery Mark (Modern Clean)",
      tag: "Paling Modern & Tech",
      tagColor: "bg-purple-700",
      svgPath: "/brand/concept-c-spoon-fork.svg",
      description:
        "Konstruksi geometris huruf R dengan tiang vertikal kiri beraksen garpu makan (*fork*), ruang negatif lingkaran membentuk sendok (*spoon*), dan pita kaki emas dinamis.",
      philosophy:
        "Menggabungkan elemen peralatan makan esensial ke dalam struktur huruf R sebagai simbol aksi langsung menyelamatkan porsi makanan lezat.",
      strengths: [
        "Identitas berkarakter tegas dan modern ala aplikasi tech-enabled",
        "Detail sendok dan garpu terintegrasi secara cerdas di dalam huruf",
        "Kontras visual tinggi pada dark mode maupun light mode",
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-stone-50/70 dark:bg-zinc-950 text-foreground py-10 px-4">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Back Link */}
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="size-4" />
            <span>Kembali ke Beranda Rerasa</span>
          </Link>
          <Badge variant="outline" className="font-mono text-xs">
            Brand Identity Suite
          </Badge>
        </div>

        {/* Header Title */}
        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-400">
            Eksplorasi Identitas Visual Brand
          </span>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-foreground">
            3 Opsi Logo Resmi Rerasa Cirebon
          </h1>
          <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed">
            Didesain dengan pendekatan vektor geometris murni, menggabungkan monogram huruf <strong>R</strong> dengan elemen kuliner (tudung saji cloche, mangkuk hangat, sendok dan garpu) serta aksen keberlanjutan pangan.
          </p>
        </div>

        {/* 3 Logo Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {concepts.map((c) => (
            <Card key={c.id} className="border-border shadow-sm flex flex-col justify-between overflow-hidden">
              <div className="p-6 bg-slate-950 flex flex-col items-center justify-center border-b border-border/80 relative">
                <Badge className={`absolute top-3 right-3 text-[10px] font-bold text-white ${c.tagColor}`}>
                  {c.tag}
                </Badge>
                <div className="size-36 p-2 flex items-center justify-center">
                  <img src={c.svgPath} alt={c.name} className="w-full h-full object-contain drop-shadow-md" />
                </div>
                <span className="text-xs font-mono text-slate-400 mt-2">
                  Konsep {c.id} • 256x256 SVG
                </span>
              </div>

              <CardHeader className="p-5 pb-3 space-y-1.5">
                <span className="text-[11px] font-mono text-muted-foreground uppercase">
                  {c.type}
                </span>
                <CardTitle className="text-base font-black text-foreground">
                  {c.name}
                </CardTitle>
                <CardDescription className="text-xs leading-relaxed">
                  {c.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="p-5 pt-0 space-y-4 text-xs">
                <div className="p-3 bg-muted/40 rounded-xl space-y-1">
                  <strong className="text-foreground block font-bold text-[11px]">
                    Makna & Filosofi:
                  </strong>
                  <p className="text-muted-foreground text-[11px] leading-relaxed">
                    {c.philosophy}
                  </p>
                </div>

                <div className="space-y-1.5">
                  <strong className="text-foreground block font-bold text-[11px]">
                    Kelebihan Desain:
                  </strong>
                  <ul className="space-y-1 text-[11px] text-muted-foreground">
                    {c.strengths.map((s, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <Check className="size-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Lockup Horizontal Preview */}
        <div className="bg-card border border-border rounded-2xl p-6 space-y-4 shadow-xs">
          <div className="space-y-1">
            <h3 className="font-extrabold text-base text-foreground">
              Pratinjau Lockup Horizontal (Header & Media Sosial)
            </h3>
            <p className="text-xs text-muted-foreground">
              Implementasi kombinasi lambang simbol dan tipografi nama brand untuk header website
            </p>
          </div>

          <div className="p-6 bg-slate-900 rounded-xl flex items-center justify-center border border-slate-800">
            <img
              src="/brand/rerasa-lockup-a.svg"
              alt="Rerasa Logo Lockup"
              className="max-h-24 max-w-full object-contain"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
