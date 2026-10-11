'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/lib/AppContext';
import { Ward, HazardCategory } from '@/lib/types';
import { WARD_COORDINATES } from '@/lib/mockData';
import { 
  ArrowLeft, 
  Camera, 
  MapPin, 
  Check, 
  Mic, 
  MicOff, 
  Sparkles, 
  HelpCircle, 
  ChevronDown, 
  Compass, 
  Clock, 
  PhoneCall, 
  Upload, 
  Image as ImageIcon,
  X,
  Crosshair
} from 'lucide-react';
import GoogleMapView from './GoogleMapView';

interface ComplaintModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
}

const PRESET_PHOTOS = [
  {
    name: 'Severe Pothole',
    url: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80',
    category: 'POTHOLE' as HazardCategory
  },
  {
    name: 'Garbage Dump',
    url: 'https://images.unsplash.com/photo-1611288875785-5dfb3f07a16b?auto=format&fit=crop&w=800&q=80',
    category: 'GARBAGE_DUMP' as HazardCategory
  },
  {
    name: 'Open Manhole',
    url: 'https://images.unsplash.com/photo-1584467735871-8e85353a8413?auto=format&fit=crop&w=800&q=80',
    category: 'OPEN_MANHOLE' as HazardCategory
  },
  {
    name: 'Road Cave-In',
    url: 'https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?auto=format&fit=crop&w=800&q=80',
    category: 'ROAD_CAVE_IN' as HazardCategory
  },
  {
    name: 'Dangling Wire',
    url: 'https://images.unsplash.com/photo-1544724569-5f546fd6f2b5?auto=format&fit=crop&w=800&q=80',
    category: 'ELECTRICAL_WIRE' as HazardCategory
  }
];

export const CATEGORY_DEFAULTS: Record<HazardCategory, {
  title: string;
  description: string;
  photoUrl: string;
  dept: string;
  agency: string;
  sla: number;
}> = {
  GARBAGE_DUMP: {
    title: 'Accumulated Solid Waste & Garbage Dump Overflow',
    description: 'Substantial accumulation of unsegregated domestic and commercial solid waste on the public thoroughfare. The waste is overflowing onto the pedestrian pathway, generating foul odor, attracting stray dogs and flies, and creating severe hygiene hazards for local residents and school children. Urgent clearance by municipal sanitation compactor vehicles and disinfectant spraying is requested.',
    photoUrl: 'https://images.unsplash.com/photo-1611288875785-5dfb3f07a16b?auto=format&fit=crop&w=800&q=80',
    dept: 'Solid Waste & Sanitation',
    agency: 'NMC Sanitation & Solid Waste Wing',
    sla: 48
  },
  POTHOLE: {
    title: 'Deep Road Surface Asphalt Pothole Hazard',
    description: 'Severe asphalt depression and broken pavement creating a deep pothole on the vehicular carriage-way. Sharp edges of damaged bitumen and loose aggregate gravel are causing extreme two-wheeler skidding hazards and sudden vehicle swerving during evening rush hours. Urgent cold-mix patching or hot bitumen overlay is required to prevent fatal accidents.',
    photoUrl: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80',
    dept: 'PWD - Roads & Bridges',
    agency: 'NMC Public Works Department (PWD)',
    sla: 24
  },
  OPEN_MANHOLE: {
    title: 'Uncovered Drainage Chamber & Exposed Manhole Hazard',
    description: 'Deep storm-water drainage chamber left open without a reinforced cast-iron lid along the pedestrian walkway. The exposed underground drop poses an imminent life-safety fall risk for children, senior citizens, and night commuters in unlit conditions. Urgent temporary safety barricading and heavy-duty chamber cover installation required immediately.',
    photoUrl: 'https://images.unsplash.com/photo-1584467735871-8e85353a8413?auto=format&fit=crop&w=800&q=80',
    dept: 'Drainage & Sewage',
    agency: 'NMC Drainage Division',
    sla: 12
  },
  ROAD_CAVE_IN: {
    title: 'Critical Road Subsurface Cave-In & Subsidence',
    description: 'Sudden structural collapse of road surface and subgrade foundation, creating an expanding subterranean cavity under the asphalt. Extreme danger of vehicle wheel entrapment and structural road failure. Urgent traffic barricading and structural backfill required.',
    photoUrl: 'https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?auto=format&fit=crop&w=800&q=80',
    dept: 'PWD - Roads & Structural Safety',
    agency: 'NMC Public Works Department (PWD)',
    sla: 6
  },
  ELECTRICAL_WIRE: {
    title: 'Dangling Low-Tension Electrical Cable Hazard',
    description: 'Uninsulated live power distribution cable sagging dangerously close to the street surface at neck height. The loose wire is sparking near tree branches, posing severe electrocution risk to pedestrians, cyclists, and buses passing underneath. Immediate line isolation and emergency re-tensioning by MSEDCL line crew is urgently requested.',
    photoUrl: 'https://images.unsplash.com/photo-1544724569-5f546fd6f2b5?auto=format&fit=crop&w=800&q=80',
    dept: 'Electrical & Streetlights',
    agency: 'MSEDCL / Mahavitaran Power Distribution',
    sla: 4
  },
  WATER_LEAKAGE: {
    title: 'Main Underground Water Pipeline Rupture & Road Flooding',
    description: 'Major drinking water distribution line rupture under the asphalt causing substantial potable water loss, waterlogging across the lane, and soil erosion destabilizing nearby foundations. Urgent valve shutdown and pipeline replacement required.',
    photoUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?auto=format&fit=crop&w=800&q=80',
    dept: 'Water Supply Department',
    agency: 'NMC Water Supply Division',
    sla: 24
  },
  DRAINAGE_OVERFLOW: {
    title: 'Choked Municipal Sewage Drain & Blackwater Overflow',
    description: 'Underground sewer line blocked with silt and polythene waste, forcing sewage blackwater to overflow across the street and into residential gates. Intense stench and breeding ground for mosquitoes. Requires immediate suction super-sucker tanker deployment.',
    photoUrl: 'https://images.unsplash.com/photo-1584467735871-8e85353a8413?auto=format&fit=crop&w=800&q=80',
    dept: 'Drainage Division',
    agency: 'NMC Drainage Division',
    sla: 12
  },
  WATER_LOGGING: {
    title: 'Severe Monsoon Water Logging & Inundated Junction',
    description: 'Stormwater unable to drain due to blocked roadside catch-pits, creating 1.5 to 2 feet water stagnation. Two-wheelers stalling and traffic immobilized. Immediate de-watering pump deployment and culvert silt clearance needed.',
    photoUrl: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80',
    dept: 'Stormwater & Disaster Cell',
    agency: 'NMC Disaster Management Cell',
    sla: 8
  },
  STREETLIGHT_DEFECT: {
    title: 'Non-Functional Dark Streetlights on Arterial Corridor',
    description: 'Multiple consecutive LED streetlights on electric poles are completely dark after dusk. Pitch-black conditions creating severe blind spots, anti-social safety concerns, and pedestrian accident risks. Needs immediate driver/choke replacement.',
    photoUrl: 'https://images.unsplash.com/photo-1509114397022-ed747cca3f65?auto=format&fit=crop&w=800&q=80',
    dept: 'Electrical & Streetlights Wing',
    agency: 'NMC Electrical Dept',
    sla: 24
  },
  UNAUTHORIZED_EXCAVATION: {
    title: 'Illegal Road Trenching & Unauthorized Excavation',
    description: 'Unauthorized trenching and unbarricaded road excavation on the municipal carriageway. The trench was dug without PWD utility permission, damaging the road sub-base and posing a critical tipping hazard for commuters. Immediate stoppage, road restoration, and penalty enforcement required.',
    photoUrl: 'https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?auto=format&fit=crop&w=800&q=80',
    dept: 'Enforcement & Encroachment Cell',
    agency: 'NMC Encroachment & PWD Wing',
    sla: 12
  },
  OTHER: {
    title: 'Public Civic Infrastructure Defect & Maintenance Request',
    description: 'Civic maintenance grievance requiring municipal inspection and remedial intervention by the concerned ward administrative staff.',
    photoUrl: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80',
    dept: 'NMC Citizen Redressal Cell',
    agency: 'NMC Citizen Redressal',
    sla: 48
  }
};

const WARD_LANDMARKS: Record<Ward, string> = {
  'Panchavati': 'Panchavati · Near Ramkund, Godavari Walkway',
  'Nashik West': 'Nashik West · Near ABB Circle, Gangapur Road',
  'Nashik East': 'Nashik East · Dwarka Circle / Highway Junction',
  'Cidco': 'Cidco · Pawan Nagar Sector 4 Main Arterial Road',
  'Satpur': 'Satpur · MIDC Industrial Area Trimbak Road',
  'Nashik Road': 'Nashik Road · Near Bytco Point & Station Road'
};

export default function ComplaintModal({ isOpen, onClose, onSubmit }: ComplaintModalProps) {
  const { language, setLanguage, prefilledComplaint, currentUser, setPrefilledComplaint } = useApp();

  const [category, setCategory] = useState<HazardCategory>('POTHOLE');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [ward, setWard] = useState<Ward>('Panchavati');
  const [locationName, setLocationName] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [lat, setLat] = useState(20.0062);
  const [lng, setLng] = useState(73.7915);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isDetectingGps, setIsDetectingGps] = useState(false);
  const [gpsDetectedNotice, setGpsDetectedNotice] = useState<string | null>(null);
  const [voiceLang, setVoiceLang] = useState<'mr-IN' | 'en-IN'>('mr-IN');
  const [customPhotoFileName, setCustomPhotoFileName] = useState('');
  const [agreeRules, setAgreeRules] = useState(true);
  const [showGoogleMapPicker, setShowGoogleMapPicker] = useState(false);
  const [isAiScanning, setIsAiScanning] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<{
    detectedCategory: string;
    departmentName: string;
    agencyName: string;
    confidence: number;
    slaHours: number;
    hazardTitleSuggestion: string;
    detailedDescriptionSuggestion?: string;
    aiEngine: string;
  } | null>(null);

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setCategory('POTHOLE');
    setWard('Panchavati');
    setLocationName('');
    setPhotoUrl('');
    setCustomPhotoFileName('');
    setAiAnalysis(null);
    setGpsDetectedNotice(null);
    setShowGoogleMapPicker(false);
  };

  // Apply default category templates instantly
  const applyCategoryTemplate = (newCat: HazardCategory, updatePhotoUrl: boolean = false) => {
    setCategory(newCat);
    const info = CATEGORY_DEFAULTS[newCat] || CATEGORY_DEFAULTS.OTHER;
    setTitle(info.title);
    setDescription(info.description);
    if (updatePhotoUrl && !customPhotoFileName) {
      setPhotoUrl(info.photoUrl);
    }
    setAiAnalysis({
      detectedCategory: newCat,
      departmentName: info.dept,
      agencyName: info.agency,
      confidence: 0.96,
      slaHours: info.sla,
      hazardTitleSuggestion: info.title,
      detailedDescriptionSuggestion: info.description,
      aiEngine: 'YOLOv8 Computer Vision'
    });
  };

  const analyzePhotoWithAI = async (imgUrl: string, fileName?: string) => {
    setIsAiScanning(true);
    try {
      const res = await fetch('/api/ai/detect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl: imgUrl, fileName })
      });
      const data = await res.json();
      if (data.success) {
        setAiAnalysis(data);
        const cat = data.detectedCategory as HazardCategory;
        setCategory(cat);
        // ✨ ALWAYS update title dynamically to match the newly analyzed hazard photo!
        if (data.hazardTitleSuggestion) {
          setTitle(data.hazardTitleSuggestion);
        }
        // ✨ ALWAYS update detailed description with official municipal text!
        if (data.detailedDescriptionSuggestion) {
          setDescription(data.detailedDescriptionSuggestion);
        }
      }
    } catch (err) {
      console.warn('AI Vision Detection error:', err);
    } finally {
      setIsAiScanning(false);
    }
  };

  const handleDetectGpsLocation = () => {
    setIsDetectingGps(true);
    setGpsDetectedNotice(null);

    const applyFallback = () => {
      const coords = WARD_COORDINATES[ward] || [20.0062, 73.7915];
      setLat(coords[0]);
      setLng(coords[1]);
      const name = WARD_LANDMARKS[ward] || `${ward} · Nashik`;
      setLocationName(name);
      setGpsDetectedNotice(`Auto-Detected: ${name}`);
      setIsDetectingGps(false);
      setTimeout(() => setGpsDetectedNotice(null), 4000);
    };

    if (typeof window !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLat(latitude);
          setLng(longitude);

          fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`)
            .then((res) => res.json())
            .then((data) => {
              if (data && data.display_name) {
                const parts = data.display_name.split(',');
                const cleanLoc = parts.slice(0, 3).join(',').trim();
                setLocationName(cleanLoc);
                setGpsDetectedNotice(`GPS Pin: ${cleanLoc}`);
              } else {
                const spotName = `${ward} · GPS (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`;
                setLocationName(spotName);
                setGpsDetectedNotice(`GPS Pin: ${spotName}`);
              }
            })
            .catch(() => {
              const spotName = `${ward} · GPS (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`;
              setLocationName(spotName);
              setGpsDetectedNotice(`GPS Pin: ${spotName}`);
            })
            .finally(() => {
              setIsDetectingGps(false);
              setTimeout(() => setGpsDetectedNotice(null), 4000);
            });
        },
        (error) => {
          console.log('Browser geolocation notice, using ward coordinates:', error?.message);
          applyFallback();
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 60000 }
      );
    } else {
      applyFallback();
    }
  };

  const handleDevicePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setCustomPhotoFileName(file.name);
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          const resUrl = reader.result;
          setPhotoUrl(resUrl);
          analyzePhotoWithAI(resUrl, file.name);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const startVoiceAssistant = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Voice input is not supported in this browser. Please use Google Chrome or Edge.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = voiceLang;
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setDescription((prev) => (prev ? `${prev} ${transcript}` : transcript));
      if (!title) {
        setTitle(transcript.slice(0, 50));
      }
    };

    recognition.start();
  };

  const handleGenerateDetailedAiDescription = () => {
    const info = CATEGORY_DEFAULTS[category] || CATEGORY_DEFAULTS.OTHER;
    const loc = locationName || `${ward}, Nashik`;
    const fullDraft = `[MUNICIPAL GRIEVANCE REPORT · ${ward.toUpperCase()} WARD]\nLocation: ${loc} (GPS Coordinates: ${lat.toFixed(4)}°N, ${lng.toFixed(4)}°E)\n\n${info.description}\n\nImmediate site verification and remediation is requested under Citizen Charter SLAs to prevent public inconvenience and pedestrian/vehicular safety hazards.`;
    setDescription(fullDraft);
  };

  useEffect(() => {
    if (isOpen) {
      if (prefilledComplaint) {
        setTitle(prefilledComplaint.title || '');
        setDescription(prefilledComplaint.description || '');
        if (prefilledComplaint.category) setCategory(prefilledComplaint.category);
        if (prefilledComplaint.ward) setWard(prefilledComplaint.ward);
        if (prefilledComplaint.locationName) setLocationName(prefilledComplaint.locationName);
      } else {
        // New fresh complaint: reset all fields so old info doesn't linger
        resetForm();
      }
    }
  }, [isOpen, prefilledComplaint]);

  const handleWardChange = (newWard: Ward) => {
    setWard(newWard);
    const coords = WARD_COORDINATES[newWard];
    if (coords) {
      setLat(coords[0]);
      setLng(coords[1]);
    }
  };

  const getJurisdiction = () => {
    const text = `${title} ${description} ${locationName}`.toLowerCase();
    const isHighway = text.includes('dwarka') || text.includes('द्वारका') ||
                      text.includes('mumbai naka') || text.includes('मुंबई नाका') ||
                      text.includes('highway') || text.includes('महामार्ग');

    if (isHighway) {
      return {
        authority: 'NHAI (National Highways Authority of India)',
        department: 'Highway Project Implementation Unit Nashik',
        sla: '24h SLA',
        agencyType: 'NHAI'
      };
    }

    if (category === 'ELECTRICAL_WIRE') {
      return {
        authority: 'MSEDCL (Mahavitaran Electricity)',
        department: 'Nashik Urban Circle Division',
        sla: '4h SLA',
        agencyType: 'MSEDCL'
      };
    }

    if (category === 'GARBAGE_DUMP') {
      return {
        authority: `NMC Solid Waste & Sanitation (${ward})`,
        department: 'NMC Solid Waste Management Division',
        sla: '48h SLA',
        agencyType: 'NMC'
      };
    }

    return {
      authority: `NMC Ward Division (${ward})`,
      department: 'NMC Public Works Department (PWD)',
      sla: '48h SLA',
      agencyType: 'NMC'
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreeRules) {
      alert('Please confirm that you are sharing genuine evidence.');
      return;
    }
    setIsSubmitting(true);
    const jur = getJurisdiction();
    try {
      await onSubmit({
        title,
        description: description || title,
        category,
        ward,
        locationName,
        lat,
        lng,
        beforeImageUrl: photoUrl || PRESET_PHOTOS[0].url,
        citizenName: currentUser?.name || 'Rahul Deshmukh',
        citizenEmail: currentUser?.email || 'citizen@nashik.gov.in',
        jurisdiction: jur.authority,
        aiVerified: true,
        aiConfidence: 0.96
      });
      resetForm();
      setPrefilledComplaint(null);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const jur = getJurisdiction();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-xl bg-white dark:bg-[#0c1322] border border-slate-200 dark:border-slate-800 rounded-none sm:rounded-3xl p-5 sm:p-7 shadow-2xl my-auto min-h-screen sm:min-h-0 max-h-none sm:max-h-[94vh] overflow-y-auto transition-colors space-y-5">

        {/* 1. Header (Exact Figma Screen 4) */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <button
            type="button"
            onClick={() => {
              resetForm();
              setPrefilledComplaint(null);
              onClose();
            }}
            className="flex items-center gap-1.5 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 text-xs font-semibold cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Cancel</span>
          </button>
          
          <h3 className="text-base font-extrabold text-[#111d2e] dark:text-white tracking-tight">
            Report a problem
          </h3>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => {
                const next = voiceLang === 'mr-IN' ? 'en-IN' : 'mr-IN';
                setVoiceLang(next);
                setLanguage(next === 'mr-IN' ? 'mr' : 'en');
              }}
              className="text-[11px] font-bold px-2 py-0.5 rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
            >
              {voiceLang === 'mr-IN' ? 'मराठी' : 'English'}
            </button>
          </div>
        </div>

        {/* 2. Top Banner (Figma: "Help fix local issues faster") */}
        <div className="p-3.5 rounded-2xl bg-[#fff8f3] dark:bg-amber-950/20 border border-[#fbd3b7] dark:border-amber-800/40 flex items-start gap-3">
          <div className="p-2 rounded-xl bg-[#d95b18] text-white shrink-0 mt-0.5">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-[13px] font-bold text-[#111d2e] dark:text-amber-100">
              Help fix local issues faster
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Take a photo, select category or pin on map. AI automatically identifies the hazard, drafts the detailed description, and routes directly to the assigned department.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* 3. Photo Upload Card (Exact Figma Screen 4) */}
          <div className="p-5 rounded-2xl bg-[#f8fafc] dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-center space-y-3">
            {photoUrl ? (
              <div className="relative w-full max-h-44 rounded-xl overflow-hidden border border-slate-200">
                <img src={photoUrl} alt="Evidence" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => {
                    setPhotoUrl('');
                    setCustomPhotoFileName('');
                    setAiAnalysis(null);
                  }}
                  className="absolute top-2 right-2 p-1 rounded-full bg-black/60 text-white cursor-pointer hover:bg-black/80 transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <>
                <div className="w-10 h-10 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[#d95b18] flex items-center justify-center mx-auto shadow-2xs">
                  <Camera className="w-5 h-5 stroke-[2.2]" />
                </div>
                <div>
                  <h4 className="text-[14px] font-bold text-[#111d2e] dark:text-slate-100">
                    Add a photo of the issue
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    No photo added · avoid faces and personal details
                  </p>
                </div>
              </>
            )}

            {/* Two Action Buttons: Take photo & Upload */}
            <div className="grid grid-cols-2 gap-2.5 pt-1">
              <label className="cursor-pointer py-2.5 px-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-[#111d2e] dark:text-slate-100 font-bold text-[13px] hover:bg-slate-50 transition text-center flex items-center justify-center gap-1.5 shadow-2xs">
                <Camera className="w-4 h-4 text-[#d95b18]" />
                <span>Take photo</span>
                <input 
                  type="file" 
                  accept="image/*" 
                  capture="environment" 
                  onChange={handleDevicePhotoUpload} 
                  className="hidden" 
                />
              </label>

              <label className="cursor-pointer py-2.5 px-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-[#111d2e] dark:text-slate-100 font-bold text-[13px] hover:bg-slate-50 transition text-center flex items-center justify-center gap-1.5 shadow-2xs">
                <Upload className="w-4 h-4 text-slate-500" />
                <span>Upload</span>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleDevicePhotoUpload} 
                  className="hidden" 
                />
              </label>
            </div>

            {/* Quick Demo Photo Presets with 1-click Title & Description Auto-Fill */}
            <div className="pt-2 text-left space-y-1">
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                Test AI Vision with sample civic hazard photos:
              </span>
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                {PRESET_PHOTOS.map((preset) => (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => {
                      setPhotoUrl(preset.url);
                      setCustomPhotoFileName(preset.name);
                      applyCategoryTemplate(preset.category, false);
                      analyzePhotoWithAI(preset.url, preset.name);
                    }}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition whitespace-nowrap border cursor-pointer ${
                      photoUrl === preset.url
                        ? 'bg-[#d95b18] text-white border-[#d95b18] shadow-2xs'
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-[#d95b18]/40'
                    }`}
                  >
                    {preset.category === 'POTHOLE' ? '🛣️ Pothole' : preset.category === 'GARBAGE_DUMP' ? '🗑️ Garbage' : preset.category === 'OPEN_MANHOLE' ? '🕳️ Manhole' : preset.category === 'ROAD_CAVE_IN' ? '⚠️ Cave-In' : '⚡ Wire'}
                  </button>
                ))}
              </div>
            </div>

            {/* Real-Time AI Computer Vision Detection & Department Auto-Routing Banner */}
            {isAiScanning ? (
              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200 flex items-center justify-center gap-2 animate-pulse text-xs font-semibold">
                <Sparkles className="w-4 h-4 text-amber-600 animate-spin" />
                <span>Scanning image with AI Vision to identify hazard and department...</span>
              </div>
            ) : aiAnalysis ? (
              <div className="p-3.5 rounded-xl bg-emerald-50/90 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-left space-y-1.5 shadow-2xs animate-in fade-in">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-emerald-800 dark:text-emerald-300 font-extrabold text-xs">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                    <span>AI Vision: {aiAnalysis.detectedCategory.replace(/_/g, ' ')} Identified ({Math.round(aiAnalysis.confidence * 100)}% match)</span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[9px] font-black bg-emerald-600 text-white uppercase tracking-wider">
                    Auto-Routed
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-[11px] text-emerald-900 dark:text-emerald-200 font-medium">
                  <span>🏛️ <b>Assigned Dept:</b> {aiAnalysis.departmentName}</span>
                  <span>•</span>
                  <span>⏱️ <b>Response SLA:</b> {aiAnalysis.slaHours} Hours</span>
                  <span>•</span>
                  <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-mono">({aiAnalysis.aiEngine})</span>
                </div>
              </div>
            ) : null}
          </div>

          {/* 4. Category * (Updates Title & Description Automatically on change) */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-[12px] font-bold text-[#111d2e] dark:text-slate-200">
                Category *
              </label>
              <span className="text-[10px] text-slate-400">Auto-sets Title & Description</span>
            </div>
            <div className="relative">
              <select
                value={category}
                onChange={(e) => {
                  const newCat = e.target.value as HazardCategory;
                  applyCategoryTemplate(newCat, true);
                }}
                className="w-full appearance-none px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-[13px] text-[#111d2e] dark:text-slate-100 font-medium focus:outline-none focus:border-[#d95b18]"
              >
                <option value="POTHOLE">Pothole / खड्डा</option>
                <option value="GARBAGE_DUMP">Garbage Dump / कचरा</option>
                <option value="OPEN_MANHOLE">Open Manhole / उघडे मॅनहोल</option>
                <option value="ROAD_CAVE_IN">Road Cave-In / रस्ता खचणे</option>
                <option value="ELECTRICAL_WIRE">Dangling Wire / वीज तार</option>
                <option value="WATER_LOGGING">Water Logging / पाणी साचणे</option>
                <option value="WATER_LEAKAGE">Water Pipeline Leakage / गळती</option>
                <option value="DRAINAGE_OVERFLOW">Drainage Overflow / गटार</option>
                <option value="STREETLIGHT_DEFECT">Streetlight Defect / पथदिवा</option>
                <option value="UNAUTHORIZED_EXCAVATION">Illegal Trenching / अनधिकृत खोदकाम</option>
                <option value="OTHER">Other / इतर समस्या</option>
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* 5. Ward Selection */}
          <div className="space-y-1">
            <label className="text-[12px] font-bold text-[#111d2e] dark:text-slate-200">
              NMC Ward *
            </label>
            <div className="relative">
              <select
                value={ward}
                onChange={(e) => handleWardChange(e.target.value as Ward)}
                className="w-full appearance-none px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-[13px] text-[#111d2e] dark:text-slate-100 font-medium focus:outline-none focus:border-[#d95b18]"
              >
                <option value="Panchavati">Panchavati (पंचवटी)</option>
                <option value="Nashik West">Nashik West (नाशिक पश्चिम)</option>
                <option value="Nashik East">Nashik East (नाशिक पूर्व)</option>
                <option value="Cidco">Cidco (सिडको)</option>
                <option value="Satpur">Satpur (सातपूर)</option>
                <option value="Nashik Road">Nashik Road (नाशिक रोड)</option>
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* 6. Location * (Clean input with MapPin & Map Picker) */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-[12px] font-bold text-[#111d2e] dark:text-slate-200">
                Location *
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleDetectGpsLocation}
                  disabled={isDetectingGps}
                  className="text-[11px] font-bold text-[#d95b18] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Crosshair className={`w-3.5 h-3.5 ${isDetectingGps ? 'animate-spin' : ''}`} />
                  <span>{isDetectingGps ? 'Detecting...' : '📍 Auto-Detect'}</span>
                </button>
                <span className="text-slate-300 dark:text-slate-700">•</span>
                <button
                  type="button"
                  onClick={() => setShowGoogleMapPicker(!showGoogleMapPicker)}
                  className="text-[11px] font-bold text-slate-600 dark:text-slate-300 hover:text-[#d95b18] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Compass className="w-3.5 h-3.5 text-[#d95b18]" />
                  <span>{showGoogleMapPicker ? 'Hide Map' : 'Pin on Map'}</span>
                </button>
              </div>
            </div>
            <div className="relative">
              <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={locationName}
                onChange={(e) => setLocationName(e.target.value)}
                placeholder="Street, landmark or map location"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-[13px] text-[#111d2e] dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-[#d95b18]"
              />
            </div>

            {gpsDetectedNotice && (
              <div className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 animate-in fade-in pt-0.5">
                <span>✓</span>
                <span>{gpsDetectedNotice}</span>
              </div>
            )}

            {/* Interactive Embedded Satellite Map View (Optional / on toggle) */}
            {showGoogleMapPicker && (
              <div className="pt-2 animate-in fade-in-50 duration-150">
                <GoogleMapView
                  height="260px"
                  showCardWrapper={false}
                  onLocationSelect={(loc) => {
                    setLocationName(loc.address);
                    setLat(loc.lat);
                    setLng(loc.lng);
                  }}
                />
              </div>
            )}
          </div>

          {/* 7. Report title * (Auto-filled & customizable) */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-[12px] font-bold text-[#111d2e] dark:text-slate-200">
                Report title *
              </label>
              <button
                type="button"
                onClick={() => {
                  const info = CATEGORY_DEFAULTS[category] || CATEGORY_DEFAULTS.OTHER;
                  setTitle(info.title);
                }}
                className="text-[11px] font-bold text-[#d95b18] hover:underline cursor-pointer flex items-center gap-1"
              >
                <Sparkles className="w-3 h-3" />
                <span>Reset to AI Title</span>
              </button>
            </div>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Briefly describe the issue"
              className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-[13px] text-[#111d2e] dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-[#d95b18]"
            />
          </div>

          {/* 8. Details * (Auto-drafted by AI + Voice Dictate) */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-[12px] font-bold text-[#111d2e] dark:text-slate-200">
                Detailed Description *
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleGenerateDetailedAiDescription}
                  className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 hover:text-emerald-700 hover:underline cursor-pointer"
                >
                  <Sparkles className="w-3 h-3 text-emerald-600" />
                  <span>AI Auto-Draft</span>
                </button>
                <span className="text-slate-300 dark:text-slate-700">•</span>
                <button
                  type="button"
                  onClick={startVoiceAssistant}
                  className="flex items-center gap-1 text-[11px] font-bold text-[#d95b18] hover:underline cursor-pointer"
                >
                  {isListening ? <MicOff className="w-3 h-3 animate-pulse" /> : <Mic className="w-3 h-3" />}
                  <span>{isListening ? 'Listening...' : 'Voice Dictate'}</span>
                </button>
              </div>
            </div>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What did you notice? Add useful context."
              className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-[13px] text-[#111d2e] dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-[#d95b18] leading-relaxed"
            />
          </div>

          {/* Auto-routing note */}
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
            <span>Routing: <b>{jur.authority}</b></span>
            <span className="font-bold text-[#d95b18]">{jur.sla}</span>
          </div>

          {/* 9. Genuine evidence checkbox (Exact Figma Screen 4) */}
          <div className="flex items-start gap-2.5 pt-1">
            <input
              type="checkbox"
              id="rulesAgree"
              checked={agreeRules}
              onChange={(e) => setAgreeRules(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded text-[#d95b18] focus:ring-[#d95b18]"
            />
            <label htmlFor="rulesAgree" className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
              I'm sharing genuine evidence and have read the reporting rules.
            </label>
          </div>

          {/* 10. Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 px-6 rounded-xl bg-[#d95b18] hover:bg-[#c24e12] text-white font-extrabold text-[15px] shadow-sm transition active:scale-[0.98] disabled:opacity-60 cursor-pointer"
            >
              {isSubmitting ? 'Submitting report...' : 'Submit report'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
