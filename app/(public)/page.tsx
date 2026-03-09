"use client";

import { useRouter } from "next/navigation";
import { useBranches } from "@/features/branches/hooks/use-branches";
import { HeroSection } from "./components/hero-section";
import { BranchCarousel } from "./components/branch-carousel";
import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import type { Branch } from "@/features/branches/types";

export default function LandingPage() {
  const router = useRouter();
  const { data: branches, isLoading } = useBranches({ onlyActive: true });

  const handleSelectBranch = (branch: Branch) => {
    router.push(`/booking-request?branch=${branch.code}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 animate-spin text-yellow-500" />
          <p className="text-slate-500">Memuat cabang...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <HeroSection />
      
      <section className="py-16 md:py-24">
        <BranchCarousel 
          branches={branches || []} 
          onSelectBranch={handleSelectBranch}
        />
      </section>

      {/* Footer CTA */}
      <section className="bg-slate-900 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Siap untuk berpetualang?
          </h2>
          <p className="text-slate-400 mb-8 text-lg">
            Pilih cabang terdekat dan pesan motor impian Anda sekarang
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              const firstBranch = branches?.[0];
              if (firstBranch) handleSelectBranch(firstBranch);
            }}
            className="px-8 py-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-slate-900 font-bold rounded-full text-lg shadow-lg hover:shadow-xl transition-shadow"
          >
            Mulai Booking Sekarang
          </motion.button>
        </div>
      </section>

      {/* Simple Footer */}
      <footer className="bg-slate-950 text-slate-400 py-8 text-center text-sm">
        <p>© 2024 MotoRent. All rights reserved.</p>
      </footer>
    </main>
  );
}