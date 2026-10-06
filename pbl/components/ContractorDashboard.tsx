'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/AppContext';
import { Ticket, RoadProject, RoadWorkPhase } from '@/lib/types';
import { 
  HardHat, 
  UploadCloud, 
  CheckCircle2, 
  Clock, 
  ArrowRight, 
  AlertTriangle, 
  Camera, 
  FileText, 
  Lock,
  Calendar,
  Layers
} from 'lucide-react';

interface ContractorDashboardProps {
  tickets: Ticket[];
  projects: RoadProject[];
  onUpdatePhase: (projectId: string, phase: RoadWorkPhase, percentage: number) => Promise<void>;
  onSubmitProof: (ticketId: string, afterImageUrl: string, contractorName: string, note?: string) => Promise<void>;
}

export default function ContractorDashboard({
  tickets,
  projects,
  onUpdatePhase,
  onSubmitProof
}: ContractorDashboardProps) {
  const { currentUser, signInWithRole, setIsAuthModalOpen } = useApp();

  const [selectedTicketId, setSelectedTicketId] = useState<string>(tickets[0]?.id || '');
  const [proofUrl, setProofUrl] = useState(
    'https://images.unsplash.com/photo-1621905251918-48416bd8575a?auto=format&fit=crop&w=800&q=80'
  );
  const [contractorNote, setContractorNote] = useState('');
  const [isSubmittingProof, setIsSubmittingProof] = useState(false);
  const [proofSuccess, setProofSuccess] = useState(false);

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

  // RBAC Access Barrier: Only CONTRACTOR allowed
  if (currentUser?.role !== 'CONTRACTOR') {
    return (
      <div className="max-w-2xl mx-auto py-12 px-6 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm space-y-5 animate-in fade-in duration-200">
        <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto shadow-inner">
          <Lock className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <span className="px-3 py-1 rounded-full text-[10px] font-extrabold bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/20 uppercase tracking-wider">
            Restricted Operations Console
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100">
            PWD Contractor Dispatch & Proof Portal
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-lg mx-auto leading-relaxed">
            Access Restricted: You are currently signed in as <span className="font-bold text-slate-900 dark:text-slate-200">{currentUser?.name}</span> ({currentUser?.role === 'CITIZEN' ? 'Public Citizen' : currentUser?.role === 'WARD_ENGINEER' ? 'NMC Ward Executive Engineer' : 'Guest'}).
            This operations hub is strictly reserved for registered <b>PWD Road Contractors</b> to upload after-repair evidence, manage work orders, and track DLP warranty liability.
          </p>
        </div>
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => signInWithRole('CONTRACTOR')}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs shadow-xs transition active:scale-95"
          >
            Sign In as Registered Contractor
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
      
      {/* Contractor Ops Header */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold shadow-xs shrink-0">
            <HardHat className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-slate-100">
                PWD Road Contractor Operations Hub
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-500/15 text-blue-700 dark:text-blue-400 border border-blue-500/30">
                PWD Class-I Certified
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Operating Firm: <b>{currentUser?.name}</b> • Defect Liability Compliance System
            </p>
          </div>
        </div>

        {/* Contractor Stats */}
        <div className="flex items-center gap-2 text-xs">
          <span className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold border border-slate-200 dark:border-slate-700">
            {tickets.length} Active Work Orders
          </span>
          <span className="px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-bold border border-emerald-500/20">
            ₹{projects.reduce((a, b) => a + b.budgetInLakhs, 0)}L In Escrow
          </span>
        </div>
      </div>

      {/* Main Studio: Left (Phase Advancement), Right (Proof Upload) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Phase advancement list */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-4">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-xs uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-blue-500" />
              <span>Assigned Road Projects: Engineering Phase Advancement</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Advance milestone progress from trenching to concreting, curing, and official handover
            </p>
          </div>

          <div className="space-y-3">
            {projects.map((proj) => (
              <div key={proj.id} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2.5">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-bold text-slate-900 dark:text-slate-100 text-sm">{proj.roadName}</div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      Tender ID: <span className="font-mono text-blue-600 dark:text-blue-400 font-semibold">{proj.tenderId}</span> • {proj.ward} Ward
                    </div>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                    {proj.phase.replace(/_/g, ' ')}
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] text-slate-500 dark:text-slate-400">
                    <span>Construction Progress</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{proj.completionPercentage}%</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div className="bg-blue-600 h-full rounded-full transition-all duration-300" style={{ width: `${proj.completionPercentage}%` }} />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-200/80 dark:border-slate-800 text-xs">
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    DLP Warranty: <b>{proj.dlpDurationYears} Years ({proj.dlpEndDate})</b>
                  </span>
                  {proj.phase !== 'COMPLETED_VERIFIED' ? (
                    <button
                      onClick={() => handlePhaseAdvance(proj)}
                      className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1 shadow-xs transition active:scale-95"
                    >
                      <span>Advance Milestone</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold text-xs flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" /> Fully Handed Over to NMC
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* After-Repair Photographic Evidence Upload Form */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-4">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-xs uppercase tracking-wider flex items-center gap-1.5">
              <UploadCloud className="w-4 h-4 text-emerald-500" />
              <span>Submit After-Repair Evidence</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Under <b>"Closed ≠ Resolved"</b> doctrine, your photo must be certified by 3 citizen votes
            </p>
          </div>

          <form onSubmit={handleProofSubmit} className="space-y-3.5 text-xs">
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Select Assigned Work Order / Defect:
              </label>
              <select
                value={selectedTicketId}
                onChange={(e) => setSelectedTicketId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-200 font-medium focus:outline-none focus:ring-1 focus:ring-blue-500 truncate"
              >
                {tickets.map((tkt) => (
                  <option key={tkt.id} value={tkt.id}>
                    [{tkt.status.replace(/_/g, ' ')}] {tkt.title.substring(0, 32)}...
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                After-Repair Photographic Proof URL:
              </label>
              <input
                type="url"
                required
                value={proofUrl}
                onChange={(e) => setProofUrl(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* Photo Preview */}
            <div className="space-y-1">
              <span className="text-[11px] font-semibold text-slate-500">Live Proof Preview:</span>
              <div className="relative aspect-[16/10] rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950 shadow-xs">
                <img src={proofUrl} alt="Repair Evidence Preview" className="w-full h-full object-cover" />
                <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/80 backdrop-blur-md text-[10px] text-emerald-300 font-bold flex items-center gap-1">
                  <Camera className="w-3 h-3" /> Photographic Evidence
                </div>
              </div>
            </div>

            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Technical Repair Method Notes (IRC Specifications):
              </label>
              <textarea
                rows={2}
                value={contractorNote}
                onChange={(e) => setContractorNote(e.target.value)}
                placeholder="E.g., 50mm Bituminous concrete compacted with 8-ton vibratory roller per IRC:SP:100-2014 standards."
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {proofSuccess && (
              <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Evidence submitted! Ticket transitioned to Citizen Quorum Verification Mode.</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmittingProof}
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition active:scale-95 cursor-pointer"
            >
              <UploadCloud className="w-4 h-4" />
              <span>{isSubmittingProof ? 'Transmitting Evidence...' : 'Submit to Citizen Quorum Studio'}</span>
            </button>
          </form>
        </div>

      </div>

    </div>
  );
}
