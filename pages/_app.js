import '../styles/globals.css';
import { AuthProvider, useAuth } from '../lib/AuthContext';
import { useEffect } from 'react';
import { useRouter } from 'next/router';

function AuthGuard({ children }) {
  useEffect(() => {
    document.documentElement.classList.add('dark');
    document.documentElement.setAttribute('data-theme', 'dark');
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
      <div className="min-h-screen bg-[#0F0F0F] flex items-center justify-center">
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
  return (
    <AuthProvider>
      <AuthGuard>
        <Component {...pageProps} />
      </AuthGuard>
    </AuthProvider>
  );
}
