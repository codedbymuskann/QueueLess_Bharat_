import React, { useState } from 'react';
import { PhoneCall, X, Copy, Check, MapPin, HeartPulse, ShieldAlert } from 'lucide-react';
import { Hospital } from '../../types/hospital';
import { GeoCoordinates } from '../../services/locationService';

interface EmergencyModalProps {
  isOpen: boolean;
  onClose: () => void;
  hospital?: Hospital | null;
  userCoords?: GeoCoordinates;
}

export const EmergencyModal: React.FC<EmergencyModalProps> = ({
  isOpen,
  onClose,
  hospital,
  userCoords,
}) => {
  const [copiedKey, setCopiedKey] = useState<string>('');

  if (!isOpen) return null;

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(''), 2500);
  };

  const coordsString = userCoords
    ? `${userCoords.lat.toFixed(4)}° N, ${userCoords.lng.toFixed(4)}° E (${userCoords.label})`
    : '28.5672° N, 77.2100° E (National Central Hub)';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-150">
      <div className="bg-[#164A41] rounded-3xl max-w-lg w-full border border-[#4D774E] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150 text-white">
        {/* Urgent Header in Warm Amber & Dark Forest */}
        <div className="bg-[#F1B24A] p-6 text-[#164A41] flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#164A41] flex items-center justify-center text-[#F1B24A] shrink-0 shadow-md">
              <PhoneCall className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h3 className="font-display text-lg font-extrabold tracking-tight">
                Emergency Dispatch & 108 Hotline
              </h3>
              <p className="text-xs text-[#164A41]/80 font-medium mt-0.5">
                Immediate toll-free critical care ambulance routing
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-[#164A41] hover:bg-[#164A41]/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4 text-xs">
          {/* Target Hospital if selected */}
          {hospital && (
            <div className="p-4 rounded-2xl bg-[#1c5248] border border-[#4D774E] space-y-1.5">
              <div className="text-[11px] text-[#F1B24A] font-bold uppercase tracking-wider font-mono">
                Target Facility Desk:
              </div>
              <div className="font-display text-base font-bold text-white">{hospital.name}</div>
              <div className="text-[#9DC88D] line-clamp-1">{hospital.address}</div>
              <div className="pt-2 flex flex-wrap gap-2">
                <a
                  href={`tel:${hospital.phoneEmergency}`}
                  className="px-4 py-2 rounded-xl bg-[#F1B24A] hover:bg-[#e09f36] text-[#164A41] font-bold flex items-center gap-2 transition-colors shadow-sm"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>Call Emergency: {hospital.phoneEmergency}</span>
                </a>
                <button
                  onClick={() => handleCopy(hospital.phoneEmergency, 'hosp-emg')}
                  className="px-3 py-2 rounded-xl bg-[#123831] border border-[#4D774E] text-[#9DC88D] hover:text-white transition-colors flex items-center gap-1.5"
                >
                  {copiedKey === 'hosp-emg' ? <Check className="w-3.5 h-3.5 text-[#9DC88D]" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === 'hosp-emg' ? 'Copied' : 'Copy Number'}</span>
                </button>
              </div>
            </div>
          )}

          {/* National Ambulance Hotlines */}
          <div className="space-y-2">
            <div className="text-xs font-bold text-[#9DC88D] uppercase tracking-wider font-mono">
              National Emergency Helplines (24x7 Toll-Free)
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div className="p-3.5 rounded-xl bg-[#1c5248] border border-[#4D774E] flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-white">108 Ambulance</div>
                  <div className="text-[10px] text-[#9DC88D]">Free Emergency Dispatch</div>
                </div>
                <a
                  href="tel:108"
                  className="px-3.5 py-1.5 bg-[#F1B24A] hover:bg-[#e09f36] text-[#164A41] font-mono font-bold rounded-lg text-xs transition-colors"
                >
                  Dial 108
                </a>
              </div>

              <div className="p-3.5 rounded-xl bg-[#1c5248] border border-[#4D774E] flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-white">112 Unified SOS</div>
                  <div className="text-[10px] text-[#9DC88D]">National SOS Hub</div>
                </div>
                <a
                  href="tel:112"
                  className="px-3.5 py-1.5 bg-[#4D774E] hover:bg-[#5b8a5c] text-white font-mono font-bold rounded-lg text-xs transition-colors"
                >
                  Dial 112
                </a>
              </div>

              <div className="p-3.5 rounded-xl bg-[#1c5248] border border-[#4D774E] flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-white">102 Janani Shishu</div>
                  <div className="text-[10px] text-[#9DC88D]">Maternal & Infant</div>
                </div>
                <a
                  href="tel:102"
                  className="px-3.5 py-1.5 bg-[#123831] border border-[#4D774E] hover:bg-[#164A41] text-[#9DC88D] hover:text-white font-mono font-bold rounded-lg text-xs transition-colors"
                >
                  Dial 102
                </a>
              </div>

              <div className="p-3.5 rounded-xl bg-[#1c5248] border border-[#4D774E] flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-white">1075 Health Line</div>
                  <div className="text-[10px] text-[#9DC88D]">National Triage</div>
                </div>
                <a
                  href="tel:1075"
                  className="px-3.5 py-1.5 bg-[#123831] border border-[#4D774E] hover:bg-[#164A41] text-[#9DC88D] hover:text-white font-mono font-bold rounded-lg text-xs transition-colors"
                >
                  Dial 1075
                </a>
              </div>
            </div>
          </div>

          {/* Caller GPS Dispatch Coordinates */}
          <div className="p-3.5 rounded-2xl bg-[#123831] border border-[#4D774E] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#F1B24A] shrink-0" />
              <div>
                <span className="font-semibold text-white block">Active Dispatch Coordinates:</span>
                <span className="text-[11px] font-mono text-[#9DC88D]">
                  {coordsString}
                </span>
              </div>
            </div>
            <button
              onClick={() => handleCopy(coordsString, 'gps')}
              className="px-2.5 py-1 bg-[#1c5248] border border-[#4D774E] rounded-lg text-[11px] font-bold text-[#F1B24A] hover:bg-[#164A41]"
            >
              {copiedKey === 'gps' ? 'Copied' : 'Copy GPS'}
            </button>
          </div>

          {/* Golden Hour Waiting Tips */}
          <div className="text-[11px] text-[#9DC88D] space-y-1">
            <strong className="text-white">Vital steps while waiting for the ambulance:</strong>
            <ul className="list-disc pl-4 space-y-0.5">
              <li>Keep patient calm in semi-reclined recovery position; do not give water if drowsy.</li>
              <li>Keep phone line available for the ambulance driver's location confirmation.</li>
              <li>Send one attendant to the nearest main gate / intersection to guide the ambulance in.</li>
            </ul>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-[#123831] border-t border-[#4D774E]/60 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-[#1c5248] border border-[#4D774E] text-white text-xs font-semibold rounded-xl hover:bg-[#164A41] transition-colors"
          >
            Close Window
          </button>
        </div>
      </div>
    </div>
  );
};
