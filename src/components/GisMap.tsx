import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { RoadWorkProject, CivicTicket, WardName, LifecycleState, Language, ThemeMode } from '../types';
import { translations } from '../data/translations';
import { MapPin, Filter, AlertCircle, HardHat, DollarSign, Calendar, Eye, Layers, AlertTriangle, CheckCircle2, ThumbsUp } from 'lucide-react';

interface GisMapProps {
  projects: RoadWorkProject[];
  tickets: CivicTicket[];
  selectedWard: WardName;
  onSelectWard: (ward: WardName) => void;
  language: Language;
  theme?: ThemeMode;
}

export const GisMap: React.FC<GisMapProps> = ({
  projects,
  tickets = [],
  selectedWard,
  onSelectWard,
  language,
}) => {
  const t = translations[language];
  const mapRef = useRef<HTMLDivElement | null>(null);
  const leafletMapRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const markersLayerGroupRef = useRef<L.LayerGroup | null>(null);

  const [activeLayerFilter, setActiveLayerFilter] = useState<'ALL' | 'COMPLAINTS' | 'PROJECTS'>('ALL');
  const [selectedStateFilter, setSelectedStateFilter] = useState<LifecycleState | 'ALL'>('ALL');
  const [selectedItem, setSelectedItem] = useState<{ type: 'PROJECT'; data: RoadWorkProject } | { type: 'TICKET'; data: CivicTicket } | null>(null);

  // Filter projects by ward and lifecycle state
  const filteredProjects = projects.filter((p) => {
    const wardMatch = selectedWard === 'All Wards' || p.ward === selectedWard;
    const stateMatch = selectedStateFilter === 'ALL' || p.state === selectedStateFilter;
    return wardMatch && stateMatch;
  });

  // Filter complaints by ward
  const filteredTickets = tickets.filter((tk) => {
    return selectedWard === 'All Wards' || tk.ward === selectedWard;
  });

  const getStateColor = (state: LifecycleState) => {
    switch (state) {
      case 'TRENCHING': return '#ef4444';
      case 'CONCRETING': return '#f59e0b';
      case 'CURING': return '#2563eb';
      case 'COMPLETED': return '#10b981';
    }
  };

  const getHazardPinColor = (ticket: CivicTicket) => {
    if (ticket.status === 'CLOSED_VERIFIED') return '#10b981';
    switch (ticket.hazardType) {
      case 'ELECTRICAL_HAZARD':
      case 'ROAD_COLLAPSE':
        return '#dc2626'; // Bright Red
      case 'POTHOLE':
        return '#ea580c'; // Vibrant Orange
      case 'WATER_LEAKAGE':
        return '#0284c7'; // Vivid Blue
      case 'DRAINAGE_OVERFLOW':
      case 'GARBAGE_DUMP':
        return '#7c3aed'; // Purple
      default:
        return '#d97706'; // Amber
    }
  };

  useEffect(() => {
    if (!mapRef.current) return;

    if (!leafletMapRef.current) {
      const map = L.map(mapRef.current, {
        center: [19.9975, 73.7898],
        zoom: 12,
        zoomControl: true,
      });

      // Crisp OpenStreetMap Light tiles
      const tileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; Nashik Municipal Corporation | OpenStreetMap',
        maxZoom: 19,
      }).addTo(map);

      tileLayerRef.current = tileLayer;
      markersLayerGroupRef.current = L.layerGroup().addTo(map);
      leafletMapRef.current = map;
    }

    return () => {
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
  }, []);

  // Render markers and polylines on map whenever data or filter changes
  useEffect(() => {
    const map = leafletMapRef.current;
    const layerGroup = markersLayerGroupRef.current;
    if (!map || !layerGroup) return;

    layerGroup.clearLayers();

    // 1. Render Road Construction Projects
    if (activeLayerFilter === 'ALL' || activeLayerFilter === 'PROJECTS') {
      filteredProjects.forEach((proj) => {
        const color = getStateColor(proj.state);

        const customIcon = L.divIcon({
          className: 'project-leaflet-marker',
          html: `
            <div style="
              background-color: ${color};
              width: 26px;
              height: 26px;
              border-radius: 50%;
              border: 3px solid #ffffff;
              box-shadow: 0 4px 10px rgba(0,0,0,0.35);
              display: flex;
              align-items: center;
              justify-content: center;
              cursor: pointer;
            ">
              <span style="color: white; font-size: 11px; font-weight: bold;">🛣️</span>
            </div>
          `,
          iconSize: [26, 26],
          iconAnchor: [13, 13],
        });

        const marker = L.marker(proj.coordinates, { icon: customIcon });

        const popupContent = `
          <div style="width: 250px; font-family: Inter, sans-serif; color: #0f172a;">
            <div style="font-size: 11px; font-weight: 700; color: ${color}; text-transform: uppercase; margin-bottom: 4px; display: flex; justify-content: space-between;">
              <span>${proj.ward} Ward</span>
              <span style="background: #e2e8f0; padding: 2px 6px; border-radius: 4px;">${proj.state}</span>
            </div>
            <h4 style="font-size: 13px; font-weight: 700; color: #0f172a; margin: 0 0 6px 0; line-height: 1.3;">
              ${language === 'mr' ? proj.roadNameMr : proj.roadName}
            </h4>
            <div style="font-size: 11px; color: #475569; margin-bottom: 6px; line-height: 1.4;">
              <strong>Contractor:</strong> ${proj.contractor}<br/>
              <strong>Budget:</strong> ${proj.budgetInr}<br/>
              <strong>DLP Warranty:</strong> ${proj.dlpPeriod}
            </div>
          </div>
        `;

        marker.bindPopup(popupContent, { maxWidth: 280 });
        marker.on('click', () => setSelectedItem({ type: 'PROJECT', data: proj }));
        layerGroup.addLayer(marker);

        if (proj.polylineCoordinates && proj.polylineCoordinates.length > 0) {
          const polyline = L.polyline(proj.polylineCoordinates, {
            color: color,
            weight: 6,
            opacity: 0.85,
            dashArray: proj.state === 'TRENCHING' ? '10, 10' : undefined,
          });
          polyline.bindPopup(popupContent, { maxWidth: 280 });
          layerGroup.addLayer(polyline);
        }
      });
    }

    // 2. Render Citizen Complaint Markers
    if (activeLayerFilter === 'ALL' || activeLayerFilter === 'COMPLAINTS') {
      filteredTickets.forEach((ticket) => {
        const pinColor = getHazardPinColor(ticket);

        const complaintIcon = L.divIcon({
          className: 'complaint-leaflet-marker',
          html: `
            <div style="
              background-color: ${pinColor};
              width: 30px;
              height: 30px;
              border-radius: 50% 50% 50% 0;
              transform: rotate(-45deg);
              border: 3px solid #ffffff;
              box-shadow: 0 4px 12px rgba(0,0,0,0.4);
              display: flex;
              align-items: center;
              justify-content: center;
              cursor: pointer;
            ">
              <span style="transform: rotate(45deg); font-size: 12px; color: white;">⚠️</span>
            </div>
          `,
          iconSize: [30, 30],
          iconAnchor: [15, 30],
        });

        const marker = L.marker(ticket.coordinates, { icon: complaintIcon });

        const photoHtml = ticket.beforePhoto ? `
          <div style="margin-top: 6px; height: 90px; border-radius: 8px; overflow: hidden; border: 1px solid #cbd5e1;">
            <img src="${ticket.beforePhoto}" style="width: 100%; height: 100%; object-fit: cover;" alt="Evidence" />
          </div>
        ` : '';

        const popupContent = `
          <div style="width: 250px; font-family: Inter, sans-serif; color: #0f172a;">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;">
              <span style="font-size: 11px; font-weight: 800; color: #059669; font-family: monospace;">${ticket.ticketNumber}</span>
              <span style="font-size: 10px; font-weight: 700; background: #fee2e2; color: #b91c1c; padding: 2px 6px; border-radius: 4px;">${ticket.status}</span>
            </div>
            <h4 style="font-size: 13px; font-weight: 800; color: #0f172a; margin: 0 0 4px 0; line-height: 1.3;">
              ${ticket.title}
            </h4>
            <div style="font-size: 11px; color: #475569; line-height: 1.4;">
              <strong>Ward:</strong> ${ticket.ward}<br/>
              <strong>Location:</strong> ${ticket.location}<br/>
              <strong>Dept:</strong> ${ticket.department}
            </div>
            ${photoHtml}
          </div>
        `;

        marker.bindPopup(popupContent, { maxWidth: 280 });
        marker.on('click', () => setSelectedItem({ type: 'TICKET', data: ticket }));
        layerGroup.addLayer(marker);
      });
    }

    // Pan map to first item if available
    if (filteredTickets.length > 0 && activeLayerFilter !== 'PROJECTS') {
      map.panTo(filteredTickets[0].coordinates);
    } else if (filteredProjects.length > 0) {
      map.panTo(filteredProjects[0].coordinates);
    }
  }, [filteredProjects, filteredTickets, activeLayerFilter, language]);

  return (
    <section className="bg-slate-100 border-b border-slate-200 py-6 px-4">
      <div className="max-w-7xl mx-auto space-y-4">
        
        {/* Title & Filter Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-emerald-600" />
              <h3 className="text-lg md:text-xl font-extrabold text-slate-900">
                {t.gisMapTitle}
              </h3>
            </div>
            <p className="text-xs text-slate-600 font-medium mt-0.5">
              Live GIS map showing registered citizen complaints & municipal road works across Nashik
            </p>
          </div>

          {/* Layer and Status Filters */}
          <div className="flex items-center gap-2 flex-wrap text-xs">
            {/* Layer Select */}
            <div className="flex items-center bg-white border border-slate-300 rounded-xl p-1 shadow-sm">
              <span className="text-slate-500 font-bold px-2 flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-slate-700" /> Layer:
              </span>
              <button
                onClick={() => setActiveLayerFilter('ALL')}
                className={`px-2.5 py-1 rounded-lg font-bold transition ${
                  activeLayerFilter === 'ALL'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                All ({filteredProjects.length + filteredTickets.length})
              </button>
              <button
                onClick={() => setActiveLayerFilter('COMPLAINTS')}
                className={`px-2.5 py-1 rounded-lg font-bold transition flex items-center gap-1 ${
                  activeLayerFilter === 'COMPLAINTS'
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'text-rose-700 hover:bg-rose-50'
                }`}
              >
                ⚠️ Complaints ({filteredTickets.length})
              </button>
              <button
                onClick={() => setActiveLayerFilter('PROJECTS')}
                className={`px-2.5 py-1 rounded-lg font-bold transition flex items-center gap-1 ${
                  activeLayerFilter === 'PROJECTS'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-blue-700 hover:bg-blue-50'
                }`}
              >
                🛣️ Road Works ({filteredProjects.length})
              </button>
            </div>

            {/* Lifecycle Filter */}
            {activeLayerFilter !== 'COMPLAINTS' && (
              <div className="flex items-center bg-white border border-slate-300 rounded-xl p-1 shadow-sm">
                <button
                  onClick={() => setSelectedStateFilter('ALL')}
                  className={`px-2 py-1 rounded-lg font-bold transition ${
                    selectedStateFilter === 'ALL' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  All States
                </button>
                <button
                  onClick={() => setSelectedStateFilter('TRENCHING')}
                  className={`px-2 py-1 rounded-lg font-bold text-red-600 hover:bg-red-50 transition ${
                    selectedStateFilter === 'TRENCHING' ? 'bg-red-600 text-white' : ''
                  }`}
                >
                  🔴 Trenching
                </button>
                <button
                  onClick={() => setSelectedStateFilter('CONCRETING')}
                  className={`px-2 py-1 rounded-lg font-bold text-amber-600 hover:bg-amber-50 transition ${
                    selectedStateFilter === 'CONCRETING' ? 'bg-amber-600 text-white' : ''
                  }`}
                >
                  🟡 Concreting
                </button>
                <button
                  onClick={() => setSelectedStateFilter('COMPLETED')}
                  className={`px-2 py-1 rounded-lg font-bold text-emerald-600 hover:bg-emerald-50 transition ${
                    selectedStateFilter === 'COMPLETED' ? 'bg-emerald-600 text-white' : ''
                  }`}
                >
                  🟢 Verified
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Map Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Leaflet Map Container */}
          <div className="lg:col-span-2 relative h-[500px] rounded-3xl overflow-hidden border border-slate-300 shadow-xl bg-white">
            <div ref={mapRef} className="w-full h-full" />

            {/* Floating Legend */}
            <div className="absolute bottom-4 left-4 z-[10] p-3 rounded-2xl shadow-xl text-xs space-y-1.5 backdrop-blur bg-white/95 border border-slate-300 text-slate-900">
              <div className="font-extrabold text-[11px] text-slate-800 border-b border-slate-200 pb-1 flex items-center justify-between">
                <span>Map Legend</span>
                <span className="text-[10px] text-emerald-600 font-bold">Live Data</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-600"></span>
                <span>Citizen Complaint (⚠️ Live)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-500"></span>
                <span>Road Trenching / Excavation</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-amber-500"></span>
                <span>Concreting / Asphalting</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                <span>Completed & Verified Work</span>
              </div>
            </div>
          </div>

          {/* Right Side Detail Card */}
          <div className="bg-white border border-slate-300 rounded-3xl p-5 flex flex-col justify-between h-[500px] overflow-y-auto shadow-xl">
            {selectedItem ? (
              selectedItem.type === 'TICKET' ? (
                /* Ticket Detail View */
                <div className="space-y-4">
                  <div className="border-b border-slate-200 pb-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-mono font-extrabold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-lg border border-emerald-300">
                        {selectedItem.data.ticketNumber}
                      </span>
                      <span className="text-[11px] font-bold bg-rose-100 text-rose-800 px-2 py-0.5 rounded-lg border border-rose-200">
                        {selectedItem.data.status}
                      </span>
                    </div>
                    <h4 className="text-base font-extrabold text-slate-900 leading-snug mt-2">
                      {selectedItem.data.title}
                    </h4>
                    <p className="text-xs font-semibold text-slate-500 flex items-center gap-1 mt-1">
                      <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                      {selectedItem.data.location} ({selectedItem.data.ward} Ward)
                    </p>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                      <span className="font-bold text-slate-600">Department:</span>
                      <span className="font-extrabold text-slate-900">{selectedItem.data.department}</span>
                    </div>
                    <div className="flex justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                      <span className="font-bold text-slate-600">Assigned Engineer:</span>
                      <span className="font-bold text-slate-800">{selectedItem.data.assignedEngineer}</span>
                    </div>
                    <div className="flex justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                      <span className="font-bold text-slate-600">Submitted:</span>
                      <span className="font-bold text-slate-800">{selectedItem.data.submittedDate}</span>
                    </div>
                    <div className="flex justify-between p-2.5 rounded-xl bg-emerald-50 border border-emerald-200">
                      <span className="font-bold text-emerald-700 flex items-center gap-1">
                        <ThumbsUp className="w-3.5 h-3.5" /> Citizen Upvotes (+1):
                      </span>
                      <span className="font-extrabold text-emerald-800">{selectedItem.data.plusOneCount} Votes</span>
                    </div>
                  </div>

                  {selectedItem.data.beforePhoto && (
                    <div>
                      <span className="text-xs font-bold text-slate-700 block mb-1.5 flex items-center gap-1">
                        <Eye className="w-3.5 h-3.5 text-emerald-600" /> Geotagged Photo Evidence:
                      </span>
                      <div className="h-40 rounded-2xl overflow-hidden border border-slate-300 shadow-sm">
                        <img
                          src={selectedItem.data.beforePhoto}
                          alt="Citizen Evidence"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* Project Detail View */
                <div className="space-y-4">
                  <div className="border-b border-slate-200 pb-3">
                    <span className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-lg bg-blue-100 text-blue-800 border border-blue-300 uppercase">
                      {selectedItem.data.state}
                    </span>
                    <h4 className="text-base font-extrabold text-slate-900 mt-2">
                      {language === 'mr' ? selectedItem.data.roadNameMr : selectedItem.data.roadName}
                    </h4>
                    <p className="text-xs font-bold text-emerald-700 flex items-center gap-1 mt-1">
                      <MapPin className="w-3.5 h-3.5" />
                      {selectedItem.data.ward} Ward
                    </p>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                      <span className="font-bold text-slate-600 flex items-center gap-1">
                        <HardHat className="w-3.5 h-3.5 text-amber-500" /> Contractor:
                      </span>
                      <span className="font-bold text-slate-900">{selectedItem.data.contractor}</span>
                    </div>
                    <div className="flex justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                      <span className="font-bold text-slate-600 flex items-center gap-1">
                        <DollarSign className="w-3.5 h-3.5 text-emerald-500" /> Budget:
                      </span>
                      <span className="font-extrabold text-emerald-700">{selectedItem.data.budgetInr}</span>
                    </div>
                    <div className="flex justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                      <span className="font-bold text-slate-600 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5 text-blue-500" /> DLP Period:
                      </span>
                      <span className="font-bold text-blue-700">{selectedItem.data.dlpPeriod}</span>
                    </div>
                    <div className="flex justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                      <span className="font-bold text-slate-600 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-500" /> Target Date:
                      </span>
                      <span className="font-bold text-slate-900">{selectedItem.data.expectedCompletion}</span>
                    </div>
                  </div>

                  {selectedItem.data.progressPhoto && (
                    <div>
                      <span className="text-xs font-bold text-slate-700 block mb-1.5 flex items-center gap-1">
                        <Eye className="w-3.5 h-3.5 text-emerald-600" /> Road Progress Photo:
                      </span>
                      <div className="h-36 rounded-2xl overflow-hidden border border-slate-300 shadow-sm">
                        <img
                          src={selectedItem.data.progressPhoto}
                          alt="Road Progress"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500">
                <MapPin className="w-12 h-12 text-slate-300 mb-3 animate-pulse" />
                <p className="text-sm font-bold text-slate-800">Select any marker on the map</p>
                <p className="text-xs text-slate-500 mt-1 max-w-[220px]">
                  Click on any complaint pin (⚠️) or road project (🛣️) to inspect real geotagged evidence, DLP warranties, and department status.
                </p>
              </div>
            )}
          </div>
        </div>

      </div>
    </section>
  );
};
