import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { ref, onValue, update } from 'firebase/database';
import { rtdb } from '../../lib/firebase';
import { useAuth } from '../../lib/AuthContext';
import { HardHat, CheckCircle, Truck, DollarSign, Edit, Lock, LogIn, LogOut, Phone, MessageSquare, DirectionsRun } from 'lucide-react';

export default function PartnerDashboardPage() {
  const [isDark, setIsDark] = useState(true);
  const [bookings, setBookings] = useState([]);
  const [isEditing, setIsEditing] = useState(false);

  const { currentUser, logout, isAuthLoaded } = useAuth();

  const [partnerName, setPartnerName] = useState('Piku');
  const [partnerPhone, setPartnerPhone] = useState('+919564111224');
  const [partnerEmail, setPartnerEmail] = useState('piku@himistri.com');
  const [partnerSkill, setPartnerSkill] = useState('Home Tutor');

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.setAttribute('data-theme', !isDark ? 'dark' : 'light');
  };

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

  const handleUpdateStatus = (id, newStatus, trackingText) => {
    update(ref(rtdb, `bookings/${id}`), {
      status: newStatus,
      trackingStatus: trackingText
    });
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    update(ref(rtdb, `users/${currentUser?.id || 'NvEip3MgEgPoefVOVKnnOEQZzm72'}`), {
      fullName: partnerName,
      phoneNumber: partnerPhone,
      email: partnerEmail,
      skillCategory: partnerSkill
    }).then(() => {
      alert('Partner Profile ID updated in Firebase Database!');
      setIsEditing(false);
    });
  };

  const isPartner = currentUser && (currentUser.role === 'PARTNER' || currentUser.role === 'ADMIN');
  const partnerNameRef = currentUser?.fullName || partnerName;

  const completedJobs = bookings.filter(b => b.status === 'COMPLETED' && (b.assignedPartnerName === partnerNameRef || b.assignedPartnerId === currentUser?.id));
  const totalRevenue = completedJobs.reduce((sum, b) => sum + (b.totalAmount || 0), 0);
  const partnerNetShare = totalRevenue * 0.80;

  const partnerActiveJobs = bookings.filter(b =>
    (b.assignedPartnerName === partnerNameRef || b.assignedPartnerId === currentUser?.id) &&
    (b.status === 'ASSIGNED' || b.status === 'ON_THE_WAY' || b.status === 'IN_PROGRESS')
  );

  return (
    <div className="flex flex-col min-h-screen">
      <Header isDark={isDark} onToggleTheme={toggleTheme} />

      <main className="web-container py-10 flex-1 max-w-5xl mx-auto space-y-6">
        {!isAuthLoaded ? (<div className="web-card text-center py-16 text-slate-500">Loading secure session...</div>) : !isPartner ? (
          <div className="web-card text-center py-16 max-w-lg mx-auto space-y-4">
            <Lock className="w-16 h-16 text-redPrimary mx-auto" />
            <h2 className="text-2xl font-black">Partner Access Restricted</h2>
            <p className="text-xs text-slate-500">Sign in with Service Partner credentials to access the Partner Dashboard.</p>
            <Link href="/auth" className="btn-primary inline-flex">
              <LogIn className="w-4 h-4" /> Sign In as Partner
            </Link>
          </div>
        ) : (
          <>
            {/* Partner Profile & Earnings Header */}
            <div className="web-card flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-orangeSecondary/15 to-transparent border border-orangeSecondary/30">
              <div>
                <div className="flex items-center gap-2">
                  <HardHat className="w-6 h-6 text-redPrimary" />
                  <h1 className="text-2xl font-black">{partnerNameRef}</h1>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-600/15 text-emerald-600">🟢 VERIFIED PARTNER (ONLINE)</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Skill Category: {currentUser?.skillCategory || partnerSkill} | Mobile: {currentUser?.phoneNumber || partnerPhone}</p>
              </div>

              <div className="flex flex-wrap items-center gap-4">
                <div className="text-right">
                  <span className="text-xs text-slate-500 font-bold">Net Partner Share (80%)</span>
                  <p className="text-2xl font-black text-emerald-600">₹{partnerNetShare}</p>
                </div>
                <button onClick={() => setIsEditing(!isEditing)} className="btn-outline hover:border-redPrimary text-xs shadow-sm transition">
                  <Edit className="w-3.5 h-3.5 inline mr-1" /> Edit Profile ID
                </button>
                <button onClick={logout} className="btn-primary bg-redPrimary hover:bg-redDark text-xs py-2.5 px-4 shadow">
                  <LogOut className="w-4 h-4 inline mr-1" /> Log Out
                </button>
              </div>
            </div>

            {/* Edit Profile Form */}
            {isEditing && (
              <form onSubmit={handleSaveProfile} className="web-card space-y-4">
                <h3 className="font-extrabold text-base text-redPrimary">Edit Partner Profile ID Credentials</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">Full Name</label>
                    <input type="text" value={partnerName} onChange={(e) => setPartnerName(e.target.value)} className="w-full p-3 rounded-lg border border-slate-200 dark:border-neutral-700 bg-slate-100 dark:bg-neutral-800 text-sm font-semibold" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">Mobile Number</label>
                    <input type="text" value={partnerPhone} onChange={(e) => setPartnerPhone(e.target.value)} className="w-full p-3 rounded-lg border border-slate-200 dark:border-neutral-700 bg-slate-100 dark:bg-neutral-800 text-sm font-semibold" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">Email Address</label>
                    <input type="text" value={partnerEmail} onChange={(e) => setPartnerEmail(e.target.value)} className="w-full p-3 rounded-lg border border-slate-200 dark:border-neutral-700 bg-slate-100 dark:bg-neutral-800 text-sm font-semibold" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">Skill Category</label>
                    <input type="text" value={partnerSkill} onChange={(e) => setPartnerSkill(e.target.value)} className="w-full p-3 rounded-lg border border-slate-200 dark:border-neutral-700 bg-slate-100 dark:bg-neutral-800 text-sm font-semibold" />
                  </div>
                </div>
                <button type="submit" className="btn-primary w-full py-3 shadow-lg">Save Profile ID Credentials to Firebase</button>
              </form>
            )}

            {/* Active Dispatched Jobs */}
            <div>
              <h2 className="text-xl font-black mb-1">Active Dispatched Job Requests</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Accept jobs, update arrival status & collect cash payment upon completion</p>

              {partnerActiveJobs.length === 0 ? (
                <div className="web-card py-16 text-center text-slate-500 border-dashed">
                  <HardHat className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p className="text-sm font-bold">No active job requests right now.</p>
                  <p className="text-xs mt-1">New job dispatches from Gangtok customers will appear here automatically.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {partnerActiveJobs.map((b) => (
                    <div key={b.id} className="web-card space-y-4 shadow-md hover:border-redPrimary transition">
                      <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-neutral-800">
                        <span className="font-bold text-sm text-slate-500">Ref ID: <strong className="text-slate-800 dark:text-slate-200">{b.bookingRef || b.id}</strong></span>
                        <span className="px-3 py-1 rounded-full text-xs font-black bg-blue-500/15 text-blue-500 uppercase tracking-wider">{b.status}</span>
                      </div>

                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-black text-xl mb-1">{b.serviceTitle} <span className="text-xs text-slate-500 font-bold ml-1">(Qty: {b.quantity || 1})</span></h3>
                          <p className="text-sm font-bold text-slate-700 dark:text-slate-300">Address: {b.address}</p>
                          <p className="text-xs text-redPrimary font-bold mt-1">Scheduled: {b.scheduledDate} | {b.scheduledTimeSlot}</p>
                        </div>
                        <div className="text-right">
                          <span className="block text-xs font-bold text-slate-500">Collect Payment</span>
                          <span className="text-2xl font-black text-emerald-600">₹{b.totalAmount}</span>
                          <span className="block text-[10px] font-extrabold uppercase text-emerald-600 mt-0.5">{b.paymentMethod === 'CASH_ON_DELIVERY' ? 'CASH (COD)' : 'ONLINE'}</span>
                        </div>
                      </div>

                      <div className="p-3 rounded-xl bg-orangeSecondary/10 border border-orangeSecondary/20 flex items-center gap-2">
                         <span className="relative flex h-3 w-3">
                           <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orangeSecondary opacity-75"></span>
                           <span className="relative inline-flex rounded-full h-3 w-3 bg-orangeSecondary"></span>
                         </span>
                        <span className="text-xs font-bold text-orangeSecondary">Live Status: {b.trackingStatus || 'Assigned to Partner'}</span>
                      </div>

                      {/* Contact Actions */}
                      <div className="flex flex-wrap gap-3 pt-1">
                        <a href={`tel:${b.customerPhone}`} className="btn-outline flex-1 text-center py-2 text-xs border-emerald-600/30 text-emerald-600 hover:bg-emerald-600/10">
                          <Phone className="w-3.5 h-3.5 inline mr-1" /> Call Customer
                        </a>
                        <a href={`https://wa.me/${b.customerPhone?.replace('+', '')}`} target="_blank" rel="noreferrer" className="btn-outline flex-1 text-center py-2 text-xs border-emerald-600/30 text-emerald-600 hover:bg-emerald-600/10">
                          <MessageSquare className="w-3.5 h-3.5 inline mr-1" /> WhatsApp
                        </a>
                      </div>

                      {/* Job Progress Actions */}
                      <div className="flex flex-col sm:flex-row gap-3 pt-2">
                        {b.status === 'ASSIGNED' && (
                          <button onClick={() => handleUpdateStatus(b.id, 'ON_THE_WAY', `Mistri ${partnerNameRef} accepted job & is on the way`)} className="btn-primary flex-1 py-3.5 text-sm shadow-md">
                            <Truck className="w-4 h-4" /> Accept Job - On The Way
                          </button>
                        )}
                        {b.status === 'ON_THE_WAY' && (
                          <button onClick={() => handleUpdateStatus(b.id, 'IN_PROGRESS', `Mistri ${partnerNameRef} arrived at doorstep & started work`)} className="btn-orange flex-1 py-3.5 text-sm shadow-md">
                            <HardHat className="w-4 h-4" /> I Have Arrived
                          </button>
                        )}
                        {(b.status === 'IN_PROGRESS' || b.status === 'ON_THE_WAY') && (
                          <button onClick={() => handleUpdateStatus(b.id, 'COMPLETED', 'Service work completed successfully & payment collected!')} className="btn-green flex-1 py-3.5 text-sm shadow-md">
                            <CheckCircle className="w-4 h-4" /> Mark Work Finished
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
