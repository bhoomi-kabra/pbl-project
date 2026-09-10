import React, { useState, useEffect } from 'react';
import { WardName, Language, ThemeMode, CivicTicket, HazardType, RoadWorkProject, UserRoleMode } from './types';
import { mockRoadProjects } from './data/mockData';
import { translations } from './data/translations';
import { 
  fetchTicketsFromDatabase, 
  postComplaintToDatabase, 
  submitVoteToDatabase, 
  submitPlusOneToDatabase, 
  submitCommentToDatabase, 
  resolveTicketInDatabase,
  UserAccount 
} from './services/api';
import { Header, AppViewMode } from './components/Header';
import { BottomMobileNav } from './components/BottomMobileNav';
import { KpiBanner } from './components/KpiBanner';
import { GisMap } from './components/GisMap';
import { ChatbotWidget } from './components/ChatbotWidget';
import { ComplaintFormModal } from './components/ComplaintFormModal';
import { CivicSafetyRules } from './components/CivicSafetyRules';
import { VerificationTracker } from './components/VerificationTracker';
import { AdminDashboard } from './components/AdminDashboard';
import { SocialMediaFeed } from './components/SocialMediaFeed';
import { CommunitySelfResolution } from './components/CommunitySelfResolution';
import { AuthModal } from './components/AuthModal';
import { Building2, Radio } from 'lucide-react';

export function App() {
  const [selectedWard, setSelectedWard] = useState<WardName>('All Wards');
  const [language, setLanguage] = useState<Language>('en');
  const [theme, setTheme] = useState<ThemeMode>('dark');
  
  // Auth & User State
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);
  const [userRole, setUserRole] = useState<UserRoleMode>('CITIZEN');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  
  const [activeView, setActiveView] = useState<AppViewMode>('SOCIAL_FEED');
  const [tickets, setTickets] = useState<CivicTicket[]>([]);
  const [roadProjects, setRoadProjects] = useState<RoadWorkProject[]>(mockRoadProjects);

  const [liveToastNotification, setLiveToastNotification] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [modalInitialData, setModalInitialData] = useState<{
    hazardType?: HazardType;
    ward?: WardName;
    location?: string;
    aiConfidence?: number;
  } | null>(null);

  const t = translations[language];

  // Fetch initial tickets from persistent backend database on mount
  useEffect(() => {
    async function loadDatabaseData() {
      const dbTickets = await fetchTicketsFromDatabase();
      if (dbTickets && dbTickets.length > 0) {
        setTickets(dbTickets);
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

  const handleLoginSuccess = (user: UserAccount) => {
    setCurrentUser(user);
    setUserRole(user.role);
    if (user.role === 'ADMIN') {
      setActiveView('ADMIN_DASHBOARD');
      setLiveToastNotification(`🛡️ Authenticated as Municipal Admin: ${user.name}`);
    } else {
      setActiveView('SOCIAL_FEED');
      setLiveToastNotification(`👤 Signed in as Citizen: ${user.name}`);
    }
    setTimeout(() => setLiveToastNotification(null), 4000);
  };

  const handleSignOut = () => {
    setCurrentUser(null);
    setUserRole('CITIZEN');
    setActiveView('SOCIAL_FEED');
    setLiveToastNotification(`Signed out successfully.`);
    setTimeout(() => setLiveToastNotification(null), 3000);
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

  // Create complaint & save to backend database
  const handleAddTicket = async (newTicket: CivicTicket) => {
    const ticketWithUser: CivicTicket = {
      ...newTicket,
      reporterName: currentUser ? currentUser.name : 'Anonymous Citizen',
      reporterMobile: currentUser ? currentUser.mobile : '',
    };

    setTickets((prev) => [ticketWithUser, ...prev]);

    // Save to backend REST API
    await postComplaintToDatabase(ticketWithUser);

    setLiveToastNotification(`✓ COMPLAINT REGISTERED & SAVED TO BACKEND DB: Ticket ${ticketWithUser.ticketNumber}`);
    setTimeout(() => setLiveToastNotification(null), 4000);
  };

  // +1 Upvote & save to backend database
  const handlePlusOneVote = async (ticketId: string) => {
    const userName = currentUser ? currentUser.name : 'Citizen';

    setTickets((prev) =>
      prev.map((tk) => {
        if (tk.id === ticketId) {
          const updatedPlusOne = (tk.plusOneCount || 0) + 1;
          const updatedImpact = (tk.impactScore || 0) + 5;
          let newRisk = tk.riskLevel;
          if (updatedImpact > 100) newRisk = 'CRITICAL';
          else if (updatedImpact > 40) newRisk = 'HIGH';

          return {
            ...tk,
            plusOneCount: updatedPlusOne,
            impactScore: updatedImpact,
            riskLevel: newRisk,
          };
        }
        return tk;
      })
    );

    await submitPlusOneToDatabase(ticketId, userName);
  };

  // Add Comment & save to backend database
  const handleAddComment = async (ticketId: string, commentText: string) => {
    const userName = currentUser ? currentUser.name : 'Citizen';

    setTickets((prev) =>
      prev.map((tk) => {
        if (tk.id === ticketId) {
          const newComments = tk.comments ? [...tk.comments] : [];
          newComments.push({
            id: `c-${Date.now()}`,
            userName: userName,
            userRole: userRole,
            text: commentText,
            timestamp: 'Just now'
          });
          return { ...tk, comments: newComments };
        }
        return tk;
      })
    );

    await submitCommentToDatabase(ticketId, userName, userRole, commentText);
  };

  // Citizen audit vote
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
              autoVanishDaysLeft: 15,
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

    submitVoteToDatabase(ticketId, action);
  };

  // Admin resolve ticket & save proof to backend database
  const handleAdminResolveTicket = async (ticketId: string, proofPhotoUrl: string, notes?: string) => {
    setTickets((prev) =>
      prev.map((tk) => {
        if (tk.id === ticketId) {
          return {
            ...tk,
            status: 'EVIDENCE_UPLOADED',
            afterPhoto: proofPhotoUrl,
            autoVanishDaysLeft: 15,
          };
        }
        return tk;
      })
    );

    await resolveTicketInDatabase(ticketId, proofPhotoUrl, notes);

    setLiveToastNotification(`📸 ADMIN PROOF SAVED TO BACKEND DB: Ticket ${ticketId} resolved.`);
    setTimeout(() => setLiveToastNotification(null), 4000);
  };

  const isDark = theme === 'dark';

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-300 selection:bg-emerald-500 selection:text-white pb-16 md:pb-0 ${
      isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'
    }`}>
      {/* 1. Clean Header & Navigation Bar */}
      <Header
        selectedWard={selectedWard}
        onSelectWard={setSelectedWard}
        language={language}
        onToggleLanguage={toggleLanguage}
        theme={theme}
        onToggleTheme={toggleTheme}
        onOpenReportModal={handleOpenGeneralReportModal}
        activeView={activeView}
        onChangeView={setActiveView}
        userRole={userRole}
        currentUser={currentUser}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onSignOut={handleSignOut}
      />

      {/* Live Toast Notification Banner */}
      {liveToastNotification && (
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-600 text-white text-xs font-extrabold px-4 py-2 flex items-center justify-center gap-2 shadow-lg animate-in fade-in slide-in-from-top-2 duration-200 sticky top-14 z-30">
          <Radio className="w-4 h-4 animate-pulse" />
          <span>{liveToastNotification}</span>
        </div>
      )}

      <main className="flex-1 space-y-0">
        {/* Dynamic View Rendering Based on Navigation Tab & Role */}
        {activeView === 'SOCIAL_FEED' && (
          <SocialMediaFeed
            tickets={tickets}
            language={language}
            theme={theme}
            selectedWard={selectedWard}
            onOpenReportModal={handleOpenGeneralReportModal}
            onPlusOneVote={handlePlusOneVote}
            onAddComment={handleAddComment}
          />
        )}

        {activeView === 'GIS_MAP' && (
          <>
            <KpiBanner
              language={language}
              selectedWard={selectedWard}
              theme={theme}
            />

            <GisMap
              projects={roadProjects}
              selectedWard={selectedWard}
              onSelectWard={setSelectedWard}
              language={language}
              theme={theme}
            />

            <VerificationTracker
              tickets={tickets}
              language={language}
              selectedWard={selectedWard}
              theme={theme}
              onUpdateTicketVote={handleUpdateTicketVote}
            />
          </>
        )}

        {activeView === 'ADMIN_DASHBOARD' && userRole === 'ADMIN' && (
          <AdminDashboard
            tickets={tickets}
            language={language}
            theme={theme}
            selectedWard={selectedWard}
            onSelectWard={setSelectedWard}
            onAdminResolveTicket={handleAdminResolveTicket}
          />
        )}

        {activeView === 'COMMUNITY_RESOLVE' && (
          <CommunitySelfResolution
            language={language}
            theme={theme}
            selectedWard={selectedWard}
          />
        )}

        <CivicSafetyRules
          language={language}
          theme={theme}
        />
      </main>

      <ChatbotWidget
        language={language}
        theme={theme}
        onOpenAutoFilledComplaint={handleOpenAutoFilledComplaint}
      />

      <ComplaintFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        language={language}
        theme={theme}
        initialData={modalInitialData}
        onSubmitSuccess={handleAddTicket}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
        isDark={isDark}
      />

      <BottomMobileNav
        activeView={activeView}
        onChangeView={setActiveView}
        onOpenReportModal={handleOpenGeneralReportModal}
        theme={theme}
        language={language}
        userRole={userRole}
        currentUser={currentUser}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
      />

      <footer className={`${isDark ? 'bg-slate-950 border-slate-800 text-slate-400' : 'bg-slate-900 border-slate-800 text-slate-300'} border-t text-xs py-8 px-4 transition-colors duration-300 mb-12 md:mb-0`}>
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

          <div className="text-slate-400 text-[11px]">
            <span>Built for NMC Accountability & Citizen Empowerment</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
