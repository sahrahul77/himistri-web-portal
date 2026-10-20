import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../lib/AuthContext';
import { Sun, Moon, Phone, MessageSquare, User, MapPin, ChevronDown, UserCircle, Map, LogOut, ShieldCheck, HardHat } from 'lucide-react';

export default function Header({ isDark, onToggleTheme }) {
  const router = Router();
  const { currentUser, logout, isAuthLoaded } = useAuth();
  const [gpsText, setGpsText] = useState('Gangtok, Sikkim (Upper Syari, Deorali & Surrounding)');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  function Router() {
    try { return useRouter(); } catch { return { pathname: '/' }; }
  }

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownRef]);

  const refreshGps = () => {
    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setGpsText(`Gangtok, Sikkim (GPS: ${pos.coords.latitude.toFixed(2)}, ${pos.coords.longitude.toFixed(2)})`),
        () => setGpsText('Gangtok, Sikkim (Upper Syari, Deorali & Surrounding)')
      );
    }
  };

  const isAdmin = currentUser?.role === 'ADMIN';
  const isPartner = currentUser?.role === 'PARTNER' || isAdmin;

  return (
    <header className="sticky top-0 z-50 shadow-xl">
      <div className="bg-black text-slate-400 text-xs px-6 py-1.5 flex justify-between items-center border-b border-neutral-800">
        <span className="font-semibold text-slate-300">Official Web Portal: <strong className="text-white">himistri.techcoders.in</strong></span>
        <span className="hidden sm:inline">100% Background Verified Local Craftsmen in Sikkim</span>
      </div>

      <div className="header-bar text-white px-6 py-4 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-3 group">
          <div>
            <h1 className="text-2xl font-black tracking-wide">HiMistri</h1>
            <p className="text-xs font-medium text-white/90">Sikkim's #1 Doorstep Services</p>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-sm font-bold">
          <Link href="/" className={`hover:text-amber-200 transition ${router.pathname === '/' ? 'underline underline-offset-4 text-amber-300' : ''}`}>Home</Link>
          <Link href="/categories" className={`hover:text-amber-200 transition ${router.pathname === '/categories' ? 'underline underline-offset-4 text-amber-300' : ''}`}>Categories</Link>
          <Link href="/services" className={`hover:text-amber-200 transition ${router.pathname === '/services' ? 'underline underline-offset-4 text-amber-300' : ''}`}>Services</Link>
          <Link href="/tracking" className={`hover:text-amber-200 transition ${router.pathname === '/tracking' ? 'underline underline-offset-4 text-amber-300' : ''}`}>Track Order</Link>
        </nav>

        <div className="flex items-center gap-2.5">
          <button onClick={onToggleTheme} className="bg-white/20 hover:bg-white/30 text-white px-3.5 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition">
            {isDark ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4 text-slate-100" />}
            <span className="hidden sm:inline">Theme</span>
          </button>

          <a href="tel:+917430887960" className="bg-white/20 hover:bg-white/30 text-white px-3.5 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition">
            <Phone className="w-4 h-4" />
            <span className="hidden sm:inline">Call Support</span>
          </a>

          <a href="https://wa.me/917430887960" target="_blank" rel="noreferrer" className="bg-white text-emerald-600 hover:bg-emerald-50 px-3.5 py-1.5 rounded-full text-xs font-extrabold flex items-center gap-1.5 transition shadow-sm hidden lg:flex">
            <MessageSquare className="w-4 h-4 fill-emerald-600" /> WhatsApp
          </a>

          {/* User Account Dropdown Menu */}
          {isAuthLoaded && currentUser ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="bg-white text-redPrimary hover:bg-slate-100 px-4 py-1.5 rounded-full text-xs font-extrabold flex items-center gap-1.5 transition shadow-md"
              >
                <User className="w-4 h-4" />
                {currentUser.fullName.split(' ')[0]}
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-darkSurface rounded-xl shadow-2xl border border-slate-200 dark:border-neutral-800 overflow-hidden text-slate-800 dark:text-slate-200 z-50">
                  <div className="px-4 py-3 bg-slate-50 dark:bg-neutral-800/50 border-b border-slate-200 dark:border-neutral-800">
                    <p className="font-bold text-sm truncate">{currentUser.fullName}</p>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{currentUser.role}</p>
                  </div>

                  <div className="py-2 flex flex-col">
                    <Link href="/tracking" onClick={() => setIsDropdownOpen(false)} className="px-4 py-2 text-sm font-semibold hover:bg-slate-100 dark:hover:bg-neutral-800 flex items-center gap-2">
                      <UserCircle className="w-4 h-4 text-slate-400" /> My Profile & Orders
                    </Link>
                    <button onClick={() => { setIsDropdownOpen(false); alert('Address Book: Navigate to Profile to add addresses.'); }} className="px-4 py-2 text-sm font-semibold hover:bg-slate-100 dark:hover:bg-neutral-800 flex items-center gap-2 text-left">
                      <Map className="w-4 h-4 text-slate-400" /> Saved Addresses
                    </button>

                    {isPartner && (
                      <Link href="/partner" onClick={() => setIsDropdownOpen(false)} className="px-4 py-2 text-sm font-bold text-orangeSecondary hover:bg-orangeSecondary/10 flex items-center gap-2 border-t border-slate-100 dark:border-neutral-800 mt-1 pt-3">
                        <HardHat className="w-4 h-4" /> Partner Dashboard
                      </Link>
                    )}
                    {isAdmin && (
                      <Link href="/admin" onClick={() => setIsDropdownOpen(false)} className="px-4 py-2 text-sm font-bold text-redPrimary hover:bg-redPrimary/10 flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4" /> Admin Control Panel
                      </Link>
                    )}
                  </div>

                  <div className="border-t border-slate-200 dark:border-neutral-800 p-2">
                    <button onClick={logout} className="w-full text-left px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg flex items-center gap-2 transition">
                      <LogOut className="w-4 h-4" /> Secure Log Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link href="/auth" className="bg-white/20 hover:bg-white/30 text-white px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition">
              <User className="w-4 h-4" /> Sign In
            </Link>
          )}
        </div>
      </div>

      <div onClick={refreshGps} className="bg-black/25 text-white px-6 py-2 flex justify-between items-center text-xs font-semibold cursor-pointer hover:bg-black/35 transition">
        <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-redPrimary" /><span>{gpsText}</span></div>
        <span className="underline opacity-80">Refresh GPS</span>
      </div>
    </header>
  );
}
