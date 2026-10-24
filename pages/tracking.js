import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import PopupModal from '../components/PopupModal';
import { ref, onValue, update, set, get } from 'firebase/database';
import { rtdb } from '../lib/firebase';
import { useAuth } from '../lib/AuthContext';
import { ShoppingBag, Clock, CheckCircle2, MapPin, Calendar, Lock, LogIn, ChevronLeft, ChevronRight, X, Phone, AlertCircle, MessageSquare, Send, Award, Star } from 'lucide-react';
import Link from 'next/link';

export default function TrackingPage() {
  // Default Website Theme is Light Mode
  const [isDark, setIsDark] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [activeTab, setActiveTab] = useState(0); // 0=Active, 1=Completed, 2=Cancelled
  const [cardIndex, setCardIndex] = useState(0);
  const [nowTime, setNowTime] = useState(Date.now());
  const [detailedOrder, setDetailedOrder] = useState(null);

  // Selected Order for Star Rating Modal
  const [ratingBooking, setRatingBooking] = useState(null);
  const [starCount, setStarCount] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  // Dynamic Popup Modal State
  const [popupState, setPopupState] = useState({ isOpen: false, title: '', message: '', type: 'success', onAction: null });

  const { currentUser, isAuthLoaded } = useAuth();

  // Theme Sync Effect
  useEffect(() => {
    const savedTheme = localStorage.getItem('himistri_theme') || 'light';
    const isDarkTheme = savedTheme === 'dark';
    setIsDark(isDarkTheme);
    if (isDarkTheme) {
      document.documentElement.classList.add('dark');
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.setAttribute('data-theme', 'light');
    }
  }, []);

  const toggleTheme = () => {
    setIsDark(prev => {
      const nextDark = !prev;
      if (nextDark) {
        document.documentElement.classList.add('dark');
        document.documentElement.setAttribute('data-theme', 'dark');
        localStorage.setItem('himistri_theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        document.documentElement.setAttribute('data-theme', 'light');
        localStorage.setItem('himistri_theme', 'light');
      }
      return nextDark;
    });
  };

  useEffect(() => {
    // Run timer every 1000ms (1 second) for smooth countdown rendering
    const timer = setInterval(() => setNowTime(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const bookingsRef = ref(rtdb, 'bookings');
    const unsubscribe = onValue(bookingsRef, (snapshot) => {
      const rawList = [];
      if (snapshot.exists()) {
        snapshot.forEach((child) => {
          rawList.push({ dbKey: child.key, id: child.key, ...child.val() });
        });
      }

      const uniqueMap = new Map();
      const statusPriority = { 'COMPLETED': 5, 'IN_PROGRESS': 4, 'ON_THE_WAY': 3, 'ASSIGNED': 2, 'CONFIRMED': 1, 'PENDING': 0, 'CANCELLED': 0, 'REJECTED': 0 };

      rawList.forEach((b) => {
        const key = b.bookingRef || b.id;
        if (!uniqueMap.has(key)) {
          uniqueMap.set(key, b);
        } else {
          const existing = uniqueMap.get(key);
          const pExisting = statusPriority[existing.status] || 0;
          const pCurrent = statusPriority[b.status] || 0;
          if (pCurrent >= pExisting) {
            uniqueMap.set(key, b);
          }
        }
      });

      const deduplicatedList = Array.from(uniqueMap.values());
      deduplicatedList.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());

      setBookings(deduplicatedList);
    });

    return () => unsubscribe();
  }, []);

  const handleTabChange = (tabIdx) => {
    setActiveTab(tabIdx);
    setCardIndex(0);
  };

  const handleCancelBooking = (bookingId) => {
    update(ref(rtdb, `bookings/${bookingId}`), {
      status: 'CANCELLED',
      trackingStatus: 'Order Cancelled by Customer'
    }).then(() => {
      setPopupState({
        isOpen: true,
        title: 'Order Cancelled',
        message: 'Your booking has been cancelled free of charge.',
        type: 'info'
      });
    });
  };

  const isWithinOneMinute = (createdAtStr) => {
    if (!createdAtStr) return true;
    const createdTime = new Date(createdAtStr).getTime();
    if (isNaN(createdTime)) return true;
    const diffInSeconds = (nowTime - createdTime) / 1000;
    return diffInSeconds <= 60;
  };

  const openRatingModal = (booking) => {
    setRatingBooking(booking);
    setStarCount(booking.userRating || 5);
    setReviewText(booking.userReviewText || '');
  };

  const handleSubmitRating = async (e) => {
    e.preventDefault();
    if (!ratingBooking) return;

    if (starCount < 1) {
      setPopupState({
        isOpen: true,
        title: 'Rating Required',
        message: 'Please select a rating from 1 to 5 stars before submitting.',
        type: 'error'
      });
      return;
    }

    setIsSubmittingReview(true);

    try {
      const bookingKey = ratingBooking.dbKey || ratingBooking.id;

      // Update order rating
      await update(ref(rtdb, `bookings/${bookingKey}`), {
        userRating: starCount,
        userReviewText: reviewText || 'Verified Customer Rating',
        ratedAt: new Date().toISOString()
      });

      // Recalculate average star rating for the service
      if (ratingBooking.serviceId) {
        const serviceRef = ref(rtdb, `services/${ratingBooking.serviceId}`);
        try {
          const srvSnap = await get(serviceRef);
          if (srvSnap.exists()) {
            const srvData = srvSnap.val();
            const currentRating = srvData.ratingAverage || 5.0;
            const currentCount = srvData.ratingCount || 1;
            const newCount = currentCount + 1;
            const newAvgRating = parseFloat((((currentRating * currentCount) + starCount) / newCount).toFixed(1));
            await update(serviceRef, { ratingAverage: newAvgRating, ratingCount: newCount });
          }
        } catch (_srvErr) {
          console.error("Service rating calculation warning:", _srvErr);
        }
      }

      setIsSubmittingReview(false);
      setRatingBooking(null);

      setPopupState({
        isOpen: true,
        title: 'Thank You for Your Rating!',
        message: `Your ${starCount}★ rating for ${ratingBooking.serviceTitle} has been saved!`,
        type: 'success'
      });
    } catch (err) {
      setIsSubmittingReview(false);
      setPopupState({
        isOpen: true,
        title: 'Rating Submission Failed',
        message: err.message,
        type: 'error'
      });
    }
  };

  // Filter bookings for the logged-in customer
  const userBookings = bookings.filter(b => {
    if (!currentUser) return false;
    if (currentUser.role === 'ADMIN') return true;

    const cleanUserPhone = (currentUser.phoneNumber || '').replace(/\D/g, '').slice(-10);
    const cleanCustPhone = (b.customerPhone || b.userPhone || '').replace(/\D/g, '').slice(-10);

    const phoneMatch = cleanUserPhone.length >= 10 && cleanCustPhone.length >= 10 && cleanUserPhone === cleanCustPhone;
    const idMatch = b.userId === currentUser.id;
    const nameMatch = currentUser.fullName && b.userName &&
      currentUser.fullName.trim().toLowerCase() === b.userName.trim().toLowerCase();

    return idMatch || phoneMatch || nameMatch;
  });

  const isCancelled = (st) => {
    const s = (st || '').toUpperCase().trim();
    return s === 'CANCELLED' || s === 'REJECTED' || s.includes('CANCEL');
  };

  const isCompleted = (st) => {
    const s = (st || '').toUpperCase().trim();
    return s === 'COMPLETED';
  };

  const getCancelTimeLeft = (createdAtStr) => {
    if (!createdAtStr) return 0;
    const createdTime = new Date(createdAtStr).getTime();
    if (isNaN(createdTime)) return 0;
    const diffInSeconds = Math.floor((nowTime - createdTime) / 1000);
    return Math.max(0, 60 - diffInSeconds);
  };

  const activeBookings = userBookings.filter(b => !isCompleted(b.status) && !isCancelled(b.status));
  const completedBookings = userBookings.filter(b => isCompleted(b.status));
  const cancelledBookings = userBookings.filter(b => isCancelled(b.status));

  const displayedList = activeTab === 0 ? activeBookings : activeTab === 1 ? completedBookings : cancelledBookings;
  const currentBooking = displayedList[cardIndex] || displayedList[0];

  const getTimelineStep = (status) => {
    switch ((status || '').toUpperCase().trim()) {
      case 'PENDING': return 1;
      case 'CONFIRMED': return 2;
      case 'ASSIGNED': return 3;
      case 'ON_THE_WAY': return 4;
      case 'IN_PROGRESS': return 5;
      case 'COMPLETED': return 6;
      default: return 1;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-[#0F0F0F] text-slate-900 dark:text-white transition-colors duration-200">
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
            {/* Top Red Header Banner */}
            <div className="bg-redPrimary text-white p-5 rounded-2xl shadow-xl flex justify-between items-center">
              <h1 className="text-2xl font-black tracking-wide">
                My Bookings History
              </h1>
              <span className="text-xs font-bold bg-white/20 px-3 py-1 rounded-full">
                {currentUser.fullName}
              </span>
            </div>

            {/* 3 Navigation Tabs */}
            <div className="flex border-b border-slate-200 dark:border-neutral-800">
              <button
                onClick={() => handleTabChange(0)}
                className={`flex-1 py-3 text-center text-xs sm:text-sm font-black border-b-2 transition ${
                  activeTab === 0
                    ? 'border-b-redPrimary text-redPrimary'
                    : 'border-b-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Active ({activeBookings.length})
              </button>

              <button
                onClick={() => handleTabChange(1)}
                className={`flex-1 py-3 text-center text-xs sm:text-sm font-black border-b-2 transition ${
                  activeTab === 1
                    ? 'border-b-redPrimary text-redPrimary'
                    : 'border-b-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Completed / History ({completedBookings.length})
              </button>

              <button
                onClick={() => handleTabChange(2)}
                className={`flex-1 py-3 text-center text-xs sm:text-sm font-black border-b-2 transition ${
                  activeTab === 2
                    ? 'border-b-redPrimary text-redPrimary'
                    : 'border-b-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Cancelled ({cancelledBookings.length})
              </button>
            </div>

            {/* Interactive Single-Card Order Slider Container */}
            {displayedList.length === 0 ? (
              <div className="web-card py-20 text-center text-slate-500 space-y-2 border-dashed bg-white dark:bg-[#1A1A1A] border border-slate-200 dark:border-[#333333] rounded-2xl">
                <Clock className="w-12 h-12 mx-auto text-slate-400 opacity-40 mb-2" />
                <p className="text-sm font-bold">No bookings found in this section.</p>
              </div>
            ) : (
              <div className="space-y-4">

                {/* Slider Controls Header */}
                <div className="flex justify-between items-center px-1">
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                    Booking <span className="text-redPrimary font-black">{cardIndex + 1}</span> of {displayedList.length}
                  </span>

                  {displayedList.length > 1 && (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setCardIndex((prev) => (prev - 1 + displayedList.length) % displayedList.length)}
                        className="p-2 rounded-xl bg-slate-100 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 text-slate-800 dark:text-white hover:border-redPrimary"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <span className="text-xs font-black text-slate-700 dark:text-slate-300">
                        {cardIndex + 1} / {displayedList.length}
                      </span>
                      <button
                        type="button"
                        onClick={() => setCardIndex((prev) => (prev + 1) % displayedList.length)}
                        className="p-2 rounded-xl bg-slate-100 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 text-slate-800 dark:text-white hover:border-redPrimary"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Single Order Slide Card */}
                {currentBooking && (
                  <div className="web-card p-6 space-y-5 bg-white dark:bg-[#1A1A1A] border border-slate-200 dark:border-[#333333] rounded-2xl shadow-2xl relative">

                    {/* Header Row */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-3 border-b border-slate-100 dark:border-neutral-800">
                      <div>
                        <span className="text-[10px] font-black uppercase text-redPrimary">Ref ID: {currentBooking.bookingRef || currentBooking.id}</span>
                        <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white mt-0.5">{currentBooking.serviceTitle}</h2>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-black uppercase ${
                        currentBooking.status === 'COMPLETED' ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30' :
                        currentBooking.status === 'CANCELLED' || currentBooking.status === 'REJECTED' ? 'bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30' :
                        'bg-orangeSecondary/20 text-orangeSecondary border border-orangeSecondary/30'
                      }`}>
                        {currentBooking.status}
                      </span>
                    </div>

                    {/* Booking Details Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-neutral-900/60 p-4 rounded-xl border border-slate-200 dark:border-neutral-800">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-redPrimary shrink-0" />
                        <span>Date: <strong className="text-slate-900 dark:text-white">{currentBooking.scheduledDate || 'Tomorrow'}</strong></span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-redPrimary shrink-0" />
                        <span>Time Slot: <strong className="text-slate-900 dark:text-white">{currentBooking.scheduledTimeSlot || '09:00 AM'}</strong></span>
                      </div>
                      <div className="flex items-start gap-2 sm:col-span-2">
                        <MapPin className="w-4 h-4 text-redPrimary shrink-0 mt-0.5" />
                        <span>Address: <strong className="text-slate-900 dark:text-white">{currentBooking.address}</strong></span>
                      </div>
                      <div className="sm:col-span-2 pt-2 border-t border-slate-200 dark:border-neutral-800 flex justify-between items-center text-sm">
                        <span>Total Payable: <strong className="text-redPrimary font-black text-base">₹{currentBooking.totalAmount}</strong></span>
                        <span className="text-[11px] text-slate-400">Duration: {currentBooking.durationUnitText || '1 Hour'}</span>
                      </div>
                    </div>

                    {/* Live Progress Bar for Active Orders */}
                    {currentBooking.status !== 'CANCELLED' && currentBooking.status !== 'REJECTED' && (
                      <div className="space-y-2 pt-2">
                        <div className="flex justify-between items-center text-xs font-bold">
                          <span className="text-slate-500 dark:text-slate-400">Fulfillment Progress</span>
                          <span className="text-redPrimary font-black">{currentBooking.trackingStatus || 'Order Placed'}</span>
                        </div>
                        <div className="w-full h-2.5 rounded-full bg-slate-100 dark:bg-neutral-800 overflow-hidden">
                          <div
                            className="h-full bg-redPrimary transition-all duration-500"
                            style={{ width: `${(getTimelineStep(currentBooking.status) / 6) * 100}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Partner Assignment Details if assigned */}
                    {currentBooking.assignedPartnerName && (
                      <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs flex justify-between items-center text-blue-600 dark:text-blue-400">
                        <div>
                          <strong>Assigned Mistri: {currentBooking.assignedPartnerName}</strong> ({currentBooking.assignedPartnerSkill || 'Specialist'})
                        </div>
                        {currentBooking.assignedPartnerPhone && (
                          <a href={`tel:${currentBooking.assignedPartnerPhone}`} className="text-emerald-600 dark:text-emerald-500 font-bold underline">Call Mistri</a>
                        )}
                      </div>
                    )}

                    {/* Action Buttons Row */}
                    <div className="space-y-2 pt-1">
                      {currentBooking.status === 'CANCELLED' || currentBooking.status === 'REJECTED' ? (
                        <div className="w-full">
                          <a
                            href="https://wa.me/917430887960"
                            target="_blank"
                            rel="noreferrer"
                            className="w-full py-2.5 px-4 rounded-xl border border-slate-200 dark:border-neutral-700 bg-slate-50 dark:bg-neutral-900 text-xs font-bold text-redPrimary flex items-center justify-center gap-2 text-center transition shadow-sm"
                          >
                            <MessageSquare className="w-3.5 h-3.5 text-redPrimary" /> Support
                          </a>
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 gap-3">
                          {currentBooking.status === 'COMPLETED' ? (
                            <div>
                              {currentBooking.userRating ? (
                                <button
                                  type="button"
                                  onClick={() => setPopupState({
                                    isOpen: true,
                                    title: 'Already Rated',
                                    message: 'You have already rated this service.',
                                    type: 'info'
                                  })}
                                  className="w-full py-2.5 px-4 rounded-xl border border-slate-200 dark:border-neutral-800 bg-slate-50 dark:bg-neutral-900 text-xs font-bold text-amber-500 flex items-center justify-center gap-2 cursor-pointer transition opacity-80"
                                >
                                  <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                                  Rated: {currentBooking.userRating}.0 ★
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => openRatingModal(currentBooking)}
                                  className="w-full py-2.5 px-4 rounded-xl border border-amber-500/40 bg-amber-500/10 hover:bg-amber-500/20 text-xs font-bold text-amber-500 flex items-center justify-center gap-2 transition"
                                >
                                  <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" /> Rate Now
                                </button>
                              )}
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setDetailedOrder(currentBooking)}
                              className="py-2.5 px-4 rounded-xl border border-slate-200 dark:border-neutral-700 bg-slate-50 dark:bg-neutral-900 hover:bg-slate-100 dark:hover:bg-neutral-800 text-xs font-bold text-redPrimary flex items-center justify-center gap-2 transition"
                            >
                              <ShoppingBag className="w-3.5 h-3.5" /> Order Summary
                            </button>
                          )}

                          {currentBooking.status === 'PENDING' && getCancelTimeLeft(currentBooking.createdAt) > 0 ? (
                            <button
                              type="button"
                              onClick={() => handleCancelBooking(currentBooking.id)}
                              className="py-2.5 px-4 rounded-xl bg-rose-700 hover:bg-rose-800 text-xs font-bold text-white flex items-center justify-center gap-2 transition"
                            >
                              <X className="w-3.5 h-3.5" /> Cancel Order ({getCancelTimeLeft(currentBooking.createdAt)}s)
                            </button>
                          ) : (
                            <a
                              href="https://wa.me/917430887960"
                              target="_blank"
                              rel="noreferrer"
                              className="py-2.5 px-4 rounded-xl border border-slate-200 dark:border-neutral-700 bg-slate-50 dark:bg-neutral-900 hover:bg-slate-100 dark:hover:bg-neutral-800 text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-center gap-2 text-center transition"
                              title="Orders can only be cancelled within 1 minute of booking."
                            >
                              <MessageSquare className="w-3.5 h-3.5 text-redPrimary" /> Contact Support
                            </a>
                          )}
                        </div>
                      )}
                    </div>

                  </div>
                )}

                {/* Dots Navigation */}
                {displayedList.length > 1 && (
                  <div className="flex justify-center gap-2 pt-2">
                    {displayedList.map((_, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setCardIndex(i)}
                        className={`h-2 rounded-full transition-all ${cardIndex === i ? 'w-8 bg-redPrimary' : 'w-2 bg-slate-300 dark:bg-neutral-700'}`}
                      />
                    ))}
                  </div>
                )}

              </div>
            )}
          </>
        )}
      </main>

      {/* Order Summary Modal */}
      {detailedOrder && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1A1A1A] text-slate-900 dark:text-white border border-slate-200 dark:border-[#333333] rounded-2xl p-6 w-full max-w-md space-y-4 relative shadow-2xl">
            <button onClick={() => setDetailedOrder(null)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"><X className="w-5 h-5" /></button>
            <h3 className="text-xl font-black text-redPrimary">Booking Receipt Summary</h3>
            <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-neutral-900 p-4 rounded-xl border border-slate-200 dark:border-neutral-800">
              <div className="flex justify-between"><span>Ref ID:</span><strong className="text-slate-900 dark:text-white">{detailedOrder.bookingRef || detailedOrder.id}</strong></div>
              <div className="flex justify-between"><span>Service:</span><strong className="text-slate-900 dark:text-white">{detailedOrder.serviceTitle}</strong></div>
              <div className="flex justify-between"><span>Duration:</span><strong className="text-emerald-600 dark:text-emerald-400">{detailedOrder.durationUnitText || '1 Hour'}</strong></div>
              <div className="flex justify-between"><span>Date & Slot:</span><strong className="text-slate-900 dark:text-white">{detailedOrder.scheduledDate} ({detailedOrder.scheduledTimeSlot})</strong></div>
              <div className="flex justify-between"><span>Address:</span><strong className="text-slate-900 dark:text-white text-right max-w-[200px]">{detailedOrder.address}</strong></div>
              <div className="flex justify-between border-t border-slate-200 dark:border-neutral-800 pt-2 text-sm font-black text-redPrimary"><span>Total Amount:</span><span>₹{detailedOrder.totalAmount}</span></div>
            </div>
            <button onClick={() => setDetailedOrder(null)} className="btn-primary w-full py-3 text-xs font-bold">Close Receipt</button>
          </div>
        </div>
      )}

      {/* Star Rating & Review Modal */}
      {ratingBooking && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1A1A1A] text-slate-900 dark:text-white border border-slate-200 dark:border-[#333333] rounded-2xl p-6 w-full max-w-md space-y-4 relative shadow-2xl">
            <button onClick={() => setRatingBooking(null)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"><X className="w-5 h-5" /></button>

            <div className="text-center space-y-1">
              <div className="w-12 h-12 rounded-full bg-amber-500/20 text-amber-500 flex items-center justify-center mx-auto mb-2">
                <Star className="w-6 h-6 fill-amber-500" />
              </div>
              <h3 className="text-xl font-black">Rate Your Service</h3>
              <p className="text-xs text-redPrimary font-bold">{ratingBooking.serviceTitle} • {ratingBooking.bookingRef}</p>
            </div>

            <div className="flex justify-center gap-2 py-3">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setStarCount(star)}
                  className="p-1 hover:scale-125 transition cursor-pointer"
                >
                  <Star className={`w-8 h-8 ${star <= starCount ? 'fill-amber-500 text-amber-500' : 'text-slate-300 dark:text-slate-600'}`} />
                </button>
              ))}
            </div>

            <textarea
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="Write a brief review of your experience with our technician..."
              rows={3}
              className="w-full p-3 rounded-xl bg-slate-50 dark:bg-neutral-900 border border-slate-300 dark:border-neutral-700 text-xs text-slate-900 dark:text-white outline-none focus:border-redPrimary"
            ></textarea>

            <button
              onClick={handleSubmitRating}
              disabled={isSubmittingReview}
              className="btn-primary w-full py-3.5 text-xs font-black shadow-lg bg-redPrimary hover:bg-redDark text-white"
            >
              <Send className="w-4 h-4 mr-1 inline" /> {isSubmittingReview ? 'Submitting Rating...' : starCount === 0 ? 'Select Star Rating' : `Submit ${starCount}★ Rating`}
            </button>
          </div>
        </div>
      )}

      <PopupModal
        isOpen={popupState.isOpen}
        onClose={() => setPopupState({ ...popupState, isOpen: false })}
        title={popupState.title}
        message={popupState.message}
        type={popupState.type}
        actionText="Continue"
        onAction={popupState.onAction}
      />

      <Footer />
    </div>
  );
}
