import React, { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import AuthModal from '../components/AuthModal';
import { ref, get, set } from 'firebase/database';
import { rtdb } from '../lib/firebase';
import { User, Lock, Phone, CheckCircle, CheckCircle2, ShieldCheck, ArrowRight, Loader2 } from 'lucide-react';

export default function AuthPage() {
  const [isDark, setIsDark] = useState(true);
  const [authTab, setAuthTab] = useState(0); // 0 = Login, 1 = Register
  const [regRole, setRegRole] = useState('CUSTOMER');

  const [inputVal, setInputVal] = useState('');
  const [password, setPassword] = useState('');

  const [regName, setRegName] = useState('');
  const [regPhone, setRegPhone] = useState('+91');
  const [regEmail, setRegEmail] = useState('');
  const [regPass, setRegPass] = useState('');
  const [regSkill, setRegSkill] = useState('Plumber');

  const [isOtpOpen, setIsOtpOpen] = useState(false);
  const [successUser, setSuccessUser] = useState(null);

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.setAttribute('data-theme', !isDark ? 'dark' : 'light');
  };

  const triggerSuccessRedirect = (userObj) => {
    setSuccessUser(userObj);
    localStorage.setItem('himistri_session', JSON.stringify(userObj));

    setTimeout(() => {
      if (userObj.role === 'ADMIN') window.location.href = '/admin';
      else if (userObj.role === 'PARTNER') window.location.href = '/partner';
      else window.location.href = '/';
    }, 1800);
  };

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    if (!inputVal) return alert('Please enter Mobile Number or Email.');
    if (!password) return alert('Please enter Password.');

    const cleanInput = inputVal.trim();
    const cleanPhone = cleanInput.replace(/\D/g, '').slice(-10);

    // 1. Admin Login Check
    if (cleanInput.toLowerCase() === 'sahrahul77@gmail.com' || cleanPhone === '9563213089') {
      const adminUser = { id: 'bLfKYzhws9d7zozkzwyemQPI8bG3', fullName: 'Rahul Shah', phoneNumber: '+919563213089', email: 'sahrahul77@gmail.com', role: 'ADMIN' };
      triggerSuccessRedirect(adminUser);
      return;
    }

    // 2. Partner Login Check
    if (cleanInput.toLowerCase() === 'piku@himistri.com' || cleanPhone === '9564111224') {
      const partnerUser = { id: 'NvEip3MgEgPoefVOVKnnOEQZzm72', fullName: 'Piku', phoneNumber: '+919564111224', email: 'piku@himistri.com', role: 'PARTNER', skillCategory: 'Home Tutor' };
      triggerSuccessRedirect(partnerUser);
      return;
    }

    // 3. Query Firebase Realtime Database /users
    get(ref(rtdb, 'users')).then((snapshot) => {
      let matchedUser = null;
      if (snapshot.exists()) {
        snapshot.forEach((childSnap) => {
          const u = childSnap.val();
          const uEmail = (u.email || '').toLowerCase().trim();
          const uPhone = (u.phoneNumber || '').replace(/\D/g, '').slice(-10);

          if ((cleanInput.includes('@') && uEmail === cleanInput.toLowerCase()) || (cleanPhone.length >= 10 && uPhone === cleanPhone)) {
            matchedUser = { id: childSnap.key, ...u };
          }
        });
      }

      if (!matchedUser) {
        matchedUser = {
          id: 'usr_' + Math.random().toString(36).substring(2, 8),
          fullName: cleanInput.includes('@') ? cleanInput.split('@')[0] : 'Sikkim Customer',
          phoneNumber: cleanPhone ? '+91' + cleanPhone : '+916296351107',
          email: cleanInput.includes('@') ? cleanInput : `${cleanPhone}@himistri.com`,
          role: 'CUSTOMER'
        };
        set(ref(rtdb, 'users/' + matchedUser.id), matchedUser);
      }

      triggerSuccessRedirect(matchedUser);
    }).catch(() => {
      const fallbackUser = { id: 'usr_guest', fullName: 'Passang Bhutia', phoneNumber: '+916296351107', role: 'CUSTOMER' };
      triggerSuccessRedirect(fallbackUser);
    });
  };

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    if (!regName) return alert('Full Name is required.');
    const cleanPhone = regPhone.replace(/\D/g, '').slice(-10);
    if (cleanPhone.length < 10) return alert('Valid 10-digit mobile number is required.');

    const newId = 'usr_' + Math.random().toString(36).substring(2, 8);
    const newUser = {
      id: newId,
      fullName: regName,
      phoneNumber: '+91' + cleanPhone,
      email: regEmail || `${cleanPhone}@himistri.com`,
      role: regRole,
      skillCategory: regRole === 'PARTNER' ? regSkill : null
    };

    set(ref(rtdb, 'users/' + newId), newUser).then(() => {
      triggerSuccessRedirect(newUser);
    });
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header isDark={isDark} onToggleTheme={toggleTheme} />

      <main className="web-container py-12 flex-1 max-w-xl mx-auto">
        <div className="web-card">
          <div className="flex bg-slate-100 dark:bg-neutral-800 rounded-xl p-1 mb-6">
            <button
              onClick={() => setAuthTab(0)}
              className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition ${authTab === 0 ? 'bg-redPrimary text-white shadow' : 'text-slate-500'}`}
            >
              Existing Account Login
            </button>
            <button
              onClick={() => setAuthTab(1)}
              className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition ${authTab === 1 ? 'bg-redPrimary text-white shadow' : 'text-slate-500'}`}
            >
              New Account Register
            </button>
          </div>

          {authTab === 0 ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <h2 className="text-lg font-extrabold mb-1">Enter Your Registered Credentials</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Sign in using your Mobile Number or Email Address</p>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Mobile Number OR Email Address *</label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-3.5 text-slate-400" />
                  <input
                    type="text"
                    value={inputVal}
                    onChange={(e) => setInputVal(e.target.value)}
                    placeholder="e.g. 9564111224 or user@gmail.com"
                    className="w-full pl-10 p-3 rounded-lg border border-slate-200 dark:border-neutral-700 bg-slate-50 dark:bg-neutral-800 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Password * (Compulsory)</label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-3.5 text-slate-400" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 p-3 rounded-lg border border-slate-200 dark:border-neutral-700 bg-slate-50 dark:bg-neutral-800 text-sm"
                  />
                </div>
              </div>

              <button type="submit" className="btn-primary w-full py-3">
                <CheckCircle className="w-4 h-4" /> Sign In & Access Account
              </button>

              <div className="text-center my-3 text-xs text-slate-400 font-bold">OR QUICK SIGN IN</div>

              <button
                type="button"
                onClick={() => setIsOtpOpen(true)}
                className="btn-orange w-full py-3"
              >
                <Phone className="w-4 h-4 inline mr-2" /> Send Phone Verification OTP Code
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <h2 className="text-lg font-extrabold mb-1">1. Select Account Role</h2>
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div
                  onClick={() => setRegRole('CUSTOMER')}
                  className={`p-3 rounded-xl border text-center cursor-pointer ${regRole === 'CUSTOMER' ? 'border-redPrimary bg-redPrimary/10' : 'border-slate-200 dark:border-neutral-800'}`}
                >
                  <strong className="text-xs block">Customer</strong>
                  <span className="text-[10px] text-slate-400">Book doorstep services</span>
                </div>
                <div
                  onClick={() => setRegRole('PARTNER')}
                  className={`p-3 rounded-xl border text-center cursor-pointer ${regRole === 'PARTNER' ? 'border-redPrimary bg-redPrimary/10' : 'border-slate-200 dark:border-neutral-800'}`}
                >
                  <strong className="text-xs block">Service Partner</strong>
                  <span className="text-[10px] text-slate-400">Earn income in Sikkim</span>
                </div>
              </div>

              <h2 className="text-lg font-extrabold mb-1">2. Account Registration Details</h2>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Full Name *</label>
                <input
                  type="text"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="e.g. Nisha Kumari"
                  className="w-full p-3 rounded-lg border border-slate-200 dark:border-neutral-700 bg-slate-50 dark:bg-neutral-800 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Mobile Number (+91) *</label>
                <input
                  type="text"
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value)}
                  placeholder="+91 9564111224"
                  className="w-full p-3 rounded-lg border border-slate-200 dark:border-neutral-700 bg-slate-50 dark:bg-neutral-800 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Email Address</label>
                <input
                  type="email"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="e.g. user@gmail.com"
                  className="w-full p-3 rounded-lg border border-slate-200 dark:border-neutral-700 bg-slate-50 dark:bg-neutral-800 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Set Password *</label>
                <input
                  type="password"
                  value={regPass}
                  onChange={(e) => setRegPass(e.target.value)}
                  placeholder="••••••••"
                  className="w-full p-3 rounded-lg border border-slate-200 dark:border-neutral-700 bg-slate-50 dark:bg-neutral-800 text-sm"
                />
              </div>

              {regRole === 'PARTNER' && (
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Select Primary Craftsman Skill</label>
                  <select
                    value={regSkill}
                    onChange={(e) => setRegSkill(e.target.value)}
                    className="w-full p-3 rounded-lg border border-slate-200 dark:border-neutral-700 bg-slate-50 dark:bg-neutral-800 text-sm"
                  >
                    <option>Plumber</option>
                    <option>Electrician</option>
                    <option>Barber & Salon</option>
                    <option>Home Tutor</option>
                    <option>Cleaner & Washing</option>
                    <option>Carpenter</option>
                  </select>
                </div>
              )}

              <button type="submit" className="btn-primary w-full py-3">
                Create & Register Account as {regRole}
              </button>
            </form>
          )}
        </div>
      </main>

      {/* Dynamic Success Welcome Popup Modal */}
      {successUser && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white dark:bg-darkSurface border border-slate-200 dark:border-neutral-800 rounded-2xl p-8 w-full max-w-md text-center shadow-2xl space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-600/20 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 animate-bounce" />
            </div>

            <div>
              <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-600">Authentication Successful!</span>
              <h2 className="text-2xl font-black mt-1 text-slate-900 dark:text-white">Welcome, <span className="text-redPrimary">{successUser.fullName}</span>!</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 font-medium">
                {successUser.role === 'ADMIN'
                  ? 'Redirecting to Lead Admin Control Panel...'
                  : successUser.role === 'PARTNER'
                  ? 'Redirecting to Service Partner Dashboard...'
                  : 'Redirecting to HiMistri Home Screen...'}
              </p>
            </div>

            <div className="pt-2 flex items-center justify-center gap-2 text-xs font-bold text-redPrimary">
              <Loader2 className="w-4 h-4 animate-spin" /> Loading Portal Workspace...
            </div>
          </div>
        </div>
      )}

      <AuthModal isOpen={isOtpOpen} onClose={() => setIsOtpOpen(false)} onAuthSuccess={(u) => triggerSuccessRedirect(u)} />
      <Footer />
    </div>
  );
}
