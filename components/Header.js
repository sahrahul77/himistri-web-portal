import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../lib/AuthContext';
import { Sun, Moon, Phone, User, MapPin, ChevronDown, UserCircle, Map, LogOut, ShieldCheck, HardHat, FileText, Menu, X, Home, Layers, Wrench } from 'lucide-react';

export default function Header({ isDark, onToggleTheme }) {
  const router = useRouter();
  const { currentUser, logout, isAuthLoaded } = useAuth();
  const [gpsText, setGpsText] = useState('Gangtok, Sikkim (Upper Syari, Deorali & Surrounding)');

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const dropdownRef = useRef(null);

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
  const isPartner = currentUser?.role === 'PARTNER' || currentUser?.role === 'SERVICE_PARTNER';

  return (
    <header className="sticky top-0 z-50 shadow-2xl">
      {/* Top Black Official Bar */}
      <div className="bg-black text-slate-400 text-[10px] sm:text-xs px-4 sm:px-6 py-1.5 flex justify-between items-center border-b border-neutral-800">
        <span className="font-semibold text-slate-300 truncate">Official Web Portal: <strong className="text-white">himistri.techcoders.in</strong></span>
        <span className="hidden md:inline shrink-0">100% Background Verified Local Craftsmen in Sikkim</span>
      </div>

      {/* Main Red Brand Header Bar */}
      <div className="header-bar text-white px-4 sm:px-6 py-3.5 flex justify-between items-center">

        {/* Brand Logo & Title */}
        <Link href={isAdmin ? "/admin" : isPartner ? "/partner" : "/"} className="flex items-center gap-2.5 shrink-0">
          <div>
            <h1 className="text-xl sm:text-2xl font-black tracking-wide leading-tight">HiMistri</h1>
            <p className="text-[10px] sm:text-xs font-medium text-white/90">Sikkim's #1 Doorstep Services</p>
          </div>
        </Link>

        {/* Desktop Navigation Links based on User Role */}
        {isAdmin ? (
          <nav className="hidden md:flex items-center gap-6 text-xs sm:text-sm font-bold">
            <Link href="/admin" className="underline underline-offset-4 text-amber-300 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-amber-300" /> Admin Control Panel
            </Link>
          </nav>
        ) : isPartner ? (
          <nav className="hidden md:flex items-center gap-6 text-xs sm:text-sm font-bold">
            <Link href="/partner" className="underline underline-offset-4 text-amber-300 flex items-center gap-1.5">
              <HardHat className="w-4 h-4 text-amber-300" /> Partner Dashboard
            </Link>
          </nav>
        ) : (
          <nav className="hidden md:flex items-center gap-8 text-xs sm:text-sm font-bold">
            <Link href="/" className={`hover:text-amber-200 transition ${router.pathname === '/' ? 'underline underline-offset-4 text-amber-300' : ''}`}>Home</Link>
            <Link href="/categories" className={`hover:text-amber-200 transition ${router.pathname === '/categories' ? 'underline underline-offset-4 text-amber-300' : ''}`}>Categories</Link>
            <Link href="/services" className={`hover:text-amber-200 transition ${router.pathname === '/services' ? 'underline underline-offset-4 text-amber-300' : ''}`}>Services</Link>
          </nav>
        )}

        {/* Right Action Icons (Theme, Phone, Account, Mobile Hamburger) */}
        <div className="flex items-center gap-2 sm:gap-2.5">

          {/* Theme Toggle Button */}
          <button onClick={onToggleTheme} className="bg-white/20 hover:bg-white/30 text-white p-2 sm:px-3.5 sm:py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition">
            {isDark ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4 text-slate-100" />}
            <span className="hidden sm:inline">Theme</span>
          </button>

          {/* Helpline Phone Button */}
          <a href="tel:+917430887960" className="bg-white/20 hover:bg-white/30 text-white p-2 sm:px-3.5 sm:py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition">
            <Phone className="w-4 h-4 text-emerald-300" />
            <span className="hidden sm:inline">Call Support</span>
          </a>

          {/* User Account / Profile Dropdown */}
          {isAuthLoaded && currentUser ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="bg-white text-redPrimary hover:bg-slate-100 px-3 sm:px-4 py-1.5 rounded-full text-xs font-extrabold flex items-center gap-1 sm:gap-1.5 transition shadow-md"
              >
                <User className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="max-w-[70px] sm:max-w-[100px] truncate">{currentUser.fullName.split(' ')[0]}</span>
                <ChevronDown className={`w-3 h-3 sm:w-3.5 sm:h-3.5 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Account Dropdown Menu */}
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-darkSurface rounded-2xl shadow-2xl border border-slate-200 dark:border-neutral-800 overflow-hidden text-slate-800 dark:text-slate-200 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-4 py-3 bg-slate-50 dark:bg-neutral-800/50 border-b border-slate-200 dark:border-neutral-800">
                    <p className="font-extrabold text-sm truncate">{currentUser.fullName}</p>
                    <p className="text-[10px] text-redPrimary font-bold uppercase tracking-wider">{currentUser.role || 'CUSTOMER'}</p>
                  </div>

                  <div className="py-2 flex flex-col">
                    {!isAdmin && !isPartner && (
                      <>
                        <Link href="/profile" onClick={() => setIsDropdownOpen(false)} className="px-4 py-2.5 text-xs font-bold hover:bg-slate-100 dark:hover:bg-neutral-800 flex items-center gap-2">
                          <UserCircle className="w-4 h-4 text-redPrimary" /> My Profile
                        </Link>
                        <Link href="/tracking" onClick={() => setIsDropdownOpen(false)} className="px-4 py-2.5 text-xs font-bold hover:bg-slate-100 dark:hover:bg-neutral-800 flex items-center gap-2">
                          <FileText className="w-4 h-4 text-redPrimary" /> My Orders & Tracking
                        </Link>
                      </>
                    )}

                    {isPartner && (
                      <Link href="/partner" onClick={() => setIsDropdownOpen(false)} className="px-4 py-2.5 text-xs font-bold text-orangeSecondary hover:bg-orangeSecondary/10 flex items-center gap-2">
                        <HardHat className="w-4 h-4" /> Service Partner Dashboard
                      </Link>
                    )}
                    {isAdmin && (
                      <Link href="/admin" onClick={() => setIsDropdownOpen(false)} className="px-4 py-2.5 text-xs font-bold text-redPrimary hover:bg-redPrimary/10 flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4" /> Admin Control Panel
                      </Link>
                    )}
                  </div>

                  <div className="border-t border-slate-200 dark:border-neutral-800 p-2">
                    <button onClick={logout} className="w-full text-left px-3 py-2 text-xs font-extrabold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl flex items-center gap-2 transition">
                      <LogOut className="w-4 h-4" /> Log Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link href="/auth" className="bg-white/20 hover:bg-white/30 text-white px-3.5 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition">
              <User className="w-4 h-4" /> Sign In
            </Link>
          )}

          {/* Mobile Hamburger Toggle Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-xl bg-white/20 hover:bg-white/30 text-white transition ml-1"
            title="Toggle Menu"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer (Visible on Mobile when Toggled) */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-neutral-900 text-white border-b border-neutral-800 px-6 py-4 space-y-3 animate-in slide-in-from-top duration-200 shadow-2xl">
          <nav className="flex flex-col space-y-2 text-xs font-extrabold pt-1">
            <Link href="/" onClick={() => setIsMobileMenuOpen(false)} className="p-2.5 rounded-xl hover:bg-neutral-800 flex items-center gap-2.5">
              <Home className="w-4 h-4 text-redPrimary" /> Home Portal
            </Link>
            <Link href="/categories" onClick={() => setIsMobileMenuOpen(false)} className="p-2.5 rounded-xl hover:bg-neutral-800 flex items-center gap-2.5">
              <Layers className="w-4 h-4 text-redPrimary" /> Explore Categories
            </Link>
            <Link href="/services" onClick={() => setIsMobileMenuOpen(false)} className="p-2.5 rounded-xl hover:bg-neutral-800 flex items-center gap-2.5">
              <Wrench className="w-4 h-4 text-redPrimary" /> Doorstep Services
            </Link>

            {currentUser && !isAdmin && !isPartner && (
              <>
                <Link href="/tracking" onClick={() => setIsMobileMenuOpen(false)} className="p-2.5 rounded-xl hover:bg-neutral-800 flex items-center gap-2.5 text-amber-300">
                  <FileText className="w-4 h-4 text-amber-300" /> My Orders & Tracking
                </Link>
                <Link href="/profile" onClick={() => setIsMobileMenuOpen(false)} className="p-2.5 rounded-xl hover:bg-neutral-800 flex items-center gap-2.5">
                  <UserCircle className="w-4 h-4 text-redPrimary" /> My Profile & Address Book
                </Link>
              </>
            )}

            {isAdmin && (
              <Link href="/admin" onClick={() => setIsMobileMenuOpen(false)} className="p-2.5 rounded-xl bg-redPrimary/20 text-redPrimary flex items-center gap-2.5">
                <ShieldCheck className="w-4 h-4" /> Admin Control Panel
              </Link>
            )}

            {isPartner && (
              <Link href="/partner" onClick={() => setIsMobileMenuOpen(false)} className="p-2.5 rounded-xl bg-orangeSecondary/20 text-orangeSecondary flex items-center gap-2.5">
                <HardHat className="w-4 h-4" /> Service Partner Dashboard
              </Link>
            )}
          </nav>
        </div>
      )}

      {/* GPS Location Strip */}
      <div onClick={refreshGps} className="bg-black/25 text-white px-4 sm:px-6 py-2 flex justify-between items-center text-[11px] sm:text-xs font-semibold cursor-pointer hover:bg-black/35 transition">
        <div className="flex items-center gap-2 truncate pr-2"><MapPin className="w-3.5 h-3.5 text-redPrimary shrink-0" /><span className="truncate">{gpsText}</span></div>
        <span className="underline opacity-80 shrink-0">Refresh GPS</span>
      </div>
    </header>
  );
}
