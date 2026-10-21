import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import CheckoutModal from '../components/CheckoutModal';
import { FALLBACK_ICON } from '../lib/defaultData';
import { ref, onValue } from 'firebase/database';
import { rtdb } from '../lib/firebase';
import { useAuth } from '../lib/AuthContext';
import { useRouter } from 'next/router';
import { Layers, Star, ArrowRight } from 'lucide-react';

export default function CategoriesPage() {
  const router = useRouter();
  const [isDark, setIsDark] = useState(true);
  const [selectedCategoryId, setSelectedCategoryId] = useState('ALL');
  const [checkoutService, setCheckoutService] = useState(null);

  // Live Firebase States
  const [categories, setCategories] = useState([]);
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
    const unsubCat = onValue(ref(rtdb, 'categories'), (snapshot) => {
      const list = [];
      if (snapshot.exists()) {
        snapshot.forEach((child) => {
          list.push({ id: child.key, ...child.val() });
        });
      }
      setCategories(list);
    });

    const unsubSrv = onValue(ref(rtdb, 'services'), (snapshot) => {
      const list = [];
      if (snapshot.exists()) {
        snapshot.forEach((child) => {
          list.push({ id: child.key, ...child.val() });
        });
      }
      setServices(list);
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
    if (selectedCategoryId === 'ALL') return true;
    if (s.categoryId === selectedCategoryId) return true;
    if (selectedCategoryObj && (s.categoryName || '').toLowerCase().includes((selectedCategoryObj.name || '').toLowerCase())) return true;
    return false;
  });

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-[#0F0F0F] text-slate-900 dark:text-white transition-colors duration-200">
      <Header isDark={isDark} onToggleTheme={toggleTheme} currentUser={currentUser} />

      <main className="web-container py-6 sm:py-10 flex-1 max-w-7xl mx-auto px-4 sm:px-6 w-full">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 rounded-xl bg-redPrimary/10 text-redPrimary">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black">Categories & Specialized Services ({categories.length})</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">Explore technical manpower, artisans & household specialists in Sikkim</p>
          </div>
        </div>

        {/* Categories Chips */}
        <div className="flex gap-2.5 overflow-x-auto pb-4 mb-8 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-none">
          <button
            type="button"
            onClick={() => setSelectedCategoryId('ALL')}
            className={`px-4 py-2.5 rounded-xl text-xs font-black whitespace-nowrap transition cursor-pointer shrink-0 ${
              selectedCategoryId === 'ALL'
                ? 'bg-redPrimary text-white shadow-lg'
                : 'bg-white dark:bg-neutral-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-neutral-800'
            }`}
          >
            All Categories ({categories.length})
          </button>

          {categories.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setSelectedCategoryId(c.id)}
              className={`px-4 py-2.5 rounded-xl text-xs font-black whitespace-nowrap transition flex items-center gap-2 cursor-pointer shrink-0 ${
                selectedCategoryId === c.id
                  ? 'bg-redPrimary text-white shadow-lg'
                  : 'bg-white dark:bg-neutral-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-neutral-800'
              }`}
            >
              <img src={c.iconUrl || FALLBACK_ICON} alt="" className="w-4 h-4 object-contain" />
              {c.name}
            </button>
          ))}
        </div>

        {/* Services List inside Category (100% Full Square Artwork Display) */}
        <div>
          <h2 className="text-xl sm:text-2xl font-black mb-1 text-slate-900 dark:text-white">
            Services in {selectedCategoryObj?.name || 'All Categories'}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">Found {filteredServices.length} verified doorstep services</p>

          {filteredServices.length === 0 ? (
            <div className="text-center py-16 bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-2xl">
              <Layers className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
              <p className="text-slate-500 dark:text-slate-400 font-bold text-sm">No services found in this category yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {filteredServices.map((s) => {
                const rating = parseFloat(s.ratingAverage || 4.9).toFixed(1);
                return (
                  <div key={s.id} className="web-card flex flex-col justify-between bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 p-4 sm:p-5 rounded-2xl shadow-xl">
                    <div>
                      {/* Full Square Artwork Container */}
                      <div className="relative w-full h-64 sm:h-72 rounded-xl mb-3 overflow-hidden bg-[#1A1A1A] flex items-center justify-center p-2 border border-slate-200 dark:border-neutral-800 shadow-inner">
                        <img
                          src={s.imageUrl || FALLBACK_ICON}
                          alt={s.title}
                          onError={(e) => { e.target.onerror = null; e.target.src = FALLBACK_ICON; }}
                          className="w-full h-full object-contain object-center rounded-lg"
                        />
                        <div className="absolute top-3 right-3 bg-black/85 text-amber-400 text-xs font-bold px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 backdrop-blur-md border border-white/10 shadow-lg z-10">
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
          )}
        </div>
      </main>

      <CheckoutModal isOpen={!!checkoutService} onClose={() => setCheckoutService(null)} service={checkoutService} currentUser={currentUser} />
      <Footer />
    </div>
  );
}
