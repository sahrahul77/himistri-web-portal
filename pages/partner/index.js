import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import PopupModal from '../../components/PopupModal';
import { motion, AnimatePresence } from 'framer-motion';
import { ref, onValue, update } from 'firebase/database';
import { rtdb } from '../../lib/firebase';
import { useAuth } from '../../lib/AuthContext';
import { HardHat, Phone, MapPin, CheckCircle2, Clock, ShieldCheck, DollarSign, Lock, LogIn, Navigation, Bike, Wrench, ChevronLeft, ChevronRight, Check } from 'lucide-react';

export default function PartnerDashboardPage() {
  const [isDark, setIsDark] = useState(true);
  const [isOnline, setIsOnline] = useState(true);
  const [activeSubTab, setActiveSubTab] = useState(0); // 0=Active Dispatched Jobs, 1=Completed Jobs History
  const [completedSliderIdx, setCompletedSliderIdx] = useState(0);

  const [bookings, setBookings] = useState([]);

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

  const currentCompletedJob = completedJobs[completedSliderIdx] || completedJobs[0];

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-[#0F0F0F] text-slate-900 dark:text-white transition-colors duration-200">
      <Header isDark={isDark} onToggleTheme={toggleTheme} currentUser={currentUser} />

      <main className="web-container py-6 sm:py-10 flex-1 space-y-6 max-w-6xl mx-auto px-4 sm:px-6 w-full">
        {!isAuthLoaded ? (<div className="web-card text-center py-16 text-slate-500">Loading secure session...</div>) : !isPartner ? (
          <div className="web-card text-center py-16 space-y-4 max-w-lg mx-auto bg-white dark:bg-[#1A1A1A] border border-slate-200 dark:border-[#333333]">
            <Lock className="w-16 h-16 text-redPrimary mx-auto" />
            <h2 className="text-2xl font-black text-slate-900 dark:text-white">Partner Access Restricted</h2>
            <p className="text-xs text-slate-500">Please sign in as a registered HiMistri Service Partner to view your dispatched jobs.</p>
            <Link href="/auth" className="btn-primary inline-flex mt-2">
              <LogIn className="w-4 h-4" /> Partner Login
            </Link>
          </div>
        ) : (
          <>
            {/* Top Partner Header Banner */}
            <div className="web-card flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-r from-emerald-900/20 via-slate-100 dark:via-neutral-900 to-transparent border border-emerald-800/30 p-5 rounded-2xl sm:rounded-3xl shadow-xl">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-emerald-600 text-white flex items-center justify-center font-black text-xl shadow-lg shrink-0">
                  <HardHat className="w-7 h-7" />
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">{partnerNameRef}</h1>
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1 mt-0.5">
                    <ShieldCheck className="w-3.5 h-3.5" /> Verified HiMistri Craftsman • {partnerSkillRef}
                  </p>
                </div>
              </div>

              {/* Online/Offline Toggle */}
              <div className="flex items-center gap-3 bg-slate-100 dark:bg-neutral-900/80 p-2.5 rounded-2xl border border-slate-200 dark:border-neutral-800 w-full sm:w-auto justify-between sm:justify-start">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  {isOnline ? '🟢 ONLINE FOR JOBS' : '⚫ OFFLINE'}
                </span>
                <button
                  type="button"
                  onClick={() => handleToggleOnline(!isOnline)}
                  className={`w-12 h-6 rounded-full p-1 transition-colors ${isOnline ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-neutral-700'}`}
                >
                  <div className={`w-4 h-4 rounded-full bg-white transition-transform ${isOnline ? 'translate-x-6' : 'translate-x-0'}`} />
                </button>
              </div>
            </div>

            {/* Earnings & Dispatched Jobs KPIs */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              <div className="web-card flex items-center gap-4 p-4 rounded-2xl bg-white dark:bg-[#1A1A1A] border border-slate-200 dark:border-[#333333] shadow-md">
                <div className="p-3.5 rounded-2xl bg-emerald-600/15 text-emerald-600 shrink-0">
                  <DollarSign className="w-6 h-6 sm:w-7 sm:h-7" />
                </div>
                <div>
                  <span className="text-xs text-slate-500 font-bold block uppercase tracking-wider">Total Net Earnings</span>
                  <strong className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-500">₹{totalPartnerEarnings * 0.80}</strong>
                  <span className="text-[10px] text-slate-500 block">80% Craftsman Share</span>
                </div>
              </div>

              <div className="web-card flex items-center gap-4 p-4 rounded-2xl bg-white dark:bg-[#1A1A1A] border border-slate-200 dark:border-[#333333] shadow-md">
                <div className="p-3.5 rounded-2xl bg-orangeSecondary/15 text-orangeSecondary shrink-0">
                  <Wrench className="w-6 h-6 sm:w-7 sm:h-7" />
                </div>
                <div>
                  <span className="text-xs text-slate-500 font-bold block uppercase tracking-wider">Active Dispatched Jobs</span>
                  <strong className="text-xl sm:text-2xl font-black text-orangeSecondary">{activeJobs.length}</strong>
                </div>
              </div>

              <div className="web-card flex items-center gap-4 p-4 rounded-2xl bg-white dark:bg-[#1A1A1A] border border-slate-200 dark:border-[#333333] shadow-md">
                <div className="p-3.5 rounded-2xl bg-blue-500/15 text-blue-500 shrink-0">
                  <CheckCircle2 className="w-6 h-6 sm:w-7 sm:h-7" />
                </div>
                <div>
                  <span className="text-xs text-slate-500 font-bold block uppercase tracking-wider">Completed Jobs</span>
                  <strong className="text-xl sm:text-2xl font-black text-blue-500 dark:text-blue-400">{completedJobs.length}</strong>
                </div>
              </div>
            </div>

            {/* Sub-Menu Navigation Tabs */}
            <div className="flex border-b border-slate-200 dark:border-neutral-800">
              <button
                type="button"
                onClick={() => { setActiveSubTab(0); setCompletedSliderIdx(0); }}
                className={`flex-1 py-3 text-center text-xs sm:text-sm font-black border-b-2 transition ${
                  activeSubTab === 0
                    ? 'border-b-redPrimary text-redPrimary'
                    : 'border-b-transparent text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                }`}
              >
                🛠️ Active Dispatched Jobs ({activeJobs.length})
              </button>

              <button
                type="button"
                onClick={() => { setActiveSubTab(1); setCompletedSliderIdx(0); }}
                className={`flex-1 py-3 text-center text-xs sm:text-sm font-black border-b-2 transition ${
                  activeSubTab === 1
                    ? 'border-b-redPrimary text-redPrimary'
                    : 'border-b-transparent text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                }`}
              >
                ✅ Completed Jobs History ({completedJobs.length})
              </button>
            </div>

            {/* TAB 0: ACTIVE JOBS LIST */}
            {activeSubTab === 0 && (
              <div className="space-y-4">
                {activeJobs.length === 0 ? (
                  <div className="web-card py-16 text-center text-slate-500 space-y-2 border-dashed bg-white dark:bg-[#1A1A1A]">
                    <Clock className="w-12 h-12 mx-auto opacity-30" />
                    <p className="font-bold text-sm">No active dispatched jobs assigned to your account.</p>
                  </div>
                ) : (
                  activeJobs.map((b) => (
                    <div key={b.id} className="web-card bg-white dark:bg-[#1A1A1A] border border-slate-200 dark:border-[#333333] p-5 rounded-2xl space-y-4 shadow-xl">
                      <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-neutral-800">
                        <span className="font-extrabold text-sm text-slate-900 dark:text-white">Ref ID: {b.bookingRef || b.id}</span>
                        <span className="px-3 py-1 rounded-xl text-xs font-black uppercase tracking-wider bg-orangeSecondary/20 text-orangeSecondary">
                          {b.status}
                        </span>
                      </div>

                      <div className="space-y-1">
                        <h3 className="font-bold text-base sm:text-lg text-slate-900 dark:text-white">{b.serviceTitle} <span className="text-xs text-slate-400">(Qty: {b.quantity || 1})</span></h3>
                        <p className="text-xs text-emerald-600 dark:text-emerald-400 font-black">Customer Payable: ₹{b.totalAmount} ({b.paymentMethod === 'CASH_ON_DELIVERY' ? 'Cash on Service' : 'Paid Online'})</p>
                        <p className="text-xs text-slate-600 dark:text-slate-300 font-semibold flex items-center gap-1">
                          <Phone className="w-3.5 h-3.5 text-redPrimary" /> Customer: <strong className="text-slate-900 dark:text-white">{b.userName || 'Customer'}</strong> ({b.customerPhone || b.userPhone || '+916296351107'})
                        </p>
                        <p className="text-xs text-slate-600 dark:text-slate-300 font-semibold flex items-start gap-1">
                          <MapPin className="w-3.5 h-3.5 text-redPrimary shrink-0 mt-0.5" /> Doorstep Address: {b.address}
                        </p>
                      </div>

                      {/* Live Status Controls for Partner */}
                      <div className="flex flex-col sm:flex-row flex-wrap gap-2 pt-2 border-t border-slate-100 dark:border-neutral-800">
                        {b.status === 'ASSIGNED' && (
                          <button
                            onClick={() => handleUpdateStatus(b.id, 'ON_THE_WAY', `Mistri ${partnerNameRef} is on the way to your location`)}
                            className="btn-primary bg-blue-600 hover:bg-blue-700 text-xs py-2.5 px-4 w-full sm:w-auto"
                          >
                            <Bike className="w-4 h-4 inline mr-1" /> Mark On The Way
                          </button>
                        )}

                        {b.status === 'ON_THE_WAY' && (
                          <button
                            onClick={() => handleUpdateStatus(b.id, 'IN_PROGRESS', `Mistri ${partnerNameRef} arrived at location & started work`)}
                            className="btn-primary bg-orangeSecondary hover:bg-orange-600 text-xs py-2.5 px-4 w-full sm:w-auto"
                          >
                            <Wrench className="w-4 h-4 inline mr-1" /> Mark Arrived & Start Work
                          </button>
                        )}

                        {b.status === 'IN_PROGRESS' && (
                          <button
                            onClick={() => handleUpdateStatus(b.id, 'COMPLETED', `Service work completed successfully & payment collected!`)}
                            className="btn-primary bg-emerald-600 hover:bg-emerald-700 text-xs py-2.5 px-4 w-full sm:w-auto"
                          >
                            <CheckCircle2 className="w-4 h-4 inline mr-1" /> Mark Work Finished & Collect ₹{b.totalAmount}
                          </button>
                        )}

                        <a
                          href={`tel:${b.customerPhone || b.userPhone || '+916296351107'}`}
                          className="py-2.5 px-4 rounded-xl border border-slate-300 dark:border-neutral-700 bg-slate-100 dark:bg-neutral-900 text-xs font-bold text-slate-800 dark:text-white inline-flex items-center justify-center gap-1.5 w-full sm:w-auto"
                        >
                          <Phone className="w-3.5 h-3.5 text-emerald-500" /> Call Customer
                        </a>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* TAB 1: COMPLETED JOBS (In Single-Card Interactive Slider Format) */}
            {activeSubTab === 1 && (
              <div className="space-y-4">
                {completedJobs.length === 0 ? (
                  <div className="web-card py-16 text-center text-slate-500 space-y-2 border-dashed bg-white dark:bg-[#1A1A1A]">
                    <CheckCircle2 className="w-12 h-12 mx-auto text-emerald-500 opacity-40" />
                    <p className="font-bold text-sm">No completed jobs in history yet.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Completed Slider Controls */}
                    <div className="flex justify-between items-center px-1">
                      <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                        Completed Job <span className="text-emerald-500 font-black">{completedSliderIdx + 1}</span> of {completedJobs.length}
                      </span>

                      {completedJobs.length > 1 && (
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setCompletedSliderIdx((prev) => (prev - 1 + completedJobs.length) % completedJobs.length)}
                            className="p-2 rounded-xl bg-slate-200 dark:bg-neutral-900 border border-slate-300 dark:border-neutral-800 text-slate-800 dark:text-white transition"
                          >
                            <ChevronLeft className="w-4 h-4" />
                          </button>
                          <span className="text-xs font-black text-slate-600 dark:text-slate-300">
                            {completedSliderIdx + 1} / {completedJobs.length}
                          </span>
                          <button
                            type="button"
                            onClick={() => setCompletedSliderIdx((prev) => (prev + 1) % completedJobs.length)}
                            className="p-2 rounded-xl bg-slate-200 dark:bg-neutral-900 border border-slate-300 dark:border-neutral-800 text-slate-800 dark:text-white transition"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Single Animated Card Slider */}
                    {currentCompletedJob && (
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={currentCompletedJob.id || completedSliderIdx}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          transition={{ duration: 0.25 }}
                          className="web-card bg-white dark:bg-[#1A1A1A] border border-slate-200 dark:border-[#333333] p-6 rounded-2xl space-y-4 shadow-xl max-w-lg mx-auto w-full"
                        >
                          <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-neutral-800">
                            <span className="font-extrabold text-sm text-slate-900 dark:text-white">Ref ID: {currentCompletedJob.bookingRef || currentCompletedJob.id}</span>
                            <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-600/20 text-emerald-500">
                              COMPLETED
                            </span>
                          </div>

                          <div className="space-y-1">
                            <h3 className="font-bold text-lg text-slate-900 dark:text-white">{currentCompletedJob.serviceTitle} <span className="text-xs text-slate-400">(Qty: {currentCompletedJob.quantity || 1})</span></h3>
                            <p className="text-sm font-black text-emerald-600 dark:text-emerald-400">Total Collected: ₹{currentCompletedJob.totalAmount}</p>
                            <p className="text-xs text-slate-600 dark:text-slate-300 font-bold">80% Net Share Earned: ₹{currentCompletedJob.totalAmount * 0.80}</p>
                            <p className="text-xs text-slate-500 mt-1">Customer: {currentCompletedJob.userName || 'Customer'} ({currentCompletedJob.customerPhone || currentCompletedJob.userPhone})</p>
                          </div>

                          <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-800/30 flex items-center gap-2 text-xs font-bold text-emerald-500">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                            <span>Job completed successfully and payment settled!</span>
                          </div>
                        </motion.div>
                      </AnimatePresence>
                    )}

                    {completedJobs.length > 1 && (
                      <div className="flex justify-center gap-2 pt-2">
                        {completedJobs.map((_, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => setCompletedSliderIdx(i)}
                            className={`h-2 rounded-full transition-all ${
                              completedSliderIdx === i ? 'w-8 bg-emerald-500' : 'w-2 bg-slate-300 dark:bg-neutral-700 hover:bg-emerald-500/50'
                            }`}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
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
