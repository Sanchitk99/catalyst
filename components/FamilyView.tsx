"use client";

import React, { useState } from "react";
import {
  Heart,
  Calendar,
  Send,
  CheckCircle2,
  Clock,
  Phone,
  Shield,
  Activity,
  AlertTriangle,
  Mail,
  Users,
  Sparkles,
} from "lucide-react";
import {
  ProfileData,
  DoseScheduleData,
  AppointmentData,
  CareCircleMemberData,
  LoveNoteData,
} from "@/types";
import { formatTime } from "@/lib/utils";

interface FamilyViewProps {
  profile: ProfileData | null;
  doses: DoseScheduleData[];
  appointments: AppointmentData[];
  careCircle: CareCircleMemberData[];
  loveNotes: LoveNoteData[];
  onSendLoveNote: (noteData: {
    senderName: string;
    senderRole: string;
    message: string;
    mediaEmoji: string;
  }) => Promise<void>;
  onTriggerSOS: () => void;
}

export default function FamilyView({
  profile,
  doses,
  appointments,
  careCircle,
  loveNotes,
  onSendLoveNote,
  onTriggerSOS,
}: FamilyViewProps) {
  const [senderName, setSenderName] = useState("Marcus Vance (Son)");
  const [noteMessage, setNoteMessage] = useState("");
  const [selectedEmoji, setSelectedEmoji] = useState("❤️");
  const [sendingNote, setSendingNote] = useState(false);
  const [noteSuccess, setNoteSuccess] = useState(false);

  const totalDoses = doses.length;
  const takenDoses = doses.filter((d) => d.status === "TAKEN").length;
  const missedDoses = doses.filter((d) => d.status === "MISSED").length;
  const pendingDoses = doses.filter((d) => d.status === "PENDING" || d.status === "SNOOZED").length;
  const adherenceRate = totalDoses > 0 ? Math.round((takenDoses / totalDoses) * 100) : 100;

  const handleNoteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteMessage.trim()) return;

    setSendingNote(true);
    try {
      await onSendLoveNote({
        senderName,
        senderRole: "FAMILY",
        message: noteMessage.trim(),
        mediaEmoji: selectedEmoji,
      });
      setNoteMessage("");
      setNoteSuccess(true);
      setTimeout(() => setNoteSuccess(false), 3000);
    } catch (e) {
      console.error(e);
    } finally {
      setSendingNote(false);
    }
  };

  const emojiOptions = ["❤️", "🌸", "⭐", "☕", "💪", "🍀", "🤗", "🌞"];

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      {/* Peace of Mind Hero Banner */}
      <div className="bg-gradient-to-r from-emerald-700 via-teal-700 to-cyan-800 text-white rounded-3xl p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-emerald-100 text-xs font-semibold backdrop-blur mb-2">
              <Users className="w-3.5 h-3.5" />
              <span>Family Peace-of-Mind Portal</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold">
              Caring Together for {profile?.preferredName || profile?.fullName}
            </h2>
            <p className="mt-1 text-emerald-100 text-sm max-w-xl">
              Stay connected, receive transparent real-time updates on daily doses, coordinate doctor appointments, and send uplifting encouragement.
            </p>
          </div>

          {/* Quick Adherence Gauge */}
          <div className="bg-white/15 backdrop-blur p-4 rounded-2xl border border-white/20 flex items-center space-x-4 min-w-[220px]">
            <div className="w-16 h-16 rounded-full border-4 border-emerald-300 flex items-center justify-center font-black text-xl text-white">
              {adherenceRate}%
            </div>
            <div>
              <p className="text-xs font-medium text-emerald-200">Today&apos;s Adherence</p>
              <h4 className="text-base font-bold text-white">
                {takenDoses} of {totalDoses} Taken
              </h4>
              <p className="text-[11px] text-emerald-200">
                {missedDoses > 0 ? `⚠️ ${missedDoses} missed dose alert` : "✓ Routine on track"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Real-time Dose Status & Send Love Note Side-by-Side */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Today's Live Care Timeline */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-emerald-600" />
                  <span>Today&apos;s Live Adherence Timeline</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Real-time status updates of medications taken or pending
                </p>
              </div>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-100">
                {pendingDoses} Pending
              </span>
            </div>

            <div className="space-y-3">
              {doses.map((dose) => (
                <div
                  key={dose.id}
                  className={`p-4 rounded-2xl border-2 transition flex items-center justify-between gap-4 ${
                    dose.status === "TAKEN"
                      ? "bg-emerald-50/50 border-emerald-200"
                      : dose.status === "MISSED"
                      ? "bg-rose-50/70 border-rose-300"
                      : "bg-slate-50 border-slate-200"
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs ${
                        dose.status === "TAKEN"
                          ? "bg-emerald-600 text-white"
                          : dose.status === "MISSED"
                          ? "bg-rose-600 text-white"
                          : "bg-slate-200 text-slate-700"
                      }`}
                    >
                      {dose.status === "TAKEN" ? "✓" : dose.status === "MISSED" ? "!" : "⏰"}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-base font-bold text-slate-900">
                          {dose.medication.name}
                        </h4>
                        <span className="text-xs font-semibold text-slate-500">
                          ({dose.medication.dosage})
                        </span>
                      </div>
                      <p className="text-xs text-slate-500">
                        Scheduled: <strong>{formatTime(dose.scheduledTime)}</strong> &bull; {dose.medication.purpose}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold ${
                        dose.status === "TAKEN"
                          ? "bg-emerald-100 text-emerald-800"
                          : dose.status === "MISSED"
                          ? "bg-rose-100 text-rose-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {dose.status}
                    </span>
                    {dose.takenAt && (
                      <p className="text-[11px] text-slate-400 mt-1 font-medium">
                        Taken at {new Date(dose.takenAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Upcoming Family Doctor Coordination */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-teal-600" />
                  <span>Doctor Appointment Coordination</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Ensure Nana is accompanied and transport is arranged
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {appointments.slice(0, 2).map((appt) => (
                <div
                  key={appt.id}
                  className="p-4 rounded-2xl border border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-base font-bold text-slate-900">{appt.doctorName}</h4>
                      <span className="text-xs font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded">
                        {appt.specialty}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1">
                      {new Date(appt.appointmentDate).toLocaleString("en-US", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}{" "}
                      &bull; {appt.clinicName}
                    </p>
                    {appt.preVisitNotes && (
                      <p className="text-xs text-amber-800 bg-amber-50 px-2 py-1 rounded mt-1.5 font-medium">
                        {appt.preVisitNotes}
                      </p>
                    )}
                  </div>

                  <div className="sm:text-right text-xs">
                    <span className="px-2.5 py-1 rounded-full font-bold bg-slate-200 text-slate-700">
                      Companion: {appt.companionName || "Needs volunteer"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Col: Send Love Note & Emergency Medical Profile */}
        <div className="space-y-6">
          {/* Send Love Note Card */}
          <div className="bg-gradient-to-b from-rose-50/80 to-amber-50/80 rounded-3xl p-6 border border-rose-200/80 shadow-sm">
            <div className="flex items-center space-x-2 mb-3">
              <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
              <h3 className="text-lg font-bold text-slate-900">Send a Note of Love</h3>
            </div>
            <p className="text-xs text-slate-600 mb-4">
              Your message will pop up directly on Eleanor&apos;s screen with warm encouragement when she takes her daily medications.
            </p>

            <form onSubmit={handleNoteSubmit} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700">From:</label>
                <select
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  className="w-full mt-1 p-2 rounded-xl border border-rose-200 bg-white text-xs font-semibold"
                >
                  <option>Marcus Vance (Son)</option>
                  <option>Chloe Vance (Granddaughter)</option>
                  <option>Elena Gomez, RN (Caretaker)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700">Choose Warm Emoji:</label>
                <div className="flex items-center gap-1.5 mt-1">
                  {emojiOptions.map((em) => (
                    <button
                      key={em}
                      type="button"
                      onClick={() => setSelectedEmoji(em)}
                      className={`text-lg p-1.5 rounded-xl transition ${
                        selectedEmoji === em
                          ? "bg-rose-500 text-white scale-110 shadow-sm"
                          : "bg-white hover:bg-rose-100"
                      }`}
                    >
                      {em}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700">Your Message:</label>
                <textarea
                  required
                  rows={3}
                  value={noteMessage}
                  onChange={(e) => setNoteMessage(e.target.value)}
                  placeholder="e.g. Thinking of you Mom! Enjoy your tea and afternoon walk ❤️"
                  className="w-full mt-1 p-2.5 rounded-xl border border-rose-200 bg-white text-xs focus:outline-none focus:ring-2 focus:ring-rose-400"
                />
              </div>

              <button
                type="submit"
                disabled={sendingNote || !noteMessage.trim()}
                className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-bold text-xs shadow-md shadow-rose-600/30 transition flex items-center justify-center gap-1.5"
              >
                <Send className="w-4 h-4" />
                <span>{sendingNote ? "Sending..." : "Post Message to Nana"}</span>
              </button>

              {noteSuccess && (
                <p className="text-xs text-emerald-700 font-bold text-center mt-2 flex items-center justify-center gap-1">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Message delivered to Eleanor&apos;s screen!</span>
                </p>
              )}
            </form>
          </div>

          {/* Emergency Quick Medical Card */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm text-xs space-y-3">
            <div className="flex items-center space-x-2 pb-2 border-b border-slate-100">
              <Shield className="w-5 h-5 text-blue-600" />
              <h4 className="text-sm font-bold text-slate-900">
                Emergency &amp; Medical Quick Card
              </h4>
            </div>

            <div>
              <span className="text-slate-400 font-medium">Primary Geriatrician:</span>
              <p className="font-bold text-slate-900 text-sm">
                {profile?.primaryDoctor || "Dr. Arthur Campbell, MD"}
              </p>
              <p className="text-blue-700 font-semibold">{profile?.doctorPhone}</p>
            </div>

            <div>
              <span className="text-slate-400 font-medium">Preferred Hospital:</span>
              <p className="font-bold text-slate-800">
                {profile?.hospitalPreference || "St. Jude Metropolitan Medical Center"}
              </p>
            </div>

            <div>
              <span className="text-slate-400 font-medium">Known Allergies:</span>
              <p className="font-bold text-rose-700 bg-rose-50 p-2 rounded-lg border border-rose-200 mt-1">
                {profile?.allergies || "Penicillin, Sulfa drugs"}
              </p>
            </div>

            <div className="pt-2">
              <button
                onClick={onTriggerSOS}
                className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md shadow-rose-600/20 transition flex items-center justify-center gap-1.5"
              >
                <AlertTriangle className="w-4 h-4" />
                <span>Simulate Emergency Alert Broadcast</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
