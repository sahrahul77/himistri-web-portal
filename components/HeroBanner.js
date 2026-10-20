import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ShieldCheck, ChevronLeft, ChevronRight, Star, Award } from 'lucide-react';

const HERO_SLIDES = [
  {
    id: 1,
    badge: '100% Safe & Verified (24x7)',
    title: 'LOOKING FOR A RELIABLE SERVICE?',
    subtitle: 'Doorstep Plumbing, Electrical, Cleaning, Salon & Tutor services across Gangtok, Sikkim.',
    bgImage: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=1600&q=80',
    stat: '10,000+ Sikkim Customers'
  },
  {
    id: 2,
    badge: 'Sikkim’s #1 Doorstep Platform',
    title: 'VERIFIED TECHNICAL MANPOWER',
    subtitle: 'Background checked mistris & craftsmen at guaranteed upfront rates with zero hidden fees.',
    bgImage: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1600&q=80',
    stat: '50+ Verified Partners Online'
  },
  {
    id: 3,
    badge: 'Risk Free Service Guarantee',
    title: 'FAST 30-MINUTE ARRIVAL',
    subtitle: 'Experienced local technicians en route to your doorstep in Upper Syari, Deorali & Singtam.',
    bgImage: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=1600&q=80',
    stat: '4.9 ★ Rating Average'
  }
];

export default function HeroBanner() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const slide = HERO_SLIDES[index];

  return (
    <div className="relative overflow-hidden rounded-3xl border border-slate-200 dark:border-neutral-800 shadow-2xl min-h-[380px] sm:min-h-[440px] flex items-center">
      {/* Background Image Slide with Fade */}
      <AnimatePresence mode="wait">
        <motion.div
          key={slide.id}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.7 }}
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `linear-gradient(to right, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.55) 60%, rgba(0,0,0,0.3) 100%), url('${slide.bgImage}')` }}
        />
      </AnimatePresence>

      {/* Content Container */}
      <div className="relative z-10 p-6 sm:p-12 max-w-2xl text-white space-y-4">
        <motion.div
          key={`badge-${slide.id}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="inline-flex items-center gap-2 bg-redPrimary/90 backdrop-blur-md text-white text-xs font-black px-3.5 py-1.5 rounded-full shadow-lg"
        >
          <ShieldCheck className="w-4 h-4" /> {slide.badge}
        </motion.div>

        <motion.h1
          key={`title-${slide.id}`}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-3xl sm:text-5xl font-black tracking-tight leading-tight text-white drop-shadow-md"
        >
          {slide.title}
        </motion.h1>

        <motion.p
          key={`sub-${slide.id}`}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-sm sm:text-base text-slate-200 font-medium leading-relaxed max-w-xl"
        >
          {slide.subtitle}
        </motion.p>

        <motion.div
          key={`btn-${slide.id}`}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-wrap items-center gap-3 pt-2"
        >
          <Link href="/services" className="btn-primary py-3.5 px-6 text-sm shadow-xl hover:scale-105 transition-transform">
            Book Doorstep Service <ArrowRight className="w-4 h-4" />
          </Link>
          <Link href="/categories" className="bg-white/15 hover:bg-white/25 text-white backdrop-blur-md px-5 py-3.5 rounded-xl text-sm font-extrabold border border-white/20 transition">
            Explore Categories
          </Link>
        </motion.div>
      </div>

      {/* Floating Glassmorphism Stat Pill */}
      <div className="absolute bottom-6 right-6 hidden md:flex items-center gap-3 bg-black/60 backdrop-blur-md border border-white/20 px-4 py-2.5 rounded-2xl shadow-xl">
        <Award className="w-5 h-5 text-amber-400" />
        <div className="text-xs">
          <span className="block font-black text-white">{slide.stat}</span>
          <span className="text-[10px] text-slate-300">Gangtok • Sikkim</span>
        </div>
      </div>

      {/* Carousel Navigation Arrows */}
      <button
        onClick={() => setIndex((index - 1 + HERO_SLIDES.length) % HERO_SLIDES.length)}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-sm border border-white/10 transition"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      <button
        onClick={() => setIndex((index + 1) % HERO_SLIDES.length)}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-sm border border-white/10 transition"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Dots Indicator */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
        {HERO_SLIDES.map((s, i) => (
          <button
            key={s.id}
            onClick={() => setIndex(i)}
            className={`h-2 rounded-full transition-all ${index === i ? 'w-8 bg-redPrimary' : 'w-2 bg-white/50'}`}
          />
        ))}
      </div>
    </div>
  );
}
