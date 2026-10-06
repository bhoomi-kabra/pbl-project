'use client';

import React from 'react';
import { useApp } from '@/lib/AppContext';
import { 
  ShieldAlert, 
  PhoneCall, 
  AlertTriangle, 
  CheckCircle2, 
  Scale, 
  Flame, 
  Zap, 
  Building, 
  HeartHandshake,
  ExternalLink,
  Globe,
  Smartphone,
  Lightbulb,
  Compass
} from 'lucide-react';

export default function CivicSafetyRules() {
  const { t } = useApp();

  return (
    <div className="space-y-5">
      
      {/* Bylaws & Penalties Section */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
        <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
          <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-600 dark:text-rose-400">
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
              {t.finesHeading}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Official penalties and statutory accountability norms mandated across all 6 NMC Wards
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Card 1: Solid Waste Dumping Fine */}
          <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/30 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-rose-600 text-white shadow-xs">
                {t.fineAmount}
              </span>
              <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400" />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
              Illegal Debris & Waste Dumping on Public Carriageways
            </h3>
            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
              {t.fineDebrisDesc}
            </p>
            <div className="text-[11px] text-rose-700 dark:text-rose-300 font-medium bg-rose-100/80 dark:bg-rose-950/60 p-2 rounded-lg border border-rose-200 dark:border-rose-900/50">
              <b>Statutory Reference:</b> Maharashtra Municipal Corporations Act (MMCA), Sec. 376.
            </div>
          </div>

          {/* Card 2: Road Cutting Norms */}
          <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-amber-500 text-slate-950 shadow-xs">
                FIR & Blacklisting
              </span>
              <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
              Unauthorized Road Cutting & Utility Trenching
            </h3>
            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
              {t.roadCuttingBylaw}
            </p>
            <div className="text-[11px] text-amber-800 dark:text-amber-300 font-medium bg-amber-100/80 dark:bg-amber-950/60 p-2 rounded-lg border border-amber-200 dark:border-amber-900/50">
              <b>Reinstatement Mandate:</b> Contractor must compact backfill in 3 layers and seal within 48h.
            </div>
          </div>

          {/* Card 3: Defect Liability Period (DLP) Standard */}
          <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/30 space-y-2.5 md:col-span-2">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-blue-600 text-white shadow-xs">
                DLP Warranty Standard
              </span>
              <CheckCircle2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
              Indian Roads Congress (IRC) Defect Liability Period (DLP) Standard
            </h3>
            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
              Every asphalt and concrete road built under NMC tenders carries a statutory <b>3 to 5-year warranty</b>. 
              Any pothole or structural defect arising within this countdown period must be repaired by the contractor 
              at zero municipal cost under penalty of security deposit forfeiture.
            </p>
          </div>
        </div>
      </div>

      {/* 24x7 Nashik Emergency Contacts */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <PhoneCall className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
              {t.emergencyContactsTitle}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Direct dial municipal dispatch and safety helplines for urgent hazards
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 text-xs">
          
          <a
            href="tel:7030300300"
            className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition space-y-1 block group"
          >
            <div className="flex items-center justify-between">
              <span className="text-slate-500 dark:text-slate-400 font-medium">NMC 24x7 Control Room</span>
              <Building className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-sm font-bold text-amber-600 dark:text-amber-400 group-hover:text-amber-500">
              0253-2575631 / 7030300300
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">Municipal headquarters round-the-clock desk</p>
          </a>

          <a
            href="tel:1912"
            className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition space-y-1 block group"
          >
            <div className="flex items-center justify-between">
              <span className="text-slate-500 dark:text-slate-400 font-medium">MSEDCL Electricity Emergency</span>
              <Zap className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-sm font-bold text-amber-600 dark:text-amber-400 group-hover:text-amber-500">
              1912 (Toll Free)
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">Snapped cables, sparking transformers</p>
          </a>

          <a
            href="tel:112"
            className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition space-y-1 block group"
          >
            <div className="flex items-center justify-between">
              <span className="text-slate-500 dark:text-slate-400 font-medium">Nashik City Police & Traffic</span>
              <ShieldAlert className="w-4 h-4 text-blue-500" />
            </div>
            <div className="text-sm font-bold text-blue-600 dark:text-blue-400 group-hover:text-blue-500">
              112 / 100
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">Traffic diversions & emergency accidents</p>
          </a>

          <a
            href="tel:101"
            className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition space-y-1 block group"
          >
            <div className="flex items-center justify-between">
              <span className="text-slate-500 dark:text-slate-400 font-medium">Nashik Fire Brigade</span>
              <Flame className="w-4 h-4 text-rose-500" />
            </div>
            <div className="text-sm font-bold text-rose-600 dark:text-rose-400 group-hover:text-rose-500">
              101
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">Tree falls, chemical spills, rescues</p>
          </a>

          <a
            href="tel:18002331982"
            className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition space-y-1 block group"
          >
            <div className="flex items-center justify-between">
              <span className="text-slate-500 dark:text-slate-400 font-medium">NMC Toll-Free Citizen Line</span>
              <PhoneCall className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400 group-hover:text-emerald-500">
              1800 233 1982 (Toll Free)
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">Toll-free municipal services & grievance registration</p>
          </a>

          <a
            href="tel:18002677953"
            className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition space-y-1 block group"
          >
            <div className="flex items-center justify-between">
              <span className="text-slate-500 dark:text-slate-400 font-medium">Smart Streetlight Helpline</span>
              <Lightbulb className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-sm font-bold text-amber-600 dark:text-amber-400 group-hover:text-amber-500">
              1800 2677 953
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">LED smart pole outage & dark street dispatch</p>
          </a>

          <a
            href="tel:1033"
            className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 border border-rose-200 dark:border-rose-900/40 transition space-y-1 block group"
          >
            <div className="flex items-center justify-between">
              <span className="text-slate-500 dark:text-slate-400 font-medium">NHAI Highway Emergency</span>
              <Compass className="w-4 h-4 text-rose-500" />
            </div>
            <div className="text-sm font-bold text-rose-600 dark:text-rose-400 group-hover:text-rose-500">
              1033 (National Highway)
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">NH-3 / NH-60 Dwarka, Mumbai Naka & flyover issues</p>
          </a>

          <a
            href="tel:1077"
            className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition space-y-1 block group"
          >
            <div className="flex items-center justify-between">
              <span className="text-slate-500 dark:text-slate-400 font-medium">District Disaster Management</span>
              <HeartHandshake className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400 group-hover:text-emerald-500">
              1077 / 0253-2384444
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">Godavari flood alerts & severe inundations</p>
          </a>
        </div>
      </div>

      {/* Official Government Apps & Portals Hub */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
              अधिकृत नाशिक महानगरपालिका व महामार्ग पोर्टल्स (Official Portals & Apps)
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Direct access to official government grievance systems & mobile applications
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 text-xs">
          {/* Portal 1: NMC Utilities Grievance */}
          <a
            href="http://grievance.nmcutilities.in/login"
            target="_blank"
            rel="noopener noreferrer"
            className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition space-y-2 block group"
          >
            <div className="flex items-center justify-between">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-blue-500 text-white">
                NMC Official Web
              </span>
              <ExternalLink className="w-4 h-4 text-blue-500 group-hover:translate-x-0.5 transition" />
            </div>
            <div className="font-bold text-slate-900 dark:text-slate-100 text-sm">
              NMC Citizen Grievance Portal
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              Official web portal tracking over 499,000+ public complaints across all municipal departments.
            </p>
            <div className="text-[10px] text-blue-600 dark:text-blue-400 font-bold flex items-center gap-1">
              grievance.nmcutilities.in →
            </div>
          </a>

          {/* Portal 2: Nashik Streetlight App */}
          <a
            href="https://apps.apple.com/in/app/nashik-streetlight-complaint/id6689521789"
            target="_blank"
            rel="noopener noreferrer"
            className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition space-y-2 block group"
          >
            <div className="flex items-center justify-between">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500 text-slate-950">
                iOS / Android App
              </span>
              <Smartphone className="w-4 h-4 text-amber-500 group-hover:scale-110 transition" />
            </div>
            <div className="font-bold text-slate-900 dark:text-slate-100 text-sm">
              Nashik Streetlight Complaint App
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              Official mobile app to register missing or broken LED streetlights with pole numbers across wards.
            </p>
            <div className="text-[10px] text-amber-600 dark:text-amber-400 font-bold flex items-center gap-1">
              Apple App Store & Play Store →
            </div>
          </a>

          {/* Portal 3: NMC e-Connect 2.0 */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2 block">
            <div className="flex items-center justify-between">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-600 text-white">
                Official NMC App
              </span>
              <Smartphone className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="font-bold text-slate-900 dark:text-slate-100 text-sm">
              NMC e-Connect 2.0 / Smart Nashik
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              Unified municipal mobile application for water bill payments, property tax, birth records, and civic complaints.
            </p>
            <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
              Available on Google Play & App Store
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
