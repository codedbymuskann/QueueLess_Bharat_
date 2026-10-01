import React, { useState } from 'react';
import { Search, MapPin, SlidersHorizontal, AlertCircle, RotateCcw, Crosshair, Loader2, Navigation } from 'lucide-react';
import { CITY_PRESETS, GeoCoordinates, LocationService } from '../../services/locationService';

export interface FilterState {
  searchQuery: string;
  radiusKm: number;
  requireIcu: boolean;
  requireVentilator: boolean;
  requireEmergencyOpen: boolean;
  requireBlood: boolean;
  selectedBloodGroup: string;
  sortBy: 'distance' | 'waitTime' | 'icuBeds' | 'rating';
  selectedCityId: string;
}

interface HospitalFilterProps {
  filters: FilterState;
  onChange: (newFilters: FilterState) => void;
  onReset: () => void;
  totalHospitals: number;
  matchingCount: number;
  currentLocation: GeoCoordinates;
  onLocationUpdate: (coords: GeoCoordinates) => void;
}

export const HospitalFilter: React.FC<HospitalFilterProps> = ({
  filters,
  onChange,
  onReset,
  totalHospitals,
  matchingCount,
  currentLocation,
  onLocationUpdate,
}) => {
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [locationError, setLocationError] = useState<string>('');

  const radiusOptions = [5, 15, 30, 60, 150];

  const handleToggle = (key: keyof FilterState) => {
    onChange({
      ...filters,
      [key]: !filters[key],
    });
  };

  const handleDetectLiveLocation = async () => {
    setIsLocating(true);
    setLocationError('');
    try {
      const coords = await LocationService.getLiveCoordinates();
      onLocationUpdate(coords);
      onChange({ ...filters, selectedCityId: 'custom-gps' });
    } catch (err: any) {
      setLocationError(err?.message || 'Failed to detect location.');
    } finally {
      setIsLocating(false);
    }
  };

  const handleSelectCityPreset = (cityId: string) => {
    const found = CITY_PRESETS.find((c) => c.id === cityId);
    if (found) {
      onLocationUpdate({
        lat: found.coords.lat,
        lng: found.coords.lng,
        source: 'preset',
        label: `${found.name}`,
      });
      onChange({ ...filters, selectedCityId: cityId });
    } else if (cityId === 'all') {
      onChange({ ...filters, selectedCityId: 'all' });
    }
  };

  return (
    <div className="bg-[#1c5248] rounded-2xl border border-[#4D774E] p-6 shadow-xl space-y-5">
      {/* Live Geolocation & Search Top Bar */}
      <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
        {/* Search input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#9DC88D] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={filters.searchQuery}
            onChange={(e) => onChange({ ...filters, searchQuery: e.target.value })}
            placeholder="Search facility name, trauma level, PICU, or cath lab..."
            className="w-full pl-10 pr-4 py-2.5 bg-[#123831] border border-[#4D774E] rounded-xl text-sm text-white placeholder-[#9DC88D]/50 focus:outline-none focus:ring-2 focus:ring-[#F1B24A] focus:border-[#F1B24A] transition-all"
          />
        </div>

        {/* Live Location Action & City Selector */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Live GPS button */}
          <button
            onClick={handleDetectLiveLocation}
            disabled={isLocating}
            className={`px-3.5 py-2.5 text-xs font-bold rounded-xl border transition-all flex items-center gap-2 whitespace-nowrap active:scale-95 ${
              currentLocation.source === 'gps'
                ? 'bg-[#F1B24A] text-[#164A41] border-[#F1B24A] shadow-md'
                : 'bg-[#123831] border-[#4D774E] text-[#9DC88D] hover:text-white hover:border-[#9DC88D]'
            }`}
            title="Access browser HTML5 Geolocation API for real-time live GPS coordinates"
          >
            {isLocating ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-[#164A41]" />
            ) : (
              <Crosshair className="w-3.5 h-3.5" />
            )}
            <span>{isLocating ? 'Detecting GPS...' : currentLocation.source === 'gps' ? 'Live GPS Active' : 'Use Live GPS'}</span>
          </button>

          {/* Regional Hub selector */}
          <div className="flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-[#9DC88D] shrink-0" />
            <select
              value={filters.selectedCityId}
              onChange={(e) => handleSelectCityPreset(e.target.value)}
              className="bg-[#123831] border border-[#4D774E] rounded-xl px-3 py-2.5 text-xs font-semibold text-white focus:outline-none focus:border-[#F1B24A]"
            >
              <option value="all">All India Facilities</option>
              {CITY_PRESETS.map((city) => (
                <option key={city.id} value={city.id}>
                  {city.name}
                </option>
              ))}
              {currentLocation.source === 'gps' && (
                <option value="custom-gps">📍 Live Device Location</option>
              )}
            </select>
          </div>
        </div>
      </div>

      {/* Location Status Badge */}
      <div className="flex items-center justify-between text-xs text-[#9DC88D] px-1 font-mono">
        <div className="flex items-center gap-2">
          <Navigation className="w-3.5 h-3.5 text-[#F1B24A]" />
          <span>Active Origin: <strong className="text-white font-sans">{currentLocation.label}</strong></span>
          {currentLocation.accuracy && (
            <span className="text-[#9DC88D]/70 font-mono">· accuracy ±{Math.round(currentLocation.accuracy)}m</span>
          )}
        </div>

        {locationError && (
          <span className="text-[#F1B24A] font-bold font-sans">{locationError}</span>
        )}
      </div>

      {/* Critical Equipment & Specialty Filters */}
      <div className="pt-3 border-t border-[#4D774E]/60 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-[#9DC88D] uppercase tracking-wider mr-1">
            Emergency Filters:
          </span>

          <button
            onClick={() => handleToggle('requireIcu')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl border transition-all flex items-center gap-1.5 ${
              filters.requireIcu
                ? 'bg-[#F1B24A] text-[#164A41] border-[#F1B24A] font-bold'
                : 'bg-[#123831] border-[#4D774E] text-[#9DC88D] hover:text-white hover:border-[#9DC88D]'
            }`}
          >
            <span>ICU Bed Ready</span>
          </button>

          <button
            onClick={() => handleToggle('requireVentilator')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl border transition-all flex items-center gap-1.5 ${
              filters.requireVentilator
                ? 'bg-[#F1B24A] text-[#164A41] border-[#F1B24A] font-bold'
                : 'bg-[#123831] border-[#4D774E] text-[#9DC88D] hover:text-white hover:border-[#9DC88D]'
            }`}
          >
            <span>Ventilator Operational</span>
          </button>

          <button
            onClick={() => handleToggle('requireEmergencyOpen')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl border transition-all flex items-center gap-1.5 ${
              filters.requireEmergencyOpen
                ? 'bg-[#9DC88D] text-[#164A41] border-[#9DC88D] font-bold'
                : 'bg-[#123831] border-[#4D774E] text-[#9DC88D] hover:text-white hover:border-[#9DC88D]'
            }`}
          >
            <span>ER Open Normal</span>
          </button>

          <button
            onClick={() => handleToggle('requireBlood')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl border transition-all flex items-center gap-1.5 ${
              filters.requireBlood
                ? 'bg-[#4D774E] text-white border-[#9DC88D] font-bold'
                : 'bg-[#123831] border-[#4D774E] text-[#9DC88D] hover:text-white hover:border-[#9DC88D]'
            }`}
          >
            <span>Blood Units &gt; 0</span>
          </button>
        </div>

        {/* Dynamic Radius Selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-[#9DC88D] font-semibold uppercase tracking-wider">Radius:</span>
          <div className="flex items-center gap-1 p-1 bg-[#123831] rounded-xl border border-[#4D774E]/60">
            {radiusOptions.map((r) => (
              <button
                key={r}
                onClick={() => onChange({ ...filters, radiusKm: r })}
                className={`px-2.5 py-1 text-xs font-mono font-bold rounded-lg transition-colors ${
                  filters.radiusKm === r
                    ? 'bg-[#F1B24A] text-[#164A41]'
                    : 'text-[#9DC88D] hover:text-white'
                }`}
              >
                {r}km
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Bar: Sorting & Counter */}
      <div className="pt-3 border-t border-[#4D774E]/60 flex flex-wrap items-center justify-between gap-3 text-xs text-[#9DC88D]">
        <div className="flex items-center gap-2">
          <span className="text-white font-medium">Sort By:</span>
          <select
            value={filters.sortBy}
            onChange={(e) => onChange({ ...filters, sortBy: e.target.value as FilterState['sortBy'] })}
            className="bg-[#123831] border border-[#4D774E] rounded-xl px-3 py-1.5 text-xs text-white font-semibold focus:outline-none focus:border-[#F1B24A]"
          >
            <option value="distance">Nearest Distance (km)</option>
            <option value="waitTime">Shortest Predicted Wait Time</option>
            <option value="icuBeds">Most Available ICU Beds</option>
            <option value="rating">Highest Clinical Rating</option>
          </select>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-[#d8ebd1]">
            <span>Showing</span>
            <span className="font-bold text-[#F1B24A] font-mono tabular-nums text-sm">{matchingCount}</span>
            <span>of</span>
            <span className="font-bold text-white font-mono tabular-nums text-sm">{totalHospitals}</span>
            <span>verified facilities</span>
          </div>

          {(filters.searchQuery || filters.requireIcu || filters.requireVentilator || filters.requireBlood || filters.selectedCityId !== 'all') && (
            <button
              onClick={onReset}
              className="text-[#F1B24A] hover:underline font-bold flex items-center gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Filters</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
