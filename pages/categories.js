import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import CheckoutModal from '../components/CheckoutModal';
import { DEFAULT_CATEGORIES, DEFAULT_SERVICES } from '../lib/defaultData';
import { ref, onValue } from 'firebase/database';
import { rtdb } from '../lib/firebase';
import { Layers, ArrowRight } from 'lucide-react';

export default function CategoriesPage() {
  const [isDark, setIsDark] = useState(true);
  const [selectedCatId, setSelectedCatId] = useState('ALL');
  const [checkoutService, setCheckoutService] = useState(null);

  // Live Firebase States
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [services, setServices] = useState(DEFAULT_SERVICES);

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

  const filteredServices = selectedCatId === 'ALL'
    ? services
    : services.filter(s => s.categoryId === selectedCatId || (s.categoryName || '').toLowerCase().includes(selectedCatId.toLowerCase()));

  return (
    <div className="flex flex-col min-h-screen">
      <Header isDark={isDark} onToggleTheme={toggleTheme} />

      <main className="web-container py-10 flex-1">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2.5 rounded-xl bg-redPrimary/10 text-redPrimary">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black">Sikkim Service Categories</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">10+ Technical & Household Categories Available in Gangtok</p>
          </div>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 my-8">
          <div
            onClick={() => setSelectedCatId('ALL')}
            className={`web-card text-center cursor-pointer p-5 transition ${selectedCatId === 'ALL' ? 'border-2 border-redPrimary bg-redPrimary/10' : ''}`}
          >
            <div className="w-12 h-12 rounded-full bg-redPrimary text-white flex items-center justify-center mx-auto mb-3 font-black text-sm">
              ALL
            </div>
            <strong className="text-xs block">All Categories</strong>
          </div>

          {categories.map((c) => (
            <div
              key={c.id}
              onClick={() => setSelectedCatId(c.id)}
              className={`web-card text-center cursor-pointer p-5 transition ${selectedCatId === c.id ? 'border-2 border-redPrimary bg-redPrimary/10' : ''}`}
            >
              <div className="w-12 h-12 rounded-full bg-redPrimary/10 flex items-center justify-center mx-auto mb-3">
                <img src={c.iconUrl || 'https://himistri.techcoders.in/wp-content/uploads/2022/10/PLUMBER.png'} alt={c.name} className="w-7 h-7 object-contain" />
              </div>
              <strong className="text-xs block">{c.name}</strong>
            </div>
          ))}
        </div>

        {/* Services for Selected Category */}
        <div className="my-10">
          <h2 className="text-lg font-bold mb-4">
            Services in {selectedCatId === 'ALL' ? 'All Categories' : (categories.find(c => c.id === selectedCatId)?.name || 'Category')} ({filteredServices.length})
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {filteredServices.map((s) => (
              <div key={s.id} className="web-card">
                <img src={s.imageUrl || 'https://himistri.techcoders.in/wp-content/uploads/2022/10/PLUMBER.png'} alt={s.title} className="w-full h-40 object-cover rounded-xl mb-3" />
                <span className="text-xs font-bold text-redPrimary uppercase tracking-wider">{s.categoryName || 'General'}</span>
                <h3 className="font-extrabold text-base mt-1">{s.title}</h3>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-xl font-black text-redPrimary">₹{s.discountedPrice || 800}</span>
                  <span className="text-xs text-slate-400 line-through">₹{s.originalPrice || 1000}</span>
                </div>
                <button
                  onClick={() => setCheckoutService(s)}
                  className="btn-primary w-full mt-4"
                >
                  Hire Now <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </main>

      <CheckoutModal isOpen={!!checkoutService} onClose={() => setCheckoutService(null)} service={checkoutService} />
      <Footer />
    </div>
  );
}
