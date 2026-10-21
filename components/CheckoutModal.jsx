import React, { useState, useEffect } from 'react';
import { X, CheckCircle, MapPin, Calendar, Clock, CreditCard, Plus, Minus, LogIn, Lock, Map } from 'lucide-react';
import { ref, set, push, onValue } from 'firebase/database';
import { rtdb } from '../lib/firebase';
import Link from 'next/link';

export default function CheckoutModal({ isOpen, onClose, service, currentUser }) {
  const [quantity, setQuantity] = useState(1);
  const [date, setDate] = useState('');
  const [slot, setSlot] = useState('');

  // Address States
  const [savedAddressesList, setSavedAddressesList] = useState([]);
  const [selectedSavedAddr, setSelectedSavedAddr] = useState('new');
  const [newAddrType, setNewAddrType] = useState('Home'); // Home, Work, Other
  const [houseNo, setHouseNo] = useState('');
  const [streetAddress, setStreetAddress] = useState('');
  const [landmark, setLandmark] = useState('');
  const [pincode, setPincode] = useState('737102');

  const [payment, setPayment] = useState('CASH_ON_DELIVERY');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
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
            const addrs = Object.values(data.addresses);
            setSavedAddressesList(addrs);
            if (addrs.length > 0) {
              const firstAddr = addrs[0].fullAddress;
              setSelectedSavedAddr(firstAddr);
              const parts = firstAddr.split(', Pincode: ');
              setStreetAddress(parts[0] || firstAddr);
              if (parts[1]) setPincode(parts[1]);
            }
          }
        }
      });
    }
  }, [currentUser]);

  if (!isOpen || !service) return null;

  const isLoggedIn = !!currentUser;
  const totalPrice = (service.discountedPrice || 500) * quantity;

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

  const handleCheckoutSubmit = async (e) => {
    e.preventDefault();
    if (!houseNo || !streetAddress) {
      alert('Compulsory: Please enter House No. and Street Address.');
      return;
    }

    setIsSubmitting(true);

    const bookingRef = 'HM-' + new Date().toISOString().slice(0, 10).replace(/-/g, '') + '-' + Math.floor(100 + Math.random() * 900);
    const bookingId = 'bk_' + Math.random().toString(36).substring(2, 10);
    const fullAddrString = `${houseNo}, ${streetAddress}, ${landmark ? landmark + ', ' : ''}Gangtok, Sikkim. PIN: ${pincode}`;

    // 1. If it's a new address, save it to the Customer Profile in Firebase Realtime Database
    if (selectedSavedAddr === 'new' && currentUser) {
      try {
        const userAddrRef = push(ref(rtdb, `users/${currentUser.id}/addresses`));
        await set(userAddrRef, {
          title: newAddrType,
          fullAddress: fullAddrString,
          createdAt: new Date().toISOString()
        });
      } catch (err) {
        console.error("Could not save address to user profile:", err);
      }
    }

    // 2. Create Booking in Firebase Database
    const bookingData = {
      id: bookingId,
      bookingRef: bookingRef,
      userId: currentUser.id,
      userName: currentUser.fullName || 'Passang Bhutia',
      customerPhone: currentUser.phoneNumber || '+916296351107',
      userPhone: currentUser.phoneNumber || '+916296351107',
      serviceId: service.id,
      serviceTitle: service.title,
      serviceCategory: service.categoryName,
      quantity: quantity,
      totalAmount: totalPrice,
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
      alert(`Order Placed Successfully!\nRef ID: ${bookingRef}\nAmount: ₹${totalPrice}\nAddress saved to Profile!`);
      onClose();
      window.location.href = '/tracking';
    } catch (err) {
      setIsSubmitting(false);
      alert('Order submission failed: ' + err.message);
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
            <p className="text-xs text-slate-400 mb-6">Confirm schedule, delivery address & payment details</p>

            <form onSubmit={handleCheckoutSubmit} className="space-y-6">
              {/* Service Summary & Quantity */}
              <div className="p-4 rounded-xl bg-redPrimary/10 border border-redPrimary/20 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h3 className="font-extrabold text-base text-redPrimary">{service.title}</h3>
                  <p className="text-xs text-slate-400">{service.categoryName} Category • Gangtok</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 bg-[#0F0F0F] border border-[#333333] rounded-lg p-1">
                    <button type="button" disabled={quantity <= 1} onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-1.5 text-slate-500 hover:text-redPrimary disabled:opacity-30"><Minus className="w-4 h-4" /></button>
                    <span className="font-extrabold text-sm px-2">{quantity}</span>
                    <button type="button" onClick={() => setQuantity(quantity + 1)} className="p-1.5 text-slate-500 hover:text-redPrimary"><Plus className="w-4 h-4" /></button>
                  </div>
                  <span className="text-xl font-black text-redPrimary">₹{totalPrice}</span>
                </div>
              </div>

              {/* Date & Time */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-400 flex items-center gap-1.5 mb-2"><Calendar className="w-4 h-4 text-redPrimary" /> Custom Service Date</label>
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
                  <label className="text-xs font-bold text-slate-400 flex items-center gap-1.5 mb-2"><Clock className="w-4 h-4 text-redPrimary" /> Custom Arrival Time</label>
                  <input
                    type="time"
                    value={slot}
                    onChange={(e) => setSlot(e.target.value)}
                    required
                    className="w-full p-3 rounded-lg border border-[#333333] bg-[#0F0F0F] text-white text-sm font-bold shadow-sm outline-none focus:border-redPrimary"
                  />
                </div>
              </div>

              {/* Address Form */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-400 flex items-center gap-1.5"><MapPin className="w-4 h-4 text-redPrimary" /> Delivery Address (Gangtok, Sikkim)</label>
                <select value={selectedSavedAddr} onChange={handleSavedAddressChange} className="w-full p-3 rounded-lg border border-[#333333] bg-[#0F0F0F] text-white text-sm font-bold shadow-sm outline-none focus:border-redPrimary">
                  <option value="new">+ Add New Address in Gangtok</option>
                  {savedAddressesList.map((a, i) => (
                    <option key={i} value={a.fullAddress}>{a.title} - {a.fullAddress}</option>
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
                  <input type="text" value={houseNo} onChange={(e) => setHouseNo(e.target.value)} placeholder="Flat / House No. / Building *" required className="p-3.5 rounded-lg border border-[#444444] bg-[#0F0F0F] text-white text-sm font-medium focus:border-redPrimary outline-none shadow-sm" />
                  <input type="text" value={streetAddress} onChange={(e) => setStreetAddress(e.target.value)} placeholder="Street Address / Locality *" required className="p-3.5 rounded-lg border border-[#444444] bg-[#0F0F0F] text-white text-sm font-medium focus:border-redPrimary outline-none shadow-sm" />
                  <input type="text" value={landmark} onChange={(e) => setLandmark(e.target.value)} placeholder="Landmark (Optional)" className="p-3.5 rounded-lg border border-[#444444] bg-[#0F0F0F] text-white text-sm font-medium focus:border-redPrimary outline-none shadow-sm" />
                  <div className="relative">
                    <Map className="w-4 h-4 absolute left-3.5 top-4 text-slate-400" />
                    <input type="text" value={pincode} onChange={(e) => setPincode(e.target.value)} placeholder="Pincode (737102)" className="w-full pl-10 p-3.5 rounded-lg border border-[#444444] bg-[#0F0F0F] text-white text-sm font-medium focus:border-redPrimary outline-none shadow-sm" />
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
                <CheckCircle className="w-5 h-5 mr-2 inline" /> {isSubmitting ? 'Processing Order...' : `Confirm & Place Order (₹${totalPrice})`}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
