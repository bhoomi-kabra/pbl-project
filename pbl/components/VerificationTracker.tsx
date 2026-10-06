'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/lib/AppContext';
import { Ticket } from '@/lib/types';
import confetti from 'canvas-confetti';
import { 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  MapPin, 
  Camera, 
  RotateCcw, 
  FileCheck2,
  CheckCircle,
  ThumbsUp,
  UserCheck,
  ChevronDown,
  Sparkles,
  SlidersHorizontal,
  Split,
  Eye,
  X
} from 'lucide-react';

interface VerificationTrackerProps {
  tickets: Ticket[];
  onVote: (ticketId: string, voteType: 'CONFIRM' | 'REOPEN', reason?: string) => Promise<void>;
  selectedTicketId?: string | null;
}

export default function VerificationTracker({ tickets, onVote, selectedTicketId }: VerificationTrackerProps) {
  const { t } = useApp();

  const candidateTickets = tickets.filter(
    (t) => t.status === 'VERIFICATION_PENDING' || t.status === 'REOPENED' || t.afterImageUrl
  );

  const [activeTicketId, setActiveTicketId] = useState<string>(
    selectedTicketId || (candidateTickets[0]?.id || tickets[0]?.id)
  );

  useEffect(() => {
    if (selectedTicketId) {
      setActiveTicketId(selectedTicketId);
    }
  }, [selectedTicketId]);

  const [reopenReasonInput, setReopenReasonInput] = useState('');
  const [showReopenModal, setShowReopenModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [viewMode, setViewMode] = useState<'SIDE_BY_SIDE' | 'SLIDER'>('SIDE_BY_SIDE');
  const [sliderPosition, setSliderPosition] = useState(50);

  const activeTicket = tickets.find((t) => t.id === activeTicketId) || tickets[0];

  const handleConfirmVote = async () => {
    if (!activeTicket) return;
    setIsSubmitting(true);
    try {
      await onVote(activeTicket.id, 'CONFIRM');
      confetti({
        particleCount: 90,
        spread: 80,
        origin: { y: 0.6 }
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReopenSubmit = async () => {
    if (!activeTicket || !reopenReasonInput.trim()) return;
    setIsSubmitting(true);
    try {
      await onVote(activeTicket.id, 'REOPEN', reopenReasonInput);
      setShowReopenModal(false);
      setReopenReasonInput('');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!activeTicket) {
    return (
      <div className="p-12 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-3">
        <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto" />
        <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm">All Fixed Tickets Verified!</h3>
        <p className="text-slate-500 text-xs max-w-sm mx-auto">
          There are currently no tickets awaiting citizen quorum verification.
        </p>
      </div>
    );
  }

  const isClosed = activeTicket.status === 'OFFICIALLY_CLOSED';
  const isReopened = activeTicket.status === 'REOPENED';
  const votesCount = activeTicket.confirmVotes || 0;

  return (
    <div className="space-y-4">
      
      {/* Top Header & Overview */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-slate-100">
                Closed ≠ Resolved Studio
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                Citizen Quorum Mandate
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Inspect contractor photographic evidence and vote to verify or reopen substandard road repairs
            </p>
          </div>
        </div>

        {/* Quick Ticket Dropdown */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 shrink-0">Quick Jump:</label>
          <select
            value={activeTicket.id}
            onChange={(e) => setActiveTicketId(e.target.value)}
            className="w-full md:w-72 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 font-semibold focus:outline-none focus:ring-1 focus:ring-amber-500 truncate"
          >
            {tickets.map((tkt) => (
              <option key={tkt.id} value={tkt.id}>
                [{tkt.status.replace(/_/g, ' ')}] {tkt.title.substring(0, 32)}...
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Visual Ticket Selection Strip (Cards) */}
      <div className="space-y-1.5">
        <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 px-1 uppercase tracking-wider">
          Tickets Awaiting Quorum / Proof Review ({tickets.length}):
        </div>
        <div className="flex items-center gap-2.5 overflow-x-auto no-scrollbar pb-1">
          {tickets.map((tkt) => {
            const isCurrent = tkt.id === activeTicket.id;
            const tktVotes = tkt.confirmVotes || 0;
            const tktClosed = tkt.status === 'OFFICIALLY_CLOSED';
            const tktReopened = tkt.status === 'REOPENED';

            return (
              <div
                key={tkt.id}
                onClick={() => setActiveTicketId(tkt.id)}
                className={`flex items-center gap-2.5 p-2 rounded-xl border transition-all cursor-pointer shrink-0 max-w-xs ${
                  isCurrent
                    ? 'bg-amber-500/10 border-amber-500 text-slate-900 dark:text-slate-100 ring-1 ring-amber-500/50 shadow-xs'
                    : 'bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <img
                  src={tkt.afterImageUrl || tkt.beforeImageUrl}
                  alt={tkt.title}
                  className="w-10 h-10 rounded-lg object-cover shrink-0 border border-slate-200 dark:border-slate-800"
                />
                <div className="min-w-0 pr-1">
                  <div className="text-xs font-bold truncate leading-tight">{tkt.title}</div>
                  <div className="flex items-center gap-1.5 mt-1 text-[10px]">
                    <span className="text-slate-400">{tkt.ward}</span>
                    <span>•</span>
                    {tktClosed ? (
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold">✓ Sealed</span>
                    ) : tktReopened ? (
                      <span className="text-rose-600 dark:text-rose-400 font-bold">⚠️ Reopened</span>
                    ) : (
                      <span className="text-amber-600 dark:text-amber-400 font-bold">⏳ {tktVotes}/3 Votes</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Studio Grid: Left (Visual Inspector), Right (Voting & Audit Trail) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Left Column: Visual Inspector */}
        <div className="lg:col-span-8 bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-4">
          
          {/* Header of Inspector */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3.5">
            <div>
              <div className="font-extrabold text-slate-900 dark:text-slate-100 text-sm sm:text-base leading-snug">
                {activeTicket.title}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-0.5">
                <MapPin className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span>{activeTicket.locationName} ({activeTicket.ward})</span>
              </div>
            </div>

            {/* View Mode Switcher */}
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-slate-800 text-xs self-start sm:self-auto shrink-0">
              <button
                onClick={() => setViewMode('SIDE_BY_SIDE')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition ${
                  viewMode === 'SIDE_BY_SIDE'
                    ? 'bg-white dark:bg-slate-800 text-slate-950 dark:text-slate-100 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <Split className="w-3.5 h-3.5" />
                <span>Side-by-Side</span>
              </button>
              <button
                onClick={() => setViewMode('SLIDER')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition ${
                  viewMode === 'SLIDER'
                    ? 'bg-white dark:bg-slate-800 text-slate-950 dark:text-slate-100 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>Split Slider</span>
              </button>
            </div>
          </div>

          {/* Side-by-Side Mode */}
          {viewMode === 'SIDE_BY_SIDE' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Before Repair Photo Card */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose-500" />
                    Before Repair Proof
                  </span>
                  <span className="text-slate-400 text-[10px]">
                    {new Date(activeTicket.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <div className="relative rounded-2xl overflow-hidden aspect-[16/10] border border-rose-200 dark:border-rose-900/40 bg-slate-100 dark:bg-slate-950 shadow-xs">
                  <img
                    src={activeTicket.beforeImageUrl}
                    alt="Before Repair"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-2 left-2 px-2.5 py-1 rounded-lg bg-black/80 backdrop-blur-md text-[10px] text-slate-200 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-rose-400" />
                    <span>GPS: {activeTicket.lat.toFixed(4)}, {activeTicket.lng.toFixed(4)}</span>
                  </div>
                </div>

                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  Citizen Reporter: <b className="text-slate-800 dark:text-slate-200">{activeTicket.citizenName}</b>
                </div>
              </div>

              {/* After Repair Photo Card */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    After Repair Evidence
                  </span>
                  <span className="text-slate-400 text-[10px]">
                    {activeTicket.resolvedAt ? new Date(activeTicket.resolvedAt).toLocaleDateString() : 'Awaiting Proof'}
                  </span>
                </div>

                <div className="relative rounded-2xl overflow-hidden aspect-[16/10] border border-emerald-300 dark:border-emerald-800/40 bg-slate-100 dark:bg-slate-950 flex items-center justify-center shadow-xs">
                  {activeTicket.afterImageUrl ? (
                    <>
                      <img
                        src={activeTicket.afterImageUrl}
                        alt="After Repair Evidence"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute bottom-2 left-2 px-2.5 py-1 rounded-lg bg-black/80 backdrop-blur-md text-[10px] text-emerald-300 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        <span>Work Completed per IRC Specs</span>
                      </div>
                    </>
                  ) : (
                    <div className="text-center p-6 space-y-2">
                      <Clock className="w-6 h-6 text-amber-500 mx-auto animate-pulse" />
                      <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">Awaiting Contractor Upload</div>
                      <p className="text-[10px] text-slate-400 max-w-xs mx-auto">
                        Contractor is dispatched. Photographic proof must be uploaded before citizen quorum can vote.
                      </p>
                    </div>
                  )}
                </div>

                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  Assigned Contractor: <b className="text-slate-800 dark:text-slate-200">{activeTicket.contractorName || 'NMC PWD Maintenance Gang'}</b>
                </div>
              </div>

            </div>
          ) : (
            /* Split Slider Mode */
            <div className="relative aspect-video rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950 select-none shadow-xs">
              <img
                src={activeTicket.beforeImageUrl}
                alt="Before"
                className="absolute inset-0 w-full h-full object-cover"
              />
              
              {activeTicket.afterImageUrl && (
                <div
                  className="absolute inset-0 overflow-hidden"
                  style={{ clipPath: `inset(0 0 0 ${sliderPosition}%)` }}
                >
                  <img
                    src={activeTicket.afterImageUrl}
                    alt="After"
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Split Slider Divider Line */}
              <div
                className="absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize shadow-xl z-20 flex items-center justify-center"
                style={{ left: `${sliderPosition}%` }}
              >
                <div className="w-7 h-7 rounded-full bg-slate-900 border-2 border-white text-white text-[10px] font-black flex items-center justify-center shadow-lg">
                  ↔
                </div>
              </div>

              {/* Slider Input */}
              <input
                type="range"
                min="0"
                max="100"
                value={sliderPosition}
                onChange={(e) => setSliderPosition(Number(e.target.value))}
                className="absolute inset-0 opacity-0 cursor-ew-resize z-30 w-full h-full"
              />

              <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-black/80 backdrop-blur-md text-rose-300 text-[10px] font-bold z-10 shadow-xs">
                ◀ Before Repair
              </div>
              <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-black/80 backdrop-blur-md text-emerald-300 text-[10px] font-bold z-10 shadow-xs">
                After Repair Evidence ▶
              </div>
            </div>
          )}

          {/* Reopened Alert Banner if ticket was previously reopened by citizens */}
          {isReopened && activeTicket.reopenReason && (
            <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/50 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
              <div>
                <div className="font-bold text-rose-700 dark:text-rose-300 text-xs">
                  Citizen Substandard Work Alert: Ticket Was Reopened!
                </div>
                <div className="text-xs text-rose-600 dark:text-rose-400 mt-0.5">
                  <b>Citizen Rejection Reason:</b> "{activeTicket.reopenReason}"
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Right Column: Citizen Verification Voting Console & Audit Trail */}
        <div className="lg:col-span-4 space-y-4">
          
          {/* Voting Console Card */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 dark:text-slate-100 text-xs uppercase tracking-wider">
                Citizen Quorum Status
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
                {votesCount} / 3 Confirmed
              </span>
            </div>

            {/* Visual Quorum Discs */}
            <div className="grid grid-cols-3 gap-2 py-1">
              {[1, 2, 3].map((num) => {
                const isConfirmed = votesCount >= num;
                return (
                  <div
                    key={num}
                    className={`p-2.5 rounded-xl border text-center transition-all ${
                      isConfirmed
                        ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400'
                        : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-400'
                    }`}
                  >
                    <div className="text-base font-black">
                      {isConfirmed ? '✓' : `0${num}`}
                    </div>
                    <div className="text-[9px] font-semibold mt-0.5">
                      {isConfirmed ? 'Citizen Vote' : 'Awaiting'}
                    </div>
                  </div>
                );
              })}
            </div>

            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              3 independent local citizen votes are required to seal this ticket. If work is substandard, click "Reopen Ticket" to escalate to the Ward Executive Engineer.
            </p>

            {/* Voting Buttons */}
            {isClosed ? (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-center text-xs font-bold flex items-center justify-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>Officially Sealed by Citizen Quorum!</span>
              </div>
            ) : (
              <div className="space-y-2 pt-1">
                <button
                  onClick={handleConfirmVote}
                  disabled={isSubmitting}
                  className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition active:scale-98"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Confirm Quality Fix (+1 Vote)</span>
                </button>

                <button
                  onClick={() => setShowReopenModal(true)}
                  disabled={isSubmitting}
                  className="w-full py-2 px-4 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-700 dark:text-rose-400 font-bold text-xs flex items-center justify-center gap-1.5 transition"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Flag Substandard / Reopen Ticket</span>
                </button>
              </div>
            )}
          </div>

          {/* Municipal Audit Trail Ledger */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-3 max-h-80 overflow-y-auto">
            <h4 className="font-bold text-slate-900 dark:text-slate-100 text-xs uppercase tracking-wider flex items-center gap-1.5">
              <FileCheck2 className="w-3.5 h-3.5 text-amber-500" />
              <span>Municipal Audit Trail</span>
            </h4>

            <div className="space-y-3 relative before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
              {activeTicket.auditTrail && activeTicket.auditTrail.length > 0 ? (
                activeTicket.auditTrail.map((entry) => (
                  <div key={entry.id} className="relative pl-6 text-xs">
                    <span className="absolute left-1 top-1.5 w-2 h-2 rounded-full bg-white dark:bg-slate-950 border-2 border-amber-500" />
                    <div className="font-semibold text-slate-800 dark:text-slate-200">{entry.action}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      {entry.performedBy} ({entry.role}) • {new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    {entry.note && (
                      <div className="mt-1 text-[11px] text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-950 p-2 rounded-lg border border-slate-200/80 dark:border-slate-800">
                        {entry.note}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-xs text-slate-400 pl-4">No audit entries recorded yet.</div>
              )}
            </div>
          </div>

        </div>

      </div>

      {/* Modal: Reopen Substandard Work */}
      {showReopenModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400">
              <AlertTriangle className="w-5 h-5" />
              <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                Flag Substandard Work
              </h3>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Under <b>"Closed ≠ Resolved"</b> doctrine, your complaint will be automatically escalated to 
              the Ward Executive Engineer for contractor penalty review.
            </p>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-400 block mb-1">
                Reason for Rejection:
              </label>
              <textarea
                value={reopenReasonInput}
                onChange={(e) => setReopenReasonInput(e.target.value)}
                placeholder="E.g., Cold-mix asphalt was uneven and washed away after evening rain."
                rows={3}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-rose-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowReopenModal(false)}
                className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleReopenSubmit}
                disabled={!reopenReasonInput.trim() || isSubmitting}
                className="px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white font-bold text-xs shadow transition"
              >
                Submit & Escalate
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
