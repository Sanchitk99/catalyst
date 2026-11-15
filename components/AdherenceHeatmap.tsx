"use client";

import React, { useState, useEffect } from "react";
import { Calendar, Flame, CheckCircle2, AlertTriangle, Clock, TrendingUp, Filter } from "lucide-react";
import { DoseScheduleData } from "@/types";

interface AdherenceHeatmapProps {
  profileId: string;
}

interface DaySummary {
  date: string;
  dayName: string;
  dayNumber: string;
  total: number;
  taken: number;
  missed: number;
  pending: number;
  rate: number;
  doses: DoseScheduleData[];
}

export default function AdherenceHeatmap({ profileId }: AdherenceHeatmapProps) {
  const [history, setHistory] = useState<DoseScheduleData[]>([]);
  const [selectedDay, setSelectedDay] = useState<DaySummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profileId) return;
    setLoading(true);
    fetch(`/api/doses?profileId=${profileId}&range=14d`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setHistory(data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [profileId]);

  // Group historical doses into daily buckets
  const daysMap = new Map<string, DoseScheduleData[]>();
  for (const dose of history) {
    const list = daysMap.get(dose.scheduledDate) || [];
    list.push(dose);
    daysMap.set(dose.scheduledDate, list);
  }

  // Generate continuous last 14 days
  const daySummaries: DaySummary[] = [];
  const today = new Date();

  for (let i = 13; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    const dayDoses = daysMap.get(dateStr) || [];

    const total = dayDoses.length;
    const taken = dayDoses.filter((dose) => dose.status === "TAKEN").length;
    const missed = dayDoses.filter((dose) => dose.status === "MISSED").length;
    const pending = dayDoses.filter((dose) => dose.status === "PENDING" || dose.status === "SNOOZED").length;
    const rate = total > 0 ? Math.round((taken / total) * 100) : 100;

    daySummaries.push({
      date: dateStr,
      dayName: d.toLocaleDateString("en-US", { weekday: "short" }),
      dayNumber: d.toLocaleDateString("en-US", { month: "numeric", day: "numeric" }),
      total,
      taken,
      missed,
      pending,
      rate,
      doses: dayDoses,
    });
  }

  // Calculate Streak: consecutive days where rate >= 80%
  let streak = 0;
  for (let i = daySummaries.length - 2; i >= 0; i--) {
    if (daySummaries[i].rate >= 75) streak++;
    else break;
  }
  // Check if today is on track
  const todaySummary = daySummaries[daySummaries.length - 1];
  if (todaySummary && (todaySummary.rate >= 50 || todaySummary.pending > 0)) {
    streak += 1;
  }

  const overallRate =
    daySummaries.reduce((sum, d) => sum + d.taken, 0) /
    Math.max(1, daySummaries.reduce((sum, d) => sum + d.total, 0));
  const overallRatePercent = Math.round(overallRate * 100);

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-emerald-600" />
            <h3 className="text-lg font-bold text-slate-900">
              14-Day Longitudinal Adherence Heatmap &amp; Pillbox Matrix
            </h3>
          </div>
          <p className="text-xs text-slate-500">
            Day-by-day compliance patterns, streaks, and dosage completion consistency
          </p>
        </div>

        {/* Streak Counter Pill */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 font-bold text-xs shadow-sm">
            <Flame className="w-4 h-4 text-orange-500 fill-orange-500 animate-bounce" />
            <span>{streak}-Day Active Streak!</span>
          </div>

          <div className="px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 font-bold text-xs">
            {overallRatePercent}% 14-Day Average
          </div>
        </div>
      </div>

      {/* Heatmap Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
          <span>Click any date tile to inspect detailed dosage records</span>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-md bg-emerald-500 inline-block" />
              <span>100% Taken</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-md bg-amber-400 inline-block" />
              <span>Partial / Pending</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-md bg-rose-500 inline-block" />
              <span>Missed Dose</span>
            </span>
          </div>
        </div>

        {/* 14 Days Row */}
        <div className="grid grid-cols-7 sm:grid-cols-14 gap-2">
          {daySummaries.map((day, idx) => {
            const isToday = idx === daySummaries.length - 1;
            const hasMissed = day.missed > 0;
            const isPerfect = day.rate === 100 && day.total > 0;

            let tileColor = "bg-emerald-500 text-white border-emerald-600";
            if (hasMissed) tileColor = "bg-rose-500 text-white border-rose-600";
            else if (isToday) tileColor = "bg-blue-600 text-white border-blue-700 shadow-md";
            else if (day.rate < 100) tileColor = "bg-amber-400 text-slate-900 border-amber-500";

            return (
              <button
                key={day.date}
                onClick={() => setSelectedDay(day)}
                className={`p-2.5 rounded-2xl border-2 transition-all flex flex-col items-center justify-between h-20 ${tileColor} hover:scale-105 active:scale-95`}
              >
                <span className="text-[10px] font-bold uppercase tracking-wider opacity-90">
                  {day.dayName}
                </span>
                <span className="text-base font-black">
                  {day.dayNumber.split("/")[1] || day.dayNumber}
                </span>
                <span className="text-[9px] font-extrabold px-1 rounded bg-black/20">
                  {isToday ? "Today" : `${day.rate}%`}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Day Inspector Modal / Drawer */}
      {selectedDay && (
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 transition animate-in fade-in space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <div>
              <h4 className="text-sm font-bold text-slate-900">
                Dosage Record for {selectedDay.date} ({selectedDay.dayName})
              </h4>
              <p className="text-xs text-slate-500">
                {selectedDay.taken} taken, {selectedDay.missed} missed, {selectedDay.pending} pending &bull; Compliance: {selectedDay.rate}%
              </p>
            </div>
            <button
              onClick={() => setSelectedDay(null)}
              className="px-2.5 py-1 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs"
            >
              Close
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-xs">
            {selectedDay.doses.map((d) => (
              <div
                key={d.id}
                className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between"
              >
                <div>
                  <p className="font-bold text-slate-900">{d.medication?.name || "Medication"}</p>
                  <p className="text-[11px] text-blue-700 font-semibold">{d.scheduledTime}</p>
                </div>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    d.status === "TAKEN"
                      ? "bg-emerald-100 text-emerald-800"
                      : d.status === "MISSED"
                      ? "bg-rose-100 text-rose-800"
                      : "bg-amber-100 text-amber-800"
                  }`}
                >
                  {d.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
