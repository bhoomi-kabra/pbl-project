'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/lib/AppContext';
import { Ticket, Ward } from '@/lib/types';
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
  Check
} from 'lucide-react';

interface SuperAdminDashboardProps {
  tickets?: Ticket[];
  onInspectTicket?: (ticketId: string) => void;
  onNavigateToMap?: () => void;
}

export default function SuperAdminDashboard({
  tickets = [],
  onInspectTicket,
  onNavigateToMap
}: SuperAdminDashboardProps) {
  const { language, setLanguage, currentUser } = useApp();

  // Bottom navigation tab state
  const [activeNavTab, setActiveNavTab] = useState<'overview' | 'citymap' | 'escalations' | 'teams' | 'you'>('overview');

  // Filter department state
  const [selectedAgency, setSelectedAgency] = useState<string>('All');
  const [agencyDropdownOpen, setAgencyDropdownOpen] = useState(false);

  // Dynamic Rule Tuner Engine state (Section 2)
  const [slaHours, setSlaHours] = useState<number>(48);
  const [monsoonMode, setMonsoonMode] = useState<boolean>(false);
  const [ruleSavedToast, setRuleSavedToast] = useState(false);

  // SLA sweep state
  const [isSweeping, setIsSweeping] = useState(false);
  const [sweepResult, setSweepResult] = useState<string | null>(null);

  // Supreme Administrative Override state (Section 4)
  const [overrideModalTicket, setOverrideModalTicket] = useState<any | null>(null);
  const [auditReason, setAuditReason] = useState('');
  const [auditSuccessToast, setAuditSuccessToast] = useState(false);

  // Sub-Admin Provisioning state (Section 3)
  const [subAdmins, setSubAdmins] = useState([
    { id: 'usr-sub-1', name: 'Er. Rajesh Shinde', email: 'shinde.pwd@nashik.gov.in', agency: 'NMC - PWD', sector: 'PUBLIC_WORKS_ROADS', status: 'ACTIVE' },
    { id: 'usr-sub-2', name: 'Er. Sneha Kulkarni', email: 'kulkarni.drainage@nashik.gov.in', agency: 'NMC - Drainage', sector: 'DRAINAGE_SEWAGE', status: 'ACTIVE' },
    { id: 'usr-sub-3', name: 'Er. Vikram Pawar', email: 'pawar.msedcl@mahadiscom.in', agency: 'MSEDCL - Power', sector: 'POWER_DISTRIBUTION', status: 'ACTIVE' },
    { id: 'usr-sub-4', name: 'Er. Amit Joshi', email: 'joshi.nhai@nhai.gov.in', agency: 'NHAI Highway Wing', sector: 'HIGHWAY_MAINTENANCE', status: 'ACTIVE' }
  ]);
  const [newSubAdminEmail, setNewSubAdminEmail] = useState('');
  const [newSubAdminAgency, setNewSubAdminAgency] = useState('NMC - PWD');
  const [newSubAdminSector, setNewSubAdminSector] = useState('PUBLIC_WORKS_ROADS');

  // Contractor Leaderboard state
  const [contractors] = useState([
    { name: 'M/s Godavari Infrastructure Ltd.', speedDays: 1.8, rejectionRate: '4.2%', dlpPenalties: '₹0', score: 96, grade: 'A+' },
    { name: 'Panchavati Civil Works Syndicate', speedDays: 2.3, rejectionRate: '7.8%', dlpPenalties: '₹15,000', score: 88, grade: 'A' },
    { name: 'Sahyadri Bitumen & Asphalting', speedDays: 4.1, rejectionRate: '18.5%', dlpPenalties: '₹45,000', score: 64, grade: 'C (Watchlist)' }
  ]);

  // Live WebSocket system ticker logs
  const [activityLogs, setActivityLogs] = useState<string[]>([
    '09:41:12 IST - System initialized under Super Admin clearance (Commissioner)',
    '09:38:40 IST - Ticket #DM-101 SLA exceeded 48h threshold. Auto-escalated to Commissioner',
    '09:32:15 IST - MSEDCL Field Officer acknowledged streetlight black spot in Satpur MIDC',
    '09:20:04 IST - Citizen verification quorum achieved for Ramkund Godavari Walkway',
    '09:05:22 IST - Ward 4 Panchavati 48h SLA sweep completed: 0 critical breaches'
  ]);

  // Handlers
  const handleSaveSlaRules = () => {
    setRuleSavedToast(true);
    setActivityLogs(prev => [
      `${new Date().toLocaleTimeString()} IST - Commissioner overridden SLA deadline to ${slaHours}h (Monsoon mode: ${monsoonMode ? 'ON' : 'OFF'})`,
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
        `${new Date().toLocaleTimeString()} IST - Manual 48h SLA sweep triggered by Commissioner: ${data.escalated_count || 0} tickets escalated`,
        ...prev
      ]);
    } catch (err: any) {
      setSweepResult('SLA Sweep completed (Simulated live engine).');
    } finally {
      setIsSweeping(false);
    }
  };

  const handleSupremeOverride = (ticket: any) => {
    setOverrideModalTicket(ticket);
    setAuditReason('Emergency Public Safety Audit: Official physical inspection verified repair adherence to IRC municipal norms.');
  };

  const executeSupremeOverride = () => {
    if (!overrideModalTicket) return;
    setAuditSuccessToast(true);
    setActivityLogs(prev => [
      `${new Date().toLocaleTimeString()} IST - SUPREME OVERRIDE: Ticket ${overrideModalTicket.id} force-closed by Commissioner (Citizen quorum bypassed)`,
      ...prev
    ]);
    setTimeout(() => {
      setAuditSuccessToast(false);
      setOverrideModalTicket(null);
    }, 2000);
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
      `${new Date().toLocaleTimeString()} IST - Sub-Admin provisioning: ${newSubAdminEmail} bound to ${newSubAdminAgency} (${newSubAdminSector})`,
      ...prev
    ]);
    setNewSubAdminEmail('');
  };

  // Static demo records matching user screenshot
  const displayTickets = [
    {
      id: 'DM-101',
      agencyTag: 'PWD - Roads',
      statusTag: 'SLA breached',
      statusColor: 'text-rose-600',
      title: 'Two deep potholes at the junction',
      citizen: 'Rahul Deshmukh',
      address: '18 Gangapur Road, near College Road junction, Nashik 422005',
      latLng: '19.9996° N, 73.7638° E',
      timeLogged: '05 Oct 2026 · 08:15 IST',
      overdueText: '48h response SLA · Overdue by 1h 26m',
      isBreached: true
    },
    {
      id: 'DM-102',
      agencyTag: 'PWD - Roads',
      statusTag: 'Awaiting crew',
      statusColor: 'text-amber-600',
      title: 'Road asphalt cracks along the lane',
      citizen: 'Aditi Patil',
      address: '42 Hirawadi Road, Vidhate Nagar, Nashik 422003',
      latLng: '20.0208° N, 73.8074° E',
      timeLogged: '07 Oct 2026 · 07:50 IST',
      isBreached: false
    },
    {
      id: 'DM-103',
      agencyTag: 'Drainage',
      statusTag: 'Pending review',
      statusColor: 'text-[#d95b18]',
      title: 'Uncovered drainage manhole',
      citizen: 'Bhoomi Kabra',
      address: '7 Ramkund Road, Panchavati, Nashik 422003',
      latLng: '20.0064° N, 73.7902° E',
      timeLogged: '07 Oct 2026 · 08:30 IST',
      isBreached: false
    }
  ];

  return (
    <div className="w-full max-w-md sm:max-w-xl mx-auto bg-white dark:bg-[#0c1322] min-h-screen text-[#111d2e] dark:text-slate-100 flex flex-col shadow-2xl relative pb-24 font-sans select-none border-x border-slate-200/80 dark:border-slate-800">

      {/* ──────────────────────────────────────────────────────────── */}
      {/* 1. TOP MOBILE SYSTEM STATUS BAR (9:41, Icons)               */}
      {/* ──────────────────────────────────────────────────────────── */}
      <div className="px-6 pt-3 pb-1 flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200 tracking-tight">
        <span>9:41</span>
        <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
          <span className="text-[11px]">5G</span>
          <div className="w-4 h-2.5 border border-current rounded-xs flex items-center p-0.5">
            <div className="w-full h-full bg-current rounded-2xs" />
          </div>
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────── */}
      {/* 2. BRAND APP HEADER (Exact match with screenshot)           */}
      {/* ──────────────────────────────────────────────────────────── */}
      <header className="px-6 py-3 flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80">
        <div className="flex items-center gap-3">
          {/* Orange Logo Box */}
          <div className="w-10 h-10 rounded-xl bg-[#d95b18] text-white flex items-center justify-center shadow-xs">
            <Share2 className="w-5 h-5 stroke-[2.4]" />
          </div>
          <div>
            <h1 className="text-[18px] font-black text-[#111d2e] dark:text-slate-100 leading-tight tracking-tight">
              Nashik Monitor
            </h1>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              Commissioner - Citywide oversight
            </p>
          </div>
        </div>

        {/* Right Header Controls: EN/MR & Help */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setLanguage(language === 'en' ? 'mr' : 'en')}
            className="px-2.5 py-1 rounded-full border border-slate-200 dark:border-slate-700 text-[11px] font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
          >
            {language === 'en' ? 'EN / म' : 'म / EN'}
          </button>
          <button 
            className="w-7 h-7 rounded-full border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            title="Commissioner Help & SOP Guide"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* ──────────────────────────────────────────────────────────── */}
      {/* 3. MAIN DASHBOARD HEADING & TIME BADGE                       */}
      {/* ──────────────────────────────────────────────────────────── */}
      <div className="px-6 pt-5 pb-3 space-y-1">
        <h2 className="text-[26px] sm:text-[28px] font-black text-[#111d2e] dark:text-slate-100 tracking-tight">
          Super Admin Dashboard
        </h2>
        <div className="flex items-center justify-between text-[11px]">
          <span className="px-2.5 py-0.5 rounded-full font-bold bg-[#fef2ea] text-[#d95b18] border border-[#fae8dc]">
            Demo data
          </span>
          <span className="text-slate-400 dark:text-slate-500 font-medium">
            07 Oct 2026 · 09:41 IST
          </span>
        </div>
        <p className="text-[12px] text-slate-500 dark:text-slate-400 pt-0.5">
          Illustrative records, locations and assignments.
        </p>
      </div>

      {/* Dynamic Toast Notifications */}
      {ruleSavedToast && (
        <div className="mx-6 p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700 rounded-xl text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>✓ SLA Countdown rules updated & synced city-wide!</span>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────── */}
      {/* 4. TAB 1: OVERVIEW (Exact Screenshot UI)                     */}
      {/* ──────────────────────────────────────────────────────────── */}
      {activeNavTab === 'overview' && (
        <div className="px-6 space-y-5 pt-2">
          
          {/* SECTION A: GLOBAL MAP CARD */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[16px] font-black text-[#111d2e] dark:text-slate-100">
                Global map
              </span>
              <div className="relative">
                <button
                  onClick={() => setAgencyDropdownOpen(!agencyDropdownOpen)}
                  className="text-[13px] font-bold text-[#d95b18] hover:underline flex items-center gap-1"
                >
                  <span>{selectedAgency === 'All' ? 'All departments' : selectedAgency}</span>
                  <ChevronRight className="w-3.5 h-3.5 rotate-90" />
                </button>
                {agencyDropdownOpen && (
                  <div className="absolute right-0 mt-1 w-48 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl z-20 py-1 text-xs">
                    {['All', 'PWD - Roads', 'Drainage & Sewage', 'MSEDCL - Electrical', 'Water Supply', 'NHAI Highway'].map(a => (
                      <button
                        key={a}
                        onClick={() => {
                          setSelectedAgency(a);
                          setAgencyDropdownOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 font-semibold"
                      >
                        {a}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Visual GIS Map Box */}
            <div className="relative h-44 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-[#d9eff0] dark:bg-[#122b3b] shadow-xs">
              
              {/* Map Graphic Lines (Abstract Nashik Wards) */}
              <svg className="w-full h-full opacity-60" viewBox="0 0 400 200" preserveAspectRatio="none">
                <path d="M 40,80 Q 150,40 240,90 T 380,120" fill="none" stroke="#bfe1e3" strokeWidth="18" />
                <path d="M 100,180 L 160,50 L 320,80 L 300,180 Z" fill="none" stroke="#ffffff" strokeWidth="5" strokeDasharray="6,4" />
                <circle cx="120" cy="90" r="35" fill="#cbe7eb" opacity="0.6" />
                <circle cx="280" cy="110" r="45" fill="#cbe7eb" opacity="0.6" />
              </svg>

              {/* Ward Labels */}
              <div className="absolute top-4 left-4 text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
                Gangapur
              </div>
              <div className="absolute top-4 right-6 text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
                Panchavati
              </div>
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-[12px] font-black text-slate-700 dark:text-slate-300 tracking-wider">
                Nashik
              </div>

              {/* Interactive Map Alert Pins matching screenshot */}
              <button 
                onClick={() => setActiveNavTab('escalations')}
                className="absolute top-10 left-8 px-3 py-1.5 rounded-full bg-[#dc2626] text-white text-[11px] font-bold shadow-md flex items-center gap-1 hover:scale-105 transition"
              >
                <MapPin className="w-3.5 h-3.5 fill-white" />
                <span>1 overdue</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>

              <button 
                onClick={() => setActiveNavTab('citymap')}
                className="absolute top-8 right-6 px-3 py-1.5 rounded-full bg-[#ea580c] text-white text-[11px] font-bold shadow-md flex items-center gap-1 hover:scale-105 transition"
              >
                <MapPin className="w-3.5 h-3.5 fill-white" />
                <span>2 reports</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>

              {/* Bottom pill tag & expand button */}
              <div className="absolute bottom-3 left-3 px-2 py-0.5 rounded-md bg-white/90 dark:bg-slate-900/90 text-[9px] font-black text-slate-600 dark:text-slate-300 tracking-wider border border-slate-200 dark:border-slate-700">
                ILLUSTRATIVE MAP - DEMO PINS
              </div>
              <button 
                onClick={() => onNavigateToMap ? onNavigateToMap() : setActiveNavTab('citymap')}
                className="absolute bottom-3 right-3 w-7 h-7 rounded-lg bg-white/90 dark:bg-slate-900/90 flex items-center justify-center text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-white"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Summary Row */}
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-600 dark:text-slate-400 px-1">
              <span>3 open reports</span>
              <span>2 Roads · 1 Drainage</span>
            </div>
          </div>

          {/* SECTION B: GLOBAL SYSTEM FEED (Exact Cards) */}
          <div className="space-y-3 pt-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="text-[18px] font-black text-[#111d2e] dark:text-slate-100">
                  Global System Feed
                </h3>
                <span className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 text-[11px] font-black text-slate-600 dark:text-slate-300 flex items-center justify-center">
                  3
                </span>
              </div>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Public complaints · All departments · Full details
            </p>

            {/* The 3 Cards */}
            <div className="space-y-3">
              {displayTickets.map(tkt => (
                <div 
                  key={tkt.id}
                  className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-2 hover:border-[#d95b18]/40 transition"
                >
                  {/* Card Header */}
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-slate-500 dark:text-slate-400">
                      {tkt.id} · {tkt.agencyTag}
                    </span>
                    <span className={`${tkt.statusColor}`}>
                      {tkt.statusTag}
                    </span>
                  </div>

                  {/* Title */}
                  <h4 className="text-[15px] font-bold text-[#111d2e] dark:text-slate-100 leading-snug">
                    {tkt.title}
                  </h4>

                  {/* Meta details */}
                  <div className="text-[12px] space-y-0.5 text-slate-600 dark:text-slate-300">
                    <div>
                      <span className="font-bold text-[#111d2e] dark:text-slate-200">Citizen: </span>
                      <span>{tkt.citizen}</span>
                    </div>
                    <div>
                      <span className="font-bold text-[#111d2e] dark:text-slate-200">Address: </span>
                      <span className="text-slate-500 dark:text-slate-400">{tkt.address}</span>
                    </div>
                    <div className="text-[11px] text-slate-400 pt-0.5">
                      Lat / Long: {tkt.latLng}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Time Logged: {tkt.timeLogged}
                    </div>
                  </div>

                  {/* Action Bar (Supreme Override) */}
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <button
                      onClick={() => handleSupremeOverride(tkt)}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-[#d95b18] hover:text-white text-[11px] font-bold text-slate-700 dark:text-slate-300 transition flex items-center gap-1.5"
                    >
                      <Gavel className="w-3.5 h-3.5" />
                      <span>Supreme Override</span>
                    </button>
                    <button
                      onClick={() => onInspectTicket ? onInspectTicket(tkt.id) : null}
                      className="text-[11px] font-bold text-[#d95b18] hover:underline"
                    >
                      Inspect Evidence ➔
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SECTION C: SLA BREACHES CARD (Matching Exact Screenshot) */}
          <div className="p-4.5 rounded-2xl bg-[#fff5f5] dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/60 space-y-3 shadow-xs">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-rose-700 dark:text-rose-400 font-black text-[14px]">
                <AlertTriangle className="w-4 h-4" />
                <span>SLA Breaches</span>
              </div>
              <div className="flex items-center gap-1 text-[10px] font-black text-rose-600 tracking-wider">
                <span className="w-2 h-2 rounded-full bg-rose-600 animate-ping" />
                <span>● LIVE - DEMO</span>
              </div>
            </div>

            {/* Escalated button */}
            <div>
              <span className="inline-block px-3 py-1 rounded-lg bg-[#b91c1c] text-white text-[11px] font-bold tracking-tight">
                Escalated to Commissioner
              </span>
            </div>

            {/* Details */}
            <div className="space-y-1 text-xs">
              <div className="font-bold text-[#111d2e] dark:text-slate-100 text-[13px]">
                DM-101 · Gangapur Road · PWD Roads
              </div>
              <div className="text-rose-600 font-bold">
                48h response SLA · Overdue by 1h 26m
              </div>
              <div className="text-rose-500 font-medium text-[11px]">
                Due 07 Oct, 08:15 IST · Repair in progress
              </div>
            </div>

            <div className="text-[10px] text-slate-400 pt-1">
              Illustrative escalation · Snapshot at 09:41 IST
            </div>
          </div>

        </div>
      )}

      {/* ──────────────────────────────────────────────────────────── */}
      {/* 5. TAB 2: CROSS-AGENCY HEATMAP MATRIX (City map)             */}
      {/* ──────────────────────────────────────────────────────────── */}
      {activeNavTab === 'citymap' && (
        <div className="px-6 space-y-4 pt-3">
          <div className="space-y-1">
            <h3 className="text-[20px] font-black">Cross-Agency Heatmap Matrix</h3>
            <p className="text-xs text-slate-500">
              Unified multi-tenant spatial overlay across Nashik municipal jurisdictions.
            </p>
          </div>

          {/* Agency Filter Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
            {['ALL AGENCIES', 'NMC ROADS', 'MSEDCL POWER', 'DRAINAGE/SEWER', 'NHAI HIGHWAY'].map(tag => (
              <button 
                key={tag}
                className="px-3 py-1.5 rounded-full font-bold whitespace-nowrap bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-[#d95b18] hover:text-white transition"
              >
                {tag}
              </button>
            ))}
          </div>

          {/* Heatmap Matrix Card */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="text-xs font-bold text-slate-600 dark:text-slate-300">
              Ward Bottleneck Index:
            </div>
            <div className="space-y-2">
              {[
                { ward: 'Satpur MIDC', count: '4 bottlenecks', agency: 'MSEDCL / PWD', level: 'HIGH (RED)' },
                { ward: 'Panchavati (Ramkund)', count: '2 bottlenecks', agency: 'NMC Drainage', level: 'MEDIUM (AMBER)' },
                { ward: 'CIDCO Sector 4', count: '1 bottleneck', agency: 'Water Supply', level: 'LOW (GREEN)' }
              ].map(item => (
                <div key={item.ward} className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-bold">{item.ward}</div>
                    <div className="text-[10px] text-slate-400">{item.agency}</div>
                  </div>
                  <span className="font-black text-[#d95b18]">{item.count}</span>
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
              Manage automatic SLA timers and Commissioner escalation rules.
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
                <span>48h (Standard)</span>
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

          {/* Trigger background cron manually */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2.5">
            <div className="font-bold text-xs">Run SLA Background Sweep Daemon</div>
            <p className="text-[11px] text-slate-500">
              Executes the TypeScript 48h SLA scheduler query across all database queues.
            </p>
            <button
              onClick={handleRunSlaSweep}
              disabled={isSweeping}
              className="py-2 px-4 rounded-xl bg-slate-800 dark:bg-slate-700 text-white text-xs font-bold hover:bg-slate-900 transition flex items-center gap-2"
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
            <h3 className="text-[20px] font-black">Multi-Tenant Agency & Sub-Admin Control</h3>
            <p className="text-xs text-slate-500">
              Provision departmental engineer routing tokens & audit repair contractor performance.
            </p>
          </div>

          {/* Sub-Admin Provisioning Form */}
          <form onSubmit={handleAddSubAdmin} className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 shadow-xs">
            <div className="text-xs font-bold text-[#111d2e] dark:text-slate-100 flex items-center gap-2">
              <Users className="w-4 h-4 text-[#d95b18]" />
              <span>Provision New Departmental Sub-Admin</span>
            </div>
            <input 
              type="email"
              value={newSubAdminEmail}
              onChange={(e) => setNewSubAdminEmail(e.target.value)}
              placeholder="Officer email (e.g. shinde.pwd@nashik.gov.in)"
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100"
              required
            />
            <div className="grid grid-cols-2 gap-2 text-xs">
              <select
                value={newSubAdminAgency}
                onChange={(e) => setNewSubAdminAgency(e.target.value)}
                className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold"
              >
                <option value="NMC - PWD">NMC - PWD</option>
                <option value="NMC - Drainage">NMC - Drainage</option>
                <option value="MSEDCL Power">MSEDCL Power</option>
                <option value="Water Supply">Water Supply</option>
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
              </select>
            </div>
            <button
              type="submit"
              className="w-full py-2 rounded-xl bg-[#d95b18] text-white text-xs font-bold hover:bg-[#c24e12] transition"
            >
              Issue Routing Token & Authorize Sub-Admin
            </button>
          </form>

          {/* Active Sub-Admins */}
          <div className="space-y-2">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Authorized Departmental Officers</div>
            {subAdmins.map(sa => (
              <div key={sa.id} className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold">{sa.name}</div>
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
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Contractor Performance Scorecards</div>
            {contractors.map(c => (
              <div key={c.name} className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1.5 text-xs">
                <div className="flex items-center justify-between font-bold">
                  <span>{c.name}</span>
                  <span className="text-[#d95b18] font-black">{c.grade} ({c.score}/100)</span>
                </div>
                <div className="flex justify-between text-[11px] text-slate-500">
                  <span>Avg Speed: <b>{c.speedDays} days</b></span>
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
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
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
              <div className="font-bold text-emerald-800 dark:text-emerald-300">✓ Database Security Clearance: Verified</div>
              <p className="text-[11px] text-emerald-700 dark:text-emerald-400">
                Bound to Neon PostgreSQL with <b>SUPER_ADMIN</b> credentials. Full citywide authorization granted across all 6 wards & departmental queues.
              </p>
            </div>
          </div>

          {/* Activity Logs Ticker */}
          <div className="space-y-2">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Live System Intercept Ticker</div>
            <div className="p-3 rounded-xl bg-slate-900 text-emerald-400 font-mono text-[10px] space-y-1.5 max-h-48 overflow-y-auto">
              {activityLogs.map((log, i) => (
                <div key={i}>&gt; {log}</div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────── */}
      {/* 9. SUPREME OVERRIDE MODAL                                    */}
      {/* ──────────────────────────────────────────────────────────── */}
      {overrideModalTicket && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="font-black text-sm flex items-center gap-2 text-[#d95b18]">
                <Gavel className="w-4 h-4" />
                <span>Supreme Administrative Override</span>
              </div>
              <button onClick={() => setOverrideModalTicket(null)} className="text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-xs text-slate-600 dark:text-slate-300 space-y-1">
              <div className="font-bold">{overrideModalTicket.title}</div>
              <div className="text-slate-400">{overrideModalTicket.address}</div>
              <p className="pt-1">
                Bypasses citizen quorum to force-archive this ticket into officially closed status under executive authority.
              </p>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-500">Official Audit Rationale</label>
              <textarea 
                value={auditReason}
                onChange={(e) => setAuditReason(e.target.value)}
                rows={3}
                className="w-full p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
              />
            </div>

            {auditSuccessToast ? (
              <div className="p-2.5 bg-emerald-100 text-emerald-800 rounded-xl text-xs font-bold text-center">
                ✓ Overridden & Archived into Municipal Record!
              </div>
            ) : (
              <button
                onClick={executeSupremeOverride}
                className="w-full py-2.5 rounded-xl bg-[#d95b18] hover:bg-[#c24e12] text-white font-bold text-xs transition"
              >
                Sign & Force Close Ticket
              </button>
            )}
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────── */}
      {/* 10. BOTTOM NAVIGATION BAR (Exact 5 Tabs from Screenshot)    */}
      {/* ──────────────────────────────────────────────────────────── */}
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md sm:max-w-xl bg-white dark:bg-[#0c1322] border-t border-slate-200 dark:border-slate-800 z-40 px-3 py-2 flex items-center justify-around shadow-lg">
        
        {/* Tab 1: Overview */}
        <button
          onClick={() => setActiveNavTab('overview')}
          className={`flex flex-col items-center gap-0.5 py-1 px-2.5 rounded-xl transition ${
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
          className={`flex flex-col items-center gap-0.5 py-1 px-2.5 rounded-xl transition ${
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
          className={`flex flex-col items-center gap-0.5 py-1 px-2.5 rounded-xl transition ${
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
          className={`flex flex-col items-center gap-0.5 py-1 px-2.5 rounded-xl transition ${
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
          className={`flex flex-col items-center gap-0.5 py-1 px-2.5 rounded-xl transition ${
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
