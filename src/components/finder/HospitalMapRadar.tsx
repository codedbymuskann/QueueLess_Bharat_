import React, { useState } from 'react';
import { Hospital } from '../../types/hospital';
import { Crosshair, ShieldCheck, Clock, Navigation } from 'lucide-react';
import { GeoCoordinates } from '../../services/locationService';

interface HospitalMapRadarProps {
  hospitals: Hospital[];
  selectedHospitalId?: string;
  onSelectHospital: (hospital: Hospital) => void;
  radiusKm: number;
  userCoords: GeoCoordinates;
}

export const HospitalMapRadar: React.FC<HospitalMapRadarProps> = ({
  hospitals,
  selectedHospitalId,
  onSelectHospital,
  radiusKm,
  userCoords,
}) => {
  const [hoveredHospital, setHoveredHospital] = useState<Hospital | null>(null);

  // Center coordinate comes from the user's active live coordinates
  const center = { lat: userCoords.lat, lng: userCoords.lng };

  // Calculate SVG projection scale based on chosen radius
  const scale = 170 / Math.max(8, radiusKm * 1.1);

  return (
    <div className="bg-slate-900 rounded-xl border border-slate-800 p-5 text-slate-100 shadow-md">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-2">
        <div>
          <div className="flex items-center gap-2">
            <Crosshair className="w-4 h-4 text-rose-500 animate-pulse" />
            <h3 className="text-sm font-semibold text-white">
              Live Geo-Spatial Resource Radar
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Active Center: <span className="text-slate-200 font-medium">{userCoords.label}</span> · Detection Radius: <span className="font-mono tabular-nums text-rose-400">{radiusKm} km</span>
          </p>
        </div>

        <div className="flex items-center gap-3 text-[11px] text-slate-400">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
            <span>ICU Ready</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
            <span>High Queue</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
            <span>Critical Load</span>
          </div>
        </div>
      </div>

      {/* Radar Canvas with Parallax Feel & Subtle Rotation */}
      <div className="relative w-full aspect-16/9 sm:aspect-21/9 max-h-[380px] my-3 rounded-lg overflow-hidden bg-slate-950 border border-slate-800/80 flex items-center justify-center">
        <svg viewBox="0 0 700 360" className="w-full h-full">
          <defs>
            <pattern id="radarGridLive" width="30" height="30" patternUnits="userSpaceOnUse">
              <path d="M 30 0 L 0 0 0 30" fill="none" stroke="rgba(255, 255, 255, 0.04)" strokeWidth="1" />
            </pattern>
            <radialGradient id="radarSweepLive" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="rgba(244, 63, 94, 0.15)" />
              <stop offset="55%" stopColor="rgba(244, 63, 94, 0.03)" />
              <stop offset="100%" stopColor="transparent" />
            </radialGradient>
          </defs>

          <rect width="700" height="360" fill="url(#radarGridLive)" />
          <circle cx="350" cy="180" r="160" fill="url(#radarSweepLive)" />

          {/* Concentric rings */}
          <circle cx="350" cy="180" r="45" fill="none" stroke="rgba(255, 255, 255, 0.12)" strokeWidth="1" strokeDasharray="3 3" />
          <circle cx="350" cy="180" r="95" fill="none" stroke="rgba(255, 255, 255, 0.12)" strokeWidth="1" strokeDasharray="3 3" />
          <circle cx="350" cy="180" r="150" fill="none" stroke="rgba(255, 255, 255, 0.16)" strokeWidth="1" />

          {/* Cross lines */}
          <line x1="350" y1="20" x2="350" y2="340" stroke="rgba(255, 255, 255, 0.08)" strokeWidth="1" />
          <line x1="190" y1="180" x2="510" y2="180" stroke="rgba(255, 255, 255, 0.08)" strokeWidth="1" />

          {/* Range Labels */}
          <text x="355" y="132" fill="rgba(255, 255, 255, 0.35)" fontSize="9" fontFamily="monospace">
            {Math.round(radiusKm * 0.3)}km
          </text>
          <text x="355" y="82" fill="rgba(255, 255, 255, 0.35)" fontSize="9" fontFamily="monospace">
            {Math.round(radiusKm * 0.65)}km
          </text>
          <text x="355" y="28" fill="rgba(255, 255, 255, 0.45)" fontSize="9" fontFamily="monospace">
            {radiusKm}km max
          </text>

          {/* Center User Location Pin */}
          <g transform="translate(350, 180)">
            <circle r="14" fill="rgba(244, 63, 94, 0.25)" className="animate-ping" />
            <circle r="5" fill="#f43f5e" stroke="#ffffff" strokeWidth="1.5" />
            <text x="8" y="4" fill="#ffffff" fontSize="10" fontWeight="bold">
              {userCoords.source === 'gps' ? 'Live GPS' : 'Your Location'}
            </text>
          </g>

          {/* Hospital nodes */}
          {hospitals.map((hosp) => {
            const dx = (hosp.coordinates.lng - center.lng) * 111.32 * Math.cos((center.lat * Math.PI) / 180);
            const dy = (hosp.coordinates.lat - center.lat) * 110.57;

            const svgX = 350 + (dx * scale * 1.8);
            const svgY = 180 - (dy * scale * 1.8);

            // Clamp into visual box if outside
            if (svgX < 20 || svgX > 680 || svgY < 20 || svgY > 340) {
              return null;
            }

            const isSelected = selectedHospitalId === hosp.id;
            const hasIcu = hosp.inventory.icuBedsAvailable > 0;
            const isCritical = hosp.emergencyDepartmentStatus === 'CRITICAL_DIVERT_ONLY';

            const fillColor = isCritical
              ? '#ef4444'
              : !hasIcu
              ? '#f59e0b'
              : '#10b981';

            return (
              <g
                key={hosp.id}
                transform={`translate(${svgX}, ${svgY})`}
                className="cursor-pointer transition-transform duration-150 hover:scale-125"
                onClick={() => onSelectHospital(hosp)}
                onMouseEnter={() => setHoveredHospital(hosp)}
                onMouseLeave={() => setHoveredHospital(null)}
              >
                {isSelected && (
                  <circle r="16" fill="none" stroke="#f43f5e" strokeWidth="2" strokeDasharray="4 2" />
                )}
                <circle r="7" fill={fillColor} stroke="#ffffff" strokeWidth="1.5" />
                <text
                  x="10"
                  y="3"
                  fill="#e2e8f0"
                  fontSize="9.5"
                  fontWeight="600"
                  className="select-none pointer-events-none drop-shadow"
                >
                  {hosp.name.split(' ')[0]} ({hosp.distanceKm}km)
                </text>
              </g>
            );
          })}
        </svg>

        {/* Hovered Tooltip Card */}
        {hoveredHospital && (
          <div className="absolute bottom-3 left-3 right-3 sm:right-auto sm:max-w-xs bg-slate-900/95 backdrop-blur-md border border-slate-700 p-3 rounded-lg text-xs space-y-1 z-10 shadow-lg">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white line-clamp-1">{hoveredHospital.name}</span>
              <span className="font-mono text-rose-400 font-semibold">{hoveredHospital.distanceKm}km</span>
            </div>
            <div className="text-[11px] text-slate-400">
              ICU Available: <strong className="text-white font-mono">{hoveredHospital.inventory.icuBedsAvailable}</strong> · Ventilators: <strong className="text-white font-mono">{hoveredHospital.inventory.ventilatorsAvailable}</strong>
            </div>
            <div className="text-[11px] text-slate-400">
              Queue: <strong className="text-white font-mono">{hoveredHospital.currentQueueCount}</strong> patients waiting
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
        <span>Click any facility node to view bed inventory and connect with dispatch</span>
        <span className="font-mono">Spatial Model: Haversine Geodesic</span>
      </div>
    </div>
  );
};
