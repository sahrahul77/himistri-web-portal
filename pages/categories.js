import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import CheckoutModal from '../components/CheckoutModal';
import { DEFAULT_CATEGORIES, DEFAULT_SERVICES, FALLBACK_ICON } from '../lib/defaultData';
import { ref, onValue } from 'firebase/database';
import { rtdb } from '../lib/firebase';
import { useAuth } from '../lib/AuthContext';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { Layers, Star, ArrowRight, ShieldCheck, Flame, Search, Wrench } from 'lucide-react';

export default function CategoriesPage() {
  const router = useRouter();
  const [isDark, setIsDark] = useState(true);
  const [selectedCategoryId, setSelectedCategoryId] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [checkoutService, setCheckoutService] = useState(null);

  // Initialize state with default data to avoid blank loading pauses
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [services, setServices] = useState(DEFAULT_SERVICES);

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
        snapshot.forEach((child) => {
          if (child.val() && (child.val().name || '').toLowerCase().includes('manpower')) {
            list.push({ id: child.key, ...child.val() });
          }
        });
      }
      if (list.length > 0) setCategories(list);
    });

    const unsubSrv = onValue(ref(rtdb, 'services'), (snapshot) => {
      const list = [];
      if (snapshot.exists()) {
        snapshot.forEach((child) => {
          list.push({ id: child.key, ...child.val() });
        });
      }
      if (list.length > 0) setServices(list);
    });

    return () => { unsubCat(); unsubSrv(); };
  }, []);

  useEffect(() => {
    if (router.query.id) {
      setSelectedCategoryId(router.query.id);
    }
  }, [router.query.id]);

  const handleHireNow = (serviceObj) => {
    if (!isAuthLoaded) return;
    localStorage.setItem('himistri_checkout_service', JSON.stringify(serviceObj));
    if (!currentUser) {
      router.push('/auth?redirect=checkout');
    } else {
      router.push('/checkout');
    }
  };

  const selectedCategoryObj = categories.find(c => c.id === selectedCategoryId);

  const filteredServices = services.filter(s => {
    const q = searchQuery.toLowerCase().trim();
    if (q) {
      return (s.title || '').toLowerCase().includes(q) ||
        (s.categoryName || '').toLowerCase().includes(q) ||
        (s.shortDescription || '').toLowerCase().includes(q);
    }

    if (selectedCategoryId === 'ALL') return true;
    return s.categoryId === selectedCategoryId ||
      (selectedCategoryObj && (s.categoryName || '').toLowerCase().includes((selectedCategoryObj.name || '').toLowerCase()));
  });

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-[#0F0F0F] text-slate-900 dark:text-white transition-colors duration-200">
      <Header isDark={isDark} onToggleTheme={toggleTheme} currentUser={currentUser} />

      <main className="web-container py-6 sm:py-10 flex-1 space-y-8 sm:space-y-12 max-w-7xl mx-auto px-4 sm:px-6 w-full">

        {/* Top Gradient Hero Banner Header */}
        <div className="bg-gradient-to-r from-redPrimary via-orangeSecondary to-redDark text-white p-6 sm:p-8 rounded-3xl shadow-2xl space-y-3 relative overflow-hidden">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4 text-emerald-300" /> Verified Technical Manpower
          </div>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight uppercase">Explore Specialized Categories ({categories.length})</h1>
          <p className="text-xs sm:text-sm text-white/90 font-semibold max-w-2xl leading-relaxed">
            Discover Sikkim's top-rated craftsmen across Catering, Delivery, Household, Electrical, Software & Events.
          </p>
        </div>

        {/* Instant Live Search Bar with Dropdown */}
        <div className="relative max-w-3xl mx-auto w-full group z-40">
          <div className="absolute -inset-1 bg-gradient-to-r from-redPrimary via-orangeSecondary to-amber-500 rounded-3xl blur-md opacity-25 group-hover:opacity-60 transition duration-300" />
          <div className="relative flex items-center bg-white dark:bg-[#1A1A1A] border border-slate-200 dark:border-[#333333] rounded-2xl shadow-2xl p-2">
            <Search className="w-5 h-5 ml-3 text-redPrimary shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search category or service (e.g. Catering, Electrician, Tutor)..."
              className="w-full px-3 py-2.5 bg-transparent text-xs sm:text-sm font-bold text-slate-900 dark:text-white outline-none placeholder:text-slate-400"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="px-3 py-1 rounded-xl bg-slate-100 dark:bg-neutral-800 text-slate-500 text-xs font-bold hover:text-redPrimary">
                Clear
              </button>
            )}
          </div>

          {/* Instant Live Search Suggestions Dropdown */}
          {searchQuery.trim().length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-[#1A1A1A] border border-slate-200 dark:border-[#333333] rounded-2xl shadow-2xl z-50 max-h-96 overflow-y-auto p-2 space-y-1 divide-y divide-slate-100 dark:divide-neutral-800">
              <div className="px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-redPrimary flex justify-between items-center">
                <span>Instant Live Matches ({filteredServices.length})</span>
                <span className="text-[9px] text-slate-400">Click item to book</span>
              </div>

              {filteredServices.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-500 font-bold">
                  No services matching "{searchQuery}". Try searching "Plumber", "Electrician", or "Tutor".
                </div>
              ) : (
                filteredServices.map((s) => (
                  <div
                    key={s.id}
                    onClick={() => {
                      handleHireNow(s);
                      setSearchQuery('');
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

        {/* Categories Chips Filter Bar */}
        <div className="flex gap-2.5 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-none">
          <button
            type="button"
            onClick={() => { setSelectedCategoryId('ALL'); setSearchQuery(''); }}
            className={`px-4 sm:px-5 py-2.5 rounded-full text-xs font-black whitespace-nowrap transition cursor-pointer shrink-0 flex items-center gap-1.5 ${
              selectedCategoryId === 'ALL'
                ? 'bg-redPrimary text-white shadow-lg scale-105'
                : 'bg-white dark:bg-[#1A1A1A] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-[#333333] hover:border-redPrimary/50'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-amber-300" /> All Categories ({categories.length})
          </button>

          {categories.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => { setSelectedCategoryId(c.id); setSearchQuery(''); }}
              className={`px-4 sm:px-5 py-2.5 rounded-full text-xs font-extrabold whitespace-nowrap transition flex items-center gap-2 cursor-pointer shrink-0 ${
                selectedCategoryId === c.id
                  ? 'bg-redPrimary text-white shadow-lg scale-105'
                  : 'bg-white dark:bg-[#1A1A1A] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-[#333333] hover:border-redPrimary/50'
              }`}
            >
              <img src={c.iconUrl || FALLBACK_ICON} alt="" className="w-4 h-4 object-contain" />
              {c.name}
            </button>
          ))}
        </div>

        {/* Category Visual Grid Showcase */}
        {selectedCategoryId === 'ALL' && !searchQuery && (
          <div className="space-y-4">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white border-b border-slate-200 dark:border-neutral-800 pb-2">
              Browse All Workforce Categories
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3.5 sm:gap-5">
              {categories.map((c) => (
                <div key={c.id} onClick={() => { setSelectedCategoryId(c.id); setSearchQuery(''); }}>
                  <motion.div
                    whileHover={{ y: -6, scale: 1.03 }}
                    transition={{ duration: 0.2 }}
                    className="web-card text-center p-4 sm:p-5 cursor-pointer shadow-xl flex flex-col justify-center items-center h-full bg-white dark:bg-[#1A1A1A] border border-slate-200 dark:border-[#333333] hover:border-redPrimary rounded-2xl group relative overflow-hidden"
                  >
                    <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-redPrimary/10 group-hover:bg-redPrimary/20 flex items-center justify-center mb-3 shrink-0 p-2.5 transition shadow-inner">
                      <img
                        src={c.iconUrl || FALLBACK_ICON}
                        alt={c.name}
                        onError={(e) => { e.target.onerror = null; e.target.src = FALLBACK_ICON; }}
                        className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300"
                      />
                    </div>
                    <strong className="text-xs sm:text-sm font-extrabold block text-slate-900 dark:text-white leading-tight group-hover:text-redPrimary transition">
                      {c.name}
                    </strong>
                  </motion.div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Services List in Selected Category */}
        <div className="space-y-6 pt-2">
          <div className="flex justify-between items-end border-b border-slate-200 dark:border-neutral-800 pb-3">
            <div>
              <span className="text-[10px] font-black uppercase text-redPrimary tracking-widest block">Available Services</span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-0.5">
                {searchQuery ? `Search Results for "${searchQuery}"` : `Services in ${selectedCategoryObj?.name || 'All Categories'}`}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Found {filteredServices.length} verified doorstep options</p>
            </div>
          </div>

          {filteredServices.length === 0 ? (
            <div className="text-center py-20 bg-white dark:bg-[#1A1A1A] border border-slate-200 dark:border-[#333333] rounded-2xl shadow-lg space-y-3">
              <Layers className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto" />
              <p className="text-slate-500 dark:text-slate-400 font-bold text-sm">No services found matching your selection.</p>
              <button onClick={() => { setSelectedCategoryId('ALL'); setSearchQuery(''); }} className="btn-primary text-xs py-2.5 px-5 rounded-xl">
                Reset Selection
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
              {filteredServices.map((s) => {
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
