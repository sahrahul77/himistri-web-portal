import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { ref, set } from 'firebase/database';
import { rtdb } from '../lib/firebase';
import { useAuth } from '../lib/AuthContext';
import { ShoppingBag, Calendar, Clock, MapPin, CreditCard, CheckCircle, Plus, Minus, Lock, LogIn, Map } from 'lucide-react';

export default function CheckoutPage() {
  const [isDark, setIsDark] = useState(true);
  const { currentUser, isAuthLoaded } = useAuth();

  const [quantity, setQuantity] = useState(1);
  const [selectedDate, setSelectedDate] = useState('Today');
  const [selectedSlot, setSelectedSlot] = useState('09:00 AM - 11:00 AM');

  // Address Form States
  const [selectedSavedAddr, setSelectedSavedAddr] = useState('new');
  const [houseNo, setHouseNo] = useState('');
  const [streetAddress, setStreetAddress] = useState('');
  const [landmark, setLandmark] = useState('');
  const [pincode, setPincode] = useState('737102');

  const [paymentMethod, setPaymentMethod] = useState('CASH_ON_DELIVERY');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Parse Dates
  const today = new Date();
  const tmrw = new Date(today);
  tmrw.setDate(tmrw.getDate() + 1);
  const dayAfter = new Date(today);
  dayAfter.setDate(dayAfter.getDate() + 2);

  const dateOptions = [
    `Today, ${today.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}`,
    `Tomorrow, ${tmrw.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}`,
    `${dayAfter.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', weekday: 'short' })}`
  ];

  useEffect(() => {
    setSelectedDate(dateOptions[0]);
  }, []);

  const basePrice = 900;
  const totalPrice = basePrice * quantity;

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.setAttribute('data-theme', !isDark ? 'dark' : 'light');
  };

  const handleSavedAddressChange = (e) => {
    const val = e.target.value;
    setSelectedSavedAddr(val);
    if (val === 'home') {
      setHouseNo('Flat 4B / House No. 12');
      setStreetAddress('Upper Syari, Deorali-Bazar, Gangtok');
      setLandmark('Near ICDS Center');
    } else if (val === 'work') {
      setHouseNo('Office Suite 102');
      setStreetAddress('Deorali Main Road, Gangtok');
      setLandmark('Near Deorali Taxi Stand');
    } else {
      setHouseNo('');
      setStreetAddress('');
      setLandmark('');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!currentUser) return;

    if (!houseNo || !streetAddress) {
      alert('Compulsory: Please enter House No. and Street Address in Gangtok.');
      return;
    }

    setIsSubmitting(true);

    const bookingRef = 'HM-' + new Date().toISOString().slice(0, 10).replace(/-/g, '') + '-' + Math.floor(100 + Math.random() * 900);
    const bookingId = 'bk_' + Math.random().toString(36).substring(2, 10);
    const fullAddrString = `${houseNo}, ${streetAddress}, ${landmark ? landmark + ', ' : ''}Gangtok, Sikkim. PIN: ${pincode}`;

    const bookingData = {
      id: bookingId,
      bookingRef: bookingRef,
      userId: currentUser.id,
      userName: currentUser.fullName,
      userPhone: currentUser.phoneNumber,
      customerPhone: currentUser.phoneNumber,
      serviceId: 'srv_plumber',
      serviceTitle: 'Plumber',
      serviceCategory: 'Household Manpower',
      quantity: quantity,
      totalAmount: totalPrice,
      scheduledDate: selectedDate,
      scheduledTimeSlot: selectedSlot,
      address: fullAddrString,
      paymentMethod: paymentMethod,
      status: 'PENDING',
      trackingStatus: 'Order Placed by Customer',
      createdAt: new Date().toISOString()
    };

    set(ref(rtdb, 'bookings/' + bookingId), bookingData)
      .then(() => {
        setIsSubmitting(false);
        alert(`Order Placed Successfully!\nRef ID: ${bookingRef}\nAmount: ₹${totalPrice}`);
        window.location.href = '/tracking';
      })
      .catch((err) => {
        setIsSubmitting(false);
        alert('Order submission failed: ' + err.message);
      });
  };

  const isLoggedIn = !!currentUser;

  return (
    <div className="flex flex-col min-h-screen">
      <Header isDark={isDark} onToggleTheme={toggleTheme} />

      <main className="web-container py-10 flex-1 max-w-2xl mx-auto w-full">
        {!isAuthLoaded ? (<div className="web-card text-center py-16 text-slate-500">Loading session...</div>) : !isLoggedIn ? (
          <div className="web-card text-center py-16 space-y-4">
            <Lock className="w-16 h-16 text-redPrimary mx-auto" />
            <h2 className="text-2xl font-black">Login Required for Checkout</h2>
            <p className="text-xs text-slate-500">Please sign in or register your account before proceeding to order checkout.</p>
            <Link href="/auth" className="btn-primary inline-flex">
              <LogIn className="w-4 h-4" /> Sign In / Register Account
            </Link>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 rounded-xl bg-redPrimary/10 text-redPrimary">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-black">Checkout & Booking</h1>
                <p className="text-xs text-slate-500 dark:text-slate-400">Schedule timing, provide Gangtok address & confirm payment</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="web-card space-y-6">
              {/* Service Summary Card with Quantity Counter */}
              <div className="p-5 rounded-2xl bg-redPrimary/10 border border-redPrimary/20 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h3 className="font-black text-lg text-redPrimary">Plumber Doorstep Service</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Household Manpower Category • Gangtok</p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 bg-white dark:bg-darkSurface border border-slate-200 dark:border-neutral-700 rounded-lg p-1 shadow-sm">
                    <button type="button" disabled={quantity <= 1} onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-1.5 text-slate-500 hover:text-redPrimary disabled:opacity-30"><Minus className="w-4 h-4" /></button>
                    <span className="font-extrabold text-sm px-2 text-slate-900 dark:text-white">{quantity}</span>
                    <button type="button" onClick={() => setQuantity(quantity + 1)} className="p-1.5 text-slate-500 hover:text-redPrimary"><Plus className="w-4 h-4" /></button>
                  </div>
                  <span className="text-2xl font-black text-redPrimary">₹{totalPrice}</span>
                </div>
              </div>

              {/* Dynamic Date Selection Chips */}
              <div>
                <label className="text-xs font-bold text-slate-500 flex items-center gap-1.5 mb-2">
                  <Calendar className="w-4 h-4 text-redPrimary" /> Select Service Date
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {dateOptions.map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setSelectedDate(d)}
                      className={`py-3 px-2 rounded-xl text-xs font-bold border text-center transition ${
                        selectedDate === d ? 'bg-redPrimary/15 border-redPrimary text-redPrimary shadow-sm' : 'bg-slate-50 dark:bg-neutral-800 border-slate-200 dark:border-neutral-700 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              {/* Time Slot Selection */}
              <div>
                <label className="text-xs font-bold text-slate-500 flex items-center gap-1.5 mb-2">
                  <Clock className="w-4 h-4 text-redPrimary" /> Select Arrival Time Slot
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {['09:00 AM - 11:00 AM', '11:00 AM - 01:00 PM', '02:00 PM - 04:00 PM', '04:00 PM - 06:00 PM'].map((slotStr) => (
                    <label
                      key={slotStr}
                      onClick={() => setSelectedSlot(slotStr)}
                      className={`flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer text-sm font-semibold transition ${
                        selectedSlot === slotStr ? 'bg-redPrimary/15 border-redPrimary text-redPrimary' : 'bg-slate-50 dark:bg-neutral-800 border-slate-200 dark:border-neutral-700 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <input type="radio" name="slotRadio" checked={selectedSlot === slotStr} readOnly className="accent-redPrimary w-4 h-4" />
                      <span>{slotStr}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Address Section */}
              <div className="space-y-3 pt-2">
                <label className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-redPrimary" /> Delivery Address (Gangtok, Sikkim)
                </label>

                <div className="flex flex-col sm:flex-row gap-3">
                  <select
                    value={selectedSavedAddr}
                    onChange={handleSavedAddressChange}
                    className="w-full sm:w-1/2 p-3.5 rounded-xl border border-slate-200 dark:border-neutral-700 bg-slate-50 dark:bg-neutral-800 text-sm font-bold shadow-sm"
                  >
                    <option value="new">+ Add New Address in Gangtok</option>
                    <option value="home">🏡 Home - Upper Syari ({currentUser.phoneNumber})</option>
                    <option value="work">🏢 Work - Deorali Office ({currentUser.phoneNumber})</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <input
                    type="text"
                    value={houseNo}
                    onChange={(e) => setHouseNo(e.target.value)}
                    placeholder="Flat / House No. / Building *"
                    className="p-3.5 rounded-xl border border-slate-200 dark:border-neutral-700 bg-slate-50 dark:bg-neutral-800 text-sm font-medium focus:border-redPrimary outline-none shadow-sm"
                  />
                  <input
                    type="text"
                    value={streetAddress}
                    onChange={(e) => setStreetAddress(e.target.value)}
                    placeholder="Street Address / Locality in Gangtok *"
                    className="p-3.5 rounded-xl border border-slate-200 dark:border-neutral-700 bg-slate-50 dark:bg-neutral-800 text-sm font-medium focus:border-redPrimary outline-none shadow-sm"
                  />
                  <input
                    type="text"
                    value={landmark}
                    onChange={(e) => setLandmark(e.target.value)}
                    placeholder="Landmark (Optional)"
                    className="p-3.5 rounded-xl border border-slate-200 dark:border-neutral-700 bg-slate-50 dark:bg-neutral-800 text-sm font-medium focus:border-redPrimary outline-none shadow-sm"
                  />
                  <div className="relative">
                    <Map className="w-4 h-4 absolute left-3.5 top-4 text-slate-400" />
                    <input
                      type="text"
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value)}
                      placeholder="Pincode (e.g. 737102)"
                      className="w-full pl-10 p-3.5 rounded-xl border border-slate-200 dark:border-neutral-700 bg-slate-50 dark:bg-neutral-800 text-sm font-medium focus:border-redPrimary outline-none shadow-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="pt-2">
                <label className="text-xs font-bold text-slate-500 flex items-center gap-1.5 mb-2">
                  <CreditCard className="w-4 h-4 text-redPrimary" /> Select Payment Method
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full p-3.5 rounded-xl border border-slate-200 dark:border-neutral-700 bg-slate-50 dark:bg-neutral-800 text-sm font-bold shadow-sm"
                >
                  <option value="CASH_ON_DELIVERY">Cash on Service (COD) - Pay upon completion</option>
                  <option value="ONLINE_UPI">Online UPI / QR Code - Google Pay, PhonePe, Paytm</option>
                  <option value="RAZORPAY">Razorpay Gateway - Credit / Debit Cards / Netbanking</option>
                </select>
              </div>

              {/* Submit Button */}
              <div className="pt-4 border-t border-slate-100 dark:border-neutral-800">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-primary w-full py-4 text-base shadow-xl"
                >
                  <CheckCircle className="w-5 h-5" />
                  {isSubmitting ? 'Processing Order securely...' : `Confirm & Place Order (₹${totalPrice})`}
                </button>
                <p className="text-center text-[10px] text-slate-400 font-semibold mt-3">
                  By placing this order, you agree to our 1-Minute Free Cancellation Policy.
                </p>
              </div>
            </form>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
