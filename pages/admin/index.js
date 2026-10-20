import React, { useState, useEffect } from 'react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { DEFAULT_CATEGORIES, DEFAULT_SERVICES } from '../../lib/defaultData';
import { ref, onValue, update, remove, set } from 'firebase/database';
import { rtdb } from '../../lib/firebase';
import { ShieldCheck, Users, DollarSign, Package, Plus, Trash2, CheckCircle2, UserPlus, Edit } from 'lucide-react';

export default function AdminControlPanelPage() {
  const [isDark, setIsDark] = useState(true);
  const [activeTab, setActiveTab] = useState('orders'); // orders | categories | services | profile
  const [bookings, setBookings] = useState([]);

  // Forms
  const [newCatName, setNewCatName] = useState('');
  const [newCatIcon, setNewCatIcon] = useState('');

  const [newSrvTitle, setNewSrvTitle] = useState('');
  const [newSrvCatId, setNewSrvCatId] = useState('cat_plumber');
  const [newSrvPrice, setNewSrvPrice] = useState('');
  const [newSrvDiscount, setNewSrvDiscount] = useState('');
  const [newSrvImage, setNewSrvImage] = useState('');

  const [adminName, setAdminName] = useState('Rahul Shah');
  const [adminPhone, setAdminPhone] = useState('+919563213089');
  const [adminEmail, setAdminEmail] = useState('sahrahul77@gmail.com');

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.setAttribute('data-theme', !isDark ? 'dark' : 'light');
  };

  useEffect(() => {
    const bookingsRef = ref(rtdb, 'bookings');
    const unsubscribe = onValue(bookingsRef, (snapshot) => {
      const list = [];
      if (snapshot.exists()) {
        snapshot.forEach((child) => {
          list.push({ id: child.key, ...child.val() });
        });
      }
      setBookings(list);
    });

    return () => unsubscribe();
  }, []);

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
    }).then(() => alert(`Order assigned to ${partnerName}!`));
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
        alert(`New Category '${newCatName}' created in Firebase!`);
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
    const discount = parseFloat(newSrvDiscount) || price;
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
        setNewSrvDiscount('');
        setNewSrvImage('');
      });
  };

  const handleSaveAdminProfile = (e) => {
    e.preventDefault();
    update(ref(rtdb, 'users/bLfKYzhws9d7zozkzwyemQPI8bG3'), {
      fullName: adminName,
      phoneNumber: adminPhone,
      email: adminEmail
    }).then(() => {
      alert('Admin Profile ID credentials saved to Firebase!');
    });
  };

  const totalRevenue = bookings.filter(b => b.status === 'COMPLETED').reduce((sum, b) => sum + (b.totalAmount || 0), 0);
  const activeOrdersCount = bookings.filter(b => b.status !== 'COMPLETED').length;

  return (
    <div className="flex flex-col min-h-screen">
      <Header isDark={isDark} onToggleTheme={toggleTheme} />

      <main className="web-container py-10 flex-1 space-y-6">
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
              <span className="text-xs text-slate-500 font-bold">Total Fleet Users</span>
              <p className="text-2xl font-black">6</p>
            </div>
          </div>
        </div>

        {/* Sub-Navigation Tabs */}
        <div className="flex gap-2 border-b border-neutral-800 pb-3">
          {['orders', 'categories', 'services', 'profile'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold uppercase transition ${
                activeTab === tab ? 'bg-redPrimary text-white shadow-md' : 'bg-white dark:bg-darkSurface text-slate-400 hover:text-white'
              }`}
            >
              {tab === 'orders' ? 'Orders Management' : tab === 'categories' ? 'Categories Manager' : tab === 'services' ? 'Services Manager' : 'Admin Profile ID'}
            </button>
          ))}
        </div>

        {/* SUB-VIEW 1: ORDERS */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            <h2 className="text-lg font-extrabold">All Customer Orders ({bookings.length})</h2>

            {bookings.length === 0 ? (
              <p className="text-xs text-slate-500">No customer orders in database.</p>
            ) : (
              bookings.map((b) => (
                <div key={b.id} className="web-card space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="font-extrabold text-sm">Ref ID: {b.bookingRef || b.id}</span>
                    <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-orangeSecondary/15 text-orangeSecondary">{b.status || 'PENDING'}</span>
                  </div>
                  <h3 className="font-bold text-base">{b.serviceTitle} • ₹{b.totalAmount}</h3>
                  <p className="text-xs text-slate-500">Customer: {b.userName || 'Nisha Kumari'} ({b.customerPhone})</p>
                  <p className="text-xs text-slate-500">Address: {b.address}</p>

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
                    <button onClick={() => handleDeleteOrder(b.id)} className="bg-rose-700 text-white text-xs px-3.5 py-2 rounded-lg font-bold">
                      <Trash2 className="w-3.5 h-3.5 inline" /> Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* SUB-VIEW 2: CATEGORIES MANAGER */}
        {activeTab === 'categories' && (
          <div className="space-y-6">
            <form onSubmit={handleAddCategory} className="web-card space-y-4">
              <h3 className="font-extrabold text-base text-redPrimary">Add New Category</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input type="text" value={newCatName} onChange={(e) => setNewCatName(e.target.value)} placeholder="Category Name (e.g. Mason)" className="p-3 rounded-lg border border-slate-200 dark:border-neutral-700 bg-slate-100 dark:bg-neutral-800 text-sm" />
                <input type="text" value={newCatIcon} onChange={(e) => setNewCatIcon(e.target.value)} placeholder="Icon Image URL" className="p-3 rounded-lg border border-slate-200 dark:border-neutral-700 bg-slate-100 dark:bg-neutral-800 text-sm" />
              </div>
              <button type="submit" className="btn-primary py-3 px-6">
                <Plus className="w-4 h-4" /> Add Category to Firebase
              </button>
            </form>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {DEFAULT_CATEGORIES.map((c) => (
                <div key={c.id} className="web-card text-center p-4">
                  <img src={c.iconUrl} alt={c.name} className="w-10 h-10 object-contain mx-auto mb-2" />
                  <strong className="text-xs block">{c.name}</strong>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SUB-VIEW 3: SERVICES MANAGER */}
        {activeTab === 'services' && (
          <div className="space-y-6">
            <form onSubmit={handleAddService} className="web-card space-y-4">
              <h3 className="font-extrabold text-base text-redPrimary">Add New Service (Connected to Category)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input type="text" value={newSrvTitle} onChange={(e) => setNewSrvTitle(e.target.value)} placeholder="Service Title (e.g. Pipe Leak Repair)" className="p-3 rounded-lg border border-slate-200 dark:border-neutral-700 bg-slate-100 dark:bg-neutral-800 text-sm" />
                <select value={newSrvCatId} onChange={(e) => setNewSrvCatId(e.target.value)} className="p-3 rounded-lg border border-slate-200 dark:border-neutral-700 bg-slate-100 dark:bg-neutral-800 text-sm font-bold">
                  {DEFAULT_CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <input type="number" value={newSrvPrice} onChange={(e) => setNewSrvPrice(e.target.value)} placeholder="Original Price (₹)" className="p-3 rounded-lg border border-slate-200 dark:border-neutral-700 bg-slate-100 dark:bg-neutral-800 text-sm" />
                <input type="number" value={newSrvDiscount} onChange={(e) => setNewSrvDiscount(e.target.value)} placeholder="Discount Price (₹)" className="p-3 rounded-lg border border-slate-200 dark:border-neutral-700 bg-slate-100 dark:bg-neutral-800 text-sm" />
                <input type="text" value={newSrvImage} onChange={(e) => setNewSrvImage(e.target.value)} placeholder="Service Icon Image URL" className="p-3 rounded-lg border border-slate-200 dark:border-neutral-700 bg-slate-100 dark:bg-neutral-800 text-sm md:col-span-2" />
              </div>
              <button type="submit" className="btn-primary w-full py-3">
                <Plus className="w-4 h-4" /> Create & Link Service to Category
              </button>
            </form>
          </div>
        )}

        {/* SUB-VIEW 4: ADMIN PROFILE */}
        {activeTab === 'profile' && (
          <form onSubmit={handleSaveAdminProfile} className="web-card space-y-4">
            <h3 className="font-extrabold text-base text-redPrimary">Edit Admin Profile ID Credentials</h3>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Admin Full Name</label>
              <input type="text" value={adminName} onChange={(e) => setAdminName(e.target.value)} className="w-full p-3 rounded-lg border border-slate-200 dark:border-neutral-700 bg-slate-100 dark:bg-neutral-800 text-sm font-semibold" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Phone Number</label>
              <input type="text" value={adminPhone} onChange={(e) => setAdminPhone(e.target.value)} className="w-full p-3 rounded-lg border border-slate-200 dark:border-neutral-700 bg-slate-100 dark:bg-neutral-800 text-sm font-semibold" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Email Address</label>
              <input type="text" value={adminEmail} onChange={(e) => setAdminEmail(e.target.value)} className="w-full p-3 rounded-lg border border-slate-200 dark:border-neutral-700 bg-slate-100 dark:bg-neutral-800 text-sm font-semibold" />
            </div>
            <button type="submit" className="btn-primary w-full py-3">
              Save Admin Profile Credentials to Firebase
            </button>
          </form>
        )}
      </main>

      <Footer />
    </div>
  );
}
