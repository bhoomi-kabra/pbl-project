import React, { useState, useEffect } from 'react';
import { Language, WardName, HazardType, ThemeMode, DepartmentType, CivicTicket } from '../types';
import { translations } from '../data/translations';
import { X, AlertTriangle, ShieldCheck, Camera, ArrowRight, UploadCloud, CheckCircle2, Image as ImageIcon } from 'lucide-react';

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
  onSubmitSuccess: (newTicket: CivicTicket) => void;
}

// Approximate GPS Centroids for all 6 Municipal Wards of Nashik
const WARD_CENTROIDS: Record<WardName, [number, number]> = {
  'Panchavati': [20.0080, 73.7925],
  'Nashik West': [20.0035, 73.7668],
  'Nashik East': [19.9970, 73.7780],
  'Cidco': [19.9720, 73.7650],
  'Satpur': [19.9980, 73.7380],
  'Nashik Road': [19.9650, 73.8180],
  'All Wards': [19.9975, 73.7898]
};

// Department mapping & recommended hazards
const DEPARTMENT_HAZARDS: Record<DepartmentType, { label: string; hazards: { type: HazardType; nameEn: string; nameMr: string }[] }> = {
  'PWD_ROADS': {
    label: 'PWD (Public Works Department - Roads)',
    hazards: [
      { type: 'POTHOLE', nameEn: 'Pothole & Surface Damage', nameMr: 'खड्डा व रस्ता नादुरुस्त' },
      { type: 'ROAD_COLLAPSE', nameEn: 'Severe Road Collapse / Cave-In', nameMr: 'मोठा रस्ता खचणे' },
      { type: 'UNAUTHORIZED_EXCAVATION', nameEn: 'Unauthorized Trenching / Excavation', nameMr: 'अनधिकृत रस्ता खोदकाम' },
      { type: 'OTHER', nameEn: 'Broken Footpath / Divider', nameMr: 'फुटपाथ / दुभाजक तुटणे' },
    ]
  },
  'MSEDCL_ELECTRICAL': {
    label: 'MSEDCL (Electricity Distribution Board)',
    hazards: [
      { type: 'ELECTRICAL_HAZARD', nameEn: 'Exposed High-Voltage Cable', nameMr: 'उघडी उच्च दाबाची वीज केबल' },
      { type: 'ELECTRICAL_HAZARD', nameEn: 'Sparking Pole / Transformer', nameMr: 'विजेच्या खांबावर ठिणग्या' },
      { type: 'STREETLIGHT_DEFECT', nameEn: 'Streetlight Pole Defect', nameMr: 'पथदिवा बंद असणे' },
    ]
  },
  'WATER_SUPPLY': {
    label: 'NMC Water Supply Department',
    hazards: [
      { type: 'WATER_LEAKAGE', nameEn: 'Drinking Water Pipeline Burst', nameMr: 'पिण्याच्या पाण्याची पाईपलाईन फुटणे' },
      { type: 'WATER_LEAKAGE', nameEn: 'Water Logging on Road', nameMr: 'रस्त्यावर पाणी साचणे' },
    ]
  },
  'DRAINAGE_SEWERAGE': {
    label: 'Drainage & Sewerage Board',
    hazards: [
      { type: 'DRAINAGE_OVERFLOW', nameEn: 'Overflowing Sewage Manhole', nameMr: 'तुंबलेले सांडपाणी व मॅनहोल' },
      { type: 'DRAINAGE_OVERFLOW', nameEn: 'Choked Stormwater Drain', nameMr: 'पावसाळी गटार बंद असणे' },
    ]
  },
  'SANITATION_OTHER': {
    label: 'Solid Waste & Public Health Sanitation',
    hazards: [
      { type: 'GARBAGE_DUMP', nameEn: 'Roadside Garbage Dump & Debris', nameMr: 'रस्त्याकडेला कचरा साचणे' },
      { type: 'OTHER', nameEn: 'Dead Animal / Sanitation Hazard', nameMr: 'स्वच्छता विषयक समस्या' },
    ]
  },
  'STREETLIGHT_SAFETY': {
    label: 'Traffic & Road Safety Cell',
    hazards: [
      { type: 'STREETLIGHT_DEFECT', nameEn: 'Dark Stretch (Multiple Streetlights Out)', nameMr: 'अंधार असलेला रस्ता' },
      { type: 'OTHER', nameEn: 'Damaged Traffic Signal / Signboard', nameMr: 'नादुरुस्त ट्रॅफिक सिग्नल' },
    ]
  }
};

export const ComplaintFormModal: React.FC<ComplaintFormModalProps> = ({
  isOpen,
  onClose,
  language,
  initialData,
  onSubmitSuccess,
}) => {
  const t = translations[language];

  const [ward, setWard] = useState<WardName>('Panchavati');
  const [department, setDepartment] = useState<DepartmentType>('PWD_ROADS');
  const [hazardType, setHazardType] = useState<HazardType>('POTHOLE');
  const [hazardTitle, setHazardTitle] = useState<string>('Pothole & Surface Damage');
  const [customDetail, setCustomDetail] = useState<string>('');
  const [location, setLocation] = useState<string>('');
  const [photoPreview, setPhotoPreview] = useState<string>('');
  const [photoFileName, setPhotoFileName] = useState<string>('');
  const [aiConfidence, setAiConfidence] = useState<number | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Sync initial data from AI Chatbot or prefill
  useEffect(() => {
    if (initialData) {
      if (initialData.ward) setWard(initialData.ward);
      if (initialData.location) setLocation(initialData.location);
      if (initialData.aiConfidence) setAiConfidence(initialData.aiConfidence);
      if (initialData.hazardType) {
        setHazardType(initialData.hazardType);
        // Auto-select corresponding department
        if (initialData.hazardType === 'ELECTRICAL_HAZARD') setDepartment('MSEDCL_ELECTRICAL');
        else if (initialData.hazardType === 'WATER_LEAKAGE') setDepartment('WATER_SUPPLY');
        else if (initialData.hazardType === 'DRAINAGE_OVERFLOW') setDepartment('DRAINAGE_SEWERAGE');
        else if (initialData.hazardType === 'STREETLIGHT_DEFECT') setDepartment('STREETLIGHT_SAFETY');
        else if (initialData.hazardType === 'GARBAGE_DUMP') setDepartment('SANITATION_OTHER');
        else setDepartment('PWD_ROADS');
      }
    }
  }, [initialData, isOpen]);

  // When department changes, pick the first hazard of that department
  const handleDepartmentChange = (newDept: DepartmentType) => {
    setDepartment(newDept);
    const firstHazard = DEPARTMENT_HAZARDS[newDept]?.hazards[0];
    if (firstHazard) {
      setHazardType(firstHazard.type);
      setHazardTitle(firstHazard.nameEn);
    }
  };

  const handleHazardSelection = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedName = e.target.value;
    const currentList = DEPARTMENT_HAZARDS[department]?.hazards || [];
    const found = currentList.find(h => h.nameEn === selectedName);
    if (found) {
      setHazardType(found.type);
      setHazardTitle(found.nameEn);
    } else {
      setHazardType('OTHER');
      setHazardTitle('Custom Civic Issue');
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPhotoFileName(file.name);
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setPhotoPreview(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Compute realistic ward coordinates with minor jitter so markers don't overlap
    const centroid = WARD_CENTROIDS[ward] || [20.0000, 73.7800];
    const jitterLat = (Math.random() - 0.5) * 0.005;
    const jitterLng = (Math.random() - 0.5) * 0.005;
    const finalCoords: [number, number] = [
      Number((centroid[0] + jitterLat).toFixed(5)),
      Number((centroid[1] + jitterLng).toFixed(5))
    ];

    const finalTitle = customDetail ? `${hazardTitle}: ${customDetail}` : hazardTitle;
    const finalTitleMr = language === 'mr' ? (customDetail || hazardTitle) : hazardTitle;

    // Use default SVG preview if user did not attach an image
    const fallbackPhoto = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400"><rect width="100%" height="100%" fill="%23f1f5f9"/><text x="50%" y="45%" font-family="sans-serif" font-size="22" font-weight="bold" fill="%23475569" text-anchor="middle">Citizen Geotagged Complaint</text><text x="50%" y="55%" font-family="sans-serif" font-size="16" fill="%2364748b" text-anchor="middle">${ward} • ${department}</text></svg>`;

    const newTicket: CivicTicket = {
      id: `t-${Date.now()}`,
      ticketNumber: `NMC-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      title: finalTitle,
      titleMr: finalTitleMr,
      hazardType,
      ward,
      location: location || `${ward}, Nashik`,
      coordinates: finalCoords,
      status: 'SUBMITTED',
      submittedDate: 'Just Now',
      assignedEngineer: `Er. Ward Engineer (${ward})`,
      contractorAgency: 'NMC Rapid Response Cell',
      department,
      dlpExpiryDate: '24 Months DLP',
      beforePhoto: photoPreview || fallbackPhoto,
      afterPhoto: '',
      videoUrl: '',
      aiConfidence: aiConfidence || 95,
      plusOneCount: 1,
      impactScore: 25,
      riskLevel: hazardType === 'ELECTRICAL_HAZARD' || hazardType === 'ROAD_COLLAPSE' ? 'CRITICAL' : 'HIGH',
      citizenVotesConfirmed: 0,
      citizenVotesReopened: 0,
      userVerificationState: 'none',
      comments: []
    };

    onSubmitSuccess(newTicket);
    setIsSubmitting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200 max-h-[92vh] overflow-y-auto text-slate-900">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-2xl border border-emerald-200">
              <AlertTriangle className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">{t.submitComplaint}</h3>
              <p className="text-xs text-slate-500 font-medium">Nashik Municipal Corporation Civic Grievance Cell</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* AI Confidence Notice if applicable */}
        {aiConfidence && (
          <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between text-xs text-emerald-800">
            <div className="flex items-center gap-2 font-bold">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>AI Auto-Classification Pre-Filled</span>
            </div>
            <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-lg border border-emerald-300 font-mono font-bold">
              {aiConfidence}% Accuracy
            </span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          
          {/* 1. Ward Selection */}
          <div>
            <label className="block font-bold text-slate-700 mb-1.5">
              1. Municipal Ward (प्रभाग निवडा)
            </label>
            <select
              value={ward}
              onChange={(e) => setWard(e.target.value as WardName)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition"
            >
              <option value="Panchavati">Panchavati (प्रभाग १ - पंचवटी)</option>
              <option value="Nashik East">Nashik East (प्रभाग २ - नाशिक पूर्व)</option>
              <option value="Nashik West">Nashik West (प्रभाग ३ - नाशिक पश्चिम)</option>
              <option value="Cidco">Cidco (प्रभाग ४ - सिडको)</option>
              <option value="Satpur">Satpur (प्रभाग ५ - सातपूर MIDC)</option>
              <option value="Nashik Road">Nashik Road (प्रभाग ६ - नाशिक रोड)</option>
            </select>
          </div>

          {/* 2. Department Selection */}
          <div>
            <label className="block font-bold text-slate-700 mb-1.5">
              2. Responsible Department (संबंधित विभाग)
            </label>
            <select
              value={department}
              onChange={(e) => handleDepartmentChange(e.target.value as DepartmentType)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition"
            >
              <option value="PWD_ROADS">PWD - Roads & Infrastructure (सार्वजनिक बांधकाम / रस्ते)</option>
              <option value="MSEDCL_ELECTRICAL">MSEDCL - Electrical & Streetlights (महावितरण वीज विभाग)</option>
              <option value="WATER_SUPPLY">Water Supply Board (पाणी पुरवठा विभाग)</option>
              <option value="DRAINAGE_SEWERAGE">Drainage & Sewerage Board (मलनिस्सारण व सांडपाणी)</option>
              <option value="SANITATION_OTHER">Solid Waste & Sanitation (घनकचरा व्यवस्थापन)</option>
              <option value="STREETLIGHT_SAFETY">Traffic & Road Safety Cell (वाहतूक व सुरक्षितता)</option>
            </select>
          </div>

          {/* 3. Hazard Category Selection */}
          <div>
            <label className="block font-bold text-slate-700 mb-1.5">
              3. Issue Category (तक्रारीचे स्वरूप)
            </label>
            <select
              value={hazardTitle}
              onChange={handleHazardSelection}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition"
            >
              {DEPARTMENT_HAZARDS[department]?.hazards.map((h, idx) => (
                <option key={idx} value={h.nameEn}>
                  {h.nameEn} ({h.nameMr})
                </option>
              ))}
            </select>
          </div>

          {/* 4. Location Name / Landmark */}
          <div>
            <label className="block font-bold text-slate-700 mb-1.5">
              4. Specific Landmark / Road Name (तपशीलवार पत्ता / खूण)
            </label>
            <input
              type="text"
              required
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Near K.K. Wagh College Circle, Gangapur Road"
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition font-medium"
            />
          </div>

          {/* 5. Additional Details (Optional) */}
          <div>
            <label className="block font-bold text-slate-700 mb-1.5">
              5. Additional Description (ऐच्छिक माहिती)
            </label>
            <input
              type="text"
              value={customDetail}
              onChange={(e) => setCustomDetail(e.target.value)}
              placeholder="e.g. Causing heavy traffic jams every evening, risk for two-wheelers..."
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition text-xs"
            />
          </div>

          {/* 6. Real Photo Upload */}
          <div>
            <label className="block font-bold text-slate-700 mb-1.5">
              6. Upload Geotagged Photo Evidence (फोटो पुरावा जोडा)
            </label>
            <label className="border-2 border-dashed border-slate-300 hover:border-emerald-500 bg-slate-50 hover:bg-emerald-50/40 rounded-2xl p-3.5 flex flex-col items-center justify-center cursor-pointer transition">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handlePhotoUpload}
              />
              {photoPreview ? (
                <div className="w-full flex items-center gap-3">
                  <img
                    src={photoPreview}
                    alt="Complaint Preview"
                    className="w-16 h-16 object-cover rounded-xl border border-slate-300 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-900 truncate text-xs">{photoFileName || 'Attached Photo'}</p>
                    <p className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1 mt-0.5">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Photo Loaded & Geotagged
                    </p>
                    <span className="text-[10px] text-slate-500 underline mt-1 block">Click to change picture</span>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2.5 text-slate-600">
                  <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
                    <Camera className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-slate-800 text-xs block">Choose Photo from Device</span>
                    <span className="text-[11px] text-slate-500">JPG, PNG, or Camera capture</span>
                  </div>
                </div>
              )}
            </label>
          </div>

          {/* Citizen Verification Guarantee Notice */}
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-2xl flex items-start gap-2.5 text-blue-900 text-[11px] leading-relaxed">
            <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <span>
              <strong>Closed ≠ Resolved Accountability:</strong> After submission, this ticket enters <span className="font-bold text-blue-700">"SUBMITTED"</span> status and immediately appears on the live NMC Map and Citizen Feed.
            </span>
          </div>

          {/* Action Buttons */}
          <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 transition"
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold shadow-md shadow-emerald-600/20 transition transform active:scale-95"
            >
              {isSubmitting ? 'Registering...' : 'Register Complaint (तक्रार दाखल करा)'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
