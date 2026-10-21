import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Phone, Mail, MapPin, ShieldCheck, Send, CheckCircle2, Heart, ExternalLink, ChevronRight, ChevronUp } from 'lucide-react';

export default function Footer() {
  const [emailInput, setEmailInput] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [showTopBtn, setShowTopBtn] = useState(false);

  // Monitor Scroll Position for Bottom-to-Top Button
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowTopBtn(true);
      } else {
        setShowTopBtn(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!emailInput) return;
    setSubscribed(true);
    setEmailInput('');
  };

  return (
    <footer className="bg-slate-950 text-slate-300 border-t border-neutral-800 mt-20 relative overflow-hidden">
      {/* Background Subtle Red Glow */}
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-96 h-96 bg-redPrimary/10 rounded-full blur-3xl pointer-events-none" />

      {/* Newsletter Subscription Banner */}
      <div className="border-b border-neutral-800 py-10 bg-neutral-900/50 backdrop-blur-md">
        <div className="web-container flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-center md:text-left">
            <span className="text-xs font-black uppercase text-redPrimary tracking-wider">Stay Connected</span>
            <h3 className="text-xl sm:text-2xl font-black text-white mt-0.5">Subscribe to Sikkim Service Alerts</h3>
            <p className="text-xs text-slate-400 mt-1">Get instant doorstep discount offers & technician availability updates in Gangtok</p>
          </div>

          <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row w-full md:w-auto gap-2">
            <input
              type="email"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              placeholder="Enter your email address"
              className="px-4 py-3 rounded-xl bg-neutral-800 border border-neutral-700 text-white text-xs outline-none focus:border-redPrimary min-w-[240px] sm:min-w-[280px]"
            />
            <button type="submit" className="btn-primary text-xs py-3 px-6 whitespace-nowrap justify-center">
              {subscribed ? <CheckCircle2 className="w-4 h-4 text-emerald-400 inline mr-1" /> : <Send className="w-4 h-4 inline mr-1" />}
              {subscribed ? 'Subscribed!' : 'Subscribe'}
            </button>
          </form>
        </div>
      </div>

      {/* Main Footer Links & Information */}
      <div className="web-container py-12 sm:py-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10">

        {/* Brand Information */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <h3 className="text-2xl font-black text-white">HiMistri</h3>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-redPrimary text-white">SIKKIM</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            HiMistri is a Gangtok-based start-up established in 2022 providing doorstep technical manpower across Sikkim with maximum quality and transparent pricing.
          </p>
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 bg-emerald-950/40 p-3 rounded-xl border border-emerald-800/30">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>100% Background Verified Local Craftsmen</span>
          </div>
        </div>

        {/* Quick Navigation */}
        <div>
          <h4 className="text-sm font-black text-white uppercase tracking-wider mb-4 border-l-2 border-redPrimary pl-2">Quick Navigation</h4>
          <ul className="space-y-2.5 text-xs font-semibold">
            <li><Link href="/" className="hover:text-redPrimary transition flex items-center gap-1.5"><ChevronRight className="w-3.5 h-3.5 text-redPrimary shrink-0" /> Home Portal</Link></li>
            <li><Link href="/categories" className="hover:text-redPrimary transition flex items-center gap-1.5"><ChevronRight className="w-3.5 h-3.5 text-redPrimary shrink-0" /> Explore Categories</Link></li>
            <li><Link href="/services" className="hover:text-redPrimary transition flex items-center gap-1.5"><ChevronRight className="w-3.5 h-3.5 text-redPrimary shrink-0" /> Doorstep Services Catalog</Link></li>
            <li><Link href="/tracking" className="hover:text-redPrimary transition flex items-center gap-1.5"><ChevronRight className="w-3.5 h-3.5 text-redPrimary shrink-0" /> Track Order Status</Link></li>
            <li><Link href="/profile" className="hover:text-redPrimary transition flex items-center gap-1.5"><ChevronRight className="w-3.5 h-3.5 text-redPrimary shrink-0" /> My Profile & Address Book</Link></li>
          </ul>
        </div>

        {/* Customer Account & Portal Links */}
        <div>
          <h4 className="text-sm font-black text-white uppercase tracking-wider mb-4 border-l-2 border-redPrimary pl-2">Portal Access</h4>
          <ul className="space-y-2.5 text-xs font-semibold">
            <li><Link href="/auth" className="hover:text-redPrimary transition flex items-center gap-1.5"><ChevronRight className="w-3.5 h-3.5 text-redPrimary shrink-0" /> Customer Sign In / Register</Link></li>
            <li><Link href="/partner" className="hover:text-redPrimary transition flex items-center gap-1.5"><ChevronRight className="w-3.5 h-3.5 text-redPrimary shrink-0" /> Service Partner Dashboard</Link></li>
            <li><Link href="/admin" className="hover:text-redPrimary transition flex items-center gap-1.5"><ChevronRight className="w-3.5 h-3.5 text-redPrimary shrink-0" /> Admin Control Panel</Link></li>
          </ul>
        </div>

        {/* Sikkim Head Office Contact Info */}
        <div className="space-y-3">
          <h4 className="text-sm font-black text-white uppercase tracking-wider mb-4 border-l-2 border-redPrimary pl-2">Sikkim Head Office</h4>
          <p className="text-xs flex items-start gap-2.5 text-slate-300 leading-relaxed">
            <MapPin className="w-4 h-4 text-redPrimary shrink-0 mt-0.5" />
            <span>Upper Syari Near ICDS center, Dothapu, Near Deorali-Bazar, Gangtok, East Sikkim 737102</span>
          </p>
          <p className="text-xs flex items-center gap-2.5 text-slate-300">
            <Phone className="w-4 h-4 text-redPrimary shrink-0" />
            <a href="tel:+917430887960" className="hover:underline">+91 7430887960 (24x7 Helpline)</a>
          </p>
          <p className="text-xs flex items-center gap-2.5 text-slate-300">
            <Mail className="w-4 h-4 text-redPrimary shrink-0" />
            <a href="mailto:info@himistri.techcoders.in" className="hover:underline">info@himistri.techcoders.in</a>
          </p>
          <a
            href="https://maps.google.com/?q=Upper+Syari+Gangtok"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-[11px] font-bold text-amber-400 hover:underline pt-1"
          >
            Open in Google Maps <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      {/* Service Towns Footer Strip */}
      <div className="bg-black/60 border-t border-neutral-800 py-3 text-[11px] text-slate-500 text-center">
        <div className="web-container flex flex-col sm:flex-row justify-between items-center gap-2">
          <span>Active Coverage: <strong className="text-slate-400">Gangtok (Upper Syari, Deorali, Chandmari, Burtuk), Singtam, Pakyong, Rangpo & Namchi</strong></span>
          <span className="flex items-center gap-1">Crafted with <Heart className="w-3 h-3 text-redPrimary fill-redPrimary" /> for Sikkim</span>
        </div>
      </div>

      {/* Copyright Strip */}
      <div className="bg-black py-4 text-center text-xs text-slate-500 border-t border-neutral-900">
        HiMistri Platform &copy; 2026. Official Domain: <strong className="text-slate-300">himistri.techcoders.in</strong>. All Rights Reserved.
      </div>

      {/* FLOATING BOTTOM-TO-TOP SCROLL BUTTON ACROSS ENTIRE WEBSITE */}
      {showTopBtn && (
        <button
          type="button"
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-50 p-3.5 rounded-2xl bg-redPrimary hover:bg-redDark text-white shadow-2xl transition-all duration-300 scale-100 hover:scale-110 flex items-center justify-center border border-white/20 cursor-pointer"
          title="Scroll to Top"
        >
          <ChevronUp className="w-6 h-6" />
        </button>
      )}
    </footer>
  );
}
