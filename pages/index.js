import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import AuthModal from '../components/AuthModal';
import CheckoutModal from '../components/CheckoutModal';
import { DEFAULT_CATEGORIES, DEFAULT_SERVICES } from '../lib/defaultData';
import { ref, onValue, update, remove, set } from 'firebase/database';
import { rtdb } from '../lib/firebase';
import { Search, Home, HardHat, ShieldCheck, CheckCircle2, Star, Trash2 } from 'lucide-react';

export default function HomePage() {
  const [isDark, setIsDark] = useState(true);
  const [activePortal, setActivePortal] = useState('customer'); // customer | partner | admin
  const [adminTab, setAdminTab] = useState('orders'); // orders | categories | services | profile

  const [locationText, setLocationText] = useState('Gangtok, Sikkim (Upper Syari, Deorali & Surrounding)');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeChip, setActiveChip] = useState('ALL');

  // Firebase Realtime State
  const [liveBookings, setLiveBookings] = useState([]);
  const [currentUser, setCurrentUser] = useState({
    id: 'sqjxAnHZgkQhYxrXXmLXFSUiH5r1',
    fullName: 'Nisha Kumari',
    phoneNumber: '+916296351107',
    role: 'CUSTOMER'
  });

  // Modal States
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [selectedService, setSelectedService] = useState(null);

  // Admin New Category/Service Form States
  const [newCatName, setNewCatName] = useState('');
  const [newCatIcon, setNewCatIcon] = useState('');
  const [newSrvTitle, setNewSrvTitle] = useState('');
  const [newSrvCatId, setNewSrvCatId] = useState('cat_plumber');
  const [newSrvPrice, setNewSrvPrice] = useState('');
  const [newSrvDiscountPrice, setNewSrvDiscountPrice] = useState('');
  const [newSrvImage, setNewSrvImage] = useState('');

  // Admin / Partner Profile Edit States
  const [editAdminName, setEditAdminName] = useState('Rahul Shah');
  const [editAdminPhone, setEditAdminPhone] = useState('+919563213089');
  const [editAdminEmail, setEditAdminEmail] = useState('sahrahul77@gmail.com');

  const [editPartnerName, setEditPartnerName] = useState('Piku');
  const [editPartnerPhone, setEditPartnerPhone] = useState('+919564111224');
  const [editPartnerSkill, setEditPartnerSkill] = useState('Home Tutor');

  // Toggle Dark/Light Theme
  const toggleTheme = () => {
    setIsDark(!isDark);
    if (!isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  // Listen Live to Firebase Database /bookings
  useEffect(() => {
    const bookingsRef = ref(rtdb, 'bookings');
    const unsubscribe = onValue(bookingsRef, (snapshot) => {
      const list = [];
      if (snapshot.exists()) {
        snapshot.forEach((child) => {
          list.push({ id: child.key, ...child.val() });
        });
      }
      setLiveBookings(list);
    });

    return () => unsubscribe();
  }, []);

  // Filter Services
  const filteredServices = DEFAULT_SERVICES.filter((s) => {
    const matchesSearch =
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.categoryName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesChip = activeChip === 'ALL' || s.categoryName.toLowerCase().includes(activeChip.toLowerCase());
    return matchesSearch && matchesChip;
  });

  // Admin & Partner Actions
  const handleUpdateStatus = (id, newStatus, trackingText) => {
    update(ref(rtdb, `bookings/${id}`), {
      status: newStatus,
      trackingStatus: trackingText
    });
  };

  const handleAssignPartner = (id, partnerName, partnerPhone, partnerSkill) => {
    update(ref(rtdb, `bookings/${id}`), {
      status: 'ASSIGNED',
      assignedPartnerName: partnerName,
      assignedPartnerPhone: partnerPhone,
      assignedPartnerSkill: partnerSkill,
      trackingStatus: `Mistri ${partnerName} assigned to order`
    });
  };

  const handleDeleteOrder = (id) => {
    if (confirm('Delete this order permanently from Firebase Database?')) {
      remove(ref(rtdb, `bookings/${id}`));
    }
  };

  const handleAddCategory = (e) => {
    e.preventDefault();
    if (!newCatName) return alert('Category Name is required.');
    const catId = 'cat_' + Math.random().toString(36).substring(2, 8);
    const icon = newCatIcon || 'https://himistri.techcoders.in/wp-content/uploads/2022/10/PLUMBER.png';

    set(ref(rtdb, `categories/${catId}`), { id: catId, name: newCatName, iconUrl: icon })
      .then(() => {
        alert(`New Category '${newCatName}' created!`);
        setNewCatName('');
        setNewCatIcon('');
      });
  };

  const handleAddService = (e) => {
    e.preventDefault();
    if (!newSrvTitle) return alert('Service Title is required.');
    const srvId = 'srv_' + Math.random().toString(36).substring(2, 8);
    const catObj = DEFAULT_CATEGORIES.find(c => c.id === newSrvCatId) || DEFAULT_CATEGORIES[0];
    const price = parseFloat(newSrvPrice) || 1000;
    const discount = parseFloat(newSrvDiscountPrice) || price;
    const img = newSrvImage || 'https://himistri.techcoders.in/wp-content/uploads/2022/10/PLUMBER.png';

    const srvData = {
      id: srvId,
      categoryId: catObj.id,
      categoryName: catObj.name,
      title: newSrvTitle,
      originalPrice: price,
      discountedPrice: discount,
      imageUrl: img
    };

    set(ref(rtdb, `services/${srvId}`), srvData)
      .then(() => {
        alert(`New Service '${newSrvTitle}' connected to Category '${catObj.name}' and saved!`);
        setNewSrvTitle('');
        setNewSrvPrice('');
        setNewSrvDiscountPrice('');
        setNewSrvImage('');
      });
  };

  const handleSaveAdminProfile = (e) => {
    e.preventDefault();
    update(ref(rtdb, 'users/bLfKYzhws9d7zozkzwyemQPI8bG3'), {
      fullName: editAdminName,
      phoneNumber: editAdminPhone,
      email: editAdminEmail
    }).then(() => {
      alert('Admin Profile updated in Firebase!');
    });
  };

  return (
    <div className={isDark ? 'dark' : ''}>
      <Navbar
        isDark={isDark}
        onToggleTheme={toggleTheme}
        onOpenAuth={() => setIsAuthOpen(true)}
        locationText={locationText}
        onRefreshGps={() => setLocationText('Gangtok, Sikkim (GPS Updated Live)')}
      />

      <main className="max-w-6xl mx-auto p-6">
        {/* Navigation Portal Tabs */}
        <div className="flex bg-white dark:bg-darkSurface border border-slate-200 dark:border-neutral-800 rounded-xl p-1.5 mb-6 shadow-sm">
          <button
            onClick={() => setActivePortal('customer')}
            className={`flex-1 py-3 text-center text-sm font-bold rounded-lg flex items-center justify-center gap-2 transition ${
              activePortal === 'customer' ? 'bg-redPrimary text-white' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Home className="w-4 h-4" /> Customer Portal
          </button>

          <button
            onClick={() => setActivePortal('partner')}
            className={`flex-1 py-3 text-center text-sm font-bold rounded-lg flex items-center justify-center gap-2 transition ${
              activePortal === 'partner' ? 'bg-redPrimary text-white' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <HardHat className="w-4 h-4" /> Partner Dashboard
          </button>

          <button
            onClick={() => setActivePortal('admin')}
            className={`flex-1 py-3 text-center text-sm font-bold rounded-lg flex items-center justify-center gap-2 transition ${
              activePortal === 'admin' ? 'bg-redPrimary text-white' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-4 h-4" /> Lead Admin Control Panel
          </button>
        </div>

        {/* CUSTOMER PORTAL VIEW */}
        {activePortal === 'customer' && (
          <section className="space-y-6">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-5 h-5 absolute left-4 top-3.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search services (e.g. Plumber, Electrician, Barber, Tutor)..."
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 dark:border-neutral-800 bg-white dark:bg-darkSurface text-sm focus:outline-none focus:border-redPrimary"
              />
            </div>

            {/* Quick Filter Chips */}
            <div className="flex gap-2 overflow-x-auto pb-2">
              {['ALL', 'Plumber', 'Electrician', 'Barber', 'Cleaner', 'Carpenter', 'Tutor'].map((chip) => (
                <button
                  key={chip}
                  onClick={() => setActiveChip(chip)}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap border transition ${
                    activeChip === chip
                      ? 'bg-redPrimary text-white border-redPrimary'
                      : 'bg-white dark:bg-darkSurface border-slate-200 dark:border-neutral-800 hover:border-redPrimary'
                  }`}
                >
                  ⚡ {chip === 'ALL' ? 'All Services' : chip}
                </button>
              ))}
            </div>

            {/* Categories Section */}
            <div>
              <h2 className="text-lg font-extrabold mb-1">Explore Categories (10)</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Trained technical manpower categories registered in Gangtok</p>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3.5">
                {DEFAULT_CATEGORIES.map((c) => (
                  <div key={c.id} className="bg-white dark:bg-darkSurface border border-slate-200 dark:border-neutral-800 rounded-xl p-4 text-center cursor-pointer hover:border-redPrimary transition shadow-sm">
                    <div className="w-12 h-12 rounded-full bg-redPrimary/10 flex items-center justify-center mx-auto mb-2">
                      <img src={c.iconUrl} alt={c.name} className="w-7 h-7 object-contain" />
                    </div>
                    <span className="text-xs font-bold block">{c.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Services Catalog */}
            <div>
              <h2 className="text-lg font-extrabold mb-1">Popular Services in Gangtok</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Top rated doorstep solutions requested by Sikkim residents</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {filteredServices.map((s) => (
                  <div key={s.id} className="bg-white dark:bg-darkSurface border border-slate-200 dark:border-neutral-800 rounded-xl p-4 shadow-sm hover:border-redPrimary transition">
                    <img src={s.imageUrl} alt={s.title} className="w-full h-36 object-cover rounded-lg mb-3" />
                    <span className="text-xs font-bold text-redPrimary uppercase tracking-wider">{s.categoryName}</span>
                    <h3 className="font-bold text-base mt-0.5">{s.title}</h3>
                    <div className="mt-2 flex items-baseline gap-2">
                      <span className="text-lg font-extrabold text-redPrimary">₹{s.discountedPrice}</span>
                      <span className="text-xs text-slate-400 line-through">₹{s.originalPrice}</span>
                    </div>
                    <button
                      onClick={() => setSelectedService(s)}
                      className="w-full mt-3 bg-redPrimary hover:bg-redDark text-white py-2 rounded-lg font-bold text-xs transition"
                    >
                      Hire Now
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Customer Bookings History */}
            <div>
              <h2 className="text-lg font-extrabold mb-1">My Bookings History</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Active order tracking and completed job history</p>

              {liveBookings.length === 0 ? (
                <p className="text-xs text-slate-500">No active bookings found.</p>
              ) : (
                <div className="space-y-3">
                  {liveBookings.map((b) => (
                    <div key={b.id} className="bg-white dark:bg-darkSurface border border-slate-200 dark:border-neutral-800 rounded-xl p-4 shadow-sm">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-bold text-sm">Ref: {b.bookingRef || b.id}</span>
                        <span className="text-xs font-extrabold px-2.5 py-1 rounded-full bg-orangeSecondary/10 text-orangeSecondary">{b.status || 'PENDING'}</span>
                      </div>
                      <h4 className="font-bold text-sm">{b.serviceTitle} • ₹{b.totalAmount}</h4>
                      <p className="text-xs text-slate-500 mt-1">Address: {b.address}</p>
                      <p className="text-xs font-bold text-orangeSecondary mt-1">Live Status: {b.trackingStatus || 'Order Placed'}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        )}

        {/* PARTNER PORTAL VIEW */}
        {activePortal === 'partner' && (
          <section className="space-y-6">
            <div className="bg-white dark:bg-darkSurface border border-slate-200 dark:border-neutral-800 rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-bold">Partner Panel: Piku</h3>
              <p className="text-xs text-slate-500">Skill Category: Home Tutor | Verified Partner</p>

              <div className="mt-4 flex gap-6 text-sm">
                <div>Net Earnings (80%): <strong className="text-emerald-600 font-extrabold">₹0</strong></div>
                <div>Completed Jobs: <strong className="font-extrabold">0</strong></div>
                <div>Rating: <strong className="text-amber-500 font-extrabold">4.9 ★</strong></div>
              </div>
            </div>

            <div>
              <h2 className="text-lg font-extrabold mb-1">Active Dispatched Job Requests</h2>
              <div className="space-y-3 mt-3">
                {liveBookings.filter(b => b.assignedPartnerName === 'Piku' || b.status === 'ASSIGNED').length === 0 ? (
                  <p className="text-xs text-slate-500">No active job requests right now.</p>
                ) : (
                  liveBookings.filter(b => b.assignedPartnerName === 'Piku' || b.status === 'ASSIGNED').map((b) => (
                    <div key={b.id} className="bg-white dark:bg-darkSurface border border-slate-200 dark:border-neutral-800 rounded-xl p-4 shadow-sm">
                      <div className="flex justify-between mb-2">
                        <span className="font-bold text-sm">{b.bookingRef || b.id}</span>
                        <span className="text-xs font-bold text-blue-500">{b.status}</span>
                      </div>
                      <h4 className="font-bold">{b.serviceTitle} (Collect ₹{b.totalAmount})</h4>
                      <p className="text-xs text-slate-500 mt-1">Customer Address: {b.address}</p>
                      <div className="flex gap-2 mt-3">
                        <button onClick={() => handleUpdateStatus(b.id, 'ON_THE_WAY', 'Mistri Piku en route')} className="bg-redPrimary text-white text-xs px-3 py-2 rounded-lg font-bold">Accept & On The Way</button>
                        <button onClick={() => handleUpdateStatus(b.id, 'COMPLETED', 'Service work finished')} className="bg-emerald-600 text-white text-xs px-3 py-2 rounded-lg font-bold">Mark Finished</button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </section>
        )}

        {/* ADMIN PORTAL VIEW */}
        {activePortal === 'admin' && (
          <section className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white dark:bg-darkSurface border border-slate-200 dark:border-neutral-800 p-4 rounded-xl">
                <span className="text-xs text-slate-500">Total Revenue</span>
                <p className="text-2xl font-extrabold text-emerald-600">₹0</p>
              </div>
              <div className="bg-white dark:bg-darkSurface border border-slate-200 dark:border-neutral-800 p-4 rounded-xl">
                <span className="text-xs text-slate-500">Active Orders</span>
                <p className="text-2xl font-extrabold text-redPrimary">{liveBookings.filter(b => b.status !== 'COMPLETED').length}</p>
              </div>
              <div className="bg-white dark:bg-darkSurface border border-slate-200 dark:border-neutral-800 p-4 rounded-xl">
                <span className="text-xs text-slate-500">Fleet Users</span>
                <p className="text-2xl font-extrabold">6</p>
              </div>
            </div>

            {/* Admin Sub-Tabs */}
            <div className="flex gap-2 border-b border-neutral-800 pb-2">
              {['orders', 'categories', 'services', 'profile'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setAdminTab(tab)}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase transition ${
                    adminTab === tab ? 'bg-redPrimary text-white' : 'bg-white dark:bg-darkSurface text-slate-400'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {adminTab === 'orders' && (
              <div className="space-y-3">
                {liveBookings.map((b) => (
                  <div key={b.id} className="bg-white dark:bg-darkSurface border border-slate-200 dark:border-neutral-800 rounded-xl p-4 shadow-sm">
                    <div className="flex justify-between mb-2">
                      <span className="font-bold text-sm">Ref: {b.bookingRef || b.id}</span>
                      <span className="text-xs font-bold text-orangeSecondary">{b.status || 'PENDING'}</span>
                    </div>
                    <h4 className="font-bold text-sm">{b.serviceTitle} - ₹{b.totalAmount}</h4>
                    <p className="text-xs text-slate-500 mt-1">Customer: {b.userName || 'Nisha Kumari'} ({b.customerPhone})</p>
                    <div className="flex gap-2 mt-3">
                      <button onClick={() => handleUpdateStatus(b.id, 'CONFIRMED', 'Confirmed by Admin')} className="bg-redPrimary text-white text-xs px-3 py-1.5 rounded-lg font-bold">Confirm Order</button>
                      <button onClick={() => handleAssignPartner(b.id, 'Piku', '+919564111224', 'Home Tutor')} className="bg-orangeSecondary text-white text-xs px-3 py-1.5 rounded-lg font-bold">Assign Partner Piku</button>
                      <button onClick={() => handleDeleteOrder(b.id)} className="bg-rose-700 text-white text-xs px-3 py-1.5 rounded-lg font-bold"><Trash2 className="w-3.5 h-3.5 inline" /></button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {adminTab === 'categories' && (
              <div className="space-y-4">
                <form onSubmit={handleAddCategory} className="bg-white dark:bg-darkSurface border border-slate-200 dark:border-neutral-800 p-4 rounded-xl space-y-3">
                  <h4 className="font-bold text-sm">Add New Category</h4>
                  <input type="text" value={newCatName} onChange={(e) => setNewCatName(e.target.value)} placeholder="Category Name" className="w-full p-2.5 rounded-lg bg-slate-100 dark:bg-neutral-800 border text-xs" />
                  <input type="text" value={newCatIcon} onChange={(e) => setNewCatIcon(e.target.value)} placeholder="Icon Image URL" className="w-full p-2.5 rounded-lg bg-slate-100 dark:bg-neutral-800 border text-xs" />
                  <button type="submit" className="bg-redPrimary text-white text-xs px-4 py-2 rounded-lg font-bold">Add Category</button>
                </form>
              </div>
            )}

            {adminTab === 'services' && (
              <div className="space-y-4">
                <form onSubmit={handleAddService} className="bg-white dark:bg-darkSurface border border-slate-200 dark:border-neutral-800 p-4 rounded-xl space-y-3">
                  <h4 className="font-bold text-sm">Add New Service (Connected to Category)</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <input type="text" value={newSrvTitle} onChange={(e) => setNewSrvTitle(e.target.value)} placeholder="Service Title" className="p-2.5 rounded-lg bg-slate-100 dark:bg-neutral-800 border text-xs" />
                    <select value={newSrvCatId} onChange={(e) => setNewSrvCatId(e.target.value)} className="p-2.5 rounded-lg bg-slate-100 dark:bg-neutral-800 border text-xs">
                      {DEFAULT_CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                    <input type="number" value={newSrvPrice} onChange={(e) => setNewSrvPrice(e.target.value)} placeholder="Original Price (₹)" className="p-2.5 rounded-lg bg-slate-100 dark:bg-neutral-800 border text-xs" />
                    <input type="number" value={newSrvDiscountPrice} onChange={(e) => setNewSrvDiscountPrice(e.target.value)} placeholder="Discount Price (₹)" className="p-2.5 rounded-lg bg-slate-100 dark:bg-neutral-800 border text-xs" />
                  </div>
                  <button type="submit" className="bg-redPrimary text-white text-xs px-4 py-2 rounded-lg font-bold w-full">Create & Link Service</button>
                </form>
              </div>
            )}

            {adminTab === 'profile' && (
              <form onSubmit={handleSaveAdminProfile} className="bg-white dark:bg-darkSurface border border-slate-200 dark:border-neutral-800 p-6 rounded-xl space-y-4">
                <h4 className="font-bold text-base">Edit Admin Profile ID</h4>
                <div>
                  <label className="text-xs font-bold text-slate-500">Admin Name</label>
                  <input type="text" value={editAdminName} onChange={(e) => setEditAdminName(e.target.value)} className="w-full p-3 rounded-lg bg-slate-100 dark:bg-neutral-800 border text-sm mt-1" />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500">Phone</label>
                  <input type="text" value={editAdminPhone} onChange={(e) => setEditAdminPhone(e.target.value)} className="w-full p-3 rounded-lg bg-slate-100 dark:bg-neutral-800 border text-sm mt-1" />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500">Email</label>
                  <input type="text" value={editAdminEmail} onChange={(e) => setEditAdminEmail(e.target.value)} className="w-full p-3 rounded-lg bg-slate-100 dark:bg-neutral-800 border text-sm mt-1" />
                </div>
                <button type="submit" className="bg-redPrimary text-white text-xs px-4 py-3 rounded-lg font-bold w-full">Save Admin Profile to Firebase</button>
              </form>
            )}
          </section>
        )}
      </main>

      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} onAuthSuccess={(u) => setCurrentUser(u)} />
      <CheckoutModal isOpen={!!selectedService} onClose={() => setSelectedService(null)} service={selectedService} currentUser={currentUser} />
    </div>
  );
}
