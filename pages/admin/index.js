import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import PopupModal from '../../components/PopupModal';
import { motion, AnimatePresence } from 'framer-motion';
import { ref, onValue, update, remove, set, push } from 'firebase/database';
import { rtdb } from '../../lib/firebase';
import { useAuth } from '../../lib/AuthContext';
import {
  ShieldCheck, Users, DollarSign, Package, Plus, Trash2, CheckCircle2, UserPlus, Lock, LogIn, LogOut,
  BarChart3, CreditCard, HardHat, Image as ImageIcon, Layers, Wrench, Search, Phone, Mail, Edit, MessageSquare, X, User, Check, TrendingUp, ShoppingBag, Clock, Award, Save, Bike, ChevronLeft, ChevronRight, ShieldAlert, UserCheck, Key, Upload
} from 'lucide-react';

export default function AdminControlPanelPage() {
  const [isDark, setIsDark] = useState(true);
  const [activeTab, setActiveTab] = useState(0); // 0=Orders, 1=Analytics, 2=Payment, 3=Fleet, 4=Users, 5=Categories, 6=Services, 7=Banners, 8=Profile/Admins, 9=Testimonials, 10=FAQs

  // Slider Index States for Admin Tabs
  const [orderSliderIdx, setOrderSliderIdx] = useState(0);
  const [userSliderIdx, setUserSliderIdx] = useState(0);
  const [catSliderIdx, setCatSliderIdx] = useState(0);
  const [srvSliderIdx, setSrvSliderIdx] = useState(0);
  const [bnrSliderIdx, setBnrSliderIdx] = useState(0);
  const [testSliderIdx, setTestSliderIdx] = useState(0);
  const [faqSliderIdx, setFaqSliderIdx] = useState(0);

  // Realtime Database States
  const [bookings, setBookings] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [categoriesList, setCategoriesList] = useState([]);
  const [servicesList, setServicesList] = useState([]);
  const [bannersList, setBannersList] = useState([]);
  const [testimonialsList, setTestimonialsList] = useState([]);
  const [faqsList, setFaqsList] = useState([]);

  // Dynamic Popup Modal State
  const [popupState, setPopupState] = useState({ isOpen: false, title: '', message: '', type: 'success', onAction: null });

  // Delete Confirmation Modal State
  const [deletingPath, setDeletingPath] = useState(null);

  // Edit Item Modal States
  const [editingCategory, setEditingCategory] = useState(null);
  const [editingService, setEditingService] = useState(null);
  const [editingBanner, setEditingBanner] = useState(null);
  const [editingTestimonial, setEditingTestimonial] = useState(null);
  const [editingFaq, setEditingFaq] = useState(null);
  const [editingAdminUser, setEditingAdminUser] = useState(null);

  // Modal to create sub admin
  const [isCreateSubAdminOpen, setIsCreateSubAdminOpen] = useState(false);

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

  // Sub-Admin Creation Form States with Password
  const [newAdminName, setNewAdminName] = useState('');
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminPhone, setNewAdminPhone] = useState('');
  const [newAdminPassword, setNewAdminPassword] = useState('');

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

  // HTML5 Canvas Image Resizer & Quality Optimizer (Compresses ANY Image File to < 100KB)
  const handleImageFileUpload = (e, callback) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setPopupState({
        isOpen: true,
        title: 'File Too Large',
        message: 'Please choose an image file under 5MB.',
        type: 'error'
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Resize to max 600px width/height for fast icon loading & low memory footprint
        const MAX_WIDTH = 600;
        const MAX_HEIGHT = 600;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        // Compress image to JPEG Data URL at 0.75 quality
        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.75);

        callback(compressedDataUrl);

        setPopupState({
          isOpen: true,
          title: 'Image Uploaded & Reflected!',
          message: `Image optimized (${Math.round(compressedDataUrl.length / 1024)} KB) and preview reflected. Click Save to publish.`,
          type: 'success'
        });
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  // Robust Snapshot Parser
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
    const unsubBookings = onValue(ref(rtdb, 'bookings'), (snapshot) => {
      const list = parseFirebaseSnapshot(snapshot);
      list.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
      setBookings(list);
    });

    const unsubUsers = onValue(ref(rtdb, 'users'), (snapshot) => {
      const list = parseFirebaseSnapshot(snapshot);
      setUsersList(list);
    });

    const unsubCategories = onValue(ref(rtdb, 'categories'), (snapshot) => {
      const list = parseFirebaseSnapshot(snapshot);
      setCategoriesList(list);
      if (list.length > 0 && !newSrvCatId) {
        setNewSrvCatId(list[0].id);
      }
    });

    const unsubServices = onValue(ref(rtdb, 'services'), (snapshot) => {
      const list = parseFirebaseSnapshot(snapshot);
      setServicesList(list);
    });

    const unsubBanners = onValue(ref(rtdb, 'banners'), (snapshot) => {
      const list = parseFirebaseSnapshot(snapshot);
      setBannersList(list);
    });

    const unsubTestimonials = onValue(ref(rtdb, 'testimonials'), (snapshot) => {
      const list = parseFirebaseSnapshot(snapshot);
      setTestimonialsList(list);
    });

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
      setPopupState({
        isOpen: true,
        title: 'Partner Dispatched',
        message: `Mistri ${partnerObj.fullName} assigned to order successfully!`,
        type: 'success'
      });
      setAssigningBooking(null);
    });
  };

  const currentAdmins = usersList.filter(u => (u.role || '').toUpperCase() === 'ADMIN');

  const handleAddAdmin = async (e) => {
    e.preventDefault();

    if (currentAdmins.length >= 3) {
      setPopupState({
        isOpen: true,
        title: 'Admin Limit Reached',
        message: 'Maximum limit of 3 Admins reached. Demote or remove an existing sub-admin before adding a new one.',
        type: 'error'
      });
      return;
    }

    if (!newAdminName || !newAdminEmail || !newAdminPhone || !newAdminPassword) {
      setPopupState({
        isOpen: true,
        title: 'Form Incomplete',
        message: 'Full Name, Email Address, Mobile Number, and Password are required to create a Sub-Admin.',
        type: 'error'
      });
      return;
    }

    const adminUid = 'admin_' + Math.random().toString(36).substring(2, 10);

    try {
      await set(ref(rtdb, `users/${adminUid}`), {
        id: adminUid,
        fullName: newAdminName,
        email: newAdminEmail,
        phoneNumber: newAdminPhone,
        password: newAdminPassword,
        role: 'ADMIN',
        createdAt: new Date().toISOString()
      });

      setNewAdminName('');
      setNewAdminEmail('');
      setNewAdminPhone('');
      setNewAdminPassword('');
      setIsCreateSubAdminOpen(false);

      setPopupState({
        isOpen: true,
        title: 'Sub-Admin Created!',
        message: `Sub-Admin account for ${newAdminName} created successfully!\nTotal Admins: ${currentAdmins.length + 1} / 3 Max`,
        type: 'success'
      });
    } catch (err) {
      setPopupState({
        isOpen: true,
        title: 'Creation Failed',
        message: err.message,
        type: 'error'
      });
    }
  };

  const handleSaveAdminUserEdit = async (e) => {
    e.preventDefault();
    if (!editingAdminUser) return;

    try {
      await update(ref(rtdb, `users/${editingAdminUser.id}`), {
        fullName: editingAdminUser.fullName,
        email: editingAdminUser.email,
        phoneNumber: editingAdminUser.phoneNumber,
        password: editingAdminUser.password
      });

      setPopupState({
        isOpen: true,
        title: 'Admin Account Updated',
        message: `Credentials for ${editingAdminUser.fullName} updated successfully!`,
        type: 'success'
      });
      setEditingAdminUser(null);
    } catch (err) {
      setPopupState({
        isOpen: true,
        title: 'Update Failed',
        message: err.message,
        type: 'error'
      });
    }
  };

  const handleDemoteAdmin = async (adminId, adminEmail) => {
    if (adminEmail === 'sahrahul77@gmail.com') {
      setPopupState({
        isOpen: true,
        title: 'Action Restricted',
        message: 'The Lead Main Admin account (sahrahul77@gmail.com) cannot be demoted.',
        type: 'error'
      });
      return;
    }

    try {
      await update(ref(rtdb, `users/${adminId}`), { role: 'CUSTOMER' });
      setPopupState({
        isOpen: true,
        title: 'Admin Demoted',
        message: 'Admin privileges removed. Account updated to Customer role.',
        type: 'info'
      });
    } catch (err) {
      setPopupState({
        isOpen: true,
        title: 'Demotion Failed',
        message: err.message,
        type: 'error'
      });
    }
  };

  const handleAddCategory = (e) => {
    e.preventDefault();
    if (!newCatName) return alert('Category Name is required.');
    const newRef = push(ref(rtdb, 'categories'));
    const catId = newRef.key;
    set(newRef, { id: catId, name: newCatName, iconUrl: newCatIcon || 'https://cdn-icons-png.flaticon.com/512/3079/3079203.png' })
      .then(() => {
        setPopupState({ isOpen: true, title: 'Category Created', message: `Category '${newCatName}' saved successfully!`, type: 'success' });
        setNewCatName(''); setNewCatIcon('');
      });
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
      setPopupState({ isOpen: true, title: 'Service Created', message: `Service '${newSrvTitle}' connected to Category '${catObj.name}'!`, type: 'success' });
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
    }).then(() => {
      setPopupState({ isOpen: true, title: 'Banner Saved', message: 'New marketing banner added successfully!', type: 'success' });
      setNewBnrTitle(''); setNewBnrSub(''); setNewBnrImg('');
    });
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
    }).then(() => {
      setPopupState({ isOpen: true, title: 'Review Added', message: 'New customer review published!', type: 'success' });
      setNewTestName(''); setNewTestLoc(''); setNewTestText('');
    });
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
    }).then(() => {
      setPopupState({ isOpen: true, title: 'FAQ Saved', message: 'New FAQ added successfully!', type: 'success' });
      setNewFaqQ(''); setNewFaqA('');
    });
  };

  const handleSaveCategoryEdit = (e) => {
    e.preventDefault();
    if (!editingCategory) return;
    update(ref(rtdb, `categories/${editingCategory.id}`), {
      name: editingCategory.name,
      iconUrl: editingCategory.iconUrl
    }).then(() => {
      setPopupState({ isOpen: true, title: 'Category Updated', message: 'Category details saved successfully!', type: 'success' });
      setEditingCategory(null);
    });
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
    }).then(() => {
      setPopupState({ isOpen: true, title: 'Service Updated', message: 'Service details saved successfully!', type: 'success' });
      setEditingService(null);
    });
  };

  const handleSaveBannerEdit = (e) => {
    e.preventDefault();
    if (!editingBanner) return;
    update(ref(rtdb, `banners/${editingBanner.id}`), {
      title: editingBanner.title,
      subtitle: editingBanner.subtitle,
      imageUrl: editingBanner.imageUrl
    }).then(() => {
      setPopupState({ isOpen: true, title: 'Banner Updated', message: 'Marketing banner updated successfully!', type: 'success' });
      setEditingBanner(null);
    });
  };

  const handleSaveTestimonialEdit = (e) => {
    e.preventDefault();
    if (!editingTestimonial) return;
    update(ref(rtdb, `testimonials/${editingTestimonial.id}`), {
      name: editingTestimonial.name,
      location: editingTestimonial.location,
      text: editingTestimonial.text,
      rating: parseInt(editingTestimonial.rating) || 5
    }).then(() => {
      setPopupState({ isOpen: true, title: 'Review Updated', message: 'Customer review updated successfully!', type: 'success' });
      setEditingTestimonial(null);
    });
  };

  const handleSaveFaqEdit = (e) => {
    e.preventDefault();
    if (!editingFaq) return;
    update(ref(rtdb, `faqs/${editingFaq.id}`), {
      q: editingFaq.q,
      a: editingFaq.a
    }).then(() => {
      setPopupState({ isOpen: true, title: 'FAQ Updated', message: 'FAQ updated successfully!', type: 'success' });
      setEditingFaq(null);
    });
  };

  const handleSaveAdminProfile = (e) => {
    e.preventDefault();
    update(ref(rtdb, 'users/bLfKYzhws9d7zozkzwyemQPI8bG3'), { fullName: adminName, phoneNumber: adminPhone, email: adminEmail })
      .then(() => {
        setPopupState({ isOpen: true, title: 'Profile Credentials Saved', message: 'Admin profile credentials updated successfully!', type: 'success' });
      });
  };

  const completedBookings = bookings.filter(b => b.status === 'COMPLETED');
  const totalRevenue = completedBookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0);
  const activeOrdersCount = bookings.filter(b => b.status !== 'COMPLETED').length;

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
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-[#0F0F0F] text-slate-900 dark:text-white transition-colors duration-200">
      <Header isDark={isDark} onToggleTheme={toggleTheme} currentUser={currentUser} />

      <main className="web-container py-6 sm:py-10 flex-1 space-y-6 max-w-7xl mx-auto px-4 sm:px-6 w-full">
        {!isAuthLoaded ? (<div className="web-card text-center py-16 text-slate-500">Loading secure session...</div>) : !isAdmin ? (
          <div className="web-card text-center py-16 max-w-lg mx-auto space-y-4 bg-white dark:bg-[#1A1A1A] border border-slate-200 dark:border-[#333333]">
            <Lock className="w-16 h-16 text-redPrimary mx-auto" />
            <h2 className="text-2xl font-black text-slate-900 dark:text-white">Admin Access Restricted</h2>
            <p className="text-xs text-slate-500">Sign in with Admin credentials (e.g. sahrahul77@gmail.com) to access the Lead Admin Control Panel.</p>
            <Link href="/auth" className="btn-primary inline-flex">
              <LogIn className="w-4 h-4" /> Sign In as Admin
            </Link>
          </div>
        ) : (
          <>
            {/* Top Admin Header Banner */}
            <div className="web-card flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-r from-redPrimary/20 via-slate-100 dark:via-neutral-900 to-transparent border border-redPrimary/30 p-5 rounded-2xl sm:rounded-3xl shadow-xl">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-redPrimary/20 text-redPrimary shrink-0">
                  <ShieldCheck className="w-7 h-7 sm:w-8 sm:h-8" />
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">{adminName}</h1>
                  <p className="text-xs text-redPrimary font-extrabold">Lead Platform Administrator • HiMistri Gangtok</p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setIsCreateSubAdminOpen(true)}
                  className="btn-primary bg-emerald-600 hover:bg-emerald-700 text-xs py-2.5 px-4 shadow-lg w-full sm:w-auto text-center justify-center flex items-center gap-1.5"
                >
                  <UserPlus className="w-4 h-4" /> + Create Sub-Admin ({currentAdmins.length}/3)
                </button>

                <button onClick={logout} className="btn-primary bg-redPrimary hover:bg-redDark text-xs py-2.5 px-4 shadow-lg w-full sm:w-auto text-center justify-center">
                  <LogOut className="w-4 h-4 inline mr-1" /> Log Out
                </button>
              </div>
            </div>

            {/* Executive Analytics KPIs */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              <div className="web-card flex items-center gap-4 p-4 rounded-2xl bg-white dark:bg-[#1A1A1A] border border-slate-200 dark:border-[#333333] shadow-md">
                <div className="p-3.5 rounded-2xl bg-emerald-600/15 text-emerald-600 shrink-0">
                  <DollarSign className="w-6 h-6 sm:w-7 sm:h-7" />
                </div>
                <div>
                  <span className="text-[11px] text-slate-500 font-bold block uppercase tracking-wider">Total Platform Revenue</span>
                  <p className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-500">₹{totalRevenue}</p>
                </div>
              </div>

              <div className="web-card flex items-center gap-4 p-4 rounded-2xl bg-white dark:bg-[#1A1A1A] border border-slate-200 dark:border-[#333333] shadow-md">
                <div className="p-3.5 rounded-2xl bg-redPrimary/15 text-redPrimary shrink-0">
                  <Package className="w-6 h-6 sm:w-7 sm:h-7" />
                </div>
                <div>
                  <span className="text-[11px] text-slate-500 font-bold block uppercase tracking-wider">Active Customer Orders</span>
                  <p className="text-xl sm:text-2xl font-black text-redPrimary">{activeOrdersCount}</p>
                </div>
              </div>

              <div className="web-card flex items-center gap-4 p-4 rounded-2xl bg-white dark:bg-[#1A1A1A] border border-slate-200 dark:border-[#333333] shadow-md">
                <div className="p-3.5 rounded-2xl bg-blue-500/15 text-blue-500 shrink-0">
                  <Users className="w-6 h-6 sm:w-7 sm:h-7" />
                </div>
                <div>
                  <span className="text-[11px] text-slate-500 font-bold block uppercase tracking-wider">Total Users & Fleet</span>
                  <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">{usersList.length}</p>
                </div>
              </div>
            </div>

            {/* Responsive Admin Navigation Tabs */}
            <div className="flex gap-2 overflow-x-auto border-b border-slate-200 dark:border-neutral-800 pb-3 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-none">
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
                { id: 8, label: `Manage Sub-Admins 🔑 (${currentAdmins.length}/3)` }
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => { setActiveTab(t.id); setOrderSliderIdx(0); setUserSliderIdx(0); setCatSliderIdx(0); setSrvSliderIdx(0); setBnrSliderIdx(0); setTestSliderIdx(0); setFaqSliderIdx(0); }}
                  className={`px-4 py-2.5 rounded-xl text-xs font-black whitespace-nowrap transition shrink-0 ${
                    activeTab === t.id ? 'bg-redPrimary text-white shadow-lg scale-105' : 'bg-white dark:bg-[#1A1A1A] text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-[#333333] hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* TAB 0: ORDERS */}
            {activeTab === 0 && (
              <div className="space-y-4">
                <div className="flex flex-col md:flex-row gap-3 justify-between items-stretch md:items-center">
                  <div className="relative flex-1 w-full">
                    <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                    <input
                      type="text"
                      value={orderQuery}
                      onChange={(e) => { setOrderQuery(e.target.value); setOrderSliderIdx(0); }}
                      placeholder="Search orders by Ref ID, Service, Phone, Address..."
                      className="w-full pl-10 p-3 rounded-xl border border-slate-200 dark:border-[#333333] bg-white dark:bg-[#1A1A1A] text-xs font-medium text-slate-900 dark:text-white outline-none focus:border-redPrimary"
                    />
                  </div>

                  <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                    {['ALL', 'PENDING', 'CONFIRMED', 'ASSIGNED', 'ON_THE_WAY', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'].map((st) => (
                      <button
                        key={st}
                        onClick={() => { setOrderStatusFilter(st); setOrderSliderIdx(0); }}
                        className={`px-3 py-2 rounded-xl text-[10px] sm:text-[11px] font-black border transition shrink-0 ${
                          orderStatusFilter === st ? 'bg-redPrimary text-white border-redPrimary shadow-md' : 'bg-white dark:bg-[#1A1A1A] border-slate-200 dark:border-[#333333] text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        {st === 'IN_PROGRESS' ? 'ARRIVED / WORK STARTED' : st}
                      </button>
                    ))}
                  </div>
                </div>

                {filteredOrders.length === 0 ? (
                  <p className="text-xs text-slate-500 py-6 text-center">No matching customer orders found.</p>
                ) : (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center px-1">
                      <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                        Order <span className="text-redPrimary font-black">{orderSliderIdx + 1}</span> of {filteredOrders.length}
                      </span>

                      {filteredOrders.length > 1 && (
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setOrderSliderIdx((prev) => (prev - 1 + filteredOrders.length) % filteredOrders.length)}
                            className="p-2 rounded-xl bg-slate-200 dark:bg-neutral-900 border border-slate-300 dark:border-neutral-800 text-slate-800 dark:text-white transition"
                          >
                            <ChevronLeft className="w-4 h-4" />
                          </button>
                          <span className="text-xs font-black text-slate-700 dark:text-slate-300">
                            {orderSliderIdx + 1} / {filteredOrders.length}
                          </span>
                          <button
                            type="button"
                            onClick={() => setOrderSliderIdx((prev) => (prev + 1) % filteredOrders.length)}
                            className="p-2 rounded-xl bg-slate-200 dark:bg-neutral-900 border border-slate-300 dark:border-neutral-800 text-slate-800 dark:text-white transition"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>

                    {currentOrder && (
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={currentOrder.id || orderSliderIdx}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          transition={{ duration: 0.25 }}
                          className="web-card space-y-3 shadow-xl relative bg-white dark:bg-[#1A1A1A] border border-slate-200 dark:border-[#333333] p-5 sm:p-6 rounded-2xl"
                        >
                          <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-neutral-800">
                            <span className="font-extrabold text-sm text-slate-900 dark:text-white">Ref ID: {currentOrder.bookingRef || currentOrder.id}</span>
                            <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-orangeSecondary/15 text-orangeSecondary">{currentOrder.status || 'PENDING'}</span>
                          </div>

                          <h3 className="font-bold text-base sm:text-lg text-slate-900 dark:text-white">{currentOrder.serviceTitle} • ₹{currentOrder.totalAmount} <span className="text-xs text-slate-400">(Qty: {currentOrder.quantity || 1})</span></h3>
                          <p className="text-xs text-slate-600 dark:text-slate-400">Customer: <strong className="text-slate-900 dark:text-white">{currentOrder.userName || 'Passang Bhutia'}</strong> ({currentOrder.customerPhone || '+916296351107'})</p>
                          <p className="text-xs text-slate-600 dark:text-slate-400">Address: <strong className="text-slate-900 dark:text-white">{currentOrder.address || 'Gangtok'}</strong></p>

                          <div className="p-3 rounded-xl bg-slate-100 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 flex items-center gap-2 text-xs font-bold text-orangeSecondary">
                            <Bike className="w-4 h-4 text-orangeSecondary shrink-0" />
                            <span>Live Status: {currentOrder.trackingStatus || 'Order Placed by Customer'}</span>
                          </div>

                          {currentOrder.assignedPartnerName && (
                            <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs flex justify-between items-center text-blue-600 dark:text-blue-400">
                              <div>
                                <strong>Assigned Mistri: {currentOrder.assignedPartnerName}</strong> ({currentOrder.assignedPartnerSkill || 'Specialist'})
                              </div>
                              {currentOrder.assignedPartnerPhone && (
                                <a href={`tel:${currentOrder.assignedPartnerPhone}`} className="text-emerald-600 dark:text-emerald-500 font-bold underline">Call Mistri</a>
                              )}
                            </div>
                          )}

                          <div className="flex flex-col sm:flex-row flex-wrap gap-2 pt-2 border-t border-slate-100 dark:border-neutral-800">
                            <button
                              onClick={() => handleUpdateStatus(currentOrder.id, 'CONFIRMED', 'Confirmed by Admin')}
                              disabled={currentOrder.status !== 'PENDING'}
                              className={`text-xs py-2.5 px-4 rounded-xl font-bold transition shadow-sm w-full sm:w-auto ${
                                currentOrder.status !== 'PENDING'
                                  ? 'bg-slate-200 dark:bg-neutral-800 text-slate-500 border border-slate-300 dark:border-neutral-700 cursor-not-allowed opacity-50'
                                  : 'btn-primary bg-redPrimary hover:bg-redDark text-white cursor-pointer'
                              }`}
                            >
                              <CheckCircle2 className="w-3.5 h-3.5 inline mr-1" />
                              {currentOrder.status === 'PENDING' ? 'Confirm Order' : '✓ Confirmed'}
                            </button>

                            <button
                              onClick={() => setAssigningBooking(currentOrder)}
                              disabled={currentOrder.status !== 'CONFIRMED'}
                              className={`text-xs py-2.5 px-4 rounded-xl font-bold transition shadow-sm w-full sm:w-auto ${
                                currentOrder.status !== 'CONFIRMED'
                                  ? 'bg-slate-200 dark:bg-neutral-800 text-slate-500 border border-slate-300 dark:border-neutral-700 cursor-not-allowed opacity-50'
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

                            <button onClick={() => setDeletingPath(`bookings/${currentOrder.id}`)} className="bg-rose-700 text-white text-xs px-3.5 py-2.5 rounded-xl font-bold w-full sm:w-auto">
                              <Trash2 className="w-3.5 h-3.5 inline" /> Delete
                            </button>
                          </div>
                        </motion.div>
                      </AnimatePresence>
                    )}

                    {filteredOrders.length > 1 && (
                      <div className="flex justify-center gap-2 pt-2">
                        {filteredOrders.map((_, i) => (
                          <button
                            key={i}
                            onClick={() => setOrderSliderIdx(i)}
                            className={`h-2 rounded-full transition-all ${
                              orderSliderIdx === i ? 'w-8 bg-redPrimary' : 'w-2 bg-slate-300 dark:bg-neutral-700 hover:bg-slate-400'
                            }`}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* TAB 5: CATEGORIES MANAGER (With Dedicated 200KB File Upload Picker Button & Live Thumbnail) */}
            {activeTab === 5 && (
              <div className="space-y-6">
                <form onSubmit={handleAddCategory} className="web-card space-y-4 bg-white dark:bg-[#1A1A1A] border border-slate-200 dark:border-[#333333] p-5 sm:p-6 rounded-2xl shadow-md">
                  <h3 className="font-extrabold text-base text-redPrimary">Add New Category</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input type="text" value={newCatName} onChange={(e) => setNewCatName(e.target.value)} placeholder="Category Name (e.g. Mason)" className="p-3.5 rounded-xl border border-slate-200 dark:border-neutral-700 bg-slate-50 dark:bg-neutral-900 text-sm text-slate-900 dark:text-white outline-none focus:border-redPrimary" />

                    {/* Category Icon File Upload Picker Button */}
                    <div className="space-y-1">
                      <label className="text-xs font-extrabold text-slate-500 dark:text-slate-400 block">Category Icon (Upload File &le;200KB or Paste URL)</label>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <label className="bg-redPrimary/10 hover:bg-redPrimary/20 text-redPrimary border border-redPrimary/30 px-4 py-2.5 rounded-xl text-xs font-extrabold cursor-pointer flex items-center justify-center gap-1.5 transition shrink-0">
                          <Upload className="w-4 h-4" /> 📷 Upload Icon File
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleImageFileUpload(e, setNewCatIcon)}
                            className="hidden"
                          />
                        </label>

                        <input
                          type="text"
                          value={newCatIcon}
                          onChange={(e) => setNewCatIcon(e.target.value)}
                          placeholder="Or paste Icon Image URL"
                          className="p-3.5 rounded-xl border border-slate-200 dark:border-neutral-700 bg-slate-50 dark:bg-neutral-900 text-xs text-slate-900 dark:text-white flex-1 outline-none focus:border-redPrimary"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Icon Live Preview */}
                  {newCatIcon && (
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-100 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800">
                      <img src={newCatIcon} className="w-12 h-12 object-contain rounded-lg bg-white p-1" alt="Preview" />
                      <span className="text-xs text-emerald-600 dark:text-emerald-400 font-extrabold">✓ Icon Selected & Previewed</span>
                    </div>
                  )}

                  <button type="submit" className="btn-primary py-3.5 px-6 font-extrabold text-xs"><Plus className="w-4 h-4 inline mr-1" /> Save Category</button>
                </form>

                {categoriesList.length === 0 ? (
                  <p className="text-xs text-slate-500 py-6">No categories found.</p>
                ) : (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center px-1">
                      <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                        Category <span className="text-redPrimary font-black">{catSliderIdx + 1}</span> of {categoriesList.length}
                      </span>
                      {categoriesList.length > 1 && (
                        <div className="flex items-center gap-2">
                          <button type="button" onClick={() => setCatSliderIdx((prev) => (prev - 1 + categoriesList.length) % categoriesList.length)} className="p-2 rounded-xl bg-slate-200 dark:bg-neutral-900 border border-slate-300 dark:border-neutral-800 text-slate-800 dark:text-white hover:border-redPrimary"><ChevronLeft className="w-4 h-4" /></button>
                          <span className="text-xs font-black text-slate-700 dark:text-slate-300">{catSliderIdx + 1} / {categoriesList.length}</span>
                          <button type="button" onClick={() => setCatSliderIdx((prev) => (prev + 1) % categoriesList.length)} className="p-2 rounded-xl bg-slate-200 dark:bg-neutral-900 border border-slate-300 dark:border-neutral-800 text-slate-800 dark:text-white hover:border-redPrimary"><ChevronRight className="w-4 h-4" /></button>
                        </div>
                      )}
                    </div>

                    {categoriesList[catSliderIdx] && (
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={categoriesList[catSliderIdx].id || catSliderIdx}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          transition={{ duration: 0.25 }}
                          className="web-card text-center p-6 sm:p-8 bg-white dark:bg-[#1A1A1A] border border-slate-200 dark:border-[#333333] rounded-2xl shadow-xl flex flex-col items-center gap-4 relative max-w-md mx-auto w-full"
                        >
                          <img src={categoriesList[catSliderIdx].iconUrl || 'https://cdn-icons-png.flaticon.com/512/3079/3079203.png'} alt="" className="w-16 h-16 object-contain" />
                          <strong className="text-lg block text-slate-900 dark:text-white font-extrabold">{categoriesList[catSliderIdx].name}</strong>

                          <div className="flex gap-2 justify-center pt-2 w-full">
                            <button onClick={() => setEditingCategory({ ...categoriesList[catSliderIdx] })} className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-4 py-2.5 rounded-xl font-bold flex-1">Edit</button>
                            <button onClick={() => setDeletingPath(`categories/${categoriesList[catSliderIdx].id}`)} className="bg-rose-800 hover:bg-rose-900 text-white text-xs px-4 py-2.5 rounded-xl font-bold flex-1">Delete</button>
                          </div>
                        </motion.div>
                      </AnimatePresence>
                    )}

                    {categoriesList.length > 1 && (
                      <div className="flex justify-center gap-2 pt-2">
                        {categoriesList.map((_, i) => (
                          <button key={i} type="button" onClick={() => setCatSliderIdx(i)} className={`h-2 rounded-full transition-all ${catSliderIdx === i ? 'w-8 bg-redPrimary' : 'w-2 bg-slate-300 dark:bg-neutral-700 hover:bg-slate-400'}`} />
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* TAB 6: SERVICES MANAGER (With Dedicated 200KB File Upload Picker Button & Live Thumbnail) */}
            {activeTab === 6 && (
              <div className="space-y-6">
                <form onSubmit={handleAddService} className="web-card space-y-4 bg-white dark:bg-[#1A1A1A] border border-slate-200 dark:border-[#333333] p-5 sm:p-6 rounded-2xl shadow-md">
                  <h3 className="font-extrabold text-base text-redPrimary">Add New Service (Connected to Category)</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input type="text" value={newSrvTitle} onChange={(e) => setNewSrvTitle(e.target.value)} placeholder="Service Title (e.g. Pipe Leak Repair)" className="p-3.5 rounded-xl border border-slate-200 dark:border-neutral-700 bg-slate-50 dark:bg-neutral-900 text-sm text-slate-900 dark:text-white outline-none focus:border-redPrimary" />

                    <select value={newSrvCatId} onChange={(e) => setNewSrvCatId(e.target.value)} className="p-3.5 rounded-xl border border-slate-200 dark:border-neutral-700 bg-slate-50 dark:bg-neutral-900 text-sm font-bold text-slate-900 dark:text-white outline-none focus:border-redPrimary">
                      {categoriesList.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>

                    <input type="number" value={newSrvPrice} onChange={(e) => setNewSrvPrice(e.target.value)} placeholder="Original Price (₹)" className="p-3.5 rounded-xl border border-slate-200 dark:border-neutral-700 bg-slate-50 dark:bg-neutral-900 text-sm text-slate-900 dark:text-white outline-none focus:border-redPrimary" />
                    <input type="number" value={newSrvDiscount} onChange={(e) => setNewSrvDiscount(e.target.value)} placeholder="Discount Price (₹)" className="p-3.5 rounded-xl border border-slate-200 dark:border-neutral-700 bg-slate-50 dark:bg-neutral-900 text-sm text-slate-900 dark:text-white outline-none focus:border-redPrimary" />

                    {/* Service Image File Upload & URL Picker */}
                    <div className="md:col-span-2 space-y-1">
                      <label className="text-xs font-extrabold text-slate-500 dark:text-slate-400 block">Service Image (Upload File &le;200KB or Paste Image URL)</label>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <label className="bg-redPrimary/10 hover:bg-redPrimary/20 text-redPrimary border border-redPrimary/30 px-4 py-2.5 rounded-xl text-xs font-extrabold cursor-pointer flex items-center justify-center gap-1.5 transition shrink-0">
                          <Upload className="w-4 h-4" /> 📷 Upload Service Image File
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleImageFileUpload(e, setNewSrvImage)}
                            className="hidden"
                          />
                        </label>

                        <input
                          type="text"
                          value={newSrvImage}
                          onChange={(e) => setNewSrvImage(e.target.value)}
                          placeholder="Or paste Service Icon Image URL"
                          className="p-3.5 rounded-xl border border-slate-200 dark:border-neutral-700 bg-slate-50 dark:bg-neutral-900 text-xs text-slate-900 dark:text-white flex-1 outline-none focus:border-redPrimary"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Service Image Live Preview */}
                  {newSrvImage && (
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-100 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800">
                      <img src={newSrvImage} className="w-16 h-12 object-cover rounded-lg bg-white p-1" alt="Preview" />
                      <span className="text-xs text-emerald-600 dark:text-emerald-400 font-extrabold">✓ Service Image Selected & Previewed</span>
                    </div>
                  )}

                  <button type="submit" className="btn-primary w-full py-3.5 font-extrabold text-xs"><Plus className="w-4 h-4 inline mr-1" /> Create & Link Service to Category</button>
                </form>

                {servicesList.length === 0 ? (
                  <p className="text-xs text-slate-500 py-6">No services found.</p>
                ) : (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center px-1">
                      <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                        Service <span className="text-redPrimary font-black">{srvSliderIdx + 1}</span> of {servicesList.length}
                      </span>
                      {servicesList.length > 1 && (
                        <div className="flex items-center gap-2">
                          <button type="button" onClick={() => setSrvSliderIdx((prev) => (prev - 1 + servicesList.length) % servicesList.length)} className="p-2 rounded-xl bg-slate-200 dark:bg-neutral-900 border border-slate-300 dark:border-neutral-800 text-slate-800 dark:text-white hover:border-redPrimary"><ChevronLeft className="w-4 h-4" /></button>
                          <span className="text-xs font-black text-slate-700 dark:text-slate-300">{srvSliderIdx + 1} / {servicesList.length}</span>
                          <button type="button" onClick={() => setSrvSliderIdx((prev) => (prev + 1) % servicesList.length)} className="p-2 rounded-xl bg-slate-200 dark:bg-neutral-900 border border-slate-300 dark:border-neutral-800 text-slate-800 dark:text-white hover:border-redPrimary"><ChevronRight className="w-4 h-4" /></button>
                        </div>
                      )}
                    </div>

                    {servicesList[srvSliderIdx] && (
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={servicesList[srvSliderIdx].id || srvSliderIdx}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          transition={{ duration: 0.25 }}
                          className="web-card bg-white dark:bg-[#1A1A1A] border border-slate-200 dark:border-[#333333] p-5 sm:p-6 rounded-2xl flex flex-col justify-between shadow-2xl relative max-w-md mx-auto w-full"
                        >
                          <div>
                            <img src={servicesList[srvSliderIdx].imageUrl || 'https://cdn-icons-png.flaticon.com/512/3079/3079203.png'} alt="" className="w-full h-44 object-cover rounded-xl mb-3" />
                            <span className="text-[10px] font-bold text-redPrimary uppercase">{servicesList[srvSliderIdx].categoryName || 'General'}</span>
                            <h4 className="font-bold text-base mt-0.5 text-slate-900 dark:text-white">{servicesList[srvSliderIdx].title}</h4>
                            <p className="text-lg font-black text-redPrimary mt-1">₹{servicesList[srvSliderIdx].discountedPrice || servicesList[srvSliderIdx].originalPrice}</p>
                          </div>
                          <div className="flex gap-2 mt-4 pt-3 border-t border-slate-100 dark:border-neutral-800">
                            <button onClick={() => setEditingService({ ...servicesList[srvSliderIdx] })} className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-2.5 rounded-xl font-bold flex-1">Edit</button>
                            <button onClick={() => setDeletingPath(`services/${servicesList[srvSliderIdx].id}`)} className="bg-rose-800 hover:bg-rose-900 text-white text-xs px-3 py-2.5 rounded-xl font-bold flex-1">Delete</button>
                          </div>
                        </motion.div>
                      </AnimatePresence>
                    )}

                    {servicesList.length > 1 && (
                      <div className="flex justify-center gap-2 pt-2">
                        {servicesList.map((_, i) => (
                          <button key={i} type="button" onClick={() => setSrvSliderIdx(i)} className={`h-2 rounded-full transition-all ${srvSliderIdx === i ? 'w-8 bg-redPrimary' : 'w-2 bg-slate-300 dark:bg-neutral-700 hover:bg-slate-400'}`} />
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* TAB 7: BANNERS MANAGER (With Dedicated 200KB File Upload Picker Button & Live Thumbnail) */}
            {activeTab === 7 && (
              <div className="space-y-6">
                <form onSubmit={handleAddBanner} className="web-card space-y-4 bg-white dark:bg-[#1A1A1A] border border-slate-200 dark:border-[#333333] p-5 sm:p-6 rounded-2xl shadow-md">
                  <h3 className="font-extrabold text-base text-redPrimary">Add New Marketing Banner</h3>

                  <div className="space-y-3">
                    <input type="text" value={newBnrTitle} onChange={(e) => setNewBnrTitle(e.target.value)} placeholder="Headline Title" className="w-full p-3.5 rounded-xl border border-slate-200 dark:border-neutral-700 bg-slate-50 dark:bg-neutral-900 text-xs text-slate-900 dark:text-white outline-none focus:border-redPrimary" />
                    <input type="text" value={newBnrSub} onChange={(e) => setNewBnrSub(e.target.value)} placeholder="Subtitle" className="w-full p-3.5 rounded-xl border border-slate-200 dark:border-neutral-700 bg-slate-50 dark:bg-neutral-900 text-xs text-slate-900 dark:text-white outline-none focus:border-redPrimary" />

                    {/* Banner Image File Upload & URL Picker */}
                    <div className="space-y-1">
                      <label className="text-xs font-extrabold text-slate-500 dark:text-slate-400 block">Banner Image (Upload File &le;200KB or Paste URL)</label>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <label className="bg-redPrimary/10 hover:bg-redPrimary/20 text-redPrimary border border-redPrimary/30 px-4 py-2.5 rounded-xl text-xs font-extrabold cursor-pointer flex items-center justify-center gap-1.5 transition shrink-0">
                          <Upload className="w-4 h-4" /> 📷 Upload Banner Image File
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleImageFileUpload(e, setNewBnrImg)}
                            className="hidden"
                          />
                        </label>

                        <input
                          type="text"
                          value={newBnrImg}
                          onChange={(e) => setNewBnrImg(e.target.value)}
                          placeholder="Or paste Banner Image URL"
                          className="p-3.5 rounded-xl border border-slate-200 dark:border-neutral-700 bg-slate-50 dark:bg-neutral-900 text-xs text-slate-900 dark:text-white flex-1 outline-none focus:border-redPrimary"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Banner Image Live Preview */}
                  {newBnrImg && (
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-100 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800">
                      <img src={newBnrImg} className="w-20 h-12 object-cover rounded-lg bg-white p-1" alt="Preview" />
                      <span className="text-xs text-emerald-600 dark:text-emerald-400 font-extrabold">✓ Banner Image Selected & Previewed</span>
                    </div>
                  )}

                  <button type="submit" className="btn-primary w-full py-3.5 text-xs font-extrabold"><Plus className="w-4 h-4 inline mr-1" /> Save Marketing Banner</button>
                </form>

                {bannersList.length === 0 ? (
                  <p className="text-xs text-slate-500 py-6">No banners found.</p>
                ) : (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center px-1">
                      <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                        Banner <span className="text-redPrimary font-black">{bnrSliderIdx + 1}</span> of {bannersList.length}
                      </span>
                      {bannersList.length > 1 && (
                        <div className="flex items-center gap-2">
                          <button type="button" onClick={() => setBnrSliderIdx((prev) => (prev - 1 + bannersList.length) % bannersList.length)} className="p-2 rounded-xl bg-slate-200 dark:bg-neutral-900 border border-slate-300 dark:border-neutral-800 text-slate-800 dark:text-white hover:border-redPrimary"><ChevronLeft className="w-4 h-4" /></button>
                          <span className="text-xs font-black text-slate-700 dark:text-slate-300">{bnrSliderIdx + 1} / {bannersList.length}</span>
                          <button type="button" onClick={() => setBnrSliderIdx((prev) => (prev + 1) % bannersList.length)} className="p-2 rounded-xl bg-slate-200 dark:bg-neutral-900 border border-slate-300 dark:border-neutral-800 text-slate-800 dark:text-white hover:border-redPrimary"><ChevronRight className="w-4 h-4" /></button>
                        </div>
                      )}
                    </div>

                    {bannersList[bnrSliderIdx] && (
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={bannersList[bnrSliderIdx].id || bnrSliderIdx}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          transition={{ duration: 0.25 }}
                          className="web-card bg-white dark:bg-[#1A1A1A] border border-slate-200 dark:border-[#333333] p-5 sm:p-6 rounded-2xl flex flex-col gap-4 shadow-2xl relative max-w-lg mx-auto w-full"
                        >
                          <img src={bannersList[bnrSliderIdx].imageUrl} className="w-full h-40 sm:h-48 object-cover rounded-xl" alt="" />
                          <div>
                            <strong className="block text-base sm:text-lg font-bold text-slate-900 dark:text-white">{bannersList[bnrSliderIdx].title}</strong>
                            <span className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 block">{bannersList[bnrSliderIdx].subtitle}</span>
                          </div>
                          <div className="flex gap-2 pt-2 border-t border-slate-100 dark:border-neutral-800">
                            <button onClick={() => setEditingBanner({ ...bannersList[bnrSliderIdx] })} className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-2.5 rounded-xl font-bold flex-1">Edit</button>
                            <button onClick={() => setDeletingPath(`banners/${bannersList[bnrSliderIdx].id}`)} className="bg-rose-800 hover:bg-rose-900 text-white text-xs px-3 py-2.5 rounded-xl font-bold flex-1">Delete</button>
                          </div>
                        </motion.div>
                      </AnimatePresence>
                    )}

                    {bannersList.length > 1 && (
                      <div className="flex justify-center gap-2 pt-2">
                        {bannersList.map((_, i) => (
                          <button key={i} type="button" onClick={() => setBnrSliderIdx(i)} className={`h-2 rounded-full transition-all ${bnrSliderIdx === i ? 'w-8 bg-redPrimary' : 'w-2 bg-slate-300 dark:bg-neutral-700 hover:bg-slate-400'}`} />
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* TAB 9: CUSTOMER EXPERIENCE */}
            {activeTab === 9 && (
              <div className="space-y-6">
                <form onSubmit={handleAddTestimonial} className="web-card space-y-4 bg-white dark:bg-[#1A1A1A] border border-slate-200 dark:border-[#333333] p-5 sm:p-6 rounded-2xl">
                  <h3 className="font-extrabold text-base text-redPrimary">Add Customer Experience Review</h3>
                  <div className="space-y-3">
                    <input type="text" value={newTestName} onChange={(e) => setNewTestName(e.target.value)} placeholder="Customer Name (e.g. Mohor Ghosh)" className="w-full p-3.5 rounded-xl border border-slate-200 dark:border-neutral-700 bg-slate-50 dark:bg-neutral-900 text-xs text-slate-900 dark:text-white outline-none focus:border-redPrimary" />
                    <input type="text" value={newTestLoc} onChange={(e) => setNewTestLoc(e.target.value)} placeholder="Location (e.g. Upper Syari, Gangtok)" className="w-full p-3.5 rounded-xl border border-slate-200 dark:border-neutral-700 bg-slate-50 dark:bg-neutral-900 text-xs text-slate-900 dark:text-white outline-none focus:border-redPrimary" />
                    <textarea value={newTestText} onChange={(e) => setNewTestText(e.target.value)} placeholder="Review Content..." rows={3} className="w-full p-3.5 rounded-xl border border-slate-200 dark:border-neutral-700 bg-slate-50 dark:bg-neutral-900 text-xs text-slate-900 dark:text-white outline-none focus:border-redPrimary"></textarea>
                  </div>
                  <button type="submit" className="btn-primary w-full py-3.5 text-xs font-extrabold"><Plus className="w-4 h-4 inline mr-1" /> Save Customer Review</button>
                </form>

                {testimonialsList.length === 0 ? (
                  <p className="text-xs text-slate-500 py-6">No customer reviews found.</p>
                ) : (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center px-1">
                      <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                        Review <span className="text-redPrimary font-black">{testSliderIdx + 1}</span> of {testimonialsList.length}
                      </span>
                      {testimonialsList.length > 1 && (
                        <div className="flex items-center gap-2">
                          <button type="button" onClick={() => setTestSliderIdx((prev) => (prev - 1 + testimonialsList.length) % testimonialsList.length)} className="p-2 rounded-xl bg-slate-200 dark:bg-neutral-900 border border-slate-300 dark:border-neutral-800 text-slate-800 dark:text-white hover:border-redPrimary"><ChevronLeft className="w-4 h-4" /></button>
                          <span className="text-xs font-black text-slate-700 dark:text-slate-300">{testSliderIdx + 1} / {testimonialsList.length}</span>
                          <button type="button" onClick={() => setTestSliderIdx((prev) => (prev + 1) % testimonialsList.length)} className="p-2 rounded-xl bg-slate-200 dark:bg-neutral-900 border border-slate-300 dark:border-neutral-800 text-slate-800 dark:text-white hover:border-redPrimary"><ChevronRight className="w-4 h-4" /></button>
                        </div>
                      )}
                    </div>

                    {testimonialsList[testSliderIdx] && (
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={testimonialsList[testSliderIdx].id || testSliderIdx}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          transition={{ duration: 0.25 }}
                          className="web-card bg-white dark:bg-[#1A1A1A] border border-slate-200 dark:border-[#333333] p-5 sm:p-6 rounded-2xl space-y-3 shadow-2xl relative max-w-lg mx-auto w-full"
                        >
                          <div className="flex justify-between items-center border-b border-slate-100 dark:border-neutral-800 pb-2">
                            <strong className="block text-base font-bold text-slate-900 dark:text-white">{testimonialsList[testSliderIdx].name}</strong>
                            <span className="text-xs text-slate-400">({testimonialsList[testSliderIdx].location})</span>
                          </div>
                          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 italic leading-relaxed">"{testimonialsList[testSliderIdx].text}"</p>
                          <div className="flex gap-2 justify-end pt-2 border-t border-slate-100 dark:border-neutral-800">
                            <button onClick={() => setEditingTestimonial({ ...testimonialsList[testSliderIdx] })} className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-2.5 rounded-xl font-bold flex-1">Edit</button>
                            <button onClick={() => setDeletingPath(`testimonials/${testimonialsList[testSliderIdx].id}`)} className="bg-rose-800 hover:bg-rose-900 text-white text-xs px-3 py-2.5 rounded-xl font-bold flex-1">Delete</button>
                          </div>
                        </motion.div>
                      </AnimatePresence>
                    )}

                    {testimonialsList.length > 1 && (
                      <div className="flex justify-center gap-2 pt-2">
                        {testimonialsList.map((_, i) => (
                          <button key={i} type="button" onClick={() => setTestSliderIdx(i)} className={`h-2 rounded-full transition-all ${testSliderIdx === i ? 'w-8 bg-redPrimary' : 'w-2 bg-slate-300 dark:bg-neutral-700 hover:bg-slate-400'}`} />
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* TAB 10: FAQs */}
            {activeTab === 10 && (
              <div className="space-y-6">
                <form onSubmit={handleAddFaq} className="web-card space-y-4 bg-white dark:bg-[#1A1A1A] border border-slate-200 dark:border-[#333333] p-5 sm:p-6 rounded-2xl">
                  <h3 className="font-extrabold text-base text-redPrimary">Add Frequently Asked Question</h3>
                  <div className="space-y-3">
                    <input type="text" value={newFaqQ} onChange={(e) => setNewFaqQ(e.target.value)} placeholder="Question" className="w-full p-3.5 rounded-xl border border-slate-200 dark:border-neutral-700 bg-slate-50 dark:bg-neutral-900 text-xs text-slate-900 dark:text-white outline-none focus:border-redPrimary" />
                    <textarea value={newFaqA} onChange={(e) => setNewFaqA(e.target.value)} placeholder="Answer" rows={3} className="w-full p-3.5 rounded-xl border border-slate-200 dark:border-neutral-700 bg-slate-50 dark:bg-neutral-900 text-xs text-slate-900 dark:text-white outline-none focus:border-redPrimary"></textarea>
                  </div>
                  <button type="submit" className="btn-primary w-full py-3.5 text-xs font-extrabold"><Plus className="w-4 h-4 inline mr-1" /> Save FAQ</button>
                </form>

                {faqsList.length === 0 ? (
                  <p className="text-xs text-slate-500 py-6">No FAQs found.</p>
                ) : (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center px-1">
                      <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                        FAQ <span className="text-redPrimary font-black">{faqSliderIdx + 1}</span> of {faqsList.length}
                      </span>
                      {faqsList.length > 1 && (
                        <div className="flex items-center gap-2">
                          <button type="button" onClick={() => setFaqSliderIdx((prev) => (prev - 1 + faqsList.length) % faqsList.length)} className="p-2 rounded-xl bg-slate-200 dark:bg-neutral-900 border border-slate-300 dark:border-neutral-800 text-slate-800 dark:text-white hover:border-redPrimary"><ChevronLeft className="w-4 h-4" /></button>
                          <span className="text-xs font-black text-slate-700 dark:text-slate-300">{faqSliderIdx + 1} / {faqsList.length}</span>
                          <button type="button" onClick={() => setFaqSliderIdx((prev) => (prev + 1) % faqsList.length)} className="p-2 rounded-xl bg-slate-200 dark:bg-neutral-900 border border-slate-300 dark:border-neutral-800 text-slate-800 dark:text-white hover:border-redPrimary"><ChevronRight className="w-4 h-4" /></button>
                        </div>
                      )}
                    </div>

                    {faqsList[faqSliderIdx] && (
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={faqsList[faqSliderIdx].id || faqSliderIdx}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          transition={{ duration: 0.25 }}
                          className="web-card bg-white dark:bg-[#1A1A1A] border border-slate-200 dark:border-[#333333] p-5 sm:p-6 rounded-2xl space-y-3 shadow-2xl relative max-w-lg mx-auto w-full"
                        >
                          <strong className="block text-base font-bold text-redPrimary">Q: {faqsList[faqSliderIdx].q}</strong>
                          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">A: {faqsList[faqSliderIdx].a}</p>
                          <div className="flex gap-2 justify-end pt-2 border-t border-slate-100 dark:border-neutral-800">
                            <button onClick={() => setEditingFaq({ ...faqsList[faqSliderIdx] })} className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-2.5 rounded-xl font-bold flex-1">Edit</button>
                            <button onClick={() => setDeletingPath(`faqs/${faqsList[faqSliderIdx].id}`)} className="bg-rose-800 hover:bg-rose-900 text-white text-xs px-3 py-2.5 rounded-xl font-bold flex-1">Delete</button>
                          </div>
                        </motion.div>
                      </AnimatePresence>
                    )}

                    {faqsList.length > 1 && (
                      <div className="flex justify-center gap-2 pt-2">
                        {faqsList.map((_, i) => (
                          <button key={i} type="button" onClick={() => setFaqSliderIdx(i)} className={`h-2 rounded-full transition-all ${faqSliderIdx === i ? 'w-8 bg-redPrimary' : 'w-2 bg-slate-300 dark:bg-neutral-700 hover:bg-slate-400'}`} />
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* TAB 8: ADMIN ROLES & CREATION MANAGER */}
            {activeTab === 8 && (
              <div className="space-y-6">
                <div className="web-card space-y-4 bg-white dark:bg-[#1A1A1A] border border-slate-200 dark:border-[#333333] p-5 sm:p-6 rounded-2xl shadow-md">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 dark:border-neutral-800 pb-3">
                    <div>
                      <h3 className="font-extrabold text-base text-redPrimary">Manage Platform Administrators</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Main Lead Admin can grant administrator authority to maximum 3 accounts.</p>
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-black bg-redPrimary/20 text-redPrimary border border-redPrimary/30 shrink-0">
                      Admins: {currentAdmins.length} / 3 Max
                    </span>
                  </div>

                  {/* Create New Admin Account Form */}
                  <form onSubmit={handleAddAdmin} className="space-y-4 pt-2">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">Create New Sub-Admin Account</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <input
                        type="text"
                        value={newAdminName}
                        onChange={(e) => setNewAdminName(e.target.value)}
                        placeholder="Admin Full Name *"
                        className="p-3.5 rounded-xl border border-slate-200 dark:border-neutral-700 bg-slate-50 dark:bg-neutral-900 text-slate-900 dark:text-white text-xs outline-none focus:border-redPrimary"
                      />
                      <input
                        type="email"
                        value={newAdminEmail}
                        onChange={(e) => setNewAdminEmail(e.target.value)}
                        placeholder="Admin Email Address *"
                        className="p-3.5 rounded-xl border border-slate-200 dark:border-neutral-700 bg-slate-50 dark:bg-neutral-900 text-slate-900 dark:text-white text-xs outline-none focus:border-redPrimary"
                      />
                      <input
                        type="text"
                        value={newAdminPhone}
                        onChange={(e) => setNewAdminPhone(e.target.value)}
                        placeholder="Admin Phone Number *"
                        className="p-3.5 rounded-xl border border-slate-200 dark:border-neutral-700 bg-slate-50 dark:bg-neutral-900 text-slate-900 dark:text-white text-xs outline-none focus:border-redPrimary"
                      />
                      <input
                        type="password"
                        value={newAdminPassword}
                        onChange={(e) => setNewAdminPassword(e.target.value)}
                        placeholder="Sub-Admin Password *"
                        className="p-3.5 rounded-xl border border-slate-200 dark:border-neutral-700 bg-slate-50 dark:bg-neutral-900 text-slate-900 dark:text-white text-xs outline-none focus:border-redPrimary"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={currentAdmins.length >= 3}
                      className={`btn-primary w-full py-3.5 text-xs font-black shadow-lg rounded-xl transition ${
                        currentAdmins.length >= 3 ? 'bg-slate-300 dark:bg-neutral-800 text-slate-500 cursor-not-allowed opacity-50' : 'bg-redPrimary text-white'
                      }`}
                    >
                      <UserPlus className="w-4 h-4 inline mr-1" />
                      {currentAdmins.length >= 3 ? 'Admin Limit Reached (3/3 Max)' : 'Create & Grant Sub-Admin Role'}
                    </button>
                  </form>
                </div>

                {/* Current Active Admins List */}
                <div className="web-card space-y-3 bg-white dark:bg-[#1A1A1A] border border-slate-200 dark:border-[#333333] p-5 sm:p-6 rounded-2xl shadow-md">
                  <h4 className="font-bold text-sm text-slate-700 dark:text-slate-300">Active Administrator Accounts ({currentAdmins.length})</h4>
                  <div className="space-y-2">
                    {currentAdmins.map((adm) => (
                      <div key={adm.id} className="p-4 rounded-xl bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-neutral-800 flex flex-col sm:flex-row justify-between items-start sm:items-center text-xs gap-3">
                        <div className="flex items-center gap-3">
                          <ShieldCheck className="w-5 h-5 text-redPrimary shrink-0" />
                          <div>
                            <strong className="text-slate-900 dark:text-white block text-sm">{adm.fullName || 'Admin Account'}</strong>
                            <span className="text-slate-500 dark:text-slate-400">{adm.email || 'N/A'} • {adm.phoneNumber || 'N/A'}</span>
                            {adm.password && (
                              <p className="text-[11px] text-amber-600 dark:text-amber-400 font-bold mt-0.5">🔑 Password: {adm.password}</p>
                            )}
                          </div>
                        </div>

                        <div className="flex gap-2 items-center w-full sm:w-auto justify-between sm:justify-end">
                          {adm.email === 'sahrahul77@gmail.com' ? (
                            <span className="px-3 py-1 rounded-full text-xs font-black bg-redPrimary/20 text-redPrimary border border-redPrimary/30">
                              Lead Main Admin
                            </span>
                          ) : (
                            <>
                              <button
                                type="button"
                                onClick={() => setEditingAdminUser({ ...adm })}
                                className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1.5 rounded-xl font-bold transition"
                              >
                                Edit Credentials
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDemoteAdmin(adm.id, adm.email)}
                                className="bg-amber-600/80 hover:bg-amber-600 text-white text-xs px-3 py-1.5 rounded-xl font-bold transition"
                              >
                                Demote
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Edit Main Profile Credentials */}
                <form onSubmit={handleSaveAdminProfile} className="web-card space-y-4 bg-white dark:bg-[#1A1A1A] border border-slate-200 dark:border-[#333333] p-5 sm:p-6 rounded-2xl shadow-md">
                  <h3 className="font-extrabold text-base text-redPrimary">Edit Lead Admin Profile Credentials</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">Admin Name</label>
                      <input type="text" value={adminName} onChange={(e) => setAdminName(e.target.value)} className="w-full p-3.5 rounded-xl border border-slate-200 dark:border-neutral-700 bg-slate-50 dark:bg-neutral-900 text-sm font-semibold text-slate-900 dark:text-white outline-none focus:border-redPrimary" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">Phone</label>
                      <input type="text" value={adminPhone} onChange={(e) => setAdminPhone(e.target.value)} className="w-full p-3.5 rounded-xl border border-slate-200 dark:border-neutral-700 bg-slate-50 dark:bg-neutral-900 text-sm font-semibold text-slate-900 dark:text-white outline-none focus:border-redPrimary" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">Email</label>
                      <input type="text" value={adminEmail} onChange={(e) => setAdminEmail(e.target.value)} className="w-full p-3.5 rounded-xl border border-slate-200 dark:border-neutral-700 bg-slate-50 dark:bg-neutral-900 text-sm font-semibold text-slate-900 dark:text-white outline-none focus:border-redPrimary" />
                    </div>
                  </div>
                  <button type="submit" className="btn-primary w-full py-3.5 text-xs font-extrabold">
                    Save Profile Credentials
                  </button>
                </form>
              </div>
            )}
          </>
        )}
      </main>

      {/* Dynamic Popup Modal Component */}
      <PopupModal
        isOpen={popupState.isOpen}
        onClose={() => setPopupState({ ...popupState, isOpen: false })}
        title={popupState.title}
        message={popupState.message}
        type={popupState.type}
        actionText="Continue"
        onAction={popupState.onAction}
      />

      {/* CUSTOM CREATE SUB-ADMIN MODAL */}
      {isCreateSubAdminOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <form onSubmit={handleAddAdmin} className="bg-white dark:bg-[#242424] border border-slate-300 dark:border-neutral-700 rounded-2xl p-6 sm:p-8 w-full max-w-md text-slate-900 dark:text-white space-y-4 relative shadow-2xl">
            <button type="button" onClick={() => setIsCreateSubAdminOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-white"><X className="w-5 h-5" /></button>
            <h3 className="text-lg font-bold text-redPrimary flex items-center gap-2"><UserPlus className="w-5 h-5" /> Create Sub-Admin Account</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Max 3 Admins allowed ({currentAdmins.length}/3 registered).</p>

            <div className="space-y-3 pt-1">
              <div>
                <label className="text-[11px] font-extrabold text-slate-500 dark:text-slate-400 block mb-1">Full Name *</label>
                <input type="text" value={newAdminName} onChange={(e) => setNewAdminName(e.target.value)} placeholder="e.g. Passang Bhutia" required className="w-full p-3 rounded-lg border border-slate-300 dark:border-neutral-700 bg-slate-50 dark:bg-neutral-800 text-xs text-slate-900 dark:text-white outline-none focus:border-redPrimary" />
              </div>

              <div>
                <label className="text-[11px] font-extrabold text-slate-500 dark:text-slate-400 block mb-1">Email Address *</label>
                <input type="email" value={newAdminEmail} onChange={(e) => setNewAdminEmail(e.target.value)} placeholder="e.g. subadmin@gmail.com" required className="w-full p-3 rounded-lg border border-slate-300 dark:border-neutral-700 bg-slate-50 dark:bg-neutral-800 text-xs text-slate-900 dark:text-white outline-none focus:border-redPrimary" />
              </div>

              <div>
                <label className="text-[11px] font-extrabold text-slate-500 dark:text-slate-400 block mb-1">Phone Number *</label>
                <input type="text" value={newAdminPhone} onChange={(e) => setNewAdminPhone(e.target.value)} placeholder="e.g. +91 9563213089" required className="w-full p-3 rounded-lg border border-slate-300 dark:border-neutral-700 bg-slate-50 dark:bg-neutral-800 text-xs text-slate-900 dark:text-white outline-none focus:border-redPrimary" />
              </div>

              <div>
                <label className="text-[11px] font-extrabold text-slate-500 dark:text-slate-400 block mb-1">Sub-Admin Password *</label>
                <input type="text" value={newAdminPassword} onChange={(e) => setNewAdminPassword(e.target.value)} placeholder="Enter Sub-Admin Password" required className="w-full p-3 rounded-lg border border-slate-300 dark:border-neutral-700 bg-slate-50 dark:bg-neutral-800 text-xs text-slate-900 dark:text-white font-bold outline-none focus:border-redPrimary" />
              </div>
            </div>

            <button type="submit" disabled={currentAdmins.length >= 3} className={`btn-primary w-full py-3.5 text-xs font-black shadow-lg rounded-xl transition ${currentAdmins.length >= 3 ? 'bg-slate-300 dark:bg-neutral-800 text-slate-500 cursor-not-allowed' : 'bg-redPrimary text-white'}`}>
              Save & Create Sub-Admin
            </button>
          </form>
        </div>
      )}

      {/* CUSTOM DELETE CONFIRMATION MODAL */}
      {deletingPath && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#242424] border border-slate-300 dark:border-neutral-700 rounded-3xl p-6 sm:p-8 w-full max-w-sm text-slate-900 dark:text-white shadow-2xl text-center space-y-5 relative">
            <div className="w-14 h-14 rounded-full bg-rose-600/20 text-rose-500 flex items-center justify-center mx-auto mb-2">
              <Trash2 className="w-7 h-7" />
            </div>

            <div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white">Are you sure you want to delete?</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">This item will be permanently removed.</p>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeletingPath(null)}
                className="flex-1 py-3 px-4 rounded-xl border border-slate-300 dark:border-neutral-700 bg-slate-100 dark:bg-neutral-800 hover:bg-slate-200 dark:hover:bg-neutral-700 text-xs font-extrabold text-slate-700 dark:text-slate-300 transition"
              >
                No, Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  remove(ref(rtdb, deletingPath)).then(() => {
                    setPopupState({ isOpen: true, title: 'Deleted', message: 'Item deleted successfully.', type: 'info' });
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

      {/* EDIT MODAL FOR SUB-ADMIN USERS */}
      {editingAdminUser && (
        <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4">
          <form onSubmit={handleSaveAdminUserEdit} className="bg-white dark:bg-[#242424] border border-slate-300 dark:border-neutral-700 rounded-2xl p-6 w-full max-w-md text-slate-900 dark:text-white space-y-4 relative shadow-2xl">
            <button type="button" onClick={() => setEditingAdminUser(null)} className="absolute top-4 right-4 text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
            <h3 className="text-lg font-bold text-redPrimary">Edit Sub-Admin Account Credentials</h3>
            <div>
              <label className="text-[11px] font-extrabold text-slate-500 dark:text-slate-400 block mb-1">Full Name</label>
              <input type="text" value={editingAdminUser.fullName || ''} onChange={(e) => setEditingAdminUser({ ...editingAdminUser, fullName: e.target.value })} placeholder="Full Name" className="w-full p-3 rounded-lg border border-slate-300 dark:border-neutral-700 bg-slate-50 dark:bg-neutral-800 text-xs text-slate-900 dark:text-white" />
            </div>
            <div>
              <label className="text-[11px] font-extrabold text-slate-500 dark:text-slate-400 block mb-1">Email Address</label>
              <input type="email" value={editingAdminUser.email || ''} onChange={(e) => setEditingAdminUser({ ...editingAdminUser, email: e.target.value })} placeholder="Email Address" className="w-full p-3 rounded-lg border border-slate-300 dark:border-neutral-700 bg-slate-50 dark:bg-neutral-800 text-xs text-slate-900 dark:text-white" />
            </div>
            <div>
              <label className="text-[11px] font-extrabold text-slate-500 dark:text-slate-400 block mb-1">Phone Number</label>
              <input type="text" value={editingAdminUser.phoneNumber || ''} onChange={(e) => setEditingAdminUser({ ...editingAdminUser, phoneNumber: e.target.value })} placeholder="Phone Number" className="w-full p-3 rounded-lg border border-slate-300 dark:border-neutral-700 bg-slate-50 dark:bg-neutral-800 text-xs text-slate-900 dark:text-white" />
            </div>
            <div>
              <label className="text-[11px] font-extrabold text-slate-500 dark:text-slate-400 block mb-1">Password</label>
              <input type="text" value={editingAdminUser.password || ''} onChange={(e) => setEditingAdminUser({ ...editingAdminUser, password: e.target.value })} placeholder="Sub-Admin Password" className="w-full p-3 rounded-lg border border-slate-300 dark:border-neutral-700 bg-slate-50 dark:bg-neutral-800 text-xs text-slate-900 dark:text-white font-bold" />
            </div>
            <button type="submit" className="btn-primary w-full py-3"><Save className="w-4 h-4 mr-1 inline" /> Save Sub-Admin Updates</button>
          </form>
        </div>
      )}

      {/* EDIT MODAL FOR CATEGORIES */}
      {editingCategory && (
        <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4">
          <form onSubmit={handleSaveCategoryEdit} className="bg-white dark:bg-[#242424] border border-slate-300 dark:border-neutral-700 rounded-2xl p-6 w-full max-w-md text-slate-900 dark:text-white space-y-4 relative shadow-2xl">
            <button type="button" onClick={() => setEditingCategory(null)} className="absolute top-4 right-4 text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
            <h3 className="text-lg font-bold text-redPrimary">Edit Category</h3>

            <div>
              <label className="text-[11px] font-extrabold text-slate-500 dark:text-slate-400 block mb-1">Category Name</label>
              <input type="text" value={editingCategory.name} onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })} placeholder="Category Name" className="w-full p-3 rounded-lg border border-slate-300 dark:border-neutral-700 bg-slate-50 dark:bg-neutral-800 text-xs text-slate-900 dark:text-white" />
            </div>

            <div>
              <label className="text-[11px] font-extrabold text-slate-500 dark:text-slate-400 block mb-1">Upload New Icon File (&le;200KB) / URL</label>
              <div className="flex flex-col gap-2">
                <label className="bg-redPrimary/10 hover:bg-redPrimary/20 text-redPrimary border border-redPrimary/30 px-4 py-2.5 rounded-xl text-xs font-extrabold cursor-pointer flex items-center justify-center gap-1.5 transition">
                  <Upload className="w-4 h-4" /> 📷 Upload New Icon File
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageFileUpload(e, (res) => setEditingCategory({ ...editingCategory, iconUrl: res }))}
                    className="hidden"
                  />
                </label>
                <input type="text" value={editingCategory.iconUrl} onChange={(e) => setEditingCategory({ ...editingCategory, iconUrl: e.target.value })} placeholder="Or paste Icon Image URL" className="w-full p-3 rounded-lg border border-slate-300 dark:border-neutral-700 bg-slate-50 dark:bg-neutral-800 text-xs text-slate-900 dark:text-white" />
              </div>
            </div>

            {editingCategory.iconUrl && (
              <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-100 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700">
                <img src={editingCategory.iconUrl} className="w-10 h-10 object-contain rounded-lg p-1 bg-white" alt="Preview" />
                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold">New Icon Selected</span>
              </div>
            )}

            <button type="submit" className="btn-primary w-full py-3"><Save className="w-4 h-4 mr-1 inline" /> Save Category Updates</button>
          </form>
        </div>
      )}

      {/* EDIT MODAL FOR SERVICES */}
      {editingService && (
        <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4">
          <form onSubmit={handleSaveServiceEdit} className="bg-white dark:bg-[#242424] border border-slate-300 dark:border-neutral-700 rounded-2xl p-6 w-full max-w-md text-slate-900 dark:text-white space-y-4 relative shadow-2xl max-h-[90vh] overflow-y-auto">
            <button type="button" onClick={() => setEditingService(null)} className="absolute top-4 right-4 text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
            <h3 className="text-lg font-bold text-redPrimary">Edit Service</h3>

            <div>
              <label className="text-[11px] font-extrabold text-slate-500 dark:text-slate-400 block mb-1">Service Title</label>
              <input type="text" value={editingService.title} onChange={(e) => setEditingService({ ...editingService, title: e.target.value })} placeholder="Service Title" className="w-full p-3 rounded-lg border border-slate-300 dark:border-neutral-700 bg-slate-50 dark:bg-neutral-800 text-xs text-slate-900 dark:text-white" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-extrabold text-slate-500 dark:text-slate-400 block mb-1">Original Price (₹)</label>
                <input type="number" value={editingService.originalPrice} onChange={(e) => setEditingService({ ...editingService, originalPrice: e.target.value })} placeholder="Original Price" className="w-full p-3 rounded-lg border border-slate-300 dark:border-neutral-700 bg-slate-50 dark:bg-neutral-800 text-xs text-slate-900 dark:text-white" />
              </div>
              <div>
                <label className="text-[11px] font-extrabold text-slate-500 dark:text-slate-400 block mb-1">Discount Price (₹)</label>
                <input type="number" value={editingService.discountedPrice} onChange={(e) => setEditingService({ ...editingService, discountedPrice: e.target.value })} placeholder="Discount Price" className="w-full p-3 rounded-lg border border-slate-300 dark:border-neutral-700 bg-slate-50 dark:bg-neutral-800 text-xs text-slate-900 dark:text-white" />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-extrabold text-slate-500 dark:text-slate-400 block mb-1">Upload New Service Image File (&le;200KB) / URL</label>
              <div className="flex flex-col gap-2">
                <label className="bg-redPrimary/10 hover:bg-redPrimary/20 text-redPrimary border border-redPrimary/30 px-4 py-2.5 rounded-xl text-xs font-extrabold cursor-pointer flex items-center justify-center gap-1.5 transition">
                  <Upload className="w-4 h-4" /> 📷 Upload New Image File
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageFileUpload(e, (res) => setEditingService({ ...editingService, imageUrl: res }))}
                    className="hidden"
                  />
                </label>
                <input type="text" value={editingService.imageUrl} onChange={(e) => setEditingService({ ...editingService, imageUrl: e.target.value })} placeholder="Or paste Image URL" className="w-full p-3 rounded-lg border border-slate-300 dark:border-neutral-700 bg-slate-50 dark:bg-neutral-800 text-xs text-slate-900 dark:text-white" />
              </div>
            </div>

            {editingService.imageUrl && (
              <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-100 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700">
                <img src={editingService.imageUrl} className="w-16 h-12 object-cover rounded-lg bg-white p-1" alt="Preview" />
                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold">New Image Selected</span>
              </div>
            )}

            <button type="submit" className="btn-primary w-full py-3"><Save className="w-4 h-4 mr-1 inline" /> Save Service Updates</button>
          </form>
        </div>
      )}

      {/* EDIT MODAL FOR BANNERS */}
      {editingBanner && (
        <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4">
          <form onSubmit={handleSaveBannerEdit} className="bg-white dark:bg-[#242424] border border-slate-300 dark:border-neutral-700 rounded-2xl p-6 w-full max-w-md text-slate-900 dark:text-white space-y-4 relative shadow-2xl">
            <button type="button" onClick={() => setEditingBanner(null)} className="absolute top-4 right-4 text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
            <h3 className="text-lg font-bold text-redPrimary">Edit Marketing Banner</h3>

            <div>
              <label className="text-[11px] font-extrabold text-slate-500 dark:text-slate-400 block mb-1">Banner Title</label>
              <input type="text" value={editingBanner.title} onChange={(e) => setEditingBanner({ ...editingBanner, title: e.target.value })} placeholder="Title" className="w-full p-3 rounded-lg border border-slate-300 dark:border-neutral-700 bg-slate-50 dark:bg-neutral-800 text-xs text-slate-900 dark:text-white" />
            </div>

            <div>
              <label className="text-[11px] font-extrabold text-slate-500 dark:text-slate-400 block mb-1">Subtitle</label>
              <input type="text" value={editingBanner.subtitle} onChange={(e) => setEditingBanner({ ...editingBanner, subtitle: e.target.value })} placeholder="Subtitle" className="w-full p-3 rounded-lg border border-slate-300 dark:border-neutral-700 bg-slate-50 dark:bg-neutral-800 text-xs text-slate-900 dark:text-white" />
            </div>

            <div>
              <label className="text-[11px] font-extrabold text-slate-500 dark:text-slate-400 block mb-1">Upload New Banner Image File (&le;200KB) / URL</label>
              <div className="flex flex-col gap-2">
                <label className="bg-redPrimary/10 hover:bg-redPrimary/20 text-redPrimary border border-redPrimary/30 px-4 py-2.5 rounded-xl text-xs font-extrabold cursor-pointer flex items-center justify-center gap-1.5 transition">
                  <Upload className="w-4 h-4" /> 📷 Upload New Banner Image File
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageFileUpload(e, (res) => setEditingBanner({ ...editingBanner, imageUrl: res }))}
                    className="hidden"
                  />
                </label>
                <input type="text" value={editingBanner.imageUrl} onChange={(e) => setEditingBanner({ ...editingBanner, imageUrl: e.target.value })} placeholder="Or Banner Image URL" className="w-full p-3 rounded-lg border border-slate-300 dark:border-neutral-700 bg-slate-50 dark:bg-neutral-800 text-xs text-slate-900 dark:text-white" />
              </div>
            </div>

            {editingBanner.imageUrl && (
              <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-100 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700">
                <img src={editingBanner.imageUrl} className="w-20 h-12 object-cover rounded-lg bg-white p-1" alt="Preview" />
                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold">New Banner Image Selected</span>
              </div>
            )}

            <button type="submit" className="btn-primary w-full py-3"><Save className="w-4 h-4 mr-1 inline" /> Save Banner Updates</button>
          </form>
        </div>
      )}

      {/* EDIT MODAL FOR TESTIMONIALS */}
      {editingTestimonial && (
        <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4">
          <form onSubmit={handleSaveTestimonialEdit} className="bg-white dark:bg-[#242424] border border-slate-300 dark:border-neutral-700 rounded-2xl p-6 w-full max-w-md text-slate-900 dark:text-white space-y-4 relative shadow-2xl">
            <button type="button" onClick={() => setEditingTestimonial(null)} className="absolute top-4 right-4 text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
            <h3 className="text-lg font-bold text-redPrimary">Edit Customer Experience Review</h3>
            <input type="text" value={editingTestimonial.name} onChange={(e) => setEditingTestimonial({ ...editingTestimonial, name: e.target.value })} placeholder="Name" className="w-full p-3 rounded-lg border border-slate-300 dark:border-neutral-700 bg-slate-50 dark:bg-neutral-800 text-xs text-slate-900 dark:text-white" />
            <input type="text" value={editingTestimonial.location} onChange={(e) => setEditingTestimonial({ ...editingTestimonial, location: e.target.value })} placeholder="Location" className="w-full p-3 rounded-lg border border-slate-300 dark:border-neutral-700 bg-slate-50 dark:bg-neutral-800 text-xs text-slate-900 dark:text-white" />
            <textarea value={editingTestimonial.text} onChange={(e) => setEditingTestimonial({ ...editingTestimonial, text: e.target.value })} placeholder="Text" rows={3} className="w-full p-3 rounded-lg border border-slate-300 dark:border-neutral-700 bg-slate-50 dark:bg-neutral-800 text-xs text-slate-900 dark:text-white"></textarea>
            <button type="submit" className="btn-primary w-full py-3"><Save className="w-4 h-4 mr-1 inline" /> Save Review Updates</button>
          </form>
        </div>
      )}

      {/* EDIT MODAL FOR FAQS */}
      {editingFaq && (
        <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4">
          <form onSubmit={handleSaveFaqEdit} className="bg-white dark:bg-[#242424] border border-slate-300 dark:border-neutral-700 rounded-2xl p-6 w-full max-w-md text-slate-900 dark:text-white space-y-4 relative shadow-2xl">
            <button type="button" onClick={() => setEditingFaq(null)} className="absolute top-4 right-4 text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
            <h3 className="text-lg font-bold text-redPrimary">Edit FAQ</h3>
            <input type="text" value={editingFaq.q} onChange={(e) => setEditingFaq({ ...editingFaq, q: e.target.value })} placeholder="Question" className="w-full p-3 rounded-lg border border-slate-300 dark:border-neutral-700 bg-slate-50 dark:bg-neutral-800 text-xs text-slate-900 dark:text-white" />
            <textarea value={editingFaq.a} onChange={(e) => setEditingFaq({ ...editingFaq, a: e.target.value })} placeholder="Answer" rows={3} className="w-full p-3 rounded-lg border border-slate-300 dark:border-neutral-700 bg-slate-50 dark:bg-neutral-800 text-xs text-slate-900 dark:text-white"></textarea>
            <button type="submit" className="btn-primary w-full py-3"><Save className="w-4 h-4 mr-1 inline" /> Save FAQ Updates</button>
          </form>
        </div>
      )}

      {/* ASSIGN PARTNER MODAL */}
      {assigningBooking && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#242424] border border-slate-300 dark:border-[#3A3A3A] rounded-3xl p-6 sm:p-8 w-full max-w-lg text-slate-900 dark:text-white shadow-2xl relative space-y-5 max-h-[90vh] overflow-y-auto">

            <button onClick={() => setAssigningBooking(null)} className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 dark:hover:text-white">
              <X className="w-5 h-5" />
            </button>

            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white leading-snug">
                Assign Partner for {assigningBooking.serviceTitle}
              </h2>
              <p className="text-xs font-bold text-redPrimary mt-1">
                Service Category: {assigningBooking.serviceCategory || 'Services'}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-3 font-semibold">
                Select a verified partner to dispatch for order ref: <span className="text-slate-900 dark:text-white font-bold">{assigningBooking.bookingRef || assigningBooking.id}</span>
              </p>
            </div>

            {/* 3 Filter Tabs inside Modal */}
            <div className="flex border-b border-slate-200 dark:border-neutral-700 text-xs font-extrabold">
              <button
                type="button"
                onClick={() => setAssignFilterTab(0)}
                className={`flex-1 py-2.5 text-center border-b-2 transition ${
                  assignFilterTab === 0 ? 'border-b-redPrimary text-redPrimary' : 'border-b-transparent text-slate-500 dark:text-slate-400'
                }`}
              >
                Skill Matched ({skillMatchedCount})
              </button>

              <button
                type="button"
                onClick={() => setAssignFilterTab(1)}
                className={`flex-1 py-2.5 text-center border-b-2 transition ${
                  assignFilterTab === 1 ? 'border-b-redPrimary text-redPrimary' : 'border-b-transparent text-slate-500 dark:text-slate-400'
                }`}
              >
                🟢 Free ({freePartnersCount})
              </button>

              <button
                type="button"
                onClick={() => setAssignFilterTab(2)}
                className={`flex-1 py-2.5 text-center border-b-2 transition ${
                  assignFilterTab === 2 ? 'border-b-redPrimary text-redPrimary' : 'border-b-transparent text-slate-500 dark:text-slate-400'
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
                    <div key={partner.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-[#1A1A1A] border border-slate-200 dark:border-[#333333] flex justify-between items-center shadow-md">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                          <User className="w-5 h-5" />
                        </div>

                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <strong className="text-sm font-black text-slate-900 dark:text-white">{partner.fullName}</strong>
                            {isSkillMatch && (
                              <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-emerald-600/20 text-emerald-600 dark:text-emerald-400 border border-emerald-600/30">
                                ★ Skill Match
                              </span>
                            )}
                            {isFree && !isSkillMatch && (
                              <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-emerald-600/20 text-emerald-600 dark:text-emerald-400 border border-emerald-600/30">
                                🟢 FREE
                              </span>
                            )}
                          </div>

                          <p className="text-xs text-redPrimary font-bold">
                            Skill: {partner.skillCategory || 'Craftsman Specialist'}
                          </p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">
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
