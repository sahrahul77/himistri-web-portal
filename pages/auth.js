import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import AuthModal from '../components/AuthModal';
import { ref, get, set, onValue } from 'firebase/database';
import { rtdb } from '../lib/firebase';
import { User, Lock, Phone, CheckCircle, CheckCircle2, Loader2, Eye, EyeOff, FileText, Upload, CreditCard, Award, FileCheck, CheckSquare, Square, MessageSquare } from 'lucide-react';
import Link from 'next/link';

export default function AuthPage() {
  const [isDark, setIsDark] = useState(true);
  const [authTab, setAuthTab] = useState(0); // 0 = Login, 1 = Register
  const [regRole, setRegRole] = useState('CUSTOMER');

  const [inputVal, setInputVal] = useState('');
  const [password, setPassword] = useState('');
  const [showLoginPass, setShowLoginPass] = useState(false);

  // Registration States
  const [regName, setRegName] = useState('');
  const [regPhone, setRegPhone] = useState('+91');
  const [regEmail, setRegEmail] = useState('');
  const [regPass, setRegPass] = useState('');
  const [showRegPass, setShowRegPass] = useState(false);
  const [regSkill, setRegSkill] = useState('');
  const [servicesList, setServicesList] = useState([]);

  // Documents Upload States for Partner
  const [resumeName, setResumeName] = useState('');
  const [resumeData, setResumeData] = useState('');
  const [idProofName, setIdProofName] = useState('');
  const [idProofData, setIdProofData] = useState('');
  const [workExpName, setWorkExpName] = useState('');
  const [workExpData, setWorkExpData] = useState('');

  // Bio & Terms States
  const [aboutText, setAboutText] = useState('');
  const [agreedTerms, setAgreedTerms] = useState(true);

  // Fetch Live Services from Database for Dynamic Skill Selection
  useEffect(() => {
    const unsubSrv = onValue(ref(rtdb, 'services'), (snapshot) => {
      const list = [];
      if (snapshot.exists()) {
        const val = snapshot.val();
        if (typeof val === 'object' && val !== null) {
          Object.keys(val).forEach((k) => {
            if (val[k] && val[k].title) {
              list.push({ id: k, ...val[k] });
            }
          });
        }
      }
      setServicesList(list);
      if (list.length > 0 && !regSkill) {
        setRegSkill(list[0].title);
      }
    });
    return () => unsubSrv();
  }, []);

  const [isOtpOpen, setIsOtpOpen] = useState(false);
  const [successUser, setSuccessUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

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

  const handleFileUpload = (e, nameSetter, dataSetter) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 3 * 1024 * 1024) {
      alert('File size exceeds 3MB limit. Please upload a smaller PDF or image.');
      return;
    }
    nameSetter(file.name);
    const reader = new FileReader();
    reader.onloadend = () => {
      dataSetter(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const triggerSuccessRedirect = (userObj) => {
    setSuccessUser(userObj);
    try {
      localStorage.setItem('himistri_session', JSON.stringify(userObj));
    } catch (_e) {}

    setTimeout(() => {
      if (userObj.role === 'ADMIN') window.location.href = '/admin';
      else if (userObj.role === 'PARTNER') window.location.href = '/partner';
      else window.location.href = '/';
    }, 1800);
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!inputVal) return alert('Please enter Mobile Number or Email.');
    if (!password) return alert('Please enter Password.');

    setIsLoading(true);
    const cleanInput = inputVal.trim();
    const cleanPhone = cleanInput.replace(/\D/g, '').slice(-10);

    try {
      const snapshot = await get(ref(rtdb, 'users'));
      let matchedUser = null;

      if (snapshot.exists()) {
        snapshot.forEach((childSnap) => {
          const u = childSnap.val();
          const uEmail = (u.email || '').toLowerCase().trim();
          const uPhone = (u.phoneNumber || '').replace(/\D/g, '').slice(-10);

          if ((cleanInput.includes('@') && uEmail === cleanInput.toLowerCase()) ||
              (cleanPhone.length >= 10 && uPhone === cleanPhone)) {
            matchedUser = { id: childSnap.key, ...u };
          }
        });
      }

      // Hardcoded fallback for Admin if DB is totally empty
      if (!matchedUser && (cleanInput.toLowerCase() === 'sahrahul77@gmail.com' || cleanPhone === '9563213089')) {
        matchedUser = {
          id: 'bLfKYzhws9d7zozkzwyemQPI8bG3',
          fullName: 'Rahul Shah',
          phoneNumber: '+919563213089',
          email: 'sahrahul77@gmail.com',
          password: password,
          role: 'ADMIN'
        };
        await set(ref(rtdb, 'users/' + matchedUser.id), matchedUser);
      }

      if (!matchedUser) {
        setIsLoading(false);
        return alert('Account not found in Database. Please switch to "New Account Register" to create your account.');
      }

      // Verify Password
      if (matchedUser.password && matchedUser.password !== password) {
        setIsLoading(false);
        return alert('Incorrect Password. Please try again.');
      }

      triggerSuccessRedirect(matchedUser);
    } catch (err) {
      setIsLoading(false);
      alert('Login failed: ' + err.message);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!regName || regName.trim().length < 2) {
      return alert('Compulsory: Please enter your Full Name.');
    }

    const cleanPhone = regPhone.replace(/\D/g, '').slice(-10);
    if (cleanPhone.length < 10) {
      return alert('Compulsory: Please enter a valid 10-digit mobile number.');
    }

    if (!regPass) {
      return alert('Compulsory: Please set a Password.');
    }

    if (regRole === 'PARTNER') {
      if (!idProofData) {
        return alert('Compulsory: Please upload your Identity Proof (Aadhar Card / PAN Card / Voter ID).');
      }
      if (!agreedTerms) {
        return alert('Compulsory: Please agree to the Terms & Conditions and Privacy Policy.');
      }
    }

    setIsLoading(true);

    const newId = 'usr_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6);
    const newUser = {
      id: newId,
      fullName: regName.trim(),
      phoneNumber: '+91' + cleanPhone,
      email: regEmail ? regEmail.trim() : `${cleanPhone}@himistri.com`,
      password: regPass,
      role: regRole,
      skillCategory: regRole === 'PARTNER' ? regSkill : null,
      documents: regRole === 'PARTNER' ? {
        resumeName: resumeName || null,
        resumeData: resumeData || null,
        idProofName: idProofName || null,
        idProofData: idProofData || null,
        workExpName: workExpName || null,
        workExpData: workExpData || null,
      } : null,
      aboutText: regRole === 'PARTNER' ? aboutText.trim() : null,
      agreedTerms: agreedTerms,
      createdAt: new Date().toISOString()
    };

    try {
      console.log("Saving user to Firebase:", newUser);
      await set(ref(rtdb, 'users/' + newId), newUser);
      if (regRole === 'PARTNER') {
        await set(ref(rtdb, 'partners/' + newId), newUser);
      }
      console.log("User successfully saved!");
      triggerSuccessRedirect(newUser);
    } catch (err) {
      setIsLoading(false);
      console.error("Firebase Write Error:", err);
      alert("Registration failed! Please check your network or Firebase Database Rules. Error: " + err.message);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header isDark={isDark} onToggleTheme={toggleTheme} currentUser={successUser} />

      <main className="web-container py-10 flex-1 max-w-2xl mx-auto">
        <div className="web-card relative shadow-2xl rounded-3xl border border-slate-200 dark:border-neutral-800 bg-white dark:bg-[#1A1A1A] p-6 sm:p-8">
          {isLoading && (
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm z-10 flex items-center justify-center rounded-3xl">
              <Loader2 className="w-10 h-10 text-white animate-spin" />
            </div>
          )}

          {/* Top Auth Tab Switcher */}
          <div className="flex bg-slate-100 dark:bg-neutral-800 rounded-2xl p-1 mb-6">
            <button
              type="button"
              onClick={() => setAuthTab(0)}
              className={`flex-1 py-3 text-xs sm:text-sm font-black rounded-xl transition ${authTab === 0 ? 'bg-redPrimary text-white shadow-lg' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}
            >
              Existing Account Login
            </button>
            <button
              type="button"
              onClick={() => setAuthTab(1)}
              className={`flex-1 py-3 text-xs sm:text-sm font-black rounded-xl transition ${authTab === 1 ? 'bg-redPrimary text-white shadow-lg' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}
            >
              New Account Register
            </button>
          </div>

          {authTab === 0 ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <h2 className="text-lg font-black text-slate-900 dark:text-white mb-1">Enter Your Registered Credentials</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Sign in using your Mobile Number or Email Address</p>

              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">Mobile Number OR Email Address *</label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                  <input
                    type="text"
                    value={inputVal}
                    onChange={(e) => setInputVal(e.target.value)}
                    placeholder="e.g. 9564111224 or user@gmail.com"
                    className="w-full pl-10 p-3.5 rounded-xl border border-slate-200 dark:border-neutral-700 bg-slate-50 dark:bg-neutral-900 text-sm font-bold text-slate-900 dark:text-white outline-none focus:border-redPrimary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">Password * (Compulsory)</label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                  <input
                    type={showLoginPass ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 p-3.5 rounded-xl border border-slate-200 dark:border-neutral-700 bg-slate-50 dark:bg-neutral-900 text-sm font-bold text-slate-900 dark:text-white outline-none focus:border-redPrimary"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPass(!showLoginPass)}
                    className="absolute right-3.5 top-3.5 text-slate-400 hover:text-redPrimary transition"
                  >
                    {showLoginPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={isLoading} className="btn-primary w-full py-4 text-xs font-black shadow-lg rounded-xl mt-2">
                <CheckCircle className="w-4 h-4 inline mr-1" /> Sign In & Access Account
              </button>

              <div className="text-center my-3 text-xs text-slate-400 font-bold">OR QUICK SIGN IN</div>

              <button
                type="button"
                onClick={() => setIsOtpOpen(true)}
                className="btn-orange w-full py-3.5 text-xs font-black shadow-md rounded-xl"
              >
                <Phone className="w-4 h-4 inline mr-2" /> Send Phone Verification OTP Code
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegisterSubmit} className="space-y-6">

              {/* SECTION 1: ACCOUNT ROLE */}
              <div className="space-y-3">
                <h2 className="text-base font-black text-slate-900 dark:text-white">1. Select Account Role</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div
                    onClick={() => setRegRole('PARTNER')}
                    className={`p-4 rounded-2xl border text-left cursor-pointer transition flex items-start gap-3 relative overflow-hidden ${
                      regRole === 'PARTNER'
                        ? 'border-redPrimary bg-redPrimary/10 shadow-md'
                        : 'border-slate-200 dark:border-neutral-800 bg-slate-50 dark:bg-neutral-900 hover:border-redPrimary/50'
                    }`}
                  >
                    <div className="mt-0.5 shrink-0 text-redPrimary">
                      {regRole === 'PARTNER' ? <CheckCircle2 className="w-5 h-5 text-redPrimary" /> : <div className="w-5 h-5 rounded-full border-2 border-slate-300 dark:border-neutral-700" />}
                    </div>
                    <div>
                      <strong className="text-sm font-extrabold block text-slate-900 dark:text-white">Service Partner / Worker</strong>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-0.5 leading-snug">Receive service job requests & earn income in Sikkim</span>
                    </div>
                  </div>

                  <div
                    onClick={() => setRegRole('CUSTOMER')}
                    className={`p-4 rounded-2xl border text-left cursor-pointer transition flex items-start gap-3 relative overflow-hidden ${
                      regRole === 'CUSTOMER'
                        ? 'border-redPrimary bg-redPrimary/10 shadow-md'
                        : 'border-slate-200 dark:border-neutral-800 bg-slate-50 dark:bg-neutral-900 hover:border-redPrimary/50'
                    }`}
                  >
                    <div className="mt-0.5 shrink-0 text-redPrimary">
                      {regRole === 'CUSTOMER' ? <CheckCircle2 className="w-5 h-5 text-redPrimary" /> : <div className="w-5 h-5 rounded-full border-2 border-slate-300 dark:border-neutral-700" />}
                    </div>
                    <div>
                      <strong className="text-sm font-extrabold block text-slate-900 dark:text-white">Customer</strong>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-0.5 leading-snug">Hire local craftsmen & book services in Gangtok</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 2: ACCOUNT REGISTRATION DETAILS */}
              <div className="space-y-4 pt-2 border-t border-slate-100 dark:border-neutral-800">
                <h2 className="text-base font-black text-slate-900 dark:text-white">2. Account Registration Details</h2>

                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">Full Name * (Compulsory)</label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                    <input
                      type="text"
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      placeholder="e.g. Passang Bhutia"
                      required
                      className="w-full pl-10 p-3.5 rounded-xl border border-slate-200 dark:border-neutral-700 bg-slate-50 dark:bg-neutral-900 text-sm font-bold text-slate-900 dark:text-white outline-none focus:border-redPrimary"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">Mobile Number (+91) * (Compulsory)</label>
                  <div className="relative">
                    <Phone className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                    <input
                      type="text"
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      placeholder="+91 9564111224"
                      required
                      className="w-full pl-10 p-3.5 rounded-xl border border-slate-200 dark:border-neutral-700 bg-slate-50 dark:bg-neutral-900 text-sm font-bold text-slate-900 dark:text-white outline-none focus:border-redPrimary"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">Email Address (Optional)</label>
                  <input
                    type="email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="e.g. user@gmail.com"
                    className="w-full p-3.5 rounded-xl border border-slate-200 dark:border-neutral-700 bg-slate-50 dark:bg-neutral-900 text-sm font-bold text-slate-900 dark:text-white outline-none focus:border-redPrimary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">Set Password * (Compulsory)</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                    <input
                      type={showRegPass ? "text" : "password"}
                      value={regPass}
                      onChange={(e) => setRegPass(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="w-full pl-10 pr-10 p-3.5 rounded-xl border border-slate-200 dark:border-neutral-700 bg-slate-50 dark:bg-neutral-900 text-sm font-bold text-slate-900 dark:text-white outline-none focus:border-redPrimary"
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegPass(!showRegPass)}
                      className="absolute right-3.5 top-3.5 text-slate-400 hover:text-redPrimary transition"
                    >
                      {showRegPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {regRole === 'PARTNER' && (
                  <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">Select Primary Craftsman Skill *</label>
                    <select
                      value={regSkill}
                      onChange={(e) => setRegSkill(e.target.value)}
                      className="w-full p-3.5 rounded-xl border border-slate-200 dark:border-neutral-700 bg-slate-50 dark:bg-neutral-900 text-sm font-bold text-slate-900 dark:text-white outline-none focus:border-redPrimary"
                    >
                      {servicesList.length > 0 ? (
                        servicesList.map((s) => (
                          <option key={s.id} value={s.title}>
                            {s.title} ({s.categoryName ? s.categoryName.replace(' Manpower', '') : 'General'})
                          </option>
                        ))
                      ) : (
                        <>
                          <option value="Plumber Leak Fix & Fitting">Plumber Leak Fix & Fitting</option>
                          <option value="AC/Fan Repairer">AC/Fan Repairer</option>
                          <option value="Full House Wiring & Switchboard Repair">Full House Wiring & Switchboard Repair</option>
                          <option value="Door Lock & Hinge Repair">Door Lock & Hinge Repair</option>
                        </>
                      )}
                    </select>
                  </div>
                )}
              </div>

              {/* SECTION 3: UPLOAD DOCUMENTS (ONLY FOR PARTNER) */}
              {regRole === 'PARTNER' && (
                <div className="space-y-4 pt-2 border-t border-slate-100 dark:border-neutral-800">
                  <div>
                    <h2 className="text-base font-black text-slate-900 dark:text-white">3. Upload Documents</h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Please upload the required documents for verification.</p>
                  </div>

                  <div className="space-y-3">
                    {/* Resume / CV */}
                    <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-neutral-800 bg-slate-50 dark:bg-neutral-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-500 shrink-0">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div>
                          <strong className="block text-xs font-black text-slate-900 dark:text-white">Resume / CV <span className="text-slate-400 font-medium">(Optional)</span></strong>
                          <span className="text-[10px] text-slate-500">Upload your resume (PDF, JPG, PNG)</span>
                          {resumeName && <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold mt-0.5 flex items-center gap-1"><FileCheck className="w-3 h-3" /> {resumeName}</p>}
                        </div>
                      </div>
                      <label className="btn-primary py-2 px-4 text-xs font-bold rounded-xl cursor-pointer shrink-0 text-center flex items-center justify-center gap-1.5 bg-slate-800 hover:bg-slate-900 text-white">
                        <Upload className="w-3.5 h-3.5" /> {resumeName ? 'Change File' : 'Choose File'}
                        <input type="file" accept=".pdf,image/*" onChange={(e) => handleFileUpload(e, setResumeName, setResumeData)} className="hidden" />
                      </label>
                    </div>

                    {/* Identity Proof (Compulsory) */}
                    <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-neutral-800 bg-slate-50 dark:bg-neutral-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-redPrimary/10 text-redPrimary shrink-0">
                          <CreditCard className="w-5 h-5 text-redPrimary" />
                        </div>
                        <div>
                          <strong className="block text-xs font-black text-slate-900 dark:text-white">Identity Proof <span className="text-redPrimary font-bold">(Compulsory *)</span></strong>
                          <span className="text-[10px] text-slate-500">Aadhar Card / PAN Card / Voter ID (PDF, JPG, PNG)</span>
                          {idProofName && <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold mt-0.5 flex items-center gap-1"><FileCheck className="w-3 h-3" /> {idProofName}</p>}
                        </div>
                      </div>
                      <label className="btn-primary py-2 px-4 text-xs font-bold rounded-xl cursor-pointer shrink-0 text-center flex items-center justify-center gap-1.5 bg-redPrimary hover:bg-redDark text-white">
                        <Upload className="w-3.5 h-3.5" /> {idProofName ? 'Change File' : 'Choose File'}
                        <input type="file" accept=".pdf,image/*" onChange={(e) => handleFileUpload(e, setIdProofName, setIdProofData)} className="hidden" />
                      </label>
                    </div>

                    {/* Work Experience / Certificates */}
                    <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-neutral-800 bg-slate-50 dark:bg-neutral-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-500 shrink-0">
                          <Award className="w-5 h-5" />
                        </div>
                        <div>
                          <strong className="block text-xs font-black text-slate-900 dark:text-white">Work Experience / Certificates <span className="text-slate-400 font-medium">(Optional)</span></strong>
                          <span className="text-[10px] text-slate-500">Any relevant certificates (PDF, JPG, PNG)</span>
                          {workExpName && <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold mt-0.5 flex items-center gap-1"><FileCheck className="w-3 h-3" /> {workExpName}</p>}
                        </div>
                      </div>
                      <label className="btn-primary py-2 px-4 text-xs font-bold rounded-xl cursor-pointer shrink-0 text-center flex items-center justify-center gap-1.5 bg-slate-800 hover:bg-slate-900 text-white">
                        <Upload className="w-3.5 h-3.5" /> {workExpName ? 'Change File' : 'Choose File'}
                        <input type="file" accept=".pdf,image/*" onChange={(e) => handleFileUpload(e, setWorkExpName, setWorkExpData)} className="hidden" />
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION 4: TELL US ABOUT YOURSELF (ONLY FOR PARTNER) */}
              {regRole === 'PARTNER' && (
                <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-neutral-800">
                  <div>
                    <h2 className="text-base font-black text-slate-900 dark:text-white">4. Tell Us About Yourself <span className="text-xs text-slate-400 font-medium">(Optional)</span></h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                      Write a short introduction about yourself (your skills, experience, work area, etc.). This helps us connect you with the right customers.
                    </p>
                  </div>

                  <div className="relative">
                    <MessageSquare className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                    <textarea
                      value={aboutText}
                      onChange={(e) => setAboutText(e.target.value.substring(0, 250))}
                      placeholder="E.g. I am a skilled carpenter with 5 years of experience... I can work in Gangtok and nearby areas..."
                      rows={3}
                      className="w-full pl-10 p-3.5 rounded-xl border border-slate-200 dark:border-neutral-700 bg-slate-50 dark:bg-neutral-900 text-xs font-bold text-slate-900 dark:text-white outline-none focus:border-redPrimary resize-none"
                    />
                    <span className="text-[10px] font-bold text-slate-400 absolute bottom-2.5 right-3">{aboutText.length}/250</span>
                  </div>
                </div>
              )}

              {/* TERMS CHECKBOX */}
              <div className="pt-2 flex items-center gap-2 cursor-pointer" onClick={() => setAgreedTerms(!agreedTerms)}>
                {agreedTerms ? (
                  <CheckSquare className="w-5 h-5 text-redPrimary shrink-0" />
                ) : (
                  <Square className="w-5 h-5 text-slate-400 shrink-0" />
                )}
                <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  I agree to the <Link href="/terms" className="text-redPrimary hover:underline" onClick={(e) => e.stopPropagation()}>Terms & Conditions</Link> and <Link href="/privacy" className="text-redPrimary hover:underline" onClick={(e) => e.stopPropagation()}>Privacy Policy</Link>
                </p>
              </div>

              <button type="submit" disabled={isLoading} className="btn-primary w-full py-4 text-xs font-black shadow-xl rounded-xl">
                Create & Register Account as {regRole === 'PARTNER' ? 'Service Partner' : 'Customer'}
              </button>

              <div className="text-center my-3 text-xs text-slate-400 font-bold">OR QUICK SIGN IN</div>

              <button
                type="button"
                onClick={() => setIsOtpOpen(true)}
                className="btn-orange w-full py-3.5 text-xs font-black shadow-md rounded-xl"
              >
                <Phone className="w-4 h-4 inline mr-2" /> Send Phone Verification OTP Code
              </button>
            </form>
          )}
        </div>
      </main>

      {/* Dynamic Success Welcome Popup Modal */}
      {successUser && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white dark:bg-darkSurface border border-slate-200 dark:border-neutral-800 rounded-3xl p-8 w-full max-w-md text-center shadow-2xl space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-600/20 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 animate-bounce" />
            </div>

            <div>
              <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-600">Account Authenticated!</span>
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
              <Loader2 className="w-4 h-4 animate-spin" /> Accessing Workspace...
            </div>
          </div>
        </div>
      )}

      <AuthModal isOpen={isOtpOpen} onClose={() => setIsOtpOpen(false)} onAuthSuccess={(u) => triggerSuccessRedirect(u)} />
      <Footer />
    </div>
  );
}
