import React from 'react';
import { Language, WardName, ThemeMode } from '../types';
import { translations } from '../data/translations';
import { HardHat, CheckCircle2, Zap, Clock, TrendingUp } from 'lucide-react';

interface KpiBannerProps {
  language: Language;
  selectedWard: WardName;
  theme: ThemeMode;
}

export const KpiBanner: React.FC<KpiBannerProps> = ({ language, selectedWard, theme }) => {
  const t = translations[language];

  const getWardMultiplier = (ward: WardName) => {
    switch (ward) {
      case 'Panchavati': return 0.25;
      case 'Nashik West': return 0.22;
      case 'Nashik East': return 0.18;
      case 'Cidco': return 0.15;
      case 'Satpur': return 0.10;
      case 'Nashik Road': return 0.10;
      default: return 1.0;
    }
  };

  const mult = getWardMultiplier(selectedWard);
  const activeWorksCount = Math.round(142 * mult);
  const potholesCount = Math.round(1280 * mult);
  const escalatedCount = Math.round(32 * mult);

  const isDark = theme === 'dark';

  return (
    <section className={`${isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'} border-b py-6 px-4 transition-colors duration-300`}>
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <TrendingUp className={`w-5 h-5 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
            <h2 className={`text-sm md:text-base font-extrabold tracking-wide ${isDark ? 'text-slate-200' : 'text-slate-900'}`}>
              {selectedWard === 'All Wards' ? 'NMC Municipal Overview' : `${selectedWard} Ward Overview`}
            </h2>
          </div>
          <span className={`text-xs px-3 py-1 rounded-full border font-mono font-semibold ${
            isDark 
              ? 'bg-slate-900 text-slate-300 border-slate-700' 
              : 'bg-white text-slate-700 border-slate-300 shadow-sm'
          }`}>
            Live SLA Sync: Active
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Active Road Works */}
          <div className={`${
            isDark 
              ? 'bg-slate-900 border-amber-500/30' 
              : 'bg-white border-amber-300 shadow-md hover:shadow-lg'
          } border rounded-2xl p-4 transition duration-300 transform hover:-translate-y-1`}>
            <div className="flex items-start justify-between">
              <div>
                <p className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  {t.activeRoadWorks}
                </p>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className={`text-3xl font-black font-mono ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    {activeWorksCount}
                  </span>
                  <span className="text-xs text-amber-600 font-bold bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                    Live Projects
                  </span>
                </div>
              </div>
              <div className="p-3 bg-amber-500/10 rounded-xl text-amber-600 border border-amber-500/20">
                <HardHat className="w-6 h-6" />
              </div>
            </div>
            <p className={`text-xs mt-3 flex items-center gap-1 font-medium ${isDark ? 'text-slate-400' : 'text-slate-700'}`}>
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
              {t.activeRoadWorksSub}
            </p>
          </div>

          {/* Card 2: Potholes Attended */}
          <div className={`${
            isDark 
              ? 'bg-slate-900 border-emerald-500/30' 
              : 'bg-white border-emerald-300 shadow-md hover:shadow-lg'
          } border rounded-2xl p-4 transition duration-300 transform hover:-translate-y-1`}>
            <div className="flex items-start justify-between">
              <div>
                <p className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  {t.potholesAttended}
                </p>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className={`text-3xl font-black font-mono ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    {potholesCount.toLocaleString()}
                  </span>
                  <span className="text-xs text-emerald-600 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    +12 Today
                  </span>
                </div>
              </div>
              <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-600 border border-emerald-500/20">
                <CheckCircle2 className="w-6 h-6" />
              </div>
            </div>
            <p className={`text-xs mt-3 flex items-center gap-1 font-medium ${isDark ? 'text-slate-400' : 'text-slate-700'}`}>
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              {t.potholesAttendedSub}
            </p>
          </div>

          {/* Card 3: Resolution SLA Rate */}
          <div className={`${
            isDark 
              ? 'bg-slate-900 border-blue-500/30' 
              : 'bg-white border-blue-300 shadow-md hover:shadow-lg'
          } border rounded-2xl p-4 transition duration-300 transform hover:-translate-y-1`}>
            <div className="flex items-start justify-between">
              <div>
                <p className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  {t.slaRate}
                </p>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className={`text-3xl font-black font-mono ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    94.2%
                  </span>
                  <span className="text-xs text-blue-600 font-bold bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/20">
                    High SLA
                  </span>
                </div>
              </div>
              <div className="p-3 bg-blue-500/10 rounded-xl text-blue-600 border border-blue-500/20">
                <Zap className="w-6 h-6" />
              </div>
            </div>
            <p className={`text-xs mt-3 flex items-center gap-1 font-medium ${isDark ? 'text-slate-400' : 'text-slate-700'}`}>
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
              {t.slaRateSub}
            </p>
          </div>

          {/* Card 4: Escalated Tickets */}
          <div className={`${
            isDark 
              ? 'bg-slate-900 border-red-500/30' 
              : 'bg-white border-red-300 shadow-md hover:shadow-lg'
          } border rounded-2xl p-4 transition duration-300 transform hover:-translate-y-1`}>
            <div className="flex items-start justify-between">
              <div>
                <p className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  {t.escalatedTickets}
                </p>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className={`text-3xl font-black font-mono ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    {escalatedCount}
                  </span>
                  <span className="text-xs text-red-600 font-bold bg-red-500/10 px-2 py-0.5 rounded-full border border-red-500/20">
                    Action Required
                  </span>
                </div>
              </div>
              <div className="p-3 bg-red-500/10 rounded-xl text-red-600 border border-red-500/20">
                <Clock className="w-6 h-6" />
              </div>
            </div>
            <p className={`text-xs mt-3 flex items-center gap-1 font-medium ${isDark ? 'text-slate-400' : 'text-slate-700'}`}>
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
              {t.escalatedTicketsSub}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
