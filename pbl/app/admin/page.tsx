'use client';

import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import SuperAdminDashboard from '@/components/SuperAdminDashboard';
import AdminDashboard from '@/components/AdminDashboard';
import { useApp } from '@/lib/AppContext';
import { Ticket, RoadProject, RoadWorkPhase } from '@/lib/types';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function AdminPage() {
  const { currentUser } = useApp();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [projects, setProjects] = useState<RoadProject[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [ticketsRes, projectsRes] = await Promise.all([
        fetch('/api/tickets'),
        fetch('/api/projects')
      ]);
      const tData = await ticketsRes.json();
      const pData = await projectsRes.json();
      if (tData.success) setTickets(tData.tickets);
      if (pData.success) setProjects(pData.projects);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

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
      console.error(err);
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
      console.error(err);
    }
  };

  const isSuperAdmin = currentUser?.role === 'SUPER_ADMIN' || currentUser?.email === 'bhoomikabra12@gmail.com';

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#090d16] text-slate-900 dark:text-slate-100 transition-colors duration-200">
      <Header activeTab={isSuperAdmin ? 'superadmin' : 'admin'} setActiveTab={() => {}} />

      <main className="flex-1 w-full px-2 sm:px-6 lg:px-8 py-3 space-y-4">
        <div className="flex items-center gap-2 max-w-md sm:max-w-xl mx-auto">
          <Link
            href="/"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 shadow-xs transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Public Civic Portal
          </Link>
        </div>

        {isSuperAdmin ? (
          <SuperAdminDashboard
            tickets={tickets}
            onInspectTicket={(id) => {}}
            onNavigateToMap={() => {}}
          />
        ) : (
          <AdminDashboard
            tickets={tickets}
            projects={projects}
            onUpdatePhase={handleUpdateProjectPhase}
            onSubmitProof={handleContractorProofSubmit}
          />
        )}
      </main>
    </div>
  );
}
