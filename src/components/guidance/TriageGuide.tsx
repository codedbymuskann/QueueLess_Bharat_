import React, { useState } from 'react';
import { TriageEngine } from '../../domain/triageEngine';
import { SymptomGuide, TriageCategory } from '../../types/triage';
import { ShieldAlert, Heart, Clock, AlertTriangle, Phone, Activity, ChevronRight, Stethoscope } from 'lucide-react';

interface TriageGuideProps {
  onSearchEmergencyHospitals: () => void;
  onCallAmbulance: () => void;
}

export const TriageGuide: React.FC<TriageGuideProps> = ({
  onSearchEmergencyHospitals,
  onCallAmbulance,
}) => {
  const [selectedProtocolId, setSelectedProtocolId] = useState<string>(
    TriageEngine.SYMPTOM_PROTOCOLS[0].id
  );

  const currentProtocol: SymptomGuide =
    TriageEngine.getProtocolById(selectedProtocolId) ||
    TriageEngine.SYMPTOM_PROTOCOLS[0];

  return (
    <div className="space-y-6 text-white">
      {/* Header */}
      <div className="bg-[#1c5248] rounded-3xl border border-[#4D774E] p-8 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Stethoscope className="w-5 h-5 text-[#F1B24A]" />
              <h2 className="font-display text-2xl font-bold text-white tracking-tight">
                Clinical Triage & Life-Saving Protocol Guide
              </h2>
            </div>
            <p className="text-xs text-[#9DC88D] mt-1 font-light max-w-2xl leading-relaxed">
              Evidence-based Emergency Severity Index (ESI) protocols. Identify life-threatening red-flag symptoms, observe golden-hour time windows, and route patients to appropriate facility levels.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onCallAmbulance}
              className="px-5 py-2.5 text-xs font-bold text-[#164A41] bg-[#F1B24A] hover:bg-[#e09f36] active:scale-95 transition-all rounded-full shadow-md flex items-center gap-2"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Call 108 Ambulance</span>
            </button>
          </div>
        </div>
      </div>

      {/* Emergency Severity Level Reference Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
        <div className="p-4 rounded-2xl bg-[#be123c]/20 border border-[#be123c]/40 text-white">
          <div className="font-bold text-rose-300">Level 1: Red</div>
          <div className="text-[11px] text-white mt-0.5">Immediate (0m)</div>
          <div className="text-[10px] text-rose-200 mt-1 font-mono">Cardiac arrest, apnea</div>
        </div>

        <div className="p-4 rounded-2xl bg-[#ea580c]/20 border border-[#ea580c]/40 text-white">
          <div className="font-bold text-orange-300">Level 2: Orange</div>
          <div className="text-[11px] text-white mt-0.5">Emergent (&lt; 15m)</div>
          <div className="text-[10px] text-orange-200 mt-1 font-mono">Chest pain, FAST stroke</div>
        </div>

        <div className="p-4 rounded-2xl bg-[#d97706]/20 border border-[#d97706]/40 text-white">
          <div className="font-bold text-amber-300">Level 3: Yellow</div>
          <div className="text-[11px] text-white mt-0.5">Urgent (&lt; 60m)</div>
          <div className="text-[10px] text-amber-200 mt-1 font-mono">Fracture, trauma</div>
        </div>

        <div className="p-4 rounded-2xl bg-[#16a34a]/20 border border-[#16a34a]/40 text-white">
          <div className="font-bold text-emerald-300">Level 4: Green</div>
          <div className="text-[11px] text-white mt-0.5">Less Urgent (&lt; 120m)</div>
          <div className="text-[10px] text-emerald-200 mt-1 font-mono">Laceration, sprain</div>
        </div>

        <div className="p-4 rounded-2xl bg-[#0284c7]/20 border border-[#0284c7]/40 text-white col-span-2 sm:col-span-1">
          <div className="font-bold text-sky-300">Level 5: Blue</div>
          <div className="text-[11px] text-white mt-0.5">Non-Urgent / OPD</div>
          <div className="text-[10px] text-sky-200 mt-1 font-mono">Routine prescription</div>
        </div>
      </div>

      {/* Main Interactive Symptom Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Symptom List */}
        <div className="lg:col-span-4 bg-[#1c5248] rounded-3xl border border-[#4D774E] p-5 shadow-xl space-y-2">
          <div className="text-xs font-mono font-bold text-[#9DC88D] uppercase tracking-wider px-2 py-1">
            Clinical Protocols
          </div>

          <div className="space-y-1">
            {TriageEngine.SYMPTOM_PROTOCOLS.map((protocol) => {
              const isSelected = protocol.id === selectedProtocolId;
              return (
                <button
                  key={protocol.id}
                  onClick={() => setSelectedProtocolId(protocol.id)}
                  className={`w-full text-left p-3.5 rounded-xl transition-all flex items-center justify-between text-xs ${
                    isSelected
                      ? 'bg-[#F1B24A] text-[#164A41] font-bold shadow-md'
                      : 'hover:bg-[#123831] text-[#d8ebd1]'
                  }`}
                >
                  <span className="line-clamp-1">{protocol.name}</span>
                  <ChevronRight className="w-3.5 h-3.5 opacity-70 shrink-0" />
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Protocol Deep-Dive & Life-Saving Instructions */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-[#1c5248] rounded-3xl border border-[#4D774E] p-8 shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#4D774E]/60">
              <div>
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#F1B24A]">
                  {currentProtocol.urgencyLabel}
                </span>
                <h3 className="font-display text-xl font-bold text-white mt-1">
                  {currentProtocol.name}
                </h3>
              </div>

              {currentProtocol.goldenHourWindowMinutes && (
                <div className="px-3.5 py-1.5 rounded-full bg-[#123831] border border-[#4D774E] text-[#F1B24A] text-xs font-bold flex items-center gap-2 self-start font-mono">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Golden Window: {currentProtocol.goldenHourWindowMinutes} mins</span>
                </div>
              )}
            </div>

            {/* Action Required Directive */}
            <div className="p-4 rounded-2xl bg-[#123831] border border-[#4D774E] text-xs text-[#d8ebd1] space-y-1.5">
              <div className="font-bold text-[#F1B24A] flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-[#F1B24A]" />
                <span>Primary Clinical Directive:</span>
              </div>
              <p className="leading-relaxed font-medium pl-6 text-white">{currentProtocol.actionRequired}</p>
            </div>

            {/* Red Flag Indicators */}
            <div className="space-y-2.5">
              <h4 className="text-xs font-mono font-bold text-[#9DC88D] uppercase tracking-wider">
                Critical Red Flag Indicators
              </h4>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {currentProtocol.criticalIndicators.map((ind, i) => (
                  <li key={i} className="p-3 rounded-xl bg-[#123831] border border-[#4D774E] text-[#d8ebd1] flex items-start gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#F1B24A] mt-1 shrink-0" />
                    <span>{ind}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* First Aid & Golden Hour Protocol */}
            <div className="space-y-2.5 pt-2">
              <h4 className="text-xs font-mono font-bold text-[#9DC88D] uppercase tracking-wider">
                Immediate Pre-Hospital First Aid Actions
              </h4>
              <div className="space-y-2 text-xs">
                {currentProtocol.firstAidAdvice.map((advice, i) => (
                  <div key={i} className="p-3 rounded-xl bg-[#123831] border border-[#4D774E] flex items-start gap-2.5 text-[#d8ebd1]">
                    <span className="font-bold text-[#F1B24A] font-mono">{i + 1}.</span>
                    <span>{advice}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA action button */}
            <div className="pt-4 border-t border-[#4D774E]/60 flex flex-wrap items-center justify-between gap-3">
              <div className="text-xs text-[#9DC88D]">
                Filter verified facilities matching this requirement immediately:
              </div>
              <button
                onClick={onSearchEmergencyHospitals}
                className="px-5 py-2.5 text-xs font-bold text-[#164A41] bg-[#F1B24A] hover:bg-[#e09f36] active:scale-95 transition-all rounded-xl flex items-center gap-2 shadow-md"
              >
                <span>Find Equipped Hospitals</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
