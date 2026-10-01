import React from 'react';
import { AuditLogEntry } from '../../types/hospital';
import { ShieldCheck, Hash, UserCheck, Calendar } from 'lucide-react';

interface AuditLogViewerProps {
  logs: AuditLogEntry[];
}

export const AuditLogViewer: React.FC<AuditLogViewerProps> = ({ logs }) => {
  return (
    <div className="bg-[#1c5248] rounded-3xl border border-[#4D774E] p-6 sm:p-8 shadow-xl space-y-4 text-white">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#4D774E]/60 gap-2">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#F1B24A]" />
            <h3 className="font-display text-lg font-bold text-white">
              Verifiable Cryptographic Audit Trail
            </h3>
          </div>
          <p className="text-xs text-[#9DC88D] mt-0.5 font-mono">
            Immutable log of all clinical resource updates · Zero Patient Health Information (PHI) stored
          </p>
        </div>

        <div className="text-xs text-[#F1B24A] font-mono tabular-nums font-bold">
          {logs.length} logged events
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-[#4D774E]/60 text-[#9DC88D] font-mono font-bold uppercase tracking-wider text-[10px]">
              <th className="py-2.5 px-3">Timestamp</th>
              <th className="py-2.5 px-3">Facility</th>
              <th className="py-2.5 px-3">Staff Verifier</th>
              <th className="py-2.5 px-3">Resource Action</th>
              <th className="py-2.5 px-3 text-right">Tamper-Proof Hash</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#4D774E]/30 font-sans">
            {logs.map((log) => {
              const formattedTime = new Date(log.timestamp).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
              });

              return (
                <tr key={log.id} className="hover:bg-[#123831] transition-colors">
                  <td className="py-3 px-3 font-mono tabular-nums text-[#9DC88D] whitespace-nowrap">
                    {formattedTime}
                  </td>
                  <td className="py-3 px-3 font-bold text-white whitespace-nowrap">
                    {log.hospitalName}
                  </td>
                  <td className="py-3 px-3 text-[#d8ebd1] whitespace-nowrap">
                    <div className="font-medium text-white">{log.staffName}</div>
                    <div className="text-[10px] text-[#9DC88D] font-mono">{log.role} ({log.staffId})</div>
                  </td>
                  <td className="py-3 px-3 text-[#d8ebd1]">
                    <span className="font-bold text-[#F1B24A] font-mono">{log.action}: </span>
                    <span>{log.details}</span>
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-[11px] text-[#9DC88D] font-bold whitespace-nowrap">
                    {log.hashSignature}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
