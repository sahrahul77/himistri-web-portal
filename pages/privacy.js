import React, { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { ShieldCheck, Lock, Mail, MapPin } from 'lucide-react';

export default function PrivacyPage() {
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
            <ShieldCheck className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-black">Privacy Policy</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">Official Data Protection & Privacy Guidelines for himistri.techcoders.in</p>
          </div>
        </div>

        <div className="web-card space-y-6 leading-relaxed text-sm">
          <p>
            HiMistri ("we", "our", "us") is committed to ensuring that your privacy is protected. This Privacy Policy outlines how personal data collected via our mobile application and web portal (<strong className="text-redPrimary">himistri.techcoders.in</strong>) is handled, stored, and protected.
          </p>

          <div>
            <h3 className="text-base font-extrabold text-redPrimary mb-2">1. Information We Collect</h3>
            <ul className="list-disc pl-5 space-y-1 text-xs text-slate-400">
              <li><strong>Personal Account Details</strong>: Full Name, 10-digit Mobile Number, Email Address, and saved Delivery Addresses in Gangtok, Sikkim.</li>
              <li><strong>Order & Booking Data</strong>: Selected category, service title, scheduled date & time slot, payment method, and special service instructions.</li>
              <li><strong>Technical & GPS Data</strong>: Approximate GPS coordinates for doorstep craftsman dispatching and address auto-fill.</li>
            </ul>
          </div>

          <div>
            <h3 className="text-base font-extrabold text-redPrimary mb-2">2. How We Use Your Data</h3>
            <p className="text-xs text-slate-400">
              Your personal information is used exclusively for processing doorstep service bookings, dispatching verified local craftsmen, communicating live order status updates, and providing 24x7 customer support.
            </p>
          </div>

          <div>
            <h3 className="text-base font-extrabold text-redPrimary mb-2">3. Data Security & Third-Party Sharing</h3>
            <p className="text-xs text-slate-400">
              Your personal data is encrypted and strictly kept secure. We <strong>NEVER</strong> sell or rent your personal information to unauthorized third parties. Personal details are shared only with the assigned HiMistri craftsman/partner for order fulfillment.
            </p>
          </div>

          <div>
            <h3 className="text-base font-extrabold text-redPrimary mb-2">4. User Data Erasure Rights</h3>
            <p className="text-xs text-slate-400">
              Users hold full rights to request account data export or permanent profile deletion at any time by contacting our support team at <strong className="text-white">info@himistri.techcoders.in</strong>.
            </p>
          </div>

          <div className="pt-4 border-t border-slate-200 dark:border-neutral-800 text-xs text-slate-400 space-y-1">
            <p className="font-bold text-white">Sikkim Head Office Contact:</p>
            <p><MapPin className="w-3.5 h-3.5 inline text-redPrimary mr-1" /> Upper Syari Near ICDS center, Dothapu, Near Deorali-Bazar, Gangtok, East Sikkim 737102.</p>
            <p><Mail className="w-3.5 h-3.5 inline text-redPrimary mr-1" /> Phone: +91 7430887960 | Email: info@himistri.techcoders.in</p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
