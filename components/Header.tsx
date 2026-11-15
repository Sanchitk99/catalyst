"use client";

import React, { useState } from "react";
import {
  Heart,
  Shield,
  Volume2,
  VolumeX,
  Type,
  Sun,
  AlertTriangle,
  Lock,
  UserCheck,
  Calendar,
  Pill,
  Users,
  Bell,
  ChevronDown,
  CreditCard,
  UserPlus,
} from "lucide-react";
import { ProfileData, UserRole } from "@/types";

interface HeaderProps {
  profile: ProfileData | null;
  allProfiles?: ProfileData[];
  onSelectProfile?: (profileId: string) => void;
  activeRole: UserRole;
  onOpenPasscodeModal: () => void;
  activeTab: "SENIOR" | "CARETAKER" | "FAMILY" | "NOTIFICATIONS";
  setActiveTab: (tab: "SENIOR" | "CARETAKER" | "FAMILY" | "NOTIFICATIONS") => void;
  highContrast: boolean;
  setHighContrast: (val: boolean) => void;
  fontSizeMode: "normal" | "large" | "extra-large";
  setFontSizeMode: (val: "normal" | "large" | "extra-large") => void;
  voiceEnabled: boolean;
  setVoiceEnabled: (val: boolean) => void;
  onTriggerSOS: () => void;
  onOpenIceCard?: () => void;
}

export default function Header({
  profile,
  allProfiles = [],
  onSelectProfile,
  activeRole,
  onOpenPasscodeModal,
  activeTab,
  setActiveTab,
  highContrast,
  setHighContrast,
  fontSizeMode,
  setFontSizeMode,
  voiceEnabled,
  setVoiceEnabled,
  onTriggerSOS,
  onOpenIceCard,
}: HeaderProps) {
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const roleLabels: Record<UserRole, { label: string; color: string; icon: string }> = {
    SENIOR: { label: "Senior Portal", color: "bg-emerald-600 text-white", icon: "👵" },
    FAMILY: { label: "Family Circle", color: "bg-blue-600 text-white", icon: "👨‍👩‍👧" },
    CARETAKER: { label: "Caretaker / Nurse", color: "bg-indigo-700 text-white", icon: "🩺" },
  };

  const cycleFontSize = () => {
    if (fontSizeMode === "normal") setFontSizeMode("large");
    else if (fontSizeMode === "large") setFontSizeMode("extra-large");
    else setFontSizeMode("normal");
  };

  return (
    <header className="border-b border-slate-200 bg-white/95 backdrop-blur sticky top-0 z-40 transition-colors">
      {/* Top Banner with Senior Quick Vitals & Emergency */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-4">
        {/* Brand & Senior Identity with Multi-Profile Switcher */}
        <div className="flex items-center space-x-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-700 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <Heart className="w-6 h-6 fill-rose-300 stroke-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-slate-900">
                CareRing <span className="text-blue-600 font-medium text-sm">Health</span>
              </h1>
              <span className="hidden sm:inline-block text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                Interconnected Senior Care
              </span>
            </div>

            {/* Profile Dropdown Switcher */}
            <div className="relative mt-0.5">
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900 font-medium py-0.5 px-1.5 rounded-lg hover:bg-slate-100 transition"
              >
                <span>Caring for:</span>
                <span className="text-slate-900 font-bold underline decoration-blue-500 decoration-2 underline-offset-2">
                  {profile?.preferredName || profile?.fullName || "Select Profile"}
                </span>
                <span className="text-slate-500 font-semibold">({profile?.age} yrs)</span>
                <span className="font-semibold text-rose-600 ml-1">[{profile?.bloodType}]</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {profileDropdownOpen && (
                <div className="absolute left-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-50 animate-in fade-in">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1">
                    Switch Care Profile:
                  </p>
                  <div className="space-y-1">
                    {allProfiles.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => {
                          onSelectProfile?.(p.id);
                          setProfileDropdownOpen(false);
                        }}
                        className={`w-full p-2 rounded-xl text-left text-xs transition flex items-center justify-between ${
                          p.id === profile?.id
                            ? "bg-blue-50 text-blue-900 font-bold border border-blue-200"
                            : "hover:bg-slate-50 text-slate-700"
                        }`}
                      >
                        <div>
                          <p className="font-bold">{p.preferredName || p.fullName}</p>
                          <p className="text-[11px] text-slate-500">
                            {p.age} yrs &bull; Blood: {p.bloodType} &bull; PIN: {p.elderlyPasscode}
                          </p>
                        </div>
                        {p.id === profile?.id && (
                          <span className="text-blue-600 font-bold text-xs">✓ Active</span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Accessibility & Role Badges & Actions */}
        <div className="flex items-center flex-wrap gap-2">
          {/* Paramedic Emergency Medical ID Card */}
          {onOpenIceCard && (
            <button
              onClick={onOpenIceCard}
              title="Open Paramedic Emergency Medical ID Card"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-rose-300 bg-rose-50 text-rose-800 hover:bg-rose-100 transition shadow-sm text-xs font-bold"
            >
              <CreditCard className="w-3.5 h-3.5 text-rose-600" />
              <span>Paramedic Medical ID</span>
            </button>
          )}

          {/* Senior Accessibility Controls */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
            <button
              onClick={() => setVoiceEnabled(!voiceEnabled)}
              title={voiceEnabled ? "Voice Guide Enabled" : "Voice Guide Disabled"}
              className={`p-1.5 rounded-lg flex items-center gap-1 font-medium transition ${
                voiceEnabled ? "bg-white text-blue-700 shadow-sm" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {voiceEnabled ? <Volume2 className="w-4 h-4 text-blue-600" /> : <VolumeX className="w-4 h-4" />}
              <span className="hidden md:inline">Voice</span>
            </button>

            <button
              onClick={cycleFontSize}
              title={`Font Size: ${fontSizeMode}`}
              className="p-1.5 rounded-lg flex items-center gap-1 font-medium text-slate-600 hover:text-slate-900 transition"
            >
              <Type className="w-4 h-4" />
              <span className="text-[11px] font-bold uppercase">{fontSizeMode === "normal" ? "A" : fontSizeMode === "large" ? "A+" : "A++"}</span>
            </button>

            <button
              onClick={() => setHighContrast(!highContrast)}
              title="High Contrast Mode"
              className={`p-1.5 rounded-lg flex items-center gap-1 font-medium transition ${
                highContrast ? "bg-yellow-400 text-black font-bold shadow-sm" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Sun className="w-4 h-4" />
              <span className="hidden md:inline">Contrast</span>
            </button>
          </div>

          {/* Current Role Indicator & Passcode Switcher */}
          <button
            onClick={onOpenPasscodeModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 transition shadow-sm text-xs font-semibold text-slate-700"
          >
            <span className="text-sm">{roleLabels[activeRole].icon}</span>
            <span>{roleLabels[activeRole].label}</span>
            <Lock className="w-3.5 h-3.5 text-slate-400 ml-1" />
          </button>

          {/* Emergency SOS Button */}
          <button
            onClick={onTriggerSOS}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs tracking-wide shadow-md shadow-rose-600/30 transition transform active:scale-95 animate-pulse"
          >
            <AlertTriangle className="w-4 h-4" />
            <span>EMERGENCY SOS</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-slate-100 flex overflow-x-auto space-x-1 py-1">
        <button
          onClick={() => setActiveTab("SENIOR")}
          className={`px-4 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 whitespace-nowrap transition ${
            activeTab === "SENIOR"
              ? "bg-blue-50 text-blue-700 border-b-2 border-blue-600"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
          }`}
        >
          <span className="text-base">👵</span>
          <span>Senior Portal (My Day)</span>
        </button>

        <button
          onClick={() => setActiveTab("CARETAKER")}
          className={`px-4 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 whitespace-nowrap transition ${
            activeTab === "CARETAKER"
              ? "bg-indigo-50 text-indigo-700 border-b-2 border-indigo-600"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
          }`}
        >
          <Pill className="w-4 h-4" />
          <span>Caretaker &amp; Clinical Hub</span>
        </button>

        <button
          onClick={() => setActiveTab("FAMILY")}
          className={`px-4 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 whitespace-nowrap transition ${
            activeTab === "FAMILY"
              ? "bg-emerald-50 text-emerald-700 border-b-2 border-emerald-600"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Family Peace-of-Mind</span>
        </button>

        <button
          onClick={() => setActiveTab("NOTIFICATIONS")}
          className={`px-4 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 whitespace-nowrap transition ${
            activeTab === "NOTIFICATIONS"
              ? "bg-amber-50 text-amber-800 border-b-2 border-amber-600"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
          }`}
        >
          <Bell className="w-4 h-4" />
          <span>Proactive Email Engine</span>
        </button>
      </div>
    </header>
  );
}
