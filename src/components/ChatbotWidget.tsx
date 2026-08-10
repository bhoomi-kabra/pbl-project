import React, { useState } from 'react';
import { Language, WardName, HazardType, ThemeMode } from '../types';
import { translations } from '../data/translations';
import { Bot, Sparkles, AlertTriangle, ArrowRight, Camera, X, Send } from 'lucide-react';

interface ChatbotWidgetProps {
  language: Language;
  theme: ThemeMode;
  onOpenAutoFilledComplaint: (data: {
    hazardType: HazardType;
    ward: WardName;
    location: string;
    aiConfidence: number;
  }) => void;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  intent?: {
    category: HazardType;
    confidence: number;
    ward: WardName;
    location: string;
  };
}

export const ChatbotWidget: React.FC<ChatbotWidgetProps> = ({
  language,
  theme,
  onOpenAutoFilledComplaint,
}) => {
  const t = translations[language];
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [inputText, setInputText] = useState<string>('');

  const isDark = theme === 'dark';

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-1',
      sender: 'bot',
      text: language === 'mr' 
        ? 'नमस्कार! मी मनपा स्मार्ट एआय सहाय्यक आहे. आपण रस्त्यावरील खड्डे किंवा धोक्यांची फोटो/मजकूराद्वारे माहिती देऊ शकता.' 
        : 'Namaste! I am the NMC Smart AI Assistant. Describe a road hazard or upload a photo to auto-generate a geotagged grievance.',
    },
  ]);

  const handleSendMessage = (customText?: string) => {
    const textToSend = customText || inputText;
    if (!textToSend.trim()) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: textToSend,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');

    setTimeout(() => {
      let botResponse: ChatMessage;

      if (textToSend.toLowerCase().includes('electrical') || textToSend.toLowerCase().includes('wire') || textToSend.toLowerCase().includes('विजेची')) {
        botResponse = {
          id: `b-${Date.now()}`,
          sender: 'bot',
          text: language === 'mr'
            ? 'विद्युत धोका आढळला! आमचा एआय मॉडेल्स ९८% विश्वासार्हतेने माहितीची पुष्टी करतो.'
            : 'Critical Electrical Hazard Detected! AI model validated emergency report with 98% confidence.',
          intent: {
            category: 'ELECTRICAL_HAZARD',
            confidence: 98,
            ward: 'Panchavati',
            location: 'Near K.K. Wagh Engineering College Main Gate, Panchavati',
          },
        };
      } else if (textToSend.toLowerCase().includes('pothole') || textToSend.toLowerCase().includes('खड्डा')) {
        botResponse = {
          id: `b-${Date.now()}`,
          sender: 'bot',
          text: language === 'mr'
            ? 'रस्त्यावरील खड्डा आढळला! एआय विश्लेषणाने ९५% दर्जा निश्चित केला.'
            : 'Road Pothole Hazard Detected! AI visual analysis verified deep cave-in.',
          intent: {
            category: 'POTHOLE',
            confidence: 95,
            ward: 'Nashik West',
            location: 'College Road, Opp Bhonsala Gate 2',
          },
        };
      } else {
        botResponse = {
          id: `b-${Date.now()}`,
          sender: 'bot',
          text: language === 'mr'
            ? 'माहिती प्रक्रिया केली जात आहे... कृपया नोंदणी अर्जावर जा.'
            : 'Information classified! High-priority municipal response dispatched.',
          intent: {
            category: 'ELECTRICAL_HAZARD',
            confidence: 94,
            ward: 'Panchavati',
            location: 'Near K.K. Wagh College, Panchavati',
          },
        };
      }

      setMessages((prev) => [...prev, botResponse]);
    }, 600);
  };

  const handlePresetTrigger = () => {
    const preset = language === 'mr'
      ? 'के.के. वाघ कॉलेजजवळ विजेची तार लोंबकळत आहे, पंचवटी'
      : 'Live electrical wire sparking near K.K. Wagh College, Panchavati';
    handleSendMessage(preset);
  };

  return (
    <>
      <div className="fixed bottom-6 right-6 z-50">
        {!isOpen && (
          <button
            onClick={() => setIsOpen(true)}
            className="group bg-gradient-to-r from-emerald-500 via-teal-600 to-blue-600 hover:from-emerald-400 hover:to-blue-500 text-white p-4 rounded-full shadow-2xl shadow-emerald-500/30 flex items-center gap-3 transition transform hover:scale-105 active:scale-95 border border-emerald-400/40"
          >
            <div className="relative">
              <Bot className="w-6 h-6 animate-pulse" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-amber-400 rounded-full border-2 border-slate-900 animate-ping"></span>
            </div>
            <span className="hidden md:inline font-bold text-sm tracking-wide pr-1">
              {t.aiAssistantTitle}
            </span>
          </button>
        )}
      </div>

      {isOpen && (
        <div className={`fixed bottom-6 right-6 z-50 w-[92vw] sm:w-[400px] h-[540px] border rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-300'}`}>
          <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 p-4 border-b border-slate-800 flex items-center justify-between text-white">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold flex items-center gap-1.5">
                  {t.aiAssistantTitle}
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                </h4>
                <p className="text-[11px] text-emerald-400 font-medium">
                  • AI Intent & Deep-Link Engine
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className={`px-3 py-2 border-b flex items-center gap-2 ${isDark ? 'bg-slate-950/80 border-slate-800' : 'bg-slate-100 border-slate-200'}`}>
            <span className={`text-[10px] font-semibold uppercase ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Try:</span>
            <button
              onClick={handlePresetTrigger}
              className="text-[11px] bg-red-500/10 text-red-500 hover:bg-red-500/20 px-2.5 py-1 rounded-full border border-red-500/30 font-medium transition truncate text-left"
            >
              ⚡ "Sparking Wire near K.K. Wagh"
            </button>
          </div>

          <div className={`flex-1 p-4 overflow-y-auto space-y-3 ${isDark ? 'bg-slate-950/40' : 'bg-slate-50'}`}>
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${
                  msg.sender === 'user' ? 'items-end' : 'items-start'
                }`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-emerald-600 text-white rounded-br-none shadow-md'
                      : isDark
                        ? 'bg-slate-800 border border-slate-700 text-slate-200 rounded-bl-none shadow-md'
                        : 'bg-white border border-slate-300 text-slate-800 rounded-bl-none shadow-sm'
                  }`}
                >
                  <p>{msg.text}</p>

                  {msg.intent && (
                    <div className={`mt-3 p-3 rounded-xl border space-y-2 ${isDark ? 'bg-slate-950 border-red-500/40' : 'bg-slate-900 border-red-500 text-white'}`}>
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-bold text-red-400 flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          {msg.intent.category}
                        </span>
                        <span className="text-emerald-400 font-mono font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/30">
                          Confidence: {msg.intent.confidence}%
                        </span>
                      </div>

                      <div className="text-[11px] text-slate-300 space-y-0.5">
                        <p><strong className="text-slate-400">Ward:</strong> {msg.intent.ward}</p>
                        <p className="truncate"><strong className="text-slate-400">Loc:</strong> {msg.intent.location}</p>
                      </div>

                      <button
                        onClick={() => {
                          onOpenAutoFilledComplaint({
                            hazardType: msg.intent!.category,
                            ward: msg.intent!.ward,
                            location: msg.intent!.location,
                            aiConfidence: msg.intent!.confidence,
                          });
                          setIsOpen(false);
                        }}
                        className="w-full mt-2 bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-bold text-xs py-2 px-3 rounded-lg shadow-lg flex items-center justify-center gap-2 transition transform active:scale-95 border border-red-400/30"
                      >
                        <span>👉 Go to /app/complaints/electrical</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className={`p-3 border-t flex items-center gap-2 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
            <button
              onClick={handlePresetTrigger}
              title="Simulate Photo Upload"
              className={`p-2 rounded-xl border transition ${isDark ? 'text-slate-400 hover:text-emerald-400 bg-slate-800 border-slate-700' : 'text-slate-600 hover:text-emerald-600 bg-slate-100 border-slate-300'}`}
            >
              <Camera className="w-4 h-4" />
            </button>
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder={t.chatPlaceholder}
              className={`flex-1 text-xs rounded-xl px-3 py-2.5 border focus:outline-none focus:ring-2 focus:ring-emerald-500/50 ${isDark ? 'bg-slate-950 text-white border-slate-800' : 'bg-slate-50 text-slate-900 border-slate-300'}`}
            />
            <button
              onClick={() => handleSendMessage()}
              className="bg-emerald-600 hover:bg-emerald-500 text-white p-2.5 rounded-xl shadow-md transition"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
};
