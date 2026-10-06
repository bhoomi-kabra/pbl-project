'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/AppContext';
import { Ticket, RoadProject, RoadWorkPhase } from '@/lib/types';
import { 
  ShieldCheck, 
  HardHat, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  ArrowRight,
  UploadCloud,
  FileSpreadsheet
} from 'lucide-react';

interface AdminDashboardProps {
  tickets: Ticket[];
  projects: RoadProject[];
  onUpdatePhase: (projectId: string, phase: RoadWorkPhase, percentage: number) => Promise<void>;
  onSubmitProof: (ticketId: string, afterImageUrl: string, contractorName: string, note?: string) => Promise<void>;
}

export default function AdminDashboard({
  tickets,
  projects,
  onUpdatePhase,
  onSubmitProof
}: AdminDashboardProps) {
  const { t, currentUser, setRole } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'ENGINEER' | 'CONTRACTOR'>(
    currentUser?.role === 'CONTRACTOR' ? 'CONTRACTOR' : 'ENGINEER'
  );

  const [selectedTicketId, setSelectedTicketId] = useState<string>(tickets[0]?.id || '');
  const [proofUrl, setProofUrl] = useState(
    'https://images.unsplash.com/photo-1621905251918-48416bd8575a?auto=format&fit=crop&w=800&q=80'
  );
  const [contractorNote, setContractorNote] = useState('');
  const [isSubmittingProof, setIsSubmittingProof] = useState(false);
  const [proofSuccess, setProofSuccess] = useState(false);

  const reopenedTickets = tickets.filter((t) => t.status === 'REOPENED');

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

  const handleProofSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicketId || !proofUrl) return;

    setIsSubmittingProof(true);
    try {
      await onSubmitProof(
        selectedTicketId,
        proofUrl,
        currentUser?.name || 'M/s Godavari Infrastructure Ltd.',
        contractorNote || 'Work completed per IRC specifications.'
      );
      setProofSuccess(true);
      setTimeout(() => setProofSuccess(false), 4000);
      setContractorNote('');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmittingProof(false);
    }
  };

  if (currentUser?.role === 'CITIZEN') {
    return (
      <div className="max-w-2xl mx-auto py-12 px-6 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto">
          <ShieldCheck className="w-7 h-7" />
        </div>
        <div className="space-y-1.5">
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 uppercase tracking-wider">
            Municipal Officer Access Only
          </span>
          <h2 className="text-lg font-extrabold text-slate-900 dark:text-slate-100">
            NMC Engineering & Contractor Command Tower
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
            This workspace is reserved for authorized Ward Executive Engineers to issue statutory penalty notices and certify road construction milestones. Citizens interact via the Civic Feed, GIS Map, and Verification Studio.
          </p>
        </div>
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => setRole('WARD_ENGINEER')}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-slate-950 font-bold text-xs shadow-xs hover:from-amber-600 hover:to-orange-700 transition"
          >
            Authenticate as NMC Ward Engineer (Demo)
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      
      {/* Top Bar Switcher */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-2.5">
          <ShieldCheck className="w-5 h-5 text-amber-500 shrink-0" />
          <div>
            <h2 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-slate-100">
              NMC Municipal Governance & Contractor Control Tower
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Engineering SLA compliance, DLP warranty tracking, and penalty notices
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
          <button
            onClick={() => {
              setActiveSubTab('ENGINEER');
              setRole('WARD_ENGINEER');
            }}
            className={`px-3 py-1.5 rounded-lg font-bold transition ${
              activeSubTab === 'ENGINEER' ? 'bg-amber-500 text-slate-950 shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Ward Engineer View
          </button>
          <button
            onClick={() => {
              setActiveSubTab('CONTRACTOR');
              setRole('CONTRACTOR');
            }}
            className={`px-3 py-1.5 rounded-lg font-bold transition ${
              activeSubTab === 'CONTRACTOR' ? 'bg-amber-500 text-slate-950 shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Contractor Portal
          </button>
        </div>
      </div>

      {activeSubTab === 'ENGINEER' ? (
        <div className="space-y-4">
          
          {/* Substandard Reopened Warnings */}
          {reopenedTickets.length > 0 && (
            <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/30">
              <div className="flex items-center gap-2 mb-2.5">
                <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-xs uppercase tracking-wider">
                  Citizen Flagged Substandard Works Pending Executive Action ({reopenedTickets.length})
                </h3>
              </div>
              <div className="space-y-2">
                {reopenedTickets.map((tkt) => (
                  <div
                    key={tkt.id}
                    className="p-3 rounded-xl bg-white dark:bg-slate-950/80 border border-rose-200 dark:border-rose-500/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs shadow-xs"
                  >
                    <div>
                      <div className="font-bold text-slate-900 dark:text-slate-200">{tkt.title}</div>
                      <div className="text-[11px] text-rose-600 dark:text-rose-300 mt-0.5">
                        <b>Citizen Flag:</b> "{tkt.reopenReason}"
                      </div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                        Contractor: <b className="text-slate-800 dark:text-slate-300">{tkt.contractorName}</b> | Ward: {tkt.ward}
                      </div>
                    </div>

                    <button
                      onClick={() => alert(`Official notice served to ${tkt.contractorName} under Section 14 DLP Warranty.`)}
                      className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shrink-0 transition"
                    >
                      Issue ₹10,000 Penalty Notice
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Table of all active road works */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
            <div className="p-3.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-xs uppercase tracking-wider flex items-center gap-1.5">
                <FileSpreadsheet className="w-4 h-4 text-amber-500" />
                NMC Statutory DLP Warranty Registry
              </h3>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                {projects.length} Tendered Works Under Audit
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 dark:bg-slate-950 text-slate-600 dark:text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="py-2.5 px-4 font-semibold">Tender / Road Work</th>
                    <th className="py-2.5 px-3 font-semibold">Ward</th>
                    <th className="py-2.5 px-3 font-semibold">Contractor</th>
                    <th className="py-2.5 px-3 font-semibold">Phase</th>
                    <th className="py-2.5 px-3 font-semibold">DLP Expiry</th>
                    <th className="py-2.5 px-4 font-semibold text-right">Budget</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60 bg-white dark:bg-slate-900/30">
                  {projects.map((proj) => (
                    <tr key={proj.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition">
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900 dark:text-slate-200">{proj.roadName}</div>
                        <div className="text-[10px] font-mono text-slate-500 dark:text-slate-400">{proj.tenderId}</div>
                      </td>
                      <td className="py-3 px-3 text-slate-700 dark:text-slate-300">{proj.ward}</td>
                      <td className="py-3 px-3 text-slate-700 dark:text-slate-300">{proj.contractorName}</td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                          {proj.phase.replace('_', ' ')} ({proj.completionPercentage}%)
                        </span>
                      </td>
                      <td className="py-3 px-3 font-mono text-emerald-600 dark:text-emerald-400 text-[11px]">
                        ⏳ {proj.dlpEndDate}
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-slate-900 dark:text-slate-200">
                        ₹{proj.budgetInLakhs}L
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      ) : (
        /* Contractor Portal View */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          
          {/* Phase advancement list */}
          <div className="lg:col-span-7 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-xs uppercase tracking-wider flex items-center gap-1.5">
              <HardHat className="w-4 h-4 text-amber-500" />
              Active Road Works: Engineering Phase Advancement
            </h3>

            <div className="space-y-3">
              {projects.map((proj) => (
                <div key={proj.id} className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-bold text-slate-900 dark:text-slate-100 text-xs">{proj.roadName}</div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                        Tender: <span className="font-mono text-amber-600 dark:text-amber-400">{proj.tenderId}</span> • {proj.ward}
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                      {proj.phase}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] text-slate-500 dark:text-slate-400">
                      <span>Phase Progress</span>
                      <span>{proj.completionPercentage}%</span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-1.5">
                      <div className="bg-amber-500 h-1.5 rounded-full" style={{ width: `${proj.completionPercentage}%` }} />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-200 dark:border-slate-900 text-xs">
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">DLP Standard: {proj.dlpDurationYears} Years</span>
                    {proj.phase !== 'COMPLETED_VERIFIED' ? (
                      <button
                        onClick={() => handlePhaseAdvance(proj)}
                        className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1"
                      >
                        Advance Phase <ArrowRight className="w-3 h-3" />
                      </button>
                    ) : (
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold text-xs flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Fully Handed Over
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* After-Repair Photo Upload */}
          <div className="lg:col-span-5 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-xs uppercase tracking-wider flex items-center gap-1.5">
              <UploadCloud className="w-4 h-4 text-emerald-500" />
              Upload After-Repair Evidence
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Submit proof photo to transition defect into <b>Citizen Verification Mode</b>.
            </p>

            <form onSubmit={handleProofSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Select Defect Ticket:</label>
                <select
                  value={selectedTicketId}
                  onChange={(e) => setSelectedTicketId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-200"
                >
                  {tickets.map((tkt) => (
                    <option key={tkt.id} value={tkt.id}>
                      [{tkt.status}] {tkt.title.substring(0, 30)}...
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">After-Repair Photo URL:</label>
                <input
                  type="url"
                  required
                  value={proofUrl}
                  onChange={(e) => setProofUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-200"
                />
              </div>

              <div className="relative aspect-video rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950">
                <img src={proofUrl} alt="Preview" className="w-full h-full object-cover" />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Repair Method Notes:</label>
                <textarea
                  rows={2}
                  value={contractorNote}
                  onChange={(e) => setContractorNote(e.target.value)}
                  placeholder="E.g., 50mm Bituminous concrete compacted with 8-ton roller."
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-200"
                />
              </div>

              {proofSuccess && (
                <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" /> Proof uploaded! Moved to citizen verification.
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmittingProof}
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow"
              >
                <UploadCloud className="w-4 h-4" />
                {isSubmittingProof ? 'Uploading...' : 'Submit to Citizen Verification Hub'}
              </button>
            </form>
          </div>

        </div>
      )}

    </div>
  );
}
