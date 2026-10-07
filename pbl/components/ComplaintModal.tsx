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
  X
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
  }
];

export default function ComplaintModal({ isOpen, onClose, onSubmit }: ComplaintModalProps) {
  const { language, setLanguage, prefilledComplaint, currentUser, setPrefilledComplaint } = useApp();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<HazardCategory>('POTHOLE');
  const [ward, setWard] = useState<Ward>('Panchavati');
  const [locationName, setLocationName] = useState('');
  const [photoUrl, setPhotoUrl] = useState(PRESET_PHOTOS[0].url);
  const [lat, setLat] = useState(20.0062);
  const [lng, setLng] = useState(73.7915);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceLang, setVoiceLang] = useState<'mr-IN' | 'en-IN'>('mr-IN');
  const [customPhotoFileName, setCustomPhotoFileName] = useState('');
  const [agreeRules, setAgreeRules] = useState(true);
  const [showGoogleMapPicker, setShowGoogleMapPicker] = useState(false);

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

  useEffect(() => {
    if (prefilledComplaint) {
      setTitle(prefilledComplaint.title || '');
      setDescription(prefilledComplaint.description || '');
      if (prefilledComplaint.category) setCategory(prefilledComplaint.category);
      if (prefilledComplaint.ward) setWard(prefilledComplaint.ward);
      if (prefilledComplaint.locationName) setLocationName(prefilledComplaint.locationName);
    }
  }, [prefilledComplaint]);

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
        beforeImageUrl: photoUrl,
        citizenName: currentUser?.name || 'Rahul Deshmukh',
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

  const jur = getJurisdiction();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-xl bg-white dark:bg-[#0c1322] border border-slate-200 dark:border-slate-800 rounded-none sm:rounded-3xl p-5 sm:p-7 shadow-2xl my-auto min-h-screen sm:min-h-0 max-h-none sm:max-h-[94vh] overflow-y-auto transition-colors space-y-5">

        {/* 1. Header (Exact Figma Screen 4) */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-2 text-[15px] font-bold text-[#111d2e] dark:text-slate-100 hover:text-[#d95b18] transition"
          >
            <ArrowLeft className="w-5 h-5 stroke-[2.2]" />
            <span>{language === 'mr' ? 'नवीन नागरी अहवाल' : 'New civic report'}</span>
          </button>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setLanguage(language === 'en' ? 'mr' : 'en')}
              className="text-xs font-bold text-slate-600 dark:text-slate-300 px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800"
            >
              EN / म
            </button>
            <button 
              type="button"
              onClick={() => alert('Add a clear photo, exact location, and respectful details.')}
              className="text-slate-400 hover:text-slate-600"
            >
              <HelpCircle className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 2. Headline & Subtitle */}
        <div className="space-y-1">
          <h2 className="text-[26px] sm:text-[30px] font-black text-[#111d2e] dark:text-slate-100 leading-tight">
            {language === 'mr' ? 'कशावर लक्ष देणे आवश्यक आहे?' : 'What needs attention?'}
          </h2>
          <p className="text-[13px] text-slate-500 dark:text-slate-400">
            {language === 'mr'
              ? 'खरे पुरावे वापरा. तुमचा अहवाल पुनरावलोकनात जाईल.'
              : 'Use real evidence. Your report will enter review.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">

          {/* 3. Photo Upload Card (Exact Figma Screen 4) */}
          <div className="p-5 rounded-2xl bg-[#f8fafc] dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-center space-y-3">
            {photoUrl && customPhotoFileName ? (
              <div className="relative w-full max-h-44 rounded-xl overflow-hidden border border-slate-200">
                <img src={photoUrl} alt="Evidence" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => {
                    setPhotoUrl(PRESET_PHOTOS[0].url);
                    setCustomPhotoFileName('');
                  }}
                  className="absolute top-2 right-2 p-1 rounded-full bg-black/60 text-white"
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
          </div>

          {/* 4. Category * */}
          <div className="space-y-1">
            <label className="text-[12px] font-bold text-[#111d2e] dark:text-slate-200">
              Category *
            </label>
            <div className="relative">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as HazardCategory)}
                className="w-full appearance-none px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-[13px] text-[#111d2e] dark:text-slate-100 font-medium focus:outline-none focus:border-[#d95b18]"
              >
                <option value="POTHOLE">Pothole / खड्डा</option>
                <option value="OPEN_MANHOLE">Open Manhole / उघडे मॅनहोल</option>
                <option value="ROAD_CAVE_IN">Road Cave-In / रस्ता खचणे</option>
                <option value="ELECTRICAL_WIRE">Dangling Wire / वीज तार</option>
                <option value="WATER_LOGGING">Water Logging / पाणी साचणे</option>
                <option value="GARBAGE_DUMP">Garbage Dump / कचरा</option>
                <option value="WATER_LEAKAGE">Water Pipeline Leakage / गळती</option>
                <option value="DRAINAGE_OVERFLOW">Drainage Overflow / गटार</option>
                <option value="STREETLIGHT_DEFECT">Streetlight Defect / पथदिवा</option>
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

          {/* 6. Location * (Input with MapPin & Google Maps Picker) */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-[12px] font-bold text-[#111d2e] dark:text-slate-200">
                Location *
              </label>
              <button
                type="button"
                onClick={() => setShowGoogleMapPicker(!showGoogleMapPicker)}
                className="text-[11px] font-bold text-[#d95b18] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>{showGoogleMapPicker ? 'Hide Google Map' : 'Pin on Google Map (Satellite & Autocomplete)'}</span>
              </button>
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

            {showGoogleMapPicker && (
              <div className="pt-2 animate-in fade-in-50 duration-150">
                <GoogleMapView
                  height="250px"
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

          {/* 7. Report title * */}
          <div className="space-y-1">
            <label className="text-[12px] font-bold text-[#111d2e] dark:text-slate-200">
              Report title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Briefly describe the issue"
              className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-[13px] text-[#111d2e] dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-[#d95b18]"
            />
          </div>

          {/* 8. Details * */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-[12px] font-bold text-[#111d2e] dark:text-slate-200">
                Details *
              </label>
              <button
                type="button"
                onClick={startVoiceAssistant}
                className="flex items-center gap-1 text-[11px] font-bold text-[#d95b18] hover:underline"
              >
                {isListening ? <MicOff className="w-3 h-3 animate-pulse" /> : <Mic className="w-3 h-3" />}
                <span>{isListening ? 'Listening...' : 'Voice Dictate'}</span>
              </button>
            </div>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What did you notice? Add useful context."
              className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-[13px] text-[#111d2e] dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-[#d95b18]"
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
              className="w-full py-3.5 px-6 rounded-xl bg-[#d95b18] hover:bg-[#c24e12] text-white font-extrabold text-[15px] shadow-sm transition active:scale-[0.98] disabled:opacity-60"
            >
              {isSubmitting ? 'Submitting report...' : 'Submit report'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
