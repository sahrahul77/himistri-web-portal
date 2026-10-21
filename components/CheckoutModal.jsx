import React, { useState, useEffect } from 'react';
import { X, CheckCircle, MapPin, Calendar, Clock, CreditCard, Plus, Minus, LogIn, Lock, Map } from 'lucide-react';
import { ref, set, push, onValue } from 'firebase/database';
import { rtdb } from '../lib/firebase';
import PopupModal from './PopupModal';
import Link from 'next/link';

export default function CheckoutModal({ isOpen, onClose, service, currentUser }) {
  const [quantity, setQuantity] = useState(1);
  const [date, setDate] = useState('');
  const [slot, setSlot] = useState('');

  // Structured Address States
  const [savedAddressesList, setSavedAddressesList] = useState([]);
  const [selectedSavedAddr, setSelectedSavedAddr] = useState('new');
  const [newAddrType, setNewAddrType] = useState('Home'); // Home, Work, Office, Other
  const [houseNo, setHouseNo] = useState('');
  const [streetAddress, setStreetAddress] = useState('');
  const [locality, setLocality] = useState('');
  const [city, setCity] = useState('Gangtok');
  const [state, setState] = useState('Sikkim');
  const [pincode, setPincode] = useState('737101');

  const [payment, setPayment] = useState('CASH_ON_DELIVERY');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Dynamic Popup Modal State
  const [popupState, setPopupState] = useState({ isOpen: false, title: '', message: '', type: 'success', onAction: null });

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

  if (!isOpen || !service) return null;

  const isLoggedIn = !!currentUser;
  const totalPrice = (service.discountedPrice || 500) * quantity;

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

    // Save structured address object to Customer Profile
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

    // Create Booking in Firebase
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

      setPopupState({
        isOpen: true,
        title: 'Order Placed Successfully!',
        message: `Ref ID: ${bookingRef}\nAmount: ₹${totalPrice}\nAddress saved to Profile!`,
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

              {/* Structured Address Form */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-400 flex items-center gap-1.5"><MapPin className="w-4 h-4 text-redPrimary" /> Delivery Address Details</label>
                <select value={selectedSavedAddr} onChange={handleSavedAddressChange} className="w-full p-3 rounded-lg border border-[#333333] bg-[#0F0F0F] text-white text-sm font-bold shadow-sm outline-none focus:border-redPrimary">
                  <option value="new">+ Add New Address in Sikkim</option>
                  {savedAddressesList.map((a) => (
                    <option key={a.id} value={a.id}>{a.title} - {a.fullAddress}</option>
                  ))}
                </select>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-[#242424] p-4 rounded-xl border border-[#333333]">
                  {/* Address Type Selector */}
                  <div className="sm:col-span-2">
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

                  <div>
                    <label className="text-[11px] font-extrabold text-slate-400 block mb-1">House No. / Tower / Block</label>
                    <input type="text" value={houseNo} onChange={(e) => setHouseNo(e.target.value)} placeholder="e.g. Flat 4B" className="p-3.5 rounded-lg border border-[#444444] bg-[#0F0F0F] text-white text-xs font-medium focus:border-redPrimary outline-none shadow-sm w-full" />
                  </div>

                  <div>
                    <label className="text-[11px] font-extrabold text-slate-400 block mb-1">Address (Building, Street, Area) *</label>
                    <input type="text" value={streetAddress} onChange={(e) => setStreetAddress(e.target.value)} placeholder="e.g. Upper Syari *" required className="p-3.5 rounded-lg border border-[#444444] bg-[#0F0F0F] text-white text-xs font-medium focus:border-redPrimary outline-none shadow-sm w-full" />
                  </div>

                  <div>
                    <label className="text-[11px] font-extrabold text-slate-400 block mb-1">Locality / Town</label>
                    <input type="text" value={locality} onChange={(e) => setLocality(e.target.value)} placeholder="e.g. Near ICDS Center" className="p-3.5 rounded-lg border border-[#444444] bg-[#0F0F0F] text-white text-xs font-medium focus:border-redPrimary outline-none shadow-sm w-full" />
                  </div>

                  <div>
                    <label className="text-[11px] font-extrabold text-slate-400 block mb-1">City / District</label>
                    <input type="text" value={city} onChange={(e) => setCity(e.target.value)} placeholder="Gangtok" className="p-3.5 rounded-lg border border-[#444444] bg-[#0F0F0F] text-white text-xs font-medium focus:border-redPrimary outline-none shadow-sm w-full" />
                  </div>

                  <div>
                    <label className="text-[11px] font-extrabold text-slate-400 block mb-1">State (Fixed)</label>
                    <input type="text" value={state} disabled className="p-3.5 rounded-lg border border-[#333333] bg-[#111111] text-slate-400 text-xs font-bold cursor-not-allowed w-full" />
                  </div>

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
                <CheckCircle className="w-5 h-5 mr-2 inline" /> {isSubmitting ? 'Processing Order...' : `Confirm & Place Order (₹${totalPrice})`}
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
