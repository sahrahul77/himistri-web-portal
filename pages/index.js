import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/router';
import Header from '../components/Header';
import Footer from '../components/Footer';
import HeroBanner from '../components/HeroBanner';
import TestimonialsSection from '../components/TestimonialsSection';
import CheckoutModal from '../components/CheckoutModal';
import { DEFAULT_CATEGORIES, DEFAULT_SERVICES, DEFAULT_BANNERS, DEFAULT_COUPONS, FALLBACK_ICON } from '../lib/defaultData';
import { ref, onValue, remove } from 'firebase/database';
import { rtdb } from '../lib/firebase';
import { useAuth } from '../lib/AuthContext';
import {
  Search, ShieldCheck, Star, ArrowRight, Clock, CheckCircle2, Award, Phone, Info, Handshake, DollarSign,
  Sparkles, Zap, Flame, Tag, BadgePercent, Check, ExternalLink, TrendingUp, Heart, UserCheck, Timer, Gift, Layers
} from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  const [isDark, setIsDark] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeChip, setActiveChip] = useState('ALL');
  const [checkoutService, setCheckoutService] = useState(null);

  // Live Ticker State
  const [tickerIndex, setTickerIndex] = useState(0);

  // Live Firebase States
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [services, setServices] = useState(DEFAULT_SERVICES);
  const [banners, setBanners] = useState(DEFAULT_BANNERS);
  const [coupons, setCoupons] = useState(DEFAULT_COUPONS);

  const { currentUser, isAuthLoaded } = useAuth();

  // Ticker items inspired by Swiggy / Zomato live booking notifications
  const tickerEvents = [
    "⚡ Passang Bhutia booked Full House Wiring in Deorali • 2 mins ago",
    "🎉 SIKKIM10 applied: Saved ₹200 on Door Lock Repair • 5 mins ago",
    "🟢 Mistri Dhiraj Jaiswal dispatched to Upper Syari • 8 mins ago",
    "⭐ Piku Shah completed Deep Cleaning service in Gangtok (5.0★)"
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setTickerIndex((prev) => (prev + 1) % tickerEvents.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  // Automatic Theme Synchronization Effect
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.setAttribute('data-theme', 'light');
    }
  }, [isDark]);

  const toggleTheme = () => {
    setIsDark(prev => !prev);
  };

  // Strictly purge any category from Firebase Database where "manpower" is NOT written in the category name
  useEffect(() => {
    const categoriesRef = ref(rtdb, 'categories');
    onValue(categoriesRef, (snapshot) => {
      if (snapshot.exists()) {
        snapshot.forEach((child) => {
          const cat = child.val();
          const catName = (cat?.name || '').trim();
          if (!catName.toLowerCase().includes('manpower')) {
            remove(ref(rtdb, `categories/${child.key}`));
          }
        });
      }
    }, { onlyOnce: true });
  }, []);

  // Fetch Live Categories from Firebase (Only keep Manpower categories)
  useEffect(() => {
    const unsubCat = onValue(ref(rtdb, 'categories'), (snapshot) => {
      const list = [];
      if (snapshot.exists()) {
        const val = snapshot.val();
        if (typeof val === 'object' && val !== null) {
          Object.keys(val).forEach((k) => {
            if (val[k] && (val[k].name || '').toLowerCase().includes('manpower')) {
              list.push({ id: k, ...val[k] });
            }
          });
        }
      }
      if (list.length > 0) {
        setCategories(list);
      } else {
        setCategories(DEFAULT_CATEGORIES);
      }
    });

    const unsubSrv = onValue(ref(rtdb, 'services'), (snapshot) => {
      const list = [];
      if (snapshot.exists()) {
        const val = snapshot.val();
        if (typeof val === 'object' && val !== null) {
          Object.keys(val).forEach((k) => list.push({ id: k, ...val[k] }));
        }
      }
      if (list.length > 0) setServices(list);
    });

    const unsubBanners = onValue(ref(rtdb, 'banners'), (snapshot) => {
      const list = [];
      if (snapshot.exists()) {
        const val = snapshot.val();
        if (typeof val === 'object' && val !== null) {
          Object.keys(val).forEach((k) => list.push({ id: k, ...val[k] }));
        }
      }
      if (list.length > 0) setBanners(list);
    });

    const unsubCoupons = onValue(ref(rtdb, 'coupons'), (snapshot) => {
      const list = [];
      if (snapshot.exists()) {
        const val = snapshot.val();
        if (typeof val === 'object' && val !== null) {
          Object.keys(val).forEach((k) => list.push({ id: k, ...val[k] }));
        }
      }
      if (list.length > 0) setCoupons(list);
    });

    return () => { unsubCat(); unsubSrv(); unsubBanners(); unsubCoupons(); };
  }, []);

  const handleHireNow = (serviceObj) => {
    if (!isAuthLoaded) return;
    localStorage.setItem('himistri_checkout_service', JSON.stringify(serviceObj));
    if (!currentUser) {
      router.push('/auth?redirect=checkout');
    } else {
      router.push('/checkout');
    }
  };

  // Smart Real-time Filter
  const filteredServices = services.filter((s) => {
    const q = searchQuery.toLowerCase().trim();
    const chip = activeChip.toLowerCase().trim();

    const matchesSearch = !q ||
      (s.title || '').toLowerCase().includes(q) ||
      (s.categoryName || '').toLowerCase().includes(q) ||
      (s.shortDescription || '').toLowerCase().includes(q);

    const matchesChip = chip === 'all' ||
      (s.categoryName || '').toLowerCase().includes(chip) ||
      (s.title || '').toLowerCase().includes(chip) ||
      chip.includes((s.categoryName || '').toLowerCase());

    return matchesSearch && matchesChip;
  });

  const displayCategories = categories;
  const popularServices = filteredServices.slice(0, 12);

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-[#0F0F0F] text-slate-900 dark:text-white transition-colors duration-200">
      <Header isDark={isDark} onToggleTheme={toggleTheme} currentUser={currentUser} />

      {/* SWIGGY / ZOMATO STYLE LIVE TICKER STRIP */}
      <div className="bg-gradient-to-r from-redPrimary via-orangeSecondary to-redDark text-white py-2 px-4 text-xs font-black shadow-md overflow-hidden">
        <div className="web-container flex items-center justify-between">
          <AnimatePresence mode="wait">
            <motion.div
              key={tickerIndex}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
              className="flex items-center gap-2 truncate"
            >
              <Sparkles className="w-4 h-4 text-amber-300 shrink-0 animate-pulse" />
              <span className="truncate">{tickerEvents[tickerIndex]}</span>
            </motion.div>
          </AnimatePresence>

          <Link href="/services" className="hidden md:flex items-center gap-1 text-[11px] font-black uppercase text-amber-200 hover:underline shrink-0">
            Book Now <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

      <main className="web-container py-6 sm:py-10 flex-1 space-y-10 sm:space-y-14 max-w-7xl mx-auto px-4 sm:px-6 w-full">

        {/* 1. APPLE STYLE GLASSMORPHISM HERO SEARCH BAR */}
        <div className="relative max-w-3xl mx-auto w-full group">
          <div className="absolute -inset-1 bg-gradient-to-r from-redPrimary via-orangeSecondary to-amber-500 rounded-3xl blur-md opacity-30 group-hover:opacity-70 transition duration-300" />
          <div className="relative flex items-center bg-white dark:bg-[#1A1A1A] border border-slate-200 dark:border-[#333333] rounded-2xl shadow-2xl p-2 sm:p-2.5">
            <Search className="w-5 h-5 sm:w-6 sm:h-6 ml-3 text-redPrimary shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search doorstep services (e.g. Plumber, Electrician, Tutor, Barber)..."
              className="w-full px-3 py-2.5 sm:py-3 bg-transparent text-xs sm:text-sm font-bold text-slate-900 dark:text-white outline-none placeholder:text-slate-400"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-neutral-800 text-slate-500 text-xs font-bold hover:text-redPrimary transition"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* 2. SWIGGY / ZOMATO STYLE CIRCULAR CATEGORY AVATAR BAR */}
        <div className="space-y-3">
          <div className="flex justify-between items-center px-1">
            <span className="text-xs font-black uppercase text-redPrimary tracking-widest flex items-center gap-1">
              <Flame className="w-4 h-4 text-redPrimary" /> Explore Categories
            </span>
            <Link href="/categories" className="text-xs font-extrabold text-redPrimary hover:underline">
              See All ({categories.length}) →
            </Link>
          </div>

          <div className="flex gap-4 sm:gap-6 overflow-x-auto pb-3 pt-1 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-none">
            {categories.map((c) => {
              const isSelected = activeChip.toLowerCase() === c.name.toLowerCase();
              return (
                <div
                  key={c.id}
                  onClick={() => setActiveChip(isSelected ? 'ALL' : c.name)}
                  className="flex flex-col items-center gap-2 cursor-pointer group shrink-0 w-20 sm:w-24 text-center"
                >
                  <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full p-1 transition-all duration-300 shadow-xl flex items-center justify-center ${
                    isSelected
                      ? 'bg-gradient-to-r from-redPrimary to-orangeSecondary scale-110 shadow-redPrimary/40'
                      : 'bg-white dark:bg-[#1A1A1A] border border-slate-200 dark:border-[#333333] group-hover:border-redPrimary group-hover:scale-105'
                  }`}>
                    <div className="w-full h-full rounded-full bg-slate-50 dark:bg-neutral-900 p-3 flex items-center justify-center">
                      <img
                        src={c.iconUrl || FALLBACK_ICON}
                        alt={c.name}
                        onError={(e) => { e.target.onerror = null; e.target.src = FALLBACK_ICON; }}
                        className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300"
                      />
                    </div>
                  </div>
                  <span className={`text-[11px] sm:text-xs font-extrabold leading-tight transition line-clamp-2 ${
                    isSelected ? 'text-redPrimary font-black' : 'text-slate-800 dark:text-slate-200 group-hover:text-redPrimary'
                  }`}>
                    {c.name.replace(' Manpower', '')}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* 3. APPLE STYLE HERO BANNER CAROUSEL */}
        <HeroBanner banners={banners} />

        {/* 4. FLIPKART / AMAZON STYLE PROMO COUPON CARDS */}
        {coupons.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {coupons.slice(0, 3).map((coup) => (
              <div
                key={coup.id}
                className="web-card p-4 sm:p-5 bg-gradient-to-r from-redPrimary/10 via-amber-500/10 to-transparent border border-redPrimary/30 rounded-2xl flex items-center justify-between shadow-lg relative overflow-hidden group hover:border-redPrimary transition"
              >
                <div className="space-y-1 z-10">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-redPrimary text-white shadow-sm inline-block">
                    {coup.discountType === 'PERCENTAGE' ? `${coup.discountValue}% OFF` : `Flat ₹${coup.discountValue} OFF`}
                  </span>
                  <h4 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-wider">{coup.code}</h4>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 font-medium line-clamp-1">{coup.description || 'Doorstep discount offer'}</p>
                </div>

                <div className="p-3 rounded-2xl bg-redPrimary/20 text-redPrimary shrink-0 z-10 group-hover:scale-110 transition-transform">
                  <Tag className="w-6 h-6 text-redPrimary" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 5. POPULAR SERVICES GRID SHOWCASE (SWIGGY + APPLE STYLE) */}
        <div className="space-y-6">
          <div className="flex justify-between items-end border-b border-slate-200 dark:border-neutral-800 pb-3">
            <div>
              <span className="text-[10px] font-black uppercase text-redPrimary tracking-widest block">Top Requested</span>
              <h2 className="text-xl sm:text-3xl font-black text-slate-900 dark:text-white mt-0.5">
                {activeChip === 'ALL' ? 'Most Booked Services in Sikkim' : `${activeChip} Services in Gangtok`}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">High-demand technical solutions delivered by local craftsmen</p>
            </div>
            <Link href="/services" className="btn-primary text-xs py-2 px-4 shadow-md shrink-0 rounded-xl">
              View Catalog <ArrowRight className="w-3.5 h-3.5 inline ml-1" />
            </Link>
          </div>

          {popularServices.length === 0 ? (
            <div className="web-card text-center py-16 text-slate-500 space-y-3 bg-white dark:bg-[#1A1A1A] border border-slate-200 dark:border-[#333333] rounded-2xl shadow-lg">
              <p className="font-bold text-sm text-slate-700 dark:text-slate-300">No services found matching "{activeChip}".</p>
              <button onClick={() => setActiveChip('ALL')} className="btn-primary text-xs py-2.5 px-5 rounded-xl cursor-pointer">
                Reset Filter
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
              {popularServices.map((s) => {
                const rating = parseFloat(s.ratingAverage || 5.0).toFixed(1);
                const discountPercent = s.originalPrice && s.discountedPrice
                  ? Math.round(((s.originalPrice - s.discountedPrice) / s.originalPrice) * 100)
                  : 10;

                return (
                  <motion.div
                    key={s.id}
                    whileHover={{ y: -6 }}
                    transition={{ duration: 0.2 }}
                    className="web-card flex flex-col justify-between shadow-2xl relative bg-white dark:bg-[#1A1A1A] border border-slate-200 dark:border-[#333333] p-0 rounded-3xl overflow-hidden group hover:border-redPrimary/60"
                  >
                    <div>
                      {/* Image Box with Subtle Zoom Effect */}
                      <div className="relative w-full h-52 sm:h-60 overflow-hidden bg-slate-100 dark:bg-neutral-800">
                        <img
                          src={s.imageUrl || FALLBACK_ICON}
                          alt={s.title}
                          onError={(e) => { e.target.onerror = null; e.target.src = FALLBACK_ICON; }}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />

                        {/* Discount Badge on Top Left */}
                        <div className="absolute top-3 left-3 bg-redPrimary text-white text-[10px] font-black px-2.5 py-1 rounded-lg shadow-lg uppercase tracking-wider z-10">
                          {discountPercent}% OFF
                        </div>

                        {/* Verified Pill Badge on Top Right */}
                        <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md text-white text-[10px] font-extrabold px-2.5 py-1 rounded-lg border border-white/20 z-10 flex items-center gap-1">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Verified
                        </div>
                      </div>

                      {/* Content Details */}
                      <div className="p-4 sm:p-5 space-y-1.5">
                        <span className="text-[11px] font-black text-redPrimary uppercase tracking-wider block">{s.categoryName || 'General'}</span>

                        <div className="flex justify-between items-start gap-2">
                          <h3 className="font-black text-base sm:text-lg text-slate-900 dark:text-white leading-snug group-hover:text-redPrimary transition">
                            {s.title}
                          </h3>

                          <div className="flex items-center gap-1 text-amber-500 dark:text-amber-400 text-xs font-black shrink-0 bg-amber-500/10 px-2 py-1 rounded-md border border-amber-500/20">
                            <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" /> {rating}
                          </div>
                        </div>

                        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                          {s.shortDescription || 'Doorstep expert technical service delivered by local craftsmen in Gangtok.'}
                        </p>
                      </div>
                    </div>

                    <div className="px-4 sm:px-5 pb-4 sm:pb-5 pt-3 border-t border-slate-100 dark:border-neutral-800 flex items-center justify-between bg-slate-50/50 dark:bg-black/20">
                      <div>
                        <span className="text-xl sm:text-2xl font-black text-redPrimary">₹{s.discountedPrice || 800}</span>
                        <span className="text-xs text-slate-400 line-through ml-2">₹{s.originalPrice || 1000}</span>
                      </div>
                      <button onClick={() => handleHireNow(s)} className="btn-primary py-2 sm:py-2.5 px-4 sm:px-5 text-xs sm:text-sm cursor-pointer shadow-md rounded-xl">
                        Hire Now <ArrowRight className="w-4 h-4 inline ml-1" />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* 6. APPLE STYLE "THE HIMISTRI ADVANTAGE" FEATURE GRID */}
        <div className="space-y-6 pt-4">
          <div className="border-b border-slate-200 dark:border-neutral-800 pb-3">
            <span className="text-[10px] font-black uppercase text-redPrimary tracking-widest block">Sikkim Quality Standard</span>
            <h2 className="text-xl sm:text-3xl font-black text-slate-900 dark:text-white mt-0.5">The HiMistri Advantage</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Sikkim's premier doorstep technical manpower platform</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">

            <div className="web-card flex items-start gap-4 bg-white dark:bg-[#1A1A1A] border border-slate-200 dark:border-[#333333] p-5 rounded-2xl shadow-xl hover:border-redPrimary/50 transition">
              <div className="p-3.5 rounded-2xl bg-redPrimary/10 text-redPrimary shrink-0">
                <ShieldCheck className="w-6 h-6 text-redPrimary" />
              </div>
              <div>
                <h4 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">100% Verified</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">Background checked mistris & local artisans in Sikkim.</p>
              </div>
            </div>

            <div className="web-card flex items-start gap-4 bg-white dark:bg-[#1A1A1A] border border-slate-200 dark:border-[#333333] p-5 rounded-2xl shadow-xl hover:border-redPrimary/50 transition">
              <div className="p-3.5 rounded-2xl bg-emerald-500/10 text-emerald-500 shrink-0">
                <DollarSign className="w-6 h-6 text-emerald-500" />
              </div>
              <div>
                <h4 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">Fixed Rates</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">Transparent upfront rate cards with zero hidden charges.</p>
              </div>
            </div>

            <div className="web-card flex items-start gap-4 bg-white dark:bg-[#1A1A1A] border border-slate-200 dark:border-[#333333] p-5 rounded-2xl shadow-xl hover:border-redPrimary/50 transition">
              <div className="p-3.5 rounded-2xl bg-blue-500/10 text-blue-500 shrink-0">
                <Clock className="w-6 h-6 text-blue-500" />
              </div>
              <div>
                <h4 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">On-Time Arrival</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">Fast doorstep dispatch at your scheduled date & time slot.</p>
              </div>
            </div>

            <div className="web-card flex items-start gap-4 bg-white dark:bg-[#1A1A1A] border border-slate-200 dark:border-[#333333] p-5 rounded-2xl shadow-xl hover:border-redPrimary/50 transition">
              <div className="p-3.5 rounded-2xl bg-amber-500/10 text-amber-500 shrink-0">
                <CheckCircle2 className="w-6 h-6 text-amber-500" />
              </div>
              <div>
                <h4 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">30-Day Guarantee</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">Free re-visit work guarantee for complete peace of mind.</p>
              </div>
            </div>

          </div>
        </div>

        {/* 7. SERVICE PARTNER FLEET BANNER */}
        <div className="web-card bg-gradient-to-r from-redPrimary/20 via-slate-100 dark:via-neutral-900 to-transparent border border-redPrimary/30 p-6 sm:p-8 rounded-3xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-5 shadow-2xl">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-redPrimary text-white flex items-center justify-center shrink-0 shadow-lg">
              <Handshake className="w-7 h-7 text-white" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">50+ Verified Local Craftsmen in Sikkim</h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">Join as a Service Partner or hire skilled plumbers, electricians, tutors, and technicians.</p>
            </div>
          </div>

          <Link href="/partner" className="btn-primary text-xs py-3.5 px-6 rounded-xl shadow-lg shrink-0 font-black">
            Join as Service Partner
          </Link>
        </div>

        {/* 8. CUSTOMER TESTIMONIALS & VERIFIED REVIEWS SECTION */}
        <TestimonialsSection />

        {/* 9. ZOMATO / SWIGGY STYLE 24x7 EMERGENCY HOTLINE CARD */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="md:col-span-2 web-card bg-white dark:bg-[#1A1A1A] border border-slate-200 dark:border-[#333333] p-6 rounded-2xl space-y-3 shadow-xl">
            <div className="flex items-center gap-2.5 text-redPrimary">
              <Info className="w-5 h-5 text-redPrimary" />
              <h3 className="text-lg font-black text-slate-900 dark:text-white">About HiMistri Sikkim</h3>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
              HiMistri is a Gangtok-based start-up company established in 2022 that provides different kinds of doorstep services across Sikkim. Our primary mission is to empower local craftsmen while connecting residents with background-verified technical manpower at minimum cost and maximum reliability.
            </p>
          </div>

          <div className="web-card bg-gradient-to-br from-redPrimary via-redDark to-black text-white p-6 rounded-2xl space-y-4 shadow-2xl flex flex-col justify-between">
            <div className="space-y-2">
              <div className="p-3 rounded-2xl bg-white/20 text-white w-fit">
                <Phone className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-black text-white">24x7 Support Helpline</h3>
              <p className="text-xs text-white/80 leading-relaxed font-medium">Have questions or need emergency doorstep booking assistance in Gangtok?</p>
            </div>

            <a
              href="tel:+917430887960"
              className="bg-white text-redPrimary hover:bg-slate-100 py-3.5 px-4 rounded-xl text-xs font-black text-center shadow-lg transition flex items-center justify-center gap-2"
            >
              <Phone className="w-4 h-4 text-redPrimary" /> Call +91 7430887960
            </a>
          </div>
        </div>

      </main>

      <CheckoutModal isOpen={!!checkoutService} onClose={() => setCheckoutService(null)} service={checkoutService} currentUser={currentUser} />
      <Footer />
    </div>
  );
}
