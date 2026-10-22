import React, { useState, useEffect } from 'react';
import { X, CheckCircle, MapPin, Calendar, Clock, CreditCard, Plus, Minus, LogIn, Lock, Map, Timer, Tag } from 'lucide-react';
import { ref, set, push, onValue } from 'firebase/database';
import { rtdb } from '../lib/firebase';
import PopupModal from './PopupModal';
import Link from 'next/link';
import { DURATION_PLANS, getDurationOptions, getDurationUnitText, calculateDurationPrice } from '../lib/durationHelpers';
import { DEFAULT_COUPONS } from '../lib/defaultData';

export default function CheckoutModal({ isOpen, onClose, service, currentUser }) {
  const [quantity, setQuantity] = useState(1);
  const [date, setDate] = useState('');
  const [slot, setSlot] = useState('');

  // Booking Plan & Duration Dropdown States
  const [bookingPlan, setBookingPlan] = useState('HOURLY'); // HOURLY, DAILY, WEEKLY, MONTHLY, YEARLY
  const [durationValue, setDurationValue] = useState(1);

  // Structured Address States
  const [savedAddressesList, setSavedAddressesList] = useState([]);
  const [selectedSavedAddr, setSelectedSavedAddr] = useState('new');
  const [newAddrType, setNewAddrType] = useState('Home');
  const [houseNo, setHouseNo] = useState('');
  const [streetAddress, setStreetAddress] = useState('');
  const [locality, setLocality] = useState('');
  const [city, setCity] = useState('Gangtok');
  const [state, setState] = useState('Sikkim');
  const [pincode, setPincode] = useState('737101');

  // Promo Code States
  const [promoInput, setPromoInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponsList, setCouponsList] = useState(DEFAULT_COUPONS);
  const [promoError, setPromoError] = useState('');

  const [payment, setPayment] = useState('CASH_ON_DELIVERY');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Dynamic Popup Modal State
  const [popupState, setPopupState] = useState({ isOpen: false, title: '', message: '', type: 'success', onAction: null });

  useEffect(() => {
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

    // Fetch Live Coupons from Firebase Realtime Database
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
      setCouponsList(list.length > 0 ? list : DEFAULT_COUPONS);
    });

    return () => unsubCoupons();
  }, [currentUser]);

  if (!isOpen || !service) return null;

  const isLoggedIn = !!currentUser;

  // Dynamic Duration Price Calculation
  const basePrice = service ? (service.discountedPrice || service.originalPrice || 800) : 800;
  const singleUnitDurationPrice = calculateDurationPrice(basePrice, bookingPlan, durationValue);
  const subtotalPrice = singleUnitDurationPrice * quantity;
  const durationText = getDurationUnitText(bookingPlan, durationValue);
  const durationOptions = getDurationOptions(bookingPlan);

  // Promo Discount Calculation
  let discountAmount = 0;
  if (appliedCoupon) {
    const discVal = parseFloat(appliedCoupon.discountValue) || 0;
    if (appliedCoupon.discountType === 'PERCENTAGE') {
      discountAmount = Math.round(subtotalPrice * (discVal / 100));
    } else {
      discountAmount = Math.min(subtotalPrice, discVal);
    }
  }

  const finalTotalPrice = Math.max(0, subtotalPrice - discountAmount);

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

  // Promo Code Handlers
  const handleApplyPromoCode = (e) => {
    e.preventDefault();
    setPromoError('');
    const codeClean = promoInput.trim().toUpperCase();

    if (!codeClean) {
      setPromoError('Please enter a promo code.');
      return;
    }

    const activeCoupons = couponsList.length > 0 ? couponsList : DEFAULT_COUPONS;
    const foundCoupon = activeCoupons.find(c => (c.code || '').toUpperCase() === codeClean && (c.isActive !== false));

    if (!foundCoupon) {
      setPromoError('Invalid or expired promo code.');
      return;
    }

    const minAmount = parseFloat(foundCoupon.minOrderAmount) || 0;
    if (subtotalPrice < minAmount) {
      setPromoError(`Code requires a minimum subtotal order of ₹${minAmount}.`);
      return;
    }

    setAppliedCoupon(foundCoupon);
    setPromoError('');
    setPopupState({
      isOpen: true,
      title: 'Promo Code Applied! 🎉',
      message: `Code '${foundCoupon.code}' applied successfully!\nDiscount: ${foundCoupon.discountType === 'PERCENTAGE' ? foundCoupon.discountValue + '% OFF' : 'Flat ₹' + foundCoupon.discountValue + ' OFF'}`,
      type: 'success'
    });
  };

  const handleRemovePromoCode = () => {
    setAppliedCoupon(null);
    setPromoInput('');
    setPromoError('');
  };

  const handleCheckoutSubmit = async (e) => {
    e.preventDefault();
    if (!streetAddress) {
      setPopupState({
        isOpen: true,
        title: 'Address Required',
        message: 'Please enter Address (Building, Street, Area).',
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

    // Save Complete Booking Object with Duration Plan & Promo Discount
    const bookingData = {
      id: bookingId,
      bookingRef: bookingRef,
      userId: currentUser.id,
      userName: currentUser.fullName || 'Passang Bhutia',
      customerPhone: currentUser.phoneNumber || '+916296351107',
      userPhone: currentUser.phoneNumber || '+916296351107',
      serviceId: service.id,
      serviceTitle: service.title,
      serviceCategory: service.categoryName || 'General',
      quantity: quantity,
      bookingPlan: bookingPlan, // HOURLY, DAILY, WEEKLY, MONTHLY, YEARLY
      durationValue: durationValue,
      durationUnitText: durationText, // "3 Hours", "2 Days", "1 Week"
      subtotalAmount: subtotalPrice,
      appliedPromoCode: appliedCoupon ? appliedCoupon.code : 'NONE',
      discountAmount: discountAmount,
      totalAmount: finalTotalPrice,
      scheduledDate: date,
      scheduledTimeSlot: slot,
      address: fullAddrString,
      paymentMethod: payment,
      status: 'PENDING',
      trackingStatus: 'Order Placed by Customer',
      createdAt: new Date().toISOString()
    };

    try {
      await set(ref(rtdb, 'bookings/' + bookingId), bookingData);
      setIsSubmitting(false);

      setPopupState({
        isOpen: true,
        title: 'Order Placed Successfully!',
        message: `Ref ID: ${bookingRef}\nDuration: ${durationText}\nAmount: ₹${finalTotalPrice}${discountAmount > 0 ? ' (Saved ₹' + discountAmount + ')' : ''}`,
        type: 'success',
        onAction: () => {
          onClose();
          window.location.href = '/tracking';
        }
      });
    } catch (err) {
      setIsSubmitting(false);
      setPopupState({
        isOpen: true,
        title: 'Order Submission Failed',
        message: err.message,
        type: 'error'
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#1A1A1A] text-white border border-[#333333] rounded-2xl p-6 w-full max-w-2xl shadow-2xl relative max-h-[95vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-200">
          <X className="w-5 h-5" />
        </button>

        {!isLoggedIn ? (
          <div className="text-center py-16 space-y-4">
            <Lock className="w-16 h-16 text-redPrimary mx-auto" />
            <h2 className="text-2xl font-black">Login Required for Checkout</h2>
            <p className="text-xs text-slate-500">Please sign in or register your account before proceeding to checkout.</p>
            <Link href="/auth" className="btn-primary inline-flex mt-2">
              <LogIn className="w-4 h-4" /> Sign In / Register Account
            </Link>
          </div>
        ) : (
          <>
            <h3 className="text-xl font-bold mb-1">Checkout & Booking</h3>
            <p className="text-xs text-slate-400 mb-6">Select duration basis, promo code & doorstep address</p>

            <form onSubmit={handleCheckoutSubmit} className="space-y-6">
              {/* Service Summary & Quantity */}
              <div className="p-4 rounded-xl bg-redPrimary/10 border border-redPrimary/20 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h3 className="font-extrabold text-base text-redPrimary">{service.title}</h3>
                  <p className="text-xs text-slate-400">{service.categoryName} Category • Base Rate: ₹{basePrice}</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 bg-[#0F0F0F] border border-[#333333] rounded-lg p-1">
                    <button type="button" disabled={quantity <= 1} onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-1.5 text-slate-500 hover:text-redPrimary disabled:opacity-30"><Minus className="w-4 h-4" /></button>
                    <span className="font-extrabold text-sm px-2">{quantity}</span>
                    <button type="button" onClick={() => setQuantity(quantity + 1)} className="p-1.5 text-slate-500 hover:text-redPrimary"><Plus className="w-4 h-4" /></button>
                  </div>
                  <div className="text-right">
                    {discountAmount > 0 && (
                      <span className="text-xs text-slate-400 line-through block">₹{subtotalPrice}</span>
                    )}
                    <span className="text-xl font-black text-redPrimary">₹{finalTotalPrice}</span>
                  </div>
                </div>
              </div>

              {/* DUAL DROPDOWNS: BOOKING DURATION PLAN & UNITS */}
              <div className="p-4 rounded-xl bg-[#242424] border border-[#333333] space-y-4">
                <h4 className="text-xs font-black text-redPrimary uppercase tracking-wider flex items-center gap-1.5">
                  <Timer className="w-4 h-4" /> Select Booking Duration Basis
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                  {/* Dropdown 1: Duration Plan Basis */}
                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1.5 flex items-center gap-1.5">
                      <Timer className="w-3.5 h-3.5 text-redPrimary" /> 1. Duration Basis Plan *
                    </label>
                    <select
                      value={bookingPlan}
                      onChange={(e) => handlePlanChange(e.target.value)}
                      className="w-full p-3.5 rounded-xl border border-[#444444] bg-[#0F0F0F] text-xs font-extrabold text-white outline-none focus:border-redPrimary shadow-sm cursor-pointer"
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
                    <label className="text-xs font-bold text-slate-300 block mb-1.5 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-redPrimary" /> 2. Duration Units (<strong className="text-redPrimary">{durationText}</strong>) *
                    </label>
                    <select
                      value={durationValue}
                      onChange={(e) => setDurationValue(parseInt(e.target.value, 10))}
                      className="w-full p-3.5 rounded-xl border border-[#444444] bg-[#0F0F0F] text-xs font-extrabold text-white outline-none focus:border-redPrimary shadow-sm cursor-pointer"
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

              {/* Promo Code Input Box (NO e.g. SIKKIM10 LABEL) */}
              <div className="p-4 rounded-xl bg-[#242424] border border-[#333333] space-y-2">
                <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Tag className="w-4 h-4 text-redPrimary" /> Have a Promo Code / Coupon?
                </label>

                {appliedCoupon ? (
                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between">
                    <div>
                      <strong className="text-xs font-black text-emerald-400 block">✓ Code '{appliedCoupon.code}' Applied</strong>
                      <span className="text-[10px] text-slate-400">
                        {appliedCoupon.discountType === 'PERCENTAGE' ? `${appliedCoupon.discountValue}% OFF` : `Flat ₹${appliedCoupon.discountValue} OFF`}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemovePromoCode}
                      className="text-xs font-extrabold text-rose-400 hover:underline"
                    >
                      Remove Code
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={promoInput}
                      onChange={(e) => { setPromoInput(e.target.value.toUpperCase()); setPromoError(''); }}
                      placeholder="Enter Promo Code"
                      className="flex-1 p-3 rounded-xl border border-[#444444] bg-[#0F0F0F] text-xs font-bold text-white uppercase outline-none focus:border-redPrimary"
                    />
                    <button
                      type="button"
                      onClick={handleApplyPromoCode}
                      className="px-5 py-3 rounded-xl bg-redPrimary hover:bg-redDark text-white text-xs font-extrabold transition shadow-md shrink-0 cursor-pointer"
                    >
                      Apply Code
                    </button>
                  </div>
                )}

                {promoError && (
                  <p className="text-[11px] font-bold text-rose-400 mt-1">{promoError}</p>
                )}
              </div>

              {/* Date & Time */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-400 flex items-center gap-1.5 mb-2"><Calendar className="w-4 h-4 text-redPrimary" /> Service Start Date</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    required
                    className="w-full p-3 rounded-lg border border-[#333333] bg-[#0F0F0F] text-white text-sm font-bold shadow-sm outline-none focus:border-redPrimary"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 flex items-center gap-1.5 mb-2"><Clock className="w-4 h-4 text-redPrimary" /> Arrival Time</label>
                  <input
                    type="time"
                    value={slot}
                    onChange={(e) => setSlot(e.target.value)}
                    required
                    className="w-full p-3 rounded-lg border border-[#333333] bg-[#0F0F0F] text-white text-sm font-bold shadow-sm outline-none focus:border-redPrimary"
                  />
                </div>
              </div>

              {/* Structured Address Form matching Blueprint 100% */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-400 flex items-center gap-1.5"><MapPin className="w-4 h-4 text-redPrimary" /> Delivery Address Details</label>

                {savedAddressesList.length > 0 && (
                  <select value={selectedSavedAddr} onChange={handleSavedAddressChange} className="w-full p-3 rounded-lg border border-[#333333] bg-[#0F0F0F] text-white text-sm font-bold shadow-sm outline-none focus:border-redPrimary">
                    <option value="new">+ Add New Address in Sikkim</option>
                    {savedAddressesList.map((a) => (
                      <option key={a.id} value={a.id}>{a.title} - {a.fullAddress}</option>
                    ))}
                  </select>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-[#242424] p-4 rounded-xl border border-[#333333]">
                  {/* Address Type Tag Selector */}
                  <div className="sm:col-span-2 mb-1">
                    <label className="text-[11px] font-extrabold text-slate-400 block mb-1">Type of Address *</label>
                    <div className="flex gap-2">
                      {['Home', 'Work', 'Office', 'Other'].map((tag) => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => setNewAddrType(tag)}
                          className={`px-3.5 py-1.5 rounded-lg text-xs font-bold border transition ${
                            newAddrType === tag
                              ? 'bg-redPrimary text-white border-redPrimary shadow-md'
                              : 'bg-[#0F0F0F] text-slate-400 border-[#333333] hover:border-slate-500'
                          }`}
                        >
                          {tag === 'Home' ? '🏡 Home' : tag === 'Work' ? '🏢 Work' : tag === 'Office' ? '💼 Office' : '📍 Other'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Row 1 Left: House No. / Tower / Block */}
                  <div>
                    <label className="text-[11px] font-extrabold text-slate-400 block mb-1">House No. / Tower / Block</label>
                    <input type="text" value={houseNo} onChange={(e) => setHouseNo(e.target.value)} placeholder="e.g. Flat 4B / Block C" className="p-3.5 rounded-lg border border-[#444444] bg-[#0F0F0F] text-white text-xs font-medium focus:border-redPrimary outline-none shadow-sm w-full" />
                  </div>

                  {/* Row 1 Right: Address (Building, Street, Area) * */}
                  <div>
                    <label className="text-[11px] font-extrabold text-slate-400 block mb-1">Address (Building, Street, Area) *</label>
                    <input type="text" value={streetAddress} onChange={(e) => setStreetAddress(e.target.value)} placeholder="e.g. Upper Syari, Deorali-Bazar *" required className="p-3.5 rounded-lg border border-[#444444] bg-[#0F0F0F] text-white text-xs font-medium focus:border-redPrimary outline-none shadow-sm w-full" />
                  </div>

                  {/* Row 2 Left: Locality / Town */}
                  <div>
                    <label className="text-[11px] font-extrabold text-slate-400 block mb-1">Locality / Town</label>
                    <input type="text" value={locality} onChange={(e) => setLocality(e.target.value)} placeholder="e.g. Near ICDS Center" className="p-3.5 rounded-lg border border-[#444444] bg-[#0F0F0F] text-white text-xs font-medium focus:border-redPrimary outline-none shadow-sm w-full" />
                  </div>

                  {/* Row 2 Right: City / District */}
                  <div>
                    <label className="text-[11px] font-extrabold text-slate-400 block mb-1">City / District</label>
                    <input type="text" value={city} onChange={(e) => setCity(e.target.value)} placeholder="Gangtok" className="p-3.5 rounded-lg border border-[#444444] bg-[#0F0F0F] text-white text-xs font-medium focus:border-redPrimary outline-none shadow-sm w-full" />
                  </div>

                  {/* Row 3 Left: State (Default Fixed) */}
                  <div>
                    <label className="text-[11px] font-extrabold text-slate-400 block mb-1">State (Default Fixed)</label>
                    <input type="text" value={state} disabled className="p-3.5 rounded-lg border border-[#333333] bg-[#111111] text-slate-400 text-xs font-bold cursor-not-allowed w-full" />
                  </div>

                  {/* Row 3 Right: Pincode (Default: 737101) */}
                  <div>
                    <label className="text-[11px] font-extrabold text-slate-400 block mb-1">Pincode (Default: 737101)</label>
                    <input type="text" value={pincode} onChange={(e) => setPincode(e.target.value)} placeholder="737101" className="p-3.5 rounded-lg border border-[#444444] bg-[#0F0F0F] text-white text-xs font-medium focus:border-redPrimary outline-none shadow-sm w-full" />
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div>
                <label className="text-xs font-bold text-slate-400 flex items-center gap-1.5 mb-1.5"><CreditCard className="w-4 h-4 text-redPrimary" /> Select Payment Method</label>
                <select value={payment} onChange={(e) => setPayment(e.target.value)} className="w-full p-3 rounded-lg border border-[#333333] bg-[#0F0F0F] text-white text-sm font-extrabold shadow-sm outline-none focus:border-redPrimary">
                  <option value="CASH_ON_DELIVERY">💵 Cash on Service (COD) - Pay upon completion</option>
                  <option value="ONLINE_UPI">📱 Online UPI / QR Code - Google Pay, PhonePe</option>
                  <option value="RAZORPAY">💳 Razorpay Gateway - Credit / Debit Cards</option>
                </select>
              </div>

              <button type="submit" disabled={isSubmitting} className="btn-primary w-full py-4 text-base shadow-lg rounded-xl bg-redPrimary text-white font-black">
                <CheckCircle className="w-5 h-5 mr-2 inline" /> {isSubmitting ? 'Processing Order...' : `Confirm & Place Order (${durationText} • ₹${finalTotalPrice})`}
              </button>
            </form>
          </>
        )}
      </div>

      <PopupModal
        isOpen={popupState.isOpen}
        onClose={() => setPopupState({ ...popupState, isOpen: false })}
        title={popupState.title}
        message={popupState.message}
        type={popupState.type}
        actionText="View My Orders & Track"
        onAction={popupState.onAction}
      />
    </div>
  );
}
