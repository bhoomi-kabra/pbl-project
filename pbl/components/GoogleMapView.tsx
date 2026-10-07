'use client';

import React, { useEffect, useRef, useState } from 'react';
import { 
  Search, 
  MapPin, 
  Layers, 
  Compass, 
  Key, 
  Check, 
  Copy, 
  Satellite,
  Map as MapIcon,
  X,
  Navigation
} from 'lucide-react';
import type * as LType from 'leaflet';

interface GoogleMapViewProps {
  initialLat?: number;
  initialLng?: number;
  initialZoom?: number;
  onLocationSelect?: (location: { address: string; lat: number; lng: number }) => void;
  height?: string;
  showCardWrapper?: boolean;
}

const NASHIK_QUICK_LANDMARKS = [
  { name: 'Panchavati (Ramkund / Godavari)', lat: 20.0062, lng: 73.7915 },
  { name: 'College Road, Nashik West', lat: 20.0125, lng: 73.7628 },
  { name: 'Mumbai Naka / Dwarka Junction', lat: 19.9880, lng: 73.7850 },
  { name: 'Trimurti Chowk, Cidco', lat: 19.9720, lng: 73.7530 },
  { name: 'Satpur MIDC Industrial Area', lat: 19.9980, lng: 73.7220 },
  { name: 'Nashik Road Railway Station', lat: 19.9540, lng: 73.8320 },
  { name: 'Gangapur Road, Anandwalli', lat: 20.0210, lng: 73.7510 }
];

export default function GoogleMapView({
  initialLat = 19.9975, // Nashik center
  initialLng = 73.7898,
  initialZoom = 14,
  onLocationSelect,
  height = '500px',
  showCardWrapper = true
}: GoogleMapViewProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Fallback Leaflet instances for real satellite photos when no Google key is provided
  const leafletMapRef = useRef<LType.Map | null>(null);
  const leafletMarkerRef = useRef<LType.Marker | null>(null);
  const leafletTilesRef = useRef<LType.TileLayer | null>(null);
  const leafletLabelsRef = useRef<LType.TileLayer | null>(null);

  // Google Maps instances
  const [googleMap, setGoogleMap] = useState<google.maps.Map | null>(null);
  const [googleMarker, setGoogleMarker] = useState<google.maps.Marker | null>(null);

  const [currentMapType, setCurrentMapType] = useState<'roadmap' | 'satellite' | 'hybrid'>('satellite');

  const [selectedCoordinates, setSelectedCoordinates] = useState<{
    lat: number;
    lng: number;
    address: string;
  }>({
    lat: initialLat,
    lng: initialLng,
    address: 'Panchavati, Nashik, Maharashtra'
  });

  const [apiKey, setApiKey] = useState<string>('');
  const [isGoogleLoaded, setIsGoogleLoaded] = useState<boolean>(false);
  const [showKeyModal, setShowKeyModal] = useState<boolean>(false);
  const [copiedCoords, setCopiedCoords] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  // 1. Check for Google Maps Key
  useEffect(() => {
    const envKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    const storedKey = typeof window !== 'undefined' ? localStorage.getItem('nashik_gmaps_key') : null;
    const defaultKey = 'AIzaSyBJVcOQfDjSIugpweJvpE3qtiHJvWgy4XA';
    const activeKey = envKey || storedKey || defaultKey;
    setApiKey(activeKey);
  }, []);

  // 2. If API Key is present, load Google Maps SDK
  useEffect(() => {
    if (!apiKey) return;

    // Suppress Next.js dev overlay crash on Google Cloud BillingNotEnabledMapError
    const originalConsoleError = console.error;
    console.error = (...args: any[]) => {
      const errorMsg = args[0] ? String(args[0]) : '';
      if (errorMsg.includes('BillingNotEnabledMapError') || errorMsg.includes('billing-not-enabled-map-error')) {
        console.warn('Google Cloud Notice: Billing is not enabled. Automatically falling back to High-Res Satellite GIS mode.');
        setIsGoogleLoaded(false);
        if (mapContainerRef.current) {
          mapContainerRef.current.innerHTML = '';
        }
        return;
      }
      originalConsoleError.apply(console, args);
    };

    if ((window as any).google && (window as any).google.maps) {
      setIsGoogleLoaded(true);
      return;
    }

    (window as any).gm_authFailure = () => {
      console.warn('Google Maps authentication warning - fallback satellite map will continue to operate smoothly.');
      setIsGoogleLoaded(false);
      if (mapContainerRef.current) {
        mapContainerRef.current.innerHTML = '';
      }
    };

    const existingScript = document.getElementById('google-maps-script');
    if (existingScript) {
      if ((window as any).google?.maps) setIsGoogleLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.id = 'google-maps-script';
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => setIsGoogleLoaded(true);
    script.onerror = () => {
      console.warn('Google Maps script failed to load, falling back to satellite imagery.');
      setIsGoogleLoaded(false);
    };
    document.head.appendChild(script);

    return () => {
      console.error = originalConsoleError;
    };
  }, [apiKey]);

  // 3A. Initialize Real Photorealistic Satellite Map (When no Google key is provided)
  useEffect(() => {
    if (isGoogleLoaded) return; // Google Maps handles it
    if (!mapContainerRef.current) return;
    if (typeof window === 'undefined') return;

    let isMounted = true;

    async function initLeafletSatellite() {
      const L = await import('leaflet');

      if (!isMounted || !mapContainerRef.current) return;

      if ((mapContainerRef.current as any)._leaflet_id) {
        (mapContainerRef.current as any)._leaflet_id = null;
      }

      const map = L.map(mapContainerRef.current, {
        center: [initialLat, initialLng],
        zoom: initialZoom,
        zoomControl: false
      });

      L.control.zoom({ position: 'bottomright' }).addTo(map);

      // Ultra High-Resolution Photorealistic Satellite Tiles (Esri World Imagery)
      const satelliteLayer = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        {
          attribution: '&copy; Esri World Imagery, NASA, USGS',
          maxZoom: 19
        }
      ).addTo(map);

      // Boundaries & Roads overlay
      const labelsLayer = L.tileLayer(
        'https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',
        {
          attribution: '&copy; Esri',
          maxZoom: 19
        }
      ).addTo(map);

      leafletTilesRef.current = satelliteLayer;
      leafletLabelsRef.current = labelsLayer;

      // Custom Glowing Orange Civic Location Pin
      const pinIcon = L.divIcon({
        className: 'custom-civic-pin',
        html: `
          <div style="position: relative; width: 32px; height: 32px;">
            <div style="position: absolute; width: 32px; height: 32px; background: rgba(217, 91, 24, 0.25); border-radius: 50%; animation: ping 1.8s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
            <div style="position: absolute; top: 4px; left: 4px; width: 24px; height: 24px; background: #d95b18; border: 3px solid #ffffff; border-radius: 50%; box-shadow: 0 4px 10px rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center;">
              <div style="width: 6px; height: 6px; background: white; border-radius: 50%;"></div>
            </div>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      });

      const marker = L.marker([initialLat, initialLng], {
        icon: pinIcon,
        draggable: true
      }).addTo(map);

      marker.bindTooltip('📍 Selected Civic Hazard Spot', { permanent: false, direction: 'top' });

      leafletMapRef.current = map;
      leafletMarkerRef.current = marker;

      // Click to pin on map
      map.on('click', async (e: LType.LeafletMouseEvent) => {
        const { lat, lng } = e.latlng;
        marker.setLatLng(e.latlng);

        // Reverse geocoding lookup
        let resolvedAddress = `Nashik (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`);
          const data = await res.json();
          if (data && data.display_name) {
            resolvedAddress = data.display_name.split(',').slice(0, 3).join(',');
          }
        } catch {
          // fallback
        }

        setSelectedCoordinates({ lat, lng, address: resolvedAddress });
        if (inputRef.current) inputRef.current.value = resolvedAddress;
        if (onLocationSelect) {
          onLocationSelect({ address: resolvedAddress, lat, lng });
        }
      });

      // Drag pin listener
      marker.on('dragend', async () => {
        const pos = marker.getLatLng();
        const lat = pos.lat;
        const lng = pos.lng;

        let resolvedAddress = `Nashik (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`);
          const data = await res.json();
          if (data && data.display_name) {
            resolvedAddress = data.display_name.split(',').slice(0, 3).join(',');
          }
        } catch {}

        setSelectedCoordinates({ lat, lng, address: resolvedAddress });
        if (inputRef.current) inputRef.current.value = resolvedAddress;
        if (onLocationSelect) {
          onLocationSelect({ address: resolvedAddress, lat, lng });
        }
      });
    }

    initLeafletSatellite();

    return () => {
      isMounted = false;
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
  }, [isGoogleLoaded, initialLat, initialLng, initialZoom]);

  // 3B. Initialize Google Maps Platform (If valid key is provided)
  useEffect(() => {
    if (!isGoogleLoaded || !mapContainerRef.current || !inputRef.current) return;
    if (typeof google === 'undefined' || !google.maps) return;

    const defaultLocation: google.maps.LatLngLiteral = { lat: initialLat, lng: initialLng };

    const map = new google.maps.Map(mapContainerRef.current, {
      center: defaultLocation,
      zoom: initialZoom,
      mapTypeId: google.maps.MapTypeId.HYBRID,
      mapTypeControl: false,
      streetViewControl: true,
      fullscreenControl: true,
      zoomControl: true
    });

    const autocomplete = new google.maps.places.Autocomplete(inputRef.current, {
      fields: ['geometry', 'formatted_address', 'name'],
    });
    autocomplete.bindTo('bounds', map);

    const marker = new google.maps.Marker({
      map: map,
      position: defaultLocation,
      draggable: true,
      animation: google.maps.Animation.DROP
    });

    setGoogleMap(map);
    setGoogleMarker(marker);

    autocomplete.addListener('place_changed', () => {
      const place: google.maps.places.PlaceResult = autocomplete.getPlace();
      if (!place.geometry || !place.geometry.location) return;

      const latitude = place.geometry.location.lat();
      const longitude = place.geometry.location.lng();
      const address = place.formatted_address || place.name || 'Selected Location';

      setSelectedCoordinates({ lat: latitude, lng: longitude, address });
      if (onLocationSelect) onLocationSelect({ address, lat: latitude, lng: longitude });

      if (place.geometry.viewport) {
        map.fitBounds(place.geometry.viewport);
      } else {
        map.setCenter(place.geometry.location);
        map.setZoom(17);
      }
      marker.setPosition(place.geometry.location);
    });

    map.addListener('click', (e: google.maps.MapMouseEvent) => {
      if (e.latLng) {
        const lat = e.latLng.lat();
        const lng = e.latLng.lng();
        marker.setPosition(e.latLng);

        const geocoder = new google.maps.Geocoder();
        geocoder.geocode({ location: e.latLng }, (results, status) => {
          const address = (status === 'OK' && results && results[0]) 
            ? results[0].formatted_address 
            : `Nashik (${lat.toFixed(4)}, ${lng.toFixed(4)})`;

          setSelectedCoordinates({ lat, lng, address });
          if (inputRef.current) inputRef.current.value = address;
          if (onLocationSelect) onLocationSelect({ address, lat, lng });
        });
      }
    });
  }, [isGoogleLoaded, initialLat, initialLng, initialZoom]);

  // Switch Layer Types (Satellite vs Roadmap vs Hybrid)
  const handleMapTypeChange = async (type: 'roadmap' | 'satellite' | 'hybrid') => {
    setCurrentMapType(type);

    if (googleMap && typeof google !== 'undefined') {
      if (type === 'satellite') googleMap.setMapTypeId(google.maps.MapTypeId.SATELLITE);
      else if (type === 'hybrid') googleMap.setMapTypeId(google.maps.MapTypeId.HYBRID);
      else googleMap.setMapTypeId(google.maps.MapTypeId.ROADMAP);
      return;
    }

    if (leafletMapRef.current) {
      const L = await import('leaflet');
      const map = leafletMapRef.current;

      if (leafletTilesRef.current) map.removeLayer(leafletTilesRef.current);
      if (leafletLabelsRef.current) map.removeLayer(leafletLabelsRef.current);

      if (type === 'roadmap') {
        leafletTilesRef.current = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19
        }).addTo(map);
      } else if (type === 'satellite') {
        leafletTilesRef.current = L.tileLayer(
          'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
          { maxZoom: 19 }
        ).addTo(map);
      } else {
        // Hybrid: Satellite + Boundaries
        leafletTilesRef.current = L.tileLayer(
          'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
          { maxZoom: 19 }
        ).addTo(map);
        leafletLabelsRef.current = L.tileLayer(
          'https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',
          { maxZoom: 19 }
        ).addTo(map);
      }
    }
  };

  // Fly to selected landmark
  const handleSelectLandmark = (item: { name: string; lat: number; lng: number }) => {
    setSelectedCoordinates({ lat: item.lat, lng: item.lng, address: item.name });
    if (inputRef.current) inputRef.current.value = item.name;
    setSearchQuery(item.name);
    setShowSuggestions(false);

    if (onLocationSelect) {
      onLocationSelect({ address: item.name, lat: item.lat, lng: item.lng });
    }

    if (googleMap) {
      googleMap.setCenter({ lat: item.lat, lng: item.lng });
      googleMap.setZoom(16);
      if (googleMarker) googleMarker.setPosition({ lat: item.lat, lng: item.lng });
    } else if (leafletMapRef.current) {
      leafletMapRef.current.setView([item.lat, item.lng], 16);
      if (leafletMarkerRef.current) leafletMarkerRef.current.setLatLng([item.lat, item.lng]);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(`${selectedCoordinates.lat.toFixed(6)}, ${selectedCoordinates.lng.toFixed(6)}`);
    setCopiedCoords(true);
    setTimeout(() => setCopiedCoords(false), 2000);
  };

  const handleSaveApiKey = (key: string) => {
    setApiKey(key.trim());
    localStorage.setItem('nashik_gmaps_key', key.trim());
    setShowKeyModal(false);
  };

  return (
    <div className={`space-y-3 ${showCardWrapper ? 'p-4 sm:p-5 rounded-3xl bg-white dark:bg-[#0c1322] border border-slate-200/90 dark:border-slate-800 shadow-sm' : ''}`}>
      
      {/* Search Bar + Satellite / Map View Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
        
        {/* Search Input with Quick Landmark Suggestions */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            id="pac-input"
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            placeholder="Search address, landmark, or junction in Nashik..."
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-[#d95b18] transition shadow-2xs"
          />

          {/* Quick Landmark Dropdown */}
          {showSuggestions && (
            <div className="absolute left-0 right-0 top-full mt-1.5 z-30 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl p-1.5 max-h-56 overflow-y-auto">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1">
                Popular Nashik Locations
              </div>
              {NASHIK_QUICK_LANDMARKS.filter(l => l.name.toLowerCase().includes(searchQuery.toLowerCase())).map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectLandmark(item)}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-medium text-slate-800 dark:text-slate-200 transition"
                >
                  <MapPin className="w-3.5 h-3.5 text-[#d95b18] shrink-0" />
                  <span className="truncate">{item.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* View Switcher: Satellite vs Hybrid vs Street Map */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900 p-1 rounded-2xl border border-slate-200 dark:border-slate-800 self-start sm:self-auto shrink-0">
          <button
            type="button"
            onClick={() => handleMapTypeChange('satellite')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold transition ${
              currentMapType === 'satellite'
                ? 'bg-white dark:bg-slate-800 text-[#d95b18] shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Satellite className="w-3.5 h-3.5" />
            <span>Satellite</span>
          </button>

          <button
            type="button"
            onClick={() => handleMapTypeChange('hybrid')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold transition ${
              currentMapType === 'hybrid'
                ? 'bg-white dark:bg-slate-800 text-[#d95b18] shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Hybrid</span>
          </button>

          <button
            type="button"
            onClick={() => handleMapTypeChange('roadmap')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold transition ${
              currentMapType === 'roadmap'
                ? 'bg-white dark:bg-slate-800 text-[#d95b18] shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <MapIcon className="w-3.5 h-3.5" />
            <span>Street</span>
          </button>
        </div>
      </div>

      {/* Map Canvas Container */}
      <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-inner">
        <div 
          id="map" 
          ref={mapContainerRef} 
          style={{ height, width: '100%' }} 
          className="bg-slate-900 cursor-crosshair"
        />

        {/* Live GPS Coordinates & Selected Location Badge */}
        <div className="absolute bottom-3 left-3 right-3 sm:right-auto z-10 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-2.5 rounded-xl border border-slate-200/90 dark:border-slate-800 shadow-lg flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 truncate">
            <div className="w-2.5 h-2.5 rounded-full bg-[#d95b18] animate-ping shrink-0" />
            <div className="truncate">
              <div className="font-mono font-bold text-slate-900 dark:text-slate-100 text-[11px]">
                {selectedCoordinates.lat.toFixed(5)}, {selectedCoordinates.lng.toFixed(5)}
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate max-w-[220px]">
                {selectedCoordinates.address}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleCopy}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-800 transition shrink-0"
            title="Copy Coordinates"
          >
            {copiedCoords ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>

        {/* Optional Google Key Config Button in Corner */}
        <button
          type="button"
          onClick={() => setShowKeyModal(true)}
          className="absolute top-3 right-3 z-10 p-2 rounded-xl bg-white/85 dark:bg-slate-900/85 backdrop-blur-sm border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-[#d95b18] transition text-[11px] font-bold flex items-center gap-1 shadow-sm"
          title="Google Cloud Key Settings (Optional)"
        >
          <Key className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">{apiKey ? 'Google API Connected' : 'Google Key'}</span>
        </button>
      </div>

      {/* Helpful Hint */}
      <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
        <span className="flex items-center gap-1">
          <Navigation className="w-3 h-3 text-[#d95b18]" />
          <span>Click anywhere on the satellite map or drag the pin to select the exact location.</span>
        </span>
        <span className="hidden sm:inline font-medium">Real-time Satellite Imagery Active</span>
      </div>

      {/* Optional Google Cloud API Key Modal */}
      {showKeyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-sm text-[#111d2e] dark:text-slate-100">
                <Key className="w-4 h-4 text-[#d95b18]" />
                <span>Google Maps Platform API Key</span>
              </div>
              <button onClick={() => setShowKeyModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              To use official Google Places Autocomplete instead of OpenStreetMap, enter your key from <b>console.cloud.google.com</b>. (The satellite map is already fully functional without it).
            </p>

            <div className="space-y-2">
              <input
                type="password"
                defaultValue={apiKey}
                placeholder="AIzaSy..."
                id="gmaps-key-input"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-xs font-mono text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#d95b18]"
              />
              <button
                type="button"
                onClick={() => {
                  const input = document.getElementById('gmaps-key-input') as HTMLInputElement;
                  if (input) handleSaveApiKey(input.value);
                }}
                className="w-full py-2.5 rounded-xl bg-[#d95b18] hover:bg-[#c24e12] text-white font-bold text-xs transition"
              >
                Save & Connect Key
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
