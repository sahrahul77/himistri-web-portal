import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { ref, onValue, update, push, get, set } from 'firebase/database';
import { rtdb } from '../lib/firebase';
import { useAuth } from '../lib/AuthContext';
import { Clock, MapPin, CheckCircle2, Star, X, Lock, LogIn, Navigation, Phone, MessageSquare, ArrowLeft, Home, Bike, Check, Circle, Send } from 'lucide-react';

export default function TrackingPage() {
  const [isDark, setIsDark] = useState(true);
  const [activeTab, setActiveTab] = useState(0); // 0=Active, 1=Completed/History, 2=Cancelled
  const [bookings, setBookings] = useState([]);
  const [nowTime, setNowTime] = useState(Date.now());

  // Selected Order for Live Detailed Tracking Modal
  const [detailedOrder, setDetailedOrder] = useState(null);

  // Selected Order for Star Rating Modal
  const [ratingBooking, setRatingBooking] = useState(null);
  const [starCount, setStarCount] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  const { currentUser, isAuthLoaded } = useAuth();

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
    const timer = setInterval(() => setNowTime(Date.now()), 5000);
    return () => clearInterval(timer);
  }, []);

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

  const isWithinOneMinute = (createdAtStr) => {
    if (!createdAtStr) return true;
    const createdTime = new Date(createdAtStr).getTime();
    if (isNaN(createdTime)) return true;
    const diffInSeconds = (nowTime - createdTime) / 1000;
    return diffInSeconds <= 60;
  };

  // Submit Star Rating & Review
  const handleSubmitRating = async (e) => {
    e.preventDefault();
    if (!ratingBooking) return;
    setIsSubmittingReview(true);

    try {
      // 1. Update Booking with userRating & userReview in Firebase
      await update(ref(rtdb, `bookings/${ratingBooking.id}`), {
        userRating: starCount,
        userReview: reviewText || 'Great doorstep service experience!'
      });

      // 2. Recalculate Service's Rating Average & update in Firebase /services/$serviceId (Safely)
      try {
        if (ratingBooking.serviceId) {
          const serviceRef = ref(rtdb, `services/${ratingBooking.serviceId}`);
          const serviceSnap = await get(serviceRef);
          if (serviceSnap.exists()) {
            const srvData = serviceSnap.val();
            const currentRating = srvData.ratingAverage || 4.8;
            const newAvgRating = parseFloat(((currentRating + starCount) / 2).toFixed(1));
            await update(serviceRef, { ratingAverage: newAvgRating });
          }
        }
      } catch (_srvErr) {
        console.error("Service rating calculation warning:", _srvErr);
      }

      // 3. Save as a new Testimonial in Firebase /testimonials (Safely)
      try {
        const testRef = push(ref(rtdb, 'testimonials'));
        await set(testRef, {
          id: testRef.key,
          name: currentUser?.fullName || ratingBooking.userName || 'Passang Bhutia',
          location: 'Gangtok, Sikkim',
          text: reviewText || `Provided ${starCount}-star rating for ${ratingBooking.serviceTitle}.`,
          rating: starCount,
          service: ratingBooking.serviceTitle || 'Verified Service'
        });
      } catch (_testErr) {
        console.error("Testimonial push warning:", _testErr);
      }

      setIsSubmittingReview(false);
      alert(`Thank you! Your ${starCount}★ rating and review for ${ratingBooking.serviceTitle} have been published!`);
      setRatingBooking(null);
      setReviewText('');
    } catch (err) {
      setIsSubmittingReview(false);
      alert('Failed to submit rating: ' + err.message);
    }
  };

  // Filter bookings for the logged-in customer
  const userBookings = bookings.filter(b => {
    if (!currentUser) return false;
    if (currentUser.role === 'ADMIN') return true;
    const cleanUserPhone = (currentUser.phoneNumber || '').replace(/\D/g, '').slice(-10);
    const cleanCustPhone = (b.customerPhone || b.userPhone || '').replace(/\D/g, '').slice(-10);
    return (cleanUserPhone.length >= 10 && cleanUserPhone === cleanCustPhone) || b.userId === currentUser.id;
  });

  const activeBookings = userBookings.filter(b => b.status !== 'COMPLETED' && b.status !== 'CANCELLED' && b.status !== 'REJECTED');
  const completedBookings = userBookings.filter(b => b.status === 'COMPLETED');
  const cancelledBookings = userBookings.filter(b => b.status === 'CANCELLED' || b.status === 'REJECTED');

  const displayedList = activeTab === 0 ? activeBookings : activeTab === 1 ? completedBookings : cancelledBookings;

  const getTimelineStep = (status) => {
    switch (status) {
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

              <button
                onClick={() => setActiveTab(2)}
                className={`flex-1 py-3 text-center text-xs sm:text-sm font-black border-b-2 transition ${
                  activeTab === 2
                    ? 'border-b-redPrimary text-redPrimary'
                    : 'border-b-transparent text-slate-400 hover:text-white'
                }`}
              >
                Cancelled ({cancelledBookings.length})
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
                  <div key={b.id} className="web-card bg-[#1A1A1A] border border-[#333333] p-5 rounded-2xl space-y-4 shadow-xl">

                    {/* Top Row: Ref & Status Badge */}
                    <div className="flex justify-between items-center pb-2 border-b border-neutral-800">
                      <span className="font-extrabold text-sm text-white">
                        {b.bookingRef || b.id}
                      </span>
                      <span className={`px-3 py-1 rounded-xl text-xs font-black uppercase tracking-wider ${
                        b.status === 'COMPLETED' ? 'bg-emerald-600/20 text-emerald-500' :
                        b.status === 'CANCELLED' || b.status === 'REJECTED' ? 'bg-rose-600/20 text-rose-500' : 'bg-orangeSecondary/20 text-orangeSecondary'
                      }`}>
                        {b.status === 'PENDING' ? 'Order Placed' : b.status}
                      </span>
                    </div>

                    {/* Middle Info Row */}
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center shrink-0">
                        <div className="w-6 h-6 rounded-md bg-orangeSecondary flex items-center justify-center text-white text-xs font-bold">
                          HM
                        </div>
                      </div>

                      <div className="flex-1 space-y-1">
                        <h3 className="font-bold text-base text-white">{b.serviceTitle} <span className="text-xs text-slate-400">(Qty: {b.quantity || 1})</span></h3>
                        <p className="text-xs text-redPrimary font-bold">Payable: ₹{b.totalAmount || 500} ({b.paymentMethod === 'CASH_ON_DELIVERY' ? 'Cash on Service (COD)' : 'Online'})</p>
                        <p className="text-xs text-slate-400 font-semibold flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-redPrimary" /> {b.scheduledDate || 'Today'} | {b.scheduledTimeSlot || '09:00'}
                        </p>
                        <p className="text-xs text-slate-400 font-semibold flex items-start gap-1">
                          <MapPin className="w-3.5 h-3.5 text-redPrimary shrink-0 mt-0.5" /> Service Address ({b.address || 'Gangtok, Sikkim'})
                        </p>
                      </div>
                    </div>

                    {/* Live Status Row */}
                    <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center gap-2 text-xs font-bold text-orangeSecondary">
                      <Bike className="w-4 h-4 text-orangeSecondary" />
                      <span>Live Status: {b.trackingStatus || 'Order Placed by Customer'}</span>
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

                    {/* Action Buttons Row */}
                    <div className="space-y-2 pt-1">

                      {/* If CANCELLED or REJECTED: Show ONLY full-width Support button! */}
                      {b.status === 'CANCELLED' || b.status === 'REJECTED' ? (
                        <div className="w-full">
                          <a
                            href="https://wa.me/917430887960"
                            target="_blank"
                            rel="noreferrer"
                            className="w-full py-2.5 px-4 rounded-xl border border-neutral-700 bg-neutral-900/80 hover:bg-neutral-800 text-xs font-bold text-redPrimary flex items-center justify-center gap-2 text-center transition shadow-sm"
                          >
                            <MessageSquare className="w-3.5 h-3.5 text-redPrimary" /> Support
                          </a>
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 gap-3">
                          {/* If COMPLETED -> Show RATE NOW button or RATED badge with popup message! */}
                          {b.status === 'COMPLETED' ? (
                            <div>
                              {b.userRating ? (
                                <button
                                  type="button"
                                  onClick={() => alert('You have already rated this service.')}
                                  className="w-full py-2.5 px-4 rounded-xl border border-neutral-800 bg-neutral-900/80 text-xs font-bold text-amber-400 flex items-center justify-center gap-2 cursor-pointer transition opacity-80"
                                >
                                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                                  Rated: {b.userRating}.0 ★
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => setRatingBooking(b)}
                                  className="w-full py-2.5 px-4 rounded-xl border border-amber-500/40 bg-amber-500/10 hover:bg-amber-500/20 text-xs font-bold text-amber-400 flex items-center justify-center gap-2 transition"
                                >
                                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" /> Rate Now
                                </button>
                              )}
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setDetailedOrder(b)}
                              className="py-2.5 px-4 rounded-xl border border-neutral-700 bg-neutral-900/80 hover:bg-neutral-800 text-xs font-bold text-redPrimary flex items-center justify-center gap-2 transition"
                            >
                              <Navigation className="w-3.5 h-3.5 text-redPrimary" /> Track Live Order
                            </button>
                          )}

                          <a
                            href="https://wa.me/917430887960"
                            target="_blank"
                            rel="noreferrer"
                            className="py-2.5 px-4 rounded-xl border border-neutral-700 bg-neutral-900/80 hover:bg-neutral-800 text-xs font-bold text-redPrimary flex items-center justify-center gap-2 text-center transition"
                          >
                            <MessageSquare className="w-3.5 h-3.5 text-redPrimary" /> Support
                          </a>
                        </div>
                      )}

                      {/* 1-Minute Dynamic Cancel Button Logic for PENDING Orders */}
                      {b.status === 'PENDING' && (
                        <div>
                          {isWithinOneMinute(b.createdAt) ? (
                            <button
                              onClick={() => handleCancelBooking(b.id)}
                              className="w-full py-3 rounded-xl border border-rose-800/40 bg-rose-950/20 hover:bg-rose-900/40 text-rose-500 text-xs font-bold transition shadow-sm"
                            >
                              Cancel Order (Free within 1 min)
                            </button>
                          ) : (
                            <button
                              disabled
                              className="w-full py-3 rounded-xl border border-neutral-800 bg-neutral-900/50 text-slate-500 text-xs font-bold cursor-not-allowed opacity-60 text-center"
                            >
                              Can't cancel now. Contact Customer Support.
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

      {/* Star Rating & Review Modal */}
      {ratingBooking && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#1A1A1A] border border-[#333333] rounded-2xl p-6 w-full max-w-md text-white shadow-2xl relative space-y-4">
            <button onClick={() => setRatingBooking(null)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-200">
              <X className="w-5 h-5" />
            </button>

            <div className="text-center space-y-1">
              <div className="w-12 h-12 rounded-full bg-amber-400/20 text-amber-400 flex items-center justify-center mx-auto mb-2">
                <Star className="w-7 h-7 fill-amber-400" />
              </div>
              <h3 className="text-xl font-extrabold text-white">Rate Your Service</h3>
              <p className="text-xs text-redPrimary font-bold">{ratingBooking.serviceTitle} • {ratingBooking.bookingRef || ratingBooking.id}</p>
            </div>

            <div className="flex justify-center gap-2 my-6 text-amber-400">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setStarCount(star)}
                  className="hover:scale-125 transition-transform p-1"
                >
                  <Star className={`w-9 h-9 ${star <= starCount ? 'fill-amber-400 text-amber-400' : 'text-slate-700'}`} />
                </button>
              ))}
            </div>

            <textarea
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="Write feedback for your mistri and service experience..."
              rows={3}
              className="w-full p-3.5 rounded-xl border border-neutral-700 bg-neutral-900 text-white text-xs outline-none focus:border-redPrimary"
            />

            <button
              onClick={handleSubmitRating}
              disabled={isSubmittingReview}
              className="btn-primary w-full py-3.5 text-sm font-bold shadow-xl bg-redPrimary text-white rounded-xl"
            >
              <Send className="w-4 h-4 mr-1 inline" /> {isSubmittingReview ? 'Submitting Rating...' : 'Submit Rating & Review'}
            </button>
          </div>
        </div>
      )}

      {/* Live Order Tracking Detail Modal */}
      {detailedOrder && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#1A1A1A] border border-[#333333] rounded-2xl w-full max-w-lg text-white shadow-2xl overflow-hidden max-h-[95vh] flex flex-col">
            <div className="bg-redPrimary px-6 py-4 flex items-center justify-between shadow-md">
              <div className="flex items-center gap-2">
                <button onClick={() => setDetailedOrder(null)} className="p-1 hover:bg-white/20 rounded-full">
                  <ArrowLeft className="w-5 h-5 text-white" />
                </button>
                <h2 className="text-xl font-black text-white">Live Order Tracking</h2>
              </div>
              <button onClick={() => setDetailedOrder(null)} className="text-white/80 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5 overflow-y-auto flex-1">
              <div className="p-4 rounded-xl bg-[#242424] border border-[#333333] space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-redPrimary">Order Ref: {detailedOrder.bookingRef || detailedOrder.id}</span>
                  <span className="px-2.5 py-1 rounded-xl text-[10px] font-black bg-orangeSecondary text-white uppercase">{detailedOrder.status}</span>
                </div>
                <h3 className="font-extrabold text-base text-white mt-1">{detailedOrder.serviceTitle} (Quantity: {detailedOrder.quantity || 1})</h3>
                <p className="text-xs text-slate-400 font-semibold">Total Amount: ₹{detailedOrder.totalAmount} ({detailedOrder.paymentMethod === 'CASH_ON_DELIVERY' ? 'Cash on Service (COD)' : 'Online'})</p>
              </div>

              <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-800/40 space-y-1">
                <div className="flex items-center gap-2 text-emerald-500 font-bold text-xs">
                  <Bike className="w-4 h-4" /> Real-Time Tracking Update
                </div>
                <p className="text-xs font-bold text-emerald-400 pl-6">{detailedOrder.trackingStatus || 'Order Placed by Customer'}</p>
              </div>

              <div className="space-y-3 pt-2">
                <h4 className="text-sm font-extrabold text-white">Order Status Timeline</h4>
                <div className="space-y-4 pl-2">
                  {[
                    { step: 1, label: '1. Order Placed' },
                    { step: 2, label: '2. Confirmed by Admin' },
                    { step: 3, label: '3. Skilled Mistri Assigned' },
                    { step: 4, label: '4. Mistri On The Way' },
                    { step: 5, label: '5. Service Work In Progress' },
                    { step: 6, label: '6. Order Completed' }
                  ].map((stage) => {
                    const currentStep = getTimelineStep(detailedOrder.status);
                    const isPassed = stage.step <= currentStep;
                    const isCurrent = stage.step === currentStep;

                    return (
                      <div key={stage.step} className="flex items-start gap-3">
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                          isPassed ? 'bg-redPrimary text-white' : 'border-2 border-slate-600 text-transparent'
                        }`}>
                          {isPassed ? <Check className="w-3 h-3 stroke-[3]" /> : <Circle className="w-2 h-2" />}
                        </div>
                        <div>
                          <p className={`text-xs font-bold ${isPassed ? 'text-white' : 'text-slate-500'}`}>{stage.label}</p>
                          {isCurrent && <p className="text-[10px] font-bold text-redPrimary">Current Active Status</p>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#242424] border border-[#333333] space-y-1">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
                  <MapPin className="w-4 h-4 text-redPrimary" /> Service Address
                </div>
                <p className="text-xs text-slate-400 pl-6">{detailedOrder.address}</p>
              </div>

              <button
                onClick={() => { setDetailedOrder(null); window.location.href = '/'; }}
                className="btn-primary w-full py-3.5 text-sm font-black bg-redPrimary text-white rounded-xl shadow-lg flex items-center justify-center gap-2"
              >
                <Home className="w-4 h-4" /> Return to Home
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
