import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '../components/Header';
import Footer from '../components/Footer';
import CheckoutModal from '../components/CheckoutModal';
import { DEFAULT_CATEGORIES, DEFAULT_SERVICES } from '../lib/defaultData';
import { Search, ShieldCheck, Star, ArrowRight, Clock, CheckCircle2, Award } from 'lucide-react';

export default function HomePage() {
  const [isDark, setIsDark] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeChip, setActiveChip] = useState('ALL');
  const [checkoutService, setCheckoutService] = useState(null);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.setAttribute('data-theme', !isDark ? 'dark' : 'light');
  };

  const defaultBannerSlides = [
    {
      title: "LOOKING FOR A RELIABLE SERVICE?",
      subtitle: "Doorstep Plumbing, Electrical, Cleaning & Salon across Gangtok.",
      badge: "100% Safe & Verified (24x7)",
      imageUrl: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=1200&q=80"
    },
    {
      title: "VERIFIED TECHNICAL MANPOWER IN SIKKIM",
      subtitle: "Background checked mistris & skilled manpower at affordable prices.",
      badge: "Doorstep Service Convenience",
      imageUrl: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80"
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlideIndex((prev) => (prev + 1) % defaultBannerSlides.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [defaultBannerSlides.length]);

  const filteredServices = DEFAULT_SERVICES.filter((s) => {
    const matchesSearch =
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.categoryName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesChip = activeChip === 'ALL' || s.categoryName.toLowerCase().includes(activeChip.toLowerCase());
    return matchesSearch && matchesChip;
  });

  const activeSlide = defaultBannerSlides[currentSlideIndex];

  return (
    <div className="flex flex-col min-h-screen">
      <Header isDark={isDark} onToggleTheme={toggleTheme} />

      <main className="web-container py-8 flex-1 space-y-10">
        {/* Dynamic Hero Banner Carousel */}
        <div
          className="hero-box relative overflow-hidden transition-all duration-500"
          style={{ backgroundImage: `linear-gradient(rgba(0,0,0,0.65), rgba(0,0,0,0.85)), url('${activeSlide.imageUrl}')` }}
        >
          <span className="inline-block bg-redPrimary text-white text-xs font-extrabold px-3 py-1 rounded-full mb-3">
            {activeSlide.badge}
          </span>
          <h1 className="text-3xl sm:text-4xl font-black mb-2 tracking-tight">{activeSlide.title}</h1>
          <p className="text-sm sm:text-base opacity-90 max-w-2xl mb-6">{activeSlide.subtitle}</p>
          <div className="flex flex-wrap gap-3">
            <Link href="/services" className="btn-primary">
              Explore All Services <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/categories" className="btn-outline text-white border-white/30 hover:bg-white/10">
              Browse Categories
            </Link>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="w-5 h-5 absolute left-4 top-3.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search services (e.g. Plumber, Electrician, Barber, Tutor)..."
            className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-slate-200 dark:border-neutral-800 bg-white dark:bg-darkSurface text-sm font-medium focus:outline-none focus:border-redPrimary shadow-sm"
          />
        </div>

        {/* Quick Filter Chips */}
        <div className="flex gap-2.5 overflow-x-auto pb-2">
          {['ALL', 'Plumber', 'Electrician', 'Barber', 'Cleaner', 'Carpenter', 'Tutor'].map((chip) => (
            <button
              key={chip}
              onClick={() => setActiveChip(chip)}
              className={`px-4 py-2 rounded-full text-xs font-extrabold whitespace-nowrap border transition ${
                activeChip === chip
                  ? 'bg-redPrimary text-white border-redPrimary shadow-md'
                  : 'bg-white dark:bg-darkSurface border-slate-200 dark:border-neutral-800 hover:border-redPrimary'
              }`}
            >
              ⚡ {chip === 'ALL' ? 'All Services' : chip}
            </button>
          ))}
        </div>

        {/* Categories Section */}
        <div>
          <div className="flex justify-between items-baseline mb-4">
            <div>
              <h2 className="text-xl font-black">Explore Categories (10)</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Trained technical manpower categories in Gangtok</p>
            </div>
            <Link href="/categories" className="text-xs font-bold text-redPrimary hover:underline flex items-center gap-1">
              See All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {DEFAULT_CATEGORIES.map((c) => (
              <Link href="/categories" key={c.id} className="web-card text-center p-4 cursor-pointer">
                <div className="w-14 h-14 rounded-full bg-redPrimary/10 flex items-center justify-center mx-auto mb-3">
                  <img src={c.iconUrl} alt={c.name} className="w-8 h-8 object-contain" />
                </div>
                <strong className="text-xs font-bold block">{c.name}</strong>
              </Link>
            ))}
          </div>
        </div>

        {/* Popular Services Section */}
        <div>
          <div className="flex justify-between items-baseline mb-4">
            <div>
              <h2 className="text-xl font-black">Popular Services in Gangtok</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Top rated doorstep solutions requested by Sikkim residents</p>
            </div>
            <Link href="/services" className="text-xs font-bold text-redPrimary hover:underline flex items-center gap-1">
              View Catalog <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {filteredServices.map((s) => (
              <div key={s.id} className="web-card flex flex-col justify-between">
                <div>
                  <div className="relative">
                    <img src={s.imageUrl} alt={s.title} className="w-full h-40 object-cover rounded-xl mb-3" />
                    <div className="absolute top-2 right-2 bg-black/80 text-amber-400 text-xs font-bold px-2.5 py-1 rounded-lg flex items-center gap-1 backdrop-blur-sm">
                      <Star className="w-3.5 h-3.5 fill-amber-400" /> {s.ratingAverage}
                    </div>
                  </div>
                  <span className="text-xs font-extrabold text-redPrimary uppercase tracking-wider">{s.categoryName}</span>
                  <h3 className="font-extrabold text-base mt-1">{s.title}</h3>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-neutral-800 flex items-center justify-between">
                  <div>
                    <span className="text-xl font-black text-redPrimary">₹{s.discountedPrice}</span>
                    <span className="text-xs text-slate-400 line-through ml-2">₹{s.originalPrice}</span>
                  </div>
                  <button onClick={() => setCheckoutService(s)} className="btn-primary">
                    Hire Now <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Why Choose HiMistri Section */}
        <div className="my-12">
          <h2 className="text-xl font-black mb-1">Why Choose HiMistri?</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">Sikkim's premier doorstep technical manpower platform</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div className="web-card">
              <ShieldCheck className="w-8 h-8 text-redPrimary mb-2" />
              <h4 className="font-bold text-sm">100% Verified</h4>
              <p className="text-xs text-slate-500 mt-1">Background checked mistris & technicians in Sikkim</p>
            </div>
            <div className="web-card">
              <Award className="w-8 h-8 text-redPrimary mb-2" />
              <h4 className="font-bold text-sm">Affordable Rates</h4>
              <p className="text-xs text-slate-500 mt-1">Transparent upfront pricing with zero hidden fees</p>
            </div>
            <div className="web-card">
              <Clock className="w-8 h-8 text-redPrimary mb-2" />
              <h4 className="font-bold text-sm">On-Time Arrival</h4>
              <p className="text-xs text-slate-500 mt-1">Doorstep arrival at your scheduled date & time slot</p>
            </div>
            <div className="web-card">
              <CheckCircle2 className="w-8 h-8 text-redPrimary mb-2" />
              <h4 className="font-bold text-sm">Quality Guarantee</h4>
              <p className="text-xs text-slate-500 mt-1">Service re-visit guarantee for total peace of mind</p>
            </div>
          </div>
        </div>
      </main>

      <CheckoutModal isOpen={!!checkoutService} onClose={() => setCheckoutService(null)} service={checkoutService} />
      <Footer />
    </div>
  );
}
