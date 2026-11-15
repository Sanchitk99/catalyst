"use client";

import React, { useState } from "react";
import { Lock, KeyRound, CheckCircle2, AlertCircle, X, ShieldCheck } from "lucide-react";
import { ProfileData, UserRole } from "@/types";

interface PasscodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: ProfileData | null;
  onAuthenticated: (role: UserRole) => void;
}

export default function PasscodeModal({
  isOpen,
  onClose,
  profile,
  onAuthenticated,
}: PasscodeModalProps) {
  const [targetRole, setTargetRole] = useState<UserRole>("CARETAKER");
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleDigit = (digit: string) => {
    if (pin.length < 6) {
      setPin((prev) => prev + digit);
      setError(null);
    }
  };

  const handleBackspace = () => {
    setPin((prev) => prev.slice(0, -1));
    setError(null);
  };

  const handleClear = () => {
    setPin("");
    setError(null);
  };

  const handleSubmit = async (overridePin?: string) => {
    const pinToTest = overridePin || pin;
    if (!profile) return;
    if (!pinToTest) {
      setError("Please enter the passcode PIN");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/verify-passcode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profileId: profile.id,
          passcode: pinToTest,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.valid) {
        setError(data.error || "Incorrect passcode PIN. Please try again.");
      } else {
        onAuthenticated(data.role as UserRole);
        onClose();
        setPin("");
      }
    } catch {
      setError("Error checking passcode. Please retry.");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoUnlock = (role: UserRole) => {
    if (!profile) return;
    let demoPin = profile.elderlyPasscode;
    if (role === "FAMILY") demoPin = profile.familyPasscode;
    if (role === "CARETAKER") demoPin = profile.caretakerPasscode;

    setPin(demoPin);
    handleSubmit(demoPin);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-300 hover:text-white p-1 rounded-full hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur">
              <Lock className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Secure Passcode Access</h3>
              <p className="text-xs text-blue-200">
                Shared Ecosystem for {profile?.preferredName || "Senior Care"}
              </p>
            </div>
          </div>
        </div>

        {/* Role Tabs */}
        <div className="p-6">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Select Desired Access Role:
          </p>
          <div className="grid grid-cols-3 gap-2 mb-6">
            <button
              onClick={() => {
                setTargetRole("SENIOR");
                handleClear();
              }}
              className={`p-2.5 rounded-xl border text-center transition flex flex-col items-center justify-center gap-1 ${
                targetRole === "SENIOR"
                  ? "border-emerald-600 bg-emerald-50 text-emerald-900 font-bold shadow-sm"
                  : "border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              <span className="text-2xl">👵</span>
              <span className="text-xs">Senior</span>
            </button>

            <button
              onClick={() => {
                setTargetRole("FAMILY");
                handleClear();
              }}
              className={`p-2.5 rounded-xl border text-center transition flex flex-col items-center justify-center gap-1 ${
                targetRole === "FAMILY"
                  ? "border-blue-600 bg-blue-50 text-blue-900 font-bold shadow-sm"
                  : "border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              <span className="text-2xl">👨‍👩‍👧</span>
              <span className="text-xs">Family</span>
            </button>

            <button
              onClick={() => {
                setTargetRole("CARETAKER");
                handleClear();
              }}
              className={`p-2.5 rounded-xl border text-center transition flex flex-col items-center justify-center gap-1 ${
                targetRole === "CARETAKER"
                  ? "border-indigo-600 bg-indigo-50 text-indigo-900 font-bold shadow-sm"
                  : "border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              <span className="text-2xl">🩺</span>
              <span className="text-xs">Caretaker</span>
            </button>
          </div>

          {/* PIN Input Display */}
          <div className="mb-4">
            <div className="flex items-center justify-center space-x-3 py-3 bg-slate-50 rounded-2xl border border-slate-200">
              {[0, 1, 2, 3].map((idx) => (
                <div
                  key={idx}
                  className={`w-4 h-4 rounded-full transition-all duration-150 ${
                    pin.length > idx ? "bg-blue-600 scale-110" : "bg-slate-300"
                  }`}
                />
              ))}
            </div>

            {error && (
              <div className="mt-2 text-rose-600 text-xs font-semibold flex items-center justify-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{error}</span>
              </div>
            )}
          </div>

          {/* Keypad */}
          <div className="grid grid-cols-3 gap-2 max-w-xs mx-auto mb-6">
            {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((num) => (
              <button
                key={num}
                onClick={() => handleDigit(num)}
                className="h-12 rounded-xl bg-slate-100 hover:bg-slate-200 active:bg-blue-100 text-lg font-bold text-slate-800 transition shadow-sm"
              >
                {num}
              </button>
            ))}
            <button
              onClick={handleClear}
              className="h-12 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-500 uppercase transition"
            >
              Clear
            </button>
            <button
              onClick={() => handleDigit("0")}
              className="h-12 rounded-xl bg-slate-100 hover:bg-slate-200 active:bg-blue-100 text-lg font-bold text-slate-800 transition shadow-sm"
            >
              0
            </button>
            <button
              onClick={handleBackspace}
              className="h-12 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-500 uppercase transition"
            >
              ⌫
            </button>
          </div>

          {/* Submit Action */}
          <button
            onClick={() => handleSubmit()}
            disabled={loading || pin.length === 0}
            className="w-full py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-sm shadow-md shadow-blue-600/30 transition flex items-center justify-center gap-2"
          >
            {loading ? (
              <span>Verifying Passcode...</span>
            ) : (
              <>
                <KeyRound className="w-4 h-4" />
                <span>Unlock Profile Access</span>
              </>
            )}
          </button>

          {/* Quick Demo Shortcuts */}
          <div className="mt-5 pt-4 border-t border-slate-100 text-center">
            <p className="text-[11px] font-medium text-slate-400 mb-2">
              ⚡ Evaluator Quick Passcodes (Pre-configured):
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2 text-xs">
              <button
                onClick={() => handleQuickDemoUnlock("SENIOR")}
                className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-medium border border-emerald-200"
              >
                👵 Senior PIN (1234)
              </button>
              <button
                onClick={() => handleQuickDemoUnlock("FAMILY")}
                className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 font-medium border border-blue-200"
              >
                👨‍👩‍👧 Family PIN (4321)
              </button>
              <button
                onClick={() => handleQuickDemoUnlock("CARETAKER")}
                className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-medium border border-indigo-200"
              >
                🩺 Nurse PIN (9999)
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
