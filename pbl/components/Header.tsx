'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/AppContext';
import GoogleSignInButton from './GoogleSignInButton';
import { 
  Share2,
  PlusCircle, 
  Sun, 
  Moon,
  ShieldCheck,
  HardHat,
  Menu,
  X,
  MapPin,
  Layers,
  FileCheck2,
  BookOpen,
  Home,
  HelpCircle
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
    setIsComplaintModalOpen,
    setIsAuthModalOpen
  } = useApp();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Dynamic navigation items strictly based on selected role
  let navItems: { id: string; label: string; icon?: any; badgeClass?: string }[] = [];

  if (currentUser?.role === 'WARD_ENGINEER') {
    navItems = [
      { id: 'engineer', label: language === 'mr' ? 'अभियंता नियंत्रण कक्ष' : 'Engineer Tower', icon: ShieldCheck, badgeClass: 'text-[#d95b18] bg-[#fef2ea]' },
      { id: 'map', label: t.tabMap, icon: Layers },
      { id: 'verify', label: t.tabVerify, icon: FileCheck2 },
      { id: 'rules', label: t.tabRules, icon: BookOpen },
      { id: 'home', label: t.tabHome, icon: Home },
    ];
  } else if (currentUser?.role === 'CONTRACTOR') {
    navItems = [
      { id: 'contractor', label: language === 'mr' ? 'कंत्राटदार कक्ष' : 'Contractor Hub', icon: HardHat, badgeClass: 'text-blue-600 bg-blue-50' },
      { id: 'map', label: t.tabMap, icon: Layers },
      { id: 'verify', label: t.tabVerify, icon: FileCheck2 },
      { id: 'rules', label: t.tabRules, icon: BookOpen },
      { id: 'home', label: t.tabHome, icon: Home },
    ];
  } else {
    // Citizen or unauthenticated public
    navItems = [
      { id: 'home', label: t.tabHome, icon: Home },
      { id: 'feed', label: t.tabFeed, icon: Share2 },
      { id: 'map', label: t.tabMap, icon: Layers },
      { id: 'verify', label: t.tabVerify, icon: FileCheck2 },
      { id: 'rules', label: t.tabRules, icon: BookOpen },
    ];
  }

  const handleNavClick = (tabId: string) => {
    setActiveTab(tabId);
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-30 w-full bg-white dark:bg-[#0c1322] border-b border-slate-200/80 dark:border-slate-800 transition-colors">
      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top bar */}
        <div className="flex items-center justify-between h-16 gap-3">
          
          {/* Brand Identity (Matching Figma Screenshot 1) */}
          <div 
            className="flex items-center gap-2.5 cursor-pointer shrink-0 select-none group" 
            onClick={() => setActiveTab('home')}
          >
            {/* Orange Square Logo with Share/Node Icon */}
            <div className="w-9 h-9 rounded-xl bg-[#d95b18] flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform">
              <Share2 className="w-5 h-5 stroke-[2.3]" />
            </div>

            <div className="flex items-center gap-2">
              <span className="font-black text-lg tracking-tight text-[#111d2e] dark:text-slate-100">
                Nashik Monitor
              </span>
              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#edf8f3] text-[#059669] border border-[#d1fae5]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#059669] animate-pulse" />
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
                  onClick={() => handleNavClick(item.id)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-[#111d2e] text-white dark:bg-[#d95b18] dark:text-white shadow-xs'
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
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Language Switcher (Matching Figma "EN / म" pill) */}
            <button
              onClick={() => setLanguage(language === 'en' ? 'mr' : 'en')}
              className="text-[12px] font-bold text-[#111d2e] dark:text-slate-200 hover:text-[#d95b18] px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 transition"
              title="Switch Language / भाषा बदला"
            >
              EN / म
            </button>

            {/* Rules & Help shortcut (?) */}
            <button
              onClick={() => setActiveTab('rules')}
              className="p-1 text-slate-500 hover:text-[#d95b18] dark:text-slate-400 dark:hover:text-slate-200 transition"
              title="Rules & Guidance"
              aria-label="Rules and Help"
            >
              <HelpCircle className="w-5 h-5" />
            </button>

            {/* Theme Switcher (desktop) */}
            <button
              onClick={toggleTheme}
              className="hidden sm:flex p-2 rounded-xl bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 transition"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
            </button>

            {/* Google Authentication & Role Switcher (desktop) */}
            <div className="hidden sm:block">
              <GoogleSignInButton />
            </div>

            {/* Report Complaint Action Button (desktop) */}
            <button
              onClick={() => setIsComplaintModalOpen(true)}
              className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#d95b18] hover:bg-[#c24e12] text-white font-bold text-xs shadow-xs transition transform active:scale-95 shrink-0"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Report</span>
            </button>

            {/* Mobile Hamburger Menu Icon (Matching Figma Screenshot 1) */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-1.5 rounded-lg text-[#111d2e] dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition lg:hidden"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6 stroke-[2.3]" /> : <Menu className="w-6 h-6 stroke-[2.3]" />}
            </button>

          </div>
        </div>

        {/* Mobile Navigation Dropdown/Drawer */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-100 dark:border-slate-800 py-3 space-y-2.5 animate-in slide-in-from-top-2">
            <div className="grid grid-cols-2 gap-2 pb-2">
              {navItems.map((item) => {
                const isActive = activeTab === item.id;
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`p-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                      isActive
                        ? 'bg-[#d95b18] text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-900 text-[#111d2e] dark:text-slate-200'
                    }`}
                  >
                    {Icon && <Icon className="w-4 h-4" />}
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
              <button
                onClick={() => {
                  setIsComplaintModalOpen(true);
                  setIsMobileMenuOpen(false);
                }}
                className="flex-1 py-2 px-3 rounded-xl bg-[#d95b18] text-white font-bold text-xs flex items-center justify-center gap-1.5"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Report Issue</span>
              </button>

              <button
                onClick={toggleTheme}
                className="p-2 rounded-xl bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300"
              >
                {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
              </button>

              <button
                onClick={() => {
                  setIsAuthModalOpen(true);
                  setIsMobileMenuOpen(false);
                }}
                className="py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-bold text-xs"
              >
                Roles / Login
              </button>
            </div>
          </div>
        )}

      </div>
    </header>
  );
}
