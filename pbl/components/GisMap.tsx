'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useApp } from '@/lib/AppContext';
import { Ticket, RoadProject, Ward } from '@/lib/types';
import { NASHIK_CENTER, WARD_COORDINATES } from '@/lib/mockData';
import { 
  Clock, 
  HardHat, 
  MapPin, 
  Layers, 
  Search, 
  ChevronRight, 
  PanelRightClose, 
  PanelRightOpen,
  Satellite,
  Map as MapIcon,
  X,
  Compass,
  AlertTriangle
} from 'lucide-react';
import type * as LType from 'leaflet';

interface GisMapProps {
  tickets: Ticket[];
  projects: RoadProject[];
  onSelectTicket?: (ticketId: string) => void;
  onOpenReportModal?: (location?: { address: string; lat: number; lng: number }) => void;
}

const WARDS: Ward[] = [
  'Panchavati',
  'Nashik East',
  'Nashik West',
  'Cidco',
  'Satpur',
  'Nashik Road'
];

const NASHIK_QUICK_LANDMARKS = [
  { name: 'Panchavati (Ramkund / Godavari)', lat: 20.0062, lng: 73.7915 },
  { name: 'College Road, Nashik West', lat: 20.0125, lng: 73.7628 },
  { name: 'Mumbai Naka / Dwarka Junction', lat: 19.9880, lng: 73.7850 },
  { name: 'Trimurti Chowk, Cidco', lat: 19.9720, lng: 73.7530 },
  { name: 'Satpur MIDC Industrial Area', lat: 19.9980, lng: 73.7220 },
  { name: 'Nashik Road Railway Station', lat: 19.9540, lng: 73.8320 },
  { name: 'Gangapur Road, Anandwalli', lat: 20.0210, lng: 73.7510 }
];

export default function GisMap({ tickets, projects, onSelectTicket, onOpenReportModal }: GisMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const { selectedWard, setSelectedWard } = useApp();
  const [layerFilter, setLayerFilter] = useState<'ALL' | 'PROJECTS' | 'HAZARDS'>('ALL');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [searchProjectQuery, setSearchProjectQuery] = useState('');
  const [showDrawer, setShowDrawer] = useState(true);
  const [mapType, setMapType] = useState<'hybrid' | 'satellite' | 'roadmap'>('hybrid');

  // Google Maps state
  const [isGoogleMapsReady, setIsGoogleMapsReady] = useState(false);
  const googleMapRef = useRef<google.maps.Map | null>(null);
  const googleMarkersRef = useRef<google.maps.Marker[]>([]);
  const googleCirclesRef = useRef<google.maps.Circle[]>([]);
  const googleInfoWindowRef = useRef<google.maps.InfoWindow | null>(null);
  const userPinMarkerRef = useRef<google.maps.Marker | null>(null);

  // Leaflet fallback state (high-res satellite imagery if Google script is loading/blocked)
  const leafletMapRef = useRef<LType.Map | null>(null);
  const leafletMarkersRef = useRef<LType.LayerGroup | null>(null);
  const leafletUserPinRef = useRef<LType.Marker | null>(null);

  // Search & landmark dropdown
  const [searchQuery, setSearchQuery] = useState('');
  const [showLandmarkSuggestions, setShowLandmarkSuggestions] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<{
    lat: number;
    lng: number;
    address: string;
  } | null>(null);

  // Expose ticket inspector globally for HTML InfoWindows
  useEffect(() => {
    (window as any).inspectCivicTicket = (ticketId: string) => {
      if (onSelectTicket) onSelectTicket(ticketId);
    };
    (window as any).selectGisProject = (projectId: string) => {
      setSelectedProjectId(projectId);
      setShowDrawer(true);
    };
    return () => {
      delete (window as any).inspectCivicTicket;
      delete (window as any).selectGisProject;
    };
  }, [onSelectTicket]);

  // 1. Load Google Maps SDK with billing safety catch
  useEffect(() => {
    // Suppress Next.js dev overlay crash on Google Cloud BillingNotEnabledMapError
    const originalConsoleError = console.error;
    console.error = (...args: any[]) => {
      const errorMsg = args[0] ? String(args[0]) : '';
      if (errorMsg.includes('BillingNotEnabledMapError') || errorMsg.includes('billing-not-enabled-map-error')) {
        console.warn('Google Cloud Notice: Billing is not enabled on this Google Cloud project. Automatically falling back to High-Res Satellite GIS mode.');
        setIsGoogleMapsReady(false);
        if (mapContainerRef.current) {
          mapContainerRef.current.innerHTML = '';
        }
        return;
      }
      originalConsoleError.apply(console, args);
    };

    (window as any).gm_authFailure = () => {
      console.warn('Google Maps authentication warning - fallback satellite map will continue to operate smoothly.');
      setIsGoogleMapsReady(false);
      if (mapContainerRef.current) {
        mapContainerRef.current.innerHTML = '';
      }
    };

    const envKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    const storedKey = typeof window !== 'undefined' ? localStorage.getItem('nashik_gmaps_key') : null;
    const defaultKey = 'AIzaSyBJVcOQfDjSIugpweJvpE3qtiHJvWgy4XA';
    const activeKey = envKey || storedKey || defaultKey;

    if (!activeKey) return;

    if ((window as any).google && (window as any).google.maps) {
      setIsGoogleMapsReady(true);
      return;
    }

    const existingScript = document.getElementById('google-maps-script');
    if (existingScript) {
      if ((window as any).google?.maps) setIsGoogleMapsReady(true);
      return;
    }

    const script = document.createElement('script');
    script.id = 'google-maps-script';
    script.src = `https://maps.googleapis.com/maps/api/js?key=${activeKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => setIsGoogleMapsReady(true);
    script.onerror = () => {
      console.warn('Google Maps SDK could not be loaded; using high-res satellite GIS fallback.');
      setIsGoogleMapsReady(false);
    };
    document.head.appendChild(script);

    return () => {
      console.error = originalConsoleError;
    };
  }, []);

  // 2A. Initialize Google Maps (Unified Platform)
  useEffect(() => {
    if (!isGoogleMapsReady || !mapContainerRef.current) return;
    if (typeof google === 'undefined' || !google.maps) return;

    // Destroy any fallback leaflet map if existing in the container
    if (leafletMapRef.current) {
      leafletMapRef.current.remove();
      leafletMapRef.current = null;
    }
    if ((mapContainerRef.current as any)._leaflet_id) {
      (mapContainerRef.current as any)._leaflet_id = null;
    }

    const map = new google.maps.Map(mapContainerRef.current, {
      center: { lat: NASHIK_CENTER.lat, lng: NASHIK_CENTER.lng },
      zoom: NASHIK_CENTER.zoom,
      mapTypeId: google.maps.MapTypeId.HYBRID,
      mapTypeControl: false,
      streetViewControl: true,
      fullscreenControl: true,
      zoomControl: true,
    });

    const infoWindow = new google.maps.InfoWindow();
    googleInfoWindowRef.current = infoWindow;
    googleMapRef.current = map;

    // Initialize Autocomplete if search input is attached
    if (searchInputRef.current) {
      const autocomplete = new google.maps.places.Autocomplete(searchInputRef.current, {
        fields: ['geometry', 'formatted_address', 'name'],
      });
      autocomplete.bindTo('bounds', map);
      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();
        if (!place.geometry || !place.geometry.location) return;
        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();
        const addr = place.name || place.formatted_address || 'Nashik Location';

        map.panTo({ lat, lng });
        map.setZoom(16);
        placeUserPinGoogle(lat, lng, addr);
      });
    }

    // Click anywhere to drop pin & select location
    map.addListener('click', (e: google.maps.MapMouseEvent) => {
      if (!e.latLng) return;
      const lat = e.latLng.lat();
      const lng = e.latLng.lng();
      placeUserPinGoogle(lat, lng, `Nashik Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`);
    });

    // Draw NMC Ward circles
    Object.entries(WARD_COORDINATES).forEach(([wardName, coords]) => {
      const circle = new google.maps.Circle({
        strokeColor: '#f59e0b',
        strokeOpacity: 0.85,
        strokeWeight: 1.5,
        fillColor: '#f59e0b',
        fillOpacity: 0.08,
        map: map,
        center: { lat: coords[0], lng: coords[1] },
        radius: 1800,
      });

      circle.addListener('click', () => {
        infoWindow.setContent(`
          <div style="font-family: system-ui; padding: 4px;">
            <b style="color: #111d2e; font-size: 13px;">${wardName} Ward</b>
            <div style="font-size: 11px; color: #64748b;">NMC Administrative Boundary Zone</div>
          </div>
        `);
        infoWindow.setPosition({ lat: coords[0], lng: coords[1] });
        infoWindow.open(map);
      });

      googleCirclesRef.current.push(circle);
    });

    return () => {
      googleMarkersRef.current.forEach((m) => m.setMap(null));
      googleMarkersRef.current = [];
      googleCirclesRef.current.forEach((c) => c.setMap(null));
      googleCirclesRef.current = [];
    };
  }, [isGoogleMapsReady]);

  // Helper: Place User Pin on Google Map
  const placeUserPinGoogle = (lat: number, lng: number, address: string) => {
    if (!googleMapRef.current) return;
    const map = googleMapRef.current;

    if (userPinMarkerRef.current) {
      userPinMarkerRef.current.setMap(null);
    }

    const pin = new google.maps.Marker({
      position: { lat, lng },
      map: map,
      animation: google.maps.Animation.DROP,
      icon: {
        path: google.maps.SymbolPath.BACKWARD_CLOSED_ARROW,
        scale: 6,
        fillColor: '#d95b18',
        fillOpacity: 1,
        strokeColor: '#ffffff',
        strokeWeight: 2,
      },
    });

    userPinMarkerRef.current = pin;
    setSelectedLocation({ lat, lng, address });

    const info = new google.maps.InfoWindow({
      content: `
        <div style="font-family: system-ui; padding: 4px; min-width: 180px;">
          <div style="font-weight: 800; color: #111d2e; font-size: 12px; margin-bottom: 2px;">📍 Selected Spot</div>
          <div style="font-size: 11px; color: #64748b; margin-bottom: 6px;">${address}</div>
          <button 
            onclick="window.reportHazardAtLocation && window.reportHazardAtLocation(${lat}, ${lng}, '${address.replace(/'/g, "\\'")}')"
            style="width: 100%; padding: 6px 10px; background-color: #d95b18; color: white; border: none; border-radius: 8px; font-weight: bold; font-size: 11px; cursor: pointer;"
          >
            Report Hazard Here
          </button>
        </div>
      `,
    });
    info.open(map, pin);
  };

  // 2B. Fallback Leaflet Photorealistic Satellite (If Google Maps is not loaded)
  useEffect(() => {
    if (isGoogleMapsReady || !mapContainerRef.current) return;

    let isMounted = true;
    async function initLeaflet() {
      const L = (await import('leaflet')).default;
      if (!isMounted || !mapContainerRef.current) return;

      if ((mapContainerRef.current as any)._leaflet_id) {
        (mapContainerRef.current as any)._leaflet_id = null;
      }

      const map = L.map(mapContainerRef.current, {
        center: [NASHIK_CENTER.lat, NASHIK_CENTER.lng],
        zoom: NASHIK_CENTER.zoom,
        zoomControl: false,
      });

      L.control.zoom({ position: 'bottomright' }).addTo(map);

      // High-resolution photorealistic satellite imagery (Esri World Imagery)
      L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: '&copy; Esri World Imagery, NASA',
        maxZoom: 19,
      }).addTo(map);

      // Street & place labels overlay
      L.tileLayer('https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}', {
        attribution: '&copy; Esri',
        maxZoom: 19,
      }).addTo(map);

      // Ward circles
      Object.entries(WARD_COORDINATES).forEach(([wardName, coords]) => {
        L.circle(coords, {
          color: '#f59e0b',
          fillColor: '#f59e0b',
          fillOpacity: 0.08,
          radius: 1800,
          weight: 1.5,
          dashArray: '4, 8',
        }).addTo(map).bindTooltip(`<b>${wardName} Ward</b><br/><span style="font-size: 10px; color: #64748b;">NMC Boundary</span>`, {
          direction: 'top',
        });
      });

      const markersGroup = L.layerGroup().addTo(map);
      leafletMarkersRef.current = markersGroup;
      leafletMapRef.current = map;

      map.on('click', (e: any) => {
        const { lat, lng } = e.latlng;
        if (leafletUserPinRef.current) map.removeLayer(leafletUserPinRef.current);

        const customIcon = L.divIcon({
          className: 'custom-pin',
          html: `
            <div style="background-color: #d95b18; width: 28px; height: 28px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); display: flex; align-items: center; justify-content: center; border: 3px solid white; box-shadow: 0 4px 12px rgba(0,0,0,0.4);">
              <div style="width: 8px; height: 8px; background: white; border-radius: 50%;"></div>
            </div>
          `,
          iconSize: [28, 28],
          iconAnchor: [14, 28],
        });

        const pin = L.marker([lat, lng], { icon: customIcon }).addTo(map);
        leafletUserPinRef.current = pin;
        setSelectedLocation({ lat, lng, address: `Nashik Location (${lat.toFixed(4)}, ${lng.toFixed(4)})` });

        pin.bindPopup(`
          <div style="font-family: system-ui; padding: 4px; min-width: 170px;">
            <div style="font-weight: 800; color: #111d2e; font-size: 12px; margin-bottom: 2px;">📍 Selected Spot</div>
            <div style="font-size: 11px; color: #64748b; margin-bottom: 6px;">${lat.toFixed(5)}, ${lng.toFixed(5)}</div>
            <button 
              onclick="window.reportHazardAtLocation && window.reportHazardAtLocation(${lat}, ${lng}, 'Pinned Spot')"
              style="width: 100%; padding: 6px 10px; background-color: #d95b18; color: white; border: none; border-radius: 8px; font-weight: bold; font-size: 11px; cursor: pointer;"
            >
              Report Hazard Here
            </button>
          </div>
        `).openPopup();
      });
    }

    initLeaflet();

    return () => {
      isMounted = false;
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
  }, [isGoogleMapsReady]);

  // Hook global hazard reporter callback
  useEffect(() => {
    (window as any).reportHazardAtLocation = (lat: number, lng: number, address?: string) => {
      if (onOpenReportModal) {
        onOpenReportModal({
          lat,
          lng,
          address: address || `Nashik Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
        });
      }
    };
    return () => {
      delete (window as any).reportHazardAtLocation;
    };
  }, [onOpenReportModal]);

  // 3. Update Markers on Google Map (or Leaflet fallback)
  useEffect(() => {
    // A. Update on Google Maps
    if (isGoogleMapsReady && googleMapRef.current) {
      const map = googleMapRef.current;
      const infoWindow = googleInfoWindowRef.current;

      // Clear existing markers
      googleMarkersRef.current.forEach((m) => m.setMap(null));
      googleMarkersRef.current = [];

      // Pan to selected ward if chosen
      if (selectedWard !== 'All' && WARD_COORDINATES[selectedWard]) {
        map.panTo({ lat: WARD_COORDINATES[selectedWard][0], lng: WARD_COORDINATES[selectedWard][1] });
        map.setZoom(14);
      }

      // Plot Road Projects
      if (layerFilter === 'ALL' || layerFilter === 'PROJECTS') {
        const filteredProjects = selectedWard === 'All' ? projects : projects.filter((p) => p.ward === selectedWard);

        filteredProjects.forEach((proj) => {
          let phaseColor = '#10B981';
          let phaseLabel = 'Completed (DLP)';
          if (proj.phase === 'TRENCHING') { phaseColor = '#EF4444'; phaseLabel = 'Trenching'; }
          else if (proj.phase === 'CONCRETING') { phaseColor = '#F59E0B'; phaseLabel = 'Concreting'; }
          else if (proj.phase === 'WATER_CURING') { phaseColor = '#3B82F6'; phaseLabel = 'Water Curing'; }

          const dlpEnd = new Date(proj.dlpEndDate);
          const now = new Date();
          const isUnderDlp = dlpEnd > now;
          const monthsLeft = Math.max(0, Math.round((dlpEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 30)));

          const marker = new google.maps.Marker({
            position: { lat: proj.lat, lng: proj.lng },
            map: map,
            title: proj.roadName,
            icon: {
              path: google.maps.SymbolPath.CIRCLE,
              scale: 10,
              fillColor: phaseColor,
              fillOpacity: 1,
              strokeColor: '#ffffff',
              strokeWeight: 2,
            },
          });

          marker.addListener('click', () => {
            if (infoWindow) {
              infoWindow.setContent(`
                <div style="min-width: 250px; font-family: system-ui; padding: 4px;">
                  <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
                    <span style="font-size: 10px; font-weight: 700; color: #64748b; text-transform: uppercase;">${proj.ward} Ward</span>
                    <span style="background-color: ${phaseColor}15; color: ${phaseColor}; border: 1px solid ${phaseColor}40; font-size: 10px; font-weight: 800; padding: 2px 8px; border-radius: 9999px;">
                      ${phaseLabel}
                    </span>
                  </div>
                  <div style="font-weight: 800; font-size: 14px; color: #0f172a; margin-bottom: 3px; line-height: 1.3;">
                    ${proj.roadName}
                  </div>
                  <div style="background: #f8fafc; padding: 8px 10px; border-radius: 8px; font-size: 11px; color: #334155; line-height: 1.6; margin-bottom: 8px; border: 1px solid #e2e8f0;">
                    <div><b>Tender:</b> <span style="font-family: monospace;">${proj.tenderId}</span></div>
                    <div><b>Contractor:</b> ${proj.contractorName}</div>
                    <div><b>Budget:</b> ₹${proj.budgetInLakhs} Lakhs (${proj.lengthKm} km)</div>
                    <div><b>Progress:</b> ${proj.completionPercentage}% Done</div>
                  </div>
                  <div style="background: #ecfdf5; border: 1px solid #a7f3d0; padding: 6px 10px; border-radius: 6px; font-size: 11px; color: #065f46; display: flex; align-items: center; justify-content: space-between;">
                    <span>⏳ <b>DLP Warranty:</b></span>
                    <span style="font-weight: 800;">${isUnderDlp ? `${monthsLeft} Months Left` : 'Expired'}</span>
                  </div>
                </div>
              `);
              infoWindow.open(map, marker);
            }
            setSelectedProjectId(proj.id);
            setShowDrawer(true);
          });

          googleMarkersRef.current.push(marker);
        });
      }

      // Plot Civic Hazards
      if (layerFilter === 'ALL' || layerFilter === 'HAZARDS') {
        const filteredTickets = selectedWard === 'All' ? tickets : tickets.filter((t) => t.ward === selectedWard);

        filteredTickets.forEach((tkt) => {
          let statusColor = '#3b82f6';
          if (tkt.status === 'VERIFICATION_PENDING') statusColor = '#f59e0b';
          else if (tkt.status === 'OFFICIALLY_CLOSED') statusColor = '#10b981';
          else if (tkt.status === 'REOPENED') statusColor = '#ef4444';

          const marker = new google.maps.Marker({
            position: { lat: tkt.lat, lng: tkt.lng },
            map: map,
            title: tkt.title,
            icon: {
              path: google.maps.SymbolPath.BACKWARD_CLOSED_ARROW,
              scale: 7,
              fillColor: statusColor,
              fillOpacity: 1,
              strokeColor: '#ffffff',
              strokeWeight: 2,
            },
          });

          marker.addListener('click', () => {
            if (infoWindow) {
              infoWindow.setContent(`
                <div style="min-width: 240px; font-family: system-ui; padding: 4px;">
                  <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;">
                    <span style="font-size: 10px; font-weight: 700; color: #64748b; text-transform: uppercase;">${tkt.ward} Ward</span>
                    <span style="background-color: ${statusColor}15; color: ${statusColor}; border: 1px solid ${statusColor}40; font-size: 10px; font-weight: 800; padding: 2px 8px; border-radius: 9999px;">
                      ${tkt.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <div style="font-weight: 800; font-size: 13px; color: #0f172a; margin-bottom: 2px; line-height: 1.3;">
                    ${tkt.title}
                  </div>
                  <div style="font-size: 11px; color: #64748b; margin-bottom: 6px;">
                    📍 ${tkt.locationName}
                  </div>
                  <div style="background: #f8fafc; padding: 6px 10px; border-radius: 6px; font-size: 11px; color: #475569; display: flex; justify-content: space-between; border: 1px solid #e2e8f0; margin-bottom: 8px;">
                    <span>Severity: <b style="color: #0f172a;">${tkt.impactScore}</b></span>
                    <span>👍 <b>${tkt.upvotes}</b> +1s</span>
                  </div>
                  <button 
                    onclick="window.inspectCivicTicket('${tkt.id}')" 
                    style="width: 100%; background: #0f172a; color: white; border: none; border-radius: 8px; padding: 7px 12px; font-size: 11px; font-weight: 700; cursor: pointer;"
                  >
                    Inspect & Verify Quorum ➔
                  </button>
                </div>
              `);
              infoWindow.open(map, marker);
            }
          });

          googleMarkersRef.current.push(marker);
        });
      }
    }

    // B. Fallback update on Leaflet
    if (!isGoogleMapsReady && leafletMapRef.current && leafletMarkersRef.current) {
      import('leaflet').then((LModule) => {
        const L = LModule.default;
        if (!leafletMarkersRef.current || !leafletMapRef.current) return;
        leafletMarkersRef.current.clearLayers();

        if (selectedWard !== 'All' && WARD_COORDINATES[selectedWard]) {
          leafletMapRef.current.flyTo(WARD_COORDINATES[selectedWard], 14, { duration: 1.2 });
        }

        // Plot Projects
        if (layerFilter === 'ALL' || layerFilter === 'PROJECTS') {
          const filteredProjects = selectedWard === 'All' ? projects : projects.filter((p) => p.ward === selectedWard);
          filteredProjects.forEach((proj) => {
            let phaseColor = '#10B981';
            let phaseLabel = 'Completed (DLP)';
            if (proj.phase === 'TRENCHING') { phaseColor = '#EF4444'; phaseLabel = 'Trenching'; }
            else if (proj.phase === 'CONCRETING') { phaseColor = '#F59E0B'; phaseLabel = 'Concreting'; }
            else if (proj.phase === 'WATER_CURING') { phaseColor = '#3B82F6'; phaseLabel = 'Water Curing'; }

            const customIcon = L.divIcon({
              className: 'custom-pin',
              html: `
                <div style="background-color: ${phaseColor}; box-shadow: 0 4px 12px ${phaseColor}60;" class="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold border-2 border-white">
                  🛣️
                </div>
              `,
              iconSize: [32, 32],
              iconAnchor: [16, 16],
            });

            const marker = L.marker([proj.lat, proj.lng], { icon: customIcon });
            marker.bindPopup(`
              <div style="min-width: 250px; font-family: system-ui; padding: 4px;">
                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
                  <span style="font-size: 10px; font-weight: 700; color: #64748b; text-transform: uppercase;">${proj.ward} Ward</span>
                  <span style="background-color: ${phaseColor}15; color: ${phaseColor}; border: 1px solid ${phaseColor}40; font-size: 10px; font-weight: 800; padding: 2px 8px; border-radius: 9999px;">
                    ${phaseLabel}
                  </span>
                </div>
                <div style="font-weight: 800; font-size: 14px; color: #0f172a; margin-bottom: 3px;">${proj.roadName}</div>
                <div style="background: #f8fafc; padding: 8px 10px; border-radius: 8px; font-size: 11px; color: #334155; line-height: 1.6; border: 1px solid #e2e8f0;">
                  <div><b>Tender:</b> <span style="font-family: monospace;">${proj.tenderId}</span></div>
                  <div><b>Contractor:</b> ${proj.contractorName}</div>
                  <div><b>Budget:</b> ₹${proj.budgetInLakhs} Lakhs (${proj.lengthKm} km)</div>
                </div>
              </div>
            `);
            leafletMarkersRef.current?.addLayer(marker);
          });
        }

        // Plot Hazards
        if (layerFilter === 'ALL' || layerFilter === 'HAZARDS') {
          const filteredTickets = selectedWard === 'All' ? tickets : tickets.filter((t) => t.ward === selectedWard);
          filteredTickets.forEach((tkt) => {
            let statusColor = '#3b82f6';
            let emoji = '⚠️';
            if (tkt.category === 'ROAD_CAVE_IN') emoji = '🕳️';
            else if (tkt.category === 'OPEN_MANHOLE') emoji = '🚷';
            else if (tkt.category === 'ELECTRICAL_WIRE') emoji = '⚡';
            else if (tkt.category === 'WATER_LOGGING') emoji = '🌊';
            else if (tkt.category === 'POTHOLE') emoji = '🪨';

            if (tkt.status === 'VERIFICATION_PENDING') statusColor = '#f59e0b';
            else if (tkt.status === 'OFFICIALLY_CLOSED') statusColor = '#10b981';
            else if (tkt.status === 'REOPENED') statusColor = '#ef4444';

            const customIcon = L.divIcon({
              className: 'custom-pin',
              html: `
                <div style="background-color: ${statusColor}; box-shadow: 0 4px 12px ${statusColor}60;" class="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold border-2 border-white">
                  ${emoji}
                </div>
              `,
              iconSize: [32, 32],
              iconAnchor: [16, 16],
            });

            const marker = L.marker([tkt.lat, tkt.lng], { icon: customIcon });
            marker.bindPopup(`
              <div style="min-width: 240px; font-family: system-ui; padding: 4px;">
                <div style="font-weight: 800; font-size: 13px; color: #0f172a; margin-bottom: 2px;">${tkt.title}</div>
                <div style="font-size: 11px; color: #64748b; margin-bottom: 6px;">📍 ${tkt.locationName}</div>
                <button 
                  onclick="window.inspectCivicTicket('${tkt.id}')" 
                  style="width: 100%; background: #0f172a; color: white; border: none; border-radius: 8px; padding: 7px 12px; font-size: 11px; font-weight: 700; cursor: pointer;"
                >
                  Inspect & Verify Quorum ➔
                </button>
              </div>
            `);
            leafletMarkersRef.current?.addLayer(marker);
          });
        }
      });
    }
  }, [isGoogleMapsReady, tickets, projects, layerFilter, selectedWard]);

  // Handle Map Type Change
  const handleMapTypeChange = (type: 'hybrid' | 'satellite' | 'roadmap') => {
    setMapType(type);
    if (googleMapRef.current && typeof google !== 'undefined' && google.maps) {
      if (type === 'hybrid') googleMapRef.current.setMapTypeId(google.maps.MapTypeId.HYBRID);
      else if (type === 'satellite') googleMapRef.current.setMapTypeId(google.maps.MapTypeId.SATELLITE);
      else googleMapRef.current.setMapTypeId(google.maps.MapTypeId.ROADMAP);
    }
  };

  // Focus Project
  const handleFocusProject = (project: RoadProject) => {
    setSelectedProjectId(project.id);
    if (googleMapRef.current) {
      googleMapRef.current.panTo({ lat: project.lat, lng: project.lng });
      googleMapRef.current.setZoom(16);
    } else if (leafletMapRef.current) {
      leafletMapRef.current.flyTo([project.lat, project.lng], 16, { duration: 1.2 });
    }
  };

  // Quick Ward Select
  const handleQuickWardSelect = (ward: Ward | 'All') => {
    setSelectedWard(ward);
    if (googleMapRef.current) {
      if (ward === 'All') {
        googleMapRef.current.panTo({ lat: NASHIK_CENTER.lat, lng: NASHIK_CENTER.lng });
        googleMapRef.current.setZoom(NASHIK_CENTER.zoom);
      } else if (WARD_COORDINATES[ward]) {
        googleMapRef.current.panTo({ lat: WARD_COORDINATES[ward][0], lng: WARD_COORDINATES[ward][1] });
        googleMapRef.current.setZoom(14);
      }
    } else if (leafletMapRef.current) {
      if (ward === 'All') {
        leafletMapRef.current.flyTo([NASHIK_CENTER.lat, NASHIK_CENTER.lng], NASHIK_CENTER.zoom, { duration: 1.2 });
      } else if (WARD_COORDINATES[ward]) {
        leafletMapRef.current.flyTo(WARD_COORDINATES[ward], 14, { duration: 1.2 });
      }
    }
  };

  // Select Landmark
  const handleSelectLandmark = (item: { name: string; lat: number; lng: number }) => {
    setSearchQuery(item.name);
    setShowLandmarkSuggestions(false);
    if (googleMapRef.current) {
      googleMapRef.current.panTo({ lat: item.lat, lng: item.lng });
      googleMapRef.current.setZoom(16);
      placeUserPinGoogle(item.lat, item.lng, item.name);
    } else if (leafletMapRef.current) {
      leafletMapRef.current.flyTo([item.lat, item.lng], 16, { duration: 1.2 });
    }
  };

  const filteredProjectsList = projects.filter((p) => {
    const matchesWard = selectedWard === 'All' || p.ward === selectedWard;
    const matchesSearch = !searchProjectQuery.trim() || 
      p.roadName.toLowerCase().includes(searchProjectQuery.toLowerCase()) ||
      p.tenderId.toLowerCase().includes(searchProjectQuery.toLowerCase()) ||
      p.contractorName.toLowerCase().includes(searchProjectQuery.toLowerCase());
    return matchesWard && matchesSearch;
  });

  const totalBudgetInLakhs = projects.reduce((acc, p) => acc + p.budgetInLakhs, 0);

  return (
    <div className="space-y-3">
      
      {/* Top Header & Ward Navigation */}
      <div className="bg-white dark:bg-slate-900 p-3.5 sm:p-4 rounded-2xl border border-slate-200/90 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-xs">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-orange-500/10 text-[#d95b18] flex items-center justify-center font-bold shrink-0">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-black text-base sm:text-lg text-[#111d2e] dark:text-slate-100 flex items-center gap-2">
                <span>Map</span>
                <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#edf8f3] text-[#059669] border border-[#d1fae5]">
                  Google Maps GIS
                </span>
                {isGoogleMapsReady && (
                  <span className="hidden sm:inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-600 border border-blue-200">
                    Live Satellite
                  </span>
                )}
              </h2>
            </div>
          </div>
        </div>

        {/* Right Controls: Ward Selector & Drawer Toggle */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Ward navigation chips */}
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5 max-w-full">
            <button
              onClick={() => handleQuickWardSelect('All')}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition ${
                selectedWard === 'All'
                  ? 'bg-slate-900 text-white dark:bg-amber-500 dark:text-slate-950 shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              All Nashik
            </button>
            {WARDS.map((w) => (
              <button
                key={w}
                onClick={() => handleQuickWardSelect(w)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition ${
                  selectedWard === w
                    ? 'bg-slate-900 text-white dark:bg-amber-500 dark:text-slate-950 shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {w}
              </button>
            ))}
          </div>

          {/* Toggle Sidebar Button */}
          <button
            onClick={() => setShowDrawer(!showDrawer)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 transition border border-slate-200 dark:border-slate-700 shrink-0"
            title={showDrawer ? 'Collapse Road Registry' : 'Expand Road Registry'}
          >
            {showDrawer ? <PanelRightClose className="w-3.5 h-3.5" /> : <PanelRightOpen className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">Road Registry</span>
            <span className="px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300 text-[10px] font-bold">
              {filteredProjectsList.length}
            </span>
          </button>
        </div>
      </div>

      {/* Main Unified Google Maps GIS Canvas + Side Drawer */}
      <div className="flex flex-col lg:flex-row h-[600px] sm:h-[680px] lg:h-[720px] w-full rounded-2xl overflow-hidden bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm relative transition-colors">
        
        {/* Main Map Canvas */}
        <div className="flex-1 h-[360px] sm:h-[420px] lg:h-full relative">
        
          {/* Top-Left: Layer Filter Pills */}
          <div className="absolute top-3 left-3 z-20 flex items-center gap-1 bg-white/95 dark:bg-slate-950/90 backdrop-blur-md p-1 rounded-full border border-slate-200/80 dark:border-slate-800 shadow-sm max-w-[calc(100%-1.5rem)] overflow-x-auto no-scrollbar">
            <button
              onClick={() => setLayerFilter('ALL')}
              className={`whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-bold transition ${
                layerFilter === 'ALL'
                  ? 'bg-slate-900 text-white dark:bg-amber-500 dark:text-slate-950 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              All Layers ({projects.length + tickets.length})
            </button>

            <button
              onClick={() => setLayerFilter('PROJECTS')}
              className={`whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-bold transition ${
                layerFilter === 'PROJECTS'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Road Works ({projects.length})
            </button>

            <button
              onClick={() => setLayerFilter('HAZARDS')}
              className={`whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-bold transition ${
                layerFilter === 'HAZARDS'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Civic Hazards ({tickets.length})
            </button>
          </div>

          {/* Top-Right: Satellite / Hybrid / Street Switcher */}
          <div className="absolute top-3 right-3 z-20 flex items-center gap-1 bg-white/95 dark:bg-slate-950/90 backdrop-blur-md p-1 rounded-full border border-slate-200/80 dark:border-slate-800 shadow-sm">
            <button
              type="button"
              onClick={() => handleMapTypeChange('hybrid')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold transition ${
                mapType === 'hybrid'
                  ? 'bg-[#d95b18] text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <Satellite className="w-3 h-3" />
              <span>Hybrid</span>
            </button>
            <button
              type="button"
              onClick={() => handleMapTypeChange('satellite')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold transition ${
                mapType === 'satellite'
                  ? 'bg-[#d95b18] text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <span>Satellite</span>
            </button>
            <button
              type="button"
              onClick={() => handleMapTypeChange('roadmap')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold transition ${
                mapType === 'roadmap'
                  ? 'bg-[#d95b18] text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <MapIcon className="w-3 h-3" />
              <span>Street</span>
            </button>
          </div>

          {/* Search Bar & Landmark Quick Picker */}
          <div className="absolute top-14 left-3 right-3 sm:right-auto sm:w-80 z-20">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowLandmarkSuggestions(true);
                }}
                onFocus={() => setShowLandmarkSuggestions(true)}
                placeholder="Search Nashik junction or address..."
                className="w-full pl-8 pr-8 py-2 rounded-xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200/90 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 shadow-md focus:outline-none focus:ring-2 focus:ring-[#d95b18]"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Quick Landmark Dropdown */}
            {showLandmarkSuggestions && (
              <div className="mt-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl p-1 max-h-48 overflow-y-auto">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1">
                  Popular Landmarks
                </div>
                {NASHIK_QUICK_LANDMARKS.filter(l => l.name.toLowerCase().includes(searchQuery.toLowerCase())).map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectLandmark(item)}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-medium text-slate-800 dark:text-slate-200 transition"
                  >
                    <MapPin className="w-3 h-3 text-[#d95b18] shrink-0" />
                    <span className="truncate">{item.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Floating Phase Legend */}
          <div className="absolute bottom-3 left-3 z-20 hidden md:flex items-center gap-3 bg-white/95 dark:bg-slate-950/90 backdrop-blur-md px-3.5 py-2 rounded-full border border-slate-200/80 dark:border-slate-800 text-xs shadow-sm">
            <span className="font-bold text-slate-700 dark:text-slate-300 text-[11px]">Phases:</span>
            <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 text-[11px]">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Trenching
            </span>
            <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 text-[11px]">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Concreting
            </span>
            <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 text-[11px]">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500" /> Curing
            </span>
            <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 text-[11px]">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> DLP Warranty
            </span>
          </div>

          {/* Selected Pin Action Toast */}
          {selectedLocation && (
            <div className="absolute bottom-3 right-3 z-20 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xl flex items-center gap-3 text-xs max-w-sm">
              <div className="w-2 h-2 rounded-full bg-[#d95b18] animate-ping shrink-0" />
              <div className="truncate">
                <div className="font-bold text-slate-900 dark:text-slate-100 text-[11px] truncate">{selectedLocation.address}</div>
                <div className="text-[10px] text-slate-500 font-mono">{selectedLocation.lat.toFixed(4)}, {selectedLocation.lng.toFixed(4)}</div>
              </div>
              {onOpenReportModal && (
                <button
                  type="button"
                  onClick={() => onOpenReportModal(selectedLocation)}
                  className="px-2.5 py-1 rounded-lg bg-[#d95b18] text-white font-bold text-[11px] hover:bg-[#c24e12] shrink-0"
                >
                  Report
                </button>
              )}
            </div>
          )}

          {/* Map Container */}
          <div ref={mapContainerRef} className="w-full h-full bg-slate-900" />
        </div>

        {/* Interactive Side Drawer (Project & DLP Ledger) */}
        {showDrawer && (
          <div className="w-full lg:w-96 h-80 lg:h-full bg-white dark:bg-slate-950 border-t lg:border-t-0 lg:border-l border-slate-200/90 dark:border-slate-800 flex flex-col shrink-0 transition-all duration-300">
            
            {/* Drawer Header */}
            <div className="p-3.5 border-b border-slate-200/80 dark:border-slate-800 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <HardHat className="w-4 h-4 text-amber-500" />
                  <h3 className="font-bold text-slate-900 dark:text-slate-100 text-xs uppercase tracking-wider">
                    Road Registry ({filteredProjectsList.length})
                  </h3>
                </div>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  ₹{totalBudgetInLakhs}L Tendered
                </span>
              </div>

              {/* Quick search inside project drawer */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchProjectQuery}
                  onChange={(e) => setSearchProjectQuery(e.target.value)}
                  placeholder="Search road name or contractor..."
                  className="w-full pl-8 pr-7 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
                {searchProjectQuery && (
                  <button
                    onClick={() => setSearchProjectQuery('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>

            {/* Scrollable Project Cards */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
              {filteredProjectsList.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400 space-y-2">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-900 flex items-center justify-center mx-auto text-slate-400">
                    🔍
                  </div>
                  <div>No road works match your search in this ward.</div>
                </div>
              ) : (
                filteredProjectsList.map((project) => {
                  const isSelected = selectedProjectId === project.id;
                  const dlpEnd = new Date(project.dlpEndDate);
                  const now = new Date();
                  const monthsLeft = Math.max(0, Math.round((dlpEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 30)));

                  let phaseColorClass = 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
                  if (project.phase === 'TRENCHING') phaseColorClass = 'text-rose-600 dark:text-rose-400 bg-rose-500/10 border-rose-500/20';
                  else if (project.phase === 'CONCRETING') phaseColorClass = 'text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/20';
                  else if (project.phase === 'WATER_CURING') phaseColorClass = 'text-blue-600 dark:text-blue-400 bg-blue-500/10 border-blue-500/20';

                  return (
                    <div
                      key={project.id}
                      onClick={() => handleFocusProject(project)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer text-xs space-y-2.5 ${
                        isSelected
                          ? 'bg-amber-50/70 dark:bg-slate-900 border-amber-500 shadow-xs ring-1 ring-amber-500/40'
                          : 'bg-white dark:bg-slate-900/60 hover:bg-slate-50 dark:hover:bg-slate-800/50 border-slate-200/80 dark:border-slate-800/80 shadow-xs'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="font-extrabold text-slate-900 dark:text-slate-100 text-xs sm:text-sm leading-snug">
                            {project.roadName}
                          </div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                            {project.ward} • Tender: <span className="font-mono text-slate-700 dark:text-slate-300">{project.tenderId}</span>
                          </div>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border shrink-0 ${phaseColorClass}`}>
                          {project.phase.replace(/_/g, ' ')}
                        </span>
                      </div>

                      {/* Progress bar */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] text-slate-500 dark:text-slate-400">
                          <span>Milestone Progress</span>
                          <span className="font-bold text-slate-800 dark:text-slate-200">{project.completionPercentage}%</span>
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="bg-amber-500 h-full rounded-full transition-all duration-300"
                            style={{ width: `${project.completionPercentage}%` }}
                          />
                        </div>
                      </div>

                      {/* Contractor & Budget */}
                      <div className="text-[11px] text-slate-600 dark:text-slate-400 flex items-center justify-between">
                        <span className="truncate">Contractor: <b>{project.contractorName}</b></span>
                        <span className="font-bold text-slate-900 dark:text-slate-100 shrink-0">₹{project.budgetInLakhs}L</span>
                      </div>

                      {/* Footer Info */}
                      <div className="flex items-center justify-between text-[11px] pt-2 border-t border-slate-100 dark:border-slate-800/80">
                        <span className="text-emerald-700 dark:text-emerald-400 font-semibold flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>⏳ {monthsLeft} Mo. DLP Warranty</span>
                        </span>
                        <span className="text-amber-600 dark:text-amber-400 font-bold hover:underline flex items-center gap-0.5">
                          <span>Focus Map</span>
                          <ChevronRight className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

          </div>
        )}

      </div>

      {/* Reports without a map pin list */}
      <div className="space-y-3 pt-3">
        <div className="flex items-center justify-between">
          <h3 className="text-[16px] font-black text-[#111d2e] dark:text-slate-100">
            Reports without a map pin
          </h3>
          <span className="text-xs font-bold text-slate-400">{tickets.length}</span>
        </div>

        <div className="space-y-2.5">
          {tickets.slice(0, 6).map((ticket) => (
            <div
              key={ticket.id}
              onClick={() => onSelectTicket && onSelectTicket(ticket.id)}
              className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between cursor-pointer hover:border-[#d95b18]/40 transition group"
            >
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                <div className="space-y-0.5">
                  <h4 className="text-[14px] font-bold text-[#111d2e] dark:text-slate-100 group-hover:text-[#d95b18] transition-colors">
                    {ticket.title}
                  </h4>
                  <p className="text-[12px] text-slate-500 dark:text-slate-400">
                    {ticket.locationName}
                  </p>
                  <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#fef2ea] text-[#d95b18] border border-[#fae8dc]">
                    Pending Review
                  </span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform shrink-0" />
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
