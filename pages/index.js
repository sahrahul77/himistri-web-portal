import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useRouter } from 'next/router';
import Header from '../components/Header';
import Footer from '../components/Footer';
import HeroBanner from '../components/HeroBanner';
import TestimonialsSection from '../components/TestimonialsSection';
import CheckoutModal from '../components/CheckoutModal';
import { FALLBACK_ICON } from '../lib/defaultData';
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

  // Live Firebase Realtime Database Data (Pure Database - Zero Mock Data)
  const [categories, setCategories] = useState([]);
  const [services, setServices] = useState([]);
  const [banners, setBanners] = useState([]);

  const { currentUser, isAuthLoaded } = useAuth();

  const toggleTheme = () => {
    setIsDark(!isDark);
    if (!isDark) {
      document.documentElement.classList.add('dark');
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.setAttribute('data-theme', 'light');
    }
  };

  useEffect(() => {
    const unsubCat = onValue(ref(rtdb, 'categories'), (snapshot) => {
      const list = [];
      if (snapshot.exists()) snapshot.forEach((child) => list.push({ id: child.key, ...child.val() }));
      setCategories(list);
    });

    const unsubSrv = onValue(ref(rtdb, 'services'), (snapshot) => {
      const list = [];
      if (snapshot.exists()) snapshot.forEach((child) => list.push({ id: child.key, ...child.val() }));
      setServices(list);
    });

    const unsubBanners = onValue(ref(rtdb, 'banners'), (snapshot) => {
      const list = [];
      if (snapshot.exists()) snapshot.forEach((child) => list.push({ id: child.key, ...child.val() }));
      setBanners(list);
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

  const filteredServices = services.filter((s) => {
    const matchesSearch =
      (s.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.categoryName || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesChip = activeChip === 'ALL' || (s.categoryName || '').toLowerCase().includes(activeChip.toLowerCase());
    return matchesSearch && matchesChip;
  });

  // Display max 6 categories and top 10 popular services on Home directly from Firebase
  const displayCategories = categories.slice(0, 6);
  const popularServices = filteredServices.slice(0, 10);

  return (
    <div className="flex flex-col min-h-screen">
      <Header isDark={isDark} onToggleTheme={toggleTheme} currentUser={currentUser} />

      <main className="web-container py-8 flex-1 space-y-12">

        {/* 1. Search Bar */}
        <div className="relative max-w-3xl mx-auto">
          <Search className="w-5 h-5 absolute left-4 top-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search services (e.g. Plumber, Electrician, Tutor)..."
            className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-slate-200 dark:border-neutral-800 bg-white dark:bg-darkSurface text-sm font-medium focus:outline-none focus:border-redPrimary shadow-lg"
          />
        </div>

        {/* 2. Quick Filter Chips Row */}
        <div className="flex gap-2.5 overflow-x-auto pb-2 justify-start sm:justify-center">
          <button
            onClick={() => setActiveChip('ALL')}
            className={`px-4 py-2 rounded-full text-xs font-extrabold whitespace-nowrap border transition-all ${
              activeChip === 'ALL'
                ? 'bg-white dark:bg-darkSurface text-slate-900 dark:text-white border-slate-300 dark:border-neutral-700 shadow-md scale-105'
                : 'bg-slate-100 dark:bg-neutral-800 text-slate-600 dark:text-slate-300 border-transparent hover:border-redPrimary'
            }`}
          >
            ⚡ All Services
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setActiveChip(c.name)}
              className={`px-4 py-2 rounded-full text-xs font-extrabold whitespace-nowrap border transition-all ${
                activeChip === c.name
                  ? 'bg-white dark:bg-darkSurface text-slate-900 dark:text-white border-slate-300 dark:border-neutral-700 shadow-md scale-105'
                  : 'bg-slate-100 dark:bg-neutral-800 text-slate-600 dark:text-slate-300 border-transparent hover:border-redPrimary'
              }`}
            >
              ⚡ {c.name}
            </button>
          ))}
        </div>

        {/* 3. Hero Banner Carousel */}
        <HeroBanner banners={banners} />

        {/* 4. Explore Categories Grid (Max 6 Categories from Firebase) */}
        {displayCategories.length > 0 && (
          <div>
            <div className="flex justify-between items-baseline mb-6">
              <div>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white">Explore Categories</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Technical & Household Categories in Gangtok</p>
              </div>
              <Link href="/categories" className="text-xs font-bold text-redPrimary hover:underline bg-redPrimary/10 px-3.5 py-1.5 rounded-full">
                See All ({categories.length})
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
              {displayCategories.map((c) => (
                <Link href={`/categories?id=${c.id}`} key={c.id}>
                  <motion.div
                    whileHover={{ y: -4, scale: 1.02 }}
                    className="web-card text-center p-5 cursor-pointer shadow-md flex flex-col justify-center items-center h-full"
                  >
                    <div className="w-14 h-14 rounded-full bg-redPrimary/10 flex items-center justify-center mb-3">
                      <img
                        src={c.iconUrl || FALLBACK_ICON}
                        alt={c.name}
                        onError={(e) => { e.target.onerror = null; e.target.src = FALLBACK_ICON; }}
                        className="w-8 h-8 object-contain"
                      />
                    </div>
                    <strong className="text-xs font-bold block text-slate-900 dark:text-white leading-tight">{c.name}</strong>
                  </motion.div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* 5. Popular Services in Gangtok (Max 10 Services from Firebase) */}
        {popularServices.length > 0 && (
          <div>
            <div className="flex justify-between items-baseline mb-6">
              <div>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white">Popular Services in Gangtok</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Top rated doorstep solutions requested by Sikkim residents</p>
              </div>
              <Link href="/services" className="text-xs font-bold text-redPrimary hover:underline bg-redPrimary/10 px-3.5 py-1.5 rounded-full">
                View Catalog
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {popularServices.map((s) => {
                const rating = parseFloat(s.ratingAverage || 4.9).toFixed(1);
                const discountPercent = s.originalPrice && s.discountedPrice
                  ? Math.round(((s.originalPrice - s.discountedPrice) / s.originalPrice) * 100)
                  : 10;

                return (
                  <motion.div
                    key={s.id}
                    whileHover={{ y: -4 }}
                    className="web-card flex flex-col justify-between shadow-xl relative"
                  >
                    <div>
                      <div className="relative">
                        <img
                          src={s.imageUrl || FALLBACK_ICON}
                          alt={s.title}
                          onError={(e) => { e.target.onerror = null; e.target.src = FALLBACK_ICON; }}
                          className="w-full h-48 object-cover rounded-xl mb-4 bg-slate-100 dark:bg-neutral-800"
                        />

                        {/* Discount Badge on Top Left */}
                        <div className="absolute top-3 left-3 bg-redPrimary text-white text-[10px] font-black px-2.5 py-1 rounded-md shadow-md uppercase tracking-wider">
                          {discountPercent}% OFF
                        </div>

                        {/* Rating Badge on Top Right */}
                        <div className="absolute top-3 right-3 bg-black/85 text-amber-400 text-xs font-bold px-2.5 py-1 rounded-lg flex items-center gap-1 backdrop-blur-md border border-white/10 shadow-md">
                          <Star className="w-3.5 h-3.5 fill-amber-400" /> {rating}
                        </div>
                      </div>

                      <span className="text-[11px] font-black text-redPrimary uppercase tracking-wider">{s.categoryName || 'General'}</span>
                      <h3 className="font-extrabold text-lg mt-0.5 text-slate-900 dark:text-white">{s.title}</h3>
                      <p className="text-xs text-slate-500 line-clamp-2 mt-1">{s.shortDescription || 'Doorstep expert technical service in Gangtok'}</p>
                    </div>

                    <div className="mt-5 pt-4 border-t border-slate-100 dark:border-neutral-800 flex items-center justify-between">
                      <div>
                        <span className="text-2xl font-black text-redPrimary">₹{s.discountedPrice || 800}</span>
                        <span className="text-xs text-slate-400 line-through ml-2">₹{s.originalPrice || 1000}</span>
                      </div>
                      <button onClick={() => handleHireNow(s)} className="btn-primary py-2.5 px-5">
                        Hire Now
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

        {/* 6. Why Choose HiMistri? (2x2 Grid) */}
        <div>
          <div className="mb-6">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white">Why Choose HiMistri?</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Sikkim's premier doorstep technical manpower platform</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="web-card flex items-start gap-4">
              <div className="p-3 rounded-xl bg-redPrimary/10 text-redPrimary shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-base text-slate-900 dark:text-white">100% Verified</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Background checked mistris & technicians in Sikkim</p>
              </div>
            </div>

            <div className="web-card flex items-start gap-4">
              <div className="p-3 rounded-xl bg-redPrimary/10 text-redPrimary shrink-0">
                <DollarSign className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-base text-slate-900 dark:text-white">Affordable Rates</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Transparent upfront pricing with zero hidden fees</p>
              </div>
            </div>

            <div className="web-card flex items-start gap-4">
              <div className="p-3 rounded-xl bg-redPrimary/10 text-redPrimary shrink-0">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-base text-slate-900 dark:text-white">On-Time Service</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Doorstep arrival at your scheduled date & slot</p>
              </div>
            </div>

            <div className="web-card flex items-start gap-4">
              <div className="p-3 rounded-xl bg-redPrimary/10 text-redPrimary shrink-0">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-base text-slate-900 dark:text-white">30-Day Guarantee</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Service re-visit guarantee for total peace of mind</p>
              </div>
            </div>
          </div>
        </div>

        {/* 7. 50+ Verified Service Partners Banner Card */}
        <div className="web-card bg-[#1E1E1E] border border-neutral-800 p-6 rounded-2xl flex items-center gap-5 shadow-xl">
          <div className="w-14 h-14 rounded-full bg-redPrimary text-white flex items-center justify-center shrink-0 shadow-lg">
            <Handshake className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-lg font-extrabold text-white">50+ Verified Service Partners</h3>
            <p className="text-xs text-slate-400 mt-1">Skilled plumbers, electricians, tutors, drivers & craftsmen across Sikkim.</p>
          </div>
        </div>

        {/* 8. About HiMistri Card */}
        <div className="web-card bg-[#1E1E1E] border border-neutral-800 p-6 rounded-2xl space-y-3 shadow-xl">
          <div className="flex items-center gap-2.5 text-redPrimary">
            <Info className="w-5 h-5" />
            <h3 className="text-lg font-extrabold text-white">About HiMistri</h3>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            HiMistri is a Gangtok – based start-up company established in 2022 that provides different kinds of services in several categories to customers in and around Sikkim. Our main aim is to provide all basic needs required by an individual in different prospects of life in one single frame, providing technical manpower at minimum cost and maximum benefits.
          </p>
        </div>

        {/* 9. 24x7 Support Hotline Card */}
        <div className="web-card bg-[#1E1E1E] border border-neutral-800 p-6 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-xl">
          <div className="flex items-center gap-4">
            <div className="p-3.5 rounded-2xl bg-redPrimary/20 text-redPrimary">
              <Phone className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-extrabold text-base text-redPrimary">24x7 Support Hotline</h4>
              <p className="text-xs text-slate-400 font-bold mt-0.5">+91 7430887960</p>
            </div>
          </div>

          <a href="tel:+917430887960" className="btn-primary py-3 px-8 text-sm shadow-lg w-full sm:w-auto">
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
