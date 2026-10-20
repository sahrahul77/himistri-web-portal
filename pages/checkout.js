import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { ref, set, onValue } from 'firebase/database';
import { rtdb } from '../lib/firebase';
import { useAuth } from '../lib/AuthContext';
import { ShoppingBag, Calendar, Clock, MapPin, CreditCard, CheckCircle, Plus, Minus, Lock, LogIn, Map } from 'lucide-react';

export default function CheckoutPage() {
  const [isDark, setIsDark] = useState(true);
  const { currentUser, isAuthLoaded } = useAuth();

  const [quantity, setQuantity] = useState(1);
  const [date, setDate] = useState('');
  const [slot, setSlot] = useState('');

  // Address Form States
  const [savedAddressesList, setSavedAddressesList] = useState([]);
  const [selectedSavedAddr, setSelectedSavedAddr] = useState('new');
  const [houseNo, setHouseNo] = useState('');
  const [streetAddress, setStreetAddress] = useState('');
  const [landmark, setLandmark] = useState('');
  const [pincode, setPincode] = useState('737102');

  const [paymentMethod, setPaymentMethod] = useState('CASH_ON_DELIVERY');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // We read the service info from localStorage if passed from another page
  const [service, setService] = useState(null);

  useEffect(() => {
    // Attempt to load the selected service from localStorage
    try {
      const storedSrv = localStorage.getItem('himistri_checkout_service');
      if (storedSrv) setService(JSON.parse(storedSrv));
    } catch (e) {}

    // Default Date/Time
    const tmrw = new Date();
    tmrw.setDate(tmrw.getDate() + 1);
    setDate(tmrw.toISOString().split('T')[0]);
    setSlot('09:00'); // Default time

    if (currentUser) {
      // Fetch dynamic saved addresses
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

  const basePrice = service ? (service.discountedPrice || service.originalPrice || 500) : 0;
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
    if (!service) return alert('No service selected for checkout. Please go back to catalog.');

    if (!houseNo || !streetAddress) {
      alert('Compulsory: Please enter House No. and Street Address in Gangtok.');
      return;
    }

    if (!date || !slot) {
      alert('Compulsory: Please select a valid Service Date and Arrival Time.');
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
      serviceId: service.id,
      serviceTitle: service.title,
      serviceCategory: service.categoryName || 'General',
      quantity: quantity,
      totalAmount: totalPrice,
      scheduledDate: date,
      scheduledTimeSlot: slot, // Saved as raw time string e.g. "14:30"
      address: fullAddrString,
      paymentMethod: paymentMethod,
      status: 'PENDING',
      trackingStatus: 'Order Placed by Customer',
      createdAt: new Date().toISOString()
    };

    set(ref(rtdb, 'bookings/' + bookingId), bookingData)
      .then(() => {
        setIsSubmitting(false);
        localStorage.removeItem('himistri_checkout_service');
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

      <main className="web-container py-10 flex-1 max-w-2xl mx-auto w-full">
        {!isAuthLoaded ? (<div className="web-card text-center py-16 text-slate-500">Loading secure session...</div>) : !isLoggedIn ? (
          <div className="web-card text-center py-16 space-y-4 shadow-xl">
            <Lock className="w-16 h-16 text-redPrimary mx-auto" />
            <h2 className="text-2xl font-black">Login Required for Checkout</h2>
            <p className="text-sm text-slate-500 max-w-md mx-auto">Please sign in or register your account securely before proceeding to the order checkout process.</p>
            <Link href="/auth" className="btn-primary inline-flex mt-2 px-8 py-3.5 shadow-lg">
              <LogIn className="w-5 h-5 mr-2" /> Sign In / Register Account
            </Link>
          </div>
        ) : !service ? (
           <div className="web-card text-center py-16 space-y-4">
            <ShoppingBag className="w-16 h-16 text-slate-300 mx-auto" />
            <h2 className="text-2xl font-black text-slate-400">Cart is Empty</h2>
            <p className="text-sm text-slate-500">You haven't selected a service yet.</p>
            <Link href="/services" className="btn-primary inline-flex mt-2">Browse Catalog</Link>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 rounded-2xl bg-redPrimary/10 text-redPrimary border border-redPrimary/20 shadow-sm">
                <ShoppingBag className="w-7 h-7" />
              </div>
              <div>
                <h1 className="text-2xl font-black">Checkout & Booking</h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Schedule date/time, provide delivery address & confirm payment</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="web-card space-y-6 shadow-xl border-t-4 border-t-redPrimary">
              {/* Service Summary Card */}
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-neutral-800/50 border border-slate-200 dark:border-neutral-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-sm">
                <div className="flex gap-4 items-center">
                  {service.imageUrl && <img src={service.imageUrl} className="w-16 h-16 object-cover rounded-xl shadow-sm border border-slate-200 dark:border-neutral-700" alt={service.title} />}
                  <div>
                    <h3 className="font-black text-lg">{service.title}</h3>
                    <p className="text-xs font-bold text-redPrimary uppercase tracking-wider">{service.categoryName || 'General'} Category</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 bg-white dark:bg-darkSurface p-2 rounded-xl border border-slate-200 dark:border-neutral-700 shadow-sm">
                  <div className="flex items-center gap-2">
                    <button type="button" disabled={quantity <= 1} onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-2 text-slate-500 hover:text-redPrimary disabled:opacity-30 bg-slate-100 dark:bg-neutral-800 rounded-lg transition"><Minus className="w-4 h-4" /></button>
                    <span className="font-extrabold text-base px-2 w-8 text-center">{quantity}</span>
                    <button type="button" onClick={() => setQuantity(quantity + 1)} className="p-2 text-slate-500 hover:text-redPrimary bg-slate-100 dark:bg-neutral-800 rounded-lg transition"><Plus className="w-4 h-4" /></button>
                  </div>
                  <div className="text-right pr-2 border-l border-slate-200 dark:border-neutral-700 pl-4">
                    <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider leading-none mb-1">Total</span>
                    <span className="text-xl font-black text-redPrimary leading-none">₹{totalPrice}</span>
                  </div>
                </div>
              </div>

              {/* Native Calendar & Time Selection Pickers */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
                <div>
                  <label className="text-xs font-black text-slate-500 flex items-center gap-1.5 mb-2 uppercase tracking-wider">
                    <Calendar className="w-4 h-4 text-redPrimary" /> Select Date
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    required
                    className="w-full p-3.5 rounded-xl border border-slate-200 dark:border-neutral-700 bg-slate-50 dark:bg-neutral-900 text-sm font-bold shadow-sm outline-none focus:border-redPrimary focus:ring-2 focus:ring-redPrimary/20 transition"
                  />
                </div>
                <div>
                  <label className="text-xs font-black text-slate-500 flex items-center gap-1.5 mb-2 uppercase tracking-wider">
                    <Clock className="w-4 h-4 text-redPrimary" /> Custom Arrival Time
                  </label>
                  <input
                    type="time"
                    value={slot}
                    onChange={(e) => setSlot(e.target.value)}
                    required
                    className="w-full p-3.5 rounded-xl border border-slate-200 dark:border-neutral-700 bg-slate-50 dark:bg-neutral-900 text-sm font-bold shadow-sm outline-none focus:border-redPrimary focus:ring-2 focus:ring-redPrimary/20 transition"
                  />
                </div>
              </div>

              {/* Address Section */}
              <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-neutral-800">
                <label className="text-xs font-black text-slate-500 flex items-center gap-1.5 uppercase tracking-wider">
                  <MapPin className="w-4 h-4 text-redPrimary" /> Delivery Address (Gangtok, Sikkim)
                </label>

                <select
                  value={selectedSavedAddr}
                  onChange={handleSavedAddressChange}
                  className="w-full p-3.5 rounded-xl border border-slate-200 dark:border-neutral-700 bg-slate-50 dark:bg-neutral-900 text-sm font-bold shadow-sm outline-none focus:border-redPrimary"
                >
                  <option value="new">+ Add New Address Manually</option>
                  {savedAddressesList.map((a, i) => (
                    <option key={i} value={a.fullAddress}>{a.title} - {a.fullAddress}</option>
                  ))}
                </select>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 dark:bg-neutral-900 p-4 rounded-xl border border-slate-200 dark:border-neutral-700">
                  <input
                    type="text"
                    value={houseNo}
                    onChange={(e) => setHouseNo(e.target.value)}
                    placeholder="Flat / House No. / Building *"
                    required
                    className="p-3.5 rounded-lg border border-slate-200 dark:border-neutral-700 bg-white dark:bg-darkSurface text-sm font-medium focus:border-redPrimary outline-none shadow-sm"
                  />
                  <input
                    type="text"
                    value={streetAddress}
                    onChange={(e) => setStreetAddress(e.target.value)}
                    placeholder="Street Address / Locality *"
                    required
                    className="p-3.5 rounded-lg border border-slate-200 dark:border-neutral-700 bg-white dark:bg-darkSurface text-sm font-medium focus:border-redPrimary outline-none shadow-sm"
                  />
                  <input
                    type="text"
                    value={landmark}
                    onChange={(e) => setLandmark(e.target.value)}
                    placeholder="Landmark (Optional)"
                    className="p-3.5 rounded-lg border border-slate-200 dark:border-neutral-700 bg-white dark:bg-darkSurface text-sm font-medium focus:border-redPrimary outline-none shadow-sm"
                  />
                  <div className="relative">
                    <Map className="w-4 h-4 absolute left-3.5 top-4 text-slate-400" />
                    <input
                      type="text"
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value)}
                      placeholder="Pincode (737102)"
                      className="w-full pl-10 p-3.5 rounded-lg border border-slate-200 dark:border-neutral-700 bg-white dark:bg-darkSurface text-sm font-medium focus:border-redPrimary outline-none shadow-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="pt-4 border-t border-slate-100 dark:border-neutral-800">
                <label className="text-xs font-black text-slate-500 flex items-center gap-1.5 mb-2 uppercase tracking-wider">
                  <CreditCard className="w-4 h-4 text-redPrimary" /> Select Payment Method
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full p-4 rounded-xl border border-slate-200 dark:border-neutral-700 bg-slate-50 dark:bg-neutral-900 text-sm font-extrabold shadow-sm outline-none focus:border-redPrimary"
                >
                  <option value="CASH_ON_DELIVERY">💵 Cash on Service (COD) - Pay upon completion</option>
                  <option value="ONLINE_UPI">📱 Online UPI / QR Code - Google Pay, PhonePe</option>
                  <option value="RAZORPAY">💳 Razorpay Gateway - Credit / Debit Cards</option>
                </select>
              </div>

              {/* Submit Button */}
              <div className="pt-6">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-primary w-full py-4 text-base shadow-xl hover:shadow-redPrimary/20 transition-all"
                >
                  <CheckCircle className="w-5 h-5" />
                  {isSubmitting ? 'Processing Secure Order...' : `Confirm & Place Order (Total: ₹${totalPrice})`}
                </button>
                <p className="text-center text-[11px] text-slate-500 font-bold mt-4">
                  <ShieldCheck className="w-3.5 h-3.5 inline text-emerald-500 mr-1" />
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
