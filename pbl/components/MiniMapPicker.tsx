'use client';

import React, { useEffect, useRef, useState } from 'react';
import type * as LType from 'leaflet';
import { MapPin, Crosshair, Check, Navigation } from 'lucide-react';
import { Ward } from '@/lib/types';
import { WARD_COORDINATES } from '@/lib/mockData';

interface MiniMapPickerProps {
  initialLat: number;
  initialLng: number;
  onLocationSelect: (location: { address: string; lat: number; lng: number; ward?: Ward }) => void;
  height?: string;
}

const NASHIK_LANDMARK_POINTS = [
  { name: 'Indu Heights / Vidhate Nagar, Panchavati', ward: 'Panchavati' as Ward, lat: 20.0270, lng: 73.8140 },
  { name: 'College Road, Near BYK College', ward: 'Nashik West' as Ward, lat: 20.0089, lng: 73.7634 },
  { name: 'Ramkund & Godavari Ghat, Panchavati', ward: 'Panchavati' as Ward, lat: 20.0070, lng: 73.7930 },
  { name: 'Dwarka Circle, Highway Junction', ward: 'Nashik East' as Ward, lat: 19.9880, lng: 73.8050 },
  { name: 'Trimurti Chowk, Pawan Nagar, Cidco', ward: 'Cidco' as Ward, lat: 19.9720, lng: 73.7530 },
  { name: 'Satpur MIDC Industrial Area, Trimbak Road', ward: 'Satpur' as Ward, lat: 19.9980, lng: 73.7420 },
  { name: 'Bytco Point & Station Road, Nashik Road', ward: 'Nashik Road' as Ward, lat: 19.9540, lng: 73.8320 },
  { name: 'Gangapur Road, Near ABB Circle', ward: 'Nashik West' as Ward, lat: 20.0150, lng: 73.7580 },
  { name: 'Canada Corner / Sharanpur Road', ward: 'Nashik West' as Ward, lat: 19.9990, lng: 73.7740 },
  { name: 'City Center Mall / Untwadi', ward: 'Nashik West' as Ward, lat: 19.9910, lng: 73.7590 }
];

export function getNearestLandmarkAndWard(lat: number, lng: number): { landmark: string; ward: Ward } {
  let nearest = NASHIK_LANDMARK_POINTS[0];
  let minDistance = Infinity;

  for (const item of NASHIK_LANDMARK_POINTS) {
    const d = Math.hypot(lat - item.lat, lng - item.lng);
    if (d < minDistance) {
      minDistance = d;
      nearest = item;
    }
  }

  // Also check ward centroids
  let closestWard: Ward = nearest.ward;
  let minWardDist = Infinity;
  for (const [w, coords] of Object.entries(WARD_COORDINATES)) {
    const d = Math.hypot(lat - coords[0], lng - coords[1]);
    if (d < minWardDist) {
      minWardDist = d;
      closestWard = w as Ward;
    }
  }

  const distanceInMeters = Math.round(minDistance * 111000);
  if (distanceInMeters < 350) {
    return { landmark: nearest.name, ward: nearest.ward };
  } else {
    return { 
      landmark: `${closestWard} · Near ${nearest.name} (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
      ward: closestWard 
    };
  }
}

export default function MiniMapPicker({
  initialLat = 20.0062,
  initialLng = 73.7915,
  onLocationSelect,
  height = '240px'
}: MiniMapPickerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LType.Map | null>(null);
  const markerRef = useRef<LType.Marker | null>(null);

  const [currentLat, setCurrentLat] = useState(initialLat);
  const [currentLng, setCurrentLng] = useState(initialLng);
  const [currentAddress, setCurrentAddress] = useState('Panchavati, Nashik');
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function initMap() {
      if (!containerRef.current) return;
      const L = await import('leaflet');

      // Clear previous instance
      if ((containerRef.current as any)._leaflet_id) {
        (containerRef.current as any)._leaflet_id = null;
      }

      if (!isMounted) return;

      const map = L.map(containerRef.current, {
        center: [initialLat, initialLng],
        zoom: 14,
        zoomControl: true
      });

      // OpenStreetMap Tiles (100% Free, No API Key Required, No Watermark)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19
      }).addTo(map);

      // Custom red pin icon
      const pinIcon = L.divIcon({
        className: 'custom-leaflet-pin',
        html: `
          <div style="position: relative; transform: translate(-50%, -100%);">
            <div style="background: #dc2626; color: white; border-radius: 50%; width: 34px; height: 34px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 10px rgba(0,0,0,0.3); border: 2.5px solid #ffffff;">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
                <circle cx="12" cy="10" r="3"></circle>
              </svg>
            </div>
            <div style="width: 8px; height: 8px; background: rgba(0,0,0,0.4); border-radius: 50%; margin: 2px auto 0 auto;"></div>
          </div>
        `,
        iconSize: [34, 42],
        iconAnchor: [17, 42]
      });

      const marker = L.marker([initialLat, initialLng], {
        icon: pinIcon,
        draggable: true
      }).addTo(map);

      const updatePosition = (lat: number, lng: number) => {
        setCurrentLat(lat);
        setCurrentLng(lng);
        const { landmark, ward } = getNearestLandmarkAndWard(lat, lng);
        setCurrentAddress(landmark);
        if (onLocationSelect) {
          onLocationSelect({ address: landmark, lat, lng, ward });
        }
      };

      // Click anywhere to move pin
      map.on('click', (e) => {
        marker.setLatLng(e.latlng);
        updatePosition(e.latlng.lat, e.latlng.lng);
      });

      // Drag pin
      marker.on('dragend', () => {
        const pos = marker.getLatLng();
        updatePosition(pos.lat, pos.lng);
      });

      mapRef.current = map;
      markerRef.current = marker;
      setIsReady(true);
    }

    initMap();

    return () => {
      isMounted = false;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Dynamically pan map and move pin when citizen enters a new geocoded address
  useEffect(() => {
    if (mapRef.current && markerRef.current && isReady && initialLat && initialLng) {
      const cur = markerRef.current.getLatLng();
      if (Math.hypot(cur.lat - initialLat, cur.lng - initialLng) > 0.0001) {
        markerRef.current.setLatLng([initialLat, initialLng]);
        mapRef.current.setView([initialLat, initialLng], 15);
        setCurrentLat(initialLat);
        setCurrentLng(initialLng);
      }
    }
  }, [initialLat, initialLng, isReady]);

  const handleCenterOnWard = (ward: Ward) => {
    const coords = WARD_COORDINATES[ward];
    if (coords && mapRef.current && markerRef.current) {
      mapRef.current.setView(coords, 14);
      markerRef.current.setLatLng(coords);
      setCurrentLat(coords[0]);
      setCurrentLng(coords[1]);
      const { landmark, ward: foundWard } = getNearestLandmarkAndWard(coords[0], coords[1]);
      setCurrentAddress(landmark);
      if (onLocationSelect) {
        onLocationSelect({ address: landmark, lat: coords[0], lng: coords[1], ward: foundWard });
      }
    }
  };

  return (
    <div className="rounded-xl border border-slate-300 dark:border-slate-700 overflow-hidden bg-white dark:bg-slate-900 shadow-sm">
      {/* Mini-map Instructions Header */}
      <div className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between text-[11px]">
        <div className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-200">
          <MapPin className="w-3.5 h-3.5 text-red-600" />
          <span>Click anywhere on the map or drag pin to set location:</span>
        </div>
        <span className="font-mono text-[10px] text-slate-400">
          {currentLat.toFixed(4)}, {currentLng.toFixed(4)}
        </span>
      </div>

      {/* Map Canvas Container */}
      <div ref={containerRef} style={{ height, width: '100%' }} className="relative z-0" />

      {/* Quick Ward Centering Chips */}
      <div className="p-2 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-700 space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            Quick Jump to Ward:
          </span>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold truncate max-w-[200px]">
            Selected: {currentAddress}
          </span>
        </div>
        <div className="flex items-center gap-1 overflow-x-auto pb-0.5 no-scrollbar">
          {(['Panchavati', 'Nashik West', 'Nashik East', 'Cidco', 'Satpur', 'Nashik Road'] as Ward[]).map((w) => (
            <button
              key={w}
              type="button"
              onClick={() => handleCenterOnWard(w)}
              className="px-2 py-0.5 rounded text-[10px] font-semibold bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:bg-[#d95b18] hover:text-white hover:border-[#d95b18] transition cursor-pointer whitespace-nowrap"
            >
              {w}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
