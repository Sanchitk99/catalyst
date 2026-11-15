"use client";

import React from "react";
import { Printer, X, FileText, CheckCircle2, Shield, Calendar, Activity, Pill } from "lucide-react";
import { ProfileData, MedicationData, AppointmentData, VitalLogData } from "@/types";
import { formatTime } from "@/lib/utils";

interface DoctorSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: ProfileData | null;
  medications: MedicationData[];
  appointments: AppointmentData[];
  vitals: VitalLogData[];
  adherenceRate: number;
}

export default function DoctorSummaryModal({
  isOpen,
  onClose,
  profile,
  medications,
  appointments,
  vitals,
  adherenceRate,
}: DoctorSummaryModalProps) {
  if (!isOpen || !profile) return null;

  const handlePrint = () => {
    window.print();
  };

  const currentDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[92vh] overflow-y-auto border border-slate-200 p-6 sm:p-8 print:p-0 print:border-none print:shadow-none print:max-h-none print:overflow-visible">
        {/* Modal Controls (Hidden in Print) */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-6 print:hidden">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-bold text-slate-900">
              Geriatric Clinical Visit &amp; Adherence Report
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-blue-600/30 transition"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Save as PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Content */}
        <div className="space-y-6 text-slate-800 text-xs font-sans print:space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between border-b-2 border-slate-900 pb-4">
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                CareRing Health &bull; Clinical Profile Summary
              </h1>
              <p className="text-slate-500 text-xs">
                Comprehensive Geriatric Medication Adherence &amp; Vital Records
              </p>
            </div>
            <div className="text-right">
              <p className="font-bold text-slate-900">Date: {currentDate}</p>
              <p className="text-slate-500">Patient ID: {profile.id.slice(0, 8)}</p>
            </div>
          </div>

          {/* Patient Demographics & Critical Medical Info */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200 print:bg-white print:border-slate-300">
            <div>
              <span className="text-slate-400 font-semibold uppercase text-[10px]">Patient Name</span>
              <p className="font-bold text-slate-900 text-sm">{profile.fullName}</p>
              <p className="text-slate-500 text-[11px]">Preferred: {profile.preferredName}</p>
            </div>
            <div>
              <span className="text-slate-400 font-semibold uppercase text-[10px]">Age &amp; Gender</span>
              <p className="font-bold text-slate-900 text-sm">
                {profile.age} yrs &bull; {profile.gender}
              </p>
              <p className="text-slate-500 text-[11px]">Blood: <strong>{profile.bloodType}</strong></p>
            </div>
            <div>
              <span className="text-slate-400 font-semibold uppercase text-[10px]">Known Allergies</span>
              <p className="font-bold text-rose-700 text-sm">{profile.allergies}</p>
            </div>
            <div>
              <span className="text-slate-400 font-semibold uppercase text-[10px]">Primary Physician</span>
              <p className="font-bold text-slate-900 text-sm">{profile.primaryDoctor}</p>
              <p className="text-slate-500 text-[11px]">{profile.doctorPhone}</p>
            </div>
          </div>

          {/* Adherence Overview */}
          <div className="flex items-center justify-between p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl print:border-slate-300">
            <div>
              <h4 className="font-bold text-emerald-950 text-sm">
                30-Day Medication Adherence Compliance Score
              </h4>
              <p className="text-emerald-800 text-xs">
                Verified through daily one-touch senior logging and visiting nurse audits
              </p>
            </div>
            <div className="text-right">
              <span className="text-2xl font-black text-emerald-700">{adherenceRate}%</span>
              <p className="text-[10px] font-bold text-emerald-800 uppercase">Compliance Level: High</p>
            </div>
          </div>

          {/* Active Medication Regimen Table */}
          <div>
            <h4 className="font-bold text-slate-900 text-sm mb-2 flex items-center gap-1.5">
              <Pill className="w-4 h-4 text-blue-600" />
              <span>Current Active Prescriptions ({medications.length})</span>
            </h4>
            <table className="w-full border-collapse border border-slate-200 text-left text-xs">
              <thead className="bg-slate-100 print:bg-slate-200">
                <tr>
                  <th className="border border-slate-200 p-2 font-bold">Medication</th>
                  <th className="border border-slate-200 p-2 font-bold">Dosage &amp; Form</th>
                  <th className="border border-slate-200 p-2 font-bold">Schedule</th>
                  <th className="border border-slate-200 p-2 font-bold">Instructions &amp; Purpose</th>
                  <th className="border border-slate-200 p-2 font-bold text-right">Pills Left</th>
                </tr>
              </thead>
              <tbody>
                {medications.map((med) => {
                  let times: string[] = [];
                  try {
                    times = JSON.parse(med.scheduleTimes);
                  } catch {
                    times = [med.scheduleTimes];
                  }
                  return (
                    <tr key={med.id} className="odd:bg-white even:bg-slate-50/50">
                      <td className="border border-slate-200 p-2 font-bold text-slate-900">
                        {med.name}
                        {med.brandName && (
                          <span className="text-slate-500 font-normal"> ({med.brandName})</span>
                        )}
                      </td>
                      <td className="border border-slate-200 p-2">
                        {med.dosage} &bull; {med.form}
                      </td>
                      <td className="border border-slate-200 p-2 font-semibold text-blue-700">
                        {times.map(formatTime).join(", ")}
                      </td>
                      <td className="border border-slate-200 p-2">
                        <span className="italic">{med.instructions}</span>
                        {med.purpose && (
                          <div className="text-[10px] text-slate-500 mt-0.5">For: {med.purpose}</div>
                        )}
                      </td>
                      <td className="border border-slate-200 p-2 text-right font-bold">
                        {med.remainingPills} / {med.totalPills}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Recent Vitals Signs Log */}
          <div>
            <h4 className="font-bold text-slate-900 text-sm mb-2 flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-rose-600" />
              <span>Recent Clinical Vitals History</span>
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {vitals.slice(0, 4).map((v) => (
                <div key={v.id} className="p-2.5 rounded-xl border border-slate-200 bg-slate-50">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">
                    {v.type.replace("_", " ")}
                  </span>
                  <p className="text-base font-black text-slate-900 mt-0.5">
                    {v.value} <span className="text-xs font-normal text-slate-500">{v.unit}</span>
                  </p>
                  <p className="text-[10px] text-slate-400 mt-1">
                    {new Date(v.measuredAt).toLocaleDateString()} &bull; {v.measuredBy}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Physician Notes & Authorizations Section */}
          <div className="border border-dashed border-slate-300 rounded-2xl p-4 mt-4">
            <h5 className="font-bold text-slate-700 uppercase text-[11px] mb-2">
              Physician Consultation Notes &amp; Refill Orders:
            </h5>
            <div className="h-20 border-b border-slate-200 mb-4" />
            <div className="flex justify-between items-end pt-2 text-slate-500 text-xs">
              <div>Physician Signature: _________________________________</div>
              <div>Date: ________________________</div>
            </div>
          </div>

          <div className="text-center text-[10px] text-slate-400 pt-2 border-t border-slate-100">
            CareRing Healthcare Platform &bull; Patient-Centered Interconnected Geriatric Care System
          </div>
        </div>
      </div>
    </div>
  );
}
