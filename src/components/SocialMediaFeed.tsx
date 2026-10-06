import React, { useState } from 'react';
import { CivicTicket, WardName, Language, ThemeMode } from '../types';
import { translations } from '../data/translations';
import { 
  MessageSquare, MapPin, CheckCircle2, AlertTriangle, PlusCircle, Send, 
  Flame, ShieldCheck, ThumbsUp, Share2, Copy, Flag, ShieldAlert, Sparkles, 
  Check, ExternalLink, HelpCircle
} from 'lucide-react';

interface SocialMediaFeedProps {
  tickets: CivicTicket[];
  language: Language;
  theme?: ThemeMode;
  selectedWard: WardName;
  onOpenReportModal: () => void;
  onPlusOneVote?: (ticketId: string) => void;
  onAddComment?: (ticketId: string, commentText: string) => void;
  onFlagFalse?: (ticketId: string, reason: string) => void;
}

export const SocialMediaFeed: React.FC<SocialMediaFeedProps> = ({
  tickets,
  language,
  selectedWard,
  onOpenReportModal,
  onPlusOneVote,
  onAddComment,
  onFlagFalse,
}) => {
  const t = translations[language];

  const [feedFilter, setFeedFilter] = useState<'ALL' | 'TRENDING' | 'RESOLVED' | 'FLAGGED'>('ALL');
  const [commentInputs, setCommentInputs] = useState<{ [ticketId: string]: string }>({});
  const [copiedTicketId, setCopiedTicketId] = useState<string | null>(null);
  const [flaggingTicket, setFlaggingTicket] = useState<CivicTicket | null>(null);
  const [flagReason, setFlagReason] = useState<string>('DUPLICATE_REPORT');
  const [showShareModal, setShowShareModal] = useState<CivicTicket | null>(null);

  // 15-Day Vanishing Filter & Category Filtering
  const activeFeedTickets = tickets.filter((tk) => {
    // Ward filter
    if (selectedWard !== 'All Wards' && tk.ward !== selectedWard) return false;
    
    // Auto-vanishing check
    if ((tk.status === 'CLOSED_VERIFIED' || tk.status === 'EVIDENCE_UPLOADED') && tk.autoVanishDaysLeft !== undefined) {
      if (tk.autoVanishDaysLeft <= 0) return false;
    }

    // Category Tabs Filter
    if (feedFilter === 'TRENDING') {
      return (tk.plusOneCount || 0) >= 1;
    } else if (feedFilter === 'RESOLVED') {
      return tk.status === 'CLOSED_VERIFIED' || tk.status === 'EVIDENCE_UPLOADED';
    } else if (feedFilter === 'FLAGGED') {
      return (tk.falseReportFlags || 0) > 0 || tk.isSuspectedFalse;
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

  // Real WhatsApp Sharing
  const handleShareWhatsApp = (ticket: CivicTicket) => {
    const text = encodeURIComponent(
      `🚨 *Nashik Civic Road Alert*\n` +
      `📌 *Issue:* ${ticket.title}\n` +
      `📍 *Location:* ${ticket.location} (${ticket.ward} Ward)\n` +
      `🎫 *Ticket:* ${ticket.ticketNumber}\n` +
      `⚠️ *Status:* ${ticket.status}\n\n` +
      `👉 View, verify, or vote +1 on the NMC Civic Accountability Portal:\n` +
      `http://localhost:5173/?ticket=${ticket.ticketNumber}`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  // Real Twitter / X Sharing
  const handleShareTwitter = (ticket: CivicTicket) => {
    const text = encodeURIComponent(
      `🚨 Civic hazard reported in @NMC_Nashik ${ticket.ward} Ward: "${ticket.title}" at ${ticket.location}. Ticket: ${ticket.ticketNumber}. Citizens please verify! #NashikRoads #CivicAccountability`
    );
    window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank');
  };

  // Copy Direct Link
  const handleCopyLink = (ticket: CivicTicket) => {
    const link = `http://localhost:5173/?ticket=${ticket.ticketNumber}`;
    navigator.clipboard.writeText(link);
    setCopiedTicketId(ticket.id);
    setTimeout(() => setCopiedTicketId(null), 2500);
  };

  // Submit Flag as False Report
  const handleSubmitFlag = () => {
    if (!flaggingTicket) return;
    if (onFlagFalse) {
      onFlagFalse(flaggingTicket.id, flagReason);
    }
    setFlaggingTicket(null);
  };

  return (
    <section className="py-6 px-3 sm:px-4 bg-slate-50 border-b border-slate-200">
      <div className="max-w-3xl mx-auto space-y-5">
        
        {/* Banner Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-600 text-white shadow-md flex items-center justify-center shrink-0">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                  {language === 'mr' ? 'नागरिक सोशल मिडिया तक्रार फिड' : 'Citizen Social Media & Grievance Feed'}
                </h2>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Live citizen posts, WhatsApp/Twitter alerts & anti-fraud verification in {selectedWard === 'All Wards' ? 'Nashik City' : `${selectedWard} Ward`}
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

        {/* Anti-Fraud / False Report Precautions Notice Callout */}
        <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-extrabold text-emerald-900 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              NMC Anti-Fraud & False Report Precaution Protocol Active
            </span>
            <span className="text-[10px] font-bold bg-emerald-200/70 text-emerald-900 px-2 py-0.5 rounded-full">
              4-Tier Integrity Check
            </span>
          </div>
          <p className="text-slate-600 leading-relaxed text-[11px]">
            To ensure zero false alarms: Every submission undergoes <strong>GPS Geotag cross-checking</strong> against official ward boundaries, <strong>AI hazard pattern analysis</strong>, and <strong>Community Peer Review</strong>. Citizens can flag suspicious reports using the <Flag className="w-3 h-3 text-red-600 inline" /> button.
          </p>
        </div>

        {/* Social Feed Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-bold scrollbar-none">
          <button
            onClick={() => setFeedFilter('ALL')}
            className={`px-3.5 py-1.5 rounded-xl transition shrink-0 ${
              feedFilter === 'ALL'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
            }`}
          >
            All Reports ({tickets.length})
          </button>
          <button
            onClick={() => setFeedFilter('TRENDING')}
            className={`px-3.5 py-1.5 rounded-xl transition flex items-center gap-1 shrink-0 ${
              feedFilter === 'TRENDING'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-rose-500" /> Trending / High Upvotes
          </button>
          <button
            onClick={() => setFeedFilter('RESOLVED')}
            className={`px-3.5 py-1.5 rounded-xl transition flex items-center gap-1 shrink-0 ${
              feedFilter === 'RESOLVED'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Resolved with Proof
          </button>
          <button
            onClick={() => setFeedFilter('FLAGGED')}
            className={`px-3.5 py-1.5 rounded-xl transition flex items-center gap-1 shrink-0 ${
              feedFilter === 'FLAGGED'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Flag className="w-3.5 h-3.5 text-amber-500" /> Flagged for Review
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
                  There are currently no active complaints matching this category. Click below to submit a road grievance!
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
              const hasFlags = (ticket.falseReportFlags || 0) > 0 || ticket.isSuspectedFalse;

              return (
                <article 
                  key={ticket.id} 
                  className="p-5 rounded-3xl border border-slate-200 bg-white text-slate-900 shadow-sm transition hover:shadow-md space-y-3.5"
                >
                  {/* Suspected False Report Alert Banner (Precaution) */}
                  {hasFlags && (
                    <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-2.5 text-xs text-rose-900">
                      <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <span className="font-extrabold block">
                          ⚠️ Community Alert: Flagged as Suspected False or Duplicate ({ticket.falseReportFlags || 1} Flags)
                        </span>
                        <p className="text-[11px] text-rose-700 mt-0.5">
                          Citizens have reported this hazard as inaccurate, duplicate, or non-existent. Marked for priority physical verification by the Ward Officer before repair dispatch.
                        </p>
                      </div>
                    </div>
                  )}

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
                    <div className="rounded-2xl overflow-hidden border border-slate-200 relative group max-h-80 shadow-sm bg-slate-900">
                      <img 
                        src={ticket.beforePhoto} 
                        alt="Complaint Photo" 
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2.5 left-2.5 bg-slate-900/85 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/20 text-[10px] font-mono font-bold text-white flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-emerald-400" />
                        <span>GPS Geotagged: {ticket.coordinates ? `${ticket.coordinates[0].toFixed(4)}°N, ${ticket.coordinates[1].toFixed(4)}°E` : 'Nashik'}</span>
                      </div>
                      <div className="absolute bottom-2.5 right-2.5 bg-emerald-950/80 backdrop-blur-md px-2 py-0.5 rounded-lg border border-emerald-400/40 text-[10px] font-bold text-emerald-300 flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-emerald-400" /> AI Confidence {ticket.aiConfidence || 95}%
                      </div>
                    </div>
                  )}

                  {/* Resolution Proof Photo Display (If resolved) */}
                  {ticket.afterPhoto && (
                    <div className="rounded-2xl overflow-hidden border border-emerald-300 relative group max-h-80 shadow-sm bg-emerald-950">
                      <img 
                        src={ticket.afterPhoto} 
                        alt="Resolution Proof" 
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2.5 left-2.5 bg-emerald-900/90 backdrop-blur-md px-2.5 py-1 rounded-lg border border-emerald-400 text-[10px] font-mono font-bold text-emerald-200 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Official Municipal Repair Proof Attached
                      </div>
                    </div>
                  )}

                  {/* REAL SOCIAL MEDIA SHARE BAR */}
                  <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs">
                    <span className="font-bold text-slate-600 flex items-center gap-1 text-[11px]">
                      <Share2 className="w-3.5 h-3.5 text-emerald-600" /> Share on Social Media:
                    </span>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {/* WhatsApp Button */}
                      <button
                        onClick={() => handleShareWhatsApp(ticket)}
                        className="px-2.5 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-[11px] flex items-center gap-1 transition shadow-sm"
                        title="Share on WhatsApp with neighborhood groups"
                      >
                        💬 WhatsApp
                      </button>

                      {/* Twitter / X Button */}
                      <button
                        onClick={() => handleShareTwitter(ticket)}
                        className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-black text-white font-bold text-[11px] flex items-center gap-1 transition shadow-sm"
                        title="Tag @NMC_Nashik on Twitter / X"
                      >
                        𝕏 Twitter / X
                      </button>

                      {/* Copy Link Button */}
                      <button
                        onClick={() => handleCopyLink(ticket)}
                        className="px-2.5 py-1 rounded-lg bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-[11px] flex items-center gap-1 transition shadow-sm"
                        title="Copy direct shareable link"
                      >
                        {copiedTicketId === ticket.id ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-600" />
                            <span className="text-emerald-700">Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3 text-slate-500" />
                            <span>Copy Link</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Citizen Action Bar (+1 Vote, Comments, Flag as False Report) */}
                  <div className="pt-2 border-t border-slate-200 flex flex-wrap items-center justify-between text-xs gap-2">
                    <div className="flex items-center gap-2">
                      {/* +1 Impact Button */}
                      <button
                        onClick={() => handlePlusOneClick(ticket.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-extrabold text-xs border border-rose-200 transition active:scale-95"
                        title="Click +1 if you are also facing this civic problem!"
                      >
                        <ThumbsUp className="w-3.5 h-3.5 text-rose-600" />
                        <span>+1 I Face This ({ticket.plusOneCount || 0})</span>
                      </button>

                      <span className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-slate-500">
                        <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
                        <span>{ticket.comments ? ticket.comments.length : 0} Comments</span>
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Flag as False / Fake Report Button (PRECAUTION) */}
                      <button
                        onClick={() => setFlaggingTicket(ticket)}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[11px] font-bold text-slate-500 hover:text-red-700 hover:bg-red-50 border border-transparent hover:border-red-200 transition"
                        title="Report this complaint as fake, duplicate, or already repaired"
                      >
                        <Flag className="w-3.5 h-3.5 text-slate-400 group-hover:text-red-500" />
                        <span>Flag as False Report</span>
                      </button>

                      <span className="text-[11px] font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-1 rounded-lg border border-indigo-200">
                        {ticket.department || 'PWD_ROADS'}
                      </span>
                    </div>
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

        {/* Flag As False Report Modal (Anti-Fraud Precaution) */}
        {flaggingTicket && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center gap-3 border-b border-slate-200 pb-3">
                <div className="p-2.5 rounded-2xl bg-rose-100 text-rose-700">
                  <Flag className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">Flag as False / Misleading Report</h3>
                  <p className="text-xs text-slate-500">Ticket: {flaggingTicket.ticketNumber}</p>
                </div>
              </div>

              <p className="text-xs text-slate-600">
                Please specify why this complaint is inaccurate. False complaints will be removed after municipal verification.
              </p>

              <div className="space-y-2 text-xs">
                {[
                  { value: 'DUPLICATE_REPORT', label: 'Duplicate report of another active grievance' },
                  { value: 'FAKE_STAGED_PHOTO', label: 'Fake, staged, or downloaded photo evidence' },
                  { value: 'ALREADY_REPAIRED', label: 'Already repaired / No road hazard exists here' },
                  { value: 'WRONG_LOCATION', label: 'Wrong location / Ward boundary mismatch' },
                ].map((opt) => (
                  <label 
                    key={opt.value} 
                    className={`flex items-center gap-2.5 p-3 rounded-xl border cursor-pointer transition ${
                      flagReason === opt.value ? 'bg-rose-50 border-rose-300 text-rose-900 font-bold' : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="flagReason"
                      value={opt.value}
                      checked={flagReason === opt.value}
                      onChange={(e) => setFlagReason(e.target.value)}
                      className="text-rose-600 focus:ring-rose-500"
                    />
                    <span>{opt.label}</span>
                  </label>
                ))}
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setFlaggingTicket(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSubmitFlag}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-sm transition"
                >
                  Submit False Report Flag
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </section>
  );
};
