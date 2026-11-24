import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { RotateCcw, Clock, AlertTriangle, ShieldCheck, HelpCircle, CheckCircle2 } from 'lucide-react';

export default function CancellationPage() {
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
            <RotateCcw className="w-8 h-8 text-redPrimary" />
          </div>
          <div>
            <span className="text-xs font-black uppercase text-redPrimary tracking-widest">Legal & Policies</span>
            <h1 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white mt-0.5">Cancellation & Refund Policy</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-1">
              Please read our cancellation rules carefully before placing an order on HiMistri.
            </p>
          </div>
        </div>

        <div className="web-card space-y-6 leading-relaxed text-sm bg-white dark:bg-[#1A1A1A] border border-slate-200 dark:border-[#333333] p-6 sm:p-8 rounded-3xl shadow-xl">

          {/* Section 1 */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 space-y-1.5">
            <h3 className="text-base font-extrabold text-redPrimary flex items-center gap-2">
              <Clock className="w-4 h-4 text-redPrimary" /> 1. Free Cancellation Window (1 Minute)
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
              Customers may cancel a service order free of charge within <strong>1 MINUTE</strong> of placing it.
            </p>
          </div>

          {/* Section 2 */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 space-y-1.5">
            <h3 className="text-base font-extrabold text-redPrimary flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-orangeSecondary" /> 2. Cancellation Penalty After 1 Minute
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
              If an order is cancelled <strong>AFTER</strong> the 1-minute window, a penalty of 100% of the order amount is charged to compensate the assigned service partner for travel and time reserved. Prepaid orders will not be refunded in this case.
            </p>
          </div>

          {/* Section 3 */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 space-y-1.5">
            <h3 className="text-base font-extrabold text-redPrimary flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500" /> 3. HiMistri / Partner Fault (100% Refund)
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
              If a service partner is unavailable or if HiMistri cancels the order due to operational reasons, <strong>NO penalty</strong> will be charged, and a 100% refund will be issued to the original payment method.
            </p>
          </div>

          {/* Section 4 */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 space-y-1.5">
            <h3 className="text-base font-extrabold text-redPrimary flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-purple-500" /> 4. Wrong Information & Unreachability
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
              If the customer provides an incorrect address or is unreachable at the time of service fulfillment, a damage fee equivalent to the full service value will apply.
            </p>
          </div>

          {/* Section 5 */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 space-y-1.5">
            <h3 className="text-base font-extrabold text-redPrimary flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-blue-500" /> 5. Refund Processing
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
              Refunds are processed back to the original payment method or issued as HiMistri app credits. Bank reflection time depends on respective bank policies.
            </p>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
