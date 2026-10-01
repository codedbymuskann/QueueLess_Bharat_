import React from 'react';
import { motion } from 'motion/react';
import { Server, ShieldCheck, Cpu, Database, Activity, CheckCircle2, Lock, GitBranch, ArrowRight, Layers } from 'lucide-react';

export const SystemArchitecture: React.FC = () => {
  return (
    <div className="space-y-10">
      {/* Top Banner with Parallax Scroll Appearance */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="bg-white rounded-2xl border border-slate-200 p-8 shadow-xs relative overflow-hidden"
      >
        <div className="relative z-10 max-w-3xl space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-rose-600 uppercase tracking-wider">
            <span>Healthcare Systems Engineering</span>
            <span className="text-slate-300">·</span>
            <span>Enterprise Telemetry Platform</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            System Architecture, Telemetry & Security Engine
          </h1>
          <p className="text-sm text-slate-600 leading-relaxed">
            QueueLess Bharat is architected as an asynchronous, event-driven emergency discovery platform. It reconciles hospital bed capacity telemetry, live GPS distance matrices, and multivariate queue forecasting in real time.
          </p>
        </div>

        {/* Decorative subtle background grid */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-linear-to-l from-rose-50/60 to-transparent pointer-events-none" />
      </motion.div>

      {/* 4-Stage Architectural Pipeline */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-rose-600" />
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">
            End-to-End Real-Time Pipeline
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              step: '01',
              title: 'Live Location & Requirements',
              desc: 'HTML5 Geolocation API resolves high-accuracy GPS coordinates or regional hub coordinates. Patients filter by ICU, ventilator, and blood emergency criteria.',
              icon: Activity,
            },
            {
              step: '02',
              title: 'Verified Staff Data Ingestion',
              desc: 'Hospital triage directors and staff update bed stocks, doctor rosters, and triage diversion status via an authenticated interface with cryptographic signing.',
              icon: Server,
            },
            {
              step: '03',
              title: 'AI Queuing & Predictive Engine',
              desc: 'Multivariate regression and M/M/c queuing formulation compute exact expected wait minutes, variance intervals, and 24-hour crowd forecast curves.',
              icon: Cpu,
            },
            {
              step: '04',
              title: 'Actionable Dispatch Dashboard',
              desc: 'Ranks facilities by live distance, capacity readiness, and wait time, with one-tap emergency call and 108 ambulance dispatch integration.',
              icon: CheckCircle2,
            },
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.1, ease: [0.16, 1, 0.3, 1] }}
                className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-colors"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded">
                      Phase {item.step}
                    </span>
                    <Icon className="w-4 h-4 text-slate-400" />
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm leading-snug">{item.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{item.desc}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Security Architecture & Zero-PHI Compliance Section */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.45 }}
        className="bg-slate-900 text-white rounded-2xl p-8 border border-slate-800 shadow-md space-y-6"
      >
        <div className="flex items-start justify-between flex-wrap gap-4 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight">
                Zero-Clinical-Diagnostics Security Model
              </h3>
              <p className="text-xs text-slate-400">
                Architectural immunity to patient health data breaches through strict zero-knowledge routing
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-3 py-1 rounded-lg">
            <Lock className="w-3.5 h-3.5" />
            <span>ABDM / DISHA Compatible</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-slate-300">
          <div className="space-y-2">
            <h4 className="font-bold text-white text-sm">1. Strict No-PHI Ingestion</h4>
            <p className="leading-relaxed text-slate-400">
              QueueLess Bharat never collects, stores, or processes patient names, diagnostic scans, prescription data, or medical histories. The system operates strictly at the resource capacity and aggregate wait-time level.
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-bold text-white text-sm">2. Cryptographic Audit Hashing</h4>
            <p className="leading-relaxed text-slate-400">
              Every staff telemetry modification generates a SHA-256 derived signature (e.g. <code className="text-emerald-400">SEC-SIG-8A4F102B</code>). Any unauthorized payload mutation immediately invalidates the signature chain.
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-bold text-white text-sm">3. Local-First Client Privacy</h4>
            <p className="leading-relaxed text-slate-400">
              User GPS coordinates are computed strictly on the client device using the Haversine formula. Coordinates are never logged to a central database or shared with advertising entities.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Clean Architecture & SOLID Realization */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.45 }}
        className="bg-white rounded-2xl border border-slate-200 p-8 shadow-xs space-y-6"
      >
        <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
          <GitBranch className="w-5 h-5 text-rose-600" />
          <h3 className="text-base font-bold text-slate-900 tracking-tight">
            Clean Architecture & SOLID Engineering Principles
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 text-xs">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5">
            <span className="font-mono font-bold text-rose-600">S · Single Responsibility</span>
            <h4 className="font-bold text-slate-900 text-sm">Isolated Domain Logic</h4>
            <p className="text-slate-600 leading-relaxed">
              <code className="text-slate-900 font-semibold">PredictionEngine</code> calculates queues, <code className="text-slate-900 font-semibold">SecurityService</code> validates integrity, <code className="text-slate-900 font-semibold">LocationService</code> calculates geodesics, and <code className="text-slate-900 font-semibold">HospitalService</code> manages persistence.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5">
            <span className="font-mono font-bold text-rose-600">O · Open / Closed Principle</span>
            <h4 className="font-bold text-slate-900 text-sm">Extensible Clinical Schemas</h4>
            <p className="text-slate-600 leading-relaxed">
              New medical specialties, department types, or clinical triage protocols can be registered through type interfaces without altering the core regression calculations.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5">
            <span className="font-mono font-bold text-rose-600">L · Liskov Substitution</span>
            <h4 className="font-bold text-slate-900 text-sm">Interchangeable Providers</h4>
            <p className="text-slate-600 leading-relaxed">
              All hospital data models strictly honor the <code className="text-slate-900 font-semibold">Hospital</code> domain contract, ensuring government super-specialties and private institutes render identically.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5">
            <span className="font-mono font-bold text-rose-600">I · Interface Segregation</span>
            <h4 className="font-bold text-slate-900 text-sm">Focused Component Contracts</h4>
            <p className="text-slate-600 leading-relaxed">
              Consumers receive only the slice of state they require—radar maps receive coordinates and capacity flags, while predictor views receive clinical staffing factors.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5 lg:col-span-2">
            <span className="font-mono font-bold text-rose-600">D · Dependency Inversion</span>
            <h4 className="font-bold text-slate-900 text-sm">Abstractions Over Implementations</h4>
            <p className="text-slate-600 leading-relaxed">
              High-level presentation components interact through decoupled services (<code className="text-slate-900 font-semibold">LocationService</code>, <code className="text-slate-900 font-semibold">NotificationService</code>) rather than tight storage or browser API bindings, ensuring seamless testing and offline reliability.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
