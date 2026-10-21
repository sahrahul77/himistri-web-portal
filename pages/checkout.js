import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { ref, set, push, onValue } from 'firebase/database';
import { rtdb } from '../lib/firebase';
import { useAuth } from '../lib/AuthContext';
import { ShoppingBag, Calendar, Clock, MapPin, CreditCard, CheckCircle, Plus, Minus, Lock, LogIn, Map, X } from 'lucide-react';

export default function CheckoutPage() {
  const router = useRouter();
  const [isDark, setIsDark] = useState(true);
  const { currentUser, isAuthLoaded } = useAuth();

  const [quantity, setQuantity] = useState(1);
  const [date, setDate] = useState('');
  const [slot, setSlot] = useState('');

  // Address Form States
  const [savedAddressesList, setSavedAddressesList] = useState([]);
  const [selectedSavedAddr, setSelectedSavedAddr] = useState('new');
  const [newAddrType, setNewAddrType] = useState('Home'); // Home, Work, Other
  const [houseNo, setHouseNo] = useState('');
  const [streetAddress, setStreetAddress] = useState('');
  const [landmark, setLandmark] = useState('');
  const [pincode, setPincode] = useState('737102');

  const [paymentMethod, setPaymentMethod] = useState('CASH_ON_DELIVERY');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [service, setService] = useState(null);

  useEffect(() => {
    try {
      const storedSrv = localStorage.getItem('himistri_checkout_service');
      if (storedSrv) setService(JSON.parse(storedSrv));
    } catch (e) {}

    // Default Custom Pickers
    const tmrw = new Date();
    tmrw.setDate(tmrw.getDate() + 1);
    setDate(tmrw.toISOString().split('T')[0]);
    setSlot('09:00'); // Default Custom Time

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

            // Auto pre-fill all 4 address fields from the customer's primary saved address!
            if (addrs.length > 0) {
              const firstAddr = addrs[0];
              setSelectedSavedAddr(firstAddr.id);
              setHouseNo(firstAddr.houseNo || '');
              setStreetAddress(firstAddr.streetAddress || firstAddr.fullAddress || '');
              setLandmark(firstAddr.landmark || '');
              if (firstAddr.pincode) setPincode(firstAddr.pincode);
            }
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
      const matchedAddr = savedAddressesList.find(a => a.id === val || a.fullAddress === val);
      if (matchedAddr) {
        setHouseNo(matchedAddr.houseNo || '');
        setStreetAddress(matchedAddr.streetAddress || matchedAddr.fullAddress || '');
        setLandmark(matchedAddr.landmark || '');
        if (matchedAddr.pincode) setPincode(matchedAddr.pincode);
      } else {
        const parts = val.split(', Pincode: ');
        setStreetAddress(parts[0] || val);
        if (parts[1]) setPincode(parts[1]);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser) return;
    if (!service) return alert('No service selected for checkout. Please go back to catalog.');

    if (!streetAddress) {
      alert('Compulsory: Please enter Street Address / Locality in Gangtok.');
      return;
    }

    if (!date || !slot) {
      alert('Compulsory: Please select a valid Custom Service Date and Arrival Time.');
      return;
    }

    setIsSubmitting(true);

    const bookingRef = 'HM-' + new Date().toISOString().slice(0, 10).replace(/-/g, '') + '-' + Math.floor(100 + Math.random() * 900);
    const bookingId = 'bk_' + Math.random().toString(36).substring(2, 10);
    const fullAddrString = `${houseNo ? houseNo + ', ' : ''}${streetAddress}, ${landmark ? landmark + ', ' : ''}Gangtok, Sikkim. PIN: ${pincode}`;

    // Save structured address object if adding a new address
    if (selectedSavedAddr === 'new' && currentUser) {
      try {
        const userAddrRef = push(ref(rtdb, `users/${currentUser.id}/addresses`));
        await set(userAddrRef, {
          title: newAddrType,
          houseNo: houseNo,
          streetAddress: streetAddress,
          landmark: landmark,
          pincode: pincode,
          fullAddress: fullAddrString,
          createdAt: new Date().toISOString()
        });
      } catch (err) {
        console.error("Could not save address to user profile:", err);
      }
    }

    // Create Booking in Firebase
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
        localStorage.removeItem('himistri_checkout_service');
        alert(`Order Placed Successfully!\nRef ID: ${bookingRef}\nAmount: ₹${totalPrice}\nAddress saved to Profile!`);
        window.location.href = '/tracking';
      })
      .catch((err) => {
        setIsSubmitting(false);
        alert('Order submission failed: ' + err.message);
      });
  };

  const isLoggedIn = !!currentUser;

  return (
    <div className="flex flex-col min-h-screen bg-[#0F0F0F] text-white">
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="bg-[#1A1A1A] border border-[#333333] rounded-2xl w-full max-w-xl shadow-2xl relative max-h-[95vh] overflow-y-auto">

          {/* Top Navbar Header */}
          <div className="sticky top-0 bg-[#1A1A1A] z-10 border-b border-[#333333] px-6 py-4 flex justify-between items-center">
            <div>
              <h3 className="text-xl font-bold">Checkout & Booking</h3>
              <p className="text-xs text-slate-400">Confirm schedule, delivery address & payment details</p>
            </div>
            <button onClick={() => router.back()} className="text-slate-400 hover:text-white p-2">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6">
            {!isAuthLoaded ? (
              <div className="text-center py-16 text-slate-500">Loading secure session...</div>
            ) : !isLoggedIn ? (
              <div className="text-center py-12 space-y-4">
                <Lock className="w-16 h-16 text-redPrimary mx-auto opacity-50" />
                <h2 className="text-2xl font-black">Login Required</h2>
                <p className="text-sm text-slate-400">Please sign in to proceed with checkout.</p>
                <Link href="/auth" className="btn-primary inline-flex mt-4 px-8 py-3.5 shadow-lg">
                  <LogIn className="w-5 h-5 mr-2" /> Sign In / Register Account
                </Link>
              </div>
            ) : !service ? (
               <div className="text-center py-12 space-y-4">
                <ShoppingBag className="w-16 h-16 text-slate-500 mx-auto opacity-30" />
                <h2 className="text-2xl font-black text-slate-400">Cart is Empty</h2>
                <p className="text-sm text-slate-500">You haven't selected a service yet.</p>
                <button onClick={() => router.back()} className="btn-primary inline-flex mt-4">Browse Catalog</button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Service Summary Card */}
                <div className="p-5 rounded-2xl bg-[#242424] border border-[#333333] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-sm">
                  <div>
                    <h3 className="font-black text-lg text-redPrimary">{service.title}</h3>
                    <p className="text-xs text-slate-500">{service.categoryName || 'General'} Category • Gangtok</p>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 bg-[#1A1A1A] border border-[#333333] rounded-lg p-1">
                      <button type="button" disabled={quantity <= 1} onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-1.5 text-slate-500 hover:text-redPrimary disabled:opacity-30 transition"><Minus className="w-4 h-4" /></button>
                      <span className="font-extrabold text-sm px-2 w-8 text-center">{quantity}</span>
                      <button type="button" onClick={() => setQuantity(quantity + 1)} className="p-1.5 text-slate-500 hover:text-redPrimary transition"><Plus className="w-4 h-4" /></button>
                    </div>
                    <span className="text-2xl font-black text-redPrimary">₹{totalPrice}</span>
                  </div>
                </div>

                {/* Custom Date & Time Pickers */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
                  <div>
                    <label className="text-xs font-black text-slate-500 flex items-center gap-1.5 mb-2 uppercase tracking-wider">
                      <Calendar className="w-4 h-4 text-redPrimary" /> Custom Service Date
                    </label>
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      required
                      className="w-full p-3.5 rounded-xl border border-[#333333] bg-[#0F0F0F] text-white text-sm font-bold shadow-sm outline-none focus:border-redPrimary focus:ring-1 focus:ring-redPrimary transition"
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
                      className="w-full p-3.5 rounded-xl border border-[#333333] bg-[#0F0F0F] text-white text-sm font-bold shadow-sm outline-none focus:border-redPrimary focus:ring-1 focus:ring-redPrimary transition"
                    />
                  </div>
                </div>

                {/* Address Section */}
                <div className="space-y-4 pt-4 border-t border-[#333333]">
                  <label className="text-xs font-black text-slate-500 flex items-center gap-1.5 uppercase tracking-wider">
                    <MapPin className="w-4 h-4 text-redPrimary" /> Delivery Address (Gangtok, Sikkim)
                  </label>

                  <select
                    value={selectedSavedAddr}
                    onChange={handleSavedAddressChange}
                    className="w-full p-3.5 rounded-xl border border-[#333333] bg-[#0F0F0F] text-white text-sm font-bold shadow-sm outline-none focus:border-redPrimary"
                  >
                    <option value="new">+ Add New Address in Gangtok</option>
                    {savedAddressesList.map((a) => (
                      <option key={a.id} value={a.id}>{a.title} - {a.fullAddress}</option>
                    ))}
                  </select>

                  {/* Address Tag Selector for New Address */}
                  {selectedSavedAddr === 'new' && (
                    <div className="flex items-center gap-3 pt-1">
                      <span className="text-xs font-extrabold text-slate-400">Save Address As:</span>
                      {['Home', 'Work', 'Other'].map((tag) => (
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
                          {tag === 'Home' ? '🏡 Home' : tag === 'Work' ? '🏢 Work' : '📍 Other'}
                        </button>
                      ))}
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-[#242424] p-4 rounded-xl border border-[#333333]">
                    <input
                      type="text"
                      value={houseNo}
                      onChange={(e) => setHouseNo(e.target.value)}
                      placeholder="Flat / House No. / Building"
                      className="p-3.5 rounded-lg border border-[#444444] bg-[#0F0F0F] text-white text-sm font-medium focus:border-redPrimary outline-none shadow-sm"
                    />
                    <input
                      type="text"
                      value={streetAddress}
                      onChange={(e) => setStreetAddress(e.target.value)}
                      placeholder="Street Address / Locality *"
                      required
                      className="p-3.5 rounded-lg border border-[#444444] bg-[#0F0F0F] text-white text-sm font-medium focus:border-redPrimary outline-none shadow-sm"
                    />
                    <input
                      type="text"
                      value={landmark}
                      onChange={(e) => setLandmark(e.target.value)}
                      placeholder="Landmark (Optional)"
                      className="p-3.5 rounded-lg border border-[#444444] bg-[#0F0F0F] text-white text-sm font-medium focus:border-redPrimary outline-none shadow-sm"
                    />
                    <div className="relative">
                      <Map className="w-4 h-4 absolute left-3.5 top-4 text-slate-400" />
                      <input
                        type="text"
                        value={pincode}
                        onChange={(e) => setPincode(e.target.value)}
                        placeholder="Pincode (737102)"
                        className="w-full pl-10 p-3.5 rounded-lg border border-[#444444] bg-[#0F0F0F] text-white text-sm font-medium focus:border-redPrimary outline-none shadow-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* Payment Method */}
                <div className="pt-4 border-t border-[#333333]">
                  <label className="text-xs font-black text-slate-500 flex items-center gap-1.5 mb-2 uppercase tracking-wider">
                    <CreditCard className="w-4 h-4 text-redPrimary" /> Select Payment Method
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full p-4 rounded-xl border border-[#333333] bg-[#0F0F0F] text-white text-sm font-extrabold shadow-sm outline-none focus:border-redPrimary"
                  >
                    <option value="CASH_ON_DELIVERY">💵 Cash on Service (COD) - Pay upon completion</option>
                    <option value="ONLINE_UPI">📱 Online UPI / QR Code - Google Pay, PhonePe</option>
                    <option value="RAZORPAY">💳 Razorpay Gateway - Credit / Debit Cards</option>
                  </select>
                </div>

                {/* Submit Button */}
                <div className="pt-6 border-t border-[#333333]">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn-primary w-full py-4 text-base shadow-xl hover:shadow-redPrimary/20 transition-all rounded-xl bg-redPrimary text-white font-black"
                  >
                    <CheckCircle className="w-5 h-5 mr-2 inline" />
                    {isSubmitting ? 'Processing Secure Order...' : `Confirm & Place Order (₹${totalPrice})`}
                  </button>
                  <p className="text-center text-[10px] text-slate-500 font-bold mt-4">
                    By placing this order, you agree to our 1-Minute Free Cancellation Policy.
                  </p>
                </div>
              </form>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
