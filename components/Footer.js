import React from 'react';
import Link from 'next/link';
import { Phone, Mail, MapPin, ShieldCheck } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-white dark:bg-darkSurface border-t border-slate-200 dark:border-neutral-800 mt-16 text-slate-600 dark:text-slate-400">
      <div className="web-container py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <h3 className="text-xl font-black text-redPrimary mb-2">HiMistri Web</h3>
          <p className="text-xs leading-relaxed mb-4">
            HiMistri is a Gangtok-based start-up company established in 2022 that provides technical manpower at doorstep at minimum cost and maximum benefits across Sikkim.
          </p>
          <div className="text-xs font-bold text-emerald-600 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4" /> 100% Background Verified Craftsmen
          </div>
        </div>

        <div>
          <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-3">Quick Links</h4>
          <ul className="space-y-2 text-xs font-semibold">
            <li><Link href="/" className="hover:text-redPrimary">Home Page</Link></li>
            <li><Link href="/categories" className="hover:text-redPrimary">Explore Categories</Link></li>
            <li><Link href="/services" className="hover:text-redPrimary">Services Catalog</Link></li>
            <li><Link href="/tracking" className="hover:text-redPrimary">Track My Booking</Link></li>
            <li><Link href="/about" className="hover:text-redPrimary">About HiMistri</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-3">Legal & Policies</h4>
          <ul className="space-y-2 text-xs font-semibold">
            <li><Link href="/privacy" className="hover:text-redPrimary">Privacy Policy</Link></li>
            <li><Link href="/terms" className="hover:text-redPrimary">Terms & Conditions</Link></li>
            <li><Link href="/cancellation" className="hover:text-redPrimary">Cancellation & Refund Policy</Link></li>
            <li><Link href="/auth" className="hover:text-redPrimary">Sign In / Register Account</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-3">Sikkim Head Office</h4>
          <p className="text-xs flex items-start gap-2 mb-2">
            <MapPin className="w-4 h-4 text-redPrimary shrink-0 mt-0.5" />
            <span>Upper Syari Near ICDS center, Dothapu, Near Deorali-Bazar, Gangtok, East Sikkim. PIN: 737102</span>
          </p>
          <p className="text-xs flex items-center gap-2 mb-2">
            <Phone className="w-4 h-4 text-redPrimary" />
            <span>+91 7430887960 (24x7 Support)</span>
          </p>
          <p className="text-xs flex items-center gap-2">
            <Mail className="w-4 h-4 text-redPrimary" />
            <span>info@himistri.techcoders.in</span>
          </p>
        </div>
      </div>

      <div className="bg-black text-slate-500 py-4 text-center text-xs border-t border-neutral-800">
        HiMistri Platform &copy; 2026. Official Web Portal: <strong>himistri.techcoders.in</strong>. All Rights Reserved.
      </div>
    </footer>
  );
}
