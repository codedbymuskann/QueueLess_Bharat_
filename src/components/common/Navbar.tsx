import React, { useState } from 'react';
import { PhoneCall, Activity, Clock, Building2, BookOpen, Layers, User, LogOut, ShieldCheck, KeyRound } from 'lucide-react';
import { UserProfile } from '../../types/user';

export type PageId = 'finder' | 'predictor' | 'dashboard' | 'guidance' | 'about' | 'auth';

interface NavbarProps {
  currentPage: PageId;
  onNavigate: (page: PageId) => void;
  onEmergencyTrigger: () => void;
  currentUser: UserProfile | null;
  onOpenAuthModal: () => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentPage,
  onNavigate,
  onEmergencyTrigger,
  currentUser,
  onOpenAuthModal,
  onLogout,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const navItems: { id: PageId; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'finder', label: 'Emergency Finder', icon: Activity },
    { id: 'predictor', label: 'Wait Predictor', icon: Clock },
    { id: 'dashboard', label: 'Hospital Portal', icon: Building2 },
    { id: 'guidance', label: 'Triage Guide', icon: BookOpen },
    { id: 'about', label: 'Architecture', icon: Layers },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#164A41]/95 backdrop-blur-md border-b border-[#4D774E]/40 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          {/* Zone 1: Brand title wordmark */}
          <button
            onClick={() => onNavigate('finder')}
            className="flex items-center gap-3 text-left group focus-visible:outline-2 focus-visible:outline-[#F1B24A] rounded-lg"
          >
            <div className="w-9 h-9 rounded-xl bg-[#F1B24A] text-[#164A41] flex items-center justify-center font-bold text-lg shadow-sm group-hover:scale-105 transition-transform">
              Q
            </div>
            <div className="flex flex-col">
              <span className="font-display font-extrabold text-xl tracking-tight text-white group-hover:text-[#9DC88D] transition-colors">
                QueueLess Bharat
              </span>
              <span className="text-[10px] text-[#9DC88D] font-mono tracking-widest uppercase -mt-0.5">
                Real-Time Telemetry
              </span>
            </div>
          </button>

          {/* Zone 2: Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-xs tracking-wider uppercase font-semibold">
            {navItems.map((item) => {
              const isActive = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`transition-all whitespace-nowrap py-1.5 flex items-center gap-2 relative ${
                    isActive
                      ? 'text-white font-bold'
                      : 'text-[#9DC88D]/80 hover:text-white'
                  }`}
                >
                  {item.label}
                  {isActive && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#F1B24A] absolute -bottom-1 left-1/2 -translate-x-1/2" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Primary Actions & User Auth */}
          <div className="flex items-center gap-3">
            {/* User Session Profile / Login Trigger */}
            {currentUser ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#1c5248] border border-[#4D774E] hover:border-[#9DC88D] transition-colors text-xs text-white"
                >
                  <div className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs ${
                    currentUser.role === 'HOSPITAL_ADMIN' ? 'bg-[#F1B24A] text-[#164A41]' : 'bg-[#4D774E] text-white'
                  }`}>
                    {currentUser.name.charAt(0)}
                  </div>
                  <div className="hidden sm:block text-left">
                    <span className="font-semibold text-white block leading-tight truncate max-w-[120px]">
                      {currentUser.name}
                    </span>
                    <span className="text-[10px] text-[#9DC88D] block leading-tight font-mono">
                      {currentUser.role === 'HOSPITAL_ADMIN' ? 'Admin' : 'Patient'}
                    </span>
                  </div>
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-[#164A41] rounded-2xl border border-[#4D774E] shadow-2xl py-2 z-50 text-xs text-white">
                    <div className="px-3.5 py-2.5 border-b border-[#4D774E]/60">
                      <span className="font-bold text-white block truncate">{currentUser.name}</span>
                      <span className="text-[#9DC88D] text-[11px] block truncate font-mono">{currentUser.email}</span>
                      <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-mono bg-[#4D774E] text-[#d8ebd1]">
                        {currentUser.role === 'HOSPITAL_ADMIN' ? 'Hospital Director' : 'Patient / User'}
                      </span>
                    </div>

                    <div className="p-1.5 space-y-0.5">
                      {currentUser.role === 'HOSPITAL_ADMIN' ? (
                        <button
                          onClick={() => {
                            onNavigate('dashboard');
                            setUserDropdownOpen(false);
                          }}
                          className="w-full text-left px-3 py-2 hover:bg-[#1c5248] rounded-xl text-white font-medium flex items-center gap-2"
                        >
                          <Building2 className="w-3.5 h-3.5 text-[#F1B24A]" />
                          <span>Admin Portal</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            onNavigate('finder');
                            setUserDropdownOpen(false);
                          }}
                          className="w-full text-left px-3 py-2 hover:bg-[#1c5248] rounded-xl text-white font-medium flex items-center gap-2"
                        >
                          <Activity className="w-3.5 h-3.5 text-[#9DC88D]" />
                          <span>Emergency Finder</span>
                        </button>
                      )}

                      <button
                        onClick={() => {
                          onOpenAuthModal();
                          setUserDropdownOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 hover:bg-[#1c5248] rounded-xl text-[#9DC88D] hover:text-white font-medium flex items-center gap-2"
                      >
                        <User className="w-3.5 h-3.5" />
                        <span>Switch Account</span>
                      </button>

                      <button
                        onClick={() => {
                          onLogout();
                          setUserDropdownOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 hover:bg-rose-950/60 rounded-xl text-rose-300 font-medium flex items-center gap-2 border-t border-[#4D774E]/40 mt-1"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onNavigate('auth')}
                  className="px-3 py-1.5 text-xs font-semibold text-white hover:text-[#F1B24A] border border-[#4D774E] rounded-xl hover:bg-[#1c5248] transition-colors flex items-center gap-1.5"
                >
                  <KeyRound className="w-3.5 h-3.5 text-[#F1B24A]" />
                  <span className="hidden sm:inline">Sign In / Register</span>
                  <span className="sm:hidden">Sign In</span>
                </button>
              </div>
            )}

            {/* Emergency Hotline Button - Warm Amber Pill (matching screenshot #F1B24A) */}
            <button
              onClick={onEmergencyTrigger}
              className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-[#164A41] bg-[#F1B24A] hover:bg-[#e09f36] active:scale-95 transition-all rounded-full shadow-md whitespace-nowrap"
              title="Immediate Emergency Ambulance & Hotline Dispatch"
            >
              <PhoneCall className="w-3.5 h-3.5 text-[#164A41]" />
              <span>SOS 108</span>
            </button>

            {/* Mobile Drawer trigger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-[#9DC88D] hover:text-white hover:bg-[#1c5248]"
              aria-label="Toggle navigation menu"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile dropdown drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden py-3 border-t border-[#4D774E]/40 space-y-1 bg-[#164A41]">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onNavigate(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs uppercase tracking-wider font-semibold text-left ${
                    isActive ? 'bg-[#4D774E] text-white' : 'text-[#9DC88D] hover:bg-[#1c5248]'
                  }`}
                >
                  <Icon className="w-4 h-4 text-[#F1B24A]" />
                  <span>{item.label}</span>
                </button>
              );
            })}

            {!currentUser && (
              <button
                onClick={() => {
                  onNavigate('auth');
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs uppercase tracking-wider font-semibold text-left text-[#F1B24A] bg-[#123831] border border-[#4D774E]"
              >
                <KeyRound className="w-4 h-4 text-[#F1B24A]" />
                <span>Admin & Citizen Sign In</span>
              </button>
            )}
          </div>
        )}
      </div>
    </header>
  );
};
