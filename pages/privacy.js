import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { ShieldCheck, Lock, Mail, MapPin, Phone, CheckCircle2 } from 'lucide-react';

export default function PrivacyPage() {
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
            <ShieldCheck className="w-8 h-8 text-redPrimary" />
          </div>
          <div>
            <span className="text-xs font-black uppercase text-redPrimary tracking-widest">Legal & Policies</span>
            <h1 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white mt-0.5">Privacy Policy</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-1">
              HiMistri is committed to ensuring that your privacy is protected. This policy outlines how personal data collected via our application and website (https://himistri.techcoders.in) is handled.
            </p>
          </div>
        </div>

        <div className="web-card space-y-6 leading-relaxed text-sm bg-white dark:bg-[#1A1A1A] border border-slate-200 dark:border-[#333333] p-6 sm:p-8 rounded-3xl shadow-xl">

          {/* Section 1 */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 space-y-2">
            <h3 className="text-base font-extrabold text-redPrimary flex items-center gap-2">
              <Lock className="w-4 h-4 text-redPrimary" /> 1. Data We Collect
            </h3>
            <ul className="list-disc pl-5 space-y-1.5 text-xs text-slate-600 dark:text-slate-300 font-medium">
              <li><strong>Account Data</strong>: Name, mobile number, email address, and service addresses in Gangtok, Sikkim.</li>
              <li><strong>Service Data</strong>: Booking details, selected date/time, address, and special notes.</li>
              <li><strong>Analytics & Cookies</strong>: Technical device specifications and usage statistics for app performance.</li>
            </ul>
          </div>

          {/* Section 2 */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 space-y-1.5">
            <h3 className="text-base font-extrabold text-redPrimary flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500" /> 2. Data Sharing & Security
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
              Your personal data is strictly kept secure and is <strong>NEVER</strong> sold or shared with external unauthorized third parties. Personal details are shared only with the assigned HiMistri service provider/partner for order fulfillment.
            </p>
          </div>

          {/* Section 3 */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 space-y-1.5">
            <h3 className="text-base font-extrabold text-redPrimary flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-blue-500" /> 3. User Rights & Data Erasure
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
              Users have full rights to request an exported copy of their personal data or request profile deletion at any time by contacting our support team at <strong className="text-redPrimary">info@himistri.techcoders.in</strong>.
            </p>
          </div>

          {/* Section 4 */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 space-y-1.5">
            <h3 className="text-base font-extrabold text-redPrimary flex items-center gap-2">
              <MapPin className="w-4 h-4 text-amber-500" /> 4. Contact Information
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
              Upper Syari Near ICDS center, Dothapu, Near Deorali-Bazar, Gangtok, East Sikkim 737102.<br />
              <strong>Phone</strong>: +91 7430887960 | <strong>Email</strong>: info@himistri.techcoders.in
            </p>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
