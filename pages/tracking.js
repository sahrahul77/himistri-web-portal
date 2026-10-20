import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { ref, onValue } from 'firebase/database';
import { rtdb } from '../lib/firebase';
import { ListFilter, Clock, MapPin, CheckCircle, Star } from 'lucide-react';

export default function TrackingPage() {
  const [isDark, setIsDark] = useState(true);
  const [bookings, setBookings] = useState([]);

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

  useEffect(() => {
    const bookingsRef = ref(rtdb, 'bookings');
    const unsubscribe = onValue(bookingsRef, (snapshot) => {
      const list = [];
      if (snapshot.exists()) {
        snapshot.forEach((child) => {
          list.push({ id: child.key, ...child.val() });
        });
      }
      setBookings(list);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <Header isDark={isDark} onToggleTheme={toggleTheme} />

      <main className="web-container py-10 flex-1 max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 rounded-xl bg-redPrimary/10 text-redPrimary">
            <ListFilter className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black">My Bookings & Live Order Tracking</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">Track real-time status updates and review completed services</p>
          </div>
        </div>

        {bookings.length === 0 ? (
          <div className="web-card text-center py-12 text-slate-500">
            <Clock className="w-12 h-12 mx-auto mb-3 opacity-40" />
            <p className="font-bold text-sm">No active bookings found in database.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((b) => (
              <div key={b.id} className="web-card space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-black text-base">Ref: {b.bookingRef || b.id}</span>
                  <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-orangeSecondary/15 text-orangeSecondary">
                    {b.status || 'PENDING'}
                  </span>
                </div>

                <div className="flex justify-between items-baseline border-b border-slate-100 dark:border-neutral-800 pb-3">
                  <div>
                    <h3 className="font-extrabold text-lg">{b.serviceTitle || 'Service'}</h3>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                      <MapPin className="w-3.5 h-3.5 text-redPrimary" /> Address: {b.address || 'Gangtok'}
                    </p>
                  </div>
                  <span className="text-xl font-black text-redPrimary">₹{b.totalAmount || 500}</span>
                </div>

                <div className="p-3 rounded-xl bg-orangeSecondary/10 border border-orangeSecondary/20 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-orangeSecondary" />
                  <span className="text-xs font-bold text-orangeSecondary">
                    Live Status: {b.trackingStatus || 'Order Placed by Customer'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
