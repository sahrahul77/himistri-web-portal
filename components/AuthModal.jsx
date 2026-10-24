import React, { useState, useEffect } from 'react';
import { X, Phone, ShieldCheck, Loader2, MessageSquare, ArrowRight } from 'lucide-react';
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import { ref, get, set } from 'firebase/database';
import { auth, rtdb } from '../lib/firebase';

export default function AuthModal({ isOpen, onClose, onAuthSuccess }) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [showOtpStep, setShowOtpStep] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [confirmationResult, setConfirmationResult] = useState(null);

  useEffect(() => {
    // Reset state when modal opens/closes
    if (isOpen) {
      setPhoneNumber('');
      setOtpCode('');
      setShowOtpStep(false);
      setErrorMsg('');
      setLoading(false);

      // Pre-initialize reCAPTCHA safely after DOM mounts
      const timer = setTimeout(() => {
        if (!window.recaptchaVerifier && document.getElementById('recaptcha-container')) {
          try {
            window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
              size: 'invisible',
              callback: (response) => {
                // reCAPTCHA solved
              }
            });
          } catch (e) {
            console.error("Recaptcha Init Error:", e);
          }
        }
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    const cleanPhone = phoneNumber.replace(/\D/g, '').slice(-10);

    if (cleanPhone.length !== 10) {
      setErrorMsg('Please enter a valid 10-digit mobile number.');
      return;
    }

    setLoading(true);

    // Initialize recaptcha if it wasn't pre-initialized
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible'
      });
    }

    const formattedPhone = `+91${cleanPhone}`;
    const appVerifier = window.recaptchaVerifier;

    try {
      const confirmation = await signInWithPhoneNumber(auth, formattedPhone, appVerifier);
      setConfirmationResult(confirmation);
      setShowOtpStep(true);
      setLoading(false);
    } catch (error) {
      console.error("SMS Error Details:", error);
      let errorText = 'Failed to send OTP SMS. Please try again later.';

      // Provide clearer Firebase Error Messages
      if (error.code === 'auth/unauthorized-domain') {
        errorText = 'Error: This domain is not authorized in Firebase Console (Authentication -> Settings -> Authorized domains).';
      } else if (error.code === 'auth/too-many-requests') {
        errorText = 'Too many SMS requests. Please try again later or use a different number.';
      } else if (error.message) {
        errorText = error.message; // Show exact firebase error
      }

      setErrorMsg(errorText);
      setLoading(false);

      // Reset reCAPTCHA if failed
      if (window.recaptchaVerifier) {
        try {
          window.recaptchaVerifier.render().then(widgetId => {
            window.recaptchaVerifier.reset(widgetId);
          });
        } catch(e) {}
      }
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (otpCode.trim().length < 6) {
      setErrorMsg('Please enter the complete 6-digit OTP code.');
      return;
    }

    setLoading(true);

    try {
      // Verify OTP code
      const result = await confirmationResult.confirm(otpCode);
      const fbUser = result.user;

      const userPhoneStr = fbUser.phoneNumber || `+91${phoneNumber.replace(/\D/g, '').slice(-10)}`;

      // Check if user exists in RTDB
      const snapshot = await get(ref(rtdb, 'users'));
      let matchedUser = null;

      if (snapshot.exists()) {
        snapshot.forEach((childSnap) => {
          const u = childSnap.val();
          const uPhone = (u.phoneNumber || '').replace(/\D/g, '').slice(-10);
          const currentPhone = userPhoneStr.replace(/\D/g, '').slice(-10);

          if (currentPhone.length >= 10 && uPhone === currentPhone) {
            matchedUser = { id: childSnap.key, ...u };
          }
        });
      }

      // If user doesn't exist, create a new customer record
      if (!matchedUser) {
        const newId = 'usr_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6);
        matchedUser = {
          id: newId,
          fullName: 'HiMistri Customer',
          phoneNumber: userPhoneStr,
          email: '',
          role: 'CUSTOMER',
          createdAt: new Date().toISOString()
        };
        await set(ref(rtdb, 'users/' + newId), matchedUser);
      }

      setLoading(false);
      onAuthSuccess(matchedUser);
      onClose();
    } catch (error) {
      console.error("OTP Verification Error:", error);
      setErrorMsg('Invalid OTP Code. Please double-check the SMS.');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#1A1A1A] border border-slate-200 dark:border-neutral-800 rounded-3xl p-6 sm:p-8 w-full max-w-md shadow-2xl relative overflow-hidden">

        {/* Decorative Background */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-redPrimary/5 rounded-full blur-3xl -z-10 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-orangeSecondary/5 rounded-full blur-3xl -z-10 pointer-events-none" />

        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-slate-100 dark:bg-neutral-800 text-slate-400 hover:text-redPrimary rounded-full transition"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="text-center mb-6">
          <div className="w-14 h-14 mx-auto bg-redPrimary text-white rounded-2xl flex items-center justify-center shadow-lg mb-3">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <h3 className="text-xl font-black text-slate-900 dark:text-white">Quick Login</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {!showOtpStep ? "Enter your mobile number to receive a secure code" : "Enter the 6-digit code sent to your phone"}
          </p>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 text-xs font-bold text-rose-600 text-center">
            {errorMsg}
          </div>
        )}

        {!showOtpStep ? (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div>
              <label className="block text-xs font-extrabold text-slate-500 dark:text-slate-400 mb-1.5 ml-1">Mobile Number (+91)</label>
              <div className="relative">
                <Phone className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                <input
                  type="tel"
                  maxLength={10}
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                  placeholder="e.g. 9564111224"
                  className="w-full pl-10 p-3.5 rounded-xl border border-slate-200 dark:border-neutral-700 bg-slate-50 dark:bg-neutral-900 text-sm font-bold text-slate-900 dark:text-white outline-none focus:border-redPrimary"
                />
              </div>
            </div>

            {/* Invisible reCAPTCHA container required by Firebase */}
            <div id="recaptcha-container"></div>

            <button
              type="submit"
              disabled={loading || phoneNumber.length !== 10}
              className={`btn-primary w-full py-4 text-xs font-black shadow-lg rounded-xl flex justify-center items-center gap-2 transition ${loading || phoneNumber.length !== 10 ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {loading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Sending Secure SMS...</>
              ) : (
                <>Send Secure OTP SMS <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div>
              <label className="block text-xs font-extrabold text-slate-500 dark:text-slate-400 mb-1.5 ml-1">Secure 6-Digit OTP</label>
              <div className="relative">
                <MessageSquare className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                <input
                  type="text"
                  maxLength={6}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="• • • • • •"
                  className="w-full pl-10 p-3.5 rounded-xl border border-slate-200 dark:border-neutral-700 bg-slate-50 dark:bg-neutral-900 text-lg font-black text-slate-900 dark:text-white outline-none focus:border-redPrimary tracking-widest text-center"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || otpCode.length < 6}
              className={`btn-primary w-full py-4 text-xs font-black shadow-lg rounded-xl flex justify-center items-center gap-2 transition ${loading || otpCode.length < 6 ? 'opacity-70 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-700 border-emerald-600'}`}
            >
              {loading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Verifying Code...</>
              ) : (
                <><ShieldCheck className="w-4 h-4" /> Verify & Access Account</>
              )}
            </button>

            <button
              type="button"
              onClick={() => { setShowOtpStep(false); setOtpCode(''); }}
              className="w-full text-center text-xs font-bold text-slate-500 hover:text-redPrimary mt-2"
            >
              Change Mobile Number
            </button>
          </form>
        )}

      </div>
    </div>
  );
}
