import React, { useState, useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import { Hospital, WaitTimePredictionResult } from '../../types/hospital';
import { GeoCoordinates } from '../../services/locationService';
import { PredictionEngine } from '../../domain/predictionEngine';
import {
  MapPin,
  Navigation,
  PhoneCall,
  HeartPulse,
  Clock,
  ShieldCheck,
  X,
  ExternalLink,
  Activity,
  Layers,
  Sparkles,
  Compass,
  KeyRound,
  Check,
} from 'lucide-react';

interface MapboxHospitalMapProps {
  hospitals: Hospital[];
  userCoords: GeoCoordinates;
  radiusKm: number;
  selectedHospital?: Hospital | null;
  onSelectHospital: (hospital: Hospital) => void;
  onCallHospital: (hospital: Hospital) => void;
  onCallAmbulance: (hospital: Hospital) => void;
}

type MapboxStyle =
  | 'mapbox://styles/mapbox/dark-v11'
  | 'mapbox://styles/mapbox/navigation-night-v1'
  | 'mapbox://styles/mapbox/satellite-streets-v12'
  | 'mapbox://styles/mapbox/streets-v12';

const MAPBOX_STYLES: { id: MapboxStyle; label: string }[] = [
  { id: 'mapbox://styles/mapbox/dark-v11', label: 'Dark v11' },
  { id: 'mapbox://styles/mapbox/navigation-night-v1', label: 'Nav Night' },
  { id: 'mapbox://styles/mapbox/satellite-streets-v12', label: 'Satellite' },
  { id: 'mapbox://styles/mapbox/streets-v12', label: 'Streets' },
];

const DEFAULT_MAPBOX_TOKEN =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_MAPBOX_TOKEN) ||
  '';

export const MapboxHospitalMap: React.FC<MapboxHospitalMapProps> = ({
  hospitals,
  userCoords,
  radiusKm,
  selectedHospital,
  onSelectHospital,
  onCallHospital,
  onCallAmbulance,
}) => {
  const [activeHospital, setActiveHospital] = useState<Hospital | null>(selectedHospital || hospitals[0] || null);
  const [currentStyle, setCurrentStyle] = useState<MapboxStyle>('mapbox://styles/mapbox/dark-v11');
  const [customToken, setCustomToken] = useState<string>(() => localStorage.getItem('user_mapbox_token') || '');
  const [showTokenModal, setShowTokenModal] = useState(false);
  const [tokenInput, setTokenInput] = useState('');
  const [mapboxError, setMapboxError] = useState<string | null>(null);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const userMarkerRef = useRef<mapboxgl.Marker | null>(null);

  const currentHour = new Date().getHours();
  const currentDay = new Date().getDay();

  // Active hospital prediction
  const activePrediction: WaitTimePredictionResult | null = activeHospital
    ? PredictionEngine.predictWaitTime({
      queueCount: activeHospital.currentQueueCount,
      activeDoctors: activeHospital.activeDoctorsCount,
      hourOfDay: currentHour,
      dayOfWeek: currentDay,
      emergencyStatus: activeHospital.emergencyDepartmentStatus,
    })
    : null;

  // Active token
  const effectiveToken = customToken.trim() || DEFAULT_MAPBOX_TOKEN;

  // Helper to generate a GeoJSON polygon circle for radiusKm
  const createGeoJSONCircle = (center: [number, number], radiusInKm: number, points = 64): GeoJSON.Feature<GeoJSON.Polygon> => {
    const coords: [number, number][] = [];
    const distanceX = radiusInKm / (111.32 * Math.cos((center[1] * Math.PI) / 180));
    const distanceY = radiusInKm / 110.574;

    for (let i = 0; i < points; i++) {
      const theta = (i / points) * (2 * Math.PI);
      const x = distanceX * Math.cos(theta);
      const y = distanceY * Math.sin(theta);
      coords.push([center[0] + x, center[1] + y]);
    }
    coords.push(coords[0]);

    return {
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [coords],
      },
      properties: {},
    };
  };

  // Initialize Mapbox GL Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    try {
      mapboxgl.accessToken = effectiveToken;

      const map = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: currentStyle,
        center: [userCoords.lng, userCoords.lat],
        zoom: 12,
        pitch: 35, // 3D perspective
        attributionControl: false,
      });

      map.addControl(new mapboxgl.NavigationControl({ showCompass: true }), 'top-right');

      map.on('load', () => {
        // Add Geodesic Radius Circle
        const circleData = createGeoJSONCircle([userCoords.lng, userCoords.lat], radiusKm);
        map.addSource('radius-circle-source', {
          type: 'geojson',
          data: circleData,
        });

        map.addLayer({
          id: 'radius-circle-fill',
          type: 'fill',
          source: 'radius-circle-source',
          paint: {
            'fill-color': '#164A41',
            'fill-opacity': 0.15,
          },
        });

        map.addLayer({
          id: 'radius-circle-line',
          type: 'line',
          source: 'radius-circle-source',
          paint: {
            'line-color': '#F1B24A',
            'line-width': 1.5,
            'line-dasharray': [3, 2],
          },
        });
      });

      map.on('error', (e) => {
        if (e.error && (e.error.message.includes('Forbidden') || e.error.message.includes('token') || e.error.message.includes('401'))) {
          setMapboxError('Mapbox access token error. You can add your personal token or use the free tile mode.');
        }
      });

      mapInstanceRef.current = map;

      return () => {
        map.remove();
        mapInstanceRef.current = null;
      };
    } catch (err: any) {
      setMapboxError(err.message || 'Failed to initialize Mapbox GL');
    }
  }, [currentStyle, effectiveToken]);

  // Update User Live GPS Marker
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (userMarkerRef.current) {
      userMarkerRef.current.remove();
    }

    const userEl = document.createElement('div');
    userEl.className = 'custom-user-gps-pin';
    userEl.innerHTML = `
      <div style="position: relative; width: 26px; height: 26px; display: flex; align-items: center; justify-content: center; cursor: pointer;">
        <div style="position: absolute; width: 34px; height: 34px; border-radius: 9999px; background: rgba(241, 178, 74, 0.4); animation: ping 1.8s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
        <div style="width: 15px; height: 15px; border-radius: 9999px; background: #F1B24A; border: 2.5px solid #164A41; box-shadow: 0 0 12px rgba(241,178,74,0.9);"></div>
      </div>
    `;

    const marker = new mapboxgl.Marker({ element: userEl })
      .setLngLat([userCoords.lng, userCoords.lat])
      .setPopup(
        new mapboxgl.Popup({ offset: 25, closeButton: false }).setHTML(
          `<div style="font-family: sans-serif; font-size: 11px; font-weight: bold; color: #164A41; padding: 2px 4px;">You are here (${userCoords.label.split(' ')[0]})</div>`
        )
      )
      .addTo(map);

    userMarkerRef.current = marker;

    // Update Radius Circle source if exists
    if (map.getSource('radius-circle-source')) {
      const geojsonSource = map.getSource('radius-circle-source') as mapboxgl.GeoJSONSource;
      geojsonSource.setData(createGeoJSONCircle([userCoords.lng, userCoords.lat], radiusKm));
    }
  }, [userCoords, radiusKm]);

  // Update Nearby Hospital Markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Remove old markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    hospitals.forEach((hosp) => {
      const isSelected = activeHospital?.id === hosp.id;
      const hasIcu = hosp.inventory.icuBedsAvailable > 0;
      const markerColor =
        hosp.emergencyDepartmentStatus === 'CRITICAL_DIVERT_ONLY'
          ? '#ef4444'
          : hasIcu
            ? '#9DC88D'
            : '#F1B24A';

      const hospEl = document.createElement('div');
      hospEl.className = 'custom-hospital-mapbox-pin';
      hospEl.style.cursor = 'pointer';
      hospEl.style.transform = isSelected ? 'scale(1.2)' : 'scale(1)';
      hospEl.style.transition = 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)';

      hospEl.innerHTML = `
        <div style="display: flex; flex-direction: column; align-items: center;">
          <div style="
            background: #164A41;
            border: 2px solid ${isSelected ? '#F1B24A' : markerColor};
            border-radius: 12px;
            padding: 3px 8px;
            display: flex;
            align-items: center;
            gap: 5px;
            box-shadow: 0 6px 16px rgba(0,0,0,0.6);
          ">
            <span style="display: inline-block; width: 7.5px; height: 7.5px; border-radius: 9999px; background: ${markerColor};"></span>
            <span style="color: #FFFFFF; font-size: 11px; font-weight: 700; font-family: sans-serif; white-space: nowrap;">
              ${hosp.name.split(' ')[0]}
            </span>
            <span style="color: ${isSelected ? '#F1B24A' : '#9DC88D'}; font-size: 10px; font-family: monospace; font-weight: bold;">
              ${hosp.inventory.icuBedsAvailable} ICU
            </span>
          </div>
          <div style="
            width: 0;
            height: 0;
            border-left: 5px solid transparent;
            border-right: 5px solid transparent;
            border-top: 6px solid #164A41;
          "></div>
        </div>
      `;

      hospEl.addEventListener('click', () => {
        setActiveHospital(hosp);
        onSelectHospital(hosp);
        map.flyTo({
          center: [hosp.coordinates.lng, hosp.coordinates.lat],
          zoom: 13.5,
          speed: 1.2,
          curve: 1.1,
          essential: true,
        });
      });

      const marker = new mapboxgl.Marker({ element: hospEl, anchor: 'bottom' })
        .setLngLat([hosp.coordinates.lng, hosp.coordinates.lat])
        .addTo(map);

      markersRef.current.push(marker);
    });
  }, [hospitals, activeHospital]);

  const handleSelectHospitalItem = (hosp: Hospital) => {
    setActiveHospital(hosp);
    onSelectHospital(hosp);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo({
        center: [hosp.coordinates.lng, hosp.coordinates.lat],
        zoom: 13.5,
        speed: 1.2,
        curve: 1.1,
        essential: true,
      });
    }
  };

  const handleCenterOnUser = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo({
        center: [userCoords.lng, userCoords.lat],
        zoom: 12.5,
        speed: 1.2,
        curve: 1,
        essential: true,
      });
    }
  };

  const handleSaveCustomToken = (e: React.FormEvent) => {
    e.preventDefault();
    if (tokenInput.trim()) {
      localStorage.setItem('user_mapbox_token', tokenInput.trim());
      setCustomToken(tokenInput.trim());
      setMapboxError(null);
      setShowTokenModal(false);
    }
  };

  const handleResetToken = () => {
    localStorage.removeItem('user_mapbox_token');
    setCustomToken('');
    setTokenInput('');
    setMapboxError(null);
    setShowTokenModal(false);
  };

  return (
    <div className="bg-[#1c5248] rounded-3xl border border-[#4D774E] overflow-hidden shadow-2xl">
      {/* Top Header & Map Controls */}
      <div className="p-5 border-b border-[#4D774E]/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#123831]">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#F1B24A] animate-ping" />
            <h3 className="font-display font-bold text-lg text-white tracking-tight flex items-center gap-2">
              <span>Mapbox GL Interactive Hospital Radar</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-[#4D774E] text-[#d8ebd1] font-semibold">
                Mapbox Vector API
              </span>
            </h3>
          </div>
          <p className="text-xs text-[#9DC88D] mt-0.5 font-mono">
            Showing clinical facilities within <strong className="text-white font-bold">{radiusKm} km</strong> of your coordinates. Tap any facility marker for real-time telemetry.
          </p>
        </div>

        {/* View mode toggle & Style Switcher */}
        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          {/* Mapbox Style Switcher */}
          <div className="flex items-center gap-1 p-1 bg-[#164A41] rounded-xl border border-[#4D774E]">
            {MAPBOX_STYLES.map((style) => (
              <button
                key={style.id}
                onClick={() => setCurrentStyle(style.id)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${currentStyle === style.id
                    ? 'bg-[#F1B24A] text-[#164A41]'
                    : 'text-[#9DC88D] hover:text-white'
                  }`}
              >
                {style.label}
              </button>
            ))}
          </div>

          {/* Center GPS Button */}
          <button
            onClick={handleCenterOnUser}
            className="p-2 bg-[#164A41] hover:bg-[#123831] border border-[#4D774E] text-[#F1B24A] hover:text-white rounded-xl text-xs font-bold transition-colors"
            title="Recenter on My Live GPS"
          >
            <Compass className="w-4 h-4" />
          </button>

          {/* Mapbox Token Config Trigger */}
          <button
            onClick={() => {
              setTokenInput(customToken);
              setShowTokenModal(true);
            }}
            className="p-2 bg-[#164A41] hover:bg-[#123831] border border-[#4D774E] text-[#9DC88D] hover:text-white rounded-xl text-xs transition-colors"
            title="Configure Mapbox Token"
          >
            <KeyRound className="w-4 h-4" />
          </button>

          {/* Directions Link */}
          {activeHospital && (
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${activeHospital.coordinates.lat},${activeHospital.coordinates.lng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 bg-[#4D774E] hover:bg-[#5b8a5c] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm"
              title="Open directions in navigation app"
            >
              <span>Directions</span>
              <ExternalLink className="w-3.5 h-3.5 text-[#F1B24A]" />
            </a>
          )}
        </div>
      </div>

      {/* Mapbox Warning / Error Banner if Token Issue */}
      {mapboxError && (
        <div className="bg-amber-950/80 border-b border-amber-500/40 p-3 text-xs text-amber-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <span>{mapboxError}</span>
          </div>
          <button
            onClick={() => setShowTokenModal(true)}
            className="underline font-bold text-[#F1B24A] hover:text-white ml-2"
          >
            Enter Mapbox Key
          </button>
        </div>
      )}

      {/* Mapbox Canvas Viewport */}
      <div className="relative w-full h-[480px] sm:h-[540px] bg-[#0e302a] overflow-hidden">
        <div ref={mapContainerRef} className="w-full h-full" />

        {/* Real-Time Availability Popup Card (On-Tap Marker) */}
        {activeHospital && (
          <div className="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:max-w-md bg-[#164A41]/95 backdrop-blur-md rounded-2xl border border-[#4D774E] shadow-2xl p-5 text-white animate-in slide-in-from-bottom-2 duration-150 z-20">
            {/* Header */}
            <div className="flex items-start justify-between gap-3 pb-3 border-b border-[#4D774E]/60">
              <div>
                <div className="flex items-center gap-1.5 text-xs text-[#F1B24A] font-bold">
                  <Activity className="w-3.5 h-3.5" />
                  <span>Real-Time Bed Readiness</span>
                </div>
                <h4 className="font-display font-bold text-lg text-white leading-snug mt-0.5 tracking-tight">
                  {activeHospital.name}
                </h4>
                <p className="text-xs text-[#9DC88D] line-clamp-1">
                  {activeHospital.address} · <span className="font-mono text-white font-bold">{activeHospital.distanceKm} km away</span>
                </p>
              </div>

              <button
                onClick={() => setActiveHospital(null)}
                className="text-[#9DC88D] hover:text-white p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* AI Wait & Live Status */}
            <div className="py-2.5 flex items-center justify-between text-xs text-[#9DC88D]">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#F1B24A]" />
                <span>
                  Expected Wait:{' '}
                  <strong className="text-white text-sm font-mono tabular-nums">
                    {activePrediction?.predictedWaitMinutes || 15} mins
                  </strong>
                </span>
              </div>
              <div className="text-[11px] font-mono text-[#d8ebd1]">
                Queue: <strong className="text-[#F1B24A]">{activeHospital.currentQueueCount}</strong> | Docs:{' '}
                <strong className="text-white">{activeHospital.activeDoctorsCount}</strong>
              </div>
            </div>

            {/* Real-Time Live Resource Grid */}
            <div className="grid grid-cols-3 gap-2 py-2 text-xs">
              <div className="p-2.5 rounded-xl bg-[#1c5248] border border-[#4D774E]">
                <div className="text-[10px] text-[#9DC88D] uppercase tracking-wider font-bold">ICU Beds</div>
                <div className="text-base font-bold text-white font-mono tabular-nums mt-0.5">
                  {activeHospital.inventory.icuBedsAvailable} <span className="text-xs font-normal text-[#9DC88D]">/ {activeHospital.inventory.icuBedsTotal}</span>
                </div>
                <div className="text-[10px] mt-0.5 font-bold">
                  {activeHospital.inventory.icuBedsAvailable > 0 ? (
                    <span className="text-[#9DC88D]">Vacant</span>
                  ) : (
                    <span className="text-[#F1B24A]">Full</span>
                  )}
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-[#1c5248] border border-[#4D774E]">
                <div className="text-[10px] text-[#9DC88D] uppercase tracking-wider font-bold">Ventilators</div>
                <div className="text-base font-bold text-white font-mono tabular-nums mt-0.5">
                  {activeHospital.inventory.ventilatorsAvailable} <span className="text-xs font-normal text-[#9DC88D]">/ {activeHospital.inventory.ventilatorsTotal}</span>
                </div>
                <div className="text-[10px] mt-0.5 text-[#9DC88D] font-mono">
                  <span>Operational</span>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-[#1c5248] border border-[#4D774E]">
                <div className="text-[10px] text-[#9DC88D] uppercase tracking-wider font-bold">Blood Bank</div>
                <div className="text-base font-bold text-[#F1B24A] font-mono tabular-nums mt-0.5">
                  {Object.values(activeHospital.inventory.bloodUnits).reduce((a, b) => a + b, 0)}{' '}
                  <span className="text-xs font-normal text-[#9DC88D]">units</span>
                </div>
                <div className="text-[10px] mt-0.5 font-mono text-[#d8ebd1]">
                  O+: {activeHospital.inventory.bloodUnits['O+']}
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="pt-3 border-t border-[#4D774E]/60 grid grid-cols-2 gap-2">
              <button
                onClick={() => onCallHospital(activeHospital)}
                className="py-2.5 px-3 rounded-xl bg-[#F1B24A] hover:bg-[#e09f36] text-[#164A41] font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-md"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>Call Emergency</span>
              </button>

              <button
                onClick={() => onCallAmbulance(activeHospital)}
                className="py-2.5 px-3 rounded-xl bg-[#4D774E] hover:bg-[#5b8a5c] text-white border border-[#9DC88D]/40 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                <HeartPulse className="w-3.5 h-3.5 text-[#F1B24A]" />
                <span>108 Ambulance</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Hospital Selector Carousel Bar Below Map */}
      <div className="p-3.5 bg-[#123831] border-t border-[#4D774E]/60 flex items-center gap-2 overflow-x-auto">
        <span className="text-xs font-bold text-[#9DC88D] uppercase tracking-wider shrink-0 pl-2">
          Nearby Facilities ({hospitals.length}):
        </span>
        {hospitals.map((hosp) => {
          const isSelected = activeHospital?.id === hosp.id;
          return (
            <button
              key={hosp.id}
              onClick={() => handleSelectHospitalItem(hosp)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap flex items-center gap-2 shrink-0 ${isSelected
                  ? 'bg-[#F1B24A] text-[#164A41] shadow-md font-bold'
                  : 'bg-[#1c5248] border border-[#4D774E] text-[#9DC88D] hover:text-white hover:border-[#9DC88D]'
                }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${hosp.inventory.icuBedsAvailable > 0 ? 'bg-[#9DC88D]' : 'bg-[#F1B24A]'
                  }`}
              />
              <span>{hosp.name.split(' ')[0]}</span>
              <span className="font-mono text-[11px] opacity-80">({hosp.distanceKm}km)</span>
            </button>
          );
        })}
      </div>

      {/* Custom Mapbox Token Modal */}
      {showTokenModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
          <div className="bg-[#164A41] rounded-3xl max-w-md w-full border border-[#4D774E] p-6 text-white shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#4D774E]/60 pb-3">
              <div className="flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-[#F1B24A]" />
                <h4 className="font-display font-bold text-lg text-white">Mapbox Access Token</h4>
              </div>
              <button
                onClick={() => setShowTokenModal(false)}
                className="text-[#9DC88D] hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-[#9DC88D] leading-relaxed">
              QueueLess uses Mapbox GL Vector Maps. You can provide your personal public token (<code className="text-[#F1B24A] font-mono">pk.eyJ...</code>) from your Mapbox account, or use the default token.
            </p>

            <form onSubmit={handleSaveCustomToken} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-white mb-1">
                  Public Mapbox Access Token
                </label>
                <input
                  type="text"
                  value={tokenInput}
                  onChange={(e) => setTokenInput(e.target.value)}
                  placeholder="pk.eyJ1IjoieW91ci11c2VybmFtZSI..."
                  className="w-full px-3.5 py-2.5 bg-[#123831] border border-[#4D774E] rounded-xl text-xs font-mono text-white placeholder-[#9DC88D]/40 focus:outline-none focus:border-[#F1B24A]"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={handleResetToken}
                  className="text-xs text-[#9DC88D] hover:text-white underline"
                >
                  Reset to Default
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowTokenModal(false)}
                    className="px-3.5 py-2 rounded-xl text-xs text-[#9DC88D] hover:text-white hover:bg-[#1c5248]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-[#F1B24A] text-[#164A41] hover:bg-[#e09f36] shadow-sm"
                  >
                    Save Token
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
