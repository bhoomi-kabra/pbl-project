'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language, UserRole, UserProfile, Ward } from './types';
import { translations, getTranslation } from './translations';
import { INITIAL_USERS } from './mockData';

interface AppContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: typeof translations.en;
  theme: 'dark' | 'light';
  setTheme: (theme: 'dark' | 'light') => void;
  toggleTheme: () => void;
  currentUser: UserProfile;
  setCurrentUser: (user: UserProfile) => void;
  setRole: (role: UserRole) => void;
  signInWithRole: (role: UserRole) => void;
  isAuthenticated: boolean;
  isGoogleConfigured: boolean;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  logout: () => Promise<void>;
  selectedWard: Ward | 'All';
  setSelectedWard: (ward: Ward | 'All') => void;
  isComplaintModalOpen: boolean;
  setIsComplaintModalOpen: (open: boolean) => void;
  prefilledComplaint: any;
  setPrefilledComplaint: (data: any) => void;
  selectedTicketForVerification: string | null;
  setSelectedTicketForVerification: (id: string | null) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');
  const [theme, setTheme] = useState<'dark' | 'light'>('light');
  const [currentUser, setCurrentUser] = useState<UserProfile>(INITIAL_USERS[0]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isGoogleConfigured, setIsGoogleConfigured] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [selectedWard, setSelectedWard] = useState<Ward | 'All'>('All');
  const [isComplaintModalOpen, setIsComplaintModalOpen] = useState(false);
  const [prefilledComplaint, setPrefilledComplaint] = useState<any>(null);
  const [selectedTicketForVerification, setSelectedTicketForVerification] = useState<string | null>(null);

  const signInWithRole = (role: UserRole) => {
    const found = INITIAL_USERS.find((u) => u.role === role) || INITIAL_USERS[0];
    setCurrentUser(found);
    setIsAuthenticated(true);
  };

  // Check auth status & current session on mount
  useEffect(() => {
    async function checkAuthSession() {
      try {
        const [statusRes, meRes] = await Promise.all([
          fetch('/api/auth/status'),
          fetch('/api/auth/me')
        ]);
        const statusData = await statusRes.json();
        setIsGoogleConfigured(Boolean(statusData.configured));

        const meData = await meRes.json();
        if (meData.authenticated && meData.user) {
          setCurrentUser(meData.user);
          setIsAuthenticated(true);
        }
      } catch (err) {
        console.warn('Auth session check notice:', err);
      }
    }
    checkAuthSession();
  }, []);

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setCurrentUser(INITIAL_USERS[0]);
      setIsAuthenticated(false);
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  // Initialize theme from localStorage or default to light theme
  useEffect(() => {
    const savedTheme = localStorage.getItem('nmc_civic_theme') as 'dark' | 'light' | null;
    if (savedTheme) {
      setTheme(savedTheme);
    } else {
      setTheme('light');
    }
  }, []);

  // Sync theme with DOM classes and attributes
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
      root.setAttribute('data-theme', 'dark');
      root.style.colorScheme = 'dark';
    } else {
      root.classList.remove('dark');
      root.classList.add('light');
      root.setAttribute('data-theme', 'light');
      root.style.colorScheme = 'light';
    }
    localStorage.setItem('nmc_civic_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const setRole = (role: UserRole) => {
    const found = INITIAL_USERS.find((u) => u.role === role);
    if (found) {
      setCurrentUser(found);
    } else {
      setCurrentUser((prev) => ({ ...prev, role }));
    }
  };

  const t = getTranslation(language);

  return (
    <AppContext.Provider
      value={{
        language,
        setLanguage,
        t,
        theme,
        setTheme,
        toggleTheme,
        currentUser,
        setCurrentUser,
        setRole,
        signInWithRole,
        isAuthenticated,
        isGoogleConfigured,
        isAuthModalOpen,
        setIsAuthModalOpen,
        logout,
        selectedWard,
        setSelectedWard,
        isComplaintModalOpen,
        setIsComplaintModalOpen,
        prefilledComplaint,
        setPrefilledComplaint,
        selectedTicketForVerification,
        setSelectedTicketForVerification
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
