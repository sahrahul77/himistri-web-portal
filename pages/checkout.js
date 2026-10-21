import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Header from '../components/Header';
import Footer from '../components/Footer';
import PopupModal from '../components/PopupModal';
import { ref, set, push, onValue } from 'firebase/database';
import { rtdb } from '../lib/firebase';
import { useAuth } from '../lib/AuthContext';
import { ShoppingBag, Calendar, Clock, MapPin, CreditCard, CheckCircle, Plus, Minus, Lock, LogIn, Map, X, Timer, ShieldCheck } from 'lucide-react';
import { DURATION_PLANS, getDurationOptions, getDurationUnitText, calculateDurationPrice } from '../lib/durationHelpers';

export default function CheckoutPage() {
  const router = useRouter();
  const [isDark, setIsDark] = useState(true);
  const { currentUser, isAuthLoaded } = useAuth();

  const [quantity, setQuantity] = useState(1);
  const [date, setDate] = useState('');
  const [slot, setSlot] = useState('');

  // Booking Plan & Duration Dropdown States
  const [bookingPlan, setBookingPlan] = useState('HOURLY'); // HOURLY, DAILY, WEEKLY, MONTHLY, YEARLY
  const [durationValue, setDurationValue] = useState(1);

  // Address Form Structured States
  const [savedAddressesList, setSavedAddressesList] = useState([]);
  const [selectedSavedAddr, setSelectedSavedAddr] = useState('new');
  const [newAddrType, setNewAddrType] = useState('Home');
  const [houseNo, setHouseNo] = useState('');
  const [streetAddress, setStreetAddress] = useState('');
  const [locality, setLocality] = useState('');
  const [city, setCity] = useState('Gangtok');
  const [state, setState] = useState('Sikkim');
  const [pincode, setPincode] = useState('737101');

  const [paymentMethod, setPaymentMethod] = useState('CASH_ON_DELIVERY');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Dynamic Popup Modal State
  const [popupState, setPopupState] = useState({ isOpen: false, title: '', message: '', type: 'success', onAction: null });

  const [service, setService] = useState(null);

  // Automatic Theme Synchronization Effect
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.setAttribute('data-theme', 'light');
    }
  }, [isDark]);

  useEffect(() => {
    try {
      const storedSrv = localStorage.getItem('himistri_checkout_service');
      if (storedSrv) setService(JSON.parse(storedSrv));
    } catch (e) {}

    const tmrw = new Date();
    tmrw.setDate(tmrw.getDate() + 1);
    setDate(tmrw.toISOString().split('T')[0]);
    setSlot('09:00');

    if (currentUser) {
      const userRef = ref(rtdb, `users/${currentUser.id}`);
      onValue(userRef, (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.val();
          if (data.addresses) {
            const addrs = Object.keys(data.addresses).map(k => ({
              id: k,
              ...data.addresses[k]
            }));
            setSavedAddressesList(addrs);

            if (addrs.length > 0) {
              const firstAddr = addrs[0];
              setSelectedSavedAddr(firstAddr.id);
              setNewAddrType(firstAddr.title || 'Home');
              setHouseNo(firstAddr.houseNo || '');
              setStreetAddress(firstAddr.streetAddress || firstAddr.fullAddress || '');
              setLocality(firstAddr.locality || '');
              setCity(firstAddr.city || 'Gangtok');
              setState('Sikkim');
              setPincode(firstAddr.pincode || '737101');
            }
          }
        }
      });
    }
  }, [currentUser]);

  // Dynamic Duration Price Calculation
  const basePrice = service ? (service.discountedPrice || service.originalPrice || 800) : 800;
  const singleUnitDurationPrice = calculateDurationPrice(basePrice, bookingPlan, durationValue);
  const totalPrice = singleUnitDurationPrice * quantity;
  const durationText = getDurationUnitText(bookingPlan, durationValue);
  const durationOptions = getDurationOptions(bookingPlan);

  const toggleTheme = () => {
    setIsDark(prev => !prev);
  };

  const handlePlanChange = (planId) => {
    setBookingPlan(planId);
    setDurationValue(1);
  };

  const handleSavedAddressChange = (e) => {
    const val = e.target.value;
    setSelectedSavedAddr(val);

    if (val === 'new') {
      setHouseNo('');
      setStreetAddress('');
      setLocality('');
      setCity('Gangtok');
      setState('Sikkim');
      setPincode('737101');
    } else {
      const matchedAddr = savedAddressesList.find(a => a.id === val || a.fullAddress === val);
      if (matchedAddr) {
        setNewAddrType(matchedAddr.title || 'Home');
        setHouseNo(matchedAddr.houseNo || '');
        setStreetAddress(matchedAddr.streetAddress || matchedAddr.fullAddress || '');
        setLocality(matchedAddr.locality || '');
        setCity(matchedAddr.city || 'Gangtok');
        setState('Sikkim');
        setPincode(matchedAddr.pincode || '737101');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser) return;
    if (!service) {
      setPopupState({
        isOpen: true,
        title: 'Cart is Empty',
        message: 'No service selected for checkout. Please browse the catalog.',
        type: 'error'
      });
      return;
    }

    if (!streetAddress) {
      setPopupState({
        isOpen: true,
        title: 'Address Required',
        message: 'Please enter Address (Building, Street, Area).',
        type: 'error'
      });
      return;
    }

    if (!date || !slot) {
      setPopupState({
        isOpen: true,
        title: 'Schedule Required',
        message: 'Please select a valid Custom Service Date and Arrival Time.',
        type: 'error'
      });
      return;
    }

    setIsSubmitting(true);

    const bookingRef = 'HM-' + new Date().toISOString().slice(0, 10).replace(/-/g, '') + '-' + Math.floor(100 + Math.random() * 900);
    const bookingId = 'bk_' + Math.random().toString(36).substring(2, 10);
    const fullAddrString = `${houseNo ? houseNo + ', ' : ''}${streetAddress}, ${locality ? locality + ', ' : ''}${city || 'Gangtok'}, Sikkim. PIN: ${pincode || '737101'}`;

    if (selectedSavedAddr === 'new' && currentUser) {
      try {
        const userAddrRef = push(ref(rtdb, `users/${currentUser.id}/addresses`));
        await set(userAddrRef, {
          title: newAddrType,
          houseNo: houseNo,
          streetAddress: streetAddress,
          locality: locality,
          city: city || 'Gangtok',
          state: 'Sikkim',
          pincode: pincode || '737101',
          fullAddress: fullAddrString,
          createdAt: new Date().toISOString()
        });
      } catch (err) {
        console.error("Could not save address to user profile:", err);
      }
    }

    // Save Complete Booking object with Duration Plan to Firebase
    const bookingData = {
      id: bookingId,
      bookingRef: bookingRef,
      userId: currentUser.id,
      userName: currentUser.fullName,
      userPhone: currentUser.phoneNumber,
      customerPhone: currentUser.phoneNumber,
      serviceId: service.id,
      serviceTitle: service.title,
      serviceCategory: service.categoryName || 'General',
      quantity: quantity,
      bookingPlan: bookingPlan, // HOURLY, DAILY, WEEKLY, MONTHLY, YEARLY
      durationValue: durationValue,
      durationUnitText: durationText, // e.g. "3 Hours", "2 Days", "1 Week"
      totalAmount: totalPrice,
      scheduledDate: date,
      scheduledTimeSlot: slot,
      address: fullAddrString,
      paymentMethod: paymentMethod,
      status: 'PENDING',
      trackingStatus: 'Order Placed by Customer',
      createdAt: new Date().toISOString()
    };

    try {
      await set(ref(rtdb, `bookings/${bookingId}`), bookingData);
      localStorage.removeItem('himistri_checkout_service');
      setIsSubmitting(false);

      setPopupState({
        isOpen: true,
        title: 'Order Confirmed!',
        message: `Booking Ref: ${bookingRef}\nDuration: ${durationText}\nTotal: ₹${totalPrice}\n\nOur verified technician is dispatched!`,
        type: 'success',
        onAction: () => router.push(`/tracking?ref=${bookingRef}`)
      });
    } catch (err) {
      setIsSubmitting(false);
      setPopupState({
        isOpen: true,
        title: 'Order Placement Failed',
        message: err.message,
        type: 'error'
      });
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-[#0F0F0F] text-slate-900 dark:text-white transition-colors duration-200">
      <Header isDark={isDark} onToggleTheme={toggleTheme} currentUser={currentUser} />

      <main className="web-container py-6 sm:py-10 flex-1 max-w-5xl mx-auto px-4 sm:px-6 w-full">
        {!isAuthLoaded ? (
          <div className="web-card text-center py-16 text-slate-500">Verifying session...</div>
        ) : !currentUser ? (
          <div className="web-card text-center py-16 space-y-4 max-w-md mx-auto bg-white dark:bg-[#1A1A1A] border border-slate-200 dark:border-[#333333]">
            <Lock className="w-16 h-16 text-redPrimary mx-auto" />
            <h2 className="text-2xl font-black">Sign In Required</h2>
            <p className="text-xs text-slate-500">Please sign in to place a doorstep service booking in Gangtok.</p>
            <Link href="/auth?redirect=checkout" className="btn-primary inline-flex">
              <LogIn className="w-4 h-4" /> Sign In to Proceed
            </Link>
          </div>
        ) : !service ? (
          <div className="web-card text-center py-16 space-y-4 max-w-md mx-auto bg-white dark:bg-[#1A1A1A] border border-slate-200 dark:border-[#333333]">
            <ShoppingBag className="w-16 h-16 text-slate-300 mx-auto" />
            <h2 className="text-2xl font-black">Your Cart is Empty</h2>
            <p className="text-xs text-slate-500">Browse our services catalog and select a service to hire.</p>
            <Link href="/services" className="btn-primary inline-flex">
              Browse Services
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-redPrimary/10 text-redPrimary">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-black">Complete Your Doorstep Booking</h1>
                <p className="text-xs text-slate-500 dark:text-slate-400">Select duration dropdowns, schedule date & address in Gangtok, Sikkim</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">

              {/* Left 2 Columns: Order Form & Duration Dropdowns */}
              <div className="lg:col-span-2 space-y-6">

                {/* Selected Service Card */}
                <div className="web-card p-5 rounded-2xl bg-white dark:bg-[#1A1A1A] border border-slate-200 dark:border-[#333333] shadow-md flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <img src={service.imageUrl} alt="" className="w-16 h-16 object-contain rounded-xl bg-neutral-800 p-1" />
                    <div>
                      <span className="text-[10px] font-black text-redPrimary uppercase">{service.categoryName || 'General'}</span>
                      <h3 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white">{service.title}</h3>
                      <p className="text-xs text-redPrimary font-black">Base Rate: ₹{basePrice}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 bg-slate-100 dark:bg-neutral-800 p-1.5 rounded-xl border border-slate-200 dark:border-neutral-700">
                    <button type="button" onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-neutral-700 text-slate-700 dark:text-white"><Minus className="w-3.5 h-3.5" /></button>
                    <span className="text-xs font-black px-2">{quantity}</span>
                    <button type="button" onClick={() => setQuantity(quantity + 1)} className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-neutral-700 text-slate-700 dark:text-white"><Plus className="w-3.5 h-3.5" /></button>
                  </div>
                </div>

                {/* DURATION PLAN DROPDOWNS */}
                <div className="web-card p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#1A1A1A] border border-slate-200 dark:border-[#333333] shadow-md space-y-4">
                  <h3 className="text-base font-extrabold text-redPrimary flex items-center gap-2">
                    <Timer className="w-5 h-5" /> Select Booking Duration Basis
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 dark:bg-neutral-900 p-4 rounded-xl border border-slate-200 dark:border-neutral-800">

                    {/* Dropdown 1: Duration Plan Basis */}
                    <div>
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5 flex items-center gap-1.5">
                        <Timer className="w-4 h-4 text-redPrimary" /> 1. Duration Basis Plan *
                      </label>
                      <select
                        value={bookingPlan}
                        onChange={(e) => handlePlanChange(e.target.value)}
                        className="w-full p-3.5 rounded-xl border border-slate-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-xs font-extrabold text-slate-900 dark:text-white outline-none focus:border-redPrimary shadow-sm cursor-pointer"
                      >
                        {DURATION_PLANS.map((plan) => (
                          <option key={plan.id} value={plan.id}>
                            {plan.label} ({plan.desc})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Dropdown 2: Duration Units */}
                    <div>
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5 flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-redPrimary" /> 2. Duration Units (<strong className="text-redPrimary">{durationText}</strong>) *
                      </label>
                      <select
                        value={durationValue}
                        onChange={(e) => setDurationValue(parseInt(e.target.value, 10))}
                        className="w-full p-3.5 rounded-xl border border-slate-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-xs font-extrabold text-slate-900 dark:text-white outline-none focus:border-redPrimary shadow-sm cursor-pointer"
                      >
                        {durationOptions.map((unit) => (
                          <option key={unit} value={unit}>
                            {unit} {bookingPlan === 'HOURLY' ? (unit === 1 ? 'Hour' : 'Hours') : bookingPlan === 'DAILY' ? (unit === 1 ? 'Day' : 'Days') : bookingPlan === 'WEEKLY' ? (unit === 1 ? 'Week' : 'Weeks') : bookingPlan === 'MONTHLY' ? (unit === 1 ? 'Month' : 'Months') : (unit === 1 ? 'Year' : 'Years')}
                          </option>
                        ))}
                      </select>
                    </div>

                  </div>
                </div>

                {/* Schedule Date & Arrival Time */}
                <div className="web-card p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#1A1A1A] border border-slate-200 dark:border-[#333333] shadow-md space-y-4">
                  <h3 className="text-base font-extrabold text-redPrimary flex items-center gap-2">
                    <Calendar className="w-5 h-5" /> Service Schedule & Arrival Time
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-500 dark:text-slate-400 block mb-1">Service Start Date *</label>
                      <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required className="w-full p-3 rounded-xl border border-slate-300 dark:border-neutral-700 bg-slate-50 dark:bg-neutral-900 text-xs font-bold text-slate-900 dark:text-white outline-none focus:border-redPrimary" />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-500 dark:text-slate-400 block mb-1">Arrival Time *</label>
                      <input type="time" value={slot} onChange={(e) => setSlot(e.target.value)} required className="w-full p-3 rounded-xl border border-slate-300 dark:border-neutral-700 bg-slate-50 dark:bg-neutral-900 text-xs font-bold text-slate-900 dark:text-white outline-none focus:border-redPrimary" />
                    </div>
                  </div>
                </div>

                {/* Complete Structured Address Details matching Profile 100% */}
                <div className="web-card p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#1A1A1A] border border-slate-200 dark:border-[#333333] shadow-md space-y-4">
                  <h3 className="text-base font-extrabold text-redPrimary flex items-center gap-2">
                    <MapPin className="w-5 h-5" /> Doorstep Service Address in Gangtok
                  </h3>

                  {savedAddressesList.length > 0 && (
                    <div>
                      <label className="text-xs font-bold text-slate-500 dark:text-slate-400 block mb-1">Saved Addresses</label>
                      <select value={selectedSavedAddr} onChange={handleSavedAddressChange} className="w-full p-3 rounded-xl border border-slate-300 dark:border-neutral-700 bg-slate-50 dark:bg-neutral-900 text-xs font-bold text-slate-900 dark:text-white outline-none focus:border-redPrimary">
                        <option value="new">+ Enter New Doorstep Address</option>
                        {savedAddressesList.map(a => <option key={a.id} value={a.id}>{a.title || 'Address'}: {a.fullAddress}</option>)}
                      </select>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 dark:bg-neutral-900 p-4 rounded-2xl border border-slate-200 dark:border-neutral-800">

                    {/* Address Type Tag Selector */}
                    <div className="sm:col-span-2">
                      <label className="text-[11px] font-extrabold text-slate-500 dark:text-slate-400 block mb-1">Type of Address *</label>
                      <div className="flex gap-2">
                        {['Home', 'Work', 'Office', 'Other'].map((t) => (
                          <button
                            key={t}
                            type="button"
                            onClick={() => setNewAddrType(t)}
                            className={`px-3.5 py-1.5 rounded-lg text-xs font-extrabold border transition ${
                              newAddrType === t ? 'bg-redPrimary text-white border-redPrimary shadow-md' : 'bg-white dark:bg-neutral-800 text-slate-400 border-slate-200 dark:border-neutral-700'
                            }`}
                          >
                            {t === 'Home' ? '🏡 Home' : t === 'Work' ? '🏢 Work' : t === 'Office' ? '💼 Office' : '📍 Other'}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* House No / Tower / Block */}
                    <div>
                      <label className="text-[11px] font-extrabold text-slate-500 dark:text-slate-400 block mb-1">House No. / Tower / Block</label>
                      <input
                        type="text"
                        value={houseNo}
                        onChange={(e) => setHouseNo(e.target.value)}
                        placeholder="e.g. Flat 4B / Block C"
                        className="w-full p-3 rounded-xl border border-slate-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-xs font-semibold text-slate-900 dark:text-white outline-none focus:border-redPrimary"
                      />
                    </div>

                    {/* Address (Building, Street, Area) */}
                    <div>
                      <label className="text-[11px] font-extrabold text-slate-500 dark:text-slate-400 block mb-1">Address (Building, Street, Area) *</label>
                      <input
                        type="text"
                        value={streetAddress}
                        onChange={(e) => setStreetAddress(e.target.value)}
                        placeholder="e.g. Upper Syari, Deorali-Bazar *"
                        required
                        className="w-full p-3 rounded-xl border border-slate-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-xs font-semibold text-slate-900 dark:text-white outline-none focus:border-redPrimary"
                      />
                    </div>

                    {/* Locality / Town */}
                    <div>
                      <label className="text-[11px] font-extrabold text-slate-500 dark:text-slate-400 block mb-1">Locality / Town</label>
                      <input
                        type="text"
                        value={locality}
                        onChange={(e) => setLocality(e.target.value)}
                        placeholder="e.g. Near ICDS Center"
                        className="w-full p-3 rounded-xl border border-slate-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-xs font-semibold text-slate-900 dark:text-white outline-none focus:border-redPrimary"
                      />
                    </div>

                    {/* City / District */}
                    <div>
                      <label className="text-[11px] font-extrabold text-slate-500 dark:text-slate-400 block mb-1">City / District</label>
                      <input
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="Gangtok"
                        className="w-full p-3 rounded-xl border border-slate-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-xs font-semibold text-slate-900 dark:text-white outline-none focus:border-redPrimary"
                      />
                    </div>

                    {/* State (Default Fixed = Sikkim) */}
                    <div>
                      <label className="text-[11px] font-extrabold text-slate-500 dark:text-slate-400 block mb-1">State (Default Fixed)</label>
                      <input
                        type="text"
                        value="Sikkim"
                        disabled
                        className="w-full p-3 rounded-xl border border-slate-200 dark:border-neutral-700 bg-slate-200 dark:bg-neutral-950 text-slate-500 text-xs font-bold cursor-not-allowed"
                      />
                    </div>

                    {/* Pincode (Default = 737101) */}
                    <div>
                      <label className="text-[11px] font-extrabold text-slate-500 dark:text-slate-400 block mb-1">Pincode (Default: 737101)</label>
                      <input
                        type="text"
                        value={pincode}
                        onChange={(e) => setPincode(e.target.value)}
                        placeholder="737101"
                        className="w-full p-3 rounded-xl border border-slate-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-xs font-semibold text-slate-900 dark:text-white outline-none focus:border-redPrimary"
                      />
                    </div>

                  </div>
                </div>

                {/* Payment Method */}
                <div className="web-card p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#1A1A1A] border border-slate-200 dark:border-[#333333] shadow-md space-y-3">
                  <h3 className="text-base font-extrabold text-redPrimary flex items-center gap-2">
                    <CreditCard className="w-5 h-5" /> Payment Method
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <label className={`p-4 rounded-xl border flex items-center gap-3 cursor-pointer transition ${paymentMethod === 'CASH_ON_DELIVERY' ? 'border-redPrimary bg-redPrimary/10' : 'border-slate-200 dark:border-neutral-800 bg-slate-50 dark:bg-neutral-900'}`}>
                      <input type="radio" name="pay" checked={paymentMethod === 'CASH_ON_DELIVERY'} onChange={() => setPaymentMethod('CASH_ON_DELIVERY')} className="accent-redPrimary" />
                      <div>
                        <strong className="text-xs block text-slate-900 dark:text-white font-extrabold">Cash on Service (COD)</strong>
                        <span className="text-[10px] text-slate-500">Pay directly to mistri after work</span>
                      </div>
                    </label>

                    <label className={`p-4 rounded-xl border flex items-center gap-3 cursor-pointer transition ${paymentMethod === 'ONLINE_UPI' ? 'border-redPrimary bg-redPrimary/10' : 'border-slate-200 dark:border-neutral-800 bg-slate-50 dark:bg-neutral-900'}`}>
                      <input type="radio" name="pay" checked={paymentMethod === 'ONLINE_UPI'} onChange={() => setPaymentMethod('ONLINE_UPI')} className="accent-redPrimary" />
                      <div>
                        <strong className="text-xs block text-slate-900 dark:text-white font-extrabold">Online UPI / GPay / PhonePe</strong>
                        <span className="text-[10px] text-slate-500">Instant QR Code payment</span>
                      </div>
                    </label>
                  </div>
                </div>

              </div>

              {/* Right Column: Dynamic Price Summary */}
              <div className="space-y-6">
                <div className="web-card p-6 rounded-2xl bg-white dark:bg-[#1A1A1A] border border-slate-200 dark:border-[#333333] shadow-xl space-y-4 sticky top-24">
                  <h3 className="text-base font-black text-slate-900 dark:text-white border-b border-slate-100 dark:border-neutral-800 pb-3">Booking Price Summary</h3>

                  <div className="space-y-2 text-xs font-semibold text-slate-600 dark:text-slate-300">
                    <div className="flex justify-between">
                      <span>Service Item:</span>
                      <span className="text-slate-900 dark:text-white font-bold">{service.title}</span>
                    </div>

                    <div className="flex justify-between">
                      <span>Duration Plan:</span>
                      <span className="text-redPrimary font-bold">{bookingPlan}</span>
                    </div>

                    <div className="flex justify-between">
                      <span>Duration Units:</span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold">{durationText}</span>
                    </div>

                    <div className="flex justify-between">
                      <span>Unit Duration Cost:</span>
                      <span>₹{singleUnitDurationPrice}</span>
                    </div>

                    <div className="flex justify-between">
                      <span>Quantity:</span>
                      <span>x {quantity}</span>
                    </div>

                    <div className="flex justify-between pt-3 border-t border-slate-200 dark:border-neutral-800 text-base font-black text-redPrimary">
                      <span>Total Amount:</span>
                      <span>₹{totalPrice}</span>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn-primary w-full py-4 text-sm font-black shadow-lg rounded-xl bg-redPrimary hover:bg-redDark text-white transition cursor-pointer"
                  >
                    <CheckCircle className="w-4 h-4 inline mr-1" />
                    {isSubmitting ? 'Placing Booking...' : `Confirm & Book (${durationText} • ₹${totalPrice})`}
                  </button>

                  <p className="text-[10px] text-slate-500 text-center flex items-center justify-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> 100% Verified Technical Manpower in Gangtok
                  </p>
                </div>
              </div>

            </form>
          </div>
        )}
      </main>

      <PopupModal
        isOpen={popupState.isOpen}
        onClose={() => setPopupState({ ...popupState, isOpen: false })}
        title={popupState.title}
        message={popupState.message}
        type={popupState.type}
        actionText="Track Order"
        onAction={popupState.onAction}
      />

      <Footer />
    </div>
  );
}
