const fs = require('fs');

// 1. AuthContext.js
fs.writeFileSync('lib/AuthContext.js', `import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthLoaded, setIsAuthLoaded] = useState(false);

  useEffect(() => {
    const session = localStorage.getItem('himistri_session');
    if (session) {
      try {
        setCurrentUser(JSON.parse(session));
      } catch (e) {}
    }
    setIsAuthLoaded(true);
  }, []);

  const login = (user) => {
    setCurrentUser(user);
    localStorage.setItem('himistri_session', JSON.stringify(user));
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('himistri_session');
    window.location.href = '/auth';
  };

  return (
    <AuthContext.Provider value={{ currentUser, login, logout, isAuthLoaded }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
`);

// 2. _app.js
fs.writeFileSync('pages/_app.js', `import '../styles/globals.css';
import { AuthProvider } from '../lib/AuthContext';

export default function App({ Component, pageProps }) {
  return (
    <AuthProvider>
      <Component {...pageProps} />
    </AuthProvider>
  );
}
`);

function replaceInFile(path, replacements) {
  if (!fs.existsSync(path)) return;
  let content = fs.readFileSync(path, 'utf8');
  replacements.forEach(([from, to]) => {
    content = content.replace(from, to);
  });
  fs.writeFileSync(path, content);
}

// Admin
replaceInFile('pages/admin/index.js', [
  ["import { rtdb } from '../../lib/firebase';", "import { rtdb } from '../../lib/firebase';\nimport { useAuth } from '../../lib/AuthContext';"],
  [/[ \t]*\/\/ Logged-In Admin Session\n[ \t]*const \[currentUser, setCurrentUser\] = useState\(\{[\s\S]*?role: 'ADMIN'\n[ \t]*\}\);\n/g, ""],
  ["const [adminEmail, setAdminEmail] = useState('sahrahul77@gmail.com');", "const [adminEmail, setAdminEmail] = useState('sahrahul77@gmail.com');\n\n  const { currentUser, logout, isAuthLoaded } = useAuth();"],
  [/[ \t]*const handleLogout = \(\) => \{[\s\S]*?window\.location\.href = '\/auth';\n[ \t]*\};\n/g, ""],
  ["onClick={handleLogout}", "onClick={logout}"],
  ["{!isAdmin ? (", "{!isAuthLoaded ? (<div className=\"web-card text-center py-16 text-slate-500\">Loading secure session...</div>) : !isAdmin ? ("]
]);

// Partner
replaceInFile('pages/partner/index.js', [
  ["import { rtdb } from '../../lib/firebase';", "import { rtdb } from '../../lib/firebase';\nimport { useAuth } from '../../lib/AuthContext';"],
  [/[ \t]*\/\/ Logged-In Partner Session\n[ \t]*const \[currentUser, setCurrentUser\] = useState\(\{[\s\S]*?skillCategory: 'Home Tutor'\n[ \t]*\}\);\n/g, ""],
  ["const [partnerSkill, setPartnerSkill] = useState('Home Tutor');", "const [partnerSkill, setPartnerSkill] = useState('Home Tutor');\n\n  const { currentUser, logout, isAuthLoaded } = useAuth();"],
  [/[ \t]*const handleLogout = \(\) => \{[\s\S]*?window\.location\.href = '\/auth';\n[ \t]*\};\n/g, ""],
  ["onClick={handleLogout}", "onClick={logout}"],
  ["{!isPartner ? (", "{!isAuthLoaded ? (<div className=\"web-card text-center py-16 text-slate-500\">Loading secure session...</div>) : !isPartner ? ("]
]);

// Auth
replaceInFile('pages/auth.js', [
  ["import { rtdb } from '../lib/firebase';", "import { rtdb } from '../lib/firebase';\nimport { useAuth } from '../lib/AuthContext';"],
  ["const [isLoading, setIsLoading] = useState(false);", "const [isLoading, setIsLoading] = useState(false);\n\n  const { login } = useAuth();"],
  [/[ \t]*try \{\n[ \t]*localStorage\.setItem\('himistri_session', JSON\.stringify\(userObj\)\);\n[ \t]*\} catch \(_e\) \{\}/g, "    login(userObj);"]
]);

// Index
replaceInFile('pages/index.js', [
  ["import { rtdb } from '../lib/firebase';", "import { rtdb } from '../lib/firebase';\nimport { useAuth } from '../lib/AuthContext';"],
  [/[ \t]*\/\/ Current User Session\n[ \t]*const \[currentUser, setCurrentUser\] = useState\(null\);\n/g, "  const { currentUser } = useAuth();\n"],
  [/[ \t]*const session = localStorage\.getItem\('himistri_session'\);\n[ \t]*if \(session\) \{\n[ \t]*try \{\n[ \t]*setCurrentUser\(JSON\.parse\(session\)\);\n[ \t]*\} catch \(e\) \{\}\n[ \t]*\}\n\n/g, ""]
]);

// Checkout
replaceInFile('pages/checkout.js', [
  ["import { rtdb } from '../lib/firebase';", "import { rtdb } from '../lib/firebase';\nimport { useAuth } from '../lib/AuthContext';"],
  [/[ \t]*\/\/ User Session State\n[ \t]*const \[currentUser, setCurrentUser\] = useState\(\{[\s\S]*?role: 'CUSTOMER'\n[ \t]*\}\);\n/g, "  const { currentUser, isAuthLoaded } = useAuth();\n"],
  ["{!isLoggedIn ? (", "{!isAuthLoaded ? (<div className=\"web-card text-center py-16 text-slate-500\">Loading session...</div>) : !isLoggedIn ? ("]
]);

// Categories
replaceInFile('pages/categories.js', [
  ["import { rtdb } from '../lib/firebase';", "import { rtdb } from '../lib/firebase';\nimport { useAuth } from '../lib/AuthContext';"],
  ["const toggleTheme = () => {", "const { currentUser } = useAuth();\n\n  const toggleTheme = () => {"],
  ["<Header isDark={isDark} onToggleTheme={toggleTheme} />", "<Header isDark={isDark} onToggleTheme={toggleTheme} currentUser={currentUser} />"],
  ["<CheckoutModal isOpen={!!checkoutService} onClose={() => setCheckoutService(null)} service={checkoutService} />", "<CheckoutModal isOpen={!!checkoutService} onClose={() => setCheckoutService(null)} service={checkoutService} currentUser={currentUser} />"]
]);

// Services
replaceInFile('pages/services.js', [
  ["import { rtdb } from '../lib/firebase';", "import { rtdb } from '../lib/firebase';\nimport { useAuth } from '../lib/AuthContext';"],
  ["const toggleTheme = () => {", "const { currentUser } = useAuth();\n\n  const toggleTheme = () => {"],
  ["<Header isDark={isDark} onToggleTheme={toggleTheme} />", "<Header isDark={isDark} onToggleTheme={toggleTheme} currentUser={currentUser} />"],
  ["<CheckoutModal isOpen={!!checkoutService} onClose={() => setCheckoutService(null)} service={checkoutService} />", "<CheckoutModal isOpen={!!checkoutService} onClose={() => setCheckoutService(null)} service={checkoutService} currentUser={currentUser} />"]
]);

// Tracking
replaceInFile('pages/tracking.js', [
  ["import { rtdb } from '../lib/firebase';", "import { rtdb } from '../lib/firebase';\nimport { useAuth } from '../lib/AuthContext';"],
  ["const toggleTheme = () => {", "const { currentUser, isAuthLoaded } = useAuth();\n\n  const toggleTheme = () => {"],
  ["<Header isDark={isDark} onToggleTheme={toggleTheme} />", "<Header isDark={isDark} onToggleTheme={toggleTheme} currentUser={currentUser} />"],
  ["{bookings.length === 0", "{!isAuthLoaded ? (<div className=\"text-center py-16 text-slate-500\">Loading session...</div>) : bookings.filter(b => currentUser?.role === 'ADMIN' || b.customerPhone === currentUser?.phoneNumber || b.userPhone === currentUser?.phoneNumber).length === 0"],
  ["{bookings.map((b) => (", "{bookings.filter(b => currentUser?.role === 'ADMIN' || b.customerPhone === currentUser?.phoneNumber || b.userPhone === currentUser?.phoneNumber).map((b) => ("]
]);

console.log("All session logic updated successfully!");
