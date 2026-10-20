import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { ref, onValue, update } from 'firebase/database';
import { rtdb } from '../../lib/firebase';
import { useAuth } from '../../lib/AuthContext';
import { HardHat, CheckCircle, Truck, DollarSign, Edit, Lock, LogIn, LogOut, Phone, MessageSquare, Handshake, Star, Briefcase, History, UserCheck } from 'lucide-react';

export default function PartnerDashboardPage() {
  const [isDark, setIsDark] = useState(true);
  const [activePartnerTab, setActivePartnerTab] = useState(0); // 0=Active Jobs, 1=Earnings & History, 2=Partner Profile ID
  const [bookings, setBookings] = useState([]);

  const { currentUser, logout, isAuthLoaded } = useAuth();

  // Partner State initialized from logged in user
  const [isOnline, setIsOnline] = useState(true);
  const [partnerName, setPartnerName] = useState('');
  const [partnerPhone, setPartnerPhone] = useState('');
  const [partnerEmail, setPartnerEmail] = useState('');
  const [partnerSkill, setPartnerSkill] = useState('');

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
    if (currentUser) {
      setPartnerName(currentUser.fullName || 'Partner');
      setPartnerPhone(currentUser.phoneNumber || '');
      setPartnerEmail(currentUser.email || '');
      setPartnerSkill(currentUser.skillCategory || 'Mobile Application Developer');
      setIsOnline(currentUser.isOnline !== false);

      // Listen to real-time user updates from Firebase
      const userRef = ref(rtdb, `users/${currentUser.id}`);
      const unsubUser = onValue(userRef, (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.val();
          setPartnerName(data.fullName || currentUser.fullName || 'Partner');
          setPartnerPhone(data.phoneNumber || currentUser.phoneNumber || '');
          setPartnerEmail(data.email || currentUser.email || '');
          setPartnerSkill(data.skillCategory || currentUser.skillCategory || 'Mobile Application Developer');
          setIsOnline(data.isOnline !== false);
        }
      });

      return () => unsubUser();
    }
  }, [currentUser]);

  useEffect(() => {
    const bookingsRef = ref(rtdb, 'bookings');
    const unsubscribe = onValue(bookingsRef, (snapshot) => {
      const list = [];
      if (snapshot.exists()) {
        snapshot.forEach((child) => {
          list.push({ id: child.key, ...child.val() });
        });
      }
      setBookings(list);
    });

    return () => unsubscribe();
  }, []);

  const handleToggleOnline = (e) => {
    const nextVal = e.target.checked;
    setIsOnline(nextVal);
    if (currentUser) {
      update(ref(rtdb, `users/${currentUser.id}`), { isOnline: nextVal });
    }
  };

  const handleUpdateStatus = (id, newStatus, trackingText) => {
    update(ref(rtdb, `bookings/${id}`), {
      status: newStatus,
      trackingStatus: trackingText
    });
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    if (!currentUser) return;
    update(ref(rtdb, `users/${currentUser.id}`), {
      fullName: partnerName,
      phoneNumber: partnerPhone,
      email: partnerEmail,
      skillCategory: partnerSkill
    }).then(() => {
      alert('Partner Profile ID credentials updated in Firebase Database!');
    });
  };

  const isPartner = currentUser && (currentUser.role === 'PARTNER' || currentUser.role === 'ADMIN');
  const partnerNameRef = currentUser?.fullName || partnerName || 'Dhiraj Jaiswal';

  // Filter jobs assigned to this partner
  const assignedJobs = bookings.filter(b =>
    b.assignedPartnerId === currentUser?.id ||
    (b.assignedPartnerName && b.assignedPartnerName.toLowerCase() === partnerNameRef.toLowerCase())
  );

  const completedJobs = assignedJobs.filter(b => b.status === 'COMPLETED');
  const activeJobs = assignedJobs.filter(b => b.status !== 'COMPLETED' && b.status !== 'CANCELLED' && b.status !== 'REJECTED');

  const totalGrossRevenue = completedJobs.reduce((sum, b) => sum + (b.totalAmount || 0), 0);
  const netPartnerEarnings = totalGrossRevenue * 0.80; // 80% partner share

  return (
    <div className="flex flex-col min-h-screen">
      <Header isDark={isDark} onToggleTheme={toggleTheme} currentUser={currentUser} />

      <main className="web-container py-8 flex-1 max-w-4xl mx-auto space-y-6">
        {!isAuthLoaded ? (<div className="web-card text-center py-16 text-slate-500">Loading secure session...</div>) : !isPartner ? (
          <div className="web-card text-center py-16 max-w-lg mx-auto space-y-4 shadow-xl">
            <Lock className="w-16 h-16 text-redPrimary mx-auto" />
            <h2 className="text-2xl font-black">Partner Access Restricted</h2>
            <p className="text-xs text-slate-500">Sign in with Service Partner credentials to access the Partner Dashboard.</p>
            <Link href="/auth" className="btn-primary inline-flex">
              <LogIn className="w-4 h-4" /> Sign In as Partner
            </Link>
          </div>
        ) : (
          <>
            {/* Top Bar Header Banner (Matching Mobile App Top Bar) */}
            <div className="web-card bg-redPrimary text-white flex justify-between items-center p-5 shadow-xl border-none">
              <h1 className="text-xl sm:text-2xl font-black tracking-wide">
                Partner Panel: {partnerNameRef}
              </h1>

              <div className="flex items-center gap-3">
                <button onClick={logout} className="bg-white/20 hover:bg-white/30 text-white p-2.5 rounded-xl transition">
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Overview Card (Exact Replica of Mobile App Design) */}
            <div className="web-card bg-[#1E1E1E] border border-neutral-800 rounded-2xl p-6 shadow-2xl space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-redPrimary text-white flex items-center justify-center shrink-0 shadow-md">
                    <Handshake className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-white leading-tight">{partnerNameRef}</h2>
                    <p className="text-xs font-black text-redPrimary mt-0.5">Skill: {partnerSkill}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`text-xs font-black uppercase tracking-wider ${isOnline ? 'text-emerald-500' : 'text-slate-500'}`}>
                    {isOnline ? 'ONLINE' : 'OFFLINE'}
                  </span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isOnline}
                      onChange={handleToggleOnline}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-neutral-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                  </label>
                </div>
              </div>

              {/* 3 Metric Cards */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-[#262626] border border-neutral-800 p-3.5 rounded-xl text-center">
                  <span className="text-[10px] font-bold text-slate-400 block mb-1">Net Earnings (80%)</span>
                  <strong className="text-lg font-black text-emerald-500">₹{netPartnerEarnings}</strong>
                </div>

                <div className="bg-[#262626] border border-neutral-800 p-3.5 rounded-xl text-center">
                  <span className="text-[10px] font-bold text-slate-400 block mb-1">Completed</span>
                  <strong className="text-lg font-black text-blue-400">{completedJobs.length}</strong>
                </div>

                <div className="bg-[#262626] border border-neutral-800 p-3.5 rounded-xl text-center">
                  <span className="text-[10px] font-bold text-slate-400 block mb-1">Rating</span>
                  <strong className="text-lg font-black text-amber-400">4.9 ★</strong>
                </div>
              </div>
            </div>

            {/* 3 Navigation Tabs Below Header Card */}
            <div className="flex border-b border-neutral-800 gap-2 overflow-x-auto">
              {[
                { id: 0, label: `Active Jobs (${activeJobs.length})` },
                { id: 1, label: `Earnings & History (${completedJobs.length})` },
                { id: 2, label: 'Partner Profile ID' }
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setActivePartnerTab(t.id)}
                  className={`py-3 px-5 text-xs font-black border-b-2 transition whitespace-nowrap ${
                    activePartnerTab === t.id
                      ? 'border-b-redPrimary text-redPrimary'
                      : 'border-b-transparent text-slate-400 hover:text-white'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* TAB 0: ACTIVE DISPATCHED JOBS */}
            {activePartnerTab === 0 && (
              <div>
                {activeJobs.length === 0 ? (
                  <div className="web-card py-20 text-center text-slate-500 space-y-3">
                    <Briefcase className="w-14 h-14 mx-auto text-slate-600 opacity-40" />
                    <h3 className="text-base font-black text-slate-400">No active job requests right now.</h3>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto">New job dispatches from Gangtok customers will appear here automatically.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {activeJobs.map((b) => (
                      <div key={b.id} className="web-card space-y-4 shadow-xl border-t-4 border-t-redPrimary">
                        <div className="flex justify-between items-center pb-3 border-b border-neutral-800">
                          <span className="font-bold text-xs text-slate-400">{b.bookingRef || b.id}</span>
                          <span className="px-3 py-1 rounded-full text-[10px] font-black bg-blue-500/20 text-blue-400 uppercase tracking-wider">{b.status}</span>
                        </div>

                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-black text-lg text-white">{b.serviceTitle} <span className="text-xs text-slate-400 font-bold ml-1">(Qty: {b.quantity || 1})</span></h3>
                            <p className="text-xs font-medium text-slate-300 mt-1">Address: {b.address}</p>
                            <p className="text-xs text-redPrimary font-bold mt-1">Scheduled: {b.scheduledDate} | {b.scheduledTimeSlot}</p>
                          </div>
                          <div className="text-right">
                            <span className="block text-[10px] font-bold text-slate-400 uppercase">Collect Payment</span>
                            <span className="text-2xl font-black text-emerald-500">₹{b.totalAmount}</span>
                          </div>
                        </div>

                        {/* Live Status Bar */}
                        <div className="p-3 rounded-xl bg-orangeSecondary/10 border border-orangeSecondary/20 flex items-center gap-2">
                          <span className="relative flex h-2.5 w-2.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orangeSecondary opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-orangeSecondary"></span>
                          </span>
                          <span className="text-xs font-bold text-orangeSecondary">Live Status: {b.trackingStatus || 'Assigned to Partner'}</span>
                        </div>

                        {/* Customer Contact Buttons */}
                        <div className="flex gap-3 pt-1">
                          <a href={`tel:${b.customerPhone || b.userPhone}`} className="btn-outline flex-1 text-center py-2.5 text-xs border-emerald-600/30 text-emerald-500 hover:bg-emerald-600/10">
                            <Phone className="w-3.5 h-3.5 inline mr-1" /> Call Customer
                          </a>
                          <a href={`https://wa.me/${(b.customerPhone || b.userPhone || '').replace('+', '')}`} target="_blank" rel="noreferrer" className="btn-outline flex-1 text-center py-2.5 text-xs border-emerald-600/30 text-emerald-500 hover:bg-emerald-600/10">
                            <MessageSquare className="w-3.5 h-3.5 inline mr-1" /> WhatsApp
                          </a>
                        </div>

                        {/* Lifecycle Progression Buttons */}
                        <div className="pt-2">
                          {(b.status === 'ASSIGNED' || b.status === 'CONFIRMED') && (
                            <button onClick={() => handleUpdateStatus(b.id, 'ON_THE_WAY', `Mistri ${partnerNameRef} accepted job & is on the way`)} className="btn-primary w-full py-3 text-xs font-bold shadow-lg">
                              Accept Job - On The Way
                            </button>
                          )}
                          {b.status === 'ON_THE_WAY' && (
                            <button onClick={() => handleUpdateStatus(b.id, 'IN_PROGRESS', `Mistri ${partnerNameRef} arrived at doorstep & started work`)} className="btn-orange w-full py-3 text-xs font-bold shadow-lg">
                              I Have Arrived
                            </button>
                          )}
                          {b.status === 'IN_PROGRESS' && (
                            <button onClick={() => handleUpdateStatus(b.id, 'COMPLETED', 'Service work completed successfully & payment collected!')} className="btn-green w-full py-3 text-xs font-bold shadow-lg">
                              Mark Work Finished
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 1: EARNINGS & HISTORY */}
            {activePartnerTab === 1 && (
              <div className="space-y-4">
                <h3 className="font-extrabold text-base flex items-center gap-2 text-emerald-500">
                  <History className="w-5 h-5" /> Completed Jobs & Net Earnings History ({completedJobs.length})
                </h3>

                {completedJobs.length === 0 ? (
                  <div className="web-card py-16 text-center text-slate-500">
                    <DollarSign className="w-12 h-12 mx-auto mb-2 text-slate-600 opacity-40" />
                    <p className="text-xs font-bold">No completed jobs yet.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {completedJobs.map((b) => (
                      <div key={b.id} className="web-card flex justify-between items-center p-4">
                        <div>
                          <strong className="block text-sm font-bold text-white">{b.serviceTitle}</strong>
                          <span className="text-xs text-slate-400">Ref: {b.bookingRef || b.id} • {b.scheduledDate}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-black text-emerald-500">+₹{ (b.totalAmount || 0) * 0.80 }</span>
                          <span className="block text-[10px] text-slate-500">Gross: ₹{b.totalAmount}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: PARTNER PROFILE ID */}
            {activePartnerTab === 2 && (
              <form onSubmit={handleSaveProfile} className="web-card space-y-4">
                <h3 className="font-extrabold text-base text-redPrimary">Edit Partner Profile ID Credentials</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-1">Full Name</label>
                    <input type="text" value={partnerName} onChange={(e) => setPartnerName(e.target.value)} className="w-full p-3 rounded-lg border border-neutral-700 bg-neutral-800 text-white text-sm font-semibold" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-1">Mobile Number</label>
                    <input type="text" value={partnerPhone} onChange={(e) => setPartnerPhone(e.target.value)} className="w-full p-3 rounded-lg border border-neutral-700 bg-neutral-800 text-white text-sm font-semibold" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-1">Email Address</label>
                    <input type="text" value={partnerEmail} onChange={(e) => setPartnerEmail(e.target.value)} className="w-full p-3 rounded-lg border border-neutral-700 bg-neutral-800 text-white text-sm font-semibold" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-1">Skill Category</label>
                    <input type="text" value={partnerSkill} onChange={(e) => setPartnerSkill(e.target.value)} className="w-full p-3 rounded-lg border border-neutral-700 bg-neutral-800 text-white text-sm font-semibold" />
                  </div>
                </div>
                <button type="submit" className="btn-primary w-full py-3 shadow-lg">
                  Save Profile ID Credentials to Firebase
                </button>
              </form>
            )}
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
