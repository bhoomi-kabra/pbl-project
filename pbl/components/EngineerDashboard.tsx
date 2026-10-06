'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/AppContext';
import { Ticket, RoadProject, RoadWorkPhase } from '@/lib/types';
import { 
  ShieldCheck, 
  AlertTriangle, 
  Clock, 
  FileSpreadsheet, 
  Scale, 
  FileCheck2, 
  ArrowRight, 
  Building2, 
  Gavel,
  CheckCircle2,
  Lock
} from 'lucide-react';

interface EngineerDashboardProps {
  tickets: Ticket[];
  projects: RoadProject[];
  onUpdatePhase: (projectId: string, phase: RoadWorkPhase, percentage: number) => Promise<void>;
}

export default function EngineerDashboard({
  tickets,
  projects,
  onUpdatePhase
}: EngineerDashboardProps) {
  const { currentUser, signInWithRole, setIsAuthModalOpen } = useApp();
  const [issuedNotices, setIssuedNotices] = useState<Record<string, boolean>>({});

  const reopenedTickets = tickets.filter((t) => t.status === 'REOPENED');
  const delayedTickets = tickets.filter((t) => t.status !== 'OFFICIALLY_CLOSED');

  const handleIssuePenalty = (ticketId: string, contractorName: string) => {
    setIssuedNotices((prev) => ({ ...prev, [ticketId]: true }));
    alert(`Statutory Notice Served: Section 14 DLP Penalty Notice of ₹10,000 dispatched to ${contractorName}.`);
  };

  const handlePhaseAdvance = async (project: RoadProject) => {
    let nextPhase: RoadWorkPhase = 'CONCRETING';
    let nextPct = 50;

    if (project.phase === 'TRENCHING') {
      nextPhase = 'CONCRETING';
      nextPct = 60;
    } else if (project.phase === 'CONCRETING') {
      nextPhase = 'WATER_CURING';
      nextPct = 85;
    } else if (project.phase === 'WATER_CURING') {
      nextPhase = 'COMPLETED_VERIFIED';
      nextPct = 100;
    }

    await onUpdatePhase(project.id, nextPhase, nextPct);
  };

  // RBAC Access Barrier: Only WARD_ENGINEER allowed
  if (currentUser?.role !== 'WARD_ENGINEER') {
    return (
      <div className="max-w-2xl mx-auto py-12 px-6 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm space-y-5 animate-in fade-in duration-200">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto shadow-inner">
          <Lock className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <span className="px-3 py-1 rounded-full text-[10px] font-extrabold bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 uppercase tracking-wider">
            Restricted Municipal Tower
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100">
            NMC Ward Executive Engineer Console
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-lg mx-auto leading-relaxed">
            Access Restricted: You are currently signed in as <span className="font-bold text-slate-900 dark:text-slate-200">{currentUser?.name}</span> ({currentUser?.role === 'CITIZEN' ? 'Public Citizen' : currentUser?.role === 'CONTRACTOR' ? 'PWD Road Contractor' : 'Guest'}).
            This dashboard is strictly reserved for authorized <b>Nashik Municipal Corporation Ward Executive Engineers</b> to track 48h SLAs, issue ₹10,000 contractor penalties, and certify road works.
          </p>
        </div>
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => signInWithRole('WARD_ENGINEER')}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-slate-950 font-bold text-xs shadow-xs transition active:scale-95"
          >
            Sign In as NMC Executive Engineer
          </button>
          <button
            onClick={() => setIsAuthModalOpen(true)}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold text-xs border border-slate-200 dark:border-slate-700 transition"
          >
            Open 3-Role Sign In Module
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      
      {/* Officer Command Header */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-600 text-slate-950 flex items-center justify-center font-bold shadow-xs shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-slate-100">
                NMC Ward Executive Engineer Command Tower
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30">
                Executive Powers Active
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Authorized Officer: <b>{currentUser?.name}</b> ({currentUser?.ward} Ward) • MMCA Statutory Enforcement
            </p>
          </div>
        </div>

        {/* Executive Quick Stats */}
        <div className="flex items-center gap-2 text-xs">
          <span className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold border border-slate-200 dark:border-slate-700">
            {projects.length} DLP Roads Under Audit
          </span>
          <span className="px-3 py-1.5 rounded-xl bg-rose-500/10 text-rose-700 dark:text-rose-400 font-bold border border-rose-500/20">
            {reopenedTickets.length} Substandard Flags
          </span>
        </div>
      </div>

      {/* Citizen Flagged Substandard Works (Urgent Escalation) */}
      {reopenedTickets.length > 0 && (
        <div className="p-4 sm:p-5 rounded-2xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/30 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400" />
              <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-xs sm:text-sm uppercase tracking-wider">
                Citizen Flagged Substandard Works Pending Executive Action ({reopenedTickets.length})
              </h3>
            </div>
            <span className="text-[10px] font-bold text-rose-700 dark:text-rose-400 bg-rose-100 dark:bg-rose-950/80 px-2 py-0.5 rounded-full">
              Doctrine: Closed ≠ Resolved
            </span>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {reopenedTickets.map((tkt) => {
              const noticeServed = issuedNotices[tkt.id];
              return (
                <div
                  key={tkt.id}
                  className="p-4 rounded-xl bg-white dark:bg-slate-950/80 border border-rose-200 dark:border-rose-500/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs shadow-xs"
                >
                  <div className="space-y-1">
                    <div className="font-bold text-slate-900 dark:text-slate-100 text-sm">{tkt.title}</div>
                    <div className="text-[11px] text-rose-600 dark:text-rose-400 font-medium">
                      <b>Citizen Rejection Reason:</b> "{tkt.reopenReason || 'Repairs washed out after single rain shower.'}"
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400">
                      Contractor: <b className="text-slate-800 dark:text-slate-200">{tkt.contractorName || 'M/s Godavari Infrastructure Ltd.'}</b> • Location: {tkt.locationName} ({tkt.ward})
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {noticeServed ? (
                      <span className="px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-bold text-xs flex items-center gap-1 border border-emerald-500/20">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Notice Served
                      </span>
                    ) : (
                      <button
                        onClick={() => handleIssuePenalty(tkt.id, tkt.contractorName || 'Assigned Contractor')}
                        className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition shadow-xs active:scale-95"
                      >
                        <Gavel className="w-3.5 h-3.5" />
                        <span>Issue ₹10,000 Penalty Notice</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Engineering Milestone Certification Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Road Work Approvals */}
        <div className="lg:col-span-6 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-xs uppercase tracking-wider flex items-center gap-1.5">
              <FileCheck2 className="w-4 h-4 text-amber-500" />
              <span>Road Construction Phase Certification</span>
            </h3>
            <span className="text-[10px] text-slate-400 font-semibold">MMCA Sec. 14</span>
          </div>

          <div className="space-y-3">
            {projects.map((proj) => (
              <div key={proj.id} className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-bold text-slate-900 dark:text-slate-100 text-xs">{proj.roadName}</div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                      Tender: <span className="font-mono text-slate-700 dark:text-slate-300">{proj.tenderId}</span> • {proj.contractorName}
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                    {proj.phase.replace(/_/g, ' ')}
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] text-slate-500 dark:text-slate-400">
                    <span>Approved Completion</span>
                    <span className="font-bold">{proj.completionPercentage}%</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-1.5">
                    <div className="bg-amber-500 h-1.5 rounded-full" style={{ width: `${proj.completionPercentage}%` }} />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-slate-200 dark:border-slate-900 text-xs">
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">Budget: ₹{proj.budgetInLakhs}L</span>
                  {proj.phase !== 'COMPLETED_VERIFIED' ? (
                    <button
                      onClick={() => handlePhaseAdvance(proj)}
                      className="px-3 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1 shadow-xs"
                    >
                      Approve Next Phase <ArrowRight className="w-3 h-3" />
                    </button>
                  ) : (
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold text-xs flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Certified in DLP
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 48h Statutory SLA Audit Ledger */}
        <div className="lg:col-span-6 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-xs uppercase tracking-wider flex items-center gap-1.5">
              <Scale className="w-4 h-4 text-rose-500" />
              <span>48-Hour SLA Penalty Ledger</span>
            </h3>
            <span className="text-[10px] text-slate-400 font-semibold">Automatic Municipal Penalties</span>
          </div>

          <div className="space-y-3">
            {delayedTickets.slice(0, 5).map((tkt, idx) => {
              const isOverdue = true; // demonstration SLA threshold
              const fineAmount = 5000 + (idx * 2500);

              return (
                <div key={tkt.id} className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 text-xs">
                  <div>
                    <div className="font-bold text-slate-900 dark:text-slate-100">{tkt.title}</div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      {tkt.ward} • Assigned: <b className="text-slate-700 dark:text-slate-300">{tkt.contractorName || 'NMC PWD Maintenance Gang'}</b>
                    </div>
                    <div className="text-[10px] text-rose-600 dark:text-rose-400 font-semibold mt-1">
                      ⚠️ SLA Expired: Repair overdue by 72h
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="px-2.5 py-1 rounded-lg bg-rose-500/10 text-rose-700 dark:text-rose-400 font-black text-xs block border border-rose-500/20">
                      ₹{fineAmount.toLocaleString()} Fine
                    </span>
                    <span className="text-[9px] text-slate-400 block mt-1">Security Deducted</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Statutory DLP Warranty Registry Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 dark:text-slate-100 text-xs uppercase tracking-wider flex items-center gap-1.5">
            <FileSpreadsheet className="w-4 h-4 text-amber-500" />
            NMC Statutory Defect Liability Period (DLP) Warranty Registry
          </h3>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            {projects.length} Tendered Contracts Monitored
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3 px-4 font-bold">Tender / Road Work</th>
                <th className="py-3 px-3 font-bold">Ward</th>
                <th className="py-3 px-3 font-bold">Contractor</th>
                <th className="py-3 px-3 font-bold">Phase</th>
                <th className="py-3 px-3 font-bold">DLP Expiry</th>
                <th className="py-3 px-4 font-bold text-right">Budget</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 bg-white dark:bg-slate-900/40">
              {projects.map((proj) => (
                <tr key={proj.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-900 dark:text-slate-100">{proj.roadName}</div>
                    <div className="text-[10px] font-mono text-slate-500 dark:text-slate-400">{proj.tenderId}</div>
                  </td>
                  <td className="py-3 px-3 text-slate-700 dark:text-slate-300 font-medium">{proj.ward}</td>
                  <td className="py-3 px-3 text-slate-700 dark:text-slate-300">{proj.contractorName}</td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                      {proj.phase.replace('_', ' ')} ({proj.completionPercentage}%)
                    </span>
                  </td>
                  <td className="py-3 px-3 font-mono text-emerald-600 dark:text-emerald-400 text-[11px] font-bold">
                    ⏳ {proj.dlpEndDate}
                  </td>
                  <td className="py-3 px-4 text-right font-bold text-slate-900 dark:text-slate-100">
                    ₹{proj.budgetInLakhs}L
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
