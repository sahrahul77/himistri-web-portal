import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Header from '../components/Header';
import Footer from '../components/Footer';
import PopupModal from '../components/PopupModal';
import { ref, set, push, onValue, update } from 'firebase/database';
import { rtdb } from '../lib/firebase';
import { useAuth } from '../lib/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Calendar, Clock, MapPin, CreditCard, CheckCircle, Plus, Minus, Lock, LogIn, Map, X, Timer, ShieldCheck, Tag, Percent, ChevronDown, Award, Star, Smartphone, QrCode } from 'lucide-react';
import { DURATION_PLANS, getDurationOptions, getDurationUnitText, calculateDurationPrice } from '../lib/durationHelpers';
import { DEFAULT_COUPONS } from '../lib/defaultData';

export default function CheckoutPage() {
  const router = useRouter();
  // Default Website Theme is Light Mode
  const [isDark, setIsDark] = useState(false);
  const { currentUser, isAuthLoaded } = useAuth();
  const [liveUser, setLiveUser] = useState(null);

  const [quantity, setQuantity] = useState(1);
  const [date, setDate] = useState('');
  const [slot, setSlot] = useState('');
  const [minDate, setMinDate] = useState('');

  // Initialize Default Date and Time to Present values on Client Mount
  useEffect(() => {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const localDate = `${yyyy}-${mm}-${dd}`;

    const hh = String(now.getHours()).padStart(2, '0');
    const min = String(now.getMinutes()).padStart(2, '0');
    const localTime = `${hh}:${min}`;

    setDate(localDate);
    setMinDate(localDate);
    setSlot(localTime);
  }, []);

  // Booking Plan & Duration Dropdown States
  const [bookingPlan, setBookingPlan] = useState('HOURLY'); // HOURLY, DAILY, WEEKLY, MONTHLY, YEARLY
  const [durationValue, setDurationValue] = useState(1);

  // Address Form Structured States
  const [savedAddressesList, setSavedAddressesList] = useState([]);
  const [selectedSavedAddr, setSelectedSavedAddr] = useState('new');
  const [newAddrType, setNewAddrType] = useState('Home');
  const [newHouseNo, setNewHouseNo] = useState('');
  const [newStreet, setNewStreet] = useState('');
  const [newLocality, setNewLocality] = useState('');
  const [newCity, setNewCity] = useState('Gangtok');
  const [newState, setNewState] = useState('Sikkim');
  const [newPincode, setNewPincode] = useState('737101');

  // Promo Code / Discount Coupon States
  const [promoCodeInput, setPromoCodeInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');
  const [couponsList, setCouponsList] = useState(DEFAULT_COUPONS);

  // HiMistri Amaze Subscription Upsell State
  const [selectedAmazePlan, setSelectedAmazePlan] = useState(null); // '3_MONTHS' | '1_YEAR'

  // Platform Fees & Taxes
  const [platformFees, setPlatformFees] = useState({ visitingFee: 49, gstPercentage: 5, surgeFee: 0, surgeFeeReason: '' });
  const [showFeesBreakdown, setShowFeesBreakdown] = useState(false);

  // Payment Method State
  const [paymentMethod, setPaymentMethod] = useState('CASH_ON_DELIVERY');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [service, setService] = useState(null);

  // Online Payment Popup State
  const [showOnlinePaymentModal, setShowOnlinePaymentModal] = useState(false);
  const [pendingBookingData, setPendingBookingData] = useState(null);
  const [isProcessingGateway, setIsProcessingGateway] = useState(false);

  const [activePaymentTab, setActivePaymentTab] = useState('CARD'); // 'CARD', 'UPI_APPS', 'QR_CODE'
  const [cardNum, setCardNum] = useState('');
  const [cardExp, setCardExp] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [upiId, setUpiId] = useState('');

  // Dynamic Popup Modal State
  const [popupState, setPopupState] = useState({ isOpen: false, title: '', message: '', type: 'success', onAction: null });

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
    const stored = localStorage.getItem('himistri_checkout_service');
    if (stored) {
      try {
        setService(JSON.parse(stored));
      } catch (e) {
        console.error("Could not parse checkout service:", e);
      }
    }
  }, []);

  useEffect(() => {
    if (!currentUser) return;

    const unsubFees = onValue(ref(rtdb, 'settings/fees'), (snapshot) => {
      if (snapshot.exists()) {
        setPlatformFees(snapshot.val());
      }
    });

    const userProfileRef = ref(rtdb, `users/${currentUser.id}`);
    const unsubProfile = onValue(userProfileRef, (snapshot) => {
      if (snapshot.exists()) {
        setLiveUser(snapshot.val());
      }
    });

    const userAddressesRef = ref(rtdb, `users/${currentUser.id}/addresses`);
    const unsubscribe = onValue(userAddressesRef, (snapshot) => {
      const list = [];
      if (snapshot.exists()) {
        snapshot.forEach((child) => {
          list.push({ id: child.key, ...child.val() });
        });
      }
      setSavedAddressesList(list);
      if (list.length > 0) {
        setSelectedSavedAddr(list[0].id);
      }
    });

    const unsubCoupons = onValue(ref(rtdb, 'coupons'), (snapshot) => {
      const list = [];
      if (snapshot.exists()) {
        const val = snapshot.val();
        if (typeof val === 'object' && val !== null) {
          Object.keys(val).forEach((k) => {
            if (val[k]) list.push({ id: k, ...val[k] });
          });
        }
      }
      if (list.length > 0) setCouponsList(list);
    });

    return () => { unsubscribe(); unsubCoupons(); unsubFees(); unsubProfile(); };
  }, [currentUser]);

  if (!isAuthLoaded) {
    return <div className="min-h-screen bg-slate-50 dark:bg-[#0F0F0F] flex items-center justify-center text-slate-500 font-bold">Verifying Session...</div>;
  }

  if (!currentUser) {
    return (
      <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-[#0F0F0F] text-slate-900 dark:text-white transition-colors duration-200">
        <Header isDark={isDark} onToggleTheme={toggleTheme} currentUser={null} />
        <main className="web-container py-16 flex-1 flex items-center justify-center">
          <div className="web-card text-center py-12 px-6 max-w-md w-full space-y-4 shadow-xl">
            <Lock className="w-16 h-16 text-redPrimary mx-auto" />
            <h2 className="text-2xl font-black">Login Required</h2>
            <p className="text-xs text-slate-500">Please sign in or register an account to complete your doorstep booking.</p>
            <Link href="/auth?redirect=checkout" className="btn-primary w-full py-3.5 text-xs font-black shadow-lg">
              <LogIn className="w-4 h-4 inline mr-1" /> Sign In / Register
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!service) {
    return (
      <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-[#0F0F0F] text-slate-900 dark:text-white transition-colors duration-200">
        <Header isDark={isDark} onToggleTheme={toggleTheme} currentUser={currentUser} />
        <main className="web-container py-16 flex-1 flex items-center justify-center">
          <div className="web-card text-center py-12 px-6 max-w-md w-full space-y-4 shadow-xl">
            <ShoppingBag className="w-16 h-16 text-slate-400 mx-auto" />
            <h2 className="text-2xl font-black">No Service Selected</h2>
            <p className="text-xs text-slate-500">Please select a service from our catalog to proceed with checkout.</p>
            <Link href="/services" className="btn-primary w-full py-3.5 text-xs font-black shadow-lg">
              Explore Services Catalog
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Calculate Subtotal & Duration Price
  const baseUnitPrice = service.discountedPrice || 800;
  const durationMultiplier = calculateDurationPrice(baseUnitPrice, bookingPlan, durationValue);
  const rawSubtotal = durationMultiplier * quantity;

  // Apply Coupon Discount Calculation
  let discountAmount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.discountType === 'PERCENTAGE') {
      discountAmount = Math.round((rawSubtotal * appliedCoupon.discountValue) / 100);
    } else {
      discountAmount = appliedCoupon.discountValue;
    }
  }

  const subtotalAfterDiscount = Math.max(0, rawSubtotal - discountAmount);

  // Helper to parse dates (handles both ISO strings from Web and dd/MM/yyyy from Android)
  const parseExpiryDate = (dateStr) => {
    if (!dateStr) return new Date(0);
    if (dateStr.includes('/')) {
      const parts = dateStr.split('/');
      if (parts.length === 3) return new Date(`${parts[2]}-${parts[1]}-${parts[0]}T23:59:59Z`);
    }
    return new Date(dateStr);
  };

  // Check if User is a HiMistri Amaze Subscriber to waive Visiting Fee
  const activeUser = liveUser || currentUser;
  const isHiMistriAmazeSub = activeUser && activeUser.subscriptionPlan && activeUser.subscriptionPlan !== 'NONE' && parseExpiryDate(activeUser.subscriptionExpiry) > new Date();

  // Dynamic Taxes & Fees Calculation
  const visitingFee = (isHiMistriAmazeSub || selectedAmazePlan) ? 0 : (platformFees.visitingFee || 0);
  const surgeFee = platformFees.surgeFee || 0;
  const gstAmount = Math.round((subtotalAfterDiscount * (platformFees.gstPercentage || 0)) / 100);
  const totalTaxesAndFees = visitingFee + surgeFee + gstAmount;

  const amazeSubscriptionCost = selectedAmazePlan === '3_MONTHS' ? 199 : selectedAmazePlan === '1_YEAR' ? 799 : 0;
  const finalTotalAmount = subtotalAfterDiscount + totalTaxesAndFees + amazeSubscriptionCost;

  // Apply Promo Code Handler
  const handleApplyPromoCode = (e) => {
    e.preventDefault();
    setCouponError('');
    const cleanCode = promoCodeInput.trim().toUpperCase();

    if (!cleanCode) {
      setCouponError('Please enter a promo code string.');
      return;
    }

    const matchedCoupon = couponsList.find(c => (c.code || '').toUpperCase() === cleanCode && c.isActive !== false);

    if (!matchedCoupon) {
      setCouponError(`Invalid or expired promo code '${cleanCode}'.`);
      setAppliedCoupon(null);
      return;
    }

    if (matchedCoupon.minOrderAmount && rawSubtotal < matchedCoupon.minOrderAmount) {
      setCouponError(`Minimum subtotal requirement of ₹${matchedCoupon.minOrderAmount} not met for this coupon.`);
      setAppliedCoupon(null);
      return;
    }

    setAppliedCoupon(matchedCoupon);
    setCouponError('');
  };

  // Form Submit Handler
  const handleConfirmBooking = async (e) => {
    e.preventDefault();

    if (!date || !slot) {
      setPopupState({
        isOpen: true,
        title: 'Date & Slot Required',
        message: 'Please select your preferred scheduled date and time slot.',
        type: 'error'
      });
      return;
    }

    // Build Final Structured Address
    let finalAddressString = '';
    let addressObj = null;

    if (selectedSavedAddr !== 'new') {
      const matchedAddr = savedAddressesList.find(a => a.id === selectedSavedAddr);
      if (matchedAddr) {
        finalAddressString = `${matchedAddr.type || 'Home'}: ${matchedAddr.houseNo || ''}, ${matchedAddr.street || ''}, ${matchedAddr.locality || ''}, ${matchedAddr.city || 'Gangtok'}, ${matchedAddr.state || 'Sikkim'} - ${matchedAddr.pincode || '737101'}`;
        addressObj = matchedAddr;
      }
    }

    if (!finalAddressString) {
      if (!newHouseNo || !newStreet || !newLocality) {
        setPopupState({
          isOpen: true,
          title: 'Address Fields Required',
          message: 'House No/Building Name, Street/Area, and Locality are required for doorstep dispatch.',
          type: 'error'
        });
        return;
      }

      finalAddressString = `${newAddrType}: ${newHouseNo}, ${newStreet}, ${newLocality}, ${newCity}, ${newState} - ${newPincode}`;
      addressObj = {
        type: newAddrType,
        houseNo: newHouseNo,
        street: newStreet,
        locality: newLocality,
        city: newCity,
        state: newState,
        pincode: newPincode
      };

      // Save new structured address to user profile if logged in
      if (currentUser) {
        try {
          const newAddrRef = push(ref(rtdb, `users/${currentUser.id}/addresses`));
          await set(newAddrRef, { ...addressObj, id: newAddrRef.key });
        } catch (addrErr) {
          console.error("Could not save address to profile:", addrErr);
        }
      }
    }

    // Process HiMistri Amaze Subscription Purchase
    if (selectedAmazePlan && currentUser) {
      try {
        const expiry = new Date();
        if (selectedAmazePlan === '3_MONTHS') expiry.setMonth(expiry.getMonth() + 3);
        if (selectedAmazePlan === '1_YEAR') expiry.setFullYear(expiry.getFullYear() + 1);

        const expiryStr = expiry.toISOString();
        const updates = {};
        updates[`users/${currentUser.id}/subscriptionPlan`] = selectedAmazePlan;
        updates[`users/${currentUser.id}/subscriptionExpiry`] = expiryStr;
        updates[`customers/${currentUser.id}/subscriptionPlan`] = selectedAmazePlan;
        updates[`customers/${currentUser.id}/subscriptionExpiry`] = expiryStr;
        updates[`partners/${currentUser.id}/subscriptionPlan`] = selectedAmazePlan;
        updates[`partners/${currentUser.id}/subscriptionExpiry`] = expiryStr;

        await update(ref(rtdb), updates);
      } catch (subErr) {
        console.error("Could not update subscription plan:", subErr);
      }
    }

    setIsSubmitting(true);

    const bookingRefId = 'HM-' + new Date().toISOString().slice(0, 10).replace(/-/g, '') + '-' + Math.floor(100 + Math.random() * 900);
    const newBookingKey = push(ref(rtdb, 'bookings')).key;

    const durationUnitText = getDurationUnitText(bookingPlan, durationValue);

    const bookingData = {
      id: newBookingKey,
      bookingRef: bookingRefId,
      serviceId: service.id || 'srv_gen',
      serviceTitle: service.title || 'Doorstep Technical Service',
      serviceCategory: service.categoryName || 'General Services',
      quantity: quantity,
      bookingPlan: bookingPlan,
      durationValue: durationValue,
      durationUnitText: durationUnitText,
      unitPrice: baseUnitPrice,
      subtotalAmount: rawSubtotal,
      appliedPromoCode: appliedCoupon ? appliedCoupon.code : 'NONE',
      discountAmount: discountAmount,
      visitingFee: visitingFee,
      surgeFee: surgeFee,
      surgeFeeReason: platformFees.surgeFeeReason || '',
      gstAmount: gstAmount,
      gstPercentage: platformFees.gstPercentage || 0,
      totalTaxesAndFees: totalTaxesAndFees,
      amazeSubscriptionCost: amazeSubscriptionCost,
      totalAmount: finalTotalAmount,
      scheduledDate: date,
      scheduledTimeSlot: slot,
      address: finalAddressString,
      addressDetails: addressObj,
      paymentMethod: paymentMethod,
      userId: currentUser.id,
      userName: currentUser.fullName,
      userPhone: currentUser.phoneNumber,
      customerPhone: currentUser.phoneNumber,
      userEmail: currentUser.email,
      status: 'PENDING',
      trackingStatus: 'Order Placed by Customer',
      createdAt: new Date().toISOString()
    };

    if (paymentMethod === 'ONLINE_UPI') {
      setPendingBookingData(bookingData);
      setShowOnlinePaymentModal(true);
      return;
    }

    await executeBookingSave(bookingData);
  };

  const executeBookingSave = async (bData, gatewayMethod = null) => {
    setIsSubmitting(true);

    // Add exact payment gateway info if it was an online payment
    if (gatewayMethod) {
      bData.paymentGatewayMethod = gatewayMethod;
      bData.paymentStatus = 'PAID';
    } else {
      bData.paymentStatus = 'PENDING';
    }

    try {
      await set(ref(rtdb, `bookings/${bData.id}`), bData);

      setIsSubmitting(false);
      localStorage.removeItem('himistri_checkout_service');
      setShowOnlinePaymentModal(false);

      setPopupState({
        isOpen: true,
        title: 'Booking Confirmed! 🎉',
        message: `Your booking (${bData.bookingRef}) for ${service.title} has been placed successfully!\nScheduled for ${bData.scheduledDate} (${bData.scheduledTimeSlot}).`,
        type: 'success',
        onAction: () => router.push('/tracking')
      });
    } catch (err) {
      setIsSubmitting(false);
      setShowOnlinePaymentModal(false);
      setPopupState({
        isOpen: true,
        title: 'Booking Failed',
        message: err.message,
        type: 'error'
      });
    }
  };

  const handleProcessOnlinePayment = (selectedGateway) => {
    setIsProcessingGateway(true);
    // Simulate secure 1.5 second delay connecting to Razorpay / UPI Gateways
    setTimeout(() => {
      executeBookingSave(pendingBookingData, selectedGateway);
    }, 1500);
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-[#0F0F0F] text-slate-900 dark:text-white transition-colors duration-200">
      <Header isDark={isDark} onToggleTheme={toggleTheme} currentUser={currentUser} />

      <main className="web-container py-6 sm:py-10 flex-1 max-w-6xl mx-auto px-4 sm:px-6 w-full space-y-6">

        {/* Top Header Banner */}
        <div className="bg-gradient-to-r from-redPrimary via-orangeSecondary to-redDark text-white p-5 rounded-2xl shadow-xl flex justify-between items-center">
          <div>
            <span className="text-[10px] font-black uppercase text-amber-300 tracking-wider">Fast Dispatch</span>
            <h1 className="text-xl sm:text-2xl font-black tracking-wide">Checkout & Confirm Booking</h1>
          </div>
          <span className="text-xs font-bold bg-white/20 px-3 py-1 rounded-full">
            {currentUser.fullName}
          </span>
        </div>

        <form onSubmit={handleConfirmBooking} className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left Columns: Address & Schedule & Plan (2 Cols on Desktop) */}
          <div className="lg:col-span-2 space-y-6">

            {/* Service Details Brief Card */}
            <div className="web-card p-5 bg-white dark:bg-[#1A1A1A] border border-slate-200 dark:border-[#333333] rounded-2xl shadow-md space-y-3">
              <span className="text-[10px] font-black uppercase text-redPrimary tracking-wider">Selected Service</span>
              <div className="flex justify-between items-start gap-3">
                <div>
                  <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">{service.title}</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{service.categoryName || 'General Technical Services'}</p>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-lg font-black text-redPrimary">₹{baseUnitPrice}</span>
                  <span className="text-[10px] text-slate-400 block line-through">₹{service.originalPrice || 1000}</span>
                </div>
              </div>
            </div>

            {/* Booking Duration Plan Dropdown Box */}
            <div className="web-card p-5 bg-white dark:bg-[#1A1A1A] border border-slate-200 dark:border-[#333333] rounded-2xl shadow-md space-y-4">
              <div className="flex items-center gap-2 text-redPrimary">
                <Timer className="w-5 h-5 text-redPrimary" />
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Booking Duration & Plan Basis</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 block mb-1">Select Booking Basis Plan *</label>
                  <select
                    value={bookingPlan}
                    onChange={(e) => {
                      setBookingPlan(e.target.value);
                      setDurationValue(1);
                    }}
                    className="w-full p-3.5 rounded-xl border border-slate-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-xs font-extrabold text-slate-900 dark:text-white outline-none focus:border-redPrimary cursor-pointer"
                  >
                    {DURATION_PLANS.map((plan) => (
                      <option key={plan.id} value={plan.id}>{plan.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 block mb-1">
                    Select Duration *
                  </label>
                  <select
                    value={durationValue}
                    onChange={(e) => setDurationValue(parseInt(e.target.value))}
                    className="w-full p-3.5 rounded-xl border border-slate-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-xs font-extrabold text-slate-900 dark:text-white outline-none focus:border-redPrimary cursor-pointer"
                  >
                    {getDurationOptions(bookingPlan).map((num) => (
                      <option key={num} value={num}>{getDurationUnitText(bookingPlan, num)}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Quantity Counter */}
              <div className="flex justify-between items-center pt-2 border-t border-slate-100 dark:border-neutral-800">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Number of Craftsmen Needed:</span>
                <div className="flex items-center gap-3 bg-slate-100 dark:bg-neutral-900 p-1.5 rounded-xl border border-slate-200 dark:border-neutral-800">
                  <button type="button" onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-1 rounded-lg bg-white dark:bg-neutral-800 hover:text-redPrimary"><Minus className="w-4 h-4" /></button>
                  <span className="text-xs font-black text-slate-900 dark:text-white w-6 text-center">{quantity}</span>
                  <button type="button" onClick={() => setQuantity(quantity + 1)} className="p-1 rounded-lg bg-white dark:bg-neutral-800 hover:text-redPrimary"><Plus className="w-4 h-4" /></button>
                </div>
              </div>
            </div>

            {/* Schedule Date & Slot Box */}
            <div className="web-card p-5 bg-white dark:bg-[#1A1A1A] border border-slate-200 dark:border-[#333333] rounded-2xl shadow-md space-y-4">
              <div className="flex items-center gap-2 text-redPrimary">
                <Calendar className="w-5 h-5 text-redPrimary" />
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Schedule Doorstep Service</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 block mb-1">Preferred Date *</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    min={minDate}
                    required
                    className="w-full p-3.5 rounded-xl border border-slate-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-xs font-bold text-slate-900 dark:text-white outline-none focus:border-redPrimary"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 block mb-1">Preferred Time *</label>
                  <input
                    type="time"
                    value={slot}
                    onChange={(e) => setSlot(e.target.value)}
                    required
                    className="w-full p-3.5 rounded-xl border border-slate-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-xs font-bold text-slate-900 dark:text-white outline-none focus:border-redPrimary cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Address Selection / New Address Form */}
            <div className="web-card p-5 bg-white dark:bg-[#1A1A1A] border border-slate-200 dark:border-[#333333] rounded-2xl shadow-md space-y-4">
              <div className="flex items-center gap-2 text-redPrimary">
                <MapPin className="w-5 h-5 text-redPrimary" />
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Service Address in Sikkim</h3>
              </div>

              {/* Saved Address Chooser if available */}
              {savedAddressesList.length > 0 && (
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 block">Choose Saved Address:</label>
                  <div className="space-y-2">
                    {savedAddressesList.map((addr) => (
                      <label key={addr.id} className={`p-3 rounded-xl border flex items-start gap-3 cursor-pointer transition ${selectedSavedAddr === addr.id ? 'border-redPrimary bg-redPrimary/5' : 'border-slate-200 dark:border-neutral-800'}`}>
                        <input type="radio" name="addressChoice" checked={selectedSavedAddr === addr.id} onChange={() => setSelectedSavedAddr(addr.id)} className="mt-1 text-redPrimary" />
                        <div className="text-xs space-y-0.5">
                          <strong className="text-slate-900 dark:text-white font-extrabold block">{addr.type || 'Home'}</strong>
                          <p className="text-slate-600 dark:text-slate-400">{addr.houseNo}, {addr.street}, {addr.locality}, {addr.city}, {addr.state} - {addr.pincode}</p>
                        </div>
                      </label>
                    ))}
                    <label className={`p-3 rounded-xl border flex items-center gap-3 cursor-pointer transition ${selectedSavedAddr === 'new' ? 'border-redPrimary bg-redPrimary/5' : 'border-slate-200 dark:border-neutral-800'}`}>
                      <input type="radio" name="addressChoice" checked={selectedSavedAddr === 'new'} onChange={() => setSelectedSavedAddr('new')} className="text-redPrimary" />
                      <span className="text-xs font-bold text-slate-900 dark:text-white">+ Enter A New Address</span>
                    </label>
                  </div>
                </div>
              )}

              {/* Structured Address Form for New Address */}
              {(selectedSavedAddr === 'new' || savedAddressesList.length === 0) && (
                <div className="space-y-3 pt-2">
                  <div className="flex gap-2">
                    {['Home', 'Office', 'Other'].map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setNewAddrType(type)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-extrabold border transition ${newAddrType === type ? 'bg-redPrimary text-white border-redPrimary' : 'bg-slate-50 dark:bg-neutral-900 border-slate-200 dark:border-neutral-800'}`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input type="text" value={newHouseNo} onChange={(e) => setNewHouseNo(e.target.value)} placeholder="House / Flat / Building Name *" required className="p-3 rounded-xl border border-slate-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-xs font-bold text-slate-900 dark:text-white outline-none focus:border-redPrimary" />
                    <input type="text" value={newStreet} onChange={(e) => setNewStreet(e.target.value)} placeholder="Street / Area Name *" required className="p-3 rounded-xl border border-slate-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-xs font-bold text-slate-900 dark:text-white outline-none focus:border-redPrimary" />
                    <input type="text" value={newLocality} onChange={(e) => setNewLocality(e.target.value)} placeholder="Locality / Landmark (e.g. Upper Syari) *" required className="p-3 rounded-xl border border-slate-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-xs font-bold text-slate-900 dark:text-white outline-none focus:border-redPrimary" />
                    <input type="text" value={newCity} onChange={(e) => setNewCity(e.target.value)} placeholder="City / Town *" required className="p-3 rounded-xl border border-slate-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-xs font-bold text-slate-900 dark:text-white outline-none focus:border-redPrimary" />
                    <input type="text" value={newState} onChange={(e) => setNewState(e.target.value)} placeholder="State *" required className="p-3 rounded-xl border border-slate-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-xs font-bold text-slate-900 dark:text-white outline-none focus:border-redPrimary" />
                    <input type="text" value={newPincode} onChange={(e) => setNewPincode(e.target.value)} placeholder="PIN Code *" required className="p-3 rounded-xl border border-slate-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-xs font-bold text-slate-900 dark:text-white outline-none focus:border-redPrimary" />
                  </div>
                </div>
              )}
            </div>

            {/* Payment Method Selector */}
            <div className="web-card p-5 bg-white dark:bg-[#1A1A1A] border border-slate-200 dark:border-[#333333] rounded-2xl shadow-md space-y-3">
              <div className="flex items-center gap-2 text-redPrimary">
                <CreditCard className="w-5 h-5 text-redPrimary" />
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Payment Method</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className={`p-4 rounded-xl border flex items-center gap-3 cursor-pointer transition ${paymentMethod === 'CASH_ON_DELIVERY' ? 'border-redPrimary bg-redPrimary/5' : 'border-slate-200 dark:border-neutral-800'}`}>
                  <input type="radio" name="payMethod" checked={paymentMethod === 'CASH_ON_DELIVERY'} onChange={() => setPaymentMethod('CASH_ON_DELIVERY')} className="text-redPrimary shrink-0" />
                  <div>
                    <strong className="text-xs font-extrabold block text-slate-900 dark:text-white">Cash on Service (COD)</strong>
                    <span className="text-[10px] text-slate-500">Pay after completion to technician</span>
                  </div>
                </label>

                <label className={`p-4 rounded-xl border flex items-center gap-3 cursor-pointer transition ${paymentMethod === 'ONLINE_UPI' ? 'border-redPrimary bg-redPrimary/5' : 'border-slate-200 dark:border-neutral-800'}`}>
                  <input type="radio" name="payMethod" checked={paymentMethod === 'ONLINE_UPI'} onChange={() => setPaymentMethod('ONLINE_UPI')} className="text-redPrimary shrink-0" />
                  <div>
                    <strong className="text-xs font-extrabold block text-slate-900 dark:text-white">Online Payment</strong>
                    <span className="text-[10px] text-slate-500">Cards, UPI, GPay, Razorpay</span>
                  </div>
                </label>
              </div>

              {/* Online Payment Explainer */}
              {paymentMethod === 'ONLINE_UPI' && (
                <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800/50 rounded-xl text-[11px] text-blue-700 dark:text-blue-400 font-bold flex items-start gap-2">
                  <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" />
                  <p>You will be redirected to our secure Razorpay gateway to complete your payment using Credit/Debit Cards, UPI apps (GPay, PhonePe, Paytm), or Netbanking after you click "Confirm & Place Order".</p>
                </div>
              )}
            </div>

          </div>

          {/* Right Column: Order Price Summary & Promo Code Box */}
          <div className="space-y-6">

            {/* HiMistri Amaze Upsell Box */}
            {!isHiMistriAmazeSub && (
              <div className="web-card p-5 bg-gradient-to-br from-amber-100 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/10 border border-amber-300 dark:border-amber-700/50 rounded-2xl shadow-md space-y-4">
                <div className="flex items-center gap-2 text-amber-600 dark:text-amber-500">
                  <Award className="w-6 h-6" />
                  <div>
                    <h3 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-wider">HiMistri Amaze</h3>
                  </div>
                </div>
                <p className="text-xs text-slate-700 dark:text-slate-300 font-bold">
                  Join now and get <strong className="text-emerald-600 dark:text-emerald-400">FREE Visiting Fees (₹0)</strong> on this order and all future orders!
                </p>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedAmazePlan(selectedAmazePlan === '3_MONTHS' ? null : '3_MONTHS')}
                    className={`p-3 rounded-xl border text-left transition relative overflow-hidden ${selectedAmazePlan === '3_MONTHS' ? 'border-amber-500 bg-amber-500/15 shadow-md' : 'border-slate-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 hover:border-amber-400'}`}
                  >
                    <div className="flex justify-between items-start">
                      <span className="text-[11px] font-black uppercase text-slate-800 dark:text-slate-200">3 Months</span>
                      {selectedAmazePlan === '3_MONTHS' && <CheckCircle className="w-4 h-4 text-amber-600" />}
                    </div>
                    <span className="text-base font-black text-amber-600 block mt-2">₹199</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedAmazePlan(selectedAmazePlan === '1_YEAR' ? null : '1_YEAR')}
                    className={`p-3 rounded-xl border text-left transition relative overflow-hidden ${selectedAmazePlan === '1_YEAR' ? 'border-amber-500 bg-amber-500/15 shadow-md' : 'border-slate-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 hover:border-amber-400'}`}
                  >
                    <div className="absolute top-0 right-0 bg-redPrimary text-white text-[8px] font-black px-1.5 py-0.5 rounded-bl-lg">BEST VALUE</div>
                    <div className="flex justify-between items-start mt-1">
                      <span className="text-[11px] font-black uppercase text-slate-800 dark:text-slate-200">1 Year</span>
                      {selectedAmazePlan === '1_YEAR' && <CheckCircle className="w-4 h-4 text-amber-600" />}
                    </div>
                    <span className="text-base font-black text-amber-600 block mt-1">₹799</span>
                  </button>
                </div>
              </div>
            )}

            {/* Promo Code Box */}
            <div className="web-card p-5 bg-white dark:bg-[#1A1A1A] border border-slate-200 dark:border-[#333333] rounded-2xl shadow-md space-y-3">
              <div className="flex items-center gap-2 text-redPrimary">
                <Tag className="w-4 h-4 text-redPrimary" />
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">Promo Code / Coupon</h3>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={promoCodeInput}
                  onChange={(e) => setPromoCodeInput(e.target.value.toUpperCase())}
                  placeholder="Enter Promo Code (e.g. SIKKIM10)"
                  className="p-3 rounded-xl border border-slate-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-xs font-bold text-slate-900 dark:text-white uppercase flex-1 outline-none focus:border-redPrimary"
                />
                <button
                  type="button"
                  onClick={handleApplyPromoCode}
                  className="btn-primary py-2.5 px-4 text-xs font-bold shadow-md shrink-0 cursor-pointer"
                >
                  Apply
                </button>
              </div>

              {couponError && <p className="text-[11px] font-bold text-rose-500">{couponError}</p>}

              {appliedCoupon && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs font-bold text-emerald-500 flex justify-between items-center">
                  <span>✓ Code '{appliedCoupon.code}' Applied! (-₹{discountAmount})</span>
                  <button type="button" onClick={() => setAppliedCoupon(null)} className="text-rose-500 hover:underline">Remove</button>
                </div>
              )}
            </div>

            {/* Final Order Price Breakdown Card */}
            <div className="web-card p-6 bg-white dark:bg-[#1A1A1A] border border-slate-200 dark:border-[#333333] rounded-2xl shadow-xl space-y-4 sticky top-24">
              <h3 className="text-lg font-black text-slate-900 dark:text-white border-b border-slate-100 dark:border-neutral-800 pb-3">Payment Summary</h3>

              <div className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300">
                <div className="flex justify-between">
                  <span>Service Unit Rate:</span>
                  <strong className="text-slate-900 dark:text-white font-extrabold">₹{baseUnitPrice}</strong>
                </div>

                <div className="flex justify-between">
                  <span>Plan Basis:</span>
                  <strong className="text-slate-900 dark:text-white font-extrabold">{bookingPlan} ({getDurationUnitText(bookingPlan, durationValue)})</strong>
                </div>

                <div className="flex justify-between">
                  <span>Quantity:</span>
                  <strong className="text-slate-900 dark:text-white font-extrabold">{quantity} Specialist(s)</strong>
                </div>

                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <strong className="text-slate-900 dark:text-white font-extrabold">₹{rawSubtotal}</strong>
                </div>

                {appliedCoupon && (
                  <div className="flex justify-between text-emerald-500 font-extrabold">
                    <span>Discount ({appliedCoupon.code}):</span>
                    <span>-₹{discountAmount}</span>
                  </div>
                )}

                {selectedAmazePlan && (
                  <div className="flex justify-between text-amber-500 font-extrabold">
                    <span>HiMistri Amaze ({selectedAmazePlan === '3_MONTHS' ? '3 Months' : '1 Year'}):</span>
                    <span>+₹{amazeSubscriptionCost}</span>
                  </div>
                )}

                {(isHiMistriAmazeSub || selectedAmazePlan) && (
                  <div className="flex justify-between text-amber-500 font-extrabold pb-2 border-b border-dashed border-slate-200 dark:border-neutral-800">
                    <span className="flex items-center gap-1"><Star className="w-3.5 h-3.5" /> Amaze Benefits:</span>
                    <span>Free Visiting Fee (₹0)</span>
                  </div>
                )}

                <div className="border-t border-slate-200 dark:border-neutral-800 pt-2 space-y-2">
                  <div
                    className="flex justify-between items-center cursor-pointer group"
                    onClick={() => setShowFeesBreakdown(!showFeesBreakdown)}
                  >
                    <span className="flex items-center gap-1 text-slate-900 dark:text-white font-bold border-b border-dashed border-slate-400 group-hover:border-redPrimary transition">
                      Taxes & Fees <ChevronDown className={`w-3 h-3 transition-transform ${showFeesBreakdown ? 'rotate-180' : ''}`} />
                    </span>
                    <strong className="text-slate-900 dark:text-white font-extrabold">₹{totalTaxesAndFees}</strong>
                  </div>

                  <AnimatePresence>
                    {showFeesBreakdown && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="pl-3 space-y-2 text-[11px] text-slate-500 dark:text-slate-400 border-l-2 border-slate-200 dark:border-neutral-700 ml-1 overflow-hidden"
                      >
                        <div className="flex justify-between pt-1">
                          <span>Visiting / Platform Fee</span>
                          <span className={(isHiMistriAmazeSub || selectedAmazePlan) ? 'text-amber-500 line-through' : ''}>
                            ₹{platformFees.visitingFee || 0}
                          </span>
                        </div>
                        {(isHiMistriAmazeSub || selectedAmazePlan) && (
                          <div className="flex justify-between text-amber-500 font-bold">
                            <span>Amaze Waived</span>
                            <span>-₹{platformFees.visitingFee || 0}</span>
                          </div>
                        )}
                        {surgeFee > 0 && (
                          <div className="flex justify-between text-orangeSecondary">
                            <span>Surge Fee ({platformFees.surgeFeeReason})</span>
                            <span>₹{surgeFee}</span>
                          </div>
                        )}
                        <div className="flex justify-between pb-1">
                          <span>GST ({platformFees.gstPercentage}%)</span>
                          <span>₹{gstAmount}</span>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="border-t border-slate-200 dark:border-neutral-800 pt-3 flex justify-between items-center text-base font-black text-slate-900 dark:text-white">
                  <span>Total Amount Payable:</span>
                  <span className="text-2xl font-black text-redPrimary">₹{finalTotalAmount}</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary w-full py-4 text-xs font-black shadow-xl bg-redPrimary hover:bg-redDark text-white transition cursor-pointer rounded-xl flex items-center justify-center gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                {isSubmitting ? 'Placing Booking...' : `Confirm & Place Order (₹${finalTotalAmount})`}
              </button>

              <p className="text-[10px] text-slate-400 text-center flex items-center justify-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 inline" /> 100% Secure & Verified Doorstep Dispatch in Sikkim
              </p>
            </div>

          </div>

        </form>
      </main>

      <PopupModal
        isOpen={popupState.isOpen}
        onClose={() => setPopupState({ ...popupState, isOpen: false })}
        title={popupState.title}
        message={popupState.message}
        type={popupState.type}
        actionText="View Booking Status"
        onAction={popupState.onAction}
      />

      {/* Online Payment Gateway Selection Modal */}
      {showOnlinePaymentModal && pendingBookingData && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1A1A1A] border border-slate-200 dark:border-neutral-800 rounded-3xl w-full max-w-4xl shadow-2xl relative overflow-hidden flex flex-col md:flex-row h-[550px] max-h-[90vh]">

            <button
              onClick={() => setShowOnlinePaymentModal(false)}
              className="absolute top-4 right-4 z-20 p-2 bg-slate-100 dark:bg-neutral-800 rounded-full text-slate-400 hover:text-redPrimary transition"
            >
              <X className="w-5 h-5" />
            </button>

            {isProcessingGateway ? (
              <div className="flex-1 flex flex-col items-center justify-center space-y-4 p-8">
                <div className="w-12 h-12 border-4 border-slate-200 dark:border-neutral-800 border-t-redPrimary rounded-full animate-spin"></div>
                <p className="text-base font-bold text-slate-700 dark:text-slate-300">Processing secure transaction...</p>
                <p className="text-xs text-slate-500">Please do not close or refresh this window.</p>
              </div>
            ) : (
              <>
                {/* Left Pane - Payment Methods */}
                <div className="w-full md:w-1/3 bg-slate-50 dark:bg-neutral-900 border-r border-slate-200 dark:border-neutral-800 flex flex-col h-full overflow-y-auto">
                  <div className="p-6 border-b border-slate-200 dark:border-neutral-800">
                    <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5 text-emerald-500" /> Secure Checkout
                    </h3>
                  </div>

                  <div className="flex flex-col flex-1 p-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setActivePaymentTab('CARD')}
                      className={`p-4 rounded-xl border flex items-center gap-3 transition group text-left ${activePaymentTab === 'CARD' ? 'bg-white dark:bg-[#1A1A1A] border-redPrimary shadow-md' : 'border-transparent hover:bg-slate-200/50 dark:hover:bg-neutral-800/50'}`}
                    >
                      <CreditCard className={`w-5 h-5 ${activePaymentTab === 'CARD' ? 'text-redPrimary' : 'text-slate-500 group-hover:text-slate-900 dark:group-hover:text-white'}`} />
                      <strong className={`block text-sm font-bold ${activePaymentTab === 'CARD' ? 'text-redPrimary' : 'text-slate-700 dark:text-slate-300'}`}>Credit/Debit Card</strong>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActivePaymentTab('UPI_APPS')}
                      className={`p-4 rounded-xl border flex items-center gap-3 transition group text-left ${activePaymentTab === 'UPI_APPS' ? 'bg-white dark:bg-[#1A1A1A] border-redPrimary shadow-md' : 'border-transparent hover:bg-slate-200/50 dark:hover:bg-neutral-800/50'}`}
                    >
                      <Smartphone className={`w-5 h-5 ${activePaymentTab === 'UPI_APPS' ? 'text-redPrimary' : 'text-slate-500 group-hover:text-slate-900 dark:group-hover:text-white'}`} />
                      <strong className={`block text-sm font-bold ${activePaymentTab === 'UPI_APPS' ? 'text-redPrimary' : 'text-slate-700 dark:text-slate-300'}`}>UPI Apps / ID</strong>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActivePaymentTab('QR_CODE')}
                      className={`p-4 rounded-xl border flex items-center gap-3 transition group text-left ${activePaymentTab === 'QR_CODE' ? 'bg-white dark:bg-[#1A1A1A] border-redPrimary shadow-md' : 'border-transparent hover:bg-slate-200/50 dark:hover:bg-neutral-800/50'}`}
                    >
                      <QrCode className={`w-5 h-5 ${activePaymentTab === 'QR_CODE' ? 'text-redPrimary' : 'text-slate-500 group-hover:text-slate-900 dark:group-hover:text-white'}`} />
                      <strong className={`block text-sm font-bold ${activePaymentTab === 'QR_CODE' ? 'text-redPrimary' : 'text-slate-700 dark:text-slate-300'}`}>Scan QR Code</strong>
                    </button>
                  </div>
                </div>

                {/* Right Pane - Payment Details */}
                <div className="w-full md:w-2/3 bg-white dark:bg-[#1A1A1A] flex flex-col h-full overflow-y-auto">
                  <div className="p-6 border-b border-slate-100 dark:border-neutral-800 flex justify-between items-center bg-slate-50/50 dark:bg-black/20">
                    <span className="text-sm font-bold text-slate-500">Amount Payable</span>
                    <strong className="text-2xl font-black text-redPrimary">₹{pendingBookingData.totalAmount}</strong>
                  </div>

                  <div className="p-6 flex-1 flex flex-col justify-center max-w-md w-full mx-auto">
                    {activePaymentTab === 'CARD' && (
                      <div className="space-y-4 animate-in fade-in zoom-in-95 duration-200">
                        <div>
                          <label className="text-xs font-bold text-slate-500 dark:text-slate-400 block mb-1">Card Number</label>
                          <input
                            type="text"
                            placeholder="4000 1234 5678 9010"
                            value={cardNum}
                            onChange={(e) => setCardNum(e.target.value.replace(/\D/g, '').substring(0, 16))}
                            className="w-full p-3.5 rounded-xl border border-slate-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm font-bold text-slate-900 dark:text-white tracking-widest outline-none focus:border-redPrimary"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 block mb-1">Expiry (MM/YY)</label>
                            <input
                              type="text"
                              placeholder="MM/YY"
                              value={cardExp}
                              onChange={(e) => setCardExp(e.target.value.substring(0, 5))}
                              className="w-full p-3.5 rounded-xl border border-slate-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm font-bold text-slate-900 dark:text-white tracking-widest outline-none focus:border-redPrimary"
                            />
                          </div>
                          <div>
                            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 block mb-1">CVV</label>
                            <input
                              type="password"
                              placeholder="123"
                              maxLength={4}
                              value={cardCvv}
                              onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, ''))}
                              className="w-full p-3.5 rounded-xl border border-slate-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm font-bold text-slate-900 dark:text-white tracking-widest outline-none focus:border-redPrimary"
                            />
                          </div>
                        </div>
                        <button
                          onClick={() => handleProcessOnlinePayment('RAZORPAY_CARDS')}
                          disabled={cardNum.length < 15 || !cardExp || cardCvv.length < 3}
                          className={`btn-primary w-full py-4 text-sm font-black mt-4 shadow-lg ${cardNum.length < 15 || !cardExp || cardCvv.length < 3 ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          <Lock className="w-4 h-4 mr-1" /> Pay ₹{pendingBookingData.totalAmount} Securely
                        </button>
                      </div>
                    )}

                    {activePaymentTab === 'UPI_APPS' && (
                      <div className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
                        <div className="grid grid-cols-4 gap-3">
                          <div className="flex flex-col items-center gap-2 cursor-pointer group">
                            <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-center group-hover:border-redPrimary transition">
                              <span className="font-black text-blue-600">G</span>
                            </div>
                            <span className="text-[10px] font-bold text-slate-500">GPay</span>
                          </div>
                          <div className="flex flex-col items-center gap-2 cursor-pointer group">
                            <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-center group-hover:border-redPrimary transition">
                              <span className="font-black text-purple-600">Pe</span>
                            </div>
                            <span className="text-[10px] font-bold text-slate-500">PhonePe</span>
                          </div>
                          <div className="flex flex-col items-center gap-2 cursor-pointer group">
                            <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-center group-hover:border-redPrimary transition">
                              <span className="font-black text-sky-500">Pym</span>
                            </div>
                            <span className="text-[10px] font-bold text-slate-500">Paytm</span>
                          </div>
                          <div className="flex flex-col items-center gap-2 cursor-pointer group">
                            <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-center group-hover:border-redPrimary transition">
                              <span className="font-black text-orange-500">B</span>
                            </div>
                            <span className="text-[10px] font-bold text-slate-500">BHIM</span>
                          </div>
                        </div>

                        <div className="relative flex items-center justify-center my-2">
                          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200 dark:border-neutral-700"></div></div>
                          <div className="relative bg-white dark:bg-[#1A1A1A] px-4 text-xs font-bold text-slate-400">OR ENTER UPI ID</div>
                        </div>

                        <div>
                          <input
                            type="text"
                            placeholder="e.g. 9876543210@ybl"
                            value={upiId}
                            onChange={(e) => setUpiId(e.target.value.toLowerCase())}
                            className="w-full p-4 rounded-xl border border-slate-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm font-bold text-slate-900 dark:text-white outline-none focus:border-redPrimary text-center"
                          />
                        </div>

                        <button
                          onClick={() => handleProcessOnlinePayment('UPI_APPS')}
                          disabled={upiId.length < 5 || !upiId.includes('@')}
                          className={`btn-primary w-full py-4 text-sm font-black shadow-lg ${upiId.length < 5 || !upiId.includes('@') ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          Verify & Pay ₹{pendingBookingData.totalAmount}
                        </button>
                      </div>
                    )}

                    {activePaymentTab === 'QR_CODE' && (
                      <div className="flex flex-col items-center justify-center space-y-5 animate-in fade-in zoom-in-95 duration-200 text-center">
                        <div className="p-3 bg-white rounded-2xl shadow-xl border border-slate-200">
                          <img
                            src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=upi://pay?pa=himistri@sbi&pn=HiMistri&am=${pendingBookingData.totalAmount}`}
                            alt="Scan to Pay"
                            className="w-40 h-40 object-contain"
                          />
                        </div>
                        <div>
                          <h4 className="text-sm font-black text-slate-900 dark:text-white">Scan with any UPI App</h4>
                          <p className="text-xs text-slate-500 mt-1">Open GPay, PhonePe, or Paytm and scan the QR code to complete your payment.</p>
                        </div>

                        <button
                          onClick={() => handleProcessOnlinePayment('UPI_QR_CODE')}
                          className="btn-primary w-full py-4 text-sm font-black shadow-lg bg-emerald-600 hover:bg-emerald-700 mt-4"
                        >
                          <CheckCircle className="w-4 h-4 mr-1" /> I have completed the payment
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
                            value={cardNum}
                            onChange={(e) => setCardNum(e.target.value.replace(/\D/g, '').substring(0, 16))}
                            className="w-full p-3.5 rounded-xl border border-slate-300 dark:border-neutral-700 bg-slate-50 dark:bg-neutral-900 text-sm font-bold tracking-widest outline-none focus:border-redPrimary"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 block mb-1">Expiry (MM/YY)</label>
                            <input
                              type="text"
                              placeholder="MM/YY"
                              value={cardExp}
                              onChange={(e) => setCardExp(e.target.value.substring(0, 5))}
                              className="w-full p-3.5 rounded-xl border border-slate-300 dark:border-neutral-700 bg-slate-50 dark:bg-neutral-900 text-sm font-bold tracking-widest outline-none focus:border-redPrimary"
                            />
                          </div>
                          <div>
                            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 block mb-1">CVV</label>
                            <input
                              type="password"
                              placeholder="123"
                              maxLength={4}
                              value={cardCvv}
                              onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, ''))}
                              className="w-full p-3.5 rounded-xl border border-slate-300 dark:border-neutral-700 bg-slate-50 dark:bg-neutral-900 text-sm font-bold tracking-widest outline-none focus:border-redPrimary"
                            />
                          </div>
                        </div>
                        <button
                          onClick={() => handleProcessOnlinePayment('RAZORPAY_CARDS')}
                          disabled={cardNum.length < 15 || !cardExp || cardCvv.length < 3}
                          className={`btn-primary w-full py-4 text-sm font-black mt-4 shadow-lg ${cardNum.length < 15 || !cardExp || cardCvv.length < 3 ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          <Lock className="w-4 h-4 mr-1" /> Pay ₹{pendingBookingData.totalAmount} Securely
                        </button>
                      </div>
                    )}

                    {activePaymentTab === 'UPI_APPS' && (
                      <div className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
                        <div className="grid grid-cols-4 gap-3">
                          <div className="flex flex-col items-center gap-2 cursor-pointer group">
                            <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-center group-hover:border-redPrimary transition">
                              <span className="font-black text-blue-600">G</span>
                            </div>
                            <span className="text-[10px] font-bold text-slate-500">GPay</span>
                          </div>
                          <div className="flex flex-col items-center gap-2 cursor-pointer group">
                            <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-center group-hover:border-redPrimary transition">
                              <span className="font-black text-purple-600">Pe</span>
                            </div>
                            <span className="text-[10px] font-bold text-slate-500">PhonePe</span>
                          </div>
                          <div className="flex flex-col items-center gap-2 cursor-pointer group">
                            <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-center group-hover:border-redPrimary transition">
                              <span className="font-black text-sky-500">Pym</span>
                            </div>
                            <span className="text-[10px] font-bold text-slate-500">Paytm</span>
                          </div>
                          <div className="flex flex-col items-center gap-2 cursor-pointer group">
                            <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-center group-hover:border-redPrimary transition">
                              <span className="font-black text-orange-500">B</span>
                            </div>
                            <span className="text-[10px] font-bold text-slate-500">BHIM</span>
                          </div>
                        </div>

                        <div className="relative flex items-center justify-center my-2">
                          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200 dark:border-neutral-700"></div></div>
                          <div className="relative bg-white dark:bg-[#1A1A1A] px-4 text-xs font-bold text-slate-400">OR ENTER UPI ID</div>
                        </div>

                        <div>
                          <input
                            type="text"
                            placeholder="e.g. 9876543210@ybl"
                            value={upiId}
                            onChange={(e) => setUpiId(e.target.value.toLowerCase())}
                            className="w-full p-4 rounded-xl border border-slate-300 dark:border-neutral-700 bg-slate-50 dark:bg-neutral-900 text-sm font-bold outline-none focus:border-redPrimary text-center"
                          />
                        </div>

                        <button
                          onClick={() => handleProcessOnlinePayment('UPI_APPS')}
                          disabled={upiId.length < 5 || !upiId.includes('@')}
                          className={`btn-primary w-full py-4 text-sm font-black shadow-lg ${upiId.length < 5 || !upiId.includes('@') ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          Verify & Pay ₹{pendingBookingData.totalAmount}
                        </button>
                      </div>
                    )}

                    {activePaymentTab === 'QR_CODE' && (
                      <div className="flex flex-col items-center justify-center space-y-5 animate-in fade-in zoom-in-95 duration-200 text-center">
                        <div className="p-3 bg-white rounded-2xl shadow-xl border border-slate-200">
                          {/* Use standard QR generator API to create realistic dummy QR */}
                          <img
                            src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=upi://pay?pa=himistri@sbi&pn=HiMistri&am=${pendingBookingData.totalAmount}`}
                            alt="Scan to Pay"
                            className="w-40 h-40 object-contain"
                          />
                        </div>
                        <div>
                          <h4 className="text-sm font-black text-slate-900 dark:text-white">Scan with any UPI App</h4>
                          <p className="text-xs text-slate-500 mt-1">Open GPay, PhonePe, or Paytm and scan the QR code to complete your payment.</p>
                        </div>

                        <button
                          onClick={() => handleProcessOnlinePayment('UPI_QR_CODE')}
                          className="btn-primary w-full py-4 text-sm font-black shadow-lg bg-emerald-600 hover:bg-emerald-700 mt-4"
                        >
                          <CheckCircle className="w-4 h-4 mr-1" /> I have completed the payment
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
