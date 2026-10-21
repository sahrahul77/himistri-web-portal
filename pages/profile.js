import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { ref, onValue, update, push, remove, set } from 'firebase/database';
import { rtdb } from '../lib/firebase';
import { useAuth } from '../lib/AuthContext';
import { UserCircle, MapPin, Save, Plus, Trash2, Lock, LogIn, Phone, Mail, User, ShoppingBag, ArrowRight, CheckCircle2, Clock, Edit } from 'lucide-react';
import Link from 'next/link';

export default function ProfilePage() {
  const [isDark, setIsDark] = useState(true);
  const { currentUser, isAuthLoaded } = useAuth();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  const [addresses, setAddresses] = useState([]);
  const [editingAddrId, setEditingAddrId] = useState(null);

  // Structured Address Form States
  const [addrHouseNo, setAddrHouseNo] = useState('');
  const [addrStreet, setAddrStreet] = useState('');
  const [addrLocality, setAddrLocality] = useState('');
  const [addrCity, setAddrCity] = useState('Gangtok');
  const [addrState, setAddrState] = useState('Sikkim'); // Fixed
  const [addrPincode, setAddrPincode] = useState('737101');
  const [addrType, setAddrType] = useState('Home'); // Home, Work, Office, Other

  const [customerBookings, setCustomerBookings] = useState([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (currentUser) {
      // 1. Fetch User Profile & Saved Addresses
      const userRef = ref(rtdb, `users/${currentUser.id}`);
      const unsubUser = onValue(userRef, (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.val();
          setFullName(data.fullName || currentUser.fullName || '');
          setEmail(data.email || currentUser.email || '');
          setPhone(data.phoneNumber || currentUser.phoneNumber || '');

          if (data.addresses) {
            const addrs = Object.keys(data.addresses).map(key => ({
              id: key,
              ...data.addresses[key]
            }));
            setAddresses(addrs);
          } else {
            setAddresses([]);
          }
        }
      });

      // 2. Fetch Customer's Orders from Firebase
      const bookingsRef = ref(rtdb, 'bookings');
      const unsubBookings = onValue(bookingsRef, (snapshot) => {
        const list = [];
        if (snapshot.exists()) {
          snapshot.forEach((child) => {
            const b = { id: child.key, ...child.val() };
            const cleanUserPhone = (currentUser.phoneNumber || '').replace(/\D/g, '').slice(-10);
            const cleanCustPhone = (b.customerPhone || b.userPhone || '').replace(/\D/g, '').slice(-10);

            const phoneMatch = cleanUserPhone.length >= 10 && cleanCustPhone.length >= 10 && cleanUserPhone === cleanCustPhone;
            const idMatch = b.userId === currentUser.id;
            const nameMatch = currentUser.fullName && b.userName &&
              currentUser.fullName.trim().toLowerCase() === b.userName.trim().toLowerCase();

            if (idMatch || phoneMatch || nameMatch) {
              list.push(b);
            }
          });
        }
        setCustomerBookings(list);
      });

      return () => {
        unsubUser();
        unsubBookings();
      };
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

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!currentUser) return;
    setIsSaving(true);

    try {
      await update(ref(rtdb, `users/${currentUser.id}`), {
        fullName,
        email,
        phoneNumber: phone
      });
      alert('Profile details updated successfully in Firebase!');
    } catch (err) {
      alert('Error updating profile: ' + err.message);
    }
    setIsSaving(false);
  };

  const handleStartEditAddress = (addr) => {
    setEditingAddrId(addr.id);
    setAddrType(addr.title || 'Home');
    setAddrHouseNo(addr.houseNo || '');
    setAddrStreet(addr.streetAddress || addr.fullAddress || '');
    setAddrLocality(addr.locality || '');
    setAddrCity(addr.city || 'Gangtok');
    setAddrState('Sikkim');
    setAddrPincode(addr.pincode || '737101');
  };

  const handleResetAddressForm = () => {
    setEditingAddrId(null);
    setAddrType('Home');
    setAddrHouseNo('');
    setAddrStreet('');
    setAddrLocality('');
    setAddrCity('Gangtok');
    setAddrState('Sikkim');
    setAddrPincode('737101');
  };

  const handleSaveAddress = async (e) => {
    e.preventDefault();
    if (!currentUser) return;
    if (!addrStreet) return alert('Street Address / Locality is required.');

    const fullAddrStr = `${addrHouseNo ? addrHouseNo + ', ' : ''}${addrStreet}, ${addrLocality ? addrLocality + ', ' : ''}${addrCity || 'Gangtok'}, Sikkim. PIN: ${addrPincode || '737101'}`;

    const addrData = {
      title: addrType,
      houseNo: addrHouseNo,
      streetAddress: addrStreet,
      locality: addrLocality,
      city: addrCity || 'Gangtok',
      state: 'Sikkim',
      pincode: addrPincode || '737101',
      fullAddress: fullAddrStr,
      updatedAt: new Date().toISOString()
    };

    try {
      if (editingAddrId) {
        // Update Existing Address
        await update(ref(rtdb, `users/${currentUser.id}/addresses/${editingAddrId}`), addrData);
        alert('Address updated successfully in Firebase!');
      } else {
        // Add New Address
        const newRef = push(ref(rtdb, `users/${currentUser.id}/addresses`));
        await set(newRef, { ...addrData, createdAt: new Date().toISOString() });
        alert('New address saved to your profile!');
      }
      handleResetAddressForm();
    } catch (err) {
      alert('Failed to save address: ' + err.message);
    }
  };

  const handleDeleteAddress = async (addrId) => {
    if (confirm('Delete this saved address?')) {
      try {
        await remove(ref(rtdb, `users/${currentUser.id}/addresses/${addrId}`));
      } catch (err) {
        alert('Failed to delete address: ' + err.message);
      }
    }
  };

  const isLoggedIn = !!currentUser;
  const activeCount = customerBookings.filter(b => b.status !== 'COMPLETED' && b.status !== 'CANCELLED' && b.status !== 'REJECTED').length;
  const completedCount = customerBookings.filter(b => b.status === 'COMPLETED').length;

  return (
    <div className="flex flex-col min-h-screen">
      <Header isDark={isDark} onToggleTheme={toggleTheme} currentUser={currentUser} />

      <main className="web-container py-10 flex-1 max-w-3xl mx-auto w-full space-y-8">
        {!isAuthLoaded ? (<div className="web-card text-center py-16 text-slate-500">Loading secure session...</div>) : !isLoggedIn ? (
          <div className="web-card text-center py-16 space-y-4">
            <Lock className="w-16 h-16 text-redPrimary mx-auto" />
            <h2 className="text-2xl font-black">Login Required</h2>
            <p className="text-xs text-slate-500">Please sign in to view and edit your profile and saved addresses.</p>
            <Link href="/auth" className="btn-primary inline-flex mt-2">
              <LogIn className="w-4 h-4" /> Sign In / Register
            </Link>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-redPrimary/10 text-redPrimary">
                  <UserCircle className="w-8 h-8" />
                </div>
                <div>
                  <h1 className="text-3xl font-black">{fullName || currentUser.fullName}</h1>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Customer Account • {phone || currentUser.phoneNumber}</p>
                </div>
              </div>

              <Link href="/tracking" className="btn-primary py-2.5 px-4 text-xs">
                My Orders & Tracking <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Customer Orders Overview KPI Cards */}
            <div className="grid grid-cols-3 gap-4">
              <div className="web-card text-center p-4">
                <ShoppingBag className="w-5 h-5 text-redPrimary mx-auto mb-1" />
                <span className="text-[10px] font-bold text-slate-400 block uppercase">Total Orders</span>
                <strong className="text-xl font-black text-white">{customerBookings.length}</strong>
              </div>

              <div className="web-card text-center p-4">
                <Clock className="w-5 h-5 text-orangeSecondary mx-auto mb-1" />
                <span className="text-[10px] font-bold text-slate-400 block uppercase">Active Orders</span>
                <strong className="text-xl font-black text-orangeSecondary">{activeCount}</strong>
              </div>

              <div className="web-card text-center p-4">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 mx-auto mb-1" />
                <span className="text-[10px] font-bold text-slate-400 block uppercase">Completed</span>
                <strong className="text-xl font-black text-emerald-500">{completedCount}</strong>
              </div>
            </div>

            {/* Personal Details Form */}
            <form onSubmit={handleUpdateProfile} className="web-card space-y-5 shadow-xl">
              <h2 className="text-lg font-bold border-b border-slate-100 dark:border-neutral-800 pb-2">Personal Information</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 flex items-center gap-1.5 mb-1.5"><User className="w-3.5 h-3.5" /> Full Name</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full p-3.5 rounded-xl border border-slate-200 dark:border-neutral-700 bg-slate-50 dark:bg-neutral-800 text-sm font-semibold"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 flex items-center gap-1.5 mb-1.5"><Phone className="w-3.5 h-3.5" /> Mobile Number</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full p-3.5 rounded-xl border border-slate-200 dark:border-neutral-700 bg-slate-50 dark:bg-neutral-800 text-sm font-semibold"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="text-xs font-bold text-slate-500 flex items-center gap-1.5 mb-1.5"><Mail className="w-3.5 h-3.5" /> Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-3.5 rounded-xl border border-slate-200 dark:border-neutral-700 bg-slate-50 dark:bg-neutral-800 text-sm font-semibold"
                  />
                </div>
              </div>

              <button type="submit" disabled={isSaving} className="btn-primary w-full sm:w-auto py-3 px-6">
                <Save className="w-4 h-4" /> {isSaving ? 'Saving...' : 'Update Profile Details in Firebase'}
              </button>
            </form>

            {/* Address Book with Full Structured Editing */}
            <div className="web-card space-y-5 shadow-xl">
              <h2 className="text-lg font-bold border-b border-slate-100 dark:border-neutral-800 pb-2">Saved Addresses (Address Book)</h2>

              {addresses.length === 0 ? (
                <p className="text-xs text-slate-500 pb-2">No saved addresses. Add an address below for faster checkout.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {addresses.map((addr) => (
                    <div key={addr.id} className="p-4 rounded-xl border border-slate-200 dark:border-neutral-700 bg-slate-50 dark:bg-neutral-800 relative group flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <h4 className="font-extrabold text-redPrimary text-sm">{addr.title || 'Home'}</h4>
                        </div>
                        <p className="text-xs font-medium text-slate-700 dark:text-slate-300 leading-relaxed pr-6">{addr.fullAddress}</p>
                      </div>

                      <div className="flex gap-2 justify-end pt-3 mt-2 border-t border-slate-200 dark:border-neutral-700/60">
                        <button
                          type="button"
                          onClick={() => handleStartEditAddress(addr)}
                          className="bg-blue-600 hover:bg-blue-700 text-white text-[10px] px-2.5 py-1 rounded-lg font-extrabold flex items-center gap-1"
                        >
                          <Edit className="w-3 h-3" /> Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteAddress(addr.id)}
                          className="bg-rose-800 hover:bg-rose-900 text-white text-[10px] px-2.5 py-1 rounded-lg font-extrabold flex items-center gap-1"
                        >
                          <Trash2 className="w-3 h-3" /> Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Add / Edit Structured Address Form (Matching User Requirements 100%) */}
              <form onSubmit={handleSaveAddress} className="pt-4 border-t border-slate-100 dark:border-neutral-800 space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-extrabold text-sm text-redPrimary">
                    {editingAddrId ? '✏️ Edit Address Details' : '+ Add New Structured Address'}
                  </h3>
                  {editingAddrId && (
                    <button type="button" onClick={handleResetAddressForm} className="text-xs text-slate-400 hover:text-white underline">
                      Cancel Editing
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 dark:bg-neutral-900 p-4 rounded-2xl border border-slate-200 dark:border-neutral-800">

                  {/* Address Type */}
                  <div className="sm:col-span-2">
                    <label className="text-[11px] font-extrabold text-slate-400 block mb-1">Type of Address *</label>
                    <div className="flex gap-2">
                      {['Home', 'Work', 'Office', 'Other'].map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setAddrType(t)}
                          className={`px-3.5 py-1.5 rounded-lg text-xs font-extrabold border transition ${
                            addrType === t ? 'bg-redPrimary text-white border-redPrimary shadow-md' : 'bg-white dark:bg-neutral-800 text-slate-400 border-slate-200 dark:border-neutral-700'
                          }`}
                        >
                          {t === 'Home' ? '🏡 Home' : t === 'Work' ? '🏢 Work' : t === 'Office' ? '💼 Office' : '📍 Other'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* House No / Tower / Block */}
                  <div>
                    <label className="text-[11px] font-extrabold text-slate-400 block mb-1">House No. / Tower / Block</label>
                    <input
                      type="text"
                      value={addrHouseNo}
                      onChange={(e) => setAddrHouseNo(e.target.value)}
                      placeholder="e.g. Flat 4B / Block C"
                      className="w-full p-3 rounded-xl border border-slate-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-xs font-semibold"
                    />
                  </div>

                  {/* Address (Building, Street, Area) */}
                  <div>
                    <label className="text-[11px] font-extrabold text-slate-400 block mb-1">Address (Building, Street, Area) *</label>
                    <input
                      type="text"
                      value={addrStreet}
                      onChange={(e) => setAddrStreet(e.target.value)}
                      placeholder="e.g. Upper Syari, Deorali-Bazar *"
                      required
                      className="w-full p-3 rounded-xl border border-slate-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-xs font-semibold"
                    />
                  </div>

                  {/* Locality / Town */}
                  <div>
                    <label className="text-[11px] font-extrabold text-slate-400 block mb-1">Locality / Town</label>
                    <input
                      type="text"
                      value={addrLocality}
                      onChange={(e) => setAddrLocality(e.target.value)}
                      placeholder="e.g. Near ICDS Center"
                      className="w-full p-3 rounded-xl border border-slate-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-xs font-semibold"
                    />
                  </div>

                  {/* City / District */}
                  <div>
                    <label className="text-[11px] font-extrabold text-slate-400 block mb-1">City / District</label>
                    <input
                      type="text"
                      value={addrCity}
                      onChange={(e) => setAddrCity(e.target.value)}
                      placeholder="Gangtok"
                      className="w-full p-3 rounded-xl border border-slate-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-xs font-semibold"
                    />
                  </div>

                  {/* State (Fixed = Sikkim) */}
                  <div>
                    <label className="text-[11px] font-extrabold text-slate-400 block mb-1">State (Default Fixed)</label>
                    <input
                      type="text"
                      value={addrState}
                      disabled
                      className="w-full p-3 rounded-xl border border-slate-200 dark:border-neutral-700 bg-slate-200 dark:bg-neutral-950 text-slate-500 text-xs font-bold cursor-not-allowed"
                    />
                  </div>

                  {/* Pincode (Default = 737101) */}
                  <div>
                    <label className="text-[11px] font-extrabold text-slate-400 block mb-1">Pincode (Default: 737101)</label>
                    <input
                      type="text"
                      value={addrPincode}
                      onChange={(e) => setAddrPincode(e.target.value)}
                      placeholder="737101"
                      className="w-full p-3 rounded-xl border border-slate-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-xs font-semibold"
                    />
                  </div>
                </div>

                <button type="submit" className="btn-primary w-full py-3.5 text-xs font-extrabold rounded-xl shadow-lg">
                  <Plus className="w-4 h-4 inline mr-1" /> {editingAddrId ? 'Save Address Updates in Firebase' : 'Save Address to Firebase'}
                </button>
              </form>
            </div>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
