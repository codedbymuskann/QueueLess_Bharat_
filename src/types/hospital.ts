export type BloodGroup = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';

export type TriageUrgency = 'immediate' | 'emergent' | 'urgent' | 'less_urgent' | 'non_urgent';

export interface ResourceInventory {
  icuBedsTotal: number;
  icuBedsAvailable: number;
  ventilatorsTotal: number;
  ventilatorsAvailable: number;
  generalBedsTotal: number;
  generalBedsAvailable: number;
  oxygenCylindersAvailable: number; // in units/cylinders
  bloodUnits: Record<BloodGroup, number>;
  pediatricBedsAvailable: number;
  traumaOperatingRoomsAvailable: number;
  lastUpdatedIso: string;
  verifiedByStaffId: string;
  verifiedByStaffRole: string;
}

export interface Hospital {
  id: string;
  name: string;
  category: 'Government Super-Speciality' | 'Private Multi-Speciality' | 'Autonomous Medical College' | 'District Hospital';
  address: string;
  city: string;
  district: string;
  pincode: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  distanceKm: number; // dynamic or calculated from user origin
  phoneEmergency: string;
  phoneAmbulance: string;
  phoneReception: string;
  specialities: string[];
  activeDoctorsCount: number;
  currentQueueCount: number; // people waiting in triage/OPD
  emergencyDepartmentStatus: 'OPEN_NORMAL' | 'OPEN_HIGH_LOAD' | 'CRITICAL_DIVERT_ONLY';
  rating: number; // e.g. 4.6
  ratingCount: number;
  nabhAccredited: boolean;
  ayushmanBharatEmpaneled: boolean;
  inventory: ResourceInventory;
  hourlyWaitHistory: number[]; // 24-hr average wait times in minutes (0 to 23 hours)
}

export interface WaitTimePredictionResult {
  predictedWaitMinutes: number;
  rangeMinMinutes: number;
  rangeMaxMinutes: number;
  confidenceScore: number; // 0 - 100%
  crowdLevel: 'Low' | 'Moderate' | 'High' | 'Critical';
  factors: {
    queueImpactMinutes: number;
    doctorRatioImpactMinutes: number;
    timeOfDayImpactMinutes: number;
    emergencySurgeImpactMinutes: number;
  };
  recommendation: string;
  optimalArrivalSlot: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  hospitalId: string;
  hospitalName: string;
  staffId: string;
  staffName: string;
  role: string;
  action: 'UPDATE_BEDS' | 'UPDATE_VENTILATORS' | 'UPDATE_BLOOD' | 'UPDATE_QUEUE' | 'EMERGENCY_BROADCAST';
  details: string;
  hashSignature: string;
}
