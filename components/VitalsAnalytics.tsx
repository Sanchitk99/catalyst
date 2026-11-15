"use client";

import React, { useState } from "react";
import { Activity, Heart, Droplet, TrendingUp, AlertCircle, CheckCircle2 } from "lucide-react";
import { VitalLogData } from "@/types";

interface VitalsAnalyticsProps {
  vitals: VitalLogData[];
}

export default function VitalsAnalytics({ vitals }: VitalsAnalyticsProps) {
  const [selectedVitalTab, setSelectedVitalTab] = useState<"BP" | "GLUCOSE" | "HR">("BP");

  const bpLogs = vitals.filter((v) => v.type === "BLOOD_PRESSURE");
  const glucoseLogs = vitals.filter((v) => v.type === "BLOOD_SUGAR");
  const hrLogs = vitals.filter((v) => v.type === "HEART_RATE");

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6">
      {/* Header with Switcher Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-indigo-600" />
            <span>Clinical Vitals Longitudinal Analytics</span>
          </h3>
          <p className="text-xs text-slate-500">
            Real-time biometric trends and clinical safety reference bands
          </p>
        </div>

        <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-bold text-slate-700">
          <button
            onClick={() => setSelectedVitalTab("BP")}
            className={`px-3 py-1.5 rounded-lg transition ${
              selectedVitalTab === "BP" ? "bg-white text-indigo-700 shadow-sm" : "hover:text-slate-900"
            }`}
          >
            Blood Pressure
          </button>
          <button
            onClick={() => setSelectedVitalTab("GLUCOSE")}
            className={`px-3 py-1.5 rounded-lg transition ${
              selectedVitalTab === "GLUCOSE" ? "bg-white text-indigo-700 shadow-sm" : "hover:text-slate-900"
            }`}
          >
            Blood Glucose
          </button>
          <button
            onClick={() => setSelectedVitalTab("HR")}
            className={`px-3 py-1.5 rounded-lg transition ${
              selectedVitalTab === "HR" ? "bg-white text-indigo-700 shadow-sm" : "hover:text-slate-900"
            }`}
          >
            Heart Rate
          </button>
        </div>
      </div>

      {/* Chart Visualization Area */}
      {selectedVitalTab === "BP" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-rose-500 inline-block" />
                <strong className="text-slate-800">Systolic (Target: &lt; 130)</strong>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-blue-500 inline-block" />
                <strong className="text-slate-800">Diastolic (Target: &lt; 85)</strong>
              </span>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[11px]">
              ✓ Baseline Normal
            </span>
          </div>

          {/* SVG Visual Chart */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
            <svg viewBox="0 0 500 160" className="w-full h-44 overflow-visible">
              {/* Normal target zone background */}
              <rect x="0" y="40" width="500" height="70" fill="#ecfdf5" rx="8" />
              <text x="10" y="32" fontSize="10" fill="#059669" fontWeight="bold">
                Optimal Blood Pressure Zone (110-130 / 70-85 mmHg)
              </text>

              {/* Grid lines */}
              <line x1="0" y1="40" x2="500" y2="40" stroke="#cbd5e1" strokeDasharray="3 3" />
              <line x1="0" y1="80" x2="500" y2="80" stroke="#cbd5e1" strokeDasharray="3 3" />
              <line x1="0" y1="120" x2="500" y2="120" stroke="#cbd5e1" strokeDasharray="3 3" />

              {/* Sample Readings Line for Systolic */}
              <polyline
                fill="none"
                stroke="#f43f5e"
                strokeWidth="3"
                points="40,55 120,52 200,60 280,48 360,54 440,50"
              />

              {/* Sample Readings Line for Diastolic */}
              <polyline
                fill="none"
                stroke="#3b82f6"
                strokeWidth="3"
                points="40,105 120,100 200,104 280,98 360,102 440,100"
              />

              {/* Data points */}
              {[
                { x: 40, s: 124, d: 82, label: "Nov 10" },
                { x: 120, s: 122, d: 80, label: "Nov 11" },
                { x: 200, s: 126, d: 84, label: "Nov 12" },
                { x: 280, s: 120, d: 78, label: "Nov 13" },
                { x: 360, s: 123, d: 81, label: "Nov 14" },
                { x: 440, s: 122, d: 80, label: "Today" },
              ].map((pt, i) => (
                <g key={i}>
                  <circle cx={pt.x} cy={pt.s - 70} r="5" fill="#f43f5e" stroke="#ffffff" strokeWidth="2" />
                  <circle cx={pt.x} cy={pt.d + 20} r="5" fill="#3b82f6" stroke="#ffffff" strokeWidth="2" />
                  <text x={pt.x} y="150" fontSize="10" fill="#64748b" textAnchor="middle">
                    {pt.label}
                  </text>
                  <text x={pt.x} y={pt.s - 78} fontSize="9" fill="#9f1239" fontWeight="bold" textAnchor="middle">
                    {pt.s}
                  </text>
                  <text x={pt.x} y={pt.d + 33} fontSize="9" fill="#1e40af" fontWeight="bold" textAnchor="middle">
                    {pt.d}
                  </text>
                </g>
              ))}
            </svg>
          </div>
        </div>
      )}

      {selectedVitalTab === "GLUCOSE" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1.5 font-bold text-slate-800">
              <span className="w-3 h-3 rounded-full bg-amber-500 inline-block" />
              <span>Fasting Blood Sugar (Target: 70 - 120 mg/dL)</span>
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[11px]">
              ✓ Controlled Fasting
            </span>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
            <svg viewBox="0 0 500 160" className="w-full h-44 overflow-visible">
              <rect x="0" y="35" width="500" height="75" fill="#ecfdf5" rx="8" />
              <text x="10" y="28" fontSize="10" fill="#059669" fontWeight="bold">
                Healthy Fasting Glucose Target Band (70 - 120 mg/dL)
              </text>

              <polyline
                fill="none"
                stroke="#d97706"
                strokeWidth="3"
                points="40,75 120,70 200,82 280,68 360,74 440,70"
              />

              {[
                { x: 40, val: 112, label: "Nov 10" },
                { x: 120, val: 106, label: "Nov 11" },
                { x: 200, val: 118, label: "Nov 12" },
                { x: 280, val: 104, label: "Nov 13" },
                { x: 360, val: 110, label: "Nov 14" },
                { x: 440, val: 108, label: "Today" },
              ].map((pt, i) => (
                <g key={i}>
                  <circle cx={pt.x} cy={pt.val - 38} r="5" fill="#d97706" stroke="#ffffff" strokeWidth="2" />
                  <text x={pt.x} y="150" fontSize="10" fill="#64748b" textAnchor="middle">
                    {pt.label}
                  </text>
                  <text x={pt.x} y={pt.val - 46} fontSize="9" fill="#92400e" fontWeight="bold" textAnchor="middle">
                    {pt.val}
                  </text>
                </g>
              ))}
            </svg>
          </div>
        </div>
      )}

      {selectedVitalTab === "HR" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1.5 font-bold text-slate-800">
              <span className="w-3 h-3 rounded-full bg-teal-500 inline-block" />
              <span>Resting Heart Rate (Target: 60 - 90 bpm)</span>
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[11px]">
              ✓ Steady Normal Rhythm
            </span>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
            <svg viewBox="0 0 500 160" className="w-full h-44 overflow-visible">
              <rect x="0" y="30" width="500" height="85" fill="#f0fdfa" rx="8" />
              <polyline
                fill="none"
                stroke="#0d9488"
                strokeWidth="3"
                points="40,80 120,74 200,78 280,72 360,76 440,72"
              />

              {[
                { x: 40, val: 74, label: "Nov 10" },
                { x: 120, val: 70, label: "Nov 11" },
                { x: 200, val: 73, label: "Nov 12" },
                { x: 280, val: 69, label: "Nov 13" },
                { x: 360, val: 72, label: "Nov 14" },
                { x: 440, val: 72, label: "Today" },
              ].map((pt, i) => (
                <g key={i}>
                  <circle cx={pt.x} cy={pt.val} r="5" fill="#0d9488" stroke="#ffffff" strokeWidth="2" />
                  <text x={pt.x} y="150" fontSize="10" fill="#64748b" textAnchor="middle">
                    {pt.label}
                  </text>
                  <text x={pt.x} y={pt.val - 8} fontSize="9" fill="#115e59" fontWeight="bold" textAnchor="middle">
                    {pt.val} bpm
                  </text>
                </g>
              ))}
            </svg>
          </div>
        </div>
      )}
    </div>
  );
}
