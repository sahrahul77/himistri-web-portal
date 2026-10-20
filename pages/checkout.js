import React, { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { ref, set } from 'firebase/database';
import { rtdb } from '../lib/firebase';
import { ShoppingBag, Calendar, Clock, MapPin, CreditCard, CheckCircle } from 'lucide-react';

export default function CheckoutPage() {
  const [isDark, setIsDark] = useState(true);
  const [date, setDate] = useState('Today, 19 Oct');
  const [slot, setSlot] = useState('09:00 AM - 11:00 AM');
  const [address, setAddress] = useState('Home, Singtam');
  const [payment, setPayment] = useState('CASH_ON_DELIVERY');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.setAttribute('data-theme', !isDark ? 'dark' : 'light');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const bookingRef = 'HM-' + new Date().toISOString().slice(0, 10).replace(/-/g, '') + '-' + Math.floor(100 + Math.random() * 900);
    const bookingId = 'bk_' + Math.random().toString(36).substring(2, 10);

    const bookingData = {
      id: bookingId,
      bookingRef: bookingRef,
      serviceTitle: 'Plumber',
      totalAmount: 900,
      scheduledDate: date,
      scheduledTimeSlot: slot,
      address: address,
      paymentMethod: payment,
      status: 'PENDING',
      customerPhone: '+916296351107',
      userName: 'Nisha Kumari',
      trackingStatus: 'Order Placed by Customer'
    };

    set(ref(rtdb, 'bookings/' + bookingId), bookingData)
      .then(() => {
        setIsSubmitting(false);
        alert(`Order Placed Successfully!\nRef ID: ${bookingRef}`);
        window.location.href = '/tracking';
      })
      .catch((err) => {
        setIsSubmitting(false);
        alert('Order submission failed: ' + err.message);
      });
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header isDark={isDark} onToggleTheme={toggleTheme} />

      <main className="web-container py-10 flex-1 max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 rounded-xl bg-redPrimary/10 text-redPrimary">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black">Checkout & Booking</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">Confirm service schedule, Gangtok delivery address & payment</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="web-card space-y-5">
          <div className="p-4 rounded-xl bg-redPrimary/10 border border-redPrimary/20 flex justify-between items-center">
            <div>
              <h3 className="font-extrabold text-base text-redPrimary">Plumber Doorstep Service</h3>
              <p className="text-xs text-slate-500">Household Manpower • Quantity: 1</p>
            </div>
            <span className="text-xl font-black text-redPrimary">₹900</span>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-500 flex items-center gap-1.5 mb-1.5">
              <Calendar className="w-4 h-4 text-redPrimary" /> Select Service Date
            </label>
            <select
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full p-3 rounded-lg border border-slate-200 dark:border-neutral-700 bg-slate-100 dark:bg-neutral-800 text-sm font-semibold"
            >
              <option>Today, 19 Oct</option>
              <option>Tomorrow, 20 Oct</option>
              <option>21 Oct 2026 (Wed)</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-500 flex items-center gap-1.5 mb-1.5">
              <Clock className="w-4 h-4 text-redPrimary" /> Select Time Slot
            </label>
            <select
              value={slot}
              onChange={(e) => setSlot(e.target.value)}
              className="w-full p-3 rounded-lg border border-slate-200 dark:border-neutral-700 bg-slate-100 dark:bg-neutral-800 text-sm font-semibold"
            >
              <option>09:00 AM - 11:00 AM</option>
              <option>11:00 AM - 01:00 PM</option>
              <option>02:00 PM - 04:00 PM</option>
              <option>04:00 PM - 06:00 PM</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-500 flex items-center gap-1.5 mb-1.5">
              <MapPin className="w-4 h-4 text-redPrimary" /> Choose Address from Saved Addresses
            </label>
            <select
              onChange={(e) => setAddress(e.target.value)}
              className="w-full p-3 rounded-lg border border-slate-200 dark:border-neutral-700 bg-slate-100 dark:bg-neutral-800 text-sm font-semibold mb-2"
            >
              <option value="Home, Singtam">Home - Singtam (+916296351107)</option>
              <option value="Deorali Office, Gangtok">Deorali Office - Gangtok (+917430887960)</option>
            </select>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Full Service Address in Gangtok"
              className="w-full p-3 rounded-lg border border-slate-200 dark:border-neutral-700 bg-slate-100 dark:bg-neutral-800 text-sm"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-500 flex items-center gap-1.5 mb-1.5">
              <CreditCard className="w-4 h-4 text-redPrimary" /> Select Payment Method
            </label>
            <select
              value={payment}
              onChange={(e) => setPayment(e.target.value)}
              className="w-full p-3 rounded-lg border border-slate-200 dark:border-neutral-700 bg-slate-100 dark:bg-neutral-800 text-sm font-semibold"
            >
              <option value="CASH_ON_DELIVERY">Cash on Service (COD)</option>
              <option value="ONLINE_UPI">Online UPI / QR Code</option>
              <option value="RAZORPAY">Razorpay / Credit Card</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary w-full py-3.5 text-base"
          >
            <CheckCircle className="w-5 h-5" />
            {isSubmitting ? 'Placing Order...' : 'Confirm & Place Order'}
          </button>
        </form>
      </main>

      <Footer />
    </div>
  );
}
