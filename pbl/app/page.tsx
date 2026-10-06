'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useApp } from '@/lib/AppContext';
import { Ticket, RoadProject, RoadWorkPhase } from '@/lib/types';
import Header from '@/components/Header';
import SocialFeed from '@/components/SocialFeed';
import VerificationTracker from '@/components/VerificationTracker';
import EngineerDashboard from '@/components/EngineerDashboard';
import ContractorDashboard from '@/components/ContractorDashboard';
import CivicSafetyRules from '@/components/CivicSafetyRules';
import ChatbotWidget from '@/components/ChatbotWidget';
import ComplaintModal from '@/components/ComplaintModal';
import LandingOverview from '@/components/LandingOverview';
import AuthModal from '@/components/AuthModal';
import { 
  Building2, 
  Layers, 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Flame
} from 'lucide-react';

const GisMap = dynamic(() => import('@/components/GisMap'), {
  ssr: false,
  loading: () => (
    <div className="h-[750px] w-full rounded-2xl civic-card flex flex-col items-center justify-center text-slate-500 dark:text-slate-400 gap-3 border border-slate-200 dark:border-slate-800">
      <div className="w-9 h-9 border-3 border-amber-500 border-t-transparent rounded-full animate-spin" />
      <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Loading Nashik GIS & Road Infrastructure Map...</span>
    </div>
  )
});

export default function HomePage() {
  const { 
    t, 
    selectedWard, 
    isComplaintModalOpen, 
    setIsComplaintModalOpen, 
    selectedTicketForVerification, 
    setSelectedTicketForVerification,
    currentUser,
    signInWithRole,
    isAuthModalOpen,
    setIsAuthModalOpen
  } = useApp();

  const [activeTab, setActiveTab] = useState('home');
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [projects, setProjects] = useState<RoadProject[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [ticketsRes, projectsRes] = await Promise.all([
        fetch('/api/tickets'),
        fetch('/api/projects')
      ]);
      const ticketsData = await ticketsRes.json();
      const projectsData = await projectsRes.json();

      if (ticketsData.success) setTickets(ticketsData.tickets);
      if (projectsData.success) setProjects(projectsData.projects);
    } catch (err) {
      console.error('Failed to load initial data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      if (url.searchParams.get('auth_success') === '1') {
        const tab = url.searchParams.get('tab');
        if (tab) {
          setActiveTab(tab);
        }
        url.searchParams.delete('auth_success');
        url.searchParams.delete('tab');
        window.history.replaceState({}, '', url.pathname + (url.search ? url.search : ''));
      }
    }
  }, []);

  const handleUpvote = async (ticketId: string) => {
    try {
      const res = await fetch(`/api/tickets/${ticketId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ voteType: 'UPVOTE' })
      });
      const data = await res.json();
      if (data.success && data.ticket) {
        setTickets((prev) =>
          prev.map((t) => (t.id === ticketId ? { ...t, upvotes: data.ticket.upvotes, impactScore: data.ticket.impactScore } : t))
        );
      }
    } catch (err) {
      console.error('Upvote error:', err);
    }
  };

  const handleVerificationVote = async (ticketId: string, voteType: 'CONFIRM' | 'REOPEN', reason?: string) => {
    try {
      const res = await fetch(`/api/tickets/${ticketId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ voteType, reason })
      });
      const data = await res.json();
      if (data.success && data.ticket) {
        setTickets((prev) =>
          prev.map((t) => (t.id === ticketId ? data.ticket : t))
        );
      }
    } catch (err) {
      console.error('Verification vote error:', err);
    }
  };

  const handleContractorProofSubmit = async (
    ticketId: string,
    afterImageUrl: string,
    contractorName: string,
    note?: string
  ) => {
    try {
      const res = await fetch(`/api/tickets/${ticketId}/proof`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ afterImageUrl, contractorName, note })
      });
      const data = await res.json();
      if (data.success && data.ticket) {
        setTickets((prev) =>
          prev.map((t) => (t.id === ticketId ? data.ticket : t))
        );
      }
    } catch (err) {
      console.error('Contractor proof error:', err);
    }
  };

  const handleUpdateProjectPhase = async (projectId: string, phase: RoadWorkPhase, percentage: number) => {
    try {
      const res = await fetch('/api/projects', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId, phase, completionPercentage: percentage })
      });
      const data = await res.json();
      if (data.success && data.project) {
        setProjects((prev) =>
          prev.map((p) => (p.id === projectId ? data.project : p))
        );
      }
    } catch (err) {
      console.error('Project phase update error:', err);
    }
  };

  const handleComplaintSubmit = async (formData: any) => {
    try {
      const payload = {
        ...formData,
        citizenName: formData.citizenName || currentUser?.name || 'Nashik Resident',
        contactPhone: formData.contactPhone || '9822000000',
      };
      const res = await fetch('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success && data.ticket) {
        setTickets((prev) => [data.ticket, ...prev]);
        setActiveTab('feed');
      }
    } catch (err) {
      console.error('Complaint submission error:', err);
    }
  };

  const handleInspectTicket = (ticketId: string) => {
    setSelectedTicketForVerification(ticketId);
    setActiveTab('verify');
  };

  const totalCount = tickets.length;
  const underVerificationCount = tickets.filter((t) => t.status === 'VERIFICATION_PENDING').length;
  const reopenedCount = tickets.filter((t) => t.status === 'REOPENED').length;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#090d16] text-slate-900 dark:text-slate-100 transition-colors duration-200">
      
      {/* Edge-to-edge Header */}
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Full-Width Fluid Workspace */}
      <main className="flex-1 w-full px-3 sm:px-6 lg:px-8 py-4 sm:py-5 space-y-5">
        
        {/* Landing Overview Page */}
        {activeTab === 'home' && (
          <LandingOverview 
            onEnterPortal={(tab) => {
              if (tab === 'admin') {
                if (currentUser?.role === 'WARD_ENGINEER') {
                  setActiveTab('engineer');
                } else if (currentUser?.role === 'CONTRACTOR') {
                  setActiveTab('contractor');
                } else {
                  setIsAuthModalOpen(true);
                }
              } else {
                setActiveTab(tab);
              }
            }} 
          />
        )}

        {/* Live Portal Views (Feed, Map, Verify, Engineer, Contractor, Rules) */}
        {activeTab !== 'home' && (
          <>
            {/* Sleek Municipal Telemetry Strip */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3 bg-white dark:bg-slate-900/60 p-2.5 rounded-2xl border border-slate-200 dark:border-slate-800/80 shadow-xs dark:shadow-none">
              <div className="flex items-center gap-3 px-3 py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/40 transition">
                <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                  <Flame className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">{t.metricTotalComplaints}</div>
                  <div className="text-lg font-black text-slate-900 dark:text-slate-100 leading-tight">{totalCount} Active</div>
                </div>
              </div>

              <div
                onClick={() => setActiveTab('verify')}
                className="flex items-center gap-3 px-3 py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/40 transition cursor-pointer"
              >
                <div className="w-9 h-9 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">{t.metricUnderVerification}</div>
                  <div className="text-lg font-black text-blue-600 dark:text-blue-400 leading-tight flex items-center gap-1.5">
                    <span>{underVerificationCount}</span>
                    <span className="text-[10px] font-bold text-blue-500 dark:text-blue-300 underline">Inspect ➔</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 px-3 py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/40 transition">
                <div className="w-9 h-9 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">{t.metricReopenedRate}</div>
                  <div className="text-lg font-black text-rose-600 dark:text-rose-400 leading-tight">{reopenedCount} Substandard Flags</div>
                </div>
              </div>

              <div
                onClick={() => setActiveTab('map')}
                className="flex items-center gap-3 px-3 py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/40 transition cursor-pointer"
              >
                <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">{t.metricActiveRoadWorks}</div>
                  <div className="text-lg font-black text-emerald-600 dark:text-emerald-400 leading-tight flex items-center gap-1.5">
                    <span>{projects.length} Works</span>
                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-300 underline">View Map ➔</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Tab Views */}
            {activeTab === 'feed' && (
              <SocialFeed
                tickets={tickets}
                onUpvote={handleUpvote}
                onInspect={handleInspectTicket}
              />
            )}

            {activeTab === 'map' && (
              <GisMap
                tickets={tickets}
                projects={projects}
                onSelectTicket={handleInspectTicket}
              />
            )}

            {activeTab === 'verify' && (
              <VerificationTracker
                tickets={tickets}
                onVote={handleVerificationVote}
                selectedTicketId={selectedTicketForVerification}
              />
            )}

            {/* 1. NMC Ward Executive Engineer Tower */}
            {activeTab === 'engineer' && (
              <EngineerDashboard
                tickets={tickets}
                projects={projects}
                onUpdatePhase={handleUpdateProjectPhase}
              />
            )}

            {/* 2. PWD Road Contractor Hub */}
            {activeTab === 'contractor' && (
              <ContractorDashboard
                tickets={tickets}
                projects={projects}
                onUpdatePhase={handleUpdateProjectPhase}
                onSubmitProof={handleContractorProofSubmit}
              />
            )}

            {/* 3. Fallback for legacy admin tab */}
            {activeTab === 'admin' && (
              currentUser?.role === 'CONTRACTOR' ? (
                <ContractorDashboard
                  tickets={tickets}
                  projects={projects}
                  onUpdatePhase={handleUpdateProjectPhase}
                  onSubmitProof={handleContractorProofSubmit}
                />
              ) : (
                <EngineerDashboard
                  tickets={tickets}
                  projects={projects}
                  onUpdatePhase={handleUpdateProjectPhase}
                />
              )
            )}

            {activeTab === 'rules' && (
              <CivicSafetyRules />
            )}
          </>
        )}

      </main>

      {/* Floating AI Hazard Assistant */}
      <ChatbotWidget />

      {/* Geotagged Complaint Modal */}
      <ComplaintModal
        isOpen={isComplaintModalOpen}
        onClose={() => setIsComplaintModalOpen(false)}
        onSubmit={handleComplaintSubmit}
      />

      {/* 3-Role Governance Sign In Module */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSelectRole={(role, targetTab) => {
          signInWithRole(role);
          setActiveTab(targetTab);
        }}
      />

      {/* Edge-to-edge Footer */}
      <footer className="mt-auto border-t border-slate-200 dark:border-slate-900 bg-white dark:bg-slate-950 px-4 sm:px-6 lg:px-8 py-5 text-xs text-slate-500 dark:text-slate-500 transition-colors">
        <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-amber-500" />
            <span className="font-semibold text-slate-800 dark:text-slate-300">Nashik Municipal Corporation (NMC)</span>
            <span>•</span>
            <span>Public Works Department (PWD) Roads Division</span>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-600 dark:text-slate-400">
            <span>Doctrine: <b>Closed ≠ Resolved</b> (नागरिक पडताळणी अनिवार्य)</span>
            <span>•</span>
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="text-amber-600 dark:text-amber-400 hover:underline font-bold inline-flex items-center gap-1.5"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Role-Based Sign In & Dashboard Access</span>
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
