import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import { Language, WardName, HazardType, ThemeMode, DepartmentType, CivicTicket } from '../types';
import { translations } from '../data/translations';
import { X, AlertTriangle, ShieldCheck, Camera, CheckCircle2, MapPin, Locate, Crosshair, Search, ShieldAlert, User, Phone } from 'lucide-react';

interface ComplaintFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  theme?: ThemeMode;
  initialData?: {
    hazardType?: HazardType;
    ward?: WardName;
    location?: string;
    aiConfidence?: number;
    coordinates?: [number, number];
  } | null;
  onSubmitSuccess: (newTicket: CivicTicket) => void;
}

// Centroids for Nashik Municipal Wards
const WARD_CENTROIDS: Record<WardName, [number, number]> = {
  'Panchavati': [20.0080, 73.7925],
  'Nashik West': [20.0035, 73.7668],
  'Nashik East': [19.9970, 73.7780],
  'Cidco': [19.9720, 73.7650],
  'Satpur': [19.9980, 73.7380],
  'Nashik Road': [19.9650, 73.8180],
  'All Wards': [19.9975, 73.7898]
};

// Comprehensive list of prominent Nashik landmarks & roads for 100% accurate pinpointing
const NASHIK_LANDMARKS: { name: string; nameMr: string; ward: WardName; coords: [number, number] }[] = [
  // Panchavati
  { name: 'Hirawadi Road / Vidhate Nagar', nameMr: 'हिरावाडी रोड / विधाते नगर', ward: 'Panchavati', coords: [20.0270, 73.8140] },
  { name: 'K.K. Wagh Engineering College', nameMr: 'के.के. वाघ कॉलेज परिसर', ward: 'Panchavati', coords: [20.0190, 73.8190] },
  { name: 'Ramkund / Godavari Ghat', nameMr: 'रामकुंड / गोदावरी घाट', ward: 'Panchavati', coords: [20.0065, 73.7915] },
  { name: 'Panchavati Karanja', nameMr: 'पंचवटी कारंजा', ward: 'Panchavati', coords: [20.0090, 73.7930] },
  { name: 'Dindori Road / Mhasrul', nameMr: 'दिंडोरी रोड / म्हसरूळ', ward: 'Panchavati', coords: [20.0380, 73.8050] },
  { name: 'Makhmalabad Naka', nameMr: 'मखमलाबाद नाका', ward: 'Panchavati', coords: [20.0220, 73.7850] },

  // Nashik West
  { name: 'College Road (Thatte Nagar / Krishi Nagar)', nameMr: 'कॉलेज रोड (ठत्ते नगर / कृषी नगर)', ward: 'Nashik West', coords: [20.0035, 73.7668] },
  { name: 'Gangapur Road (Jehan Circle to Serene Meadows)', nameMr: 'गंगापूर रोड (जहाँ सर्कल)', ward: 'Nashik West', coords: [20.0160, 73.7620] },
  { name: 'Bhonsala Military College Circle', nameMr: 'भोसला मिलिटरी कॉलेज सर्कल', ward: 'Nashik West', coords: [20.0060, 73.7580] },
  { name: 'Mahatma Nagar Ground', nameMr: 'महात्मा नगर ग्राउंड परिसर', ward: 'Nashik West', coords: [19.9920, 73.7600] },

  // Nashik East
  { name: 'Canada Corner / Sharanpur Road', nameMr: 'कॅनडा कॉर्नर / शरणपूर रोड', ward: 'Nashik East', coords: [19.9970, 73.7780] },
  { name: 'Ashok Stambh / CBS Stand', nameMr: 'अशोक स्तंभ / सीबीएस', ward: 'Nashik East', coords: [20.0010, 73.7840] },
  { name: 'Dwarka Circle Flyover', nameMr: 'द्वारका सर्कल उड्डाणपूल', ward: 'Nashik East', coords: [19.9850, 73.7980] },
  { name: 'Mumbai Naka Junction', nameMr: 'मुंबई नाका जंक्शन', ward: 'Nashik East', coords: [19.9880, 73.7850] },

  // Cidco
  { name: 'Trimurti Chowk', nameMr: 'त्रिमुर्ती चौक', ward: 'Cidco', coords: [19.9720, 73.7650] },
  { name: 'Untwadi / City Centre Mall', nameMr: 'उंटवाडी / सिटी सेंटर मॉल', ward: 'Cidco', coords: [19.9780, 73.7650] },
  { name: 'Pavan Nagar / Uttam Nagar', nameMr: 'पवन नगर / उत्तम नगर', ward: 'Cidco', coords: [19.9650, 73.7550] },
  { name: 'Govind Nagar', nameMr: 'गोविंद नगर', ward: 'Cidco', coords: [19.9750, 73.7780] },
  { name: 'Indira Nagar Jogging Track', nameMr: 'इंदिरा नगर जॉगिंग ट्रॅक', ward: 'Cidco', coords: [19.9680, 73.7880] },

  // Satpur
  { name: 'ABB Circle / Trimbak Road', nameMr: 'एबीबी सर्कल / त्र्यंबक रोड', ward: 'Satpur', coords: [19.9960, 73.7450] },
  { name: 'Satpur MIDC Main Avenue', nameMr: 'सातपूर एमआयडीसी मुख्य रस्ता', ward: 'Satpur', coords: [19.9980, 73.7380] },
  { name: 'Garware Point / ITI Signal', nameMr: 'गरवारे पॉईंट / आयटीआय सिग्नल', ward: 'Satpur', coords: [19.9910, 73.7320] },
  { name: 'Ambad Link Road', nameMr: 'अंबड लिंक रोड', ward: 'Satpur', coords: [19.9750, 73.7350] },

  // Nashik Road
  { name: 'Bitco Chowk Flyover', nameMr: 'बिटको चौक उड्डाणपूल', ward: 'Nashik Road', coords: [19.9650, 73.8200] },
  { name: 'Nashik Road Railway Station', nameMr: 'नाशिक रोड रेल्वे स्टेशन परिसर', ward: 'Nashik Road', coords: [19.9550, 73.8350] },
  { name: 'Muktidham Temple Avenue', nameMr: 'मुक्तिधाम मंदिर परिसर', ward: 'Nashik Road', coords: [19.9580, 73.8300] },
  { name: 'Jail Road / Subhash Road', nameMr: 'जेल रोड / सुभाष रोड', ward: 'Nashik Road', coords: [19.9700, 73.8380] },
];

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
  const [coordinates, setCoordinates] = useState<[number, number]>([20.0080, 73.7925]);
  const [photoPreview, setPhotoPreview] = useState<string>('');
  const [photoFileName, setPhotoFileName] = useState<string>('');
  const [aiConfidence, setAiConfidence] = useState<number | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [gpsDetecting, setGpsDetecting] = useState<boolean>(false);
  const [reporterName, setReporterName] = useState<string>('');
  const [reporterMobile, setReporterMobile] = useState<string>('');
  const [isTruthDeclared, setIsTruthDeclared] = useState<boolean>(true);

  const miniMapContainerRef = useRef<HTMLDivElement | null>(null);
  const miniMapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  // Sync initial data from AI Chatbot or prefill
  useEffect(() => {
    if (initialData) {
      if (initialData.ward) {
        setWard(initialData.ward);
        setCoordinates(WARD_CENTROIDS[initialData.ward] || [20.0080, 73.7925]);
      }
      if (initialData.location) setLocation(initialData.location);
      if (initialData.coordinates) setCoordinates(initialData.coordinates);
      if (initialData.aiConfidence) setAiConfidence(initialData.aiConfidence);
      if (initialData.hazardType) {
        setHazardType(initialData.hazardType);
        if (initialData.hazardType === 'ELECTRICAL_HAZARD') setDepartment('MSEDCL_ELECTRICAL');
        else if (initialData.hazardType === 'WATER_LEAKAGE') setDepartment('WATER_SUPPLY');
        else if (initialData.hazardType === 'DRAINAGE_OVERFLOW') setDepartment('DRAINAGE_SEWERAGE');
        else if (initialData.hazardType === 'STREETLIGHT_DEFECT') setDepartment('STREETLIGHT_SAFETY');
        else if (initialData.hazardType === 'GARBAGE_DUMP') setDepartment('SANITATION_OTHER');
        else setDepartment('PWD_ROADS');
      }
    }
  }, [initialData, isOpen]);

  // Initialize or update the interactive Leaflet Mini Map when modal opens
  useEffect(() => {
    if (!isOpen || !miniMapContainerRef.current) return;

    const timer = setTimeout(() => {
      if (!miniMapRef.current && miniMapContainerRef.current) {
        const map = L.map(miniMapContainerRef.current, {
          center: coordinates,
          zoom: 14,
          zoomControl: true,
        });

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap',
          maxZoom: 19,
        }).addTo(map);

        const pinIcon = L.divIcon({
          className: 'pin-picker-marker',
          html: `
            <div style="
              background-color: #ef4444;
              width: 32px;
              height: 32px;
              border-radius: 50% 50% 50% 0;
              transform: rotate(-45deg);
              border: 3px solid #ffffff;
              box-shadow: 0 4px 14px rgba(0,0,0,0.5);
              display: flex;
              align-items: center;
              justify-content: center;
              cursor: grab;
            ">
              <span style="transform: rotate(45deg); font-size: 13px; color: white;">📍</span>
            </div>
          `,
          iconSize: [32, 32],
          iconAnchor: [16, 32],
        });

        const marker = L.marker(coordinates, {
          icon: pinIcon,
          draggable: true,
        }).addTo(map);

        marker.on('dragend', () => {
          const pos = marker.getLatLng();
          const newCoords: [number, number] = [
            Number(pos.lat.toFixed(5)),
            Number(pos.lng.toFixed(5)),
          ];
          setCoordinates(newCoords);
        });

        map.on('click', (e) => {
          marker.setLatLng(e.latlng);
          const newCoords: [number, number] = [
            Number(e.latlng.lat.toFixed(5)),
            Number(e.latlng.lng.toFixed(5)),
          ];
          setCoordinates(newCoords);
        });

        miniMapRef.current = map;
        markerRef.current = marker;
      }

      if (miniMapRef.current) {
        miniMapRef.current.invalidateSize();
        miniMapRef.current.setView(coordinates, 14);
        if (markerRef.current) {
          markerRef.current.setLatLng(coordinates);
        }
      }
    }, 150);

    return () => {
      clearTimeout(timer);
      if (miniMapRef.current) {
        miniMapRef.current.remove();
        miniMapRef.current = null;
        markerRef.current = null;
      }
    };
  }, [isOpen]);

  // When Ward changes, update coordinates and pan mini map to the ward
  const handleWardChange = (newWard: WardName) => {
    setWard(newWard);
    const newCoords = WARD_CENTROIDS[newWard] || [20.0080, 73.7925];
    setCoordinates(newCoords);
    if (miniMapRef.current && markerRef.current) {
      miniMapRef.current.setView(newCoords, 14);
      markerRef.current.setLatLng(newCoords);
    }
  };

  // When a landmark suggestion is clicked, select it and snap map location
  const handleSelectLandmark = (lm: typeof NASHIK_LANDMARKS[0]) => {
    setWard(lm.ward);
    setLocation(lm.name);
    setCoordinates(lm.coords);
    if (miniMapRef.current && markerRef.current) {
      miniMapRef.current.setView(lm.coords, 16);
      markerRef.current.setLatLng(lm.coords);
    }
  };

  // Smart text matching when typing in location input
  const handleLocationInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setLocation(val);
    const lower = val.toLowerCase();

    // Check if user input matches any known landmark
    const match = NASHIK_LANDMARKS.find(
      (lm) =>
        lower.includes(lm.name.toLowerCase().split('/')[0].trim().toLowerCase()) ||
        (lm.nameMr && lower.includes(lm.nameMr.split('/')[0].trim()))
    );

    if (match) {
      setWard(match.ward);
      setCoordinates(match.coords);
      if (miniMapRef.current && markerRef.current) {
        miniMapRef.current.setView(match.coords, 16);
        markerRef.current.setLatLng(match.coords);
      }
    }
  };

  // Detect Live GPS using device sensor
  const handleDetectGPS = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    setGpsDetecting(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const liveCoords: [number, number] = [
          Number(pos.coords.latitude.toFixed(5)),
          Number(pos.coords.longitude.toFixed(5)),
        ];
        setCoordinates(liveCoords);
        if (miniMapRef.current && markerRef.current) {
          miniMapRef.current.setView(liveCoords, 17);
          markerRef.current.setLatLng(liveCoords);
        }
        setGpsDetecting(false);
      },
      (err) => {
        console.warn('GPS detection error:', err);
        setGpsDetecting(false);
        alert('Could not retrieve GPS location. Please drag the pin on the map to your spot.');
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

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
    const found = currentList.find((h) => h.nameEn === selectedName);
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
      coordinates: coordinates, // EXACT pinpointed coordinates
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
      reporterName: reporterName || 'Citizen Reporter',
      reporterMobile: reporterMobile || '',
      falseReportFlags: 0,
      isSuspectedFalse: false,
      comments: []
    };

    onSubmitSuccess(newTicket);
    setIsSubmitting(false);
    onClose();
  };

  // Filter landmarks matching the current ward for quick buttons
  const wardLandmarks = NASHIK_LANDMARKS.filter((lm) => lm.ward === ward);

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-xl w-full p-5 sm:p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200 max-h-[94vh] overflow-y-auto text-slate-900">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-2xl border border-emerald-200">
              <AlertTriangle className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">{t.submitComplaint}</h3>
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
            <label className="block font-bold text-slate-700 mb-1">
              1. Municipal Ward (प्रभाग निवडा)
            </label>
            <select
              value={ward}
              onChange={(e) => handleWardChange(e.target.value as WardName)}
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
            <label className="block font-bold text-slate-700 mb-1">
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
            <label className="block font-bold text-slate-700 mb-1">
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

          {/* 4. Exact Location & Interactive Pinpoint Map */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block font-bold text-slate-700">
                4. Exact Location & Map Pinpoint (नकाशावर अचूक जागा निवडा)
              </label>
              <button
                type="button"
                onClick={handleDetectGPS}
                disabled={gpsDetecting}
                className="text-[11px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-2.5 py-1 rounded-lg flex items-center gap-1 transition"
              >
                <Locate className={`w-3.5 h-3.5 ${gpsDetecting ? 'animate-spin' : ''}`} />
                <span>{gpsDetecting ? 'Locating...' : '📍 My GPS Location'}</span>
              </button>
            </div>

            <div className="relative">
              <input
                type="text"
                required
                value={location}
                onChange={handleLocationInputChange}
                placeholder="e.g. Indu Heights, Vidhate Nagar, Hirawadi Road"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-3.5 pr-8 py-2.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition font-medium"
              />
              <Search className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
            </div>

            {/* Quick Landmark Click Suggestions */}
            <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
              <span className="text-[10px] font-bold text-slate-500">Popular Spots in {ward}:</span>
              {wardLandmarks.slice(0, 4).map((lm, i) => (
                <button
                  type="button"
                  key={i}
                  onClick={() => handleSelectLandmark(lm)}
                  className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 border border-slate-200 transition"
                >
                  📍 {lm.name.split('/')[0].trim()}
                </button>
              ))}
            </div>

            {/* Interactive Leaflet Mini Map Picker */}
            <div className="rounded-2xl border border-slate-300 overflow-hidden shadow-sm relative">
              <div ref={miniMapContainerRef} className="w-full h-44 bg-slate-100" />
              
              {/* Instructions Banner overlay */}
              <div className="absolute top-2 left-2 right-2 z-[400] bg-white/95 backdrop-blur px-2.5 py-1 rounded-lg border border-slate-200 text-[10px] font-bold text-slate-700 flex items-center justify-between shadow-sm">
                <span className="flex items-center gap-1 text-emerald-800">
                  <Crosshair className="w-3 h-3 text-emerald-600" /> Click or drag pin to exact spot
                </span>
                <span className="font-mono text-slate-500">
                  GPS: {coordinates[0].toFixed(4)}°N, {coordinates[1].toFixed(4)}°E
                </span>
              </div>
            </div>
          </div>

          {/* 5. Additional Description */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              5. Description & Remarks (तपशील)
            </label>
            <input
              type="text"
              value={customDetail}
              onChange={(e) => setCustomDetail(e.target.value)}
              placeholder="e.g. Deep pothole causing skidding risk for two-wheelers..."
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition text-xs"
            />
          </div>

          {/* 6. Real Photo Upload */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              6. Attach Geotagged Photo Evidence (फोटो पुरावा जोडा)
            </label>
            <label className="border-2 border-dashed border-slate-300 hover:border-emerald-500 bg-slate-50 hover:bg-emerald-50/30 rounded-2xl p-3 flex flex-col items-center justify-center cursor-pointer transition">
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
                    className="w-14 h-14 object-cover rounded-xl border border-slate-300 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-900 truncate text-xs">{photoFileName || 'Attached Photo'}</p>
                    <p className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1 mt-0.5">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Photo Loaded & Geotagged
                    </p>
                    <span className="text-[10px] text-slate-500 underline mt-0.5 block">Click to change picture</span>
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

          {/* 7. Citizen Contact Info for Verification */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                7. Your Name (नाव)
              </label>
              <div className="relative flex items-center">
                <User className="w-3.5 h-3.5 text-slate-400 absolute left-3 pointer-events-none" />
                <input
                  type="text"
                  value={reporterName}
                  onChange={(e) => setReporterName(e.target.value)}
                  placeholder="e.g. Aarav Deshmukh"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-8 pr-3 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition text-xs"
                />
              </div>
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Mobile Number (मोबाईल क्र.)
              </label>
              <div className="relative flex items-center">
                <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 pointer-events-none" />
                <input
                  type="tel"
                  maxLength={10}
                  value={reporterMobile}
                  onChange={(e) => setReporterMobile(e.target.value)}
                  placeholder="e.g. 9823011223"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-8 pr-3 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition text-xs font-mono"
                />
              </div>
            </div>
          </div>

          {/* 8. Anti-Fraud & False Report Precaution Declaration */}
          <div className="p-3.5 bg-amber-50/80 border border-amber-200/80 rounded-2xl text-xs space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold text-amber-900 text-xs">
              <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0" />
              <span>Anti-Fraud & Genuine Report Declaration (सत्यता प्रतिज्ञापत्र)</span>
            </div>
            <label className="flex items-start gap-2.5 cursor-pointer pt-0.5">
              <input
                type="checkbox"
                required
                checked={isTruthDeclared}
                onChange={(e) => setIsTruthDeclared(e.target.checked)}
                className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500 h-4 w-4 shrink-0"
              />
              <span className="text-[11px] text-amber-800 leading-snug">
                I solemnly certify that this road problem is genuine. I understand that submitting fake, staged, or downloaded pictures is an offense under Section 396 of the Maharashtra Municipal Corporation Act & IT Act 2000.
              </span>
            </label>
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
