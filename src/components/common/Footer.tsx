import React from 'react';
import { Phone, ShieldCheck, HeartPulse } from 'lucide-react';
import { PageId } from './Navbar';

interface FooterProps {
  onNavigate: (page: PageId) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="bg-[#0e302a] text-[#9DC88D] text-xs border-t border-[#4D774E]/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-10">
          {/* Col 1 */}
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-[#F1B24A] text-[#164A41] flex items-center justify-center font-bold text-sm">
                Q
              </div>
              <span className="text-white font-display font-bold text-lg tracking-tight">QueueLess Bharat</span>
            </div>
            <p className="leading-relaxed text-[#9DC88D]/90 font-light">
              National Real-Time Emergency Hospital Availability & Queue Telemetry Network. Instant geo-spatial discovery of critical care beds and operational life support.
            </p>
            <div className="text-[#9DC88D]/60 text-[11px] font-mono">
              Zero-PHI Architecture · Open Healthcare Data Standards
            </div>
          </div>

          {/* Col 2 */}
          <div className="space-y-3">
            <h4 className="text-white font-semibold text-xs uppercase tracking-widest">Navigation</h4>
            <ul className="space-y-2 text-[#9DC88D]">
              <li>
                <button onClick={() => onNavigate('finder')} className="hover:text-white transition-colors">
                  Emergency Hospital Locator
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('predictor')} className="hover:text-white transition-colors">
                  AI Waiting-Time Predictor
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('dashboard')} className="hover:text-white transition-colors">
                  Hospital Administration Portal
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('auth')} className="hover:text-white text-[#F1B24A] font-semibold transition-colors">
                  Admin & User Sign In / Register
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('guidance')} className="hover:text-white transition-colors">
                  Clinical Triage Protocol
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('about')} className="hover:text-white transition-colors">
                  System Architecture & Security
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3 */}
          <div className="space-y-3">
            <h4 className="text-white font-semibold text-xs uppercase tracking-widest">Emergency Dispatch</h4>
            <ul className="space-y-2 font-mono tabular-nums text-[#d8ebd1]">
              <li className="flex items-center justify-between">
                <span className="font-sans text-[#9DC88D]">National Emergency</span>
                <span className="text-[#F1B24A] font-bold">112</span>
              </li>
              <li className="flex items-center justify-between">
                <span className="font-sans text-[#9DC88D]">Ambulance Service</span>
                <span className="text-[#F1B24A] font-bold">108 / 102</span>
              </li>
              <li className="flex items-center justify-between">
                <span className="font-sans text-[#9DC88D]">Health Hotline</span>
                <span>1075</span>
              </li>
              <li className="flex items-center justify-between">
                <span className="font-sans text-[#9DC88D]">Blood Bank Desk</span>
                <span>1800-180-1104</span>
              </li>
            </ul>
          </div>

          {/* Col 4 */}
          <div className="space-y-3">
            <h4 className="text-white font-semibold text-xs uppercase tracking-widest">Security & Privacy</h4>
            <div className="flex items-start gap-2.5 text-[#9DC88D] leading-relaxed font-light">
              <ShieldCheck className="w-4 h-4 text-[#F1B24A] shrink-0 mt-0.5" />
              <span>Strict Zero-Clinical-Diagnostics architecture. Zero patient health data is ever collected or tracked.</span>
            </div>
            <div className="flex items-start gap-2.5 text-[#9DC88D] leading-relaxed font-light">
              <HeartPulse className="w-4 h-4 text-[#9DC88D] shrink-0 mt-0.5" />
              <span>Verified duty officer updates with cryptographic tamper-proof logging.</span>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-[#4D774E]/30 flex flex-col sm:flex-row items-center justify-between gap-4 text-[#9DC88D]/70 text-[11px]">
          <div>
            QueueLess Bharat · National Emergency Infrastructure Platform
          </div>
          <div className="flex items-center gap-4 font-mono">
            <span>Clean Architecture</span>
            <span>·</span>
            <span>SOLID Principles</span>
            <span>·</span>
            <span>ABDM Compatible</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
