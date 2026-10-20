import React, { createContext, useContext, useState, useEffect } from 'react';

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
