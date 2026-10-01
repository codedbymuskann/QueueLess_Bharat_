import React, { useState } from 'react';
import { Hospital, AuditLogEntry, BloodGroup } from '../../types/hospital';
import { UserProfile, UserRole } from '../../types/user';
import { HospitalService } from '../../services/hospitalService';
import { notificationService } from '../../services/notificationService';
import { ShieldCheck, Lock, Unlock, Save, AlertTriangle, Building2, Check, UserCheck, ShieldAlert, ArrowRight } from 'lucide-react';
import { AuditLogViewer } from './AuditLogViewer';
import { MedicalVisualAsset } from '../common/MedicalVisualAsset';

interface HospitalDirectorConsoleProps {
  hospitals: Hospital[];
  onDataUpdated: () => void;
  currentUser: UserProfile | null;
  onOpenAuthModal: () => void;
  onNavigateToAuth?: (role?: UserRole) => void;
  onQuickSwitchToAdmin?: () => void;
}

export const HospitalDirectorConsole: React.FC<HospitalDirectorConsoleProps> = ({
  hospitals,
  onDataUpdated,
  currentUser,
  onOpenAuthModal,
  onNavigateToAuth,
  onQuickSwitchToAdmin,
}) => {
  const isAdmin = currentUser?.role === 'HOSPITAL_ADMIN';

  const initialHospId = currentUser?.assignedHospitalId || hospitals[0]?.id || '';
  const [selectedHospitalId, setSelectedHospitalId] = useState<string>(initialHospId);

  const [staffRole, setStaffRole] = useState<'Hospital Director' | 'Triage Head' | 'Blood Bank Officer' | 'Emergency Desk Staff'>('Hospital Director');
  const [staffName, setStaffName] = useState<string>(currentUser?.name || 'Dr. Alok Verma, MD');
  const [staffPin, setStaffPin] = useState<string>('9944');
  const [authError, setAuthError] = useState<string>('');

  const currentHospital = hospitals.find((h) => h.id === selectedHospitalId) || hospitals[0];

  const [icuAvailable, setIcuAvailable] = useState<number>(currentHospital?.inventory.icuBedsAvailable || 0);
  const [icuTotal, setIcuTotal] = useState<number>(currentHospital?.inventory.icuBedsTotal || 0);
  const [ventAvailable, setVentAvailable] = useState<number>(currentHospital?.inventory.ventilatorsAvailable || 0);
  const [ventTotal, setVentTotal] = useState<number>(currentHospital?.inventory.ventilatorsTotal || 0);
  const [generalAvailable, setGeneralAvailable] = useState<number>(currentHospital?.inventory.generalBedsAvailable || 0);
  const [oxygenCylinders, setOxygenCylinders] = useState<number>(currentHospital?.inventory.oxygenCylindersAvailable || 0);
  const [activeDoctors, setActiveDoctors] = useState<number>(currentHospital?.activeDoctorsCount || 10);
  const [currentQueue, setCurrentQueue] = useState<number>(currentHospital?.currentQueueCount || 20);
  const [emergencyStatus, setEmergencyStatus] = useState<Hospital['emergencyDepartmentStatus']>(currentHospital?.emergencyDepartmentStatus || 'OPEN_NORMAL');
  const [bloodStocks, setBloodStocks] = useState<Record<BloodGroup, number>>({ ...currentHospital.inventory.bloodUnits });

  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(HospitalService.getAuditLogs());
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string>('');

  const handleSelectHospital = (id: string) => {
    setSelectedHospitalId(id);
    const target = hospitals.find((h) => h.id === id);
    if (target) {
      setIcuAvailable(target.inventory.icuBedsAvailable);
      setIcuTotal(target.inventory.icuBedsTotal);
      setVentAvailable(target.inventory.ventilatorsAvailable);
      setVentTotal(target.inventory.ventilatorsTotal);
      setGeneralAvailable(target.inventory.generalBedsAvailable);
      setOxygenCylinders(target.inventory.oxygenCylindersAvailable);
      setActiveDoctors(target.activeDoctorsCount);
      setCurrentQueue(target.currentQueueCount);
      setEmergencyStatus(target.emergencyDepartmentStatus);
      setBloodStocks({ ...target.inventory.bloodUnits });
    }
  };

  const handleCommitUpdate = () => {
    setAuthError('');
    setSaveSuccessMsg('');

    const staffInfo = {
      id: `STF-${staffRole.substring(0, 3).toUpperCase()}-77`,
      name: staffName,
      role: staffRole,
      pin: staffPin,
    };

    const res = HospitalService.updateHospitalInventory(
      selectedHospitalId,
      {
        icuBedsAvailable: icuAvailable,
        icuBedsTotal: icuTotal,
        ventilatorsAvailable: ventAvailable,
        ventilatorsTotal: ventTotal,
        generalBedsAvailable: generalAvailable,
        oxygenCylindersAvailable: oxygenCylinders,
        bloodUnits: bloodStocks,
      },
      staffInfo,
      emergencyStatus,
      activeDoctors,
      currentQueue
    );

    if (!res.success) {
      setAuthError(res.error || 'Failed to update hospital inventory.');
      return;
    }

    setSaveSuccessMsg(`Verified update committed securely at ${new Date().toLocaleTimeString()} (Signature: ${res.auditEntry?.hashSignature})`);
    setAuditLogs(HospitalService.getAuditLogs());
    onDataUpdated();

    notificationService.notify({
      type: 'success',
      title: 'Hospital Capacity Ingested',
      message: `${currentHospital.name} updated: ICU: ${icuAvailable}/${icuTotal}, Vents: ${ventAvailable}/${ventTotal}, Queue: ${currentQueue}`,
    });
  };

  const handleBloodStockChange = (bg: BloodGroup, delta: number) => {
    setBloodStocks((prev) => ({
      ...prev,
      [bg]: Math.max(0, (prev[bg] || 0) + delta),
    }));
  };

  // If user is a Normal Patient / Non-Admin, show clear RBAC Access Restriction Gate
  if (!isAdmin) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4 text-center space-y-6">
        <div className="w-16 h-16 rounded-3xl bg-[#F1B24A] text-[#164A41] flex items-center justify-center mx-auto shadow-xl">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-mono font-bold text-[#F1B24A] uppercase tracking-wider">
            Role-Based Access Control (RBAC) Gate
          </span>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Hospital Administrator Privileges Required
          </h2>
          <p className="text-sm text-[#9DC88D] leading-relaxed max-w-lg mx-auto font-light">
            You are currently signed in as a <strong className="text-white">Normal User ({currentUser?.name || 'Patient'})</strong>. Only designated Hospital Administrators, Chief Medical Officers, and Triage Staff are authorized to adjust live bed and ventilator counts.
          </p>
        </div>

        <div className="p-5 bg-[#1c5248] rounded-2xl border border-[#4D774E] text-left text-xs space-y-2.5 shadow-xl max-w-md mx-auto text-[#d8ebd1]">
          <div className="font-bold text-white uppercase font-mono tracking-wider">Administrator Capabilities:</div>
          <ul className="list-disc pl-4 space-y-1 text-[#9DC88D]">
            <li>Update real-time available & total ICU beds</li>
            <li>Manage ventilator operations & oxygen cylinder bulk reserves</li>
            <li>Broadcast emergency department load (Normal, Surge, or Divert)</li>
            <li>Inspect immutable cryptographic audit logs</li>
          </ul>
        </div>

        <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={() => {
              if (onNavigateToAuth) {
                onNavigateToAuth('HOSPITAL_ADMIN');
              } else {
                onOpenAuthModal();
              }
            }}
            className="px-6 py-3.5 rounded-xl bg-[#F1B24A] hover:bg-[#e09f36] text-[#164A41] font-bold text-xs inline-flex items-center gap-2 shadow-lg transition-all active:scale-95"
          >
            <Building2 className="w-4 h-4 text-[#164A41]" />
            <span>Sign In / Sign Up as Administrator</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          {onQuickSwitchToAdmin && (
            <button
              onClick={onQuickSwitchToAdmin}
              className="px-5 py-3.5 rounded-xl bg-[#123831] hover:bg-[#0e302a] border border-[#4D774E] text-[#9DC88D] hover:text-white font-semibold text-xs inline-flex items-center gap-2 transition-all active:scale-95"
            >
              <UserCheck className="w-4 h-4 text-[#F1B24A]" />
              <span>Instant 1-Click Demo Admin</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#1c5248] rounded-3xl border border-[#4D774E] p-8 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-[#F1B24A]" />
              <h2 className="font-display text-2xl font-bold text-white tracking-tight">
                Hospital Director & Triage Ingestion Console
              </h2>
            </div>
            <p className="text-xs text-[#9DC88D]">
              Role-authorized terminal for continuous bed inventory tracking, doctor shift counts, and triage status broadcasting.
            </p>
          </div>

          {/* Facility Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#9DC88D] font-mono">Facility:</span>
            <select
              value={selectedHospitalId}
              onChange={(e) => handleSelectHospital(e.target.value)}
              className="bg-[#123831] border border-[#4D774E] rounded-xl px-3.5 py-2 text-xs font-semibold text-white focus:outline-none focus:border-[#F1B24A]"
            >
              {hospitals.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.name} ({h.city})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Staff Authentication Card */}
      <div className="bg-[#123831] rounded-3xl border border-[#4D774E] p-6 text-white shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#4D774E]/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#164A41] border border-[#4D774E] flex items-center justify-center text-[#F1B24A]">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="text-sm font-bold text-white flex items-center gap-2">
                <span>Duty Verification & Cryptographic Authorization</span>
                <span className="text-[10px] text-[#164A41] bg-[#F1B24A] px-2 py-0.5 rounded-full font-bold">
                  Verified Session
                </span>
              </div>
              <div className="text-xs text-[#9DC88D]">
                All changes logged with tamper-proof signatures. Zero patient clinical diagnostics permitted.
              </div>
            </div>
          </div>

          <div className="text-xs text-[#9DC88D] font-mono">
            Admin PIN: <code className="text-[#F1B24A] font-bold">9944</code> / <code className="text-[#F1B24A] font-bold">admin2026</code>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-4">
          <div>
            <label className="block text-[11px] text-[#9DC88D] uppercase font-bold mb-1">
              Duty Officer Name:
            </label>
            <input
              type="text"
              value={staffName}
              onChange={(e) => setStaffName(e.target.value)}
              className="w-full bg-[#0e302a] border border-[#4D774E] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#F1B24A]"
            />
          </div>

          <div>
            <label className="block text-[11px] text-[#9DC88D] uppercase font-bold mb-1">
              Designated Clinical Role:
            </label>
            <select
              value={staffRole}
              onChange={(e) => setStaffRole(e.target.value as any)}
              className="w-full bg-[#0e302a] border border-[#4D774E] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#F1B24A]"
            >
              <option value="Hospital Director">Hospital Director</option>
              <option value="Triage Head">Triage Head</option>
              <option value="Blood Bank Officer">Blood Bank Officer</option>
              <option value="Emergency Desk Staff">Emergency Desk Staff</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] text-[#9DC88D] uppercase font-bold mb-1">
              Verification PIN:
            </label>
            <input
              type="password"
              value={staffPin}
              onChange={(e) => setStaffPin(e.target.value)}
              className="w-full bg-[#0e302a] border border-[#4D774E] rounded-xl px-3.5 py-2 text-xs text-white font-mono focus:outline-none focus:border-[#F1B24A]"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={handleCommitUpdate}
              className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-[#F1B24A] hover:bg-[#e09f36] active:scale-95 text-[#164A41] transition-all flex items-center justify-center gap-1.5 shadow-md"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Broadcast Update</span>
            </button>
          </div>
        </div>

        {authError && (
          <div className="mt-3 p-3 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-300 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-[#F1B24A]" />
            <span>{authError}</span>
          </div>
        )}

        {saveSuccessMsg && (
          <div className="mt-3 p-3 rounded-xl bg-[#1c5248] border border-[#9DC88D] text-[#d8ebd1] flex items-center gap-2">
            <Check className="w-4 h-4 shrink-0 text-[#F1B24A]" />
            <span>{saveSuccessMsg}</span>
          </div>
        )}
      </div>

      {/* Visual Facility Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-5 bg-[#1c5248] rounded-2xl border border-[#4D774E] flex items-center gap-4">
          <MedicalVisualAsset type="icu_ward" className="w-32 h-22 shrink-0 rounded-xl" />
          <div className="space-y-1 text-xs text-white">
            <div className="font-display font-bold text-base text-white">Critical Care Telemetry</div>
            <p className="text-[#9DC88D]">Live bedside ICU monitors and ventilators report availability directly to the public radar.</p>
          </div>
        </div>

        <div className="p-5 bg-[#1c5248] rounded-2xl border border-[#4D774E] flex items-center gap-4">
          <MedicalVisualAsset type="blood_bank" className="w-32 h-22 shrink-0 rounded-xl" />
          <div className="space-y-1 text-xs text-white">
            <div className="font-display font-bold text-base text-white">Cold-Chain Blood Reserves</div>
            <p className="text-[#9DC88D]">Accredited blood component storage tracking for immediate trauma surgical transfusions.</p>
          </div>
        </div>
      </div>

      {/* Live Resource Ingestion Editors */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Card 1: Critical Care Beds & Ventilators */}
        <div className="bg-[#1c5248] rounded-3xl border border-[#4D774E] p-6 shadow-xl space-y-4 text-white">
          <div className="flex items-center justify-between pb-2 border-b border-[#4D774E]/60">
            <h4 className="text-xs font-bold text-[#9DC88D] uppercase tracking-wider font-mono">
              ICU & Critical Ventilators
            </h4>
            <span className="text-[11px] text-[#F1B24A] font-mono">Live Counter</span>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-xs text-[#9DC88D]">
              <span>ICU Beds Available:</span>
              <span className="font-mono font-bold text-white tabular-nums">
                {icuAvailable} / {icuTotal}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIcuAvailable(Math.max(0, icuAvailable - 1))}
                className="w-9 h-9 rounded-xl bg-[#123831] border border-[#4D774E] flex items-center justify-center hover:bg-[#164A41] font-bold text-white"
              >
                -
              </button>
              <input
                type="number"
                value={icuAvailable}
                onChange={(e) => setIcuAvailable(Math.max(0, parseInt(e.target.value) || 0))}
                className="flex-1 py-2 text-center text-sm font-mono font-bold bg-[#123831] border border-[#4D774E] rounded-xl text-white"
              />
              <button
                onClick={() => setIcuAvailable(Math.min(icuTotal, icuAvailable + 1))}
                className="w-9 h-9 rounded-xl bg-[#123831] border border-[#4D774E] flex items-center justify-center hover:bg-[#164A41] font-bold text-white"
              >
                +
              </button>
            </div>
          </div>

          <div className="space-y-1 pt-2">
            <div className="flex justify-between text-xs text-[#9DC88D]">
              <span>Ventilators Operational:</span>
              <span className="font-mono font-bold text-white tabular-nums">
                {ventAvailable} / {ventTotal}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setVentAvailable(Math.max(0, ventAvailable - 1))}
                className="w-9 h-9 rounded-xl bg-[#123831] border border-[#4D774E] flex items-center justify-center hover:bg-[#164A41] font-bold text-white"
              >
                -
              </button>
              <input
                type="number"
                value={ventAvailable}
                onChange={(e) => setVentAvailable(Math.max(0, parseInt(e.target.value) || 0))}
                className="flex-1 py-2 text-center text-sm font-mono font-bold bg-[#123831] border border-[#4D774E] rounded-xl text-white"
              />
              <button
                onClick={() => setVentAvailable(Math.min(ventTotal, ventAvailable + 1))}
                className="w-9 h-9 rounded-xl bg-[#123831] border border-[#4D774E] flex items-center justify-center hover:bg-[#164A41] font-bold text-white"
              >
                +
              </button>
            </div>
          </div>

          <div className="space-y-1 pt-2">
            <div className="flex justify-between text-xs text-[#9DC88D]">
              <span>General Wards Available Beds:</span>
              <span className="font-mono font-bold text-white tabular-nums">
                {generalAvailable}
              </span>
            </div>
            <input
              type="number"
              value={generalAvailable}
              onChange={(e) => setGeneralAvailable(Math.max(0, parseInt(e.target.value) || 0))}
              className="w-full py-2 text-center text-sm font-mono font-bold bg-[#123831] border border-[#4D774E] rounded-xl text-white"
            />
          </div>
        </div>

        {/* Card 2: Clinical Triage & Queuing Load */}
        <div className="bg-[#1c5248] rounded-3xl border border-[#4D774E] p-6 shadow-xl space-y-4 text-white">
          <div className="flex items-center justify-between pb-2 border-b border-[#4D774E]/60">
            <h4 className="text-xs font-bold text-[#9DC88D] uppercase tracking-wider font-mono">
              Queue & Doctor Roster
            </h4>
            <span className="text-[11px] text-[#F1B24A] font-mono">Triage Hook</span>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-xs text-[#9DC88D]">
              <span>Patients In Queue:</span>
              <span className="font-mono font-bold text-white tabular-nums">{currentQueue}</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentQueue(Math.max(0, currentQueue - 1))}
                className="w-9 h-9 rounded-xl bg-[#123831] border border-[#4D774E] flex items-center justify-center hover:bg-[#164A41] font-bold text-white"
              >
                -
              </button>
              <input
                type="number"
                value={currentQueue}
                onChange={(e) => setCurrentQueue(Math.max(0, parseInt(e.target.value) || 0))}
                className="flex-1 py-2 text-center text-sm font-mono font-bold bg-[#123831] border border-[#4D774E] rounded-xl text-white"
              />
              <button
                onClick={() => setCurrentQueue(currentQueue + 1)}
                className="w-9 h-9 rounded-xl bg-[#123831] border border-[#4D774E] flex items-center justify-center hover:bg-[#164A41] font-bold text-white"
              >
                +
              </button>
            </div>
          </div>

          <div className="space-y-1 pt-2">
            <div className="flex justify-between text-xs text-[#9DC88D]">
              <span>Active Doctors On Duty:</span>
              <span className="font-mono font-bold text-white tabular-nums">{activeDoctors}</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveDoctors(Math.max(1, activeDoctors - 1))}
                className="w-9 h-9 rounded-xl bg-[#123831] border border-[#4D774E] flex items-center justify-center hover:bg-[#164A41] font-bold text-white"
              >
                -
              </button>
              <input
                type="number"
                value={activeDoctors}
                onChange={(e) => setActiveDoctors(Math.max(1, parseInt(e.target.value) || 1))}
                className="flex-1 py-2 text-center text-sm font-mono font-bold bg-[#123831] border border-[#4D774E] rounded-xl text-white"
              />
              <button
                onClick={() => setActiveDoctors(activeDoctors + 1)}
                className="w-9 h-9 rounded-xl bg-[#123831] border border-[#4D774E] flex items-center justify-center hover:bg-[#164A41] font-bold text-white"
              >
                +
              </button>
            </div>
          </div>

          <div className="space-y-1 pt-2">
            <label className="block text-xs text-[#9DC88D]">Emergency Department Status:</label>
            <select
              value={emergencyStatus}
              onChange={(e) => setEmergencyStatus(e.target.value as any)}
              className="w-full py-2 px-3 text-xs font-bold border border-[#4D774E] rounded-xl bg-[#123831] text-white"
            >
              <option value="OPEN_NORMAL">OPEN_NORMAL (Accepting all arrivals)</option>
              <option value="OPEN_HIGH_LOAD">OPEN_HIGH_LOAD (Emergency priority only)</option>
              <option value="CRITICAL_DIVERT_ONLY">CRITICAL_DIVERT_ONLY (Diversion recommended)</option>
            </select>
          </div>
        </div>

        {/* Card 3: Blood Bank Reserves */}
        <div className="bg-[#1c5248] rounded-3xl border border-[#4D774E] p-6 shadow-xl space-y-4 text-white">
          <div className="flex items-center justify-between pb-2 border-b border-[#4D774E]/60">
            <h4 className="text-xs font-bold text-[#9DC88D] uppercase tracking-wider font-mono">
              Blood Bank Inventory (Units)
            </h4>
            <span className="text-[11px] text-[#F1B24A] font-mono">Cold Chain Units</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {(['A+', 'B+', 'O+', 'AB+', 'A-', 'B-', 'O-', 'AB-'] as BloodGroup[]).map((bg) => (
              <div key={bg} className="p-2 rounded-xl bg-[#123831] border border-[#4D774E] flex items-center justify-between">
                <div>
                  <span className="font-bold text-xs text-[#F1B24A] font-mono">{bg}</span>
                  <div className="text-[11px] font-mono text-white tabular-nums">
                    {bloodStocks[bg] || 0} units
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleBloodStockChange(bg, -1)}
                    className="w-7 h-7 rounded-lg bg-[#164A41] border border-[#4D774E] flex items-center justify-center text-xs hover:bg-[#1c5248] font-bold text-white"
                  >
                    -
                  </button>
                  <button
                    onClick={() => handleBloodStockChange(bg, 1)}
                    className="w-7 h-7 rounded-lg bg-[#164A41] border border-[#4D774E] flex items-center justify-center text-xs hover:bg-[#1c5248] font-bold text-white"
                  >
                    +
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2">
            <div className="flex justify-between text-xs text-[#9DC88D] mb-1">
              <span>Oxygen Cylinders (Type D / Bulk):</span>
              <span className="font-mono font-bold text-white">{oxygenCylinders}</span>
            </div>
            <input
              type="number"
              value={oxygenCylinders}
              onChange={(e) => setOxygenCylinders(Math.max(0, parseInt(e.target.value) || 0))}
              className="w-full py-2 text-center text-xs font-mono font-bold border border-[#4D774E] rounded-xl bg-[#123831] text-white"
            />
          </div>
        </div>
      </div>

      <AuditLogViewer logs={auditLogs} />
    </div>
  );
};
