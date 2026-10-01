import React from 'react';
import { PredictionEngine } from '../../domain/predictionEngine';
import { BarChart3, TrendingUp, Info } from 'lucide-react';

interface CrowdForecastChartProps {
  hospitalName: string;
  baseQueue: number;
  activeDoctors: number;
  dayOfWeek: number;
  currentHour: number;
}

export const CrowdForecastChart: React.FC<CrowdForecastChartProps> = ({
  hospitalName,
  baseQueue,
  activeDoctors,
  dayOfWeek,
  currentHour,
}) => {
  const curve = PredictionEngine.forecast24Hours(baseQueue, activeDoctors, dayOfWeek);
  const maxWait = Math.max(...curve.map((c) => c.waitMinutes), 40);

  return (
    <div className="bg-[#1c5248] rounded-3xl border border-[#4D774E] p-6 sm:p-8 shadow-xl space-y-5 text-white">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#4D774E]/60 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-[#F1B24A]" />
            <h3 className="font-display text-lg font-bold text-white">
              24-Hour Projected Crowd Density & Waiting Curve
            </h3>
          </div>
          <p className="text-xs text-[#9DC88D] mt-0.5 font-mono">
            Facility: {hospitalName} · Non-emergency patient arrival guidance curve
          </p>
        </div>

        <div className="flex items-center gap-4 text-xs font-semibold text-[#9DC88D]">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-xs bg-[#9DC88D] inline-block" />
            <span>Low (&lt;15m)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-xs bg-[#F1B24A] inline-block" />
            <span>Moderate (15–25m)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-xs bg-[#e11d48] inline-block" />
            <span>Peak (&gt;25m)</span>
          </div>
        </div>
      </div>

      {/* Bar Chart Visualization */}
      <div className="pt-4 pb-2 overflow-x-auto">
        <div className="min-w-[680px] h-48 flex items-end justify-between gap-2 px-2">
          {curve.map((item) => {
            const heightPercent = Math.min(100, Math.max(12, (item.waitMinutes / maxWait) * 100));
            const isCurrent = item.hour === currentHour;

            let barColor = 'bg-[#9DC88D] hover:bg-[#b0d8a2]';
            if (item.crowd === 'High') {
              barColor = 'bg-[#e11d48] hover:bg-rose-500';
            } else if (item.crowd === 'Moderate') {
              barColor = 'bg-[#F1B24A] hover:bg-[#e09f36]';
            }

            return (
              <div key={item.hour} className="flex-1 flex flex-col items-center group relative h-full justify-end">
                {/* Tooltip on hover */}
                <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-[#0e302a] border border-[#4D774E] text-white text-[10px] py-1 px-2 rounded-lg whitespace-nowrap pointer-events-none z-20 font-mono shadow-xl">
                  {item.label}: {item.waitMinutes}m ({item.crowd})
                </div>

                {/* Current hour marker indicator */}
                {isCurrent && (
                  <div className="w-2 h-2 rounded-full bg-[#F1B24A] mb-1 animate-ping" />
                )}

                {/* Wait time bar */}
                <div
                  style={{ height: `${heightPercent}%` }}
                  className={`w-full rounded-t-md transition-all duration-200 ${barColor} ${
                    isCurrent ? 'ring-2 ring-white ring-offset-2 ring-offset-[#1c5248]' : ''
                  }`}
                />

                {/* X-axis label */}
                <span className={`text-[9px] mt-2 select-none font-mono ${isCurrent ? 'font-bold text-[#F1B24A]' : 'text-[#9DC88D]/70'}`}>
                  {item.hour % 3 === 0 ? item.label : ''}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="p-4 bg-[#123831] rounded-2xl border border-[#4D774E] text-xs text-[#d8ebd1] flex items-start gap-3">
        <Info className="w-4 h-4 text-[#F1B24A] shrink-0 mt-0.5" />
        <div>
          <strong className="text-white">Peak Planning Insight:</strong> Peak emergency and OPD arrival spikes occur between 09:30 AM–12:30 PM (morning triage) and 05:30 PM–08:00 PM. Arriving between <strong className="text-[#F1B24A]">01:30 PM and 03:30 PM</strong> reduces wait duration by up to <strong className="text-white">62%</strong>.
        </div>
      </div>
    </div>
  );
};
