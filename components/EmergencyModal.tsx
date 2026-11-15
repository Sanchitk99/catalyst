"use client";

import React, { useState } from "react";
import { AlertTriangle, Phone, Shield, X, CheckCircle2 } from "lucide-react";
import { ProfileData } from "@/types";
import { playEmergencyAlarm } from "@/lib/audioHelper";

interface EmergencyModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: ProfileData | null;
  onConfirmSOS: () => Promise<unknown>;
}

export default function EmergencyModal({
  isOpen,
  onClose,
  profile,
  onConfirmSOS,
}: EmergencyModalProps) {
  const [triggered, setTriggered] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleActivate = async () => {
    setLoading(true);
    playEmergencyAlarm();
    try {
      await onConfirmSOS();
      setTriggered(true);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setTriggered(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-in fade-in">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border-2 border-rose-500">
        {/* Header */}
        <div className="bg-rose-600 text-white p-6 relative">
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 text-rose-200 hover:text-white p-1 rounded-full hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
              <AlertTriangle className="w-7 h-7 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-black tracking-wide">EMERGENCY ASSISTANCE BEACON</h3>
              <p className="text-xs text-rose-100">
                Direct Care Circle Emergency Alert System
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {!triggered ? (
            <div className="space-y-4">
              <p className="text-sm font-semibold text-slate-800">
                Are you in need of immediate assistance for{" "}
                <span className="text-rose-600 font-bold">{profile?.fullName}</span>?
              </p>

              <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 text-xs text-rose-950 space-y-2">
                <p className="font-bold flex items-center gap-1.5 text-rose-800">
                  <Shield className="w-4 h-4 text-rose-600" />
                  <span>Activating this beacon will immediately:</span>
                </p>
                <ul className="list-disc pl-5 space-y-1 font-medium text-slate-700">
                  <li>Dispatch high-priority email alerts to all family and care circle members</li>
                  <li>Log an urgent incident on the CareRing collaboration board</li>
                  <li>Display emergency hospital and physician details below</li>
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleClose}
                  className="flex-1 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 font-bold text-xs text-slate-700 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleActivate}
                  disabled={loading}
                  className="flex-1 py-3 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs shadow-lg shadow-rose-600/40 transition flex items-center justify-center gap-2"
                >
                  <Phone className="w-4 h-4" />
                  <span>{loading ? "Activating Beacon..." : "ACTIVATE SOS BEACON NOW"}</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4 text-center py-2">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <div>
                <h4 className="text-lg font-bold text-slate-900">
                  SOS Alert Broadcasted to Care Circle!
                </h4>
                <p className="text-xs text-slate-600 mt-1 max-w-sm mx-auto">
                  Emergency notifications have been sent to Marcus Vance, Chloe Vance, and Nurse Elena Gomez.
                </p>
              </div>

              {/* Rapid Contact Box */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-left text-xs space-y-2">
                <div>
                  <span className="text-slate-400 font-medium">Emergency Contact:</span>
                  <p className="text-base font-bold text-slate-900">{profile?.emergencyPhone || "+1 (555) 911-0022"}</p>
                </div>
                <div>
                  <span className="text-slate-400 font-medium">Hospital Preference:</span>
                  <p className="font-bold text-slate-800">{profile?.hospitalPreference}</p>
                </div>
                <div>
                  <span className="text-slate-400 font-medium">Physician:</span>
                  <p className="font-bold text-slate-800">{profile?.primaryDoctor} ({profile?.doctorPhone})</p>
                </div>
              </div>

              <button
                onClick={handleClose}
                className="w-full py-3 rounded-2xl bg-slate-900 text-white font-bold text-xs shadow-md transition"
              >
                Close &amp; Return to Dashboard
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
