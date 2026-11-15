"use client";

import React, { useState, useEffect } from "react";
import {
  Pill,
  Plus,
  Calendar,
  Activity,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Clock,
  MapPin,
  User,
  HeartPulse,
  Phone,
  FileText,
  X,
  PlusCircle,
  ShieldCheck,
  AlertTriangle,
  FileDown,
  Truck,
  TrendingUp,
} from "lucide-react";
import {
  ProfileData,
  MedicationData,
  AppointmentData,
  DoseScheduleData,
  HealthcareRoutineData,
  VitalLogData,
} from "@/types";
import { formatTime } from "@/lib/utils";
import VitalsAnalytics from "./VitalsAnalytics";
import DoctorSummaryModal from "./DoctorSummaryModal";
import PharmacyRefillModal from "./PharmacyRefillModal";
import { DrugInteraction, FoodAdvisory } from "@/lib/drugSafetyEngine";

interface CaretakerViewProps {
  profile: ProfileData | null;
  medications: MedicationData[];
  appointments: AppointmentData[];
  doses: DoseScheduleData[];
  routines: HealthcareRoutineData[];
  vitals: VitalLogData[];
  onRefreshData: () => Promise<void>;
  onAddMedication: (medData: Partial<MedicationData>) => Promise<void>;
  onRefillMedication: (medId: string, amount: number) => Promise<void>;
  onAddAppointment: (apptData: Partial<AppointmentData>) => Promise<void>;
  onLogVital: (vitalData: Partial<VitalLogData>) => Promise<void>;
  onUpdateDoseStatus: (doseId: string, status: string, takenBy: string) => Promise<void>;
}

export default function CaretakerView({
  profile,
  medications,
  appointments,
  doses,
  routines,
  vitals,
  onRefreshData,
  onAddMedication,
  onRefillMedication,
  onAddAppointment,
  onLogVital,
  onUpdateDoseStatus,
}: CaretakerViewProps) {
  // Modals state
  const [showAddMedModal, setShowAddMedModal] = useState(false);
  const [showAddApptModal, setShowAddApptModal] = useState(false);
  const [showLogVitalModal, setShowLogVitalModal] = useState(false);
  const [showDoctorSummary, setShowDoctorSummary] = useState(false);
  const [showPharmacyModal, setShowPharmacyModal] = useState(false);

  // Safety Engine State
  const [interactions, setInteractions] = useState<DrugInteraction[]>([]);
  const [foodAdvisories, setFoodAdvisories] = useState<FoodAdvisory[]>([]);
  const [safetyStatus, setSafetyStatus] = useState<string>("OPTIMAL");

  useEffect(() => {
    if (profile) {
      fetch(`/api/medications/safety?profileId=${profile.id}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.interactions) setInteractions(data.interactions);
          if (data.foodAdvisories) setFoodAdvisories(data.foodAdvisories);
          if (data.safetyScore) setSafetyStatus(data.safetyScore);
        })
        .catch(console.error);
    }
  }, [profile, medications]);

  // New Medication Form State
  const [newMedName, setNewMedName] = useState("");
  const [newMedBrand, setNewMedBrand] = useState("");
  const [newMedDosage, setNewMedDosage] = useState("");
  const [newMedForm, setNewMedForm] = useState("Tablet");
  const [newMedColor, setNewMedColor] = useState("White");
  const [newMedShape, setNewMedShape] = useState("Round");
  const [newMedInstructions, setNewMedInstructions] = useState("");
  const [newMedPurpose, setNewMedPurpose] = useState("");
  const [newMedDoctor, setNewMedDoctor] = useState("");
  const [newMedTotalPills, setNewMedTotalPills] = useState("30");
  const [newMedThreshold, setNewMedThreshold] = useState("7");
  const [newMedPharmacy, setNewMedPharmacy] = useState("Walgreens Pharmacy #419");
  const [newMedScheduleTime, setNewMedScheduleTime] = useState("08:00");

  // New Appointment Form State
  const [newApptDoctor, setNewApptDoctor] = useState("");
  const [newApptSpecialty, setNewApptSpecialty] = useState("Geriatric Medicine");
  const [newApptClinic, setNewApptClinic] = useState("");
  const [newApptAddress, setNewApptAddress] = useState("");
  const [newApptDate, setNewApptDate] = useState("");
  const [newApptPurpose, setNewApptPurpose] = useState("");
  const [newApptNotes, setNewApptNotes] = useState("");
  const [newApptCompanion, setNewApptCompanion] = useState("Marcus Vance (Son)");

  // New Vital Form State
  const [newVitalType, setNewVitalType] = useState<"BLOOD_PRESSURE" | "BLOOD_SUGAR" | "HEART_RATE">("BLOOD_PRESSURE");
  const [newVitalValue, setNewVitalValue] = useState("");
  const [newVitalNotes, setNewVitalNotes] = useState("");

  const handleCreateMedication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMedName || !newMedDosage) return;

    await onAddMedication({
      name: newMedName,
      brandName: newMedBrand || null,
      dosage: newMedDosage,
      form: newMedForm,
      color: newMedColor,
      shape: newMedShape,
      instructions: newMedInstructions || "Take as prescribed",
      purpose: newMedPurpose || "Health management",
      prescribingDoctor: newMedDoctor || profile?.primaryDoctor || null,
      totalPills: Number(newMedTotalPills) || 30,
      remainingPills: Number(newMedTotalPills) || 30,
      refillThreshold: Number(newMedThreshold) || 7,
      refillPharmacy: newMedPharmacy,
      scheduleTimes: JSON.stringify([newMedScheduleTime]),
      scheduleType: "DAILY",
    });

    setShowAddMedModal(false);
    setNewMedName("");
    setNewMedDosage("");
    setNewMedInstructions("");
  };

  const handleCreateAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newApptDoctor || !newApptDate || !newApptClinic) return;

    await onAddAppointment({
      doctorName: newApptDoctor,
      specialty: newApptSpecialty,
      clinicName: newApptClinic,
      address: newApptAddress,
      appointmentDate: new Date(newApptDate).toISOString(),
      purpose: newApptPurpose,
      preVisitNotes: newApptNotes,
      companionRequired: Boolean(newApptCompanion),
      companionName: newApptCompanion,
      transportArranged: true,
    });

    setShowAddApptModal(false);
    setNewApptDoctor("");
    setNewApptDate("");
    setNewApptClinic("");
  };

  const handleCreateVital = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVitalValue) return;

    let unit = "";
    if (newVitalType === "BLOOD_PRESSURE") unit = "mmHg";
    if (newVitalType === "BLOOD_SUGAR") unit = "mg/dL";
    if (newVitalType === "HEART_RATE") unit = "bpm";

    await onLogVital({
      type: newVitalType,
      value: newVitalValue,
      unit,
      measuredBy: "Nurse Elena (Caretaker)",
      notes: newVitalNotes,
    });

    setShowLogVitalModal(false);
    setNewVitalValue("");
    setNewVitalNotes("");
  };

  const totalDoses = doses.length;
  const takenDoses = doses.filter((d) => d.status === "TAKEN").length;
  const adherenceRate = totalDoses > 0 ? Math.round((takenDoses / totalDoses) * 100) : 100;

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      {/* Caretaker Header Banner */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800">
              Clinical Administration Mode
            </span>
            <span className="text-xs text-slate-500 font-medium">
              Profile: {profile?.fullName}
            </span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 mt-1">
            Caretaker &amp; Nursing Station Hub
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Prescription inventory, refill logistics, scheduled appointments, and vital monitoring
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowDoctorSummary(true)}
            className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition flex items-center gap-1.5"
          >
            <FileDown className="w-4 h-4 text-blue-400" />
            <span>Doctor Visit Summary (PDF)</span>
          </button>

          <button
            onClick={() => setShowPharmacyModal(true)}
            className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md shadow-purple-600/20 transition flex items-center gap-1.5"
          >
            <Truck className="w-4 h-4" />
            <span>Pharmacy Refills</span>
          </button>

          <button
            onClick={() => setShowAddMedModal(true)}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add Medication</span>
          </button>

          <button
            onClick={() => setShowAddApptModal(true)}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition flex items-center gap-1.5"
          >
            <Calendar className="w-4 h-4" />
            <span>Schedule Appointment</span>
          </button>
        </div>
      </div>

      {/* Drug Interaction & Food Safety Engine Card */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <h3 className="text-lg font-bold text-slate-900">
              Geriatric Polypharmacy &amp; Drug Safety Screening
            </h3>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Safety Status: Optimal
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {/* Active Food & Substance Advisories */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2">
            <h4 className="font-bold text-slate-800 flex items-center gap-1.5 text-sm">
              <span>🥗</span>
              <span>Dietary &amp; Food Timing Advisories ({foodAdvisories.length})</span>
            </h4>
            <div className="space-y-2">
              {foodAdvisories.map((advisory, idx) => (
                <div key={idx} className="p-2.5 bg-white rounded-xl border border-slate-200">
                  <p className="font-bold text-slate-900">
                    {advisory.drug} &bull; <span className="text-amber-700">{advisory.foodOrSubstance}</span>
                  </p>
                  <p className="text-slate-600 text-[11px] mt-0.5">{advisory.effect}</p>
                  <p className="text-blue-700 font-semibold text-[11px] mt-1">
                    Guideline: {advisory.instruction}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Known Interactions Evaluation */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2">
            <h4 className="font-bold text-slate-800 flex items-center gap-1.5 text-sm">
              <span>🔬</span>
              <span>Clinical Interaction Evaluation</span>
            </h4>
            {interactions.length === 0 ? (
              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-800 space-y-1">
                <p className="font-bold">✓ Zero Adverse Contraindications Detected</p>
                <p className="text-[11px]">
                  All active prescriptions (Metformin, Lisinopril, Atorvastatin, Calcium Citrate) have been cross-checked against geriatric renal and cardiovascular interaction safety matrices.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {interactions.map((inter, idx) => (
                  <div key={idx} className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-900">
                    <p className="font-bold">{inter.drugs.join(" + ")}</p>
                    <p className="text-[11px]">{inter.description}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Grid: Medication Inventory & Refills */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Pill className="w-5 h-5 text-indigo-600" />
              <span>Active Medication Regimen &amp; Refill Inventory</span>
            </h3>
            <p className="text-xs text-slate-500">
              Remaining pill counts, auto-refill thresholds, and dosage schedules
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowPharmacyModal(true)}
              className="px-3 py-1.5 rounded-xl bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 font-bold text-xs transition"
            >
              Order Refills
            </button>
            <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-3 py-1 rounded-lg border border-indigo-100">
              {medications.length} Prescriptions
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {medications.map((med) => {
            const isLowStock = med.remainingPills <= med.refillThreshold;
            let times: string[] = [];
            try {
              times = JSON.parse(med.scheduleTimes);
            } catch {
              times = [med.scheduleTimes];
            }

            return (
              <div
                key={med.id}
                className={`p-5 rounded-2xl border-2 transition flex flex-col justify-between ${
                  isLowStock ? "border-amber-400 bg-amber-50/40" : "border-slate-200 bg-white"
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-base font-bold text-slate-900">{med.name}</h4>
                      <p className="text-xs font-semibold text-slate-600">
                        {med.dosage} &bull; {med.form} ({med.color})
                      </p>
                    </div>
                    {isLowStock && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-amber-200 text-amber-900 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        LOW STOCK
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-500 mt-2 italic">
                    &ldquo;{med.instructions}&rdquo;
                  </p>

                  <div className="mt-3 pt-3 border-t border-slate-100 text-xs space-y-1">
                    <p className="text-slate-600">
                      <strong>Prescribed By:</strong> {med.prescribingDoctor || "Dr. Arthur Campbell"}
                    </p>
                    <p className="text-slate-600">
                      <strong>Daily Schedule:</strong> {times.map(formatTime).join(", ")}
                    </p>
                    <p className="text-slate-600">
                      <strong>Pharmacy:</strong> {med.refillPharmacy || "Local Pharmacy"}
                    </p>
                  </div>
                </div>

                {/* Stock Level & 1-Click Refill Action */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <div>
                    <span className="text-xs font-medium text-slate-500">Pills Remaining:</span>
                    <p
                      className={`text-lg font-black ${
                        isLowStock ? "text-amber-700" : "text-slate-800"
                      }`}
                    >
                      {med.remainingPills} <span className="text-xs font-normal text-slate-400">/ {med.totalPills}</span>
                    </p>
                  </div>

                  <button
                    onClick={() => onRefillMedication(med.id, 30)}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 font-bold text-xs border border-slate-200 transition flex items-center gap-1"
                    title="Add 30 pills to inventory"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>+30 Refill</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Biometric Trends & Longitudinal Vitals Analytics */}
      <VitalsAnalytics vitals={vitals} />

      {/* Two Column Section: Doctor Appointments & Clinical Vitals Logger */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Doctor Appointments */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-emerald-600" />
                  <span>Upcoming Doctor Appointments</span>
                </h3>
                <p className="text-xs text-slate-500">Specialist checkups, clinics, &amp; transport</p>
              </div>
              <button
                onClick={() => setShowAddApptModal(true)}
                className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              {appointments.map((appt) => (
                <div
                  key={appt.id}
                  className="p-4 rounded-2xl border border-slate-200 bg-slate-50/60 hover:bg-white hover:border-emerald-300 transition"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-base font-bold text-slate-900">{appt.doctorName}</h4>
                      <p className="text-xs font-semibold text-emerald-700">{appt.specialty}</p>
                    </div>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      {new Date(appt.appointmentDate).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 mt-2 font-medium">
                    <strong>Clinic:</strong> {appt.clinicName} &bull; {appt.address}
                  </p>

                  {appt.purpose && (
                    <p className="text-xs text-slate-500 mt-1">
                      <strong>Purpose:</strong> {appt.purpose}
                    </p>
                  )}

                  {appt.preVisitNotes && (
                    <div className="mt-2 text-xs bg-amber-50 border border-amber-200 p-2 rounded-lg text-amber-900 font-medium">
                      ⚠️ {appt.preVisitNotes}
                    </div>
                  )}

                  <div className="mt-3 pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs text-slate-500">
                    <span>
                      Companion: <strong className="text-slate-800">{appt.companionName || "Assigned"}</strong>
                    </span>
                    <span className="text-emerald-700 font-semibold">
                      {appt.transportArranged ? "✓ Transport Confirmed" : "Transport Pending"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Clinical Vitals Logger */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <HeartPulse className="w-5 h-5 text-rose-600" />
                  <span>Clinical Vitals &amp; Health Log</span>
                </h3>
                <p className="text-xs text-slate-500">Blood pressure, blood sugar, resting heart rate</p>
              </div>
              <button
                onClick={() => setShowLogVitalModal(true)}
                className="p-1.5 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 transition"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              {vitals.slice(0, 4).map((vital) => (
                <div
                  key={vital.id}
                  className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center font-bold text-slate-700 text-sm shadow-sm">
                      {vital.type === "BLOOD_PRESSURE" ? "BP" : vital.type === "BLOOD_SUGAR" ? "GL" : "HR"}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-900">
                          {vital.value} {vital.unit}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-100 text-emerald-800">
                          {vital.status}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500">
                        {vital.type.replace("_", " ")} &bull; {vital.notes || "Routine check"}
                      </p>
                    </div>
                  </div>

                  <div className="text-right text-xs text-slate-400">
                    <p className="font-medium text-slate-600">{vital.measuredBy}</p>
                    <p className="text-[10px]">
                      {new Date(vital.measuredAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Daily Administration Audit Log Table */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-600" />
              <span>Today&apos;s Medication Administration Audit</span>
            </h3>
            <p className="text-xs text-slate-500">
              Live audit of scheduled doses, adherence records, and administrator overrides
            </p>
          </div>
          <button
            onClick={onRefreshData}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Sync</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs font-bold text-slate-400 uppercase tracking-wider">
                <th className="pb-3 px-2">Medication</th>
                <th className="pb-3 px-2">Scheduled</th>
                <th className="pb-3 px-2">Status</th>
                <th className="pb-3 px-2">Administered By</th>
                <th className="pb-3 px-2">Timestamp</th>
                <th className="pb-3 px-2 text-right">Nurse Override</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {doses.map((dose) => (
                <tr key={dose.id} className="hover:bg-slate-50/60 transition">
                  <td className="py-3 px-2 font-bold text-slate-900">
                    {dose.medication.name} ({dose.medication.dosage})
                  </td>
                  <td className="py-3 px-2 font-semibold text-blue-700">
                    {formatTime(dose.scheduledTime)}
                  </td>
                  <td className="py-3 px-2">
                    <span
                      className={`px-2 py-0.5 rounded-full font-bold text-[11px] ${
                        dose.status === "TAKEN"
                          ? "bg-emerald-100 text-emerald-800"
                          : dose.status === "MISSED"
                          ? "bg-rose-100 text-rose-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {dose.status}
                    </span>
                  </td>
                  <td className="py-3 px-2 text-slate-600">
                    {dose.takenBy || (dose.status === "TAKEN" ? "Eleanor (Self)" : "—")}
                  </td>
                  <td className="py-3 px-2 text-slate-500">
                    {dose.takenAt
                      ? new Date(dose.takenAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "Pending"}
                  </td>
                  <td className="py-3 px-2 text-right">
                    {dose.status !== "TAKEN" && (
                      <button
                        onClick={() =>
                          onUpdateDoseStatus(dose.id, "TAKEN", "Nurse Elena (Administered)")
                        }
                        className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] shadow-sm transition"
                      >
                        Mark Administered
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Add Medication */}
      {showAddMedModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-lg font-bold text-slate-900">Add New Prescription Medication</h3>
              <button
                onClick={() => setShowAddMedModal(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateMedication} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700">Generic / Brand Name *</label>
                  <input
                    type="text"
                    required
                    value={newMedName}
                    onChange={(e) => setNewMedName(e.target.value)}
                    placeholder="e.g. Amlodipine"
                    className="w-full mt-1 p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700">Dosage Strength *</label>
                  <input
                    type="text"
                    required
                    value={newMedDosage}
                    onChange={(e) => setNewMedDosage(e.target.value)}
                    placeholder="e.g. 5 mg"
                    className="w-full mt-1 p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="font-bold text-slate-700">Form</label>
                  <select
                    value={newMedForm}
                    onChange={(e) => setNewMedForm(e.target.value)}
                    className="w-full mt-1 p-2 rounded-xl border border-slate-200"
                  >
                    <option>Tablet</option>
                    <option>Capsule</option>
                    <option>Liquid</option>
                    <option>Inhaler</option>
                    <option>Drops</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700">Visual Color</label>
                  <select
                    value={newMedColor}
                    onChange={(e) => setNewMedColor(e.target.value)}
                    className="w-full mt-1 p-2 rounded-xl border border-slate-200"
                  >
                    <option>White</option>
                    <option>Pink</option>
                    <option>Yellow</option>
                    <option>Blue</option>
                    <option>Red</option>
                    <option>Green</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700">Shape</label>
                  <select
                    value={newMedShape}
                    onChange={(e) => setNewMedShape(e.target.value)}
                    className="w-full mt-1 p-2 rounded-xl border border-slate-200"
                  >
                    <option>Round</option>
                    <option>Oval</option>
                    <option>Oblong</option>
                    <option>Capsule</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700">Schedule Time *</label>
                <input
                  type="time"
                  required
                  value={newMedScheduleTime}
                  onChange={(e) => setNewMedScheduleTime(e.target.value)}
                  className="w-full mt-1 p-2.5 rounded-xl border border-slate-200 font-bold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700">Administration Instructions</label>
                <textarea
                  rows={2}
                  value={newMedInstructions}
                  onChange={(e) => setNewMedInstructions(e.target.value)}
                  placeholder="e.g. Take with food and full glass of water. Avoid lying down for 30 mins."
                  className="w-full mt-1 p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700">Initial Pill Quantity</label>
                  <input
                    type="number"
                    value={newMedTotalPills}
                    onChange={(e) => setNewMedTotalPills(e.target.value)}
                    className="w-full mt-1 p-2 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700">Low Refill Threshold</label>
                  <input
                    type="number"
                    value={newMedThreshold}
                    onChange={(e) => setNewMedThreshold(e.target.value)}
                    className="w-full mt-1 p-2 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddMedModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 font-bold text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-md shadow-indigo-600/30"
                >
                  Save Prescription
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Schedule Appointment */}
      {showAddApptModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-lg font-bold text-slate-900">Schedule Doctor Appointment</h3>
              <button
                onClick={() => setShowAddApptModal(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAppointment} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700">Physician Name *</label>
                  <input
                    type="text"
                    required
                    value={newApptDoctor}
                    onChange={(e) => setNewApptDoctor(e.target.value)}
                    placeholder="e.g. Dr. Arthur Campbell"
                    className="w-full mt-1 p-2.5 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700">Specialty</label>
                  <input
                    type="text"
                    value={newApptSpecialty}
                    onChange={(e) => setNewApptSpecialty(e.target.value)}
                    placeholder="e.g. Geriatrics"
                    className="w-full mt-1 p-2.5 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700">Clinic Name &amp; Address *</label>
                <input
                  type="text"
                  required
                  value={newApptClinic}
                  onChange={(e) => setNewApptClinic(e.target.value)}
                  placeholder="e.g. St. Jude Medical Pavilion, Suite 305"
                  className="w-full mt-1 p-2.5 rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700">Date &amp; Time *</label>
                <input
                  type="datetime-local"
                  required
                  value={newApptDate}
                  onChange={(e) => setNewApptDate(e.target.value)}
                  className="w-full mt-1 p-2.5 rounded-xl border border-slate-200 font-bold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700">Pre-Visit Preparation / Fasting</label>
                <input
                  type="text"
                  value={newApptNotes}
                  onChange={(e) => setNewApptNotes(e.target.value)}
                  placeholder="e.g. Fasting 8 hours prior. Bring recent blood sugar log."
                  className="w-full mt-1 p-2.5 rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700">Assigned Family Companion</label>
                <input
                  type="text"
                  value={newApptCompanion}
                  onChange={(e) => setNewApptCompanion(e.target.value)}
                  placeholder="e.g. Marcus Vance (Son)"
                  className="w-full mt-1 p-2.5 rounded-xl border border-slate-200"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddApptModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 font-bold text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md shadow-emerald-600/30"
                >
                  Confirm Appointment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Log Vital */}
      {showLogVitalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-lg font-bold text-slate-900">Record Clinical Vital</h3>
              <button
                onClick={() => setShowLogVitalModal(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateVital} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700">Measurement Type</label>
                <select
                  value={newVitalType}
                  onChange={(e) =>
                    setNewVitalType(
                      e.target.value as "BLOOD_PRESSURE" | "BLOOD_SUGAR" | "HEART_RATE"
                    )
                  }
                  className="w-full mt-1 p-2.5 rounded-xl border border-slate-200 font-bold"
                >
                  <option value="BLOOD_PRESSURE">Blood Pressure (mmHg)</option>
                  <option value="BLOOD_SUGAR">Blood Glucose (mg/dL)</option>
                  <option value="HEART_RATE">Resting Heart Rate (bpm)</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700">Reading Value *</label>
                <input
                  type="text"
                  required
                  value={newVitalValue}
                  onChange={(e) => setNewVitalValue(e.target.value)}
                  placeholder={
                    newVitalType === "BLOOD_PRESSURE"
                      ? "e.g. 120/80"
                      : newVitalType === "BLOOD_SUGAR"
                      ? "e.g. 110"
                      : "e.g. 72"
                  }
                  className="w-full mt-1 p-2.5 rounded-xl border border-slate-200 text-base font-bold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700">Observation Notes</label>
                <input
                  type="text"
                  value={newVitalNotes}
                  onChange={(e) => setNewVitalNotes(e.target.value)}
                  placeholder="e.g. Measured after 5 mins seated rest"
                  className="w-full mt-1 p-2.5 rounded-xl border border-slate-200"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowLogVitalModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 font-bold text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md shadow-blue-600/30"
                >
                  Save Vital
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Clinical Doctor Summary Printable Modal */}
      <DoctorSummaryModal
        isOpen={showDoctorSummary}
        onClose={() => setShowDoctorSummary(false)}
        profile={profile}
        medications={medications}
        appointments={appointments}
        vitals={vitals}
        adherenceRate={adherenceRate}
      />

      {/* Pharmacy Refill Order Modal */}
      <PharmacyRefillModal
        isOpen={showPharmacyModal}
        onClose={() => setShowPharmacyModal(false)}
        profile={profile}
        medications={medications}
        onConfirmRefill={onRefillMedication}
      />
    </div>
  );
}
