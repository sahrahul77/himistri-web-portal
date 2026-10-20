import React, { useState } from 'react';
import { X, CheckCircle, MapPin, Calendar, Clock, CreditCard, Plus, Minus, LogIn, Lock } from 'lucide-react';
import { ref, set } from 'firebase/database';
import { rtdb } from '../lib/firebase';
import Link from 'next/link';

export default function CheckoutModal({ isOpen, onClose, service, currentUser }) {
  const [quantity, setQuantity] = useState(1);
  const [date, setDate] = useState('Today, 19 Oct');
  const [slot, setSlot] = useState('09:00 AM - 11:00 AM');

  // Address States
  const [selectedSavedAddr, setSelectedSavedAddr] = useState('Home, Singtam');
  const [houseNo, setHouseNo] = useState('Flat 4B / House No. 12');
  const [streetAddress, setStreetAddress] = useState('Upper Syari, Deorali-Bazar, Gangtok');
  const [landmark, setLandmark] = useState('Near ICDS Center');
  const [pincode, setPincode] = useState('737102');

  const [payment, setPayment] = useState('CASH_ON_DELIVERY');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !service) return null;

  const isLoggedIn = !!currentUser;
  const totalPrice = (service.discountedPrice || 500) * quantity;

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
      alert(`Order Placed Successfully!\nRef ID: ${bookingRef}\nAmount: ₹${totalPrice}`);
      window.location.href = '/tracking';
    } catch (err) {
      setIsSubmitting(false);
      alert('Order submission failed: ' + err.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white dark:bg-darkSurface border border-slate-200 dark:border-neutral-800 rounded-2xl p-6 w-full max-w-2xl shadow-2xl relative max-h-[95vh] overflow-y-auto">
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
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">Confirm schedule, delivery address & payment details</p>

            <form onSubmit={handleCheckoutSubmit} className="space-y-6">
              {/* Service Summary & Quantity */}
              <div className="p-4 rounded-xl bg-redPrimary/10 border border-redPrimary/20 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h3 className="font-extrabold text-base text-redPrimary">{service.title}</h3>
                  <p className="text-xs text-slate-500">{service.categoryName} Category • Gangtok</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 bg-white dark:bg-darkSurface border border-slate-200 dark:border-neutral-700 rounded-lg p-1">
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
                  <label className="text-xs font-bold text-slate-500 flex items-center gap-1.5 mb-2"><Calendar className="w-4 h-4 text-redPrimary" /> Service Date</label>
                  <select value={date} onChange={(e) => setDate(e.target.value)} className="w-full p-3 rounded-lg border border-slate-200 dark:border-neutral-700 bg-slate-100 dark:bg-neutral-800 text-sm font-semibold">
                    <option>Today, 19 Oct</option>
                    <option>Tomorrow, 20 Oct</option>
                    <option>21 Oct 2026 (Wed)</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 flex items-center gap-1.5 mb-2"><Clock className="w-4 h-4 text-redPrimary" /> Time Slot</label>
                  <select value={slot} onChange={(e) => setSlot(e.target.value)} className="w-full p-3 rounded-lg border border-slate-200 dark:border-neutral-700 bg-slate-100 dark:bg-neutral-800 text-sm font-semibold">
                    <option>09:00 AM - 11:00 AM</option>
                    <option>11:00 AM - 01:00 PM</option>
                    <option>02:00 PM - 04:00 PM</option>
                    <option>04:00 PM - 06:00 PM</option>
                  </select>
                </div>
              </div>

              {/* Address Form */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-500 flex items-center gap-1.5"><MapPin className="w-4 h-4 text-redPrimary" /> Delivery Address (Gangtok, Sikkim)</label>
                <select value={selectedSavedAddr} onChange={handleSavedAddressChange} className="w-full p-3 rounded-lg border border-slate-200 dark:border-neutral-700 bg-slate-100 dark:bg-neutral-800 text-sm font-bold">
                  <option value="Home, Singtam">Home - Upper Syari, Singtam ({currentUser.phoneNumber || '+916296351107'})</option>
                  <option value="Deorali Office, Gangtok">Deorali Office - Gangtok ({currentUser.phoneNumber || '+917430887960'})</option>
                </select>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <input type="text" value={houseNo} onChange={(e) => setHouseNo(e.target.value)} placeholder="Flat / House No. / Building *" className="p-3 rounded-lg border border-slate-200 dark:border-neutral-700 bg-slate-100 dark:bg-neutral-800 text-sm" />
                  <input type="text" value={streetAddress} onChange={(e) => setStreetAddress(e.target.value)} placeholder="Street Address / Locality *" className="p-3 rounded-lg border border-slate-200 dark:border-neutral-700 bg-slate-100 dark:bg-neutral-800 text-sm" />
                  <input type="text" value={landmark} onChange={(e) => setLandmark(e.target.value)} placeholder="Landmark (Optional)" className="p-3 rounded-lg border border-slate-200 dark:border-neutral-700 bg-slate-100 dark:bg-neutral-800 text-sm" />
                  <input type="text" value={pincode} onChange={(e) => setPincode(e.target.value)} placeholder="Pincode (737102)" className="p-3 rounded-lg border border-slate-200 dark:border-neutral-700 bg-slate-100 dark:bg-neutral-800 text-sm" />
                </div>
              </div>

              {/* Payment Method */}
              <div>
                <label className="text-xs font-bold text-slate-500 flex items-center gap-1.5 mb-1.5"><CreditCard className="w-4 h-4 text-redPrimary" /> Payment Method</label>
                <select value={payment} onChange={(e) => setPayment(e.target.value)} className="w-full p-3 rounded-lg border border-slate-200 dark:border-neutral-700 bg-slate-100 dark:bg-neutral-800 text-sm font-bold">
                  <option value="CASH_ON_DELIVERY">Cash on Service (COD)</option>
                  <option value="ONLINE_UPI">Online UPI / QR Code</option>
                  <option value="RAZORPAY">Razorpay / Credit Card</option>
                </select>
              </div>

              <button type="submit" disabled={isSubmitting} className="btn-primary w-full py-4 text-base shadow-lg">
                <CheckCircle className="w-5 h-5" /> {isSubmitting ? 'Placing Order...' : `Confirm & Place Order (₹${totalPrice})`}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
