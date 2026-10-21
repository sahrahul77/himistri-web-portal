import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useRouter } from 'next/router';
import Header from '../components/Header';
import Footer from '../components/Footer';
import HeroBanner from '../components/HeroBanner';
import TestimonialsSection from '../components/TestimonialsSection';
import CheckoutModal from '../components/CheckoutModal';
import { DEFAULT_CATEGORIES, DEFAULT_SERVICES, DEFAULT_BANNERS, FALLBACK_ICON } from '../lib/defaultData';
import { ref, onValue } from 'firebase/database';
import { rtdb } from '../lib/firebase';
import { useAuth } from '../lib/AuthContext';
import { Search, ShieldCheck, Star, ArrowRight, Clock, CheckCircle2, Award, Phone, Info, Handshake, DollarSign } from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  const [isDark, setIsDark] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeChip, setActiveChip] = useState('ALL');
  const [checkoutService, setCheckoutService] = useState(null);

  // Live Firebase States
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [services, setServices] = useState(DEFAULT_SERVICES);
  const [banners, setBanners] = useState(DEFAULT_BANNERS);

  const { currentUser, isAuthLoaded } = useAuth();

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

  useEffect(() => {
    const unsubCat = onValue(ref(rtdb, 'categories'), (snapshot) => {
      const list = [];
      if (snapshot.exists()) {
        const val = snapshot.val();
        if (typeof val === 'object' && val !== null) {
          Object.keys(val).forEach((k) => list.push({ id: k, ...val[k] }));
        }
      }
      if (list.length > 0) setCategories(list);
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

    return () => { unsubCat(); unsubSrv(); unsubBanners(); };
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

  const displayCategories = categories.slice(0, 6);
  const popularServices = filteredServices.slice(0, 10);

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-[#0F0F0F] text-slate-900 dark:text-white transition-colors duration-200">
      <Header isDark={isDark} onToggleTheme={toggleTheme} currentUser={currentUser} />

      <main className="web-container py-6 sm:py-8 flex-1 space-y-8 sm:space-y-12 max-w-7xl mx-auto px-4 sm:px-6 w-full">

        {/* 1. Search Bar */}
        <div className="relative max-w-3xl mx-auto w-full">
          <Search className="w-4 h-4 sm:w-5 sm:h-5 absolute left-3.5 sm:left-4 top-3.5 sm:top-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search services (e.g. Plumber, Electrician, Tutor)..."
            className="w-full pl-10 sm:pl-12 pr-4 py-3 sm:py-3.5 rounded-2xl border border-slate-200 dark:border-neutral-800 bg-white dark:bg-darkSurface text-xs sm:text-sm font-medium focus:outline-none focus:border-redPrimary shadow-lg text-slate-900 dark:text-white"
          />
        </div>

        {/* 2. Interactive Quick Filter Chips Row */}
        <div className="flex gap-2 overflow-x-auto pb-2 justify-start sm:justify-center -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveChip('ALL')}
            className={`px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs font-extrabold whitespace-nowrap border transition-all cursor-pointer shrink-0 ${
              activeChip === 'ALL'
                ? 'bg-redPrimary text-white border-redPrimary shadow-lg scale-105'
                : 'bg-white dark:bg-neutral-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-transparent hover:border-redPrimary'
            }`}
          >
            ⚡ All Services
          </button>

          {categories.map((c) => {
            const isSelected = activeChip.toLowerCase() === c.name.toLowerCase();
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => setActiveChip(isSelected ? 'ALL' : c.name)}
                className={`px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs font-extrabold whitespace-nowrap border transition-all cursor-pointer shrink-0 ${
                  isSelected
                    ? 'bg-redPrimary text-white border-redPrimary shadow-lg scale-105'
                    : 'bg-white dark:bg-neutral-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-transparent hover:border-redPrimary'
                }`}
              >
                ⚡ {c.name}
              </button>
            );
          })}
        </div>

        {/* 3. Hero Banner Carousel */}
        <HeroBanner banners={banners} />

        {/* 4. Explore Categories Grid */}
        {displayCategories.length > 0 && (
          <div>
            <div className="flex justify-between items-baseline mb-4 sm:mb-6">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">Explore Categories</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">10+ Technical & Household Categories in Gangtok</p>
              </div>
              <Link href="/categories" className="text-xs font-bold text-redPrimary hover:underline bg-redPrimary/10 px-3 sm:px-3.5 py-1.5 rounded-full shrink-0">
                See All ({categories.length})
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
              {displayCategories.map((c) => (
                <Link href={`/categories?id=${c.id}`} key={c.id}>
                  <motion.div
                    whileHover={{ y: -4, scale: 1.02 }}
                    className="web-card text-center p-4 sm:p-5 cursor-pointer shadow-md flex flex-col justify-center items-center h-full bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-2xl"
                  >
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-redPrimary/10 flex items-center justify-center mb-2.5 sm:mb-3 shrink-0">
                      <img
                        src={c.iconUrl || FALLBACK_ICON}
                        alt={c.name}
                        onError={(e) => { e.target.onerror = null; e.target.src = FALLBACK_ICON; }}
                        className="w-7 h-7 sm:w-8 sm:h-8 object-contain"
                      />
                    </div>
                    <strong className="text-xs font-bold block text-slate-900 dark:text-white leading-tight">{c.name}</strong>
                  </motion.div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* 5. Popular Services in Gangtok */}
        <div>
          <div className="flex justify-between items-baseline mb-4 sm:mb-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                {activeChip === 'ALL' ? 'Popular Services in Gangtok' : `${activeChip} Services in Gangtok`}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Top rated doorstep solutions requested by Sikkim residents</p>
            </div>
            <Link href="/services" className="text-xs font-bold text-redPrimary hover:underline bg-redPrimary/10 px-3 sm:px-3.5 py-1.5 rounded-full shrink-0">
              View Catalog
            </Link>
          </div>

          {popularServices.length === 0 ? (
            <div className="web-card text-center py-12 text-slate-500 space-y-2 bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800">
              <p className="font-bold text-sm">No services found matching "{activeChip}".</p>
              <button onClick={() => setActiveChip('ALL')} className="btn-primary text-xs py-2 px-4 mt-2">
                Reset Filter
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {popularServices.map((s) => {
                const rating = parseFloat(s.ratingAverage || 4.9).toFixed(1);
                const discountPercent = s.originalPrice && s.discountedPrice
                  ? Math.round(((s.originalPrice - s.discountedPrice) / s.originalPrice) * 100)
                  : 10;

                return (
                  <motion.div
                    key={s.id}
                    whileHover={{ y: -4 }}
                    className="web-card flex flex-col justify-between shadow-xl relative bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 p-4 sm:p-5 rounded-2xl"
                  >
                    <div>
                      <div className="relative">
                        <img
                          src={s.imageUrl || FALLBACK_ICON}
                          alt={s.title}
                          onError={(e) => { e.target.onerror = null; e.target.src = FALLBACK_ICON; }}
                          className="w-full h-40 sm:h-48 object-cover rounded-xl mb-3 sm:mb-4 bg-slate-100 dark:bg-neutral-800"
                        />

                        <div className="absolute top-3 left-3 bg-redPrimary text-white text-[10px] font-black px-2.5 py-1 rounded-md shadow-md uppercase tracking-wider">
                          {discountPercent}% OFF
                        </div>

                        <div className="absolute top-3 right-3 bg-black/85 text-amber-400 text-xs font-bold px-2.5 py-1 rounded-lg flex items-center gap-1 backdrop-blur-md border border-white/10 shadow-md">
                          <Star className="w-3.5 h-3.5 fill-amber-400" /> {rating}
                        </div>
                      </div>

                      <span className="text-[11px] font-black text-redPrimary uppercase tracking-wider">{s.categoryName || 'General'}</span>
                      <h3 className="font-extrabold text-base sm:text-lg mt-0.5 text-slate-900 dark:text-white">{s.title}</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-1">{s.shortDescription || 'Doorstep expert technical service in Gangtok'}</p>
                    </div>

                    <div className="mt-4 sm:mt-5 pt-3 sm:pt-4 border-t border-slate-100 dark:border-neutral-800 flex items-center justify-between">
                      <div>
                        <span className="text-xl sm:text-2xl font-black text-redPrimary">₹{s.discountedPrice || 800}</span>
                        <span className="text-xs text-slate-400 line-through ml-2">₹{s.originalPrice || 1000}</span>
                      </div>
                      <button onClick={() => handleHireNow(s)} className="btn-primary py-2 sm:py-2.5 px-4 sm:px-5 text-xs sm:text-sm">
                        Hire Now
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* 6. Why Choose HiMistri? */}
        <div>
          <div className="mb-4 sm:mb-6">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">Why Choose HiMistri?</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Sikkim's premier doorstep technical manpower platform</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="web-card flex items-start gap-3.5 sm:gap-4 bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 p-4 sm:p-5 rounded-2xl shadow-md">
              <div className="p-3 rounded-xl bg-redPrimary/10 text-redPrimary shrink-0">
                <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div>
                <h4 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">100% Verified</h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">Background checked mistris & technicians in Sikkim</p>
              </div>
            </div>

            <div className="web-card flex items-start gap-3.5 sm:gap-4 bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 p-4 sm:p-5 rounded-2xl shadow-md">
              <div className="p-3 rounded-xl bg-redPrimary/10 text-redPrimary shrink-0">
                <DollarSign className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div>
                <h4 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">Affordable Rates</h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">Transparent upfront pricing with zero hidden fees</p>
              </div>
            </div>

            <div className="web-card flex items-start gap-3.5 sm:gap-4 bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 p-4 sm:p-5 rounded-2xl shadow-md">
              <div className="p-3 rounded-xl bg-redPrimary/10 text-redPrimary shrink-0">
                <Clock className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div>
                <h4 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">On-Time Service</h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">Doorstep arrival at your scheduled date & slot</p>
              </div>
            </div>

            <div className="web-card flex items-start gap-3.5 sm:gap-4 bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 p-4 sm:p-5 rounded-2xl shadow-md">
              <div className="p-3 rounded-xl bg-redPrimary/10 text-redPrimary shrink-0">
                <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div>
                <h4 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">30-Day Guarantee</h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">Service re-visit guarantee for total peace of mind</p>
              </div>
            </div>
          </div>
        </div>

        {/* 7. 50+ Verified Service Partners Banner Card */}
        <div className="web-card bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 p-5 sm:p-6 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-5 shadow-xl">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-redPrimary text-white flex items-center justify-center shrink-0 shadow-lg">
            <Handshake className="w-6 h-6 sm:w-7 sm:h-7" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white">50+ Verified Service Partners</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Skilled plumbers, electricians, tutors, drivers & craftsmen across Sikkim.</p>
          </div>
        </div>

        {/* 8. About HiMistri Card */}
        <div className="web-card bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 p-5 sm:p-6 rounded-2xl space-y-3 shadow-xl">
          <div className="flex items-center gap-2.5 text-redPrimary">
            <Info className="w-5 h-5" />
            <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white">About HiMistri</h3>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            HiMistri is a Gangtok – based start-up company established in 2022 that provides different kinds of services in several categories to customers in and around Sikkim. Our main aim is to provide all basic needs required by an individual in different prospects of life in one single frame, providing technical manpower at minimum cost and maximum benefits.
          </p>
        </div>

        {/* 9. 24x7 Support Hotline Card */}
        <div className="web-card bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 p-5 sm:p-6 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-xl">
          <div className="flex items-center gap-4">
            <div className="p-3.5 rounded-2xl bg-redPrimary/10 text-redPrimary shrink-0">
              <Phone className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-extrabold text-base text-redPrimary">24x7 Support Hotline</h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 font-bold mt-0.5">+91 7430887960</p>
            </div>
          </div>

          <a href="tel:+917430887960" className="btn-primary py-3 px-8 text-xs sm:text-sm shadow-lg w-full sm:w-auto text-center justify-center">
            Call Now
          </a>
        </div>

        {/* 10. Customer Testimonials & FAQs Section */}
        <TestimonialsSection />
      </main>

      <CheckoutModal isOpen={!!checkoutService} onClose={() => setCheckoutService(null)} service={checkoutService} currentUser={currentUser} />
      <Footer />
    </div>
  );
}
