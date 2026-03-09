"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { BranchCard } from "./branch-card";
import type { Branch } from "@/features/branches/types";

interface BranchCarouselProps {
  branches: Branch[];
  onSelectBranch: (branch: Branch) => void;
}

export function BranchCarousel({ branches, onSelectBranch }: BranchCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedBranch, setSelectedBranch] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [itemsPerView, setItemsPerView] = useState(3);

  // Responsive items per view
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) setItemsPerView(1);
      else if (window.innerWidth < 1024) setItemsPerView(2);
      else setItemsPerView(3);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const maxIndex = Math.max(0, branches.length - itemsPerView);

  const nextSlide = () => {
    setCurrentIndex((prev) => Math.min(prev + 1, maxIndex));
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => Math.max(prev - 1, 0));
  };

  const handleSelect = (branch: Branch) => {
    setSelectedBranch(branch.id);
    // Delay navigation untuk animasi
    setTimeout(() => onSelectBranch(branch), 300);
  };

  if (branches.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500">Tidak ada cabang tersedia</p>
      </div>
    );
  }

  return (
    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Section Header */}
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
          Pilih Cabang Anda
        </h2>
        <p className="text-slate-600 max-w-2xl mx-auto">
          Kami memiliki beberapa cabang yang siap melayani kebutuhan rental motor Anda
        </p>
      </div>

      {/* Carousel Container */}
      <div className="relative">
        {/* Navigation Buttons */}
        <button
          onClick={prevSlide}
          disabled={currentIndex === 0}
          className={`
            absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10
            w-12 h-12 rounded-full bg-white shadow-lg
            flex items-center justify-center
            transition-all duration-200
            ${currentIndex === 0 
              ? 'opacity-30 cursor-not-allowed' 
              : 'hover:bg-slate-50 hover:scale-110 active:scale-95'
            }
          `}
        >
          <ChevronLeft className="w-6 h-6 text-slate-700" />
        </button>

        <button
          onClick={nextSlide}
          disabled={currentIndex >= maxIndex}
          className={`
            absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10
            w-12 h-12 rounded-full bg-white shadow-lg
            flex items-center justify-center
            transition-all duration-200
            ${currentIndex >= maxIndex 
              ? 'opacity-30 cursor-not-allowed' 
              : 'hover:bg-slate-50 hover:scale-110 active:scale-95'
            }
          `}
        >
          <ChevronRight className="w-6 h-6 text-slate-700" />
        </button>

        {/* Cards Container */}
        <div className="overflow-hidden py-4">
          <motion.div
            ref={containerRef}
            className="flex gap-6"
            animate={{
              x: `-${currentIndex * (100 / itemsPerView + 2)}%`,
            }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 30,
            }}
            style={{
              width: `${(branches.length / itemsPerView) * 100}%`,
            }}
          >
            {branches.map((branch, index) => (
              <div
                key={branch.id}
                className="flex-shrink-0"
                style={{
                  width: `${100 / branches.length * itemsPerView}%`,
                  padding: '0 0.75rem',
                }}
              >
                <BranchCard
                  branch={branch}
                  onSelect={() => handleSelect(branch)}
                  isActive={selectedBranch === branch.id}
                />
              </div>
            ))}
          </motion.div>
        </div>

        {/* Dots Indicator */}
        <div className="flex justify-center gap-2 mt-8">
          {Array.from({ length: maxIndex + 1 }).map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`
                w-2 h-2 rounded-full transition-all duration-300
                ${currentIndex === index 
                  ? 'w-8 bg-yellow-400' 
                  : 'bg-slate-300 hover:bg-slate-400'
                }
              `}
            />
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
        {[
          { value: "5+", label: "Cabang Aktif" },
          { value: "1000+", label: "Motor Tersedia" },
          { value: "50rb+", label: "Pelanggan Puas" },
          { value: "4.9", label: "Rating Google" },
        ].map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            viewport={{ once: true }}
          >
            <div className="text-3xl md:text-4xl font-black text-slate-900 mb-1">
              {stat.value}
            </div>
            <div className="text-slate-500 text-sm">{stat.label}</div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}