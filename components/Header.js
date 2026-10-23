import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../lib/AuthContext';
import { Sun, Moon, Phone, User, MapPin, ChevronDown, UserCircle, Map, LogOut, ShieldCheck, HardHat, FileText, Menu, X, Home, Layers, Wrench, Bell, Star } from 'lucide-react';
import { ref, onValue } from 'firebase/database';
import { rtdb } from '../lib/firebase';

export default function Header({ isDark, onToggleTheme }) {
  const router = useRouter();
  const { currentUser, logout, isAuthLoaded } = useAuth();
  const [gpsText, setGpsText] = useState('Gangtok, Sikkim (Upper Syari, Deorali & Surrounding)');

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [unreadNotifCount, setUnreadNotifCount] = useState(0);
  const [liveUser, setLiveUser] = useState(null);

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

  // Realtime Listener for Personalized Unread Notifications Count for Logged-In Customer
  useEffect(() => {
    if (!currentUser) {
      setUnreadNotifCount(0);
      return;
    }

    const notifsRef = ref(rtdb, 'notifications');
    const userRef = ref(rtdb, `users/${currentUser.id}`);

    const unsubNotifs = onValue(notifsRef, (snapshot) => {
      const allNotifs = [];
      if (snapshot.exists()) {
        const val = snapshot.val();
        if (typeof val === 'object' && val !== null) {
          Object.keys(val).forEach(k => {
            if (val[k]) allNotifs.push({ id: k, ...val[k] });
          });
        }
      }

      onValue(userRef, (userSnap) => {
        let readMap = {};
        let clearedMap = {};
        if (userSnap.exists()) {
          const userData = userSnap.val();
          setLiveUser(userData);
          readMap = userData.readNotifications || {};
          clearedMap = userData.clearedNotifications || {};
        } else {
          setLiveUser(null);
        }

        const isCustomer = !currentUser?.role || currentUser?.role === 'CUSTOMER';

        const unreadList = allNotifs.filter(n => {
          if (clearedMap[n.id] || readMap[n.id]) return false;
          const target = (n.targetAudience || '').toUpperCase().trim();
          if (isCustomer && (target === 'PARTNERS' || target === 'SERVICE_PARTNERS')) {
            return false;
          }
          return true;
        });

        setUnreadNotifCount(unreadList.length);
      });
    });

    return () => unsubNotifs();
  }, [currentUser]);

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

  const isAmazeMember = liveUser?.subscriptionPlan && liveUser?.subscriptionPlan !== 'NONE' && new Date(liveUser?.subscriptionExpiry) > new Date();

  return (
    <header className="sticky top-0 z-50 shadow-2xl">
      {/* Top Black Official Bar */}
      <div className="bg-black text-slate-400 text-[10px] sm:text-xs px-3 sm:px-6 py-1.5 flex justify-between items-center border-b border-neutral-800">
        <span className="font-semibold text-slate-300 truncate">Official Web Portal: <strong className="text-white">himistri.in</strong></span>
        <span className="hidden md:inline shrink-0">100% Background Verified Local Craftsmen in Sikkim</span>
      </div>

      {/* Main Red Brand Header Bar */}
      <div className="header-bar text-white px-3 sm:px-6 py-2.5 sm:py-3.5 flex justify-between items-center">

        {/* Brand Logo & Title */}
        <Link href={isAdmin ? "/admin" : isPartner ? "/partner" : "/"} className="flex items-center gap-2 shrink-0">
          <div>
            <h1 className="text-lg sm:text-2xl font-black tracking-wide leading-tight">HiMistri</h1>
            <p className="text-[9px] sm:text-xs font-medium text-white/90">Sikkim's #1 Doorstep Services</p>
          </div>
        </Link>

        {/* Desktop Navigation Links based on User Role */}
        {isAdmin ? (
          <nav className="hidden lg:flex items-center gap-6 text-xs sm:text-sm font-bold">
            <Link href="/admin" className="underline underline-offset-4 text-amber-300 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-amber-300" /> Admin Control Panel
            </Link>
          </nav>
        ) : isPartner ? (
          <nav className="hidden lg:flex items-center gap-6 text-xs sm:text-sm font-bold">
            <Link href="/partner" className="underline underline-offset-4 text-amber-300 flex items-center gap-1.5">
              <HardHat className="w-4 h-4 text-amber-300" /> Partner Dashboard
            </Link>
          </nav>
        ) : (
          <nav className="hidden lg:flex items-center gap-8 text-xs sm:text-sm font-bold">
            <Link href="/" className={`hover:text-amber-200 transition ${router.pathname === '/' ? 'underline underline-offset-4 text-amber-300' : ''}`}>Home</Link>
            <Link href="/categories" className={`hover:text-amber-200 transition ${router.pathname === '/categories' ? 'underline underline-offset-4 text-amber-300' : ''}`}>Categories</Link>
            <Link href="/services" className={`hover:text-amber-200 transition ${router.pathname === '/services' ? 'underline underline-offset-4 text-amber-300' : ''}`}>Services</Link>
          </nav>
        )}

        {/* Right Action Icons */}
        <div className="flex items-center gap-1.5 sm:gap-2.5">

          {/* Notification Bell Icon */}
          {!isAdmin && !isPartner && (
            <Link
              href="/notifications"
              className="relative bg-white/20 hover:bg-white/30 text-white p-2 sm:p-2.5 rounded-full flex items-center justify-center transition cursor-pointer shrink-0"
              title="View Notifications"
            >
              <Bell className="w-4 h-4 text-white" />
              {unreadNotifCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-redPrimary border border-white text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-md animate-pulse">
                  {unreadNotifCount > 9 ? '9+' : unreadNotifCount}
                </span>
              )}
            </Link>
          )}

          {/* Theme Toggle Button */}
          <button onClick={onToggleTheme} className="bg-white/20 hover:bg-white/30 text-white p-2 sm:px-3.5 sm:py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition shrink-0">
            {isDark ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4 text-slate-100" />}
            <span className="hidden sm:inline">Theme</span>
          </button>

          {/* Helpline Phone Button */}
          <a href="tel:+917430887960" className="bg-white/20 hover:bg-white/30 text-white p-2 sm:px-3.5 sm:py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition shrink-0">
            <Phone className="w-4 h-4 text-emerald-300" />
            <span className="hidden sm:inline">Call Support</span>
          </a>

          {/* User Account / Profile Dropdown */}
          {isAuthLoaded && currentUser ? (
            <div className="relative shrink-0" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="bg-white text-redPrimary hover:bg-slate-100 px-3 py-1.5 rounded-full text-xs font-extrabold flex items-center gap-1 transition shadow-md"
              >
                <User className="w-3.5 h-3.5" />
                <span className="max-w-[65px] sm:max-w-[100px] truncate">{currentUser.fullName.split(' ')[0]}</span>
                <ChevronDown className={`w-3 h-3 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Account Dropdown Menu */}
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-darkSurface rounded-2xl shadow-2xl border border-slate-200 dark:border-neutral-800 overflow-hidden text-slate-800 dark:text-slate-200 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-4 py-3 bg-slate-50 dark:bg-neutral-800/50 border-b border-slate-200 dark:border-neutral-800">
                    <p className="font-extrabold text-sm truncate">{currentUser.fullName}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] text-redPrimary font-bold uppercase tracking-wider">{currentUser.role || 'CUSTOMER'}</span>
                      {isAmazeMember && (
                        <span className="px-2 py-0.5 rounded-md text-[9px] font-black uppercase bg-amber-500/20 text-amber-600 dark:text-amber-500 border border-amber-500/30 flex items-center gap-1">
                          <Star className="w-3 h-3 fill-amber-500" /> Amaze
                        </span>
                      )}
                    </div>
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
          ) : isAuthLoaded && (
            <Link href="/auth" className="bg-white text-redPrimary hover:bg-slate-100 px-3.5 py-1.5 rounded-full text-xs font-extrabold transition shadow-md shrink-0">
              Sign In
            </Link>
          )}

          {/* Mobile & Tablet Hamburger Toggle Button */}
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="lg:hidden p-1.5 rounded-xl hover:bg-white/20 transition shrink-0">
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Sub-Header Bar: GPS Location Strip */}
      <div className="bg-white dark:bg-darkSurface border-b border-slate-200 dark:border-neutral-800 px-3 sm:px-6 py-2 flex justify-between items-center gap-2 text-xs text-slate-700 dark:text-slate-300">
        <div className="flex items-center gap-1.5 truncate">
          <MapPin className="w-3.5 h-3.5 text-redPrimary shrink-0" />
          <span className="font-extrabold text-slate-900 dark:text-white text-[11px] sm:text-xs truncate">{gpsText}</span>
        </div>

        <button onClick={refreshGps} className="text-redPrimary hover:underline font-bold text-[11px] shrink-0">
          Refresh GPS
        </button>
      </div>

      {/* Mobile & Tablet Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-white/95 dark:bg-darkSurface/95 backdrop-blur-md border-b border-slate-200 dark:border-neutral-800 px-4 py-4 space-y-3 font-bold text-xs shadow-2xl text-slate-800 dark:text-slate-200 animate-in fade-in slide-in-from-top-2 duration-200">
          <Link href="/" onClick={() => setIsMobileMenuOpen(false)} className="block py-2 hover:text-redPrimary flex items-center gap-2"><Home className="w-4 h-4 text-redPrimary" /> Home</Link>
          <Link href="/categories" onClick={() => setIsMobileMenuOpen(false)} className="block py-2 hover:text-redPrimary flex items-center gap-2"><Layers className="w-4 h-4 text-redPrimary" /> Explore Categories</Link>
          <Link href="/services" onClick={() => setIsMobileMenuOpen(false)} className="block py-2 hover:text-redPrimary flex items-center gap-2"><Wrench className="w-4 h-4 text-redPrimary" /> Doorstep Services</Link>
          {!isAdmin && !isPartner && (
            <Link href="/notifications" onClick={() => setIsMobileMenuOpen(false)} className="block py-2 hover:text-redPrimary flex items-center gap-2"><Bell className="w-4 h-4 text-redPrimary" /> Notifications ({unreadNotifCount})</Link>
          )}
          <Link href="/tracking" onClick={() => setIsMobileMenuOpen(false)} className="block py-2 hover:text-redPrimary flex items-center gap-2"><FileText className="w-4 h-4 text-redPrimary" /> Order Tracking</Link>
        </div>
      )}
    </header>
  );
}
