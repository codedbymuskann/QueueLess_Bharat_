import React, { useState } from 'react';
import { UserProfile, UserRole } from '../../types/user';
import { AuthService } from '../../services/authService';
import { Hospital, BloodGroup } from '../../types/hospital';
import { MedicalVisualAsset } from '../common/MedicalVisualAsset';
import {
  Building2,
  User,
  ShieldCheck,
  Lock,
  Mail,
  KeyRound,
  Phone,
  Heart,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Stethoscope,
  Activity,
  Layers,
} from 'lucide-react';

interface AuthPageProps {
  initialRole?: UserRole;
  initialMode?: 'login' | 'signup';
  hospitals: Hospital[];
  onAuthSuccess: (user: UserProfile, redirectTo?: string) => void;
  onNavigateHome: () => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({
  initialRole = 'HOSPITAL_ADMIN',
  initialMode = 'login',
  hospitals,
  onAuthSuccess,
  onNavigateHome,
}) => {
  const [role, setRole] = useState<UserRole>(initialRole);
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);

  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [adminPin, setAdminPin] = useState('9944');
  const [selectedHospitalId, setSelectedHospitalId] = useState(hospitals[0]?.id || '');
  const [bloodGroup, setBloodGroup] = useState<BloodGroup>('O+');
  const [designation, setDesignation] = useState('Chief Medical Officer / Superintendent');

  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email.trim() || !password.trim()) {
      setErrorMessage('Please provide both email and security key.');
      return;
    }

    if (mode === 'signup' && !name.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }

    if (role === 'HOSPITAL_ADMIN') {
      const validPins = ['9944', 'admin2026', '2026', '0000'];
      if (!validPins.includes(adminPin.trim())) {
        setErrorMessage('Invalid Administrator Verification PIN. (Demo Hint: Use 9944 or admin2026)');
        return;
      }
    }

    setIsLoading(true);

    setTimeout(() => {
      const selectedHosp = hospitals.find((h) => h.id === selectedHospitalId);

      let user: UserProfile;
      if (mode === 'signup') {
        user = AuthService.signup({
          name: name.trim() || (role === 'HOSPITAL_ADMIN' ? 'Dr. Medical Director' : 'Citizen Patient'),
          email: email.trim(),
          role,
          phone: phone.trim() || '+91 98000 00000',
          bloodGroup: role === 'PATIENT' ? bloodGroup : undefined,
          hospitalId: role === 'HOSPITAL_ADMIN' ? selectedHospitalId : undefined,
          hospitalName: role === 'HOSPITAL_ADMIN' ? selectedHosp?.name : undefined,
          designation: role === 'HOSPITAL_ADMIN' ? designation : undefined,
        });
      } else {
        user = AuthService.login(
          email.trim(),
          role,
          selectedHospitalId,
          selectedHosp?.name
        );
      }

      setIsLoading(false);
      // If administrator, direct them directly to the Hospital Portal
      onAuthSuccess(user, role === 'HOSPITAL_ADMIN' ? 'dashboard' : 'finder');
    }, 300);
  };

  const handleInstantDemo = (targetRole: UserRole) => {
    setIsLoading(true);
    setTimeout(() => {
      const user = AuthService.switchDemoProfile(targetRole);
      setIsLoading(false);
      onAuthSuccess(user, targetRole === 'HOSPITAL_ADMIN' ? 'dashboard' : 'finder');
    }, 200);
  };

  return (
    <div className="min-h-[85vh] flex flex-col justify-center py-6">
      {/* Top Breadcrumb & Status */}
      <div className="max-w-5xl mx-auto w-full mb-6 flex items-center justify-between px-4">
        <button
          onClick={onNavigateHome}
          className="text-xs font-mono text-[#9DC88D] hover:text-white flex items-center gap-1.5 transition-colors"
        >
          <span>&larr; Return to Live Radar</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#F1B24A] animate-pulse" />
          <span className="text-[11px] font-mono text-[#9DC88D] uppercase tracking-wider">
            Verified Authentication System
          </span>
        </div>
      </div>

      <div className="max-w-5xl mx-auto w-full bg-[#1c5248] rounded-3xl border border-[#4D774E] shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12">
        {/* Left Side: Editorial Medical Imagery & Role Context */}
        <div className="lg:col-span-5 relative bg-[#123831] border-b lg:border-b-0 lg:border-r border-[#4D774E] p-8 flex flex-col justify-between overflow-hidden">
          {/* Real Photography Background with Forest Dark Vignette */}
          <div className="absolute inset-0 opacity-45 pointer-events-none">
            <MedicalVisualAsset
              type={role === 'HOSPITAL_ADMIN' ? 'admin_command' : 'hero_hospital'}
              className="w-full h-full object-cover scale-105"
            />
          </div>
          <div className="absolute inset-0 bg-linear-to-b from-[#123831]/90 via-[#123831]/95 to-[#0e302a] pointer-events-none" />

          {/* Top Brand Watermark */}
          <div className="relative z-10 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#164A41]/80 border border-[#4D774E] text-xs font-mono text-[#9DC88D]">
              <ShieldCheck className="w-3.5 h-3.5 text-[#F1B24A]" />
              <span>Zero-Diagnostics Data Architecture</span>
            </div>

            <div>
              <h2 className="text-3xl sm:text-4xl font-display font-bold text-white tracking-tight leading-tight">
                {role === 'HOSPITAL_ADMIN'
                  ? 'Hospital Administrator Portal'
                  : 'Citizen & Patient Services'}
              </h2>
              <p className="text-xs text-[#9DC88D] mt-2 font-light leading-relaxed">
                {role === 'HOSPITAL_ADMIN'
                  ? 'Real-time governance console for Hospital Directors, Medical Superintendents, and Triage Officers to publish live bed availability and manage emergency load.'
                  : 'Accurate nearby facility search, live GPS waiting-time predictions, and immediate 108 ambulance coordination.'}
              </p>
            </div>
          </div>

          {/* Highlights & Security Badges */}
          <div className="relative z-10 my-8 space-y-3">
            {role === 'HOSPITAL_ADMIN' ? (
              <>
                <div className="flex items-start gap-2.5 text-xs text-[#d8ebd1]">
                  <CheckCircle2 className="w-4 h-4 text-[#F1B24A] shrink-0 mt-0.5" />
                  <span>Authorized access to update ICU beds, ventilators, and blood units</span>
                </div>
                <div className="flex items-start gap-2.5 text-xs text-[#d8ebd1]">
                  <CheckCircle2 className="w-4 h-4 text-[#F1B24A] shrink-0 mt-0.5" />
                  <span>Tamper-proof cryptographic audit log for all staff revisions</span>
                </div>
                <div className="flex items-start gap-2.5 text-xs text-[#d8ebd1]">
                  <CheckCircle2 className="w-4 h-4 text-[#F1B24A] shrink-0 mt-0.5" />
                  <span>Instant emergency diversion status broadcast across city network</span>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-start gap-2.5 text-xs text-[#d8ebd1]">
                  <CheckCircle2 className="w-4 h-4 text-[#9DC88D] shrink-0 mt-0.5" />
                  <span>Live distance and vacancy radar calibrated to your real coordinates</span>
                </div>
                <div className="flex items-start gap-2.5 text-xs text-[#d8ebd1]">
                  <CheckCircle2 className="w-4 h-4 text-[#9DC88D] shrink-0 mt-0.5" />
                  <span>AI waiting-time predictions before leaving home</span>
                </div>
                <div className="flex items-start gap-2.5 text-xs text-[#d8ebd1]">
                  <CheckCircle2 className="w-4 h-4 text-[#9DC88D] shrink-0 mt-0.5" />
                  <span>Private and encrypted session (zero medical history stored)</span>
                </div>
              </>
            )}
          </div>

          {/* Quick Demo Login Triggers */}
          <div className="relative z-10 pt-4 border-t border-[#4D774E]/60">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#9DC88D] block mb-2 font-bold">
              Instant 1-Click Evaluation:
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleInstantDemo('HOSPITAL_ADMIN')}
                className="px-3 py-2 rounded-xl bg-[#F1B24A] hover:bg-[#e09f36] text-[#164A41] text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-sm active:scale-95"
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>Demo Admin</span>
              </button>
              <button
                type="button"
                onClick={() => handleInstantDemo('PATIENT')}
                className="px-3 py-2 rounded-xl bg-[#164A41] hover:bg-[#123831] border border-[#4D774E] text-white text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 active:scale-95"
              >
                <User className="w-3.5 h-3.5 text-[#9DC88D]" />
                <span>Demo Patient</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Side: The Classic Minimalist Form */}
        <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-between">
          <div>
            {/* Role Switcher Pill Container */}
            <div className="space-y-2 mb-6">
              <span className="text-[11px] font-mono font-bold text-[#9DC88D] uppercase tracking-wider block">
                Select Account Classification:
              </span>
              <div className="grid grid-cols-2 gap-2 p-1.5 bg-[#123831] rounded-2xl border border-[#4D774E]">
                <button
                  type="button"
                  onClick={() => {
                    setRole('HOSPITAL_ADMIN');
                    setErrorMessage('');
                  }}
                  className={`py-3 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                    role === 'HOSPITAL_ADMIN'
                      ? 'bg-[#F1B24A] text-[#164A41] shadow-md'
                      : 'text-[#9DC88D] hover:text-white'
                  }`}
                >
                  <Building2 className="w-4 h-4" />
                  <span>Hospital Administrator</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setRole('PATIENT');
                    setErrorMessage('');
                  }}
                  className={`py-3 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                    role === 'PATIENT'
                      ? 'bg-[#4D774E] text-white shadow-md'
                      : 'text-[#9DC88D] hover:text-white'
                  }`}
                >
                  <User className="w-4 h-4" />
                  <span>Normal User / Patient</span>
                </button>
              </div>
            </div>

            {/* Mode Switcher: Sign In vs Sign Up */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#4D774E]/60">
              <div>
                <h3 className="text-xl font-display font-bold text-white tracking-tight">
                  {mode === 'login'
                    ? role === 'HOSPITAL_ADMIN'
                      ? 'Administrator Sign In'
                      : 'Normal User Sign In'
                    : role === 'HOSPITAL_ADMIN'
                    ? 'Register Hospital Staff Account'
                    : 'Create Citizen Account'}
                </h3>
                <p className="text-xs text-[#9DC88D] mt-0.5">
                  {mode === 'login'
                    ? 'Enter your credentials to access your session.'
                    : 'Create a new secure profile for QueueLess telemetry.'}
                </p>
              </div>

              <div className="flex items-center gap-1 p-1 bg-[#123831] rounded-xl border border-[#4D774E] text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setErrorMessage('');
                  }}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    mode === 'login'
                      ? 'bg-[#164A41] text-white font-bold'
                      : 'text-[#9DC88D] hover:text-white'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode('signup');
                    setErrorMessage('');
                  }}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    mode === 'signup'
                      ? 'bg-[#164A41] text-white font-bold'
                      : 'text-[#9DC88D] hover:text-white'
                  }`}
                >
                  Sign Up
                </button>
              </div>
            </div>

            {/* Error Message if any */}
            {errorMessage && (
              <div className="mb-5 p-3 rounded-xl bg-red-950/80 border border-red-500/60 text-red-200 text-xs flex items-start gap-2.5 animate-in fade-in duration-200">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Full Name for Signup */}
              {mode === 'signup' && (
                <div>
                  <label className="block text-xs font-semibold text-[#9DC88D] mb-1.5">
                    {role === 'HOSPITAL_ADMIN' ? 'Doctor / Administrator Name' : 'Full Name'}
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder={role === 'HOSPITAL_ADMIN' ? 'Dr. Alok Verma, MD' : 'Rahul Sharma'}
                      className="w-full pl-10 pr-4 py-2.5 bg-[#123831] border border-[#4D774E] rounded-xl text-xs text-white placeholder-[#9DC88D]/50 focus:outline-none focus:border-[#F1B24A] transition-colors"
                    />
                    <User className="w-4 h-4 text-[#9DC88D] absolute left-3.5 top-3" />
                  </div>
                </div>
              )}

              {/* Email Address */}
              <div>
                <label className="block text-xs font-semibold text-[#9DC88D] mb-1.5">
                  {role === 'HOSPITAL_ADMIN' ? 'Official Hospital Email' : 'Email Address'}
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={
                      role === 'HOSPITAL_ADMIN'
                        ? 'director@aiims.gov.in'
                        : 'rahul.sharma@example.com'
                    }
                    className="w-full pl-10 pr-4 py-2.5 bg-[#123831] border border-[#4D774E] rounded-xl text-xs text-white placeholder-[#9DC88D]/50 focus:outline-none focus:border-[#F1B24A] transition-colors"
                  />
                  <Mail className="w-4 h-4 text-[#9DC88D] absolute left-3.5 top-3" />
                </div>
              </div>

              {/* Hospital Selection for Administrator */}
              {role === 'HOSPITAL_ADMIN' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#9DC88D] mb-1.5">
                      Assigned Clinical Facility
                    </label>
                    <select
                      value={selectedHospitalId}
                      onChange={(e) => setSelectedHospitalId(e.target.value)}
                      className="w-full px-3 py-2.5 bg-[#123831] border border-[#4D774E] rounded-xl text-xs text-white focus:outline-none focus:border-[#F1B24A] transition-colors"
                    >
                      {hospitals.map((hosp) => (
                        <option key={hosp.id} value={hosp.id} className="bg-[#123831] text-white">
                          {hosp.name} ({hosp.city})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#9DC88D] mb-1.5">
                      Staff Security PIN <span className="text-[#F1B24A] font-mono text-[10px]">(Demo: 9944)</span>
                    </label>
                    <div className="relative">
                      <input
                        type="password"
                        required
                        value={adminPin}
                        onChange={(e) => setAdminPin(e.target.value)}
                        placeholder="Security PIN"
                        className="w-full pl-9 pr-3 py-2.5 bg-[#123831] border border-[#4D774E] rounded-xl text-xs text-white font-mono placeholder-[#9DC88D]/50 focus:outline-none focus:border-[#F1B24A] transition-colors"
                      />
                      <KeyRound className="w-4 h-4 text-[#F1B24A] absolute left-3 top-3" />
                    </div>
                  </div>
                </div>
              )}

              {/* Patient Blood Group Selection */}
              {role === 'PATIENT' && mode === 'signup' && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#9DC88D] mb-1.5">
                      Emergency Blood Group
                    </label>
                    <select
                      value={bloodGroup}
                      onChange={(e) => setBloodGroup(e.target.value as BloodGroup)}
                      className="w-full px-3 py-2.5 bg-[#123831] border border-[#4D774E] rounded-xl text-xs text-white focus:outline-none focus:border-[#F1B24A]"
                    >
                      {['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'].map((bg) => (
                        <option key={bg} value={bg} className="bg-[#123831]">
                          {bg}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#9DC88D] mb-1.5">
                      Phone Number (Optional)
                    </label>
                    <div className="relative">
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+91 98765 00000"
                        className="w-full pl-9 pr-3 py-2.5 bg-[#123831] border border-[#4D774E] rounded-xl text-xs text-white placeholder-[#9DC88D]/50 focus:outline-none focus:border-[#F1B24A]"
                      />
                      <Phone className="w-4 h-4 text-[#9DC88D] absolute left-3 top-3" />
                    </div>
                  </div>
                </div>
              )}

              {/* Password */}
              <div>
                <label className="block text-xs font-semibold text-[#9DC88D] mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-4 py-2.5 bg-[#123831] border border-[#4D774E] rounded-xl text-xs text-white placeholder-[#9DC88D]/50 focus:outline-none focus:border-[#F1B24A] transition-colors"
                  />
                  <Lock className="w-4 h-4 text-[#9DC88D] absolute left-3.5 top-3" />
                </div>
              </div>

              {/* Submit CTA Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg active:scale-98 ${
                    role === 'HOSPITAL_ADMIN'
                      ? 'bg-[#F1B24A] hover:bg-[#e09f36] text-[#164A41]'
                      : 'bg-[#4D774E] hover:bg-[#5a8b5b] text-white'
                  }`}
                >
                  {isLoading ? (
                    <span className="animate-pulse">Authenticating Identity...</span>
                  ) : (
                    <>
                      <span>
                        {mode === 'login'
                          ? role === 'HOSPITAL_ADMIN'
                            ? 'Enter Hospital Administrator Console'
                            : 'Sign In to Citizen Dashboard'
                          : role === 'HOSPITAL_ADMIN'
                          ? 'Register & Authorize Facility'
                          : 'Create Patient Profile'}
                      </span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Footer Notice */}
          <div className="mt-8 pt-4 border-t border-[#4D774E]/60 text-[11px] text-[#9DC88D] flex items-center justify-between">
            <span>Security Assurance: TLS 1.3 End-to-End Encryption</span>
            <span className="font-mono text-[#F1B24A]">No-PHI Policy Active</span>
          </div>
        </div>
      </div>
    </div>
  );
};
