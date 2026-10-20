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

  // Allow everyone (including guests) to see public pages.
  // ONLY lock Admin/Partner paths to their respective roles.
  useEffect(() => {
    if (!isAuthLoaded) return;

    if (router.pathname.startsWith('/admin') && currentUser?.role !== 'ADMIN') {
      router.replace('/auth');
    } else if (router.pathname.startsWith('/partner') && currentUser?.role !== 'PARTNER' && currentUser?.role !== 'ADMIN') {
      router.replace('/auth');
    }
  }, [currentUser, isAuthLoaded, router.pathname]);

  if (!isAuthLoaded) {
    return (
      <div className="min-h-screen bg-[#0F0F0F] flex items-center justify-center">
        <div className="text-slate-500 font-bold text-sm">Verifying Secure Session...</div>
      </div>
    );
  }

  // Prevent rendering if they are blocked from a protected route
  if (router.pathname.startsWith('/admin') && currentUser?.role !== 'ADMIN') return null;
  if (router.pathname.startsWith('/partner') && currentUser?.role !== 'PARTNER' && currentUser?.role !== 'ADMIN') return null;

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
