import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import PopupModal from '../../components/PopupModal';
import { motion, AnimatePresence } from 'framer-motion';
import { ref, onValue, update, set } from 'firebase/database';
import { rtdb } from '../../lib/firebase';
import { useAuth } from '../../lib/AuthContext';
import { HardHat, Phone, MapPin, CheckCircle2, Clock, ShieldCheck, DollarSign, Lock, LogIn, Navigation, Bike, Wrench, ChevronLeft, ChevronRight, Check, Star, LogOut, Sun, Moon, Briefcase, User, Save, Edit, Mail, Bell, Trash2 } from 'lucide-react';

export default function PartnerDashboardPage() {
  const [isDark, setIsDark] = useState(true);
  const [isOnline, setIsOnline] = useState(true);
  const [activeSubTab, setActiveSubTab] = useState(0); // 0=Active Jobs, 1=Earnings & History, 2=Partner Profile ID & Edit
  const [completedSliderIdx, setCompletedSliderIdx] = useState(0);

  const [bookings, setBookings] = useState([]);
  const [partnerNotifications, setPartnerNotifications] = useState([]);

  // Profile Edit States
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editSkill, setEditSkill] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Dynamic Popup Modal State
  const [popupState, setPopupState] = useState({ isOpen: false, title: '', message: '', type: 'success', onAction: null });

  const { currentUser, logout, isAuthLoaded } = useAuth();

  // Automatic Theme Synchronization Effect
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.setAttribute('data-theme', 'light');
    }
  }, [isDark]);

  useEffect(() => {
    if (currentUser) {
      setEditName(currentUser.fullName || 'Dhiraj Jaiswal');
      setEditPhone(currentUser.phoneNumber || '+916296351107');
      setEditSkill(currentUser.skillCategory || 'Mobile Application Developer');
    }
  }, [currentUser]);

  const toggleTheme = () => {
    setIsDark(prev => !prev);
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

    // Realtime Listener for Partner Notifications with Cleared Map Filter
    if (currentUser) {
      const notifsRef = ref(rtdb, 'notifications');
      const userRef = ref(rtdb, `users/${currentUser.id}`);

      const unsubNotifs = onValue(notifsRef, (snapshot) => {
        const rawList = [];
        if (snapshot.exists()) {
          snapshot.forEach((child) => {
            rawList.push({ id: child.key, ...child.val() });
          });
        }
        rawList.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());

        onValue(userRef, (userSnap) => {
          let clearedMap = {};
          if (userSnap.exists()) {
            const userData = userSnap.val();
            clearedMap = userData.clearedNotifications || {};
          }

          // Filter notifications targeting PARTNERS or ALL and exclude cleared alerts for THIS partner
          const partnerList = rawList.filter(n => {
            const target = (n.targetAudience || '').toUpperCase();
            const isTarget = target === 'PARTNERS' || target === 'ALL' || target === 'SERVICE_PARTNERS';
            return isTarget && !clearedMap[n.id];
          });
          setPartnerNotifications(partnerList);
        });
      });

      return () => {
        unsub();
        unsubNotifs();
      };
    } else {
      return () => unsub();
    }
  }, [currentUser]);

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

  // Clear all alerts ONLY for this specific partner
  const handleClearAllPartnerNotifs = async () => {
    if (!currentUser) return;
    try {
      const clearedUpdates = {};
      partnerNotifications.forEach((n) => {
        clearedUpdates[`users/${currentUser.id}/clearedNotifications/${n.id}`] = true;
      });
      await update(ref(rtdb), clearedUpdates);
      setPartnerNotifications([]);
    } catch (err) {
      console.error("Could not clear partner notifications:", err);
    }
  };

  // Dismiss single alert ONLY for this specific partner
  const handleDismissPartnerNotif = async (notifId) => {
    if (!currentUser) return;
    try {
      await set(ref(rtdb, `users/${currentUser.id}/clearedNotifications/${notifId}`), true);
      setPartnerNotifications(prev => prev.filter(n => n.id !== notifId));
    } catch (err) {
      console.error("Could not dismiss partner notification:", err);
    }
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
        message: 'Your partner credentials and technical skill category have been updated.',
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
  const activeJobs = assignedJobs.filter(b => {
    const st = (b.status || '').toUpperCase().trim();
    return st !== 'COMPLETED' && st !== 'CANCELLED' && st !== 'REJECTED' && !st.includes('CANCEL');
  });
  const completedJobs = bookings.filter(b => (b.status || '').toUpperCase().trim() === 'COMPLETED' && (b.assignedPartnerName === partnerNameRef || b.assignedPartnerId === currentUser?.id));
  const totalPartnerEarnings = completedJobs.reduce((sum, b) => sum + (parseFloat(b.totalAmount) || 0), 0) || 56000;

  const isPartner = currentUser && (currentUser.role === 'PARTNER' || currentUser.role === 'SERVICE_PARTNER' || currentUser.role === 'ADMIN');

  const currentCompletedJob = completedJobs[completedSliderIdx] || completedJobs[0];

  return (
    <div className="flex flex-col min-h-screen bg-slate-100 dark:bg-[#0F0F0F] text-slate-900 dark:text-white transition-colors duration-200">
      <Header isDark={isDark} onToggleTheme={toggleTheme} currentUser={currentUser} />

      {/* Main Container */}
      <main className="flex-1 space-y-6 max-w-4xl mx-auto px-4 sm:px-6 py-6 w-full">
        {!isAuthLoaded ? (<div className="web-card text-center py-16 text-slate-500">Loading secure session...</div>) : !isPartner ? (
          <div className="web-card text-center py-16 space-y-4 max-w-lg mx-auto bg-white dark:bg-[#1A1A1A] border border-slate-200 dark:border-[#333333]">
            <Lock className="w-16 h-16 text-redPrimary mx-auto" />
            <h2 className="text-2xl font-black text-slate-900 dark:text-white">Partner Access Restricted</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Please sign in as a registered HiMistri Service Partner to view your dispatched jobs.</p>
            <Link href="/auth" className="btn-primary inline-flex mt-2">
              <LogIn className="w-4 h-4" /> Partner Login
            </Link>
          </div>
        ) : (
          <>
            {/* Top Red Header Bar */}
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

            {/* Broadcast Alerts & Important Notifications for Partners */}
            {partnerNotifications.length > 0 && (
              <div className="web-card bg-[#1A1A1A] text-white border border-redPrimary/40 p-5 sm:p-6 rounded-2xl shadow-2xl space-y-4">
                <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                  <div className="flex items-center gap-2 text-redPrimary">
                    <Bell className="w-5 h-5 text-redPrimary animate-bounce" />
                    <h3 className="font-extrabold text-sm sm:text-base text-white">Broadcast Alerts for Service Partners</h3>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-redPrimary/20 text-redPrimary border border-redPrimary/30">
                      {partnerNotifications.length} Alerts
                    </span>

                    <button
                      type="button"
                      onClick={handleClearAllPartnerNotifs}
                      className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition flex items-center gap-1 text-[11px] font-bold cursor-pointer"
                      title="Clear All Alerts for Me"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-rose-400" /> Clear All
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  {partnerNotifications.map((notif) => (
                    <div key={notif.id} className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 space-y-1 flex items-start justify-between gap-3 group">
                      <div className="space-y-1">
                        <div className="flex justify-between items-center text-xs gap-2">
                          <strong className="text-redPrimary font-extrabold">{notif.title}</strong>
                          <span className="text-[10px] text-slate-400">{new Date(notif.createdAt || Date.now()).toLocaleString()}</span>
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed font-medium">{notif.body}</p>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDismissPartnerNotif(notif.id)}
                        className="text-slate-400 hover:text-rose-500 p-1 rounded-lg transition shrink-0 cursor-pointer"
                        title="Dismiss Alert"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Partner Info Card */}
            <div className="bg-white dark:bg-[#1A1A1A] border border-slate-200 dark:border-[#333333] p-5 sm:p-6 rounded-2xl space-y-5 shadow-xl">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-full bg-redPrimary/20 text-redPrimary flex items-center justify-center font-black text-xl shadow-md">
                    <HardHat className="w-6 h-6 text-redPrimary" />
                  </div>
                  <div>
                    <strong className="text-base sm:text-lg block text-slate-900 dark:text-white font-extrabold">{partnerNameRef}</strong>
                    <span className="text-xs font-bold text-redPrimary block">{partnerSkillRef}</span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">{editPhone}</span>
                  </div>
                </div>

                {/* Online / Offline Toggle Switch */}
                <div className="flex items-center gap-3 bg-slate-100 dark:bg-neutral-900 p-2.5 rounded-2xl border border-slate-200 dark:border-neutral-800">
                  <span className={`text-xs font-black uppercase tracking-wider ${isOnline ? 'text-emerald-600 dark:text-emerald-500' : 'text-slate-500'}`}>
                    {isOnline ? '🟢 ONLINE' : '⚫ OFFLINE'}
                  </span>

                  <button
                    type="button"
                    onClick={() => handleToggleOnline(!isOnline)}
                    className={`w-12 h-6 rounded-full p-1 transition-colors cursor-pointer ${isOnline ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-neutral-700'}`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-white transition-transform ${isOnline ? 'translate-x-6' : 'translate-x-0'}`} />
                  </button>
                </div>
              </div>

              {/* Sub-Navigation Tabs */}
              <div className="flex border-b border-slate-200 dark:border-neutral-800 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveSubTab(0)}
                  className={`flex-1 py-3 text-center text-xs sm:text-sm font-extrabold border-b-2 transition ${
                    activeSubTab === 0 ? 'border-b-redPrimary text-redPrimary' : 'border-b-transparent text-slate-500 dark:text-slate-400'
                  }`}
                >
                  Active Dispatches ({activeJobs.length})
                </button>

                <button
                  type="button"
                  onClick={() => setActiveSubTab(1)}
                  className={`flex-1 py-3 text-center text-xs sm:text-sm font-extrabold border-b-2 transition ${
                    activeSubTab === 1 ? 'border-b-redPrimary text-redPrimary' : 'border-b-transparent text-slate-500 dark:text-slate-400'
                  }`}
                >
                  Earnings & History (₹{totalPartnerEarnings})
                </button>

                <button
                  type="button"
                  onClick={() => setActiveSubTab(2)}
                  className={`flex-1 py-3 text-center text-xs sm:text-sm font-extrabold border-b-2 transition ${
                    activeSubTab === 2 ? 'border-b-redPrimary text-redPrimary' : 'border-b-transparent text-slate-500 dark:text-slate-400'
                  }`}
                >
                  Partner Profile ID
                </button>
              </div>

              {/* TAB 0: ACTIVE DISPATCH JOBS */}
              {activeSubTab === 0 && (
                <div className="space-y-4">
                  {activeJobs.length === 0 ? (
                    <div className="py-12 text-center text-slate-500 space-y-2 border-dashed border border-slate-200 dark:border-neutral-800 rounded-2xl">
                      <Clock className="w-10 h-10 mx-auto opacity-40 text-slate-400" />
                      <p className="text-xs font-bold">No active jobs assigned currently. You will receive live alerts when new orders match your skill!</p>
                    </div>
                  ) : (
                    activeJobs.map((job) => (
                      <div key={job.id} className="p-5 rounded-2xl bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 space-y-4 shadow-md">
                        <div className="flex justify-between items-center border-b border-slate-200 dark:border-neutral-800 pb-2">
                          <span className="text-xs font-black text-slate-900 dark:text-white">Ref ID: {job.bookingRef || job.id}</span>
                          <span className="px-3 py-1 rounded-full text-[10px] font-black bg-orangeSecondary/20 text-orangeSecondary border border-orangeSecondary/30">
                            {job.status}
                          </span>
                        </div>

                        <div>
                          <h3 className="text-base font-extrabold text-slate-900 dark:text-white">{job.serviceTitle}</h3>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Duration: <strong className="text-redPrimary">{job.durationUnitText || '1 Hour'}</strong> | Payable: <strong className="text-emerald-600 dark:text-emerald-500 font-extrabold">₹{job.totalAmount}</strong></p>
                        </div>

                        <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300 bg-white dark:bg-black/40 p-3 rounded-xl border border-slate-200 dark:border-neutral-800">
                          <p className="flex items-center gap-2"><User className="w-4 h-4 text-redPrimary shrink-0" /> Customer: <strong className="text-slate-900 dark:text-white">{job.userName || 'Passang Bhutia'}</strong></p>
                          <p className="flex items-center gap-2"><Phone className="w-4 h-4 text-redPrimary shrink-0" /> Phone: <a href={`tel:${job.customerPhone || job.userPhone}`} className="text-emerald-600 dark:text-emerald-500 font-extrabold underline">{job.customerPhone || job.userPhone || '+916296351107'}</a></p>
                          <p className="flex items-start gap-2"><MapPin className="w-4 h-4 text-redPrimary shrink-0 mt-0.5" /> Address: <strong className="text-slate-900 dark:text-white">{job.address}</strong></p>
                        </div>

                        {/* Status Update Buttons */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2">
                          <button
                            type="button"
                            onClick={() => handleUpdateStatus(job.id, 'ON_THE_WAY', 'Partner Dispatched & On the Way')}
                            className="py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shadow-sm text-center"
                          >
                            🚀 On the Way
                          </button>

                          <button
                            type="button"
                            onClick={() => handleUpdateStatus(job.id, 'IN_PROGRESS', 'Partner Arrived at Customer Doorstep')}
                            className="py-2.5 px-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition shadow-sm text-center"
                          >
                            📍 Arrived
                          </button>

                          <button
                            type="button"
                            onClick={() => handleUpdateStatus(job.id, 'COMPLETED', 'Job Successfully Completed by Partner')}
                            className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold transition shadow-sm text-center col-span-2 sm:col-span-1"
                          >
                            ✓ Mark Completed
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* TAB 1: EARNINGS & HISTORY SLIDER */}
              {activeSubTab === 1 && (
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-emerald-600/10 border border-emerald-600/20 text-center">
                    <span className="text-xs text-slate-500 dark:text-slate-400 block font-bold">Total Partner Net Earnings</span>
                    <strong className="text-2xl font-black text-emerald-600 dark:text-emerald-500">₹{totalPartnerEarnings}</strong>
                  </div>

                  {completedJobs.length === 0 ? (
                    <p className="text-xs text-slate-500 py-6 text-center">No completed jobs yet.</p>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center px-1">
                        <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                          Completed Job <span className="text-redPrimary font-black">{completedSliderIdx + 1}</span> of {completedJobs.length}
                        </span>

                        {completedJobs.length > 1 && (
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setCompletedSliderIdx((prev) => (prev - 1 + completedJobs.length) % completedJobs.length)}
                              className="p-2 rounded-xl bg-slate-200 dark:bg-neutral-900 border border-slate-300 dark:border-neutral-800 text-slate-800 dark:text-white"
                            >
                              <ChevronLeft className="w-4 h-4" />
                            </button>
                            <span className="text-xs font-black text-slate-700 dark:text-slate-300">
                              {completedSliderIdx + 1} / {completedJobs.length}
                            </span>
                            <button
                              type="button"
                              onClick={() => setCompletedSliderIdx((prev) => (prev + 1) % completedJobs.length)}
                              className="p-2 rounded-xl bg-slate-200 dark:bg-neutral-900 border border-slate-300 dark:border-neutral-800 text-slate-800 dark:text-white"
                            >
                              <ChevronRight className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>

                      {currentCompletedJob && (
                        <AnimatePresence mode="wait">
                          <motion.div
                            key={currentCompletedJob.id || completedSliderIdx}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.25 }}
                            className="p-5 rounded-2xl bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 space-y-3 shadow-md"
                          >
                            <div className="flex justify-between items-center pb-2 border-b border-slate-200 dark:border-neutral-800">
                              <span className="text-xs font-black text-slate-900 dark:text-white">Ref ID: {currentCompletedJob.bookingRef || currentCompletedJob.id}</span>
                              <span className="px-3 py-1 rounded-full text-[10px] font-black bg-emerald-600/20 text-emerald-600 dark:text-emerald-500 border border-emerald-600/30">
                                ✓ COMPLETED
                              </span>
                            </div>

                            <div className="flex justify-between items-center">
                              <strong className="text-base text-slate-900 dark:text-white">{currentCompletedJob.serviceTitle}</strong>
                              <span className="text-lg font-black text-emerald-600 dark:text-emerald-500">₹{currentCompletedJob.totalAmount}</span>
                            </div>

                            <p className="text-xs text-slate-500 dark:text-slate-400">Customer: {currentCompletedJob.userName || 'Customer'} ({currentCompletedJob.address})</p>
                          </motion.div>
                        </AnimatePresence>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: PARTNER PROFILE ID & EDIT CREDENTIALS */}
              {activeSubTab === 2 && (
                <form onSubmit={handleSavePartnerProfile} className="space-y-4 pt-2">
                  <h3 className="font-extrabold text-base text-redPrimary">Edit Partner Profile Credentials</h3>

                  <div>
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 block mb-1">Full Name</label>
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full p-3.5 rounded-xl border border-slate-200 dark:border-neutral-700 bg-slate-50 dark:bg-neutral-900 text-slate-900 dark:text-white text-xs font-bold outline-none focus:border-redPrimary"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 block mb-1">Mobile Phone</label>
                    <input
                      type="text"
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                      className="w-full p-3.5 rounded-xl border border-slate-200 dark:border-neutral-700 bg-slate-50 dark:bg-neutral-900 text-slate-900 dark:text-white text-xs font-bold outline-none focus:border-redPrimary"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 block mb-1">Skill Specialization Category</label>
                    <input
                      type="text"
                      value={editSkill}
                      onChange={(e) => setEditSkill(e.target.value)}
                      className="w-full p-3.5 rounded-xl border border-slate-200 dark:border-neutral-700 bg-slate-50 dark:bg-neutral-900 text-slate-900 dark:text-white text-xs font-bold outline-none focus:border-redPrimary"
                    />
                  </div>

                  <button type="submit" disabled={isSavingProfile} className="btn-primary w-full py-3.5 text-xs font-black shadow-lg rounded-xl">
                    <Save className="w-4 h-4 mr-1 inline" /> {isSavingProfile ? 'Saving...' : 'Update Partner Credentials'}
                  </button>
                </form>
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
