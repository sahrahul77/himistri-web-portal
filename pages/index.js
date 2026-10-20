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
import { ShieldCheck, Star, ArrowRight, Clock, CheckCircle2, Award } from 'lucide-react';

export default function HomePage() {
  const [isDark, setIsDark] = useState(true);
  const [checkoutService, setCheckoutService] = useState(null);

  // Live Firebase Realtime Database Data
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [services, setServices] = useState(DEFAULT_SERVICES);
  const [banners, setBanners] = useState([]);

  const { currentUser } = useAuth();

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.setAttribute('data-theme', !isDark ? 'dark' : 'light');
  };

  useEffect(() => {
    const unsubCat = onValue(ref(rtdb, 'categories'), (snapshot) => {
      const list = [];
      if (snapshot.exists()) snapshot.forEach((child) => list.push({ id: child.key, ...child.val() }));
      setCategories(list.length > 0 ? list : DEFAULT_CATEGORIES);
    });

    const unsubSrv = onValue(ref(rtdb, 'services'), (snapshot) => {
      const list = [];
      if (snapshot.exists()) snapshot.forEach((child) => list.push({ id: child.key, ...child.val() }));
      setServices(list.length > 0 ? list : DEFAULT_SERVICES);
    });

    const unsubBanners = onValue(ref(rtdb, 'banners'), (snapshot) => {
      const list = [];
      if (snapshot.exists()) snapshot.forEach((child) => list.push({ id: child.key, ...child.val() }));
      setBanners(list);
    });

    return () => { unsubCat(); unsubSrv(); unsubBanners(); };
  }, []);

  // Show only top 6 popular services on Home page to keep it clean (like mobile app)
  const popularServices = services.slice(0, 6);

  return (
    <div className="flex flex-col min-h-screen">
      <Header isDark={isDark} onToggleTheme={toggleTheme} currentUser={currentUser} />

      <main className="web-container py-8 flex-1 space-y-16">
        {/* Dynamic Animated Hero Banner from Firebase */}
        <HeroBanner banners={banners} />

        {/* Categories Section */}
        {categories.length > 0 && (
          <div>
            <div className="flex justify-between items-baseline mb-6">
              <div>
                <span className="text-xs font-black uppercase text-redPrimary tracking-wider">Service Categories</span>
                <h2 className="text-2xl sm:text-3xl font-black mt-1">Explore Categories</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Trained technical manpower categories in Gangtok</p>
              </div>
              <Link href="/categories" className="text-xs font-bold text-redPrimary hover:underline flex items-center gap-1 bg-redPrimary/10 px-3 py-1.5 rounded-full">
                See All <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
              {categories.map((c) => (
                <Link href={`/categories?id=${c.id}`} key={c.id}>
                  <motion.div
                    whileHover={{ y: -6, scale: 1.02 }}
                    className="web-card text-center p-6 cursor-pointer shadow-lg h-full flex flex-col justify-center border-b-4 border-b-transparent hover:border-b-redPrimary transition-all duration-300"
                  >
                    <div className="w-16 h-16 rounded-2xl bg-slate-50 dark:bg-neutral-800 flex items-center justify-center mx-auto mb-4 border border-slate-100 dark:border-neutral-700 shadow-sm">
                      <img src={c.iconUrl || 'https://himistri.techcoders.in/wp-content/uploads/2022/10/PLUMBER.png'} alt={c.name} className="w-10 h-10 object-contain drop-shadow-sm" />
                    </div>
                    <strong className="text-xs font-bold block text-slate-900 dark:text-white leading-tight">{c.name}</strong>
                  </motion.div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Popular Services Catalog (Top 6) */}
        {popularServices.length > 0 && (
          <div>
            <div className="flex justify-between items-baseline mb-6">
              <div>
                <span className="text-xs font-black uppercase text-redPrimary tracking-wider">Top Doorstep Solutions</span>
                <h2 className="text-2xl sm:text-3xl font-black mt-1">Popular Services</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Most requested doorstep solutions by Sikkim residents</p>
              </div>
              <Link href="/services" className="text-xs font-bold text-redPrimary hover:underline flex items-center gap-1 bg-redPrimary/10 px-3 py-1.5 rounded-full">
                View Catalog <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {popularServices.map((s) => (
                <motion.div
                  key={s.id}
                  whileHover={{ y: -6 }}
                  className="web-card flex flex-col justify-between shadow-xl"
                >
                  <div>
                    <div className="relative">
                      <img src={s.imageUrl || 'https://himistri.techcoders.in/wp-content/uploads/2022/10/PLUMBER.png'} alt={s.title} className="w-full h-48 object-cover rounded-xl mb-4" />
                      <div className="absolute top-3 right-3 bg-black/85 text-amber-400 text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 backdrop-blur-md border border-white/10 shadow-lg">
                        <Star className="w-3.5 h-3.5 fill-amber-400" /> {s.ratingAverage || 4.9}
                      </div>
                    </div>
                    <span className="text-[11px] font-black text-redPrimary uppercase tracking-wider">{s.categoryName || 'General'}</span>
                    <h3 className="font-extrabold text-lg mt-1 text-slate-900 dark:text-white">{s.title}</h3>
                  </div>

                  <div className="mt-5 pt-4 border-t border-slate-100 dark:border-neutral-800 flex items-center justify-between">
                    <div>
                      <span className="text-2xl font-black text-redPrimary">₹{s.discountedPrice || 800}</span>
                      <span className="text-xs text-slate-400 line-through ml-2">₹{s.originalPrice || 1000}</span>
                    </div>
                    <button onClick={() => setCheckoutService(s)} className="btn-primary py-2.5 px-5">
                      Hire Now <ArrowRight className="w-4 h-4 ml-1" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Why Choose HiMistri Section */}
        <div className="my-16 bg-slate-50 dark:bg-darkSurface py-12 px-6 rounded-3xl border border-slate-200 dark:border-neutral-800 shadow-inner">
          <div className="text-center max-w-xl mx-auto mb-10">
            <span className="text-xs font-black uppercase text-redPrimary tracking-wider">Quality Assurance</span>
            <h2 className="text-3xl font-black mt-2">Why Choose HiMistri?</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">Sikkim's premier doorstep technical manpower platform</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            <div className="bg-white dark:bg-neutral-900 p-6 rounded-2xl border border-slate-100 dark:border-neutral-800 shadow-sm text-center">
              <div className="w-14 h-14 rounded-full bg-redPrimary/10 flex items-center justify-center mx-auto mb-4">
                <ShieldCheck className="w-7 h-7 text-redPrimary" />
              </div>
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">100% Verified</h4>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">Background checked mistris & technicians in Sikkim</p>
            </div>
            <div className="bg-white dark:bg-neutral-900 p-6 rounded-2xl border border-slate-100 dark:border-neutral-800 shadow-sm text-center">
              <div className="w-14 h-14 rounded-full bg-redPrimary/10 flex items-center justify-center mx-auto mb-4">
                <Award className="w-7 h-7 text-redPrimary" />
              </div>
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">Affordable Rates</h4>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">Transparent upfront pricing with zero hidden fees</p>
            </div>
            <div className="bg-white dark:bg-neutral-900 p-6 rounded-2xl border border-slate-100 dark:border-neutral-800 shadow-sm text-center">
              <div className="w-14 h-14 rounded-full bg-redPrimary/10 flex items-center justify-center mx-auto mb-4">
                <Clock className="w-7 h-7 text-redPrimary" />
              </div>
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">On-Time Arrival</h4>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">Doorstep arrival at your scheduled date & time slot</p>
            </div>
            <div className="bg-white dark:bg-neutral-900 p-6 rounded-2xl border border-slate-100 dark:border-neutral-800 shadow-sm text-center">
              <div className="w-14 h-14 rounded-full bg-redPrimary/10 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-7 h-7 text-redPrimary" />
              </div>
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">30-Day Guarantee</h4>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">Service re-visit guarantee for total peace of mind</p>
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
