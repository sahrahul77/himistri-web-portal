import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import CheckoutModal from '../components/CheckoutModal';
import { DEFAULT_SERVICES } from '../lib/defaultData';
import { ref, onValue } from 'firebase/database';
import { rtdb } from '../lib/firebase';
import { Search, Star, Wrench, ArrowRight } from 'lucide-react';

export default function ServicesPage() {
  const [isDark, setIsDark] = useState(true);
  const [query, setQuery] = useState('');
  const [checkoutService, setCheckoutService] = useState(null);

  // Live Firebase Services State
  const [services, setServices] = useState(DEFAULT_SERVICES);

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.setAttribute('data-theme', !isDark ? 'dark' : 'light');
  };

  useEffect(() => {
    const unsubSrv = onValue(ref(rtdb, 'services'), (snapshot) => {
      const list = [];
      if (snapshot.exists()) {
        snapshot.forEach((child) => {
          list.push({ id: child.key, ...child.val() });
        });
      }
      setServices(list.length > 0 ? list : DEFAULT_SERVICES);
    });

    return () => unsubSrv();
  }, []);

  const filtered = services.filter(s =>
    (s.title || '').toLowerCase().includes(query.toLowerCase()) ||
    (s.categoryName || '').toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="flex flex-col min-h-screen">
      <Header isDark={isDark} onToggleTheme={toggleTheme} />

      <main className="web-container py-10 flex-1">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 rounded-xl bg-redPrimary/10 text-redPrimary">
            <Wrench className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black">Doorstep Services Catalog</h1>
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
            className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-slate-200 dark:border-neutral-800 bg-white dark:bg-darkSurface text-sm font-medium focus:outline-none focus:border-redPrimary"
          />
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {filtered.map((s) => (
            <div key={s.id} className="web-card flex flex-col justify-between">
              <div>
                <div className="relative">
                  <img src={s.imageUrl || 'https://himistri.techcoders.in/wp-content/uploads/2022/10/PLUMBER.png'} alt={s.title} className="w-full h-44 object-cover rounded-xl mb-3" />
                  <div className="absolute top-2 right-2 bg-black/80 text-amber-400 text-xs font-bold px-2.5 py-1 rounded-lg flex items-center gap-1 backdrop-blur-sm">
                    <Star className="w-3.5 h-3.5 fill-amber-400" /> {s.ratingAverage || 4.9}
                  </div>
                </div>
                <span className="text-xs font-extrabold text-redPrimary uppercase tracking-wider">{s.categoryName || 'General'}</span>
                <h3 className="font-extrabold text-base mt-1">{s.title}</h3>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-neutral-800 flex items-center justify-between">
                <div>
                  <span className="text-xl font-black text-redPrimary">₹{s.discountedPrice || 800}</span>
                  <span className="text-xs text-slate-400 line-through ml-2">₹{s.originalPrice || 1000}</span>
                </div>
                <button
                  onClick={() => setCheckoutService(s)}
                  className="btn-primary"
                >
                  Hire Now <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>

      <CheckoutModal isOpen={!!checkoutService} onClose={() => setCheckoutService(null)} service={checkoutService} />
      <Footer />
    </div>
  );
}
