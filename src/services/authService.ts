import { UserProfile, UserRole } from '../types/user';

const STORAGE_KEY_AUTH = 'queueless_bharat_auth_v1';

// Seed demo profiles for quick 1-click testing
const DEMO_ADMIN: UserProfile = {
  id: 'usr-admin-01',
  name: 'Dr. Alok Verma, MD',
  email: 'director@aiims.gov.in',
  role: 'HOSPITAL_ADMIN',
  phone: '+91 98765 43210',
  assignedHospitalId: 'hosp-aiims-delhi',
  assignedHospitalName: 'All India Institute of Medical Sciences (AIIMS)',
  staffDesignation: 'Chief Medical Superintendent',
  savedHospitalIds: ['hosp-aiims-delhi'],
  createdAt: new Date().toISOString(),
};

const DEMO_PATIENT: UserProfile = {
  id: 'usr-patient-01',
  name: 'Rahul Sharma',
  email: 'rahul.sharma@example.com',
  role: 'PATIENT',
  phone: '+91 91234 56789',
  bloodGroup: 'B+',
  savedHospitalIds: ['hosp-aiims-delhi', 'hosp-jaypee-noida'],
  createdAt: new Date().toISOString(),
};

export class AuthService {
  public static getCurrentUser(): UserProfile | null {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_AUTH);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {}
    // Default to Patient session so the user has an active, authenticated identity
    return DEMO_PATIENT;
  }

  public static login(email: string, role: UserRole, hospitalId?: string, hospitalName?: string): UserProfile {
    let user: UserProfile;
    if (role === 'HOSPITAL_ADMIN') {
      user = {
        id: `usr-adm-${Date.now()}`,
        name: email.split('@')[0].replace('.', ' ').replace(/\b\w/g, (c) => c.toUpperCase()) || 'Dr. Administrator',
        email,
        role: 'HOSPITAL_ADMIN',
        assignedHospitalId: hospitalId || 'hosp-aiims-delhi',
        assignedHospitalName: hospitalName || 'All India Institute of Medical Sciences (AIIMS)',
        staffDesignation: 'Duty Medical Director',
        savedHospitalIds: [],
        createdAt: new Date().toISOString(),
      };
    } else {
      user = {
        id: `usr-pat-${Date.now()}`,
        name: email.split('@')[0].replace('.', ' ').replace(/\b\w/g, (c) => c.toUpperCase()) || 'Patient User',
        email,
        role: 'PATIENT',
        bloodGroup: 'O+',
        savedHospitalIds: [],
        createdAt: new Date().toISOString(),
      };
    }

    try {
      localStorage.setItem(STORAGE_KEY_AUTH, JSON.stringify(user));
    } catch {}

    return user;
  }

  public static signup(data: {
    name: string;
    email: string;
    role: UserRole;
    phone?: string;
    bloodGroup?: any;
    hospitalId?: string;
    hospitalName?: string;
    designation?: string;
  }): UserProfile {
    const user: UserProfile = {
      id: `usr-${data.role === 'HOSPITAL_ADMIN' ? 'adm' : 'pat'}-${Date.now()}`,
      name: data.name.trim() || (data.role === 'HOSPITAL_ADMIN' ? 'Medical Director' : 'Citizen User'),
      email: data.email.trim(),
      role: data.role,
      phone: data.phone || '+91 98000 00000',
      bloodGroup: data.bloodGroup || 'O+',
      assignedHospitalId: data.hospitalId,
      assignedHospitalName: data.hospitalName,
      staffDesignation: data.designation || (data.role === 'HOSPITAL_ADMIN' ? 'Hospital Superintendent' : undefined),
      savedHospitalIds: data.hospitalId ? [data.hospitalId] : [],
      createdAt: new Date().toISOString(),
    };

    try {
      localStorage.setItem(STORAGE_KEY_AUTH, JSON.stringify(user));
    } catch {}

    return user;
  }

  public static switchDemoProfile(role: UserRole): UserProfile {
    const user = role === 'HOSPITAL_ADMIN' ? DEMO_ADMIN : DEMO_PATIENT;
    try {
      localStorage.setItem(STORAGE_KEY_AUTH, JSON.stringify(user));
    } catch {}
    return user;
  }

  public static logout(): void {
    try {
      localStorage.removeItem(STORAGE_KEY_AUTH);
    } catch {}
  }

  public static toggleSavedHospital(hospitalId: string): UserProfile | null {
    const current = this.getCurrentUser();
    if (!current) return null;

    const exists = current.savedHospitalIds.includes(hospitalId);
    const updated = {
      ...current,
      savedHospitalIds: exists
        ? current.savedHospitalIds.filter((id) => id !== hospitalId)
        : [...current.savedHospitalIds, hospitalId],
    };

    try {
      localStorage.setItem(STORAGE_KEY_AUTH, JSON.stringify(updated));
    } catch {}

    return updated;
  }
}
