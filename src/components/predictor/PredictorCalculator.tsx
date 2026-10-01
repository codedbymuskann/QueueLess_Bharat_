import React, { useState, useEffect } from 'react';
import { Hospital, WaitTimePredictionResult } from '../../types/hospital';
import { PredictionEngine } from '../../domain/predictionEngine';
import { Clock, Users, Stethoscope, AlertCircle, Calendar, Sun, CheckCircle2 } from 'lucide-react';
import { CrowdForecastChart } from './CrowdForecastChart';

interface PredictorCalculatorProps {
  hospitals: Hospital[];
  selectedHospital?: Hospital;
  onSelectHospital: (hospital: Hospital) => void;
}

export const PredictorCalculator: React.FC<PredictorCalculatorProps> = ({
  hospitals,
  selectedHospital,
  onSelectHospital,
}) => {
  const currentHospital = selectedHospital || hospitals[0];

  const now = new Date();
  const [dayOfWeek, setDayOfWeek] = useState<number>(now.getDay());
  const [hourOfDay, setHourOfDay] = useState<number>(now.getHours());
  const [queueCount, setQueueCount] = useState<number>(currentHospital.currentQueueCount);
  const [activeDoctors, setActiveDoctors] = useState<number>(currentHospital.activeDoctorsCount);
  const [department, setDepartment] = useState<'EMERGENCY' | 'OPD' | 'TRAUMA' | 'PEDIATRICS'>('EMERGENCY');
  const [emergencyStatus, setEmergencyStatus] = useState<Hospital['emergencyDepartmentStatus']>(currentHospital.emergencyDepartmentStatus);

  useEffect(() => {
    if (currentHospital) {
      setQueueCount(currentHospital.currentQueueCount);
      setActiveDoctors(currentHospital.activeDoctorsCount);
      setEmergencyStatus(currentHospital.emergencyDepartmentStatus);
    }
  }, [currentHospital?.id]);

  const prediction: WaitTimePredictionResult = PredictionEngine.predictWaitTime({
    queueCount,
    activeDoctors,
    hourOfDay,
    dayOfWeek,
    emergencyStatus,
    department,
  });

  const days = [
    { id: 0, label: 'Sun' },
    { id: 1, label: 'Mon' },
    { id: 2, label: 'Tue' },
    { id: 3, label: 'Wed' },
    { id: 4, label: 'Thu' },
    { id: 5, label: 'Fri' },
    { id: 6, label: 'Sat' },
  ];

  const departments: { id: 'EMERGENCY' | 'OPD' | 'TRAUMA' | 'PEDIATRICS'; label: string }[] = [
    { id: 'EMERGENCY', label: 'Emergency Triage' },
    { id: 'OPD', label: 'Outpatient (OPD)' },
    { id: 'TRAUMA', label: 'Trauma Bay' },
    { id: 'PEDIATRICS', label: 'Pediatrics' },
  ];

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="bg-[#1c5248] rounded-3xl border border-[#4D774E] p-8 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs font-mono font-bold text-[#9DC88D] uppercase tracking-widest block">
              Predictive Algorithmic Engine
            </span>
            <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              AI Waiting-Time & Queue Forecaster
            </h2>
            <p className="text-xs text-[#d8ebd1] font-light max-w-2xl leading-relaxed">
              M/M/c multi-server queuing theory formulation combined with diurnal multivariate regression. Calibrate clinical staffing to simulate queue dynamics.
            </p>
          </div>

          <div className="shrink-0">
            <label className="block text-xs font-bold text-[#9DC88D] mb-1 font-mono uppercase tracking-wider">
              Selected Facility:
            </label>
            <select
              value={currentHospital?.id}
              onChange={(e) => {
                const found = hospitals.find((h) => h.id === e.target.value);
                if (found) onSelectHospital(found);
              }}
              className="bg-[#123831] border border-[#4D774E] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#F1B24A] font-semibold"
            >
              {hospitals.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Parameter Simulator Controls */}
        <div className="lg:col-span-7 bg-[#1c5248] rounded-3xl border border-[#4D774E] p-6 sm:p-8 shadow-xl space-y-6">
          <h3 className="font-display text-lg font-bold text-white tracking-tight pb-3 border-b border-[#4D774E]/60">
            Clinical Parameters & Arrival Influx
          </h3>

          {/* Department Selector */}
          <div>
            <label className="block text-xs font-bold text-[#9DC88D] mb-2 uppercase tracking-wider font-mono">
              Department Stream:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {departments.map((d) => (
                <button
                  key={d.id}
                  onClick={() => setDepartment(d.id)}
                  className={`px-3 py-2.5 text-xs rounded-xl border text-center transition-all font-semibold ${
                    department === d.id
                      ? 'bg-[#F1B24A] border-[#F1B24A] text-[#164A41] shadow-md font-bold'
                      : 'bg-[#123831] border-[#4D774E] text-[#9DC88D] hover:text-white'
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          {/* Day of Week */}
          <div>
            <label className="block text-xs font-bold text-[#9DC88D] mb-2 uppercase tracking-wider font-mono">
              Day of Week:
            </label>
            <div className="grid grid-cols-7 gap-1.5">
              {days.map((d) => (
                <button
                  key={d.id}
                  onClick={() => setDayOfWeek(d.id)}
                  className={`py-2 text-xs rounded-xl border text-center transition-all font-semibold ${
                    dayOfWeek === d.id
                      ? 'bg-[#F1B24A] border-[#F1B24A] text-[#164A41] shadow-md font-bold'
                      : 'bg-[#123831] border-[#4D774E] text-[#9DC88D] hover:text-white'
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          {/* Hour of Day Slider */}
          <div>
            <div className="flex items-center justify-between text-xs font-bold text-[#9DC88D] mb-2">
              <span>Arrival Time:</span>
              <span className="font-mono text-[#F1B24A] text-sm font-bold">
                {hourOfDay === 0 ? '12:00 AM' : hourOfDay < 12 ? `${hourOfDay}:00 AM` : hourOfDay === 12 ? '12:00 PM' : `${hourOfDay - 12}:00 PM`}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="23"
              value={hourOfDay}
              onChange={(e) => setHourOfDay(parseInt(e.target.value))}
              className="w-full accent-[#F1B24A] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-[#9DC88D]/70 mt-1 font-mono">
              <span>12 AM</span>
              <span>09 AM (Morning Peak)</span>
              <span>02 PM</span>
              <span>06 PM (Evening Surge)</span>
              <span>11 PM</span>
            </div>
          </div>

          {/* Queue Count Slider */}
          <div>
            <div className="flex items-center justify-between text-xs font-bold text-[#9DC88D] mb-2">
              <span className="flex items-center gap-1.5">
                <Users className="w-4 h-4 text-[#F1B24A]" />
                <span>Active Triage Queue:</span>
              </span>
              <span className="font-mono text-white font-bold text-sm">
                {queueCount} patients
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="80"
              value={queueCount}
              onChange={(e) => setQueueCount(parseInt(e.target.value))}
              className="w-full accent-[#F1B24A] cursor-pointer"
            />
          </div>

          {/* Active Doctors Slider */}
          <div>
            <div className="flex items-center justify-between text-xs font-bold text-[#9DC88D] mb-2">
              <span className="flex items-center gap-1.5">
                <Stethoscope className="w-4 h-4 text-[#F1B24A]" />
                <span>Physicians on Shift:</span>
              </span>
              <span className="font-mono text-white font-bold text-sm">
                {activeDoctors} physicians
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="30"
              value={activeDoctors}
              onChange={(e) => setActiveDoctors(parseInt(e.target.value))}
              className="w-full accent-[#F1B24A] cursor-pointer"
            />
          </div>
        </div>

        {/* Right Column: AI Prediction Output */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-[#1c5248] rounded-3xl border border-[#4D774E] p-6 sm:p-8 shadow-xl space-y-5 text-white">
            <div className="flex items-center justify-between pb-3 border-b border-[#4D774E]/60">
              <span className="text-xs font-mono font-bold text-[#9DC88D] uppercase tracking-wider">
                Forecast Output
              </span>
              <span className="text-xs text-[#F1B24A] font-bold flex items-center gap-1 font-mono">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {prediction.confidenceScore}% Confidence
              </span>
            </div>

            {/* Big Hero Estimated Wait Metric */}
            <div className="text-center py-6 bg-[#123831] rounded-2xl border border-[#4D774E]">
              <div className="text-[11px] text-[#9DC88D] font-bold uppercase tracking-widest">
                Forecasted Wait Duration
              </div>
              <div className="font-display text-5xl font-extrabold text-[#F1B24A] font-mono tabular-nums my-1">
                {prediction.predictedWaitMinutes} <span className="text-xl font-normal text-[#9DC88D]">min</span>
              </div>
              <div className="text-xs text-[#d8ebd1] font-mono tabular-nums">
                Confidence Range: {prediction.rangeMinMinutes} – {prediction.rangeMaxMinutes} mins
              </div>

              <div className="mt-3 inline-block px-3.5 py-1.5 rounded-full text-xs font-bold bg-[#164A41] border border-[#4D774E] text-white">
                Crowd Density: <span className="text-[#F1B24A]">{prediction.crowdLevel}</span>
              </div>
            </div>

            {/* Recommendation Box */}
            <div className="p-4 rounded-2xl bg-[#123831] border border-[#4D774E] text-xs text-[#d8ebd1] space-y-1.5">
              <div className="font-display text-sm font-bold text-white">Clinical Guidance</div>
              <p className="leading-relaxed font-light">{prediction.recommendation}</p>
              <div className="pt-2 text-[11px] text-[#9DC88D] font-mono">
                Optimal Arrival Window: <strong className="text-[#F1B24A] font-bold">{prediction.optimalArrivalSlot}</strong>
              </div>
            </div>

            {/* Mathematical Factor Attribution Breakdown */}
            <div className="space-y-2 pt-2 text-xs">
              <div className="font-display text-sm font-bold text-white pb-1.5 border-b border-[#4D774E]/60">
                Mathematical Factor Breakdown
              </div>
              <div className="space-y-2">
                <div className="flex justify-between py-1 border-b border-[#4D774E]/30">
                  <span className="text-[#9DC88D]">Queue Volume ({queueCount} patients):</span>
                  <span className="font-mono text-white font-bold tabular-nums">
                    +{prediction.factors.queueImpactMinutes}m
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#4D774E]/30">
                  <span className="text-[#9DC88D]">Diurnal Influx Multiplier:</span>
                  <span className="font-mono text-white font-bold tabular-nums">
                    {prediction.factors.timeOfDayImpactMinutes >= 0 ? '+' : ''}{prediction.factors.timeOfDayImpactMinutes}m
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#4D774E]/30">
                  <span className="text-[#9DC88D]">Physician Parallelism ({activeDoctors} docs):</span>
                  <span className="font-mono text-[#9DC88D] font-bold tabular-nums">
                    {prediction.factors.doctorRatioImpactMinutes}m
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-[#9DC88D]">Emergency Surge Buffer:</span>
                  <span className="font-mono text-[#F1B24A] font-bold tabular-nums">
                    +{prediction.factors.emergencySurgeImpactMinutes}m
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <CrowdForecastChart
        hospitalName={currentHospital.name}
        baseQueue={queueCount}
        activeDoctors={activeDoctors}
        dayOfWeek={dayOfWeek}
        currentHour={hourOfDay}
      />
    </div>
  );
};
