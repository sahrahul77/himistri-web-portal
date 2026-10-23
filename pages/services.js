import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import CheckoutModal from '../components/CheckoutModal';
import { DEFAULT_SERVICES, DEFAULT_CATEGORIES, FALLBACK_ICON } from '../lib/defaultData';
import { ref, onValue } from 'firebase/database';
import { rtdb } from '../lib/firebase';
import { useAuth } from '../lib/AuthContext';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { Search, Star, Wrench, ArrowRight, ShieldCheck, Flame } from 'lucide-react';

export default function ServicesPage() {
  const router = useRouter();
  const [isDark, setIsDark] = useState(true);
  const [query, setQuery] = useState('');
  const [activeChip, setActiveChip] = useState('ALL');
  const [checkoutService, setCheckoutService] = useState(null);

  // Initialize state with default services to eliminate blank loading pauses
  const [services, setServices] = useState(DEFAULT_SERVICES);
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);

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
    const unsubSrv = onValue(ref(rtdb, 'services'), (snapshot) => {
      const list = [];
      if (snapshot.exists()) {
        snapshot.forEach((child) => {
          list.push({ id: child.key, ...child.val() });
        });
      }
      if (list.length > 0) setServices(list);
    });

    const unsubCat = onValue(ref(rtdb, 'categories'), (snapshot) => {
      const list = [];
      if (snapshot.exists()) {
        snapshot.forEach((child) => {
          if (child.val() && (child.val().name || '').toLowerCase().includes('manpower')) {
            list.push({ id: child.key, ...child.val() });
          }
        });
      }
      if (list.length > 0) setCategories(list);
    });

    return () => { unsubSrv(); unsubCat(); };
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

  const filtered = services.filter((s) => {
    const q = query.toLowerCase().trim();
    const chip = activeChip.toLowerCase().trim();

    if (q) {
      return (s.title || '').toLowerCase().includes(q) ||
        (s.categoryName || '').toLowerCase().includes(q) ||
        (s.shortDescription || '').toLowerCase().includes(q);
    }

    if (chip === 'all') return true;
    return (s.categoryName || '').toLowerCase().includes(chip) ||
      (s.title || '').toLowerCase().includes(chip);
  });

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-[#0F0F0F] text-slate-900 dark:text-white transition-colors duration-200">
      <Header isDark={isDark} onToggleTheme={toggleTheme} currentUser={currentUser} />

      <main className="web-container py-6 sm:py-10 flex-1 space-y-8 sm:space-y-12 max-w-7xl mx-auto px-4 sm:px-6 w-full">

        {/* Top Gradient Hero Banner Header */}
        <div className="bg-gradient-to-r from-redPrimary via-orangeSecondary to-redDark text-white p-6 sm:p-8 rounded-3xl shadow-2xl space-y-3 relative overflow-hidden">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4 text-emerald-300" /> Verified Doorstep Solutions
          </div>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight uppercase">Doorstep Services Catalog ({services.length})</h1>
          <p className="text-xs sm:text-sm text-white/90 font-semibold max-w-2xl leading-relaxed">
            Book verified plumbers, electricians, barbers, tutors & technical craftsmen on-demand across Gangtok, Sikkim.
          </p>
        </div>

        {/* Instant Live Search Bar with Dropdown */}
        <div className="relative max-w-3xl mx-auto w-full group z-40">
          <div className="absolute -inset-1 bg-gradient-to-r from-redPrimary via-orangeSecondary to-amber-500 rounded-3xl blur-md opacity-25 group-hover:opacity-60 transition duration-300" />
          <div className="relative flex items-center bg-white dark:bg-[#1A1A1A] border border-slate-200 dark:border-[#333333] rounded-2xl shadow-2xl p-2">
            <Search className="w-5 h-5 ml-3 text-redPrimary shrink-0" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search services by name or category (e.g. Plumber, Electrician, Tutor)..."
              className="w-full px-3 py-2.5 bg-transparent text-xs sm:text-sm font-bold text-slate-900 dark:text-white outline-none placeholder:text-slate-400"
            />
            {query && (
              <button onClick={() => setQuery('')} className="px-3 py-1 rounded-xl bg-slate-100 dark:bg-neutral-800 text-slate-500 text-xs font-bold hover:text-redPrimary">
                Clear
              </button>
            )}
          </div>

          {/* Instant Live Search Suggestions Dropdown */}
          {query.trim().length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-[#1A1A1A] border border-slate-200 dark:border-[#333333] rounded-2xl shadow-2xl z-50 max-h-96 overflow-y-auto p-2 space-y-1 divide-y divide-slate-100 dark:divide-neutral-800">
              <div className="px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-redPrimary flex justify-between items-center">
                <span>Instant Live Matches ({filtered.length})</span>
                <span className="text-[9px] text-slate-400">Click item to book</span>
              </div>

              {filtered.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-500 font-bold">
                  No services matching "{query}". Try searching "Plumber", "Electrician", or "Tutor".
                </div>
              ) : (
                filtered.map((s) => (
                  <div
                    key={s.id}
                    onClick={() => {
                      handleHireNow(s);
                      setQuery('');
                    }}
                    className="p-3 hover:bg-slate-50 dark:hover:bg-neutral-800/80 rounded-xl flex items-center justify-between gap-3 cursor-pointer transition"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={s.imageUrl || FALLBACK_ICON}
                        alt=""
                        className="w-10 h-10 object-cover rounded-xl shrink-0 bg-slate-100 dark:bg-neutral-800"
                        onError={(e) => { e.target.onerror = null; e.target.src = FALLBACK_ICON; }}
                      />
                      <div>
                        <h4 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white leading-tight">{s.title}</h4>
                        <span className="text-[10px] text-redPrimary font-bold uppercase">{s.categoryName || 'General'}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs font-black text-redPrimary">₹{s.discountedPrice || 800}</span>
                      <span className="btn-primary py-1 px-3 text-[11px] font-black rounded-lg">Hire Now →</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Interactive Quick Filter Chips Row */}
        <div className="flex gap-2.5 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-none">
          <button
            type="button"
            onClick={() => { setActiveChip('ALL'); setQuery(''); }}
            className={`px-4 sm:px-5 py-2.5 rounded-full text-xs font-black whitespace-nowrap transition cursor-pointer shrink-0 flex items-center gap-1.5 ${
              activeChip === 'ALL'
                ? 'bg-redPrimary text-white shadow-lg scale-105'
                : 'bg-white dark:bg-[#1A1A1A] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-[#333333] hover:border-redPrimary/50'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-amber-300" /> All Services
          </button>

          {categories.map((c) => {
            const isSelected = activeChip.toLowerCase() === c.name.toLowerCase();
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => { setActiveChip(isSelected ? 'ALL' : c.name); setQuery(''); }}
                className={`px-4 sm:px-5 py-2.5 rounded-full text-xs font-extrabold whitespace-nowrap transition flex items-center gap-2 cursor-pointer shrink-0 ${
                  isSelected
                    ? 'bg-redPrimary text-white shadow-lg scale-105'
                    : 'bg-white dark:bg-[#1A1A1A] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-[#333333] hover:border-redPrimary/50'
                }`}
              >
                <img src={c.iconUrl || FALLBACK_ICON} alt="" className="w-4 h-4 object-contain" />
                {c.name}
              </button>
            );
          })}
        </div>

        {/* Services Grid Showcase */}
        <div className="space-y-6 pt-2">
          <div className="flex justify-between items-end border-b border-slate-200 dark:border-neutral-800 pb-3">
            <div>
              <span className="text-[10px] font-black uppercase text-redPrimary tracking-widest block">Service Catalog</span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-0.5">
                {query ? `Search Results for "${query}"` : activeChip === 'ALL' ? 'All Verified Doorstep Services' : `${activeChip} Services in Gangtok`}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Showing {filtered.length} verified technical solutions</p>
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="web-card text-center py-20 text-slate-500 space-y-3 bg-white dark:bg-[#1A1A1A] border border-slate-200 dark:border-[#333333] rounded-2xl shadow-lg">
              <Wrench className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto" />
              <p className="text-slate-500 dark:text-slate-400 font-bold text-sm">No services found matching "{query || activeChip}".</p>
              <button onClick={() => { setQuery(''); setActiveChip('ALL'); }} className="btn-primary text-xs py-2.5 px-5 rounded-xl">
                Reset Search
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
              {filtered.map((s) => {
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
                      {/* Image Box */}
                      <div className="relative w-full h-52 sm:h-60 overflow-hidden bg-slate-100 dark:bg-neutral-800">
                        <img
                          src={s.imageUrl || FALLBACK_ICON}
                          alt={s.title}
                          onError={(e) => { e.target.onerror = null; e.target.src = FALLBACK_ICON; }}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />

                        {/* Discount Badge */}
                        <div className="absolute top-3 left-3 bg-redPrimary text-white text-[10px] font-black px-2.5 py-1 rounded-lg shadow-lg uppercase tracking-wider z-10">
                          {discountPercent}% OFF
                        </div>

                        {/* Verified Pill Badge */}
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
      </main>

      <CheckoutModal isOpen={!!checkoutService} onClose={() => setCheckoutService(null)} service={checkoutService} currentUser={currentUser} />
      <Footer />
    </div>
  );
}
