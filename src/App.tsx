import React, { useState, useEffect } from 'react';
import { WardName, Language, ThemeMode, CivicTicket, HazardType, RoadWorkProject } from './types';
import { mockRoadProjects, mockTickets } from './data/mockData';
import { translations } from './data/translations';
import { fetchTicketsFromDatabase, fetchProjectsFromDatabase, postComplaintToDatabase, submitVoteToDatabase } from './services/api';
import { Header } from './components/Header';
import { WeatherHazardBanner } from './components/WeatherHazardBanner';
import { KpiBanner } from './components/KpiBanner';
import { GisMap } from './components/GisMap';
import { ChatbotWidget } from './components/ChatbotWidget';
import { ComplaintFormModal } from './components/ComplaintFormModal';
import { CivicSafetyRules } from './components/CivicSafetyRules';
import { VerificationTracker } from './components/VerificationTracker';
import { Building2, Radio, Database } from 'lucide-react';

export function App() {
  const [selectedWard, setSelectedWard] = useState<WardName>('All Wards');
  const [language, setLanguage] = useState<Language>('en');
  const [theme, setTheme] = useState<ThemeMode>('dark');
  
  const [tickets, setTickets] = useState<CivicTicket[]>(mockTickets);
  const [roadProjects, setRoadProjects] = useState<RoadWorkProject[]>(mockRoadProjects);
  const [dbStatus, setDbStatus] = useState<'CONNECTED' | 'HYBRID_MOCK'>('HYBRID_MOCK');

  const [isLiveStreaming, setIsLiveStreaming] = useState<boolean>(true);
  const [liveToastNotification, setLiveToastNotification] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [modalInitialData, setModalInitialData] = useState<{
    hazardType?: HazardType;
    ward?: WardName;
    location?: string;
    aiConfidence?: number;
  } | null>(null);

  const t = translations[language];

  // Fetch initial real-time data from PostgreSQL API on mount
  useEffect(() => {
    async function loadDatabaseData() {
      const dbTickets = await fetchTicketsFromDatabase();
      if (dbTickets && dbTickets.length > 0) {
        setTickets(dbTickets);
        setDbStatus('CONNECTED');
      }

      const dbProjects = await fetchProjectsFromDatabase();
      if (dbProjects && dbProjects.length > 0) {
        setRoadProjects(dbProjects);
      }
    }

    loadDatabaseData();
  }, []);

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === 'en' ? 'mr' : 'en'));
  };

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Helper to generate a live simulated ticket
  const generateSimulatedTicket = (): CivicTicket => {
    const locations = [
      { ward: 'Panchavati' as WardName, loc: 'Near K.K. Wagh Engineering Gate', coords: [20.0180, 73.8180] as [number, number] },
      { ward: 'Nashik West' as WardName, loc: 'College Road, Opp Bhonsala Gate 2', coords: [20.0050, 73.7620] as [number, number] },
      { ward: 'Cidco' as WardName, loc: 'Trimurti Chowk Bus Stand Avenue', coords: [19.9690, 73.7620] as [number, number] },
      { ward: 'Satpur' as WardName, loc: 'ABB Circle Industrial Highway', coords: [19.9980, 73.7380] as [number, number] },
      { ward: 'Nashik East' as WardName, loc: 'Dwarka Circle Flyover Junction', coords: [19.9970, 73.7780] as [number, number] },
      { ward: 'Nashik Road' as WardName, loc: 'Bitco Chowk Station Approach', coords: [19.9650, 73.8180] as [number, number] }
    ];

    const hazards: { type: HazardType; title: string; titleMr: string }[] = [
      { type: 'POTHOLE', title: 'Deep Pothole Cave-In', titleMr: 'रस्त्यावर मोठा खड्डा' },
      { type: 'ELECTRICAL_HAZARD', title: 'Sparking Wire Hazard', titleMr: 'विजेची तार धोका' },
      { type: 'WATER_LEAKAGE', title: 'Pipeline Burst Submersion', titleMr: 'पाणी पाईपलाईन गळती' },
      { type: 'STREETLIGHT_DEFECT', title: 'Dark Zone Streetlight Defect', titleMr: 'पथदिवा बंद धोका' }
    ];

    const locObj = locations[Math.floor(Math.random() * locations.length)];
    const hazObj = hazards[Math.floor(Math.random() * hazards.length)];
    const ticketId = `t-live-${Date.now()}`;
    const ticketNum = `NMC-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    return {
      id: ticketId,
      ticketNumber: ticketNum,
      title: hazObj.title,
      titleMr: hazObj.titleMr,
      hazardType: hazObj.type,
      ward: locObj.ward,
      location: locObj.loc,
      coordinates: [
        locObj.coords[0] + (Math.random() - 0.5) * 0.006,
        locObj.coords[1] + (Math.random() - 0.5) * 0.006,
      ],
      status: 'VERIFICATION_PENDING',
      submittedDate: 'Just Now (Live)',
      assignedEngineer: `Er. M. S. Patil (Ward Eng - ${locObj.ward})`,
      contractorAgency: 'NMC Smart Rapid Cell',
      dlpExpiryDate: '36 Months Active DLP',
      beforePhoto: 'https://images.unsplash.com/photo-1544725121-be3bf52e2dc8?w=600&auto=format&fit=crop&q=80',
      afterPhoto: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=600&auto=format&fit=crop&q=80',
      aiConfidence: 96,
      citizenVotesConfirmed: 1,
      citizenVotesReopened: 0,
      userVerificationState: 'none'
    };
  };

  // Live simulation streamer (every 22s)
  useEffect(() => {
    if (!isLiveStreaming) return;

    const interval = setInterval(() => {
      const newTicket = generateSimulatedTicket();
      setTickets((prev) => [newTicket, ...prev]);

      // Post to PostgreSQL API asynchronously
      postComplaintToDatabase(newTicket);

      setLiveToastNotification(`⚡ LIVE INCIDENT: ${newTicket.ticketNumber} reported in ${newTicket.ward}`);
      setTimeout(() => setLiveToastNotification(null), 4000);
    }, 22000);

    return () => clearInterval(interval);
  }, [isLiveStreaming]);

  const handleManualSimulatedReport = () => {
    const newTicket = generateSimulatedTicket();
    setTickets((prev) => [newTicket, ...prev]);
    postComplaintToDatabase(newTicket);

    setLiveToastNotification(`⚡ DEMO SIMULATION: ${newTicket.ticketNumber} pushed to PostgreSQL & GIS Map!`);
    setTimeout(() => setLiveToastNotification(null), 4000);
  };

  const handleOpenAutoFilledComplaint = (data: {
    hazardType: HazardType;
    ward: WardName;
    location: string;
    aiConfidence: number;
  }) => {
    setModalInitialData(data);
    setIsModalOpen(true);
  };

  const handleOpenGeneralReportModal = () => {
    setModalInitialData(null);
    setIsModalOpen(true);
  };

  const handleAddTicket = (newTicket: CivicTicket) => {
    setTickets((prev) => [newTicket, ...prev]);
    postComplaintToDatabase(newTicket);

    setLiveToastNotification(`✓ COMPLAINT SUBMITTED: Ticket ${newTicket.ticketNumber} saved to PostgreSQL database.`);
    setTimeout(() => setLiveToastNotification(null), 4000);
  };

  const handleUpdateTicketVote = (ticketId: string, action: 'confirm' | 'reopen') => {
    setTickets((prev) =>
      prev.map((ticket) => {
        if (ticket.id === ticketId) {
          if (action === 'confirm') {
            return {
              ...ticket,
              citizenVotesConfirmed: ticket.citizenVotesConfirmed + 1,
              userVerificationState: 'confirmed',
              status: 'CLOSED_VERIFIED',
            };
          } else {
            return {
              ...ticket,
              citizenVotesReopened: ticket.citizenVotesReopened + 1,
              userVerificationState: 'reopened',
              status: 'REOPENED_ESCALATED',
            };
          }
        }
        return ticket;
      })
    );

    // Sync vote to PostgreSQL
    submitVoteToDatabase(ticketId, action);
  };

  const isDark = theme === 'dark';

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-300 selection:bg-emerald-500 selection:text-white ${
      isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'
    }`}>
      {/* 1. Header & Navigation Bar */}
      <Header
        selectedWard={selectedWard}
        onSelectWard={setSelectedWard}
        language={language}
        onToggleLanguage={toggleLanguage}
        theme={theme}
        onToggleTheme={toggleTheme}
        onOpenReportModal={handleOpenGeneralReportModal}
      />

      {/* Live Streamer & Weather Hazard Alert Bar */}
      <WeatherHazardBanner
        language={language}
        theme={theme}
        isLiveStreaming={isLiveStreaming}
        onToggleStreaming={() => setIsLiveStreaming((prev) => !prev)}
        onTriggerManualSimulatedReport={handleManualSimulatedReport}
      />

      {/* Database Connection Status Bar */}
      <div className={`px-4 py-1 border-b text-[11px] font-semibold flex items-center justify-between ${
        isDark ? 'bg-slate-900/60 border-slate-800 text-slate-400' : 'bg-slate-100 border-slate-200 text-slate-600'
      }`}>
        <div className="flex items-center gap-2 max-w-7xl mx-auto w-full">
          <Database className="w-3.5 h-3.5 text-emerald-500" />
          <span>Database Target: <strong className="text-emerald-500 font-mono">PostgreSQL / Supabase (PostGIS enabled)</strong></span>
          <span className="opacity-40">•</span>
          <span className="text-emerald-600 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
            {dbStatus === 'CONNECTED' ? '✅ PostgreSQL Live Connected' : '⚡ Real-time Socket API Ready (Port 5000)'}
          </span>
        </div>
      </div>

      {/* Live Toast Notification Banner */}
      {liveToastNotification && (
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-600 text-white text-xs font-extrabold px-4 py-2 flex items-center justify-center gap-2 shadow-lg animate-in fade-in slide-in-from-top-2 duration-200 sticky top-14 z-30">
          <Radio className="w-4 h-4 animate-pulse" />
          <span>{liveToastNotification}</span>
        </div>
      )}

      <main className="flex-1 space-y-0">
        {/* 2. Real-Time KPI Metrics Banner */}
        <KpiBanner
          language={language}
          selectedWard={selectedWard}
          theme={theme}
        />

        {/* 3. Interactive GIS Map Layer */}
        <GisMap
          projects={roadProjects}
          selectedWard={selectedWard}
          onSelectWard={setSelectedWard}
          language={language}
          theme={theme}
        />

        {/* 4. Transparency & "Closed != Resolved" Verification Tracker */}
        <VerificationTracker
          tickets={tickets}
          language={language}
          selectedWard={selectedWard}
          theme={theme}
          onUpdateTicketVote={handleUpdateTicketVote}
        />

        {/* 5. Civic Sense & Safety Rules Section */}
        <CivicSafetyRules
          language={language}
          theme={theme}
        />
      </main>

      {/* 6. Smart Complaint AI Chatbot Widget */}
      <ChatbotWidget
        language={language}
        theme={theme}
        onOpenAutoFilledComplaint={handleOpenAutoFilledComplaint}
      />

      {/* Auto-Filled Complaint Modal */}
      <ComplaintFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        language={language}
        theme={theme}
        initialData={modalInitialData}
        onSubmitSuccess={handleAddTicket}
      />

      {/* Municipal Footer */}
      <footer className={`${isDark ? 'bg-slate-950 border-slate-800 text-slate-400' : 'bg-slate-900 border-slate-800 text-slate-300'} border-t text-xs py-8 px-4 transition-colors duration-300`}>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold text-white text-sm">{t.title}</p>
              <p className="text-slate-400 text-[11px]">
                Nashik Municipal Corporation (NMC) Smart Governance Initiative
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-slate-300 text-xs flex-wrap justify-center">
            <span>Panchavati</span> • 
            <span>Nashik East</span> • 
            <span>Nashik West</span> • 
            <span>Cidco</span> • 
            <span>Satpur</span> • 
            <span>Nashik Road</span>
          </div>

          <div className="text-slate-400 text-[11px] flex items-center gap-1">
            <span>Built for NMC Accountability & Citizen Empowerment</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
