'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/AppContext';
import { Ward, Ticket } from '@/lib/types';
import { 
  MapPin, 
  Camera, 
  Users, 
  ShieldCheck, 
  ArrowRight, 
  Map, 
  Flag, 
  Languages, 
  HelpCircle, 
  ChevronLeft, 
  ChevronRight,
  MoreHorizontal
} from 'lucide-react';

interface LandingOverviewProps {
  onEnterPortal: (tab: string) => void;
  onInspectTicket?: (ticketId: string) => void;
  tickets?: Ticket[];
  onUpvote?: (ticketId: string) => void;
}

const NASHIK_CAROUSEL_IMAGES = [
  {
    url: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=1200&q=80',
    caption: 'Ramkund & Godavari Ghats, Panchavati'
  },
  {
    url: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=1200&q=80',
    caption: 'Godavari Riverbank Temple Ghats'
  },
  {
    url: 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?auto=format&fit=crop&w=1200&q=80',
    caption: 'Gangapur Road Smart Corridor'
  },
  {
    url: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=1200&q=80',
    caption: 'Pothole & Surface Inspection Belt'
  },
  {
    url: 'https://images.unsplash.com/photo-1621905251918-48416bd8575a?auto=format&fit=crop&w=1200&q=80',
    caption: 'Citizen Verified Bitumen Patch'
  },
  {
    url: 'https://images.unsplash.com/photo-1584467735871-8e85353a8413?auto=format&fit=crop&w=1200&q=80',
    caption: 'Drainage & Stormwater Inspection'
  },
  {
    url: 'https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?auto=format&fit=crop&w=1200&q=80',
    caption: 'Road Utility Repair Monitoring'
  },
  {
    url: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=1200&q=80',
    caption: 'Satpur MIDC Industrial Arterial Road'
  },
  {
    url: 'https://images.unsplash.com/photo-1541888946425-d0fbb186a5b2?auto=format&fit=crop&w=1200&q=80',
    caption: 'Culvert & Stormwater Network Inspection'
  },
  {
    url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=1200&q=80',
    caption: 'Ward Engineer Infrastructure Audit'
  },
  {
    url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1200&q=80',
    caption: 'Nashik Urban Civic Network'
  }
];

export default function LandingOverview({ 
  onEnterPortal, 
  onInspectTicket,
  tickets = []
}: LandingOverviewProps) {
  const { language, setLanguage, setIsComplaintModalOpen, setIsAuthModalOpen } = useApp();
  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % NASHIK_CAROUSEL_IMAGES.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + NASHIK_CAROUSEL_IMAGES.length) % NASHIK_CAROUSEL_IMAGES.length);
  };

  const scrollToHowItWorks = () => {
    const el = document.getElementById('how-it-works');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const activeCount = tickets.length > 0 ? tickets.filter(t => t.status !== 'OFFICIALLY_CLOSED').length : 2;
  const underVerificationCount = tickets.filter(t => t.status === 'VERIFICATION_PENDING').length;
  const reopenedCount = tickets.filter(t => t.status === 'REOPENED').length;

  return (
    <div className="w-full max-w-xl sm:max-w-2xl mx-auto bg-white dark:bg-[#0c1322] shadow-sm rounded-none sm:rounded-3xl overflow-hidden border border-slate-200/80 dark:border-slate-800 transition-colors">
      
      {/* ──────────────────────────────────────────────────────────── */}
      {/* 1. HERO SECTION (Exact 1:1 match with Image 1)               */}
      {/* ──────────────────────────────────────────────────────────── */}
      <section className="p-6 sm:p-8 space-y-5 bg-white dark:bg-[#0c1322]">
        
        {/* Red/Orange Location Pin Badge */}
        <div className="flex items-center gap-1.5 text-xs font-black text-[#d95b18] tracking-wider uppercase">
          <MapPin className="w-4 h-4 text-[#d95b18] fill-[#d95b18]" />
          <span>{language === 'mr' ? 'नाशिकसाठी. नाशिककरांतर्फे.' : 'FOR NASHIK. BY ITS CITIZENS.'}</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-[40px] sm:text-[52px] font-black text-[#111d2e] dark:text-slate-100 leading-[1.05] tracking-tight">
          {language === 'mr' ? (
            <>
              आपले शहर.<br />
              आपला आवाज.<br />
              <span className="text-[#d95b18]">खरी</span><br />
              <span className="text-[#d95b18]">उत्तरदायित्व.</span>
            </>
          ) : (
            <>
              Our city.<br />
              Our voice.<br />
              <span className="text-[#d95b18]">Real</span><br />
              <span className="text-[#d95b18]">accountability.</span>
            </>
          )}
        </h1>

        {/* Subtitle */}
        <p className="text-[15px] sm:text-[16px] text-[#4a5568] dark:text-slate-300 leading-snug">
          {language === 'mr'
            ? 'काय दुरुस्त करायचे ते नोंदवा. एकत्र पाठपुरावा करा. "बंद" म्हणजे खरोखर निराकरण असल्याची खात्री करा.'
            : 'Report what needs fixing. Follow it together. Make sure “closed” really means resolved.'}
        </p>

        {/* Primary CTA Button */}
        <div className="pt-2">
          <button
            onClick={() => onEnterPortal('feed')}
            className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-[#d95b18] hover:bg-[#c24e12] text-white font-extrabold text-[15px] shadow-sm transition active:scale-[0.98]"
          >
            <ArrowRight className="w-4 h-4" />
            <span>{language === 'mr' ? 'नागरी फीड उघडा' : 'Open Civic Feed'}</span>
          </button>
        </div>

        {/* "See how it works ↓" anchor link */}
        <div className="text-center pt-1">
          <button
            onClick={scrollToHowItWorks}
            className="text-[13px] font-bold text-[#111d2e] dark:text-slate-200 hover:text-[#d95b18] transition inline-flex items-center gap-1"
          >
            <span>{language === 'mr' ? 'हे कसे कार्य करते पहा ↓' : 'See how it works ↓'}</span>
          </button>
        </div>

        {/* Hero Image Carousel with < 1 / 11 > Badge */}
        <div className="relative mt-3 rounded-2xl overflow-hidden aspect-[16/10] bg-slate-100 dark:bg-slate-800 shadow-sm">
          <img
            src={NASHIK_CAROUSEL_IMAGES[currentSlide].url}
            alt={NASHIK_CAROUSEL_IMAGES[currentSlide].caption}
            className="w-full h-full object-cover transition-opacity duration-300"
          />
          
          {/* Subtle caption bottom shadow */}
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-3 pt-8 flex items-end justify-center">
            {/* Interactive Carousel Pill: < 1 / 11 > */}
            <div className="inline-flex items-center gap-3 px-3 py-1.5 rounded-full bg-black/75 backdrop-blur-md text-white text-xs font-semibold shadow-md">
              <button 
                onClick={prevSlide}
                className="hover:text-amber-400 p-0.5 transition"
                aria-label="Previous slide"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="tracking-widest font-mono text-[11px]">
                {currentSlide + 1} / {NASHIK_CAROUSEL_IMAGES.length}
              </span>
              <button 
                onClick={nextSlide}
                className="hover:text-amber-400 p-0.5 transition"
                aria-label="Next slide"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

      </section>

      {/* ──────────────────────────────────────────────────────────── */}
      {/* 2. "A small start. A shared view." (Exact match with Image 2)*/}
      {/* ──────────────────────────────────────────────────────────── */}
      <section id="how-it-works" className="p-6 sm:p-8 space-y-5 bg-white dark:bg-[#0c1322] border-t border-slate-100 dark:border-slate-800/80">
        <div className="space-y-1">
          <h2 className="text-[28px] sm:text-[32px] font-black text-[#111d2e] dark:text-slate-100 tracking-tight leading-tight">
            {language === 'mr' ? 'एक छोटी सुरुवात. एक सामायिक दृष्टिकोन.' : 'A small start. A shared view.'}
          </h2>
          <p className="text-[13px] text-[#556377] dark:text-slate-400 leading-snug">
            {language === 'mr'
              ? 'फीडमध्ये गोंधळ न करता नागरी माहिती स्पष्ट आणि सहज उपलब्ध ठेवली जाते.'
              : 'The supplied civic snapshot, kept visible without overwhelming your feed.'}
          </p>
        </div>

        {/* 2 Side-by-side peach stat boxes */}
        <div className="grid grid-cols-2 gap-3.5 pt-1">
          {/* Box 1 */}
          <div 
            onClick={() => onEnterPortal('feed')}
            className="p-4 sm:p-5 rounded-2xl bg-[#fdf5f0] dark:bg-slate-900/80 border border-[#fae8dc] dark:border-slate-800 cursor-pointer hover:border-[#d95b18]/40 transition"
          >
            <div className="text-[34px] sm:text-[38px] font-black text-[#d95b18] leading-none">
              {activeCount}
            </div>
            <div className="text-[13px] font-bold text-[#111d2e] dark:text-slate-200 mt-2">
              {language === 'mr' ? 'सक्रिय तक्रारी' : 'Active complaints'}
            </div>
          </div>

          {/* Box 2 */}
          <div 
            onClick={() => onEnterPortal('map')}
            className="p-4 sm:p-5 rounded-2xl bg-[#fdf5f0] dark:bg-slate-900/80 border border-[#fae8dc] dark:border-slate-800 cursor-pointer hover:border-[#d95b18]/40 transition"
          >
            <div className="text-[34px] sm:text-[38px] font-black text-[#d95b18] leading-none">
              6
            </div>
            <div className="text-[13px] font-bold text-[#111d2e] dark:text-slate-200 mt-2">
              {language === 'mr' ? 'निरीक्षण कामे' : 'Monitored works'}
            </div>
          </div>
        </div>

        {/* Subtext info */}
        <div className="text-[11px] text-[#718096] dark:text-slate-400 pt-0.5">
          {underVerificationCount} under citizen verification • {reopenedCount} substandard flags
        </div>

        <div className="border-t border-slate-100 dark:border-slate-800 pt-6 space-y-4">
          {/* Label */}
          <div className="text-[11px] font-extrabold text-[#d95b18] uppercase tracking-wider">
            {language === 'mr' ? 'तुमच्या रस्त्यावरून थेट फीडवर' : 'FROM YOUR STREET TO THE FEED'}
          </div>

          <h3 className="text-[26px] sm:text-[30px] font-black text-[#111d2e] dark:text-slate-100 leading-tight">
            {language === 'mr' ? 'पाहा. शेअर करा. पाठपुरावा करा.' : 'Notice it. Share it.\nStay with it.'}
          </h3>

          {/* 3 Step items with peach icon badges */}
          <div className="space-y-4 pt-1">
            {/* Step 1 */}
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-[#fef2ea] dark:bg-slate-800 border border-[#fae8dc] dark:border-slate-700 text-[#d95b18] flex items-center justify-center shrink-0 mt-0.5">
                <Camera className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div className="space-y-0.5">
                <h4 className="text-[14px] font-bold text-[#111d2e] dark:text-slate-100">
                  {language === 'mr' ? 'तपशीलासह तक्रार करा' : 'Report with context'}
                </h4>
                <p className="text-[12px] text-[#556377] dark:text-slate-400 leading-relaxed">
                  {language === 'mr'
                    ? 'खरा फोटो, स्पष्ट ठिकाण आणि समस्येचे संक्षिप्त वर्णन जोडा.'
                    : 'Add a real photo, a clear location and a short description of the issue.'}
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-[#fef2ea] dark:bg-slate-800 border border-[#fae8dc] dark:border-slate-700 text-[#d95b18] flex items-center justify-center shrink-0 mt-0.5">
                <Users className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div className="space-y-0.5">
                <h4 className="text-[14px] font-bold text-[#111d2e] dark:text-slate-100">
                  {language === 'mr' ? 'शेजाऱ्यांना एकत्र आणा' : 'Bring neighbours in'}
                </h4>
                <p className="text-[12px] text-[#556377] dark:text-slate-400 leading-relaxed">
                  {language === 'mr'
                    ? 'संबंधित अहवालांना पाठिंबा द्या, समस्येवर चर्चा करा आणि परिसराशी शेअर करा.'
                    : 'Support relevant reports, discuss the issue and share it with your community.'}
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-[#fef2ea] dark:bg-slate-800 border border-[#fae8dc] dark:border-slate-700 text-[#d95b18] flex items-center justify-center shrink-0 mt-0.5">
                <ShieldCheck className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div className="space-y-0.5">
                <h4 className="text-[14px] font-bold text-[#111d2e] dark:text-slate-100">
                  {language === 'mr' ? 'पुरावा तपासा' : 'Check the proof'}
                </h4>
                <p className="text-[12px] text-[#556377] dark:text-slate-400 leading-relaxed">
                  {language === 'mr'
                    ? 'पुराव्याची पडताळणी करा. काम नागरिक पुनरावलोकनासाठी तयार झाल्यावर मदत करा.'
                    : 'Inspect evidence. Help verify work when it is ready for citizen review.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────── */}
      {/* 3. CIVIC FEED PREVIEW (Exact match with Image 3)             */}
      {/* ──────────────────────────────────────────────────────────── */}
      <section className="p-6 sm:p-8 space-y-4 bg-white dark:bg-[#0c1322] border-t border-slate-100 dark:border-slate-800/80">
        
        <div className="text-[11px] font-extrabold text-[#d95b18] uppercase tracking-wider">
          CIVIC FEED
        </div>

        <h2 className="text-[28px] sm:text-[32px] font-black text-[#111d2e] dark:text-slate-100 leading-tight">
          {language === 'mr' ? 'स्थानिक प्रश्न. नागरिकांचा थेट आवाज.' : 'Local issues.\nPeople you can hear.'}
        </h2>

        <p className="text-[13px] text-[#556377] dark:text-slate-400 leading-snug">
          {language === 'mr'
            ? 'गंभीर स्थानिक समस्यांसाठी एक परिपूर्ण फीड. प्रत्येक अहवालात लेखक, ठिकाण आणि पुनरावलोकन स्थिती एकत्र असते.'
            : 'A familiar feed for serious local problems. Each report keeps its author, location and review status together.'}
        </p>

        {/* Real Feed Cards from Neon DB tickets */}
        <div className="space-y-3.5 pt-2">
          {tickets.slice(0, 3).map((ticket) => {
            const initials = (ticket.citizenName || 'Nashik Citizen')
              .split(' ')
              .map(n => n[0])
              .join('')
              .slice(0, 2)
              .toUpperCase();

            return (
              <div 
                key={ticket.id}
                onClick={() => onInspectTicket ? onInspectTicket(ticket.id) : onEnterPortal('feed')}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-[#d95b18]/40 transition cursor-pointer space-y-3"
              >
                {/* Author row */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-[#fef2ea] border border-[#fae8dc] text-[#d95b18] font-bold text-xs flex items-center justify-center">
                      {initials}
                    </div>
                    <div>
                      <span className="text-[13px] font-bold text-[#111d2e] dark:text-slate-100 block">
                        {ticket.citizenName}
                      </span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400">
                        {ticket.ward} ward · Citizen report
                      </span>
                    </div>
                  </div>
                  <button className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                </div>

                {/* Title & Location */}
                <div className="space-y-1">
                  <h3 className="text-[15px] font-bold text-[#111d2e] dark:text-slate-100 line-clamp-2">
                    {ticket.title}
                  </h3>
                  <p className="text-[12px] text-[#718096] dark:text-slate-400">
                    {ticket.locationName}
                  </p>
                </div>

                {/* Status Badge */}
                <div className="flex items-center gap-2">
                  <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#fef2ea] text-[#d95b18] border border-[#fae8dc]">
                    {ticket.status === 'SUBMITTED' ? 'Active / Submitted' : ticket.status.replace(/_/g, ' ')}
                  </span>
                  <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                    {ticket.category.replace(/_/g, ' ')}
                  </span>
                </div>

                {/* Divider & Footer */}
                <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800 text-[11px] text-[#718096] dark:text-slate-400 flex items-center justify-between">
                  <span>{ticket.upvotes || 1} support · 0 comments</span>
                  <span className="text-[10px] text-slate-400">
                    {ticket.createdAt ? new Date(ticket.createdAt).toLocaleDateString() : 'Recent'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Disclaimer Note */}
        <p className="text-[11px] text-[#718096] dark:text-slate-400 pt-1">
          {language === 'mr'
            ? 'मूळ अहवाल नोंदी. कोणतेही बनावट पुरावे किंवा काल्पनिक परिणाम नाहीत.'
            : 'Original report records. No generated evidence or invented outcomes.'}
        </p>

        {/* CTA Button: Explore community feed */}
        <div className="pt-1">
          <button
            onClick={() => onEnterPortal('feed')}
            className="w-full flex items-center justify-center gap-2 py-3 px-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-[#111d2e] dark:text-slate-100 font-bold text-[14px] hover:bg-slate-50 dark:hover:bg-slate-800 transition"
          >
            <ArrowRight className="w-4 h-4" />
            <span>{language === 'mr' ? 'समुदाय फीड एक्सप्लोर करा' : 'Explore the community feed'}</span>
          </button>
        </div>

      </section>

      {/* ──────────────────────────────────────────────────────────── */}
      {/* 4. "One city. Six NMC wards." (Exact match with Image 4)     */}
      {/* ──────────────────────────────────────────────────────────── */}
      <section className="p-6 sm:p-8 space-y-4 bg-white dark:bg-[#0c1322] border-t border-slate-100 dark:border-slate-800/80">
        
        {/* Green Map Icon in soft mint badge */}
        <div className="w-10 h-10 rounded-xl bg-[#e6f7ef] dark:bg-emerald-950/40 text-[#059669] flex items-center justify-center">
          <Map className="w-5 h-5 stroke-[2.2]" />
        </div>

        <h2 className="text-[28px] sm:text-[32px] font-black text-[#111d2e] dark:text-slate-100 leading-tight">
          {language === 'mr' ? 'एक शहर. सहा मनपा प्रभाग.' : 'One city. Six NMC wards.'}
        </h2>

        <p className="text-[13px] text-[#556377] dark:text-slate-400 leading-snug">
          {language === 'mr'
            ? 'जीआयएस नकाशाद्वारे समस्या तपासा. प्रभाग आणि लोकेशन संदर्भ अहवालांना उपयुक्त बनवतात.'
            : 'Explore issues through the GIS Map. Ward and location context help make reports useful—not just visible.'}
        </p>

        {/* Mint Green Metric Card */}
        <div className="p-5 rounded-2xl bg-[#edf8f3] dark:bg-emerald-950/20 border border-[#d1fae5]/70 dark:border-emerald-850 flex items-center gap-4">
          <span className="text-[38px] font-black text-[#059669] leading-none">
            6
          </span>
          <div className="space-y-0.5">
            <h3 className="text-[14px] font-bold text-[#111d2e] dark:text-slate-100">
              {language === 'mr' ? 'निरीक्षण मनपा प्रभाग' : 'Monitored NMC wards'}
            </h3>
            <p className="text-[12px] text-[#556377] dark:text-slate-400">
              {language === 'mr' ? 'शहरव्यापी नागरी उत्तरदायित्व' : 'City-wide civic accountability'}
            </p>
          </div>
        </div>

        {/* Explore GIS Map Button */}
        <div className="pt-1">
          <button
            onClick={() => onEnterPortal('map')}
            className="w-full flex items-center justify-center gap-2 py-3 px-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-[#111d2e] dark:text-slate-100 font-bold text-[14px] hover:bg-slate-50 dark:hover:bg-slate-800 transition"
          >
            <Map className="w-4 h-4 text-emerald-600" />
            <span>{language === 'mr' ? 'जीआयएस नकाशा उघडा' : 'Explore GIS Map'}</span>
          </button>
        </div>

      </section>

      {/* ──────────────────────────────────────────────────────────── */}
      {/* 5. "The community has a say." (Exact match with Image 4 bottom)*/}
      {/* ──────────────────────────────────────────────────────────── */}
      <section className="p-6 sm:p-8 space-y-4 bg-[#fdf7f2] dark:bg-slate-900/60 border-t border-slate-100 dark:border-slate-800/80">
        
        <div className="text-[11px] font-extrabold text-[#d95b18] uppercase tracking-wider">
          PROOF, NOT JUST PROMISES
        </div>

        <h2 className="text-[28px] sm:text-[32px] font-black text-[#111d2e] dark:text-slate-100 leading-tight">
          {language === 'mr' ? 'समुदायाचा निर्णय सर्वोपरी.' : 'The community\nhas a say.'}
        </h2>

        <p className="text-[13px] text-[#556377] dark:text-slate-400 leading-snug">
          {language === 'mr'
            ? '३-मतांचे कोरम प्रक्रियेत नागरिक पुनरावलोकन आणते. मत देण्यापूर्वी ठिकाण आणि दुरुस्तीचा पुरावा तपासा.'
            : 'A 3-vote quorum brings citizen review into the process. Check the location and repair evidence before you vote.'}
        </p>

        {/* 3-vote quorum Card */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center gap-3.5 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-[#fef2ea] dark:bg-slate-800 text-[#d95b18] flex items-center justify-center shrink-0">
            <Users className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div className="space-y-0.5">
            <h3 className="text-[14px] font-bold text-[#111d2e] dark:text-slate-100">
              {language === 'mr' ? '३-मतांचे कोरम' : '3-vote quorum'}
            </h3>
            <p className="text-[12px] text-[#718096] dark:text-slate-400">
              {language === 'mr' ? 'पडताळणीचा नियम, थेट मतमोजणी नव्हे.' : 'A rule for verification, not a live vote count.'}
            </p>
          </div>
        </div>

        <p className="text-[11px] text-[#718096] dark:text-slate-400 pt-1">
          {language === 'mr'
            ? 'संशयास्पद मजकूर वाटल्यास ••• मेनू वापरून तक्रार नोंदवा.'
            : 'Suspicious content? Use the ••• menu to flag it.'}
        </p>

      </section>

      {/* ──────────────────────────────────────────────────────────── */}
      {/* 6. "Keep watch after the work is done." (Exact Image 5)      */}
      {/* ──────────────────────────────────────────────────────────── */}
      <section className="p-6 sm:p-8 space-y-4 bg-white dark:bg-[#0c1322] border-t border-slate-100 dark:border-slate-800/80">
        
        {/* Orange shield icon */}
        <div className="w-10 h-10 rounded-xl bg-[#fef2ea] dark:bg-slate-800 border border-[#fae8dc] dark:border-slate-700 text-[#d95b18] flex items-center justify-center">
          <ShieldCheck className="w-5 h-5 stroke-[2.2]" />
        </div>

        <h2 className="text-[28px] sm:text-[32px] font-black text-[#111d2e] dark:text-slate-100 leading-tight">
          {language === 'mr' ? 'काम पूर्ण झाल्यानंतरही लक्ष ठेवा.' : 'Keep watch after\nthe work is done.'}
        </h2>

        <p className="text-[13px] text-[#556377] dark:text-slate-400 leading-snug">
          {language === 'mr'
            ? 'रस्त्यांच्या कामांना ३-५ वर्षांची डिफेक्ट लायबिलिटी पिरियड (DLP) हमी असते. प्रकल्प बंद झाल्यानंतरही गुणवत्ता राखण्यास नागरिक अहवाल मदत करतात.'
            : 'Road works carry a 3–5 year Defect Liability Period (DLP) warranty. Citizen reporting helps keep quality in view beyond the day a project closes.'}
        </p>

        {/* 3-5 years Card */}
        <div 
          onClick={() => onEnterPortal('map')}
          className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs cursor-pointer hover:border-[#d95b18]/40 transition space-y-1.5"
        >
          <div className="text-[34px] sm:text-[38px] font-black text-[#d95b18] leading-none">
            3–5 years
          </div>
          <div className="text-[14px] font-bold text-[#111d2e] dark:text-slate-100">
            DLP warranty for road works
          </div>
          <div className="text-[12px] text-[#718096] dark:text-slate-400">
            Refer to the individual work's terms.
          </div>
        </div>

      </section>

      {/* ──────────────────────────────────────────────────────────── */}
      {/* 7. "A little clarity before you start." (Exact Image 5 & 6)  */}
      {/* ──────────────────────────────────────────────────────────── */}
      <section className="p-6 sm:p-8 space-y-5 bg-[#f8fafc] dark:bg-slate-900/40 border-t border-slate-100 dark:border-slate-800/80">
        
        <h2 className="text-[28px] sm:text-[32px] font-black text-[#111d2e] dark:text-slate-100 leading-tight">
          {language === 'mr' ? 'सुरुवात करण्यापूर्वी थोडी स्पष्टता.' : 'A little clarity before you start.'}
        </h2>

        {/* Clarity items list */}
        <div className="space-y-4 pt-1">
          
          {/* Item 1 */}
          <div className="flex items-start gap-3.5 pb-4 border-b border-slate-200/80 dark:border-slate-800">
            <Camera className="w-5 h-5 text-[#d95b18] shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <h3 className="text-[14px] font-bold text-[#111d2e] dark:text-slate-100">
                {language === 'mr' ? 'मी काय समाविष्ट करावे?' : 'What should I include?'}
              </h3>
              <p className="text-[12px] text-[#556377] dark:text-slate-400 leading-relaxed">
                {language === 'mr'
                  ? 'एक अस्सल फोटो, स्थान आणि समस्येचे विशिष्ट वर्णन.'
                  : 'A genuine photo, location and specific issue description.'}
              </p>
            </div>
          </div>

          {/* Item 2 */}
          <div className="flex items-start gap-3.5 pb-4 border-b border-slate-200/80 dark:border-slate-800">
            <Flag className="w-5 h-5 text-[#d95b18] shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <h3 className="text-[14px] font-bold text-[#111d2e] dark:text-slate-100">
                {language === 'mr' ? 'अहवाल खोटा वाटल्यास काय करावे?' : 'What if a report looks false?'}
              </h3>
              <p className="text-[12px] text-[#556377] dark:text-slate-400 leading-relaxed">
                {language === 'mr'
                  ? '••• → चुकीचा अहवाल म्हणून फ्लॅग करा. वैयक्तिक आरोपांशिवाय चिंता स्पष्ट करा.'
                  : 'Use ••• → Flag as false report. Explain your concern without personal accusations.'}
              </p>
            </div>
          </div>

          {/* Item 3 */}
          <div className="flex items-start gap-3.5">
            <Languages className="w-5 h-5 text-[#d95b18] shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <h3 className="text-[14px] font-bold text-[#111d2e] dark:text-slate-100">
                {language === 'mr' ? 'मी मराठी वापरू शकतो का?' : 'Can I use Marathi?'}
              </h3>
              <p className="text-[12px] text-[#556377] dark:text-slate-400 leading-relaxed">
                {language === 'mr'
                  ? 'ॲपमध्ये इंग्रजी आणि मराठी दोन्ही उपलब्ध आहेत.'
                  : 'English / मराठी access is available in the app.'}
              </p>
            </div>
          </div>

        </div>

        {/* Read Rules & Help Button */}
        <div className="pt-2">
          <button
            onClick={() => onEnterPortal('rules')}
            className="w-full flex items-center justify-center gap-2 py-3 px-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-[#111d2e] dark:text-slate-100 font-bold text-[14px] hover:bg-slate-50 dark:hover:bg-slate-800 transition"
          >
            <HelpCircle className="w-4 h-4 text-[#d95b18]" />
            <span>{language === 'mr' ? 'नियम आणि मदत वाचा' : 'Read Rules & Help'}</span>
          </button>
        </div>

      </section>

      {/* ──────────────────────────────────────────────────────────── */}
      {/* 8. DARK BLUE FOOTER (Exact 1:1 match with Image 6)           */}
      {/* ──────────────────────────────────────────────────────────── */}
      <section className="bg-[#121f31] text-white p-7 sm:p-9 space-y-6">
        
        {/* Main Heading */}
        <div className="space-y-2">
          <h2 className="text-[32px] sm:text-[38px] font-black leading-[1.08] tracking-tight">
            {language === 'mr' 
              ? 'तुमचा रस्ता, तुमचे शहर – नक्की सहभाग घ्या.' 
              : 'Your street is\nworth showing up for.'}
          </h2>
          <p className="text-[13px] text-slate-300 leading-snug">
            {language === 'mr'
              ? 'स्थानिक फीडपासून सुरुवात करा. एखादी समस्या दिसल्यास पहिली तक्रार नोंदवा.'
              : 'Start with the local feed. When you notice a civic issue, make your first report.'}
          </p>
        </div>

        {/* Primary CTA: Launch the Civic Portal */}
        <div className="space-y-3 pt-1">
          <button
            onClick={() => onEnterPortal('feed')}
            className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-[#d95b18] hover:bg-[#c24e12] text-white font-extrabold text-[15px] shadow-sm transition active:scale-[0.98]"
          >
            <ArrowRight className="w-4 h-4" />
            <span>{language === 'mr' ? 'नागरी पोर्टल सुरू करा' : 'Launch the Civic Portal'}</span>
          </button>

          {/* Secondary Link: Report a civic issue */}
          <div className="text-center">
            <button
              onClick={() => setIsComplaintModalOpen(true)}
              className="text-[14px] font-bold text-white hover:text-[#d95b18] hover:underline transition py-1"
            >
              {language === 'mr' ? 'नागरी तक्रार नोंदवा' : 'Report a civic issue'}
            </button>
          </div>
        </div>

        {/* Footer info & Navigation links */}
        <div className="border-t border-slate-700/80 pt-6 space-y-3">
          <div className="text-[18px] font-black tracking-tight text-white">
            Nashik Monitor
          </div>

          <div className="text-[12px] text-slate-400 font-medium">
            Where Closed ≠ Resolved.
          </div>

          <div className="space-y-1.5 text-[12px] text-slate-300 pt-1">
            <div className="flex flex-wrap items-center gap-2">
              <button onClick={() => onEnterPortal('feed')} className="hover:underline">Civic Feed</button>
              <span>·</span>
              <button onClick={() => onEnterPortal('map')} className="hover:underline">GIS Map</button>
              <span>·</span>
              <button onClick={() => onEnterPortal('verify')} className="hover:underline">Verify Proof</button>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button onClick={() => onEnterPortal('rules')} className="hover:underline">Rules & Help</button>
              <span>·</span>
              <button onClick={() => setLanguage(language === 'en' ? 'mr' : 'en')} className="hover:underline">
                English / मराठी
              </button>
              <span>·</span>
              <button onClick={() => setIsAuthModalOpen(true)} className="hover:underline">Account</button>
            </div>
          </div>

          {/* Emergency Disclaimer */}
          <p className="text-[11px] text-slate-400 leading-relaxed pt-2">
            {language === 'mr'
              ? 'तात्काळ धोक्याच्या प्रसंगी स्थानिक आपत्कालीन सेवेशी संपर्क साधा. हे फीड आणीबाणी चॅनेल नाही.'
              : 'For urgent danger, contact the appropriate local emergency service. This feed is not an emergency channel.'}
          </p>
        </div>

      </section>

    </div>
  );
}
