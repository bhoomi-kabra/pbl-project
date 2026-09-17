import React, { useState, useEffect } from 'react';
import { CivicTicket, WardName, Language, ThemeMode, DepartmentType, RoadWorkProject, LifecycleState } from '../types';
import { translations } from '../data/translations';
import { LayoutDashboard, BarChart3, AlertCircle, CheckCircle2, Clock, MapPin, ShieldAlert, ArrowUpRight, TrendingUp, Flame, Filter, Camera, ShieldCheck, RefreshCw, Users, UserCheck, Phone, Mail, PlusCircle, Download, FileText, HardHat } from 'lucide-react';
import { fetchRegisteredUsers, UserAccount, exportWardReportData } from '../services/api';

interface AdminDashboardProps {
  tickets: CivicTicket[];
  roadProjects?: RoadWorkProject[];
  language: Language;
  theme: ThemeMode;
  selectedWard: WardName;
  onSelectWard: (ward: WardName) => void;
  onAdminResolveTicket?: (ticketId: string, proofPhotoUrl: string, notes?: string) => void;
  onCreateProject?: (projectData: Partial<RoadWorkProject>) => void;
  onUpdateProjectStatus?: (projectId: string, state: LifecycleState) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  tickets,
  roadProjects = [],
  language,
  theme,
  selectedWard,
  onSelectWard,
  onAdminResolveTicket,
  onCreateProject,
  onUpdateProjectStatus,
}) => {
  const isDark = theme === 'dark';
  const t = translations[language];

  const wardsList: WardName[] = ['Panchavati', 'Nashik East', 'Nashik West', 'Cidco', 'Satpur', 'Nashik Road'];
  const [selectedDept, setSelectedDept] = useState<DepartmentType | 'ALL'>('ALL');
  const [activeTab, setActiveTab] = useState<'PRIORITY_QUEUE' | 'ROAD_PROJECTS' | 'REGISTERED_USERS' | 'EXPORT_REPORTS'>('PRIORITY_QUEUE');
  
  const [usersList, setUsersList] = useState<UserAccount[]>([]);
  const [selectedTicketForProof, setSelectedTicketForProof] = useState<CivicTicket | null>(null);
  const [proofPhotoUrl, setProofPhotoUrl] = useState('');
  const [resolutionNotes, setResolutionNotes] = useState('');

  // Road Project Creation Form State
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [tenderIdInput, setTenderIdInput] = useState('');
  const [roadNameInput, setRoadNameInput] = useState('');
  const [budgetInput, setBudgetInput] = useState('');
  const [contractorInput, setContractorInput] = useState('');
  const [dlpInput, setDlpInput] = useState('36 Months DLP');
  const [projectWardInput, setProjectWardInput] = useState<WardName>('Panchavati');

  useEffect(() => {
    async function loadUsers() {
      const dbUsers = await fetchRegisteredUsers();
      if (dbUsers && dbUsers.length > 0) {
        setUsersList(dbUsers);
      } else {
        setUsersList([
          { id: 'u-1', name: 'Aarav Deshmukh', mobile: '9823011223', email: 'aarav@gmail.com', role: 'CITIZEN', ward: 'Panchavati' },
          { id: 'u-2', name: 'Priya Joshi', mobile: '9890123456', email: 'priya@gmail.com', role: 'CITIZEN', ward: 'Nashik West' },
          { id: 'u-3', name: 'Kiran Wagh', mobile: '9765432109', email: 'kiran@gmail.com', role: 'CITIZEN', ward: 'Cidco' },
          { id: 'u-admin', name: 'Er. M. S. Patil', mobile: '9999999999', email: 'admin@nashik.gov.in', role: 'ADMIN', ward: 'All Wards' }
        ]);
      }
    }
    loadUsers();
  }, []);

  // Filter tickets by ward and department
  const filteredTickets = tickets.filter((tk) => {
    if (selectedWard !== 'All Wards' && tk.ward !== selectedWard) return false;
    if (selectedDept !== 'ALL' && tk.department !== selectedDept) return false;
    return true;
  });

  // Sort complaints by High-Risk Impact Score
  const highRiskQueue = [...filteredTickets].sort((a, b) => (b.impactScore || 0) - (a.impactScore || 0));

  const totalComplaints = filteredTickets.length;
  const verifiedClosed = filteredTickets.filter((tk) => tk.status === 'CLOSED_VERIFIED' || tk.status === 'EVIDENCE_UPLOADED').length;
  const pendingVerification = filteredTickets.filter((tk) => tk.status === 'VERIFICATION_PENDING' || tk.status === 'SUBMITTED' || tk.status === 'IN_PROGRESS').length;
  const reopenedEscalated = filteredTickets.filter((tk) => tk.status === 'REOPENED_ESCALATED').length;

  const resolutionRate = totalComplaints > 0 ? Math.round((verifiedClosed / totalComplaints) * 100) : 0;

  const handleResolveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicketForProof) return;

    const finalPhoto = proofPhotoUrl || 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=600&auto=format&fit=crop&q=80';
    if (onAdminResolveTicket) {
      onAdminResolveTicket(selectedTicketForProof.id, finalPhoto, resolutionNotes);
    }
    setSelectedTicketForProof(null);
    setProofPhotoUrl('');
    setResolutionNotes('');
  };

  return (
    <section className={`py-8 px-4 border-b transition-colors duration-300 ${isDark ? 'bg-slate-950/80 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header Title Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 p-0.5 shadow-lg flex items-center justify-center">
              <div className={`w-full h-full rounded-[14px] flex items-center justify-center ${isDark ? 'bg-slate-950 text-indigo-400' : 'bg-white text-indigo-600'}`}>
                <LayoutDashboard className="w-6 h-6" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className={`text-xl font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Municipal Admin Control Center
                </h2>
                <span className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[10px] font-mono font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                  🛡️ Official Officer Portal
                </span>
              </div>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                Real-time complaint triage, citizen account registry & resolution proof manager
              </p>
            </div>
          </div>

          {/* Quick Ward Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
            <button
              onClick={() => onSelectWard('All Wards')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                selectedWard === 'All Wards'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : isDark
                  ? 'bg-slate-900 text-slate-400 hover:bg-slate-800'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {t.allWards}
            </button>
            {wardsList.map((w) => (
              <button
                key={w}
                onClick={() => onSelectWard(w)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                  selectedWard === w
                    ? 'bg-indigo-600 text-white shadow-md'
                    : isDark
                    ? 'bg-slate-900 text-slate-400 hover:bg-slate-800'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {w}
              </button>
            ))}
          </div>
        </div>

        {/* Top Navigation Tabs for Admin */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('PRIORITY_QUEUE')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-2 transition whitespace-nowrap ${
              activeTab === 'PRIORITY_QUEUE'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Flame className="w-4 h-4 text-red-400" />
            <span>Emergency Priority Queue ({highRiskQueue.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('ROAD_PROJECTS')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-2 transition whitespace-nowrap ${
              activeTab === 'ROAD_PROJECTS'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <HardHat className="w-4 h-4 text-amber-400" />
            <span>Road Projects & DLP ({roadProjects.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('REGISTERED_USERS')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-2 transition whitespace-nowrap ${
              activeTab === 'REGISTERED_USERS'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Users className="w-4 h-4 text-emerald-400" />
            <span>Registered Citizens ({usersList.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('EXPORT_REPORTS')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-2 transition whitespace-nowrap ${
              activeTab === 'EXPORT_REPORTS'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <FileText className="w-4 h-4 text-blue-400" />
            <span>Export Reports (CSV/PDF)</span>
          </button>
        </div>

        {/* Top Analytics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className={`p-5 rounded-2xl border transition-all ${isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
            <div className="flex items-center justify-between">
              <span className={`text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Total Complaints</span>
              <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-bold">
                <BarChart3 className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <span className={`text-3xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>{totalComplaints}</span>
              <span className="text-xs font-semibold text-emerald-500 flex items-center gap-0.5">
                <TrendingUp className="w-3.5 h-3.5" /> Database Live
              </span>
            </div>
          </div>

          <div className={`p-5 rounded-2xl border transition-all ${isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
            <div className="flex items-center justify-between">
              <span className={`text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Pending Triage</span>
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <span className="text-3xl font-black text-amber-400">{pendingVerification}</span>
              <span className="text-xs font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                Action Needed
              </span>
            </div>
          </div>

          <div className={`p-5 rounded-2xl border transition-all ${isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
            <div className="flex items-center justify-between">
              <span className={`text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Resolved with Proof</span>
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <span className="text-3xl font-black text-emerald-400">{verifiedClosed}</span>
              <span className="text-xs font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                {resolutionRate}% Closed
              </span>
            </div>
          </div>

          <div className={`p-5 rounded-2xl border transition-all ${isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
            <div className="flex items-center justify-between">
              <span className={`text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Reopened Escalations</span>
              <div className="w-8 h-8 rounded-xl bg-red-500/10 text-red-400 flex items-center justify-center font-bold">
                <ShieldAlert className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <span className="text-3xl font-black text-red-400">{reopenedEscalated}</span>
              <span className="text-xs font-bold text-red-400 bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20">
                High Priority
              </span>
            </div>
          </div>
        </div>

        {/* TAB 1: EMERGENCY PRIORITY QUEUE */}
        {activeTab === 'PRIORITY_QUEUE' && (
          <div className="space-y-4">
            {/* Inter-Departmental Filter Bar */}
            <div className={`p-3 rounded-2xl border flex items-center gap-2 overflow-x-auto text-xs font-bold ${
              isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
            }`}>
              <span className="text-slate-400 flex items-center gap-1 shrink-0 font-mono text-[11px]">
                <Filter className="w-3.5 h-3.5 text-indigo-400" /> Department:
              </span>
              {[
                { id: 'ALL', label: 'All Departments' },
                { id: 'PWD_ROADS', label: '🛣️ PWD Roads' },
                { id: 'WATER_SUPPLY', label: '💧 Water Board' },
                { id: 'MSEDCL_ELECTRICAL', label: '⚡ MSEDCL Power' },
                { id: 'DRAINAGE_SEWERAGE', label: '🏗️ Drainage' },
                { id: 'STREETLIGHT_SAFETY', label: '💡 Streetlights' },
              ].map((d) => (
                <button
                  key={d.id}
                  onClick={() => setSelectedDept(d.id as any)}
                  className={`px-3 py-1 rounded-xl whitespace-nowrap transition text-[11px] ${
                    selectedDept === d.id
                      ? 'bg-indigo-600 text-white shadow font-extrabold'
                      : isDark
                      ? 'bg-slate-950 text-slate-400 hover:bg-slate-800'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>

            {/* Complaints List */}
            <div className={`rounded-2xl border overflow-hidden ${isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
              <div className={`p-4 border-b flex items-center justify-between ${isDark ? 'border-slate-800 bg-slate-950/40' : 'border-slate-200 bg-slate-50'}`}>
                <div>
                  <h3 className={`text-sm font-extrabold flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    <Flame className="w-4 h-4 text-red-500 animate-pulse" />
                    High-Risk Priority Queue (Sorted by +1 Citizen Upvotes)
                  </h3>
                  <p className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    Complaints with maximum citizen +1 impact votes are automatically escalated to the top
                  </p>
                </div>
                <span className="text-xs font-mono font-bold text-red-500 bg-red-500/10 px-3 py-1 rounded-lg border border-red-500/20">
                  {highRiskQueue.length} Active Queue Items
                </span>
              </div>

              <div className="divide-y divide-slate-800">
                {highRiskQueue.map((item) => {
                  const isHigh = (item.impactScore || 0) > 80;

                  return (
                    <div key={item.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-800/40 transition">
                      <div className="space-y-1.5 max-w-2xl">
                        <div className="flex items-center gap-2 flex-wrap text-xs">
                          <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-black font-mono ${
                            isHigh ? 'bg-red-500/10 text-red-400 border border-red-500/30' : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                          }`}>
                            🔥 Impact Score: {item.impactScore || 50}/100 ({item.plusOneCount || 0} +1 Votes)
                          </span>
                          <span className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded text-[10px] font-bold">
                            Dept: {item.department || 'PWD_ROADS'}
                          </span>
                          <span className="text-slate-400 text-[11px]">• Ward: {item.ward}</span>
                        </div>

                        <h4 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                          {item.ticketNumber}: {item.title}
                        </h4>
                        <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>📍 {item.location}</p>
                        
                        {item.reporterName && (
                          <p className="text-[11px] text-emerald-400 font-medium">
                            👤 Reported by: {item.reporterName} {item.reporterMobile ? `(${item.reporterMobile})` : ''}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {item.status === 'CLOSED_VERIFIED' || item.status === 'EVIDENCE_UPLOADED' ? (
                          <div className="text-right">
                            <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20 flex items-center gap-1">
                              <CheckCircle2 className="w-4 h-4" /> Solved & Proof Uploaded
                            </span>
                            <p className="text-[10px] text-slate-400 mt-1">Pending Citizen Audit (15-day timer active)</p>
                          </div>
                        ) : (
                          <button
                            onClick={() => setSelectedTicketForProof(item)}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-lg shadow-emerald-600/20 transition transform active:scale-95"
                          >
                            <Camera className="w-4 h-4" />
                            <span>Upload Resolution Proof</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: ROAD PROJECTS & DLP TRACKER (TC-03 & TC-05) */}
        {activeTab === 'ROAD_PROJECTS' && (
          <div className="space-y-4">
            <div className={`p-4 rounded-2xl border flex flex-col md:flex-row md:items-center justify-between gap-4 ${
              isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
            }`}>
              <div>
                <h3 className={`text-sm font-extrabold flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  <HardHat className="w-4 h-4 text-amber-400" />
                  Road Works & DLP Contractor Registry
                </h3>
                <p className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Manage tender IDs, budget, contractor DLP dates, and lifecycle state transitions
                </p>
              </div>

              <button
                onClick={() => setIsProjectModalOpen(true)}
                className="bg-amber-600 hover:bg-amber-500 text-white text-xs font-extrabold px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-lg transition transform active:scale-95 shrink-0"
              >
                <PlusCircle className="w-4 h-4" />
                <span>+ Create New Road Project (TC-03)</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {roadProjects
                .filter((p) => selectedWard === 'All Wards' || p.ward === selectedWard)
                .map((project) => (
                  <div key={project.id} className={`p-4 rounded-2xl border space-y-3 ${isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">{project.tenderId}</span>
                      <span className="text-emerald-400 font-bold">{project.dlpPeriod}</span>
                    </div>

                    <div>
                      <h4 className={`text-sm font-extrabold ${isDark ? 'text-white' : 'text-slate-900'}`}>{project.roadName}</h4>
                      <p className="text-xs text-slate-400">📍 {project.ward} Ward • Contractor: {project.contractor}</p>
                      <p className="text-xs text-indigo-400 font-bold mt-0.5">Budget: {project.budgetInr}</p>
                    </div>

                    <div className="pt-2 border-t border-slate-800">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                        Lifecycle State Transition (TC-05):
                      </label>
                      <div className="flex items-center gap-1.5 flex-wrap text-[10px] font-extrabold">
                        {[
                          { state: 'TRENCHING', label: '🔴 Proposed / Trenching' },
                          { state: 'CONCRETING', label: '🟡 Concreting' },
                          { state: 'CURING', label: '🔵 Curing' },
                          { state: 'COMPLETED', label: '🟢 Completed' },
                        ].map((s) => (
                          <button
                            key={s.state}
                            onClick={() => onUpdateProjectStatus && onUpdateProjectStatus(project.id, s.state as any)}
                            className={`px-2.5 py-1 rounded-lg border transition ${
                              project.state === s.state
                                ? 'bg-amber-500 text-slate-950 font-black border-amber-400 shadow'
                                : 'bg-slate-800 text-slate-400 hover:text-white border-slate-700'
                            }`}
                          >
                            {s.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* TAB 3: REGISTERED CITIZENS */}
        {activeTab === 'REGISTERED_USERS' && (
          <div className={`rounded-2xl border overflow-hidden ${isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
            <div className={`p-4 border-b flex items-center justify-between ${isDark ? 'border-slate-800 bg-slate-950/40' : 'border-slate-200 bg-slate-50'}`}>
              <div>
                <h3 className={`text-sm font-extrabold flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  <UserCheck className="w-4 h-4 text-emerald-400" />
                  Registered Citizen Accounts Registry
                </h3>
                <p className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  All citizens and municipal officers signed up in the Nashik Civic Database
                </p>
              </div>
              <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-lg border border-emerald-500/20">
                {usersList.length} Accounts
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className={`border-b ${isDark ? 'bg-slate-950/60 border-slate-800 text-slate-400' : 'bg-slate-100 border-slate-200 text-slate-600'}`}>
                  <tr>
                    <th className="p-3">User Name</th>
                    <th className="p-3">Contact (Mobile / Email)</th>
                    <th className="p-3">Role</th>
                    <th className="p-3">Assigned Ward</th>
                    <th className="p-3">Account Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {usersList.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-800/30 transition">
                      <td className="p-3 font-bold text-white flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold text-xs">
                          {u.name.charAt(0)}
                        </div>
                        <span>{u.name}</span>
                      </td>
                      <td className="p-3 text-slate-300">
                        <div className="flex flex-col text-[11px]">
                          {u.mobile && <span className="flex items-center gap-1"><Phone className="w-3 h-3 text-emerald-400" /> {u.mobile}</span>}
                          {u.email && <span className="flex items-center gap-1"><Mail className="w-3 h-3 text-indigo-400" /> {u.email}</span>}
                        </div>
                      </td>
                      <td className="p-3">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                          u.role === 'ADMIN'
                            ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                            : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        }`}>
                          {u.role === 'ADMIN' ? '🛡️ MUNICIPAL ADMIN' : '👤 CITIZEN'}
                        </span>
                      </td>
                      <td className="p-3 font-semibold text-slate-300">{u.ward}</td>
                      <td className="p-3">
                        <span className="text-emerald-400 text-[11px] font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                          Active & Verified
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: EXPORT WARD REPORTS (TC-10) */}
        {activeTab === 'EXPORT_REPORTS' && (
          <div className={`p-6 rounded-2xl border space-y-4 ${isDark ? 'bg-slate-900/90 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900 shadow-sm'}`}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold">Ward-wise Municipal Report Generator & CSV/PDF Export (TC-10)</h3>
                <p className="text-xs text-slate-400">Generate and download official CSV report logs for {selectedWard}</p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
              <p className="text-xs text-slate-300">
                Export report includes all registered complaints, contractor DLP records, resolution evidence URLs, and citizen verification audit logs for <strong>{selectedWard}</strong>.
              </p>

              <button
                onClick={async () => {
                  const data = await exportWardReportData(selectedWard);
                  if (data && data.csvPreview) {
                    const blob = new Blob([data.csvPreview], { type: 'text/csv' });
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `Nashik_Civic_Report_${selectedWard.replace(/ /g, '_')}.csv`;
                    a.click();
                  }
                }}
                className="bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs px-5 py-2.5 rounded-xl flex items-center gap-2 shadow-lg transition transform active:scale-95"
              >
                <Download className="w-4 h-4" />
                <span>Download Ward CSV Report ({selectedWard})</span>
              </button>
            </div>
          </div>
        )}

        {/* ROAD PROJECT CREATION MODAL (TC-03) */}
        {isProjectModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <div className={`w-full max-w-md rounded-2xl p-6 shadow-2xl border ${
              isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
            }`}>
              <h3 className="text-base font-extrabold mb-1">Create New Road Project (TC-03)</h3>
              <p className="text-xs text-slate-400 mb-4">Enter tender ID, road name, budget, contractor agency & DLP period</p>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (onCreateProject && roadNameInput) {
                    onCreateProject({
                      tenderId: tenderIdInput || `NMC-TND-2026-${Math.floor(100 + Math.random() * 900)}`,
                      roadName: roadNameInput,
                      roadNameMr: roadNameInput,
                      budgetInr: budgetInput || '₹ 2.50 Cr',
                      contractor: contractorInput || 'NMC Rapid Infra',
                      dlpPeriod: dlpInput,
                      ward: projectWardInput,
                      state: 'TRENCHING',
                      startDate: '15 Sep 2026',
                      expectedCompletion: 'Dec 2026',
                      coordinates: [20.0050, 73.7800],
                      progressPhoto: 'https://images.unsplash.com/photo-1541888946425-d0fbb186a5b2?w=600&auto=format&fit=crop&q=80',
                      description: 'White topping & asphalt work.'
                    });
                  }
                  setIsProjectModalOpen(false);
                  setRoadNameInput('');
                  setTenderIdInput('');
                  setBudgetInput('');
                  setContractorInput('');
                }}
                className="space-y-3 text-xs"
              >
                <div>
                  <label className="block font-bold mb-1">Tender ID Number</label>
                  <input
                    type="text"
                    placeholder="e.g. NMC-TND-2026-084"
                    value={tenderIdInput}
                    onChange={(e) => setTenderIdInput(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-700 bg-slate-800 text-white font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block font-bold mb-1">Road Work Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Gangapur Road Concreting"
                    value={roadNameInput}
                    onChange={(e) => setRoadNameInput(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-700 bg-slate-800 text-white font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-bold mb-1">Budget (INR)</label>
                    <input
                      type="text"
                      placeholder="e.g. ₹ 4.80 Cr"
                      value={budgetInput}
                      onChange={(e) => setBudgetInput(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-700 bg-slate-800 text-white font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold mb-1">DLP Guarantee Period</label>
                    <input
                      type="text"
                      placeholder="e.g. 36 Months DLP"
                      value={dlpInput}
                      onChange={(e) => setDlpInput(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-700 bg-slate-800 text-white font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold mb-1">Contractor Agency</label>
                  <input
                    type="text"
                    placeholder="e.g. L&T Smart Infra Nashik"
                    value={contractorInput}
                    onChange={(e) => setContractorInput(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-700 bg-slate-800 text-white font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block font-bold mb-1">Ward</label>
                  <select
                    value={projectWardInput}
                    onChange={(e) => setProjectWardInput(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl border border-slate-700 bg-slate-800 text-white font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    {wardsList.map((w) => (
                      <option key={w} value={w}>{w}</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsProjectModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-amber-600 text-white font-extrabold shadow-lg"
                  >
                    Create Road Project
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Resolution Proof Upload Modal */}
        {selectedTicketForProof && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <div className={`w-full max-w-md rounded-2xl p-6 shadow-2xl border ${
              isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
            }`}>
              <h3 className="text-base font-extrabold mb-1">Upload Work Completion Proof</h3>
              <p className="text-xs text-slate-400 mb-4">
                Ticket {selectedTicketForProof.ticketNumber}: {selectedTicketForProof.title}
              </p>

              <form onSubmit={handleResolveSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold mb-1">Proof Photo URL / File Link</label>
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/... or upload link"
                    value={proofPhotoUrl}
                    onChange={(e) => setProofPhotoUrl(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-700 bg-slate-800 text-white font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">Leave blank to use default verified repair photo</p>
                </div>

                <div>
                  <label className="block font-bold mb-1">Officer Resolution Notes</label>
                  <textarea
                    rows={3}
                    placeholder="e.g. Cold-mix asphalt filling completed by NMC PWD cell."
                    value={resolutionNotes}
                    onChange={(e) => setResolutionNotes(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-700 bg-slate-800 text-white font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedTicketForProof(null)}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold shadow-lg"
                  >
                    Submit Proof & Resolve Ticket
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </section>
  );
};
