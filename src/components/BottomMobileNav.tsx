import React from 'react';
import { AppViewMode } from './Header';
import { Map, LayoutDashboard, Share2, Users, AlertTriangle, User, Shield } from 'lucide-react';
import { Language, UserRoleMode } from '../types';
import { UserAccount } from '../services/api';

interface BottomMobileNavProps {
  activeView: AppViewMode;
  onChangeView: (view: AppViewMode) => void;
  onOpenReportModal: () => void;
  theme: 'light' | 'dark';
  language: Language;
  userRole: UserRoleMode;
  currentUser: UserAccount | null;
  onOpenAuthModal: () => void;
}

export const BottomMobileNav: React.FC<BottomMobileNavProps> = ({
  activeView,
  onChangeView,
  onOpenReportModal,
  theme,
  language,
  userRole,
  currentUser,
  onOpenAuthModal,
}) => {
  const isDark = theme === 'dark';
  const isAdmin = userRole === 'ADMIN';

  return (
    <div className={`md:hidden fixed bottom-0 left-0 right-0 z-50 border-t backdrop-blur-xl transition-all duration-300 ${
      isDark 
        ? 'bg-slate-950/95 border-slate-800 text-slate-400' 
        : 'bg-white/95 border-slate-200 text-slate-600 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]'
    }`}>
      <div className="grid grid-cols-5 items-center px-1 py-1.5 max-w-md mx-auto">
        
        {/* Tab 1: Social Feed */}
        <button
          onClick={() => onChangeView('SOCIAL_FEED')}
          className={`flex flex-col items-center justify-center py-1 rounded-xl transition ${
            activeView === 'SOCIAL_FEED'
              ? 'text-pink-500 font-extrabold scale-105'
              : 'hover:text-slate-200'
          }`}
        >
          <div className={`p-1 rounded-xl ${activeView === 'SOCIAL_FEED' ? 'bg-pink-500/10' : ''}`}>
            <Share2 className="w-5 h-5" />
          </div>
          <span className="text-[10px] tracking-tight mt-0.5 font-bold">Feed</span>
        </button>

        {/* Tab 2: GIS Map */}
        <button
          onClick={() => onChangeView('GIS_MAP')}
          className={`flex flex-col items-center justify-center py-1 rounded-xl transition ${
            activeView === 'GIS_MAP'
              ? 'text-emerald-500 font-extrabold scale-105'
              : 'hover:text-slate-200'
          }`}
        >
          <div className={`p-1 rounded-xl ${activeView === 'GIS_MAP' ? 'bg-emerald-500/10' : ''}`}>
            <Map className="w-5 h-5" />
          </div>
          <span className="text-[10px] tracking-tight mt-0.5 font-bold">Map</span>
        </button>

        {/* Center Floating Action Button: Quick Report */}
        <button
          onClick={onOpenReportModal}
          className="-mt-5 flex flex-col items-center justify-center"
          title="Report Hazard"
        >
          <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-red-600 via-red-500 to-amber-500 text-white flex items-center justify-center shadow-lg shadow-red-500/40 border-2 border-slate-900 active:scale-95 transition transform">
            <AlertTriangle className="w-6 h-6 animate-pulse" />
          </div>
          <span className="text-[9px] font-black text-red-500 tracking-tight mt-0.5 uppercase">Report</span>
        </button>

        {/* Tab 3: Self-Fix */}
        <button
          onClick={() => onChangeView('COMMUNITY_RESOLVE')}
          className={`flex flex-col items-center justify-center py-1 rounded-xl transition ${
            activeView === 'COMMUNITY_RESOLVE'
              ? 'text-cyan-500 font-extrabold scale-105'
              : 'hover:text-slate-200'
          }`}
        >
          <div className={`p-1 rounded-xl ${activeView === 'COMMUNITY_RESOLVE' ? 'bg-cyan-500/10' : ''}`}>
            <Users className="w-5 h-5" />
          </div>
          <span className="text-[10px] tracking-tight mt-0.5 font-bold">Self-Fix</span>
        </button>

        {/* Tab 4: Admin / Account */}
        {isAdmin ? (
          <button
            onClick={() => onChangeView('ADMIN_DASHBOARD')}
            className={`flex flex-col items-center justify-center py-1 rounded-xl transition ${
              activeView === 'ADMIN_DASHBOARD'
                ? 'text-indigo-500 font-extrabold scale-105'
                : 'hover:text-slate-200'
            }`}
          >
            <div className={`p-1 rounded-xl ${activeView === 'ADMIN_DASHBOARD' ? 'bg-indigo-500/10' : ''}`}>
              <Shield className="w-5 h-5 text-indigo-400" />
            </div>
            <span className="text-[10px] tracking-tight mt-0.5 font-bold">Admin</span>
          </button>
        ) : (
          <button
            onClick={onOpenAuthModal}
            className="flex flex-col items-center justify-center py-1 rounded-xl transition hover:text-slate-200"
          >
            <div className="p-1 rounded-xl">
              <User className="w-5 h-5 text-emerald-400" />
            </div>
            <span className="text-[10px] tracking-tight mt-0.5 font-bold truncate max-w-[50px]">
              {currentUser ? currentUser.name.split(' ')[0] : 'Sign In'}
            </span>
          </button>
        )}

      </div>
    </div>
  );
};
