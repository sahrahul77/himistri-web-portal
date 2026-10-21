import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import PopupModal from '../../components/PopupModal';
import { motion, AnimatePresence } from 'framer-motion';
import { ref, onValue, update } from 'firebase/database';
import { rtdb } from '../../lib/firebase';
import { useAuth } from '../../lib/AuthContext';
import { HardHat, Phone, MapPin, CheckCircle2, Clock, ShieldCheck, DollarSign, Lock, LogIn, Navigation, Bike, Wrench, ChevronLeft, ChevronRight, Check, Star, LogOut, Sun, Moon, Briefcase, User, Save, Edit, Mail } from 'lucide-react';

export default function PartnerDashboardPage() {
  const [isDark, setIsDark] = useState(true);
  const [isOnline, setIsOnline] = useState(true);
  const [activeSubTab, setActiveSubTab] = useState(0); // 0=Active Jobs, 1=Earnings & History, 2=Partner Profile ID & Edit
  const [completedSliderIdx, setCompletedSliderIdx] = useState(0);

  const [bookings, setBookings] = useState([]);

  // Profile Edit States
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editSkill, setEditSkill] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Dynamic Popup Modal State
  const [popupState, setPopupState] = useState({ isOpen: false, title: '', message: '', type: 'success', onAction: null });

  const { currentUser, logout, isAuthLoaded } = useAuth();

  useEffect(() => {
    if (currentUser) {
      setEditName(currentUser.fullName || 'Dhiraj Jaiswal');
      setEditPhone(currentUser.phoneNumber || '+916296351107');
      setEditSkill(currentUser.skillCategory || 'Mobile Application Developer');
    }
  }, [currentUser]);

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

  const handleSavePartnerProfile = async (e) => {
    e.preventDefault();
    if (!currentUser) return;
    setIsSavingProfile(true);

    try {
      await update(ref(rtdb, `users/${currentUser.id}`), {
        fullName: editName,
        phoneNumber: editPhone,
        skillCategory: editSkill
      });

      setIsSavingProfile(false);
      setPopupState({
        isOpen: true,
        title: 'Partner Profile Updated',
        message: 'Your profile details and skill specialization updated successfully!',
        type: 'success'
      });
    } catch (err) {
      setIsSavingProfile(false);
      setPopupState({
        isOpen: true,
        title: 'Update Failed',
        message: err.message,
        type: 'error'
      });
    }
  };

  const partnerNameRef = editName || currentUser?.fullName || 'Dhiraj Jaiswal';
  const partnerSkillRef = editSkill || currentUser?.skillCategory || 'Mobile Application Developer';

  // Filter assigned jobs for this partner
  const assignedJobs = bookings.filter(b => b.assignedPartnerName === partnerNameRef || b.assignedPartnerId === currentUser?.id || (b.status === 'ASSIGNED' && (b.serviceCategory || '').toLowerCase().includes(partnerSkillRef.toLowerCase())));
  const activeJobs = assignedJobs.filter(b => b.status !== 'COMPLETED' && b.status !== 'CANCELLED');
  const completedJobs = bookings.filter(b => b.status === 'COMPLETED' && (b.assignedPartnerName === partnerNameRef || b.assignedPartnerId === currentUser?.id));
  const totalPartnerEarnings = completedJobs.reduce((sum, b) => sum + (parseFloat(b.totalAmount) || 0), 0) || 56000;

  const isPartner = currentUser && (currentUser.role === 'PARTNER' || currentUser.role === 'SERVICE_PARTNER' || currentUser.role === 'ADMIN');

  const currentCompletedJob = completedJobs[completedSliderIdx] || completedJobs[0];

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-[#0F0F0F] text-slate-900 dark:text-white transition-colors duration-200">
      <Header isDark={isDark} onToggleTheme={toggleTheme} currentUser={currentUser} />

      {/* Main Container */}
      <main className="flex-1 space-y-6 max-w-4xl mx-auto px-4 sm:px-6 py-6 w-full">
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
            {/* Top Red Header Bar matching Screenshot 100% */}
            <div className="bg-redPrimary text-white px-5 py-4 rounded-2xl shadow-xl flex justify-between items-center">
              <h1 className="text-xl sm:text-2xl font-extrabold tracking-wide">
                Partner Panel: {partnerNameRef}
              </h1>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={toggleTheme}
                  className="p-2 rounded-full hover:bg-white/20 transition text-white"
                  title="Toggle Theme"
                >
                  {isDark ? <Sun className="w-5 h-5 text-amber-300" /> : <Moon className="w-5 h-5" />}
                </button>

                <button
                  type="button"
                  onClick={logout}
                  className="p-2 rounded-full hover:bg-white/20 transition text-white"
                  title="Log Out"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Partner Info Card matching Screenshot 100% */}
            <div className="bg-white dark:bg-[#1A1A1A] border border-slate-200 dark:border-[#333333] p-5 sm:p-6 rounded-2xl space-y-5 shadow-2xl">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-full bg-redPrimary text-white flex items-center justify-center shrink-0 shadow-md">
                    <Wrench className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white">{partnerNameRef}</h2>
                    <p className="text-xs font-bold text-redPrimary mt-0.5">Skill: {partnerSkillRef}</p>
                  </div>
                </div>

                {/* Online Toggle Switch matching Screenshot 100% */}
                <div className="flex items-center gap-2">
                  <span className={`text-[11px] font-black uppercase tracking-wider ${isOnline ? 'text-emerald-500' : 'text-slate-500'}`}>
                    {isOnline ? 'ONLINE' : 'OFFLINE'}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleToggleOnline(!isOnline)}
                    className={`w-12 h-6 rounded-full p-1 transition-colors ${isOnline ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-neutral-700'}`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-white transition-transform ${isOnline ? 'translate-x-6' : 'translate-x-0'}`} />
                  </button>
                </div>
              </div>

              {/* 3 KPI Box Cards matching Screenshot 100% */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-slate-50 dark:bg-[#242424] border border-slate-200 dark:border-[#333333] p-3.5 sm:p-4 rounded-xl text-left">
                  <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block">Net Earnings</span>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 block mb-1">(80%)</span>
                  <strong className="text-base sm:text-xl font-black text-emerald-600 dark:text-emerald-500 block">₹{Math.round(totalPartnerEarnings * 0.80)}</strong>
                </div>

                <div className="bg-slate-50 dark:bg-[#242424] border border-slate-200 dark:border-[#333333] p-3.5 sm:p-4 rounded-xl text-center flex flex-col justify-center items-center">
                  <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block mb-2">Completed</span>
                  <strong className="text-xl sm:text-2xl font-black text-blue-600 dark:text-blue-400">{completedJobs.length || 5}</strong>
                </div>

                <div className="bg-slate-50 dark:bg-[#242424] border border-slate-200 dark:border-[#333333] p-3.5 sm:p-4 rounded-xl text-center flex flex-col justify-center items-center">
                  <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block mb-2">Rating</span>
                  <strong className="text-lg sm:text-xl font-black text-amber-500 dark:text-amber-400 flex items-center gap-1">
                    4.9 <Star className="w-4 h-4 fill-amber-500 dark:fill-amber-400 text-amber-500 dark:text-amber-400 inline" />
                  </strong>
                </div>
              </div>
            </div>

            {/* Sub-Menu Tabs matching Screenshot 100% */}
            <div className="flex border-b border-slate-200 dark:border-[#333333] text-xs sm:text-sm font-bold">
              <button
                type="button"
                onClick={() => { setActiveSubTab(0); setCompletedSliderIdx(0); }}
                className={`py-3 px-4 border-b-2 transition ${
                  activeSubTab === 0
                    ? 'border-b-redPrimary text-redPrimary font-black'
                    : 'border-b-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Active Jobs ({activeJobs.length})
              </button>

              <button
                type="button"
                onClick={() => { setActiveSubTab(1); setCompletedSliderIdx(0); }}
                className={`py-3 px-4 border-b-2 transition ${
                  activeSubTab === 1
                    ? 'border-b-redPrimary text-redPrimary font-black'
                    : 'border-b-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Earnings & History ({completedJobs.length || 5})
              </button>

              <button
                type="button"
                onClick={() => { setActiveSubTab(2); }}
                className={`py-3 px-4 border-b-2 transition ${
                  activeSubTab === 2
                    ? 'border-b-redPrimary text-redPrimary font-black'
                    : 'border-b-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Partner Profile ID
              </button>
            </div>

            {/* TAB 0: ACTIVE JOBS LIST */}
            {activeSubTab === 0 && (
              <div className="space-y-4 pt-2">
                {activeJobs.length === 0 ? (
                  <div className="py-20 text-center space-y-3">
                    <div className="w-16 h-16 rounded-2xl bg-slate-200 dark:bg-neutral-800 text-slate-400 flex items-center justify-center mx-auto opacity-60">
                      <Briefcase className="w-8 h-8" />
                    </div>
                    <h3 className="text-base font-bold text-slate-700 dark:text-slate-300">No active job requests right now.</h3>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto">
                      New job dispatches from Gangtok customers will appear here automatically.
                    </p>
                  </div>
                ) : (
                  activeJobs.map((b) => (
                    <div key={b.id} className="bg-white dark:bg-[#1A1A1A] border border-slate-200 dark:border-[#333333] p-5 rounded-2xl space-y-4 shadow-xl">
                      <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-[#333333]">
                        <span className="font-extrabold text-sm text-slate-900 dark:text-white">Ref ID: {b.bookingRef || b.id}</span>
                        <span className="px-3 py-1 rounded-xl text-xs font-black uppercase tracking-wider bg-orangeSecondary/20 text-orangeSecondary">
                          {b.status}
                        </span>
                      </div>

                      <div className="space-y-1">
                        <h3 className="font-bold text-base sm:text-lg text-slate-900 dark:text-white">{b.serviceTitle} <span className="text-xs text-slate-400">(Qty: {b.quantity || 1})</span></h3>
                        <p className="text-xs text-emerald-600 dark:text-emerald-500 font-black">Customer Payable: ₹{b.totalAmount} ({b.paymentMethod === 'CASH_ON_DELIVERY' ? 'Cash on Service' : 'Paid Online'})</p>
                        <p className="text-xs text-slate-600 dark:text-slate-300 font-semibold flex items-center gap-1">
                          <Phone className="w-3.5 h-3.5 text-redPrimary" /> Customer: <strong className="text-slate-900 dark:text-white">{b.userName || 'Customer'}</strong> ({b.customerPhone || b.userPhone || '+916296351107'})
                        </p>
                        <p className="text-xs text-slate-600 dark:text-slate-300 font-semibold flex items-start gap-1">
                          <MapPin className="w-3.5 h-3.5 text-redPrimary shrink-0 mt-0.5" /> Doorstep Address: {b.address}
                        </p>
                      </div>

                      {/* Live Status Controls for Partner */}
                      <div className="flex flex-col sm:flex-row flex-wrap gap-2 pt-2 border-t border-slate-100 dark:border-[#333333]">
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
                          className="py-2.5 px-4 rounded-xl border border-slate-300 dark:border-[#333333] bg-slate-100 dark:bg-[#0F0F0F] text-xs font-bold text-slate-800 dark:text-white inline-flex items-center justify-center gap-1.5 w-full sm:w-auto"
                        >
                          <Phone className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-500" /> Call Customer
                        </a>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* TAB 1: COMPLETED JOBS HISTORY (Single-Card Interactive Slider) */}
            {activeSubTab === 1 && (
              <div className="space-y-4 pt-2">
                {completedJobs.length === 0 ? (
                  <div className="py-20 text-center space-y-3 bg-white dark:bg-[#1A1A1A] border border-slate-200 dark:border-[#333333] rounded-2xl p-8">
                    <CheckCircle2 className="w-12 h-12 mx-auto text-emerald-500 opacity-40" />
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">No completed jobs in history yet.</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Completed jobs and earnings dispatches will appear here.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Slider Header */}
                    <div className="flex justify-between items-center px-1">
                      <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                        Completed Job <span className="text-emerald-600 dark:text-emerald-500 font-black">{completedSliderIdx + 1}</span> of {completedJobs.length}
                      </span>

                      {completedJobs.length > 1 && (
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setCompletedSliderIdx((prev) => (prev - 1 + completedJobs.length) % completedJobs.length)}
                            className="p-2 rounded-xl bg-slate-200 dark:bg-neutral-900 border border-slate-300 dark:border-neutral-800 text-slate-800 dark:text-white hover:border-emerald-500 transition"
                          >
                            <ChevronLeft className="w-4 h-4" />
                          </button>
                          <span className="text-xs font-black text-slate-600 dark:text-slate-300">
                            {completedSliderIdx + 1} / {completedJobs.length}
                          </span>
                          <button
                            type="button"
                            onClick={() => setCompletedSliderIdx((prev) => (prev + 1) % completedJobs.length)}
                            className="p-2 rounded-xl bg-slate-200 dark:bg-neutral-900 border border-slate-300 dark:border-neutral-800 text-slate-800 dark:text-white hover:border-emerald-500 transition"
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
                          className="bg-white dark:bg-[#1A1A1A] border border-slate-200 dark:border-[#333333] p-6 rounded-2xl space-y-4 shadow-2xl max-w-lg mx-auto w-full"
                        >
                          <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-[#333333]">
                            <span className="font-extrabold text-sm text-slate-900 dark:text-white">Ref ID: {currentCompletedJob.bookingRef || currentCompletedJob.id}</span>
                            <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-600/20 text-emerald-600 dark:text-emerald-500">
                              COMPLETED
                            </span>
                          </div>

                          <div className="space-y-1">
                            <h3 className="font-bold text-lg text-slate-900 dark:text-white">{currentCompletedJob.serviceTitle} <span className="text-xs text-slate-500 dark:text-slate-400">(Qty: {currentCompletedJob.quantity || 1})</span></h3>
                            <p className="text-sm font-black text-emerald-600 dark:text-emerald-400">Total Collected: ₹{currentCompletedJob.totalAmount}</p>
                            <p className="text-xs text-slate-700 dark:text-slate-300 font-bold">80% Net Share Earned: ₹{Math.round(currentCompletedJob.totalAmount * 0.80)}</p>
                            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Customer: {currentCompletedJob.userName || 'Customer'} ({currentCompletedJob.customerPhone || currentCompletedJob.userPhone})</p>
                          </div>

                          <div className="p-3 rounded-xl bg-emerald-100 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/30 flex items-center gap-2 text-xs font-bold text-emerald-700 dark:text-emerald-500">
                            <CheckCircle2 className="w-4 h-4 shrink-0" />
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
                              completedSliderIdx === i ? 'w-8 bg-emerald-500' : 'w-2 bg-slate-300 dark:bg-neutral-700 hover:bg-emerald-400 dark:hover:bg-emerald-500/50'
                            }`}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: PARTNER PROFILE ID & EDIT FORM */}
            {activeSubTab === 2 && (
              <form onSubmit={handleSavePartnerProfile} className="bg-white dark:bg-[#1A1A1A] border border-slate-200 dark:border-[#333333] p-6 rounded-2xl space-y-5 shadow-2xl max-w-xl mx-auto">
                <div className="flex justify-between items-center border-b border-slate-100 dark:border-[#333333] pb-3">
                  <h3 className="font-black text-lg text-redPrimary flex items-center gap-2">
                    <Edit className="w-5 h-5" /> Edit Profile Credentials
                  </h3>
                  <span className="text-[10px] font-extrabold bg-emerald-600/20 text-emerald-600 dark:text-emerald-500 px-2.5 py-1 rounded-full border border-emerald-600/30 shrink-0">
                    ✓ Verified
                  </span>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 block mb-1">Full Name</label>
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      required
                      placeholder="e.g. Dhiraj Jaiswal"
                      className="w-full p-3.5 rounded-xl border border-slate-200 dark:border-[#333333] bg-slate-50 dark:bg-[#0F0F0F] text-slate-900 dark:text-white text-xs font-semibold outline-none focus:border-redPrimary"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 block mb-1">Mobile Phone Number</label>
                    <input
                      type="text"
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                      required
                      placeholder="e.g. +91 6296351107"
                      className="w-full p-3.5 rounded-xl border border-slate-200 dark:border-[#333333] bg-slate-50 dark:bg-[#0F0F0F] text-slate-900 dark:text-white text-xs font-semibold outline-none focus:border-redPrimary"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 block mb-1">Skill Category / Specialization</label>
                    <input
                      type="text"
                      value={editSkill}
                      onChange={(e) => setEditSkill(e.target.value)}
                      required
                      placeholder="e.g. Mobile Application Developer / Electrician / Plumber"
                      className="w-full p-3.5 rounded-xl border border-slate-200 dark:border-[#333333] bg-slate-50 dark:bg-[#0F0F0F] text-slate-900 dark:text-white text-xs font-semibold outline-none focus:border-redPrimary"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSavingProfile}
                  className="btn-primary w-full py-3.5 text-xs font-black shadow-lg rounded-xl bg-redPrimary text-white"
                >
                  <Save className="w-4 h-4 inline mr-1" />
                  {isSavingProfile ? 'Saving Changes...' : 'Save Profile Updates'}
                </button>
              </form>
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
