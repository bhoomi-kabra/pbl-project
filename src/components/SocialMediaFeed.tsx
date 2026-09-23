import React, { useState } from 'react';
import { CivicTicket, WardName, Language, ThemeMode } from '../types';
import { translations } from '../data/translations';
import { MessageSquare, MapPin, CheckCircle2, AlertTriangle, PlusCircle, Send, Flame, ShieldCheck, ThumbsUp } from 'lucide-react';

interface SocialMediaFeedProps {
  tickets: CivicTicket[];
  language: Language;
  theme?: ThemeMode;
  selectedWard: WardName;
  onOpenReportModal: () => void;
  onPlusOneVote?: (ticketId: string) => void;
  onAddComment?: (ticketId: string, commentText: string) => void;
}

export const SocialMediaFeed: React.FC<SocialMediaFeedProps> = ({
  tickets,
  language,
  selectedWard,
  onOpenReportModal,
  onPlusOneVote,
  onAddComment,
}) => {
  const t = translations[language];

  const [commentInputs, setCommentInputs] = useState<{ [ticketId: string]: string }>({});

  // 15-Day Vanishing Filter: Hide resolved complaints older than 15 days
  const activeFeedTickets = tickets.filter((tk) => {
    // Ward filter
    if (selectedWard !== 'All Wards' && tk.ward !== selectedWard) return false;
    
    // Auto-vanishing check: If ticket is closed and remaining days <= 0, filter out
    if ((tk.status === 'CLOSED_VERIFIED' || tk.status === 'EVIDENCE_UPLOADED') && tk.autoVanishDaysLeft !== undefined) {
      if (tk.autoVanishDaysLeft <= 0) return false;
    }
    return true;
  });

  const handlePlusOneClick = (ticketId: string) => {
    if (onPlusOneVote) onPlusOneVote(ticketId);
  };

  const handleAddCommentClick = (ticketId: string) => {
    const text = commentInputs[ticketId];
    if (!text || !text.trim()) return;

    if (onAddComment) {
      onAddComment(ticketId, text.trim());
    }

    setCommentInputs((prev) => ({ ...prev, [ticketId]: '' }));
  };

  return (
    <section className="py-6 px-3 sm:px-4 bg-slate-50 border-b border-slate-200">
      <div className="max-w-3xl mx-auto space-y-5">
        
        {/* Banner Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white shadow-md flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                  {language === 'mr' ? 'नागरिक तक्रार फिड' : 'Nashik Citizens Grievance Feed'}
                </h2>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Live citizen-reported problems in {selectedWard === 'All Wards' ? 'Nashik City' : `${selectedWard} Ward`}
              </p>
            </div>
          </div>

          <button
            onClick={onOpenReportModal}
            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold px-4 py-2.5 rounded-xl shadow-md shadow-emerald-600/20 flex items-center gap-2 transition transform active:scale-95 shrink-0 self-start sm:self-auto"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ Report Grievance</span>
          </button>
        </div>

        {/* Social Feed List */}
        <div className="space-y-4">
          {activeFeedTickets.length === 0 ? (
            <div className="p-10 text-center rounded-3xl border border-slate-200 bg-white text-slate-600 shadow-sm space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-extrabold text-slate-800">No Complaints Found in {selectedWard}</p>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  There are currently no active complaints registered. Click below to submit the first road grievance!
                </p>
              </div>
              <button
                onClick={onOpenReportModal}
                className="mt-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-sm inline-flex items-center gap-2 transition"
              >
                <PlusCircle className="w-4 h-4" /> Report Grievance
              </button>
            </div>
          ) : (
            activeFeedTickets.map((ticket) => {
              const isResolved = ticket.status === 'CLOSED_VERIFIED' || ticket.status === 'EVIDENCE_UPLOADED';
              const isHighRisk = (ticket.impactScore || 0) > 80;

              return (
                <article 
                  key={ticket.id} 
                  className="p-5 rounded-3xl border border-slate-200 bg-white text-slate-900 shadow-sm transition hover:shadow-md space-y-3"
                >
                  {/* Top Author Info */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs border border-emerald-200 shadow-sm shrink-0">
                        {ticket.ward.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5 flex-wrap">
                          <span>{ticket.reporterName || `Citizen Reporter (${ticket.ward})`}</span>
                          <span className="text-[10px] bg-slate-100 text-slate-700 font-mono px-2 py-0.5 rounded-lg border border-slate-200 flex items-center gap-0.5">
                            <MapPin className="w-3 h-3 text-emerald-600" /> {ticket.ward}
                          </span>
                        </h4>
                        <p className="text-[11px] text-slate-400 font-medium">
                          Ticket {ticket.ticketNumber} • {ticket.submittedDate}
                        </p>
                      </div>
                    </div>

                    {/* Status & Priority Badge */}
                    <div className="flex items-center gap-2">
                      {isHighRisk && (
                        <span className="text-[10px] font-extrabold text-rose-800 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200 flex items-center gap-1">
                          <Flame className="w-3.5 h-3.5 text-rose-600" /> HIGH IMPACT ({ticket.plusOneCount || 0} Upvotes)
                        </span>
                      )}

                      {isResolved ? (
                        <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 flex items-center gap-1">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Resolved (Audit Active)</span>
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                          {ticket.status}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Complaint Title & Location */}
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900 leading-snug">
                      {language === 'mr' ? ticket.titleMr : ticket.title}
                    </h3>
                    <p className="text-xs text-slate-600 font-medium mt-0.5 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-emerald-600" /> {ticket.location}
                    </p>
                  </div>

                  {/* Photo Attachment Display */}
                  {ticket.beforePhoto && (
                    <div className="rounded-2xl overflow-hidden border border-slate-200 relative group max-h-80 shadow-sm">
                      <img 
                        src={ticket.beforePhoto} 
                        alt="Complaint Photo" 
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2.5 left-2.5 bg-slate-900/80 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/20 text-[10px] font-mono font-bold text-white flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-emerald-400" /> Geotagged Evidence
                      </div>
                    </div>
                  )}

                  {/* Resolution Proof Photo Display (If resolved) */}
                  {ticket.afterPhoto && (
                    <div className="rounded-2xl overflow-hidden border border-emerald-300 relative group max-h-80 shadow-sm">
                      <img 
                        src={ticket.afterPhoto} 
                        alt="Resolution Proof" 
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2.5 left-2.5 bg-emerald-900/90 backdrop-blur-md px-2.5 py-1 rounded-lg border border-emerald-400 text-[10px] font-mono font-bold text-emerald-200 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Official Municipal Repair Proof
                      </div>
                    </div>
                  )}

                  {/* Action Bar (+1 Vote, Comments, Department) */}
                  <div className="pt-3 border-t border-slate-200 flex flex-wrap items-center justify-between text-xs gap-2">
                    <div className="flex items-center gap-2">
                      {/* +1 Impact Button */}
                      <button
                        onClick={() => handlePlusOneClick(ticket.id)}
                        className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-extrabold text-xs border border-rose-200 transition active:scale-95"
                        title="Click +1 if you are also facing this civic problem!"
                      >
                        <ThumbsUp className="w-3.5 h-3.5 text-rose-600" />
                        <span>+1 I Also Face This ({ticket.plusOneCount || 0})</span>
                      </button>

                      <span className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-slate-500">
                        <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
                        <span>{ticket.comments ? ticket.comments.length : 0} Comments</span>
                      </span>
                    </div>

                    <span className="text-[11px] font-mono font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-200">
                      Dept: {ticket.department || 'PWD_ROADS'}
                    </span>
                  </div>

                  {/* Citizen Comments List */}
                  {ticket.comments && ticket.comments.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-slate-100 space-y-2 text-xs bg-slate-50 p-3 rounded-2xl">
                      {ticket.comments.map((cm: any) => (
                        <div key={cm.id || Math.random()} className="flex items-start gap-2">
                          <span className="font-bold text-emerald-700 text-[11px] shrink-0">
                            {cm.userName || cm.author || 'Citizen'}:
                          </span>
                          <p className="text-[11px] text-slate-700 font-medium">{cm.text}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add Comment Input */}
                  <div className="mt-2 flex items-center gap-2">
                    <input
                      type="text"
                      value={commentInputs[ticket.id] || ''}
                      onChange={(e) => setCommentInputs({ ...commentInputs, [ticket.id]: e.target.value })}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddCommentClick(ticket.id)}
                      placeholder="Add a citizen comment or testimony..."
                      className="w-full text-xs rounded-xl px-3.5 py-2 bg-slate-50 border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500"
                    />
                    <button
                      onClick={() => handleAddCommentClick(ticket.id)}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white p-2 rounded-xl transition shrink-0 shadow-sm"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </article>
              );
            })
          )}
        </div>

      </div>
    </section>
  );
};
