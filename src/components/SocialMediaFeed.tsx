import React, { useState } from 'react';
import { CivicTicket, WardName, Language, ThemeMode } from '../types';
import { translations } from '../data/translations';
import { Heart, MessageSquare, Share2, Sparkles, MapPin, CheckCircle2, AlertTriangle, PlusCircle, Image as ImageIcon, Send, Flame, Clock, ShieldCheck, Film } from 'lucide-react';

interface SocialMediaFeedProps {
  tickets: CivicTicket[];
  language: Language;
  theme: ThemeMode;
  selectedWard: WardName;
  onOpenReportModal: () => void;
  onPlusOneVote?: (ticketId: string) => void;
  onAddComment?: (ticketId: string, commentText: string) => void;
}

export const SocialMediaFeed: React.FC<SocialMediaFeedProps> = ({
  tickets,
  language,
  theme,
  selectedWard,
  onOpenReportModal,
  onPlusOneVote,
  onAddComment,
}) => {
  const isDark = theme === 'dark';
  const t = translations[language];

  const [commentInputs, setCommentInputs] = useState<{ [ticketId: string]: string }>({});
  const [newPostText, setNewPostText] = useState('');

  // 15-Day Vanishing Logic Filter: Hide resolved complaints older than 15 days
  const activeFeedTickets = tickets.filter((tk) => {
    // Ward filter
    if (selectedWard !== 'All Wards' && tk.ward !== selectedWard) return false;
    
    // Auto-vanishing check: If ticket is closed and remaining days <= 0, filter out!
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
    <section className={`py-6 px-3 sm:px-4 border-b transition-colors duration-300 ${isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
      <div className="max-w-3xl mx-auto space-y-5">
        
        {/* Banner Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-pink-500 via-rose-500 to-purple-600 p-0.5 shadow-lg flex items-center justify-center shrink-0">
              <div className={`w-full h-full rounded-[14px] flex items-center justify-center ${isDark ? 'bg-slate-950 text-pink-400' : 'bg-white text-pink-600'}`}>
                <Sparkles className="w-5 h-5 animate-pulse" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className={`text-lg sm:text-xl font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {language === 'mr' ? 'नागरिक सोशल मीडिया फिड' : 'Nashik Citizens Social Civic Feed'}
                </h2>
              </div>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                Live complaints feed in {selectedWard === 'All Wards' ? 'Nashik City' : selectedWard}
              </p>
            </div>
          </div>

          <button
            onClick={onOpenReportModal}
            className="bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl shadow-lg flex items-center gap-1.5 transition transform active:scale-95 shrink-0 self-start sm:self-auto"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ Report Complaint</span>
          </button>
        </div>

        {/* Social Feed List */}
        <div className="space-y-4">
          {activeFeedTickets.length === 0 ? (
            <div className={`p-8 text-center rounded-2xl border ${isDark ? 'bg-slate-900/60 border-slate-800 text-slate-400' : 'bg-white border-slate-200 text-slate-500'}`}>
              <p className="text-xs font-semibold">No active complaints found in this ward.</p>
            </div>
          ) : (
            activeFeedTickets.map((ticket) => {
              const isResolved = ticket.status === 'CLOSED_VERIFIED' || ticket.status === 'EVIDENCE_UPLOADED';
              const isHighRisk = (ticket.impactScore || 0) > 80;

              return (
                <article 
                  key={ticket.id} 
                  className={`p-4 sm:p-5 rounded-3xl border transition-all ${
                    isDark ? 'bg-slate-900/90 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900 shadow-sm'
                  }`}
                >
                  {/* Top Author Info */}
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-pink-500 to-rose-600 text-white flex items-center justify-center font-bold text-xs shadow shrink-0">
                        {ticket.ward.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold flex items-center gap-1.5 flex-wrap">
                          <span>{ticket.reporterName || `Resident (${ticket.ward})`}</span>
                          <span className="text-[10px] bg-pink-500/10 text-pink-400 font-mono px-2 py-0.5 rounded border border-pink-500/20 flex items-center gap-0.5">
                            <MapPin className="w-3 h-3" /> {ticket.ward}
                          </span>
                        </h4>
                        <p className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                          Ticket {ticket.ticketNumber} • {ticket.submittedDate}
                        </p>
                      </div>
                    </div>

                    {/* High Risk / 15-Day Vanishing Badge */}
                    <div className="flex items-center gap-2">
                      {isHighRisk && (
                        <span className="text-[10px] font-black text-red-500 bg-red-500/10 px-2.5 py-1 rounded-full border border-red-500/20 flex items-center gap-1 animate-pulse">
                          <Flame className="w-3.5 h-3.5" /> HIGH RISK ({ticket.plusOneCount || 0} +1 Votes)
                        </span>
                      )}

                      {isResolved && (
                        <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20 flex items-center gap-1">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Resolved ({ticket.autoVanishDaysLeft ?? 14} days left)</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Complaint Title & Location */}
                  <h3 className={`text-sm font-extrabold mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    {language === 'mr' ? ticket.titleMr : ticket.title}
                  </h3>
                  <p className={`text-xs mb-3 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    📍 {ticket.location}
                  </p>

                  {/* Photo Attachment Display */}
                  {ticket.beforePhoto && (
                    <div className="rounded-2xl overflow-hidden mb-3 border border-slate-800/60 relative group max-h-72">
                      <img 
                        src={ticket.beforePhoto} 
                        alt="Complaint Photo" 
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      />
                      <div className="absolute top-2.5 left-2.5 bg-slate-950/80 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/20 text-[10px] font-mono font-bold text-white flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-pink-400" /> Geotagged Proof
                      </div>
                    </div>
                  )}

                  {/* Resolution Proof Photo Display (If resolved) */}
                  {ticket.afterPhoto && (
                    <div className="rounded-2xl overflow-hidden mb-3 border border-emerald-500/40 relative group max-h-72">
                      <img 
                        src={ticket.afterPhoto} 
                        alt="Resolution Proof" 
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2.5 left-2.5 bg-emerald-950/90 backdrop-blur-md px-2.5 py-1 rounded-lg border border-emerald-500/40 text-[10px] font-mono font-bold text-emerald-300 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Official Municipal Repair Proof
                      </div>
                    </div>
                  )}

                  {/* Action Bar (+1 Vote, Comments, Share) */}
                  <div className={`pt-3 border-t flex flex-wrap items-center justify-between text-xs gap-2 ${
                    isDark ? 'border-slate-800 text-slate-400' : 'border-slate-200 text-slate-600'
                  }`}>
                    <div className="flex items-center gap-2">
                      {/* +1 Impact Button */}
                      <button
                        onClick={() => handlePlusOneClick(ticket.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-red-600 to-amber-600 text-white font-extrabold text-xs shadow-md shadow-red-500/20 hover:scale-105 transition transform active:scale-95 border border-red-400/30"
                        title="Click +1 if you also face this civic problem!"
                      >
                        <Flame className="w-3.5 h-3.5 fill-white" />
                        <span>+1 I Also Face This ({ticket.plusOneCount || 0})</span>
                      </button>

                      <span className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold">
                        <MessageSquare className="w-3.5 h-3.5 text-indigo-400" />
                        <span>{ticket.comments ? ticket.comments.length : 0} Comments</span>
                      </span>
                    </div>

                    <span className="text-[11px] font-mono font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                      Dept: {ticket.department || 'PWD_ROADS'}
                    </span>
                  </div>

                  {/* Citizens Comments List */}
                  {ticket.comments && ticket.comments.length > 0 && (
                    <div className={`mt-3 pt-3 border-t space-y-2 text-xs ${
                      isDark ? 'border-slate-800/70 bg-slate-950/40 p-3 rounded-2xl' : 'border-slate-200 bg-slate-50 p-3 rounded-2xl'
                    }`}>
                      {ticket.comments.map((cm: any) => (
                        <div key={cm.id || Math.random()} className="flex items-start gap-2">
                          <span className="font-bold text-pink-400 text-[11px] shrink-0">{cm.userName || cm.author || 'Citizen'}:</span>
                          <p className={`text-[11px] ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{cm.text}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add Comment Box */}
                  <div className="mt-3 flex items-center gap-2">
                    <input
                      type="text"
                      value={commentInputs[ticket.id] || ''}
                      onChange={(e) => setCommentInputs({ ...commentInputs, [ticket.id]: e.target.value })}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddCommentClick(ticket.id)}
                      placeholder="Write a comment (e.g., Yes, I am also facing the same problem)..."
                      className={`w-full text-xs rounded-xl px-3 py-2 border focus:outline-none focus:ring-1 focus:ring-pink-500 ${
                        isDark ? 'bg-slate-950 text-white border-slate-800' : 'bg-slate-50 text-slate-900 border-slate-300'
                      }`}
                    />
                    <button
                      onClick={() => handleAddCommentClick(ticket.id)}
                      className="bg-pink-600 hover:bg-pink-500 text-white p-2 rounded-xl transition shrink-0"
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
