'use client';

import React from 'react';
import { useApp } from '@/lib/AppContext';
import { Ward } from '@/lib/types';
import { 
  Building2, 
  MapPin, 
  Camera, 
  Clock, 
  CheckCircle2, 
  Bot, 
  ThumbsUp, 
  HardHat, 
  Scale, 
  ArrowRight,
  Layers,
  CheckCircle,
  XCircle,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';

interface LandingOverviewProps {
  onEnterPortal: (tab: string) => void;
}

const WARD_PROFILES: {
  id: Ward;
  nameEn: string;
  nameMr: string;
  landmarks: string;
  badge: string;
}[] = [
  {
    id: 'Panchavati',
    nameEn: 'Panchavati',
    nameMr: 'पंचवटी',
    landmarks: 'Ramkund • Godavari Ghats • Pilgrim Belt',
    badge: 'Pilgrim & Heritage Zone'
  },
  {
    id: 'Nashik West',
    nameEn: 'Nashik West',
    nameMr: 'नाशिक पश्चिम',
    landmarks: 'Gangapur Road • College Road • Canada Corner',
    badge: 'Commercial & Academic Hub'
  },
  {
    id: 'Nashik East',
    nameEn: 'Nashik East',
    nameMr: 'नाशिक पूर्व',
    landmarks: 'Dwarka • Mumbai Naka • Old City Bazaar',
    badge: 'Transit Arterial Core'
  },
  {
    id: 'Cidco',
    nameEn: 'Cidco',
    nameMr: 'सिडको',
    landmarks: 'Trimurti Chowk • Pawan Nagar • Untwadi',
    badge: 'Dense Residential Sector'
  },
  {
    id: 'Satpur',
    nameEn: 'Satpur',
    nameMr: 'सातपूर',
    landmarks: 'MIDC Industrial Estate • Trimbak Connector',
    badge: 'Heavy Industrial Corridor'
  },
  {
    id: 'Nashik Road',
    nameEn: 'Nashik Road',
    nameMr: 'नाशिक रोड',
    landmarks: 'Bytco Point • Central Railway Station • Jail Road',
    badge: 'Inter-City Terminal Corridor'
  }
];

export default function LandingOverview({ onEnterPortal }: LandingOverviewProps) {
  const { t, language, setIsComplaintModalOpen, setSelectedWard } = useApp();

  const handleSelectWard = (ward: Ward) => {
    setSelectedWard(ward);
    onEnterPortal('feed');
  };

  return (
    <div className="max-w-6xl mx-auto space-y-16 py-4 px-2 sm:px-4">
      
      {/* 1. Hero Showcase Section */}
      <section className="relative rounded-3xl overflow-hidden bg-gradient-to-b from-amber-500/10 via-white to-slate-50/50 dark:from-slate-900/90 dark:via-slate-900/50 dark:to-slate-950 border border-slate-200/80 dark:border-slate-800 p-5 sm:p-10 lg:p-14 text-center shadow-xs transition-colors">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-500/10 via-transparent to-transparent pointer-events-none" />

        <div className="max-w-3xl mx-auto space-y-6 relative z-10">
          
          {/* Municipal Trust Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/20 text-xs font-semibold text-amber-700 dark:text-amber-400">
            <Building2 className="w-3.5 h-3.5" />
            <span>{t.landingBadge}</span>
          </div>

          {/* Main Title */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 dark:text-slate-100 tracking-tight leading-tight">
            {language === 'mr' ? (
              <>
                नाशिक मॉनिटर <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 via-orange-500 to-amber-600 dark:from-amber-400 dark:via-orange-400 dark:to-amber-500">
                  "बंद म्हणजे निराकरण नव्हे!"
                </span>
              </>
            ) : (
              <>
                Nashik Monitor <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 via-orange-500 to-amber-600 dark:from-amber-400 dark:via-orange-400 dark:to-amber-500">
                  Where Closed ≠ Resolved.
                </span>
              </>
            )}
          </h1>

          {/* Subtitle */}
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
            {t.landingSubheadline}
          </p>

          {/* Primary Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 sm:gap-3 pt-2 w-full">
            <button
              onClick={() => onEnterPortal('feed')}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-slate-950 font-bold text-sm shadow-xs transition transform hover:scale-102 active:scale-98"
            >
              <span>{t.enterPortalBtn}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => onEnterPortal('map')}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700/80 text-slate-800 dark:text-slate-200 font-semibold text-sm border border-slate-200 dark:border-slate-700 transition"
            >
              <Layers className="w-4 h-4 text-amber-500" />
              <span>Explore GIS Map</span>
            </button>

            <button
              onClick={() => setIsComplaintModalOpen(true)}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 font-semibold text-sm border border-emerald-500/25 transition"
            >
              <Camera className="w-4 h-4" />
              <span>{t.reportIssueBtn}</span>
            </button>
          </div>

          {/* Key Metric Highlights */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 pt-6 border-t border-slate-200/80 dark:border-slate-800 text-left max-w-3xl mx-auto">
            <div className="p-3.5 rounded-xl bg-white/80 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 shadow-xs">
              <div className="text-[11px] text-slate-500 dark:text-slate-400">Jurisdiction</div>
              <div className="text-base font-extrabold text-amber-600 dark:text-amber-400 mt-0.5">6 NMC Wards</div>
              <div className="text-[10px] text-slate-400">Full municipal zone</div>
            </div>

            <div className="p-3.5 rounded-xl bg-white/80 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 shadow-xs">
              <div className="text-[11px] text-slate-500 dark:text-slate-400">Core Principle</div>
              <div className="text-base font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5">Closed ≠ Resolved</div>
              <div className="text-[10px] text-slate-400">No unilateral closures</div>
            </div>

            <div className="p-3.5 rounded-xl bg-white/80 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 shadow-xs">
              <div className="text-[11px] text-slate-500 dark:text-slate-400">Citizen Consensus</div>
              <div className="text-base font-extrabold text-blue-600 dark:text-blue-400 mt-0.5">3 Votes Quorum</div>
              <div className="text-[10px] text-slate-400">Community verified</div>
            </div>

            <div className="p-3.5 rounded-xl bg-white/80 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 shadow-xs">
              <div className="text-[11px] text-slate-500 dark:text-slate-400">Road Warranty</div>
              <div className="text-base font-extrabold text-amber-600 dark:text-amber-400 mt-0.5">3 to 5 Years</div>
              <div className="text-[10px] text-slate-400">IRC DLP Enforcement</div>
            </div>
          </div>

        </div>
      </section>

      {/* 2. The Core Philosophy: "Closed ≠ Resolved" */}
      <section className="space-y-6">
        <div className="text-center max-w-xl mx-auto space-y-1.5">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">Municipal Innovation</span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100">
            {t.howItWorksHeading}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            {t.howItWorksDesc}
          </p>
        </div>

        {/* Constrained side-by-side comparison container to avoid wide-screen stretching */}
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Legacy Broken Approach */}
          <div className="p-6 rounded-2xl bg-rose-50/40 dark:bg-rose-950/20 border border-rose-200/80 dark:border-rose-900/40 space-y-4">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 dark:bg-rose-900/50 text-rose-700 dark:text-rose-300">
                Traditional Flawed Model
              </span>
              <XCircle className="w-5 h-5 text-rose-500" />
            </div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
              Unilateral Contractor Closure
            </h3>
            <ul className="space-y-3 text-xs text-slate-700 dark:text-slate-300">
              <li className="flex items-start gap-2.5">
                <span className="text-rose-500 font-bold shrink-0">✕</span>
                <span>Contractor unilaterally marks ticket "Done" on internal portal without public review.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-rose-500 font-bold shrink-0">✕</span>
                <span>Substandard cold asphalt is applied that washes away in the next rainfall.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-rose-500 font-bold shrink-0">✕</span>
                <span>Affected citizens have zero right to inspect photographic evidence or dispute the fix.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-rose-500 font-bold shrink-0">✕</span>
                <span>Contractor escapes defect liability penalties (DLP); municipal funds are wasted.</span>
              </li>
            </ul>
          </div>

          {/* NMC Closed ≠ Resolved Model */}
          <div className="p-6 rounded-2xl bg-emerald-50/40 dark:bg-emerald-950/20 border border-emerald-300/80 dark:border-emerald-800/60 space-y-4 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300">
                Nashik Monitor Standard
              </span>
              <CheckCircle className="w-5 h-5 text-emerald-500" />
            </div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
              The "Closed ≠ Resolved" Doctrine
            </h3>
            <ul className="space-y-3 text-xs text-slate-700 dark:text-slate-300">
              <li className="flex items-start gap-2.5">
                <span className="text-emerald-600 dark:text-emerald-400 font-bold shrink-0">✓</span>
                <span>Mandatory geotagged Before-Repair vs After-Repair photographic proof.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-emerald-600 dark:text-emerald-400 font-bold shrink-0">✓</span>
                <span>Requires <b>3 independent citizen votes</b> to confirm resolution before official closure.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-emerald-600 dark:text-emerald-400 font-bold shrink-0">✓</span>
                <span>Citizens can click <b>"Reopen Ticket"</b>, alerting executive engineers to impose contractor penalties.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-emerald-600 dark:text-emerald-400 font-bold shrink-0">✓</span>
                <span>Active 3 to 5 year Defect Liability Period (DLP) warranties tracked on public GIS map.</span>
              </li>
            </ul>
          </div>

        </div>
      </section>

      {/* 3. Coverage Area: The 6 Administrative Wards of Nashik */}
      <section className="space-y-6">
        <div className="text-center max-w-xl mx-auto space-y-1.5">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">Jurisdiction</span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100">
            All 6 NMC Administrative Wards
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            Click on any ward to inspect active road complaints and infrastructure projects.
          </p>
        </div>

        {/* Spacious 3-column grid (2 rows of 3) instead of crammed 6-in-1 row */}
        <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {WARD_PROFILES.map((ward, index) => (
            <div
              key={ward.id}
              onClick={() => handleSelectWard(ward.id)}
              className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 hover:border-amber-500/50 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between space-y-3"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                    Ward 0{index + 1}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-medium">
                    {ward.badge}
                  </span>
                </div>
                <div className="flex items-baseline gap-2">
                  <h3 className="font-extrabold text-base text-slate-900 dark:text-slate-100 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                    {ward.nameEn}
                  </h3>
                  <span className="text-xs font-bold text-slate-400 dark:text-slate-500">
                    {ward.nameMr}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-start gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                  <span>{ward.landmarks}</span>
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs font-semibold text-amber-600 dark:text-amber-400">
                <span>View Ward Complaints</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Key Feature Pillars */}
      <section className="space-y-6">
        <div className="text-center max-w-xl mx-auto space-y-1.5">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">Platform Pillars</span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100">
            Engineered for Civic Transparency
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            A unified suite of digital governance tools built for citizens, engineers, and contractors.
          </p>
        </div>

        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          
          {/* Card 1: GIS Map & DLP */}
          <div
            onClick={() => onEnterPortal('map')}
            className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 hover:border-amber-500/50 hover:shadow-md transition-all cursor-pointer space-y-3 group flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                GIS Map & DLP Warranties
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Interactive Leaflet map showing all 6 ward boundaries, road project phases (Trenching, Concreting, Curing, Completed), and live warranty countdowns.
              </p>
            </div>
            <div className="text-xs font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1 pt-1">
              <span>Explore Map</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>

          {/* Card 2: Closed != Resolved Studio */}
          <div
            onClick={() => onEnterPortal('verify')}
            className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 hover:border-amber-500/50 hover:shadow-md transition-all cursor-pointer space-y-3 group flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                <Camera className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                Photographic Verification Hub
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Side-by-side interactive split slider comparing Before vs After photos. Cast your vote to confirm repair quality or reopen substandard work.
              </p>
            </div>
            <div className="text-xs font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1 pt-1">
              <span>Inspect Verifications</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>

          {/* Card 3: AI Assistant */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 space-y-3 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
                <Bot className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                AI Hazard Intent Classifier
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Docked bilingual chatbot recognizing road defects and open manholes in Marathi & English, pre-filling complaint forms in 1 click.
              </p>
            </div>
            <div className="text-xs font-bold text-purple-600 dark:text-purple-400 flex items-center gap-1 pt-1">
              <span>English & मराठी Support</span>
            </div>
          </div>

          {/* Card 4: Crowdsourced Social Feed */}
          <div
            onClick={() => onEnterPortal('feed')}
            className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 hover:border-amber-500/50 hover:shadow-md transition-all cursor-pointer space-y-3 group flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                <ThumbsUp className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                Civic Feed & Impact Scoring
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Real-time complaint stream with "+1 I Face This Too" endorsements, auto-calculating priority impact scores for arterial road hazards.
              </p>
            </div>
            <div className="text-xs font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1 pt-1">
              <span>Browse Civic Feed</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>

          {/* Card 5: Role-based Governance */}
          <div
            onClick={() => onEnterPortal('admin')}
            className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 hover:border-amber-500/50 hover:shadow-md transition-all cursor-pointer space-y-3 group flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
                <HardHat className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                Multi-Role Admin Portal
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Dedicated dashboards for Citizens, NMC Ward Engineers (48h SLA tracking), and Road Contractors (advancing phases & submitting completion proof).
              </p>
            </div>
            <div className="text-xs font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1 pt-1">
              <span>Access Portal</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>

          {/* Card 6: Bylaws & Helplines */}
          <div
            onClick={() => onEnterPortal('rules')}
            className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 hover:border-amber-500/50 hover:shadow-md transition-all cursor-pointer space-y-3 group flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center">
                <Scale className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                Bylaws, Fines & Helplines
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Statutory ₹5,000 spot fine policies for debris dumping, road-cutting regulations, and direct emergency dispatch phone numbers.
              </p>
            </div>
            <div className="text-xs font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1 pt-1">
              <span>View Helplines</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>

        </div>
      </section>

      {/* 5. How It Works: Step-by-Step Lifecycle */}
      <section className="space-y-6">
        <div className="text-center max-w-xl mx-auto space-y-1.5">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">Workflow</span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100">
            The 4-Step Accountability Journey
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            How a reported road defect moves from citizen complaint to verified resolution.
          </p>
        </div>

        <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 space-y-2.5">
            <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 font-black flex items-center justify-center text-xs">
              01
            </div>
            <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm">Geotagged Report</h4>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              Citizen captures GPS-tagged "Before Repair" photographic evidence of the hazard.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 space-y-2.5">
            <div className="w-7 h-7 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 font-black flex items-center justify-center text-xs">
              02
            </div>
            <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm">Engineer SLA Notice</h4>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              NMC Ward Executive Engineer assigns the road tender contractor with a 48-hour SLA deadline.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 space-y-2.5">
            <div className="w-7 h-7 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 font-black flex items-center justify-center text-xs">
              03
            </div>
            <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm">Contractor Repair Proof</h4>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              Contractor completes repair per IRC specifications and uploads geotagged "After Repair" proof.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 space-y-2.5">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-black flex items-center justify-center text-xs">
              04
            </div>
            <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm">Citizen Quorum Verdict</h4>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              3 citizen votes confirm the repair to seal resolution, or a reopen flag penalizes the contractor.
            </p>
          </div>

        </div>
      </section>

      {/* 6. Bottom Banner CTA */}
      <section className="max-w-5xl mx-auto p-8 sm:p-10 rounded-3xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-slate-950 text-center space-y-4 shadow-sm">
        <h3 className="text-2xl sm:text-3xl font-black">
          Inspect Nashik's Road Infrastructure
        </h3>
        <p className="text-xs sm:text-sm font-medium max-w-lg mx-auto opacity-95 leading-relaxed">
          Join citizens across Panchavati, Nashik West, East, Cidco, Satpur, and Nashik Road in enforcing municipal accountability.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 sm:gap-3 pt-2 w-full max-w-md mx-auto">
          <button
            onClick={() => onEnterPortal('feed')}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-950 hover:bg-slate-900 text-white font-bold text-xs sm:text-sm shadow-xs transition"
          >
            Launch Civic Feed
          </button>
          <button
            onClick={() => onEnterPortal('map')}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-white/20 hover:bg-white/30 text-slate-950 font-bold text-xs sm:text-sm transition"
          >
            Explore GIS Map
          </button>
        </div>
      </section>

    </div>
  );
}
