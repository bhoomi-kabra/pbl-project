import React, { useState, useEffect } from 'react';
import { Language, WardName, HazardType, ThemeMode } from '../types';
import { translations } from '../data/translations';
import { X, AlertTriangle, ShieldCheck, Camera, CheckCircle2 } from 'lucide-react';

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

  const [hazardType, setHazardType] = useState<HazardType>('ELECTRICAL_HAZARD');
  const [ward, setWard] = useState<WardName>('Panchavati');
  const [location, setLocation] = useState<string>('');
  const [aiConfidence, setAiConfidence] = useState<number | undefined>(undefined);
  const [photoUploaded] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const isDark = theme === 'dark';

  useEffect(() => {
    if (initialData) {
      if (initialData.hazardType) setHazardType(initialData.hazardType);
      if (initialData.ward) setWard(initialData.ward);
      if (initialData.location) setLocation(initialData.location);
      if (initialData.aiConfidence) setAiConfidence(initialData.aiConfidence);
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      const generatedTicket = {
        id: `t-${Date.now()}`,
        ticketNumber: `NMC-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        title: hazardType === 'ELECTRICAL_HAZARD' ? 'Exposed Electrical Hazard' : 'Road Defect Reported',
        titleMr: hazardType === 'ELECTRICAL_HAZARD' ? 'विद्युत धोका तक्रार' : 'रस्ते दोष तक्रार',
        hazardType,
        ward,
        location: location || 'Nashik City Road',
        coordinates: [20.0050, 73.7800],
        status: 'VERIFICATION_PENDING',
        submittedDate: '10 Aug 2026',
        assignedEngineer: `Er. K. V. Patil (Ward Eng - ${ward})`,
        contractorAgency: 'NMC Smart City Rapid Action Cell',
        dlpExpiryDate: '36 Months DLP',
        beforePhoto: 'https://images.unsplash.com/photo-1544725121-be3bf52e2dc8?w=600&auto=format&fit=crop&q=80',
        afterPhoto: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=600&auto=format&fit=crop&q=80',
        aiConfidence: aiConfidence || 98,
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
      <div className={`border rounded-3xl max-w-lg w-full p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200 ${isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-300 text-slate-900'}`}>
        <div className={`flex items-center justify-between border-b pb-4 mb-4 ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-red-500/10 text-red-500 rounded-xl border border-red-500/20">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className={`text-base font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{t.submitComplaint}</h3>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Deep-Linked AI Pre-Filled Municipal Form</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-1 rounded-lg transition ${isDark ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'}`}
          >
            <X className="w-5 h-5" />
          </button>
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
          <div>
            <label className={`block font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{t.hazardType}</label>
            <select
              value={hazardType}
              onChange={(e) => setHazardType(e.target.value as HazardType)}
              className={`w-full border rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 ${isDark ? 'bg-slate-950 text-white border-slate-800' : 'bg-slate-50 text-slate-900 border-slate-300'}`}
            >
              <option value="ELECTRICAL_HAZARD">⚡ ELECTRICAL_HAZARD (Sparking/Exposed Cable)</option>
              <option value="POTHOLE">🕳️ POTHOLE (Deep Road Cave-in)</option>
              <option value="UNAUTHORIZED_EXCAVATION">🏗️ UNAUTHORIZED_EXCAVATION (Trenching without Permit)</option>
              <option value="WATER_LEAKAGE">💧 WATER_LEAKAGE (Pipeline Burst)</option>
              <option value="STREETLIGHT_DEFECT">💡 STREETLIGHT_DEFECT (Dark Zone Hazard)</option>
            </select>
          </div>

          <div>
            <label className={`block font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{t.ward}</label>
            <select
              value={ward}
              onChange={(e) => setWard(e.target.value as WardName)}
              className={`w-full border rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 ${isDark ? 'bg-slate-950 text-white border-slate-800' : 'bg-slate-50 text-slate-900 border-slate-300'}`}
            >
              <option value="Panchavati">Panchavati (Ward 1)</option>
              <option value="Nashik East">Nashik East (Ward 2)</option>
              <option value="Nashik West">Nashik West (Ward 3)</option>
              <option value="Cidco">Cidco (Ward 4)</option>
              <option value="Satpur">Satpur (Ward 5)</option>
              <option value="Nashik Road">Nashik Road (Ward 6)</option>
            </select>
          </div>

          <div>
            <label className={`block font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{t.location}</label>
            <input
              type="text"
              required
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Near K.K. Wagh Engineering College, Panchavati"
              className={`w-full border rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 ${isDark ? 'bg-slate-950 text-white border-slate-800' : 'bg-slate-50 text-slate-900 border-slate-300'}`}
            />
          </div>

          <div>
            <label className={`block font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{t.uploadPhoto}</label>
            <div className={`border-2 border-dashed rounded-2xl p-3 flex items-center justify-between cursor-pointer ${isDark ? 'border-slate-700 bg-slate-950/60' : 'border-slate-300 bg-slate-50'}`}>
              <div className={`flex items-center gap-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                <Camera className="w-4 h-4 text-emerald-500" />
                <span>{photoUploaded ? 'evidence_geotagged_img_08.jpg attached' : 'Click to attach evidence'}</span>
              </div>
              {photoUploaded && (
                <span className="text-emerald-500 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" /> Ready
                </span>
              )}
            </div>
          </div>

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
              {isSubmitting ? 'Submitting to NMC Grid...' : t.submitButton}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
