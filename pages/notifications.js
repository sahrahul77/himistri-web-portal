import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import PopupModal from '../components/PopupModal';
import { ref, onValue, set, update } from 'firebase/database';
import { rtdb } from '../lib/firebase';
import { useAuth } from '../lib/AuthContext';
import { Bell, ShoppingBag, Trash2, ArrowLeft, Lock, LogIn, CheckCircle2, Tag, Clock } from 'lucide-react';
import Link from 'next/link';

export default function NotificationsPage() {
  const [isDark, setIsDark] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [clearedNotifMap, setClearedNotifMap] = useState({});
  const [activeTab, setActiveTab] = useState(0); // 0=All, 1=Order Updates, 2=Offers & Promos

  // Dynamic Popup Modal State
  const [popupState, setPopupState] = useState({ isOpen: false, title: '', message: '', type: 'success', onAction: null });

  const { currentUser, isAuthLoaded } = useAuth();

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
    if (!currentUser) return;

    const notifsRef = ref(rtdb, 'notifications');
    const userRef = ref(rtdb, `users/${currentUser.id}`);

    const unsubNotifs = onValue(notifsRef, (snapshot) => {
      const rawList = [];
      if (snapshot.exists()) {
        snapshot.forEach((child) => {
          rawList.push({ id: child.key, ...child.val() });
        });
      }
      rawList.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());

      onValue(userRef, (userSnap) => {
        let clearedMap = {};
        if (userSnap.exists()) {
          const userData = userSnap.val();
          clearedMap = userData.clearedNotifications || {};
        }
        setClearedNotifMap(clearedMap);

        // Strict Audience Filtering: EXCLUDE partner-only notices from customer accounts!
        const isCustomer = !currentUser?.role || currentUser?.role === 'CUSTOMER';

        const userVisibleNotifs = rawList.filter(n => {
          const isCleared = clearedMap[n.id];
          if (isCleared) return false;

          const target = (n.targetAudience || '').toUpperCase().trim();

          if (isCustomer) {
            // Strictly exclude PARTNERS / SERVICE_PARTNERS notices from customers
            if (target === 'PARTNERS' || target === 'SERVICE_PARTNERS') {
              return false;
            }
          }

          return true;
        });

        setNotifications(userVisibleNotifs);

        // Automatically mark all visible notifications as READ for this user so header badge clears
        if (userVisibleNotifs.length > 0) {
          const readUpdates = {};
          userVisibleNotifs.forEach((n) => {
            readUpdates[`users/${currentUser.id}/readNotifications/${n.id}`] = true;
          });
          update(ref(rtdb), readUpdates);
        }
      });
    });

    return () => unsubNotifs();
  }, [currentUser]);

  // Clear All Notifications ONLY for this specific user
  const handleClearAllForUser = async () => {
    if (!currentUser) return;
    try {
      const clearedUpdates = {};
      notifications.forEach((n) => {
        clearedUpdates[`users/${currentUser.id}/clearedNotifications/${n.id}`] = true;
      });
      await update(ref(rtdb), clearedUpdates);

      setNotifications([]);
      setPopupState({
        isOpen: true,
        title: 'Notifications Cleared',
        message: 'Notifications cleared for your account.',
        type: 'info'
      });
    } catch (err) {
      setPopupState({
        isOpen: true,
        title: 'Clear Failed',
        message: err.message,
        type: 'error'
      });
    }
  };

  // Dismiss single notification ONLY for this specific user
  const handleClearSingleForUser = async (notifId) => {
    if (!currentUser) return;
    try {
      await set(ref(rtdb, `users/${currentUser.id}/clearedNotifications/${notifId}`), true);
      setNotifications(prev => prev.filter(n => n.id !== notifId));
    } catch (err) {
      console.error("Could not clear notification for user:", err);
    }
  };

  // Filter Notification Tabs
  const allNotifs = notifications;
  const orderUpdatesNotifs = notifications.filter(n => {
    const target = (n.targetAudience || '').toUpperCase();
    const title = (n.title || '').toLowerCase();
    const body = (n.body || '').toLowerCase();
    return target === 'CUSTOMERS' || title.includes('order') || body.includes('order') || title.includes('status');
  });

  const offersNotifs = notifications.filter(n => {
    const title = (n.title || '').toLowerCase();
    const body = (n.body || '').toLowerCase();
    return title.includes('offer') || body.includes('offer') || title.includes('promo') || body.includes('discount') || title.includes('code');
  });

  const displayedNotifs = activeTab === 0 ? allNotifs : activeTab === 1 ? orderUpdatesNotifs : offersNotifs;

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-[#0F0F0F] text-slate-900 dark:text-white transition-colors duration-200">
      <Header isDark={isDark} onToggleTheme={toggleTheme} currentUser={currentUser} />

      <main className="web-container py-6 sm:py-10 flex-1 max-w-2xl mx-auto px-4 sm:px-6 w-full space-y-6">
        {!isAuthLoaded ? (
          <div className="web-card text-center py-16 text-slate-500">Loading secure session...</div>
        ) : !currentUser ? (
          <div className="web-card text-center py-16 space-y-4 max-w-md mx-auto bg-white dark:bg-[#1A1A1A] border border-slate-200 dark:border-[#333333] shadow-xl rounded-2xl">
            <Lock className="w-16 h-16 text-redPrimary mx-auto" />
            <h2 className="text-2xl font-black">Login Required</h2>
            <p className="text-xs text-slate-500">Notifications are personalized for logged-in users. Please sign in to view your alert inbox.</p>
            <Link href="/auth?redirect=notifications" className="btn-primary inline-flex">
              <LogIn className="w-4 h-4" /> Sign In / Register
            </Link>
          </div>
        ) : (
          <>
            {/* Top Header Row matching Mobile App 100% */}
            <div className="bg-redPrimary text-white p-4 sm:p-5 rounded-2xl shadow-xl flex justify-between items-center">
              <div className="flex items-center gap-3">
                <Link href="/" className="p-1.5 rounded-full hover:bg-white/20 transition">
                  <ArrowLeft className="w-5 h-5 text-white" />
                </Link>
                <h1 className="text-xl sm:text-2xl font-black tracking-wide">
                  Notifications
                </h1>
              </div>

              {notifications.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearAllForUser}
                  className="p-2 rounded-xl bg-white/20 hover:bg-white/30 text-white transition flex items-center gap-1.5 text-xs font-extrabold"
                  title="Clear All Notifications for Me"
                >
                  <Trash2 className="w-4 h-4" /> Clear All
                </button>
              )}
            </div>

            {/* 3 Navigation Tabs matching Mobile App Screenshot 2 */}
            <div className="flex border-b border-slate-200 dark:border-neutral-800">
              <button
                onClick={() => setActiveTab(0)}
                className={`flex-1 py-3 text-center text-xs sm:text-sm font-black border-b-2 transition ${
                  activeTab === 0
                    ? 'border-b-redPrimary text-redPrimary'
                    : 'border-b-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                All ({allNotifs.length})
              </button>

              <button
                onClick={() => setActiveTab(1)}
                className={`flex-1 py-3 text-center text-xs sm:text-sm font-black border-b-2 transition ${
                  activeTab === 1
                    ? 'border-b-redPrimary text-redPrimary'
                    : 'border-b-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Order Updates
              </button>

              <button
                onClick={() => setActiveTab(2)}
                className={`flex-1 py-3 text-center text-xs sm:text-sm font-black border-b-2 transition ${
                  activeTab === 2
                    ? 'border-b-redPrimary text-redPrimary'
                    : 'border-b-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Offers & Promos
              </button>
            </div>

            {/* Notifications Cards Feed */}
            {displayedNotifs.length === 0 ? (
              <div className="web-card py-20 text-center text-slate-500 space-y-2 border-dashed bg-white dark:bg-[#1A1A1A] border border-slate-200 dark:border-[#333333] rounded-2xl">
                <Bell className="w-12 h-12 mx-auto text-slate-400 opacity-40 mb-2" />
                <p className="text-sm font-bold">No active notifications in this section.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {displayedNotifs.map((notif) => (
                  <div
                    key={notif.id}
                    className="web-card p-4 sm:p-5 bg-white dark:bg-[#1A1A1A] border border-slate-200 dark:border-[#333333] rounded-2xl shadow-md flex items-start justify-between gap-4 relative group hover:border-redPrimary/50 transition"
                  >
                    <div className="flex items-start gap-3.5 sm:gap-4">

                      {/* Pinkish Red Circular Icon Badge matching Screenshot 2 */}
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-rose-500/15 text-rose-500 flex items-center justify-center shrink-0 mt-0.5">
                        <ShoppingBag className="w-5 h-5 sm:w-6 sm:h-6 text-rose-500" />
                      </div>

                      <div className="space-y-1">
                        <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white leading-snug">
                          {notif.title || 'Himistri Notice'}
                        </h3>

                        <p className="text-xs text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
                          {notif.body || 'New notification update'}
                        </p>

                        <span className="text-[10px] font-semibold text-slate-400 block pt-1">
                          {new Date(notif.createdAt || Date.now()).toISOString().slice(0, 16).replace('T', ' ')}
                        </span>
                      </div>
                    </div>

                    {/* Individual Dismiss Button for User */}
                    <button
                      type="button"
                      onClick={() => handleClearSingleForUser(notif.id)}
                      className="text-slate-400 hover:text-rose-500 p-1 rounded-lg transition"
                      title="Clear Notification for Me"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

      </main>

      <PopupModal
        isOpen={popupState.isOpen}
        onClose={() => setPopupState({ ...popupState, isOpen: false })}
        title={popupState.title}
        message={popupState.message}
        type={popupState.type}
        actionText="Continue"
        onAction={popupState.onAction}
      />

      <Footer />
    </div>
  );
}
