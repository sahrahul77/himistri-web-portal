import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { FileText, ShieldCheck, UserCheck, Award, Lock } from 'lucide-react';

export default function TermsPage() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('himistri_theme') || 'light';
    const isDarkTheme = savedTheme === 'dark';
    setIsDark(isDarkTheme);
    if (isDarkTheme) {
      document.documentElement.classList.add('dark');
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.setAttribute('data-theme', 'light');
    }
  }, []);

  const toggleTheme = () => {
    setIsDark(prev => {
      const nextDark = !prev;
      if (nextDark) {
        document.documentElement.classList.add('dark');
        document.documentElement.setAttribute('data-theme', 'dark');
        localStorage.setItem('himistri_theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        document.documentElement.setAttribute('data-theme', 'light');
        localStorage.setItem('himistri_theme', 'light');
      }
      return nextDark;
    });
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-[#0F0F0F] text-slate-900 dark:text-white transition-colors duration-200">
      <Header isDark={isDark} onToggleTheme={toggleTheme} />

      <main className="web-container py-8 sm:py-12 flex-1 max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-3.5 rounded-2xl bg-redPrimary/10 text-redPrimary shrink-0">
            <FileText className="w-8 h-8 text-redPrimary" />
          </div>
          <div>
            <span className="text-xs font-black uppercase text-redPrimary tracking-widest">Legal & Policies</span>
            <h1 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white mt-0.5">Terms & Conditions</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-1">
              Welcome to HiMistri! By accessing our website or mobile application, you agree to comply with and be bound by the following terms and conditions.
            </p>
          </div>
        </div>

        <div className="web-card space-y-6 leading-relaxed text-sm bg-white dark:bg-[#1A1A1A] border border-slate-200 dark:border-[#333333] p-6 sm:p-8 rounded-3xl shadow-xl">

          {/* Section 1 */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 space-y-1.5">
            <h3 className="text-base font-extrabold text-redPrimary flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-redPrimary" /> 1. Usage & Services
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
              HiMistri provides a marketplace platform connecting customers with technical manpower across 10 categories (Catering, Delivery, Household, Software, Event, etc.) in and around Gangtok, Sikkim.
            </p>
          </div>

          {/* Section 2 */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 space-y-1.5">
            <h3 className="text-base font-extrabold text-redPrimary flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-emerald-500" /> 2. User Conduct & Obligations
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
              Users warrant that all address and contact details provided are accurate. Any unlawful conduct, harassment of service partners, or false information will lead to immediate account suspension.
            </p>
          </div>

          {/* Section 3 */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 space-y-1.5">
            <h3 className="text-base font-extrabold text-redPrimary flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-500" /> 3. Intellectual Property
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
              All logos, content, software design, and trademarks belong to HiMistri and/or Techcoders. Reproduction without prior permission is strictly prohibited.
            </p>
          </div>

          {/* Section 4 */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 space-y-1.5">
            <h3 className="text-base font-extrabold text-redPrimary flex items-center gap-2">
              <Lock className="w-4 h-4 text-blue-500" /> 4. Liability Limitation
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
              HiMistri connects verified local service partners. While we guarantee maximum quality assurance and risk-free booking, statutory limitations apply as permitted under law.
            </p>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
