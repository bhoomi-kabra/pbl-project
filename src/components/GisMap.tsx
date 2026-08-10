import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { RoadWorkProject, WardName, LifecycleState, Language, ThemeMode } from '../types';
import { translations } from '../data/translations';
import { MapPin, Filter, AlertCircle, HardHat, DollarSign, Calendar, Eye } from 'lucide-react';

interface GisMapProps {
  projects: RoadWorkProject[];
  selectedWard: WardName;
  onSelectWard: (ward: WardName) => void;
  language: Language;
  theme: ThemeMode;
}

export const GisMap: React.FC<GisMapProps> = ({
  projects,
  selectedWard,
  onSelectWard,
  language,
  theme,
}) => {
  const t = translations[language];
  const mapRef = useRef<HTMLDivElement | null>(null);
  const leafletMapRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const markersLayerGroupRef = useRef<L.LayerGroup | null>(null);

  const [selectedStateFilter, setSelectedStateFilter] = useState<LifecycleState | 'ALL'>('ALL');
  const [activePopupProject, setActivePopupProject] = useState<RoadWorkProject | null>(null);

  const isDark = theme === 'dark';

  const filteredProjects = projects.filter((p) => {
    const wardMatch = selectedWard === 'All Wards' || p.ward === selectedWard;
    const stateMatch = selectedStateFilter === 'ALL' || p.state === selectedStateFilter;
    return wardMatch && stateMatch;
  });

  const getStateColor = (state: LifecycleState) => {
    switch (state) {
      case 'TRENCHING': return '#ef4444';
      case 'CONCRETING': return '#f59e0b';
      case 'CURING': return '#2563eb';
      case 'COMPLETED': return '#10b981';
    }
  };

  const getStateBadgeClass = (state: LifecycleState) => {
    switch (state) {
      case 'TRENCHING': return 'bg-red-500/10 text-red-600 border-red-500/30';
      case 'CONCRETING': return 'bg-amber-500/10 text-amber-600 border-amber-500/30';
      case 'CURING': return 'bg-blue-500/10 text-blue-600 border-blue-500/30';
      case 'COMPLETED': return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30';
    }
  };

  const getStateLabel = (state: LifecycleState) => {
    switch (state) {
      case 'TRENCHING': return t.trenching;
      case 'CONCRETING': return t.concreting;
      case 'CURING': return t.curing;
      case 'COMPLETED': return t.completed;
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

      const initialUrl = isDark
        ? 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png'
        : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

      const tileLayer = L.tileLayer(initialUrl, {
        attribution: '&copy; NMC Smart City',
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

  useEffect(() => {
    if (tileLayerRef.current) {
      const newUrl = isDark
        ? 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png'
        : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
      tileLayerRef.current.setUrl(newUrl);
    }
  }, [theme]);

  useEffect(() => {
    const map = leafletMapRef.current;
    const layerGroup = markersLayerGroupRef.current;
    if (!map || !layerGroup) return;

    layerGroup.clearLayers();

    filteredProjects.forEach((proj) => {
      const color = getStateColor(proj.state);

      const customIcon = L.divIcon({
        className: 'custom-leaflet-marker',
        html: `
          <div style="
            background-color: ${color};
            width: 24px;
            height: 24px;
            border-radius: 50%;
            border: 3px solid white;
            box-shadow: 0 4px 12px rgba(0,0,0,0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
          ">
            <div style="width: 6px; height: 6px; background-color: white; border-radius: 50%;"></div>
          </div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });

      const marker = L.marker(proj.coordinates, { icon: customIcon });

      const popupContent = `
        <div style="width: 260px; font-family: Inter, sans-serif;">
          <div style="font-size: 11px; font-weight: 700; color: ${color}; text-transform: uppercase; margin-bottom: 4px; display: flex; align-items: center; justify-content: space-between;">
            <span>${proj.ward}</span>
            <span style="background: rgba(255,255,255,0.1); padding: 2px 6px; border-radius: 4px;">${proj.state}</span>
          </div>
          <h4 style="font-size: 14px; font-weight: 700; color: #ffffff; margin: 0 0 6px 0; line-height: 1.3;">
            ${language === 'mr' ? proj.roadNameMr : proj.roadName}
          </h4>
          <div style="font-size: 12px; color: #cbd5e1; margin-bottom: 8px;">
            <strong>Contractor:</strong> ${proj.contractor}<br/>
            <strong>Budget:</strong> ${proj.budgetInr}<br/>
            <strong>DLP:</strong> ${proj.dlpPeriod}
          </div>
          <div style="position: relative; height: 110px; border-radius: 8px; overflow: hidden; margin-top: 6px; border: 1px solid #334155;">
            <img src="${proj.progressPhoto}" style="width: 100%; height: 100%; object-fit: cover;" />
            <div style="position: absolute; bottom: 4px; left: 4px; background: rgba(15,23,42,0.85); color: #10b981; padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: 600;">
              ✓ Geotagged Verified
            </div>
          </div>
        </div>
      `;

      marker.bindPopup(popupContent, { maxWidth: 300 });
      marker.on('click', () => setActivePopupProject(proj));
      layerGroup.addLayer(marker);

      if (proj.polylineCoordinates && proj.polylineCoordinates.length > 0) {
        const polyline = L.polyline(proj.polylineCoordinates, {
          color: color,
          weight: 6,
          opacity: 0.8,
          dashArray: proj.state === 'TRENCHING' ? '10, 10' : undefined,
        });
        polyline.bindPopup(popupContent, { maxWidth: 300 });
        layerGroup.addLayer(polyline);
      }
    });

    if (filteredProjects.length > 0) {
      map.panTo(filteredProjects[0].coordinates);
    }
  }, [filteredProjects, language]);

  return (
    <section className={`${isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-100 border-slate-200'} py-6 px-4 border-b transition-colors duration-300`}>
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <MapPin className={`w-5 h-5 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
              <h3 className={`text-lg md:text-xl font-extrabold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {t.gisMapTitle}
              </h3>
            </div>
            <p className={`text-xs mt-1 max-w-2xl font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              {t.gisMapSub}
            </p>
          </div>

          <div className={`flex items-center gap-2 flex-wrap p-1.5 rounded-xl border text-xs shadow-sm ${
            isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-300'
          }`}>
            <span className={`font-bold px-2 flex items-center gap-1 ${isDark ? 'text-slate-400' : 'text-slate-700'}`}>
              <Filter className="w-3.5 h-3.5" />
              {t.filterByLifecycle}
            </span>

            <button
              onClick={() => setSelectedStateFilter('ALL')}
              className={`px-3 py-1.5 rounded-lg font-bold transition ${
                selectedStateFilter === 'ALL'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : isDark ? 'text-slate-300 hover:bg-slate-800' : 'text-slate-800 bg-slate-100 hover:bg-slate-200'
              }`}
            >
              All ({projects.length})
            </button>

            <button
              onClick={() => setSelectedStateFilter('TRENCHING')}
              className={`px-3 py-1.5 rounded-lg font-bold transition ${
                selectedStateFilter === 'TRENCHING'
                  ? 'bg-red-600 text-white shadow-md'
                  : 'text-red-600 hover:bg-red-500/10'
              }`}
            >
              🔴 {t.trenching}
            </button>

            <button
              onClick={() => setSelectedStateFilter('CONCRETING')}
              className={`px-3 py-1.5 rounded-lg font-bold transition ${
                selectedStateFilter === 'CONCRETING'
                  ? 'bg-amber-600 text-white shadow-md'
                  : 'text-amber-700 hover:bg-amber-500/10'
              }`}
            >
              🟡 {t.concreting}
            </button>

            <button
              onClick={() => setSelectedStateFilter('CURING')}
              className={`px-3 py-1.5 rounded-lg font-bold transition ${
                selectedStateFilter === 'CURING'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-blue-700 hover:bg-blue-500/10'
              }`}
            >
              🔵 {t.curing}
            </button>

            <button
              onClick={() => setSelectedStateFilter('COMPLETED')}
              className={`px-3 py-1.5 rounded-lg font-bold transition ${
                selectedStateFilter === 'COMPLETED'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-emerald-700 hover:bg-emerald-500/10'
              }`}
            >
              🟢 {t.completed}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 relative h-[480px] rounded-2xl overflow-hidden border border-slate-400 shadow-2xl">
            <div ref={mapRef} className="w-full h-full" />

            <div className={`absolute bottom-4 left-4 z-[10] p-3 rounded-xl shadow-xl text-xs space-y-1.5 backdrop-blur border font-semibold ${
              isDark ? 'bg-slate-900/90 border-slate-800 text-slate-200' : 'bg-white/95 border-slate-300 text-slate-900 shadow-lg'
            }`}>
              <div className={`font-bold mb-1 border-b pb-1 ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
                Map Legend
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-500"></span>
                <span>Trenching / Excavation</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-amber-500"></span>
                <span>Concreting / Asphalting</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                <span>Water Curing Phase</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                <span>Completed & Verified</span>
              </div>
            </div>
          </div>

          <div className={`border rounded-2xl p-5 flex flex-col justify-between h-[480px] overflow-y-auto ${
            isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-300 text-slate-900 shadow-xl'
          }`}>
            {activePopupProject ? (
              <div className="space-y-4">
                <div className={`flex justify-between items-start border-b pb-3 ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
                  <div>
                    <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded border uppercase ${getStateBadgeClass(activePopupProject.state)}`}>
                      {getStateLabel(activePopupProject.state)}
                    </span>
                    <h4 className={`text-base font-extrabold mt-1.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      {language === 'mr' ? activePopupProject.roadNameMr : activePopupProject.roadName}
                    </h4>
                    <p className={`text-xs font-bold flex items-center gap-1 mt-0.5 ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>
                      <MapPin className="w-3 h-3" />
                      {activePopupProject.ward} Ward
                    </p>
                  </div>
                </div>

                <div className="space-y-2.5 text-xs">
                  <div className={`flex items-center justify-between p-2.5 rounded-xl border ${
                    isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
                  }`}>
                    <span className={`flex items-center gap-1.5 font-bold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                      <HardHat className="w-3.5 h-3.5 text-amber-500" />
                      {t.contractor}
                    </span>
                    <span className={`font-bold text-right ${isDark ? 'text-white' : 'text-slate-900'}`}>{activePopupProject.contractor}</span>
                  </div>

                  <div className={`flex items-center justify-between p-2.5 rounded-xl border ${
                    isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
                  }`}>
                    <span className={`flex items-center gap-1.5 font-bold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                      <DollarSign className="w-3.5 h-3.5 text-emerald-500" />
                      {t.budget}
                    </span>
                    <span className="font-extrabold text-emerald-600">{activePopupProject.budgetInr}</span>
                  </div>

                  <div className={`flex items-center justify-between p-2.5 rounded-xl border ${
                    isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
                  }`}>
                    <span className={`flex items-center gap-1.5 font-bold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                      <AlertCircle className="w-3.5 h-3.5 text-blue-500" />
                      {t.dlp}
                    </span>
                    <span className={`font-bold ${isDark ? 'text-blue-300' : 'text-blue-700'}`}>{activePopupProject.dlpPeriod}</span>
                  </div>

                  <div className={`flex items-center justify-between p-2.5 rounded-xl border ${
                    isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
                  }`}>
                    <span className={`flex items-center gap-1.5 font-bold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {t.completion}
                    </span>
                    <span className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{activePopupProject.expectedCompletion}</span>
                  </div>
                </div>

                <div>
                  <label className={`text-xs font-bold mb-1.5 flex items-center gap-1 ${isDark ? 'text-slate-400' : 'text-slate-700'}`}>
                    <Eye className="w-3.5 h-3.5 text-emerald-500" />
                    {t.progressPhoto}
                  </label>
                  <div className="relative h-40 rounded-xl overflow-hidden border border-slate-300 group shadow-md">
                    <img
                      src={activePopupProject.progressPhoto}
                      alt="Progress"
                      className="w-full h-full object-cover transition duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80" />
                    <div className="absolute bottom-2 left-2 right-2 text-slate-200 text-[11px] p-2 bg-slate-900/90 backdrop-blur rounded-lg border border-slate-800">
                      <p className="line-clamp-2">{language === 'mr' ? activePopupProject.descriptionMr : activePopupProject.description}</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500">
                <MapPin className="w-12 h-12 text-slate-400 mb-3 animate-pulse" />
                <p className={`text-sm font-bold ${isDark ? 'text-slate-300' : 'text-slate-900'}`}>Click any marker or line on the GIS map</p>
                <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  Inspect road project budget, DLP contract liability, and geotagged contractor evidence.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
