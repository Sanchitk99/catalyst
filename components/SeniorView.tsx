"use client";

import React, { useState } from "react";
import confetti from "canvas-confetti";
import {
  CheckCircle,
  Clock,
  Volume2,
  Mic,
  MicOff,
  AlertCircle,
  Heart,
  Droplet,
  Activity,
  Footprints,
  Sparkles,
  PhoneCall,
  ShieldAlert,
  Smile,
  AlertTriangle,
  GlassWater,
} from "lucide-react";
import { ProfileData, DoseScheduleData, HealthcareRoutineData, LoveNoteData } from "@/types";
import {
  speakText,
  playSuccessChime,
  startVoiceRecognition,
  stopSpeaking,
} from "@/lib/audioHelper";
import { formatTime, getDoseCategory } from "@/lib/utils";

import AdherenceHeatmap from "./AdherenceHeatmap";

interface SeniorViewProps {
  profile: ProfileData | null;
  doses: DoseScheduleData[];
  routines: HealthcareRoutineData[];
  loveNotes: LoveNoteData[];
  onTakeDose: (doseId: string) => Promise<void>;
  onSnoozeDose?: (doseId: string, minutes: number) => Promise<void>;
  onToggleRoutine: (routineId: string, currentStatus: boolean) => Promise<void>;
  onTriggerSOS: () => void;
  voiceEnabled: boolean;
}

export default function SeniorView({
  profile,
  doses,
  routines,
  loveNotes,
  onTakeDose,
  onSnoozeDose,
  onToggleRoutine,
  onTriggerSOS,
  voiceEnabled,
}: SeniorViewProps) {
  const [takingDoseId, setTakingDoseId] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState<string | null>(null);

  const handleSnooze = async (doseId: string, minutes: number = 15) => {
    try {
      if (onSnoozeDose) {
        await onSnoozeDose(doseId, minutes);
      } else {
        await fetch("/api/doses", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: doseId, action: "SNOOZE", snoozeMinutes: minutes }),
        });
      }
      playSuccessChime();
      speakText(`Snoozed for ${minutes} minutes. We'll remind you then, Nana.`);
    } catch (e) {
      console.error(e);
    }
  };

  // Wellness State
  const [selectedMood, setSelectedMood] = useState<string>("GOOD");
  const [waterGlasses, setWaterGlasses] = useState<number>(4);
  const [wellnessFeedback, setWellnessFeedback] = useState<string | null>(null);

  const handleDoseClick = async (dose: DoseScheduleData) => {
    if (dose.status === "TAKEN") return;
    setTakingDoseId(dose.id);

    try {
      await onTakeDose(dose.id);
      playSuccessChime();

      // Confetti burst for rewarding compliance
      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.7 },
      });

      if (voiceEnabled) {
        speakText(
          `Wonderful! You have taken your ${dose.medication.name}. Great job staying on track.`
        );
      }
    } catch (e) {
      console.error(e);
    } finally {
      setTakingDoseId(null);
    }
  };

  const handleSpeakDose = (dose: DoseScheduleData) => {
    const text = `Time for ${dose.medication.name}, dosage ${dose.medication.dosage}. ${
      dose.medication.instructions || "Take with water."
    } Scheduled for ${formatTime(dose.scheduledTime)}.`;
    speakText(text);
  };

  // Toggle Two-Way Voice Recognition
  const handleToggleVoiceListener = () => {
    if (isListening) {
      setIsListening(false);
      return;
    }

    setIsListening(true);
    setVoiceTranscript("Listening... Speak now");
    speakText("I am listening. Tell me what you need, Nana.");

    startVoiceRecognition({
      onTranscript: (text) => {
        setVoiceTranscript(text);
      },
      onTakeNextDose: () => {
        const nextPending = doses.find((d) => d.status === "PENDING" || d.status === "MISSED");
        if (nextPending) {
          handleDoseClick(nextPending);
        } else {
          speakText("All medications for today have already been marked as taken! You're doing wonderful.");
        }
        setIsListening(false);
      },
      onReadSchedule: () => {
        const pending = doses.filter((d) => d.status === "PENDING");
        if (pending.length > 0) {
          const names = pending.map((p) => p.medication.name).join(", ");
          speakText(`You have ${pending.length} medications remaining today: ${names}.`);
        } else {
          speakText("All scheduled medications for today are completed!");
        }
        setIsListening(false);
      },
      onLogWater: () => {
        handleWaterGlassAdd();
        setIsListening(false);
      },
      onTriggerSOS: () => {
        onTriggerSOS();
        setIsListening(false);
      },
      onError: (err) => {
        setVoiceTranscript(`Voice error: ${err}`);
        setIsListening(false);
      },
      onEnd: () => {
        setIsListening(false);
      },
    });
  };

  const handleMoodSelect = async (mood: string) => {
    setSelectedMood(mood);
    try {
      if (profile) {
        await fetch("/api/wellness", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ profileId: profile.id, mood }),
        });
      }
      if (mood === "DIZZY" || mood === "UNWELL") {
        speakText("We have notified your care circle that you are feeling unsteady. Please sit comfortably and rest.");
        setWellnessFeedback("⚠️ Care circle notified to check in on you shortly.");
      } else {
        speakText(`Glad you are feeling ${mood.toLowerCase()}!`);
        setWellnessFeedback("✓ Mood check-in logged");
      }
      setTimeout(() => setWellnessFeedback(null), 4000);
    } catch (e) {
      console.error(e);
    }
  };

  const handleWaterGlassAdd = async () => {
    const newCount = Math.min(8, waterGlasses + 1);
    setWaterGlasses(newCount);
    playSuccessChime();
    speakText(`Water logged! You've had ${newCount} of 8 glasses today.`);

    try {
      if (profile) {
        await fetch("/api/wellness", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ profileId: profile.id, waterGlasses: newCount }),
        });
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Group doses into categories
  const categories = [
    { key: "Morning", title: "Morning Doses", timeHint: "With or after breakfast", icon: "🌅" },
    { key: "Midday / Lunch", title: "Midday Doses", timeHint: "With lunchtime meal", icon: "☀️" },
    { key: "Evening / Dinner", title: "Evening Doses", timeHint: "With dinnertime", icon: "🌇" },
    { key: "Bedtime / Night", title: "Nighttime Doses", timeHint: "Before going to sleep", icon: "🌙" },
  ];

  const pillColorStyles: Record<string, string> = {
    White: "bg-white border-2 border-slate-300 shadow-sm",
    Pink: "bg-rose-300 border-2 border-rose-400",
    Yellow: "bg-amber-300 border-2 border-amber-400",
    Blue: "bg-sky-300 border-2 border-sky-400",
    Red: "bg-red-400 border-2 border-red-500",
    Green: "bg-emerald-300 border-2 border-emerald-400",
    Orange: "bg-orange-300 border-2 border-orange-400",
  };

  const todayDateFormatted = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-16">
      {/* Warm Personal Greeting Card */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-blue-100 text-xs font-semibold backdrop-blur mb-3">
              <span>{todayDateFormatted}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Good day, {profile?.preferredName || profile?.fullName || "Eleanor"}! 🌸
            </h2>
            <p className="mt-2 text-blue-100 text-base max-w-xl">
              Here is your daily healthcare schedule. Take your time, tap any pill to mark it as taken, or use your voice to tell CareRing what you need.
            </p>
          </div>

          {/* Voice Assistant Controls */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <button
              onClick={handleToggleVoiceListener}
              className={`px-5 py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 backdrop-blur transition border shadow-lg ${
                isListening
                  ? "bg-rose-600 text-white border-rose-400 animate-pulse"
                  : "bg-white/20 hover:bg-white/30 text-white border-white/20"
              }`}
            >
              {isListening ? <MicOff className="w-5 h-5 text-yellow-300" /> : <Mic className="w-5 h-5" />}
              <span>{isListening ? "Listening... Speak" : "Talk to Care Companion"}</span>
            </button>

            <button
              onClick={() =>
                speakText(
                  `Hello ${profile?.preferredName || "Eleanor"}. Today is ${todayDateFormatted}. You have ${
                    doses.filter((d) => d.status === "PENDING").length
                  } medications remaining today. Your family Marcus and Chloe have sent you warm messages.`
                )
              }
              className="px-5 py-3.5 rounded-2xl bg-white/20 hover:bg-white/30 text-white font-bold text-sm flex items-center justify-center gap-2 backdrop-blur transition border border-white/20"
            >
              <Volume2 className="w-5 h-5" />
              <span>Read Day Aloud</span>
            </button>
          </div>
        </div>

        {voiceTranscript && (
          <div className="mt-4 p-3 rounded-2xl bg-black/30 backdrop-blur border border-white/20 text-xs font-mono text-yellow-200">
            🎙️ Voice: {voiceTranscript}
          </div>
        )}

        <div className="absolute -right-12 -bottom-12 w-64 h-64 rounded-full bg-white/5 pointer-events-none" />
      </div>

      {/* Daily Check-In & Hydration Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Mood & Well-being Check-in */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Smile className="w-5 h-5 text-amber-500" />
                <span>How Are You Feeling Today, Nana?</span>
              </h3>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Tap your current feeling so Marcus and your visiting nurse know how you are doing.
            </p>

            <div className="grid grid-cols-4 gap-2">
              {[
                { key: "GREAT", label: "Great", emoji: "😊", bg: "bg-emerald-50 border-emerald-300" },
                { key: "GOOD", label: "Good", emoji: "🙂", bg: "bg-blue-50 border-blue-300" },
                { key: "TIRED", label: "Tired", emoji: "🥱", bg: "bg-amber-50 border-amber-300" },
                { key: "DIZZY", label: "Dizzy", emoji: "😵", bg: "bg-rose-50 border-rose-300" },
              ].map((m) => (
                <button
                  key={m.key}
                  onClick={() => handleMoodSelect(m.key)}
                  className={`p-3 rounded-2xl border-2 text-center transition flex flex-col items-center justify-center gap-1 ${
                    selectedMood === m.key
                      ? "border-blue-600 bg-blue-100/70 font-bold scale-105 shadow-sm"
                      : "border-slate-200 bg-slate-50 hover:bg-slate-100"
                  }`}
                >
                  <span className="text-3xl">{m.emoji}</span>
                  <span className="text-xs font-semibold text-slate-800">{m.label}</span>
                </button>
              ))}
            </div>

            {wellnessFeedback && (
              <p className="mt-3 text-xs font-bold text-blue-700 bg-blue-50 p-2 rounded-xl border border-blue-200">
                {wellnessFeedback}
              </p>
            )}
          </div>
        </div>

        {/* Daily Hydration Tracker */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Droplet className="w-5 h-5 text-sky-500" />
                <span>Daily Hydration Goal (8 Glasses)</span>
              </h3>
              <span className="text-sm font-black text-sky-600">
                {waterGlasses} / 8 Glasses
              </span>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Proper hydration keeps circulation steady and helps medications absorb smoothly.
            </p>

            <div className="grid grid-cols-8 gap-2">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                <div
                  key={num}
                  onClick={handleWaterGlassAdd}
                  className={`h-14 rounded-2xl border-2 cursor-pointer transition flex flex-col items-center justify-center ${
                    num <= waterGlasses
                      ? "bg-sky-500 border-sky-600 text-white shadow-sm"
                      : "bg-slate-50 border-slate-200 text-slate-300 hover:border-sky-300"
                  }`}
                  title={`Glass #${num}`}
                >
                  <Droplet className="w-5 h-5 fill-current" />
                  <span className="text-[10px] font-bold mt-0.5">{num}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-500">Tap any glass to record water</span>
            <button
              onClick={handleWaterGlassAdd}
              className="px-3.5 py-1.5 rounded-xl bg-sky-100 hover:bg-sky-200 text-sky-800 font-bold text-xs transition"
            >
              +1 Glass Drank
            </button>
          </div>
        </div>
      </div>

      {/* Love Notes from Family Carousel / Grid */}
      {loveNotes && loveNotes.length > 0 && (
        <div className="bg-amber-50/70 border border-amber-200/80 rounded-3xl p-5 sm:p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
            <h3 className="text-lg font-bold text-slate-800">
              Messages of Love from Your Care Circle
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {loveNotes.slice(0, 3).map((note) => (
              <div
                key={note.id}
                className="bg-white p-4 rounded-2xl border border-amber-200/60 shadow-sm flex items-start space-x-3 transition hover:shadow-md"
              >
                <div className="text-2xl p-2 bg-amber-100/60 rounded-xl flex items-center justify-center">
                  {note.mediaEmoji || "❤️"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <p className="text-xs font-bold text-slate-900 truncate">
                      {note.senderName}
                    </p>
                    <span className="text-[10px] text-slate-400">
                      {new Date(note.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-sm text-slate-700 mt-1 font-medium italic">
                    &ldquo;{note.message}&rdquo;
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Today's Medication Schedule Blocks */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <span>💊</span>
              <span>Today&apos;s Medication Schedule</span>
            </h3>
            <p className="text-xs text-slate-500">
              Visual guide &bull; High touch accessibility &bull; One-touch confirmation
            </p>
          </div>
        </div>

        <div className="space-y-6">
          {categories.map((cat) => {
            const catDoses = doses.filter(
              (d) => getDoseCategory(d.scheduledTime).label === cat.key
            );

            if (catDoses.length === 0) return null;

            return (
              <div
                key={cat.key}
                className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm transition"
              >
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl">{cat.icon}</span>
                    <div>
                      <h4 className="text-lg font-bold text-slate-900">{cat.title}</h4>
                      <p className="text-xs text-slate-500 font-medium">{cat.timeHint}</p>
                    </div>
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
                    {catDoses.filter((d) => d.status === "TAKEN").length} of {catDoses.length} completed
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {catDoses.map((dose) => {
                    const isTaken = dose.status === "TAKEN";
                    const isMissed = dose.status === "MISSED";

                    return (
                      <div
                        key={dose.id}
                        className={`rounded-2xl p-5 border-2 transition-all flex flex-col justify-between ${
                          isTaken
                            ? "bg-emerald-50/60 border-emerald-300"
                            : isMissed
                            ? "bg-rose-50/70 border-rose-300"
                            : "bg-slate-50/70 border-slate-200 hover:border-blue-400 hover:shadow-md"
                        }`}
                      >
                        <div>
                          {/* Top row: Pill Visual & Read Aloud Speaker */}
                          <div className="flex items-center justify-between gap-3 mb-3">
                            <div className="flex items-center gap-3">
                              {/* Pill Shape Visualization */}
                              <div
                                className={`${
                                  dose.medication.shape === "Oval"
                                    ? "pill-shape-oval"
                                    : dose.medication.shape === "Round"
                                    ? "pill-shape-round"
                                    : "pill-shape-capsule"
                                } ${
                                  pillColorStyles[dose.medication.color] ||
                                  "bg-white border-2 border-slate-300"
                                } flex items-center justify-center text-[10px] font-bold text-slate-700 select-none shadow-sm`}
                                title={`${dose.medication.color} ${dose.medication.shape}`}
                              >
                                {dose.medication.color[0]}
                              </div>
                              <div>
                                <span className="text-xs font-bold text-blue-700 bg-blue-100/70 px-2 py-0.5 rounded-md">
                                  {formatTime(dose.scheduledTime)}
                                </span>
                              </div>
                            </div>

                            <button
                              onClick={() => handleSpeakDose(dose)}
                              className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-blue-600 hover:border-blue-300 shadow-sm transition"
                              title="Read instructions aloud"
                            >
                              <Volume2 className="w-4 h-4" />
                            </button>
                          </div>

                          {/* Medication Info */}
                          <h5 className="text-lg font-bold text-slate-900 leading-tight">
                            {dose.medication.name}
                          </h5>
                          <p className="text-sm font-semibold text-slate-600 mt-0.5">
                            Strength: <span className="text-slate-900">{dose.medication.dosage}</span>
                          </p>
                          <p className="text-xs text-slate-500 mt-1 italic">
                            &ldquo;{dose.medication.instructions}&rdquo;
                          </p>

                          {dose.medication.purpose && (
                            <div className="mt-2.5 inline-block text-[11px] font-medium text-slate-600 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                              For: {dose.medication.purpose}
                            </div>
                          )}
                        </div>

                        {/* Bottom Action Area */}
                        <div className="mt-5 pt-3 border-t border-slate-200/60">
                          {isTaken ? (
                            <div className="flex items-center justify-between text-emerald-800 font-bold text-sm bg-emerald-100/80 px-4 py-2.5 rounded-xl border border-emerald-200">
                              <span className="flex items-center gap-2">
                                <CheckCircle className="w-5 h-5 text-emerald-600" />
                                <span>Dose Taken</span>
                              </span>
                              <span className="text-xs font-medium text-emerald-700">
                                {dose.takenAt
                                  ? new Date(dose.takenAt).toLocaleTimeString([], {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })
                                  : "Completed"}
                              </span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleDoseClick(dose)}
                                disabled={takingDoseId === dose.id}
                                className={`flex-1 py-3.5 px-4 rounded-xl font-bold text-base shadow-md transition transform active:scale-98 flex items-center justify-center gap-2 ${
                                  isMissed
                                    ? "bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/30"
                                    : "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/30"
                                }`}
                              >
                                <CheckCircle className="w-5 h-5" />
                                <span>
                                  {isMissed ? "Take Overdue Dose" : "I Took This"}
                                </span>
                              </button>

                              <button
                                onClick={() => handleSnooze(dose.id, 15)}
                                className="px-3 py-3.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs shadow-sm transition"
                                title="Snooze reminder for 15 minutes"
                              >
                                ⏱️ 15m
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Daily Healthcare Routines Checklist */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-700">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">Daily Wellness Routines</h3>
            <p className="text-xs text-slate-500">
              Gentle habits to maintain vitality, circulation, and health
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {routines.map((routine) => (
            <div
              key={routine.id}
              onClick={() => onToggleRoutine(routine.id, routine.completedToday)}
              className={`p-4 rounded-2xl border-2 cursor-pointer transition flex items-center justify-between gap-3 ${
                routine.completedToday
                  ? "bg-emerald-50/70 border-emerald-300"
                  : "bg-slate-50 hover:bg-slate-100 border-slate-200"
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center border-2 transition ${
                    routine.completedToday
                      ? "bg-emerald-600 border-emerald-600 text-white"
                      : "border-slate-400 bg-white"
                  }`}
                >
                  {routine.completedToday && <CheckCircle className="w-5 h-5" />}
                </div>
                <div>
                  <h5 className="text-sm font-bold text-slate-900">{routine.title}</h5>
                  <p className="text-xs text-slate-500">{routine.notes}</p>
                </div>
              </div>

              {routine.targetTime && (
                <span className="text-xs font-semibold px-2 py-1 rounded bg-white border border-slate-200 text-slate-600">
                  {formatTime(routine.targetTime)}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 14-Day Adherence Heatmap & Streak Tracker */}
      {profile && <AdherenceHeatmap profileId={profile.id} />}

      {/* Emergency Assistance Footer Card */}
      <div className="bg-rose-50 border-2 border-rose-200 rounded-3xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-4 text-center sm:text-left">
          <div className="w-12 h-12 rounded-2xl bg-rose-600 text-white flex items-center justify-center shadow-lg shadow-rose-600/30">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-lg font-bold text-rose-950">Need Immediate Help?</h4>
            <p className="text-xs text-rose-800 max-w-md">
              Tap the red SOS button anytime or say &quot;Emergency&quot; to instantly alert family members, your caretaker, and emergency services.
            </p>
          </div>
        </div>

        <button
          onClick={onTriggerSOS}
          className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-sm tracking-wider shadow-lg shadow-rose-600/40 transition active:scale-95 flex items-center justify-center gap-2"
        >
          <PhoneCall className="w-5 h-5" />
          <span>ACTIVATE EMERGENCY SOS</span>
        </button>
      </div>
    </div>
  );
}
