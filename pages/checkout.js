import React, { useState } from 'react';
import Link from 'next/link';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { ref, set } from 'firebase/database';
import { rtdb } from '../lib/firebase';
import { ShoppingBag, Calendar, Clock, MapPin, CreditCard, CheckCircle, Plus, Minus, Lock, LogIn } from 'lucide-react';

export default function CheckoutPage() {
  const [isDark, setIsDark] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedDate, setSelectedDate] = useState('Today, 19 Oct');
  const [selectedSlot, setSelectedSlot] = useState('09:00 AM - 11:00 AM');

  // Address Form States
  const [selectedSavedAddr, setSelectedSavedAddr] = useState('Home, Singtam');
  const [houseNo, setHouseNo] = useState('Flat 4B / House No. 12');
  const [streetAddress, setStreetAddress] = useState('Upper Syari, Deorali-Bazar, Gangtok');
  const [landmark, setLandmark] = useState('Near ICDS Center');
  const [pincode, setPincode] = useState('737102');

  const [paymentMethod, setPaymentMethod] = useState('CASH_ON_DELIVERY');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // User Session State
  const [currentUser, setCurrentUser] = useState({
    id: 'sqjxAnHZgkQhYxrXXmLXFSUiH5r1',
    fullName: 'Nisha Kumari',
    phoneNumber: '+916296351107',
    role: 'CUSTOMER'
  });

  const basePrice = 900;
  const totalPrice = basePrice * quantity;

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.setAttribute('data-theme', !isDark ? 'dark' : 'light');
  };

  const handleSavedAddressChange = (e) => {
    const val = e.target.value;
    setSelectedSavedAddr(val);
    if (val === 'Home, Singtam') {
      setHouseNo('Flat 4B / House No. 12');
      setStreetAddress('Upper Syari, Deorali-Bazar, Gangtok');
      setLandmark('Near ICDS Center');
      setPincode('737102');
    } else {
      setHouseNo('Office Suite 102');
      setStreetAddress('Deorali Main Road, Gangtok');
      setLandmark('Near Deorali Taxi Stand');
      setPincode('737102');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!currentUser) {
      alert('Please Sign In before placing an order.');
      window.location.href = '/auth';
      return;
    }

    if (!houseNo || !streetAddress) {
      alert('Compulsory: Please enter House No. and Street Address.');
      return;
    }

    setIsSubmitting(true);

    const bookingRef = 'HM-' + new Date().toISOString().slice(0, 10).replace(/-/g, '') + '-' + Math.floor(100 + Math.random() * 900);
    const bookingId = 'bk_' + Math.random().toString(36).substring(2, 10);
    const fullAddrString = `${houseNo}, ${streetAddress}, ${landmark ? landmark + ', ' : ''}Gangtok, Sikkim. PIN: ${pincode}`;

    const bookingData = {
      id: bookingId,
      bookingRef: bookingRef,
      serviceTitle: 'Plumber',
      quantity: quantity,
      totalAmount: totalPrice,
      scheduledDate: selectedDate,
      scheduledTimeSlot: selectedSlot,
      address: fullAddrString,
      paymentMethod: paymentMethod,
      status: 'PENDING',
      customerPhone: currentUser?.phoneNumber || '+916296351107',
      userName: currentUser?.fullName || 'Nisha Kumari',
      trackingStatus: 'Order Placed by Customer'
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
      <Header isDark={isDark} onToggleTheme={toggleTheme} currentUser={currentUser} />

      <main className="web-container py-10 flex-1 max-w-2xl mx-auto">
        {!isLoggedIn ? (
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
                <p className="text-xs text-slate-500 dark:text-slate-400">Dynamic quantity pricing, Gangtok delivery address & payment</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="web-card space-y-6">
              {/* Service Summary Card with Quantity Counter */}
              <div className="p-5 rounded-2xl bg-redPrimary/10 border border-redPrimary/20 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h3 className="font-black text-lg text-redPrimary">Plumber Doorstep Service</h3>
                  <p className="text-xs text-slate-400">Household Manpower Category • Gangtok</p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 bg-white dark:bg-darkSurface border border-slate-200 dark:border-neutral-700 rounded-xl p-1">
                    <button
                      type="button"
                      disabled={quantity <= 1}
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="p-2 rounded-lg text-slate-500 hover:text-redPrimary disabled:opacity-30"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="font-extrabold text-sm px-2">{quantity}</span>
                    <button
                      type="button"
                      onClick={() => setQuantity(quantity + 1)}
                      className="p-2 rounded-lg text-slate-500 hover:text-redPrimary"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <span className="text-2xl font-black text-redPrimary">₹{totalPrice}</span>
                </div>
              </div>

              {/* Date Selection Chips */}
              <div>
                <label className="text-xs font-bold text-slate-500 flex items-center gap-1.5 mb-2">
                  <Calendar className="w-4 h-4 text-redPrimary" /> Select Service Date
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {['Today, 19 Oct', 'Tomorrow, 20 Oct', '21 Oct 2026 (Wed)'].map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setSelectedDate(d)}
                      className={`py-3 px-2 rounded-xl text-xs font-bold border text-center transition ${
                        selectedDate === d ? 'bg-redPrimary/15 border-redPrimary text-redPrimary' : 'bg-slate-50 dark:bg-neutral-800 border-slate-200 dark:border-neutral-700'
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
                  <Clock className="w-4 h-4 text-redPrimary" /> Select Service Time Slot
                </label>
                <div className="space-y-2">
                  {['09:00 AM - 11:00 AM', '11:00 AM - 01:00 PM', '02:00 PM - 04:00 PM', '04:00 PM - 06:00 PM'].map((slotStr) => (
                    <label
                      key={slotStr}
                      onClick={() => setSelectedSlot(slotStr)}
                      className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer text-sm font-semibold transition ${
                        selectedSlot === slotStr ? 'bg-redPrimary/15 border-redPrimary' : 'bg-slate-50 dark:bg-neutral-800 border-slate-200 dark:border-neutral-700'
                      }`}
                    >
                      <input type="radio" name="slotRadio" checked={selectedSlot === slotStr} readOnly className="accent-redPrimary" />
                      <span>{slotStr}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Service Address Form */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-redPrimary" /> Service Address (Gangtok, Sikkim)
                </label>

                <div>
                  <span className="text-[11px] font-bold text-slate-400 block mb-1">Select Saved Address:</span>
                  <select
                    value={selectedSavedAddr}
                    onChange={handleSavedAddressChange}
                    className="w-full p-3 rounded-xl border border-slate-200 dark:border-neutral-700 bg-slate-100 dark:bg-neutral-800 text-sm font-bold"
                  >
                    <option value="Home, Singtam">Home - Upper Syari, Singtam (+916296351107)</option>
                    <option value="Deorali Office, Gangtok">Deorali Office - Gangtok (+917430887960)</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <input
                    type="text"
                    value={houseNo}
                    onChange={(e) => setHouseNo(e.target.value)}
                    placeholder="Flat / House No. / Building *"
                    className="p-3 rounded-xl border border-slate-200 dark:border-neutral-700 bg-slate-100 dark:bg-neutral-800 text-sm"
                  />
                  <input
                    type="text"
                    value={streetAddress}
                    onChange={(e) => setStreetAddress(e.target.value)}
                    placeholder="Street Address / Locality *"
                    className="p-3 rounded-xl border border-slate-200 dark:border-neutral-700 bg-slate-100 dark:bg-neutral-800 text-sm"
                  />
                  <input
                    type="text"
                    value={landmark}
                    onChange={(e) => setLandmark(e.target.value)}
                    placeholder="Landmark (Optional)"
                    className="p-3 rounded-xl border border-slate-200 dark:border-neutral-700 bg-slate-100 dark:bg-neutral-800 text-sm"
                  />
                  <input
                    type="text"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    placeholder="Pincode (737102)"
                    className="p-3 rounded-xl border border-slate-200 dark:border-neutral-700 bg-slate-100 dark:bg-neutral-800 text-sm"
                  />
                </div>
              </div>

              {/* Payment Method */}
              <div>
                <label className="text-xs font-bold text-slate-500 flex items-center gap-1.5 mb-1.5">
                  <CreditCard className="w-4 h-4 text-redPrimary" /> Select Payment Method
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-neutral-700 bg-slate-100 dark:bg-neutral-800 text-sm font-bold"
                >
                  <option value="CASH_ON_DELIVERY">Cash on Service (COD)</option>
                  <option value="ONLINE_UPI">Online UPI / QR Code</option>
                  <option value="RAZORPAY">Razorpay / Credit Card</option>
                </select>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-primary w-full py-4 text-base shadow-lg"
                >
                  <CheckCircle className="w-5 h-5" />
                  {isSubmitting ? 'Placing Order...' : `Confirm & Place Order (₹${totalPrice})`}
                </button>
              </div>
            </form>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
