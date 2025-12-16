'use client';

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Home, ArrowLeft } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import Image from "next/image";

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-6 bg-background">
      <div className="w-full max-w-2xl mx-auto text-center space-y-8">
        {/* Logo - Centered */}
        <div className="flex flex-col items-center gap-3 animate-fade-in-up">
          <div className="relative h-16 w-16 sm:h-20 sm:w-20">
            <Image
              src="/logo.png"
              alt="PT Bintang Indokarya Gemilang"
              fill
              priority
              className="object-contain"
            />
          </div>
          <div className="flex flex-col items-center">
            <span className="text-xs sm:text-sm font-bold text-foreground leading-tight">
              PT BINTANG INDOKARYA GEMILANG
            </span>
          </div>
        </div>

        {/* 404 Number */}
        <div className="animate-scale-in py-6">
          <h2 className="text-8xl sm:text-9xl font-bold text-primary leading-none">
            404
          </h2>
        </div>

        {/* Message */}
        <div className="space-y-3 animate-fade-in-up px-4">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground">
            Halaman Tidak Ditemukan
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground max-w-md mx-auto leading-relaxed">
            Halaman yang Anda cari tidak ditemukan. Mungkin halaman telah dipindahkan atau tidak tersedia.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-6">
          <Button
            onClick={() => router.back()}
            variant="outline"
            size="lg"
            className="w-full sm:w-auto min-w-[140px] group"
          >
            <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            Kembali
          </Button>

          <Link href="/" className="w-full sm:w-auto">
            <Button size="lg" className="w-full min-w-[140px] group">
              <Home className="mr-2 h-4 w-4 group-hover:scale-110 transition-transform" />
              Ke Dashboard
            </Button>
          </Link>
        </div>

        {/* Footer */}
        <div className="pt-12 text-xs sm:text-sm text-muted-foreground">
          <p>© 2025 PT Bintang Indokarya Gemilang</p>
        </div>
      </div>
    </div>
  );
}
