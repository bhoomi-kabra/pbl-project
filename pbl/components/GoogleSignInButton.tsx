'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/AppContext';
import { UserRole } from '@/lib/types';
import { 
  User, 
  ShieldCheck, 
  HardHat, 
  CheckCircle2, 
  ChevronDown, 
  LogOut, 
  Building2,
  Users,
  Repeat
} from 'lucide-react';

export default function GoogleSignInButton() {
  const { 
    currentUser, 
    t, 
    isAuthenticated, 
    setIsAuthModalOpen,
    logout 
  } = useApp();

  const [isOpen, setIsOpen] = useState(false);

  const handleSignInClick = () => {
    setIsAuthModalOpen(true);
  };

  const handleSignOut = async () => {
    await logout();
    setIsOpen(false);
  };

  const handleSwitchRole = () => {
    setIsOpen(false);
    setIsAuthModalOpen(true);
  };

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'WARD_ENGINEER':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-300 border border-amber-500/30">
            <ShieldCheck className="w-3 h-3" />
            NMC Engineer
          </span>
        );
      case 'CONTRACTOR':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-300 border border-blue-500/30">
            <HardHat className="w-3 h-3" />
            Contractor
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 border border-emerald-500/30">
            <User className="w-3 h-3" />
            Citizen
          </span>
        );
    }
  };

  return (
    <div className="relative">
      {/* If User is authenticated */}
      {isAuthenticated && currentUser ? (
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700 text-sm transition-all shadow-xs"
          title="Account & Role Switcher"
        >
          <img
            src={currentUser.avatar}
            alt={currentUser.name}
            className="w-7 h-7 rounded-full object-cover border border-slate-300 dark:border-slate-600"
          />
          <div className="text-left hidden md:block">
            <div className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-tight flex items-center gap-1.5">
              <span className="truncate max-w-[120px]">{currentUser.name}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" title="Active Verified Session" />
            </div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
              {currentUser.role === 'CITIZEN' 
                ? t.roleCitizen 
                : currentUser.role === 'WARD_ENGINEER' 
                ? t.roleEngineer 
                : t.roleContractor}
            </div>
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
        </button>
      ) : (
        /* Sign In Button (Opens 3-Role Dashboard Module) */
        <button
          onClick={handleSignInClick}
          className="flex items-center gap-2 px-3.5 py-1.5 sm:py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-900 text-xs sm:text-sm font-black transition shadow-xs hover:shadow-sm border border-slate-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800 active:scale-95 shrink-0 cursor-pointer"
          title="Sign in to select your dashboard role"
        >
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span className="whitespace-nowrap">Sign In / Role</span>
        </button>
      )}

      {/* User Profile Dropdown Menu */}
      {isOpen && currentUser && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-xl p-3 z-50 animate-in fade-in zoom-in-95 duration-150">
            <div className="p-2 border-b border-slate-100 dark:border-slate-800 mb-2">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                <span>Active Dashboard</span>
                {getRoleBadge(currentUser.role)}
              </div>
              <div className="font-bold text-slate-900 dark:text-slate-100 text-sm truncate">{currentUser.name}</div>
              {currentUser.email ? (
                <div className="text-xs text-slate-500 dark:text-slate-400 truncate">{currentUser.email}</div>
              ) : null}
            </div>

            <div className="p-2 text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-950 rounded-xl mb-2">
              {currentUser.role === 'CITIZEN' && (
                <div>Access granted to Civic Feed, Before/After Verification, and Hazard Reporting.</div>
              )}
              {currentUser.role === 'WARD_ENGINEER' && (
                <div>Access granted to Municipal Tower, Penalty Issuance, and Milestone Certification.</div>
              )}
              {currentUser.role === 'CONTRACTOR' && (
                <div>Access granted to Work Orders Dispatch, Photographic Proof Submission, and DLP Escrow.</div>
              )}
            </div>

            <div className="space-y-1">
              <button
                onClick={handleSwitchRole}
                className="w-full flex items-center justify-between p-2 rounded-xl text-left text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                <div className="flex items-center gap-2">
                  <Repeat className="w-4 h-4 text-amber-500" />
                  <span>Switch Dashboard / Role</span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 -rotate-90 text-slate-400" />
              </button>
            </div>

            <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-2 px-2 py-1.5 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition font-semibold"
              >
                <LogOut className="w-3.5 h-3.5" />
                Sign Out
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
