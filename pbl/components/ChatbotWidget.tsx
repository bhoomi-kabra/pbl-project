'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/AppContext';
import { HazardCategory, Ward } from '@/lib/types';
import { 
  Bot, 
  X, 
  Send, 
  Sparkles, 
  AlertCircle, 
  ArrowRight,
  Mic,
  MicOff
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  classification?: {
    category: HazardCategory;
    categoryLabel: string;
    ward?: Ward;
    confidence: number;
    urgency: 'HIGH' | 'CRITICAL' | 'MEDIUM';
    detectedLocation?: string;
  };
}

export default function ChatbotWidget() {
  const { t, language, setIsComplaintModalOpen, setPrefilledComplaint } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-welcome',
      sender: 'ai',
      text: language === 'mr'
        ? 'नमस्कार! मी नाशिक मनपा AI सहाय्यक आहे. रस्त्यावरील खड्डे, उघडी मॅनहोल्स किंवा विजेच्या तारांबाबत सांगा, मी त्वरित मसुदा तयार करेन.'
        : 'Hello! I am the NMC Civic AI Assistant. Describe any road hazard, cave-in, open manhole, or dangling wire in English or Marathi, and I will classify it with instant confidence scoring.'
    }
  ]);

  const classifyIntent = (text: string) => {
    const lower = text.toLowerCase();
    let category: HazardCategory = 'OTHER';
    let categoryLabel = 'Other Civic Hazard';
    let confidence = 85;
    let urgency: 'HIGH' | 'CRITICAL' | 'MEDIUM' = 'MEDIUM';
    let detectedWard: Ward = 'Nashik West';
    let detectedLocation = 'Nashik Municipal Area';

    if (lower.includes('panchavati') || lower.includes('ramkund') || lower.includes('पंचवटी') || lower.includes('रामकुंड')) {
      detectedWard = 'Panchavati';
      detectedLocation = 'Panchavati (near Ramkund / Godavari)';
    } else if (lower.includes('gangapur') || lower.includes('college road') || lower.includes('abb') || lower.includes('गंगापूर') || lower.includes('कॉलेज रोड')) {
      detectedWard = 'Nashik West';
      detectedLocation = 'Gangapur Road / College Road, Nashik West';
    } else if (lower.includes('dwarka') || lower.includes('mumbai naka') || lower.includes('द्वारका') || lower.includes('मुंबई नाका')) {
      detectedWard = 'Nashik East';
      detectedLocation = 'Mumbai Naka / Dwarka Circle, Nashik East';
    } else if (lower.includes('cidco') || lower.includes('trimurti') || lower.includes('सिडको') || lower.includes('त्रिमूर्ती')) {
      detectedWard = 'Cidco';
      detectedLocation = 'Trimurti Chowk, Cidco';
    } else if (lower.includes('satpur') || lower.includes('midc') || lower.includes('सातपूर')) {
      detectedWard = 'Satpur';
      detectedLocation = 'Satpur MIDC Industrial Corridor';
    } else if (lower.includes('station') || lower.includes('bytco') || lower.includes('नाशिक रोड') || lower.includes('रेल्वे')) {
      detectedWard = 'Nashik Road';
      detectedLocation = 'Bytco Point / Nashik Road Station';
    }

    if (lower.includes('cave') || lower.includes('subsidence') || lower.includes('खच') || lower.includes('खड्डा खचला')) {
      category = 'ROAD_CAVE_IN';
      categoryLabel = language === 'mr' ? 'रस्ता खचणे (Road Cave-In)' : 'Road Surface Cave-In';
      confidence = 96;
      urgency = 'CRITICAL';
    } else if (lower.includes('manhole') || lower.includes('drain') || lower.includes('गटर') || lower.includes('मॅनहोल')) {
      category = 'OPEN_MANHOLE';
      categoryLabel = language === 'mr' ? 'उघडे मॅनहोल (Open Manhole)' : 'Uncovered Drainage Manhole';
      confidence = 95;
      urgency = 'CRITICAL';
    } else if (lower.includes('wire') || lower.includes('electric') || lower.includes('cable') || lower.includes('विजेची') || lower.includes('तार')) {
      category = 'ELECTRICAL_WIRE';
      categoryLabel = language === 'mr' ? 'लटकती विजेची तार (Electrical Hazard)' : 'Dangling Electrical Cable';
      confidence = 97;
      urgency = 'CRITICAL';
    } else if (lower.includes('water') || lower.includes('flood') || lower.includes('stagnant') || lower.includes('पाणी') || lower.includes('साच')) {
      category = 'WATER_LOGGING';
      categoryLabel = language === 'mr' ? 'पाणी साचणे (Water Logging)' : 'Monsoon Water Logging';
      confidence = 92;
      urgency = 'HIGH';
    } else if (lower.includes('pothole') || lower.includes('hole') || lower.includes('crater') || lower.includes('खड्डा') || lower.includes('खड्डे')) {
      category = 'POTHOLE';
      categoryLabel = language === 'mr' ? 'रस्त्यावरील खड्डा (Severe Pothole)' : 'Severe Pothole Cluster';
      confidence = 94;
      urgency = 'HIGH';
    } else if (lower.includes('कचरा') || lower.includes('garbage') || lower.includes('ढीग') || lower.includes('अस्वच्छता')) {
      category = 'GARBAGE_DUMP';
      categoryLabel = language === 'mr' ? 'कचरा ढीग (Garbage Dump)' : 'Garbage Dump & Sanitation';
      confidence = 96;
      urgency = 'HIGH';
    } else if (lower.includes('गळती') || lower.includes('pipeline') || lower.includes('pipe') || (lower.includes('पाणी') && lower.includes('गळती'))) {
      category = 'WATER_LEAKAGE';
      categoryLabel = language === 'mr' ? 'पाण्याची गळती (Water Pipeline Leakage)' : 'Water Pipeline Leakage';
      confidence = 94;
      urgency = 'HIGH';
    } else if (lower.includes('ओव्हरफ्लो') || lower.includes('गटार') || lower.includes('drainage') || lower.includes('sewer')) {
      category = 'DRAINAGE_OVERFLOW';
      categoryLabel = language === 'mr' ? 'गटार ओव्हरफ्लो (Drainage Overflow)' : 'Drainage Line Overflow';
      confidence = 95;
      urgency = 'CRITICAL';
    } else if (lower.includes('दिवा') || lower.includes('पथदिवा') || lower.includes('streetlight') || lower.includes('light बंद')) {
      category = 'STREETLIGHT_DEFECT';
      categoryLabel = language === 'mr' ? 'बंद पथदिवा (Streetlight Defect)' : 'Streetlight Outage';
      confidence = 93;
      urgency = 'MEDIUM';
    } else if (lower.includes('खोदकाम') || lower.includes('excavation') || lower.includes('cable trench')) {
      category = 'UNAUTHORIZED_EXCAVATION';
      categoryLabel = language === 'mr' ? 'अनधिकृत खोदकाम (Excavation)' : 'Unauthorized Excavation';
      confidence = 91;
      urgency = 'HIGH';
    }

    return {
      category,
      categoryLabel,
      ward: detectedWard,
      confidence,
      urgency,
      detectedLocation
    };
  };

  const [isListening, setIsListening] = useState(false);

  const startChatVoice = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Voice input is not supported in this browser. Please use Google Chrome or Edge.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = language === 'mr' ? 'mr-IN' : 'en-IN';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setIsListening(false);
      handleSend(transcript);
    };

    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);

    recognition.start();
  };

  const handleSend = (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim()) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: query
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    setTimeout(() => {
      const classification = classifyIntent(query);
      const aiResponse: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        sender: 'ai',
        text: language === 'mr'
          ? `विश्लेषण पूर्ण: **${classification.categoryLabel}**. संभाव्य प्रभाग: **${classification.ward}**.`
          : `Classified as **${classification.categoryLabel}** in **${classification.ward} Ward**.`,
        classification
      };

      setMessages((prev) => [...prev, aiResponse]);
      setIsTyping(false);
    }, 450);
  };

  const handlePrefill = (classification: NonNullable<ChatMessage['classification']>, originalText: string) => {
    setPrefilledComplaint({
      title: `${classification.categoryLabel} near ${classification.detectedLocation}`,
      description: originalText,
      category: classification.category,
      ward: classification.ward,
      locationName: classification.detectedLocation
    });
    setIsComplaintModalOpen(true);
    setIsOpen(false);
  };

  return (
    <>
      <div className="fixed bottom-3 right-3 sm:bottom-5 sm:right-5 z-40">
        {!isOpen && (
          <button
            onClick={() => setIsOpen(true)}
            className="flex items-center gap-2 px-3 py-2 sm:px-3.5 sm:py-2.5 rounded-full bg-slate-900 hover:bg-slate-800 text-slate-100 font-bold text-xs shadow-xl border border-slate-700 transition transform hover:scale-105 active:scale-95"
          >
            <div className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Sparkles className="w-3 h-3" />
            </div>
            <span>NMC AI Assistant</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          </button>
        )}
      </div>

      {isOpen && (
        <div className="fixed bottom-3 right-3 sm:bottom-5 sm:right-5 z-50 w-[calc(100vw-1.5rem)] sm:w-96 max-w-sm bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[480px] max-h-[82vh]">
          
          <div className="p-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
                <Bot className="w-3.5 h-3.5" />
              </div>
              <span className="font-bold text-slate-200 text-xs">{t.chatTitle}</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 p-3 overflow-y-auto space-y-2.5 text-xs">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[88%] p-2.5 rounded-xl ${
                    msg.sender === 'user'
                      ? 'bg-amber-500 text-slate-950 font-semibold'
                      : 'bg-slate-950 text-slate-200 border border-slate-800'
                  }`}
                >
                  <p className="leading-relaxed">{msg.text}</p>

                  {msg.classification && (
                    <div className="mt-2 pt-2 border-t border-slate-800 space-y-1.5">
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="text-slate-400">Confidence:</span>
                        <span className="text-emerald-400 font-bold">{msg.classification.confidence}%</span>
                      </div>
                      <div className="text-[10px] text-slate-300">
                        Ward: <b>{msg.classification.ward}</b>
                      </div>
                      <button
                        onClick={() => handlePrefill(msg.classification!, msg.text)}
                        className="w-full mt-1 py-1.5 px-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-[10px] flex items-center justify-center gap-1 transition"
                      >
                        <Sparkles className="w-3 h-3" />
                        {t.chatPrefillModal}
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="text-[10px] text-slate-400 italic p-1">Analyzing hazard keywords...</div>
            )}
          </div>

          {/* Quick pills */}
          <div className="p-1.5 bg-slate-950/80 border-t border-slate-800 flex gap-1 overflow-x-auto no-scrollbar">
            {t.chatSuggestions.map((sug, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(sug)}
                className="whitespace-nowrap px-2 py-0.5 rounded-md bg-slate-800 hover:bg-slate-700 text-[10px] text-slate-300 shrink-0"
              >
                {sug.substring(0, 24)}...
              </button>
            ))}
          </div>

          {/* Input */}
          <div className="p-2.5 bg-slate-950 border-t border-slate-800 flex items-center gap-1.5">
            <button
              type="button"
              onClick={startChatVoice}
              className={`p-2 rounded-xl transition ${
                isListening
                  ? 'bg-rose-500 text-white animate-pulse shadow-md shadow-rose-500/30'
                  : 'bg-slate-800 text-amber-400 hover:bg-slate-700'
              }`}
              title={language === 'mr' ? 'मराठीत बोला (Speak in Marathi)' : 'Speak in English'}
            >
              {isListening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
            </button>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder={isListening ? (language === 'mr' ? 'ऐकत आहे, बोला...' : 'Listening, speak now...') : t.chatPlaceholder}
              className="flex-1 px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
            <button
              onClick={() => handleSend()}
              className="p-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>
      )}
    </>
  );
}
