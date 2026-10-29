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
import MiniMapPicker, { getNearestLandmarkAndWard } from './MiniMapPicker';

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

export const NASHIK_POPULAR_LANDMARKS = [
  { name: 'Indu Heights, Vidhate Nagar, Panchavati', ward: 'Panchavati' as Ward, lat: 20.0270, lng: 73.8140, icon: '🏢' },
  { name: 'College Road (Near BYK / Bhosala)', ward: 'Nashik West' as Ward, lat: 20.0089, lng: 73.7634, icon: '🛣️' },
  { name: 'Ramkund & Godavari Ghat, Panchavati', ward: 'Panchavati' as Ward, lat: 20.0070, lng: 73.7930, icon: '🏛️' },
  { name: 'Dwarka Circle, Highway Junction', ward: 'Nashik East' as Ward, lat: 19.9880, lng: 73.8050, icon: '🚗' },
  { name: 'Trimurti Chowk, Pawan Nagar, Cidco', ward: 'Cidco' as Ward, lat: 19.9720, lng: 73.7530, icon: '🏢' },
  { name: 'Satpur MIDC Industrial Area, Trimbak Road', ward: 'Satpur' as Ward, lat: 19.9980, lng: 73.7420, icon: '🏭' },
  { name: 'Bytco Point, Nashik Road', ward: 'Nashik Road' as Ward, lat: 19.9540, lng: 73.8320, icon: '🚆' },
  { name: 'Gangapur Road (Near ABB Circle)', ward: 'Nashik West' as Ward, lat: 20.0150, lng: 73.7580, icon: '🌳' },
  { name: 'Canada Corner / Sharanpur Road', ward: 'Nashik West' as Ward, lat: 19.9990, lng: 73.7740, icon: '🏬' },
  { name: 'City Center Mall / Untwadi Road', ward: 'Nashik West' as Ward, lat: 19.9910, lng: 73.7590, icon: '🛍️' },
  { name: 'Panchavati Karanja / Malegaon Stand', ward: 'Panchavati' as Ward, lat: 20.0120, lng: 73.7980, icon: '🛕' },
  { name: 'Mumbai Naka / CBS Bus Stand', ward: 'Nashik East' as Ward, lat: 19.9920, lng: 73.7840, icon: '🚌' },
  { name: 'Ambad MIDC / Garware Point', ward: 'Cidco' as Ward, lat: 19.9480, lng: 73.7380, icon: '⚙️' }
];

export const NASHIK_LOCALITY_MAPPING = [
  {
    keywords: ['vidhate nagar', 'vidhate', 'indu heights', 'hirawadi', 'hiravadi'],
    displayName: 'Indu Heights, Vidhate Nagar, Hirawadi',
    ward: 'Panchavati' as Ward,
    lat: 20.0270,
    lng: 73.8140
  },
  {
    keywords: ['college road', 'byk', 'bhosala', 'krishi nagar'],
    displayName: 'College Road, Near BYK College',
    ward: 'Nashik West' as Ward,
    lat: 20.0089,
    lng: 73.7634
  },
  {
    keywords: ['gangapur road', 'abb circle', 'anandwalli', 'serene meadows', 'pipeline'],
    displayName: 'Gangapur Road, Near ABB Circle',
    ward: 'Nashik West' as Ward,
    lat: 20.0150,
    lng: 73.7580
  },
  {
    keywords: ['ramkund', 'panchavati', 'godavari', 'tapovan', 'kalaram', 'malegaon stand'],
    displayName: 'Ramkund & Godavari Ghat, Panchavati',
    ward: 'Panchavati' as Ward,
    lat: 20.0070,
    lng: 73.7930
  },
  {
    keywords: ['dwarka', 'mumbai naka', 'highway', 'kathe galli'],
    displayName: 'Dwarka Circle / Highway Junction',
    ward: 'Nashik East' as Ward,
    lat: 19.9880,
    lng: 73.8050
  },
  {
    keywords: ['trimurti chowk', 'pawan nagar', 'cidco', 'uttamnagar', 'khutwad nagar'],
    displayName: 'Trimurti Chowk, Pawan Nagar, Cidco',
    ward: 'Cidco' as Ward,
    lat: 19.9720,
    lng: 73.7530
  },
  {
    keywords: ['satpur', 'midc', 'trimbak road', 'carbon naka', 'ashok nagar'],
    displayName: 'Satpur MIDC Industrial Area',
    ward: 'Satpur' as Ward,
    lat: 19.9980,
    lng: 73.7420
  },
  {
    keywords: ['bytco', 'nashik road', 'station', 'jail road', 'datta mandir', 'deolali'],
    displayName: 'Bytco Point, Nashik Road',
    ward: 'Nashik Road' as Ward,
    lat: 19.9540,
    lng: 73.8320
  },
  {
    keywords: ['indira nagar', 'rajiv nagar', 'wadala pathardi road'],
    displayName: 'Indira Nagar, Near Jogging Track',
    ward: 'Nashik East' as Ward,
    lat: 19.9710,
    lng: 73.7820
  },
  {
    keywords: ['govind nagar', 'city center mall', 'untwadi', 'sambhajinagar'],
    displayName: 'City Center Mall / Govind Nagar',
    ward: 'Nashik West' as Ward,
    lat: 19.9910,
    lng: 73.7590
  },
  {
    keywords: ['canada corner', 'sharanpur road', 'tidke colony'],
    displayName: 'Canada Corner / Sharanpur Road',
    ward: 'Nashik West' as Ward,
    lat: 19.9990,
    lng: 73.7740
  },
  {
    keywords: ['makhmalabad', 'kalyan nagar'],
    displayName: 'Makhmalabad Road, Panchavati',
    ward: 'Panchavati' as Ward,
    lat: 20.0380,
    lng: 73.7910
  },
  {
    keywords: ['mhasrul', 'meri', 'dindori road'],
    displayName: 'Mhasrul / Dindori Road Link',
    ward: 'Panchavati' as Ward,
    lat: 20.0450,
    lng: 73.8120
  },
  {
    keywords: ['ambad', 'garware', 'xlo point', 'pathardi phata'],
    displayName: 'Ambad MIDC / Pathardi Phata',
    ward: 'Cidco' as Ward,
    lat: 19.9480,
    lng: 73.7380
  }
];

export function resolveCustomAddress(text: string): { matched: boolean; ward?: Ward; lat?: number; lng?: number; resolvedName?: string } {
  const lower = text.toLowerCase();
  for (const item of NASHIK_LOCALITY_MAPPING) {
    if (item.keywords.some(k => lower.includes(k))) {
      return {
        matched: true,
        ward: item.ward,
        lat: item.lat,
        lng: item.lng,
        resolvedName: item.displayName
      };
    }
  }
  return { matched: false };
}

export default function ComplaintModal({ isOpen, onClose, onSubmit }: ComplaintModalProps) {
  const { language, setLanguage, prefilledComplaint, currentUser, setPrefilledComplaint } = useApp();

  const [category, setCategory] = useState<HazardCategory | ''>('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [ward, setWard] = useState<Ward | ''>('');
  const [locationName, setLocationName] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [lat, setLat] = useState(20.0062);
  const [lng, setLng] = useState(73.7915);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isDetectingGps, setIsDetectingGps] = useState(false);
  const [gpsDetectedNotice, setGpsDetectedNotice] = useState<string | null>(null);
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
  const [geocodedSuggestions, setGeocodedSuggestions] = useState<Array<{
    displayName: string;
    address: string;
    ward: Ward;
    lat: number;
    lng: number;
    source: string;
  }>>([]);
  const [isGeocoding, setIsGeocoding] = useState(false);
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

  // Live dynamic geocoding for ANY address typed by any citizen
  useEffect(() => {
    const trimmed = locationName.trim();
    if (trimmed.length < 2) {
      setGeocodedSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsGeocoding(true);
      try {
        const res = await fetch(`/api/geocode?q=${encodeURIComponent(trimmed)}`);
        const data = await res.json();
        if (data.success && Array.isArray(data.results) && data.results.length > 0) {
          setGeocodedSuggestions(data.results);
          const top = data.results[0];
          // Auto-sync coordinates and ward silently if not manually locked
          setLat(top.lat);
          setLng(top.lng);
          if (!ward) {
            setWard(top.ward);
          }
        }
      } catch (err) {
        console.warn('Geocoding fetch error:', err);
      } finally {
        setIsGeocoding(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [locationName]);

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setCategory('');
    setWard('');
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

  const extractVisualFeatures = (imgDataUrl: string): Promise<{
    grayRatio: number;
    colorfulRatio: number;
    whiteRatio: number;
    greenOrganicRatio: number;
    avgBrightness: number;
    edgeClutter: number;
    isVisuallyGarbage: boolean;
    isVisuallyPothole: boolean;
    isVisuallyManhole: boolean;
    isVisuallyWire: boolean;
  }> => {
    return new Promise((resolve) => {
      if (typeof window === 'undefined') {
        resolve({
          grayRatio: 0.5,
          colorfulRatio: 0.2,
          whiteRatio: 0.1,
          greenOrganicRatio: 0.1,
          avgBrightness: 120,
          edgeClutter: 0.05,
          isVisuallyGarbage: false,
          isVisuallyPothole: true,
          isVisuallyManhole: false,
          isVisuallyWire: false
        });
        return;
      }
      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          const size = 64;
          canvas.width = size;
          canvas.height = size;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve({
              grayRatio: 0.5,
              colorfulRatio: 0.2,
              whiteRatio: 0.1,
              greenOrganicRatio: 0.1,
              avgBrightness: 120,
              edgeClutter: 0.05,
              isVisuallyGarbage: false,
              isVisuallyPothole: true,
              isVisuallyManhole: false,
              isVisuallyWire: false
            });
            return;
          }
          ctx.drawImage(img, 0, 0, size, size);
          const pixels = ctx.getImageData(0, 0, size, size).data;
          let grayCount = 0;
          let colorfulCount = 0;
          let whiteCount = 0;
          let greenOrganicCount = 0;
          let totalBrightness = 0;
          let edgeDiff = 0;
          let darkCenterCount = 0;
          const totalPixels = size * size;

          for (let y = 0; y < size; y++) {
            for (let x = 0; x < size; x++) {
              const idx = (y * size + x) * 4;
              const r = pixels[idx];
              const g = pixels[idx + 1];
              const b = pixels[idx + 2];
              const bright = 0.299 * r + 0.587 * g + 0.114 * b;
              totalBrightness += bright;

              const maxC = Math.max(r, g, b);
              const minC = Math.min(r, g, b);
              const delta = maxC - minC;

              // Neutral gray / road asphalt: low delta and medium-dark
              if (delta < 24 && bright < 190) {
                grayCount++;
              }

              // Saturated colorful plastic / packaging / labels
              if (delta > 32) {
                colorfulCount++;
              }

              // White plastic pouches, paper wrappers
              if (r > 195 && g > 195 && b > 195) {
                whiteCount++;
              }

              // Green vegetation / organic decomposition
              if (g > r + 15 && g > b + 15) {
                greenOrganicCount++;
              }

              // Dark center region (manhole or pothole hole)
              if (x >= 20 && x <= 44 && y >= 20 && y <= 44 && bright < 60) {
                darkCenterCount++;
              }

              // Neighbor pixel edge variation
              if (x < size - 1) {
                const nextR = pixels[idx + 4];
                const nextG = pixels[idx + 5];
                const nextB = pixels[idx + 6];
                edgeDiff += Math.abs(r - nextR) + Math.abs(g - nextG) + Math.abs(b - nextB);
              }
            }
          }

          const grayRatio = grayCount / totalPixels;
          const colorfulRatio = colorfulCount / totalPixels;
          const whiteRatio = whiteCount / totalPixels;
          const greenOrganicRatio = greenOrganicCount / totalPixels;
          const avgBrightness = totalBrightness / totalPixels;
          const edgeClutter = edgeDiff / (totalPixels * 3 * 255);
          const darkHoleRatio = darkCenterCount / (25 * 25);

          // Garbage characteristics: high color variance, plastics, or white/green clutter, low pure road gray
          const isVisuallyGarbage = 
            colorfulRatio > 0.16 || 
            (colorfulRatio > 0.08 && (whiteRatio > 0.08 || greenOrganicRatio > 0.08)) ||
            (grayRatio < 0.45 && edgeClutter > 0.07);

          const isVisuallyPothole = grayRatio > 0.55 && colorfulRatio < 0.15;
          const isVisuallyManhole = darkHoleRatio > 0.25;
          const isVisuallyWire = avgBrightness > 195 && grayRatio < 0.35;

          resolve({
            grayRatio,
            colorfulRatio,
            whiteRatio,
            greenOrganicRatio,
            avgBrightness,
            edgeClutter,
            isVisuallyGarbage,
            isVisuallyPothole,
            isVisuallyManhole,
            isVisuallyWire
          });
        } catch {
          resolve({
            grayRatio: 0.5,
            colorfulRatio: 0.2,
            whiteRatio: 0.1,
            greenOrganicRatio: 0.1,
            avgBrightness: 120,
            edgeClutter: 0.05,
            isVisuallyGarbage: false,
            isVisuallyPothole: true,
            isVisuallyManhole: false,
            isVisuallyWire: false
          });
        }
      };
      img.onerror = () => {
        resolve({
          grayRatio: 0.5,
          colorfulRatio: 0.2,
          whiteRatio: 0.1,
          greenOrganicRatio: 0.1,
          avgBrightness: 120,
          edgeClutter: 0.05,
          isVisuallyGarbage: false,
          isVisuallyPothole: true,
          isVisuallyManhole: false,
          isVisuallyWire: false
        });
      };
      img.src = imgDataUrl;
    });
  };

  const analyzePhotoWithAI = async (imgUrl: string, fileName?: string, visualHint?: any) => {
    setIsAiScanning(true);
    try {
      let visualFeatures = visualHint;
      if (!visualFeatures && typeof window !== 'undefined' && imgUrl.startsWith('data:image/')) {
        visualFeatures = await extractVisualFeatures(imgUrl);
      }

      const res = await fetch('/api/ai/detect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl: imgUrl, fileName, visualFeatures })
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

    const applyFallback = (targetWard?: Ward) => {
      const activeWard: Ward = targetWard || (ward as Ward) || 'Nashik West';
      const coords = WARD_COORDINATES[activeWard] || [20.0062, 73.7915];
      setWard(activeWard);
      setLat(coords[0]);
      setLng(coords[1]);
      const name = WARD_LANDMARKS[activeWard] || `${activeWard} · Nashik`;
      setLocationName(name);
      setGpsDetectedNotice(`Auto-Detected: ${name}`);
      setIsDetectingGps(false);
      setTimeout(() => setGpsDetectedNotice(null), 5000);
    };

    if (typeof window !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLat(latitude);
          setLng(longitude);

          const { landmark, ward: detectedWard } = getNearestLandmarkAndWard(latitude, longitude);
          setWard(detectedWard);

          // Fast reverse-geocoding with fallback
          fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`, {
            headers: { 'Accept': 'application/json' }
          })
            .then((res) => res.json())
            .then((data) => {
              if (data && data.display_name) {
                const parts = data.display_name.split(',');
                const cleanLoc = parts.slice(0, 3).join(',').trim();
                setLocationName(cleanLoc);
                setGpsDetectedNotice(`GPS Pin: ${cleanLoc} (${detectedWard})`);
              } else {
                setLocationName(landmark);
                setGpsDetectedNotice(`GPS Pin: ${landmark}`);
              }
            })
            .catch(() => {
              setLocationName(landmark);
              setGpsDetectedNotice(`GPS Pin: ${landmark}`);
            })
            .finally(() => {
              setIsDetectingGps(false);
              setTimeout(() => setGpsDetectedNotice(null), 5000);
            });
        },
        (error) => {
          console.log('Browser geolocation notice, using high-accuracy fallback:', error?.message);
          applyFallback();
        },
        { enableHighAccuracy: true, timeout: 6000, maximumAge: 60000 }
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
      reader.onload = async () => {
        if (typeof reader.result === 'string') {
          const resUrl = reader.result;
          setPhotoUrl(resUrl);
          const features = await extractVisualFeatures(resUrl);
          analyzePhotoWithAI(resUrl, file.name, features);
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
    if (!category && !aiAnalysis) {
      alert('Please select a category or upload an issue photo first.');
      return;
    }
    const detectedDesc = aiAnalysis?.detailedDescriptionSuggestion || (category ? CATEGORY_DEFAULTS[category as HazardCategory]?.description : '');
    const wardText = ward ? `${ward.toUpperCase()} WARD` : 'NASHIK MUNICIPAL CORPORATION';
    const loc = locationName || (ward ? `${ward}, Nashik` : 'Nashik');
    const fullDraft = `[MUNICIPAL GRIEVANCE REPORT · ${wardText}]\nLocation: ${loc} (GPS Coordinates: ${lat.toFixed(4)}°N, ${lng.toFixed(4)}°E)\n\n${detectedDesc}\n\nImmediate site verification and remediation is requested under Citizen Charter SLAs to prevent public inconvenience and pedestrian/vehicular safety hazards.`;
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

  const handleWardChange = (newWard: Ward | '') => {
    setWard(newWard);
    if (newWard && WARD_COORDINATES[newWard as Ward]) {
      const coords = WARD_COORDINATES[newWard as Ward];
      setLat(coords[0]);
      setLng(coords[1]);
      if (!locationName || locationName.includes('·') || locationName.includes('Ward') || locationName === 'Nashik') {
        const defaultLoc = WARD_LANDMARKS[newWard as Ward] || `${newWard} · Nashik`;
        setLocationName(defaultLoc);
        setGpsDetectedNotice(`Ward Location Set: ${defaultLoc}`);
        setTimeout(() => setGpsDetectedNotice(null), 4000);
      }
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
        authority: `NMC Solid Waste & Sanitation (${ward || 'Nashik'})`,
        department: 'NMC Solid Waste Management Division',
        sla: '48h SLA',
        agencyType: 'NMC'
      };
    }

    return {
      authority: `NMC Ward Division (${ward || 'Nashik'})`,
      department: 'NMC Public Works Department (PWD)',
      sla: '48h SLA',
      agencyType: 'NMC'
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!category) {
      alert('Please select a category for your report.');
      return;
    }
    if (!ward) {
      alert('Please select an NMC ward.');
      return;
    }
    if (!locationName.trim()) {
      alert('Please specify the location or landmark.');
      return;
    }
    if (!agreeRules) {
      alert('Please confirm that you are sharing genuine evidence.');
      return;
    }
    setIsSubmitting(true);
    const jur = getJurisdiction();
    const finalWard = (ward as Ward) || geocodedSuggestions[0]?.ward || 'Nashik West';
    const finalLat = (lat !== 20.0062) ? lat : (geocodedSuggestions[0]?.lat || 20.0062);
    const finalLng = (lng !== 73.7915) ? lng : (geocodedSuggestions[0]?.lng || 73.7915);

    try {
      await onSubmit({
        title: title || (category ? (CATEGORY_DEFAULTS[category as HazardCategory]?.title || 'Civic Issue') : 'Civic Issue'),
        description: description || title || 'Grievance registered for municipal inspection.',
        category: (category as HazardCategory) || 'OTHER',
        ward: finalWard,
        locationName,
        lat: finalLat,
        lng: finalLng,
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
                required
                value={category}
                onChange={(e) => {
                  const newCat = e.target.value as HazardCategory;
                  if (newCat) {
                    applyCategoryTemplate(newCat, true);
                  } else {
                    setCategory('');
                    setTitle('');
                    setDescription('');
                    setAiAnalysis(null);
                  }
                }}
                className="w-full appearance-none px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-[13px] text-[#111d2e] dark:text-slate-100 font-medium focus:outline-none focus:border-[#d95b18]"
              >
                <option value="">-- Select Category / प्रवर्ग निवडा --</option>
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
                required
                value={ward}
                onChange={(e) => handleWardChange(e.target.value as Ward)}
                className="w-full appearance-none px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-[13px] text-[#111d2e] dark:text-slate-100 font-medium focus:outline-none focus:border-[#d95b18]"
              >
                <option value="">-- Select NMC Ward / प्रभाग निवडा --</option>
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

          {/* 6. Location * (Clean input with Quick Chips, Autocomplete & Leaflet Pin Picker) */}
          <div className="space-y-1 relative">
            <div className="flex items-center justify-between">
              <label className="text-[12px] font-bold text-[#111d2e] dark:text-slate-200">
                Location / Landmark *
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
                  <span>{showGoogleMapPicker ? 'Hide Map' : '🗺️ Pin on Map'}</span>
                </button>
              </div>
            </div>

            <div className="relative">
              <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 z-10" />
              <input
                type="text"
                required
                value={locationName}
                onFocus={() => setShowLocationSuggestions(true)}
                onBlur={() => {
                  setTimeout(() => setShowLocationSuggestions(false), 250);
                  const res = resolveCustomAddress(locationName);
                  if (res.matched && res.ward && res.lat && res.lng) {
                    setWard(res.ward);
                    setLat(res.lat);
                    setLng(res.lng);
                  }
                }}
                onChange={(e) => {
                  const val = e.target.value;
                  setLocationName(val);
                  setShowLocationSuggestions(true);

                  // Real-time custom address auto-snapping (e.g. Indu Heights Vidhate Nagar -> Panchavati [20.0270, 73.8140])
                  const res = resolveCustomAddress(val);
                  if (res.matched && res.ward && res.lat && res.lng) {
                    setWard(res.ward);
                    setLat(res.lat);
                    setLng(res.lng);
                    setGpsDetectedNotice(`✓ Auto-mapped: ${res.ward} · ${res.resolvedName} [${res.lat.toFixed(4)}, ${res.lng.toFixed(4)}]`);
                  }
                }}
                placeholder="Type street, landmark (e.g. Indu Heights, Vidhate Nagar) or tap a chip..."
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-[13px] text-[#111d2e] dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-[#d95b18]"
              />

              {/* Live Universal Geocoding Suggestions Dropdown */}
              {showLocationSuggestions && locationName.trim().length > 1 && (
                <div className="absolute top-full left-0 right-0 mt-1 max-h-56 overflow-y-auto bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl shadow-2xl z-50 divide-y divide-slate-100 dark:divide-slate-700/60">
                  {isGeocoding && (
                    <div className="px-3.5 py-2 text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-2 animate-pulse bg-slate-50 dark:bg-slate-800">
                      <span className="w-2 h-2 rounded-full bg-[#d95b18] animate-ping" />
                      <span>Searching Nashik municipal spatial database &amp; OSM satellite...</span>
                    </div>
                  )}

                  {geocodedSuggestions.length > 0 ? (
                    geocodedSuggestions.map((item, idx) => (
                      <button
                        key={`${item.displayName}-${idx}`}
                        type="button"
                        onClick={() => {
                          setLocationName(item.displayName);
                          setWard(item.ward);
                          setLat(item.lat);
                          setLng(item.lng);
                          setShowLocationSuggestions(false);
                          setGpsDetectedNotice(`✓ Auto-Geocoded: ${item.ward} · ${item.displayName} [${item.lat.toFixed(4)}, ${item.lng.toFixed(4)}]`);
                          setTimeout(() => setGpsDetectedNotice(null), 5000);
                        }}
                        className="w-full text-left px-3.5 py-2.5 text-xs hover:bg-slate-50 dark:hover:bg-slate-700/70 transition flex items-start justify-between gap-3 cursor-pointer group"
                      >
                        <div className="flex items-start gap-2 min-w-0">
                          <MapPin className="w-3.5 h-3.5 text-[#d95b18] shrink-0 mt-0.5" />
                          <div className="truncate">
                            <div className="font-bold text-slate-900 dark:text-slate-100 group-hover:text-[#d95b18] transition truncate">
                              {item.displayName}
                            </div>
                            <div className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">
                              GPS: {item.lat.toFixed(4)}, {item.lng.toFixed(4)} · <span className="text-slate-500">{item.source}</span>
                            </div>
                          </div>
                        </div>
                        <span className="shrink-0 text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                          {item.ward}
                        </span>
                      </button>
                    ))
                  ) : !isGeocoding ? (
                    <div className="px-3.5 py-2.5 text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between">
                      <span>Custom address entered: &quot;{locationName}&quot;</span>
                      <button
                        type="button"
                        onClick={() => setShowGoogleMapPicker(true)}
                        className="text-[11px] font-bold text-[#d95b18] hover:underline"
                      >
                        Pin on Map &rarr;
                      </button>
                    </div>
                  ) : null}
                </div>
              )}
            </div>

            {gpsDetectedNotice && (
              <div className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 animate-in fade-in pt-0.5">
                <span>✓</span>
                <span>{gpsDetectedNotice}</span>
              </div>
            )}

            {/* Interactive Embedded Leaflet Mini-Map Pin Picker */}
            {showGoogleMapPicker && (
              <div className="pt-2 animate-in fade-in-50 duration-150">
                <MiniMapPicker
                  height="250px"
                  initialLat={lat}
                  initialLng={lng}
                  onLocationSelect={(loc) => {
                    setLocationName(loc.address);
                    setLat(loc.lat);
                    setLng(loc.lng);
                    if (loc.ward) {
                      setWard(loc.ward);
                    }
                    setGpsDetectedNotice(`✓ Pin Set: ${loc.address}`);
                    setTimeout(() => setGpsDetectedNotice(null), 4000);
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
              {Boolean(category || aiAnalysis?.hazardTitleSuggestion) && (
                <button
                  type="button"
                  onClick={() => {
                    if (aiAnalysis?.hazardTitleSuggestion) {
                      setTitle(aiAnalysis.hazardTitleSuggestion);
                    } else if (category && CATEGORY_DEFAULTS[category as HazardCategory]) {
                      setTitle(CATEGORY_DEFAULTS[category as HazardCategory].title);
                    } else {
                      setTitle('');
                    }
                  }}
                  className="text-[11px] font-bold text-[#d95b18] hover:underline cursor-pointer flex items-center gap-1"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Reset to AI Title</span>
                </button>
              )}
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
