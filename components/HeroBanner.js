import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function HeroBanner({ banners }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!banners || banners.length === 0) return;
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [banners]);

  if (!banners || banners.length === 0) return null;

  const slide = banners[index] || banners[0];

  return (
    <div className="relative w-full overflow-hidden rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-neutral-800 shadow-2xl aspect-[16/8] sm:aspect-[16/6] lg:aspect-[21/8] bg-black group">

      {/* 100% Native Ultra-HD Sharp Crisp Image Container */}
      <AnimatePresence mode="wait">
        <motion.div
          key={slide.id}
          initial={{ opacity: 0, scale: 1.01 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.99 }}
          transition={{ duration: 0.35, ease: "easeInOut" }}
          className="absolute inset-0 w-full h-full flex items-center justify-center bg-black"
        >
          <img
            src={slide.imageUrl}
            alt={slide.title || "HiMistri Banner"}
            className="w-full h-full object-cover object-center rounded-2xl sm:rounded-3xl"
            style={{
              imageRendering: '-webkit-optimize-contrast',
              WebkitBackfaceVisibility: 'hidden',
              transform: 'translateZ(0)'
            }}
          />
        </motion.div>
      </AnimatePresence>

      {/* Minimal Subtle Edge Gradient Mask for Navigation Indicator Visibility */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none rounded-2xl sm:rounded-3xl" />

      {/* Sleek Floating Glassmorphic Navigation Controls */}
      {banners.length > 1 && (
        <>
          <button
            type="button"
            onClick={() => setIndex((index - 1 + banners.length) % banners.length)}
            className="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-black/60 hover:bg-redPrimary text-white flex items-center justify-center backdrop-blur-md border border-white/20 shadow-2xl transition-all scale-95 hover:scale-110 cursor-pointer"
            title="Previous Banner"
          >
            <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>

          <button
            type="button"
            onClick={() => setIndex((index + 1) % banners.length)}
            className="absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-black/60 hover:bg-redPrimary text-white flex items-center justify-center backdrop-blur-md border border-white/20 shadow-2xl transition-all scale-95 hover:scale-110 cursor-pointer"
            title="Next Banner"
          >
            <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </>
      )}

      {/* Minimalist Active Progress Dots Indicator */}
      {banners.length > 1 && (
        <div className="absolute bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 bg-black/60 backdrop-blur-md border border-white/20 px-3 py-1.5 rounded-full shadow-lg">
          {banners.map((s, i) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setIndex(i)}
              className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                index === i ? 'w-8 bg-redPrimary shadow-md' : 'w-2.5 bg-white/50 hover:bg-white'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
