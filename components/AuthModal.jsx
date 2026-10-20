import React, { useState } from 'react';
import { X, CheckCircle, ShieldCheck } from 'lucide-react';

export default function AuthModal({ isOpen, onClose, onAuthSuccess }) {
  const [authInput, setAuthInput] = useState('');
  const [password, setPassword] = useState('');
  const [showOtpStep, setShowOtpStep] = useState(false);
  const [otpCode, setOtpCode] = useState('');

  if (!isOpen) return null;

  const handleLogin = (e) => {
    e.preventDefault();
    const phone = authInput || '+916296351107';
    onAuthSuccess({
      id: 'usr_' + Math.random().toString(36).substring(2, 8),
      fullName: 'Passang Bhutia',
      phoneNumber: phone,
      role: 'CUSTOMER'
    });
    onClose();
  };

  const handleOtpVerify = (e) => {
    e.preventDefault();
    onAuthSuccess({
      id: 'usr_' + Math.random().toString(36).substring(2, 8),
      fullName: 'Verified Customer',
      phoneNumber: authInput || '+916296351107',
      role: 'CUSTOMER'
    });
    setShowOtpStep(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-darkSurface border border-slate-200 dark:border-neutral-800 rounded-2xl p-6 w-full max-w-md shadow-2xl relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-200">
          <X className="w-5 h-5" />
        </button>

        {!showOtpStep ? (
          <div>
            <h3 className="text-xl font-bold mb-1">Sign In to HiMistri</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-5">Enter your registered mobile number or email credentials</p>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">Mobile Number OR Email Address</label>
                <input
                  type="text"
                  value={authInput}
                  onChange={(e) => setAuthInput(e.target.value)}
                  placeholder="e.g. 9564111224 or user@gmail.com"
                  className="w-full p-3 rounded-lg border border-slate-200 dark:border-neutral-700 bg-slate-100 dark:bg-neutral-800 text-sm focus:outline-none focus:border-redPrimary"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">Password * (Compulsory)</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full p-3 rounded-lg border border-slate-200 dark:border-neutral-700 bg-slate-100 dark:bg-neutral-800 text-sm focus:outline-none focus:border-redPrimary"
                />
              </div>

              <button type="submit" className="w-full bg-redPrimary hover:bg-redDark text-white py-3 rounded-lg font-bold text-sm transition">
                Sign In & Access Account
              </button>

              <button
                type="button"
                onClick={() => setShowOtpStep(true)}
                className="w-full bg-orangeSecondary text-white py-3 rounded-lg font-bold text-sm transition"
              >
                Send Phone Verification OTP Code
              </button>
            </form>
          </div>
        ) : (
          <div>
            <h3 className="text-xl font-bold mb-1">Phone OTP Verification</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-5">SMS code sent to +91{authInput.replace(/\D/g, '').slice(-10) || '9563213089'}</p>

            <form onSubmit={handleOtpVerify} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">Enter 6-Digit OTP Code</label>
                <input
                  type="text"
                  maxLength={6}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  placeholder="e.g. 123456"
                  className="w-full p-3 rounded-lg border border-slate-200 dark:border-neutral-700 bg-slate-100 dark:bg-neutral-800 text-sm focus:outline-none focus:border-redPrimary"
                />
              </div>

              <button type="submit" className="w-full bg-redPrimary hover:bg-redDark text-white py-3 rounded-lg font-bold text-sm transition">
                Verify OTP Code & Access Account
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
