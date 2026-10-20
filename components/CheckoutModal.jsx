import React, { useState } from 'react';
import { X, CheckCircle } from 'lucide-react';
import { ref, set } from 'firebase/database';
import { rtdb } from '../lib/firebase';

export default function CheckoutModal({ isOpen, onClose, service, currentUser }) {
  const [date, setDate] = useState('Today, 19 Oct');
  const [slot, setSlot] = useState('09:00 AM - 11:00 AM');
  const [address, setAddress] = useState('Home, Singtam');
  const [payment, setPayment] = useState('CASH_ON_DELIVERY');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !service) return null;

  const handleCheckoutSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const bookingRef = 'HM-' + new Date().toISOString().slice(0, 10).replace(/-/g, '') + '-' + Math.floor(100 + Math.random() * 900);
    const bookingId = 'bk_' + Math.random().toString(36).substring(2, 10);

    const bookingData = {
      id: bookingId,
      bookingRef: bookingRef,
      serviceTitle: service.title,
      totalAmount: service.discountedPrice,
      scheduledDate: date,
      scheduledTimeSlot: slot,
      address: address,
      paymentMethod: payment,
      status: 'PENDING',
      customerPhone: currentUser?.phoneNumber || '+916296351107',
      userName: currentUser?.fullName || 'Passang Bhutia',
      trackingStatus: 'Order Placed by Customer'
    };

    set(ref(rtdb, 'bookings/' + bookingId), bookingData)
      .then(() => {
        setIsSubmitting(false);
        alert(`Order Placed Successfully!\nRef ID: ${bookingRef}`);
        onClose();
      })
      .catch((err) => {
        setIsSubmitting(false);
        alert('Order submission failed: ' + err.message);
      });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-darkSurface border border-slate-200 dark:border-neutral-800 rounded-2xl p-6 w-full max-w-lg shadow-2xl relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-200">
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-xl font-bold mb-1">Checkout Service</h3>
        <p className="text-xs text-redPrimary font-bold mb-4">{service.title} • ₹{service.discountedPrice}</p>

        <form onSubmit={handleCheckoutSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">Select Service Date</label>
            <select
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full p-3 rounded-lg border border-slate-200 dark:border-neutral-700 bg-slate-100 dark:bg-neutral-800 text-sm"
            >
              <option>Today, 19 Oct</option>
              <option>Tomorrow, 20 Oct</option>
              <option>21 Oct 2026 (Wed)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">Select Time Slot</label>
            <select
              value={slot}
              onChange={(e) => setSlot(e.target.value)}
              className="w-full p-3 rounded-lg border border-slate-200 dark:border-neutral-700 bg-slate-100 dark:bg-neutral-800 text-sm"
            >
              <option>09:00 AM - 11:00 AM</option>
              <option>11:00 AM - 01:00 PM</option>
              <option>02:00 PM - 04:00 PM</option>
              <option>04:00 PM - 06:00 PM</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">Choose Address from Saved Addresses</label>
            <select
              onChange={(e) => setAddress(e.target.value)}
              className="w-full p-3 rounded-lg border border-slate-200 dark:border-neutral-700 bg-slate-100 dark:bg-neutral-800 text-sm"
            >
              <option value="Home, Singtam">Home - Singtam (+916296351107)</option>
              <option value="Deorali Office, Gangtok">Deorali Office - Gangtok (+917430887960)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">Full Service Address in Gangtok</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full p-3 rounded-lg border border-slate-200 dark:border-neutral-700 bg-slate-100 dark:bg-neutral-800 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">Select Payment Method</label>
            <select
              value={payment}
              onChange={(e) => setPayment(e.target.value)}
              className="w-full p-3 rounded-lg border border-slate-200 dark:border-neutral-700 bg-slate-100 dark:bg-neutral-800 text-sm"
            >
              <option value="CASH_ON_DELIVERY">Cash on Service (COD)</option>
              <option value="ONLINE_UPI">Online UPI / QR Code</option>
              <option value="RAZORPAY">Razorpay / Credit Card</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-redPrimary hover:bg-redDark text-white py-3 rounded-lg font-bold text-sm transition"
          >
            {isSubmitting ? 'Placing Order...' : 'Confirm & Place Order'}
          </button>
        </form>
      </div>
    </div>
  );
}
