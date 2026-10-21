import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import CheckoutModal from '../components/CheckoutModal';
import { FALLBACK_ICON } from '../lib/defaultData';
import { ref, onValue } from 'firebase/database';
import { rtdb } from '../lib/firebase';
import { useAuth } from '../lib/AuthContext';
import { useRouter } from 'next/router';
import { Search, Star, Wrench, ArrowRight } from 'lucide-react';

export default function ServicesPage() {
  const router = useRouter();
  const [isDark, setIsDark] = useState(true);
  const [query, setQuery] = useState('');
  const [checkoutService, setCheckoutService] = useState(null);

  // Live Firebase Services State
  const [services, setServices] = useState([]);
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
      setServices(list);
    });

    return () => unsubSrv();
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

  const filtered = services.filter(s =>
    (s.title || '').toLowerCase().includes(query.toLowerCase()) ||
    (s.categoryName || '').toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-[#0F0F0F] text-slate-900 dark:text-white transition-colors duration-200">
      <Header isDark={isDark} onToggleTheme={toggleTheme} currentUser={currentUser} />

      <main className="web-container py-6 sm:py-10 flex-1 max-w-7xl mx-auto px-4 sm:px-6 w-full">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 rounded-xl bg-redPrimary/10 text-redPrimary">
            <Wrench className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black">Doorstep Services Catalog ({services.length})</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">Book verified plumbers, electricians, barbers, tutors & craftsmen in Sikkim</p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative mb-8">
          <Search className="w-5 h-5 absolute left-4 top-3.5 text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search services by name or category (e.g. Plumber, Electrician, Tutor)..."
            className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-slate-200 dark:border-neutral-800 bg-white dark:bg-darkSurface text-sm font-medium focus:outline-none focus:border-redPrimary text-slate-900 dark:text-white shadow-lg"
          />
        </div>

        {/* Services Grid (100% Un-cropped Square Artwork Display) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filtered.map((s) => {
            const rating = parseFloat(s.ratingAverage || 4.9).toFixed(1);
            return (
              <div key={s.id} className="web-card flex flex-col justify-between shadow-xl bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 p-4 sm:p-5 rounded-2xl">
                <div>
                  <div className="relative w-full aspect-square rounded-xl mb-3 overflow-hidden bg-slate-100 dark:bg-neutral-800/80 flex items-center justify-center p-1.5 border border-slate-200 dark:border-neutral-700/60 shadow-inner">
                    <img
                      src={s.imageUrl || FALLBACK_ICON}
                      alt={s.title}
                      onError={(e) => { e.target.onerror = null; e.target.src = FALLBACK_ICON; }}
                      className="w-full h-full object-contain rounded-lg"
                    />
                    <div className="absolute top-2.5 right-2.5 bg-black/85 text-amber-400 text-xs font-bold px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 backdrop-blur-md border border-white/10 shadow-lg z-10">
                      <Star className="w-3.5 h-3.5 fill-amber-400" /> {rating}
                    </div>
                  </div>

                  <span className="text-[11px] font-black text-redPrimary uppercase tracking-wider">{s.categoryName || 'General'}</span>
                  <h3 className="font-extrabold text-base sm:text-lg mt-0.5 text-slate-900 dark:text-white">{s.title}</h3>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-100 dark:border-neutral-800 flex items-center justify-between">
                  <div>
                    <span className="text-xl sm:text-2xl font-black text-redPrimary">₹{s.discountedPrice || 800}</span>
                    <span className="text-xs text-slate-400 line-through ml-2">₹{s.originalPrice || 1000}</span>
                  </div>
                  <button
                    onClick={() => handleHireNow(s)}
                    className="btn-primary py-2 sm:py-2.5 px-4 sm:px-5 text-xs sm:text-sm"
                  >
                    Hire Now <ArrowRight className="w-4 h-4 ml-1 inline" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      <CheckoutModal isOpen={!!checkoutService} onClose={() => setCheckoutService(null)} service={checkoutService} currentUser={currentUser} />
      <Footer />
    </div>
  );
}
