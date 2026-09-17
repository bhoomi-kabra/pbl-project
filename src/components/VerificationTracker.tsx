import React, { useState } from 'react';
import { CivicTicket, Language, WardName, ThemeMode } from '../types';
import { translations } from '../data/translations';
import { UserAccount } from '../services/api';
import { CheckCircle, XCircle, AlertTriangle, ShieldCheck, User, Building, MapPin, Eye, Award, Lock } from 'lucide-react';

interface VerificationTrackerProps {
  tickets: CivicTicket[];
  language: Language;
  selectedWard: WardName;
  theme: ThemeMode;
  currentUser?: UserAccount | null;
  onUpdateTicketVote: (ticketId: string, action: 'confirm' | 'reopen') => void;
}

export const VerificationTracker: React.FC<VerificationTrackerProps> = ({
  tickets,
  language,
  selectedWard,
  theme,
  currentUser,
  onUpdateTicketVote,
}) => {
  const t = translations[language];
  const [activeTicketId, setActiveTicketId] = useState<string>(tickets[0]?.id || '');
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const isDark = theme === 'dark';

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
      const reporterDisplay = currentTicket.reporterName || 'the original reporter';
      setNotification({
        message: `🔒 Access Denied: Only ${reporterDisplay} (who reported this defect) can perform citizen verification & close this ticket.`,
        type: 'error',
      });
      setTimeout(() => setNotification(null), 5000);
      return;
    }

    onUpdateTicketVote(currentTicket.id, action);

    if (action === 'confirm') {
      setNotification({
        message: t.confirmedSuccess,
        type: 'success',
      });
    } else {
      setNotification({
        message: t.escalatedWarning,
        type: 'error',
      });
    }

    setTimeout(() => {
      setNotification(null);
    }, 5000);
  };

  return (
    <section className={`${isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'} py-8 px-4 border-b transition-colors duration-300`}>
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-xl border border-emerald-500/20">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className={`text-xl md:text-2xl font-extrabold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {t.verificationTitle}
              </h3>
              <p className={`text-xs md:text-sm mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                {t.verificationSub}
              </p>
            </div>
          </div>
        </div>

        {notification && (
          <div
            className={`mb-6 p-4 rounded-2xl border flex items-center justify-between text-xs font-semibold animate-in fade-in duration-200 ${
              notification.type === 'success'
                ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/40'
                : 'bg-red-500/10 text-red-600 border-red-500/40'
            }`}
          >
            <div className="flex items-center gap-2">
              {notification.type === 'success' ? (
                <CheckCircle className="w-5 h-5 text-emerald-500" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-red-500 animate-bounce" />
              )}
              <span>{notification.message}</span>
            </div>
            {notification.type === 'success' && (
              <span className={`flex items-center gap-1 text-amber-500 font-bold px-2.5 py-1 rounded-lg border ${isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-300 shadow-sm'}`}>
                <Award className="w-4 h-4" /> +50 Civic Score
              </span>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="space-y-3">
            <h4 className={`text-xs font-bold uppercase tracking-wider mb-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Select Ticket Needing Citizen Audit ({filteredTickets.length})
            </h4>

            {filteredTickets.map((ticket) => {
              const isSelected = ticket.id === (currentTicket?.id || '');
              return (
                <div
                  key={ticket.id}
                  onClick={() => setActiveTicketId(ticket.id)}
                  className={`p-4 rounded-2xl border transition cursor-pointer ${
                    isSelected
                      ? isDark
                        ? 'bg-slate-900 border-emerald-500 shadow-lg shadow-emerald-500/10 ring-1 ring-emerald-500/50'
                        : 'bg-white border-emerald-500 shadow-md ring-2 ring-emerald-500/30'
                      : isDark
                        ? 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                        : 'bg-white border-slate-200 hover:border-slate-300 shadow-sm'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-mono mb-1">
                    <span className="text-emerald-500 font-bold">{ticket.ticketNumber}</span>
                    <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>{ticket.submittedDate}</span>
                  </div>

                  <h5 className={`text-sm font-bold line-clamp-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    {language === 'mr' ? ticket.titleMr : ticket.title}
                  </h5>

                  <p className={`text-xs flex items-center gap-1 mt-1 truncate ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    <MapPin className="w-3 h-3 text-emerald-500" />
                    {ticket.ward} • {ticket.location}
                  </p>

                  <div className="mt-3 flex items-center justify-between text-[11px]">
                    <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-500 font-medium border border-amber-500/20">
                      Audit Pending
                    </span>
                    <span className={isDark ? 'text-slate-400 font-medium' : 'text-slate-600 font-medium'}>
                      👍 {ticket.citizenVotesConfirmed} Confirmed
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {currentTicket ? (
            <div className={`border rounded-3xl p-6 space-y-6 shadow-xl ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
              <div className="flex flex-wrap justify-between items-start border-b border-slate-700/50 pb-4 gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-emerald-500 font-bold bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                      {currentTicket.ticketNumber}
                    </span>
                    <span className={`text-xs font-semibold uppercase ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      {currentTicket.hazardType}
                    </span>
                  </div>
                  <h4 className={`text-lg md:text-xl font-extrabold mt-1.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    {language === 'mr' ? currentTicket.titleMr : currentTicket.title}
                  </h4>
                  <p className={`text-xs flex items-center gap-1 mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    <MapPin className="w-3.5 h-3.5 text-emerald-500" />
                    {currentTicket.location} ({currentTicket.ward} Ward)
                  </p>
                </div>

                <div className="text-right text-xs space-y-1">
                  <div className="flex items-center gap-1 justify-end">
                    <User className="w-3.5 h-3.5 text-blue-500" />
                    <span className={`font-semibold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{currentTicket.assignedEngineer}</span>
                  </div>
                  <div className={`flex items-center gap-1 justify-end ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    <Building className="w-3.5 h-3.5 text-amber-500" />
                    <span>Contractor: {currentTicket.contractorAgency}</span>
                  </div>
                </div>
              </div>

              <div>
                <label className={`text-xs font-bold uppercase tracking-wider mb-3 block ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Official NMC Resolution Lifecycle Flow
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-[11px]">
                  <div className="bg-emerald-500/10 border border-emerald-500/40 text-emerald-500 p-2 rounded-xl font-semibold">
                    ✓ 1. Submitted
                  </div>
                  <div className="bg-emerald-500/10 border border-emerald-500/40 text-emerald-500 p-2 rounded-xl font-semibold">
                    ✓ 2. Assigned
                  </div>
                  <div className="bg-emerald-500/10 border border-emerald-500/40 text-emerald-500 p-2 rounded-xl font-semibold">
                    ✓ 3. In Progress
                  </div>
                  <div className="bg-emerald-500/10 border border-emerald-500/40 text-emerald-500 p-2 rounded-xl font-semibold">
                    ✓ 4. Evidence Uploaded
                  </div>
                  <div className="bg-amber-500/20 border border-amber-500/50 text-amber-600 p-2 rounded-xl font-bold animate-pulse">
                    ⏳ 5. Citizen Verification
                  </div>
                </div>
              </div>

              <div>
                <label className={`text-xs font-bold uppercase tracking-wider mb-3 flex items-center gap-1.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  <Eye className="w-4 h-4 text-emerald-500" />
                  Side-by-Side Verification Evidence (Geotag & Timestamp Audited)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <div className="text-xs font-semibold text-red-500 flex items-center justify-between">
                      <span>{t.beforeRepair}</span>
                      <span className="font-mono text-[10px] text-slate-400">{currentTicket.submittedDate}</span>
                    </div>
                    <div className="relative h-44 rounded-2xl overflow-hidden border border-slate-700 group">
                      <img
                        src={currentTicket.beforePhoto}
                        alt="Before Repair"
                        className="w-full h-full object-cover transition duration-300 group-hover:scale-105"
                      />
                      <div className="absolute top-2 left-2 bg-red-600 text-white font-bold text-[10px] px-2 py-0.5 rounded">
                        BEFORE
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="text-xs font-semibold text-emerald-500 flex items-center justify-between">
                      <span>{t.afterRepair}</span>
                      <span className="font-mono text-[10px] text-slate-400">10 Aug 2026</span>
                    </div>
                    <div className="relative h-44 rounded-2xl overflow-hidden border border-emerald-500/50 group shadow-lg">
                      <img
                        src={currentTicket.afterPhoto || currentTicket.beforePhoto}
                        alt="After Repair"
                        className="w-full h-full object-cover transition duration-300 group-hover:scale-105"
                      />
                      <div className="absolute top-2 left-2 bg-emerald-600 text-white font-bold text-[10px] px-2 py-0.5 rounded">
                        AFTER (Geotag Verified)
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-700/50">
                {!isOriginalReporter ? (
                  <div className="mb-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold flex items-center gap-2">
                    <Lock className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>
                      <strong>Reporter Authorization Lock:</strong> Only <strong>{currentTicket.reporterName || 'the original citizen reporter'}</strong> who logged this defect can audit and close this ticket.
                      {!currentUser && ' Please sign in with your reporter account.'}
                    </span>
                  </div>
                ) : (
                  <p className={`text-xs font-semibold mb-3 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    ✓ <strong>Original Reporter Verified:</strong> You filed this complaint. Please verify if the contractor properly resolved this defect at the site:
                  </p>
                )}

                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => handleVote('confirm')}
                    disabled={!isOriginalReporter}
                    className={`flex-1 min-w-[200px] py-3 px-4 rounded-2xl font-bold text-xs md:text-sm flex items-center justify-center gap-2 transition transform active:scale-95 shadow-lg ${
                      !isOriginalReporter
                        ? 'bg-slate-800 text-slate-500 cursor-not-allowed opacity-60 border border-slate-700'
                        : currentTicket.userVerificationState === 'confirmed'
                        ? 'bg-emerald-600 text-white border-2 border-emerald-400'
                        : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white'
                    }`}
                  >
                    <CheckCircle className="w-5 h-5" />
                    <span>{t.confirmFixed} ({currentTicket.citizenVotesConfirmed})</span>
                  </button>

                  <button
                    onClick={() => handleVote('reopen')}
                    disabled={!isOriginalReporter}
                    className={`flex-1 min-w-[200px] py-3 px-4 rounded-2xl font-bold text-xs md:text-sm flex items-center justify-center gap-2 transition transform active:scale-95 shadow-lg ${
                      !isOriginalReporter
                        ? 'bg-slate-800 text-slate-500 cursor-not-allowed opacity-60 border border-slate-700'
                        : currentTicket.userVerificationState === 'reopened'
                        ? 'bg-red-600 text-white border-2 border-red-400'
                        : 'bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white'
                    }`}
                  >
                    <XCircle className="w-5 h-5" />
                    <span>{t.reopenEscalate} ({currentTicket.citizenVotesReopened})</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className={`lg:col-span-2 border rounded-3xl p-8 flex items-center justify-center text-slate-500 text-sm ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
              No tickets requiring verification in this ward.
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
