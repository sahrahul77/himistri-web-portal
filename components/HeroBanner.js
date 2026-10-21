import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ShieldCheck, ChevronLeft, ChevronRight, Award } from 'lucide-react';

export default function HeroBanner({ banners }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!banners || banners.length === 0) return;
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [banners]);

  if (!banners || banners.length === 0) {
    return (
      <div className="relative rounded-3xl border border-slate-200 dark:border-neutral-800 shadow-xl h-[320px] sm:h-[420px] flex items-center justify-center bg-slate-100 dark:bg-neutral-900 animate-pulse">
        <span className="text-slate-400 font-bold text-sm">Loading Live Banners...</span>
      </div>
    );
  }

  const slide = banners[index] || banners[0];

  return (
    <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-neutral-800 shadow-2xl h-[320px] sm:h-[420px] md:h-[460px] flex items-center bg-black">
      {/* High-Definition Background Image Slide with Dynamic Soft Gradient */}
      <AnimatePresence mode="wait">
        <motion.div
          key={slide.id}
          initial={{ opacity: 0, scale: 1.04 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.6 }}
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `linear-gradient(to right, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.55) 55%, rgba(0,0,0,0.2) 100%), url('${slide.imageUrl}')` }}
        />
      </AnimatePresence>

      {/* Foreground Banner Content Container */}
      <div className="relative z-10 p-5 sm:p-10 md:p-12 max-w-2xl text-white space-y-3 sm:space-y-4">
        <motion.div
          key={`badge-${slide.id}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="inline-flex items-center gap-2 bg-redPrimary text-white text-[10px] sm:text-xs font-black px-3.5 py-1.5 rounded-full shadow-lg tracking-wider uppercase"
        >
          <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> 100% Safe & Verified
        </motion.div>

        <motion.h1
          key={`title-${slide.id}`}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight text-white drop-shadow-lg uppercase"
        >
          {slide.title}
        </motion.h1>

        <motion.p
          key={`sub-${slide.id}`}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-xs sm:text-base text-slate-200 font-semibold leading-relaxed max-w-xl drop-shadow-sm"
        >
          {slide.subtitle}
        </motion.p>

        <motion.div
          key={`btn-${slide.id}`}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 pt-2"
        >
          <Link href="/services" className="btn-primary py-3 sm:py-3.5 px-6 text-xs sm:text-sm shadow-xl justify-center text-center">
            Book Doorstep Service <ArrowRight className="w-4 h-4 inline ml-1" />
          </Link>
          <Link href="/categories" className="bg-white/15 hover:bg-white/25 text-white backdrop-blur-md px-5 py-3 sm:py-3.5 rounded-xl text-xs sm:text-sm font-extrabold border border-white/25 transition text-center">
            Explore Categories
          </Link>
        </motion.div>
      </div>

      {/* Floating Glassmorphism Stat Badge */}
      <div className="absolute bottom-6 right-6 hidden md:flex items-center gap-3 bg-black/65 backdrop-blur-md border border-white/20 px-4 py-2.5 rounded-2xl shadow-2xl">
        <Award className="w-5 h-5 text-amber-400" />
        <div className="text-xs">
          <span className="block font-black text-white">Top Rated Platform</span>
          <span className="text-[10px] text-slate-300">Gangtok • Sikkim</span>
        </div>
      </div>

      {/* Carousel Navigation Arrows */}
      {banners.length > 1 && (
        <>
          <button
            type="button"
            onClick={() => setIndex((index - 1 + banners.length) % banners.length)}
            className="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-md border border-white/20 shadow-xl transition"
            title="Previous Banner"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <button
            type="button"
            onClick={() => setIndex((index + 1) % banners.length)}
            className="absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-md border border-white/20 shadow-xl transition"
            title="Next Banner"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </>
      )}

      {/* Dots Indicator */}
      {banners.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
          {banners.map((s, i) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setIndex(i)}
              className={`h-2 rounded-full transition-all ${index === i ? 'w-8 bg-redPrimary' : 'w-2.5 bg-white/60 hover:bg-white'}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
