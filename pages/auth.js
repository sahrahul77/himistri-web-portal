import React, { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import AuthModal from '../components/AuthModal';
import { User, Lock, Phone, Mail, CheckCircle, ShieldCheck } from 'lucide-react';

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

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.setAttribute('data-theme', !isDark ? 'dark' : 'light');
  };

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    alert(`Authentication Successful! Welcome back.`);
    window.location.href = '/';
  };

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    if (!regName) return alert('Full Name is required.');
    alert(`Account created successfully as ${regRole}! Navigating to portal...`);
    window.location.href = regRole === 'PARTNER' ? '/partner' : '/';
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

      <AuthModal isOpen={isOtpOpen} onClose={() => setIsOtpOpen(false)} onAuthSuccess={() => window.location.href = '/'} />
      <Footer />
    </div>
  );
}
