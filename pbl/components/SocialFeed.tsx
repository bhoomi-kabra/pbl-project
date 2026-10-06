'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/AppContext';
import { Ticket, HazardCategory, Ward, TicketStatus } from '@/lib/types';
import { 
  Flame, 
  MapPin, 
  ThumbsUp, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  ArrowRight,
  Filter, 
  CheckCircle, 
  Search, 
  LayoutGrid, 
  List,
  Sparkles,
  Camera,
  X,
  User,
  Share2,
  Copy,
  Check,
  Flag,
  MessageSquare,
  ExternalLink,
  Send,
  ShieldCheck,
  ShieldAlert,
  Smartphone,
  Eye,
  PlusCircle
} from 'lucide-react';

interface SocialFeedProps {
  tickets: Ticket[];
  onUpvote: (ticketId: string) => Promise<void>;
  onInspect: (ticketId: string) => void;
}

interface CitizenComment {
  id: string;
  userName: string;
  text: string;
  createdAt: string;
}

const CATEGORY_CHIPS: { id: string; label: string; icon: string }[] = [
  { id: 'All', label: 'All Hazards', icon: '📍' },
  { id: 'TRENDING', label: '🔥 Trending', icon: '🔥' },
  { id: 'POTHOLE', label: 'Potholes', icon: '🪨' },
  { id: 'ROAD_CAVE_IN', label: 'Cave-Ins', icon: '🕳️' },
  { id: 'OPEN_MANHOLE', label: 'Open Manholes', icon: '🚷' },
  { id: 'ELECTRICAL_WIRE', label: 'Dangling Wires', icon: '⚡' },
  { id: 'WATER_LOGGING', label: 'Water Logging', icon: '🌊' },
  { id: 'GARBAGE_DUMP', label: 'Garbage Dumps', icon: '🗑️' },
  { id: 'WATER_LEAKAGE', label: 'Water Leakages', icon: '💧' },
  { id: 'DRAINAGE_OVERFLOW', label: 'Drainage Overflow', icon: '🚰' },
  { id: 'STREETLIGHT_DEFECT', label: 'Streetlights', icon: '💡' },
];

export default function SocialFeed({ tickets, onUpvote, onInspect }: SocialFeedProps) {
  const { t, language, currentUser, selectedWard, setSelectedWard, setIsComplaintModalOpen } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [feedFilterTab, setFeedFilterTab] = useState<'ALL' | 'TRENDING' | 'RESOLVED' | 'FLAGGED'>('ALL');
  const [upvotedMap, setUpvotedMap] = useState<Record<string, boolean>>({});
  const [viewStyle, setViewStyle] = useState<'FEED' | 'GRID' | 'TABLE'>('FEED');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Local comments store
  const [commentsMap, setCommentsMap] = useState<Record<string, CitizenComment[]>>({
    'tk-001': [
      { id: 'c1', userName: 'Rajesh Patil (Dwarka)', text: 'Facing this daily during morning school rush. Two bikers slipped yesterday!', createdAt: '2h ago' },
      { id: 'c2', userName: 'Sneha Deshmukh', text: 'Contractor dumped gravel but left it unrolled. Please expedite concrete cure.', createdAt: '45m ago' }
    ],
    'tk-002': [
      { id: 'c3', userName: 'Ganesh Shinde (College Rd)', text: 'Dangerous cave-in right outside the coffee shop. Barricading needed urgently.', createdAt: '1h ago' }
    ],
    'tk-004': [
      { id: 'c4', userName: 'Amit Kulkarni (Dwarka)', text: 'High risk of short circuit in rain. MSEDCL helpline 1912 informed as well.', createdAt: '3h ago' }
    ]
  });
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});

  // Flagging system state
  const [flaggingTicket, setFlaggingTicket] = useState<Ticket | null>(null);
  const [flagReason, setFlagReason] = useState<string>('DUPLICATE_REPORT');
  const [flaggedTicketsMap, setFlaggedTicketsMap] = useState<Record<string, { flagged: boolean; reason: string }>>({});

  const handleUpvoteClick = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (upvotedMap[id]) return;
    setUpvotedMap((prev) => ({ ...prev, [id]: true }));
    await onUpvote(id);
  };

  const handleAddComment = (ticketId: string) => {
    const text = commentInputs[ticketId]?.trim();
    if (!text) return;

    const newComment: CitizenComment = {
      id: `c-${Date.now()}`,
      userName: currentUser?.name || 'Nashik Citizen',
      text,
      createdAt: 'Just now'
    };

    setCommentsMap((prev) => ({
      ...prev,
      [ticketId]: [...(prev[ticketId] || []), newComment]
    }));

    setCommentInputs((prev) => ({ ...prev, [ticketId]: '' }));
  };

  const handleShareWhatsApp = (e: React.MouseEvent, ticket: Ticket) => {
    e.stopPropagation();
    const text = encodeURIComponent(
      `🚨 *नाशिक नागरी तक्रार अलर्ट (NMC Civic Alert)*\n` +
      `📌 *समस्या:* ${ticket.title}\n` +
      `📍 *ठिकाण:* ${ticket.locationName} (${ticket.ward} प्रभाग)\n` +
      `🎫 *तक्रार आयडी:* ${ticket.id}\n` +
      `⚡ *गंभीरता:* ${ticket.impactScore} गुण | *स्थिती:* ${ticket.status}\n\n` +
      `👉 नाशिक महानगरपालिका पोर्टलवर पहा किंवा +1 पाठिंबा नोंदवा:\n` +
      `http://localhost:3000/?ticket=${ticket.id}`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const handleShareTwitter = (e: React.MouseEvent, ticket: Ticket) => {
    e.stopPropagation();
    const text = encodeURIComponent(
      `🚨 Civic hazard reported in @NMC_Nashik ${ticket.ward} Ward: "${ticket.title}" at ${ticket.locationName}. Ticket #${ticket.id}. Citizens please verify & upvote! #NashikRoads #CivicAccountability #NMC`
    );
    window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank');
  };

  const handleCopyLink = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const link = typeof window !== 'undefined' ? `${window.location.origin}/?ticket=${id}` : `http://localhost:3000/?ticket=${id}`;
    navigator.clipboard.writeText(link);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSubmitFlag = () => {
    if (!flaggingTicket) return;
    setFlaggedTicketsMap((prev) => ({
      ...prev,
      [flaggingTicket.id]: { flagged: true, reason: flagReason }
    }));
    setFlaggingTicket(null);
  };

  const filteredTickets = tickets.filter((ticket) => {
    if (selectedWard !== 'All' && ticket.ward !== selectedWard) return false;

    // Filter tab
    if (feedFilterTab === 'TRENDING') {
      if ((ticket.upvotes || 0) < 1 && (ticket.impactScore || 0) < 300) return false;
    } else if (feedFilterTab === 'RESOLVED') {
      if (ticket.status !== 'OFFICIALLY_CLOSED' && ticket.status !== 'RESOLVED_BY_CONTRACTOR') return false;
    } else if (feedFilterTab === 'FLAGGED') {
      if (!flaggedTicketsMap[ticket.id]) return false;
    }

    // Category chips
    if (categoryFilter === 'TRENDING') {
      if ((ticket.upvotes || 0) < 1 && (ticket.impactScore || 0) < 300) return false;
    } else if (categoryFilter !== 'All' && ticket.category !== categoryFilter) {
      return false;
    }

    if (statusFilter !== 'All' && ticket.status !== statusFilter) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = ticket.title.toLowerCase().includes(q);
      const matchDesc = ticket.description.toLowerCase().includes(q);
      const matchLoc = ticket.locationName.toLowerCase().includes(q);
      if (!matchTitle && !matchDesc && !matchLoc) return false;
    }
    return true;
  });

  const getStatusBadge = (ticket: Ticket) => {
    switch (ticket.status) {
      case 'OFFICIALLY_CLOSED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 backdrop-blur-md">
            <CheckCircle className="w-3 h-3" />
            Verified Closed
          </span>
        );
      case 'VERIFICATION_PENDING':
        const needed = Math.max(0, 3 - (ticket.confirmVotes || 0));
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30 backdrop-blur-md animate-pulse">
            <Clock className="w-3 h-3" />
            Verify Proof ({needed} needed)
          </span>
        );
      case 'REOPENED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/15 text-rose-700 dark:text-rose-400 border border-rose-500/30 backdrop-blur-md">
            <AlertTriangle className="w-3 h-3" />
            Citizen Reopened
          </span>
        );
      case 'IN_PROGRESS':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/15 text-blue-700 dark:text-blue-400 border border-blue-500/30 backdrop-blur-md">
            <Clock className="w-3 h-3" />
            Work In Progress
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
            Pending Review
          </span>
        );
    }
  };

  const getWardInitials = (ward: string) => {
    const parts = ward.split(' ');
    if (parts.length > 1) return (parts[0][0] + parts[1][0]).toUpperCase();
    return ward.substring(0, 2).toUpperCase();
  };

  return (
    <div className="space-y-5">
      
      {/* Top Header & Search Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-4 transition-colors">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-600 text-slate-950 shadow-md flex items-center justify-center shrink-0 font-black">
              <Share2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-black text-lg sm:text-xl text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <span>{language === 'mr' ? 'नागरिक सोशल मिडिया तक्रार फिड' : 'Citizen Social Media & Grievance Feed'}</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-400 font-extrabold border border-amber-500/30">
                  {filteredTickets.length} Posts
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {language === 'mr' 
                  ? 'इन्स्टाग्राम-शैली स्क्रोलिंग फिड, थेट नागरिक टिप्पण्या, व्हॉट्सअॅप शेअरिंग व ॲन्टी-फ्रॉड पडताळणी'
                  : 'Instagram-style scrolling feed, live citizen testimony, WhatsApp/X sharing & anti-fraud verification'}
              </p>
            </div>
          </div>

          {/* Quick Action Button */}
          <button
            onClick={() => setIsComplaintModalOpen(true)}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-slate-950 font-black text-xs shadow-md shadow-orange-500/20 transition transform active:scale-95 shrink-0 self-start sm:self-auto"
          >
            <Camera className="w-4 h-4" />
            <span>+ Report Grievance</span>
          </button>
        </div>

        {/* Anti-Fraud / False Report Precaution Callout Banner */}
        <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="font-extrabold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5 text-xs">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              NMC Anti-Fraud & False Report Precaution Protocol Active
            </span>
            <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-800 dark:text-emerald-200 px-2.5 py-0.5 rounded-full">
              4-Tier Integrity Check
            </span>
          </div>
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-[11px]">
            To ensure zero false alarms: Every submission undergoes <strong>GPS Geotag cross-checking</strong> against official ward boundaries, <strong>AI hazard pattern analysis</strong>, and <strong>Community Peer Review</strong>. Citizens can flag suspicious reports using the <Flag className="w-3 h-3 text-red-500 inline mx-0.5" /> button.
          </p>
        </div>

        {/* Search, Status & View Mode Row */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 pt-1">
          
          {/* Search Box */}
          <div className="relative flex-1 min-w-0">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by street name, defect, or landmark..."
              className="w-full pl-9 pr-8 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Status Dropdown */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200 font-semibold focus:outline-none cursor-pointer"
          >
            <option value="All">All Statuses</option>
            <option value="VERIFICATION_PENDING">⏳ Under Verification</option>
            <option value="REOPENED">⚠️ Citizen Reopened</option>
            <option value="IN_PROGRESS">🔧 Contractor Working</option>
            <option value="OFFICIALLY_CLOSED">✅ Verified Closed</option>
          </select>

          {/* View Mode Switcher: FEED (Instagram) vs GRID vs TABLE */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-slate-800 shrink-0 self-end sm:self-auto gap-0.5">
            <button
              onClick={() => setViewStyle('FEED')}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold transition ${
                viewStyle === 'FEED' 
                  ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-slate-950 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
              title="Instagram-Style Scrolling Feed"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Feed</span>
            </button>
            <button
              onClick={() => setViewStyle('GRID')}
              className={`p-1.5 rounded-lg transition ${
                viewStyle === 'GRID' 
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-sm' 
                  : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewStyle('TABLE')}
              className={`p-1.5 rounded-lg transition ${
                viewStyle === 'TABLE' 
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-sm' 
                  : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
              title="Audit Table View"
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Social Feed Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-bold scrollbar-none pt-1 border-t border-slate-100 dark:border-slate-800/80">
          <button
            onClick={() => setFeedFilterTab('ALL')}
            className={`px-3.5 py-1.5 rounded-xl transition shrink-0 ${
              feedFilterTab === 'ALL'
                ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            All Reports ({tickets.length})
          </button>
          <button
            onClick={() => setFeedFilterTab('TRENDING')}
            className={`px-3.5 py-1.5 rounded-xl transition flex items-center gap-1 shrink-0 ${
              feedFilterTab === 'TRENDING'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-rose-500" /> Trending / High Upvotes
          </button>
          <button
            onClick={() => setFeedFilterTab('RESOLVED')}
            className={`px-3.5 py-1.5 rounded-xl transition flex items-center gap-1 shrink-0 ${
              feedFilterTab === 'RESOLVED'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Resolved with Proof
          </button>
          <button
            onClick={() => setFeedFilterTab('FLAGGED')}
            className={`px-3.5 py-1.5 rounded-xl transition flex items-center gap-1 shrink-0 ${
              feedFilterTab === 'FLAGGED'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <Flag className="w-3.5 h-3.5 text-amber-500" /> Flagged for Review
          </button>
        </div>

        {/* Quick Category Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-0.5">
          {CATEGORY_CHIPS.map((chip) => {
            const isSelected = categoryFilter === chip.id;
            return (
              <button
                key={chip.id}
                onClick={() => setCategoryFilter(chip.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-slate-900 text-white dark:bg-amber-500 dark:text-slate-950 shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700/80'
                }`}
              >
                <span>{chip.icon}</span>
                <span>{chip.label}</span>
              </button>
            );
          })}
        </div>

      </div>

      {/* ======================================================== */}
      {/* 1. INSTAGRAM-STYLE SCROLLING FEED (DEFAULT)              */}
      {/* ======================================================== */}
      {viewStyle === 'FEED' && (
        <div className="max-w-2xl mx-auto space-y-6">
          {filteredTickets.length === 0 ? (
            <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto text-xl font-bold">
                🔍
              </div>
              <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-200">No Complaints Found in {selectedWard}</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                There are currently no active grievances matching your search in this ward. Click below to submit a live report!
              </p>
              <button
                onClick={() => setIsComplaintModalOpen(true)}
                className="mt-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-600 text-slate-950 font-extrabold text-xs rounded-xl shadow-sm inline-flex items-center gap-2"
              >
                <Camera className="w-4 h-4" /> Report Grievance
              </button>
            </div>
          ) : (
            filteredTickets.map((ticket) => {
              const isUpvoted = upvotedMap[ticket.id];
              const isHighImpact = (ticket.impactScore || 0) >= 300 || (ticket.upvotes || 0) >= 2;
              const isResolved = ticket.status === 'OFFICIALLY_CLOSED' || ticket.status === 'RESOLVED_BY_CONTRACTOR';
              const flagInfo = flaggedTicketsMap[ticket.id];
              const ticketComments = commentsMap[ticket.id] || [];

              return (
                <article
                  key={ticket.id}
                  className="rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:shadow-md transition duration-200 overflow-hidden space-y-4 p-5 sm:p-6"
                >
                  {/* Flagged Alert Banner (Precaution) */}
                  {flagInfo && (
                    <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-2xl flex items-start gap-2.5 text-xs text-rose-800 dark:text-rose-300">
                      <ShieldAlert className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <span className="font-black block">
                          ⚠️ Community Audit Notice: Flagged for Physical Inspection
                        </span>
                        <p className="text-[11px] text-rose-700 dark:text-rose-300 mt-0.5">
                          Citizens flagged this grievance ({flagInfo.reason.replace(/_/g, ' ')}). Ward Officer inspection scheduled before contractor disbursement.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Top Author & Ward Header (Instagram-style) */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-500 to-orange-600 text-slate-950 font-black text-xs flex items-center justify-center shadow-sm shrink-0 border border-amber-400/40">
                        {getWardInitials(ticket.ward)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-black text-slate-900 dark:text-slate-100">
                            {ticket.citizenName || `Citizen Reporter (${ticket.ward})`}
                          </span>
                          <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono px-2 py-0.5 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center gap-0.5">
                            <MapPin className="w-3 h-3 text-amber-500" /> {ticket.ward} Ward
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 font-medium">
                          Ticket #{ticket.id} • {new Date(ticket.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    {/* Status & Impact Badges */}
                    <div className="flex items-center gap-2">
                      {isHighImpact && (
                        <span className="text-[10px] font-black text-rose-700 dark:text-rose-300 bg-rose-500/10 px-2.5 py-1 rounded-full border border-rose-500/25 flex items-center gap-1">
                          <Flame className="w-3.5 h-3.5 text-rose-500" />
                          <span>HIGH IMPACT ({ticket.upvotes + (isUpvoted ? 1 : 0)})</span>
                        </span>
                      )}
                      {getStatusBadge(ticket)}
                    </div>
                  </div>

                  {/* Title & Location */}
                  <div>
                    <h3 
                      onClick={() => onInspect(ticket.id)}
                      className="text-base sm:text-lg font-black text-slate-900 dark:text-slate-100 leading-snug cursor-pointer hover:text-amber-600 dark:hover:text-amber-400 transition"
                    >
                      {ticket.title}
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-300 font-medium mt-1 leading-relaxed">
                      {ticket.description}
                    </p>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-semibold mt-2">
                      <MapPin className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      <span>{ticket.locationName}</span>
                    </div>
                  </div>

                  {/* Instagram-Style Large Media Image Container */}
                  <div className="rounded-2xl overflow-hidden border border-slate-200/90 dark:border-slate-800 relative group aspect-[16/10] sm:aspect-[16/9] shadow-sm bg-slate-950">
                    <img 
                      src={ticket.beforeImageUrl} 
                      alt={ticket.title}
                      className="w-full h-full object-cover group-hover:scale-102 transition duration-300 cursor-pointer"
                      onClick={() => onInspect(ticket.id)}
                    />
                    
                    {/* Top Floating GPS Geotag Badge */}
                    <div className="absolute top-3 left-3 bg-slate-950/85 backdrop-blur-md px-3 py-1 rounded-xl border border-white/20 text-[10px] font-mono font-bold text-white flex items-center gap-1.5 shadow-md">
                      <MapPin className="w-3.5 h-3.5 text-amber-400" />
                      <span>GPS Geotagged: {ticket.lat.toFixed(4)}°N, {ticket.lng.toFixed(4)}°E (Nashik)</span>
                    </div>

                    {/* Bottom Floating AI Confidence Badge */}
                    <div className="absolute bottom-3 right-3 bg-slate-950/85 backdrop-blur-md px-2.5 py-1 rounded-xl border border-amber-400/40 text-[10px] font-bold text-amber-300 flex items-center gap-1 shadow-md">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span>AI Confidence 96%</span>
                    </div>
                  </div>

                  {/* Resolution Proof Photo Display (If resolved) */}
                  {ticket.afterImageUrl && (
                    <div className="rounded-2xl overflow-hidden border border-emerald-500/40 relative group aspect-[16/9] shadow-sm bg-emerald-950">
                      <img 
                        src={ticket.afterImageUrl} 
                        alt="Resolution Proof" 
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-3 left-3 bg-emerald-900/90 backdrop-blur-md px-3 py-1 rounded-xl border border-emerald-400 text-[10px] font-mono font-bold text-emerald-200 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Official Municipal Repair Proof Attached</span>
                      </div>
                    </div>
                  )}

                  {/* Social Share Ribbon (WhatsApp / Twitter / Copy) */}
                  <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
                    <span className="font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1.5 text-[11px]">
                      <Share2 className="w-3.5 h-3.5 text-amber-500" />
                      <span>Share on Social Media:</span>
                    </span>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {/* WhatsApp Button */}
                      <button
                        onClick={(e) => handleShareWhatsApp(e, ticket)}
                        className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] flex items-center gap-1 transition shadow-xs"
                        title="Share on WhatsApp with neighborhood groups"
                      >
                        <span>💬 WhatsApp</span>
                      </button>

                      {/* Twitter / X Button */}
                      <button
                        onClick={(e) => handleShareTwitter(e, ticket)}
                        className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-black text-white dark:bg-slate-800 dark:hover:bg-slate-700 font-bold text-[11px] flex items-center gap-1 transition shadow-xs"
                        title="Tag @NMC_Nashik on Twitter / X"
                      >
                        <span>𝕏 Twitter / X</span>
                      </button>

                      {/* Copy Link Button */}
                      <button
                        onClick={(e) => handleCopyLink(e, ticket.id)}
                        className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-[11px] flex items-center gap-1 transition shadow-xs"
                        title="Copy direct shareable link"
                      >
                        {copiedId === ticket.id ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                            <span className="text-emerald-700 dark:text-emerald-400">Copied!</span>
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

                  {/* Citizen Interaction Bar (+1 Vote, Comments Count, Flag, Inspect) */}
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between text-xs gap-2">
                    <div className="flex items-center gap-2">
                      {/* +1 Impact Button */}
                      <button
                        onClick={(e) => handleUpvoteClick(e, ticket.id)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition transform active:scale-95 ${
                          isUpvoted
                            ? 'bg-amber-500 text-slate-950 shadow-xs'
                            : 'bg-rose-50 dark:bg-rose-500/10 hover:bg-rose-100 dark:hover:bg-rose-500/20 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-500/30'
                        }`}
                        title="Click +1 if you are also facing this civic problem!"
                      >
                        <ThumbsUp className={`w-3.5 h-3.5 ${isUpvoted ? 'fill-current' : 'text-rose-600 dark:text-rose-400'}`} />
                        <span>+1 I Face This ({ticket.upvotes + (isUpvoted ? 1 : 0)})</span>
                      </button>

                      <span className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-slate-500 dark:text-slate-400">
                        <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
                        <span>{ticketComments.length} Comments</span>
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Flag as False / Fake Report Button */}
                      <button
                        onClick={() => setFlaggingTicket(ticket)}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[11px] font-bold text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 border border-transparent hover:border-red-200 dark:hover:border-red-500/30 transition"
                        title="Report this complaint as fake, duplicate, or inaccurate"
                      >
                        <Flag className="w-3.5 h-3.5 text-slate-400 group-hover:text-red-500" />
                        <span>Flag as False Report</span>
                      </button>

                      {/* Inspect Proof Button */}
                      <button
                        onClick={() => onInspect(ticket.id)}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs transition"
                      >
                        <Eye className="w-3 h-3 text-amber-500" />
                        <span>Inspect</span>
                      </button>
                    </div>
                  </div>

                  {/* Citizen Comments List */}
                  {ticketComments.length > 0 && (
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 space-y-2 text-xs bg-slate-50 dark:bg-slate-950/50 p-3 rounded-2xl">
                      {ticketComments.map((cm) => (
                        <div key={cm.id} className="flex items-start gap-2">
                          <span className="font-extrabold text-amber-600 dark:text-amber-400 text-[11px] shrink-0">
                            {cm.userName}:
                          </span>
                          <div className="flex-1">
                            <p className="text-[11px] text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                              {cm.text}
                            </p>
                            <span className="text-[9px] text-slate-400 font-mono">{cm.createdAt}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add Citizen Comment Input */}
                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="text"
                      value={commentInputs[ticket.id] || ''}
                      onChange={(e) => setCommentInputs({ ...commentInputs, [ticket.id]: e.target.value })}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddComment(ticket.id)}
                      placeholder="Add a citizen comment or testimony..."
                      className="w-full text-xs rounded-xl px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
                    />
                    <button
                      onClick={() => handleAddComment(ticket.id)}
                      className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-slate-950 p-2.5 rounded-xl transition shrink-0 shadow-sm"
                      title="Post citizen comment"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </article>
              );
            })
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* 2. CARD GRID VIEW (COMPACT DASHBOARD)                    */}
      {/* ======================================================== */}
      {viewStyle === 'GRID' && (
        filteredTickets.length === 0 ? (
          <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto text-xl font-bold">
              🔍
            </div>
            <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">No Complaints Match Your Filter</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Try adjusting your search keywords or switching to "All Hazards" to view other tickets across Nashik.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredTickets.map((ticket) => {
              const isUpvoted = upvotedMap[ticket.id];
              const isCritical = ticket.impactScore >= 500;
              const isPendingVerification = ticket.status === 'VERIFICATION_PENDING';

              return (
                <div
                  key={ticket.id}
                  onClick={() => onInspect(ticket.id)}
                  className="rounded-2xl overflow-hidden border border-slate-200/90 dark:border-slate-800 hover:border-amber-500/50 transition-all flex flex-col justify-between cursor-pointer group bg-white dark:bg-slate-900/70 shadow-xs hover:shadow-md"
                >
                  <div>
                    {/* Photo Header */}
                    <div className="relative aspect-[16/10] overflow-hidden bg-slate-100 dark:bg-slate-950">
                      <img
                        src={ticket.beforeImageUrl}
                        alt={ticket.title}
                        className="w-full h-full object-cover group-hover:scale-103 transition duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />

                      <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/95 dark:bg-slate-950/90 text-slate-900 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700 shadow-xs">
                          {ticket.ward}
                        </span>
                        {getStatusBadge(ticket)}
                      </div>

                      <div className="absolute bottom-2 left-2.5 flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-black/80 backdrop-blur-md text-[10px]">
                        <Flame className={`w-3 h-3 ${isCritical ? 'text-rose-400' : 'text-amber-400'}`} />
                        <span className="text-slate-300">Severity:</span>
                        <span className={`font-black ${isCritical ? 'text-rose-400' : 'text-amber-400'}`}>
                          {ticket.impactScore}
                        </span>
                      </div>
                    </div>

                    {/* Content Details */}
                    <div className="p-4 space-y-2">
                      <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-xs sm:text-sm leading-snug line-clamp-2 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                        {ticket.title}
                      </h3>
                      <p className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                        {ticket.description}
                      </p>
                      
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 pt-1 truncate">
                        <MapPin className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                        <span className="truncate">{ticket.locationName}</span>
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          <span>{ticket.citizenName}</span>
                        </span>
                        <span>{new Date(ticket.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Card Action Footer */}
                  <div className="p-3 bg-slate-50 dark:bg-slate-950/60 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-1.5 flex-wrap">
                    
                    {/* +1 Endorse Button */}
                    <button
                      onClick={(e) => handleUpvoteClick(e, ticket.id)}
                      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold transition transform active:scale-95 ${
                        isUpvoted
                          ? 'bg-amber-500 text-slate-950 shadow-xs'
                          : 'bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                      }`}
                      title="Support this civic issue (+1)"
                    >
                      <ThumbsUp className={`w-3.5 h-3.5 ${isUpvoted ? 'fill-current' : ''}`} />
                      <span>{isUpvoted ? 'Endorsed' : '+1'}</span>
                      <span className="ml-0.5 px-1.5 py-0.2 rounded-md bg-slate-200/80 dark:bg-black/30 text-[10px]">
                        {ticket.upvotes + (isUpvoted ? 1 : 0)}
                      </span>
                    </button>

                    {/* Social Share Buttons */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => handleShareWhatsApp(e, ticket)}
                        className="p-1.5 rounded-lg bg-white dark:bg-slate-800 hover:bg-emerald-500 hover:text-white text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 transition"
                        title="Share on WhatsApp"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={(e) => handleShareTwitter(e, ticket)}
                        className="p-1.5 rounded-lg bg-white dark:bg-slate-800 hover:bg-sky-500 hover:text-white text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 transition"
                        title="Tweet to @NMC_Nashik"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={(e) => handleCopyLink(e, ticket.id)}
                        className={`p-1.5 rounded-lg transition border ${
                          copiedId === ticket.id
                            ? 'bg-emerald-500 text-white border-emerald-500'
                            : 'bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                        }`}
                        title="Copy Share Link"
                      >
                        {copiedId === ticket.id ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>

                    {/* Inspect / Verify Button */}
                    {isPendingVerification ? (
                      <button
                        onClick={() => onInspect(ticket.id)}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xs transition"
                      >
                        <span>Vote Proof</span>
                        <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                      </button>
                    ) : (
                      <button
                        onClick={() => onInspect(ticket.id)}
                        className="flex items-center gap-1 text-xs font-bold text-amber-600 dark:text-amber-400 hover:text-amber-500 transition px-2 py-1"
                      >
                        <span>Inspect</span>
                        <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                      </button>
                    )}
                  </div>

                </div>
              );
            })}
          </div>
        )
      )}

      {/* ======================================================== */}
      {/* 3. MUNICIPAL AUDIT TABLE VIEW                            */}
      {/* ======================================================== */}
      {viewStyle === 'TABLE' && (
        <div className="rounded-2xl overflow-hidden border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-4 font-bold">Incident / Location</th>
                  <th className="py-3 px-3 font-bold">Ward</th>
                  <th className="py-3 px-3 font-bold">Category</th>
                  <th className="py-3 px-3 font-bold">Status</th>
                  <th className="py-3 px-3 font-bold">Severity</th>
                  <th className="py-3 px-3 font-bold">Community +1</th>
                  <th className="py-3 px-4 font-bold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 bg-white dark:bg-slate-900/40">
                {filteredTickets.map((ticket) => (
                  <tr
                    key={ticket.id}
                    onClick={() => onInspect(ticket.id)}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition cursor-pointer"
                  >
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900 dark:text-slate-100">{ticket.title}</div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-amber-500" />
                        {ticket.locationName}
                      </div>
                    </td>
                    <td className="py-3 px-3 text-slate-700 dark:text-slate-300 font-medium">{ticket.ward}</td>
                    <td className="py-3 px-3 text-slate-700 dark:text-slate-300">
                      {ticket.category.replace(/_/g, ' ')}
                    </td>
                    <td className="py-3 px-3">{getStatusBadge(ticket)}</td>
                    <td className="py-3 px-3 font-extrabold text-amber-600 dark:text-amber-400">{ticket.impactScore}</td>
                    <td className="py-3 px-3 font-semibold text-slate-800 dark:text-slate-200">{ticket.upvotes}</td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onInspect(ticket.id);
                        }}
                        className="px-3 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 font-bold text-xs transition"
                      >
                        Inspect Proof ➔
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Flag As False Report Modal (Anti-Fraud Precaution) */}
      {flaggingTicket && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="p-2.5 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400">
                <Flag className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-slate-100">Flag as False / Misleading Report</h3>
                <p className="text-xs text-slate-500">Ticket: #{flaggingTicket.id}</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300">
              Please specify why this complaint is inaccurate. False complaints will be audited by the NMC Ward Officer before repair dispatch.
            </p>

            <div className="space-y-2 text-xs">
              {[
                { value: 'DUPLICATE_REPORT', label: 'Duplicate report of another active grievance' },
                { value: 'FAKE_STAGED_PHOTO', label: 'Fake, staged, or downloaded photo evidence' },
                { value: 'ALREADY_REPAIRED', label: 'Already repaired / No hazard exists here' },
                { value: 'WRONG_LOCATION', label: 'Wrong location / Ward boundary mismatch' },
              ].map((opt) => (
                <label 
                  key={opt.value} 
                  className={`flex items-center gap-2.5 p-3 rounded-xl border cursor-pointer transition ${
                    flagReason === opt.value 
                      ? 'bg-rose-500/10 border-rose-500/40 text-rose-800 dark:text-rose-300 font-bold' 
                      : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300'
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

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setFlaggingTicket(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
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
  );
}
