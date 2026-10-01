import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
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
} from 'lucide-react';

interface GoogleHospitalMapProps {
  hospitals: Hospital[];
  userCoords: GeoCoordinates;
  radiusKm: number;
  selectedHospital?: Hospital | null;
  onSelectHospital: (hospital: Hospital) => void;
  onCallHospital: (hospital: Hospital) => void;
  onCallAmbulance: (hospital: Hospital) => void;
}

type TileStyle = 'dark' | 'osm' | 'satellite';

const TILE_PROVIDERS: Record<TileStyle, { url: string; attribution: string; label: string }> = {
  dark: {
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
    label: 'Dark Matter (Free)',
  },
  osm: {
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    label: 'OpenStreetMap (Free)',
  },
  satellite: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
    label: 'Satellite (Free)',
  },
};

export const GoogleHospitalMap: React.FC<GoogleHospitalMapProps> = ({
  hospitals,
  userCoords,
  radiusKm,
  selectedHospital,
  onSelectHospital,
  onCallHospital,
  onCallAmbulance,
}) => {
  const [activeHospital, setActiveHospital] = useState<Hospital | null>(selectedHospital || hospitals[0] || null);
  const [tileStyle, setTileStyle] = useState<TileStyle>('dark');
  const [viewMode, setViewMode] = useState<'leaflet' | 'radar'>('leaflet');

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const userCircleRef = useRef<L.Circle | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);

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

  // Initialize Leaflet Map
  useEffect(() => {
    if (viewMode !== 'leaflet' || !mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [userCoords.lat, userCoords.lng],
        zoom: 12,
        zoomControl: true,
        attributionControl: false,
      });

      const provider = TILE_PROVIDERS[tileStyle];
      const tiles = L.tileLayer(provider.url, {
        maxZoom: 19,
        attribution: provider.attribution,
        subdomains: 'abcd',
      }).addTo(map);

      tileLayerRef.current = tiles;

      const markersGroup = L.layerGroup().addTo(map);
      markersLayerRef.current = markersGroup;

      mapInstanceRef.current = map;
    }

    return () => {
      // Keep map alive unless unmounted
    };
  }, [viewMode]);

  // Update Tile Layer if user switches between Dark / OSM / Satellite
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
    }

    const provider = TILE_PROVIDERS[tileStyle];
    const newTiles = L.tileLayer(provider.url, {
      maxZoom: 19,
      attribution: provider.attribution,
      subdomains: 'abcd',
    }).addTo(map);

    tileLayerRef.current = newTiles;
  }, [tileStyle]);

  // Update Markers & Geodesic Circle whenever hospitals or user coordinates change
  useEffect(() => {
    if (!mapInstanceRef.current || viewMode !== 'leaflet') return;
    const map = mapInstanceRef.current;

    // Update user marker & radius circle
    if (userCircleRef.current) map.removeLayer(userCircleRef.current);
    if (userMarkerRef.current) map.removeLayer(userMarkerRef.current);

    const radiusCircle = L.circle([userCoords.lat, userCoords.lng], {
      radius: radiusKm * 1000,
      color: '#F1B24A',
      fillColor: '#164A41',
      fillOpacity: 0.12,
      weight: 1.5,
      dashArray: '4, 6',
    }).addTo(map);
    userCircleRef.current = radiusCircle;

    // Custom pulse icon for User location
    const userIcon = L.divIcon({
      className: 'custom-user-gps-pin',
      html: `
        <div style="position: relative; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center;">
          <div style="position: absolute; width: 32px; height: 32px; border-radius: 9999px; background: rgba(241, 178, 74, 0.35); animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
          <div style="width: 14px; height: 14px; border-radius: 9999px; background: #F1B24A; border: 2.5px solid #164A41; box-shadow: 0 0 10px rgba(241,178,74,0.8);"></div>
        </div>
      `,
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    });

    const userMarker = L.marker([userCoords.lat, userCoords.lng], { icon: userIcon })
      .addTo(map)
      .bindTooltip(`You are here (${userCoords.label.split(' ')[0]})`, {
        permanent: false,
        direction: 'top',
        className: 'leaflet-tooltip-forest',
      });
    userMarkerRef.current = userMarker;

    // Clear and redraw hospital markers
    if (markersLayerRef.current) {
      markersLayerRef.current.clearLayers();

      hospitals.forEach((hosp) => {
        const isSelected = activeHospital?.id === hosp.id;
        const hasIcu = hosp.inventory.icuBedsAvailable > 0;
        const markerColor =
          hosp.emergencyDepartmentStatus === 'CRITICAL_DIVERT_ONLY'
            ? '#ef4444'
            : hasIcu
            ? '#9DC88D'
            : '#F1B24A';

        const hospIcon = L.divIcon({
          className: 'custom-hospital-pin',
          html: `
            <div style="display: flex; flex-direction: column; align-items: center; cursor: pointer; transform: scale(${isSelected ? 1.25 : 1}); transition: transform 0.2s;">
              <div style="
                background: #164A41;
                border: 2px solid ${isSelected ? '#F1B24A' : markerColor};
                border-radius: 12px;
                padding: 3px 8px;
                display: flex;
                align-items: center;
                gap: 5px;
                box-shadow: 0 4px 14px rgba(0,0,0,0.6);
              ">
                <span style="display: inline-block; width: 8px; height: 8px; border-radius: 9999px; background: ${markerColor};"></span>
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
          `,
          iconSize: [120, 36],
          iconAnchor: [60, 36],
        });

        const marker = L.marker([hosp.coordinates.lat, hosp.coordinates.lng], { icon: hospIcon })
          .on('click', () => {
            setActiveHospital(hosp);
            onSelectHospital(hosp);
            map.panTo([hosp.coordinates.lat, hosp.coordinates.lng], { animate: true, duration: 0.5 });
          });

        markersLayerRef.current?.addLayer(marker);
      });
    }
  }, [hospitals, userCoords, radiusKm, activeHospital, viewMode]);

  const handleSelectHospitalItem = (hosp: Hospital) => {
    setActiveHospital(hosp);
    onSelectHospital(hosp);
    if (mapInstanceRef.current && viewMode === 'leaflet') {
      mapInstanceRef.current.panTo([hosp.coordinates.lat, hosp.coordinates.lng], { animate: true, duration: 0.5 });
    }
  };

  const handleCenterOnUser = () => {
    if (mapInstanceRef.current && viewMode === 'leaflet') {
      mapInstanceRef.current.setView([userCoords.lat, userCoords.lng], 12, { animate: true });
    }
  };

  return (
    <div className="bg-[#1c5248] rounded-3xl border border-[#4D774E] overflow-hidden shadow-2xl">
      {/* Top Header & Map Controls */}
      <div className="p-5 border-b border-[#4D774E]/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#123831]">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#9DC88D] animate-ping" />
            <h3 className="font-display font-bold text-lg text-white tracking-tight flex items-center gap-2">
              <span>Live Nearby Hospital Map</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-[#4D774E] text-[#d8ebd1] font-semibold">
                Free Keyless Open APIs
              </span>
            </h3>
          </div>
          <p className="text-xs text-[#9DC88D] mt-0.5 font-mono">
            Showing verified clinical facilities within <strong className="text-white font-bold">{radiusKm} km</strong> of your GPS location. Tap any marker for real-time telemetry.
          </p>
        </div>

        {/* View mode toggle & Free Tile Switcher */}
        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          {/* Tile Selector */}
          <div className="flex items-center gap-1 p-1 bg-[#164A41] rounded-xl border border-[#4D774E]">
            <button
              onClick={() => setTileStyle('dark')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                tileStyle === 'dark' ? 'bg-[#F1B24A] text-[#164A41]' : 'text-[#9DC88D] hover:text-white'
              }`}
            >
              Dark Map
            </button>
            <button
              onClick={() => setTileStyle('osm')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                tileStyle === 'osm' ? 'bg-[#F1B24A] text-[#164A41]' : 'text-[#9DC88D] hover:text-white'
              }`}
            >
              Road Map
            </button>
            <button
              onClick={() => setTileStyle('satellite')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                tileStyle === 'satellite' ? 'bg-[#F1B24A] text-[#164A41]' : 'text-[#9DC88D] hover:text-white'
              }`}
            >
              Satellite
            </button>
          </div>

          {/* Center User GPS Button */}
          <button
            onClick={handleCenterOnUser}
            className="p-2 bg-[#164A41] hover:bg-[#123831] border border-[#4D774E] text-[#F1B24A] hover:text-white rounded-xl text-xs font-bold transition-colors"
            title="Recenter on My Live Location"
          >
            <Compass className="w-4 h-4" />
          </button>

          {/* External Free Google Directions Link */}
          {activeHospital && (
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${activeHospital.coordinates.lat},${activeHospital.coordinates.lng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 bg-[#4D774E] hover:bg-[#5b8a5c] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm"
              title="Open directions in Google Maps App (Free)"
            >
              <span>Directions</span>
              <ExternalLink className="w-3.5 h-3.5 text-[#F1B24A]" />
            </a>
          )}
        </div>
      </div>

      {/* Map Viewport Area */}
      <div className="relative w-full h-[480px] sm:h-[520px] bg-[#0e302a] overflow-hidden">
        {/* Leaflet OpenStreetMap Container */}
        <div ref={mapContainerRef} className="w-full h-full z-10" />

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
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap flex items-center gap-2 shrink-0 ${
                isSelected
                  ? 'bg-[#F1B24A] text-[#164A41] shadow-md font-bold'
                  : 'bg-[#1c5248] border border-[#4D774E] text-[#9DC88D] hover:text-white hover:border-[#9DC88D]'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  hosp.inventory.icuBedsAvailable > 0 ? 'bg-[#9DC88D]' : 'bg-[#F1B24A]'
                }`}
              />
              <span>{hosp.name.split(' ')[0]}</span>
              <span className="font-mono text-[11px] opacity-80">({hosp.distanceKm}km)</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
