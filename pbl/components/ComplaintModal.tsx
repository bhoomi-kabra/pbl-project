'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/lib/AppContext';
import { Ward, HazardCategory } from '@/lib/types';
import { WARD_COORDINATES } from '@/lib/mockData';
import { X, Camera, MapPin, Check, Mic, MicOff, Sparkles, ShieldAlert, ExternalLink, Clock, Compass, PhoneCall, Building } from 'lucide-react';


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
    name: 'Road Cave-In',
    url: 'https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?auto=format&fit=crop&w=800&q=80',
    category: 'ROAD_CAVE_IN' as HazardCategory
  },
  {
    name: 'Open Manhole',
    url: 'https://images.unsplash.com/photo-1584467735871-8e85353a8413?auto=format&fit=crop&w=800&q=80',
    category: 'OPEN_MANHOLE' as HazardCategory
  },
  {
    name: 'Dangling Wire',
    url: 'https://images.unsplash.com/photo-1544724569-5f546fd6f2b5?auto=format&fit=crop&w=800&q=80',
    category: 'ELECTRICAL_WIRE' as HazardCategory
  },
  {
    name: 'Garbage Dump',
    url: 'https://images.unsplash.com/photo-1605600659908-0ef719419d41?auto=format&fit=crop&w=800&q=80',
    category: 'GARBAGE_DUMP' as HazardCategory
  },
  {
    name: 'Water Pipeline Leakage',
    url: 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?auto=format&fit=crop&w=800&q=80',
    category: 'WATER_LEAKAGE' as HazardCategory
  },
  {
    name: 'Drainage Overflow',
    url: 'https://images.unsplash.com/photo-1541888946425-d0fbb186a5b2?auto=format&fit=crop&w=800&q=80',
    category: 'DRAINAGE_OVERFLOW' as HazardCategory
  },
  {
    name: 'Streetlight Defect',
    url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80',
    category: 'STREETLIGHT_DEFECT' as HazardCategory
  }

];

export default function ComplaintModal({ isOpen, onClose, onSubmit }: ComplaintModalProps) {
  const { t, prefilledComplaint, currentUser, setPrefilledComplaint } = useApp();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<HazardCategory>('POTHOLE');
  const [ward, setWard] = useState<Ward>('Nashik West');
  const [locationName, setLocationName] = useState('');
  const [photoUrl, setPhotoUrl] = useState(PRESET_PHOTOS[0].url);
  const [lat, setLat] = useState(20.0089);
  const [lng, setLng] = useState(73.7621);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceLang, setVoiceLang] = useState<'mr-IN' | 'en-IN'>('mr-IN');
  const [customPhotoFileName, setCustomPhotoFileName] = useState('');

  const handleDevicePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setCustomPhotoFileName(file.name);
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setPhotoUrl(reader.result);
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

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setDescription(prev => (prev ? prev + ' ' : '') + transcript);
      if (!title) {
        setTitle(transcript.slice(0, 50));
      }

      // Smart keyword detection for Marathi & English
      const lower = transcript.toLowerCase();
      if (lower.includes('खड्डा') || lower.includes('pothole')) setCategory('POTHOLE');
      else if (lower.includes('कचरा') || lower.includes('garbage')) setCategory('GARBAGE_DUMP');
      else if (lower.includes('गटार') || lower.includes('drainage') || lower.includes('gutter')) setCategory('DRAINAGE_OVERFLOW');
      else if (lower.includes('पाणी') || lower.includes('water') || lower.includes('गळती')) setCategory('WATER_LEAKAGE');
      else if (lower.includes('लाईट') || lower.includes('light') || lower.includes('दिवा')) setCategory('STREETLIGHT_DEFECT');
      else if (lower.includes('तार') || lower.includes('wire')) setCategory('ELECTRICAL_WIRE');
      else if (lower.includes('मॅनहोल') || lower.includes('manhole')) setCategory('OPEN_MANHOLE');

      // Ward auto-detection
      if (lower.includes('पंचवटी') || lower.includes('panchavati')) handleWardChange('Panchavati');
      else if (lower.includes('नाशिक रोड') || lower.includes('nashik road') || lower.includes('रेल्वे')) handleWardChange('Nashik Road');
      else if (lower.includes('सिडको') || lower.includes('cidco')) handleWardChange('Cidco');
      else if (lower.includes('सातपूर') || lower.includes('satpur')) handleWardChange('Satpur');
      else if (lower.includes('गंगापूर') || lower.includes('कॉलेज') || lower.includes('college')) handleWardChange('Nashik West');

      setIsListening(false);
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };


  useEffect(() => {
    if (prefilledComplaint) {
      if (prefilledComplaint.title) setTitle(prefilledComplaint.title);
      if (prefilledComplaint.description) setDescription(prefilledComplaint.description);
      if (prefilledComplaint.category) setCategory(prefilledComplaint.category);
      if (prefilledComplaint.ward) setWard(prefilledComplaint.ward);
      if (prefilledComplaint.locationName) setLocationName(prefilledComplaint.locationName);
    }
  }, [prefilledComplaint]);

  const handleWardChange = (newWard: Ward) => {
    setWard(newWard);
    if (WARD_COORDINATES[newWard]) {
      setLat(WARD_COORDINATES[newWard][0]);
      setLng(WARD_COORDINATES[newWard][1]);
    }
  };

  const getJurisdiction = () => {
    const text = (locationName + ' ' + title + ' ' + description).toLowerCase();

    // Check NHAI highway corridor across Nashik (NH-3 / NH-60, Dwarka, Mumbai Naka, Pathardi, Adgaon, Amrutdham)
    const isHighway = text.includes('dwarka') || text.includes('द्वारका') ||
                      text.includes('mumbai naka') || text.includes('मुंबई नाका') ||
                      text.includes('pathardi') || text.includes('पाथर्डी') ||
                      text.includes('adgaon') || text.includes('आडगाव') ||
                      text.includes('amrutdham') || text.includes('अमृतधाम') ||
                      text.includes('highway') || text.includes('महामार्ग') ||
                      text.includes('nh3') || text.includes('nh-3') ||
                      text.includes('nh60') || text.includes('nh-60') ||
                      text.includes('flyover') || text.includes('उड्डाणपूल');

    if (isHighway) {
      return {
        authority: 'NHAI (National Highways Authority of India)',
        authorityMr: 'भारतीय राष्ट्रीय महामार्ग प्राधिकरण (NHAI)',
        department: 'Project Implementation Unit Nashik (NH-3 / NH-60)',
        sla: '24h Highway Safety SLA',
        helpline: '1033',
        isCrossDispatch: true,
        agencyType: 'NHAI',
        color: 'rose',
        note: 'Cross-Agency Alert: Auto-routed to NHAI Highway Project Director Nashik & NMC Liaison Desk.'
      };
    }

    if (category === 'ELECTRICAL_WIRE' || text.includes('महावितरण') || text.includes('msedcl') || text.includes('transformer') || text.includes('dp box')) {
      return {
        authority: 'MSEDCL (Mahavitaran Electricity)',
        authorityMr: 'महाराष्ट्र राज्य विद्युत वितरण कंपनी (महावितरण)',
        department: 'Nashik Urban High-Tension & Circle Division',
        sla: '4h Critical Safety SLA',
        helpline: '1912',
        isCrossDispatch: true,
        agencyType: 'MSEDCL',
        color: 'amber',
        note: 'Direct Emergency Dispatch: Connected to MSEDCL Control Room (1912).'
      };
    }

    if (category === 'WATER_LEAKAGE' || text.includes('pipeline') || text.includes('जलवाहिनी')) {
      return {
        authority: 'NMC Water Supply Department',
        authorityMr: 'मनपा पाणी पुरवठा विभाग',
        department: 'Gangapur Dam Water Distribution Division',
        sla: '24h Pipeline Restoration SLA',
        helpline: '0253-2575631',
        isCrossDispatch: false,
        agencyType: 'NMC',
        color: 'blue',
        note: 'Direct Ward Dispatch: NMC Water Supply Executive Engineer.'
      };
    }

    if (category === 'GARBAGE_DUMP') {
      return {
        authority: 'NMC Solid Waste & Sanitation',
        authorityMr: 'मनपा घनकचरा व्यवस्थापन विभाग',
        department: 'Public Health (₹5,000 spot fine MMCA Sec. 376)',
        sla: '12h Sanitation Clearance',
        helpline: '7030300300',
        isCrossDispatch: false,
        agencyType: 'NMC',
        color: 'emerald',
        note: 'NMC Sanitation Inspector assigned with statutory dumping penalty authority.'
      };
    }

    return {
      authority: `NMC Ward Division (${ward})`,
      authorityMr: `मनपा प्रभाग कार्यालय (${ward})`,
      department: 'NMC Public Works Department (PWD)',
      sla: '48h DLP Audit Inspection',
      helpline: '7030300300',
      isCrossDispatch: false,
      agencyType: 'NMC',
      color: 'slate',
      note: 'Assigned to Ward Junior Engineer & Tendering Contractor under statutory DLP warranty.'
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const jur = getJurisdiction();
    try {
      await onSubmit({
        title,
        description,
        category,
        ward,
        locationName,
        lat,
        lng,
        beforeImageUrl: photoUrl,
        citizenName: currentUser?.name || 'Verified Citizen',
        citizenEmail: currentUser?.email || 'citizen@nashik.gov.in',
        jurisdiction: jur.authority
      });
      setPrefilledComplaint(null);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-3xl p-5 sm:p-8 shadow-2xl space-y-5 my-auto max-h-[92vh] overflow-y-auto transition-colors">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
                {t.submitModalTitle}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Logged to Nashik Municipal Corporation PWD inspection dispatch
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">

          {/* AI Voice Assistant Banner */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-transparent border border-amber-500/20">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
              <span className="font-semibold text-slate-800 dark:text-slate-200 text-xs">
                {voiceLang === 'mr-IN' ? 'मराठी AI व्हॉइस असिस्टंट' : 'AI Voice Assistant'}
              </span>
              <span className="text-[10px] text-slate-500">
                ({voiceLang === 'mr-IN' ? 'मराठीत बोला' : 'Speak in English'})
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setVoiceLang(prev => prev === 'mr-IN' ? 'en-IN' : 'mr-IN')}
                className="px-2 py-1 text-[10px] font-bold rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100"
              >
                {voiceLang === 'mr-IN' ? 'मराठी' : 'EN'}
              </button>

              <button
                type="button"
                onClick={startVoiceAssistant}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs transition-all ${
                  isListening
                    ? 'bg-rose-500 text-white animate-pulse shadow-lg shadow-rose-500/30'
                    : 'bg-amber-500 hover:bg-amber-600 text-white shadow-md'
                }`}
              >
                {isListening ? (
                  <>
                    <MicOff className="w-3.5 h-3.5" />
                    <span>ऐकत आहे... (Listening)</span>
                  </>
                ) : (
                  <>
                    <Mic className="w-3.5 h-3.5" />
                    <span>{voiceLang === 'mr-IN' ? 'येथे बोला' : 'Tap to Speak'}</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Hazard Classification:
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as HazardCategory)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-200 font-medium focus:ring-2 focus:ring-amber-500"
              >
                <option value="POTHOLE">Pothole / खड्डा</option>
                <option value="ROAD_CAVE_IN">Road Cave-In / रस्ता खचणे</option>
                <option value="OPEN_MANHOLE">Open Manhole / उघडे मॅनहोल</option>
                <option value="ELECTRICAL_WIRE">Dangling Electrical Wire / लटकती वीज तार</option>
                <option value="WATER_LOGGING">Water Logging / पाणी साचणे</option>
                <option value="WATER_LEAKAGE">Water Pipeline Leakage / पाण्याची गळती</option>
                <option value="DRAINAGE_OVERFLOW">Drainage Overflow / गटार ओव्हरफ्लो</option>
                <option value="GARBAGE_DUMP">Garbage Dump / कचरा ढीग</option>
                <option value="STREETLIGHT_DEFECT">Streetlight Defect / बंद पथदिवा</option>
                <option value="UNAUTHORIZED_EXCAVATION">Unauthorized Excavation / अनधिकृत खोदकाम</option>
                <option value="OTHER">Other / इतर नागरी समस्या</option>

              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                {t.wardLabel}:
              </label>
              <select
                value={ward}
                onChange={(e) => handleWardChange(e.target.value as Ward)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-200 font-medium focus:ring-2 focus:ring-amber-500"
              >
                <option value="Panchavati">Panchavati</option>
                <option value="Nashik East">Nashik East</option>
                <option value="Nashik West">Nashik West</option>
                <option value="Cidco">Cidco</option>
                <option value="Satpur">Satpur</option>
                <option value="Nashik Road">Nashik Road</option>
              </select>
            </div>
          </div>

          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              {t.complaintTitleLabel}:
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Cluster of 3 deep potholes outside Big Bazaar"
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-200 focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              {t.locationLabel}:
            </label>
            <input
              type="text"
              required
              value={locationName}
              onChange={(e) => setLocationName(e.target.value)}
              placeholder="e.g. Dwarka Circle Flyover / College Road / Gangapur Road"
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-200 focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {/* Dynamic Jurisdiction Auto-Routing Card */}
          {(() => {
            const jur = getJurisdiction();
            return (
              <div className={`p-3 rounded-2xl border text-xs transition-all ${
                jur.isCrossDispatch 
                  ? 'bg-rose-500/10 border-rose-500/30 text-rose-950 dark:text-rose-200' 
                  : 'bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200'
              }`}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5 font-bold">
                    <Compass className="w-4 h-4 text-amber-500" />
                    <span>अधिकार क्षेत्र (Jurisdiction):</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                      jur.agencyType === 'NHAI' 
                        ? 'bg-rose-600 text-white' 
                        : jur.agencyType === 'MSEDCL' 
                        ? 'bg-amber-500 text-slate-950' 
                        : 'bg-blue-600 text-white'
                    }`}>
                      {jur.agencyType}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-emerald-500" />
                    {jur.sla}
                  </span>
                </div>

                <div className="text-[11px] font-semibold text-slate-900 dark:text-slate-100">
                  {jur.authority} • {jur.department}
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                  {jur.note}
                </p>

                {jur.helpline && (
                  <div className="mt-2 pt-1.5 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-[10px]">
                    <span className="text-slate-500 dark:text-slate-400">थेट हेल्पलाईन संपर्क:</span>
                    <a 
                      href={`tel:${jur.helpline}`} 
                      className="font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1"
                    >
                      <PhoneCall className="w-3 h-3" />
                      {jur.helpline}
                    </a>
                  </div>
                )}
              </div>
            );
          })()}

          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              {t.complaintDescLabel}:
            </label>
            <textarea
              required
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe depth, water accumulation, traffic impact, and risks..."
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-200 focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              {t.photoUploadLabel} / पुरावा फोटो (Upload Evidence Photo):
            </label>

            {/* Custom Device File / Camera Upload Box */}
            <div className="flex flex-col sm:flex-row items-center gap-3 p-3 mb-3 rounded-2xl bg-amber-500/5 dark:bg-slate-800/80 border border-amber-500/30">
              {photoUrl && (
                <div className="relative w-20 h-20 rounded-xl overflow-hidden border-2 border-amber-500 shadow-sm flex-shrink-0">
                  <img src={photoUrl} alt="Evidence Preview" className="w-full h-full object-cover" />
                </div>
              )}

              <div className="flex-1 space-y-1 text-center sm:text-left">
                <label className="cursor-pointer inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs transition shadow-md">
                  <Camera className="w-4 h-4" />
                  <span>{customPhotoFileName ? 'फोटो बदला (Change Photo)' : '📷 कॅमेरा किंवा गॅलरीतून फोटो निवडा'}</span>
                  <input 
                    type="file" 
                    accept="image/*" 
                    capture="environment"
                    onChange={handleDevicePhotoUpload} 
                    className="hidden" 
                  />
                </label>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">
                  {customPhotoFileName ? `निवडलेली फाईल: ${customPhotoFileName}` : 'थेट मोबाईल कॅमेऱ्याने फोटो काढा किंवा फाईल अपलोड करा (JPG, PNG)'}
                </p>
              </div>
            </div>

            <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
              किंवा खालीलपैकी नमुना फोटो निवडा (Or select standard preset):
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-2">
              {PRESET_PHOTOS.map((p) => (
                <div
                  key={p.name}
                  onClick={() => {
                    setPhotoUrl(p.url);
                    setCategory(p.category);
                    setCustomPhotoFileName('');
                  }}
                  className={`cursor-pointer rounded-xl overflow-hidden border-2 relative group aspect-video transition ${photoUrl === p.url ? 'border-amber-500 ring-2 ring-amber-500/20' : 'border-slate-200 dark:border-slate-700 opacity-80 hover:opacity-100'
                    }`}
                >
                  <img src={p.url} alt={p.name} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center p-1 text-center text-[10px] font-bold text-white">
                    {p.name}
                  </div>
                  {photoUrl === p.url && (
                    <div className="absolute top-1 right-1 bg-amber-500 text-slate-950 rounded-full p-0.5">
                      <Check className="w-3 h-3" />
                    </div>
                  )}
                </div>
              ))}
            </div>
            <input
              type="url"
              value={photoUrl}
              onChange={(e) => setPhotoUrl(e.target.value)}
              placeholder="किंवा थेट इमेज URL पेस्ट करा (Or paste image URL)"
              className="w-full px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-[11px] text-slate-900 dark:text-slate-300"
            />
          </div>

          <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-400">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-amber-500" />
              <span>Geotag Coordinates: <b>{lat.toFixed(4)}, {lng.toFixed(4)}</b></span>
            </div>
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">GPS Locked</span>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-slate-950 font-bold text-xs sm:text-sm shadow-md shadow-orange-500/20 transition transform active:scale-95"
            >
              {isSubmitting ? t.submittingBtn : t.submitBtn}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
