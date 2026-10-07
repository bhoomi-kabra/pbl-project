'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/AppContext';
import { 
  ArrowLeft,
  Search,
  Camera,
  Flag,
  ShieldCheck,
  HardHat,
  Globe,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  HelpCircle,
  Scale,
  PhoneCall,
  ShieldAlert,
  CheckCircle2
} from 'lucide-react';

interface CivicSafetyRulesProps {
  onBack?: () => void;
}

export default function CivicSafetyRules({ onBack }: CivicSafetyRulesProps) {
  const { language, setLanguage, t } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedSection, setExpandedSection] = useState<string | null>('make_report');
  const [showStatutoryBylaws, setShowStatutoryBylaws] = useState(false);

  const toggleSection = (id: string) => {
    setExpandedSection(prev => prev === id ? null : id);
  };

  const RULES_DATA = [
    {
      id: 'make_report',
      icon: Camera,
      title: 'How to make a useful report',
      subtitle: 'Use the orange Report button. Add a genuine photo, a specific landmark and an accurate description. Avoid faces, private details and duplicate reports.',
      details: 'Ensure your photo clearly shows the hazard (pothole depth, missing manhole cover, water pooling). Tag the exact street name or nearby temple/school landmark so NMC ward road crews can locate it instantly without delay.'
    },
    {
      id: 'flag_report',
      icon: Flag,
      title: 'Flag a false or suspicious report',
      subtitle: 'Post ••• -> Flag as false report. Give a reason; the concern goes to review.',
      details: 'Civic trust depends on authentic reports. If an image is irrelevant, taken elsewhere, or duplicates an existing open complaint, use the report options menu (•••) to flag it. Reports flagged with valid reasons are reviewed by municipal moderators.'
    },
    {
      id: 'quorum_verify',
      icon: ShieldCheck,
      title: 'Citizen verification & quorum',
      subtitle: 'Closed ≠ Resolved · 3-vote quorum',
      details: 'Government closure notices are not taken at face value. When a contractor uploads an "After" photo claiming completion, 3 independent neighbourhood citizens must physically inspect and vote before the complaint is officially marked Resolved.'
    },
    {
      id: 'road_warranty',
      icon: HardHat,
      title: 'Road-work warranty',
      subtitle: '3–5 year DLP · check each work\'s terms',
      details: 'Under Indian Roads Congress (IRC) standards, all newly tarred or asphalt roads carry a statutory Defect Liability Period (DLP) of 3 to 5 years. Any potholes emerging during this warranty must be repaired by the contractor at zero taxpayer cost.'
    },
    {
      id: 'lang_access',
      icon: Globe,
      title: 'Language & accessibility',
      subtitle: 'English / मराठी',
      details: 'Nashik Monitor is natively bilingual. Switch between English and मराठी anytime using the header toggle. All report categories, defect descriptions, and statutory guidelines are fully translated for inclusive civic participation.'
    }
  ];

  const filteredRules = RULES_DATA.filter(r => 
    r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.details.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full max-w-xl mx-auto space-y-5 pb-12 transition-colors">
      
      {/* 1. Top Header (Figma Screen 8) */}
      <div className="flex items-center justify-between pb-1">
        <button
          onClick={onBack}
          className="flex items-center gap-2.5 text-[#111d2e] dark:text-slate-100 hover:text-[#d95b18] transition font-bold"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-[20px] font-black tracking-tight">Rules & Help</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setLanguage(language === 'en' ? 'mr' : 'en')}
            className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-[11px] font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-200 transition"
          >
            EN / म
          </button>
          <button 
            className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            aria-label="Help"
          >
            <HelpCircle className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* 2. Title & Subtitle */}
      <div className="space-y-1.5 pt-1">
        <h1 className="text-[26px] sm:text-[30px] font-black text-[#111d2e] dark:text-slate-100 tracking-tight leading-tight">
          A better feed starts
          <br />
          with all of us.
        </h1>
        <p className="text-[13px] sm:text-[14px] text-slate-500 dark:text-slate-400 max-w-md leading-relaxed">
          Useful evidence. Respectful discussion. Real accountability.
        </p>
      </div>

      {/* 3. Search Rules Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search rules and guidance"
          className="w-full pl-10 pr-4 py-3 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-transparent focus:border-[#d95b18] text-xs font-semibold text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none transition"
        />
      </div>

      {/* 4. Accordion List (Figma Screen 8) */}
      <div className="space-y-2.5">
        {filteredRules.map((rule) => {
          const isExpanded = expandedSection === rule.id;
          const Icon = rule.icon;

          return (
            <div
              key={rule.id}
              className={`rounded-2xl border transition-all ${
                isExpanded
                  ? 'bg-[#fdf5f0] dark:bg-slate-900/90 border-[#fae8dc] dark:border-slate-800 shadow-xs'
                  : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800'
              }`}
            >
              <button
                type="button"
                onClick={() => toggleSection(rule.id)}
                className="w-full p-4 flex items-start justify-between gap-3 text-left"
              >
                <div className="flex items-start gap-3.5">
                  <Icon className="w-5 h-5 text-[#d95b18] shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <h3 className="text-[14px] font-bold text-[#111d2e] dark:text-slate-100">
                      {rule.title}
                    </h3>
                    <p className="text-[12px] text-slate-500 dark:text-slate-400 leading-relaxed">
                      {rule.subtitle}
                    </p>
                  </div>
                </div>

                <div className="text-slate-400 shrink-0 pt-0.5">
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-[#d95b18]" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                </div>
              </button>

              {isExpanded && (
                <div className="px-4 pb-4 pt-1 text-[12px] text-slate-600 dark:text-slate-300 leading-relaxed border-t border-[#fae8dc]/60 dark:border-slate-800 animate-in fade-in-50 duration-150">
                  <p className="pl-8.5">{rule.details}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 5. Safety Comes First Alert Card (Figma Screen 8) */}
      <div className="rounded-2xl bg-[#fdf5f0] dark:bg-slate-900/60 border border-[#fae8dc] dark:border-slate-800 p-4 sm:p-5 flex items-start gap-3.5 shadow-xs">
        <div className="w-8 h-8 rounded-xl bg-orange-100/80 dark:bg-orange-950/40 text-[#d95b18] flex items-center justify-center shrink-0 border border-[#fae8dc] dark:border-orange-800/60">
          <AlertTriangle className="w-4 h-4" />
        </div>
        <div className="space-y-0.5">
          <h4 className="text-[14px] font-bold text-[#111d2e] dark:text-slate-100">
            Safety comes first
          </h4>
          <p className="text-[12px] text-slate-600 dark:text-slate-400 leading-relaxed">
            Do not enter a dangerous area to capture proof. Ensure personal safety when taking photos near moving traffic or deep trenches.
          </p>
        </div>
      </div>

      {/* 6. Statutory Bylaws & Emergency Helplines (Expandable Reference) */}
      <div className="pt-2">
        <button
          onClick={() => setShowStatutoryBylaws(!showStatutoryBylaws)}
          className="w-full py-3 px-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 transition"
        >
          <div className="flex items-center gap-2">
            <Scale className="w-4 h-4 text-[#d95b18]" />
            <span>NMC Statutory Bylaws, Fines & Ward Helplines</span>
          </div>
          {showStatutoryBylaws ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {showStatutoryBylaws && (
          <div className="mt-3 space-y-3 animate-in fade-in-50 duration-200">
            <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black bg-rose-600 text-white px-2 py-0.5 rounded-full">₹5,000 FINE</span>
                <span className="text-[10px] text-rose-700 font-bold">MMCA Sec. 376</span>
              </div>
              <h5 className="text-xs font-bold text-slate-900 dark:text-slate-100">Illegal Debris & Waste Dumping</h5>
              <p className="text-[11px] text-slate-600 dark:text-slate-300">
                Unauthorized debris unloading onto carriage-ways is punishable by instant compounding fine and vehicle seizure.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black bg-amber-600 text-white px-2 py-0.5 rounded-full">FIR & BLACKLISTING</span>
                <span className="text-[10px] text-amber-700 font-bold">48H REINSTATEMENT</span>
              </div>
              <h5 className="text-xs font-bold text-slate-900 dark:text-slate-100">Unauthorized Road Trenching</h5>
              <p className="text-[11px] text-slate-600 dark:text-slate-300">
                Cutting public roads without written NMC Executive Engineer permissions triggers immediate police complaints and contractor suspension.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200">
                <PhoneCall className="w-4 h-4 text-emerald-600" />
                <span>NMC 24x7 Emergency Ward Helplines</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 dark:text-slate-300 font-medium">
                <div>NMC Control Room: <b>0253-2575555</b></div>
                <div>Disaster Helpline: <b>1077</b></div>
                <div>Nashik Police Control: <b>112</b></div>
                <div>Fire & Rescue: <b>101</b></div>
              </div>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
