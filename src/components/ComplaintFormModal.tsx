import React, { useState, useEffect } from 'react';
import { Language, WardName, HazardType, ThemeMode, DepartmentType } from '../types';
import { translations } from '../data/translations';
import { X, AlertTriangle, ShieldCheck, Camera, CheckCircle2, ArrowRight, UploadCloud, HelpCircle, Film } from 'lucide-react';

interface ComplaintFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  theme: ThemeMode;
  initialData?: {
    hazardType?: HazardType;
    ward?: WardName;
    location?: string;
    aiConfidence?: number;
  } | null;
  onSubmitSuccess: (newTicket: any) => void;
}

export const ComplaintFormModal: React.FC<ComplaintFormModalProps> = ({
  isOpen,
  onClose,
  language,
  theme,
  initialData,
  onSubmitSuccess,
}) => {
  const t = translations[language];

  const [hazardType, setHazardType] = useState<HazardType | 'OTHER'>('ELECTRICAL_HAZARD');
  const [otherComplaintText, setOtherComplaintText] = useState<string>('');
  const [ward, setWard] = useState<WardName>('Panchavati');
  const [location, setLocation] = useState<string>('');
  const [aiConfidence, setAiConfidence] = useState<number | undefined>(undefined);
  const [mediaFileName, setMediaFileName] = useState<string>('geotagged_complaint_evidence.mp4');
  const [isMediaAttached, setIsMediaAttached] = useState<boolean>(true);
  const [isVideo, setIsVideo] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const isDark = theme === 'dark';

  // Auto detect responsible municipal department
  const getAutoDepartment = (type: string): DepartmentType => {
    if (type === 'ELECTRICAL_HAZARD') return 'MSEDCL_ELECTRICAL';
    if (type === 'WATER_LEAKAGE') return 'WATER_SUPPLY';
    if (type === 'STREETLIGHT_DEFECT') return 'STREETLIGHT_SAFETY';
    if (type === 'DRAINAGE_OVERFLOW') return 'DRAINAGE_SEWERAGE';
    return 'PWD_ROADS';
  };

  useEffect(() => {
    if (initialData) {
      if (initialData.hazardType) setHazardType(initialData.hazardType);
      if (initialData.ward) setWard(initialData.ward);
      if (initialData.location) setLocation(initialData.location);
      if (initialData.aiConfidence) setAiConfidence(initialData.aiConfidence);
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setMediaFileName(file.name);
      setIsMediaAttached(true);
      setIsVideo(file.type.startsWith('video/'));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      const finalTitle = hazardType === 'OTHER' 
        ? (otherComplaintText || 'Other Custom Civic Issue') 
        : hazardType === 'ELECTRICAL_HAZARD' 
        ? 'Exposed Electrical Hazard' 
        : 'Road Defect Reported';

      const generatedTicket = {
        id: `t-${Date.now()}`,
        ticketNumber: `NMC-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        title: finalTitle,
        titleMr: hazardType === 'OTHER' ? (otherComplaintText || 'इतर नागरिक तक्रार') : 'रस्ते दोष तक्रार',
        hazardType: hazardType === 'OTHER' ? 'POTHOLE' : hazardType,
        ward,
        location: location || 'Nashik City Road',
        coordinates: [20.0050, 73.7800],
        status: 'VERIFICATION_PENDING',
        submittedDate: 'Just Now',
        assignedEngineer: `Er. K. V. Patil (Ward Eng - ${ward})`,
        contractorAgency: 'NMC Smart City Rapid Action Cell',
        department: getAutoDepartment(hazardType),
        dlpExpiryDate: '36 Months DLP',
        beforePhoto: 'https://images.unsplash.com/photo-1544725121-be3bf52e2dc8?w=600&auto=format&fit=crop&q=80',
        afterPhoto: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=600&auto=format&fit=crop&q=80',
        aiConfidence: aiConfidence || 98,
        plusOneCount: 1,
        impactScore: 50,
        riskLevel: 'MEDIUM',
        comments: [],
        citizenVotesConfirmed: 1,
        citizenVotesReopened: 0,
        userVerificationState: 'none',
      };

      onSubmitSuccess(generatedTicket);
      setIsSubmitting(false);
      onClose();
    }, 700);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className={`border rounded-3xl max-w-lg w-full p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto ${
        isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-300 text-slate-900'
      }`}>
        
        {/* Header */}
        <div className={`flex items-center justify-between border-b pb-4 mb-4 ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-red-500/10 text-red-500 rounded-xl border border-red-500/20">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className={`text-base font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{t.submitComplaint}</h3>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Ward Selection → Category / Other → Photo/Video → Department</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-1 rounded-lg transition ${isDark ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'}`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* System Flow Stepper Indicator */}
        <div className="mb-4 p-2.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-between text-[11px] font-bold text-indigo-400">
          <span className="flex items-center gap-1">1. Ward ({ward})</span>
          <ArrowRight className="w-3 h-3 text-slate-500" />
          <span className="flex items-center gap-1">2. Type ({hazardType})</span>
          <ArrowRight className="w-3 h-3 text-slate-500" />
          <span className="flex items-center gap-1">3. Media ({isMediaAttached ? 'Attached' : 'Pending'})</span>
          <ArrowRight className="w-3 h-3 text-slate-500" />
          <span className="text-emerald-400">4. Auto Routing</span>
        </div>

        {aiConfidence && (
          <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-emerald-500 font-semibold">
              <ShieldCheck className="w-4 h-4" />
              <span>AI Auto-Classification Verified</span>
            </div>
            <span className="font-mono bg-emerald-500/20 text-emerald-500 px-2 py-0.5 rounded border border-emerald-500/30 font-bold">
              {aiConfidence}% Confidence
            </span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          
          {/* Step 1: Display of Ward */}
          <div>
            <label className={`block font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              1. Ward Selection (Where you live)
            </label>
            <select
              value={ward}
              onChange={(e) => setWard(e.target.value as WardName)}
              className={`w-full border rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 font-bold ${
                isDark ? 'bg-slate-950 text-white border-slate-800' : 'bg-slate-50 text-slate-900 border-slate-300'
              }`}
            >
              <option value="Panchavati">Panchavati (Ward 1)</option>
              <option value="Nashik East">Nashik East (Ward 2)</option>
              <option value="Nashik West">Nashik West (Ward 3)</option>
              <option value="Cidco">Cidco (Ward 4)</option>
              <option value="Satpur">Satpur (Ward 5)</option>
              <option value="Nashik Road">Nashik Road (Ward 6)</option>
            </select>
          </div>

          {/* Step 2: Display of Complaint Type */}
          <div>
            <label className={`block font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              2. Complaint Type & Auto Department Target
            </label>
            <select
              value={hazardType}
              onChange={(e) => setHazardType(e.target.value as any)}
              className={`w-full border rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 ${
                isDark ? 'bg-slate-950 text-white border-slate-800' : 'bg-slate-50 text-slate-900 border-slate-300'
              }`}
            >
              <option value="ELECTRICAL_HAZARD">⚡ ELECTRICAL_HAZARD (Sparking Wire → MSEDCL Electrical Dept)</option>
              <option value="POTHOLE">🕳️ POTHOLE (Deep Road Cave-in → PWD Roads Dept)</option>
              <option value="UNAUTHORIZED_EXCAVATION">🏗️ UNAUTHORIZED_EXCAVATION (Trenching → NMC Infra)</option>
              <option value="WATER_LEAKAGE">💧 WATER_LEAKAGE (Pipeline Burst → Water Supply Board)</option>
              <option value="STREETLIGHT_DEFECT">💡 STREETLIGHT_DEFECT (Dark Zone → Streetlight Safety)</option>
              <option value="OTHER">❓ OTHER: (Write Custom Complaint Detail)</option>
            </select>
          </div>

          {/* Conditional: If any complaint is registered as "OTHER" */}
          {hazardType === 'OTHER' && (
            <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl space-y-1.5 animate-in fade-in duration-200">
              <label className="block font-bold text-amber-400 flex items-center gap-1 text-[11px]">
                <HelpCircle className="w-3.5 h-3.5" /> Specify Custom Complaint Details ("Other"):
              </label>
              <input
                type="text"
                required
                value={otherComplaintText}
                onChange={(e) => setOtherComplaintText(e.target.value)}
                placeholder="Describe your unique complaint (e.g., Broken Footpath Slab, Garbage Overflow)..."
                className={`w-full border rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                  isDark ? 'bg-slate-950 text-white border-amber-500/40' : 'bg-white text-slate-900 border-amber-300'
                }`}
              />
            </div>
          )}

          {/* Location */}
          <div>
            <label className={`block font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{t.location}</label>
            <input
              type="text"
              required
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Near K.K. Wagh Engineering College Gate, Panchavati"
              className={`w-full border rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 ${
                isDark ? 'bg-slate-950 text-white border-slate-800' : 'bg-slate-50 text-slate-900 border-slate-300'
              }`}
            />
          </div>

          {/* Step 3: Photo or Video Upload */}
          <div>
            <label className={`block font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              3. Attach Geotagged Photo or Video Evidence
            </label>
            <label className={`border-2 border-dashed rounded-2xl p-3 flex items-center justify-between cursor-pointer transition ${
              isMediaAttached ? (isDark ? 'bg-emerald-500/10 border-emerald-500/40' : 'bg-emerald-50 border-emerald-300') : (isDark ? 'border-slate-700 bg-slate-950/60' : 'border-slate-300 bg-slate-50')
            }`}>
              <input type="file" accept="image/*,video/*" className="hidden" onChange={handleFileChange} />
              <div className={`flex items-center gap-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                {isVideo ? <Film className="w-4 h-4 text-purple-400" /> : <Camera className="w-4 h-4 text-emerald-500" />}
                <span className="font-mono text-[11px] truncate max-w-[220px]">
                  {isMediaAttached ? mediaFileName : 'Click to attach photo or .mp4 video'}
                </span>
              </div>
              <span className="text-emerald-500 font-bold flex items-center gap-1 text-[11px] bg-emerald-500/20 px-2 py-0.5 rounded">
                <UploadCloud className="w-3.5 h-3.5" /> Attach Media
              </span>
            </label>
          </div>

          {/* Auto Department Indicator */}
          <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl flex items-center justify-between text-xs">
            <span className="text-indigo-400 font-semibold">Assigned Municipal Dept:</span>
            <span className="font-mono font-bold text-indigo-400 bg-indigo-500/20 px-2.5 py-0.5 rounded border border-indigo-500/30">
              {getAutoDepartment(hazardType)}
            </span>
          </div>

          {/* Step 4: Verification Notice ("1 on 1 / how I can verify") */}
          <div className={`p-3 rounded-xl border text-[11px] flex items-center gap-2 ${
            isDark ? 'bg-slate-950/80 border-slate-800 text-slate-400' : 'bg-slate-100 border-slate-200 text-slate-600'
          }`}>
            <ShieldCheck className="w-4 h-4 text-indigo-400 shrink-0" />
            <span>
              <strong>Citizen Verification Right:</strong> Only YOU hold the key to verify and close or reopen this ticket after department uploads proof!
            </span>
          </div>

          {/* Buttons */}
          <div className={`pt-3 flex items-center justify-end gap-3 border-t ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
            <button
              type="button"
              onClick={onClose}
              className={`px-4 py-2 rounded-xl font-medium ${isDark ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'}`}
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold shadow-lg shadow-emerald-500/20 transition transform active:scale-95"
            >
              {isSubmitting ? 'Registering & Tagging Dept...' : 'Register Complaint'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};


