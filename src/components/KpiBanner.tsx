import React from 'react';
import { Language, WardName, CivicTicket, RoadWorkProject, ThemeMode } from '../types';
import { translations } from '../data/translations';
import { HardHat, CheckCircle2, Zap, Clock, TrendingUp, AlertTriangle } from 'lucide-react';

interface KpiBannerProps {
  language: Language;
  selectedWard: WardName;
  theme?: ThemeMode;
  tickets?: CivicTicket[];
  projects?: RoadWorkProject[];
}

export const KpiBanner: React.FC<KpiBannerProps> = ({
  language,
  selectedWard,
  tickets = [],
  projects = [],
}) => {
  const t = translations[language];

  // Scoped to selected ward
  const wardTickets = tickets.filter(
    (tk) => selectedWard === 'All Wards' || tk.ward === selectedWard
  );
  const wardProjects = projects.filter(
    (p) => selectedWard === 'All Wards' || p.ward === selectedWard
  );

  const activeRoadWorks = wardProjects.filter((p) => p.state !== 'COMPLETED').length;
  const totalComplaints = wardTickets.length;
  const pendingOrInProgress = wardTickets.filter(
    (tk) => tk.status === 'SUBMITTED' || tk.status === 'ASSIGNED' || tk.status === 'IN_PROGRESS'
  ).length;
  const verificationPending = wardTickets.filter(
    (tk) => tk.status === 'VERIFICATION_PENDING' || tk.status === 'EVIDENCE_UPLOADED'
  ).length;
  const resolvedCount = wardTickets.filter((tk) => tk.status === 'CLOSED_VERIFIED').length;
  const reopenedCount = wardTickets.filter((tk) => tk.status === 'REOPENED_ESCALATED').length;

  const resolutionRate =
    totalComplaints > 0 ? Math.round((resolvedCount / totalComplaints) * 100) : 100;

  return (
    <section className="bg-slate-50 border-b border-slate-200 py-6 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-600" />
            <h2 className="text-sm md:text-base font-extrabold tracking-wide text-slate-900">
              {selectedWard === 'All Wards' ? 'NMC Municipal Overview (सर्व प्रभाग)' : `${selectedWard} Ward Overview`}
            </h2>
          </div>
          <span className="text-xs px-3 py-1 rounded-full border border-slate-300 font-mono font-bold bg-white text-slate-700 shadow-sm flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Real-Time DB Sync
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Card 1: Active Road Works */}
          <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm hover:shadow-md transition">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  {t.activeRoadWorks}
                </p>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-3xl font-black font-mono text-slate-900">
                    {activeRoadWorks}
                  </span>
                  <span className="text-xs text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200">
                    Active Sites
                  </span>
                </div>
              </div>
              <div className="p-3 bg-amber-50 rounded-2xl text-amber-600 border border-amber-200">
                <HardHat className="w-6 h-6" />
              </div>
            </div>
            <p className="text-xs mt-3 flex items-center gap-1.5 font-medium text-slate-600">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
              Under Concreting & Curing
            </p>
          </div>

          {/* Card 2: Total Registered Complaints */}
          <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm hover:shadow-md transition">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Registered Grievances
                </p>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-3xl font-black font-mono text-slate-900">
                    {totalComplaints}
                  </span>
                  <span className="text-xs text-rose-700 font-bold bg-rose-50 px-2 py-0.5 rounded-lg border border-rose-200">
                    {pendingOrInProgress} In-Progress
                  </span>
                </div>
              </div>
              <div className="p-3 bg-rose-50 rounded-2xl text-rose-600 border border-rose-200">
                <AlertTriangle className="w-6 h-6" />
              </div>
            </div>
            <p className="text-xs mt-3 flex items-center gap-1 font-medium text-slate-600">
              <span className="w-2 h-2 rounded-full bg-rose-500"></span>
              {verificationPending} pending citizen audit
            </p>
          </div>

          {/* Card 3: Verified Closed Rate */}
          <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm hover:shadow-md transition">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Audit Verified Rate
                </p>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-3xl font-black font-mono text-slate-900">
                    {resolutionRate}%
                  </span>
                  <span className="text-xs text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
                    {resolvedCount} Closed
                  </span>
                </div>
              </div>
              <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-600 border border-emerald-200">
                <CheckCircle2 className="w-6 h-6" />
              </div>
            </div>
            <p className="text-xs mt-3 flex items-center gap-1 font-medium text-slate-600">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              Citizen-confirmed resolutions
            </p>
          </div>

          {/* Card 4: Reopened / Escalated */}
          <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm hover:shadow-md transition">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  {t.escalatedTickets}
                </p>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-3xl font-black font-mono text-slate-900">
                    {reopenedCount}
                  </span>
                  <span className="text-xs text-blue-700 font-bold bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-200">
                    Closed ≠ Resolved
                  </span>
                </div>
              </div>
              <div className="p-3 bg-blue-50 rounded-2xl text-blue-600 border border-blue-200">
                <Clock className="w-6 h-6" />
              </div>
            </div>
            <p className="text-xs mt-3 flex items-center gap-1 font-medium text-slate-600">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
              Reopened by citizens after audit
            </p>
          </div>

        </div>
      </div>
    </section>
  );
};
