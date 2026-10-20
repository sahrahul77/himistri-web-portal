import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { ref, onValue, update, remove } from 'firebase/database';
import { rtdb } from '../lib/firebase';
import { useAuth } from '../lib/AuthContext';
import { ListFilter, Clock, MapPin, CheckCircle2, Star, AlertCircle, X, Send, Lock, LogIn } from 'lucide-react';

export default function TrackingPage() {
  const [isDark, setIsDark] = useState(true);
  const [activeTab, setActiveTab] = useState(0); // 0 = Active, 1 = Completed / History
  const [bookings, setBookings] = useState([]);

  const { currentUser, isAuthLoaded } = useAuth();

  // Rating Modal States
  const [ratingBooking, setRatingBooking] = useState(null);
  const [starCount, setStarCount] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

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

  const handleCancelBooking = (bookingId) => {
    if (confirm('Cancel this booking free of charge?')) {
      update(ref(rtdb, `bookings/${bookingId}`), {
        status: 'CANCELLED',
        trackingStatus: 'Order Cancelled by Customer'
      }).then(() => alert('Booking cancelled successfully.'));
    }
  };

  const handleSubmitRating = (e) => {
    e.preventDefault();
    if (!ratingBooking) return;
    setIsSubmittingReview(true);

    update(ref(rtdb, `bookings/${ratingBooking.id}`), {
      userRating: starCount,
      userReview: reviewText
    }).then(() => {
      setIsSubmittingReview(false);
      alert('Thank you for rating your service!');
      setRatingBooking(null);
      setReviewText('');
    });
  };

  // Filter bookings specifically for the logged in customer
  const userBookings = bookings.filter(b => {
    if (!currentUser) return false;
    if (currentUser.role === 'ADMIN') return true;
    const cleanUserPhone = (currentUser.phoneNumber || '').replace(/\D/g, '').slice(-10);
    const cleanCustPhone = (b.customerPhone || b.userPhone || '').replace(/\D/g, '').slice(-10);
    return (cleanUserPhone.length >= 10 && cleanUserPhone === cleanCustPhone) || b.userId === currentUser.id;
  });

  const activeBookings = userBookings.filter(b => b.status !== 'COMPLETED' && b.status !== 'CANCELLED' && b.status !== 'REJECTED');
  const completedBookings = userBookings.filter(b => b.status === 'COMPLETED' || b.status === 'CANCELLED');

  const displayedList = activeTab === 0 ? activeBookings : completedBookings;

  return (
    <div className="flex flex-col min-h-screen">
      <Header isDark={isDark} onToggleTheme={toggleTheme} currentUser={currentUser} />

      <main className="web-container py-8 flex-1 max-w-4xl mx-auto space-y-6">
        {!isAuthLoaded ? (
          <div className="web-card text-center py-16 text-slate-500">Loading secure session...</div>
        ) : !currentUser ? (
          <div className="web-card text-center py-16 space-y-4 shadow-xl">
            <Lock className="w-16 h-16 text-redPrimary mx-auto" />
            <h2 className="text-2xl font-black">Login Required</h2>
            <p className="text-xs text-slate-500">Please sign in to view your active bookings and order history.</p>
            <Link href="/auth" className="btn-primary inline-flex mt-2">
              <LogIn className="w-4 h-4" /> Sign In / Register
            </Link>
          </div>
        ) : (
          <>
            {/* Top Red Header (Matching Mobile App Banner) */}
            <div className="bg-redPrimary text-white p-5 rounded-2xl shadow-xl flex justify-between items-center">
              <h1 className="text-2xl font-black tracking-wide">
                My Bookings History
              </h1>
              <span className="text-xs font-bold bg-white/20 px-3 py-1 rounded-full">
                {currentUser.fullName}
              </span>
            </div>

            {/* 2 Navigation Tabs (Exact Replica of Mobile App Design) */}
            <div className="flex border-b border-neutral-800">
              <button
                onClick={() => setActiveTab(0)}
                className={`flex-1 py-3 text-center text-xs sm:text-sm font-black border-b-2 transition ${
                  activeTab === 0
                    ? 'border-b-redPrimary text-redPrimary'
                    : 'border-b-transparent text-slate-400 hover:text-white'
                }`}
              >
                Active ({activeBookings.length})
              </button>

              <button
                onClick={() => setActiveTab(1)}
                className={`flex-1 py-3 text-center text-xs sm:text-sm font-black border-b-2 transition ${
                  activeTab === 1
                    ? 'border-b-redPrimary text-redPrimary'
                    : 'border-b-transparent text-slate-400 hover:text-white'
                }`}
              >
                Completed / History ({completedBookings.length})
              </button>
            </div>

            {/* Bookings Content */}
            {displayedList.length === 0 ? (
              <div className="web-card py-20 text-center text-slate-500 space-y-2 border-dashed">
                <Clock className="w-12 h-12 mx-auto text-slate-600 opacity-40 mb-2" />
                <p className="text-sm font-bold">No bookings found in this section.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {displayedList.map((b) => (
                  <div key={b.id} className="web-card space-y-4 shadow-xl border-t-4 border-t-redPrimary">
                    <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-neutral-800">
                      <span className="font-extrabold text-sm text-slate-500">
                        Ref ID: <strong className="text-slate-800 dark:text-slate-200">{b.bookingRef || b.id}</strong>
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                        b.status === 'COMPLETED' ? 'bg-emerald-600/15 text-emerald-600' :
                        b.status === 'CANCELLED' ? 'bg-rose-600/15 text-rose-600' : 'bg-orangeSecondary/15 text-orangeSecondary'
                      }`}>
                        {b.status || 'PENDING'}
                      </span>
                    </div>

                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-black text-xl mb-1">{b.serviceTitle} <span className="text-xs text-slate-500 font-bold ml-1">(Qty: {b.quantity || 1})</span></h3>
                        <p className="text-xs font-bold text-slate-500 flex items-center gap-1 mt-1">
                          <MapPin className="w-3.5 h-3.5 text-redPrimary" /> Address: {b.address || 'Gangtok'}
                        </p>
                        <p className="text-xs font-bold text-redPrimary mt-1">
                          Scheduled: {b.scheduledDate} | {b.scheduledTimeSlot}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-2xl font-black text-redPrimary">₹{b.totalAmount || 500}</span>
                        <span className="block text-[10px] font-extrabold text-slate-400 uppercase mt-0.5">{b.paymentMethod || 'COD'}</span>
                      </div>
                    </div>

                    {/* Live Tracking Status */}
                    <div className="p-3 rounded-xl bg-orangeSecondary/10 border border-orangeSecondary/20 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-orangeSecondary" />
                      <span className="text-xs font-bold text-orangeSecondary">
                        Live Status: {b.trackingStatus || 'Order Placed by Customer'}
                      </span>
                    </div>

                    {/* Partner Assignment Details if assigned */}
                    {b.assignedPartnerName && (
                      <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs flex justify-between items-center text-blue-400">
                        <div>
                          <strong>Assigned Mistri: {b.assignedPartnerName}</strong> ({b.assignedPartnerSkill || 'Specialist'})
                        </div>
                        {b.assignedPartnerPhone && (
                          <a href={`tel:${b.assignedPartnerPhone}`} className="text-emerald-500 font-bold underline">Call Mistri</a>
                        )}
                      </div>
                    )}

                    {/* Actions: Cancellation or Star Rating */}
                    <div className="pt-2 flex justify-between items-center">
                      {b.status === 'PENDING' && (
                        <button
                          onClick={() => handleCancelBooking(b.id)}
                          className="bg-rose-800/80 hover:bg-rose-800 text-white text-xs font-bold px-4 py-2 rounded-xl transition"
                        >
                          Cancel Booking (Free within 1 min)
                        </button>
                      )}

                      {b.status === 'COMPLETED' && (
                        <div className="w-full flex justify-between items-center">
                          {b.userRating ? (
                            <div className="flex items-center gap-1.5 text-xs text-amber-400 font-bold">
                              <span>Your Rating: {b.userRating} ★</span>
                              {b.userReview && <span className="text-slate-400 font-normal italic">("{b.userReview}")</span>}
                            </div>
                          ) : (
                            <button
                              onClick={() => setRatingBooking(b)}
                              className="btn-primary text-xs py-2 px-4 ml-auto"
                            >
                              <Star className="w-3.5 h-3.5 fill-amber-400" /> Rate & Review Service
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </main>

      {/* Star Rating Modal */}
      {ratingBooking && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-darkSurface border border-slate-200 dark:border-neutral-800 rounded-2xl p-6 w-full max-w-md shadow-2xl relative space-y-4">
            <button onClick={() => setRatingBooking(null)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-200">
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold">Rate Your Service</h3>
            <p className="text-xs text-slate-500">{ratingBooking.serviceTitle} • {ratingBooking.bookingRef}</p>

            <div className="flex justify-center gap-2 my-4 text-amber-400">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setStarCount(star)}
                  className="hover:scale-125 transition-transform"
                >
                  <Star className={`w-8 h-8 ${star <= starCount ? 'fill-amber-400' : 'text-slate-600'}`} />
                </button>
              ))}
            </div>

            <textarea
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="Write feedback for your mistri..."
              rows={3}
              className="w-full p-3 rounded-xl border border-slate-200 dark:border-neutral-700 bg-slate-50 dark:bg-neutral-800 text-xs"
            />

            <button
              onClick={handleSubmitRating}
              disabled={isSubmittingReview}
              className="btn-primary w-full py-3"
            >
              <Send className="w-4 h-4" /> Submit Review
            </button>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
