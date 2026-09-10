import React from 'react';
import { WardName, Language, ThemeMode, UserRoleMode } from '../types';
import { translations } from '../data/translations';
import { ShieldCheck, MapPin, Globe, AlertTriangle, Building2, Sparkles, Sun, Moon, LayoutDashboard, Share2, Users, Map, User, Shield, LogIn, LogOut } from 'lucide-react';
import { UserAccount } from '../services/api';

export type AppViewMode = 'GIS_MAP' | 'ADMIN_DASHBOARD' | 'SOCIAL_FEED' | 'COMMUNITY_RESOLVE';

interface HeaderProps {
  selectedWard: WardName;
  onSelectWard: (ward: WardName) => void;
  language: Language;
  onToggleLanguage: () => void;
  theme: ThemeMode;
  onToggleTheme: () => void;
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
  theme,
  onToggleTheme,
  onOpenReportModal,
  activeView,
  onChangeView,
  userRole,
  currentUser,
  onOpenAuthModal,
  onSignOut,
}) => {
  const t = translations[language];
  const isDark = theme === 'dark';
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
    <header className={`${isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900 shadow-md'} border-b sticky top-0 z-40 transition-colors duration-300`}>
      {/* Top Banner Bar */}
      <div className={`px-3 sm:px-4 py-1.5 border-b text-xs flex justify-between items-center transition-colors duration-300 ${
        isDark 
          ? 'bg-slate-950 border-slate-800 text-slate-300' 
          : 'bg-slate-100 border-slate-200 text-slate-700'
      }`}>
        <div className="flex items-center gap-2 overflow-hidden">
          <span className="flex h-2 w-2 relative shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className={`font-bold tracking-wide flex items-center gap-1 truncate ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>
            <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden sm:inline">{t.smartCityBadge}</span>
            <span className="sm:hidden">Nashik Smart Portal</span>
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* User Account Profile / Auth Button */}
          {currentUser ? (
            <div className="flex items-center gap-1.5">
              <button
                onClick={onOpenAuthModal}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-bold transition shadow-sm ${
                  isAdmin
                    ? 'bg-indigo-600/20 text-indigo-400 border-indigo-500/40'
                    : 'bg-emerald-600/20 text-emerald-400 border-emerald-500/40'
                }`}
                title="Account Settings"
              >
                {isAdmin ? <Shield className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
                <span className="max-w-[110px] truncate">{currentUser.name}</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full font-black uppercase bg-white/10">
                  {currentUser.role}
                </span>
              </button>
              <button
                onClick={onSignOut}
                className="p-1 rounded-full text-slate-400 hover:text-red-400 transition"
                title="Sign Out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuthModal}
              className="flex items-center gap-1 px-3 py-1 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-extrabold shadow-md transition"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In / Register</span>
            </button>
          )}

          {/* Theme Toggle Button */}
          <button
            onClick={onToggleTheme}
            className={`p-1.5 rounded-full border transition text-xs font-bold shadow-sm ${
              isDark
                ? 'bg-slate-800 hover:bg-slate-700 text-amber-300 border-slate-700'
                : 'bg-amber-50 hover:bg-amber-100 text-amber-900 border-amber-300'
            }`}
            title="Toggle Light/Dark Theme"
          >
            {isDark ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-indigo-600" />}
          </button>

          {/* Language Toggle Button */}
          <button
            onClick={onToggleLanguage}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-full border transition text-xs font-semibold ${
              isDark
                ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                : 'bg-white hover:bg-slate-100 text-slate-800 border-slate-300 shadow-sm'
            }`}
          >
            <Globe className={`w-3.5 h-3.5 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
            <span>{language === 'en' ? 'मराठी' : 'EN'}</span>
          </button>
        </div>
      </div>

      {/* Main Header Container */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2.5 flex flex-wrap justify-between items-center gap-3">
        {/* Brand & Logo */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-emerald-500 via-teal-600 to-blue-700 p-0.5 shadow-lg flex items-center justify-center shrink-0">
            <div className={`w-full h-full rounded-[10px] flex items-center justify-center font-bold ${
              isDark ? 'bg-slate-950 text-emerald-400' : 'bg-white text-emerald-600'
            }`}>
              <Building2 className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-500" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className={`text-base sm:text-xl md:text-2xl font-extrabold tracking-tight ${
                isDark ? 'text-white' : 'text-slate-900'
              }`}>
                {t.title}
              </h1>
            </div>
            <p className={`text-[10px] sm:text-xs font-semibold flex items-center gap-1 ${
              isDark ? 'text-emerald-400' : 'text-emerald-700'
            }`}>
              <Sparkles className="w-3 h-3" />
              "{t.tagline}"
            </p>
          </div>
        </div>

        {/* Ward Selector & Action Button */}
        <div className="flex items-center gap-2.5 flex-wrap w-full sm:w-auto justify-between sm:justify-end">
          {/* Ward Selector Dropdown */}
          <div className="relative flex items-center flex-1 sm:flex-initial min-w-[140px]">
            <MapPin className={`w-3.5 h-3.5 absolute left-2.5 pointer-events-none ${
              isDark ? 'text-emerald-400' : 'text-emerald-600'
            }`} />
            <select
              value={selectedWard}
              onChange={(e) => onSelectWard(e.target.value as WardName)}
              className={`w-full text-xs rounded-xl pl-8 pr-6 py-2 border focus:outline-none focus:ring-2 focus:ring-emerald-500/50 appearance-none font-bold cursor-pointer transition shadow-sm ${
                isDark
                  ? 'bg-slate-800 text-white border-slate-700 hover:bg-slate-750'
                  : 'bg-slate-50 text-slate-900 border-slate-300 hover:bg-white'
              }`}
            >
              {wards.map((ward) => (
                <option 
                  key={ward} 
                  value={ward} 
                  className={isDark ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}
                >
                  {ward === 'All Wards' ? t.allWards : ward}
                </option>
              ))}
            </select>
            <div className="absolute right-2 pointer-events-none text-[10px] opacity-60">▼</div>
          </div>

          {/* Action Button: Report Hazard */}
          <button
            onClick={onOpenReportModal}
            className="bg-gradient-to-r from-red-600 via-red-500 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-bold text-xs px-3.5 py-2 rounded-xl shadow-lg shadow-red-500/25 flex items-center gap-1.5 transition transform active:scale-95 border border-red-400/30 shrink-0"
          >
            <AlertTriangle className="w-3.5 h-3.5 animate-bounce" />
            <span>{t.reportHazard}</span>
          </button>
        </div>
      </div>

      {/* Navigation View Tabs Bar (Desktop) */}
      <div className={`hidden md:flex px-4 py-2 border-t items-center justify-start gap-2 overflow-x-auto text-xs font-bold ${
        isDark ? 'bg-slate-950/80 border-slate-800' : 'bg-slate-100 border-slate-200'
      }`}>
        <div className="max-w-7xl mx-auto flex items-center gap-2 w-full">
          {/* Citizen Live Feed Tab */}
          <button
            onClick={() => onChangeView('SOCIAL_FEED')}
            className={`px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 transition ${
              activeView === 'SOCIAL_FEED'
                ? 'bg-pink-600 text-white shadow-md'
                : isDark
                ? 'text-slate-400 hover:text-white hover:bg-slate-800'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
            }`}
          >
            <Share2 className="w-4 h-4 text-pink-400" />
            <span>Citizen Live Feed</span>
          </button>

          {/* Ward GIS Map Tab */}
          <button
            onClick={() => onChangeView('GIS_MAP')}
            className={`px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 transition ${
              activeView === 'GIS_MAP'
                ? 'bg-emerald-500 text-white shadow-md'
                : isDark
                ? 'text-slate-400 hover:text-white hover:bg-slate-800'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
            }`}
          >
            <Map className="w-4 h-4" />
            <span>Ward GIS Map (+1 Pins)</span>
          </button>

          {/* Public Self-Resolution Tab */}
          <button
            onClick={() => onChangeView('COMMUNITY_RESOLVE')}
            className={`px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 transition ${
              activeView === 'COMMUNITY_RESOLVE'
                ? 'bg-cyan-600 text-white shadow-md'
                : isDark
                ? 'text-slate-400 hover:text-white hover:bg-slate-800'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
            }`}
          >
            <Users className="w-4 h-4 text-cyan-400" />
            <span>Public Self-Resolution</span>
          </button>

          {/* Municipal Admin Tab (ONLY visible if logged in as ADMIN) */}
          {isAdmin && (
            <button
              onClick={() => onChangeView('ADMIN_DASHBOARD')}
              className={`px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 transition ${
                activeView === 'ADMIN_DASHBOARD'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : isDark
                  ? 'text-slate-400 hover:text-white hover:bg-slate-800'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
              }`}
            >
              <LayoutDashboard className="w-4 h-4 text-indigo-400" />
              <span>Municipal Control Center</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
