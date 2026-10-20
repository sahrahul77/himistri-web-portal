import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { ref, onValue, update, push, remove } from 'firebase/database';
import { rtdb } from '../lib/firebase';
import { useAuth } from '../lib/AuthContext';
import { UserCircle, MapPin, Save, Plus, Trash2, Lock, LogIn, Phone, Mail, User } from 'lucide-react';
import Link from 'next/link';

export default function ProfilePage() {
  const [isDark, setIsDark] = useState(true);
  const { currentUser, isAuthLoaded } = useAuth();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  const [addresses, setAddresses] = useState([]);
  const [newAddrTitle, setNewAddrTitle] = useState('Home');
  const [newAddrText, setNewAddrText] = useState('');
  const [newPincode, setNewPincode] = useState('737102');

  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (currentUser) {
      const userRef = ref(rtdb, `users/${currentUser.id}`);
      const unsub = onValue(userRef, (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.val();
          setFullName(data.fullName || '');
          setEmail(data.email || '');
          setPhone(data.phoneNumber || '');

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
      return () => unsub();
    }
  }, [currentUser]);

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.setAttribute('data-theme', !isDark ? 'dark' : 'light');
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
      alert('Profile details updated successfully in database!');
    } catch (err) {
      alert('Error updating profile: ' + err.message);
    }
    setIsSaving(false);
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    if (!currentUser) return;
    if (!newAddrText) return alert('Address details are required.');

    const newAddrObj = {
      title: newAddrTitle,
      fullAddress: `${newAddrText}, Pincode: ${newPincode}`,
      createdAt: new Date().toISOString()
    };

    try {
      const addrRef = ref(rtdb, `users/${currentUser.id}/addresses`);
      await push(addrRef, newAddrObj);
      setNewAddrText('');
      alert('Address saved to your profile!');
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

  return (
    <div className="flex flex-col min-h-screen">
      <Header isDark={isDark} onToggleTheme={toggleTheme} />

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
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-redPrimary/10 text-redPrimary">
                <UserCircle className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-3xl font-black">My Profile</h1>
                <p className="text-xs text-slate-500 dark:text-slate-400">Manage your personal details and address book</p>
              </div>
            </div>

            {/* Personal Details Form */}
            <form onSubmit={handleUpdateProfile} className="web-card space-y-5">
              <h2 className="text-lg font-bold border-b border-slate-100 dark:border-neutral-800 pb-2">Personal Information</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 flex items-center gap-1.5 mb-1.5"><User className="w-3.5 h-3.5" /> Full Name</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full p-3 rounded-lg border border-slate-200 dark:border-neutral-700 bg-slate-50 dark:bg-neutral-800 text-sm font-semibold"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 flex items-center gap-1.5 mb-1.5"><Phone className="w-3.5 h-3.5" /> Mobile Number</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full p-3 rounded-lg border border-slate-200 dark:border-neutral-700 bg-slate-50 dark:bg-neutral-800 text-sm font-semibold"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="text-xs font-bold text-slate-500 flex items-center gap-1.5 mb-1.5"><Mail className="w-3.5 h-3.5" /> Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-3 rounded-lg border border-slate-200 dark:border-neutral-700 bg-slate-50 dark:bg-neutral-800 text-sm font-semibold"
                  />
                </div>
              </div>

              <button type="submit" disabled={isSaving} className="btn-primary w-full sm:w-auto">
                <Save className="w-4 h-4" /> {isSaving ? 'Saving...' : 'Update Profile Details'}
              </button>
            </form>

            {/* Address Book */}
            <div className="web-card space-y-5">
              <h2 className="text-lg font-bold border-b border-slate-100 dark:border-neutral-800 pb-2">Saved Addresses (Address Book)</h2>

              {addresses.length === 0 ? (
                <p className="text-xs text-slate-500 pb-2">No saved addresses. Add an address below for faster checkout.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {addresses.map((addr) => (
                    <div key={addr.id} className="p-4 rounded-xl border border-slate-200 dark:border-neutral-700 bg-slate-50 dark:bg-neutral-800 relative group">
                      <h4 className="font-bold text-redPrimary text-sm mb-1">{addr.title}</h4>
                      <p className="text-xs font-medium text-slate-700 dark:text-slate-300 leading-relaxed pr-6">{addr.fullAddress}</p>
                      <button
                        onClick={() => handleDeleteAddress(addr.id)}
                        className="absolute top-4 right-4 text-slate-400 hover:text-rose-600 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Add New Address Form */}
              <form onSubmit={handleAddAddress} className="pt-4 border-t border-slate-100 dark:border-neutral-800 space-y-4">
                <h3 className="font-bold text-sm">Add New Address</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <select
                    value={newAddrTitle}
                    onChange={(e) => setNewAddrTitle(e.target.value)}
                    className="p-3 rounded-lg border border-slate-200 dark:border-neutral-700 bg-slate-50 dark:bg-neutral-800 text-sm font-bold"
                  >
                    <option>Home</option>
                    <option>Work</option>
                    <option>Other</option>
                  </select>
                  <input
                    type="text"
                    value={newAddrText}
                    onChange={(e) => setNewAddrText(e.target.value)}
                    placeholder="Flat, House no., Building, Locality"
                    className="p-3 rounded-lg border border-slate-200 dark:border-neutral-700 bg-slate-50 dark:bg-neutral-800 text-sm sm:col-span-2"
                  />
                  <input
                    type="text"
                    value={newPincode}
                    onChange={(e) => setNewPincode(e.target.value)}
                    placeholder="Pincode (e.g. 737102)"
                    className="p-3 rounded-lg border border-slate-200 dark:border-neutral-700 bg-slate-50 dark:bg-neutral-800 text-sm sm:col-span-1"
                  />
                </div>
                <button type="submit" className="btn-outline border-redPrimary text-redPrimary hover:bg-redPrimary hover:text-white w-full sm:w-auto">
                  <Plus className="w-4 h-4 inline mr-1" /> Save Address
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
