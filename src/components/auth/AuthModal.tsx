import React, { useState } from 'react';
import { UserProfile, UserRole } from '../../types/user';
import { AuthService } from '../../services/authService';
import { Hospital } from '../../types/hospital';
import { X, Lock, ShieldCheck, User, Building2, Check, ArrowRight, AlertTriangle } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (user: UserProfile) => void;
  hospitals: Hospital[];
  initialRole?: UserRole;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onAuthSuccess,
  hospitals,
  initialRole = 'PATIENT',
}) => {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [role, setRole] = useState<UserRole>(initialRole);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [adminPin, setAdminPin] = useState('9944');
  const [selectedHospitalId, setSelectedHospitalId] = useState(hospitals[0]?.id || '');
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email.trim() || !password.trim()) {
      setErrorMessage('Please enter both email and password.');
      return;
    }

    if (role === 'HOSPITAL_ADMIN' && adminPin.trim() !== '9944' && adminPin.trim() !== 'admin2026' && adminPin.trim() !== '2026') {
      setErrorMessage('Invalid Administrator verification PIN. (Hint: Use 9944 or admin2026 for demo)');
      return;
    }

    const assignedHosp = hospitals.find((h) => h.id === selectedHospitalId);
    const user = AuthService.login(
      email,
      role,
      selectedHospitalId,
      assignedHosp?.name
    );

    onAuthSuccess(user);
    onClose();
  };

  const handleQuickDemoLogin = (demoRole: UserRole) => {
    const user = AuthService.switchDemoProfile(demoRole);
    onAuthSuccess(user);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-150">
      <div className="bg-[#164A41] rounded-3xl max-w-md w-full border border-[#4D774E] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150 text-white">
        {/* Header */}
        <div className="p-6 border-b border-[#4D774E]/60 flex items-center justify-between bg-[#123831]">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm shadow-sm ${
              role === 'HOSPITAL_ADMIN' ? 'bg-[#F1B24A] text-[#164A41]' : 'bg-[#4D774E] text-white'
            }`}>
              {role === 'HOSPITAL_ADMIN' ? <Building2 className="w-5 h-5" /> : <User className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="font-display text-lg font-bold text-white tracking-tight">
                {mode === 'login' ? 'Sign In to QueueLess' : 'Create an Account'}
              </h3>
              <p className="text-xs text-[#9DC88D]">
                {role === 'HOSPITAL_ADMIN' ? 'Hospital Director & Staff Terminal' : 'Patient & Emergency Services'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#9DC88D] hover:text-white hover:bg-[#1c5248] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Role Selector Tabs */}
        <div className="p-5 bg-[#123831] border-b border-[#4D774E]/60">
          <span className="block text-[11px] font-bold text-[#9DC88D] uppercase tracking-wider mb-2">
            Select Your Role:
          </span>
          <div className="grid grid-cols-2 gap-2 p-1.5 bg-[#0e302a] rounded-2xl border border-[#4D774E]/60">
            <button
              type="button"
              onClick={() => {
                setRole('PATIENT');
                setErrorMessage('');
              }}
              className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                role === 'PATIENT'
                  ? 'bg-[#F1B24A] text-[#164A41] shadow-md'
                  : 'text-[#9DC88D] hover:text-white'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Normal User</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setRole('HOSPITAL_ADMIN');
                setErrorMessage('');
              }}
              className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                role === 'HOSPITAL_ADMIN'
                  ? 'bg-[#F1B24A] text-[#164A41] shadow-md'
                  : 'text-[#9DC88D] hover:text-white'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Hospital Admin</span>
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-300 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-[#F1B24A]" />
              <span>{errorMessage}</span>
            </div>
          )}

          {mode === 'signup' && (
            <div>
              <label className="block text-[#9DC88D] font-semibold mb-1">Full Legal Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={role === 'HOSPITAL_ADMIN' ? 'Dr. Alok Verma' : 'Rahul Sharma'}
                className="w-full px-3.5 py-2.5 bg-[#123831] border border-[#4D774E] rounded-xl text-white placeholder-[#9DC88D]/50 focus:outline-none focus:border-[#F1B24A]"
                required
              />
            </div>
          )}

          <div>
            <label className="block text-[#9DC88D] font-semibold mb-1">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={role === 'HOSPITAL_ADMIN' ? 'director@aiims.gov.in' : 'user@example.com'}
              className="w-full px-3.5 py-2.5 bg-[#123831] border border-[#4D774E] rounded-xl text-white placeholder-[#9DC88D]/50 focus:outline-none focus:border-[#F1B24A]"
              required
            />
          </div>

          <div>
            <label className="block text-[#9DC88D] font-semibold mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full px-3.5 py-2.5 bg-[#123831] border border-[#4D774E] rounded-xl text-white placeholder-[#9DC88D]/50 focus:outline-none focus:border-[#F1B24A] font-mono"
              required
            />
          </div>

          {/* Hospital Administrator Specific Fields */}
          {role === 'HOSPITAL_ADMIN' && (
            <div className="p-4 rounded-2xl bg-[#123831] border border-[#4D774E] space-y-3">
              <div>
                <label className="block text-[#9DC88D] font-semibold mb-1">Affiliated Hospital</label>
                <select
                  value={selectedHospitalId}
                  onChange={(e) => setSelectedHospitalId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#0e302a] border border-[#4D774E] rounded-xl text-white focus:outline-none focus:border-[#F1B24A]"
                >
                  {hospitals.map((h) => (
                    <option key={h.id} value={h.id}>
                      {h.name} ({h.city})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[#9DC88D] font-semibold">Admin Verification PIN</label>
                  <span className="text-[10px] text-[#F1B24A] font-mono">Demo: 9944</span>
                </div>
                <input
                  type="password"
                  value={adminPin}
                  onChange={(e) => setAdminPin(e.target.value)}
                  placeholder="9944"
                  className="w-full px-3.5 py-2.5 bg-[#0e302a] border border-[#4D774E] rounded-xl text-white focus:outline-none focus:border-[#F1B24A] font-mono"
                  required
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            className="w-full py-3 px-4 rounded-xl bg-[#F1B24A] hover:bg-[#e09f36] text-[#164A41] font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-md active:scale-98"
          >
            <span>{mode === 'login' ? 'Sign In' : 'Create Account'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Quick Demo Accounts Switcher */}
        <div className="p-4 bg-[#123831] border-t border-[#4D774E]/60 space-y-2">
          <div className="text-[11px] font-bold text-[#9DC88D] uppercase tracking-wider text-center">
            One-Click Instant Demo Access
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickDemoLogin('PATIENT')}
              className="py-2 px-3 bg-[#1c5248] border border-[#4D774E] hover:border-[#9DC88D] rounded-xl text-white text-xs font-semibold transition-colors text-center"
            >
              👤 Normal User (Rahul)
            </button>

            <button
              type="button"
              onClick={() => handleQuickDemoLogin('HOSPITAL_ADMIN')}
              className="py-2 px-3 bg-[#4D774E] hover:bg-[#5b8a5c] rounded-xl text-white text-xs font-semibold transition-colors text-center"
            >
              🏥 Admin (Dr. Verma)
            </button>
          </div>
        </div>

        {/* Footer Toggle Mode */}
        <div className="p-3.5 bg-[#0e302a] border-t border-[#4D774E]/60 text-center text-xs text-[#9DC88D]">
          {mode === 'login' ? (
            <span>
              Don't have an account yet?{' '}
              <button
                type="button"
                onClick={() => setMode('signup')}
                className="text-[#F1B24A] font-bold hover:underline"
              >
                Sign Up
              </button>
            </span>
          ) : (
            <span>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => setMode('login')}
                className="text-[#F1B24A] font-bold hover:underline"
              >
                Sign In
              </button>
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
