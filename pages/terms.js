import React, { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { FileText, CheckCircle2 } from 'lucide-react';

export default function TermsPage() {
  const [isDark, setIsDark] = useState(true);

  const toggleTheme = () => {
    setIsDark(!isDark);
    if (!isDark) {
      document.documentElement.classList.add('dark');
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.setAttribute('data-theme', 'light');
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header isDark={isDark} onToggleTheme={toggleTheme} />

      <main className="web-container py-12 flex-1 max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-3 rounded-2xl bg-redPrimary/10 text-redPrimary">
            <FileText className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-black">Terms & Conditions</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">User Obligations & Service Rules for himistri.techcoders.in</p>
          </div>
        </div>

        <div className="web-card space-y-6 leading-relaxed text-sm">
          <p>
            Welcome to HiMistri! By accessing or using our web portal (<strong className="text-redPrimary">himistri.techcoders.in</strong>) or mobile application, you agree to comply with and be bound by the following terms and conditions.
          </p>

          <div>
            <h3 className="text-base font-extrabold text-redPrimary mb-2">1. Scope of Services</h3>
            <p className="text-xs text-slate-400">
              HiMistri provides an on-demand marketplace connecting customers with background-verified technical manpower across 10 categories (Plumber, Electrician, Barber, Cleaner, Carpenter, Tutor, Cook, Contractor, Rider, CCTV) in and around Gangtok, Sikkim.
            </p>
          </div>

          <div>
            <h3 className="text-base font-extrabold text-redPrimary mb-2">2. User Conduct & Obligations</h3>
            <p className="text-xs text-slate-400">
              Users warrant that all contact numbers and delivery addresses provided during booking are accurate. Any unlawful conduct, abuse, or harassment directed towards service partners will result in immediate account termination.
            </p>
          </div>

          <div>
            <h3 className="text-base font-extrabold text-redPrimary mb-2">3. Intellectual Property</h3>
            <p className="text-xs text-slate-400">
              All branding, logos, software design, trademarks, and content on himistri.techcoders.in belong exclusively to HiMistri and Techcoders. Reproduction without prior written authorization is strictly prohibited.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
