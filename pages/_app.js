import '../styles/globals.css';
import { AuthProvider, useAuth } from '../lib/AuthContext';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

function AuthGuard({ children }) {
  // Default theme is Light Mode across the entire website
  useEffect(() => {
    const savedTheme = localStorage.getItem('himistri_theme') || 'light';
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.setAttribute('data-theme', 'light');
    }
  }, []);

  const { currentUser, isAuthLoaded } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthLoaded) return;

    // STRICT LOCK FOR ADMIN: If Admin tries to visit ANY page other than /admin, force redirect to /admin
    if (currentUser?.role === 'ADMIN' && router.pathname !== '/admin') {
      router.replace('/admin');
    }

    // STRICT LOCK FOR PARTNER: If Partner tries to visit ANY page other than /partner, force redirect to /partner
    else if (currentUser?.role === 'PARTNER' && router.pathname !== '/partner') {
      router.replace('/partner');
    }
  }, [currentUser, isAuthLoaded, router.pathname]);

  if (!isAuthLoaded) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0F0F0F] flex items-center justify-center">
        <div className="text-slate-500 font-bold text-sm">Verifying Secure Session...</div>
      </div>
    );
  }

  // Hide page content if Admin/Partner attempts to view other pages while logged in
  if (currentUser?.role === 'ADMIN' && router.pathname !== '/admin') return null;
  if (currentUser?.role === 'PARTNER' && router.pathname !== '/partner') return null;

  return children;
}

export default function App({ Component, pageProps }) {
  const router = useRouter();
  const [isNavigating, setIsNavigating] = useState(false);

  useEffect(() => {
    const handleStart = () => setIsNavigating(true);
    const handleComplete = () => setIsNavigating(false);

    router.events.on('routeChangeStart', handleStart);
    router.events.on('routeChangeComplete', handleComplete);
    router.events.on('routeChangeError', handleComplete);

    return () => {
      router.events.off('routeChangeStart', handleStart);
      router.events.off('routeChangeComplete', handleComplete);
      router.events.off('routeChangeError', handleComplete);
    };
  }, [router]);

  return (
    <AuthProvider>
      <AuthGuard>
        {/* Global Top Page Navigation Loading Progress Bar */}
        {isNavigating && (
          <div className="fixed top-0 left-0 right-0 h-1.5 bg-redPrimary z-[99999] animate-pulse shadow-2xl transition-all duration-300" />
        )}
        <Component {...pageProps} />
      </AuthGuard>
    </AuthProvider>
  );
}
