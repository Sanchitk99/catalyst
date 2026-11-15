"use client";

import React, { useState, useEffect, useCallback } from "react";
import Header from "@/components/Header";
import SeniorView from "@/components/SeniorView";
import CaretakerView from "@/components/CaretakerView";
import FamilyView from "@/components/FamilyView";
import NotificationView from "@/components/NotificationView";
import PasscodeModal from "@/components/PasscodeModal";
import EmergencyModal from "@/components/EmergencyModal";
import IceMedicalCardModal from "@/components/IceMedicalCardModal";
import {
  ProfileData,
  UserRole,
  DoseScheduleData,
  MedicationData,
  AppointmentData,
  CareCircleMemberData,
  HealthcareRoutineData,
  VitalLogData,
  LoveNoteData,
  NotificationLogData,
} from "@/types";

export default function Home() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [allProfiles, setAllProfiles] = useState<ProfileData[]>([]);
  const [activeRole, setActiveRole] = useState<UserRole>("SENIOR");
  const [activeTab, setActiveTab] = useState<"SENIOR" | "CARETAKER" | "FAMILY" | "NOTIFICATIONS">("SENIOR");

  // Accessibility State
  const [highContrast, setHighContrast] = useState(false);
  const [fontSizeMode, setFontSizeMode] = useState<"normal" | "large" | "extra-large">("large");
  const [voiceEnabled, setVoiceEnabled] = useState(true);

  // Modals
  const [isPasscodeModalOpen, setIsPasscodeModalOpen] = useState(false);
  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState(false);
  const [isIceModalOpen, setIsIceModalOpen] = useState(false);

  // Data states
  const [doses, setDoses] = useState<DoseScheduleData[]>([]);
  const [medications, setMedications] = useState<MedicationData[]>([]);
  const [appointments, setAppointments] = useState<AppointmentData[]>([]);
  const [careCircle, setCareCircle] = useState<CareCircleMemberData[]>([]);
  const [routines, setRoutines] = useState<HealthcareRoutineData[]>([]);
  const [vitals, setVitals] = useState<VitalLogData[]>([]);
  const [loveNotes, setLoveNotes] = useState<LoveNoteData[]>([]);
  const [notifications, setNotifications] = useState<NotificationLogData[]>([]);
  const [loading, setLoading] = useState(true);

  // 1. Initial Load: Fetch Active Profile
  const fetchProfileAndData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/profiles");
      const profiles = await res.json();
      const list = Array.isArray(profiles) ? profiles : [profiles];
      setAllProfiles(list);
      const currentProfile = list[0];

      if (currentProfile) {
        setProfile(currentProfile);

        // Fetch associated resources
        await Promise.all([
          fetchDoses(currentProfile.id),
          fetchMedications(currentProfile.id),
          fetchAppointments(currentProfile.id),
          fetchCareCircle(currentProfile.id),
          fetchRoutinesAndVitals(currentProfile.id),
          fetchNotifications(currentProfile.id),
        ]);
      }
    } catch (e) {
      console.error("Error loading profile:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSelectProfile = async (profileId: string) => {
    const selected = allProfiles.find((p) => p.id === profileId);
    if (selected) {
      setProfile(selected);
      setLoading(true);
      try {
        await Promise.all([
          fetchDoses(selected.id),
          fetchMedications(selected.id),
          fetchAppointments(selected.id),
          fetchCareCircle(selected.id),
          fetchRoutinesAndVitals(selected.id),
          fetchNotifications(selected.id),
        ]);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSnoozeDose = async (doseId: string, minutes: number = 15) => {
    try {
      await fetch("/api/doses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: doseId, action: "SNOOZE", snoozeMinutes: minutes }),
      });
      if (profile) await fetchDoses(profile.id);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchProfileAndData();
  }, [fetchProfileAndData]);

  const fetchDoses = async (profileId: string) => {
    try {
      const res = await fetch(`/api/doses?profileId=${profileId}`);
      const data = await res.json();
      if (data.doses) setDoses(data.doses);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchMedications = async (profileId: string) => {
    try {
      const res = await fetch(`/api/medications?profileId=${profileId}`);
      const data = await res.json();
      if (Array.isArray(data)) setMedications(data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchAppointments = async (profileId: string) => {
    try {
      const res = await fetch(`/api/appointments?profileId=${profileId}`);
      const data = await res.json();
      if (Array.isArray(data)) setAppointments(data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchCareCircle = async (profileId: string) => {
    try {
      const res = await fetch(`/api/care-circle?profileId=${profileId}`);
      const data = await res.json();
      if (data.members) setCareCircle(data.members);
      if (data.loveNotes) setLoveNotes(data.loveNotes);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchRoutinesAndVitals = async (profileId: string) => {
    try {
      const res = await fetch(`/api/routines?profileId=${profileId}`);
      const data = await res.json();
      if (data.routines) setRoutines(data.routines);
      if (data.vitals) setVitals(data.vitals);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchNotifications = async (profileId: string) => {
    try {
      const res = await fetch(`/api/notifications?profileId=${profileId}`);
      const data = await res.json();
      if (Array.isArray(data)) setNotifications(data);
    } catch (e) {
      console.error(e);
    }
  };

  // Actions
  const handleTakeDose = async (doseId: string) => {
    try {
      await fetch("/api/doses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: doseId,
          status: "TAKEN",
          takenBy: profile?.preferredName || "Eleanor (Self)",
        }),
      });

      if (profile) {
        await Promise.all([fetchDoses(profile.id), fetchMedications(profile.id)]);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdateDoseStatus = async (doseId: string, status: string, takenBy: string) => {
    try {
      await fetch("/api/doses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: doseId, status, takenBy }),
      });
      if (profile) await fetchDoses(profile.id);
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggleRoutine = async (routineId: string, currentStatus: boolean) => {
    try {
      await fetch("/api/routines", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "TOGGLE_ROUTINE",
          routineId,
          completed: !currentStatus,
        }),
      });
      if (profile) await fetchRoutinesAndVitals(profile.id);
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddMedication = async (medData: Partial<MedicationData>) => {
    if (!profile) return;
    try {
      await fetch("/api/medications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...medData, profileId: profile.id }),
      });
      await Promise.all([fetchMedications(profile.id), fetchDoses(profile.id)]);
    } catch (e) {
      console.error(e);
    }
  };

  const handleRefillMedication = async (medId: string, amount: number) => {
    try {
      await fetch("/api/medications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: medId, action: "REFILL", refillAmount: amount }),
      });
      if (profile) await fetchMedications(profile.id);
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddAppointment = async (apptData: Partial<AppointmentData>) => {
    if (!profile) return;
    try {
      await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...apptData, profileId: profile.id }),
      });
      await fetchAppointments(profile.id);
    } catch (e) {
      console.error(e);
    }
  };

  const handleLogVital = async (vitalData: Partial<VitalLogData>) => {
    if (!profile) return;
    try {
      await fetch("/api/routines", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "LOG_VITAL",
          profileId: profile.id,
          ...vitalData,
        }),
      });
      await fetchRoutinesAndVitals(profile.id);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSendLoveNote = async (noteData: {
    senderName: string;
    senderRole: string;
    message: string;
    mediaEmoji: string;
  }) => {
    if (!profile) return;
    try {
      await fetch("/api/care-circle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "SEND_NOTE",
          profileId: profile.id,
          ...noteData,
        }),
      });
      await fetchCareCircle(profile.id);
    } catch (e) {
      console.error(e);
    }
  };

  const handleTriggerSOS = async () => {
    if (!profile) return;
    try {
      const res = await fetch("/api/care-circle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "EMERGENCY_SOS",
          profileId: profile.id,
        }),
      });
      await fetchNotifications(profile.id);
      return await res.json();
    } catch (e) {
      console.error(e);
    }
  };

  const handleTriggerTestEmail = async (type: string, email?: string, name?: string) => {
    if (!profile) return;
    try {
      const res = await fetch("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profileId: profile.id,
          type,
          recipientEmail: email,
          recipientName: name,
        }),
      });
      return await res.json();
    } catch (e) {
      console.error(e);
    }
  };

  const handleRunScheduler = async () => {
    try {
      const res = await fetch("/api/scheduler", { method: "POST" });
      const data = await res.json();
      if (profile) {
        await Promise.all([fetchDoses(profile.id), fetchNotifications(profile.id)]);
      }
      return data;
    } catch (e) {
      console.error(e);
    }
  };

  const handleRoleAuthenticated = (role: UserRole) => {
    setActiveRole(role);
    if (role === "SENIOR") setActiveTab("SENIOR");
    else if (role === "CARETAKER") setActiveTab("CARETAKER");
    else if (role === "FAMILY") setActiveTab("FAMILY");
  };

  const fontClass =
    fontSizeMode === "extra-large"
      ? "font-mode-extra-large"
      : fontSizeMode === "large"
      ? "font-mode-large"
      : "";

  if (loading && !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-bold text-slate-700">Loading CareRing Healthcare Platform...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${highContrast ? "high-contrast" : ""} ${fontClass}`}>
      {/* Top Universal Header */}
      <Header
        profile={profile}
        allProfiles={allProfiles}
        onSelectProfile={handleSelectProfile}
        activeRole={activeRole}
        onOpenPasscodeModal={() => setIsPasscodeModalOpen(true)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        highContrast={highContrast}
        setHighContrast={setHighContrast}
        fontSizeMode={fontSizeMode}
        setFontSizeMode={setFontSizeMode}
        voiceEnabled={voiceEnabled}
        setVoiceEnabled={setVoiceEnabled}
        onTriggerSOS={() => setIsEmergencyModalOpen(true)}
        onOpenIceCard={() => setIsIceModalOpen(true)}
      />

      {/* Main View Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === "SENIOR" && (
          <SeniorView
            profile={profile}
            doses={doses}
            routines={routines}
            loveNotes={loveNotes}
            onTakeDose={handleTakeDose}
            onSnoozeDose={handleSnoozeDose}
            onToggleRoutine={handleToggleRoutine}
            onTriggerSOS={() => setIsEmergencyModalOpen(true)}
            voiceEnabled={voiceEnabled}
          />
        )}

        {activeTab === "CARETAKER" && (
          <CaretakerView
            profile={profile}
            medications={medications}
            appointments={appointments}
            doses={doses}
            routines={routines}
            vitals={vitals}
            onRefreshData={async () => {
              if (profile) {
                await Promise.all([
                  fetchMedications(profile.id),
                  fetchDoses(profile.id),
                  fetchAppointments(profile.id),
                  fetchRoutinesAndVitals(profile.id),
                ]);
              }
            }}
            onAddMedication={handleAddMedication}
            onRefillMedication={handleRefillMedication}
            onAddAppointment={handleAddAppointment}
            onLogVital={handleLogVital}
            onUpdateDoseStatus={handleUpdateDoseStatus}
          />
        )}

        {activeTab === "FAMILY" && (
          <FamilyView
            profile={profile}
            doses={doses}
            appointments={appointments}
            careCircle={careCircle}
            loveNotes={loveNotes}
            medications={medications}
            vitals={vitals}
            onSendLoveNote={handleSendLoveNote}
            onTriggerSOS={() => setIsEmergencyModalOpen(true)}
          />
        )}

        {activeTab === "NOTIFICATIONS" && (
          <NotificationView
            profile={profile}
            notifications={notifications}
            careCircle={careCircle}
            onRefreshNotifications={async () => {
              if (profile) await fetchNotifications(profile.id);
            }}
            onTriggerTestEmail={handleTriggerTestEmail}
            onRunScheduler={handleRunScheduler}
          />
        )}
      </main>

      {/* Role Passcode Switcher Modal */}
      <PasscodeModal
        isOpen={isPasscodeModalOpen}
        onClose={() => setIsPasscodeModalOpen(false)}
        profile={profile}
        onAuthenticated={handleRoleAuthenticated}
      />

      {/* Emergency SOS Modal */}
      <EmergencyModal
        isOpen={isEmergencyModalOpen}
        onClose={() => setIsEmergencyModalOpen(false)}
        profile={profile}
        onConfirmSOS={handleTriggerSOS}
      />

      {/* Emergency ICE Medical Card Modal */}
      <IceMedicalCardModal
        isOpen={isIceModalOpen}
        onClose={() => setIsIceModalOpen(false)}
        profile={profile}
        medications={medications}
      />
    </div>
  );
}
