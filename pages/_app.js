import '../styles/globals.css';
import { AuthProvider, useAuth } from '../lib/AuthContext';
import { useEffect } from 'react';
import { useRouter } from 'next/router';

function AuthGuard({ children }) {
  const { currentUser, isAuthLoaded } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthLoaded) return;

    // Strict redirect: If user is ADMIN or PARTNER, lock them strictly to their respective portals
    if (currentUser?.role === 'ADMIN' && router.pathname !== '/admin') {
      router.replace('/admin');
    } else if (currentUser?.role === 'PARTNER' && router.pathname !== '/partner') {
      router.replace('/partner');
    }
  }, [currentUser, isAuthLoaded, router.pathname]);

  // Prevent flash of wrong content while redirecting
  if (!isAuthLoaded) {
    return (
      <div className="min-h-screen bg-[#0F0F0F] flex items-center justify-center">
        <div className="text-slate-500 font-bold text-sm">Verifying Secure Session...</div>
      </div>
    );
  }

  // Hide the page content entirely if they are an Admin/Partner trying to view a regular page
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
