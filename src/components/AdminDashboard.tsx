import React, { useState, useEffect } from 'react';
import { CivicTicket, WardName, Language, ThemeMode, DepartmentType, RoadWorkProject, LifecycleState } from '../types';
import { translations } from '../data/translations';
import { LayoutDashboard, BarChart3, CheckCircle2, Clock, MapPin, ShieldAlert, TrendingUp, Flame, Filter, Camera, ShieldCheck, Users, UserCheck, Phone, Mail, PlusCircle, Download, FileText, HardHat } from 'lucide-react';
import { fetchRegisteredUsers, UserAccount, exportWardReportData } from '../services/api';

interface AdminDashboardProps {
  tickets: CivicTicket[];
  roadProjects?: RoadWorkProject[];
  language: Language;
  theme?: ThemeMode;
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
  selectedWard,
  onSelectWard,
  onAdminResolveTicket,
  onCreateProject,
  onUpdateProjectStatus,
}) => {
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

    const finalPhoto = proofPhotoUrl || selectedTicketForProof.beforePhoto || '';
    if (onAdminResolveTicket) {
      onAdminResolveTicket(selectedTicketForProof.id, finalPhoto, resolutionNotes);
    }
    setSelectedTicketForProof(null);
    setProofPhotoUrl('');
    setResolutionNotes('');
  };

  const handleProofPhotoFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setProofPhotoUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <section className="py-8 px-4 bg-slate-50 border-b border-slate-200">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header Title Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white shadow-md flex items-center justify-center shrink-0">
              <LayoutDashboard className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-slate-900 tracking-tight">
                  Municipal Admin Control Center
                </h2>
                <span className="bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-mono font-bold px-2 py-0.5 rounded-lg flex items-center gap-1">
                  🛡️ Officer Portal
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Live grievance triage, contractor assignments, DLP management & resolution verification
              </p>
            </div>
          </div>

          {/* Quick Ward Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
            <button
              onClick={() => onSelectWard('All Wards')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shadow-sm ${
                selectedWard === 'All Wards'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-300'
              }`}
            >
              {t.allWards}
            </button>
            {wardsList.map((w) => (
              <button
                key={w}
                onClick={() => onSelectWard(w)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap shadow-sm ${
                  selectedWard === w
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-300'
                }`}
              >
                {w}
              </button>
            ))}
          </div>
        </div>

        {/* Top Navigation Tabs for Admin */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto text-xs font-bold">
          <button
            onClick={() => setActiveTab('PRIORITY_QUEUE')}
            className={`px-4 py-2 rounded-xl flex items-center gap-2 transition whitespace-nowrap ${
              activeTab === 'PRIORITY_QUEUE'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-200 hover:text-slate-900'
            }`}
          >
            <Flame className="w-4 h-4 text-rose-500" />
            <span>Priority Queue ({highRiskQueue.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('ROAD_PROJECTS')}
            className={`px-4 py-2 rounded-xl flex items-center gap-2 transition whitespace-nowrap ${
              activeTab === 'ROAD_PROJECTS'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-200 hover:text-slate-900'
            }`}
          >
            <HardHat className="w-4 h-4 text-amber-500" />
            <span>Road Projects & DLP ({roadProjects.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('REGISTERED_USERS')}
            className={`px-4 py-2 rounded-xl flex items-center gap-2 transition whitespace-nowrap ${
              activeTab === 'REGISTERED_USERS'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-200 hover:text-slate-900'
            }`}
          >
            <Users className="w-4 h-4 text-emerald-600" />
            <span>Citizen Directory ({usersList.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('EXPORT_REPORTS')}
            className={`px-4 py-2 rounded-xl flex items-center gap-2 transition whitespace-nowrap ${
              activeTab === 'EXPORT_REPORTS'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-200 hover:text-slate-900'
            }`}
          >
            <FileText className="w-4 h-4 text-blue-600" />
            <span>Export Ward Reports</span>
          </button>
        </div>

        {/* Analytics KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500">Total Ward Grievances</span>
              <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold">
                <BarChart3 className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-3xl font-black text-slate-900">{totalComplaints}</span>
              <span className="text-xs font-bold text-emerald-600 flex items-center gap-0.5">
                <TrendingUp className="w-3.5 h-3.5" /> Live Sync
              </span>
            </div>
          </div>

          <div className="p-5 rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500">Pending Triage</span>
              <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-3xl font-black text-amber-600">{pendingVerification}</span>
              <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200">
                Action Needed
              </span>
            </div>
          </div>

          <div className="p-5 rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500">Resolved with Proof</span>
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-3xl font-black text-emerald-600">{verifiedClosed}</span>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
                {resolutionRate}% Rate
              </span>
            </div>
          </div>

          <div className="p-5 rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500">Citizen Reopened</span>
              <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center font-bold">
                <ShieldAlert className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-3xl font-black text-rose-600">{reopenedEscalated}</span>
              <span className="text-xs font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-lg border border-rose-200">
                Escalated
              </span>
            </div>
          </div>
        </div>

        {/* TAB 1: EMERGENCY PRIORITY QUEUE */}
        {activeTab === 'PRIORITY_QUEUE' && (
          <div className="space-y-4">
            {/* Department Filter Bar */}
            <div className="p-3.5 rounded-2xl border border-slate-200 bg-white shadow-sm flex items-center gap-2 overflow-x-auto text-xs font-bold">
              <span className="text-slate-500 flex items-center gap-1 shrink-0 font-medium">
                <Filter className="w-3.5 h-3.5 text-indigo-600" /> Filter Department:
              </span>
              {[
                { id: 'ALL', label: 'All Departments' },
                { id: 'PWD_ROADS', label: 'PWD Roads' },
                { id: 'MSEDCL_ELECTRICAL', label: 'MSEDCL Electrical' },
                { id: 'WATER_SUPPLY', label: 'Water Supply' },
                { id: 'DRAINAGE_SEWERAGE', label: 'Drainage & Sewerage' },
                { id: 'SANITATION_OTHER', label: 'Sanitation' },
              ].map((d) => (
                <button
                  key={d.id}
                  onClick={() => setSelectedDept(d.id as any)}
                  className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition ${
                    selectedDept === d.id
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>

            {/* Complaints List Table / Cards */}
            <div className="rounded-3xl border border-slate-200 bg-white overflow-hidden shadow-sm">
              <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                    <Flame className="w-4 h-4 text-rose-500" />
                    Priority Grievance Queue (Sorted by Impact & Citizen Upvotes)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Complaints with higher citizen +1 upvotes are automatically surfaced to the top for rapid dispatch
                  </p>
                </div>
                <span className="text-xs font-mono font-bold text-slate-700 bg-white px-3 py-1 rounded-xl border border-slate-300 shadow-sm">
                  {highRiskQueue.length} Active Items
                </span>
              </div>

              {highRiskQueue.length === 0 ? (
                <div className="p-12 text-center text-slate-500">
                  <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
                  <p className="font-extrabold text-slate-800 text-sm">No Pending Grievances in this Ward</p>
                  <p className="text-xs text-slate-500 mt-0.5">All complaints are either resolved or none have been submitted yet.</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-200">
                  {highRiskQueue.map((item) => {
                    const isCritical = item.riskLevel === 'CRITICAL' || (item.impactScore || 0) > 80;

                    return (
                      <div key={item.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/80 transition">
                        <div className="space-y-1.5 max-w-2xl">
                          <div className="flex items-center gap-2 flex-wrap text-xs">
                            <span className="font-mono font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-lg">
                              {item.ticketNumber}
                            </span>
                            <span className={`px-2 py-0.5 rounded-lg text-[11px] font-extrabold ${
                              isCritical ? 'bg-rose-100 text-rose-800 border border-rose-200' : 'bg-amber-100 text-amber-800 border border-amber-200'
                            }`}>
                              Impact: {item.impactScore || 25} ({item.plusOneCount || 0} Upvotes)
                            </span>
                            <span className="bg-slate-100 text-slate-700 border border-slate-200 px-2 py-0.5 rounded-lg font-bold text-[11px]">
                              Dept: {item.department}
                            </span>
                            <span className="text-slate-500 font-semibold">• {item.ward} Ward</span>
                          </div>

                          <h4 className="text-sm font-extrabold text-slate-900 leading-snug">
                            {item.title}
                          </h4>
                          <p className="text-xs text-slate-600 font-medium">📍 {item.location}</p>
                          
                          {item.reporterName && (
                            <p className="text-[11px] text-emerald-700 font-bold">
                              👤 Citizen Reporter: {item.reporterName} {item.reporterMobile ? `(${item.reporterMobile})` : ''}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {item.status === 'CLOSED_VERIFIED' || item.status === 'EVIDENCE_UPLOADED' ? (
                            <div className="text-right">
                              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 flex items-center gap-1.5">
                                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Solved & Proof Uploaded
                              </span>
                              <p className="text-[10px] text-slate-500 mt-1">Pending Citizen Audit Verification</p>
                            </div>
                          ) : (
                            <button
                              onClick={() => {
                                setSelectedTicketForProof(item);
                                setProofPhotoUrl('');
                                setResolutionNotes('');
                              }}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-sm transition transform active:scale-95"
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
              )}
            </div>
          </div>
        )}

        {/* TAB 2: ROAD PROJECTS & DLP TRACKER */}
        {activeTab === 'ROAD_PROJECTS' && (
          <div className="space-y-4">
            <div className="p-4 rounded-3xl border border-slate-200 bg-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                  <HardHat className="w-4 h-4 text-amber-500" />
                  Road Works & DLP Contractor Registry
                </h3>
                <p className="text-xs text-slate-500">
                  Manage municipal tenders, budgets, contractor liability warranty, and transition lifecycle states
                </p>
              </div>

              <button
                onClick={() => setIsProjectModalOpen(true)}
                className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-extrabold px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-sm transition transform active:scale-95 shrink-0"
              >
                <PlusCircle className="w-4 h-4" />
                <span>+ Register New Road Project</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {roadProjects
                .filter((p) => selectedWard === 'All Wards' || p.ward === selectedWard)
                .map((project) => (
                  <div key={project.id} className="p-5 rounded-3xl border border-slate-200 bg-white space-y-3 shadow-sm">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-amber-800 font-bold bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200">
                        {project.tenderId || 'NMC-ROAD'}
                      </span>
                      <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
                        {project.dlpPeriod}
                      </span>
                    </div>

                    <div>
                      <h4 className="text-sm font-extrabold text-slate-900">{project.roadName}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">📍 {project.ward} Ward • Contractor: {project.contractor}</p>
                      <p className="text-xs text-indigo-700 font-extrabold mt-1">Budget: {project.budgetInr}</p>
                    </div>

                    <div className="pt-3 border-t border-slate-200">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                        Transition Lifecycle State:
                      </label>
                      <div className="flex items-center gap-1.5 flex-wrap text-[11px] font-extrabold">
                        {[
                          { state: 'TRENCHING', label: '🔴 Trenching' },
                          { state: 'CONCRETING', label: '🟡 Concreting' },
                          { state: 'CURING', label: '🔵 Curing' },
                          { state: 'COMPLETED', label: '🟢 Completed' },
                        ].map((s) => (
                          <button
                            key={s.state}
                            onClick={() => onUpdateProjectStatus && onUpdateProjectStatus(project.id, s.state as any)}
                            className={`px-3 py-1 rounded-xl border transition ${
                              project.state === s.state
                                ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                                : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-300'
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

        {/* TAB 3: REGISTERED CITIZENS DIRECTORY */}
        {activeTab === 'REGISTERED_USERS' && (
          <div className="rounded-3xl border border-slate-200 bg-white overflow-hidden shadow-sm">
            <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-emerald-600" />
                  Registered Citizen & Municipal Accounts
                </h3>
                <p className="text-xs text-slate-500">
                  Citizens and municipal officers signed up in the active database
                </p>
              </div>
              <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-200">
                {usersList.length} Active Accounts
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-200 bg-slate-100/70 text-slate-600 font-bold">
                  <tr>
                    <th className="p-3.5">Name</th>
                    <th className="p-3.5">Contact Details</th>
                    <th className="p-3.5">System Role</th>
                    <th className="p-3.5">Assigned Ward</th>
                    <th className="p-3.5">Verification</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {usersList.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50 transition">
                      <td className="p-3.5 font-bold text-slate-900 flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
                          {u.name.charAt(0)}
                        </div>
                        <span>{u.name}</span>
                      </td>
                      <td className="p-3.5 text-slate-700">
                        <div className="flex flex-col text-[11px] gap-0.5">
                          {u.mobile && <span className="flex items-center gap-1"><Phone className="w-3 h-3 text-emerald-600" /> {u.mobile}</span>}
                          {u.email && <span className="flex items-center gap-1"><Mail className="w-3 h-3 text-indigo-600" /> {u.email}</span>}
                        </div>
                      </td>
                      <td className="p-3.5">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                          u.role === 'ADMIN'
                            ? 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                            : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        }`}>
                          {u.role === 'ADMIN' ? '🛡️ MUNICIPAL ADMIN' : '👤 CITIZEN'}
                        </span>
                      </td>
                      <td className="p-3.5 font-semibold text-slate-700">{u.ward}</td>
                      <td className="p-3.5">
                        <span className="text-emerald-700 text-[11px] font-bold bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
                          Verified Active
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: EXPORT WARD REPORTS */}
        {activeTab === 'EXPORT_REPORTS' && (
          <div className="p-6 rounded-3xl border border-slate-200 bg-white space-y-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center border border-blue-200">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900">Ward Municipal Report Generator & CSV Export</h3>
                <p className="text-xs text-slate-500">Download official CSV audit logs for {selectedWard}</p>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <p className="text-xs text-slate-700 leading-relaxed">
                Export includes all registered complaints, contractor accountability records, before/after resolution evidence, and citizen audit feedback for <strong>{selectedWard}</strong>.
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
                className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs px-5 py-2.5 rounded-xl flex items-center gap-2 shadow-sm transition transform active:scale-95"
              >
                <Download className="w-4 h-4" />
                <span>Download Ward CSV Audit Log ({selectedWard})</span>
              </button>
            </div>
          </div>
        )}

        {/* ROAD PROJECT CREATION MODAL */}
        {isProjectModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-3xl p-6 shadow-2xl border border-slate-200 bg-white text-slate-900">
              <h3 className="text-base font-extrabold mb-1">Create New Municipal Road Project</h3>
              <p className="text-xs text-slate-500 mb-4">Register tender ID, road name, budget, contractor agency & DLP period</p>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (onCreateProject && roadNameInput) {
                    onCreateProject({
                      tenderId: tenderIdInput || `NMC-TND-2026-${Math.floor(100 + Math.random() * 900)}`,
                      roadName: roadNameInput,
                      roadNameMr: roadNameInput,
                      budgetInr: budgetInput || '₹ 2.50 Cr',
                      contractor: contractorInput || 'NMC Rapid Infra Cell',
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
                  <label className="block font-bold text-slate-700 mb-1">Tender ID Number</label>
                  <input
                    type="text"
                    placeholder="e.g. NMC-TND-2026-084"
                    value={tenderIdInput}
                    onChange={(e) => setTenderIdInput(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 bg-slate-50 font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Road Work Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Gangapur Road Concreting"
                    value={roadNameInput}
                    onChange={(e) => setRoadNameInput(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 bg-slate-50 font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Budget (INR)</label>
                    <input
                      type="text"
                      placeholder="e.g. ₹ 4.80 Cr"
                      value={budgetInput}
                      onChange={(e) => setBudgetInput(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-300 bg-slate-50 font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">DLP Guarantee Period</label>
                    <input
                      type="text"
                      placeholder="e.g. 36 Months DLP"
                      value={dlpInput}
                      onChange={(e) => setDlpInput(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-300 bg-slate-50 font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Contractor Agency</label>
                  <input
                    type="text"
                    placeholder="e.g. L&T Smart Infra Nashik"
                    value={contractorInput}
                    onChange={(e) => setContractorInput(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 bg-slate-50 font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Ward</label>
                  <select
                    value={projectWardInput}
                    onChange={(e) => setProjectWardInput(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 bg-slate-50 font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    {wardsList.map((w) => (
                      <option key={w} value={w}>{w}</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => setIsProjectModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-extrabold shadow-sm"
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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-3xl p-6 shadow-2xl border border-slate-200 bg-white text-slate-900">
              <h3 className="text-base font-extrabold mb-1">Upload Work Resolution Proof</h3>
              <p className="text-xs text-slate-500 mb-4">
                Ticket {selectedTicketForProof.ticketNumber}: {selectedTicketForProof.title}
              </p>

              <form onSubmit={handleResolveSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1.5">
                    Attach After-Repair Photo (फोटो पुरावा जोडा)
                  </label>
                  <label className="border-2 border-dashed border-slate-300 hover:border-emerald-500 bg-slate-50 rounded-2xl p-3 flex flex-col items-center justify-center cursor-pointer transition">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleProofPhotoFile}
                    />
                    {proofPhotoUrl ? (
                      <div className="w-full flex items-center gap-3">
                        <img
                          src={proofPhotoUrl}
                          alt="Proof"
                          className="w-14 h-14 object-cover rounded-xl border border-slate-200 shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-slate-900 text-xs">Resolution Photo Loaded</p>
                          <span className="text-[10px] text-emerald-600 font-bold">✓ Ready for Citizen Audit</span>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-slate-600">
                        <Camera className="w-4 h-4 text-emerald-600" />
                        <span className="font-bold">Choose Resolution Photo</span>
                      </div>
                    )}
                  </label>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Officer / Contractor Resolution Notes</label>
                  <textarea
                    rows={3}
                    placeholder="e.g. Pothole filled with mastic asphalt by NMC PWD cell."
                    value={resolutionNotes}
                    onChange={(e) => setResolutionNotes(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 bg-slate-50 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => setSelectedTicketForProof(null)}
                    className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold shadow-sm"
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
