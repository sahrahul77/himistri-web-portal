import React, { useState, useEffect } from 'react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { ref, onValue, update } from 'firebase/database';
import { rtdb } from '../../lib/firebase';
import { HardHat, CheckCircle, Truck, DollarSign, UserCheck, Edit } from 'lucide-react';

export default function PartnerDashboardPage() {
  const [isDark, setIsDark] = useState(true);
  const [bookings, setBookings] = useState([]);
  const [isEditing, setIsEditing] = useState(false);

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
    update(ref(rtdb, 'users/NvEip3MgEgPoefVOVKnnOEQZzm72'), {
      fullName: partnerName,
      phoneNumber: partnerPhone,
      email: partnerEmail,
      skillCategory: partnerSkill
    }).then(() => {
      alert('Partner Profile ID updated in Firebase Database!');
      setIsEditing(false);
    });
  };

  const completedJobs = bookings.filter(b => b.status === 'COMPLETED');
  const totalRevenue = completedJobs.reduce((sum, b) => sum + (b.totalAmount || 0), 0);
  const partnerNetShare = totalRevenue * 0.80;

  const partnerActiveJobs = bookings.filter(b => b.assignedPartnerName === 'Piku' || b.status === 'ASSIGNED');

  return (
    <div className="flex flex-col min-h-screen">
      <Header isDark={isDark} onToggleTheme={toggleTheme} />

      <main className="web-container py-10 flex-1 max-w-5xl mx-auto space-y-6">
        {/* Partner Profile & Earnings Header */}
        <div className="web-card flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <HardHat className="w-6 h-6 text-redPrimary" />
              <h1 className="text-2xl font-black">{partnerName}</h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-600/15 text-emerald-600">VERIFIED PARTNER</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Skill Category: {partnerSkill} | Mobile: {partnerPhone}</p>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <span className="text-xs text-slate-500">Net Partner Share (80%)</span>
              <p className="text-2xl font-black text-emerald-600">₹{partnerNetShare}</p>
            </div>
            <button onClick={() => setIsEditing(!isEditing)} className="btn-outline text-xs">
              <Edit className="w-3.5 h-3.5 inline mr-1" /> Edit Profile ID
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
                <input type="text" value={partnerName} onChange={(e) => setPartnerName(e.target.value)} className="w-full p-3 rounded-lg border border-slate-200 dark:border-neutral-700 bg-slate-100 dark:bg-neutral-800 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Mobile Number</label>
                <input type="text" value={partnerPhone} onChange={(e) => setPartnerPhone(e.target.value)} className="w-full p-3 rounded-lg border border-slate-200 dark:border-neutral-700 bg-slate-100 dark:bg-neutral-800 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Email Address</label>
                <input type="text" value={partnerEmail} onChange={(e) => setPartnerEmail(e.target.value)} className="w-full p-3 rounded-lg border border-slate-200 dark:border-neutral-700 bg-slate-100 dark:bg-neutral-800 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Skill Category</label>
                <input type="text" value={partnerSkill} onChange={(e) => setPartnerSkill(e.target.value)} className="w-full p-3 rounded-lg border border-slate-200 dark:border-neutral-700 bg-slate-100 dark:bg-neutral-800 text-sm" />
              </div>
            </div>
            <button type="submit" className="btn-primary w-full py-3">Save Profile ID Credentials to Firebase</button>
          </form>
        )}

        {/* Active Dispatched Jobs */}
        <div>
          <h2 className="text-lg font-extrabold mb-1">Active Dispatched Job Requests</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Accept jobs, update arrival status & collect cash payment upon completion</p>

          {partnerActiveJobs.length === 0 ? (
            <p className="text-xs text-slate-500">No active job requests right now.</p>
          ) : (
            <div className="space-y-4">
              {partnerActiveJobs.map((b) => (
                <div key={b.id} className="web-card space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-sm">Ref ID: {b.bookingRef || b.id}</span>
                    <span className="px-2.5 py-1 rounded-full text-xs font-extrabold bg-blue-500/15 text-blue-500">{b.status}</span>
                  </div>
                  <h3 className="font-extrabold text-lg">{b.serviceTitle} (Collect ₹{b.totalAmount})</h3>
                  <p className="text-xs text-slate-500">Customer Address: {b.address}</p>
                  <div className="p-3 rounded-xl bg-orangeSecondary/10 text-orangeSecondary text-xs font-bold">
                    Live Status: {b.trackingStatus || 'Assigned to Partner'}
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button onClick={() => handleUpdateStatus(b.id, 'ON_THE_WAY', `Mistri ${partnerName} accepted job & is on the way`)} className="btn-primary flex-1">
                      <Truck className="w-4 h-4" /> Accept Job - On The Way
                    </button>
                    <button onClick={() => handleUpdateStatus(b.id, 'COMPLETED', 'Service work completed successfully!')} className="btn-green flex-1">
                      <CheckCircle className="w-4 h-4" /> Mark Work Finished
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
