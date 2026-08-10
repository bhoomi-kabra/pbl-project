import React from 'react';
import { WardName, Language, ThemeMode } from '../types';
import { translations } from '../data/translations';
import { ShieldCheck, MapPin, Globe, AlertTriangle, Building2, Sparkles, Sun, Moon } from 'lucide-react';

interface HeaderProps {
  selectedWard: WardName;
  onSelectWard: (ward: WardName) => void;
  language: Language;
  onToggleLanguage: () => void;
  theme: ThemeMode;
  onToggleTheme: () => void;
  onOpenReportModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  selectedWard,
  onSelectWard,
  language,
  onToggleLanguage,
  theme,
  onToggleTheme,
  onOpenReportModal,
}) => {
  const t = translations[language];
  const isDark = theme === 'dark';

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
      <div className={`px-4 py-1.5 border-b text-xs flex justify-between items-center transition-colors duration-300 ${
        isDark 
          ? 'bg-slate-950 border-slate-800 text-slate-300' 
          : 'bg-slate-100 border-slate-200 text-slate-700'
      }`}>
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className={`font-bold tracking-wide flex items-center gap-1 ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>
            <ShieldCheck className="w-3.5 h-3.5" />
            {t.smartCityBadge}
          </span>
          <span className={isDark ? 'text-slate-600' : 'text-slate-400'}>•</span>
          <span className={`font-mono ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>NMC GIS Portal v4.2</span>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Theme Toggle Button */}
          <button
            onClick={onToggleTheme}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full border transition text-xs font-bold shadow-sm ${
              isDark
                ? 'bg-slate-800 hover:bg-slate-700 text-amber-300 border-slate-700'
                : 'bg-amber-50 hover:bg-amber-100 text-amber-900 border-amber-300'
            }`}
            title={isDark ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
          >
            {isDark ? (
              <>
                <Sun className="w-3.5 h-3.5 text-amber-400" />
                <span>{t.lightMode}</span>
              </>
            ) : (
              <>
                <Moon className="w-3.5 h-3.5 text-indigo-600" />
                <span>{t.darkMode}</span>
              </>
            )}
          </button>

          {/* Language Toggle Button */}
          <button
            onClick={onToggleLanguage}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full border transition text-xs font-semibold ${
              isDark
                ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                : 'bg-white hover:bg-slate-100 text-slate-800 border-slate-300 shadow-sm'
            }`}
          >
            <Globe className={`w-3.5 h-3.5 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
            <span>{language === 'en' ? 'मराठी' : 'English'}</span>
          </button>
        </div>
      </div>

      {/* Main Header Container */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap justify-between items-center gap-4">
        {/* Brand & Logo */}
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-500 via-teal-600 to-blue-700 p-0.5 shadow-lg flex items-center justify-center">
            <div className={`w-full h-full rounded-[10px] flex items-center justify-center font-bold ${
              isDark ? 'bg-slate-950 text-emerald-400' : 'bg-white text-emerald-600'
            }`}>
              <Building2 className="w-6 h-6 text-emerald-500" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className={`text-xl md:text-2xl font-extrabold tracking-tight ${
                isDark 
                  ? 'text-white' 
                  : 'text-slate-900'
              }`}>
                {t.title}
              </h1>
            </div>
            <p className={`text-xs font-semibold flex items-center gap-1 ${
              isDark ? 'text-emerald-400' : 'text-emerald-700'
            }`}>
              <Sparkles className="w-3 h-3" />
              "{t.tagline}"
            </p>
          </div>
        </div>

        {/* Ward Selector & Action Button */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Ward Selector Dropdown */}
          <div className="relative flex items-center">
            <MapPin className={`w-4 h-4 absolute left-3 pointer-events-none ${
              isDark ? 'text-emerald-400' : 'text-emerald-600'
            }`} />
            <select
              value={selectedWard}
              onChange={(e) => onSelectWard(e.target.value as WardName)}
              className={`text-xs md:text-sm rounded-xl pl-9 pr-8 py-2 border focus:outline-none focus:ring-2 focus:ring-emerald-500/50 appearance-none font-bold cursor-pointer transition shadow-sm ${
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
                  {ward === 'All Wards'
                    ? t.allWards
                    : ward === 'Panchavati'
                    ? t.panchavati
                    : ward === 'Nashik East'
                    ? t.nashikEast
                    : ward === 'Nashik West'
                    ? t.nashikWest
                    : ward === 'Cidco'
                    ? t.cidco
                    : ward === 'Satpur'
                    ? t.satpur
                    : t.nashikRoad}
                </option>
              ))}
            </select>
            <div className={`absolute right-2.5 pointer-events-none text-xs ${
              isDark ? 'text-slate-400' : 'text-slate-500'
            }`}>
              ▼
            </div>
          </div>

          {/* Action Button: Report Hazard */}
          <button
            onClick={onOpenReportModal}
            className="bg-gradient-to-r from-red-600 via-red-500 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-bold text-xs md:text-sm px-4 py-2 rounded-xl shadow-lg shadow-red-500/25 flex items-center gap-2 transition transform active:scale-95 border border-red-400/30"
          >
            <AlertTriangle className="w-4 h-4 animate-bounce" />
            <span>{t.reportHazard}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
