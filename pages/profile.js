import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import PopupModal from '../components/PopupModal';
import { ref, onValue, update, push, remove, set } from 'firebase/database';
import { rtdb } from '../lib/firebase';
import { useAuth } from '../lib/AuthContext';
import { UserCircle, MapPin, Save, Plus, Trash2, Lock, LogIn, Phone, Mail, User, ShoppingBag, ArrowRight, CheckCircle2, Clock, Edit, Award, Star } from 'lucide-react';
import Link from 'next/link';

export default function ProfilePage() {
  // Default Website Theme is Light Mode
  const [isDark, setIsDark] = useState(false);
  const { currentUser, isAuthLoaded } = useAuth();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [liveUser, setLiveUser] = useState(null);

  const [addresses, setAddresses] = useState([]);
  const [editingAddrId, setEditingAddrId] = useState(null);

  // Structured Address Form States
  const [addrHouseNo, setAddrHouseNo] = useState('');
  const [addrStreet, setAddrStreet] = useState('');
  const [addrLocality, setAddrLocality] = useState('');
  const [addrCity, setAddrCity] = useState('Gangtok');
  const [addrState, setAddrState] = useState('Sikkim');
  const [addrPincode, setAddrPincode] = useState('737101');
  const [addrType, setAddrType] = useState('Home');

  const [isSaving, setIsSaving] = useState(false);

  // Dynamic Popup Modal State
  const [popupState, setPopupState] = useState({ isOpen: false, title: '', message: '', type: 'success', onAction: null });

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
    setFullName(currentUser.fullName || '');
    setEmail(currentUser.email || '');
    setPhone(currentUser.phoneNumber || '');

    const userRef = ref(rtdb, `users/${currentUser.id}`);
    const unsubscribe = onValue(userRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        setLiveUser(data);
        setFullName(data.fullName || '');
        setEmail(data.email || '');
        setPhone(data.phoneNumber || '');

        if (data.addresses) {
          const addrList = [];
          Object.keys(data.addresses).forEach((key) => {
            addrList.push({ id: key, ...data.addresses[key] });
          });
          setAddresses(addrList);
        } else {
          setAddresses([]);
        }
      }
    });

    return () => unsubscribe();
  }, [currentUser]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!currentUser) return;

    setIsSaving(true);
    try {
      await update(ref(rtdb, `users/${currentUser.id}`), {
        fullName: fullName,
        email: email,
        phoneNumber: phone
      });

      setIsSaving(false);
      setPopupState({
        isOpen: true,
        title: 'Profile Updated',
        message: 'Your profile details have been saved successfully.',
        type: 'success'
      });
    } catch (err) {
      setIsSaving(false);
      setPopupState({
        isOpen: true,
        title: 'Update Failed',
        message: err.message,
        type: 'error'
      });
    }
  };

  const handleSaveAddress = async (e) => {
    e.preventDefault();
    if (!currentUser) return;

    if (!addrHouseNo || !addrStreet || !addrLocality) {
      setPopupState({
        isOpen: true,
        title: 'Address Required',
        message: 'House No, Street, and Locality are required for delivery.',
        type: 'error'
      });
      return;
    }

    const addrData = {
      type: addrType,
      houseNo: addrHouseNo,
      street: addrStreet,
      locality: addrLocality,
      city: addrCity,
      state: addrState,
      pincode: addrPincode
    };

    try {
      if (editingAddrId) {
        await update(ref(rtdb, `users/${currentUser.id}/addresses/${editingAddrId}`), addrData);
      } else {
        const newRef = push(ref(rtdb, `users/${currentUser.id}/addresses`));
        await set(newRef, { ...addrData, id: newRef.key });
      }

      setEditingAddrId(null);
      setAddrHouseNo('');
      setAddrStreet('');
      setAddrLocality('');

      setPopupState({
        isOpen: true,
        title: 'Address Saved',
        message: 'Service address updated in your profile book.',
        type: 'success'
      });
    } catch (err) {
      setPopupState({
        isOpen: true,
        title: 'Save Failed',
        message: err.message,
        type: 'error'
      });
    }
  };

  const handleDeleteAddress = async (addrId) => {
    if (!currentUser) return;
    try {
      await remove(ref(rtdb, `users/${currentUser.id}/addresses/${addrId}`));
    } catch (err) {
      console.error("Could not delete address:", err);
    }
  };

  // Helper to parse dates (handles both ISO strings from Web and dd/MM/yyyy from Android)
  const parseExpiryDate = (dateStr) => {
    if (!dateStr) return new Date(0);
    if (dateStr.includes('/')) {
      const parts = dateStr.split('/');
      if (parts.length === 3) return new Date(`${parts[2]}-${parts[1]}-${parts[0]}T23:59:59Z`);
    }
    return new Date(dateStr);
  };

  const isAmazeMember = liveUser?.subscriptionPlan && liveUser?.subscriptionPlan !== 'NONE' && parseExpiryDate(liveUser?.subscriptionExpiry) > new Date();

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-[#0F0F0F] text-slate-900 dark:text-white transition-colors duration-200">
      <Header isDark={isDark} onToggleTheme={toggleTheme} currentUser={currentUser} />

      <main className="web-container py-8 flex-1 max-w-4xl mx-auto space-y-6">
        {!isAuthLoaded ? (
          <div className="web-card text-center py-16 text-slate-500">Loading secure session...</div>
        ) : !currentUser ? (
          <div className="web-card text-center py-16 space-y-4 shadow-xl">
            <Lock className="w-16 h-16 text-redPrimary mx-auto" />
            <h2 className="text-2xl font-black">Login Required</h2>
            <p className="text-xs text-slate-500">Please sign in to manage your profile and saved service addresses.</p>
            <Link href="/auth?redirect=profile" className="btn-primary inline-flex mt-2">
              <LogIn className="w-4 h-4" /> Sign In / Register
            </Link>
          </div>
        ) : (
          <>
            {/* Top Red Header Banner */}
            <div className="bg-redPrimary text-white p-5 rounded-2xl shadow-xl flex justify-between items-center">
              <h1 className="text-2xl font-black tracking-wide">
                My Customer Profile
              </h1>
              <span className="text-xs font-bold bg-white/20 px-3 py-1 rounded-full uppercase">
                {currentUser.role || 'CUSTOMER'}
              </span>
            </div>

            {/* HiMistri Amaze Membership Card */}
            <div className="web-card p-6 bg-gradient-to-br from-amber-100 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/10 border border-amber-300 dark:border-amber-700/50 rounded-2xl shadow-xl space-y-4">
              <div className="flex items-center gap-2 text-amber-600 dark:text-amber-500 border-b border-amber-200 dark:border-amber-800/50 pb-3">
                <Award className="w-6 h-6" />
                <h2 className="text-lg font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">HiMistri Amaze Membership</h2>
              </div>

              {isAmazeMember ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full text-xs font-black uppercase bg-amber-500 text-white shadow-md flex items-center gap-1">
                      <Star className="w-3 h-3" /> Active Member
                    </span>
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Valid till: {parseExpiryDate(liveUser.subscriptionExpiry).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 dark:text-slate-300 font-bold">
                    Enjoy <strong className="text-emerald-600 dark:text-emerald-400">FREE Visiting Fees (₹0)</strong> on all your doorstep service bookings!
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full text-xs font-black uppercase bg-slate-200 dark:bg-neutral-800 text-slate-500">Not Subscribed</span>
                  </div>
                  <p className="text-xs text-slate-700 dark:text-slate-300 font-bold">
                    Join HiMistri Amaze during checkout to get <strong className="text-emerald-600 dark:text-emerald-400">FREE Visiting Fees (₹0)</strong> on all future orders!
                  </p>
                </div>
              )}
            </div>

            {/* Profile Credentials Form Card */}
            <form onSubmit={handleUpdateProfile} className="web-card p-6 bg-white dark:bg-[#1A1A1A] border border-slate-200 dark:border-[#333333] rounded-2xl shadow-xl space-y-4">
              <div className="flex items-center gap-2 text-redPrimary border-b border-slate-100 dark:border-neutral-800 pb-3">
                <UserCircle className="w-5 h-5 text-redPrimary" />
                <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">Personal Information</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 block mb-1">Full Name *</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    className="w-full p-3.5 rounded-xl border border-slate-300 dark:border-neutral-700 bg-slate-50 dark:bg-neutral-900 text-xs font-bold text-slate-900 dark:text-white outline-none focus:border-redPrimary"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 block mb-1">Mobile Number *</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    className="w-full p-3.5 rounded-xl border border-slate-300 dark:border-neutral-700 bg-slate-50 dark:bg-neutral-900 text-xs font-bold text-slate-900 dark:text-white outline-none focus:border-redPrimary"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 block mb-1">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-3.5 rounded-xl border border-slate-300 dark:border-neutral-700 bg-slate-50 dark:bg-neutral-900 text-xs font-bold text-slate-900 dark:text-white outline-none focus:border-redPrimary"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSaving}
                className="btn-primary py-3 px-6 text-xs font-black shadow-lg"
              >
                <Save className="w-4 h-4 inline mr-1" />
                {isSaving ? 'Saving Profile...' : 'Save Profile Details'}
              </button>
            </form>

            {/* Structured Address Book Management Card */}
            <div className="web-card p-6 bg-white dark:bg-[#1A1A1A] border border-slate-200 dark:border-[#333333] rounded-2xl shadow-xl space-y-4">
              <div className="flex items-center gap-2 text-redPrimary border-b border-slate-100 dark:border-neutral-800 pb-3">
                <MapPin className="w-5 h-5 text-redPrimary" />
                <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">Saved Address Book ({addresses.length})</h2>
              </div>

              {/* Add / Edit Address Structured Form */}
              <form onSubmit={handleSaveAddress} className="p-4 rounded-xl bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 space-y-3">
                <h3 className="text-xs font-extrabold text-redPrimary">{editingAddrId ? 'Edit Address' : '+ Add New Structured Address'}</h3>

                <div className="flex gap-2">
                  {['Home', 'Office', 'Other'].map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setAddrType(type)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-extrabold border transition ${
                        addrType === type ? 'bg-redPrimary text-white border-redPrimary' : 'bg-white dark:bg-neutral-800 border-slate-200 dark:border-neutral-700'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input type="text" value={addrHouseNo} onChange={(e) => setAddrHouseNo(e.target.value)} placeholder="House / Flat / Building Name *" required className="p-3 rounded-xl border border-slate-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-xs font-bold text-slate-900 dark:text-white outline-none focus:border-redPrimary" />
                  <input type="text" value={addrStreet} onChange={(e) => setAddrStreet(e.target.value)} placeholder="Street / Area Name *" required className="p-3 rounded-xl border border-slate-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-xs font-bold text-slate-900 dark:text-white outline-none focus:border-redPrimary" />
                  <input type="text" value={addrLocality} onChange={(e) => setAddrLocality(e.target.value)} placeholder="Locality / Landmark *" required className="p-3 rounded-xl border border-slate-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-xs font-bold text-slate-900 dark:text-white outline-none focus:border-redPrimary" />
                  <input type="text" value={addrCity} onChange={(e) => setAddrCity(e.target.value)} placeholder="City / Town *" required className="p-3 rounded-xl border border-slate-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-xs font-bold text-slate-900 dark:text-white outline-none focus:border-redPrimary" />
                  <input type="text" value={addrState} onChange={(e) => setAddrState(e.target.value)} placeholder="State *" required className="p-3 rounded-xl border border-slate-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-xs font-bold text-slate-900 dark:text-white outline-none focus:border-redPrimary" />
                  <input type="text" value={addrPincode} onChange={(e) => setAddrPincode(e.target.value)} placeholder="PIN Code *" required className="p-3 rounded-xl border border-slate-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-xs font-bold text-slate-900 dark:text-white outline-none focus:border-redPrimary" />
                </div>

                <div className="flex gap-2">
                  <button type="submit" className="btn-primary py-2.5 px-5 text-xs font-extrabold shadow-md">
                    {editingAddrId ? 'Update Address' : 'Save Address'}
                  </button>

                  {editingAddrId && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingAddrId(null);
                        setAddrHouseNo('');
                        setAddrStreet('');
                        setAddrLocality('');
                      }}
                      className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-neutral-700 text-xs font-bold hover:bg-slate-200 dark:hover:bg-neutral-800"
                    >
                      Cancel Edit
                    </button>
                  )}
                </div>
              </form>

              {/* Addresses Grid Display */}
              {addresses.length === 0 ? (
                <p className="text-xs text-slate-500 py-4 text-center">No addresses saved yet.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {addresses.map((addr) => (
                    <div key={addr.id} className="p-4 rounded-xl bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 space-y-2 relative group">
                      <div className="flex justify-between items-center">
                        <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase bg-redPrimary text-white">{addr.type || 'Home'}</span>
                        <div className="flex gap-1">
                          <button
                            onClick={() => {
                              setEditingAddrId(addr.id);
                              setAddrType(addr.type || 'Home');
                              setAddrHouseNo(addr.houseNo || '');
                              setAddrStreet(addr.street || '');
                              setAddrLocality(addr.locality || '');
                              setAddrCity(addr.city || 'Gangtok');
                              setAddrState(addr.state || 'Sikkim');
                              setAddrPincode(addr.pincode || '737101');
                            }}
                            className="p-1 rounded text-slate-400 hover:text-redPrimary"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteAddress(addr.id)}
                            className="p-1 rounded text-slate-400 hover:text-rose-500"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                        {addr.houseNo}, {addr.street}, {addr.locality}, {addr.city}, {addr.state} - {addr.pincode}
                      </p>
                    </div>
                  ))}
                </div>
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
