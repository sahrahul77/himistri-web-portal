import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import PopupModal from '../../components/PopupModal';
import { ref, onValue, update } from 'firebase/database';
import { rtdb } from '../../lib/firebase';
import { useAuth } from '../../lib/AuthContext';
import { HardHat, Phone, MapPin, CheckCircle2, Clock, ShieldCheck, DollarSign, Lock, LogIn, Navigation, Bike, Wrench } from 'lucide-react';

export default function PartnerDashboardPage() {
  const [isDark, setIsDark] = useState(true);
  const [isOnline, setIsOnline] = useState(true);
  const [bookings, setBookings] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);

  // Dynamic Popup Modal State
  const [popupState, setPopupState] = useState({ isOpen: false, title: '', message: '', type: 'success', onAction: null });

  const { currentUser, isAuthLoaded } = useAuth();

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

  useEffect(() => {
    const unsub = onValue(ref(rtdb, 'bookings'), (snapshot) => {
      const list = [];
      if (snapshot.exists()) {
        snapshot.forEach((child) => {
          list.push({ id: child.key, ...child.val() });
        });
      }
      list.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
      setBookings(list);
    });

    return () => unsub();
  }, []);

  const handleToggleOnline = (nextVal) => {
    setIsOnline(nextVal);
    if (currentUser) {
      update(ref(rtdb, `users/${currentUser.id}`), { isOnline: nextVal });
    }
  };

  const handleUpdateStatus = (jobId, newStatus, trackingText) => {
    update(ref(rtdb, `bookings/${jobId}`), {
      status: newStatus,
      trackingStatus: trackingText
    }).then(() => {
      setPopupState({
        isOpen: true,
        title: 'Status Updated',
        message: `Order status updated to: ${newStatus}`,
        type: 'success'
      });
    });
  };

  const partnerNameRef = currentUser ? currentUser.fullName : 'Piku Shah';
  const partnerSkillRef = currentUser ? (currentUser.skillCategory || 'Home Tutor') : 'Home Tutor';

  // Filter assigned jobs for this partner
  const assignedJobs = bookings.filter(b => b.assignedPartnerName === partnerNameRef || b.assignedPartnerId === currentUser?.id || (b.status === 'ASSIGNED' && (b.serviceCategory || '').toLowerCase().includes(partnerSkillRef.toLowerCase())));
  const activeJobs = assignedJobs.filter(b => b.status !== 'COMPLETED' && b.status !== 'CANCELLED');
  const completedJobs = bookings.filter(b => b.status === 'COMPLETED' && (b.assignedPartnerName === partnerNameRef || b.assignedPartnerId === currentUser?.id));
  const totalPartnerEarnings = completedJobs.reduce((sum, b) => sum + (b.totalAmount || 0), 0);

  const isPartner = currentUser && (currentUser.role === 'PARTNER' || currentUser.role === 'SERVICE_PARTNER' || currentUser.role === 'ADMIN');

  return (
    <div className="flex flex-col min-h-screen">
      <Header isDark={isDark} onToggleTheme={toggleTheme} currentUser={currentUser} />

      <main className="web-container py-10 flex-1 space-y-8">
        {!isAuthLoaded ? (<div className="web-card text-center py-16 text-slate-500">Loading secure session...</div>) : !isPartner ? (
          <div className="web-card text-center py-16 space-y-4 max-w-lg mx-auto">
            <Lock className="w-16 h-16 text-redPrimary mx-auto" />
            <h2 className="text-2xl font-black">Partner Access Restricted</h2>
            <p className="text-xs text-slate-500">Please sign in as a registered HiMistri Service Partner to view your dispatched jobs.</p>
            <Link href="/auth" className="btn-primary inline-flex mt-2">
              <LogIn className="w-4 h-4" /> Partner Login
            </Link>
          </div>
        ) : (
          <>
            {/* Top Partner Header */}
            <div className="web-card flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-r from-emerald-900/20 to-transparent border border-emerald-800/30">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-emerald-600 text-white flex items-center justify-center font-black text-xl shadow-lg shrink-0">
                  <HardHat className="w-7 h-7" />
                </div>
                <div>
                  <h1 className="text-2xl font-black">{partnerNameRef}</h1>
                  <p className="text-xs text-emerald-500 font-bold flex items-center gap-1 mt-0.5">
                    <ShieldCheck className="w-3.5 h-3.5" /> Verified HiMistri Craftsman • {partnerSkillRef}
                  </p>
                </div>
              </div>

              {/* Online/Offline Toggle */}
              <div className="flex items-center gap-3 bg-neutral-900/80 p-2.5 rounded-2xl border border-neutral-800">
                <span className="text-xs font-bold text-slate-300">
                  {isOnline ? '🟢 ONLINE FOR JOBS' : '⚫ OFFLINE'}
                </span>
                <button
                  onClick={() => handleToggleOnline(!isOnline)}
                  className={`w-12 h-6 rounded-full p-1 transition-colors ${isOnline ? 'bg-emerald-600' : 'bg-neutral-700'}`}
                >
                  <div className={`w-4 h-4 rounded-full bg-white transition-transform ${isOnline ? 'translate-x-6' : 'translate-x-0'}`} />
                </button>
              </div>
            </div>

            {/* Earnings & Dispatched Jobs KPIs */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="web-card flex items-center gap-4">
                <div className="p-3.5 rounded-2xl bg-emerald-600/15 text-emerald-600">
                  <DollarSign className="w-7 h-7" />
                </div>
                <div>
                  <span className="text-xs text-slate-500 font-bold block">Total Net Earnings</span>
                  <strong className="text-2xl font-black text-emerald-500">₹{totalPartnerEarnings * 0.80}</strong>
                  <span className="text-[10px] text-slate-500 block">80% Craftsman Share</span>
                </div>
              </div>

              <div className="web-card flex items-center gap-4">
                <div className="p-3.5 rounded-2xl bg-orangeSecondary/15 text-orangeSecondary">
                  <Wrench className="w-7 h-7" />
                </div>
                <div>
                  <span className="text-xs text-slate-500 font-bold block">Active Dispatched Jobs</span>
                  <strong className="text-2xl font-black text-orangeSecondary">{activeJobs.length}</strong>
                </div>
              </div>

              <div className="web-card flex items-center gap-4">
                <div className="p-3.5 rounded-2xl bg-blue-500/15 text-blue-500">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <div>
                  <span className="text-xs text-slate-500 font-bold block">Completed Jobs</span>
                  <strong className="text-2xl font-black text-blue-400">{completedJobs.length}</strong>
                </div>
              </div>
            </div>

            {/* Dispatched Customer Jobs List */}
            <div className="space-y-4">
              <h2 className="text-xl font-black text-white">Your Assigned Customer Jobs</h2>

              {assignedJobs.length === 0 ? (
                <div className="web-card py-16 text-center text-slate-500 space-y-2 border-dashed">
                  <Clock className="w-12 h-12 mx-auto opacity-30" />
                  <p className="font-bold text-sm">No dispatched jobs currently assigned to your account.</p>
                </div>
              ) : (
                assignedJobs.map((b) => (
                  <div key={b.id} className="web-card bg-[#1A1A1A] border border-[#333333] p-5 rounded-2xl space-y-4 shadow-xl">
                    <div className="flex justify-between items-center pb-2 border-b border-neutral-800">
                      <span className="font-extrabold text-sm text-white">Ref ID: {b.bookingRef || b.id}</span>
                      <span className={`px-3 py-1 rounded-xl text-xs font-black uppercase tracking-wider ${
                        b.status === 'COMPLETED' ? 'bg-emerald-600/20 text-emerald-500' : 'bg-orangeSecondary/20 text-orangeSecondary'
                      }`}>
                        {b.status}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <h3 className="font-bold text-lg text-white">{b.serviceTitle} <span className="text-xs text-slate-400">(Qty: {b.quantity || 1})</span></h3>
                      <p className="text-xs text-emerald-500 font-black">Customer Payable: ₹{b.totalAmount} ({b.paymentMethod === 'CASH_ON_DELIVERY' ? 'Cash on Service' : 'Paid Online'})</p>
                      <p className="text-xs text-slate-300 font-semibold flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5 text-redPrimary" /> Customer: <strong className="text-white">{b.userName || 'Customer'}</strong> ({b.customerPhone || b.userPhone || '+916296351107'})
                      </p>
                      <p className="text-xs text-slate-300 font-semibold flex items-start gap-1">
                        <MapPin className="w-3.5 h-3.5 text-redPrimary shrink-0 mt-0.5" /> Doorstep Address: {b.address}
                      </p>
                    </div>

                    {/* Live Status Controls for Partner */}
                    <div className="flex flex-wrap gap-2 pt-2 border-t border-neutral-800">
                      {b.status === 'ASSIGNED' && (
                        <button
                          onClick={() => handleUpdateStatus(b.id, 'ON_THE_WAY', `Mistri ${partnerNameRef} is on the way to your location`)}
                          className="btn-primary bg-blue-600 hover:bg-blue-700 text-xs py-2.5 px-4"
                        >
                          <Bike className="w-4 h-4 inline mr-1" /> Mark On The Way
                        </button>
                      )}

                      {b.status === 'ON_THE_WAY' && (
                        <button
                          onClick={() => handleUpdateStatus(b.id, 'IN_PROGRESS', `Mistri ${partnerNameRef} arrived at location & started work`)}
                          className="btn-primary bg-orangeSecondary hover:bg-orange-600 text-xs py-2.5 px-4"
                        >
                          <Wrench className="w-4 h-4 inline mr-1" /> Mark Arrived & Start Work
                        </button>
                      )}

                      {b.status === 'IN_PROGRESS' && (
                        <button
                          onClick={() => handleUpdateStatus(b.id, 'COMPLETED', `Service work completed successfully & payment collected!`)}
                          className="btn-primary bg-emerald-600 hover:bg-emerald-700 text-xs py-2.5 px-4"
                        >
                          <CheckCircle2 className="w-4 h-4 inline mr-1" /> Mark Work Finished & Collect ₹{b.totalAmount}
                        </button>
                      )}

                      <a
                        href={`tel:${b.customerPhone || b.userPhone || '+916296351107'}`}
                        className="py-2.5 px-4 rounded-xl border border-neutral-700 bg-neutral-900 hover:bg-neutral-800 text-xs font-bold text-white inline-flex items-center gap-1.5"
                      >
                        <Phone className="w-3.5 h-3.5 text-emerald-500" /> Call Customer
                      </a>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </main>

      <PopupModal
        isOpen={popupState.isOpen}
        onClose={() => setPopupState({ ...popupState, isOpen: false })}
        title={popupState.title}
        message={popupState.message}
        type={popupState.type}
        actionText="Continue"
        onAction={popupState.onAction}
      />

      <Footer />
    </div>
  );
}
