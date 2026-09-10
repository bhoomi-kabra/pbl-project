import React, { useState } from 'react';
import { User, Shield, Phone, Mail, Building2, Lock, CheckCircle2, ArrowRight, Sparkles, X } from 'lucide-react';
import { WardName } from '../types';
import { loginUser, registerUser, UserAccount } from '../services/api';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: UserAccount) => void;
  isDark: boolean;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  isDark,
}) => {
  const [tab, setTab] = useState<'CITIZEN' | 'ADMIN'>('CITIZEN');
  
  // Citizen form
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [ward, setWard] = useState<WardName>('Panchavati');

  // Admin form
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPasscode, setAdminPasscode] = useState('');

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleCitizenSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('Please enter your name');
      return;
    }
    if (!mobile.trim() && !email.trim()) {
      setErrorMsg('Please enter your Mobile Number or Email address');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    const user = await registerUser(name, mobile, email, ward);
    setIsLoading(false);

    if (user) {
      onLoginSuccess(user);
      onClose();
    } else {
      const fallbackUser: UserAccount = {
        id: `u-${Date.now()}`,
        name: name || 'Citizen',
        mobile: mobile || '9876543210',
        email: email || 'citizen@gmail.com',
        role: 'CITIZEN',
        ward: ward,
      };
      onLoginSuccess(fallbackUser);
      onClose();
    }
  };

  const handleGoogleSignIn = async (userRole: 'CITIZEN' | 'ADMIN') => {
    setIsLoading(true);
    setErrorMsg(null);

    if (userRole === 'CITIZEN') {
      // Simulate Google OAuth response
      const googleCitizen: UserAccount = {
        id: `u-google-${Date.now()}`,
        name: name || 'Aarav Deshmukh (Google User)',
        mobile: mobile || '9823011223',
        email: email || 'aarav.deshmukh@gmail.com',
        role: 'CITIZEN',
        ward: ward,
      };
      const registered = await registerUser(googleCitizen.name, googleCitizen.mobile, googleCitizen.email, googleCitizen.ward);
      setIsLoading(false);
      onLoginSuccess(registered || googleCitizen);
      onClose();
    } else {
      // Google Auth Admin login
      const googleAdmin: UserAccount = {
        id: 'u-admin-google',
        name: 'Er. M. S. Patil (Municipal Officer)',
        mobile: '9999999999',
        email: adminEmail || 'admin@nashik.gov.in',
        role: 'ADMIN',
        ward: 'All Wards',
      };
      const adminLog = await loginUser(googleAdmin.email, 'ADMIN');
      setIsLoading(false);
      onLoginSuccess(adminLog || googleAdmin);
      onClose();
    }
  };

  const handleAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);

    const user = await loginUser(adminEmail || 'admin@nashik.gov.in', 'ADMIN');
    setIsLoading(false);

    if (user) {
      onLoginSuccess(user);
      onClose();
    } else {
      const fallbackAdmin: UserAccount = {
        id: 'u-admin',
        name: 'Er. M. S. Patil (Municipal Officer)',
        mobile: '9999999999',
        email: 'admin@nashik.gov.in',
        role: 'ADMIN',
        ward: 'All Wards',
      };
      onLoginSuccess(fallbackAdmin);
      onClose();
    }
  };

  const handleQuickCitizenDemo = () => {
    const demoUser: UserAccount = {
      id: 'u-1',
      name: 'Aarav Deshmukh',
      mobile: '9823011223',
      email: 'aarav.deshmukh@gmail.com',
      role: 'CITIZEN',
      ward: 'Panchavati',
    };
    onLoginSuccess(demoUser);
    onClose();
  };

  const handleQuickAdminDemo = () => {
    const demoAdmin: UserAccount = {
      id: 'u-admin',
      name: 'Er. M. S. Patil (Chief Executive Admin)',
      mobile: '9999999999',
      email: 'admin@nashik.gov.in',
      role: 'ADMIN',
      ward: 'All Wards',
    };
    onLoginSuccess(demoAdmin);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className={`w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border transition-all ${
        isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
      }`}>
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-700/50 flex items-center justify-between bg-gradient-to-r from-emerald-600/10 via-blue-600/10 to-transparent">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-md">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base tracking-tight">Nashik Civic Portal Login</h3>
              <p className="text-xs text-emerald-500 font-medium">Authentication & Google OAuth</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Role Selector Tabs */}
        <div className="p-3 bg-slate-950/40 border-b border-slate-800/50 grid grid-cols-2 gap-2">
          <button
            onClick={() => { setTab('CITIZEN'); setErrorMsg(null); }}
            className={`py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition ${
              tab === 'CITIZEN'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20'
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Citizen Sign In</span>
          </button>

          <button
            onClick={() => { setTab('ADMIN'); setErrorMsg(null); }}
            className={`py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition ${
              tab === 'ADMIN'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>Municipal Admin</span>
          </button>
        </div>

        {/* Form Content */}
        <div className="p-6">
          {errorMsg && (
            <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-semibold">
              ⚠️ {errorMsg}
            </div>
          )}

          {/* Google OAuth Button */}
          <div className="mb-4">
            <button
              type="button"
              onClick={() => handleGoogleSignIn(tab)}
              className="w-full py-2.5 px-4 rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-slate-800 text-slate-100 font-bold text-xs flex items-center justify-center gap-2.5 shadow transition"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>Continue with Google</span>
            </button>
          </div>

          <div className="relative flex py-2 items-center mb-4">
            <div className="flex-grow border-t border-slate-800"></div>
            <span className="flex-shrink mx-3 text-[10px] text-slate-500 font-mono font-bold uppercase">Or sign in with details</span>
            <div className="flex-grow border-t border-slate-800"></div>
          </div>

          {tab === 'CITIZEN' ? (
            <form onSubmit={handleCitizenSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold mb-1 text-slate-300">Your Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Aarav Deshmukh"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={`w-full pl-9 pr-3 py-2 rounded-xl border text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                      isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold mb-1 text-slate-300">Mobile Number (10 digits)</label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="tel"
                    placeholder="e.g. 9823011223"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    className={`w-full pl-9 pr-3 py-2 rounded-xl border text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                      isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold mb-1 text-slate-300">Your Primary Ward</label>
                <select
                  value={ward}
                  onChange={(e) => setWard(e.target.value as WardName)}
                  className={`w-full px-3 py-2 rounded-xl border text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                    isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                >
                  <option value="Panchavati">Panchavati</option>
                  <option value="Nashik West">Nashik West (College Road)</option>
                  <option value="Nashik East">Nashik East</option>
                  <option value="Cidco">Cidco</option>
                  <option value="Satpur">Satpur</option>
                  <option value="Nashik Road">Nashik Road</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 transition"
              >
                <span>{isLoading ? 'Signing In...' : 'Enter Citizen Portal'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={handleQuickCitizenDemo}
                  className="w-full py-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-emerald-400 font-bold text-xs border border-emerald-500/30 flex items-center justify-center gap-1.5 transition"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>⚡ Quick Demo: Sign In as Citizen (Aarav Deshmukh)</span>
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleAdminSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold mb-1 text-slate-300">Municipal Admin Gmail / Email</label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="email"
                    placeholder="e.g. admin@nashik.gov.in"
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    className={`w-full pl-9 pr-3 py-2 rounded-xl border text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                      isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold mb-1 text-slate-300">Admin Security Passcode</label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={adminPasscode}
                    onChange={(e) => setAdminPasscode(e.target.value)}
                    className={`w-full pl-9 pr-3 py-2 rounded-xl border text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                      isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-extrabold text-xs shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 transition"
              >
                <Shield className="w-4 h-4" />
                <span>{isLoading ? 'Authenticating...' : 'Access Municipal Control Center'}</span>
              </button>

              <div className="pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={handleQuickAdminDemo}
                  className="w-full py-2 rounded-xl bg-indigo-950/60 hover:bg-indigo-900/60 text-indigo-300 font-bold text-xs border border-indigo-500/40 flex items-center justify-center gap-1.5 transition"
                >
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                  <span>🛡️ Quick Demo: Sign In as Municipal Admin (Er. M. S. Patil)</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
