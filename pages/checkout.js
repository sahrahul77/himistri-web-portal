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
  const [date, setDate] = useState('');
  const [slot, setSlot] = useState('');

  const [savedAddressesList, setSavedAddressesList] = useState([]);

  useEffect(() => {
    // Set default date to tomorrow
    const tmrw = new Date();
    tmrw.setDate(tmrw.getDate() + 1);
    setDate(tmrw.toISOString().split('T')[0]);

    if (currentUser) {
      // Fetch user's saved addresses
      const userRef = ref(rtdb, `users/${currentUser.id}`);
      onValue(userRef, (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.val();
          if (data.addresses) {
            const addrs = Object.values(data.addresses);
            setSavedAddressesList(addrs);
          }
        }
      });
    }
  }, [currentUser]);

  const basePrice = 900;
  const totalPrice = basePrice * quantity;

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

  const handleSavedAddressChange = (e) => {
    const val = e.target.value;
    setSelectedSavedAddr(val);

    if (val === 'new') {
      setHouseNo('');
      setStreetAddress('');
      setLandmark('');
    } else {
      // It's an address string from DB
      const parts = val.split(', Pincode: ');
      const addrMain = parts[0] || val;
      setStreetAddress(addrMain);
      setHouseNo('');
      setLandmark('');
      if (parts[1]) setPincode(parts[1]);
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
      scheduledDate: date,
      scheduledTimeSlot: slot,
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

              {/* Dynamic Date Selection Pickers */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 flex items-center gap-1.5 mb-2">
                    <Calendar className="w-4 h-4 text-redPrimary" /> Select Service Date
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full p-3 rounded-lg border border-slate-200 dark:border-neutral-700 bg-slate-100 dark:bg-neutral-800 text-sm font-semibold shadow-sm outline-none focus:border-redPrimary"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 flex items-center gap-1.5 mb-2">
                    <Clock className="w-4 h-4 text-redPrimary" /> Select Arrival Time
                  </label>
                  <input
                    type="time"
                    value={slot}
                    onChange={(e) => setSlot(e.target.value)}
                    className="w-full p-3 rounded-lg border border-slate-200 dark:border-neutral-700 bg-slate-100 dark:bg-neutral-800 text-sm font-semibold shadow-sm outline-none focus:border-redPrimary"
                  />
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
                    className="w-full p-3.5 rounded-xl border border-slate-200 dark:border-neutral-700 bg-slate-50 dark:bg-neutral-800 text-sm font-bold shadow-sm"
                  >
                    <option value="new">+ Add New Address in Gangtok</option>
                    {savedAddressesList.map((a, i) => (
                      <option key={i} value={a.fullAddress}>{a.title} - {a.fullAddress}</option>
                    ))}
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
