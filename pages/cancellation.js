import React, { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { RotateCcw, Clock, AlertTriangle } from 'lucide-react';

export default function CancellationPage() {
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
            <RotateCcw className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-black">Cancellation & Refund Policy</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">Order Cancellation Rules & Refund Guidelines for HiMistri</p>
          </div>
        </div>

        <div className="web-card space-y-6 leading-relaxed text-sm">
          <p>
            Please read our order cancellation and refund rules carefully before placing a service order on <strong className="text-redPrimary">himistri.techcoders.in</strong>.
          </p>

          <div>
            <h3 className="text-base font-extrabold text-redPrimary mb-2 flex items-center gap-2">
              <Clock className="w-4 h-4" /> 1. Free Cancellation Window (1 Minute)
            </h3>
            <p className="text-xs text-slate-400">
              Customers may cancel any service order <strong>FREE OF CHARGE</strong> within <strong>1 MINUTE</strong> of placing it on the platform.
            </p>
          </div>

          <div>
            <h3 className="text-base font-extrabold text-redPrimary mb-2 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-orangeSecondary" /> 2. Cancellation Penalty After 1 Minute
            </h3>
            <p className="text-xs text-slate-400">
              If an order is cancelled AFTER the 1-minute window, a 100% cancellation fee applies to compensate the assigned craftsman/partner for travel and reserved time slot.
            </p>
          </div>

          <div>
            <h3 className="text-base font-extrabold text-redPrimary mb-2">3. Refund Processing Time</h3>
            <p className="text-xs text-slate-400">
              Eligible refunds for orders cancelled within the free 1-minute window will be processed back to the original online payment method within 5-7 business days.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
