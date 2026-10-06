'use client';

import React from 'react';
import { useApp } from '@/lib/AppContext';
import GoogleSignInButton from './GoogleSignInButton';
import { 
  Building2, 
  PlusCircle, 
  Sun, 
  Moon,
  ShieldCheck,
  HardHat,
  Users
} from 'lucide-react';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function Header({ activeTab, setActiveTab }: HeaderProps) {
  const {
    language,
    setLanguage,
    t,
    theme,
    toggleTheme,
    currentUser,
    setIsComplaintModalOpen
  } = useApp();

  // Dynamic navigation items strictly based on selected role
  let navItems: { id: string; label: string; icon?: any; badgeClass?: string }[] = [];

  if (currentUser?.role === 'WARD_ENGINEER') {
    navItems = [
      { id: 'engineer', label: language === 'mr' ? 'अभियंता नियंत्रण कक्ष' : 'Engineer Tower', icon: ShieldCheck, badgeClass: 'text-amber-600 dark:text-amber-400 bg-amber-500/10' },
      { id: 'map', label: t.tabMap },
      { id: 'verify', label: t.tabVerify },
      { id: 'rules', label: t.tabRules },
      { id: 'home', label: t.tabHome },
    ];
  } else if (currentUser?.role === 'CONTRACTOR') {
    navItems = [
      { id: 'contractor', label: language === 'mr' ? 'कंत्राटदार कक्ष' : 'Contractor Hub', icon: HardHat, badgeClass: 'text-blue-600 dark:text-blue-400 bg-blue-500/10' },
      { id: 'map', label: t.tabMap },
      { id: 'verify', label: t.tabVerify },
      { id: 'rules', label: t.tabRules },
      { id: 'home', label: t.tabHome },
    ];
  } else {
    // Citizen or unauthenticated public
    navItems = [
      { id: 'home', label: t.tabHome },
      { id: 'feed', label: t.tabFeed },
      { id: 'map', label: t.tabMap },
      { id: 'verify', label: t.tabVerify },
      { id: 'rules', label: t.tabRules },
    ];
  }

  return (
    <header className="sticky top-0 z-30 w-full bg-white/95 dark:bg-slate-950/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 transition-colors">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        
        {/* Top bar */}
        <div className="flex items-center justify-between h-16 gap-3">
          
          {/* Brand Identity */}
          <div 
            className="flex items-center gap-2.5 cursor-pointer shrink-0 select-none group" 
            onClick={() => setActiveTab('home')}
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform">
              <Building2 className="w-4 h-4" />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base sm:text-lg tracking-tight text-slate-900 dark:text-slate-100">
                {language === 'mr' ? (
                  <>नाशिक <span className="text-amber-600 dark:text-amber-400">मॉनिटर</span></>
                ) : (
                  <>Nashik <span className="text-amber-600 dark:text-amber-400">Monitor</span></>
                )}
              </span>
              <span className="hidden sm:inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Closed ≠ Resolved
              </span>
            </div>
          </div>

          {/* Center Tabs for Desktop */}
          <nav className="hidden lg:flex items-center gap-1 bg-slate-100/90 dark:bg-slate-900/90 p-1 rounded-full border border-slate-200/70 dark:border-slate-800">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-slate-900 text-white dark:bg-amber-500 dark:text-slate-950 shadow-xs'
                      : item.badgeClass
                      ? `${item.badgeClass} hover:opacity-80`
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-200/50 dark:hover:bg-slate-800/50'
                  }`}
                >
                  {Icon && <Icon className="w-3.5 h-3.5" />}
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Tools & Role Management */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            
            {/* Language Switcher */}
            <button
              onClick={() => setLanguage(language === 'en' ? 'mr' : 'en')}
              className="px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 transition"
              title="Switch Language / भाषा बदला"
            >
              {language === 'en' ? 'मराठी' : 'ENG'}
            </button>

            {/* Theme Switcher */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 transition"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
            </button>

            {/* Google Authentication & Role Switcher */}
            <GoogleSignInButton />

            {/* Report Complaint Action */}
            <button
              onClick={() => setIsComplaintModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-slate-950 font-bold text-xs sm:text-sm shadow-xs transition transform active:scale-95 shrink-0"
            >
              <PlusCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Report</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Bar */}
        <div className="lg:hidden flex items-center overflow-x-auto py-2 border-t border-slate-100 dark:border-slate-800/80 gap-1.5 no-scrollbar">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition flex items-center gap-1 ${
                  isActive
                    ? 'bg-slate-900 text-white dark:bg-amber-500 dark:text-slate-950'
                    : item.badgeClass
                    ? item.badgeClass
                    : 'text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-900'
                }`}
              >
                {Icon && <Icon className="w-3 h-3" />}
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

      </div>
    </header>
  );
}
