import React, { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Info, Award, ShieldCheck, MapPin } from 'lucide-react';

export default function AboutPage() {
  const [isDark, setIsDark] = useState(true);

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.setAttribute('data-theme', !isDark ? 'dark' : 'light');
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header isDark={isDark} onToggleTheme={toggleTheme} />

      <main className="web-container py-12 flex-1 max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-3 rounded-2xl bg-redPrimary/10 text-redPrimary">
            <Info className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-black">About HiMistri</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">Sikkim's Premier Doorstep Technical Manpower Start-up</p>
          </div>
        </div>

        <div className="web-card space-y-6 leading-relaxed text-sm">
          <p className="text-base font-semibold leading-relaxed">
            HiMistri is a Gangtok – based start-up company established in 2022 that provides different kinds of services in several categories to customers in and around Sikkim. Our main aim is to provide all basic needs required by an individual in different prospects of life in one single frame, providing technical manpower at minimum cost and maximum benefits.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
            <div className="p-4 rounded-xl border border-neutral-800 bg-black/20">
              <ShieldCheck className="w-6 h-6 text-redPrimary mb-2" />
              <h4 className="font-bold text-sm mb-1">50+ Verified Service Partners</h4>
              <p className="text-xs text-slate-400">Trained, background-verified plumbers, electricians, tutors, drivers & craftsmen across Sikkim.</p>
            </div>

            <div className="p-4 rounded-xl border border-neutral-800 bg-black/20">
              <Award className="w-6 h-6 text-redPrimary mb-2" />
              <h4 className="font-bold text-sm mb-1">Risk Free Booking Guarantee</h4>
              <p className="text-xs text-slate-400">100% transparent upfront pricing with zero hidden fees & quality re-visit guarantee.</p>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-redPrimary/10 border border-redPrimary/20 space-y-2 text-xs">
            <p className="font-bold text-sm text-redPrimary">Sikkim Head Office Address:</p>
            <p><MapPin className="w-4 h-4 inline text-redPrimary mr-1" /> Upper Syari Near ICDS center, Dothapu, Near Deorali-Bazar, Gangtok, East Sikkim. PINCODE: 737102</p>
            <p>Phone: +91 7430887960 | Email: info@himistri.techcoders.in</p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
