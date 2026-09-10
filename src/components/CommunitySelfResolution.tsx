import React, { useState } from 'react';
import { WardName, Language, ThemeMode } from '../types';
import { translations } from '../data/translations';
import { Users, CheckCircle2, Award, Camera, Shield, Sparkles, ArrowRight, UploadCloud, ThumbsUp } from 'lucide-react';

interface CommunitySelfResolutionProps {
  language: Language;
  theme: ThemeMode;
  selectedWard: WardName;
}

interface SelfResolutionItem {
  id: string;
  title: string;
  titleMr: string;
  ward: WardName;
  location: string;
  category: string;
  reportedBy: string;
  status: 'OPEN_FOR_COMMUNITY' | 'RESOLVED_BY_CITIZEN';
  resolvedBy?: string;
  beforePhoto: string;
  afterPhoto?: string;
  pointsReward: number;
}

export const CommunitySelfResolution: React.FC<CommunitySelfResolutionProps> = ({
  language,
  theme,
  selectedWard,
}) => {
  const isDark = theme === 'dark';
  const t = translations[language];

  const initialItems: SelfResolutionItem[] = [
    {
      id: 'sr-101',
      title: 'Fallen Tree Branch Blocking Pedestrian Footpath',
      titleMr: 'पादचारी मार्गावर पडलेली झाडाची फांदी',
      ward: 'Panchavati',
      location: 'Nimani Bus Stand Corner, Ward 1',
      category: 'Debris Removal',
      reportedBy: 'NMC Ward Patrol',
      status: 'RESOLVED_BY_CITIZEN',
      resolvedBy: 'Kedar Joshi & Local Youth Club',
      beforePhoto: 'https://images.unsplash.com/photo-1544725121-be3bf52e2dc8?w=600&auto=format&fit=crop&q=80',
      afterPhoto: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=600&auto=format&fit=crop&q=80',
      pointsReward: 150,
    },
    {
      id: 'sr-102',
      title: 'Uncovered Small Drainage Hole Alert',
      titleMr: 'उघडे गटार धोका इशारा',
      ward: 'Nashik West',
      location: 'College Road, Lane 4 Junction',
      category: 'Safety Barrier Placement',
      reportedBy: 'Citizen Alert',
      status: 'OPEN_FOR_COMMUNITY',
      beforePhoto: 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?w=600&auto=format&fit=crop&q=80',
      pointsReward: 200,
    },
    {
      id: 'sr-103',
      title: 'Illegal Poster Cleanliness Drive',
      titleMr: 'अनधिकृत पोस्टर्स स्वच्छता मोहीम',
      ward: 'Cidco',
      location: 'Pavan Nagar Square',
      category: 'Cleanliness Drive',
      reportedBy: 'Swachh Nashik Forum',
      status: 'OPEN_FOR_COMMUNITY',
      beforePhoto: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=600&auto=format&fit=crop&q=80',
      pointsReward: 100,
    },
  ];

  const [items, setItems] = useState<SelfResolutionItem[]>(initialItems);
  const [activeClaimId, setActiveClaimId] = useState<string | null>(null);
  const [claimName, setClaimName] = useState('');
  const [photoAttached, setPhotoAttached] = useState(false);

  const handleResolveSubmit = (id: string) => {
    if (!claimName.trim()) return;

    setItems((prev) =>
      prev.map((it) => {
        if (it.id === id) {
          return {
            ...it,
            status: 'RESOLVED_BY_CITIZEN',
            resolvedBy: claimName,
            afterPhoto: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=600&auto=format&fit=crop&q=80',
          };
        }
        return it;
      })
    );

    setActiveClaimId(null);
    setClaimName('');
    setPhotoAttached(false);
  };

  const filteredItems = selectedWard === 'All Wards'
    ? items
    : items.filter((it) => it.ward === selectedWard);

  return (
    <section className={`py-8 px-4 border-b transition-colors duration-300 ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-100 border-slate-200'}`}>
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-600 p-0.5 shadow-lg flex items-center justify-center">
              <div className={`w-full h-full rounded-[14px] flex items-center justify-center ${isDark ? 'bg-slate-950 text-emerald-400' : 'bg-white text-emerald-600'}`}>
                <Users className="w-6 h-6" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className={`text-xl font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {language === 'mr' ? 'नागरिक स्व-निवारण उपक्रम (Public Self-Resolution)' : 'Community Self-Resolution Hub'}
                </h2>
                <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-mono font-bold px-2 py-0.5 rounded-md">
                  Future Aspect Feature
                </span>
              </div>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                {language === 'mr' ? 'नागरिक स्वतः छोट्या तक्रारींचे निवारण करून फोटो अपलोड करू शकतात' : 'Empowering citizens to resolve minor neighborhood issues & upload resolution proof'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1.5 rounded-xl text-xs text-emerald-400 font-bold">
            <Award className="w-4 h-4 text-emerald-400" />
            <span>Earn NMC Citizen Civic Badges</span>
          </div>
        </div>

        {/* Self Resolution Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {filteredItems.map((item) => {
            const isResolved = item.status === 'RESOLVED_BY_CITIZEN';
            const isClaiming = activeClaimId === item.id;

            return (
              <div 
                key={item.id} 
                className={`rounded-2xl border overflow-hidden flex flex-col justify-between transition-all ${
                  isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
                }`}
              >
                <div>
                  {/* Card Header Tag */}
                  <div className={`p-3 border-b flex items-center justify-between text-xs font-bold ${
                    isDark ? 'border-slate-800 bg-slate-950/60' : 'border-slate-100 bg-slate-50'
                  }`}>
                    <span className="text-emerald-400 font-mono">{item.category}</span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      isResolved 
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' 
                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                    }`}>
                      {isResolved ? '✓ Citizen Self-Resolved' : 'Open for Public Resolution'}
                    </span>
                  </div>

                  {/* Body Content */}
                  <div className="p-4 space-y-3">
                    <h3 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      {language === 'mr' ? item.titleMr : item.title}
                    </h3>

                    <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                      📍 {item.location} ({item.ward})
                    </p>

                    {/* Image comparison */}
                    <div className="grid grid-cols-2 gap-2">
                      <div className="rounded-xl overflow-hidden border border-slate-800 relative">
                        <img src={item.beforePhoto} alt="Before" className="w-full h-24 object-cover" />
                        <span className="absolute bottom-1 left-1 bg-black/70 text-white text-[9px] px-1.5 py-0.5 rounded font-mono font-bold">
                          Before Issue
                        </span>
                      </div>

                      {isResolved && item.afterPhoto ? (
                        <div className="rounded-xl overflow-hidden border border-emerald-500/40 relative">
                          <img src={item.afterPhoto} alt="After" className="w-full h-24 object-cover" />
                          <span className="absolute bottom-1 left-1 bg-emerald-600/90 text-white text-[9px] px-1.5 py-0.5 rounded font-mono font-bold">
                            Resolved Proof
                          </span>
                        </div>
                      ) : (
                        <div className={`rounded-xl border-2 border-dashed flex flex-col items-center justify-center p-2 text-center ${
                          isDark ? 'border-slate-800 text-slate-500 bg-slate-950/40' : 'border-slate-300 text-slate-400 bg-slate-50'
                        }`}>
                          <Camera className="w-5 h-5 mb-1" />
                          <span className="text-[10px] font-bold">Upload Fixed Photo</span>
                        </div>
                      )}
                    </div>

                    {isResolved && (
                      <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400 font-semibold flex items-center justify-between">
                        <span className="flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Resolved by: {item.resolvedBy}
                        </span>
                        <span className="font-mono font-bold text-[10px] bg-emerald-500/20 px-2 py-0.5 rounded">
                          +{item.pointsReward} Civic Pts
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer Action */}
                <div className={`p-4 border-t ${isDark ? 'border-slate-800 bg-slate-950/40' : 'border-slate-100 bg-slate-50'}`}>
                  {!isResolved && !isClaiming && (
                    <button
                      onClick={() => setActiveClaimId(item.id)}
                      className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white text-xs font-bold py-2 rounded-xl flex items-center justify-center gap-1.5 shadow transition"
                    >
                      <span>I Will Resolve This Issue</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  )}

                  {isClaiming && (
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={claimName}
                        onChange={(e) => setClaimName(e.target.value)}
                        placeholder="Enter your name / Youth Group name..."
                        className={`w-full text-xs p-2 rounded-xl border focus:outline-none focus:ring-1 focus:ring-emerald-500 ${
                          isDark ? 'bg-slate-950 text-white border-slate-800' : 'bg-white text-slate-900 border-slate-300'
                        }`}
                      />
                      <div 
                        onClick={() => setPhotoAttached(true)}
                        className={`cursor-pointer p-2 border border-dashed rounded-xl text-center text-xs flex items-center justify-center gap-1.5 ${
                          photoAttached ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400 font-bold' : isDark ? 'text-slate-400 border-slate-700' : 'text-slate-600 border-slate-300'
                        }`}
                      >
                        <UploadCloud className="w-3.5 h-3.5" />
                        <span>{photoAttached ? '✓ Resolution Photo Attached' : 'Click to Attach Resolution Proof Photo'}</span>
                      </div>
                      <div className="flex items-center gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => setActiveClaimId(null)}
                          className={`w-1/2 text-xs py-1.5 rounded-xl font-medium ${isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-200 text-slate-700'}`}
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => handleResolveSubmit(item.id)}
                          className="w-1/2 bg-emerald-500 hover:bg-emerald-400 text-white text-xs font-bold py-1.5 rounded-xl transition"
                        >
                          Submit Proof
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
