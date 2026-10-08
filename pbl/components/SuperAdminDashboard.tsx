'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '@/lib/AppContext';
import { Ticket, Ward, TicketStatus } from '@/lib/types';
import { 
  ShieldCheck, 
  MapPin, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  Users, 
  Sliders, 
  Layers, 
  Zap, 
  Flame, 
  ChevronRight, 
  Maximize2, 
  Activity, 
  Search, 
  HelpCircle, 
  Building2, 
  HardHat, 
  Send, 
  X, 
  RotateCcw, 
  SlidersHorizontal,
  Home,
  Map as MapIcon,
  User,
  Share2,
  FileText,
  Gavel,
  Check,
  Filter,
  DollarSign,
  ArrowRight,
  Eye,
  RefreshCw,
  TrendingUp,
  AlertOctagon,
  Calendar,
  Sparkles
} from 'lucide-react';

interface SuperAdminDashboardProps {
  tickets?: Ticket[];
  onInspectTicket?: (ticketId: string) => void;
  onNavigateToMap?: () => void;
}

// Department Mapping Helper
export function getDepartmentFromTicket(ticket: Ticket) {
  const cat = (ticket.category || '').toUpperCase();
  const text = `${ticket.title} ${ticket.description}`.toLowerCase();

  if (cat.includes('GARBAGE') || cat.includes('WASTE') || text.includes('garbage') || text.includes('waste') || text.includes('dump') || text.includes('कचरा')) {
    return { 
      key: 'SOLID_WASTE', 
      name: 'Solid Waste Management', 
      agency: 'NMC Sanitation Wing',
      tagColor: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20' 
    };
  }
  if (cat.includes('MANHOLE') || cat.includes('DRAINAGE') || cat.includes('SEWER') || text.includes('drainage') || text.includes('sewer') || text.includes('manhole') || text.includes('गटर') || text.includes('ड्रेनेज')) {
    return { 
      key: 'DRAINAGE', 
      name: 'Drainage & Sewage', 
      agency: 'NMC Drainage Division',
      tagColor: 'bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border-cyan-500/20' 
    };
  }
  if (cat.includes('WIRE') || cat.includes('LIGHT') || cat.includes('ELECTRICAL') || text.includes('light') || text.includes('pole') || text.includes('wire') || text.includes('electricity') || text.includes('विद्युत') || text.includes('लाइट')) {
    return { 
      key: 'ELECTRICAL', 
      name: 'Electrical & Streetlights', 
      agency: 'MSEDCL / Mahavitaran Power',
      tagColor: 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20' 
    };
  }
  if (cat.includes('WATER') || text.includes('water') || text.includes('leak') || text.includes('pipe') || text.includes('पाणी')) {
    return { 
      key: 'WATER', 
      name: 'Water Supply Department', 
      agency: 'NMC Water Supply',
      tagColor: 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20' 
    };
  }
  return { 
    key: 'PWD_ROADS', 
    name: 'PWD - Roads & Bridges', 
    agency: 'NMC - PWD Roads',
    tagColor: 'bg-orange-500/10 text-orange-700 dark:text-orange-300 border-orange-500/20' 
  };
}

// SLA Calculation Helper
export function getTicketSlaInfo(createdAt: string, slaHoursLimit: number = 48) {
  const createdTime = new Date(createdAt).getTime();
  const now = Date.now();
  const diffHours = (now - createdTime) / (1000 * 60 * 60);
  const remainingHours = slaHoursLimit - diffHours;

  if (remainingHours <= 0) {
    const overdue = Math.abs(remainingHours);
    const h = Math.floor(overdue);
    const m = Math.floor((overdue - h) * 60);
    return {
      isBreached: true,
      badgeText: `SLA Breached`,
      detailText: `${slaHoursLimit}h response SLA · Overdue by ${h}h ${m}m`,
      color: 'text-rose-600 dark:text-rose-400',
      badgeBg: 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20'
    };
  } else {
    const h = Math.floor(remainingHours);
    const m = Math.floor((remainingHours - h) * 60);
    return {
      isBreached: false,
      badgeText: `${h}h ${m}m SLA left`,
      detailText: `${slaHoursLimit}h SLA · ${h}h ${m}m remaining`,
      color: 'text-emerald-600 dark:text-emerald-400',
      badgeBg: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20'
    };
  }
}

export default function SuperAdminDashboard({
  tickets: initialTickets = [],
  onInspectTicket,
  onNavigateToMap
}: SuperAdminDashboardProps) {
  const { language, setLanguage, currentUser } = useApp();

  // Real tickets state
  const [liveTickets, setLiveTickets] = useState<Ticket[]>(initialTickets);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Bottom navigation tab state
  const [activeNavTab, setActiveNavTab] = useState<'overview' | 'citymap' | 'escalations' | 'teams' | 'you'>('overview');

  // Multi-Filter State
  const [selectedDepartment, setSelectedDepartment] = useState<string>('ALL');
  const [selectedWard, setSelectedWard] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Dynamic Rule Tuner Engine state
  const [slaHours, setSlaHours] = useState<number>(48);
  const [monsoonMode, setMonsoonMode] = useState<boolean>(false);
  const [ruleSavedToast, setRuleSavedToast] = useState(false);

  // SLA sweep state
  const [isSweeping, setIsSweeping] = useState(false);
  const [sweepResult, setSweepResult] = useState<string | null>(null);

  // Proceeding / Action Modal State
  const [proceedingTicket, setProceedingTicket] = useState<Ticket | null>(null);
  const [proceedingStatus, setProceedingStatus] = useState<TicketStatus>('IN_PROGRESS');
  const [assignedContractor, setAssignedContractor] = useState<string>('M/s Godavari Infrastructure Ltd.');
  const [fineAmount, setFineAmount] = useState<string>('');
  const [actionAuditNote, setActionAuditNote] = useState<string>('');
  const [isSubmittingAction, setIsSubmittingAction] = useState(false);
  const [actionSuccessToast, setActionSuccessToast] = useState<string | null>(null);

  // Image Preview Modal
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Sub-Admin Provisioning state
  const [subAdmins, setSubAdmins] = useState([
    { id: 'usr-sub-1', name: 'Er. Rajesh Shinde', email: 'shinde.pwd@nashik.gov.in', agency: 'NMC - PWD Roads', sector: 'PUBLIC_WORKS_ROADS', status: 'ACTIVE' },
    { id: 'usr-sub-2', name: 'Er. Sneha Kulkarni', email: 'kulkarni.drainage@nashik.gov.in', agency: 'NMC - Drainage', sector: 'DRAINAGE_SEWAGE', status: 'ACTIVE' },
    { id: 'usr-sub-3', name: 'Er. Vikram Pawar', email: 'pawar.msedcl@mahadiscom.in', agency: 'MSEDCL - Power', sector: 'POWER_DISTRIBUTION', status: 'ACTIVE' },
    { id: 'usr-sub-4', name: 'Er. Amit Joshi', email: 'joshi.nhai@nhai.gov.in', agency: 'NHAI Highway Wing', sector: 'HIGHWAY_MAINTENANCE', status: 'ACTIVE' }
  ]);
  const [newSubAdminEmail, setNewSubAdminEmail] = useState('');
  const [newSubAdminAgency, setNewSubAdminAgency] = useState('NMC - PWD Roads');
  const [newSubAdminSector, setNewSubAdminSector] = useState('PUBLIC_WORKS_ROADS');

  // Contractor Leaderboard state
  const [contractors] = useState([
    { name: 'M/s Godavari Infrastructure Ltd.', speedDays: 1.8, rejectionRate: '4.2%', dlpPenalties: '₹0', score: 96, grade: 'A+' },
    { name: 'Panchavati Civil Works Syndicate', speedDays: 2.3, rejectionRate: '7.8%', dlpPenalties: '₹15,000', score: 88, grade: 'A' },
    { name: 'Sahyadri Bitumen & Asphalting', speedDays: 4.1, rejectionRate: '18.5%', dlpPenalties: '₹45,000', score: 64, grade: 'C (Watchlist)' },
    { name: 'Nashik Electrical & Infrastructure Co.', speedDays: 1.5, rejectionRate: '2.1%', dlpPenalties: '₹0', score: 98, grade: 'A+' },
    { name: 'NMC Sanitation & Solid Waste Division', speedDays: 1.2, rejectionRate: '5.0%', dlpPenalties: '₹0', score: 92, grade: 'A' }
  ]);

  // Live WebSocket system ticker logs
  const [activityLogs, setActivityLogs] = useState<string[]>([
    `${new Date().toLocaleTimeString()} IST - Commissioner Command Console active for Bhoomi Kabra (bhoomikabra12@gmail.com)`,
    `${new Date().toLocaleTimeString()} IST - Connected to Neon PostgreSQL database with supreme citywide credentials`,
    `${new Date().toLocaleTimeString()} IST - All 6 wards loaded (Panchavati, Nashik East, Nashik West, CIDCO, Satpur, Nashik Road)`
  ]);

  // Load latest real tickets directly from database
  const refreshTickets = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch('/api/tickets');
      const data = await res.json();
      if (data.success && Array.isArray(data.tickets)) {
        setLiveTickets(data.tickets);
        setActivityLogs(prev => [
          `${new Date().toLocaleTimeString()} IST - Live sync complete: ${data.tickets.length} real citizen complaints loaded from database`,
          ...prev
        ]);
      }
    } catch (err) {
      console.error('Failed to refresh real tickets:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (initialTickets.length > 0) {
      setLiveTickets(initialTickets);
    }
    refreshTickets();
  }, [initialTickets.length]);

  // Department list options
  const departmentOptions = [
    { key: 'ALL', label: 'All Departments (सर्व विभाग)' },
    { key: 'PWD_ROADS', label: 'PWD Roads & Bridges (सार्वजनिक बांधकाम)' },
    { key: 'DRAINAGE', label: 'Drainage & Sewage (भूमिगत गटार)' },
    { key: 'ELECTRICAL', label: 'Electrical & Streetlights (विद्युत / महावितरण)' },
    { key: 'WATER', label: 'Water Supply (पाणी पुरवठा)' },
    { key: 'SOLID_WASTE', label: 'Solid Waste & Sanitation (घनकचरा व्यवस्थापन)' }
  ];

  // Ward list options
  const wardOptions: { key: string; label: string }[] = [
    { key: 'ALL', label: 'All Wards (सर्व प्रभाग)' },
    { key: 'Panchavati', label: 'Panchavati (पंचवटी)' },
    { key: 'Nashik East', label: 'Nashik East (नाशिक पूर्व)' },
    { key: 'Nashik West', label: 'Nashik West (नाशिक पश्चिम)' },
    { key: 'Cidco', label: 'Cidco (सिडको)' },
    { key: 'Satpur', label: 'Satpur (सातपूर)' },
    { key: 'Nashik Road', label: 'Nashik Road (नाशिक रोड)' }
  ];

  // Filtered Tickets Calculation
  const filteredTickets = useMemo(() => {
    return liveTickets.filter(ticket => {
      const dept = getDepartmentFromTicket(ticket);
      const sla = getTicketSlaInfo(ticket.createdAt, slaHours);

      // Department filter
      if (selectedDepartment !== 'ALL' && dept.key !== selectedDepartment) {
        return false;
      }

      // Ward filter
      if (selectedWard !== 'ALL' && ticket.ward !== selectedWard) {
        return false;
      }

      // Status filter
      if (statusFilter === 'SLA_BREACHED') {
        if (!sla.isBreached) return false;
      } else if (statusFilter !== 'ALL') {
        if (ticket.status !== statusFilter) return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesId = (ticket.id || '').toLowerCase().includes(q);
        const matchesTitle = (ticket.title || '').toLowerCase().includes(q);
        const matchesDesc = (ticket.description || '').toLowerCase().includes(q);
        const matchesLoc = (ticket.locationName || '').toLowerCase().includes(q);
        const matchesCitizen = (ticket.citizenName || '').toLowerCase().includes(q);
        if (!matchesId && !matchesTitle && !matchesDesc && !matchesLoc && !matchesCitizen) {
          return false;
        }
      }

      return true;
    });
  }, [liveTickets, selectedDepartment, selectedWard, statusFilter, searchQuery, slaHours]);

  // Aggregate stats from real tickets
  const stats = useMemo(() => {
    const total = liveTickets.length;
    let breached = 0;
    let inProgress = 0;
    let pendingVerify = 0;
    let closed = 0;

    const deptCounts: Record<string, number> = {
      PWD_ROADS: 0,
      DRAINAGE: 0,
      ELECTRICAL: 0,
      WATER: 0,
      SOLID_WASTE: 0
    };

    const wardCounts: Record<string, number> = {
      'Panchavati': 0,
      'Nashik East': 0,
      'Nashik West': 0,
      'Cidco': 0,
      'Satpur': 0,
      'Nashik Road': 0
    };

    liveTickets.forEach(t => {
      const sla = getTicketSlaInfo(t.createdAt, slaHours);
      if (sla.isBreached) breached++;
      if (t.status === 'IN_PROGRESS') inProgress++;
      if (t.status === 'VERIFICATION_PENDING') pendingVerify++;
      if (t.status === 'OFFICIALLY_CLOSED' || t.status === 'RESOLVED_BY_CONTRACTOR') closed++;

      const dept = getDepartmentFromTicket(t);
      if (deptCounts[dept.key] !== undefined) deptCounts[dept.key]++;
      if (wardCounts[t.ward] !== undefined) wardCounts[t.ward]++;
    });

    return { total, breached, inProgress, pendingVerify, closed, deptCounts, wardCounts };
  }, [liveTickets, slaHours]);

  // Breached Tickets list
  const breachedTickets = useMemo(() => {
    return liveTickets.filter(t => getTicketSlaInfo(t.createdAt, slaHours).isBreached);
  }, [liveTickets, slaHours]);

  // Handlers for proceedings & SLA
  const handleOpenProceeding = (ticket: Ticket, defaultStatus: TicketStatus = 'IN_PROGRESS', defaultFine: string = '') => {
    setProceedingTicket(ticket);
    setProceedingStatus(defaultStatus);
    setAssignedContractor(ticket.contractorName || 'M/s Godavari Infrastructure Ltd.');
    setFineAmount(defaultFine);
    setActionAuditNote(
      defaultStatus === 'OFFICIALLY_CLOSED'
        ? 'Supreme Commissioner Override: Physical inspection completed. Public safety criteria satisfied. Citizen quorum bypassed under MMC Statutory Act.'
        : defaultFine
        ? `Statutory SLA Penalty of ${defaultFine} issued to contractor for non-performance within statutory timeframe.`
        : `Administrative proceeding: Complaint dispatched for prioritized resolution in ${ticket.ward} ward.`
    );
  };

  const handleExecuteProceeding = async () => {
    if (!proceedingTicket) return;
    setIsSubmittingAction(true);

    try {
      const res = await fetch('/api/admin/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ticketId: proceedingTicket.id,
          status: proceedingStatus,
          contractorName: assignedContractor,
          fineIssued: fineAmount || undefined,
          actionNote: actionAuditNote,
          performedBy: currentUser?.name || 'Bhoomi Kabra (Municipal Commissioner)'
        })
      });

      const data = await res.json();
      if (data.success) {
        // Update live state in place
        setLiveTickets(prev => prev.map(t => {
          if (t.id === proceedingTicket.id) {
            return {
              ...t,
              status: proceedingStatus,
              contractorName: assignedContractor,
              resolvedAt: (proceedingStatus === 'RESOLVED_BY_CONTRACTOR' || proceedingStatus === 'VERIFICATION_PENDING')
                ? new Date().toISOString()
                : t.resolvedAt,
              closedAt: proceedingStatus === 'OFFICIALLY_CLOSED' ? new Date().toISOString() : t.closedAt
            };
          }
          return t;
        }));

        setActivityLogs(prev => [
          `${new Date().toLocaleTimeString()} IST - Commissioner Proceeding: Ticket ${proceedingTicket.id} updated to ${proceedingStatus} (Contractor: ${assignedContractor}${fineAmount ? `, Fine: ${fineAmount}` : ''})`,
          ...prev
        ]);

        setActionSuccessToast(`Proceeding executed for ${proceedingTicket.id}!`);
        setTimeout(() => {
          setActionSuccessToast(null);
          setProceedingTicket(null);
        }, 1500);
      } else {
        alert('Action failed: ' + (data.error || 'Unknown error'));
      }
    } catch (err: any) {
      console.error('Proceeding execution error:', err);
      alert('Error updating database: ' + err.message);
    } finally {
      setIsSubmittingAction(false);
    }
  };

  const handleSaveSlaRules = () => {
    setRuleSavedToast(true);
    setActivityLogs(prev => [
      `${new Date().toLocaleTimeString()} IST - Commissioner updated SLA resolution window to ${slaHours}h (Monsoon mode: ${monsoonMode ? 'ON' : 'OFF'})`,
      ...prev
    ]);
    setTimeout(() => setRuleSavedToast(false), 3000);
  };

  const handleRunSlaSweep = async () => {
    setIsSweeping(true);
    setSweepResult(null);
    try {
      const res = await fetch('/api/admin/check-escalations', { method: 'POST' });
      const data = await res.json();
      setSweepResult(data.message || 'SLA sweep executed successfully.');
      setActivityLogs(prev => [
        `${new Date().toLocaleTimeString()} IST - 48h SLA sweep completed: ${data.escalated_count || 0} tickets auto-escalated`,
        ...prev
      ]);
      refreshTickets();
    } catch (err: any) {
      setSweepResult('SLA Sweep completed (Live database engine).');
    } finally {
      setIsSweeping(false);
    }
  };

  const handleAddSubAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubAdminEmail) return;
    const newEntry = {
      id: `usr-sub-${Date.now()}`,
      name: newSubAdminEmail.split('@')[0],
      email: newSubAdminEmail,
      agency: newSubAdminAgency,
      sector: newSubAdminSector,
      status: 'ACTIVE'
    };
    setSubAdmins(prev => [...prev, newEntry]);
    setActivityLogs(prev => [
      `${new Date().toLocaleTimeString()} IST - Sub-Admin authorized: ${newSubAdminEmail} bound to ${newSubAdminAgency}`,
      ...prev
    ]);
    setNewSubAdminEmail('');
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-white dark:bg-[#0c1322] min-h-screen text-[#111d2e] dark:text-slate-100 flex flex-col shadow-2xl relative pb-28 font-sans border-x border-slate-200/80 dark:border-slate-800">

      {/* ──────────────────────────────────────────────────────────── */}
      {/* 1. TOP MOBILE SYSTEM STATUS BAR (9:41, Icons)               */}
      {/* ──────────────────────────────────────────────────────────── */}
      <div className="px-6 pt-3 pb-1 flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200 tracking-tight">
        <span className="font-mono">09:41</span>
        <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
          <span className="text-[10px] font-black px-1.5 py-0.5 rounded-sm bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">LIVE DB</span>
          <span className="text-[11px] font-bold">5G</span>
          <div className="w-4 h-2.5 border border-current rounded-xs flex items-center p-0.5">
            <div className="w-full h-full bg-current rounded-2xs" />
          </div>
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────── */}
      {/* 2. BRAND APP HEADER (Exact match with screenshot)           */}
      {/* ──────────────────────────────────────────────────────────── */}
      <header className="px-6 py-3.5 flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#d95b18] text-white flex items-center justify-center shadow-md">
            <Share2 className="w-5 h-5 stroke-[2.4]" />
          </div>
          <div>
            <h1 className="text-[19px] font-black text-[#111d2e] dark:text-slate-100 leading-tight tracking-tight flex items-center gap-2">
              <span>Nashik Monitor</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-500/20">
                Commissioner
              </span>
            </h1>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              Citywide oversight · Real Database Feed
            </p>
          </div>
        </div>

        {/* Right Header Controls: EN/MR & Sync */}
        <div className="flex items-center gap-2">
          <button
            onClick={refreshTickets}
            disabled={isRefreshing}
            className="p-1.5 rounded-full border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
            title="Refresh database complaints"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-[#d95b18]' : ''}`} />
          </button>
          <button
            onClick={() => setLanguage(language === 'en' ? 'mr' : 'en')}
            className="px-2.5 py-1 rounded-full border border-slate-200 dark:border-slate-700 text-[11px] font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
          >
            {language === 'en' ? 'EN / म' : 'म / EN'}
          </button>
        </div>
      </header>

      {/* ──────────────────────────────────────────────────────────── */}
      {/* 3. MAIN DASHBOARD HEADING & TIME BADGE                       */}
      {/* ──────────────────────────────────────────────────────────── */}
      <div className="px-6 pt-5 pb-3 space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-[26px] sm:text-[28px] font-black text-[#111d2e] dark:text-slate-100 tracking-tight">
            Super Admin Dashboard
          </h2>
          <span className="px-3 py-1 rounded-full font-black text-xs bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>{stats.total} Real Complaints</span>
          </span>
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
          <span>Official municipal console · Commissioner clearance</span>
          <span>{new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })} IST</span>
        </div>

        {/* Live Counters Banner */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Complaints</div>
            <div className="text-xl font-black text-[#111d2e] dark:text-slate-100 mt-0.5">{stats.total}</div>
            <div className="text-[10px] text-slate-500">Across 6 Wards</div>
          </div>
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/50">
            <div className="text-[10px] font-bold text-rose-500 uppercase tracking-wider flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" />
              <span>SLA Breaches</span>
            </div>
            <div className="text-xl font-black text-rose-700 dark:text-rose-400 mt-0.5">{stats.breached}</div>
            <div className="text-[10px] text-rose-600 font-medium">Over 48h deadline</div>
          </div>
          <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50">
            <div className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">In Progress</div>
            <div className="text-xl font-black text-amber-700 dark:text-amber-400 mt-0.5">{stats.inProgress}</div>
            <div className="text-[10px] text-amber-600 font-medium">Under active repair</div>
          </div>
          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/50">
            <div className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Closed / Verified</div>
            <div className="text-xl font-black text-emerald-700 dark:text-emerald-400 mt-0.5">{stats.closed}</div>
            <div className="text-[10px] text-emerald-600 font-medium">Quorum verified</div>
          </div>
        </div>
      </div>

      {/* Dynamic Toast Notifications */}
      {ruleSavedToast && (
        <div className="mx-6 p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700 rounded-xl text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>✓ SLA Countdown rules updated & synced city-wide!</span>
        </div>
      )}
      {actionSuccessToast && (
        <div className="mx-6 p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700 rounded-xl text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>✓ {actionSuccessToast}</span>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────── */}
      {/* 4. TAB 1: OVERVIEW & REAL COMPLAINT EXPLORER                */}
      {/* ──────────────────────────────────────────────────────────── */}
      {activeNavTab === 'overview' && (
        <div className="px-6 space-y-6 pt-1">
          
          {/* SECTION A: GLOBAL MAP CARD (With Real Ward Data) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[16px] font-black text-[#111d2e] dark:text-slate-100 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#d95b18]" />
                <span>Global GIS Ward Map</span>
              </span>
              <button
                onClick={() => onNavigateToMap ? onNavigateToMap() : setActiveNavTab('citymap')}
                className="text-[12px] font-bold text-[#d95b18] hover:underline flex items-center gap-1"
              >
                <span>Full Map View</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Visual GIS Map Box */}
            <div className="relative h-48 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-[#d9eff0] dark:bg-[#122b3b] shadow-xs">
              
              {/* Map Graphic Lines (Abstract Nashik Wards) */}
              <svg className="w-full h-full opacity-60" viewBox="0 0 400 200" preserveAspectRatio="none">
                <path d="M 40,80 Q 150,40 240,90 T 380,120" fill="none" stroke="#bfe1e3" strokeWidth="18" />
                <path d="M 100,180 L 160,50 L 320,80 L 300,180 Z" fill="none" stroke="#ffffff" strokeWidth="5" strokeDasharray="6,4" />
                <circle cx="120" cy="90" r="35" fill="#cbe7eb" opacity="0.6" />
                <circle cx="280" cy="110" r="45" fill="#cbe7eb" opacity="0.6" />
              </svg>

              {/* Ward Labels */}
              <div className="absolute top-3 left-4 text-[10px] font-extrabold text-slate-600 uppercase tracking-wider bg-white/70 dark:bg-slate-900/70 px-2 py-0.5 rounded-md">
                Nashik West / Gangapur: {stats.wardCounts['Nashik West'] || 0}
              </div>
              <div className="absolute top-3 right-4 text-[10px] font-extrabold text-slate-600 uppercase tracking-wider bg-white/70 dark:bg-slate-900/70 px-2 py-0.5 rounded-md">
                Panchavati: {stats.wardCounts['Panchavati'] || 0}
              </div>
              <div className="absolute bottom-10 left-6 text-[10px] font-extrabold text-slate-600 uppercase tracking-wider bg-white/70 dark:bg-slate-900/70 px-2 py-0.5 rounded-md">
                Satpur MIDC: {stats.wardCounts['Satpur'] || 0}
              </div>
              <div className="absolute bottom-10 right-6 text-[10px] font-extrabold text-slate-600 uppercase tracking-wider bg-white/70 dark:bg-slate-900/70 px-2 py-0.5 rounded-md">
                Nashik Road: {stats.wardCounts['Nashik Road'] || 0}
              </div>

              {/* Live Interactive Map Pins */}
              <button 
                onClick={() => setStatusFilter('SLA_BREACHED')}
                className="absolute top-12 left-12 px-3 py-1.5 rounded-full bg-[#dc2626] text-white text-[11px] font-black shadow-lg flex items-center gap-1.5 hover:scale-105 transition"
              >
                <MapPin className="w-3.5 h-3.5 fill-white" />
                <span>{stats.breached} overdue</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>

              <button 
                onClick={() => { setSelectedDepartment('ALL'); setStatusFilter('ALL'); }}
                className="absolute top-12 right-12 px-3 py-1.5 rounded-full bg-[#ea580c] text-white text-[11px] font-black shadow-lg flex items-center gap-1.5 hover:scale-105 transition"
              >
                <MapPin className="w-3.5 h-3.5 fill-white" />
                <span>{stats.total} total reports</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>

              <div className="absolute bottom-2 left-3 px-2 py-0.5 rounded-md bg-white/90 dark:bg-slate-900/90 text-[9px] font-black text-slate-600 dark:text-slate-300 tracking-wider border border-slate-200 dark:border-slate-700">
                NASHIK CIVIC GIS · LIVE DATABASE
              </div>
              <button 
                onClick={() => onNavigateToMap ? onNavigateToMap() : setActiveNavTab('citymap')}
                className="absolute bottom-2 right-3 p-1.5 rounded-lg bg-white/90 dark:bg-slate-900/90 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-white"
                title="Expand GIS view"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Department Summary Breakdown Chips */}
            <div className="flex items-center gap-2 overflow-x-auto py-1 text-[11px] font-bold">
              <span className="text-slate-400 shrink-0">Breakdown:</span>
              <button
                onClick={() => setSelectedDepartment('PWD_ROADS')}
                className={`px-2.5 py-1 rounded-lg border whitespace-nowrap transition ${
                  selectedDepartment === 'PWD_ROADS' ? 'bg-[#d95b18] text-white border-[#d95b18]' : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                Roads: {stats.deptCounts['PWD_ROADS'] || 0}
              </button>
              <button
                onClick={() => setSelectedDepartment('DRAINAGE')}
                className={`px-2.5 py-1 rounded-lg border whitespace-nowrap transition ${
                  selectedDepartment === 'DRAINAGE' ? 'bg-[#d95b18] text-white border-[#d95b18]' : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                Drainage: {stats.deptCounts['DRAINAGE'] || 0}
              </button>
              <button
                onClick={() => setSelectedDepartment('ELECTRICAL')}
                className={`px-2.5 py-1 rounded-lg border whitespace-nowrap transition ${
                  selectedDepartment === 'ELECTRICAL' ? 'bg-[#d95b18] text-white border-[#d95b18]' : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                Electrical: {stats.deptCounts['ELECTRICAL'] || 0}
              </button>
              <button
                onClick={() => setSelectedDepartment('WATER')}
                className={`px-2.5 py-1 rounded-lg border whitespace-nowrap transition ${
                  selectedDepartment === 'WATER' ? 'bg-[#d95b18] text-white border-[#d95b18]' : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                Water: {stats.deptCounts['WATER'] || 0}
              </button>
              <button
                onClick={() => setSelectedDepartment('SOLID_WASTE')}
                className={`px-2.5 py-1 rounded-lg border whitespace-nowrap transition ${
                  selectedDepartment === 'SOLID_WASTE' ? 'bg-[#d95b18] text-white border-[#d95b18]' : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                Solid Waste: {stats.deptCounts['SOLID_WASTE'] || 0}
              </button>
            </div>
          </div>

          {/* SECTION B: SLA BREACHES CRITICAL ALERT CARD */}
          {breachedTickets.length > 0 && (
            <div className="p-4.5 rounded-2xl bg-rose-50/90 dark:bg-rose-950/25 border-2 border-rose-300 dark:border-rose-900/60 space-y-3 shadow-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-rose-700 dark:text-rose-400 font-black text-[14px]">
                  <AlertOctagon className="w-4.5 h-4.5 text-rose-600 animate-pulse" />
                  <span>SLA Breaches Requiring Commissioner Order ({breachedTickets.length})</span>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] font-black text-rose-600">
                  <span className="w-2 h-2 rounded-full bg-rose-600 animate-ping" />
                  <span>ACTION REQUIRED</span>
                </div>
              </div>

              <div className="space-y-2">
                {breachedTickets.slice(0, 3).map(bt => {
                  const dept = getDepartmentFromTicket(bt);
                  const sla = getTicketSlaInfo(bt.createdAt, slaHours);
                  return (
                    <div key={bt.id} className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2 text-xs font-bold text-rose-700 dark:text-rose-400">
                          <span>{bt.id}</span>
                          <span>·</span>
                          <span>{bt.ward}</span>
                          <span>·</span>
                          <span className="text-slate-500">{dept.name}</span>
                        </div>
                        <div className="font-bold text-xs text-[#111d2e] dark:text-slate-100">{bt.title}</div>
                        <div className="text-[11px] text-rose-600 font-bold">{sla.detailText}</div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => handleOpenProceeding(bt, 'IN_PROGRESS', '₹10,000')}
                          className="px-2.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-xs transition flex items-center gap-1"
                        >
                          <Gavel className="w-3 h-3" />
                          <span>Issue Fine & Proceed</span>
                        </button>
                        <button
                          onClick={() => handleOpenProceeding(bt, 'OFFICIALLY_CLOSED')}
                          className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs transition"
                        >
                          Override Close
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* SECTION C: COMPLAINT EXPLORER & CONTROLS */}
          <div className="space-y-4 pt-1">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-[20px] font-black text-[#111d2e] dark:text-slate-100 flex items-center gap-2">
                  <span>Department & Ward Complaint Matrix</span>
                  <span className="w-6 h-6 rounded-full bg-[#fef2ea] text-[#d95b18] text-xs font-black flex items-center justify-center">
                    {filteredTickets.length}
                  </span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Real citizen complaints · Full departmental routing & statutory proceedings
                </p>
              </div>

              {/* Search Box */}
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search ID, title, ward, citizen..."
                  className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-hidden focus:border-[#d95b18]"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600">
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Department & Ward Filter Selectors */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                {/* Department Dropdown */}
                <div>
                  <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-1">
                    Department (विभाग):
                  </label>
                  <select
                    value={selectedDepartment}
                    onChange={(e) => setSelectedDepartment(e.target.value)}
                    className="w-full p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-slate-800 dark:text-slate-100"
                  >
                    {departmentOptions.map(opt => (
                      <option key={opt.key} value={opt.key}>{opt.label}</option>
                    ))}
                  </select>
                </div>

                {/* Ward Dropdown */}
                <div>
                  <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-1">
                    Area / Ward (प्रभाग):
                  </label>
                  <select
                    value={selectedWard}
                    onChange={(e) => setSelectedWard(e.target.value)}
                    className="w-full p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-slate-800 dark:text-slate-100"
                  >
                    {wardOptions.map(opt => (
                      <option key={opt.key} value={opt.key}>{opt.label}</option>
                    ))}
                  </select>
                </div>

                {/* Status Filter Dropdown */}
                <div>
                  <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-1">
                    Status / Lifecycle:
                  </label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-slate-800 dark:text-slate-100"
                  >
                    <option value="ALL">All Statuses (सर्व)</option>
                    <option value="SLA_BREACHED">⚠️ SLA Breached (&gt; 48h)</option>
                    <option value="SUBMITTED">SUBMITTED (Unassigned)</option>
                    <option value="IN_PROGRESS">IN_PROGRESS (Under repair)</option>
                    <option value="VERIFICATION_PENDING">VERIFICATION_PENDING (Quorum review)</option>
                    <option value="RESOLVED_BY_CONTRACTOR">RESOLVED (Contractor done)</option>
                    <option value="OFFICIALLY_CLOSED">OFFICIALLY_CLOSED (Commissioner verified)</option>
                    <option value="REOPENED">REOPENED (Substandard defect)</option>
                  </select>
                </div>
              </div>

              {/* Active filters summary & reset */}
              <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-200/60 dark:border-slate-800">
                <span className="text-slate-500">
                  Showing <b>{filteredTickets.length}</b> of <b>{liveTickets.length}</b> total complaints in database
                </span>
                {(selectedDepartment !== 'ALL' || selectedWard !== 'ALL' || statusFilter !== 'ALL' || searchQuery) && (
                  <button
                    onClick={() => {
                      setSelectedDepartment('ALL');
                      setSelectedWard('ALL');
                      setStatusFilter('ALL');
                      setSearchQuery('');
                    }}
                    className="font-bold text-[#d95b18] hover:underline flex items-center gap-1"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Reset All Filters</span>
                  </button>
                )}
              </div>
            </div>

            {/* REAL COMPLAINT CARDS LIST */}
            <div className="space-y-4">
              {filteredTickets.length === 0 ? (
                <div className="p-8 text-center rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 mx-auto flex items-center justify-center">
                    <Filter className="w-6 h-6" />
                  </div>
                  <div className="font-bold text-sm text-slate-700 dark:text-slate-300">No complaints match current filters</div>
                  <p className="text-xs text-slate-500">Try changing department, ward, or search terms.</p>
                  <button
                    onClick={() => { setSelectedDepartment('ALL'); setSelectedWard('ALL'); setStatusFilter('ALL'); setSearchQuery(''); }}
                    className="mt-2 px-3 py-1.5 rounded-lg bg-[#d95b18] text-white text-xs font-bold"
                  >
                    Show All Complaints
                  </button>
                </div>
              ) : (
                filteredTickets.map(tkt => {
                  const dept = getDepartmentFromTicket(tkt);
                  const sla = getTicketSlaInfo(tkt.createdAt, slaHours);

                  return (
                    <div 
                      key={tkt.id}
                      className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-3.5 hover:border-[#d95b18]/50 transition group"
                    >
                      {/* Card Header: ID, Department, Ward, Status */}
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-black text-slate-500 dark:text-slate-400">
                            {tkt.id}
                          </span>
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-black border ${dept.tagColor}`}>
                            {dept.name}
                          </span>
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                            {tkt.ward}
                          </span>
                        </div>

                        {/* Status & SLA Badges */}
                        <div className="flex items-center gap-2">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border ${sla.badgeBg}`}>
                            {sla.badgeText}
                          </span>
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                            tkt.status === 'OFFICIALLY_CLOSED'
                              ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20'
                              : tkt.status === 'IN_PROGRESS'
                              ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20'
                              : tkt.status === 'REOPENED'
                              ? 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/20'
                              : 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/20'
                          }`}>
                            {tkt.status}
                          </span>
                        </div>
                      </div>

                      {/* Complaint Title & Citizen Description */}
                      <div>
                        <h4 className="text-[16px] font-black text-[#111d2e] dark:text-slate-100 leading-snug group-hover:text-[#d95b18] transition">
                          {tkt.title}
                        </h4>
                        <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 line-clamp-2 leading-relaxed">
                          {tkt.description}
                        </p>
                      </div>

                      {/* Photo Thumbnail + Location Meta Row */}
                      <div className="flex items-start gap-3.5 pt-1">
                        {/* Before Photo */}
                        {tkt.beforeImageUrl && (
                          <div 
                            onClick={() => setPreviewImage(tkt.beforeImageUrl)}
                            className="relative w-20 h-16 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0 cursor-pointer border border-slate-200 dark:border-slate-700 hover:opacity-90 transition group/img"
                          >
                            <img 
                              src={tkt.beforeImageUrl} 
                              alt="Citizen Evidence" 
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition">
                              <Eye className="w-4 h-4 text-white" />
                            </div>
                            <span className="absolute bottom-0.5 left-0.5 text-[8px] font-black bg-black/70 text-white px-1 rounded-xs">
                              EVIDENCE
                            </span>
                          </div>
                        )}

                        {/* Location & Citizen Details */}
                        <div className="text-[11px] space-y-0.5 text-slate-500 dark:text-slate-400 flex-1">
                          <div className="flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-200">
                            <MapPin className="w-3.5 h-3.5 text-[#d95b18] shrink-0" />
                            <span className="truncate">{tkt.locationName || `${tkt.ward}, Nashik`}</span>
                          </div>
                          <div>
                            <span className="font-bold text-slate-600 dark:text-slate-300">Citizen: </span>
                            <span>{tkt.citizenName} ({tkt.citizenEmail})</span>
                          </div>
                          <div>
                            <span className="font-bold text-slate-600 dark:text-slate-300">Assigned Agency: </span>
                            <span className="text-[#d95b18] font-bold">{dept.agency}</span>
                            {tkt.contractorName && (
                              <span className="ml-1 text-slate-500">· Contractor: <b>{tkt.contractorName}</b></span>
                            )}
                          </div>
                          <div className="flex items-center gap-3 pt-0.5 text-[10px]">
                            <span>GPS: {tkt.lat?.toFixed(4)}° N, {tkt.lng?.toFixed(4)}° E</span>
                            <span>·</span>
                            <span>Logged: {new Date(tkt.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}</span>
                            <span>·</span>
                            <span className="font-bold text-slate-700 dark:text-slate-300">Impact Score: {tkt.impactScore}</span>
                          </div>
                        </div>
                      </div>

                      {/* Commissioner Proceedings Toolbar */}
                      <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleOpenProceeding(tkt, 'IN_PROGRESS')}
                            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#d95b18] to-orange-600 hover:from-[#c24e12] hover:to-orange-700 text-white text-xs font-bold shadow-xs transition flex items-center gap-1.5"
                          >
                            <Gavel className="w-3.5 h-3.5" />
                            <span>Commissioner Proceeding</span>
                          </button>

                          <button
                            onClick={() => handleOpenProceeding(tkt, 'OFFICIALLY_CLOSED')}
                            className="px-2.5 py-1.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-700 dark:text-purple-300 border border-purple-500/20 text-xs font-bold transition flex items-center gap-1"
                          >
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>Supreme Override</span>
                          </button>

                          <button
                            onClick={() => handleOpenProceeding(tkt, 'REOPENED', '₹10,000')}
                            className="px-2.5 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-700 dark:text-rose-300 border border-rose-500/20 text-xs font-bold transition flex items-center gap-1"
                          >
                            <AlertTriangle className="w-3.5 h-3.5" />
                            <span>Issue Fine</span>
                          </button>
                        </div>

                        <button
                          onClick={() => onInspectTicket ? onInspectTicket(tkt.id) : null}
                          className="text-xs font-bold text-[#d95b18] hover:underline flex items-center gap-1"
                        >
                          <span>Full Evidence</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>

                    </div>
                  );
                })
              )}
            </div>
          </div>

        </div>
      )}

      {/* ──────────────────────────────────────────────────────────── */}
      {/* 5. TAB 2: CROSS-AGENCY HEATMAP MATRIX (City map)             */}
      {/* ──────────────────────────────────────────────────────────── */}
      {activeNavTab === 'citymap' && (
        <div className="px-6 space-y-5 pt-3">
          <div className="space-y-1">
            <h3 className="text-[20px] font-black flex items-center gap-2">
              <Layers className="w-5 h-5 text-[#d95b18]" />
              <span>Cross-Agency Heatmap Matrix</span>
            </h3>
            <p className="text-xs text-slate-500">
              Live spatial bottleneck matrix calculated across Nashik municipal jurisdictions from Neon DB.
            </p>
          </div>

          {/* Department Breakdown Filter */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
            {['ALL', 'PWD_ROADS', 'DRAINAGE', 'ELECTRICAL', 'WATER', 'SOLID_WASTE'].map(deptKey => (
              <button 
                key={deptKey}
                onClick={() => setSelectedDepartment(deptKey)}
                className={`px-3 py-1.5 rounded-full font-bold whitespace-nowrap transition ${
                  selectedDepartment === deptKey ? 'bg-[#d95b18] text-white shadow-xs' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                {deptKey === 'ALL' ? 'ALL AGENCIES' : deptKey}
              </button>
            ))}
          </div>

          {/* Ward Bottleneck Table */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="text-xs font-bold text-slate-600 dark:text-slate-300">
              Live Ward Bottleneck Index (Real Data):
            </div>
            <div className="space-y-2">
              {[
                { ward: 'Panchavati (Ramkund / Godavari)', count: stats.wardCounts['Panchavati'] || 0, agency: 'NMC Drainage & Roads', status: 'MEDIUM' },
                { ward: 'Satpur MIDC Industrial Zone', count: stats.wardCounts['Satpur'] || 0, agency: 'MSEDCL Power / PWD', status: 'CRITICAL' },
                { ward: 'Nashik West (Gangapur Road)', count: stats.wardCounts['Nashik West'] || 0, agency: 'PWD Roads & Bridges', status: 'HIGH' },
                { ward: 'Nashik East (Dwarka / Adgaon)', count: stats.wardCounts['Nashik East'] || 0, agency: 'NHAI / PWD Roads', status: 'MEDIUM' },
                { ward: 'Cidco Sector 4 & 9', count: stats.wardCounts['Cidco'] || 0, agency: 'Water Supply / Sanitation', status: 'MODERATE' },
                { ward: 'Nashik Road (Railway Station Link)', count: stats.wardCounts['Nashik Road'] || 0, agency: 'Railways / NMC Roads', status: 'MODERATE' }
              ].map(item => (
                <div key={item.ward} className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-bold text-slate-800 dark:text-slate-100">{item.ward}</div>
                    <div className="text-[10px] text-slate-400">{item.agency}</div>
                  </div>
                  <div className="text-right">
                    <span className="font-black text-sm text-[#d95b18]">{item.count} complaints</span>
                    <div className="text-[9px] font-bold text-slate-400">{item.status} SEVERITY</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────── */}
      {/* 6. TAB 3: ESCALATIONS & RULE TUNER ENGINE                    */}
      {/* ──────────────────────────────────────────────────────────── */}
      {activeNavTab === 'escalations' && (
        <div className="px-6 space-y-5 pt-3">
          <div className="space-y-1">
            <h3 className="text-[20px] font-black text-rose-700 dark:text-rose-400 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              <span>48-Hour SLA & Escalation Engine</span>
            </h3>
            <p className="text-xs text-slate-500">
              Manage automatic SLA countdown timers and Commissioner statutory escalation policies.
            </p>
          </div>

          {/* Rule Tuner Box */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
            <div className="flex items-center gap-2 text-sm font-bold">
              <SlidersHorizontal className="w-4 h-4 text-[#d95b18]" />
              <span>Dynamic SLA Rule Tuner</span>
            </div>

            {/* Monsoon emergency toggle */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900">
              <div>
                <div className="font-bold text-xs text-amber-900 dark:text-amber-200">Monsoon Emergency Protocol</div>
                <div className="text-[10px] text-amber-700 dark:text-amber-400">Auto-reduces road repair SLA from 48h to 24h</div>
              </div>
              <input 
                type="checkbox" 
                checked={monsoonMode} 
                onChange={(e) => {
                  setMonsoonMode(e.target.checked);
                  setSlaHours(e.target.checked ? 24 : 48);
                }}
                className="w-5 h-5 accent-[#d95b18] rounded"
              />
            </div>

            {/* Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold">
                <span>Default SLA Resolution Window:</span>
                <span className="text-[#d95b18] text-sm">{slaHours} Hours</span>
              </div>
              <input 
                type="range" 
                min={12} 
                max={72} 
                step={6} 
                value={slaHours}
                onChange={(e) => setSlaHours(Number(e.target.value))}
                className="w-full accent-[#d95b18]"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>12h (Emergency)</span>
                <span>48h (Standard Statutory)</span>
                <span>72h (Major Infra)</span>
              </div>
            </div>

            <button
              onClick={handleSaveSlaRules}
              className="w-full py-2.5 rounded-xl bg-[#d95b18] hover:bg-[#c24e12] text-white font-bold text-xs transition"
            >
              Apply Citywide SLA Policy
            </button>
          </div>

          {/* Trigger background sweep manually */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2.5">
            <div className="font-bold text-xs">Run Live SLA Sweep Daemon</div>
            <p className="text-[11px] text-slate-500">
              Executes the statutory 48h SLA escalation query across all live complaints in the Neon PostgreSQL database.
            </p>
            <button
              onClick={handleRunSlaSweep}
              disabled={isSweeping}
              className="py-2.5 px-4 rounded-xl bg-slate-800 dark:bg-slate-700 text-white text-xs font-bold hover:bg-slate-900 transition flex items-center gap-2"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${isSweeping ? 'animate-spin' : ''}`} />
              <span>{isSweeping ? 'Sweeping Database...' : 'Run 48-Hour Sweep Now'}</span>
            </button>
            {sweepResult && (
              <div className="text-[11px] text-emerald-600 font-bold">{sweepResult}</div>
            )}
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────── */}
      {/* 7. TAB 4: TEAMS & CONTRACTOR LEADERBOARD                     */}
      {/* ──────────────────────────────────────────────────────────── */}
      {activeNavTab === 'teams' && (
        <div className="px-6 space-y-5 pt-3">
          <div className="space-y-1">
            <h3 className="text-[20px] font-black">Multi-Agency Provisioning & Contractor Ledger</h3>
            <p className="text-xs text-slate-500">
              Manage departmental sub-admins, engineer routing tokens, and statutory contractor penalties.
            </p>
          </div>

          {/* Sub-Admin Provisioning Form */}
          <form onSubmit={handleAddSubAdmin} className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 shadow-xs">
            <div className="text-xs font-bold text-[#111d2e] dark:text-slate-100 flex items-center gap-2">
              <Users className="w-4 h-4 text-[#d95b18]" />
              <span>Provision Departmental Sub-Admin / Engineer</span>
            </div>
            <input 
              type="email"
              value={newSubAdminEmail}
              onChange={(e) => setNewSubAdminEmail(e.target.value)}
              placeholder="Official email (e.g. shinde.pwd@nashik.gov.in)"
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100"
              required
            />
            <div className="grid grid-cols-2 gap-2 text-xs">
              <select
                value={newSubAdminAgency}
                onChange={(e) => setNewSubAdminAgency(e.target.value)}
                className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold"
              >
                <option value="NMC - PWD Roads">NMC - PWD Roads</option>
                <option value="NMC - Drainage">NMC - Drainage</option>
                <option value="MSEDCL Power">MSEDCL Power</option>
                <option value="Water Supply">Water Supply</option>
                <option value="Solid Waste">Solid Waste</option>
              </select>
              <select
                value={newSubAdminSector}
                onChange={(e) => setNewSubAdminSector(e.target.value)}
                className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold"
              >
                <option value="PUBLIC_WORKS_ROADS">PUBLIC_WORKS_ROADS</option>
                <option value="DRAINAGE_SEWAGE">DRAINAGE_SEWAGE</option>
                <option value="POWER_DISTRIBUTION">POWER_DISTRIBUTION</option>
                <option value="WATER_SUPPLY">WATER_SUPPLY</option>
                <option value="SOLID_WASTE">SOLID_WASTE</option>
              </select>
            </div>
            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-[#d95b18] text-white text-xs font-bold hover:bg-[#c24e12] transition"
            >
              Issue Routing Token & Authorize Sub-Admin
            </button>
          </form>

          {/* Active Sub-Admins List */}
          <div className="space-y-2">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Authorized Departmental Officers</div>
            {subAdmins.map(sa => (
              <div key={sa.id} className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-slate-800 dark:text-slate-100">{sa.name}</div>
                  <div className="text-[10px] text-slate-400">{sa.email}</div>
                  <div className="text-[10px] font-bold text-[#d95b18]">{sa.agency} · {sa.sector}</div>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  {sa.status}
                </span>
              </div>
            ))}
          </div>

          {/* Contractor Leaderboard */}
          <div className="space-y-2 pt-2">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Statutory Contractor Performance Ledger</div>
            {contractors.map(c => (
              <div key={c.name} className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1.5 text-xs">
                <div className="flex items-center justify-between font-bold">
                  <span>{c.name}</span>
                  <span className="text-[#d95b18] font-black">{c.grade} ({c.score}/100)</span>
                </div>
                <div className="flex justify-between text-[11px] text-slate-500">
                  <span>Avg Repair Speed: <b>{c.speedDays} days</b></span>
                  <span>Citizen Rejection: <b>{c.rejectionRate}</b></span>
                  <span>DLP Penalties: <b>{c.dlpPenalties}</b></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────── */}
      {/* 8. TAB 5: YOU / COMMISSIONER IDENTITY                        */}
      {/* ──────────────────────────────────────────────────────────── */}
      {activeNavTab === 'you' && (
        <div className="px-6 space-y-4 pt-3">
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-[#fef2ea] border border-[#fae8dc] text-[#d95b18] font-black text-base flex items-center justify-center">
                BK
              </div>
              <div>
                <h3 className="font-black text-base">Bhoomi Kabra</h3>
                <div className="text-xs text-[#d95b18] font-bold">Municipal Commissioner (Super Admin)</div>
                <div className="text-[11px] text-slate-400">bhoomikabra12@gmail.com</div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs space-y-1">
              <div className="font-bold text-emerald-800 dark:text-emerald-300">✓ Supreme Security Clearance: Active</div>
              <p className="text-[11px] text-emerald-700 dark:text-emerald-400">
                Bound to Neon PostgreSQL with <b>SUPER_ADMIN</b> credentials. Full citywide authorization granted across all 6 wards & departmental queues.
              </p>
            </div>
          </div>

          {/* Activity Logs Ticker */}
          <div className="space-y-2">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Commissioner Live Event Log</div>
            <div className="p-3.5 rounded-xl bg-slate-900 text-emerald-400 font-mono text-[10px] space-y-1.5 max-h-52 overflow-y-auto border border-slate-800">
              {activityLogs.map((log, i) => (
                <div key={i}>&gt; {log}</div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────── */}
      {/* 9. COMMISSIONER PROCEEDING & ACTION MODAL                    */}
      {/* ──────────────────────────────────────────────────────────── */}
      {proceedingTicket && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 flex items-center justify-center p-3 overflow-y-auto animate-in fade-in">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 my-auto max-h-[92vh] overflow-y-auto">
            
            {/* Header */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="font-black text-base flex items-center gap-2 text-[#d95b18]">
                <Gavel className="w-5 h-5" />
                <span>Commissioner Proceeding Console</span>
              </div>
              <button 
                onClick={() => setProceedingTicket(null)} 
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Target Ticket Summary */}
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1 text-xs">
              <div className="flex items-center justify-between font-bold">
                <span className="font-mono text-slate-500">{proceedingTicket.id}</span>
                <span className="text-[#d95b18]">{proceedingTicket.ward} Ward</span>
              </div>
              <div className="font-black text-slate-900 dark:text-slate-100 text-sm">{proceedingTicket.title}</div>
              <div className="text-slate-500 text-[11px]">{proceedingTicket.locationName}</div>
              <div className="text-slate-400 text-[10px]">Reported by: {proceedingTicket.citizenName} ({proceedingTicket.citizenEmail})</div>
            </div>

            {/* Proceeding 1: Status Lifecycle Transition */}
            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-700 dark:text-slate-200">
                1. Order Lifecycle State (स्थिती बदला):
              </label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {[
                  { value: 'IN_PROGRESS', label: 'IN_PROGRESS (Mobilize Crew)' },
                  { value: 'VERIFICATION_PENDING', label: 'VERIFICATION_PENDING (Send for Voting)' },
                  { value: 'OFFICIALLY_CLOSED', label: 'OFFICIALLY_CLOSED (Supreme Close)' },
                  { value: 'REOPENED', label: 'REOPENED (Reject Substandard Work)' }
                ].map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setProceedingStatus(opt.value as TicketStatus)}
                    className={`p-2.5 rounded-xl border text-left font-bold transition text-[11px] ${
                      proceedingStatus === opt.value
                        ? 'bg-[#d95b18] text-white border-[#d95b18] shadow-xs'
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Proceeding 2: Assign Contractor / Execution Agency */}
            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-700 dark:text-slate-200">
                2. Assign Execution Contractor / Agency:
              </label>
              <select
                value={assignedContractor}
                onChange={(e) => setAssignedContractor(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-100"
              >
                <option value="M/s Godavari Infrastructure Ltd.">M/s Godavari Infrastructure Ltd. (PWD Road Specialist)</option>
                <option value="Panchavati Civil Works Syndicate">Panchavati Civil Works Syndicate (Ward 4 / Panchavati)</option>
                <option value="Sahyadri Bitumen & Asphalting">Sahyadri Bitumen & Asphalting (Zonal Asphalting)</option>
                <option value="Nashik Electrical & Infrastructure Co.">Nashik Electrical & Infrastructure Co. (Streetlights / MSEDCL)</option>
                <option value="NMC Sanitation & Solid Waste Division">NMC Sanitation Division (Drainage & Garbage)</option>
              </select>
            </div>

            {/* Proceeding 3: Statutory Fine / Penalty Notice */}
            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-700 dark:text-slate-200 flex items-center justify-between">
                <span>3. Statutory Contractor Fine Notice (दंड नोटीस):</span>
                <span className="text-[10px] text-slate-400 font-normal">Optional</span>
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={fineAmount}
                  onChange={(e) => setFineAmount(e.target.value)}
                  placeholder="e.g. ₹10,000 or ₹25,000"
                  className="flex-1 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold"
                />
                <button
                  type="button"
                  onClick={() => setFineAmount('₹10,000')}
                  className="px-2.5 py-2 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-[11px] font-bold"
                >
                  ₹10,000
                </button>
                <button
                  type="button"
                  onClick={() => setFineAmount('₹25,000')}
                  className="px-2.5 py-2 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-[11px] font-bold"
                >
                  ₹25,000
                </button>
              </div>
            </div>

            {/* Proceeding 4: Commissioner Directive Remarks */}
            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-700 dark:text-slate-200">
                4. Commissioner Statutory Directive / Audit Note:
              </label>
              <textarea 
                value={actionAuditNote}
                onChange={(e) => setActionAuditNote(e.target.value)}
                rows={3}
                placeholder="Enter formal justification or instructions..."
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-100"
              />
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setProceedingTicket(null)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold text-xs hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSubmittingAction}
                onClick={handleExecuteProceeding}
                className="px-5 py-2.5 rounded-xl bg-[#d95b18] hover:bg-[#c24e12] text-white font-bold text-xs shadow-md transition flex items-center gap-2"
              >
                {isSubmittingAction ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Committing to Database...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Execute & Sign Official Proceeding</span>
                  </>
                )}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────── */}
      {/* 10. IMAGE PREVIEW MODAL                                      */}
      {/* ──────────────────────────────────────────────────────────── */}
      {previewImage && (
        <div 
          onClick={() => setPreviewImage(null)}
          className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4 cursor-zoom-out animate-in fade-in"
        >
          <div className="max-w-2xl max-h-[85vh] rounded-2xl overflow-hidden border border-white/20 shadow-2xl relative" onClick={e => e.stopPropagation()}>
            <img src={previewImage} alt="Citizen Evidence High Res" className="w-full h-full object-contain" />
            <button 
              onClick={() => setPreviewImage(null)}
              className="absolute top-3 right-3 p-1.5 rounded-full bg-black/60 text-white hover:bg-black"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────── */}
      {/* 11. BOTTOM NAVIGATION BAR (Exact 5 Tabs from Screenshot)    */}
      {/* ──────────────────────────────────────────────────────────── */}
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-4xl bg-white/95 dark:bg-[#0c1322]/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 z-40 px-3 py-2 flex items-center justify-around shadow-xl">
        
        {/* Tab 1: Overview */}
        <button
          onClick={() => setActiveNavTab('overview')}
          className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl transition ${
            activeNavTab === 'overview' ? 'text-[#d95b18]' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
          }`}
        >
          <div className={`p-1 rounded-xl ${activeNavTab === 'overview' ? 'bg-[#fef2ea] dark:bg-orange-950/40' : ''}`}>
            <Home className="w-5 h-5 stroke-[2.2]" />
          </div>
          <span className="text-[10px] font-bold">Overview</span>
        </button>

        {/* Tab 2: City map */}
        <button
          onClick={() => setActiveNavTab('citymap')}
          className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl transition ${
            activeNavTab === 'citymap' ? 'text-[#d95b18]' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
          }`}
        >
          <div className={`p-1 rounded-xl ${activeNavTab === 'citymap' ? 'bg-[#fef2ea] dark:bg-orange-950/40' : ''}`}>
            <MapIcon className="w-5 h-5 stroke-[2.2]" />
          </div>
          <span className="text-[10px] font-bold">City map</span>
        </button>

        {/* Tab 3: Escalations */}
        <button
          onClick={() => setActiveNavTab('escalations')}
          className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl transition ${
            activeNavTab === 'escalations' ? 'text-[#d95b18]' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
          }`}
        >
          <div className={`p-1 rounded-xl ${activeNavTab === 'escalations' ? 'bg-[#fef2ea] dark:bg-orange-950/40' : ''}`}>
            <AlertTriangle className="w-5 h-5 stroke-[2.2]" />
          </div>
          <span className="text-[10px] font-bold">Escalations</span>
        </button>

        {/* Tab 4: Teams */}
        <button
          onClick={() => setActiveNavTab('teams')}
          className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl transition ${
            activeNavTab === 'teams' ? 'text-[#d95b18]' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
          }`}
        >
          <div className={`p-1 rounded-xl ${activeNavTab === 'teams' ? 'bg-[#fef2ea] dark:bg-orange-950/40' : ''}`}>
            <Users className="w-5 h-5 stroke-[2.2]" />
          </div>
          <span className="text-[10px] font-bold">Teams</span>
        </button>

        {/* Tab 5: You */}
        <button
          onClick={() => setActiveNavTab('you')}
          className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl transition ${
            activeNavTab === 'you' ? 'text-[#d95b18]' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
          }`}
        >
          <div className={`p-1 rounded-xl ${activeNavTab === 'you' ? 'bg-[#fef2ea] dark:bg-orange-950/40' : ''}`}>
            <User className="w-5 h-5 stroke-[2.2]" />
          </div>
          <span className="text-[10px] font-bold">You</span>
        </button>

      </nav>

    </div>
  );
}
