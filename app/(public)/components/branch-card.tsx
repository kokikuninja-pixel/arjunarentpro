"use client";

import { motion } from "framer-motion";
import { MapPin, Phone, Clock, ChevronRight } from "lucide-react";
import Image from "next/image";
import type { Branch } from "@/features/branches/types";

interface BranchCardProps {
  branch: Branch;
  onSelect: () => void;
  isActive?: boolean;
}

export function BranchCard({ branch, onSelect, isActive }: BranchCardProps) {
  return (
    <motion.div
      whileHover={{ y: -8, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onSelect}
      className={`
        relative overflow-hidden rounded-3xl cursor-pointer
        transition-all duration-300
        ${isActive 
          ? 'ring-4 ring-yellow-400 shadow-2xl' 
          : 'hover:shadow-xl shadow-lg'
        }
      `}
    >
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" />
      
      {/* Decorative Circle */}
      <div className="absolute -top-20 -right-20 w-40 h-40 bg-yellow-400/20 rounded-full blur-3xl" />
      <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-orange-500/20 rounded-full blur-3xl" />

      <div className="relative p-6 md:p-8">
        {/* Logo / Icon */}
        <div className="flex items-center justify-between mb-6">
          <div className="relative w-16 h-16 md:w-20 md:h-20 bg-white rounded-2xl shadow-lg flex items-center justify-center overflow-hidden">
            {branch.logoUrl ? (
              <Image
                src={branch.logoUrl}
                alt={branch.name}
                fill
                className="object-cover"
              />
            ) : (
              <span className="text-2xl md:text-3xl font-black text-slate-800">
                {branch.code?.toUpperCase() || branch.name?.charAt(0)}
              </span>
            )}
          </div>
          
          {isActive && (
            <span className="px-3 py-1 bg-yellow-400 text-slate-900 text-xs font-bold rounded-full">
              TERPILIH
            </span>
          )}
        </div>

        {/* Content */}
        <h3 className="text-xl md:text-2xl font-bold text-white mb-2">
          {branch.name}
        </h3>
        
        <p className="text-slate-300 text-sm mb-4 line-clamp-2">
          {branch.address || "Alamat belum tersedia"}
        </p>

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {branch.phone && (
            <div className="flex items-center gap-2 text-slate-400 text-xs">
              <Phone className="w-4 h-4" />
              <span className="truncate">{branch.phone}</span>
            </div>
          )}
          {branch.settings?.openingHours && (
            <div className="flex items-center gap-2 text-slate-400 text-xs">
              <Clock className="w-4 h-4" />
              <span>{branch.settings.openingHours.open} - {branch.settings.openingHours.close}</span>
            </div>
          )}
        </div>

        {/* CTA Button */}
        <button className={`
          w-full py-3 px-4 rounded-xl font-semibold text-sm
          flex items-center justify-center gap-2
          transition-all duration-200
          ${isActive 
            ? 'bg-yellow-400 text-slate-900 hover:bg-yellow-300' 
            : 'bg-white/10 text-white hover:bg-white/20 border border-white/20'
          }
        `}>
          Pilih Cabang Ini
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
}
