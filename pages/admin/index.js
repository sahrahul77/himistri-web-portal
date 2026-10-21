import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { motion, AnimatePresence } from 'framer-motion';
import { ref, onValue, update, remove, set, push } from 'firebase/database';
import { rtdb } from '../../lib/firebase';
import { useAuth } from '../../lib/AuthContext';
import {
  ShieldCheck, Users, DollarSign, Package, Plus, Trash2, CheckCircle2, UserPlus, Lock, LogIn, LogOut,
  BarChart3, CreditCard, HardHat, Image as ImageIcon, Layers, Wrench, Search, Phone, Mail, Edit, MessageSquare, X, User, Check, TrendingUp, ShoppingBag, Clock, Award, Save, Bike, ChevronLeft, ChevronRight
} from 'lucide-react';

export default function AdminControlPanelPage() {
  const [isDark, setIsDark] = useState(true);
  const [activeTab, setActiveTab] = useState(0); // 0=Orders, 1=Analytics, 2=Payment, 3=Fleet, 4=Users, 5=Categories, 6=Services, 7=Banners, 8=Profile, 9=Testimonials, 10=FAQs

  // Slider Index States for Admin Tabs
  const [orderSliderIdx, setOrderSliderIdx] = useState(0);
  const [catSliderIdx, setCatSliderIdx] = useState(0);
  const [srvSliderIdx, setSrvSliderIdx] = useState(0);
  const [bnrSliderIdx, setBnrSliderIdx] = useState(0);
  const [testSliderIdx, setTestSliderIdx] = useState(0);
  const [faqSliderIdx, setFaqSliderIdx] = useState(0);

  // Realtime Firebase States
  const [bookings, setBookings] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [categoriesList, setCategoriesList] = useState([]);
  const [servicesList, setServicesList] = useState([]);
  const [bannersList, setBannersList] = useState([]);
  const [testimonialsList, setTestimonialsList] = useState([]);
  const [faqsList, setFaqsList] = useState([]);

  // Delete Confirmation Modal State
  const [deletingPath, setDeletingPath] = useState(null);

  // Edit Item Modal States
  const [editingCategory, setEditingCategory] = useState(null);
  const [editingService, setEditingService] = useState(null);
  const [editingBanner, setEditingBanner] = useState(null);
  const [editingTestimonial, setEditingTestimonial] = useState(null);
  const [editingFaq, setEditingFaq] = useState(null);

  // Selected Booking for Assign Partner Modal
  const [assigningBooking, setAssigningBooking] = useState(null);
  const [assignFilterTab, setAssignFilterTab] = useState(0); // 0=Skill Matched, 1=Free, 2=All Fleet

  const { currentUser, logout, isAuthLoaded } = useAuth();

  // Search & Filter States
  const [orderQuery, setOrderQuery] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('ALL');

  // New Creation Forms
  const [newCatName, setNewCatName] = useState('');
  const [newCatIcon, setNewCatIcon] = useState('');

  const [newSrvTitle, setNewSrvTitle] = useState('');
  const [newSrvCatId, setNewSrvCatId] = useState('');
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

  // Robust Snapshot Parser to retrieve ALL entries from Firebase Database
  const parseFirebaseSnapshot = (snapshot) => {
    const list = [];
    if (snapshot && snapshot.exists()) {
      const val = snapshot.val();
      if (Array.isArray(val)) {
        val.forEach((item, index) => {
          if (item) list.push({ id: item.id || index.toString(), ...item });
        });
      } else if (typeof val === 'object' && val !== null) {
        Object.keys(val).forEach((key) => {
          if (val[key]) {
            list.push({ id: key, ...val[key] });
          }
        });
      }
    }
    return list;
  };

  useEffect(() => {
    // 1. Listen to Bookings
    const unsubBookings = onValue(ref(rtdb, 'bookings'), (snapshot) => {
      const list = parseFirebaseSnapshot(snapshot);
      list.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
      setBookings(list);
    });

    // 2. Listen to All Users
    const unsubUsers = onValue(ref(rtdb, 'users'), (snapshot) => {
      const list = parseFirebaseSnapshot(snapshot);
      setUsersList(list);
    });

    // 3. Listen to All Categories
    const unsubCategories = onValue(ref(rtdb, 'categories'), (snapshot) => {
      const list = parseFirebaseSnapshot(snapshot);
      setCategoriesList(list);
      if (list.length > 0 && !newSrvCatId) {
        setNewSrvCatId(list[0].id);
      }
    });

    // 4. Listen to All Services
    const unsubServices = onValue(ref(rtdb, 'services'), (snapshot) => {
      const list = parseFirebaseSnapshot(snapshot);
      setServicesList(list);
    });

    // 5. Listen to Banners
    const unsubBanners = onValue(ref(rtdb, 'banners'), (snapshot) => {
      const list = parseFirebaseSnapshot(snapshot);
      setBannersList(list);
    });

    // 6. Listen to Testimonials
    const unsubTestimonials = onValue(ref(rtdb, 'testimonials'), (snapshot) => {
      const list = parseFirebaseSnapshot(snapshot);
      setTestimonialsList(list);
    });

    // 7. Listen to FAQs
    const unsubFaqs = onValue(ref(rtdb, 'faqs'), (snapshot) => {
      const list = parseFirebaseSnapshot(snapshot);
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

  const handleAssignPartnerConfirm = (bookingId, partnerObj) => {
    update(ref(rtdb, `bookings/${bookingId}`), {
      status: 'ASSIGNED',
      assignedPartnerId: partnerObj.id,
      assignedPartnerName: partnerObj.fullName,
      assignedPartnerPhone: partnerObj.phoneNumber,
      assignedPartnerSkill: partnerObj.skillCategory || 'Specialist',
      trackingStatus: `Mistri ${partnerObj.fullName} assigned to order`
    }).then(() => {
      alert(`Partner ${partnerObj.fullName} assigned to order!`);
      setAssigningBooking(null);
    });
  };

  // Add Item Handlers
  const handleAddCategory = (e) => {
    e.preventDefault();
    if (!newCatName) return alert('Category Name is required.');
    const newRef = push(ref(rtdb, 'categories'));
    const catId = newRef.key;
    set(newRef, { id: catId, name: newCatName, iconUrl: newCatIcon || 'https://cdn-icons-png.flaticon.com/512/3079/3079203.png' })
      .then(() => { alert(`New Category '${newCatName}' created in Firebase!`); setNewCatName(''); setNewCatIcon(''); });
  };

  const handleAddService = (e) => {
    e.preventDefault();
    if (!newSrvTitle) return alert('Service Title is required.');
    const newRef = push(ref(rtdb, 'services'));
    const srvId = newRef.key;
    const catObj = categoriesList.find(c => c.id === newSrvCatId) || categoriesList[0] || { id: 'cat_gen', name: 'General' };

    set(newRef, {
      id: srvId,
      categoryId: catObj.id,
      categoryName: catObj.name,
      title: newSrvTitle,
      originalPrice: parseFloat(newSrvPrice) || 1000,
      discountedPrice: parseFloat(newSrvDiscount) || (parseFloat(newSrvPrice) || 1000),
      imageUrl: newSrvImage || 'https://cdn-icons-png.flaticon.com/512/3079/3079203.png'
    }).then(() => {
      alert(`New Service '${newSrvTitle}' connected to Category '${catObj.name}' and saved to Firebase!`);
      setNewSrvTitle(''); setNewSrvPrice(''); setNewSrvDiscount(''); setNewSrvImage('');
    });
  };

  const handleAddBanner = (e) => {
    e.preventDefault();
    if (!newBnrTitle) return alert('Banner Title is required.');
    const newRef = push(ref(rtdb, 'banners'));
    const bnrId = newRef.key;
    set(newRef, {
      id: bnrId,
      title: newBnrTitle,
      subtitle: newBnrSub || 'Doorstep Services across Gangtok',
      imageUrl: newBnrImg || 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=1200&q=80'
    }).then(() => { alert('New Marketing Banner saved to Firebase!'); setNewBnrTitle(''); setNewBnrSub(''); setNewBnrImg(''); });
  };

  const handleAddTestimonial = (e) => {
    e.preventDefault();
    if (!newTestName || !newTestText) return alert('Name and Review Text required.');
    const newRef = push(ref(rtdb, 'testimonials'));
    const testId = newRef.key;
    set(newRef, {
      id: testId,
      name: newTestName,
      location: newTestLoc || 'Gangtok, Sikkim',
      text: newTestText,
      rating: 5,
      service: 'Verified Customer'
    }).then(() => { alert('New Customer Experience Review saved to Firebase!'); setNewTestName(''); setNewTestLoc(''); setNewTestText(''); });
  };

  const handleAddFaq = (e) => {
    e.preventDefault();
    if (!newFaqQ || !newFaqA) return alert('Question and Answer required.');
    const newRef = push(ref(rtdb, 'faqs'));
    const faqId = newRef.key;
    set(newRef, {
      id: faqId,
      q: newFaqQ,
      a: newFaqA
    }).then(() => { alert('New FAQ saved to Firebase!'); setNewFaqQ(''); setNewFaqA(''); });
  };

  // Edit Item Handlers
  const handleSaveCategoryEdit = (e) => {
    e.preventDefault();
    if (!editingCategory) return;
    update(ref(rtdb, `categories/${editingCategory.id}`), {
      name: editingCategory.name,
      iconUrl: editingCategory.iconUrl
    }).then(() => { alert('Category updated successfully!'); setEditingCategory(null); });
  };

  const handleSaveServiceEdit = (e) => {
    e.preventDefault();
    if (!editingService) return;
    update(ref(rtdb, `services/${editingService.id}`), {
      title: editingService.title,
      originalPrice: parseFloat(editingService.originalPrice) || 1000,
      discountedPrice: parseFloat(editingService.discountedPrice) || 800,
      imageUrl: editingService.imageUrl,
      categoryName: editingService.categoryName
    }).then(() => { alert('Service updated successfully!'); setEditingService(null); });
  };

  const handleSaveBannerEdit = (e) => {
    e.preventDefault();
    if (!editingBanner) return;
    update(ref(rtdb, `banners/${editingBanner.id}`), {
      title: editingBanner.title,
      subtitle: editingBanner.subtitle,
      imageUrl: editingBanner.imageUrl
    }).then(() => { alert('Banner updated successfully!'); setEditingBanner(null); });
  };

  const handleSaveTestimonialEdit = (e) => {
    e.preventDefault();
    if (!editingTestimonial) return;
    update(ref(rtdb, `testimonials/${editingTestimonial.id}`), {
      name: editingTestimonial.name,
      location: editingTestimonial.location,
      text: editingTestimonial.text,
      rating: parseInt(editingTestimonial.rating) || 5
    }).then(() => { alert('Customer Experience review updated successfully!'); setEditingTestimonial(null); });
  };

  const handleSaveFaqEdit = (e) => {
    e.preventDefault();
    if (!editingFaq) return;
    update(ref(rtdb, `faqs/${editingFaq.id}`), {
      q: editingFaq.q,
      a: editingFaq.a
    }).then(() => { alert('FAQ updated successfully!'); setEditingFaq(null); });
  };

  const handleSaveAdminProfile = (e) => {
    e.preventDefault();
    update(ref(rtdb, 'users/bLfKYzhws9d7zozkzwyemQPI8bG3'), { fullName: adminName, phoneNumber: adminPhone, email: adminEmail })
      .then(() => alert('Admin Profile ID credentials saved to Firebase Database!'));
  };

  const completedBookings = bookings.filter(b => b.status === 'COMPLETED');
  const totalRevenue = completedBookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0);
  const activeOrdersCount = bookings.filter(b => b.status !== 'COMPLETED').length;

  // Retrieve ALL Registered Service Partners from Firebase Users
  const allPartnersList = usersList.filter(u => {
    const roleUpper = (u.role || '').toUpperCase();
    return roleUpper === 'PARTNER' || roleUpper === 'SERVICE_PARTNER' || u.skillCategory;
  });

  const isAdmin = currentUser && currentUser.role === 'ADMIN';

  const filteredOrders = bookings.filter(b => {
    const matchesQuery = !orderQuery || (b.bookingRef || '').toLowerCase().includes(orderQuery.toLowerCase()) || (b.serviceTitle || '').toLowerCase().includes(orderQuery.toLowerCase()) || (b.address || '').toLowerCase().includes(orderQuery.toLowerCase());
    const matchesStatus = orderStatusFilter === 'ALL' || b.status === orderStatusFilter;
    return matchesQuery && matchesStatus;
  });

  // Assign Partner Filtering Logic inside Modal
  const getModalPartners = () => {
    if (!assigningBooking) return [];
    const serviceCategoryName = (assigningBooking.serviceCategory || '').toLowerCase();
    const serviceTitleName = (assigningBooking.serviceTitle || '').toLowerCase();

    const skillMatched = allPartnersList.filter(p => {
      const pSkill = (p.skillCategory || '').toLowerCase();
      return pSkill && (serviceCategoryName.includes(pSkill) || serviceTitleName.includes(pSkill) || pSkill.includes(serviceCategoryName));
    });

    const freePartners = allPartnersList.filter(p => p.isOnline === true || p.isOnline === 'true');

    if (assignFilterTab === 0) return skillMatched.length > 0 ? skillMatched : allPartnersList;
    if (assignFilterTab === 1) return freePartners;
    return allPartnersList;
  };

  const modalPartners = getModalPartners();
  const skillMatchedCount = allPartnersList.filter(p => {
    if (!assigningBooking) return false;
    const pSkill = (p.skillCategory || '').toLowerCase();
    const serviceCategoryName = (assigningBooking.serviceCategory || '').toLowerCase();
    const serviceTitleName = (assigningBooking.serviceTitle || '').toLowerCase();
    return pSkill && (serviceCategoryName.includes(pSkill) || serviceTitleName.includes(pSkill) || pSkill.includes(serviceCategoryName));
  }).length;
  const freePartnersCount = allPartnersList.filter(p => p.isOnline === true || p.isOnline === 'true').length;

  const currentOrder = filteredOrders[orderSliderIdx] || filteredOrders[0];

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
                  <p className="text-2xl font-black">{usersList.length}</p>
                </div>
              </div>
            </div>

            {/* Admin Navigation Tabs */}
            <div className="flex gap-2 overflow-x-auto border-b border-neutral-800 pb-3">
              {[
                { id: 0, label: `Orders (${bookings.length})` },
                { id: 1, label: 'Analytics 📊' },
                { id: 2, label: `Payment Details (₹${totalRevenue})` },
                { id: 3, label: `Partner Fleet (${allPartnersList.length})` },
                { id: 4, label: `Registered Users (${usersList.length})` },
                { id: 5, label: `Categories (${categoriesList.length})` },
                { id: 6, label: `Services (${servicesList.length})` },
                { id: 7, label: `Banners (${bannersList.length})` },
                { id: 9, label: `Cust. Experience (${testimonialsList.length})` },
                { id: 10, label: `FAQs (${faqsList.length})` },
                { id: 8, label: 'My Admin Profile ID' }
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => { setActiveTab(t.id); setOrderSliderIdx(0); setCatSliderIdx(0); setSrvSliderIdx(0); setBnrSliderIdx(0); setTestSliderIdx(0); setFaqSliderIdx(0); }}
                  className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                    activeTab === t.id ? 'bg-redPrimary text-white shadow-md' : 'bg-white dark:bg-darkSurface text-slate-400 hover:text-white'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* TAB 0: ORDERS (With Sub-Tabs after ON_THE_WAY: IN_PROGRESS / ARRIVED WORK STARTED) */}
            {activeTab === 0 && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center">
                  <div className="relative flex-1 w-full">
                    <Search className="w-4 h-4 absolute left-3 top-3.5 text-slate-400" />
                    <input
                      type="text"
                      value={orderQuery}
                      onChange={(e) => { setOrderQuery(e.target.value); setOrderSliderIdx(0); }}
                      placeholder="Search orders by Ref ID, Service, Phone, Address..."
                      className="w-full pl-9 p-2.5 rounded-xl border border-slate-200 dark:border-neutral-800 bg-white dark:bg-darkSurface text-xs font-medium"
                    />
                  </div>

                  {/* Sub-Tabs including ARRIVED / WORK STARTED after ON_THE_WAY */}
                  <div className="flex gap-2 overflow-x-auto">
                    {['ALL', 'PENDING', 'CONFIRMED', 'ASSIGNED', 'ON_THE_WAY', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'].map((st) => (
                      <button
                        key={st}
                        onClick={() => { setOrderStatusFilter(st); setOrderSliderIdx(0); }}
                        className={`px-3 py-1.5 rounded-lg text-[11px] font-bold border transition ${
                          orderStatusFilter === st ? 'bg-redPrimary text-white border-redPrimary' : 'bg-white dark:bg-darkSurface border-slate-200 dark:border-neutral-800'
                        }`}
                      >
                        {st === 'IN_PROGRESS' ? 'ARRIVED / WORK STARTED' : st}
                      </button>
                    ))}
                  </div>
                </div>

                {filteredOrders.length === 0 ? (
                  <p className="text-xs text-slate-500 py-6">No matching customer orders in Firebase Database.</p>
                ) : (
                  <div className="space-y-4">
                    {/* Order Slider Controls */}
                    <div className="flex justify-between items-center px-1">
                      <span className="text-xs font-bold text-slate-400">
                        Order <span className="text-redPrimary font-black">{orderSliderIdx + 1}</span> of {filteredOrders.length}
                      </span>

                      {filteredOrders.length > 1 && (
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setOrderSliderIdx((prev) => (prev - 1 + filteredOrders.length) % filteredOrders.length)}
                            className="p-2 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-redPrimary text-white transition"
                          >
                            <ChevronLeft className="w-4 h-4" />
                          </button>
                          <span className="text-xs font-black text-slate-300">
                            {orderSliderIdx + 1} / {filteredOrders.length}
                          </span>
                          <button
                            type="button"
                            onClick={() => setOrderSliderIdx((prev) => (prev + 1) % filteredOrders.length)}
                            className="p-2 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-redPrimary text-white transition"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Animated Single Order Card Slider */}
                    {currentOrder && (
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={currentOrder.id || orderSliderIdx}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          transition={{ duration: 0.25 }}
                          className="web-card space-y-3 shadow-2xl relative"
                        >
                          <div className="flex justify-between items-center pb-2 border-b border-neutral-800">
                            <span className="font-extrabold text-sm text-white">Ref ID: {currentOrder.bookingRef || currentOrder.id}</span>
                            <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-orangeSecondary/15 text-orangeSecondary">{currentOrder.status || 'PENDING'}</span>
                          </div>

                          <h3 className="font-bold text-lg text-white">{currentOrder.serviceTitle} • ₹{currentOrder.totalAmount} <span className="text-xs text-slate-400">(Qty: {currentOrder.quantity || 1})</span></h3>
                          <p className="text-xs text-slate-400">Customer: <strong className="text-white">{currentOrder.userName || 'Passang Bhutia'}</strong> ({currentOrder.customerPhone || '+916296351107'})</p>

                          {/* Service Address */}
                          <p className="text-xs text-slate-400">Address: <strong className="text-white">{currentOrder.address || 'Gangtok'}</strong></p>

                          {/* LIVE STATUS BAR RIGHT BELOW ADDRESS */}
                          <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center gap-2 text-xs font-bold text-orangeSecondary">
                            <Bike className="w-4 h-4 text-orangeSecondary" />
                            <span>Live Status: {currentOrder.trackingStatus || 'Order Placed by Customer'}</span>
                          </div>

                          {/* Assigned Partner Details */}
                          {currentOrder.assignedPartnerName && (
                            <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs flex justify-between items-center text-blue-400">
                              <div>
                                <strong>Assigned Mistri: {currentOrder.assignedPartnerName}</strong> ({currentOrder.assignedPartnerSkill || 'Specialist'})
                              </div>
                              {currentOrder.assignedPartnerPhone && (
                                <a href={`tel:${currentOrder.assignedPartnerPhone}`} className="text-emerald-500 font-bold underline">Call Mistri</a>
                              )}
                            </div>
                          )}

                          {/* Action Buttons */}
                          <div className="flex flex-wrap gap-2 pt-2 border-t border-neutral-800">
                            {/* Confirm Order Button - Disabled once confirmed */}
                            <button
                              onClick={() => handleUpdateStatus(currentOrder.id, 'CONFIRMED', 'Confirmed by Admin')}
                              disabled={currentOrder.status !== 'PENDING'}
                              className={`text-xs py-2.5 px-4 rounded-xl font-bold transition shadow-sm ${
                                currentOrder.status !== 'PENDING'
                                  ? 'bg-neutral-800 text-slate-500 border border-neutral-700 cursor-not-allowed opacity-50'
                                  : 'btn-primary bg-redPrimary hover:bg-redDark text-white cursor-pointer'
                              }`}
                            >
                              <CheckCircle2 className="w-3.5 h-3.5 inline mr-1" />
                              {currentOrder.status === 'PENDING' ? 'Confirm Order' : '✓ Confirmed'}
                            </button>

                            {/* Assign Partner Button - DISABLED ONCE PARTNER IS ASSIGNED */}
                            <button
                              onClick={() => setAssigningBooking(currentOrder)}
                              disabled={currentOrder.status !== 'CONFIRMED'}
                              className={`text-xs py-2.5 px-4 rounded-xl font-bold transition shadow-sm ${
                                currentOrder.status !== 'CONFIRMED'
                                  ? 'bg-neutral-800 text-slate-500 border border-neutral-700 cursor-not-allowed opacity-50'
                                  : 'bg-orangeSecondary hover:bg-orange-600 text-white cursor-pointer'
                              }`}
                            >
                              <UserPlus className="w-3.5 h-3.5 inline mr-1" />
                              {currentOrder.status === 'PENDING'
                                ? 'Assign Partner (Confirm First)'
                                : currentOrder.status === 'CONFIRMED'
                                ? 'Assign Partner'
                                : `✓ ${currentOrder.assignedPartnerName ? 'Assigned to ' + currentOrder.assignedPartnerName.split(' ')[0] : 'Partner Assigned'}`}
                            </button>

                            <button onClick={() => setDeletingPath(`bookings/${currentOrder.id}`)} className="bg-rose-700 text-white text-xs px-3.5 py-2.5 rounded-xl font-bold">
                              <Trash2 className="w-3.5 h-3.5 inline" /> Delete
                            </button>
                          </div>
                        </motion.div>
                      </AnimatePresence>
                    )}

                    {/* Dots Indicator for Orders Slider */}
                    {filteredOrders.length > 1 && (
                      <div className="flex justify-center gap-2 pt-2">
                        {filteredOrders.map((_, i) => (
                          <button
                            key={i}
                            onClick={() => setOrderSliderIdx(i)}
                            className={`h-2 rounded-full transition-all ${
                              orderSliderIdx === i ? 'w-8 bg-redPrimary' : 'w-2 bg-neutral-700 hover:bg-neutral-500'
                            }`}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* TAB 1: ANALYTICS */}
            {activeTab === 1 && (
              <div className="space-y-6">
                <div className="web-card space-y-4">
                  <h3 className="font-extrabold text-base flex items-center gap-2 text-redPrimary">
                    <TrendingUp className="w-5 h-5" /> Executive Realtime Sales & Operations Analytics
                  </h3>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                    <div className="p-4 rounded-xl bg-black/20 border border-neutral-800">
                      <span className="text-xs text-slate-500 block font-bold">Gross GMV</span>
                      <strong className="text-xl text-emerald-500 font-black">₹{totalRevenue * 1.25}</strong>
                    </div>
                    <div className="p-4 rounded-xl bg-black/20 border border-neutral-800">
                      <span className="text-xs text-slate-500 block font-bold">Platform Revenue (20%)</span>
                      <strong className="text-xl text-emerald-500 font-black">₹{totalRevenue * 0.20}</strong>
                    </div>
                    <div className="p-4 rounded-xl bg-black/20 border border-neutral-800">
                      <span className="text-xs text-slate-500 block font-bold">Fulfillment Speed</span>
                      <strong className="text-xl text-blue-400 font-black">24 Mins</strong>
                    </div>
                    <div className="p-4 rounded-xl bg-black/20 border border-neutral-800">
                      <span className="text-xs text-slate-500 block font-bold">Order Success Rate</span>
                      <strong className="text-xl text-emerald-500 font-black">98.5%</strong>
                    </div>
                  </div>
                </div>

                <div className="web-card space-y-3">
                  <h4 className="font-bold text-sm text-slate-300">Live Order Status Funnel</h4>
                  <div className="space-y-2">
                    {['PENDING', 'CONFIRMED', 'ASSIGNED', 'ON_THE_WAY', 'IN_PROGRESS', 'COMPLETED'].map((st) => {
                      const count = bookings.filter(b => b.status === st).length;
                      const percentage = bookings.length > 0 ? Math.round((count / bookings.length) * 100) : 0;
                      return (
                        <div key={st} className="space-y-1">
                          <div className="flex justify-between text-xs font-bold">
                            <span className="text-slate-400">{st === 'IN_PROGRESS' ? 'ARRIVED / WORK STARTED' : st}</span>
                            <span className="text-white">{count} orders ({percentage}%)</span>
                          </div>
                          <div className="w-full h-2 rounded-full bg-neutral-800 overflow-hidden">
                            <div className="h-full bg-redPrimary transition-all duration-500" style={{ width: `${Math.max(5, percentage)}%` }}></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: PAYMENT DETAILS */}
            {activeTab === 2 && (
              <div className="space-y-6">
                <div className="web-card space-y-4">
                  <h3 className="font-extrabold text-base flex items-center gap-2 text-redPrimary">
                    <CreditCard className="w-5 h-5" /> Financial Revenue & Payment Method Distribution
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-4 rounded-xl bg-black/20 border border-neutral-800 text-center">
                      <span className="text-xs text-slate-500 block font-bold mb-1">Cash on Service (COD)</span>
                      <strong className="text-lg text-emerald-500 font-black">85% Volume</strong>
                      <p className="text-[10px] text-slate-400 mt-1">Collected directly by partner mistris</p>
                    </div>

                    <div className="p-4 rounded-xl bg-black/20 border border-neutral-800 text-center">
                      <span className="text-xs text-slate-500 block font-bold mb-1">Online UPI / QR Code</span>
                      <strong className="text-lg text-blue-400 font-black">10% Volume</strong>
                      <p className="text-[10px] text-slate-400 mt-1">Instant Google Pay & PhonePe</p>
                    </div>

                    <div className="p-4 rounded-xl bg-black/20 border border-neutral-800 text-center">
                      <span className="text-xs text-slate-500 block font-bold mb-1">Razorpay Gateway Cards</span>
                      <strong className="text-lg text-amber-400 font-black">5% Volume</strong>
                      <p className="text-[10px] text-slate-400 mt-1">Netbanking, Credit & Debit Cards</p>
                    </div>
                  </div>
                </div>

                <div className="web-card space-y-3">
                  <h4 className="font-bold text-sm text-slate-300">Partner Settlement Payout Ledger</h4>
                  <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 flex justify-between items-center text-xs">
                    <div>
                      <strong className="text-white block text-sm">80% Partner Net Share Payout</strong>
                      <span className="text-slate-400">Total payable to verified craftsmen for completed jobs</span>
                    </div>
                    <span className="text-lg font-black text-emerald-500">₹{totalRevenue * 0.80}</span>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: PARTNER FLEET */}
            {activeTab === 3 && (
              <div className="web-card space-y-3">
                <h3 className="font-extrabold text-base flex items-center gap-2 text-redPrimary"><HardHat className="w-5 h-5" /> Registered Service Partners ({allPartnersList.length})</h3>
                {allPartnersList.length === 0 ? (
                  <p className="text-xs text-slate-500 py-6">No service partners registered in Firebase Database yet.</p>
                ) : (
                  allPartnersList.map(p => {
                    const isOnline = p.isOnline === true || p.isOnline === 'true';
                    return (
                      <div key={p.id} className="p-4 rounded-xl bg-black/20 border border-neutral-800 flex justify-between items-center">
                        <div>
                          <strong className="text-base block">{p.fullName || 'Partner'}</strong>
                          <span className="text-xs text-slate-400">Skill: {p.skillCategory || 'Specialist'} | Phone: {p.phoneNumber || 'N/A'}</span>
                        </div>
                        <div className="flex gap-2 items-center">
                          <span className={`px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-wider ${
                            isOnline ? 'bg-emerald-600/20 text-emerald-500 border border-emerald-600/30' : 'bg-slate-700/50 text-slate-400 border border-slate-600/30'
                          }`}>
                            {isOnline ? '🟢 ONLINE' : '⚫ OFFLINE'}
                          </span>
                          <button onClick={() => setDeletingPath(`users/${p.id}`)} className="bg-rose-800 text-white text-xs px-3 py-1.5 rounded-xl font-bold">Delete Partner</button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {/* TAB 4: REGISTERED USERS */}
            {activeTab === 4 && (
              <div className="web-card space-y-3">
                <h3 className="font-extrabold text-base flex items-center gap-2 text-redPrimary"><Users className="w-5 h-5" /> Registered User Accounts ({usersList.length})</h3>
                <div className="space-y-2">
                  {usersList.map((u) => (
                    <div key={u.id} className="p-3 rounded-lg bg-black/20 border border-neutral-800 flex justify-between items-center text-xs">
                      <div><strong>{u.fullName || 'User'}</strong> ({u.email || 'N/A'}) - {u.phoneNumber || 'N/A'}</div>
                      <div className="flex gap-2 items-center">
                        <span className={`px-2 py-0.5 rounded font-bold ${ (u.role || '').toUpperCase() === 'ADMIN' ? 'bg-redPrimary/20 text-redPrimary' : (u.role || '').toUpperCase().includes('PARTNER') ? 'bg-orangeSecondary/20 text-orangeSecondary' : 'bg-emerald-600/20 text-emerald-600'}`}>
                          {u.role || 'CUSTOMER'}
                        </span>
                        <button onClick={() => setDeletingPath(`users/${u.id}`)} className="bg-rose-800 text-white text-[10px] px-2 py-0.5 rounded font-bold">Delete</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 5: CATEGORIES MANAGER (With Interactive Slider) */}
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

                {categoriesList.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center px-1">
                      <span className="text-xs font-bold text-slate-400">
                        Category <span className="text-redPrimary font-black">{catSliderIdx + 1}</span> of {categoriesList.length}
                      </span>
                      {categoriesList.length > 1 && (
                        <div className="flex items-center gap-2">
                          <button type="button" onClick={() => setCatSliderIdx((prev) => (prev - 1 + categoriesList.length) % categoriesList.length)} className="p-2 rounded-xl bg-neutral-900 border border-neutral-800 text-white hover:border-redPrimary"><ChevronLeft className="w-4 h-4" /></button>
                          <span className="text-xs font-black text-slate-300">{catSliderIdx + 1} / {categoriesList.length}</span>
                          <button type="button" onClick={() => setCatSliderIdx((prev) => (prev + 1) % categoriesList.length)} className="p-2 rounded-xl bg-neutral-900 border border-neutral-800 text-white hover:border-redPrimary"><ChevronRight className="w-4 h-4" /></button>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      {categoriesList.map((c, idx) => (
                        <div key={c.id} className={`web-card text-center p-4 relative group flex flex-col justify-between transition-all ${idx === catSliderIdx ? 'border-2 border-redPrimary bg-redPrimary/10 shadow-xl scale-105' : ''}`}>
                          <div>
                            <img src={c.iconUrl || 'https://cdn-icons-png.flaticon.com/512/3079/3079203.png'} alt={c.name} className="w-10 h-10 object-contain mx-auto mb-2" />
                            <strong className="text-xs block mb-2 text-white">{c.name}</strong>
                          </div>
                          <div className="flex gap-2 justify-center mt-2">
                            <button onClick={() => setEditingCategory({ ...c })} className="bg-blue-600 hover:bg-blue-700 text-white text-[10px] px-2 py-1 rounded font-bold">Edit</button>
                            <button onClick={() => setDeletingPath(`categories/${c.id}`)} className="bg-rose-800 hover:bg-rose-900 text-white text-[10px] px-2 py-1 rounded font-bold">Delete</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 6: SERVICES MANAGER (With Interactive Slider) */}
            {activeTab === 6 && (
              <div className="space-y-6">
                <form onSubmit={handleAddService} className="web-card space-y-4">
                  <h3 className="font-extrabold text-base text-redPrimary">Add New Service (Connected to Category)</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input type="text" value={newSrvTitle} onChange={(e) => setNewSrvTitle(e.target.value)} placeholder="Service Title (e.g. Pipe Leak Repair)" className="p-3 rounded-lg border border-slate-200 dark:border-neutral-700 bg-slate-100 dark:bg-neutral-800 text-sm" />
                    <select value={newSrvCatId} onChange={(e) => setNewSrvCatId(e.target.value)} className="p-3 rounded-lg border border-slate-200 dark:border-neutral-700 bg-slate-100 dark:bg-neutral-800 text-sm font-bold">
                      {categoriesList.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                    <input type="number" value={newSrvPrice} onChange={(e) => setNewSrvPrice(e.target.value)} placeholder="Original Price (₹)" className="p-3 rounded-lg border border-slate-200 dark:border-neutral-700 bg-slate-100 dark:bg-neutral-800 text-sm" />
                    <input type="number" value={newSrvDiscount} onChange={(e) => setNewSrvDiscount(e.target.value)} placeholder="Discount Price (₹)" className="p-3 rounded-lg border border-slate-200 dark:border-neutral-700 bg-slate-100 dark:bg-neutral-800 text-sm" />
                    <input type="text" value={newSrvImage} onChange={(e) => setNewSrvImage(e.target.value)} placeholder="Service Icon Image URL" className="p-3 rounded-lg border border-slate-200 dark:border-neutral-700 bg-slate-100 dark:bg-neutral-800 text-sm md:col-span-2" />
                  </div>
                  <button type="submit" className="btn-primary w-full py-3"><Plus className="w-4 h-4" /> Create & Link Service to Category</button>
                </form>

                {servicesList.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center px-1">
                      <span className="text-xs font-bold text-slate-400">
                        Service <span className="text-redPrimary font-black">{srvSliderIdx + 1}</span> of {servicesList.length}
                      </span>
                      {servicesList.length > 1 && (
                        <div className="flex items-center gap-2">
                          <button type="button" onClick={() => setSrvSliderIdx((prev) => (prev - 1 + servicesList.length) % servicesList.length)} className="p-2 rounded-xl bg-neutral-900 border border-neutral-800 text-white hover:border-redPrimary"><ChevronLeft className="w-4 h-4" /></button>
                          <span className="text-xs font-black text-slate-300">{srvSliderIdx + 1} / {servicesList.length}</span>
                          <button type="button" onClick={() => setSrvSliderIdx((prev) => (prev + 1) % servicesList.length)} className="p-2 rounded-xl bg-neutral-900 border border-neutral-800 text-white hover:border-redPrimary"><ChevronRight className="w-4 h-4" /></button>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {servicesList.map((s, idx) => (
                        <div key={s.id} className={`web-card flex flex-col justify-between transition-all ${idx === srvSliderIdx ? 'border-2 border-redPrimary bg-redPrimary/10 shadow-xl scale-105' : ''}`}>
                          <div>
                            <img src={s.imageUrl || 'https://cdn-icons-png.flaticon.com/512/3079/3079203.png'} alt={s.title} className="w-full h-32 object-cover rounded-lg mb-2" />
                            <span className="text-[10px] font-bold text-redPrimary uppercase">{s.categoryName || 'General'}</span>
                            <h4 className="font-bold text-sm mt-0.5 text-white">{s.title}</h4>
                            <p className="text-sm font-black text-redPrimary mt-1">₹{s.discountedPrice || s.originalPrice}</p>
                          </div>
                          <div className="flex gap-2 mt-3">
                            <button onClick={() => setEditingService({ ...s })} className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1.5 rounded-lg font-bold flex-1">Edit</button>
                            <button onClick={() => setDeletingPath(`services/${s.id}`)} className="bg-rose-800 hover:bg-rose-900 text-white text-xs px-3 py-1.5 rounded-lg font-bold flex-1">Delete</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 7: BANNERS MANAGER (With Interactive Slider) */}
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

                {bannersList.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center px-1">
                      <span className="text-xs font-bold text-slate-400">
                        Banner <span className="text-redPrimary font-black">{bnrSliderIdx + 1}</span> of {bannersList.length}
                      </span>
                      {bannersList.length > 1 && (
                        <div className="flex items-center gap-2">
                          <button type="button" onClick={() => setBnrSliderIdx((prev) => (prev - 1 + bannersList.length) % bannersList.length)} className="p-2 rounded-xl bg-neutral-900 border border-neutral-800 text-white hover:border-redPrimary"><ChevronLeft className="w-4 h-4" /></button>
                          <span className="text-xs font-black text-slate-300">{bnrSliderIdx + 1} / {bannersList.length}</span>
                          <button type="button" onClick={() => setBnrSliderIdx((prev) => (prev + 1) % bannersList.length)} className="p-2 rounded-xl bg-neutral-900 border border-neutral-800 text-white hover:border-redPrimary"><ChevronRight className="w-4 h-4" /></button>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {bannersList.map((b, idx) => (
                        <div key={b.id} className={`web-card flex justify-between items-center transition-all ${idx === bnrSliderIdx ? 'border-2 border-redPrimary bg-redPrimary/10 shadow-xl scale-105' : ''}`}>
                          <div className="flex gap-4 items-center">
                            <img src={b.imageUrl} className="w-16 h-12 object-cover rounded-lg" alt="" />
                            <div>
                              <strong className="block text-sm font-bold text-white">{b.title}</strong>
                              <span className="text-xs text-slate-400">{b.subtitle}</span>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button onClick={() => setEditingBanner({ ...b })} className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-2.5 py-1.5 rounded-lg font-bold">Edit</button>
                            <button onClick={() => setDeletingPath(`banners/${b.id}`)} className="bg-rose-800 hover:bg-rose-900 text-white text-xs px-2.5 py-1.5 rounded-lg font-bold">Delete</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 9: CUSTOMER EXPERIENCE (TESTIMONIALS - With Interactive Slider) */}
            {activeTab === 9 && (
              <div className="space-y-6">
                <form onSubmit={handleAddTestimonial} className="web-card space-y-4">
                  <h3 className="font-extrabold text-base text-redPrimary">Add Customer Experience Review</h3>
                  <div className="space-y-3">
                    <input type="text" value={newTestName} onChange={(e) => setNewTestName(e.target.value)} placeholder="Customer Name (e.g. Mohor Ghosh)" className="w-full p-3 rounded-lg border border-slate-200 dark:border-neutral-700 bg-slate-100 dark:bg-neutral-800 text-sm" />
                    <input type="text" value={newTestLoc} onChange={(e) => setNewTestLoc(e.target.value)} placeholder="Location (e.g. Upper Syari, Gangtok)" className="w-full p-3 rounded-lg border border-slate-200 dark:border-neutral-700 bg-slate-100 dark:bg-neutral-800 text-sm" />
                    <textarea value={newTestText} onChange={(e) => setNewTestText(e.target.value)} placeholder="Review Content..." rows={3} className="w-full p-3 rounded-lg border border-slate-200 dark:border-neutral-700 bg-slate-100 dark:bg-neutral-800 text-sm"></textarea>
                  </div>
                  <button type="submit" className="btn-primary w-full py-3"><Plus className="w-4 h-4" /> Add Review to Firebase</button>
                </form>

                {testimonialsList.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center px-1">
                      <span className="text-xs font-bold text-slate-400">
                        Review <span className="text-redPrimary font-black">{testSliderIdx + 1}</span> of {testimonialsList.length}
                      </span>
                      {testimonialsList.length > 1 && (
                        <div className="flex items-center gap-2">
                          <button type="button" onClick={() => setTestSliderIdx((prev) => (prev - 1 + testimonialsList.length) % testimonialsList.length)} className="p-2 rounded-xl bg-neutral-900 border border-neutral-800 text-white hover:border-redPrimary"><ChevronLeft className="w-4 h-4" /></button>
                          <span className="text-xs font-black text-slate-300">{testSliderIdx + 1} / {testimonialsList.length}</span>
                          <button type="button" onClick={() => setTestSliderIdx((prev) => (prev + 1) % testimonialsList.length)} className="p-2 rounded-xl bg-neutral-900 border border-neutral-800 text-white hover:border-redPrimary"><ChevronRight className="w-4 h-4" /></button>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {testimonialsList.map((t, idx) => (
                        <div key={t.id} className={`web-card space-y-2 relative transition-all ${idx === testSliderIdx ? 'border-2 border-redPrimary bg-redPrimary/10 shadow-xl scale-105' : ''}`}>
                          <strong className="block text-sm font-bold text-white">{t.name} <span className="text-xs font-normal text-slate-400">({t.location})</span></strong>
                          <p className="text-xs text-slate-300 italic">"{t.text}"</p>
                          <div className="flex gap-2 justify-end pt-2">
                            <button onClick={() => setEditingTestimonial({ ...t })} className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-2.5 py-1 rounded-lg font-bold">Edit</button>
                            <button onClick={() => setDeletingPath(`testimonials/${t.id}`)} className="bg-rose-800 hover:bg-rose-900 text-white text-xs px-2.5 py-1 rounded-lg font-bold">Delete</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 10: FAQs (With Interactive Slider) */}
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

                {faqsList.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center px-1">
                      <span className="text-xs font-bold text-slate-400">
                        FAQ <span className="text-redPrimary font-black">{faqSliderIdx + 1}</span> of {faqsList.length}
                      </span>
                      {faqsList.length > 1 && (
                        <div className="flex items-center gap-2">
                          <button type="button" onClick={() => setFaqSliderIdx((prev) => (prev - 1 + faqsList.length) % faqsList.length)} className="p-2 rounded-xl bg-neutral-900 border border-neutral-800 text-white hover:border-redPrimary"><ChevronLeft className="w-4 h-4" /></button>
                          <span className="text-xs font-black text-slate-300">{faqSliderIdx + 1} / {faqsList.length}</span>
                          <button type="button" onClick={() => setFaqSliderIdx((prev) => (prev + 1) % faqsList.length)} className="p-2 rounded-xl bg-neutral-900 border border-neutral-800 text-white hover:border-redPrimary"><ChevronRight className="w-4 h-4" /></button>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                      {faqsList.map((f, idx) => (
                        <div key={f.id} className={`web-card space-y-2 relative transition-all ${idx === faqSliderIdx ? 'border-2 border-redPrimary bg-redPrimary/10 shadow-xl' : ''}`}>
                          <strong className="block text-sm font-bold text-redPrimary">Q: {f.q}</strong>
                          <p className="text-xs text-slate-300">A: {f.a}</p>
                          <div className="flex gap-2 justify-end pt-2">
                            <button onClick={() => setEditingFaq({ ...f })} className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-2.5 py-1 rounded-lg font-bold">Edit</button>
                            <button onClick={() => setDeletingPath(`faqs/${f.id}`)} className="bg-rose-800 hover:bg-rose-900 text-white text-xs px-2.5 py-1 rounded-lg font-bold">Delete</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
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

      {/* CUSTOM DELETE CONFIRMATION MODAL (ARE YOU SURE TO DELETE - YES / NO) */}
      {deletingPath && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#242424] border border-neutral-700 rounded-3xl p-6 sm:p-8 w-full max-w-sm text-white shadow-2xl text-center space-y-5 relative">
            <div className="w-14 h-14 rounded-full bg-rose-600/20 text-rose-500 flex items-center justify-center mx-auto mb-2">
              <Trash2 className="w-7 h-7" />
            </div>

            <div>
              <h3 className="text-xl font-black text-white">Are you sure you want to delete?</h3>
              <p className="text-xs text-slate-400 mt-1">This item will be permanently removed from Firebase Realtime Database.</p>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeletingPath(null)}
                className="flex-1 py-3 px-4 rounded-xl border border-neutral-700 bg-neutral-800 hover:bg-neutral-700 text-xs font-extrabold text-slate-300 transition"
              >
                No, Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  remove(ref(rtdb, deletingPath)).then(() => {
                    alert('Item deleted successfully.');
                    setDeletingPath(null);
                  });
                }}
                className="flex-1 py-3 px-4 rounded-xl bg-rose-700 hover:bg-rose-800 text-xs font-extrabold text-white transition shadow-lg"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT MODAL FOR CATEGORIES */}
      {editingCategory && (
        <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4">
          <form onSubmit={handleSaveCategoryEdit} className="bg-[#242424] border border-neutral-700 rounded-2xl p-6 w-full max-w-md text-white space-y-4 relative shadow-2xl">
            <button type="button" onClick={() => setEditingCategory(null)} className="absolute top-4 right-4 text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
            <h3 className="text-lg font-bold text-redPrimary">Edit Category</h3>
            <input type="text" value={editingCategory.name} onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })} placeholder="Category Name" className="w-full p-3 rounded-lg border border-neutral-700 bg-neutral-800 text-xs text-white" />
            <input type="text" value={editingCategory.iconUrl} onChange={(e) => setEditingCategory({ ...editingCategory, iconUrl: e.target.value })} placeholder="Icon Image URL" className="w-full p-3 rounded-lg border border-neutral-700 bg-neutral-800 text-xs text-white" />
            <button type="submit" className="btn-primary w-full py-3"><Save className="w-4 h-4 mr-1 inline" /> Save Category Updates</button>
          </form>
        </div>
      )}

      {/* EDIT MODAL FOR SERVICES */}
      {editingService && (
        <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4">
          <form onSubmit={handleSaveServiceEdit} className="bg-[#242424] border border-neutral-700 rounded-2xl p-6 w-full max-w-md text-white space-y-4 relative shadow-2xl">
            <button type="button" onClick={() => setEditingService(null)} className="absolute top-4 right-4 text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
            <h3 className="text-lg font-bold text-redPrimary">Edit Service</h3>
            <input type="text" value={editingService.title} onChange={(e) => setEditingService({ ...editingService, title: e.target.value })} placeholder="Service Title" className="w-full p-3 rounded-lg border border-neutral-700 bg-neutral-800 text-xs text-white" />
            <input type="number" value={editingService.originalPrice} onChange={(e) => setEditingService({ ...editingService, originalPrice: e.target.value })} placeholder="Original Price" className="w-full p-3 rounded-lg border border-neutral-700 bg-neutral-800 text-xs text-white" />
            <input type="number" value={editingService.discountedPrice} onChange={(e) => setEditingService({ ...editingService, discountedPrice: e.target.value })} placeholder="Discount Price" className="w-full p-3 rounded-lg border border-neutral-700 bg-neutral-800 text-xs text-white" />
            <input type="text" value={editingService.imageUrl} onChange={(e) => setEditingService({ ...editingService, imageUrl: e.target.value })} placeholder="Image URL" className="w-full p-3 rounded-lg border border-neutral-700 bg-neutral-800 text-xs text-white" />
            <button type="submit" className="btn-primary w-full py-3"><Save className="w-4 h-4 mr-1 inline" /> Save Service Updates</button>
          </form>
        </div>
      )}

      {/* EDIT MODAL FOR BANNERS */}
      {editingBanner && (
        <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4">
          <form onSubmit={handleSaveBannerEdit} className="bg-[#242424] border border-neutral-700 rounded-2xl p-6 w-full max-w-md text-white space-y-4 relative shadow-2xl">
            <button type="button" onClick={() => setEditingBanner(null)} className="absolute top-4 right-4 text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
            <h3 className="text-lg font-bold text-redPrimary">Edit Marketing Banner</h3>
            <input type="text" value={editingBanner.title} onChange={(e) => setEditingBanner({ ...editingBanner, title: e.target.value })} placeholder="Title" className="w-full p-3 rounded-lg border border-neutral-700 bg-neutral-800 text-xs text-white" />
            <input type="text" value={editingBanner.subtitle} onChange={(e) => setEditingBanner({ ...editingBanner, subtitle: e.target.value })} placeholder="Subtitle" className="w-full p-3 rounded-lg border border-neutral-700 bg-neutral-800 text-xs text-white" />
            <input type="text" value={editingBanner.imageUrl} onChange={(e) => setEditingBanner({ ...editingBanner, imageUrl: e.target.value })} placeholder="Image URL" className="w-full p-3 rounded-lg border border-neutral-700 bg-neutral-800 text-xs text-white" />
            <button type="submit" className="btn-primary w-full py-3"><Save className="w-4 h-4 mr-1 inline" /> Save Banner Updates</button>
          </form>
        </div>
      )}

      {/* EDIT MODAL FOR TESTIMONIALS */}
      {editingTestimonial && (
        <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4">
          <form onSubmit={handleSaveTestimonialEdit} className="bg-[#242424] border border-neutral-700 rounded-2xl p-6 w-full max-w-md text-white space-y-4 relative shadow-2xl">
            <button type="button" onClick={() => setEditingTestimonial(null)} className="absolute top-4 right-4 text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
            <h3 className="text-lg font-bold text-redPrimary">Edit Customer Experience Review</h3>
            <input type="text" value={editingTestimonial.name} onChange={(e) => setEditingTestimonial({ ...editingTestimonial, name: e.target.value })} placeholder="Name" className="w-full p-3 rounded-lg border border-neutral-700 bg-neutral-800 text-xs text-white" />
            <input type="text" value={editingTestimonial.location} onChange={(e) => setEditingTestimonial({ ...editingTestimonial, location: e.target.value })} placeholder="Location" className="w-full p-3 rounded-lg border border-neutral-700 bg-neutral-800 text-xs text-white" />
            <textarea value={editingTestimonial.text} onChange={(e) => setEditingTestimonial({ ...editingTestimonial, text: e.target.value })} placeholder="Text" rows={3} className="w-full p-3 rounded-lg border border-neutral-700 bg-neutral-800 text-xs text-white"></textarea>
            <button type="submit" className="btn-primary w-full py-3"><Save className="w-4 h-4 mr-1 inline" /> Save Review Updates</button>
          </form>
        </div>
      )}

      {/* EDIT MODAL FOR FAQS */}
      {editingFaq && (
        <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4">
          <form onSubmit={handleSaveFaqEdit} className="bg-[#242424] border border-neutral-700 rounded-2xl p-6 w-full max-w-md text-white space-y-4 relative shadow-2xl">
            <button type="button" onClick={() => setEditingFaq(null)} className="absolute top-4 right-4 text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
            <h3 className="text-lg font-bold text-redPrimary">Edit FAQ</h3>
            <input type="text" value={editingFaq.q} onChange={(e) => setEditingFaq({ ...editingFaq, q: e.target.value })} placeholder="Question" className="w-full p-3 rounded-lg border border-neutral-700 bg-neutral-800 text-xs text-white" />
            <textarea value={editingFaq.a} onChange={(e) => setEditingFaq({ ...editingFaq, a: e.target.value })} placeholder="Answer" rows={3} className="w-full p-3 rounded-lg border border-neutral-700 bg-neutral-800 text-xs text-white"></textarea>
            <button type="submit" className="btn-primary w-full py-3"><Save className="w-4 h-4 mr-1 inline" /> Save FAQ Updates</button>
          </form>
        </div>
      )}

      {/* ASSIGN PARTNER MODAL */}
      {assigningBooking && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#242424] border border-[#3A3A3A] rounded-3xl p-6 sm:p-8 w-full max-w-lg text-white shadow-2xl relative space-y-5 max-h-[90vh] overflow-y-auto">

            <button onClick={() => setAssigningBooking(null)} className="absolute top-5 right-5 text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>

            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white leading-snug">
                Assign Partner for {assigningBooking.serviceTitle}
              </h2>
              <p className="text-xs font-bold text-redPrimary mt-1">
                Service Category: {assigningBooking.serviceCategory || 'Services'}
              </p>
              <p className="text-xs text-slate-400 mt-3 font-semibold">
                Select a verified partner to dispatch for order ref: <span className="text-white font-bold">{assigningBooking.bookingRef || assigningBooking.id}</span>
              </p>
            </div>

            {/* 3 Filter Tabs inside Modal */}
            <div className="flex border-b border-neutral-700 text-xs font-extrabold">
              <button
                type="button"
                onClick={() => setAssignFilterTab(0)}
                className={`flex-1 py-2.5 text-center border-b-2 transition ${
                  assignFilterTab === 0 ? 'border-b-redPrimary text-redPrimary' : 'border-b-transparent text-slate-400'
                }`}
              >
                Skill Matched ({skillMatchedCount})
              </button>

              <button
                type="button"
                onClick={() => setAssignFilterTab(1)}
                className={`flex-1 py-2.5 text-center border-b-2 transition ${
                  assignFilterTab === 1 ? 'border-b-redPrimary text-redPrimary' : 'border-b-transparent text-slate-400'
                }`}
              >
                🟢 Free ({freePartnersCount})
              </button>

              <button
                type="button"
                onClick={() => setAssignFilterTab(2)}
                className={`flex-1 py-2.5 text-center border-b-2 transition ${
                  assignFilterTab === 2 ? 'border-b-redPrimary text-redPrimary' : 'border-b-transparent text-slate-400'
                }`}
              >
                👥 All Fleet ({allPartnersList.length})
              </button>
            </div>

            {/* Partners List */}
            <div className="space-y-3 pt-1">
              {modalPartners.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-xs font-bold">
                  No partners found matching this filter.
                </div>
              ) : (
                modalPartners.map((partner) => {
                  const isSkillMatch = (partner.skillCategory || '').toLowerCase().includes((assigningBooking.serviceCategory || '').toLowerCase()) ||
                    (partner.skillCategory || '').toLowerCase().includes((assigningBooking.serviceTitle || '').toLowerCase());
                  const isFree = partner.isOnline === true || partner.isOnline === 'true';

                  return (
                    <div key={partner.id} className="p-4 rounded-2xl bg-[#1A1A1A] border border-[#333333] flex justify-between items-center shadow-md">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                          <User className="w-5 h-5" />
                        </div>

                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <strong className="text-sm font-black text-white">{partner.fullName}</strong>
                            {isSkillMatch && (
                              <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-emerald-600/20 text-emerald-400 border border-emerald-600/30">
                                ★ Skill Match
                              </span>
                            )}
                            {isFree && !isSkillMatch && (
                              <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-emerald-600/20 text-emerald-400 border border-emerald-600/30">
                                🟢 FREE
                              </span>
                            )}
                          </div>

                          <p className="text-xs text-redPrimary font-bold">
                            Skill: {partner.skillCategory || 'Craftsman Specialist'}
                          </p>
                          <p className="text-[11px] text-slate-400">
                            Phone: {partner.phoneNumber || '+91 9564111224'}
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleAssignPartnerConfirm(assigningBooking.id, partner)}
                        className="btn-primary py-2 px-4 text-xs font-extrabold rounded-full bg-redPrimary hover:bg-redDark text-white shadow-md shrink-0"
                      >
                        Assign
                      </button>
                    </div>
                  );
                })
              )}
            </div>

            {/* Bottom Modal Actions */}
            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setAssigningBooking(null)}
                className="text-xs font-bold text-redPrimary hover:underline px-4 py-2"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
