import React from 'react';
import { WardName, Language, ThemeMode, UserRoleMode } from '../types';
import { translations } from '../data/translations';
import { ShieldCheck, MapPin, Globe, AlertTriangle, Building2, Sparkles, LayoutDashboard, Share2, Users, Map, User, Shield, LogIn, LogOut } from 'lucide-react';
import { UserAccount } from '../services/api';

export type AppViewMode = 'GIS_MAP' | 'ADMIN_DASHBOARD' | 'SOCIAL_FEED' | 'COMMUNITY_RESOLVE';

interface HeaderProps {
  selectedWard: WardName;
  onSelectWard: (ward: WardName) => void;
  language: Language;
  onToggleLanguage: () => void;
  theme?: ThemeMode;
  onToggleTheme?: () => void;
  onOpenReportModal: () => void;
  activeView: AppViewMode;
  onChangeView: (view: AppViewMode) => void;
  userRole: UserRoleMode;
  currentUser: UserAccount | null;
  onOpenAuthModal: () => void;
  onSignOut: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  selectedWard,
  onSelectWard,
  language,
  onToggleLanguage,
  onOpenReportModal,
  activeView,
  onChangeView,
  userRole,
  currentUser,
  onOpenAuthModal,
  onSignOut,
}) => {
  const t = translations[language];
  const isAdmin = userRole === 'ADMIN';

  const wards: WardName[] = [
    'All Wards',
    'Panchavati',
    'Nashik East',
    'Nashik West',
    'Cidco',
    'Satpur',
    'Nashik Road',
  ];

  return (
    <header className="bg-white border-b border-slate-200 text-slate-900 sticky top-0 z-40 shadow-sm transition-colors duration-200">
      
      {/* Top Municipal Status Bar */}
      <div className="px-3 sm:px-6 py-2 border-b border-slate-200 text-xs flex justify-between items-center bg-slate-50 text-slate-700">
        <div className="flex items-center gap-2 overflow-hidden">
          <span className="flex h-2.5 w-2.5 relative shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-600"></span>
          </span>
          <span className="font-extrabold tracking-wide flex items-center gap-1.5 text-emerald-800 truncate">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="hidden sm:inline">Nashik Municipal Corporation • Official Civic Portal</span>
            <span className="sm:hidden">NMC Civic Portal</span>
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* User Account / Auth Button */}
          {currentUser ? (
            <div className="flex items-center gap-2">
              <button
                onClick={onOpenAuthModal}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-bold transition shadow-sm ${
                  isAdmin
                    ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                    : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                }`}
                title="Account Settings"
              >
                {isAdmin ? <Shield className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
                <span className="max-w-[120px] truncate">{currentUser.name}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full font-black uppercase bg-slate-200 text-slate-800">
                  {currentUser.role}
                </span>
              </button>
              <button
                onClick={onSignOut}
                className="p-1 rounded-full text-slate-400 hover:text-red-600 transition"
                title="Sign Out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuthModal}
              className="flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold shadow-sm transition"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In / Register</span>
            </button>
          )}

          {/* Bilingual Language Toggle */}
          <button
            onClick={onToggleLanguage}
            className="flex items-center gap-1 px-3 py-1 rounded-full border border-slate-300 bg-white hover:bg-slate-100 text-slate-800 text-xs font-bold shadow-sm transition"
          >
            <Globe className="w-3.5 h-3.5 text-emerald-600" />
            <span>{language === 'en' ? 'मराठी' : 'EN'}</span>
          </button>
        </div>
      </div>

      {/* Main Header Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap justify-between items-center gap-3">
        {/* Brand & Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-emerald-600 text-white shadow-md flex items-center justify-center shrink-0">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-xl font-black tracking-tight text-slate-900">
                {t.title}
              </h1>
            </div>
            <p className="text-[11px] sm:text-xs font-semibold text-emerald-700 flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              "{t.tagline}"
            </p>
          </div>
        </div>

        {/* Ward Selector & Action Button */}
        <div className="flex items-center gap-3 flex-wrap w-full sm:w-auto justify-between sm:justify-end">
          {/* Ward Selector Dropdown */}
          <div className="relative flex items-center flex-1 sm:flex-initial min-w-[160px]">
            <MapPin className="w-4 h-4 text-emerald-600 absolute left-3 pointer-events-none" />
            <select
              value={selectedWard}
              onChange={(e) => onSelectWard(e.target.value as WardName)}
              className="w-full text-xs rounded-xl pl-9 pr-7 py-2.5 bg-slate-50 border border-slate-300 text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 appearance-none cursor-pointer transition shadow-sm"
            >
              {wards.map((ward) => (
                <option key={ward} value={ward}>
                  {ward === 'All Wards' ? t.allWards : ward}
                </option>
              ))}
            </select>
            <div className="absolute right-2.5 pointer-events-none text-[10px] text-slate-500">▼</div>
          </div>

          {/* Action Button: Report Road Hazard */}
          <button
            onClick={onOpenReportModal}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl shadow-md shadow-emerald-600/20 flex items-center gap-2 transition transform active:scale-95 shrink-0"
          >
            <AlertTriangle className="w-4 h-4" />
            <span>{t.reportHazard}</span>
          </button>
        </div>
      </div>

      {/* Navigation View Tabs Bar (Desktop) */}
      <div className="hidden md:flex px-6 py-2 border-t border-slate-200 items-center justify-start gap-2 bg-slate-50 text-xs font-bold">
        <div className="max-w-7xl mx-auto flex items-center gap-2 w-full">
          {/* Citizen Live Feed Tab */}
          <button
            onClick={() => onChangeView('SOCIAL_FEED')}
            className={`px-4 py-2 rounded-xl flex items-center gap-2 transition ${
              activeView === 'SOCIAL_FEED'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
            }`}
          >
            <Share2 className="w-4 h-4" />
            <span>Citizen Grievance Feed</span>
          </button>

          {/* Ward GIS Map Tab */}
          <button
            onClick={() => onChangeView('GIS_MAP')}
            className={`px-4 py-2 rounded-xl flex items-center gap-2 transition ${
              activeView === 'GIS_MAP'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
            }`}
          >
            <Map className="w-4 h-4" />
            <span>Interactive GIS Map & Verification</span>
          </button>

          {/* Public Self-Resolution Tab */}
          <button
            onClick={() => onChangeView('COMMUNITY_RESOLVE')}
            className={`px-4 py-2 rounded-xl flex items-center gap-2 transition ${
              activeView === 'COMMUNITY_RESOLVE'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Citizen Self-Help Community</span>
          </button>

          {/* Municipal Admin Tab (Visible if logged in as ADMIN) */}
          {isAdmin && (
            <button
              onClick={() => onChangeView('ADMIN_DASHBOARD')}
              className={`px-4 py-2 rounded-xl flex items-center gap-2 transition ${
                activeView === 'ADMIN_DASHBOARD'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-indigo-700 hover:bg-indigo-50'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Municipal Admin Control Center</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
