'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/AppContext';
import { Ticket } from '@/lib/types';
import { 
  User, 
  ClipboardList, 
  Globe, 
  HelpCircle, 
  Shield, 
  ExternalLink, 
  ChevronRight, 
  LogOut, 
  CheckCircle2, 
  Clock, 
  AlertTriangle,
  ArrowRight
} from 'lucide-react';

interface CivicSpaceProps {
  tickets: Ticket[];
  onNavigateToTab: (tab: any) => void;
  onOpenAuth: () => void;
  onInspectTicket: (ticketId: string) => void;
}

export default function CivicSpace({
  tickets,
  onNavigateToTab,
  onOpenAuth,
  onInspectTicket
}: CivicSpaceProps) {
  const { language, setLanguage, currentUser, logout } = useApp();
  const [activeSubTab, setActiveSubTab] = useState<'MY_REPORTS' | 'PROFILE'>('MY_REPORTS');

  // Filter user's tickets
  const myTickets = tickets.filter(
    (t) => currentUser && (t.citizenName === currentUser.name || t.citizenName.toLowerCase().includes(currentUser.name.toLowerCase().split(' ')[0]))
  );

  return (
    <div className="w-full max-w-xl mx-auto space-y-5 pb-12 transition-colors">
      
      {/* 1. Header (Figma Screen 7) */}
      <div className="flex items-center justify-between pb-1">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#d95b18] text-white flex items-center justify-center font-black shadow-xs">
            NM
          </div>
          <h1 className="text-[20px] font-black text-[#111d2e] dark:text-slate-100 tracking-tight">
            Your civic space
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setLanguage(language === 'en' ? 'mr' : 'en')}
            className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-[11px] font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-200 transition"
          >
            EN / म
          </button>
          <button
            onClick={() => onNavigateToTab('rules')}
            className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
            aria-label="Help"
          >
            <HelpCircle className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* 2. User Info Row */}
      <div className="flex items-center gap-3.5 pt-1">
        <div className="w-14 h-14 rounded-full bg-[#fef2ea] dark:bg-slate-800 border border-[#fae8dc] dark:border-slate-700 flex items-center justify-center text-[#d95b18] shrink-0">
          <User className="w-7 h-7" />
        </div>
        <div>
          <h2 className="text-[18px] font-black text-[#111d2e] dark:text-slate-100 leading-snug">
            {currentUser ? currentUser.name : 'Welcome, neighbour.'}
          </h2>
          <p className="text-[12px] text-slate-500 dark:text-slate-400">
            {currentUser 
              ? `${currentUser.role.replace('_', ' ')} · ${currentUser.ward || 'Nashik'} ward`
              : 'Guest view · not signed in'}
          </p>
        </div>
      </div>

      {/* 3. Sub Tabs: [My Reports] [Profile] */}
      <div className="flex items-center gap-2 pt-1">
        <button
          onClick={() => setActiveSubTab('MY_REPORTS')}
          className={`px-4 py-2 rounded-full text-xs font-bold transition ${
            activeSubTab === 'MY_REPORTS'
              ? 'bg-[#111d2e] text-white dark:bg-slate-100 dark:text-slate-900 shadow-xs'
              : 'bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300'
          }`}
        >
          My Reports
        </button>
        <button
          onClick={() => setActiveSubTab('PROFILE')}
          className={`px-4 py-2 rounded-full text-xs font-bold transition ${
            activeSubTab === 'PROFILE'
              ? 'bg-[#111d2e] text-white dark:bg-slate-100 dark:text-slate-900 shadow-xs'
              : 'bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300'
          }`}
        >
          Profile
        </button>
      </div>

      {/* 4. Signed Out vs Signed In State Card */}
      {!currentUser ? (
        <div className="rounded-3xl bg-[#fdfaf8] dark:bg-slate-900/70 border border-[#fae8dc] dark:border-slate-800 p-7 sm:p-9 text-center space-y-4 shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-white dark:bg-slate-800 text-[#d95b18] flex items-center justify-center mx-auto border border-[#fae8dc] dark:border-slate-700 shadow-xs">
            <ClipboardList className="w-7 h-7 text-[#d95b18]" />
          </div>

          <div className="space-y-1.5">
            <h3 className="text-[18px] font-black text-[#111d2e] dark:text-slate-100">
              Your reports belong here.
            </h3>
            <p className="text-[13px] text-slate-500 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
              Sign in to see your own submissions, follow review status and manage your profile.
            </p>
          </div>

          <div className="pt-2">
            <button
              onClick={onOpenAuth}
              className="w-full sm:w-auto min-w-[240px] py-3.5 px-6 rounded-2xl bg-[#d95b18] hover:bg-[#c24e12] text-white font-bold text-sm shadow-md transition active:scale-98"
            >
              Sign in / Create account
            </button>
          </div>

          <p className="text-[11px] text-slate-400 dark:text-slate-500 pt-1">
            No personal report history is shown while signed out.
          </p>
        </div>
      ) : activeSubTab === 'MY_REPORTS' ? (
        /* Signed in - My Reports view */
        <div className="space-y-3">
          {myTickets.length === 0 ? (
            <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-7 text-center space-y-2">
              <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-500" />
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                You haven't filed any complaints yet
              </h4>
              <p className="text-xs text-slate-500">
                Notice an open manhole, water logging, or pothole? Use the orange Report button in the bottom navigation.
              </p>
            </div>
          ) : (
            myTickets.map((tkt) => (
              <div
                key={tkt.id}
                onClick={() => onInspectTicket(tkt.id)}
                className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between cursor-pointer hover:border-[#d95b18]/40 transition"
              >
                <div>
                  <span className="text-[10px] font-black uppercase text-slate-400">{tkt.category}</span>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">{tkt.title}</h4>
                  <p className="text-xs text-slate-500">{tkt.locationName}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#fef2ea] text-[#d95b18] border border-[#fae8dc]">
                    {tkt.status.replace(/_/g, ' ')}
                  </span>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        /* Signed in - Profile details */
        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 space-y-4">
          <div className="space-y-1">
            <div className="text-xs font-bold text-slate-400 uppercase">Account Name</div>
            <div className="text-base font-bold text-slate-900 dark:text-slate-100">{currentUser.name}</div>
          </div>
          <div className="space-y-1">
            <div className="text-xs font-bold text-slate-400 uppercase">Role & Access</div>
            <div className="text-sm font-semibold text-[#d95b18]">{currentUser.role}</div>
          </div>
          <div className="space-y-1">
            <div className="text-xs font-bold text-slate-400 uppercase">Assigned Ward</div>
            <div className="text-sm font-semibold text-slate-700 dark:text-slate-300">{currentUser.ward || 'Nashik Citywide'}</div>
          </div>
          <div className="pt-2">
            <button
              onClick={logout}
              className="inline-flex items-center gap-2 py-2 px-4 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-xs transition"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign out</span>
            </button>
          </div>
        </div>
      )}

      {/* 5. Menu Items List (Figma Screen 7) */}
      <div className="space-y-1.5 pt-2">
        {/* Language */}
        <button
          onClick={() => setLanguage(language === 'en' ? 'mr' : 'en')}
          className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition text-left"
        >
          <div className="flex items-center gap-3.5">
            <Globe className="w-5 h-5 text-[#d95b18]" />
            <div>
              <div className="text-[14px] font-bold text-[#111d2e] dark:text-slate-100">Language</div>
              <div className="text-[12px] text-slate-500">English / मराठी</div>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </button>

        {/* Rules & Help */}
        <button
          onClick={() => onNavigateToTab('rules')}
          className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition text-left"
        >
          <div className="flex items-center gap-3.5">
            <HelpCircle className="w-5 h-5 text-[#d95b18]" />
            <div>
              <div className="text-[14px] font-bold text-[#111d2e] dark:text-slate-100">Rules & Help</div>
              <div className="text-[12px] text-slate-500">Reporting, verification and community conduct</div>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </button>

        {/* Privacy & account */}
        <button
          onClick={onOpenAuth}
          className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition text-left"
        >
          <div className="flex items-center gap-3.5">
            <Shield className="w-5 h-5 text-[#d95b18]" />
            <div>
              <div className="text-[14px] font-bold text-[#111d2e] dark:text-slate-100">Privacy & account</div>
              <div className="text-[12px] text-slate-500">
                {currentUser ? 'Manage role and credentials' : 'Sign in to manage your account'}
              </div>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </button>

        {/* About Nashik Monitor */}
        <button
          onClick={() => onNavigateToTab('home')}
          className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition text-left"
        >
          <div className="flex items-center gap-3.5">
            <ExternalLink className="w-5 h-5 text-[#d95b18]" />
            <div>
              <div className="text-[14px] font-bold text-[#111d2e] dark:text-slate-100">About Nashik Monitor</div>
              <div className="text-[12px] text-slate-500">Where Closed ≠ Resolved</div>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </button>
      </div>

      {/* 6. Preserved civic snapshot Card (Figma Design Spec) */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-4 space-y-1.5 shadow-xs">
        <h4 className="text-[13px] font-bold text-[#111d2e] dark:text-slate-100">
          Preserved civic snapshot
        </h4>
        <p className="text-[12px] text-slate-500 dark:text-slate-400 leading-relaxed">
          2 active complaints · 0 under citizen verification · 0 substandard flags · 6 monitored works. 6 NMC wards, 3-vote quorum and 3–5 year DLP warranty.
        </p>
      </div>

      {/* Footnote (Figma Screen 7) */}
      <p className="text-[12px] text-slate-400 text-center pt-1">
        You can still use the public Civic Feed and GIS Map while signed out.
      </p>

    </div>
  );
}
