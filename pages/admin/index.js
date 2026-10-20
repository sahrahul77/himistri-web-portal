import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { DEFAULT_CATEGORIES, DEFAULT_SERVICES } from '../../lib/defaultData';
import { ref, onValue, update, remove, set } from 'firebase/database';
import { rtdb } from '../../lib/firebase';
import { useAuth } from '../../lib/AuthContext';
import {
  ShieldCheck, Users, DollarSign, Package, Plus, Trash2, CheckCircle2, UserPlus, Lock, LogIn, LogOut,
  BarChart3, CreditCard, HardHat, Image as ImageIcon, Layers, Wrench, Search, Phone, Mail, Edit, MessageSquare
} from 'lucide-react';

export default function AdminControlPanelPage() {
  const [isDark, setIsDark] = useState(true);
  const [activeTab, setActiveTab] = useState(0); // 0=Orders, 1=Analytics, 2=Payment, 3=Fleet, 4=Users, 5=Categories, 6=Services, 7=Banners, 8=Profile, 9=Testimonials, 10=FAQs

  // Realtime Firebase States
  const [bookings, setBookings] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [categoriesList, setCategoriesList] = useState([]);
  const [servicesList, setServicesList] = useState([]);
  const [bannersList, setBannersList] = useState([]);
  const [testimonialsList, setTestimonialsList] = useState([]);
  const [faqsList, setFaqsList] = useState([]);

  const { currentUser, logout, isAuthLoaded } = useAuth();

  // Search & Filter States
  const [orderQuery, setOrderQuery] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('ALL');

  // Forms
  const [newCatName, setNewCatName] = useState('');
  const [newCatIcon, setNewCatIcon] = useState('');

  const [newSrvTitle, setNewSrvTitle] = useState('');
  const [newSrvCatId, setNewSrvCatId] = useState('cat_plumber');
  const [newSrvPrice, setNewSrvPrice] = useState('');
  const [newSrvDiscount, setNewSrvDiscount] = useState('');
  const [newSrvImage, setNewSrvImage] = useState('');

  const [newBnrTitle, setNewBnrTitle] = useState('');
  const [newBnrSub, setNewBnrSub] = useState('');
  const [newBnrImg, setNewBnrImg] = useState('');

  const [newTestName, setNewTestName] = useState('');
  const [newTestLoc, setNewTestLoc] = useState('');
  const [newTestText, setNewTestText] = useState('');

  const [newFaqQ, setNewFaqQ] = useState('');
  const [newFaqA, setNewFaqA] = useState('');

  const [adminName, setAdminName] = useState('Rahul Shah');
  const [adminPhone, setAdminPhone] = useState('+919563213089');
  const [adminEmail, setAdminEmail] = useState('sahrahul77@gmail.com');

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

  useEffect(() => {
    const unsubBookings = onValue(ref(rtdb, 'bookings'), (snapshot) => {
      const list = [];
      if (snapshot.exists()) snapshot.forEach((child) => list.push({ id: child.key, ...child.val() }));
      setBookings(list);
    });

    const unsubUsers = onValue(ref(rtdb, 'users'), (snapshot) => {
      const list = [];
      if (snapshot.exists()) snapshot.forEach((child) => list.push({ id: child.key, ...child.val() }));
      setUsersList(list);
    });

    const unsubCategories = onValue(ref(rtdb, 'categories'), (snapshot) => {
      const list = [];
      if (snapshot.exists()) snapshot.forEach((child) => list.push({ id: child.key, ...child.val() }));
      setCategoriesList(list.length > 0 ? list : DEFAULT_CATEGORIES);
    });

    const unsubServices = onValue(ref(rtdb, 'services'), (snapshot) => {
      const list = [];
      if (snapshot.exists()) snapshot.forEach((child) => list.push({ id: child.key, ...child.val() }));
      setServicesList(list.length > 0 ? list : DEFAULT_SERVICES);
    });

    const unsubBanners = onValue(ref(rtdb, 'banners'), (snapshot) => {
      const list = [];
      if (snapshot.exists()) snapshot.forEach((child) => list.push({ id: child.key, ...child.val() }));
      setBannersList(list);
    });

    const unsubTestimonials = onValue(ref(rtdb, 'testimonials'), (snapshot) => {
      const list = [];
      if (snapshot.exists()) snapshot.forEach((child) => list.push({ id: child.key, ...child.val() }));
      setTestimonialsList(list);
    });

    const unsubFaqs = onValue(ref(rtdb, 'faqs'), (snapshot) => {
      const list = [];
      if (snapshot.exists()) snapshot.forEach((child) => list.push({ id: child.key, ...child.val() }));
      setFaqsList(list);
    });

    return () => {
      unsubBookings();
      unsubUsers();
      unsubCategories();
      unsubServices();
      unsubBanners();
      unsubTestimonials();
      unsubFaqs();
    };
  }, []);

  const handleUpdateStatus = (id, newStatus, trackingText) => {
    update(ref(rtdb, `bookings/${id}`), { status: newStatus, trackingStatus: trackingText });
  };

  const handleAssignPartner = (id, partnerName, partnerPhone, partnerSkill) => {
    update(ref(rtdb, `bookings/${id}`), {
      status: 'ASSIGNED',
      assignedPartnerName: partnerName,
      assignedPartnerPhone: partnerPhone,
      assignedPartnerSkill: partnerSkill,
      trackingStatus: `Mistri ${partnerName} assigned to order`
    }).then(() => alert(`Order assigned to ${partnerName}!`));
  };

  const handleDeleteItem = (path) => {
    if (confirm('Delete this item permanently from Firebase Database?')) {
      remove(ref(rtdb, path));
    }
  };

  const handleAddCategory = (e) => {
    e.preventDefault();
    if (!newCatName) return alert('Category Name is required.');
    const catId = 'cat_' + Math.random().toString(36).substring(2, 8);
    set(ref(rtdb, `categories/${catId}`), { id: catId, name: newCatName, iconUrl: newCatIcon || 'https://himistri.techcoders.in/wp-content/uploads/2022/10/PLUMBER.png' })
      .then(() => { alert(`New Category '${newCatName}' created in Firebase!`); setNewCatName(''); setNewCatIcon(''); });
  };

  const handleAddService = (e) => {
    e.preventDefault();
    if (!newSrvTitle) return alert('Service Title is required.');
    const srvId = 'srv_' + Math.random().toString(36).substring(2, 8);
    const activeCats = categoriesList.length > 0 ? categoriesList : DEFAULT_CATEGORIES;
    const catObj = activeCats.find(c => c.id === newSrvCatId) || activeCats[0];

    set(ref(rtdb, `services/${srvId}`), {
      id: srvId,
      categoryId: catObj.id,
      categoryName: catObj.name,
      title: newSrvTitle,
      originalPrice: parseFloat(newSrvPrice) || 1000,
      discountedPrice: parseFloat(newSrvDiscount) || (parseFloat(newSrvPrice) || 1000),
      imageUrl: newSrvImage || 'https://himistri.techcoders.in/wp-content/uploads/2022/10/PLUMBER.png'
    }).then(() => {
      alert(`New Service '${newSrvTitle}' connected to Category '${catObj.name}' and saved to Firebase!`);
      setNewSrvTitle(''); setNewSrvPrice(''); setNewSrvDiscount(''); setNewSrvImage('');
    });
  };

  const handleAddBanner = (e) => {
    e.preventDefault();
    if (!newBnrTitle) return alert('Banner Title is required.');
    const bnrId = 'bnr_' + Math.random().toString(36).substring(2, 8);
    set(ref(rtdb, `banners/${bnrId}`), {
      id: bnrId,
      title: newBnrTitle,
      subtitle: newBnrSub || 'Doorstep Services across Gangtok',
      imageUrl: newBnrImg || 'https://himistri.techcoders.in/wp-content/uploads/2022/10/PLUMBER.png'
    }).then(() => { alert('New Marketing Banner saved to Firebase!'); setNewBnrTitle(''); setNewBnrSub(''); setNewBnrImg(''); });
  };

  const handleAddTestimonial = (e) => {
    e.preventDefault();
    if (!newTestName || !newTestText) return alert('Name and Review Text required.');
    const testId = 'test_' + Math.random().toString(36).substring(2, 8);
    set(ref(rtdb, `testimonials/${testId}`), {
      id: testId,
      name: newTestName,
      location: newTestLoc || 'Gangtok, Sikkim',
      text: newTestText,
      rating: 5,
      service: 'Verified Customer'
    }).then(() => { alert('New Customer Experience Review saved!'); setNewTestName(''); setNewTestLoc(''); setNewTestText(''); });
  };

  const handleAddFaq = (e) => {
    e.preventDefault();
    if (!newFaqQ || !newFaqA) return alert('Question and Answer required.');
    const faqId = 'faq_' + Math.random().toString(36).substring(2, 8);
    set(ref(rtdb, `faqs/${faqId}`), {
      id: faqId,
      q: newFaqQ,
      a: newFaqA
    }).then(() => { alert('New FAQ saved!'); setNewFaqQ(''); setNewFaqA(''); });
  };

  const handleSaveAdminProfile = (e) => {
    e.preventDefault();
    update(ref(rtdb, 'users/bLfKYzhws9d7zozkzwyemQPI8bG3'), { fullName: adminName, phoneNumber: adminPhone, email: adminEmail })
      .then(() => alert('Admin Profile ID credentials saved to Firebase Database!'));
  };

  const completedBookings = bookings.filter(b => b.status === 'COMPLETED');
  const totalRevenue = completedBookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0);
  const activeOrdersCount = bookings.filter(b => b.status !== 'COMPLETED').length;
  const partnersCount = usersList.filter(u => u.role === 'PARTNER').length || 1;

  const isAdmin = currentUser && currentUser.role === 'ADMIN';

  const activeCategories = categoriesList.length > 0 ? categoriesList : DEFAULT_CATEGORIES;
  const activeServices = servicesList.length > 0 ? servicesList : DEFAULT_SERVICES;

  const filteredOrders = bookings.filter(b => {
    const matchesQuery = !orderQuery || (b.bookingRef || '').toLowerCase().includes(orderQuery.toLowerCase()) || (b.serviceTitle || '').toLowerCase().includes(orderQuery.toLowerCase()) || (b.address || '').toLowerCase().includes(orderQuery.toLowerCase());
    const matchesStatus = orderStatusFilter === 'ALL' || b.status === orderStatusFilter;
    return matchesQuery && matchesStatus;
  });

  return (
    <div className="flex flex-col min-h-screen">
      <Header isDark={isDark} onToggleTheme={toggleTheme} currentUser={currentUser} />

      <main className="web-container py-10 flex-1 space-y-6">
        {!isAuthLoaded ? (<div className="web-card text-center py-16 text-slate-500">Loading secure session...</div>) : !isAdmin ? (
          <div className="web-card text-center py-16 max-w-lg mx-auto space-y-4">
            <Lock className="w-16 h-16 text-redPrimary mx-auto" />
            <h2 className="text-2xl font-black">Admin Access Restricted</h2>
            <p className="text-xs text-slate-500">Sign in with Admin credentials (e.g. sahrahul77@gmail.com) to access the Lead Admin Control Panel.</p>
            <Link href="/auth" className="btn-primary inline-flex">
              <LogIn className="w-4 h-4" /> Sign In as Admin
            </Link>
          </div>
        ) : (
          <>
            {/* Admin Header with Log Out Button */}
            <div className="web-card flex justify-between items-center bg-gradient-to-r from-redPrimary/20 to-transparent border border-redPrimary/30">
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-8 h-8 text-redPrimary" />
                <div>
                  <h1 className="text-2xl font-black">{adminName}</h1>
                  <p className="text-xs text-redPrimary font-bold">Lead Platform Administrator • HiMistri Gangtok</p>
                </div>
              </div>

              <button onClick={logout} className="btn-primary bg-redPrimary hover:bg-redDark text-xs py-2 px-4 shadow">
                <LogOut className="w-4 h-4" /> Log Out
              </button>
            </div>

            {/* Executive Analytics KPIs */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="web-card flex items-center gap-4">
                <div className="p-3.5 rounded-2xl bg-emerald-600/15 text-emerald-600">
                  <DollarSign className="w-7 h-7" />
                </div>
                <div>
                  <span className="text-xs text-slate-500 font-bold">Total Platform Revenue</span>
                  <p className="text-2xl font-black text-emerald-600">₹{totalRevenue}</p>
                </div>
              </div>

              <div className="web-card flex items-center gap-4">
                <div className="p-3.5 rounded-2xl bg-redPrimary/15 text-redPrimary">
                  <Package className="w-7 h-7" />
                </div>
                <div>
                  <span className="text-xs text-slate-500 font-bold">Active Customer Orders</span>
                  <p className="text-2xl font-black text-redPrimary">{activeOrdersCount}</p>
                </div>
              </div>

              <div className="web-card flex items-center gap-4">
                <div className="p-3.5 rounded-2xl bg-blue-500/15 text-blue-500">
                  <Users className="w-7 h-7" />
                </div>
                <div>
                  <span className="text-xs text-slate-500 font-bold">Total Users & Fleet</span>
                  <p className="text-2xl font-black">{usersList.length || 6}</p>
                </div>
              </div>
            </div>

            {/* Admin Tabs */}
            <div className="flex gap-2 overflow-x-auto border-b border-neutral-800 pb-3">
              {[
                { id: 0, label: `Orders (${bookings.length})` },
                { id: 1, label: 'Analytics 📊' },
                { id: 2, label: `Payment Details (₹${totalRevenue})` },
                { id: 3, label: `Partner Fleet (${partnersCount})` },
                { id: 4, label: `Registered Users (${usersList.length || 6})` },
                { id: 5, label: `Categories (${activeCategories.length})` },
                { id: 6, label: `Services (${activeServices.length})` },
                { id: 7, label: `Banners (${bannersList.length})` },
                { id: 9, label: `Cust. Experience (${testimonialsList.length})` },
                { id: 10, label: `FAQs (${faqsList.length})` },
                { id: 8, label: 'My Admin Profile ID' }
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                    activeTab === t.id ? 'bg-redPrimary text-white shadow-md' : 'bg-white dark:bg-darkSurface text-slate-400 hover:text-white'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* TAB 0: ORDERS */}
            {activeTab === 0 && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center">
                  <div className="relative flex-1 w-full">
                    <Search className="w-4 h-4 absolute left-3 top-3.5 text-slate-400" />
                    <input
                      type="text"
                      value={orderQuery}
                      onChange={(e) => setOrderQuery(e.target.value)}
                      placeholder="Search orders by Ref ID, Service, Phone, Address..."
                      className="w-full pl-9 p-2.5 rounded-xl border border-slate-200 dark:border-neutral-800 bg-white dark:bg-darkSurface text-xs font-medium"
                    />
                  </div>

                  <div className="flex gap-2 overflow-x-auto">
                    {['ALL', 'PENDING', 'CONFIRMED', 'ASSIGNED', 'ON_THE_WAY', 'COMPLETED'].map((st) => (
                      <button
                        key={st}
                        onClick={() => setOrderStatusFilter(st)}
                        className={`px-3 py-1.5 rounded-lg text-[11px] font-bold border transition ${
                          orderStatusFilter === st ? 'bg-redPrimary text-white border-redPrimary' : 'bg-white dark:bg-darkSurface border-slate-200 dark:border-neutral-800'
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>

                {filteredOrders.length === 0 ? (
                  <p className="text-xs text-slate-500 py-6">No matching customer orders in Firebase Database.</p>
                ) : (
                  filteredOrders.map((b) => (
                    <div key={b.id} className="web-card space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="font-extrabold text-sm">Ref ID: {b.bookingRef || b.id}</span>
                        <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-orangeSecondary/15 text-orangeSecondary">{b.status || 'PENDING'}</span>
                      </div>
                      <h3 className="font-bold text-base">{b.serviceTitle} • ₹{b.totalAmount}</h3>
                      <p className="text-xs text-slate-500">Customer: {b.userName || 'Passang Bhutia'} ({b.customerPhone || '+916296351107'})</p>
                      <p className="text-xs text-slate-500">Address: {b.address || 'Gangtok'}</p>

                      <div className="flex flex-wrap gap-2 pt-2">
                        <button onClick={() => handleUpdateStatus(b.id, 'CONFIRMED', 'Confirmed by Admin')} className="btn-primary text-xs py-2 px-4">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Confirm Order
                        </button>
                        <button
                          onClick={() => handleAssignPartner(b.id, 'Piku', '+919564111224', 'Home Tutor')}
                          disabled={b.status === 'PENDING'}
                          className={`btn-orange text-xs py-2 px-4 ${b.status === 'PENDING' ? 'btn-disabled' : ''}`}
                        >
                          <UserPlus className="w-3.5 h-3.5 inline mr-1" />
                          {b.status === 'PENDING' ? 'Assign Partner (Confirm First)' : 'Assign Partner Piku'}
                        </button>
                        <button onClick={() => handleDeleteItem(`bookings/${b.id}`)} className="bg-rose-700 text-white text-xs px-3.5 py-2 rounded-lg font-bold">
                          <Trash2 className="w-3.5 h-3.5 inline" /> Delete
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* TAB 1: ANALYTICS */}
            {activeTab === 1 && (
              <div className="web-card space-y-4">
                <h3 className="font-extrabold text-base flex items-center gap-2 text-redPrimary"><BarChart3 className="w-5 h-5" /> Executive Platform KPIs</h3>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="p-4 rounded-xl bg-black/20 border border-neutral-800">
                    <span className="text-xs text-slate-500 block">Avg Order Value (AOV)</span>
                    <strong className="text-lg text-emerald-500">₹900</strong>
                  </div>
                  <div className="p-4 rounded-xl bg-black/20 border border-neutral-800">
                    <span className="text-xs text-slate-500 block">Completion Rate</span>
                    <strong className="text-lg text-emerald-500">100.0%</strong>
                  </div>
                  <div className="p-4 rounded-xl bg-black/20 border border-neutral-800">
                    <span className="text-xs text-slate-500 block">Decline Rate</span>
                    <strong className="text-lg text-redPrimary">0.0%</strong>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: PAYMENT DETAILS */}
            {activeTab === 2 && (
              <div className="web-card space-y-4">
                <h3 className="font-extrabold text-base flex items-center gap-2 text-redPrimary"><CreditCard className="w-5 h-5" /> Payment Method Distribution</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl bg-black/20 border border-neutral-800 text-center">
                    <span className="text-xs text-slate-500 block">Cash on Service (COD)</span>
                    <strong className="text-base text-emerald-500">100% Volume</strong>
                  </div>
                  <div className="p-4 rounded-xl bg-black/20 border border-neutral-800 text-center">
                    <span className="text-xs text-slate-500 block">Online UPI / QR Code</span>
                    <strong className="text-base text-blue-500">Supported</strong>
                  </div>
                  <div className="p-4 rounded-xl bg-black/20 border border-neutral-800 text-center">
                    <span className="text-xs text-slate-500 block">Razorpay / Cards</span>
                    <strong className="text-base text-amber-500">Supported</strong>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: PARTNER FLEET */}
            {activeTab === 3 && (
              <div className="web-card space-y-3">
                <h3 className="font-extrabold text-base flex items-center gap-2 text-redPrimary"><HardHat className="w-5 h-5" /> Registered Service Partners</h3>
                {usersList.filter(u => u.role === 'PARTNER').map(p => (
                  <div key={p.id} className="p-4 rounded-xl bg-black/20 border border-neutral-800 flex justify-between items-center">
                    <div>
                      <strong className="text-base block">{p.fullName}</strong>
                      <span className="text-xs text-slate-400">Skill: {p.skillCategory} | Phone: {p.phoneNumber}</span>
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-600/15 text-emerald-600">🟢 ACTIVE</span>
                  </div>
                ))}
              </div>
            )}

            {/* TAB 4: REGISTERED USERS */}
            {activeTab === 4 && (
              <div className="web-card space-y-3">
                <h3 className="font-extrabold text-base flex items-center gap-2 text-redPrimary"><Users className="w-5 h-5" /> Registered User Accounts</h3>
                <div className="space-y-2">
                  {usersList.map((u) => (
                    <div key={u.id} className="p-3 rounded-lg bg-black/20 border border-neutral-800 flex justify-between items-center text-xs">
                      <div><strong>{u.fullName}</strong> ({u.email}) - {u.phoneNumber}</div>
                      <span className={`px-2 py-0.5 rounded font-bold ${u.role === 'ADMIN' ? 'bg-redPrimary/20 text-redPrimary' : u.role === 'PARTNER' ? 'bg-orangeSecondary/20 text-orangeSecondary' : 'bg-emerald-600/20 text-emerald-600'}`}>
                        {u.role}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 5: CATEGORIES MANAGER */}
            {activeTab === 5 && (
              <div className="space-y-6">
                <form onSubmit={handleAddCategory} className="web-card space-y-4">
                  <h3 className="font-extrabold text-base text-redPrimary">Add New Category</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input type="text" value={newCatName} onChange={(e) => setNewCatName(e.target.value)} placeholder="Category Name (e.g. Mason)" className="p-3 rounded-lg border border-slate-200 dark:border-neutral-700 bg-slate-100 dark:bg-neutral-800 text-sm" />
                    <input type="text" value={newCatIcon} onChange={(e) => setNewCatIcon(e.target.value)} placeholder="Icon Image URL" className="p-3 rounded-lg border border-slate-200 dark:border-neutral-700 bg-slate-100 dark:bg-neutral-800 text-sm" />
                  </div>
                  <button type="submit" className="btn-primary py-3 px-6"><Plus className="w-4 h-4" /> Add Category to Firebase</button>
                </form>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {activeCategories.map((c) => (
                    <div key={c.id} className="web-card text-center p-4 relative group">
                      <img src={c.iconUrl} alt={c.name} className="w-10 h-10 object-contain mx-auto mb-2" />
                      <strong className="text-xs block mb-2">{c.name}</strong>
                      <button onClick={() => handleDeleteItem(`categories/${c.id}`)} className="bg-rose-800/80 hover:bg-rose-800 text-white text-[10px] px-2 py-1 rounded font-bold">Delete</button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 6: SERVICES MANAGER */}
            {activeTab === 6 && (
              <div className="space-y-6">
                <form onSubmit={handleAddService} className="web-card space-y-4">
                  <h3 className="font-extrabold text-base text-redPrimary">Add New Service (Connected to Category)</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input type="text" value={newSrvTitle} onChange={(e) => setNewSrvTitle(e.target.value)} placeholder="Service Title (e.g. Pipe Leak Repair)" className="p-3 rounded-lg border border-slate-200 dark:border-neutral-700 bg-slate-100 dark:bg-neutral-800 text-sm" />
                    <select value={newSrvCatId} onChange={(e) => setNewSrvCatId(e.target.value)} className="p-3 rounded-lg border border-slate-200 dark:border-neutral-700 bg-slate-100 dark:bg-neutral-800 text-sm font-bold">
                      {activeCategories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                    <input type="number" value={newSrvPrice} onChange={(e) => setNewSrvPrice(e.target.value)} placeholder="Original Price (₹)" className="p-3 rounded-lg border border-slate-200 dark:border-neutral-700 bg-slate-100 dark:bg-neutral-800 text-sm" />
                    <input type="number" value={newSrvDiscount} onChange={(e) => setNewSrvDiscount(e.target.value)} placeholder="Discount Price (₹)" className="p-3 rounded-lg border border-slate-200 dark:border-neutral-700 bg-slate-100 dark:bg-neutral-800 text-sm" />
                    <input type="text" value={newSrvImage} onChange={(e) => setNewSrvImage(e.target.value)} placeholder="Service Icon Image URL" className="p-3 rounded-lg border border-slate-200 dark:border-neutral-700 bg-slate-100 dark:bg-neutral-800 text-sm md:col-span-2" />
                  </div>
                  <button type="submit" className="btn-primary w-full py-3"><Plus className="w-4 h-4" /> Create & Link Service to Category</button>
                </form>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {activeServices.map((s) => (
                    <div key={s.id} className="web-card flex flex-col justify-between">
                      <div>
                        <img src={s.imageUrl} alt={s.title} className="w-full h-32 object-cover rounded-lg mb-2" />
                        <span className="text-[10px] font-bold text-redPrimary uppercase">{s.categoryName}</span>
                        <h4 className="font-bold text-sm mt-0.5">{s.title}</h4>
                        <p className="text-sm font-black text-redPrimary mt-1">₹{s.discountedPrice}</p>
                      </div>
                      <button onClick={() => handleDeleteItem(`services/${s.id}`)} className="bg-rose-800/80 hover:bg-rose-800 text-white text-xs px-3 py-1.5 rounded-lg font-bold mt-3 w-full">Delete Service</button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 7: BANNERS MANAGER */}
            {activeTab === 7 && (
              <div className="space-y-6">
                <form onSubmit={handleAddBanner} className="web-card space-y-4">
                  <h3 className="font-extrabold text-base text-redPrimary">Add New Marketing Banner</h3>
                  <div className="space-y-3">
                    <input type="text" value={newBnrTitle} onChange={(e) => setNewBnrTitle(e.target.value)} placeholder="Headline Title" className="w-full p-3 rounded-lg border border-slate-200 dark:border-neutral-700 bg-slate-100 dark:bg-neutral-800 text-sm" />
                    <input type="text" value={newBnrSub} onChange={(e) => setNewBnrSub(e.target.value)} placeholder="Subtitle" className="w-full p-3 rounded-lg border border-slate-200 dark:border-neutral-700 bg-slate-100 dark:bg-neutral-800 text-sm" />
                    <input type="text" value={newBnrImg} onChange={(e) => setNewBnrImg(e.target.value)} placeholder="Banner Image URL" className="w-full p-3 rounded-lg border border-slate-200 dark:border-neutral-700 bg-slate-100 dark:bg-neutral-800 text-sm" />
                  </div>
                  <button type="submit" className="btn-primary w-full py-3"><Plus className="w-4 h-4" /> Add Banner to Firebase</button>
                </form>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {bannersList.map((b) => (
                    <div key={b.id} className="web-card flex justify-between items-center">
                      <div className="flex gap-4 items-center">
                        <img src={b.imageUrl} className="w-16 h-12 object-cover rounded-lg" alt="" />
                        <div>
                          <strong className="block text-sm font-bold">{b.title}</strong>
                          <span className="text-xs text-slate-500">{b.subtitle}</span>
                        </div>
                      </div>
                      <button onClick={() => handleDeleteItem(`banners/${b.id}`)} className="bg-rose-800 text-white text-xs px-3 py-1.5 rounded-lg font-bold">Delete</button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 9: CUSTOMER EXPERIENCE (TESTIMONIALS) */}
            {activeTab === 9 && (
              <div className="space-y-6">
                <form onSubmit={handleAddTestimonial} className="web-card space-y-4">
                  <h3 className="font-extrabold text-base text-redPrimary">Add Customer Experience Review</h3>
                  <div className="space-y-3">
                    <input type="text" value={newTestName} onChange={(e) => setNewTestName(e.target.value)} placeholder="Customer Name (e.g. Nisha Kumari)" className="w-full p-3 rounded-lg border border-slate-200 dark:border-neutral-700 bg-slate-100 dark:bg-neutral-800 text-sm" />
                    <input type="text" value={newTestLoc} onChange={(e) => setNewTestLoc(e.target.value)} placeholder="Location (e.g. Upper Syari, Gangtok)" className="w-full p-3 rounded-lg border border-slate-200 dark:border-neutral-700 bg-slate-100 dark:bg-neutral-800 text-sm" />
                    <textarea value={newTestText} onChange={(e) => setNewTestText(e.target.value)} placeholder="Review Content..." rows={3} className="w-full p-3 rounded-lg border border-slate-200 dark:border-neutral-700 bg-slate-100 dark:bg-neutral-800 text-sm"></textarea>
                  </div>
                  <button type="submit" className="btn-primary w-full py-3"><Plus className="w-4 h-4" /> Add Review to Firebase</button>
                </form>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {testimonialsList.map((t) => (
                    <div key={t.id} className="web-card space-y-2 relative">
                      <strong className="block text-sm font-bold">{t.name} <span className="text-xs font-normal text-slate-400">({t.location})</span></strong>
                      <p className="text-xs text-slate-300 italic">"{t.text}"</p>
                      <button onClick={() => handleDeleteItem(`testimonials/${t.id}`)} className="absolute top-4 right-4 bg-rose-800 text-white text-xs px-2 py-1 rounded-lg font-bold">Delete</button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 10: FAQs */}
            {activeTab === 10 && (
              <div className="space-y-6">
                <form onSubmit={handleAddFaq} className="web-card space-y-4">
                  <h3 className="font-extrabold text-base text-redPrimary">Add Frequently Asked Question</h3>
                  <div className="space-y-3">
                    <input type="text" value={newFaqQ} onChange={(e) => setNewFaqQ(e.target.value)} placeholder="Question" className="w-full p-3 rounded-lg border border-slate-200 dark:border-neutral-700 bg-slate-100 dark:bg-neutral-800 text-sm" />
                    <textarea value={newFaqA} onChange={(e) => setNewFaqA(e.target.value)} placeholder="Answer" rows={3} className="w-full p-3 rounded-lg border border-slate-200 dark:border-neutral-700 bg-slate-100 dark:bg-neutral-800 text-sm"></textarea>
                  </div>
                  <button type="submit" className="btn-primary w-full py-3"><Plus className="w-4 h-4" /> Add FAQ to Firebase</button>
                </form>

                <div className="grid grid-cols-1 gap-4">
                  {faqsList.map((f) => (
                    <div key={f.id} className="web-card space-y-2 relative">
                      <strong className="block text-sm font-bold text-redPrimary">Q: {f.q}</strong>
                      <p className="text-xs text-slate-300">A: {f.a}</p>
                      <button onClick={() => handleDeleteItem(`faqs/${f.id}`)} className="absolute top-4 right-4 bg-rose-800 text-white text-xs px-2 py-1 rounded-lg font-bold">Delete</button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 8: ADMIN PROFILE */}
            {activeTab === 8 && (
              <form onSubmit={handleSaveAdminProfile} className="web-card space-y-4">
                <h3 className="font-extrabold text-base text-redPrimary">Edit Admin Profile ID Credentials</h3>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Admin Name</label>
                  <input type="text" value={adminName} onChange={(e) => setAdminName(e.target.value)} className="w-full p-3 rounded-lg border border-slate-200 dark:border-neutral-700 bg-slate-100 dark:bg-neutral-800 text-sm font-semibold" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Phone</label>
                  <input type="text" value={adminPhone} onChange={(e) => setAdminPhone(e.target.value)} className="w-full p-3 rounded-lg border border-slate-200 dark:border-neutral-700 bg-slate-100 dark:bg-neutral-800 text-sm font-semibold" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Email</label>
                  <input type="text" value={adminEmail} onChange={(e) => setAdminEmail(e.target.value)} className="w-full p-3 rounded-lg border border-slate-200 dark:border-neutral-700 bg-slate-100 dark:bg-neutral-800 text-sm font-semibold" />
                </div>
                <button type="submit" className="btn-primary w-full py-3">
                  Save Admin Profile Credentials to Firebase
                </button>
              </form>
            )}
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
