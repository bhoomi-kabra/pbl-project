'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/AppContext';
import { Ticket, HazardCategory, Ward, TicketStatus } from '@/lib/types';
import { 
  Search, 
  SlidersHorizontal, 
  ChevronDown, 
  Activity, 
  ThumbsUp, 
  MessageSquare, 
  Share2, 
  Maximize2, 
  ImageOff, 
  Check, 
  Plus, 
  ArrowLeft, 
  Send, 
  AlertCircle, 
  Clock, 
  MapPin, 
  ChevronRight,
  MoreHorizontal,
  CheckCircle2,
  Copy,
  Link2,
  Flag,
  X,
  ChevronUp
} from 'lucide-react';

interface SocialFeedProps {
  tickets: Ticket[];
  onUpvote: (ticketId: string) => Promise<void>;
  onInspect: (ticketId: string) => void;
  onNavigateToMap?: () => void;
}

interface CommentItem {
  id: string;
  userName: string;
  text: string;
  createdAt: string;
}

const CATEGORIES: { id: HazardCategory | 'ALL'; label: string; tag: string }[] = [
  { id: 'ALL', label: 'All Categories', tag: 'ALL' },
  { id: 'POTHOLE', label: 'Potholes', tag: 'ROADS' },
  { id: 'OPEN_MANHOLE', label: 'Open Manholes', tag: 'DRAINAGE' },
  { id: 'ROAD_CAVE_IN', label: 'Road Cave-Ins', tag: 'SURFACE' },
  { id: 'ELECTRICAL_WIRE', label: 'Electrical Wires', tag: 'POWER' },
  { id: 'WATER_LOGGING', label: 'Water Logging', tag: 'DRAINAGE' },
  { id: 'GARBAGE_DUMP', label: 'Garbage Dump', tag: 'SANITATION' },
  { id: 'WATER_LEAKAGE', label: 'Water Leakage', tag: 'WATER' },
  { id: 'DRAINAGE_OVERFLOW', label: 'Drainage Overflow', tag: 'DRAINAGE' },
  { id: 'STREETLIGHT_DEFECT', label: 'Streetlights', tag: 'POWER' }
];

export default function SocialFeed({ tickets, onUpvote, onInspect, onNavigateToMap }: SocialFeedProps) {
  const { language, currentUser, setIsComplaintModalOpen } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterTab, setFilterTab] = useState<'ALL' | 'PENDING'>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<HazardCategory | 'ALL'>('ALL');
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [selectedTicketForDetails, setSelectedTicketForDetails] = useState<Ticket | null>(null);

  // Upvote state
  const [upvotedMap, setUpvotedMap] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Local comments state
  const [commentsMap, setCommentsMap] = useState<Record<string, CommentItem[]>>({
    'tkt-figma-01': [],
    'tkt-figma-02': [
      { id: 'c1', userName: 'Aniket Shinde', text: 'Water collected here after yesterday evening rain. Two-wheelers skidding.', createdAt: '1h ago' }
    ],
    'tkt-1791305696228': [],
    'tkt-1791291717551': [
      { id: 'c2', userName: 'Mahesh Patil', text: 'Near Vidhate Nagar turn, please fix before school bus rush.', createdAt: '3h ago' }
    ]
  });
  const [commentInput, setCommentInput] = useState('');

  // Report Options Bottom Sheet Drawer (Figma Screen 9)
  const [ticketForOptions, setTicketForOptions] = useState<Ticket | null>(null);
  const [falseReportAccordionOpen, setFalseReportAccordionOpen] = useState(true);
  const [concernReason, setConcernReason] = useState('');
  const [concernSubmitted, setConcernSubmitted] = useState(false);

  const handleOpenOptions = (e: React.MouseEvent, ticket: Ticket) => {
    e.stopPropagation();
    setTicketForOptions(ticket);
    setConcernReason('');
    setConcernSubmitted(false);
  };

  const handleUpvote = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (upvotedMap[id]) return;
    setUpvotedMap(prev => ({ ...prev, [id]: true }));
    await onUpvote(id);
  };

  const handleShare = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(`${window.location.origin}/?ticket=${id}`);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const handleAddComment = (ticketId: string) => {
    if (!commentInput.trim()) return;
    const newComment: CommentItem = {
      id: `c_${Date.now()}`,
      userName: currentUser?.name || 'Nashik Resident',
      text: commentInput.trim(),
      createdAt: 'Just now'
    };
    setCommentsMap(prev => ({
      ...prev,
      [ticketId]: [...(prev[ticketId] || []), newComment]
    }));
    setCommentInput('');
  };

  // Filtered tickets
  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = 
      ticket.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.locationName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.citizenName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = 
      filterTab === 'ALL' || 
      (filterTab === 'PENDING' && (ticket.status === 'VERIFICATION_PENDING' || ticket.status === 'SUBMITTED'));

    const matchesCategory = 
      selectedCategory === 'ALL' || ticket.category === selectedCategory;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  // ────────────────────────────────────────────────────────────
  // REPORT OPTIONS BOTTOM SHEET DRAWER (Screen 9 in Figma)
  // ────────────────────────────────────────────────────────────
  const renderReportOptionsDrawer = () => {
    if (!ticketForOptions) return null;

    return (
      <div 
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4"
        onClick={() => setTicketForOptions(null)}
      >
        <div 
          className="w-full max-w-md bg-white dark:bg-[#0c1322] rounded-t-3xl sm:rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-5 sm:p-6 space-y-4 max-h-[92vh] overflow-y-auto animate-in slide-in-from-bottom-6 duration-200"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Top Drag Indicator */}
          <div className="w-12 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700 mx-auto -mt-1 mb-1 sm:hidden" />

          {/* Header */}
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-[20px] font-black text-[#111d2e] dark:text-slate-100 tracking-tight leading-snug">
                Report options
              </h3>
              <p className="text-[12px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                {ticketForOptions.citizenName} · {ticketForOptions.title}
              </p>
            </div>
            <button
              onClick={() => setTicketForOptions(null)}
              className="p-1 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Action List Items */}
          <div className="space-y-1 pt-1">
            {/* Share report */}
            <button
              onClick={(e) => handleShare(e, ticketForOptions.id)}
              className="w-full flex items-center gap-3.5 py-3 px-3.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/60 text-left font-bold text-slate-800 dark:text-slate-200 transition"
            >
              <Share2 className="w-5 h-5 text-slate-700 dark:text-slate-300 shrink-0" />
              <span className="text-[14px]">Share report</span>
            </button>

            {/* Copy link */}
            <button
              onClick={(e) => handleCopyLink(e, ticketForOptions.id)}
              className="w-full flex items-center gap-3.5 py-3 px-3.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/60 text-left font-bold text-slate-800 dark:text-slate-200 transition"
            >
              <Link2 className="w-5 h-5 text-slate-700 dark:text-slate-300 shrink-0" />
              <span className="text-[14px]">
                {copiedId === ticketForOptions.id ? 'Copied link to clipboard!' : 'Copy link'}
              </span>
            </button>

            {/* Inspect report & evidence */}
            <button
              onClick={() => {
                onInspect(ticketForOptions.id);
                setTicketForOptions(null);
              }}
              className="w-full flex items-center justify-between py-3 px-3.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/60 text-left font-bold text-slate-800 dark:text-slate-200 transition"
            >
              <div className="flex items-center gap-3.5">
                <Maximize2 className="w-5 h-5 text-slate-700 dark:text-slate-300 shrink-0" />
                <span className="text-[14px]">Inspect report & evidence</span>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-400" />
            </button>
          </div>

          {/* Flag as false report (Expandable Peach Card) */}
          <div className="rounded-2xl bg-[#fef2ea] dark:bg-slate-900/90 border border-[#fae8dc] dark:border-slate-800 p-4 space-y-3">
            <button
              type="button"
              onClick={() => setFalseReportAccordionOpen(!falseReportAccordionOpen)}
              className="w-full flex items-center justify-between text-left"
            >
              <div className="flex items-center gap-2.5 text-[#d95b18] font-bold text-[14px]">
                <Flag className="w-4 h-4 text-[#d95b18]" />
                <span>Flag as false report</span>
              </div>
              {falseReportAccordionOpen ? (
                <ChevronUp className="w-4 h-4 text-[#d95b18]" />
              ) : (
                <ChevronDown className="w-4 h-4 text-[#d95b18]" />
              )}
            </button>

            {falseReportAccordionOpen && (
              <div className="space-y-3 pt-1 text-[12px] animate-in fade-in-50 duration-150">
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  Flag suspicious content—not a new civic issue. A concern prompts review; it does not prove the report is false.
                </p>

                {concernSubmitted ? (
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-emerald-800 dark:text-emerald-300 text-xs font-semibold">
                    ✓ Concern sent for municipal review. NMC will inspect the report evidence.
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="block text-[12px] font-bold text-slate-700 dark:text-slate-300">
                        Reason for concern *
                      </label>
                      <select
                        value={concernReason}
                        onChange={(e) => setConcernReason(e.target.value)}
                        className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#d95b18]"
                      >
                        <option value="">Choose a reason</option>
                        <option value="duplicate">Duplicate report</option>
                        <option value="inaccurate_location">Inaccurate location</option>
                        <option value="spam_photo">Irrelevant or misleading photo</option>
                        <option value="abusive">Abusive or disrespectful language</option>
                        <option value="other">Other civic rule concern</option>
                      </select>
                    </div>

                    <button
                      type="button"
                      disabled={!concernReason}
                      onClick={() => {
                        setConcernSubmitted(true);
                        setTimeout(() => {
                          setTicketForOptions(null);
                        }, 1600);
                      }}
                      className="w-full py-2.5 rounded-xl bg-slate-200/90 dark:bg-slate-800 hover:bg-[#d95b18] hover:text-white text-slate-700 dark:text-slate-200 font-bold text-xs transition disabled:opacity-50 disabled:pointer-events-none"
                    >
                      Send concern for review
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

        </div>
      </div>
    );
  };

  // ────────────────────────────────────────────────────────────
  // SINGLE REPORT DETAILS VIEW (Screen 3 in Figma)
  // ────────────────────────────────────────────────────────────
  if (selectedTicketForDetails) {
    const ticket = selectedTicketForDetails;
    const isUpvoted = upvotedMap[ticket.id];
    const comments = commentsMap[ticket.id] || [];

    return (
      <div className="w-full max-w-xl sm:max-w-2xl mx-auto bg-white dark:bg-[#0c1322] rounded-none sm:rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden space-y-4 pb-12 transition-colors">
        
        {/* Top Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <button
            onClick={() => setSelectedTicketForDetails(null)}
            className="flex items-center gap-2 text-[15px] font-bold text-[#111d2e] dark:text-slate-100 hover:text-[#d95b18] transition"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>{language === 'mr' ? 'अहवाल तपशील' : 'Report details'}</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="text-[12px] font-bold text-slate-500">EN / म</span>
          </div>
        </div>

        {/* Report Content */}
        <div className="p-4 sm:p-6 space-y-4">
          
          {/* Author info */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#fef2ea] border border-[#fae8dc] text-[#d95b18] font-bold text-sm flex items-center justify-center">
                {ticket.citizenName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
              </div>
              <div>
                <div className="text-[14px] font-bold text-[#111d2e] dark:text-slate-100">
                  {ticket.citizenName}
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  {ticket.ward} ward · Citizen report
                </div>
              </div>
            </div>

            <button 
              onClick={(e) => handleOpenOptions(e, ticket)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
            >
              <MoreHorizontal className="w-5 h-5" />
            </button>
          </div>

          {/* Category & Status */}
          <div className="flex items-center justify-between pt-1">
            <span className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              {ticket.category === 'POTHOLE' ? 'ROADS' : ticket.category === 'OPEN_MANHOLE' ? 'DRAINAGE' : ticket.category}
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#fef2ea] text-[#d95b18] border border-[#fae8dc]">
              {ticket.status === 'VERIFICATION_PENDING' ? 'Pending Review' : ticket.status}
            </span>
          </div>

          {/* Title & Location */}
          <div className="space-y-1">
            <h1 className="text-[20px] sm:text-[22px] font-black text-[#111d2e] dark:text-slate-100 leading-snug">
              {ticket.title}
            </h1>
            <p className="text-[13px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>{ticket.locationName}</span>
            </p>
          </div>

          {/* Evidence Container (Exact Figma styling) */}
          <div className="rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 text-center space-y-3">
            {ticket.beforeImageUrl && !ticket.beforeImageUrl.includes('placeholder') ? (
              <div className="space-y-3">
                <img
                  src={ticket.beforeImageUrl}
                  alt={ticket.title}
                  className="w-full rounded-xl max-h-72 object-cover mx-auto"
                />
                <p className="text-[12px] text-slate-500 dark:text-slate-400">
                  {ticket.description}
                </p>
              </div>
            ) : (
              <div className="space-y-2 py-4">
                <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
                  <ImageOff className="w-6 h-6" />
                </div>
                <h4 className="text-[15px] font-bold text-[#111d2e] dark:text-slate-100">
                  Submitted photo doesn't match
                </h4>
                <p className="text-[12px] text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                  The source image shows preliminary context. Inspect before supporting.
                </p>
                <div className="text-[10px] font-black text-amber-700 dark:text-amber-400 uppercase tracking-wider pt-1">
                  EVIDENCE MISMATCH · NOT VERIFIED
                </div>
              </div>
            )}
          </div>

          {/* Actions strip */}
          <div className="flex items-center justify-between py-2 border-y border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400">
            <button
              onClick={(e) => handleUpvote(e, ticket.id)}
              className={`flex items-center gap-1.5 font-bold transition ${
                isUpvoted ? 'text-[#d95b18]' : 'hover:text-[#d95b18]'
              }`}
            >
              <ThumbsUp className={`w-4 h-4 ${isUpvoted ? 'fill-[#d95b18]' : ''}`} />
              <span>{ticket.upvotes + (isUpvoted ? 1 : 0)} support</span>
            </button>

            <div className="flex items-center gap-1">
              <MessageSquare className="w-4 h-4" />
              <span>{comments.length} comments</span>
            </div>

            <button 
              onClick={(e) => handleShare(e, ticket.id)}
              className="hover:text-[#d95b18] transition flex items-center gap-1"
            >
              {copiedId === ticket.id ? <Check className="w-4 h-4 text-emerald-500" /> : <Share2 className="w-4 h-4" />}
            </button>
          </div>

          {/* Inspect report & evidence Card (Figma Screen 3) */}
          <div
            onClick={() => onInspect(ticket.id)}
            className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between cursor-pointer hover:border-[#d95b18]/50 transition group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[#111d2e] dark:text-slate-100">
                <Maximize2 className="w-4 h-4" />
              </div>
              <span className="text-[14px] font-bold text-[#111d2e] dark:text-slate-100 group-hover:text-[#d95b18] transition-colors">
                Inspect report & evidence
              </span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
          </div>

          {/* Review needed card */}
          <div className="p-4 rounded-2xl bg-[#fdf5f0] dark:bg-slate-900/60 border border-[#fae8dc] dark:border-slate-800 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-[#d95b18] shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <div className="text-[13px] font-bold text-[#111d2e] dark:text-slate-100">
                Review needed
              </div>
              <div className="text-[12px] text-[#556377] dark:text-slate-400">
                Ensure contractor repairs match municipal standards before casting your verification vote.
              </div>
            </div>
          </div>

          {/* Comments Section */}
          <div className="space-y-3 pt-3">
            <div className="flex items-center justify-between">
              <h3 className="text-[15px] font-black text-[#111d2e] dark:text-slate-100">
                Comments
              </h3>
              <span className="text-xs text-slate-400 font-bold">{comments.length}</span>
            </div>

            {comments.length === 0 ? (
              <p className="text-[12px] text-slate-500 dark:text-slate-400 leading-relaxed">
                No comments yet. Add useful location details or ask a question. Keep it respectful.
              </p>
            ) : (
              <div className="space-y-2">
                {comments.map((c) => (
                  <div key={c.id} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-xs space-y-1">
                    <div className="flex items-center justify-between font-bold text-[#111d2e] dark:text-slate-200">
                      <span>{c.userName}</span>
                      <span className="text-[10px] text-slate-400 font-normal">{c.createdAt}</span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-300">{c.text}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Comment Input */}
            <div className="flex items-center gap-2 pt-2">
              <input
                type="text"
                value={commentInput}
                onChange={(e) => setCommentInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddComment(ticket.id)}
                placeholder="Add a comment..."
                className="flex-1 py-2.5 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-[#d95b18]"
              />
              <button
                onClick={() => handleAddComment(ticket.id)}
                className="p-2.5 rounded-xl bg-[#d95b18] hover:bg-[#c24e12] text-white transition shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>

        {renderReportOptionsDrawer()}
      </div>
    );
  }

  // ────────────────────────────────────────────────────────────
  // MAIN CIVIC FEED STREAM (Screens 1 & 2 in Figma)
  // ────────────────────────────────────────────────────────────
  return (
    <div className="w-full max-w-xl sm:max-w-2xl mx-auto bg-white dark:bg-[#0c1322] rounded-none sm:rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden p-5 sm:p-7 space-y-5 transition-colors">
      
      {/* 1. Header Title: "Nashik, together." */}
      <div className="flex items-center justify-between">
        <h1 className="text-[28px] sm:text-[34px] font-black text-[#111d2e] dark:text-slate-100 tracking-tight leading-none">
          {language === 'mr' ? 'एकत्रित नाशिक.' : 'Nashik, together.'}
        </h1>

        <button 
          onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
          className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          aria-label="Filter"
        >
          <SlidersHorizontal className="w-5 h-5 stroke-[2.2]" />
        </button>
      </div>

      {/* 2. Search input */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={language === 'mr' ? 'समस्या, रस्ते किंवा ठिकाण शोधा' : 'Search issues, streets or landmarks'}
          className="w-full pl-10 pr-4 py-2.5 rounded-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[13px] text-[#111d2e] dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-[#d95b18] transition"
        />
      </div>

      {/* 3. Filter Chips Row */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {/* All reports */}
        <button
          onClick={() => {
            setFilterTab('ALL');
            setSelectedCategory('ALL');
          }}
          className={`px-4 py-1.5 rounded-full text-xs font-bold transition whitespace-nowrap ${
            filterTab === 'ALL' && selectedCategory === 'ALL'
              ? 'bg-[#111d2e] text-white dark:bg-slate-100 dark:text-slate-900'
              : 'bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300'
          }`}
        >
          {language === 'mr' ? 'सर्व अहवाल' : 'All reports'}
        </button>

        {/* Pending */}
        <button
          onClick={() => setFilterTab('PENDING')}
          className={`px-4 py-1.5 rounded-full text-xs font-bold transition whitespace-nowrap ${
            filterTab === 'PENDING'
              ? 'bg-[#111d2e] text-white dark:bg-slate-100 dark:text-slate-900'
              : 'bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300'
          }`}
        >
          {language === 'mr' ? 'प्रलंबित' : 'Pending'}
        </button>

        {/* Category Dropdown Pill */}
        <div className="relative">
          <button
            onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
            className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 flex items-center gap-1 whitespace-nowrap"
          >
            <span>{selectedCategory === 'ALL' ? 'Category' : selectedCategory}</span>
            <ChevronDown className="w-3.5 h-3.5" />
          </button>

          {isCategoryDropdownOpen && (
            <div className="absolute left-0 mt-2 w-48 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl py-1 z-20">
              {CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => {
                    setSelectedCategory(cat.id);
                    setIsCategoryDropdownOpen(false);
                  }}
                  className={`w-full px-3.5 py-2 text-left text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition ${
                    selectedCategory === cat.id ? 'text-[#d95b18] font-bold' : 'text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>


      {/* 5. Feed Items Stream */}
      <div className="space-y-4 pt-1">
        {filteredTickets.length === 0 ? (
          <div className="py-12 text-center text-slate-400 space-y-2">
            <CheckCircle2 className="w-8 h-8 mx-auto text-slate-300" />
            <p className="text-sm font-semibold">No complaints found for this filter.</p>
          </div>
        ) : (
          filteredTickets.map((ticket) => {
            const isUpvoted = upvotedMap[ticket.id];
            const comments = commentsMap[ticket.id] || [];

            return (
              <div
                key={ticket.id}
                onClick={() => setSelectedTicketForDetails(ticket)}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs hover:border-[#d95b18]/40 transition cursor-pointer space-y-3.5 group"
              >
                {/* Author row */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full bg-[#fef2ea] border border-[#fae8dc] text-[#d95b18] font-bold text-xs flex items-center justify-center">
                      {ticket.citizenName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="text-[13px] font-bold text-[#111d2e] dark:text-slate-100">
                        {ticket.citizenName}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">
                        {ticket.ward} ward · Citizen report
                      </div>
                    </div>
                  </div>

                  <button 
                    onClick={(e) => handleOpenOptions(e, ticket)}
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                </div>

                {/* Category & Status Badges */}
                <div className="flex items-center justify-between pt-0.5">
                  <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    {ticket.category === 'POTHOLE' ? 'ROADS' : ticket.category === 'OPEN_MANHOLE' ? 'DRAINAGE' : ticket.category}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#fef2ea] text-[#d95b18] border border-[#fae8dc]">
                    Pending Review
                  </span>
                </div>

                {/* Title & Location */}
                <div className="space-y-0.5">
                  <h3 className="text-[16px] font-bold text-[#111d2e] dark:text-slate-100 leading-snug group-hover:text-[#d95b18] transition-colors">
                    {ticket.title}
                  </h3>
                  <p className="text-[12px] text-slate-500 dark:text-slate-400">
                    {ticket.locationName}
                  </p>
                </div>

                {/* Evidence Card (Exact Figma look) */}
                <div className="rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 p-4 text-center space-y-2">
                  {ticket.beforeImageUrl && !ticket.beforeImageUrl.includes('placeholder') ? (
                    <div className="space-y-2">
                      <img
                        src={ticket.beforeImageUrl}
                        alt={ticket.title}
                        className="w-full max-h-48 object-cover rounded-lg"
                      />
                      <p className="text-[11px] text-slate-500 line-clamp-2">
                        {ticket.description}
                      </p>
                    </div>
                  ) : ticket.id.includes('figma-01') ? (
                    <div className="space-y-1.5 py-2">
                      <ImageOff className="w-5 h-5 mx-auto text-slate-400" />
                      <div className="text-[13px] font-bold text-[#111d2e] dark:text-slate-200">
                        Submitted photo doesn't match
                      </div>
                      <p className="text-[11px] text-slate-500 max-w-xs mx-auto leading-relaxed">
                        The source image shows preliminary context. Inspect before supporting.
                      </p>
                      <div className="text-[9px] font-black text-amber-700 uppercase tracking-wider">
                        EVIDENCE MISMATCH · NOT VERIFIED
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-1.5 py-2">
                      <ImageOff className="w-5 h-5 mx-auto text-slate-400" />
                      <div className="text-[13px] font-bold text-[#111d2e] dark:text-slate-200">
                        Evidence photo unavailable
                      </div>
                      <p className="text-[11px] text-slate-500 max-w-xs mx-auto leading-relaxed">
                        The original photo is not available here. No replacement proof has been added.
                      </p>
                      <div className="text-[9px] font-black text-slate-500 uppercase tracking-wider">
                        NO SUBMITTED PROOF DISPLAYED
                      </div>
                    </div>
                  )}
                </div>

                {/* Bottom Action Footer (Exact Figma Screen 1) */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
                  <button
                    onClick={(e) => handleUpvote(e, ticket.id)}
                    className={`flex items-center gap-1.5 font-bold transition ${
                      isUpvoted ? 'text-[#d95b18]' : 'hover:text-[#d95b18]'
                    }`}
                  >
                    <ThumbsUp className={`w-4 h-4 ${isUpvoted ? 'fill-[#d95b18]' : ''}`} />
                    <span>{ticket.upvotes + (isUpvoted ? 1 : 0)} support</span>
                  </button>

                  <div className="flex items-center gap-1.5">
                    <MessageSquare className="w-4 h-4" />
                    <span>{comments.length} comments</span>
                  </div>

                  <button
                    onClick={(e) => handleShare(e, ticket.id)}
                    className="p-1 hover:text-[#d95b18] transition"
                    title="Share report"
                  >
                    {copiedId === ticket.id ? <Check className="w-4 h-4 text-emerald-500" /> : <Share2 className="w-4 h-4" />}
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onInspect(ticket.id);
                    }}
                    className="p-1 hover:text-[#d95b18] transition"
                    title="Inspect verification"
                  >
                    <Maximize2 className="w-4 h-4" />
                  </button>
                </div>

              </div>
            );
          })
        )}
      </div>

      {/* 6. End of Feed Checkmark & CTA (Figma Screen 2) */}
      <div className="pt-6 pb-2 text-center space-y-3 border-t border-slate-100 dark:border-slate-800">
        <div className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 text-[#111d2e] dark:text-slate-100 flex items-center justify-center mx-auto">
          <Check className="w-4 h-4 stroke-[2.5]" />
        </div>

        <div className="space-y-1">
          <h4 className="text-[16px] font-bold text-[#111d2e] dark:text-slate-100">
            {language === 'mr' ? 'तुम्ही सर्व अहवाल पाहिले आहेत.' : `You've seen the ${filteredTickets.length} reports.`}
          </h4>
          <p className="text-[12px] text-slate-500 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
            {language === 'mr'
              ? 'तुमच्या परिसरात काही दुरुस्ती हवी आहे? केशरी तक्रार बटण नेहमी उपलब्ध आहे.'
              : 'Noticed something in your neighbourhood? The orange Report button is always within reach.'}
          </p>
        </div>

        <div className="pt-1">
          <button
            onClick={() => setIsComplaintModalOpen(true)}
            className="inline-flex items-center gap-1.5 py-2.5 px-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-[#111d2e] dark:text-slate-100 font-bold text-xs hover:bg-slate-50 dark:hover:bg-slate-800 transition shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>{language === 'mr' ? 'नागरी अहवाल तयार करा' : 'Create a civic report'}</span>
          </button>
        </div>
      </div>

      {renderReportOptionsDrawer()}
    </div>
  );
}
