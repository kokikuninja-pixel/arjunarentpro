"use client";

import { motion } from "framer-motion";
import { MapPin, Clock, Shield } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white py-16 md:py-24">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Logo Icon */}
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white/10 rounded-3xl mb-8 backdrop-blur-sm border border-white/20">
            <span className="text-4xl font-black bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
              M
            </span>
          </div>

          <h1 className="text-4xl md:text-6xl font-black mb-6 tracking-tight">
            Sewa Motor
            <span className="block bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 bg-clip-text text-transparent">
              Terpercaya
            </span>
          </h1>

          <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto mb-8">
            Pilih cabang terdekat dan mulai petualangan Anda dengan motor berkualitas
          </p>

          {/* Features */}
          <div className="flex flex-wrap justify-center gap-6 md:gap-12 text-sm md:text-base">
            <div className="flex items-center gap-2 text-slate-300">
              <MapPin className="w-5 h-5 text-yellow-400" />
              <span>5 Cabang Tersedia</span>
            </div>
            <div className="flex items-center gap-2 text-slate-300">
              <Clock className="w-5 h-5 text-yellow-400" />
              <span>24/7 Support</span>
            </div>
            <div className="flex items-center gap-2 text-slate-300">
              <Shield className="w-5 h-5 text-yellow-400" />
              <span>Asuransi Termasuk</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Wave Divider */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="#F8FAFC"/>
        </svg>
      </div>
    </section>
  );
}