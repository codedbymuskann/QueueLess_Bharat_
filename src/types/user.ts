export type UserRole = 'PATIENT' | 'HOSPITAL_ADMIN';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  bloodGroup?: string;
  assignedHospitalId?: string; // For HOSPITAL_ADMIN: which hospital they administer
  assignedHospitalName?: string;
  staffDesignation?: string;
  savedHospitalIds: string[];
  createdAt: string;
}

export interface AuthState {
  user: UserProfile | null;
  isAuthenticated: boolean;
  token?: string;
}
