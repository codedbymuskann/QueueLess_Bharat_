import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'motion/react';
import { Navbar, PageId } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { EmergencyModal } from './components/common/EmergencyModal';
import { ToastContainer } from './components/common/ToastContainer';
import { AuthModal } from './components/auth/AuthModal';
import { HospitalFilter, FilterState } from './components/finder/HospitalFilter';
import { HospitalCard } from './components/finder/HospitalCard';
import { MapboxHospitalMap } from './components/finder/MapboxHospitalMap';
import { PredictorCalculator } from './components/predictor/PredictorCalculator';
import { HospitalDirectorConsole } from './components/dashboard/HospitalDirectorConsole';
import { TriageGuide } from './components/guidance/TriageGuide';
import { SystemArchitecture } from './components/about/SystemArchitecture';
import { MedicalVisualAsset } from './components/common/MedicalVisualAsset';
import { AuthPage } from './components/auth/AuthPage';
import { HospitalService } from './services/hospitalService';
import { AuthService } from './services/authService';
import { Hospital } from './types/hospital';
import { UserProfile, UserRole } from './types/user';
import { PredictionEngine } from './domain/predictionEngine';
import { GeoCoordinates, CITY_PRESETS, LocationService } from './services/locationService';
import { AlertCircle, Activity, Navigation, Crosshair, Sparkles, Building2, Stethoscope, ShieldCheck, MapPin, ArrowRight } from 'lucide-react';

export default function App() {
  // Navigation State with URL Hash Sync
  const [currentPage, setCurrentPage] = useState<PageId>(() => {
    const hash = window.location.hash.replace('#', '') as PageId;
    if (['finder', 'predictor', 'dashboard', 'guidance', 'about', 'auth'].includes(hash)) {
      return hash;
    }
    return 'finder';
  });

  // User Profile / Authentication State
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => AuthService.getCurrentUser());
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authTargetRole, setAuthTargetRole] = useState<UserRole>('HOSPITAL_ADMIN');

  // Live Location State (Default to Delhi-NCR central hub)
  const [currentLocation, setCurrentLocation] = useState<GeoCoordinates>({
    lat: CITY_PRESETS[0].coords.lat,
    lng: CITY_PRESETS[0].coords.lng,
    source: 'preset',
    label: CITY_PRESETS[0].name,
  });

  // Hospitals Data initialized with dynamic coordinates
  const [hospitals, setHospitals] = useState<Hospital[]>(() =>
    HospitalService.getHospitals({ lat: CITY_PRESETS[0].coords.lat, lng: CITY_PRESETS[0].coords.lng })
  );

  const [selectedHospitalForPredictor, setSelectedHospitalForPredictor] = useState<Hospital | undefined>(hospitals[0]);
  const [emergencyModalOpen, setEmergencyModalOpen] = useState(false);
  const [emergencyTargetHospital, setEmergencyTargetHospital] = useState<Hospital | null>(null);

  // View mode toggle for Map vs Card Grid
  const [finderDisplayMode, setFinderDisplayMode] = useState<'map-first' | 'grid-first'>('map-first');

  // Filter State
  const [filters, setFilters] = useState<FilterState>({
    searchQuery: '',
    radiusKm: 30,
    requireIcu: false,
    requireVentilator: false,
    requireEmergencyOpen: false,
    requireBlood: false,
    selectedBloodGroup: 'O+',
    sortBy: 'distance',
    selectedCityId: 'delhi-ncr',
  });

  // Parallax scroll hooks for the hero viewport
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();
  const parallaxY = useTransform(scrollY, [0, 400], [0, 50]);
  const parallaxBg = useTransform(scrollY, [0, 400], [0, -30]);

  // Attempt live GPS detection on initial load
  useEffect(() => {
    LocationService.getLiveCoordinates()
      .then((coords) => {
        setCurrentLocation(coords);
        setFilters((prev) => ({ ...prev, selectedCityId: 'custom-gps' }));
      })
      .catch(() => {
        // Fallback quietly if permission denied
      });
  }, []);

  // Update hospital distance metrics whenever user coordinates change
  const handleLocationUpdate = (coords: GeoCoordinates) => {
    setCurrentLocation(coords);
    const updated = HospitalService.getHospitals({ lat: coords.lat, lng: coords.lng });
    setHospitals(updated);
    if (selectedHospitalForPredictor) {
      const match = updated.find((h) => h.id === selectedHospitalForPredictor.id);
      if (match) setSelectedHospitalForPredictor(match);
    }
  };

  // Sync Hash on Navigate
  const handleNavigate = (page: PageId) => {
    setCurrentPage(page);
    window.location.hash = page;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Reload hospitals when director console commits updates
  const refreshHospitalData = () => {
    const fresh = HospitalService.getHospitals({ lat: currentLocation.lat, lng: currentLocation.lng });
    setHospitals(fresh);
    if (selectedHospitalForPredictor) {
      const updated = fresh.find((h) => h.id === selectedHospitalForPredictor.id);
      if (updated) setSelectedHospitalForPredictor(updated);
    }
  };

  const handleLogout = () => {
    AuthService.logout();
    setCurrentUser(null);
  };

  // Filter & Sort Hospitals dynamically based on live distance
  const filteredHospitals = useMemo(() => {
    const currentHour = new Date().getHours();
    const currentDay = new Date().getDay();

    const list = hospitals.filter((hosp) => {
      if (hosp.distanceKm > filters.radiusKm) {
        return false;
      }

      if (filters.selectedCityId !== 'all' && filters.selectedCityId !== 'custom-gps') {
        const activePreset = CITY_PRESETS.find((c) => c.id === filters.selectedCityId);
        if (activePreset) {
          const hospInRegion = hosp.city.toLowerCase().includes(activePreset.name.split(' ')[0].toLowerCase());
          if (!hospInRegion && hosp.distanceKm > filters.radiusKm) return false;
        }
      }

      if (filters.searchQuery.trim()) {
        const q = filters.searchQuery.toLowerCase();
        const matchesName = hosp.name.toLowerCase().includes(q);
        const matchesCity = hosp.city.toLowerCase().includes(q);
        const matchesAddress = hosp.address.toLowerCase().includes(q);
        const matchesSpec = hosp.specialities.some((s) => s.toLowerCase().includes(q));
        if (!matchesName && !matchesCity && !matchesAddress && !matchesSpec) {
          return false;
        }
      }

      if (filters.requireIcu && hosp.inventory.icuBedsAvailable <= 0) {
        return false;
      }

      if (filters.requireVentilator && hosp.inventory.ventilatorsAvailable <= 0) {
        return false;
      }

      if (filters.requireEmergencyOpen && hosp.emergencyDepartmentStatus === 'CRITICAL_DIVERT_ONLY') {
        return false;
      }

      if (filters.requireBlood) {
        const totalUnits = Object.values(hosp.inventory.bloodUnits).reduce((a, b) => a + b, 0);
        if (totalUnits <= 0) return false;
      }

      return true;
    });

    return list.sort((a, b) => {
      if (filters.sortBy === 'distance') {
        return a.distanceKm - b.distanceKm;
      }
      if (filters.sortBy === 'icuBeds') {
        return b.inventory.icuBedsAvailable - a.inventory.icuBedsAvailable;
      }
      if (filters.sortBy === 'rating') {
        return b.rating - a.rating;
      }
      if (filters.sortBy === 'waitTime') {
        const waitA = PredictionEngine.predictWaitTime({
          queueCount: a.currentQueueCount,
          activeDoctors: a.activeDoctorsCount,
          hourOfDay: currentHour,
          dayOfWeek: currentDay,
          emergencyStatus: a.emergencyDepartmentStatus,
        }).predictedWaitMinutes;

        const waitB = PredictionEngine.predictWaitTime({
          queueCount: b.currentQueueCount,
          activeDoctors: b.activeDoctorsCount,
          hourOfDay: currentHour,
          dayOfWeek: currentDay,
          emergencyStatus: b.emergencyDepartmentStatus,
        }).predictedWaitMinutes;

        return waitA - waitB;
      }
      return 0;
    });
  }, [hospitals, filters]);

  const totalAvailableIcu = useMemo(() => {
    return hospitals.reduce((acc, h) => acc + h.inventory.icuBedsAvailable, 0);
  }, [hospitals]);

  const totalAvailableVentilators = useMemo(() => {
    return hospitals.reduce((acc, h) => acc + h.inventory.ventilatorsAvailable, 0);
  }, [hospitals]);

  const handleCallHospital = (hospital: Hospital) => {
    setEmergencyTargetHospital(hospital);
    setEmergencyModalOpen(true);
  };

  const handleCallAmbulance = (hospital?: Hospital) => {
    setEmergencyTargetHospital(hospital || null);
    setEmergencyModalOpen(true);
  };

  const handleViewPredictor = (hospital: Hospital) => {
    setSelectedHospitalForPredictor(hospital);
    handleNavigate('predictor');
  };

  const handleViewDirections = (hospital: Hospital) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${hospital.coordinates.lat},${hospital.coordinates.lng}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#164A41] text-white font-sans selection:bg-[#F1B24A] selection:text-[#164A41]">
      {/* 3-Zone Top Bar Navigation */}
      <Navbar
        currentPage={currentPage}
        onNavigate={handleNavigate}
        onEmergencyTrigger={() => handleCallAmbulance()}
        currentUser={currentUser}
        onOpenAuthModal={() => setAuthModalOpen(true)}
        onLogout={handleLogout}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-10">
        <AnimatePresence mode="wait">
          {/* ============================================================== */}
          {/* PAGE 1: EMERGENCY HOSPITAL FINDER (FOREST & AMBER THEME) */}
          {/* ============================================================== */}
          {currentPage === 'finder' && (
            <motion.div
              key="finder-page"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -14 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-8"
            >
              {/* Signature Hero Banner Inspired by the Reference Palette & Layout */}
              <div
                ref={heroRef}
                className="relative bg-linear-to-br from-[#164A41] via-[#1c5248] to-[#123831] rounded-3xl border border-[#4D774E] p-8 sm:p-12 shadow-2xl overflow-hidden"
              >
                {/* Visual Architectural Backdrop with Gradient Arch Overlay */}
                <div className="absolute right-0 top-0 bottom-0 w-full sm:w-1/2 flex items-center justify-end pointer-events-none opacity-40 sm:opacity-90">
                  {/* Elegant rounded arch matching the screenshot */}
                  <div className="relative w-80 h-96 sm:w-96 sm:h-full rounded-t-full bg-linear-to-b from-[#9DC88D]/40 via-[#4D774E]/30 to-transparent p-1.5 flex items-center justify-center">
                    <div className="w-full h-full rounded-t-full bg-[#123831]/80 backdrop-blur-xs flex items-center justify-center overflow-hidden border border-[#9DC88D]/30">
                      <MedicalVisualAsset type="hero_hospital" className="w-full h-full opacity-60 scale-110" />
                    </div>
                  </div>
                </div>

                <div className="relative z-10 space-y-6 max-w-2xl">
                  <div className="space-y-2">
                    <span className="text-xs font-mono font-bold text-[#9DC88D] uppercase tracking-widest block">
                      HOSPITAL AVAILABILITY & TELEMETRY
                    </span>

                    {/* Massive Bold Headline matching "CACTUS" typography from image */}
                    <h1 className="text-4xl sm:text-7xl font-display font-extrabold tracking-tight text-white uppercase leading-none drop-shadow-sm">
                      EMERGENCY
                    </h1>
                  </div>

                  <p className="text-sm sm:text-base text-[#9DC88D] leading-relaxed font-light max-w-lg">
                    Real-time discovery of vacant intensive care beds, operational life support ventilators, and AI waiting-time forecasts calibrated from your device GPS.
                  </p>

                  {/* Elegant Pill CTA Button matching "Shop Now ->" from screenshot */}
                  <div className="flex flex-wrap items-center gap-4 pt-2">
                    <button
                      onClick={() => {
                        const el = document.getElementById('hospital-map-section');
                        el?.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="group inline-flex items-center gap-3 px-5 py-2.5 rounded-full border border-[#9DC88D] bg-[#123831]/80 hover:bg-[#123831] text-white text-xs font-bold transition-all shadow-md active:scale-95"
                    >
                      <span>Explore Nearby Hospitals</span>
                      <div className="w-6 h-6 rounded-full bg-[#F1B24A] text-[#164A41] flex items-center justify-center group-hover:translate-x-0.5 transition-transform">
                        <ArrowRight className="w-3.5 h-3.5" />
                      </div>
                    </button>

                    <div className="flex items-center gap-2 text-xs text-[#d8ebd1] font-mono bg-[#123831]/70 border border-[#4D774E] px-3.5 py-2 rounded-full">
                      <MapPin className="w-3.5 h-3.5 text-[#F1B24A]" />
                      <span>{currentLocation.label}</span>
                    </div>
                  </div>
                </div>

                {/* Bottom Sub-Bar matching the dual-tone footer in the reference screenshot */}
                <div className="mt-10 pt-6 border-t border-[#4D774E]/60 grid grid-cols-1 sm:grid-cols-3 gap-3 relative z-10">
                  {/* Left Amber Card Highlight */}
                  <div className="p-4 rounded-2xl bg-[#F1B24A] text-[#164A41] flex items-center justify-between shadow-md">
                    <div>
                      <span className="text-[10px] uppercase font-mono font-bold tracking-wider block">
                        Vacant ICU Beds
                      </span>
                      <span className="text-2xl font-display font-extrabold tabular-nums">
                        {totalAvailableIcu} Ready
                      </span>
                    </div>
                    <Activity className="w-7 h-7 opacity-80" />
                  </div>

                  <div className="p-4 rounded-2xl bg-[#1c5248] border border-[#4D774E] text-white flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-mono font-bold text-[#9DC88D] tracking-wider block">
                        Active Ventilators
                      </span>
                      <span className="text-2xl font-display font-bold tabular-nums text-white">
                        {totalAvailableVentilators} Active
                      </span>
                    </div>
                    <span className="text-xs text-[#9DC88D] font-mono">100% Verified</span>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#1c5248] border border-[#4D774E] text-white flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-mono font-bold text-[#9DC88D] tracking-wider block">
                        Nearby Facilities
                      </span>
                      <span className="text-2xl font-display font-bold tabular-nums text-white">
                        {hospitals.length} Online
                      </span>
                    </div>
                    <span className="text-xs text-[#F1B24A] font-mono">Live Radar</span>
                  </div>
                </div>
              </div>

              {/* Dynamic Search, Radius & Live Geolocation Filter */}
              <HospitalFilter
                filters={filters}
                onChange={setFilters}
                onReset={() =>
                  setFilters({
                    searchQuery: '',
                    radiusKm: 30,
                    requireIcu: false,
                    requireVentilator: false,
                    requireEmergencyOpen: false,
                    requireBlood: false,
                    selectedBloodGroup: 'O+',
                    sortBy: 'distance',
                    selectedCityId: 'delhi-ncr',
                  })
                }
                totalHospitals={hospitals.length}
                matchingCount={filteredHospitals.length}
                currentLocation={currentLocation}
                onLocationUpdate={handleLocationUpdate}
              />

              {/* Dedicated Live Mapbox GL Map with Nearby Hospitals & On-Tap Real-Time Availability */}
              <div id="hospital-map-section">
                <MapboxHospitalMap
                  hospitals={filteredHospitals}
                  userCoords={currentLocation}
                  radiusKm={filters.radiusKm}
                  selectedHospital={selectedHospitalForPredictor}
                  onSelectHospital={(hosp) => setSelectedHospitalForPredictor(hosp)}
                  onCallHospital={handleCallHospital}
                  onCallAmbulance={handleCallAmbulance}
                />
              </div>

              {/* Section Header */}
              <div className="flex items-center justify-between pt-2 border-b border-[#4D774E]/40 pb-3">
                <div className="flex items-baseline gap-3">
                  <h3 className="font-display font-bold text-xl sm:text-2xl text-white tracking-tight">
                    Verified Facilities Nearby
                  </h3>
                  <span className="text-xs text-[#9DC88D] font-mono tabular-nums">
                    ({filteredHospitals.length} within {filters.radiusKm}km)
                  </span>
                </div>

                <div className="flex items-center gap-1 p-1 bg-[#123831] rounded-xl border border-[#4D774E] text-xs font-semibold">
                  <button
                    onClick={() => setFinderDisplayMode('map-first')}
                    className={`px-3 py-1.5 rounded-lg transition-all ${
                      finderDisplayMode === 'map-first' ? 'bg-[#F1B24A] text-[#164A41] font-bold' : 'text-[#9DC88D] hover:text-white'
                    }`}
                  >
                    Map Mode
                  </button>
                  <button
                    onClick={() => setFinderDisplayMode('grid-first')}
                    className={`px-3 py-1.5 rounded-lg transition-all ${
                      finderDisplayMode === 'grid-first' ? 'bg-[#F1B24A] text-[#164A41] font-bold' : 'text-[#9DC88D] hover:text-white'
                    }`}
                  >
                    Grid View
                  </button>
                </div>
              </div>

              {/* Hospital Cards Grid with Scroll Reveal Animations */}
              {filteredHospitals.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {filteredHospitals.map((hospital) => (
                    <HospitalCard
                      key={hospital.id}
                      hospital={hospital}
                      onCallHospital={handleCallHospital}
                      onCallAmbulance={handleCallAmbulance}
                      onViewPredictor={handleViewPredictor}
                      onViewDirections={handleViewDirections}
                    />
                  ))}
                </div>
              ) : (
                <div className="bg-[#1c5248] rounded-3xl border border-[#4D774E] p-12 text-center space-y-4 shadow-xl">
                  <AlertCircle className="w-12 h-12 text-[#F1B24A] mx-auto" />
                  <h3 className="font-display text-xl font-bold text-white">
                    No clinical facilities found within {filters.radiusKm} km of {currentLocation.label}
                  </h3>
                  <p className="text-xs text-[#9DC88D] max-w-md mx-auto">
                    Try expanding your search radius to 60 km or selecting a different city hub from the selector above.
                  </p>
                  <button
                    onClick={() =>
                      setFilters({
                        ...filters,
                        radiusKm: 60,
                      })
                    }
                    className="px-5 py-2.5 text-xs font-bold text-[#164A41] bg-[#F1B24A] rounded-xl hover:bg-[#e09f36] transition-colors"
                  >
                    Expand Radius to 60 km
                  </button>
                </div>
              )}
            </motion.div>
          )}

          {/* ============================================================== */}
          {/* PAGE 2: AI WAITING-TIME PREDICTOR & CROWD FORECASTER */}
          {/* ============================================================== */}
          {currentPage === 'predictor' && (
            <motion.div
              key="predictor-page"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -14 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            >
              <PredictorCalculator
                hospitals={hospitals}
                selectedHospital={selectedHospitalForPredictor}
                onSelectHospital={setSelectedHospitalForPredictor}
              />
            </motion.div>
          )}

          {/* ============================================================== */}
          {/* PAGE 3: HOSPITAL DIRECTOR & STAFF INGESTION PORTAL */}
          {/* ============================================================== */}
          {currentPage === 'dashboard' && (
            <motion.div
              key="dashboard-page"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -14 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            >
              <HospitalDirectorConsole
                hospitals={hospitals}
                onDataUpdated={refreshHospitalData}
                currentUser={currentUser}
                onOpenAuthModal={() => setAuthModalOpen(true)}
                onNavigateToAuth={(role) => {
                  setAuthTargetRole(role || 'HOSPITAL_ADMIN');
                  handleNavigate('auth');
                }}
                onQuickSwitchToAdmin={() => {
                  const adminUser = AuthService.switchDemoProfile('HOSPITAL_ADMIN');
                  setCurrentUser(adminUser);
                  refreshHospitalData();
                }}
              />
            </motion.div>
          )}

          {/* ============================================================== */}
          {/* PAGE 4: CLINICAL TRIAGE & HEALTH INSTRUCTOR GUIDE */}
          {/* ============================================================== */}
          {currentPage === 'guidance' && (
            <motion.div
              key="guidance-page"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -14 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            >
              <TriageGuide
                onSearchEmergencyHospitals={() => {
                  setFilters({
                    ...filters,
                    requireEmergencyOpen: true,
                    requireIcu: true,
                  });
                  handleNavigate('finder');
                }}
                onCallAmbulance={() => handleCallAmbulance()}
              />
            </motion.div>
          )}

          {/* ============================================================== */}
          {/* PAGE 5: SYSTEM ARCHITECTURE & SECURITY ENGINE */}
          {/* ============================================================== */}
          {currentPage === 'about' && (
            <motion.div
              key="about-page"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -14 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            >
              <SystemArchitecture />
            </motion.div>
          )}

          {/* ============================================================== */}
          {/* PAGE 6: AUTHENTICATION (HOSPITAL ADMINISTRATOR & NORMAL USER) */}
          {/* ============================================================== */}
          {currentPage === 'auth' && (
            <motion.div
              key="auth-page"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -14 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            >
              <AuthPage
                initialRole={authTargetRole}
                hospitals={hospitals}
                onAuthSuccess={(user, redirectTo) => {
                  setCurrentUser(user);
                  if (redirectTo) {
                    handleNavigate(redirectTo as PageId);
                  } else if (user.role === 'HOSPITAL_ADMIN') {
                    handleNavigate('dashboard');
                  } else {
                    handleNavigate('finder');
                  }
                }}
                onNavigateHome={() => handleNavigate('finder')}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Login & Sign Up Authentication Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onAuthSuccess={(user) => {
          setCurrentUser(user);
          if (user.role === 'HOSPITAL_ADMIN') {
            handleNavigate('dashboard');
          }
        }}
        hospitals={hospitals}
        initialRole={currentPage === 'dashboard' ? 'HOSPITAL_ADMIN' : 'PATIENT'}
      />

      {/* Emergency Hotline Calling Modal */}
      <EmergencyModal
        isOpen={emergencyModalOpen}
        onClose={() => setEmergencyModalOpen(false)}
        hospital={emergencyTargetHospital}
        userCoords={currentLocation}
      />

      {/* Live Toast Alerts */}
      <ToastContainer />

      {/* Footer */}
      <Footer onNavigate={handleNavigate} />
    </div>
  );
}
