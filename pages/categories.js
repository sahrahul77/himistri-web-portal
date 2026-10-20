import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Header from '../components/Header';
import Footer from '../components/Footer';
import TestimonialsSection from '../components/TestimonialsSection';
import { DEFAULT_CATEGORIES, DEFAULT_SERVICES, FALLBACK_ICON } from '../lib/defaultData';
import { ref, onValue } from 'firebase/database';
import { rtdb } from '../lib/firebase';
import { useAuth } from '../lib/AuthContext';
import { Layers, ArrowRight, Star } from 'lucide-react';

export default function CategoriesPage() {
  const router = useRouter();
  const [isDark, setIsDark] = useState(true);

  // Start with ALL, but if user clicked a category from homepage, use that ID
  const [selectedCatId, setSelectedCatId] = useState('ALL');

  // Live Firebase States
  const [dbCategories, setDbCategories] = useState([]);
  const [dbServices, setDbServices] = useState([]);

  const { currentUser, isAuthLoaded } = useAuth();

  useEffect(() => {
    if (router.query.id) {
      setSelectedCatId(router.query.id);
    }
  }, [router.query]);

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.setAttribute('data-theme', !isDark ? 'dark' : 'light');
  };

  useEffect(() => {
    const unsubCat = onValue(ref(rtdb, 'categories'), (snapshot) => {
      const list = [];
      if (snapshot.exists()) snapshot.forEach((child) => list.push({ id: child.key, ...child.val() }));
      setDbCategories(list);
    });

    const unsubSrv = onValue(ref(rtdb, 'services'), (snapshot) => {
      const list = [];
      if (snapshot.exists()) snapshot.forEach((child) => list.push({ id: child.key, ...child.val() }));
      setDbServices(list);
    });

    return () => { unsubCat(); unsubSrv(); };
  }, []);

  // Merge Default Categories + DB Categories so ALL 10 Categories ARE ALWAYS VISIBLE
  const allCategories = [
    ...dbCategories,
    ...DEFAULT_CATEGORIES.filter(dc => !dbCategories.some(dbc => dbc.id === dc.id || dbc.name?.toLowerCase() === dc.name?.toLowerCase()))
  ];

  // Merge Default Services + DB Services so ALL 10 Services ARE ALWAYS VISIBLE
  const allServices = [
    ...dbServices,
    ...DEFAULT_SERVICES.filter(ds => !dbServices.some(dbs => dbs.id === ds.id || dbs.title?.toLowerCase() === ds.title?.toLowerCase()))
  ];

  const handleHireNow = (serviceObj) => {
    if (!isAuthLoaded) return;
    localStorage.setItem('himistri_checkout_service', JSON.stringify(serviceObj));
    if (!currentUser) {
      router.push('/auth?redirect=checkout');
    } else {
      router.push('/checkout');
    }
  };

  // Filter services for the selected category
  const filteredServices = selectedCatId === 'ALL'
    ? []
    : allServices.filter(s => s.categoryId === selectedCatId || (s.categoryName || '').toLowerCase() === selectedCatId.toLowerCase());

  const selectedCategoryObj = allCategories.find(c => c.id === selectedCatId || c.name === selectedCatId);

  return (
    <div className="flex flex-col min-h-screen">
      <Header isDark={isDark} onToggleTheme={toggleTheme} currentUser={currentUser} />

      <main className="web-container py-10 flex-1 space-y-12">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2.5 rounded-xl bg-redPrimary/10 text-redPrimary">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black">Sikkim Service Categories</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">10+ Technical & Household Categories Available in Gangtok</p>
          </div>
        </div>

        {/* Top Category Grid (Always Visible - All 10 Categories) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          <div
            onClick={() => { setSelectedCatId('ALL'); router.replace('/categories', undefined, { shallow: true }); }}
            className={`web-card text-center cursor-pointer p-5 transition-all duration-300 border-b-4 ${selectedCatId === 'ALL' ? 'border-b-redPrimary bg-redPrimary/5 scale-105 shadow-lg' : 'border-b-transparent hover:border-b-redPrimary'}`}
          >
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3 transition-colors ${selectedCatId === 'ALL' ? 'bg-redPrimary text-white' : 'bg-redPrimary/10 text-redPrimary'}`}>
              <Layers className="w-7 h-7" />
            </div>
            <strong className="text-xs block">All Categories</strong>
          </div>

          {allCategories.map((c) => (
            <div
              key={c.id}
              onClick={() => { setSelectedCatId(c.id); router.replace(`/categories?id=${c.id}`, undefined, { shallow: true }); }}
              className={`web-card text-center cursor-pointer p-5 transition-all duration-300 border-b-4 ${selectedCatId === c.id ? 'border-b-redPrimary bg-redPrimary/5 scale-105 shadow-lg' : 'border-b-transparent hover:border-b-redPrimary'}`}
            >
              <div className="w-14 h-14 rounded-2xl bg-slate-50 dark:bg-neutral-800 flex items-center justify-center mx-auto mb-3 border border-slate-100 dark:border-neutral-700 shadow-sm">
                <img
                  src={c.iconUrl || FALLBACK_ICON}
                  alt={c.name}
                  onError={(e) => { e.target.onerror = null; e.target.src = FALLBACK_ICON; }}
                  className="w-8 h-8 object-contain drop-shadow-sm"
                />
              </div>
              <strong className="text-xs block">{c.name}</strong>
            </div>
          ))}
        </div>

        {/* Dynamic Section Below: Show Services IF a Category is selected, ELSE show Testimonials & FAQs */}
        {selectedCatId === 'ALL' ? (
           <TestimonialsSection />
        ) : (
          <div className="bg-slate-50 dark:bg-darkSurface p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-neutral-800 shadow-inner">
            <h2 className="text-2xl font-black mb-1 text-slate-900 dark:text-white">
              Services in {selectedCategoryObj?.name || 'Selected Category'}
            </h2>
            <p className="text-xs text-slate-500 mb-6">Found {filteredServices.length} verified services in Gangtok</p>

            {filteredServices.length === 0 ? (
               <div className="text-center py-12">
                 <Layers className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                 <p className="text-slate-500 font-bold text-sm">No services found in this category yet.</p>
               </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {filteredServices.map((s) => {
                  const rating = parseFloat(s.ratingAverage || 4.9).toFixed(1);
                  return (
                    <div key={s.id} className="web-card flex flex-col justify-between bg-white dark:bg-neutral-900 shadow-xl">
                      <div>
                        <div className="relative">
                          <img
                            src={s.imageUrl || FALLBACK_ICON}
                            alt={s.title}
                            onError={(e) => { e.target.onerror = null; e.target.src = FALLBACK_ICON; }}
                            className="w-full h-44 object-cover rounded-xl mb-3 bg-slate-100 dark:bg-neutral-800"
                          />
                          <div className="absolute top-3 right-3 bg-black/85 text-amber-400 text-xs font-bold px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 backdrop-blur-md border border-white/10 shadow-lg">
                            <Star className="w-3.5 h-3.5 fill-amber-400" /> {rating}
                          </div>
                        </div>
                        <span className="text-[11px] font-black text-redPrimary uppercase tracking-wider">{s.categoryName || 'General'}</span>
                        <h3 className="font-extrabold text-lg mt-0.5 text-slate-900 dark:text-white">{s.title}</h3>
                      </div>

                      <div className="mt-4 pt-4 border-t border-slate-100 dark:border-neutral-800 flex items-center justify-between">
                        <div>
                          <span className="text-2xl font-black text-redPrimary">₹{s.discountedPrice || 800}</span>
                          <span className="text-xs text-slate-400 line-through ml-2">₹{s.originalPrice || 1000}</span>
                        </div>
                        <button
                          onClick={() => handleHireNow(s)}
                          className="btn-primary py-2.5 px-5"
                        >
                          Hire Now <ArrowRight className="w-4 h-4 ml-1" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
