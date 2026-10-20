import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Sun, Moon, Phone, MessageSquare, User, MapPin } from 'lucide-react';

export default function Header({ isDark, onToggleTheme, currentUser }) {
  const router = Router();
  const [gpsText, setGpsText] = useState('Gangtok, Sikkim (Upper Syari, Deorali & Surrounding)');

  function Router() {
    try {
      return useRouter();
    } catch {
      return { pathname: '/' };
    }
  }

  const refreshGps = () => {
    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setGpsText(`Gangtok, Sikkim (GPS: ${pos.coords.latitude.toFixed(2)}, ${pos.coords.longitude.toFixed(2)})`);
        },
        () => {
          setGpsText('Gangtok, Sikkim (Upper Syari, Deorali & Surrounding)');
        }
      );
    }
  };

  return (
    <header className="sticky top-0 z-50 shadow-xl">
      {/* Top Domain Banner */}
      <div className="bg-black text-slate-400 text-xs px-6 py-1.5 flex justify-between items-center border-b border-neutral-800">
        <span className="font-semibold text-slate-300">
          Official Web Portal: <strong className="text-white">himistri.techcoders.in</strong>
        </span>
        <span className="hidden sm:inline">100% Background Verified Local Craftsmen in Sikkim</span>
      </div>

      {/* Main Red App Bar */}
      <div className="header-bar text-white px-6 py-4 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-3 group">
          <div>
            <h1 className="text-2xl font-black tracking-wide">HiMistri</h1>
            <p className="text-xs font-medium text-white/90">Sikkim's #1 Doorstep Services</p>
          </div>
        </Link>

        {/* Clean Web Navigation Links (Partner & Admin removed from menu) */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-bold">
          <Link href="/" className={`hover:text-amber-200 transition ${router.pathname === '/' ? 'underline underline-offset-4 text-amber-300' : ''}`}>
            Home
          </Link>
          <Link href="/categories" className={`hover:text-amber-200 transition ${router.pathname === '/categories' ? 'underline underline-offset-4 text-amber-300' : ''}`}>
            Categories
          </Link>
          <Link href="/services" className={`hover:text-amber-200 transition ${router.pathname === '/services' ? 'underline underline-offset-4 text-amber-300' : ''}`}>
            Services
          </Link>
          <Link href="/tracking" className={`hover:text-amber-200 transition ${router.pathname === '/tracking' ? 'underline underline-offset-4 text-amber-300' : ''}`}>
            Track Order
          </Link>
          <Link href="/privacy" className={`hover:text-amber-200 transition ${router.pathname === '/privacy' ? 'underline underline-offset-4 text-amber-300' : ''}`}>
            Policies
          </Link>
        </nav>

        <div className="flex items-center gap-2.5">
          <button
            onClick={onToggleTheme}
            className="bg-white/20 hover:bg-white/30 text-white px-3.5 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition"
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4 text-slate-100" />}
            <span className="hidden sm:inline">Theme</span>
          </button>

          <a
            href="tel:+917430887960"
            className="bg-white/20 hover:bg-white/30 text-white px-3.5 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition"
          >
            <Phone className="w-4 h-4" />
            <span className="hidden sm:inline">Call Support</span>
          </a>

          <a
            href="https://wa.me/917430887960"
            target="_blank"
            rel="noreferrer"
            className="bg-white text-emerald-600 hover:bg-emerald-50 px-3.5 py-1.5 rounded-full text-xs font-extrabold flex items-center gap-1.5 transition shadow-sm"
          >
            <MessageSquare className="w-4 h-4 fill-emerald-600" />
            WhatsApp
          </a>

          <Link
            href="/auth"
            className="bg-white/20 hover:bg-white/30 text-white px-3.5 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition"
          >
            <User className="w-4 h-4" />
            {currentUser ? (currentUser.fullName ? currentUser.fullName.split(' ')[0] : 'Account') : 'Sign In'}
          </Link>
        </div>
      </div>

      {/* GPS Location Bar */}
      <div
        onClick={refreshGps}
        className="bg-black/25 text-white px-6 py-2 flex justify-between items-center text-xs font-semibold cursor-pointer hover:bg-black/35 transition"
      >
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-redPrimary" />
          <span>{gpsText}</span>
        </div>
        <span className="underline opacity-80">Refresh GPS</span>
      </div>
    </header>
  );
}
