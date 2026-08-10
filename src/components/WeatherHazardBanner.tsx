import React, { useState, useEffect } from 'react';
import { Language, ThemeMode } from '../types';
import { CloudRain, Zap, Radio, Play, Pause, AlertTriangle, RefreshCw, Thermometer, Wind, Droplets } from 'lucide-react';

interface WeatherHazardBannerProps {
  language: Language;
  theme: ThemeMode;
  isLiveStreaming: boolean;
  onToggleStreaming: () => void;
  onTriggerManualSimulatedReport: () => void;
}

interface NashikWeatherData {
  temp: number;
  humidity: number;
  condition: string;
  conditionMr: string;
  rainfallMm: number;
  hazardRiskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export const WeatherHazardBanner: React.FC<WeatherHazardBannerProps> = ({
  language,
  theme,
  isLiveStreaming,
  onToggleStreaming,
  onTriggerManualSimulatedReport,
}) => {
  const isDark = theme === 'dark';

  const [weatherData] = useState<NashikWeatherData>({
    temp: 27.4,
    humidity: 88,
    condition: 'Monsoon Showers & Overcast',
    conditionMr: 'पावसाची शक्यता आणि ढगाळ हवामान',
    rainfallMm: 34.2,
    hazardRiskLevel: 'HIGH',
  });

  const [lastDispatchedTime, setLastDispatchedTime] = useState<string>('Just now');

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setLastDispatchedTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className={`border-b transition-colors duration-300 ${
      isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-slate-100 border-slate-200 text-slate-900'
    }`}>
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          
          {/* Weather & Hazard Alert Pill */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2 bg-blue-500/10 text-blue-500 px-3 py-1.5 rounded-xl border border-blue-500/30 font-bold">
              <CloudRain className="w-4 h-4 animate-bounce" />
              <span>Nashik Live Weather: {weatherData.temp}°C</span>
              <span className="opacity-60">•</span>
              <span className="flex items-center gap-1">
                <Droplets className="w-3.5 h-3.5" />
                {weatherData.humidity}% Humidity ({weatherData.rainfallMm} mm/h)
              </span>
            </div>

            {/* Monsoon Risk Banner Alert */}
            <div className="flex items-center gap-2 bg-amber-500/10 text-amber-600 px-3 py-1.5 rounded-xl border border-amber-500/30 font-bold">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <span>
                {language === 'mr'
                  ? 'पावसामुळे रस्ते खड्डे धोका सूचना: उच्च सतर्कता'
                  : 'Monsoon Pothole & Submersion Hazard Risk: HIGH (Panchavati & Cidco)'}
              </span>
            </div>
          </div>

          {/* Presentation Jury Demo Live Streamer Bar */}
          <div className="flex items-center gap-2">
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border font-mono font-bold ${
              isLiveStreaming
                ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/40'
                : isDark ? 'bg-slate-800 text-slate-400 border-slate-700' : 'bg-white text-slate-600 border-slate-300'
            }`}>
              <Radio className={`w-3.5 h-3.5 ${isLiveStreaming ? 'text-emerald-500 animate-pulse' : 'text-slate-400'}`} />
              <span>
                {isLiveStreaming ? 'LIVE COMPLAINT STREAMER: ACTIVE' : 'STREAMER: PAUSED'}
              </span>
            </div>

            {/* Streamer Toggle Switch */}
            <button
              onClick={onToggleStreaming}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold transition shadow-sm ${
                isLiveStreaming
                  ? 'bg-amber-600 hover:bg-amber-500 text-white'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white'
              }`}
              title={isLiveStreaming ? 'Pause Auto Simulation' : 'Start Auto Live Stream'}
            >
              {isLiveStreaming ? (
                <>
                  <Pause className="w-3.5 h-3.5" /> Pause
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5" /> Start Auto Stream
                </>
              )}
            </button>

            {/* Manual One-Click Trigger for Demo */}
            <button
              onClick={onTriggerManualSimulatedReport}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-md transition transform active:scale-95 border border-blue-400/30"
              title="Inject Instant Geotagged Complaint for Demo"
            >
              <Zap className="w-3.5 h-3.5 text-amber-300" />
              <span>Simulate Incident</span>
            </button>
          </div>

        </div>
      </div>
    </section>
  );
};
