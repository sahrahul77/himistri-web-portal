import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ShieldCheck, ChevronLeft, ChevronRight, Award, Star, Flame, Zap, CheckCircle2 } from 'lucide-react';

export default function HeroBanner({ banners }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!banners || banners.length === 0) return;
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % banners.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [banners]);

  if (!banners || banners.length === 0) return null;

  const slide = banners[index] || banners[0];

  return (
    <div className="relative overflow-hidden rounded-3xl sm:rounded-[2.5rem] border border-slate-200/80 dark:border-neutral-800 shadow-2xl h-[420px] sm:h-[480px] lg:h-[520px] flex items-center bg-black transition-all duration-300 group">

      {/* 1. Ultra-HD Full-Bleed Background Image with Parallax & Gradient Masking */}
      <AnimatePresence mode="wait">
        <motion.div
          key={slide.id}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `linear-gradient(to right, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.55) 50%, rgba(0,0,0,0.15) 100%), linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 60%), url('${slide.imageUrl}')`
          }}
        />
      </AnimatePresence>

      {/* Subtle Ambient Red Glow Ring */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-redPrimary/20 rounded-full blur-3xl pointer-events-none" />

      {/* 2. Floating Frosted Glass Hero Overlay Card (Apple / Airbnb Style) */}
      <div className="relative z-10 p-6 sm:p-10 md:p-12 w-full max-w-2xl text-white">
        <motion.div
          key={`card-${slide.id}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="bg-black/60 dark:bg-black/70 backdrop-blur-2xl border border-white/20 p-6 sm:p-8 rounded-3xl shadow-2xl space-y-3.5 sm:space-y-4"
        >
          {/* Top Status Pill Badge */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 bg-redPrimary text-white text-[10px] sm:text-xs font-black px-3.5 py-1.2 sm:py-1.5 rounded-full shadow-lg tracking-wider uppercase">
              <Flame className="w-3.5 h-3.5 text-amber-300 animate-pulse" /> SIKKIM'S #1 DOORSTEP PLATFORM
            </span>

            <span className="inline-flex items-center gap-1 text-emerald-400 text-[10px] sm:text-xs font-extrabold bg-emerald-500/15 border border-emerald-500/30 px-3 py-1 rounded-full">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> 100% Background Verified
            </span>
          </div>

          {/* Large Headline Title */}
          <h1 className="text-2xl sm:text-4xl lg:text-4xl font-black tracking-tight leading-snug sm:leading-tight text-white drop-shadow-md uppercase">
            {slide.title}
          </h1>

          {/* Subtitle Description */}
          <p className="text-xs sm:text-sm text-slate-200 font-semibold leading-relaxed drop-shadow-sm max-w-lg">
            {slide.subtitle || 'Book background checked electricians, plumbers, carpenters, tutors & technicians across Gangtok.'}
          </p>

          {/* Action CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
            <Link
              href="/services"
              className="btn-primary py-3 sm:py-3.5 px-6 text-xs sm:text-sm shadow-2xl justify-center text-center font-black rounded-2xl cursor-pointer"
            >
              Book Doorstep Service <ArrowRight className="w-4 h-4 inline ml-1" />
            </Link>

            <Link
              href="/categories"
              className="bg-white/15 hover:bg-white/25 text-white backdrop-blur-md px-5 py-3 sm:py-3.5 rounded-2xl text-xs sm:text-sm font-extrabold border border-white/25 transition text-center cursor-pointer"
            >
              Explore Categories
            </Link>
          </div>

          {/* Live Platform Rating Proof */}
          <div className="pt-2 border-t border-white/10 flex items-center gap-3 text-xs text-slate-300 font-bold">
            <div className="flex items-center text-amber-400">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <span><strong className="text-white">4.9/5 Rating</strong> • 1,200+ Bookings in Sikkim</span>
          </div>
        </motion.div>
      </div>

      {/* Floating Top Rated Badge (Desktop Only) */}
      <div className="absolute bottom-8 right-8 hidden md:flex items-center gap-3.5 bg-black/70 backdrop-blur-2xl border border-white/20 px-5 py-3 rounded-2xl shadow-2xl z-10">
        <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400">
          <Award className="w-6 h-6 text-amber-400" />
        </div>
        <div className="text-xs">
          <span className="block font-black text-white text-sm">Top Rated Platform</span>
          <span className="text-[11px] text-emerald-400 font-bold">Gangtok • Sikkim</span>
        </div>
      </div>

      {/* Glassmorphic Slide Navigation Controls (Prev / Next) */}
      {banners.length > 1 && (
        <>
          <button
            type="button"
            onClick={() => setIndex((index - 1 + banners.length) % banners.length)}
            className="absolute left-4 sm:left-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-black/60 hover:bg-redPrimary text-white flex items-center justify-center backdrop-blur-xl border border-white/20 shadow-2xl transition-all scale-95 hover:scale-110 cursor-pointer"
            title="Previous Banner"
          >
            <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>

          <button
            type="button"
            onClick={() => setIndex((index + 1) % banners.length)}
            className="absolute right-4 sm:right-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-black/60 hover:bg-redPrimary text-white flex items-center justify-center backdrop-blur-xl border border-white/20 shadow-2xl transition-all scale-95 hover:scale-110 cursor-pointer"
            title="Next Banner"
          >
            <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </>
      )}

      {/* Animated Active Progress Pill Indicators */}
      {banners.length > 1 && (
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 bg-black/50 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-full">
          {banners.map((s, i) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setIndex(i)}
              className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                index === i ? 'w-10 bg-redPrimary shadow-lg shadow-redPrimary/50' : 'w-2.5 bg-white/40 hover:bg-white'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
