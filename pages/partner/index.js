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
  // Default Website Theme is Light Mode
  const [isDark, setIsDark] = useState(false);
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

  // Theme Sync Effect
  useEffect(() => {
    const savedTheme = localStorage.getItem('himistri_theme') || 'light';
    const isDarkTheme = savedTheme === 'dark';
    setIsDark(isDarkTheme);
    if (isDarkTheme) {
      document.documentElement.classList.add('dark');
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.setAttribute('data-theme', 'light');
    }
  }, []);

  const toggleTheme = () => {
    setIsDark(prev => {
      const nextDark = !prev;
      if (nextDark) {
        document.documentElement.classList.add('dark');
        document.documentElement.setAttribute('data-theme', 'dark');
        localStorage.setItem('himistri_theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        document.documentElement.setAttribute('data-theme', 'light');
        localStorage.setItem('himistri_theme', 'light');
      }
      return nextDark;
    });
  };

  useEffect(() => {
    if (!currentUser) return;
    setEditName(currentUser.fullName || '');
    setEditPhone(currentUser.phoneNumber || '');
    setEditSkill(currentUser.skillCategory || 'General Specialist');
    setIsOnline(currentUser.isOnline !== false);

    const partnerUserRef = ref(rtdb, `users/${currentUser.id}`);
    const unsubPartner = onValue(partnerUserRef, (snap) => {
      if (snap.exists()) {
        const val = snap.val();
        setIsOnline(val.isOnline !== false);
        setEditName(val.fullName || currentUser.fullName || '');
        setEditPhone(val.phoneNumber || currentUser.phoneNumber || '');
        setEditSkill(val.skillCategory || currentUser.skillCategory || 'General Specialist');
      }
    });

    return () => unsubPartner();
  }, [currentUser]);

  // Realtime Listener for Broadcast Alerts targeting PARTNERS
  useEffect(() => {
    if (!currentUser) return;
    const notifsRef = ref(rtdb, 'notifications');
    const partnerRef = ref(rtdb, `users/${currentUser.id}`);

    const unsubNotifs = onValue(notifsRef, (snapshot) => {
      const rawList = [];
      if (snapshot.exists()) {
        snapshot.forEach((child) => {
          rawList.push({ id: child.key, ...child.val() });
        });
      }
      rawList.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());

      onValue(partnerRef, (partnerSnap) => {
        let clearedMap = {};
        if (partnerSnap.exists()) {
          const partnerData = partnerSnap.val();
          clearedMap = partnerData.clearedNotifications || {};
        }

        const partnerList = rawList.filter(n => {
          const target = (n.targetAudience || '').toUpperCase().trim();
          const isPartnerTarget = target.includes('PARTNER') || target === 'ALL';
          return isPartnerTarget && !clearedMap[n.id];
        });

        setPartnerNotifications(partnerList);
      });
    });

    return () => unsubNotifs();
  }, [currentUser]);

  // Clear All Notifications for THIS Partner
  const handleClearAllPartnerNotifs = async () => {
    if (!currentUser) return;
    try {
      const clearedUpdates = {};
      partnerNotifications.forEach((n) => {
        clearedUpdates[`users/${currentUser.id}/clearedNotifications/${n.id}`] = true;
      });
      await update(ref(rtdb), clearedUpdates);
      setPartnerNotifications([]);
      setPopupState({
        isOpen: true,
        title: 'Alerts Cleared',
        message: 'Broadcast alerts cleared for your partner account.',
        type: 'info'
      });
    } catch (err) {
      console.error("Could not clear partner notifications:", err);
    }
  };

  // Dismiss single notification for THIS Partner
  const handleDismissSinglePartnerNotif = async (notifId) => {
    if (!currentUser) return;
    try {
      await set(ref(rtdb, `users/${currentUser.id}/clearedNotifications/${notifId}`), true);
      setPartnerNotifications(prev => prev.filter(n => n.id !== notifId));
    } catch (err) {
      console.error("Could not dismiss notification:", err);
    }
  };

  // Toggle Online/Offline Duty Status in Firebase
  const handleToggleOnlineStatus = (newOnlineState) => {
    if (!currentUser) return;
    setIsOnline(newOnlineState);
    update(ref(rtdb, `users/${currentUser.id}`), { isOnline: newOnlineState })
      .then(() => {
        setPopupState({
          isOpen: true,
          title: newOnlineState ? 'You are now ONLINE 🟢' : 'You are now OFFLINE ⚫',
          message: newOnlineState ? 'You will now receive job dispatches in Gangtok!' : 'Duty toggled offline. Dispatches paused.',
          type: newOnlineState ? 'success' : 'info'
        });
      });
  };

  // Fetch Jobs Assigned to THIS Partner
  useEffect(() => {
    if (!currentUser) return;

    const bookingsRef = ref(rtdb, 'bookings');
    const unsubscribe = onValue(bookingsRef, (snapshot) => {
      const rawList = [];
      if (snapshot.exists()) {
        snapshot.forEach((child) => {
          rawList.push({ dbKey: child.key, id: child.key, ...child.val() });
        });
      }

      const assignedToMe = rawList.filter((b) => {
        const pId = b.assignedPartnerId;
        const pName = (b.assignedPartnerName || '').toLowerCase().trim();
        const myName = (currentUser.fullName || '').toLowerCase().trim();
        const myPhone = (currentUser.phoneNumber || '').replace(/\D/g, '').slice(-10);
        const pPhone = (b.assignedPartnerPhone || '').replace(/\D/g, '').slice(-10);

        return pId === currentUser.id ||
          (pName.length > 0 && myName.length > 0 && pName === myName) ||
          (pPhone.length >= 10 && myPhone.length >= 10 && pPhone === myPhone);
      });

      assignedToMe.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
      setBookings(assignedToMe);
    });

    return () => unsubscribe();
  }, [currentUser]);

  // Update Status Flow for Partner Jobs
  const handleUpdateJobStatus = (bookingId, newStatus, trackingMessage) => {
    update(ref(rtdb, `bookings/${bookingId}`), {
      status: newStatus,
      trackingStatus: trackingMessage
    }).then(() => {
      setPopupState({
        isOpen: true,
        title: 'Status Updated!',
        message: `Job status updated to ${newStatus}.`,
        type: 'success'
      });
    });
  };

  // Save Partner Profile Credentials
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
        title: 'Partner Credentials Saved',
        message: 'Your profile name, skill category, and phone number updated in Realtime Database!',
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

  const activeJobs = bookings.filter((b) => {
    const st = (b.status || '').toUpperCase().trim();
    return st !== 'COMPLETED' && st !== 'CANCELLED' && st !== 'REJECTED';
  });

  const completedJobs = bookings.filter((b) => (b.status || '').toUpperCase().trim() === 'COMPLETED');
  const totalPartnerEarnings = completedJobs.reduce((sum, b) => sum + (parseFloat(b.totalAmount) || 0), 0);

  const isPartnerUser = currentUser && (
    currentUser.role === 'PARTNER' ||
    currentUser.role === 'SERVICE_PARTNER' ||
    currentUser.skillCategory
  );

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-[#0F0F0F] text-slate-900 dark:text-white transition-colors duration-200">
      <Header isDark={isDark} onToggleTheme={toggleTheme} currentUser={currentUser} />

      <main className="web-container py-6 sm:py-10 flex-1 max-w-4xl mx-auto space-y-6">
        {!isAuthLoaded ? (
          <div className="web-card text-center py-16 text-slate-500">Loading secure session...</div>
        ) : !isPartnerUser ? (
          <div className="web-card text-center py-16 max-w-md mx-auto space-y-4 shadow-xl">
            <Lock className="w-16 h-16 text-orangeSecondary mx-auto" />
            <h2 className="text-2xl font-black">Service Partner Access Required</h2>
            <p className="text-xs text-slate-500">Please sign in with a registered Service Partner account to access your dispatch dashboard.</p>
            <Link href="/auth" className="btn-primary inline-flex bg-orangeSecondary hover:bg-orange-600">
              <LogIn className="w-4 h-4" /> Sign In as Partner
            </Link>
          </div>
        ) : (
          <>
            {/* Top Partner Profile Banner Card */}
            <div className="web-card bg-gradient-to-r from-orangeSecondary/20 via-slate-100 dark:via-neutral-900 to-transparent border border-orangeSecondary/30 p-6 rounded-2xl shadow-xl space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 dark:border-neutral-800 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3.5 rounded-2xl bg-orangeSecondary/20 text-orangeSecondary shrink-0">
                    <HardHat className="w-7 h-7 sm:w-8 sm:h-8" />
                  </div>
                  <div>
                    <h1 className="text-xl sm:text-2xl font-black">{currentUser.fullName}</h1>
                    <p className="text-xs text-orangeSecondary font-extrabold flex items-center gap-1.5 mt-0.5">
                      <Briefcase className="w-3.5 h-3.5" /> Skill: {editSkill || 'Specialist Craftsman'}
                    </p>
                  </div>
                </div>

                {/* Duty Toggle Button (Online / Offline) */}
                <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
                  <button
                    type="button"
                    onClick={() => handleToggleOnlineStatus(!isOnline)}
                    className={`px-4 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-lg transition cursor-pointer ${
                      isOnline ? 'bg-emerald-600 text-white shadow-emerald-900/30' : 'bg-slate-700 text-slate-200'
                    }`}
                  >
                    <span className={`w-2.5 h-2.5 rounded-full ${isOnline ? 'bg-white animate-pulse' : 'bg-slate-400'}`}></span>
                    {isOnline ? '🟢 Duty: ONLINE' : '⚫ Duty: OFFLINE'}
                  </button>

                  <button onClick={logout} className="p-2.5 rounded-2xl bg-rose-600/20 hover:bg-rose-600 text-rose-600 hover:text-white transition" title="Log Out">
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Quick Earnings & Active Job KPI Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-center">
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-neutral-800">
                  <span className="text-[10px] text-slate-500 font-bold block uppercase">Net Earnings</span>
                  <strong className="text-lg sm:text-xl text-emerald-600 dark:text-emerald-500 font-black">₹{totalPartnerEarnings}</strong>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-neutral-800">
                  <span className="text-[10px] text-slate-500 font-bold block uppercase">Active Dispatches</span>
                  <strong className="text-lg sm:text-xl text-orangeSecondary font-black">{activeJobs.length}</strong>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-neutral-800 col-span-2 sm:col-span-1">
                  <span className="text-[10px] text-slate-500 font-bold block uppercase">Completed Jobs</span>
                  <strong className="text-lg sm:text-xl text-blue-600 dark:text-blue-400 font-black">{completedJobs.length}</strong>
                </div>
              </div>
            </div>

            {/* Broadcast Alerts Widget for Partners */}
            {partnerNotifications.length > 0 && (
              <div className="web-card p-5 bg-white dark:bg-[#1A1A1A] border border-orangeSecondary/30 rounded-2xl shadow-lg space-y-3">
                <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-neutral-800">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-orangeSecondary animate-pulse" />
                    <h3 className="text-xs font-black uppercase tracking-wider text-orangeSecondary">
                      Broadcast Alerts ({partnerNotifications.length})
                    </h3>
                  </div>

                  <button
                    type="button"
                    onClick={handleClearAllPartnerNotifs}
                    className="text-[11px] font-bold text-slate-500 hover:text-rose-500 transition"
                  >
                    Clear All
                  </button>
                </div>

                <div className="space-y-2">
                  {partnerNotifications.map((notif) => (
                    <div key={notif.id} className="p-3.5 rounded-xl bg-orangeSecondary/10 border border-orangeSecondary/20 flex justify-between items-start gap-3">
                      <div className="space-y-1">
                        <strong className="text-xs font-extrabold text-slate-900 dark:text-white block">{notif.title}</strong>
                        <p className="text-xs text-slate-600 dark:text-slate-300">{notif.body}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDismissSinglePartnerNotif(notif.id)}
                        className="text-slate-400 hover:text-rose-500 p-1 rounded"
                        title="Dismiss Alert"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Sub-Navigation Tabs */}
            <div className="flex border-b border-slate-200 dark:border-neutral-800">
              <button
                onClick={() => setActiveSubTab(0)}
                className={`flex-1 py-3 text-center text-xs font-black border-b-2 transition ${
                  activeSubTab === 0 ? 'border-b-orangeSecondary text-orangeSecondary' : 'border-b-transparent text-slate-500 dark:text-slate-400'
                }`}
              >
                Active Dispatches ({activeJobs.length})
              </button>

              <button
                onClick={() => setActiveSubTab(1)}
                className={`flex-1 py-3 text-center text-xs font-black border-b-2 transition ${
                  activeSubTab === 1 ? 'border-b-orangeSecondary text-orangeSecondary' : 'border-b-transparent text-slate-500 dark:text-slate-400'
                }`}
              >
                Job History ({completedJobs.length})
              </button>

              <button
                onClick={() => setActiveSubTab(2)}
                className={`flex-1 py-3 text-center text-xs font-black border-b-2 transition ${
                  activeSubTab === 2 ? 'border-b-orangeSecondary text-orangeSecondary' : 'border-b-transparent text-slate-500 dark:text-slate-400'
                }`}
              >
                Partner Profile Credentials
              </button>
            </div>

            {/* TAB 0: ACTIVE DISPATCHES */}
            {activeSubTab === 0 && (
              <div className="space-y-4">
                {activeJobs.length === 0 ? (
                  <div className="web-card py-16 text-center text-slate-500 space-y-2 border-dashed">
                    <Bike className="w-12 h-12 mx-auto text-slate-400 opacity-40 mb-2" />
                    <p className="text-sm font-bold">No active dispatches assigned to you right now.</p>
                    <p className="text-xs text-slate-400">Keep your duty status ONLINE 🟢 to receive new orders!</p>
                  </div>
                ) : (
                  activeJobs.map((job) => {
                    const statusUpper = (job.status || 'ASSIGNED').toUpperCase();
                    return (
                      <div key={job.id} className="web-card p-5 bg-white dark:bg-[#1A1A1A] border border-slate-200 dark:border-[#333333] rounded-2xl shadow-xl space-y-4">
                        <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-neutral-800">
                          <div>
                            <span className="text-[10px] font-black uppercase text-orangeSecondary">Ref: {job.bookingRef || job.id}</span>
                            <h3 className="text-base font-extrabold text-slate-900 dark:text-white mt-0.5">{job.serviceTitle}</h3>
                          </div>
                          <span className="px-3 py-1 rounded-full text-xs font-black bg-orangeSecondary/20 text-orangeSecondary">
                            {statusUpper}
                          </span>
                        </div>

                        <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-neutral-900 p-4 rounded-xl border border-slate-200 dark:border-neutral-800">
                          <p>Customer: <strong className="text-slate-900 dark:text-white">{job.userName}</strong> ({job.customerPhone || job.userPhone})</p>
                          <p>Address: <strong className="text-slate-900 dark:text-white">{job.address}</strong></p>
                          <p>Schedule: <strong className="text-slate-900 dark:text-white">{job.scheduledDate} ({job.scheduledTimeSlot})</strong></p>
                          <p className="border-t border-slate-200 dark:border-neutral-800 pt-2 text-sm font-black text-emerald-600 dark:text-emerald-500">Collect Payable Amount: ₹{job.totalAmount}</p>
                        </div>

                        {/* Partner Action Workflow Buttons */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => handleUpdateJobStatus(job.id, 'ON_THE_WAY', `Mistri ${currentUser.fullName} is on the way to your location!`)}
                            disabled={statusUpper === 'ON_THE_WAY' || statusUpper === 'IN_PROGRESS'}
                            className={`py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                              statusUpper === 'ON_THE_WAY' || statusUpper === 'IN_PROGRESS'
                                ? 'bg-slate-200 dark:bg-neutral-800 text-slate-400 cursor-not-allowed'
                                : 'bg-blue-600 hover:bg-blue-700 text-white'
                            }`}
                          >
                            <Bike className="w-3.5 h-3.5" /> On The Way
                          </button>

                          <button
                            type="button"
                            onClick={() => handleUpdateJobStatus(job.id, 'IN_PROGRESS', `Mistri ${currentUser.fullName} arrived and started service!`)}
                            disabled={statusUpper === 'IN_PROGRESS'}
                            className={`py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                              statusUpper === 'IN_PROGRESS'
                                ? 'bg-slate-200 dark:bg-neutral-800 text-slate-400 cursor-not-allowed'
                                : 'bg-amber-600 hover:bg-amber-700 text-white'
                            }`}
                          >
                            <Wrench className="w-3.5 h-3.5" /> Start Service
                          </button>

                          <button
                            type="button"
                            onClick={() => handleUpdateJobStatus(job.id, 'COMPLETED', `Service successfully completed by Mistri ${currentUser.fullName}!`)}
                            className="py-2.5 px-3 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition flex items-center justify-center gap-1.5 shadow-md"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" /> Mark Completed
                          </button>
                        </div>

                        {job.customerPhone && (
                          <a
                            href={`tel:${job.customerPhone}`}
                            className="w-full py-2.5 rounded-xl border border-slate-200 dark:border-neutral-700 bg-slate-50 dark:bg-neutral-900 text-xs font-bold text-center block text-emerald-600 dark:text-emerald-500 hover:underline"
                          >
                            <Phone className="w-3.5 h-3.5 inline mr-1" /> Call Customer ({job.customerPhone})
                          </a>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {/* TAB 1: COMPLETED HISTORY */}
            {activeSubTab === 1 && (
              <div className="space-y-4">
                {completedJobs.length === 0 ? (
                  <div className="web-card py-16 text-center text-slate-500 space-y-2 border-dashed">
                    <CheckCircle2 className="w-12 h-12 mx-auto text-slate-400 opacity-40 mb-2" />
                    <p className="text-sm font-bold">No completed jobs in your history yet.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {completedJobs.map((cJob) => (
                      <div key={cJob.id} className="web-card p-4 bg-white dark:bg-[#1A1A1A] border border-slate-200 dark:border-[#333333] rounded-2xl shadow-md flex justify-between items-center text-xs">
                        <div>
                          <strong className="text-sm font-extrabold text-slate-900 dark:text-white block">{cJob.serviceTitle}</strong>
                          <span className="text-slate-500">Ref: {cJob.bookingRef} | Customer: {cJob.userName}</span>
                        </div>
                        <div className="text-right">
                          <strong className="text-emerald-600 dark:text-emerald-500 font-black text-sm block">₹{cJob.totalAmount}</strong>
                          <span className="text-[10px] text-emerald-500 font-bold uppercase">✓ Completed</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: PARTNER PROFILE CREDENTIALS */}
            {activeSubTab === 2 && (
              <form onSubmit={handleSavePartnerProfile} className="web-card p-6 bg-white dark:bg-[#1A1A1A] border border-slate-200 dark:border-[#333333] rounded-2xl shadow-xl space-y-4">
                <div className="flex items-center gap-2 text-orangeSecondary border-b border-slate-100 dark:border-neutral-800 pb-3">
                  <User className="w-5 h-5 text-orangeSecondary" />
                  <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">Edit Partner Account Credentials</h2>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 block mb-1">Full Name *</label>
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      required
                      className="w-full p-3.5 rounded-xl border border-slate-300 dark:border-neutral-700 bg-slate-50 dark:bg-neutral-900 text-xs font-bold text-slate-900 dark:text-white outline-none focus:border-orangeSecondary"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 block mb-1">Mobile Number *</label>
                    <input
                      type="text"
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                      required
                      className="w-full p-3.5 rounded-xl border border-slate-300 dark:border-neutral-700 bg-slate-50 dark:bg-neutral-900 text-xs font-bold text-slate-900 dark:text-white outline-none focus:border-orangeSecondary"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 block mb-1">Skill Category *</label>
                    <input
                      type="text"
                      value={editSkill}
                      onChange={(e) => setEditSkill(e.target.value)}
                      placeholder="e.g. Electrician, Plumber, Home Tutor, Carpenter"
                      required
                      className="w-full p-3.5 rounded-xl border border-slate-300 dark:border-neutral-700 bg-slate-50 dark:bg-neutral-900 text-xs font-bold text-slate-900 dark:text-white outline-none focus:border-orangeSecondary"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSavingProfile}
                  className="btn-primary py-3 px-6 text-xs font-black shadow-lg bg-orangeSecondary hover:bg-orange-600"
                >
                  <Save className="w-4 h-4 inline mr-1" />
                  {isSavingProfile ? 'Saving...' : 'Save Partner Credentials'}
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
