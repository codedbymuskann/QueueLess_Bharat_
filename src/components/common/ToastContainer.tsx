import React, { useState, useEffect } from 'react';
import { AppNotification, notificationService } from '../../services/notificationService';
import { CheckCircle2, AlertTriangle, Info, ShieldAlert, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const [toasts, setToasts] = useState<AppNotification[]>([]);

  useEffect(() => {
    const unsubscribe = notificationService.subscribe((item) => {
      setToasts((prev) => [item, ...prev.slice(0, 4)]);
      // Auto dismiss after 5 seconds
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== item.id));
      }, 5000);
    });

    return () => unsubscribe();
  }, []);

  const handleDismiss = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none px-4 sm:px-0">
      {toasts.map((toast) => {
        return (
          <div
            key={toast.id}
            className="pointer-events-auto p-3.5 rounded-xl bg-white border border-slate-200 shadow-xl flex items-start gap-3 animate-in slide-in-from-bottom-3 duration-200"
          >
            {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />}
            {toast.type === 'emergency' && <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0 mt-0.5 animate-pulse" />}
            {toast.type === 'warning' && <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />}
            {toast.type === 'info' && <Info className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />}

            <div className="flex-1 text-xs space-y-0.5">
              <div className="font-bold text-slate-900 flex items-center justify-between">
                <span>{toast.title}</span>
                <span className="text-[10px] text-slate-400 font-mono">{toast.timestamp}</span>
              </div>
              <p className="text-slate-600 leading-relaxed">{toast.message}</p>
            </div>

            <button
              onClick={() => handleDismiss(toast.id)}
              className="text-slate-400 hover:text-slate-600 p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
