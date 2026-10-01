/**
 * QueueLess Bharat — Hospital Data Repository & Real-Time Sync Service
 * Implements persistent state, dynamic geo-spatial distance calculation, and staff audit logging.
 */

import { Hospital, AuditLogEntry, BloodGroup } from '../types/hospital';
import { SecurityService } from '../domain/securityService';
import { LocationService } from './locationService';

const STORAGE_KEY_HOSPITALS = 'queueless_bharat_hospitals_v2';
const STORAGE_KEY_AUDIT_LOGS = 'queueless_bharat_audit_logs_v2';

// Baseline national dataset across major hubs
const INITIAL_HOSPITALS: Hospital[] = [
  // Delhi-NCR Hub
  {
    id: 'hosp-aiims-delhi',
    name: 'All India Institute of Medical Sciences (AIIMS)',
    category: 'Government Super-Speciality',
    address: 'Sri Aurobindo Marg, Ansari Nagar East, New Delhi',
    city: 'New Delhi',
    district: 'South Delhi',
    pincode: '110029',
    coordinates: { lat: 28.5672, lng: 77.2100 },
    distanceKm: 0,
    phoneEmergency: '+91 11 26588500',
    phoneAmbulance: '108',
    phoneReception: '+91 11 26588700',
    specialities: ['Jai Prakash Narayan Apex Trauma Center', 'Cardiothoracic Emergency', 'Pediatric ICU', 'Comprehensive Blood Bank'],
    activeDoctorsCount: 38,
    currentQueueCount: 48,
    emergencyDepartmentStatus: 'OPEN_NORMAL',
    rating: 4.8,
    ratingCount: 8900,
    nabhAccredited: true,
    ayushmanBharatEmpaneled: true,
    inventory: {
      icuBedsTotal: 120,
      icuBedsAvailable: 16,
      ventilatorsTotal: 90,
      ventilatorsAvailable: 19,
      generalBedsTotal: 2200,
      generalBedsAvailable: 140,
      oxygenCylindersAvailable: 500,
      bloodUnits: {
        'A+': 85, 'A-': 22,
        'B+': 110, 'B-': 30,
        'AB+': 45, 'AB-': 12,
        'O+': 140, 'O-': 35
      },
      pediatricBedsAvailable: 45,
      traumaOperatingRoomsAvailable: 6,
      lastUpdatedIso: new Date(Date.now() - 4 * 60 * 1000).toISOString(),
      verifiedByStaffId: 'STF-AIIMS-001',
      verifiedByStaffRole: 'Apex Trauma Chief'
    },
    hourlyWaitHistory: [18, 14, 12, 10, 12, 18, 28, 42, 58, 65, 52, 40, 32, 28, 36, 48, 55, 60, 48, 38, 30, 24, 20, 18]
  },
  {
    id: 'hosp-safdarjung-delhi',
    name: 'Vardhman Mahavir Medical College & Safdarjung Hospital',
    category: 'Government Super-Speciality',
    address: 'Ring Road, Opposite AIIMS, New Delhi',
    city: 'New Delhi',
    district: 'South Delhi',
    pincode: '110029',
    coordinates: { lat: 28.5702, lng: 77.2064 },
    distanceKm: 0,
    phoneEmergency: '+91 11 26165060',
    phoneAmbulance: '108',
    phoneReception: '+91 11 26165032',
    specialities: ['Emergency Resuscitation Center', 'Burns Unit & ICU', 'Orthopedic Trauma', 'Obstetrics Emergency'],
    activeDoctorsCount: 29,
    currentQueueCount: 36,
    emergencyDepartmentStatus: 'OPEN_NORMAL',
    rating: 4.5,
    ratingCount: 4210,
    nabhAccredited: true,
    ayushmanBharatEmpaneled: true,
    inventory: {
      icuBedsTotal: 80,
      icuBedsAvailable: 11,
      ventilatorsTotal: 45,
      ventilatorsAvailable: 8,
      generalBedsTotal: 1530,
      generalBedsAvailable: 95,
      oxygenCylindersAvailable: 320,
      bloodUnits: {
        'A+': 42, 'A-': 9,
        'B+': 55, 'B-': 14,
        'AB+': 20, 'AB-': 6,
        'O+': 70, 'O-': 15
      },
      pediatricBedsAvailable: 28,
      traumaOperatingRoomsAvailable: 4,
      lastUpdatedIso: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
      verifiedByStaffId: 'STF-SJF-209',
      verifiedByStaffRole: 'Senior Triage Officer'
    },
    hourlyWaitHistory: [14, 11, 9, 8, 10, 15, 24, 35, 48, 54, 44, 32, 26, 22, 28, 38, 45, 50, 40, 31, 24, 19, 16, 14]
  },
  {
    id: 'hosp-jaypee-noida',
    name: 'Jaypee Hospital',
    category: 'Private Multi-Speciality',
    address: 'Wish Town, Sector 128, Noida-Greater Noida Expressway',
    city: 'Noida',
    district: 'Gautam Buddha Nagar',
    pincode: '201304',
    coordinates: { lat: 28.5173, lng: 77.3776 },
    distanceKm: 0,
    phoneEmergency: '+91 120 4122222',
    phoneAmbulance: '+91 120 4122223',
    phoneReception: '+91 120 4122200',
    specialities: ['Organ Transplant ICU', 'Interventional Cath Lab', 'Comprehensive Cancer Care', 'Pediatric ICU'],
    activeDoctorsCount: 22,
    currentQueueCount: 20,
    emergencyDepartmentStatus: 'OPEN_NORMAL',
    rating: 4.8,
    ratingCount: 3410,
    nabhAccredited: true,
    ayushmanBharatEmpaneled: true,
    inventory: {
      icuBedsTotal: 75,
      icuBedsAvailable: 14,
      ventilatorsTotal: 40,
      ventilatorsAvailable: 9,
      generalBedsTotal: 504,
      generalBedsAvailable: 78,
      oxygenCylindersAvailable: 230,
      bloodUnits: {
        'A+': 36, 'A-': 9,
        'B+': 42, 'B-': 11,
        'AB+': 19, 'AB-': 5,
        'O+': 55, 'O-': 12
      },
      pediatricBedsAvailable: 20,
      traumaOperatingRoomsAvailable: 4,
      lastUpdatedIso: new Date(Date.now() - 3 * 60 * 1000).toISOString(),
      verifiedByStaffId: 'STF-JAY-901',
      verifiedByStaffRole: 'Chief Medical Registrar'
    },
    hourlyWaitHistory: [11, 9, 7, 7, 9, 13, 18, 25, 36, 42, 35, 27, 20, 18, 22, 28, 34, 38, 31, 24, 20, 15, 13, 11]
  },
  {
    id: 'hosp-fortis-noida',
    name: 'Fortis Hospital, Sector 62',
    category: 'Private Multi-Speciality',
    address: 'B-22, Sector 62, Noida',
    city: 'Noida',
    district: 'Gautam Buddha Nagar',
    pincode: '201301',
    coordinates: { lat: 28.6186, lng: 77.3621 },
    distanceKm: 0,
    phoneEmergency: '+91 120 4300222',
    phoneAmbulance: '+91 120 4300333',
    phoneReception: '+91 120 4300000',
    specialities: ['Emergency & Trauma Care', 'Interventional Pulmonology', 'Neurosciences', 'Renal Transplant'],
    activeDoctorsCount: 16,
    currentQueueCount: 18,
    emergencyDepartmentStatus: 'OPEN_NORMAL',
    rating: 4.6,
    ratingCount: 2780,
    nabhAccredited: true,
    ayushmanBharatEmpaneled: true,
    inventory: {
      icuBedsTotal: 45,
      icuBedsAvailable: 7,
      ventilatorsTotal: 25,
      ventilatorsAvailable: 5,
      generalBedsTotal: 290,
      generalBedsAvailable: 34,
      oxygenCylindersAvailable: 160,
      bloodUnits: {
        'A+': 22, 'A-': 5,
        'B+': 30, 'B-': 7,
        'AB+': 14, 'AB-': 3,
        'O+': 38, 'O-': 6
      },
      pediatricBedsAvailable: 10,
      traumaOperatingRoomsAvailable: 2,
      lastUpdatedIso: new Date(Date.now() - 9 * 60 * 1000).toISOString(),
      verifiedByStaffId: 'STF-FOR-512',
      verifiedByStaffRole: 'Triage In-charge'
    },
    hourlyWaitHistory: [8, 6, 5, 5, 7, 11, 16, 23, 33, 37, 30, 22, 17, 15, 19, 26, 31, 34, 28, 21, 17, 13, 11, 8]
  },
  {
    id: 'hosp-gims-gnoida',
    name: 'Government Institute of Medical Sciences (GIMS)',
    category: 'Government Super-Speciality',
    address: 'Kasna, Greater Noida, Gautam Buddha Nagar',
    city: 'Greater Noida',
    district: 'Gautam Buddha Nagar',
    pincode: '201310',
    coordinates: { lat: 28.4552, lng: 77.5385 },
    distanceKm: 0,
    phoneEmergency: '+91 120 2341738',
    phoneAmbulance: '108',
    phoneReception: '+91 120 2341700',
    specialities: ['Trauma Center Level-1', 'Critical Care ICU', 'Cardiology', 'Pediatrics', 'Neurology'],
    activeDoctorsCount: 15,
    currentQueueCount: 16,
    emergencyDepartmentStatus: 'OPEN_NORMAL',
    rating: 4.5,
    ratingCount: 1240,
    nabhAccredited: true,
    ayushmanBharatEmpaneled: true,
    inventory: {
      icuBedsTotal: 35,
      icuBedsAvailable: 9,
      ventilatorsTotal: 22,
      ventilatorsAvailable: 6,
      generalBedsTotal: 300,
      generalBedsAvailable: 48,
      oxygenCylindersAvailable: 110,
      bloodUnits: {
        'A+': 18, 'A-': 4,
        'B+': 24, 'B-': 6,
        'AB+': 11, 'AB-': 2,
        'O+': 32, 'O-': 5
      },
      pediatricBedsAvailable: 12,
      traumaOperatingRoomsAvailable: 2,
      lastUpdatedIso: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      verifiedByStaffId: 'STF-GIMS-104',
      verifiedByStaffRole: 'Senior Triage Officer'
    },
    hourlyWaitHistory: [8, 6, 5, 5, 6, 8, 12, 18, 26, 32, 28, 22, 16, 14, 18, 24, 28, 30, 25, 20, 16, 12, 10, 8]
  },
  {
    id: 'hosp-yatharth-gnoida',
    name: 'Yatharth Super Speciality Hospital',
    category: 'Private Multi-Speciality',
    address: 'Plot No. 1, Sector Omega-1, Builders Area, Greater Noida',
    city: 'Greater Noida',
    district: 'Gautam Buddha Nagar',
    pincode: '201308',
    coordinates: { lat: 28.4725, lng: 77.5142 },
    distanceKm: 0,
    phoneEmergency: '+91 120 2399999',
    phoneAmbulance: '+91 8800778899',
    phoneReception: '+91 120 2399900',
    specialities: ['Cardiac Emergency 24x7', 'Interventional Cath Lab', 'Neuro-Trauma', 'Oncology'],
    activeDoctorsCount: 12,
    currentQueueCount: 12,
    emergencyDepartmentStatus: 'OPEN_NORMAL',
    rating: 4.7,
    ratingCount: 1950,
    nabhAccredited: true,
    ayushmanBharatEmpaneled: true,
    inventory: {
      icuBedsTotal: 40,
      icuBedsAvailable: 7,
      ventilatorsTotal: 18,
      ventilatorsAvailable: 5,
      generalBedsTotal: 250,
      generalBedsAvailable: 41,
      oxygenCylindersAvailable: 140,
      bloodUnits: {
        'A+': 14, 'A-': 3,
        'B+': 20, 'B-': 5,
        'AB+': 8, 'AB-': 2,
        'O+': 26, 'O-': 4
      },
      pediatricBedsAvailable: 8,
      traumaOperatingRoomsAvailable: 2,
      lastUpdatedIso: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
      verifiedByStaffId: 'STF-YAT-802',
      verifiedByStaffRole: 'Hospital Director Desk'
    },
    hourlyWaitHistory: [7, 5, 4, 4, 6, 9, 14, 19, 25, 29, 24, 19, 14, 12, 15, 21, 26, 28, 22, 17, 13, 10, 8, 7]
  },
  // Mumbai Hub
  {
    id: 'hosp-kem-mumbai',
    name: 'King Edward Memorial Hospital & Seth GS Medical College',
    category: 'Government Super-Speciality',
    address: 'Acharya Donde Marg, Parel, Mumbai',
    city: 'Mumbai',
    district: 'Mumbai City',
    pincode: '400012',
    coordinates: { lat: 19.0028, lng: 72.8427 },
    distanceKm: 0,
    phoneEmergency: '+91 22 24107000',
    phoneAmbulance: '108',
    phoneReception: '+91 22 24136051',
    specialities: ['Emergency Resuscitation Unit', 'Neurosurgical Trauma', 'Cardiovascular Surgery', 'Hemato-Oncology Blood Center'],
    activeDoctorsCount: 32,
    currentQueueCount: 42,
    emergencyDepartmentStatus: 'OPEN_NORMAL',
    rating: 4.6,
    ratingCount: 6100,
    nabhAccredited: true,
    ayushmanBharatEmpaneled: true,
    inventory: {
      icuBedsTotal: 95,
      icuBedsAvailable: 12,
      ventilatorsTotal: 50,
      ventilatorsAvailable: 8,
      generalBedsTotal: 1800,
      generalBedsAvailable: 110,
      oxygenCylindersAvailable: 380,
      bloodUnits: {
        'A+': 60, 'A-': 14,
        'B+': 72, 'B-': 18,
        'AB+': 28, 'AB-': 7,
        'O+': 95, 'O-': 22
      },
      pediatricBedsAvailable: 34,
      traumaOperatingRoomsAvailable: 5,
      lastUpdatedIso: new Date(Date.now() - 6 * 60 * 1000).toISOString(),
      verifiedByStaffId: 'STF-KEM-102',
      verifiedByStaffRole: 'Emergency Medicine Head'
    },
    hourlyWaitHistory: [16, 12, 10, 8, 11, 16, 26, 38, 52, 60, 48, 36, 28, 24, 32, 42, 50, 55, 44, 34, 26, 20, 18, 16]
  },
  {
    id: 'hosp-lilavati-mumbai',
    name: 'Lilavati Hospital & Research Centre',
    category: 'Private Multi-Speciality',
    address: 'A-791, Bandra Reclamation, Bandra West, Mumbai',
    city: 'Mumbai',
    district: 'Mumbai Suburban',
    pincode: '400050',
    coordinates: { lat: 19.0514, lng: 72.8295 },
    distanceKm: 0,
    phoneEmergency: '+91 22 26751000',
    phoneAmbulance: '+91 22 26751555',
    phoneReception: '+91 22 26751000',
    specialities: ['Advanced Critical Care Unit', 'Cardiac Interventions', 'Emergency Stroke Suite', 'Renal Transplant'],
    activeDoctorsCount: 20,
    currentQueueCount: 15,
    emergencyDepartmentStatus: 'OPEN_NORMAL',
    rating: 4.7,
    ratingCount: 3950,
    nabhAccredited: true,
    ayushmanBharatEmpaneled: true,
    inventory: {
      icuBedsTotal: 60,
      icuBedsAvailable: 9,
      ventilatorsTotal: 32,
      ventilatorsAvailable: 6,
      generalBedsTotal: 320,
      generalBedsAvailable: 45,
      oxygenCylindersAvailable: 190,
      bloodUnits: {
        'A+': 30, 'A-': 7,
        'B+': 38, 'B-': 9,
        'AB+': 16, 'AB-': 4,
        'O+': 48, 'O-': 10
      },
      pediatricBedsAvailable: 14,
      traumaOperatingRoomsAvailable: 3,
      lastUpdatedIso: new Date(Date.now() - 4 * 60 * 1000).toISOString(),
      verifiedByStaffId: 'STF-LIL-404',
      verifiedByStaffRole: 'Triage Supervisor'
    },
    hourlyWaitHistory: [9, 7, 5, 5, 8, 12, 17, 24, 32, 38, 30, 22, 18, 15, 20, 26, 32, 35, 28, 22, 17, 13, 11, 9]
  },
  // Bengaluru Hub
  {
    id: 'hosp-manipal-bengaluru',
    name: 'Manipal Hospital, Old Airport Road',
    category: 'Private Multi-Speciality',
    address: '98, HAL Old Airport Rd, Kodihalli, Bengaluru',
    city: 'Bengaluru',
    district: 'Bengaluru Urban',
    pincode: '560017',
    coordinates: { lat: 12.9592, lng: 77.6444 },
    distanceKm: 0,
    phoneEmergency: '+91 80 25024444',
    phoneAmbulance: '+91 80 25023333',
    phoneReception: '+91 80 25024444',
    specialities: ['Emergency Medicine & Level-1 Trauma', 'Cardiac Catheterization Lab', 'Pediatric Intensive Care', 'Comprehensive Stroke Center'],
    activeDoctorsCount: 24,
    currentQueueCount: 19,
    emergencyDepartmentStatus: 'OPEN_NORMAL',
    rating: 4.7,
    ratingCount: 5200,
    nabhAccredited: true,
    ayushmanBharatEmpaneled: true,
    inventory: {
      icuBedsTotal: 70,
      icuBedsAvailable: 11,
      ventilatorsTotal: 38,
      ventilatorsAvailable: 7,
      generalBedsTotal: 600,
      generalBedsAvailable: 82,
      oxygenCylindersAvailable: 260,
      bloodUnits: {
        'A+': 38, 'A-': 8,
        'B+': 46, 'B-': 12,
        'AB+': 22, 'AB-': 5,
        'O+': 62, 'O-': 14
      },
      pediatricBedsAvailable: 22,
      traumaOperatingRoomsAvailable: 4,
      lastUpdatedIso: new Date(Date.now() - 7 * 60 * 1000).toISOString(),
      verifiedByStaffId: 'STF-MAN-88',
      verifiedByStaffRole: 'Emergency Medicine Registrar'
    },
    hourlyWaitHistory: [10, 8, 6, 6, 8, 12, 18, 25, 34, 40, 32, 24, 19, 16, 21, 28, 34, 37, 29, 23, 18, 14, 12, 10]
  }
];

export class HospitalService {
  /**
   * Retrieves all hospitals, initializing distances dynamically based on user lat/lng
   */
  public static getHospitals(userCoords?: { lat: number; lng: number }): Hospital[] {
    let list: Hospital[] = INITIAL_HOSPITALS;
    try {
      const stored = localStorage.getItem(STORAGE_KEY_HOSPITALS);
      if (stored) {
        list = JSON.parse(stored);
      }
    } catch {
      // LocalStorage fallback
    }

    if (userCoords) {
      return this.recalculateDistances(list, userCoords.lat, userCoords.lng);
    }

    // Default reference coordinates (Delhi NCR hub)
    return this.recalculateDistances(list, 28.5355, 77.3910);
  }

  /**
   * Recalculates geodesic distances for all hospital entries based on user live coordinates
   */
  public static recalculateDistances(hospitals: Hospital[], userLat: number, userLng: number): Hospital[] {
    return hospitals.map((h) => {
      const distanceKm = LocationService.calculateDistance(userLat, userLng, h.coordinates.lat, h.coordinates.lng);
      return {
        ...h,
        distanceKm,
      };
    });
  }

  /**
   * Retrieves hospital by ID
   */
  public static getHospitalById(id: string): Hospital | undefined {
    const list = this.getHospitals();
    return list.find(h => h.id === id);
  }

  /**
   * Updates hospital inventory and creates a signed audit entry
   */
  public static updateHospitalInventory(
    hospitalId: string,
    updatedInventory: Partial<Hospital['inventory']>,
    staffInfo: { id: string; name: string; role: string; pin: string },
    emergencyStatus?: Hospital['emergencyDepartmentStatus'],
    activeDoctorsCount?: number,
    currentQueueCount?: number
  ): { success: boolean; error?: string; auditEntry?: AuditLogEntry } {
    if (!SecurityService.verifyStaffPin(staffInfo.role, staffInfo.pin)) {
      return { success: false, error: 'Authorization Denied: Invalid Security Verification PIN for selected role.' };
    }

    const validation = SecurityService.validateNonClinicalPayload(updatedInventory as Record<string, unknown>);
    if (!validation.isValid) {
      return { success: false, error: validation.error };
    }

    const hospitals = this.getHospitals();
    const index = hospitals.findIndex(h => h.id === hospitalId);
    if (index === -1) {
      return { success: false, error: 'Hospital record not found.' };
    }

    const current = hospitals[index];
    const newInventory = {
      ...current.inventory,
      ...updatedInventory,
      lastUpdatedIso: new Date().toISOString(),
      verifiedByStaffId: staffInfo.id,
      verifiedByStaffRole: staffInfo.role
    };

    hospitals[index] = {
      ...current,
      inventory: newInventory,
      emergencyDepartmentStatus: emergencyStatus !== undefined ? emergencyStatus : current.emergencyDepartmentStatus,
      activeDoctorsCount: activeDoctorsCount !== undefined ? Math.max(1, activeDoctorsCount) : current.activeDoctorsCount,
      currentQueueCount: currentQueueCount !== undefined ? Math.max(0, currentQueueCount) : current.currentQueueCount
    };

    try {
      localStorage.setItem(STORAGE_KEY_HOSPITALS, JSON.stringify(hospitals));
    } catch {}

    const nowIso = new Date().toISOString();
    const actionDesc = `Updated: ICU Avail: ${newInventory.icuBedsAvailable}/${newInventory.icuBedsTotal}, Vent Avail: ${newInventory.ventilatorsAvailable}/${newInventory.ventilatorsTotal}, Gen Beds: ${newInventory.generalBedsAvailable}`;
    const hashSignature = SecurityService.generateAuditHash(staffInfo.id, hospitalId, 'UPDATE_BEDS', actionDesc, nowIso);

    const auditEntry: AuditLogEntry = {
      id: `LOG-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: nowIso,
      hospitalId,
      hospitalName: current.name,
      staffId: staffInfo.id,
      staffName: staffInfo.name,
      role: staffInfo.role,
      action: 'UPDATE_BEDS',
      details: actionDesc,
      hashSignature
    };

    this.saveAuditLog(auditEntry);

    return { success: true, auditEntry };
  }

  public static getAuditLogs(): AuditLogEntry[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_AUDIT_LOGS);
      if (stored) return JSON.parse(stored);
    } catch {}
    return [
      {
        id: 'LOG-INIT-001',
        timestamp: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
        hospitalId: 'hosp-aiims-delhi',
        hospitalName: 'All India Institute of Medical Sciences (AIIMS)',
        staffId: 'STF-AIIMS-001',
        staffName: 'Dr. R. K. Sharma',
        role: 'Senior Triage Officer',
        action: 'UPDATE_BEDS',
        details: 'Verified ICU count: 16 available, Ventilators: 19 operational',
        hashSignature: 'SEC-SIG-8A4F102B'
      },
      {
        id: 'LOG-INIT-002',
        timestamp: new Date(Date.now() - 50 * 60 * 1000).toISOString(),
        hospitalId: 'hosp-jaypee-noida',
        hospitalName: 'Jaypee Hospital',
        staffId: 'STF-JAY-901',
        staffName: 'Dr. Priya Mehra, MD',
        role: 'Chief Medical Registrar',
        action: 'UPDATE_QUEUE',
        details: 'Emergency triage queue calibrated to 20 active patients',
        hashSignature: 'SEC-SIG-3E77BC90'
      }
    ];
  }

  private static saveAuditLog(entry: AuditLogEntry): void {
    const logs = this.getAuditLogs();
    logs.unshift(entry);
    const capped = logs.slice(0, 50);
    try {
      localStorage.setItem(STORAGE_KEY_AUDIT_LOGS, JSON.stringify(capped));
    } catch {}
  }
}
