import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import Header from '../components/Header';
import Footer from '../components/Footer';
import HeroBanner from '../components/HeroBanner';
import TestimonialsSection from '../components/TestimonialsSection';
import CheckoutModal from '../components/CheckoutModal';
import { DEFAULT_CATEGORIES, DEFAULT_SERVICES } from '../lib/defaultData';
import { ref, onValue } from 'firebase/database';
import { rtdb } from '../lib/firebase';
import { useAuth } from '../lib/AuthContext';
import { Search, ShieldCheck, Star, ArrowRight, Clock, CheckCircle2, Award, Zap } from 'lucide-react';

export default function HomePage() {
  const [isDark, setIsDark] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeChip, setActiveChip] = useState('ALL');
  const [checkoutService, setCheckoutService] = useState(null);

  // Live Firebase Realtime Database Data
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [services, setServices] = useState(DEFAULT_SERVICES);

  const { currentUser } = useAuth();

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.setAttribute('data-theme', !isDark ? 'dark' : 'light');
  };

  useEffect(() => {
    const unsubCat = onValue(ref(rtdb, 'categories'), (snapshot) => {
      const list = [];
      if (snapshot.exists()) {
        snapshot.forEach((child) => {
          list.push({ id: child.key, ...child.val() });
        });
      }
      setCategories(list.length > 0 ? list : DEFAULT_CATEGORIES);
    });

    const unsubSrv = onValue(ref(rtdb, 'services'), (snapshot) => {
      const list = [];
      if (snapshot.exists()) {
        snapshot.forEach((child) => {
          list.push({ id: child.key, ...child.val() });
        });
      }
      setServices(list.length > 0 ? list : DEFAULT_SERVICES);
    });

    return () => {
      unsubCat();
      unsubSrv();
    };
  }, []);

  const filteredServices = services.filter((s) => {
    const matchesSearch =
      (s.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.categoryName || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesChip = activeChip === 'ALL' || (s.categoryName || '').toLowerCase().includes(activeChip.toLowerCase());
    return matchesSearch && matchesChip;
  });

  return (
    <div className="flex flex-col min-h-screen">
      <Header isDark={isDark} onToggleTheme={toggleTheme} currentUser={currentUser} />

      <main className="web-container py-8 flex-1 space-y-12">
        {/* Dynamic Animated Hero Banner */}
        <HeroBanner />

        {/* Live Search Bar */}
        <div className="relative max-w-3xl mx-auto">
          <Search className="w-5 h-5 absolute left-4 top-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search doorstep services in Gangtok (e.g. Plumber, Electrician, Barber, Tutor)..."
            className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-slate-200 dark:border-neutral-800 bg-white dark:bg-darkSurface text-sm font-medium focus:outline-none focus:border-redPrimary shadow-lg"
          />
        </div>

        {/* Quick Search Suggestion Chips */}
        <div className="flex gap-2.5 overflow-x-auto pb-2 justify-start sm:justify-center">
          {['ALL', 'Plumber', 'Electrician', 'Barber', 'Cleaner', 'Carpenter', 'Tutor'].map((chip) => (
            <button
              key={chip}
              onClick={() => setActiveChip(chip)}
              className={`px-4 py-2 rounded-full text-xs font-extrabold whitespace-nowrap border transition-all ${
                activeChip === chip
                  ? 'bg-redPrimary text-white border-redPrimary shadow-md scale-105'
                  : 'bg-white dark:bg-darkSurface border-slate-200 dark:border-neutral-800 hover:border-redPrimary'
              }`}
            >
              ⚡ {chip === 'ALL' ? 'All Services' : chip}
            </button>
          ))}
        </div>

        {/* Categories Section */}
        <div>
          <div className="flex justify-between items-baseline mb-6">
            <div>
              <span className="text-xs font-black uppercase text-redPrimary tracking-wider">Service Categories</span>
              <h2 className="text-2xl font-black mt-0.5">Explore Categories ({categories.length})</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Trained technical manpower categories in Gangtok</p>
            </div>
            <Link href="/categories" className="text-xs font-bold text-redPrimary hover:underline flex items-center gap-1">
              See All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {categories.map((c) => (
              <Link href="/categories" key={c.id}>
                <motion.div
                  whileHover={{ y: -4, scale: 1.02 }}
                  className="web-card text-center p-5 cursor-pointer shadow-md"
                >
                  <div className="w-14 h-14 rounded-2xl bg-redPrimary/10 flex items-center justify-center mx-auto mb-3 border border-redPrimary/20">
                    <img src={c.iconUrl || 'https://himistri.techcoders.in/wp-content/uploads/2022/10/PLUMBER.png'} alt={c.name} className="w-8 h-8 object-contain" />
                  </div>
                  <strong className="text-xs font-bold block text-slate-900 dark:text-white">{c.name}</strong>
                </motion.div>
              </Link>
            ))}
          </div>
        </div>

        {/* Popular Services Catalog */}
        <div>
          <div className="flex justify-between items-baseline mb-6">
            <div>
              <span className="text-xs font-black uppercase text-redPrimary tracking-wider">Top Doorstep Solutions</span>
              <h2 className="text-2xl font-black mt-0.5">Popular Services in Gangtok</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Top rated doorstep solutions requested by Sikkim residents</p>
            </div>
            <Link href="/services" className="text-xs font-bold text-redPrimary hover:underline flex items-center gap-1">
              View Catalog <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {filteredServices.map((s) => (
              <motion.div
                key={s.id}
                whileHover={{ y: -4 }}
                className="web-card flex flex-col justify-between shadow-lg"
              >
                <div>
                  <div className="relative">
                    <img src={s.imageUrl || 'https://himistri.techcoders.in/wp-content/uploads/2022/10/PLUMBER.png'} alt={s.title} className="w-full h-44 object-cover rounded-xl mb-3" />
                    <div className="absolute top-2.5 right-2.5 bg-black/80 text-amber-400 text-xs font-bold px-2.5 py-1 rounded-lg flex items-center gap-1 backdrop-blur-md border border-white/10">
                      <Star className="w-3.5 h-3.5 fill-amber-400" /> {s.ratingAverage || 4.9}
                    </div>
                  </div>
                  <span className="text-[11px] font-black text-redPrimary uppercase tracking-wider">{s.categoryName || 'General'}</span>
                  <h3 className="font-extrabold text-base mt-0.5 text-slate-900 dark:text-white">{s.title}</h3>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-neutral-800 flex items-center justify-between">
                  <div>
                    <span className="text-xl font-black text-redPrimary">₹{s.discountedPrice || 800}</span>
                    <span className="text-xs text-slate-400 line-through ml-2">₹{s.originalPrice || 1000}</span>
                  </div>
                  <button onClick={() => setCheckoutService(s)} className="btn-primary">
                    Hire Now <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Why Choose HiMistri Section */}
        <div className="my-12">
          <div className="text-center max-w-xl mx-auto mb-8">
            <span className="text-xs font-black uppercase text-redPrimary tracking-wider">Quality Assurance</span>
            <h2 className="text-2xl font-black mt-1">Why Choose HiMistri?</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Sikkim's premier doorstep technical manpower platform</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
            <div className="web-card">
              <ShieldCheck className="w-8 h-8 text-redPrimary mb-3" />
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">100% Verified</h4>
              <p className="text-xs text-slate-500 mt-1">Background checked mistris & technicians in Sikkim</p>
            </div>
            <div className="web-card">
              <Award className="w-8 h-8 text-redPrimary mb-3" />
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">Affordable Rates</h4>
              <p className="text-xs text-slate-500 mt-1">Transparent upfront pricing with zero hidden fees</p>
            </div>
            <div className="web-card">
              <Clock className="w-8 h-8 text-redPrimary mb-3" />
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">On-Time Arrival</h4>
              <p className="text-xs text-slate-500 mt-1">Doorstep arrival at your scheduled date & time slot</p>
            </div>
            <div className="web-card">
              <CheckCircle2 className="w-8 h-8 text-redPrimary mb-3" />
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">30-Day Guarantee</h4>
              <p className="text-xs text-slate-500 mt-1">Service re-visit guarantee for total peace of mind</p>
            </div>
          </div>
        </div>

        {/* Testimonials & FAQ Section */}
        <TestimonialsSection />
      </main>

      <CheckoutModal isOpen={!!checkoutService} onClose={() => setCheckoutService(null)} service={checkoutService} currentUser={currentUser} />
      <Footer />
    </div>
  );
}
