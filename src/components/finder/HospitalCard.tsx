import React from 'react';
import { motion } from 'motion/react';
import { PhoneCall, Navigation, Clock, ShieldCheck, HeartPulse, ChevronRight, AlertTriangle } from 'lucide-react';
import { Hospital, WaitTimePredictionResult } from '../../types/hospital';
import { PredictionEngine } from '../../domain/predictionEngine';
import { MedicalVisualAsset } from '../common/MedicalVisualAsset';

interface HospitalCardProps {
  hospital: Hospital;
  onCallHospital: (hospital: Hospital) => void;
  onCallAmbulance: (hospital: Hospital) => void;
  onViewPredictor: (hospital: Hospital) => void;
  onViewDirections: (hospital: Hospital) => void;
}

export const HospitalCard: React.FC<HospitalCardProps> = ({
  hospital,
  onCallHospital,
  onCallAmbulance,
  onViewPredictor,
  onViewDirections,
}) => {
  const currentHour = new Date().getHours();
  const currentDay = new Date().getDay();

  // Run prediction engine for this hospital's live telemetry
  const prediction: WaitTimePredictionResult = PredictionEngine.predictWaitTime({
    queueCount: hospital.currentQueueCount,
    activeDoctors: hospital.activeDoctorsCount,
    hourOfDay: currentHour,
    dayOfWeek: currentDay,
    emergencyStatus: hospital.emergencyDepartmentStatus,
  });

  const timeAgoMinutes = Math.max(1, Math.round((Date.now() - new Date(hospital.inventory.lastUpdatedIso).getTime()) / 60000));
  const totalBloodUnits = Object.values(hospital.inventory.bloodUnits).reduce((a, b) => a + b, 0);

  return (
    <motion.article
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-20px' }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="bg-[#1c5248] rounded-2xl border border-[#4D774E] hover:border-[#9DC88D] transition-all p-6 shadow-xl flex flex-col justify-between"
    >
      {/* Top Header Zone */}
      <div className="space-y-3">
        {/* Unboxed clean metadata (Zero-Pill discipline) */}
        <div className="flex flex-wrap items-center gap-2 text-xs text-[#9DC88D] font-mono">
          <span className="font-semibold text-[#d8ebd1]">{hospital.category}</span>
          <span aria-hidden="true">·</span>
          <span>{hospital.city}</span>
          <span aria-hidden="true">·</span>
          <span className="font-bold text-[#F1B24A]">{hospital.distanceKm} km away</span>
          <span aria-hidden="true">·</span>
          <span>~{Math.round(hospital.distanceKm * 2.1 + 4)}m drive</span>
          {hospital.nabhAccredited && (
            <>
              <span aria-hidden="true">·</span>
              <span className="text-[#9DC88D] font-bold">NABH Certified</span>
            </>
          )}
        </div>

        {/* Primary Hospital Title & Architectural Visual */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3.5">
            <div className="w-13 h-13 rounded-2xl overflow-hidden shrink-0 border border-[#4D774E] shadow-sm relative bg-[#123831]">
              <MedicalVisualAsset
                type={hospital.inventory.icuBedsAvailable > 3 ? 'hero_hospital' : 'icu_ward'}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h3 className="font-display font-bold text-xl text-white leading-snug tracking-tight">
                {hospital.name}
              </h3>
              <p className="text-xs text-[#9DC88D]/80 line-clamp-1 mt-1 font-sans">
                {hospital.address}
              </p>
            </div>
          </div>

          {/* Clinical Rating */}
          <div className="text-right shrink-0 bg-[#123831] px-2.5 py-1 rounded-xl border border-[#4D774E]">
            <div className="text-sm font-bold text-[#F1B24A] font-mono tabular-nums">
              ★ {hospital.rating.toFixed(1)}
            </div>
            <div className="text-[10px] text-[#9DC88D] font-mono">
              {hospital.ratingCount} reviews
            </div>
          </div>
        </div>

        {/* AI Waiting Time Banner */}
        <div className="my-3 p-3.5 rounded-xl bg-[#123831] border border-[#4D774E]/70 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#F1B24A] text-[#164A41] flex items-center justify-center font-bold shrink-0 shadow-sm">
              <Clock className="w-5 h-5 text-[#164A41]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#9DC88D] font-medium">Estimated Wait:</span>
                <span className="text-base font-bold text-white font-mono tabular-nums">
                  {prediction.predictedWaitMinutes} mins
                </span>
                <span className="text-xs text-[#9DC88D] font-mono tabular-nums">
                  ({prediction.rangeMinMinutes}–{prediction.rangeMaxMinutes}m)
                </span>
              </div>
              <div className="text-[11px] text-[#d8ebd1] flex items-center gap-2 mt-0.5 font-mono">
                <span>Crowd: <strong className="text-[#F1B24A] font-sans font-bold">{prediction.crowdLevel}</strong></span>
                <span aria-hidden="true" className="text-[#4D774E]">·</span>
                <span>Doctors: <strong className="text-white">{hospital.activeDoctorsCount}</strong></span>
                <span aria-hidden="true" className="text-[#4D774E]">·</span>
                <span>Queue: <strong className="text-white">{hospital.currentQueueCount}</strong></span>
              </div>
            </div>
          </div>

          <button
            onClick={() => onViewPredictor(hospital)}
            className="text-xs font-bold text-[#F1B24A] hover:underline flex items-center gap-0.5 shrink-0 px-2 py-1 rounded-lg hover:bg-[#1c5248] transition-colors uppercase tracking-wider"
          >
            <span>Simulate</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Resource Telemetry Grid (Tabular Numerals) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 pb-2">
          <div className="p-3 rounded-xl bg-[#164A41] border border-[#4D774E]">
            <div className="text-[10px] text-[#9DC88D] uppercase tracking-wider font-bold">ICU Beds</div>
            <div className="text-lg font-bold text-white font-mono tabular-nums mt-0.5">
              {hospital.inventory.icuBedsAvailable} <span className="text-xs font-normal text-[#9DC88D]">/ {hospital.inventory.icuBedsTotal}</span>
            </div>
            <div className="text-[10px] text-[#9DC88D] mt-0.5">
              {hospital.inventory.icuBedsAvailable > 0 ? (
                <span className="text-[#9DC88D] font-bold">Vacant</span>
              ) : (
                <span className="text-[#F1B24A] font-bold">Full / Divert</span>
              )}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#164A41] border border-[#4D774E]">
            <div className="text-[10px] text-[#9DC88D] uppercase tracking-wider font-bold">Ventilators</div>
            <div className="text-lg font-bold text-white font-mono tabular-nums mt-0.5">
              {hospital.inventory.ventilatorsAvailable} <span className="text-xs font-normal text-[#9DC88D]">/ {hospital.inventory.ventilatorsTotal}</span>
            </div>
            <div className="text-[10px] text-[#9DC88D] mt-0.5">
              {hospital.inventory.ventilatorsAvailable > 0 ? (
                <span className="text-[#9DC88D] font-bold">Ready</span>
              ) : (
                <span className="text-[#F1B24A] font-bold">Occupied</span>
              )}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#164A41] border border-[#4D774E]">
            <div className="text-[10px] text-[#9DC88D] uppercase tracking-wider font-bold">General Beds</div>
            <div className="text-lg font-bold text-white font-mono tabular-nums mt-0.5">
              {hospital.inventory.generalBedsAvailable} <span className="text-xs font-normal text-[#9DC88D]">/ {hospital.inventory.generalBedsTotal}</span>
            </div>
            <div className="text-[10px] text-[#9DC88D] mt-0.5 font-mono">
              O2: {hospital.inventory.oxygenCylindersAvailable} cyl
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#164A41] border border-[#4D774E]">
            <div className="text-[10px] text-[#9DC88D] uppercase tracking-wider font-bold">Blood Bank</div>
            <div className="text-lg font-bold text-[#F1B24A] font-mono tabular-nums mt-0.5">
              {totalBloodUnits} <span className="text-xs font-normal text-[#9DC88D]">units</span>
            </div>
            <div className="text-[10px] text-[#9DC88D] mt-0.5 font-mono">
              O+: {hospital.inventory.bloodUnits['O+']} · B+: {hospital.inventory.bloodUnits['B+']}
            </div>
          </div>
        </div>

        {/* Verification Status & Timeliness */}
        <div className="flex items-center justify-between text-xs text-[#9DC88D] pt-1 font-mono">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-[#F1B24A] shrink-0" />
            <span className="font-sans">
              Verified {timeAgoMinutes}m ago by <strong className="text-white">{hospital.inventory.verifiedByStaffRole}</strong>
            </span>
          </div>

          {hospital.emergencyDepartmentStatus === 'CRITICAL_DIVERT_ONLY' && (
            <div className="flex items-center gap-1 text-[#F1B24A] font-bold font-sans">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Divert Only</span>
            </div>
          )}
        </div>
      </div>

      {/* Action Footer Buttons */}
      <div className="mt-5 pt-4 border-t border-[#4D774E]/60 grid grid-cols-3 gap-2">
        <button
          onClick={() => onCallHospital(hospital)}
          className="px-3.5 py-2.5 text-xs font-bold text-[#164A41] bg-[#F1B24A] hover:bg-[#e09f36] active:scale-95 transition-all rounded-xl flex items-center justify-center gap-1.5 whitespace-nowrap shadow-md"
        >
          <PhoneCall className="w-3.5 h-3.5 text-[#164A41] shrink-0" />
          <span>Call Desk</span>
        </button>

        <button
          onClick={() => onCallAmbulance(hospital)}
          className="px-3.5 py-2.5 text-xs font-bold text-white bg-[#4D774E] hover:bg-[#5b8a5c] border border-[#9DC88D]/40 active:scale-95 transition-all rounded-xl flex items-center justify-center gap-1.5 whitespace-nowrap shadow-sm"
        >
          <HeartPulse className="w-3.5 h-3.5 text-[#F1B24A] shrink-0" />
          <span>Ambulance</span>
        </button>

        <button
          onClick={() => onViewDirections(hospital)}
          className="px-3.5 py-2.5 text-xs font-semibold text-[#9DC88D] bg-[#123831] hover:text-white hover:bg-[#164A41] border border-[#4D774E] active:scale-95 transition-all rounded-xl flex items-center justify-center gap-1.5 whitespace-nowrap"
        >
          <Navigation className="w-3.5 h-3.5 shrink-0" />
          <span>Directions</span>
        </button>
      </div>
    </motion.article>
  );
};
