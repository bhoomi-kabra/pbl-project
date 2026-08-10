import React, { useState } from 'react';
import { Language, ThemeMode } from '../types';
import { translations } from '../data/translations';
import { Shield, Navigation, Trash2, PhoneCall, Check, AlertOctagon, Phone } from 'lucide-react';

interface CivicSafetyRulesProps {
  language: Language;
  theme: ThemeMode;
}

export const CivicSafetyRules: React.FC<CivicSafetyRulesProps> = ({ language, theme }) => {
  const t = translations[language];
  const [activeTab, setActiveTab] = useState<'traffic' | 'waste' | 'emergency'>('traffic');

  const isDark = theme === 'dark';

  return (
    <section className={`${isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-100 border-slate-200'} py-8 px-4 border-b transition-colors duration-300`}>
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-500">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h3 className={`text-lg md:text-xl font-extrabold ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {t.civicSafetyTitle}
            </h3>
            <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              {language === 'mr' 
                ? 'सुरक्षित आणि स्वच्छ नाशिकसाठी नागरिक मार्गदर्शक सूचना आणि आपत्कालीन संपर्क.' 
                : 'Essential citizen guidelines for safe commuting, clean environment, and immediate emergency response.'}
            </p>
          </div>
        </div>

        <div className={`flex items-center gap-2 border-b pb-3 mb-6 overflow-x-auto ${isDark ? 'border-slate-800' : 'border-slate-300'}`}>
          <button
            onClick={() => setActiveTab('traffic')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs md:text-sm transition ${
              activeTab === 'traffic'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20'
                : isDark ? 'bg-slate-800/60 text-slate-400 hover:text-white' : 'bg-white text-slate-700 hover:bg-slate-200 shadow-sm'
            }`}
          >
            <Navigation className="w-4 h-4" />
            <span>{t.tabTraffic}</span>
          </button>

          <button
            onClick={() => setActiveTab('waste')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs md:text-sm transition ${
              activeTab === 'waste'
                ? 'bg-teal-600 text-white shadow-lg shadow-teal-600/20'
                : isDark ? 'bg-slate-800/60 text-slate-400 hover:text-white' : 'bg-white text-slate-700 hover:bg-slate-200 shadow-sm'
            }`}
          >
            <Trash2 className="w-4 h-4" />
            <span>{t.tabWaste}</span>
          </button>

          <button
            onClick={() => setActiveTab('emergency')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs md:text-sm transition ${
              activeTab === 'emergency'
                ? 'bg-red-600 text-white shadow-lg shadow-red-600/20'
                : isDark ? 'bg-slate-800/60 text-slate-400 hover:text-white' : 'bg-white text-slate-700 hover:bg-slate-200 shadow-sm'
            }`}
          >
            <PhoneCall className="w-4 h-4" />
            <span>{t.tabEmergency}</span>
          </button>
        </div>

        {/* TAB 1: TRAFFIC & ROAD SAFETY */}
        {activeTab === 'traffic' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-in fade-in duration-300">
            <div className={`border rounded-2xl p-5 transition ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200 shadow-md'}`}>
              <div className="flex items-center gap-2.5 text-amber-500 font-bold text-sm mb-2">
                <AlertOctagon className="w-5 h-5" />
                <span>{language === 'mr' ? 'वेग मर्यादा नियमावली' : 'Speed Limit Guidelines'}</span>
              </div>
              <p className={`text-xs leading-relaxed mb-3 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                {language === 'mr'
                  ? 'शहरांतर्गत रस्त्यांवर कमाल ४० किमी/तास आणि नाशिक-पुणे/मुंबई महामार्गावर कमाल ६० किमी/तास मर्यादा अनिवार्य आहे.'
                  : 'Strict speed enforcement: Max 40 km/h on inner city arterial roads (College Rd, Gangapur Rd) and 60 km/h on highways.'}
              </p>
              <div className="text-[11px] text-emerald-500 font-medium bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                ✓ Automated ANPR Camera Monitored
              </div>
            </div>

            <div className={`border rounded-2xl p-5 transition ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200 shadow-md'}`}>
              <div className="flex items-center gap-2.5 text-emerald-500 font-bold text-sm mb-2">
                <Shield className="w-5 h-5" />
                <span>{language === 'mr' ? 'हेल्मेट आणि सीटबेल्ट बंधनकारक' : 'Mandatory Helmet & Safety'}</span>
              </div>
              <p className={`text-xs leading-relaxed mb-3 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                {language === 'mr'
                  ? 'दुचाकीस्वारांसाठी आयएसआय मार्क हेल्मेट आणि चारचाकी वाहनांसाठी सीटबेल्ट लावणे कायदेशीररित्या बंधनकारक आहे.'
                  : 'ISI-marked helmets mandatory for both rider and pillion across all 6 NMC wards. ₹1,000 fine for non-compliance.'}
              </p>
              <div className="text-[11px] text-emerald-500 font-medium bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                ✓ Zero Tolerance Road Safety Norm
              </div>
            </div>

            <div className={`border rounded-2xl p-5 transition ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200 shadow-md'}`}>
              <div className="flex items-center gap-2.5 text-blue-500 font-bold text-sm mb-2">
                <Navigation className="w-5 h-5" />
                <span>{language === 'mr' ? 'नो-पार्किंग व झेब्रा क्रॉसिंग' : 'Parking & Zebra Crossing'}</span>
              </div>
              <p className={`text-xs leading-relaxed mb-3 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                {language === 'mr'
                  ? 'वाहतुकीला अडथळा ठरेल अशा ठिकाणी पार्किंग न करता नियुक्त मनपा पे-अँड-पार्क जागांचाच वापर करा.'
                  : 'Never block stormwater channels or park within 15m of intersections (Dwarka, CBS, Trimurti Chowk).'}
              </p>
              <div className="text-[11px] text-emerald-500 font-medium bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                ✓ Pedestrian Priority Crossing
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: WASTE SEGREGATION & SANITATION */}
        {activeTab === 'waste' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-in fade-in duration-300">
            <div className={`border rounded-2xl p-5 transition ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200 shadow-md'}`}>
              <div className="flex items-center gap-2.5 text-emerald-500 font-bold text-sm mb-2">
                <Trash2 className="w-5 h-5" />
                <span>{language === 'mr' ? '३-डबा कचरा वर्गीकरण' : '3-Bin Waste Segregation'}</span>
              </div>
              <p className={`text-xs leading-relaxed mb-3 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                {language === 'mr'
                  ? 'ओला कचरा (हिरवा डबा), सुका कचरा (निळा डबा) आणि घातक इलेक्ट्रॉनिक कचरा (लाल डबा) वेगळा ठेवा.'
                  : 'Mandatory 3-Bin System: Green for Organic Wet Waste, Blue for Dry Recyclables, Red for Hazardous/E-Waste.'}
              </p>
              <div className="text-[11px] text-emerald-500 font-medium bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                ✓ 100% Home Segregation Rule
              </div>
            </div>

            <div className={`border rounded-2xl p-5 transition ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200 shadow-md'}`}>
              <div className="flex items-center gap-2.5 text-amber-500 font-bold text-sm mb-2">
                <AlertOctagon className="w-5 h-5" />
                <span>{language === 'mr' ? 'नाल्यांमध्ये कचरा टाकण्यास सक्त मनाई' : 'No Drain Dumping Rule'}</span>
              </div>
              <p className={`text-xs leading-relaxed mb-3 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                {language === 'mr'
                  ? 'गटारे व पावसाळी वाहिन्यांमध्ये कचरा किंवा प्लास्टिक टाकल्यास ₹५,००० पर्यंत दंडात्मक कारवाई होईल.'
                  : 'Dumping debris or plastic in open drains causes severe monsoon logging in Panchavati & Cidco lowlands.'}
              </p>
              <div className="text-[11px] text-amber-500 font-medium bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20">
                ⚠️ Strict Penal Offense under NMC Act
              </div>
            </div>

            <div className={`border rounded-2xl p-5 transition ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200 shadow-md'}`}>
              <div className="flex items-center gap-2.5 text-teal-500 font-bold text-sm mb-2">
                <Check className="w-5 h-5" />
                <span>{language === 'mr' ? 'घंटा गाडी वेळपत्रक' : 'Ghanta Gadi Timing'}</span>
              </div>
              <p className={`text-xs leading-relaxed mb-3 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                {language === 'mr'
                  ? 'दररोज सकाळी ७:०० ते ११:०० दरम्यान आपल्या प्रभागात येणाऱ्या मनपा घंटा गाडीतच कचरा द्यावा.'
                  : 'NMC Ghanta Gadi visits all 6 wards daily between 7:00 AM - 11:00 AM. Track vehicle live in NMC app.'}
              </p>
              <div className="text-[11px] text-teal-500 font-medium bg-teal-500/10 px-2.5 py-1 rounded-lg border border-teal-500/20">
                ✓ Daily Live GPS Vehicle Tracking
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: EMERGENCY NUMBERS */}
        {activeTab === 'emergency' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-in fade-in duration-300">
            <div className={`border rounded-2xl p-4 flex flex-col justify-between transition ${isDark ? 'bg-slate-950 border-red-500/30' : 'bg-white border-red-300 shadow-md'}`}>
              <div>
                <span className="text-[10px] font-bold text-red-500 bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20 uppercase">
                  MSEDCL Power Hazard
                </span>
                <h4 className={`text-sm font-bold mt-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>1912 / 1800-233-3435</h4>
                <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Sparking wires, transformer fires & power outages.</p>
              </div>
              <a
                href="tel:1912"
                className="mt-4 w-full bg-red-600 hover:bg-red-500 text-white font-bold text-xs py-2 rounded-xl flex items-center justify-center gap-1.5 shadow-md"
              >
                <Phone className="w-3.5 h-3.5" /> Call 1912
              </a>
            </div>

            <div className={`border rounded-2xl p-4 flex flex-col justify-between transition ${isDark ? 'bg-slate-950 border-emerald-500/30' : 'bg-white border-emerald-300 shadow-md'}`}>
              <div>
                <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 uppercase">
                  NMC Toll-Free Civic Call
                </span>
                <h4 className={`text-sm font-bold mt-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>7030300300</h4>
                <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Pothole report, water leak, drainage backup hotline.</p>
              </div>
              <a
                href="tel:7030300300"
                className="mt-4 w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-2 rounded-xl flex items-center justify-center gap-1.5 shadow-md"
              >
                <Phone className="w-3.5 h-3.5" /> Call NMC 7030300300
              </a>
            </div>

            <div className={`border rounded-2xl p-4 flex flex-col justify-between transition ${isDark ? 'bg-slate-950 border-amber-500/30' : 'bg-white border-amber-300 shadow-md'}`}>
              <div>
                <span className="text-[10px] font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 uppercase">
                  Nashik Fire Brigade
                </span>
                <h4 className={`text-sm font-bold mt-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>101 / 0253-2590800</h4>
                <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Panchavati & Sharanpur Central Fire Station headquarters.</p>
              </div>
              <a
                href="tel:101"
                className="mt-4 w-full bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs py-2 rounded-xl flex items-center justify-center gap-1.5 shadow-md"
              >
                <Phone className="w-3.5 h-3.5" /> Call 101
              </a>
            </div>

            <div className={`border rounded-2xl p-4 flex flex-col justify-between transition ${isDark ? 'bg-slate-950 border-blue-500/30' : 'bg-white border-blue-300 shadow-md'}`}>
              <div>
                <span className="text-[10px] font-bold text-blue-500 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20 uppercase">
                  Disaster Control Room
                </span>
                <h4 className={`text-sm font-bold mt-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>0253-2578500</h4>
                <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>24x7 Flood monitoring & Godavari river emergency cell.</p>
              </div>
              <a
                href="tel:02532578500"
                className="mt-4 w-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs py-2 rounded-xl flex items-center justify-center gap-1.5 shadow-md"
              >
                <Phone className="w-3.5 h-3.5" /> Call Disaster Cell
              </a>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
