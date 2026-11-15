"use client";

import React from "react";
import { AlertTriangle, Phone, Shield, X, Printer, Heart, Pill, Hospital } from "lucide-react";
import { ProfileData, MedicationData } from "@/types";

interface IceMedicalCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: ProfileData | null;
  medications: MedicationData[];
}

export default function IceMedicalCardModal({
  isOpen,
  onClose,
  profile,
  medications,
}: IceMedicalCardModalProps) {
  if (!isOpen || !profile) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 overflow-y-auto animate-in fade-in">
      <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full border-4 border-rose-600 overflow-hidden print:border-none print:shadow-none print:max-w-none">
        {/* Modal Top Controls (Hidden on Print) */}
        <div className="bg-rose-700 text-white p-5 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center font-black text-xl">
              🏥
            </div>
            <div>
              <h3 className="text-lg font-black tracking-wide">
                EMERGENCY MEDICAL ID (I.C.E. CARD)
              </h3>
              <p className="text-xs text-rose-200">
                Paramedic &amp; Emergency First Responder Clinical Profile
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 print:hidden">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-xl bg-white/20 hover:bg-white/30 text-white text-xs font-bold flex items-center gap-1 transition"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Wallet ID</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-rose-200 hover:text-white hover:bg-white/10"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Card Body */}
        <div className="p-6 space-y-5 text-slate-900 text-xs">
          {/* Identity & Blood Banner */}
          <div className="flex items-start justify-between bg-rose-50 border-2 border-rose-200 p-4 rounded-2xl">
            <div>
              <span className="text-[10px] font-bold text-rose-700 uppercase tracking-wider">
                Patient Full Name
              </span>
              <h2 className="text-xl font-black text-slate-900">{profile.fullName}</h2>
              <p className="text-xs text-slate-600 font-medium">
                Preferred: <strong>{profile.preferredName}</strong> &bull; Age: {profile.age} &bull; {profile.gender}
              </p>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-bold text-rose-700 uppercase tracking-wider">
                Blood Type
              </span>
              <p className="text-3xl font-black text-rose-600">{profile.bloodType}</p>
            </div>
          </div>

          {/* Critical Allergies - Prominent Red Flag */}
          <div className="bg-red-600 text-white p-3.5 rounded-2xl shadow-sm">
            <span className="text-[10px] font-black tracking-wider uppercase opacity-90">
              ⚠️ KNOWN DRUG &amp; ENVIRONMENTAL ALLERGIES
            </span>
            <p className="text-base font-extrabold mt-0.5">{profile.allergies}</p>
          </div>

          {/* Emergency Contacts */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] font-bold text-slate-400 uppercase">
                Primary Emergency Next-of-Kin
              </span>
              <p className="text-sm font-bold text-slate-900 mt-1">Marcus Vance (Son)</p>
              <a
                href={`tel:${profile.emergencyPhone}`}
                className="mt-1 inline-flex items-center gap-1.5 text-blue-700 font-bold text-xs"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>{profile.emergencyPhone}</span>
              </a>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] font-bold text-slate-400 uppercase">
                Primary Geriatrician
              </span>
              <p className="text-sm font-bold text-slate-900 mt-1">{profile.primaryDoctor}</p>
              <a
                href={`tel:${profile.doctorPhone}`}
                className="mt-1 inline-flex items-center gap-1.5 text-blue-700 font-bold text-xs"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>{profile.doctorPhone}</span>
              </a>
            </div>
          </div>

          {/* Preferred Hospital */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center space-x-2">
            <Hospital className="w-4 h-4 text-rose-600" />
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase">
                Preferred Hospital Facility
              </span>
              <p className="font-bold text-slate-900">{profile.hospitalPreference}</p>
            </div>
          </div>

          {/* Active Prescriptions for ER Physicians */}
          <div>
            <h4 className="font-bold text-slate-800 uppercase text-[10px] mb-1.5 flex items-center gap-1">
              <Pill className="w-3.5 h-3.5 text-indigo-600" />
              <span>Current Daily Prescriptions ({medications.length})</span>
            </h4>
            <div className="grid grid-cols-2 gap-1.5">
              {medications.map((m) => (
                <div
                  key={m.id}
                  className="p-2 rounded-xl bg-slate-50 border border-slate-200 text-[11px]"
                >
                  <p className="font-bold text-slate-900">{m.name}</p>
                  <p className="text-slate-600 font-medium">
                    {m.dosage} &bull; {m.purpose}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Paramedic Note */}
          <div className="text-center pt-2 text-[10px] text-slate-400 border-t border-slate-100">
            CareRing Healthcare Network &bull; Direct Verified Paramedic Medical ID
          </div>
        </div>
      </div>
    </div>
  );
}
