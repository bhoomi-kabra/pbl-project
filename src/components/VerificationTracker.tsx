import React, { useState } from 'react';
import { CivicTicket, Language, WardName, ThemeMode } from '../types';
import { translations } from '../data/translations';
import { UserAccount } from '../services/api';
import { CheckCircle, XCircle, AlertTriangle, ShieldCheck, User, Building, MapPin, Eye, Award, Lock, Clock } from 'lucide-react';

interface VerificationTrackerProps {
  tickets: CivicTicket[];
  language: Language;
  selectedWard: WardName;
  theme?: ThemeMode;
  currentUser?: UserAccount | null;
  onUpdateTicketVote: (ticketId: string, action: 'confirm' | 'reopen') => void;
}

export const VerificationTracker: React.FC<VerificationTrackerProps> = ({
  tickets,
  language,
  selectedWard,
  currentUser,
  onUpdateTicketVote,
}) => {
  const t = translations[language];
  const [activeTicketId, setActiveTicketId] = useState<string>(tickets[0]?.id || '');
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const filteredTickets = tickets.filter(
    (t) => selectedWard === 'All Wards' || t.ward === selectedWard
  );

  const currentTicket = filteredTickets.find((t) => t.id === activeTicketId) || filteredTickets[0];

  // Reporter Authorization check: ONLY the reporter of this complaint can verify and close it
  const isOriginalReporter = Boolean(
    currentTicket &&
    currentUser &&
    (
      (currentTicket.reporterName && currentUser.name.trim().toLowerCase() === currentTicket.reporterName.trim().toLowerCase()) ||
      (currentTicket.reporterMobile && currentUser.mobile === currentTicket.reporterMobile)
    )
  );

  const handleVote = (action: 'confirm' | 'reopen') => {
    if (!currentTicket) return;

    if (!isOriginalReporter) {
      const reporterDisplay = currentTicket.reporterName || 'the original citizen reporter';
      setNotification({
        message: `🔒 Access Restricted: Only ${reporterDisplay} (who filed this complaint) can perform final citizen verification and close this ticket.`,
        type: 'error',
      });
      setTimeout(() => setNotification(null), 5000);
      return;
    }

    onUpdateTicketVote(currentTicket.id, action);

    setNotification({
      message:
        action === 'confirm'
          ? '✓ Verification confirmed! Ticket marked officially RESOLVED.'
          : '⚠️ Ticket reopened and escalated to NMC Executive Engineer.',
      type: 'success',
    });
    setTimeout(() => {
      setNotification(null);
    }, 5000);
  };

  return (
    <section className="bg-slate-50 border-b border-slate-200 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-emerald-100 text-emerald-800 rounded-2xl border border-emerald-200">
              <ShieldCheck className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <h3 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
                {t.verificationTitle}
              </h3>
              <p className="text-xs md:text-sm text-slate-500 font-medium mt-0.5">
                {t.verificationSub}
              </p>
            </div>
          </div>
        </div>

        {notification && (
          <div
            className={`mb-6 p-4 rounded-2xl border flex items-center justify-between text-xs font-bold animate-in fade-in duration-200 shadow-sm ${
              notification.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-rose-50 text-rose-800 border-rose-200'
            }`}
          >
            <div className="flex items-center gap-2">
              {notification.type === 'success' ? (
                <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
              )}
              <span>{notification.message}</span>
            </div>
            {notification.type === 'success' && (
              <span className="flex items-center gap-1 text-amber-700 bg-amber-50 font-bold px-2.5 py-1 rounded-lg border border-amber-200 shrink-0">
                <Award className="w-4 h-4 text-amber-600" /> +50 Civic Score
              </span>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Ticket Selector */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Select Ticket for Citizen Audit ({filteredTickets.length})
            </h4>

            {filteredTickets.length === 0 ? (
              <div className="p-6 rounded-2xl border border-slate-200 bg-white text-center text-xs text-slate-500">
                No tickets to display in {selectedWard}.
              </div>
            ) : (
              filteredTickets.map((ticket) => {
                const isSelected = ticket.id === (currentTicket?.id || '');
                return (
                  <div
                    key={ticket.id}
                    onClick={() => setActiveTicketId(ticket.id)}
                    className={`p-4 rounded-2xl border transition cursor-pointer ${
                      isSelected
                        ? 'bg-white border-emerald-500 shadow-md ring-2 ring-emerald-500/20'
                        : 'bg-white border-slate-200 hover:border-slate-300 shadow-sm'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs font-mono mb-1">
                      <span className="text-emerald-700 font-extrabold">{ticket.ticketNumber}</span>
                      <span className="text-slate-400 font-medium">{ticket.submittedDate}</span>
                    </div>

                    <h5 className="text-sm font-extrabold text-slate-900 line-clamp-1">
                      {language === 'mr' ? ticket.titleMr : ticket.title}
                    </h5>

                    <p className="text-xs flex items-center gap-1 mt-1 text-slate-500 font-medium truncate">
                      <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                      {ticket.ward} • {ticket.location}
                    </p>

                    <div className="mt-3 flex items-center justify-between text-[11px]">
                      <span className="px-2 py-0.5 rounded-lg bg-amber-50 text-amber-800 font-bold border border-amber-200">
                        {ticket.status}
                      </span>
                      <span className="text-slate-600 font-semibold">
                        👍 {ticket.citizenVotesConfirmed} Confirmed
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Right: Before vs After Side-by-Side Verification */}
          {currentTicket ? (
            <div className="lg:col-span-2 border border-slate-200 rounded-3xl p-6 space-y-6 shadow-sm bg-white text-slate-900">
              <div className="flex flex-wrap justify-between items-start border-b border-slate-200 pb-4 gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-emerald-800 font-extrabold bg-emerald-50 px-2.5 py-0.5 rounded-lg border border-emerald-200">
                      {currentTicket.ticketNumber}
                    </span>
                    <span className="text-xs font-bold uppercase text-slate-500">
                      {currentTicket.hazardType}
                    </span>
                  </div>
                  <h4 className="text-lg font-black text-slate-900 mt-2">
                    {language === 'mr' ? currentTicket.titleMr : currentTicket.title}
                  </h4>
                  <p className="text-xs text-slate-600 font-medium mt-0.5 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                    {currentTicket.location} ({currentTicket.ward} Ward)
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-xs font-bold px-3 py-1 rounded-xl bg-amber-50 text-amber-800 border border-amber-200">
                    Status: {currentTicket.status}
                  </span>
                  <p className="text-[11px] text-slate-500 mt-1">Submitted: {currentTicket.submittedDate}</p>
                </div>
              </div>

              {/* Side-by-Side Photographic Audit Evidence */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Before Repair Photo */}
                <div className="border border-slate-200 rounded-2xl p-3 bg-slate-50 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-rose-700">
                    <span>1. Before Repair (Reported by Citizen)</span>
                    <span className="text-[10px] bg-rose-100 text-rose-800 px-2 py-0.5 rounded font-mono">Geotagged</span>
                  </div>
                  <div className="h-48 rounded-xl overflow-hidden border border-slate-200 bg-slate-200">
                    {currentTicket.beforePhoto ? (
                      <img
                        src={currentTicket.beforePhoto}
                        alt="Before Repair"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="h-full flex items-center justify-center text-xs text-slate-400">
                        No initial photo provided
                      </div>
                    )}
                  </div>
                </div>

                {/* After Repair Photo */}
                <div className="border border-slate-200 rounded-2xl p-3 bg-slate-50 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-emerald-700">
                    <span>2. After Repair (Municipal Contractor Proof)</span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-mono">Official Proof</span>
                  </div>
                  <div className="h-48 rounded-xl overflow-hidden border border-slate-200 bg-slate-200">
                    {currentTicket.afterPhoto ? (
                      <img
                        src={currentTicket.afterPhoto}
                        alt="After Repair"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center text-xs text-slate-500 p-4 text-center">
                        <Clock className="w-8 h-8 text-slate-400 mb-2 animate-pulse" />
                        <span className="font-bold">Work In Progress / Awaiting Proof</span>
                        <span className="text-[10px] text-slate-400 mt-1">Contractor has not yet uploaded completion photo</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Citizen Verification Action Buttons */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 font-bold text-slate-700">
                    <User className="w-4 h-4 text-emerald-600" />
                    <span>Citizen Audit Authority: {currentTicket.reporterName || 'Registered Reporter'}</span>
                  </div>
                  {!isOriginalReporter && (
                    <span className="text-[11px] text-slate-500 font-medium flex items-center gap-1">
                      <Lock className="w-3.5 h-3.5" /> Reporter-Only Signoff
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <button
                    onClick={() => handleVote('confirm')}
                    disabled={!isOriginalReporter}
                    className={`flex-1 min-w-[200px] py-3 px-4 rounded-2xl font-bold text-xs md:text-sm flex items-center justify-center gap-2 transition transform active:scale-95 shadow-sm ${
                      !isOriginalReporter
                        ? 'bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-300'
                        : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    }`}
                  >
                    <CheckCircle className="w-5 h-5" />
                    <span>{t.confirmResolved} ({currentTicket.citizenVotesConfirmed})</span>
                  </button>

                  <button
                    onClick={() => handleVote('reopen')}
                    disabled={!isOriginalReporter}
                    className={`flex-1 min-w-[200px] py-3 px-4 rounded-2xl font-bold text-xs md:text-sm flex items-center justify-center gap-2 transition transform active:scale-95 shadow-sm ${
                      !isOriginalReporter
                        ? 'bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-300'
                        : 'bg-rose-600 hover:bg-rose-700 text-white'
                    }`}
                  >
                    <XCircle className="w-5 h-5" />
                    <span>{t.reopenEscalate} ({currentTicket.citizenVotesReopened})</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="lg:col-span-2 border border-slate-200 rounded-3xl p-8 flex items-center justify-center text-slate-500 text-sm bg-white">
              No tickets requiring verification in this ward.
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
