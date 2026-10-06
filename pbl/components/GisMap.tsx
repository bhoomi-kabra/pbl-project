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
  ShieldCheck, 
  RotateCcw,
  PanelRightClose,
  PanelRightOpen,
  ArrowUpRight,
  TrendingUp,
  Coins,
  CheckCircle2,
  Compass,
  AlertTriangle,
  X
} from 'lucide-react';
import type * as LType from 'leaflet';

interface GisMapProps {
  tickets: Ticket[];
  projects: RoadProject[];
  onSelectTicket?: (ticketId: string) => void;
}

const WARDS: Ward[] = [
  'Panchavati',
  'Nashik East',
  'Nashik West',
  'Cidco',
  'Satpur',
  'Nashik Road'
];

export default function GisMap({ tickets, projects, onSelectTicket }: GisMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<LType.Map | null>(null);
  const markersLayerRef = useRef<LType.LayerGroup | null>(null);

  const { selectedWard, setSelectedWard } = useApp();
  const [layerFilter, setLayerFilter] = useState<'ALL' | 'PROJECTS' | 'HAZARDS'>('ALL');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [searchProjectQuery, setSearchProjectQuery] = useState('');
  const [showDrawer, setShowDrawer] = useState(true);
  const [mapReady, setMapReady] = useState(false);

  // Expose global inspector trigger for Leaflet HTML popups
  useEffect(() => {
    (window as any).inspectCivicTicket = (ticketId: string) => {
      if (onSelectTicket) {
        onSelectTicket(ticketId);
      }
    };
    return () => {
      delete (window as any).inspectCivicTicket;
    };
  }, [onSelectTicket]);

  // Initialize Leaflet Map
  useEffect(() => {
    let isMounted = true;

    async function initMap() {
      if (!mapContainerRef.current) return;

      // Clean up previous instance or stale leaflet id if already initialized
      if ((mapContainerRef.current as any)._leaflet_id) {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.remove();
          mapInstanceRef.current = null;
        }
        (mapContainerRef.current as any)._leaflet_id = null;
      }

      if (mapInstanceRef.current) return;

      const L = (await import('leaflet')).default;
      if (!isMounted || !mapContainerRef.current) return;

      if ((mapContainerRef.current as any)._leaflet_id) {
        (mapContainerRef.current as any)._leaflet_id = null;
      }

      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      let map: LType.Map;
      try {
        if ((mapContainerRef.current as any)._leaflet_id) {
          (mapContainerRef.current as any)._leaflet_id = null;
        }
        map = L.map(mapContainerRef.current, {
          center: [NASHIK_CENTER.lat, NASHIK_CENTER.lng],
          zoom: NASHIK_CENTER.zoom,
          zoomControl: false, // will position cleanly
        });
      } catch {
        return;
      }

      // Add zoom control at bottom-right
      L.control.zoom({ position: 'bottomright' }).addTo(map);

      if (!isMounted) {
        map.remove();
        return;
      }

      // Official free OpenStreetMap tile server (zero API key watermark)
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map);

      // Add Ward administrative boundary circles
      Object.entries(WARD_COORDINATES).forEach(([wardName, coords]) => {
        const circle = L.circle(coords, {
          color: '#f59e0b',
          fillColor: '#f59e0b',
          fillOpacity: 0.06,
          radius: 1800,
          weight: 1.5,
          dashArray: '4, 8'
        }).addTo(map);

        circle.bindTooltip(`<b>${wardName} Ward</b><br/><span style="font-size: 10px; color: #64748b;">NMC Boundary</span>`, {
          direction: 'top',
          className: 'custom-ward-tooltip'
        });
      });

      const markersGroup = L.layerGroup().addTo(map);
      markersLayerRef.current = markersGroup;
      mapInstanceRef.current = map;
      if (isMounted) {
        setMapReady(true);
      }
    }

    initMap();

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
      if (mapContainerRef.current && (mapContainerRef.current as any)._leaflet_id) {
        (mapContainerRef.current as any)._leaflet_id = null;
      }
      setMapReady(false);
    };
  }, []);

  // Update Markers
  useEffect(() => {
    async function updateMarkers() {
      if (!mapInstanceRef.current || !markersLayerRef.current) return;
      const L = (await import('leaflet')).default;
      markersLayerRef.current.clearLayers();

      if (selectedWard !== 'All' && WARD_COORDINATES[selectedWard]) {
        mapInstanceRef.current.flyTo(WARD_COORDINATES[selectedWard], 14, { duration: 1.2 });
      }

      // 1. Plot Road Projects (Lifecycle & DLP)
      if (layerFilter === 'ALL' || layerFilter === 'PROJECTS') {
        const filteredProjects = selectedWard === 'All'
          ? projects
          : projects.filter((p) => p.ward === selectedWard);

        filteredProjects.forEach((proj) => {
          let phaseColor = '#10B981';
          let phaseLabel = 'Completed (DLP)';

          if (proj.phase === 'TRENCHING') {
            phaseColor = '#EF4444';
            phaseLabel = 'Trenching';
          } else if (proj.phase === 'CONCRETING') {
            phaseColor = '#F59E0B';
            phaseLabel = 'Concreting';
          } else if (proj.phase === 'WATER_CURING') {
            phaseColor = '#3B82F6';
            phaseLabel = 'Water Curing';
          }

          const customIcon = L.divIcon({
            className: 'custom-pin',
            html: `
              <div style="background-color: ${phaseColor}; box-shadow: 0 4px 12px ${phaseColor}60;" class="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold border-2 border-white transform hover:scale-125 transition-all">
                🛣️
              </div>
            `,
            iconSize: [32, 32],
            iconAnchor: [16, 16],
          });

          const dlpEnd = new Date(proj.dlpEndDate);
          const now = new Date();
          const isUnderDlp = dlpEnd > now;
          const monthsLeft = Math.max(0, Math.round((dlpEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 30)));

          const marker = L.marker([proj.lat, proj.lng], { icon: customIcon });

          const popupContent = `
            <div style="min-width: 250px; font-family: system-ui, -apple-system, sans-serif; padding: 4px;">
              <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
                <span style="font-size: 10px; font-weight: 700; color: #64748b; text-transform: uppercase;">${proj.ward} Ward</span>
                <span style="background-color: ${phaseColor}15; color: ${phaseColor}; border: 1px solid ${phaseColor}40; font-size: 10px; font-weight: 800; padding: 2px 8px; border-radius: 9999px;">
                  ${phaseLabel}
                </span>
              </div>
              <div style="font-weight: 800; font-size: 14px; color: #0f172a; margin-bottom: 3px; line-height: 1.3;">
                ${proj.roadName}
              </div>
              <div style="font-size: 11px; color: #64748b; margin-bottom: 8px;">
                ${proj.title}
              </div>
              <div style="background: #f8fafc; padding: 8px 10px; border-radius: 8px; font-size: 11px; color: #334155; line-height: 1.6; margin-bottom: 8px; border: 1px solid #e2e8f0;">
                <div><b>Tender:</b> <span style="font-family: monospace; color: #0f172a;">${proj.tenderId}</span></div>
                <div><b>Contractor:</b> ${proj.contractorName}</div>
                <div><b>Budget:</b> ₹${proj.budgetInLakhs} Lakhs (${proj.lengthKm} km)</div>
                <div><b>Milestone:</b> ${proj.completionPercentage}% Done</div>
              </div>
              <div style="background: #ecfdf5; border: 1px solid #a7f3d0; padding: 6px 10px; border-radius: 6px; font-size: 11px; color: #065f46; display: flex; align-items: center; justify-content: space-between;">
                <span>⏳ <b>DLP Warranty:</b></span>
                <span style="font-weight: 800;">${isUnderDlp ? `${monthsLeft} Months Left` : 'Expired'}</span>
              </div>
            </div>
          `;

          marker.bindPopup(popupContent);
          markersLayerRef.current?.addLayer(marker);
        });
      }

      // 2. Plot Hazards
      if (layerFilter === 'ALL' || layerFilter === 'HAZARDS') {
        const filteredTickets = selectedWard === 'All'
          ? tickets
          : tickets.filter((t) => t.ward === selectedWard);

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
              <div style="background-color: ${statusColor}; box-shadow: 0 4px 12px ${statusColor}60;" class="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold border-2 border-white transform hover:scale-125 transition-all">
                ${emoji}
              </div>
            `,
            iconSize: [32, 32],
            iconAnchor: [16, 16],
          });

          const marker = L.marker([tkt.lat, tkt.lng], { icon: customIcon });

          const popupContent = `
            <div style="min-width: 240px; font-family: system-ui, -apple-system, sans-serif; padding: 4px;">
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
                <span>Severity Score: <b style="color: #0f172a;">${tkt.impactScore}</b></span>
                <span>👍 <b>${tkt.upvotes}</b> +1s</span>
              </div>
              <button 
                onclick="window.inspectCivicTicket('${tkt.id}')" 
                style="width: 100%; background: #0f172a; color: white; border: none; border-radius: 8px; padding: 7px 12px; font-size: 11px; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px; transition: background 0.2s;"
                onmouseover="this.style.background='#f59e0b'; this.style.color='#0f172a';"
                onmouseout="this.style.background='#0f172a'; this.style.color='#ffffff';"
              >
                <span>Inspect & Verify Quorum</span> ➔
              </button>
            </div>
          `;

          marker.bindPopup(popupContent);
          markersLayerRef.current?.addLayer(marker);
        });
      }
    }

    updateMarkers();
  }, [mapReady, tickets, projects, layerFilter, selectedWard]);

  const handleFocusProject = (project: RoadProject) => {
    setSelectedProjectId(project.id);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([project.lat, project.lng], 16, { duration: 1.2 });
    }
  };

  const handleQuickWardSelect = (ward: Ward | 'All') => {
    setSelectedWard(ward);
    if (mapInstanceRef.current) {
      if (ward === 'All') {
        mapInstanceRef.current.flyTo([NASHIK_CENTER.lat, NASHIK_CENTER.lng], NASHIK_CENTER.zoom, { duration: 1.2 });
      } else if (WARD_COORDINATES[ward]) {
        mapInstanceRef.current.flyTo(WARD_COORDINATES[ward], 14, { duration: 1.2 });
      }
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
      
      {/* Top Header & Quick Ward Switcher Bar */}
      <div className="bg-white dark:bg-slate-900 p-3.5 sm:p-4 rounded-2xl border border-slate-200/90 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-xs">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold shrink-0">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <span>GIS Infrastructure & Road Warranty Map</span>
                <span className="hidden sm:inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                  Live OSM Network
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Monitoring road construction lifecycles, active DLP warranties, and crowdsourced hazard locations across Nashik
              </p>
            </div>
          </div>
        </div>

        {/* Right Controls: Quick Ward Switcher & Drawer Toggle */}
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

      {/* Main Map + Side Drawer Layout */}
      <div className="flex flex-col lg:flex-row h-[600px] sm:h-[680px] lg:h-[720px] w-full rounded-2xl overflow-hidden bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm relative transition-colors">
        
        {/* Main Map Canvas */}
        <div className="flex-1 h-[360px] sm:h-[420px] lg:h-full relative">
          
          {/* Layer Filter Toolbar (Floating Glassmorphic Pill) */}
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

          {/* Floating Minimal Legend */}
          <div className="absolute bottom-3 left-3 z-20 hidden md:flex items-center gap-3 bg-white/95 dark:bg-slate-950/90 backdrop-blur-md px-3.5 py-2 rounded-full border border-slate-200/80 dark:border-slate-800 text-xs shadow-sm">
            <span className="font-bold text-slate-700 dark:text-slate-300 text-[11px]">Phases:</span>
            <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 text-[11px]">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-xs" /> Trenching
            </span>
            <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 text-[11px]">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-xs" /> Concreting
            </span>
            <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 text-[11px]">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-xs" /> Curing
            </span>
            <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 text-[11px]">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-xs" /> DLP Warranty
            </span>
          </div>

          {/* Map Container */}
          <div ref={mapContainerRef} className="w-full h-full" />
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
                          <span>Fly to Road</span>
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

    </div>
  );
}
