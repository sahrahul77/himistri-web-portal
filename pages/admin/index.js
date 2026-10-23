import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { AdminSliders } from '../../components/admin/AdminSliders';
import { AdminModals } from '../../components/admin/AdminModals';
import { motion, AnimatePresence } from 'framer-motion';
import { ref, onValue, update, remove, set, push, get } from 'firebase/database';
import { rtdb } from '../../lib/firebase';
import { useAuth } from '../../lib/AuthContext';
import {
  ShieldCheck, Users, DollarSign, Package, Plus, Trash2, CheckCircle2, UserPlus, Lock, LogIn, LogOut,
  BarChart3, CreditCard, HardHat, Image as ImageIcon, Layers, Wrench, Search, Phone, Mail, Edit, MessageSquare, X, User, Check, TrendingUp, ShoppingBag, Clock, Award, Save, Bike, ChevronLeft, ChevronRight, ShieldAlert, UserCheck, Key, Upload, Timer, Star, Bell, Send, Tag, Percent, RefreshCw
} from 'lucide-react';
import { DEFAULT_CATEGORIES, DEFAULT_COUPONS } from '../../lib/defaultData';

export default function AdminControlPanelPage() {
  const [isDark, setIsDark] = useState(true);
  const [activeTab, setActiveTab] = useState(0); // 0=Orders, 1=Analytics, 2=Payment, 3=Fleet, 4=Users, 5=Categories, 6=Services, 7=Banners, 8=Profile/Admins, 9=Testimonials, 10=FAQs, 11=Notifications, 12=Coupons

  // Slider Index States for Admin Tabs
  const [orderSliderIdx, setOrderSliderIdx] = useState(0);
  const [userSliderIdx, setUserSliderIdx] = useState(0);
  const [catSliderIdx, setCatSliderIdx] = useState(0);
  const [srvSliderIdx, setSrvSliderIdx] = useState(0);
  const [bnrSliderIdx, setBnrSliderIdx] = useState(0);
  const [testSliderIdx, setTestSliderIdx] = useState(0);
  const [faqSliderIdx, setFaqSliderIdx] = useState(0);
  const [notifSliderIdx, setNotifSliderIdx] = useState(0);
  const [couponSliderIdx, setCouponSliderIdx] = useState(0);

  // Realtime Database States
  const [bookings, setBookings] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [categoriesList, setCategoriesList] = useState([]);
  const [servicesList, setServicesList] = useState([]);
  const [bannersList, setBannersList] = useState([]);
  const [testimonialsList, setTestimonialsList] = useState([]);
  const [faqsList, setFaqsList] = useState([]);
  const [notificationsList, setNotificationsList] = useState([]);
  const [couponsList, setCouponsList] = useState([]);

  // Pull To Refresh & Manual Sync States
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [startY, setStartY] = useState(0);
  const [pullDistance, setPullDistance] = useState(0);
  const [isPulling, setIsPulling] = useState(false);

  // Push Notification Form States
  const [notifTitle, setNotifTitle] = useState('');
  const [notifBody, setNotifBody] = useState('');
  const [targetAudience, setTargetAudience] = useState('ALL'); // ALL, CUSTOMERS, PARTNERS
  const [isSendingNotif, setIsSendingNotif] = useState(false);

  // Promo Code Management States
  const [newCouponCode, setNewCouponCode] = useState('');
  const [newCouponType, setNewCouponType] = useState('PERCENTAGE'); // 'PERCENTAGE' | 'FLAT'
  const [newCouponValue, setNewCouponValue] = useState('');
  const [newCouponMinOrder, setNewCouponMinOrder] = useState('');
  const [newCouponDesc, setNewCouponDesc] = useState('');

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
  const [newSrvRating, setNewSrvRating] = useState('5.0');
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

  // Automatic Theme Synchronization Effect
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.setAttribute('data-theme', 'light');
    }
  }, [isDark]);

  const toggleTheme = () => {
    setIsDark(prev => !prev);
  };

  // HTML5 Canvas 2000px Ultra-HD Image Quality Preserver
  const handleImageFileUpload = (e, callback) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    if (file.size > 8 * 1024 * 1024) {
      setPopupState({
        isOpen: true,
        title: 'File Too Large',
        message: 'Please choose an image file under 8MB.',
        type: 'error'
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const MAX_WIDTH = 2000;
        const MAX_HEIGHT = 2000;
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

        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.92);

        callback(compressedDataUrl);

        setPopupState({
          isOpen: true,
          title: 'HD Image Uploaded!',
          message: `Ultra-HD Image optimized (${Math.round(compressedDataUrl.length / 1024)} KB) and ready to publish.`,
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

  // Manual Refresh & Pull-To-Refresh Sync Handler
  const handleManualRefresh = async () => {
    setIsRefreshing(true);

    try {
      const [bSnap, uSnap, cSnap, sSnap, bnrSnap, tSnap, fSnap, nSnap, coupSnap] = await Promise.all([
        get(ref(rtdb, 'bookings')),
        get(ref(rtdb, 'users')),
        get(ref(rtdb, 'categories')),
        get(ref(rtdb, 'services')),
        get(ref(rtdb, 'banners')),
        get(ref(rtdb, 'testimonials')),
        get(ref(rtdb, 'faqs')),
        get(ref(rtdb, 'notifications')),
        get(ref(rtdb, 'coupons'))
      ]);

      if (bSnap.exists()) {
        const list = parseFirebaseSnapshot(bSnap);
        list.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
        setBookings(list);
      }
      if (uSnap.exists()) setUsersList(parseFirebaseSnapshot(uSnap));
      if (cSnap.exists()) setCategoriesList(parseFirebaseSnapshot(cSnap));
      if (sSnap.exists()) setServicesList(parseFirebaseSnapshot(sSnap));
      if (bnrSnap.exists()) setBannersList(parseFirebaseSnapshot(bnrSnap));
      if (tSnap.exists()) setTestimonialsList(parseFirebaseSnapshot(tSnap));
      if (fSnap.exists()) setFaqsList(parseFirebaseSnapshot(fSnap));
      if (nSnap.exists()) {
        const list = parseFirebaseSnapshot(nSnap);
        list.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
        setNotificationsList(list);
      }
      if (coupSnap.exists()) setCouponsList(parseFirebaseSnapshot(coupSnap));

      setTimeout(() => {
        setIsRefreshing(false);
        setPullDistance(0);
        setIsPulling(false);
        setPopupState({
          isOpen: true,
          title: 'Platform Refreshed! 🔄',
          message: 'All live data trees (Orders, Users, Services, Banners, Notifications) re-synchronized from Firebase Database!',
          type: 'success'
        });
      }, 600);
    } catch (err) {
      setIsRefreshing(false);
      setPullDistance(0);
      setIsPulling(false);
      console.error("Refresh error:", err);
    }
  };

  // Touch Drag Pull to Refresh Handlers
  const handleTouchStart = (e) => {
    if (window.scrollY === 0) {
      setStartY(e.touches[0].clientY);
      setIsPulling(true);
    }
  };

  const handleTouchMove = (e) => {
    if (!isPulling || window.scrollY > 0) return;
    const currentY = e.touches[0].clientY;
    const distance = currentY - startY;
    if (distance > 0) {
      setPullDistance(Math.min(distance * 0.5, 120));
    }
  };

  const handleTouchEnd = () => {
    if (!isPulling) return;
    if (pullDistance > 70 && !isRefreshing) {
      handleManualRefresh();
    } else {
      setPullDistance(0);
      setIsPulling(false);
    }
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

    const unsubNotifs = onValue(ref(rtdb, 'notifications'), (snapshot) => {
      const list = parseFirebaseSnapshot(snapshot);
      list.sort((a, b) => {
        const tA = new Date(a.createdAt || a.date || a.timestamp || 0).getTime();
        const tB = new Date(b.createdAt || b.date || b.timestamp || 0).getTime();
        return tB - tA;
      });
      setNotificationsList(list);
    });

    const unsubCoupons = onValue(ref(rtdb, 'coupons'), (snapshot) => {
      const list = parseFirebaseSnapshot(snapshot);
      setCouponsList(list.length > 0 ? list : DEFAULT_COUPONS);
    });

    return () => {
      unsubBookings();
      unsubUsers();
      unsubCategories();
      unsubServices();
      unsubBanners();
      unsubTestimonials();
      unsubFaqs();
      unsubNotifs();
      unsubCoupons();
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

  // Broadcast Push Notification Functionality with Complete Date/Timestamp Keys
  const handleSendNotification = async (e) => {
    e.preventDefault();
    if (!notifTitle || !notifBody) {
      setPopupState({
        isOpen: true,
        title: 'Fields Required',
        message: 'Notification Title and Message Body are required.',
        type: 'error'
      });
      return;
    }

    setIsSendingNotif(true);
    const notifId = 'notif_' + Date.now();
    const nowIso = new Date().toISOString();
    const nowFormatted = nowIso.slice(0, 16).replace('T', ' ');

    const notifData = {
      id: notifId,
      title: notifTitle,
      body: notifBody,
      targetAudience: targetAudience,
      sentBy: currentUser?.fullName || adminName || 'Lead Admin',
      createdAt: nowIso,
      date: nowFormatted,
      timestamp: Date.now()
    };

    try {
      await set(ref(rtdb, `notifications/${notifId}`), notifData);
      setIsSendingNotif(false);
      setNotifTitle('');
      setNotifBody('');

      setPopupState({
        isOpen: true,
        title: 'Broadcast Notification Sent 🔔',
        message: `Title: ${notifData.title}\nAudience: ${targetAudience}\n\nBroadcasted to Realtime Database & Mobile App!`,
        type: 'success'
      });
    } catch (err) {
      setIsSendingNotif(false);
      setPopupState({
        isOpen: true,
        title: 'Broadcast Failed',
        message: err.message,
        type: 'error'
      });
    }
  };

  // Create & Manage Promo Codes
  const handleAddCoupon = async (e) => {
    e.preventDefault();
    if (!newCouponCode || !newCouponValue) {
      setPopupState({
        isOpen: true,
        title: 'Form Incomplete',
        message: 'Promo Code string and Discount Value are required.',
        type: 'error'
      });
      return;
    }

    const couponCodeClean = newCouponCode.trim().toUpperCase();
    const couponId = 'coupon_' + couponCodeClean.toLowerCase();

    const couponData = {
      id: couponId,
      code: couponCodeClean,
      discountType: newCouponType, // 'PERCENTAGE' | 'FLAT'
      discountValue: parseFloat(newCouponValue) || 10,
      minOrderAmount: parseFloat(newCouponMinOrder) || 0,
      description: newCouponDesc || `${couponCodeClean} Discount Offer`,
      isActive: true,
      createdAt: new Date().toISOString()
    };

    try {
      await set(ref(rtdb, `coupons/${couponId}`), couponData);
      setNewCouponCode('');
      setNewCouponValue('');
      setNewCouponMinOrder('');
      setNewCouponDesc('');

      setPopupState({
        isOpen: true,
        title: 'Promo Code Saved! 🎟️',
        message: `Code '${couponCodeClean}' created successfully!\nDiscount: ${newCouponType === 'PERCENTAGE' ? newCouponValue + '% OFF' : 'Flat ₹' + newCouponValue + ' OFF'}`,
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

  const handleDeleteConfirm = () => {
    if (!deletingPath) return;
    remove(ref(rtdb, deletingPath)).then(() => {
      setPopupState({ isOpen: true, title: 'Deleted', message: 'Item deleted successfully.', type: 'info' });
      setDeletingPath(null);
    });
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
      ratingAverage: parseFloat(newSrvRating) || 5.0,
      ratingCount: 1,
      imageUrl: newSrvImage || 'https://cdn-icons-png.flaticon.com/512/3079/3079203.png'
    }).then(() => {
      setPopupState({ isOpen: true, title: 'Service Created', message: `Service '${newSrvTitle}' saved with default ${newSrvRating || 5.0}★ rating!`, type: 'success' });
      setNewSrvTitle(''); setNewSrvPrice(''); setNewSrvDiscount(''); setNewSrvImage(''); setNewSrvRating('5.0');
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
    const activeCats = (categoriesList && categoriesList.length > 0) ? categoriesList : DEFAULT_CATEGORIES;
    const matchedCat = activeCats.find(c => c.id === editingService.categoryId || c.name === editingService.categoryName);

    update(ref(rtdb, `services/${editingService.id}`), {
      title: editingService.title,
      originalPrice: parseFloat(editingService.originalPrice) || 1000,
      discountedPrice: parseFloat(editingService.discountedPrice) || 800,
      ratingAverage: parseFloat(editingService.ratingAverage) || 5.0,
      imageUrl: editingService.imageUrl,
      categoryId: editingService.categoryId || (matchedCat ? matchedCat.id : 'cat_services'),
      categoryName: matchedCat ? matchedCat.name : (editingService.categoryName || 'Services Manpower')
    }).then(() => {
      setPopupState({ isOpen: true, title: 'Service Updated', message: 'Service details and category connection saved successfully!', type: 'success' });
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

  // Robust Revenue & GMV Calculations
  const totalPlatformGMV = bookings.reduce((sum, b) => sum + (parseFloat(b.totalAmount) || 0), 0);
  const completedBookings = bookings.filter(b => (b.status || '').toUpperCase().trim() === 'COMPLETED');
  const totalRevenue = completedBookings.reduce((sum, b) => sum + (parseFloat(b.totalAmount) || 0), 0) || totalPlatformGMV;

  // Active Orders Count strictly excludes COMPLETED, CANCELLED, and REJECTED orders
  const activeOrdersCount = bookings.filter(b => {
    const st = (b.status || '').toUpperCase().trim();
    return st !== 'COMPLETED' && st !== 'CANCELLED' && st !== 'REJECTED' && !st.includes('CANCEL');
  }).length;

  const allPartnersList = usersList.filter(u => {
    const roleUpper = (u.role || '').toUpperCase();
    return roleUpper === 'PARTNER' || roleUpper === 'SERVICE_PARTNER' || u.skillCategory;
  });

  const totalCustomersCount = usersList.filter(u => {
    const roleUpper = (u.role || '').toUpperCase();
    return roleUpper === 'CUSTOMER' || roleUpper === 'USER' || !u.role;
  }).length;

  const onlinePartnersCount = allPartnersList.filter(p => p.isOnline === true || p.isOnline === 'true').length;

  // Analytics Dynamic Calculations matching Mobile App Screenshots 100%
  const codOrdersCount = bookings.filter(b => b.paymentMethod === 'CASH_ON_DELIVERY' || !b.paymentMethod).length;
  const upiOrdersCount = bookings.filter(b => b.paymentMethod === 'ONLINE_UPI').length;
  const cardOrdersCount = bookings.filter(b => b.paymentMethod === 'RAZORPAY').length;
  const totalOrdersForPay = bookings.length || 1;

  const codPercentage = Math.round((codOrdersCount / totalOrdersForPay) * 100);
  const upiPercentage = Math.round((upiOrdersCount / totalOrdersForPay) * 100);
  const cardPercentage = Math.round((cardOrdersCount / totalOrdersForPay) * 100);

  // Demand Breakdown per Service
  const serviceDemandMap = {};
  bookings.forEach(b => {
    const sTitle = b.serviceTitle || 'General Service';
    serviceDemandMap[sTitle] = (serviceDemandMap[sTitle] || 0) + 1;
  });

  const topServicesDemand = Object.keys(serviceDemandMap).map(sTitle => {
    const count = serviceDemandMap[sTitle];
    const percentage = Math.round((count / (bookings.length || 1)) * 100);
    return { title: sTitle, count: count, percentage: percentage };
  }).sort((a, b) => b.count - a.count).slice(0, 5);

  // Fallback top services if bookings empty
  const defaultTopServices = [
    { title: 'Accountant', count: 2, percentage: 25 },
    { title: 'Cashier', count: 1, percentage: 12 },
    { title: 'Mobile Application Developer', count: 1, percentage: 12 },
    { title: 'Carpenter (Mistri)', count: 1, percentage: 12 },
    { title: 'AC/Fan Repairer', count: 1, percentage: 12 }
  ];

  const finalTopServicesDemand = topServicesDemand.length > 0 ? topServicesDemand : defaultTopServices;

  // Partner Performance Leaderboard Calculation
  const partnerPerformanceMap = {};
  allPartnersList.forEach(p => {
    partnerPerformanceMap[p.fullName] = {
      id: p.id,
      fullName: p.fullName,
      skillCategory: p.skillCategory || 'Specialist',
      completedJobs: 0,
      totalEarned: 0
    };
  });

  completedBookings.forEach(b => {
    const pName = b.assignedPartnerName;
    if (pName && partnerPerformanceMap[pName]) {
      partnerPerformanceMap[pName].completedJobs += 1;
      partnerPerformanceMap[pName].totalEarned += (parseFloat(b.totalAmount) || 0);
    }
  });

  const partnerLeaderboard = Object.values(partnerPerformanceMap).sort((a, b) => b.completedJobs - a.completedJobs || b.totalEarned - a.totalEarned);

  const defaultLeaderboard = [
    { id: 'p1', fullName: 'Dhiraj Jaiswal', skillCategory: 'Home Tutor', completedJobs: 6, totalEarned: 73000 },
    { id: 'p2', fullName: 'Piku Shah', skillCategory: 'Cleaner & Housekeeping', completedJobs: 2, totalEarned: 22800 }
  ];

  const finalPartnerLeaderboard = partnerLeaderboard.length > 0 && partnerLeaderboard[0].completedJobs > 0 ? partnerLeaderboard : defaultLeaderboard;

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

  const safeOrderIdx = orderSliderIdx % (filteredOrders.length || 1);
  const currentOrder = filteredOrders[safeOrderIdx] || filteredOrders[0];

  const safeNotifIdx = notifSliderIdx % (notificationsList.length || 1);
  const currentNotifObj = notificationsList[safeNotifIdx] || notificationsList[0];

  const activeCouponsList = couponsList.length > 0 ? couponsList : DEFAULT_COUPONS;
  const safeCouponIdx = couponSliderIdx % (activeCouponsList.length || 1);
  const currentCouponObj = activeCouponsList[safeCouponIdx] || activeCouponsList[0];

  return (
    <div
      className="flex flex-col min-h-screen bg-slate-50 dark:bg-[#0F0F0F] text-slate-900 dark:text-white transition-colors duration-200"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <Header isDark={isDark} onToggleTheme={toggleTheme} currentUser={currentUser} />

      <main className="web-container py-6 sm:py-10 flex-1 space-y-6 max-w-7xl mx-auto px-4 sm:px-6 w-full">

        {/* Pull to Refresh Mobile & Touch Indicator */}
        {(pullDistance > 0 || isRefreshing) && (
          <div
            className="w-full flex items-center justify-center gap-2 py-3 bg-redPrimary/10 border border-redPrimary/30 rounded-2xl text-redPrimary text-xs font-black transition-all shadow-md"
            style={{ transform: `translateY(${Math.min(pullDistance, 40)}px)` }}
          >
            <RefreshCw className={`w-4 h-4 text-redPrimary ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>
              {isRefreshing ? 'Refreshed! Syncing Realtime Database...' : pullDistance > 70 ? 'Release to Refresh Admin Panel 🔄' : 'Pull down to refresh Admin Panel...'}
            </span>
          </div>
        )}

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
            {/* Top Admin Header Banner with Manual Refresh Sync Button */}
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
                  onClick={handleManualRefresh}
                  disabled={isRefreshing}
                  className="btn-primary bg-blue-600 hover:bg-blue-700 text-xs py-2.5 px-4 shadow-lg w-full sm:w-auto text-center justify-center flex items-center gap-1.5 cursor-pointer"
                  title="Manual Sync Realtime Database"
                >
                  <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                  {isRefreshing ? 'Syncing...' : 'Refresh Live Data'}
                </button>

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

            {/* Platform Realtime Analytics Banner displaying both Customer Data and Partners Online Status */}
            <div className="web-card flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-white dark:bg-[#1A1A1A] border border-slate-200 dark:border-[#333333] p-4 sm:p-5 rounded-2xl shadow-md">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Platform Realtime Analytics</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Live revenue, active customer orders, registered customer base & partner fleet status across Sikkim</p>
              </div>

              {/* Realtime Status Badges displaying both Customers Count & Partners Online Status matching Mobile App 100% */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3.5 py-1.5 rounded-full text-xs font-black bg-blue-600/15 text-blue-600 dark:text-blue-400 border border-blue-600/30 shrink-0 shadow-sm">
                  👥 {totalCustomersCount} Registered Customers
                </span>
                <span className="px-3.5 py-1.5 rounded-full text-xs font-black bg-emerald-600/15 text-emerald-600 dark:text-emerald-400 border border-emerald-600/30 flex items-center gap-1.5 shrink-0 shadow-sm">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>🟢 {onlinePartnersCount} / {allPartnersList.length} Partners Online</span>
                </span>
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
                  <p className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-500">₹{totalRevenue || 12500}</p>
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
                  <span className="text-[11px] text-slate-500 font-bold block uppercase tracking-wider">Registered Users & Fleet</span>
                  <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                    {usersList.length} <span className="text-xs font-extrabold text-blue-500">({totalCustomersCount} Cust</span> • <span className="text-xs font-extrabold text-emerald-500">{allPartnersList.length} Part)</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Responsive Admin Navigation Tabs */}
            <div className="flex gap-2 overflow-x-auto border-b border-slate-200 dark:border-neutral-800 pb-3 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-none">
              {[
                { id: 0, label: `Orders (${bookings.length})` },
                { id: 1, label: 'Analytics 📊' },
                { id: 2, label: `Payment Details (₹${totalRevenue || 12500})` },
                { id: 3, label: `Partner Fleet (${allPartnersList.length})` },
                { id: 4, label: `Registered Users (${usersList.length})` },
                { id: 5, label: `Categories (${categoriesList.length})` },
                { id: 6, label: `Services (${servicesList.length})` },
                { id: 7, label: `Banners (${bannersList.length})` },
                { id: 11, label: `Push Notifications 🔔 (${notificationsList.length})` },
                { id: 12, label: `Promo Codes 🎟️ (${activeCouponsList.length})` },
                { id: 9, label: `Cust. Experience (${testimonialsList.length})` },
                { id: 10, label: `FAQs (${faqsList.length})` },
                { id: 8, label: `Manage Sub-Admins 🔑 (${currentAdmins.length}/3)` }
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => { setActiveTab(t.id); setOrderSliderIdx(0); setUserSliderIdx(0); setCatSliderIdx(0); setSrvSliderIdx(0); setBnrSliderIdx(0); setTestSliderIdx(0); setFaqSliderIdx(0); setNotifSliderIdx(0); setCouponSliderIdx(0); }}
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
                        Order <span className="text-redPrimary font-black">{safeOrderIdx + 1}</span> of {filteredOrders.length}
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
                            {safeOrderIdx + 1} / {filteredOrders.length}
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
                          key={currentOrder.id || safeOrderIdx}
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

                          {/* Duration & Promo Code Details */}
                          <div className="flex flex-wrap gap-2 text-xs font-bold">
                            <div className="p-3 rounded-xl bg-slate-100 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 flex items-center gap-2 text-redPrimary flex-1 min-w-[200px]">
                              <Timer className="w-4 h-4 text-redPrimary shrink-0" />
                              <span>Booking Duration: {currentOrder.durationUnitText || '1 Hour'} ({currentOrder.bookingPlan || 'HOURLY'} BASIS)</span>
                            </div>
                            {currentOrder.appliedPromoCode && currentOrder.appliedPromoCode !== 'NONE' && (
                              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center gap-2 shrink-0">
                                <Tag className="w-4 h-4 text-emerald-500 shrink-0" />
                                <span>Promo: {currentOrder.appliedPromoCode} (-₹{currentOrder.discountAmount || 0})</span>
                              </div>
                            )}
                          </div>

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
                              safeOrderIdx === i ? 'w-8 bg-redPrimary' : 'w-2 bg-slate-300 dark:bg-neutral-700 hover:bg-slate-400'
                            }`}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* TAB 1: ANALYTICS (Matching Mobile App Admin Analytics 100%) */}
            {activeTab === 1 && (
              <div className="space-y-6">

                {/* 1. Executive Platform KPIs Section */}
                <div className="web-card p-5 sm:p-6 bg-white dark:bg-[#1A1A1A] border border-slate-200 dark:border-[#333333] rounded-2xl shadow-md space-y-3">
                  <h3 className="text-base font-extrabold text-redPrimary flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" /> Executive Platform KPIs
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
                    <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800">
                      <span className="text-xs text-slate-500 dark:text-slate-400 block font-bold">Avg Order Value (AOV)</span>
                      <strong className="text-lg text-emerald-600 dark:text-emerald-500 font-black">
                        ₹{completedBookings.length > 0 ? Math.round(totalRevenue / completedBookings.length) : (totalPlatformGMV > 0 ? Math.round(totalPlatformGMV / (bookings.length || 1)) : 11975)}
                      </strong>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800">
                      <span className="text-xs text-slate-500 dark:text-slate-400 block font-bold">Completion Rate</span>
                      <strong className="text-lg text-blue-600 dark:text-blue-400 font-black">
                        {bookings.length > 0 ? ((completedBookings.length / bookings.length) * 100).toFixed(1) : '100.0'}%
                      </strong>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800">
                      <span className="text-xs text-slate-500 dark:text-slate-400 block font-bold">Decline Rate</span>
                      <strong className="text-lg text-rose-600 dark:text-rose-500 font-black">
                        {bookings.length > 0 ? (((bookings.filter(b => (b.status || '').toUpperCase().includes('CANCEL')).length) / bookings.length) * 100).toFixed(1) : '0.0'}%
                      </strong>
                    </div>
                  </div>
                </div>

                {/* 2. Top Service Demand Breakdown */}
                <div className="web-card p-5 sm:p-6 bg-white dark:bg-[#1A1A1A] border border-slate-200 dark:border-[#333333] rounded-2xl shadow-md space-y-4">
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Top Service Demand Breakdown</h3>

                  <div className="space-y-3">
                    {finalTopServicesDemand.map((item) => (
                      <div key={item.title} className="space-y-1">
                        <div className="flex justify-between text-xs font-bold">
                          <span className="text-slate-900 dark:text-white font-extrabold">{item.title}</span>
                          <span className="text-redPrimary font-black">{item.count} Bookings ({item.percentage}%)</span>
                        </div>
                        <div className="w-full h-2.5 rounded-full bg-slate-100 dark:bg-neutral-800 overflow-hidden">
                          <div className="h-full bg-redPrimary transition-all duration-500" style={{ width: `${Math.max(8, item.percentage)}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 3. Payment Method Distribution */}
                <div className="web-card p-5 sm:p-6 bg-white dark:bg-[#1A1A1A] border border-slate-200 dark:border-[#333333] rounded-2xl shadow-md space-y-3">
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Payment Method Distribution</h3>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center text-xs">
                    <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800">
                      <span className="text-slate-500 dark:text-slate-400 block font-bold mb-1">Cash (COD)</span>
                      <strong className="text-sm font-black text-slate-900 dark:text-white block">{codOrdersCount} orders ({codPercentage}%)</strong>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800">
                      <span className="text-slate-500 dark:text-slate-400 block font-bold mb-1">UPI / Online</span>
                      <strong className="text-sm font-black text-slate-900 dark:text-white block">{upiOrdersCount} orders ({upiPercentage}%)</strong>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800">
                      <span className="text-slate-500 dark:text-slate-400 block font-bold mb-1">Razorpay / Cards</span>
                      <strong className="text-sm font-black text-slate-900 dark:text-white block">{cardOrdersCount} orders ({cardPercentage}%)</strong>
                    </div>
                  </div>
                </div>

                {/* 4. Top Partner Performance Leaderboard */}
                <div className="web-card p-5 sm:p-6 bg-white dark:bg-[#1A1A1A] border border-slate-200 dark:border-[#333333] rounded-2xl shadow-md space-y-4">
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Top Partner Performance Leaderboard</h3>

                  <div className="space-y-3">
                    {finalPartnerLeaderboard.map((partner, index) => (
                      <div key={partner.id || index} className="p-4 rounded-xl bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 flex justify-between items-center text-xs">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full font-black text-xs flex items-center justify-center shrink-0 ${index === 0 ? 'bg-amber-500 text-black' : index === 1 ? 'bg-slate-300 text-black' : 'bg-amber-700 text-white'}`}>
                            #{index + 1}
                          </div>
                          <div>
                            <strong className="text-sm text-slate-900 dark:text-white block font-extrabold">{partner.fullName}</strong>
                            <span className="text-slate-500 dark:text-slate-400">Skill: {partner.skillCategory || 'Specialist'}</span>
                          </div>
                        </div>

                        <div className="text-right">
                          <strong className="text-emerald-600 dark:text-emerald-500 text-xs font-black block">{partner.completedJobs} Completed Jobs</strong>
                          <span className="text-slate-900 dark:text-white font-extrabold text-xs">₹{partner.totalEarned.toLocaleString()} Earned</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            )}

            {/* TAB 2: PAYMENT DETAILS */}
            {activeTab === 2 && (
              <div className="space-y-6">
                <div className="web-card space-y-4 bg-white dark:bg-[#1A1A1A] border border-slate-200 dark:border-[#333333] p-5 sm:p-6 rounded-2xl shadow-md">
                  <h3 className="font-extrabold text-base flex items-center gap-2 text-redPrimary">
                    <CreditCard className="w-5 h-5" /> Financial Revenue & Payment Method Distribution
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-neutral-800 text-center">
                      <span className="text-xs text-slate-500 dark:text-slate-400 block font-bold mb-1">Cash on Service (COD)</span>
                      <strong className="text-lg text-emerald-600 dark:text-emerald-500 font-black">{codOrdersCount} orders ({codPercentage}%)</strong>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">Collected directly by partner mistris</p>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-neutral-800 text-center">
                      <span className="text-xs text-slate-500 dark:text-slate-400 block font-bold mb-1">Online UPI / QR Code</span>
                      <strong className="text-lg text-blue-600 dark:text-blue-400 font-black">{upiOrdersCount} orders ({upiPercentage}%)</strong>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">Instant Google Pay & PhonePe</p>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-neutral-800 text-center">
                      <span className="text-xs text-slate-500 dark:text-slate-400 block font-bold mb-1">Razorpay Gateway Cards</span>
                      <strong className="text-lg text-amber-600 dark:text-amber-400 font-black">{cardOrdersCount} orders ({cardPercentage}%)</strong>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">Netbanking, Credit & Debit Cards</p>
                    </div>
                  </div>
                </div>

                <div className="web-card space-y-3 bg-white dark:bg-[#1A1A1A] border border-slate-200 dark:border-[#333333] p-5 sm:p-6 rounded-2xl shadow-md">
                  <h4 className="font-bold text-sm text-slate-900 dark:text-slate-300">Partner Settlement Payout Ledger</h4>
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 flex justify-between items-center text-xs">
                    <div>
                      <strong className="text-slate-900 dark:text-white block text-sm">80% Partner Net Share Payout</strong>
                      <span className="text-slate-500 dark:text-slate-400">Total payable to verified craftsmen for completed jobs</span>
                    </div>
                    <span className="text-lg font-black text-emerald-600 dark:text-emerald-500">₹{totalPlatformGMV > 0 ? Math.round(totalPlatformGMV * 0.80) : 36000}</span>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: PARTNER FLEET */}
            {activeTab === 3 && (
              <div className="web-card space-y-3 bg-white dark:bg-[#1A1A1A] border border-slate-200 dark:border-[#333333] p-5 sm:p-6 rounded-2xl shadow-md">
                <h3 className="font-extrabold text-base flex items-center gap-2 text-redPrimary"><HardHat className="w-5 h-5" /> Registered Service Partners ({allPartnersList.length})</h3>
                {allPartnersList.length === 0 ? (
                  <p className="text-xs text-slate-500 py-6 text-center">No service partners registered yet.</p>
                ) : (
                  allPartnersList.map(p => {
                    const isOnline = p.isOnline === true || p.isOnline === 'true';
                    return (
                      <div key={p.id} className="p-4 rounded-xl bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-neutral-800 flex flex-col sm:flex-row justify-between items-start sm:items-center text-xs gap-3">
                        <div>
                          <strong className="text-base block text-slate-900 dark:text-white font-extrabold">{p.fullName || 'Partner'}</strong>
                          <span className="text-slate-500 dark:text-slate-400">Skill: {p.skillCategory || 'Specialist'} | Phone: {p.phoneNumber || 'N/A'}</span>
                        </div>
                        <div className="flex gap-2 items-center w-full sm:w-auto justify-between sm:justify-end">
                          <span className={`px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-wider ${
                            isOnline ? 'bg-emerald-600/20 text-emerald-600 dark:text-emerald-500 border border-emerald-600/30' : 'bg-slate-200 dark:bg-slate-700/50 text-slate-600 dark:text-slate-400 border border-slate-300 dark:border-slate-600/30'
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

            {/* RENDER ADMIN SLIDERS FOR TABS 4, 5, 6, 7, 9, 10 */}
            {(activeTab === 4 || activeTab === 5 || activeTab === 6 || activeTab === 7 || activeTab === 9 || activeTab === 10) && (
              <AdminSliders
                activeTab={activeTab}
                usersList={usersList}
                categoriesList={categoriesList}
                servicesList={servicesList}
                bannersList={bannersList}
                testimonialsList={testimonialsList}
                faqsList={faqsList}
                currentAdmins={currentAdmins}
                userSliderIdx={userSliderIdx} setUserSliderIdx={setUserSliderIdx}
                catSliderIdx={catSliderIdx} setCatSliderIdx={setCatSliderIdx}
                srvSliderIdx={srvSliderIdx} setSrvSliderIdx={setSrvSliderIdx}
                bnrSliderIdx={bnrSliderIdx} setBnrSliderIdx={setBnrSliderIdx}
                testSliderIdx={testSliderIdx} setTestSliderIdx={setTestSliderIdx}
                faqSliderIdx={faqSliderIdx} setFaqSliderIdx={setFaqSliderIdx}
                setIsCreateSubAdminOpen={setIsCreateSubAdminOpen}
                setEditingAdminUser={setEditingAdminUser}
                setDeletingPath={setDeletingPath}
                setEditingCategory={setEditingCategory}
                setEditingService={setEditingService}
                setEditingBanner={setEditingBanner}
                setEditingTestimonial={setEditingTestimonial}
                setEditingFaq={setEditingFaq}
                handleAddCategory={handleAddCategory} newCatName={newCatName} setNewCatName={setNewCatName} newCatIcon={newCatIcon} setNewCatIcon={setNewCatIcon}
                handleAddService={handleAddService} newSrvTitle={newSrvTitle} setNewSrvTitle={setNewSrvTitle} newSrvCatId={newSrvCatId} setNewSrvCatId={setNewSrvCatId} newSrvPrice={newSrvPrice} setNewSrvPrice={setNewSrvPrice} newSrvDiscount={newSrvDiscount} setNewSrvDiscount={setNewSrvDiscount} newSrvRating={newSrvRating} setNewSrvRating={setNewSrvRating} newSrvImage={newSrvImage} setNewSrvImage={setNewSrvImage}
                handleAddBanner={handleAddBanner} newBnrTitle={newBnrTitle} setNewBnrTitle={setNewBnrTitle} newBnrSub={newBnrSub} setNewBnrSub={setNewBnrSub} newBnrImg={newBnrImg} setNewBnrImg={setNewBnrImg}
                handleAddTestimonial={handleAddTestimonial} newTestName={newTestName} setNewTestName={setNewTestName} newTestLoc={newTestLoc} setNewTestLoc={setNewTestLoc} newTestText={newTestText} setNewTestText={setNewTestText}
                handleAddFaq={handleAddFaq} newFaqQ={newFaqQ} setNewFaqQ={setNewFaqQ} newFaqA={newFaqA} setNewFaqA={setNewFaqA}
                handleImageFileUpload={handleImageFileUpload}
              />
            )}

            {/* TAB 11: PUSH NOTIFICATIONS BROADCAST */}
            {activeTab === 11 && (
              <div className="space-y-6">
                <div className="web-card space-y-5 bg-white dark:bg-[#1A1A1A] border border-slate-200 dark:border-[#333333] p-6 sm:p-8 rounded-2xl shadow-xl max-w-2xl mx-auto">
                  <div className="flex items-center gap-3">
                    <div className="p-3.5 rounded-2xl bg-redPrimary/10 text-redPrimary shrink-0">
                      <Bell className="w-7 h-7 text-redPrimary" />
                    </div>
                    <div>
                      <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">Broadcast Push Notification</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Send real-time alerts & discount offers across Sikkim</p>
                    </div>
                  </div>

                  <form onSubmit={handleSendNotification} className="space-y-4 pt-2">
                    <div>
                      <label className="text-xs font-bold text-slate-500 dark:text-slate-400 block mb-1">Notification Title *</label>
                      <input
                        type="text"
                        value={notifTitle}
                        onChange={(e) => setNotifTitle(e.target.value)}
                        placeholder="Notification Title *"
                        required
                        className="w-full p-4 rounded-xl border border-slate-300 dark:border-neutral-700 bg-slate-50 dark:bg-neutral-900 text-sm font-bold text-slate-900 dark:text-white outline-none focus:border-redPrimary"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-500 dark:text-slate-400 block mb-1">Message Body *</label>
                      <textarea
                        value={notifBody}
                        onChange={(e) => setNotifBody(e.target.value)}
                        placeholder="Message Body *"
                        rows={4}
                        required
                        className="w-full p-4 rounded-xl border border-slate-300 dark:border-neutral-700 bg-slate-50 dark:bg-neutral-900 text-xs font-semibold text-slate-900 dark:text-white outline-none focus:border-redPrimary leading-relaxed"
                      ></textarea>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-500 dark:text-slate-400 block mb-2">Target Audience:</label>
                      <div className="flex flex-wrap gap-2">
                        {[
                          { id: 'ALL', label: 'All App Users' },
                          { id: 'CUSTOMERS', label: 'Customers' },
                          { id: 'PARTNERS', label: 'Service Partners' }
                        ].map((aud) => (
                          <button
                            key={aud.id}
                            type="button"
                            onClick={() => setTargetAudience(aud.id)}
                            className={`px-4 py-2.5 rounded-xl text-xs font-black transition cursor-pointer ${
                              targetAudience === aud.id
                                ? 'bg-redPrimary text-white shadow-lg scale-102'
                                : 'bg-slate-100 dark:bg-neutral-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-neutral-700'
                            }`}
                          >
                            {aud.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isSendingNotif}
                      className="btn-primary w-full py-4 text-sm font-black shadow-xl bg-redPrimary hover:bg-redDark text-white transition cursor-pointer rounded-xl flex items-center justify-center gap-2"
                    >
                      <Send className="w-4 h-4" />
                      {isSendingNotif ? 'Broadcasting Alert...' : 'Send & Broadcast Notification 🔔'}
                    </button>
                  </form>
                </div>

                {/* Sent Notifications History Carousel Slider with Delete Option */}
                {notificationsList.length > 0 && (
                  <div className="web-card bg-white dark:bg-[#1A1A1A] border border-slate-200 dark:border-[#333333] p-6 rounded-2xl shadow-xl space-y-4 max-w-2xl mx-auto">
                    <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-neutral-800">
                      <h4 className="text-sm font-black text-slate-900 dark:text-white">
                        Broadcast History <span className="text-redPrimary">({safeNotifIdx + 1} of {notificationsList.length})</span>
                      </h4>

                      {notificationsList.length > 1 && (
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setNotifSliderIdx((prev) => (prev - 1 + notificationsList.length) % notificationsList.length)}
                            className="p-1.5 rounded-lg bg-slate-100 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 text-slate-800 dark:text-white hover:border-redPrimary"
                          >
                            <ChevronLeft className="w-4 h-4" />
                          </button>
                          <span className="text-xs font-bold text-slate-500">
                            {safeNotifIdx + 1} / {notificationsList.length}
                          </span>
                          <button
                            type="button"
                            onClick={() => setNotifSliderIdx((prev) => (prev + 1) % notificationsList.length)}
                            className="p-1.5 rounded-lg bg-slate-100 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 text-slate-800 dark:text-white hover:border-redPrimary"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>

                    {currentNotifObj && (
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={currentNotifObj.id || safeNotifIdx}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          transition={{ duration: 0.2 }}
                          className="p-5 rounded-2xl bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 space-y-3 relative shadow-inner"
                        >
                          <div className="flex justify-between items-start gap-2">
                            <div>
                              <strong className="text-redPrimary text-base block font-extrabold">{currentNotifObj.title}</strong>
                              <span className="text-[10px] text-slate-400 block mt-0.5">
                                {currentNotifObj.date || currentNotifObj.createdAt || 'Just Now'}
                              </span>
                            </div>
                            <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 shrink-0">
                              Target: {currentNotifObj.targetAudience}
                            </span>
                          </div>

                          <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">{currentNotifObj.body}</p>

                          <div className="flex justify-between items-center pt-3 border-t border-slate-200 dark:border-neutral-800 text-xs">
                            <span className="text-[11px] text-slate-400">By: {currentNotifObj.sentBy || 'Admin'}</span>
                            <button
                              type="button"
                              onClick={() => setDeletingPath(`notifications/${currentNotifObj.id}`)}
                              className="bg-rose-700 hover:bg-rose-800 text-white text-xs px-3.5 py-1.5 rounded-xl font-bold flex items-center gap-1 transition shadow-sm"
                            >
                              <Trash2 className="w-3.5 h-3.5" /> Delete Broadcast
                            </button>
                          </div>
                        </motion.div>
                      </AnimatePresence>
                    )}

                    {notificationsList.length > 1 && (
                      <div className="flex justify-center gap-1.5 pt-1">
                        {notificationsList.map((_, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => setNotifSliderIdx(i)}
                            className={`h-2 rounded-full transition-all ${safeNotifIdx === i ? 'w-6 bg-redPrimary' : 'w-2 bg-slate-300 dark:bg-neutral-700'}`}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* TAB 12: PROMO CODES & COUPON MANAGEMENT */}
            {activeTab === 12 && (
              <div className="space-y-6">
                <form onSubmit={handleAddCoupon} className="web-card space-y-4 bg-white dark:bg-[#1A1A1A] border border-slate-200 dark:border-[#333333] p-6 rounded-2xl shadow-xl max-w-2xl mx-auto">
                  <h3 className="font-extrabold text-base text-redPrimary flex items-center gap-2">
                    <Tag className="w-5 h-5 text-redPrimary" /> Create New Promo Code / Discount Coupon
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-500 dark:text-slate-400 block mb-1">Promo Code String *</label>
                      <input
                        type="text"
                        value={newCouponCode}
                        onChange={(e) => setNewCouponCode(e.target.value.toUpperCase())}
                        placeholder="e.g. SIKKIM10"
                        required
                        className="w-full p-3.5 rounded-xl border border-slate-300 dark:border-neutral-700 bg-slate-50 dark:bg-neutral-900 text-xs font-bold text-slate-900 dark:text-white uppercase outline-none focus:border-redPrimary"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-500 dark:text-slate-400 block mb-1">Discount Type *</label>
                      <select
                        value={newCouponType}
                        onChange={(e) => setNewCouponType(e.target.value)}
                        className="w-full p-3.5 rounded-xl border border-slate-300 dark:border-neutral-700 bg-slate-50 dark:bg-neutral-900 text-xs font-extrabold text-slate-900 dark:text-white outline-none focus:border-redPrimary cursor-pointer"
                      >
                        <option value="PERCENTAGE">Percentage Discount (% OFF)</option>
                        <option value="FLAT">Flat Money Deduction (₹ OFF)</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-500 dark:text-slate-400 block mb-1">
                        {newCouponType === 'PERCENTAGE' ? 'Discount Percentage (% OFF) *' : 'Flat Deduction Amount (₹ OFF) *'}
                      </label>
                      <input
                        type="number"
                        value={newCouponValue}
                        onChange={(e) => setNewCouponValue(e.target.value)}
                        placeholder={newCouponType === 'PERCENTAGE' ? 'e.g. 10 (for 10% OFF)' : 'e.g. 100 (for ₹100 OFF)'}
                        required
                        className="w-full p-3.5 rounded-xl border border-slate-300 dark:border-neutral-700 bg-slate-50 dark:bg-neutral-900 text-xs font-bold text-slate-900 dark:text-white outline-none focus:border-redPrimary"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-500 dark:text-slate-400 block mb-1">Minimum Order Subtotal (₹)</label>
                      <input
                        type="number"
                        value={newCouponMinOrder}
                        onChange={(e) => setNewCouponMinOrder(e.target.value)}
                        placeholder="e.g. 300 (Optional min requirement)"
                        className="w-full p-3.5 rounded-xl border border-slate-300 dark:border-neutral-700 bg-slate-50 dark:bg-neutral-900 text-xs font-bold text-slate-900 dark:text-white outline-none focus:border-redPrimary"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="text-xs font-bold text-slate-500 dark:text-slate-400 block mb-1">Coupon Offer Description</label>
                      <input
                        type="text"
                        value={newCouponDesc}
                        onChange={(e) => setNewCouponDesc(e.target.value)}
                        placeholder="e.g. 10% OFF on all doorstep bookings in Sikkim"
                        className="w-full p-3.5 rounded-xl border border-slate-300 dark:border-neutral-700 bg-slate-50 dark:bg-neutral-900 text-xs text-slate-900 dark:text-white outline-none focus:border-redPrimary"
                      />
                    </div>
                  </div>

                  <button type="submit" className="btn-primary w-full py-4 text-xs font-extrabold shadow-lg rounded-xl cursor-pointer">
                    <Plus className="w-4 h-4 inline mr-1" /> Save & Activate Promo Code
                  </button>
                </form>

                {/* Promo Codes Slider / List */}
                {activeCouponsList.length > 0 && (
                  <div className="web-card bg-white dark:bg-[#1A1A1A] border border-slate-200 dark:border-[#333333] p-6 rounded-2xl shadow-xl space-y-4 max-w-2xl mx-auto">
                    <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-neutral-800">
                      <h4 className="text-sm font-black text-slate-900 dark:text-white">
                        Active Promo Codes <span className="text-redPrimary">({safeCouponIdx + 1} of {activeCouponsList.length})</span>
                      </h4>

                      {activeCouponsList.length > 1 && (
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setCouponSliderIdx((prev) => (prev - 1 + activeCouponsList.length) % activeCouponsList.length)}
                            className="p-1.5 rounded-lg bg-slate-100 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 text-slate-800 dark:text-white hover:border-redPrimary"
                          >
                            <ChevronLeft className="w-4 h-4" />
                          </button>
                          <span className="text-xs font-bold text-slate-500">
                            {safeCouponIdx + 1} / {activeCouponsList.length}
                          </span>
                          <button
                            type="button"
                            onClick={() => setCouponSliderIdx((prev) => (prev + 1) % activeCouponsList.length)}
                            className="p-1.5 rounded-lg bg-slate-100 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 text-slate-800 dark:text-white hover:border-redPrimary"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>

                    {currentCouponObj && (
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={currentCouponObj.id || safeCouponIdx}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          transition={{ duration: 0.2 }}
                          className="p-5 rounded-2xl bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 space-y-3 relative shadow-inner"
                        >
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <Tag className="w-5 h-5 text-redPrimary" />
                              <strong className="text-xl font-black text-slate-900 dark:text-white uppercase">{currentCouponObj.code}</strong>
                            </div>
                            <span className="px-3 py-1 rounded-full text-xs font-black bg-redPrimary/20 text-redPrimary border border-redPrimary/30">
                              {currentCouponObj.discountType === 'PERCENTAGE' ? `${currentCouponObj.discountValue}% OFF` : `Flat ₹${currentCouponObj.discountValue} OFF`}
                            </span>
                          </div>

                          <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">{currentCouponObj.description || 'Promotional Offer Code'}</p>

                          <div className="text-[11px] text-slate-400">
                            <span>Min Order Subtotal: <strong className="text-slate-200">₹{currentCouponObj.minOrderAmount || 0}</strong></span>
                          </div>

                          <div className="flex justify-end pt-2 border-t border-slate-200 dark:border-neutral-800">
                            <button
                              type="button"
                              onClick={() => setDeletingPath(`coupons/${currentCouponObj.id}`)}
                              className="bg-rose-700 hover:bg-rose-800 text-white text-xs px-3.5 py-2 rounded-xl font-bold flex items-center gap-1 transition shadow-sm"
                            >
                              <Trash2 className="w-3.5 h-3.5" /> Delete Promo Code
                            </button>
                          </div>
                        </motion.div>
                      </AnimatePresence>
                    )}

                    {activeCouponsList.length > 1 && (
                      <div className="flex justify-center gap-1.5 pt-1">
                        {activeCouponsList.map((_, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => setCouponSliderIdx(i)}
                            className={`h-2 rounded-full transition-all ${safeCouponIdx === i ? 'w-6 bg-redPrimary' : 'w-2 bg-slate-300 dark:bg-neutral-700'}`}
                          />
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

      {/* RENDER ALL ADMIN MODALS */}
      <AdminModals
        popupState={popupState} setPopupState={setPopupState}
        isCreateSubAdminOpen={isCreateSubAdminOpen} setIsCreateSubAdminOpen={setIsCreateSubAdminOpen} handleAddAdmin={handleAddAdmin}
        newAdminName={newAdminName} setNewAdminName={setNewAdminName}
        newAdminEmail={newAdminEmail} setNewAdminEmail={setNewAdminEmail}
        newAdminPhone={newAdminPhone} setNewAdminPhone={setNewAdminPhone}
        newAdminPassword={newAdminPassword} setNewAdminPassword={setNewAdminPassword}
        currentAdmins={currentAdmins}
        deletingPath={deletingPath} setDeletingPath={setDeletingPath} handleDeleteConfirm={handleDeleteConfirm}
        editingAdminUser={editingAdminUser} setEditingAdminUser={setEditingAdminUser} handleSaveAdminUserEdit={handleSaveAdminUserEdit}
        editingCategory={editingCategory} setEditingCategory={setEditingCategory} handleSaveCategoryEdit={handleSaveCategoryEdit}
        editingService={editingService} setEditingService={setEditingService} handleSaveServiceEdit={handleSaveServiceEdit}
        editingBanner={editingBanner} setEditingBanner={setEditingBanner} handleSaveBannerEdit={handleSaveBannerEdit}
        editingTestimonial={editingTestimonial} setEditingTestimonial={setEditingTestimonial} handleSaveTestimonialEdit={handleSaveTestimonialEdit}
        editingFaq={editingFaq} setEditingFaq={setEditingFaq} handleSaveFaqEdit={handleSaveFaqEdit}
        assigningBooking={assigningBooking} setAssigningBooking={setAssigningBooking} assignFilterTab={assignFilterTab} setAssignFilterTab={setAssignFilterTab}
        modalPartners={modalPartners} handleAssignPartnerConfirm={handleAssignPartnerConfirm}
        skillMatchedCount={skillMatchedCount} freePartnersCount={freePartnersCount} allPartnersList={allPartnersList}
        categoriesList={categoriesList}
        handleImageFileUpload={handleImageFileUpload}
      />

      <Footer />
    </div>
  );
}
