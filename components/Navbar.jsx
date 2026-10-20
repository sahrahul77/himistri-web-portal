import React from 'react';
import { Sun, Moon, Phone, MessageSquare, User, MapPin } from 'lucide-react';

export default function Navbar({ isDark, onToggleTheme, onOpenAuth, locationText, onRefreshGps }) {
  return (
    <header className="sticky top-0 z-50 shadow-md">
      {/* Official Domain Banner */}
      <div className="bg-black text-slate-400 text-xs px-6 py-1.5 flex justify-between items-center border-b border-neutral-800">
        <span className="font-semibold text-slate-300">Official Web Portal: <strong className="text-white">himistri.techcoders.in</strong></span>
        <span>100% Background Verified Craftsmen in Sikkim</span>
      </div>

      {/* Main Red App Bar */}
      <div className="bg-gradient-to-r from-redPrimary to-redDark text-white px-6 py-3.5 flex justify-between items-center">
        <div className="flex items-center gap-3 cursor-pointer">
          <div>
            <h1 className="text-2xl font-black tracking-wide">HiMistri</h1>
            <p className="text-xs font-medium text-white/90">Sikkim's #1 Doorstep Services</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={onToggleTheme}
            className="bg-white/20 hover:bg-white/30 text-white px-3.5 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition"
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4 text-slate-100" />}
            Theme
          </button>

          <a
            href="tel:+917430887960"
            className="bg-white/20 hover:bg-white/30 text-white px-3.5 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition"
          >
            <Phone className="w-4 h-4" />
            Call Support
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

          <button
            onClick={onOpenAuth}
            className="bg-white/20 hover:bg-white/30 text-white px-3.5 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition"
          >
            <User className="w-4 h-4" />
            Sign In
          </button>
        </div>
      </div>

      {/* GPS Location Bar */}
      <div
        onClick={onRefreshGps}
        className="bg-black/20 text-white px-6 py-2 flex justify-between items-center text-xs font-semibold cursor-pointer hover:bg-black/30 transition"
      >
        <div className="flex items-center gap-1.5">
          <MapPin className="w-4 h-4 text-redPrimary" />
          <span>{locationText}</span>
        </div>
        <span className="underline opacity-80">Refresh GPS</span>
      </div>
    </header>
  );
}
