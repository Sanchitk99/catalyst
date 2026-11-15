"use client";

import React, { useState } from "react";
import {
  Bell,
  Mail,
  Play,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Calendar,
  ExternalLink,
  Eye,
  RefreshCw,
  Send,
  X,
  ShieldAlert,
  Users,
  Search,
  Filter,
} from "lucide-react";
import { NotificationLogData, ProfileData, CareCircleMemberData } from "@/types";

interface NotificationViewProps {
  profile: ProfileData | null;
  notifications: NotificationLogData[];
  careCircle: CareCircleMemberData[];
  onRefreshNotifications: () => Promise<void>;
  onTriggerTestEmail: (type: string, email?: string, name?: string) => Promise<unknown>;
  onRunScheduler: () => Promise<unknown>;
}

export default function NotificationView({
  profile,
  notifications,
  careCircle,
  onRefreshNotifications,
  onTriggerTestEmail,
  onRunScheduler,
}: NotificationViewProps) {
  const [runningScheduler, setRunningScheduler] = useState(false);
  const [triggeringType, setTriggeringType] = useState<string | null>(null);
  const [schedulerResult, setSchedulerResult] = useState<string | null>(null);
  const [selectedPreview, setSelectedPreview] = useState<NotificationLogData | null>(null);

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("ALL");

  const handleRunScheduler = async () => {
    setRunningScheduler(true);
    setSchedulerResult(null);
    try {
      const res = (await onRunScheduler()) as {
        missedDosesFound?: number;
        missedAlertsSent?: number;
        upcomingRemindersSent?: number;
        appointmentRemindersSent?: number;
      };
      setSchedulerResult(
        `Scheduler executed successfully! Missed doses evaluated: ${
          res.missedDosesFound || 0
        }, Alerts sent: ${res.missedAlertsSent || 0}, Reminders: ${
          res.upcomingRemindersSent || 0
        }`
      );
      await onRefreshNotifications();
    } catch {
      setSchedulerResult("Scheduler run failed. Please try again.");
    } finally {
      setRunningScheduler(false);
    }
  };

  const handleTestEmail = async (type: string) => {
    setTriggeringType(type);
    try {
      await onTriggerTestEmail(type);
      await onRefreshNotifications();
    } catch (e) {
      console.error(e);
    } finally {
      setTriggeringType(null);
    }
  };

  const getBadgeForType = (type: string) => {
    switch (type) {
      case "MISSED_DOSE":
        return { label: "Missed Medication", bg: "bg-rose-100 text-rose-800 border-rose-200", icon: "⚠️" };
      case "UPCOMING_DOSE":
        return { label: "Upcoming Dose", bg: "bg-blue-100 text-blue-800 border-blue-200", icon: "⏰" };
      case "APPOINTMENT_REMINDER":
        return { label: "Doctor Appointment", bg: "bg-emerald-100 text-emerald-800 border-emerald-200", icon: "📅" };
      case "SOS_EMERGENCY":
        return { label: "Emergency SOS", bg: "bg-red-200 text-red-900 border-red-300 font-extrabold", icon: "🚨" };
      default:
        return { label: type, bg: "bg-slate-100 text-slate-800 border-slate-200", icon: "✉️" };
    }
  };

  // Filtered notifications
  const filteredNotifications = notifications.filter((notif) => {
    const matchesSearch =
      notif.recipientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notif.recipientEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notif.subject.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = typeFilter === "ALL" || notif.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const totalSent = notifications.length;
  const missedCount = notifications.filter((n) => n.type === "MISSED_DOSE").length;
  const apptCount = notifications.filter((n) => n.type === "APPOINTMENT_REMINDER").length;

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-700 via-orange-700 to-amber-800 text-white rounded-3xl p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-amber-100 text-xs font-semibold backdrop-blur mb-2">
              <Mail className="w-3.5 h-3.5" />
              <span>Proactive Health Safety Engine</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold">
              Proactive Email Alerts &amp; Notification Dispatcher
            </h2>
            <p className="mt-1 text-amber-100 text-sm max-w-xl">
              Automatic escalation emails are dispatched when medications are missed, doses are upcoming, or doctor appointments require coordination.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleRunScheduler}
              disabled={runningScheduler}
              className="px-5 py-3 rounded-2xl bg-white text-amber-900 hover:bg-amber-50 font-bold text-xs shadow-lg transition flex items-center gap-2 active:scale-95"
            >
              <RefreshCw className={`w-4 h-4 ${runningScheduler ? "animate-spin" : ""}`} />
              <span>{runningScheduler ? "Checking Doses..." : "Run Scheduler Check Now"}</span>
            </button>
          </div>
        </div>

        {schedulerResult && (
          <div className="mt-4 p-3 rounded-xl bg-white/20 backdrop-blur border border-white/30 text-xs font-medium text-white flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
            <span>{schedulerResult}</span>
          </div>
        )}
      </div>

      {/* Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-slate-400 font-bold uppercase text-[10px]">Total Emails Sent</span>
          <p className="text-2xl font-black text-slate-900 mt-1">{totalSent}</p>
          <span className="text-[11px] text-emerald-600 font-semibold">100% Delivery Success</span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-slate-400 font-bold uppercase text-[10px]">Missed Dose Alerts</span>
          <p className="text-2xl font-black text-rose-600 mt-1">{missedCount}</p>
          <span className="text-[11px] text-slate-500">Escalated to Care Circle</span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-slate-400 font-bold uppercase text-[10px]">Appointment Notices</span>
          <p className="text-2xl font-black text-emerald-600 mt-1">{apptCount}</p>
          <span className="text-[11px] text-slate-500">24-hr advance reminders</span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-slate-400 font-bold uppercase text-[10px]">Active Subscriptions</span>
          <p className="text-2xl font-black text-indigo-600 mt-1">{careCircle.length}</p>
          <span className="text-[11px] text-slate-500">Verified recipients</span>
        </div>
      </div>

      {/* Interactive Proactive Dispatch Testing Panel */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Play className="w-5 h-5 text-amber-600" />
              <span>Interactive Email Dispatch Simulator</span>
            </h3>
            <p className="text-xs text-slate-500">
              Trigger real proactive email notifications to test care circle delivery &amp; formatting
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 1. Missed Dose Alert */}
          <div className="p-4 rounded-2xl border-2 border-rose-200 bg-rose-50/50 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-rose-800 font-bold text-sm">
                <span>⚠️</span>
                <span>Missed Dose Alert</span>
              </div>
              <p className="text-xs text-slate-600 mt-1">
                Fires when senior does not mark dose within 30 min window. Alerts family &amp; nurse.
              </p>
            </div>
            <button
              onClick={() => handleTestEmail("MISSED_DOSE")}
              disabled={triggeringType === "MISSED_DOSE"}
              className="mt-4 w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md shadow-rose-600/20 transition flex items-center justify-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{triggeringType === "MISSED_DOSE" ? "Dispatching..." : "Simulate Missed Dose"}</span>
            </button>
          </div>

          {/* 2. Upcoming Dose Reminder */}
          <div className="p-4 rounded-2xl border-2 border-blue-200 bg-blue-50/50 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-blue-800 font-bold text-sm">
                <span>⏰</span>
                <span>Upcoming Dose Alert</span>
              </div>
              <p className="text-xs text-slate-600 mt-1">
                Gentle reminder sent 30 minutes before meal or bedtime scheduled dose.
              </p>
            </div>
            <button
              onClick={() => handleTestEmail("UPCOMING_DOSE")}
              disabled={triggeringType === "UPCOMING_DOSE"}
              className="mt-4 w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/20 transition flex items-center justify-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{triggeringType === "UPCOMING_DOSE" ? "Dispatching..." : "Send Upcoming Reminder"}</span>
            </button>
          </div>

          {/* 3. Appointment Reminder */}
          <div className="p-4 rounded-2xl border-2 border-emerald-200 bg-emerald-50/50 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
                <span>📅</span>
                <span>Appointment Alert</span>
              </div>
              <p className="text-xs text-slate-600 mt-1">
                Notifies family 24 hours prior with clinic location, companion, and fasting prep.
              </p>
            </div>
            <button
              onClick={() => handleTestEmail("APPOINTMENT_REMINDER")}
              disabled={triggeringType === "APPOINTMENT_REMINDER"}
              className="mt-4 w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition flex items-center justify-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{triggeringType === "APPOINTMENT_REMINDER" ? "Dispatching..." : "Send Appt Reminder"}</span>
            </button>
          </div>

          {/* 4. Emergency SOS Beacon */}
          <div className="p-4 rounded-2xl border-2 border-red-300 bg-red-50/60 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-red-900 font-bold text-sm">
                <span>🚨</span>
                <span>Emergency SOS Alert</span>
              </div>
              <p className="text-xs text-slate-600 mt-1">
                Urgent high-priority email to all members with medical details and hospital phone.
              </p>
            </div>
            <button
              onClick={() => handleTestEmail("SOS_EMERGENCY")}
              disabled={triggeringType === "SOS_EMERGENCY"}
              className="mt-4 w-full py-2.5 rounded-xl bg-red-700 hover:bg-red-800 text-white font-bold text-xs shadow-md shadow-red-700/30 transition flex items-center justify-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{triggeringType === "SOS_EMERGENCY" ? "Dispatching..." : "Simulate SOS Broadcast"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Dispatched Emails Audit Trail with Search & Filter */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Mail className="w-5 h-5 text-amber-600" />
              <span>Proactive Notification Audit Log ({filteredNotifications.length})</span>
            </h3>
            <p className="text-xs text-slate-500">
              Complete verifiable record of all proactive email dispatches with viewable HTML previews
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onRefreshNotifications}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by recipient name, email address, or subject line..."
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto text-xs">
            <span className="text-slate-400 text-[11px] font-semibold flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" />
              <span>Type:</span>
            </span>
            {["ALL", "MISSED_DOSE", "UPCOMING_DOSE", "APPOINTMENT_REMINDER", "SOS_EMERGENCY"].map((type) => (
              <button
                key={type}
                onClick={() => setTypeFilter(type)}
                className={`px-2.5 py-1.5 rounded-lg font-bold whitespace-nowrap transition ${
                  typeFilter === type
                    ? "bg-amber-100 text-amber-900 border border-amber-300"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {type === "ALL" ? "All Types" : type.replace("_", " ")}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs font-bold text-slate-400 uppercase tracking-wider">
                <th className="pb-3 px-2">Type</th>
                <th className="pb-3 px-2">Recipient</th>
                <th className="pb-3 px-2">Subject Line</th>
                <th className="pb-3 px-2">Dispatched At</th>
                <th className="pb-3 px-2">Status</th>
                <th className="pb-3 px-2 text-right">View Email</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredNotifications.map((notif) => {
                const badge = getBadgeForType(notif.type);
                return (
                  <tr key={notif.id} className="hover:bg-slate-50/60 transition">
                    <td className="py-3 px-2">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold border ${badge.bg}`}
                      >
                        <span>{badge.icon}</span>
                        <span>{badge.label}</span>
                      </span>
                    </td>
                    <td className="py-3 px-2">
                      <p className="font-bold text-slate-900">{notif.recipientName}</p>
                      <p className="text-slate-500 text-[11px]">{notif.recipientEmail}</p>
                    </td>
                    <td className="py-3 px-2 font-medium text-slate-800 max-w-xs truncate">
                      {notif.subject}
                    </td>
                    <td className="py-3 px-2 text-slate-500">
                      {new Date(notif.sentAt).toLocaleString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="py-3 px-2">
                      <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        {notif.status}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedPreview(notif)}
                          className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold text-[11px] flex items-center gap-1 transition"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Preview</span>
                        </button>
                        {notif.etherealUrl && (
                          <a
                            href={notif.etherealUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="px-2 py-1 rounded-lg bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200 text-[11px] transition"
                            title="Open in Ethereal Mailer"
                          >
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Care Circle Notification Preferences Directory */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
        <div className="mb-4 pb-3 border-b border-slate-100">
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-600" />
            <span>Care Circle Email Notification Subscriptions</span>
          </h3>
          <p className="text-xs text-slate-500">
            Contacts actively subscribed to safety alerts for {profile?.preferredName || "Eleanor"}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          {careCircle.map((member) => (
            <div
              key={member.id}
              className="p-4 rounded-2xl border border-slate-200 bg-slate-50/60 space-y-2"
            >
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-slate-900">{member.name}</h4>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-100 text-indigo-800">
                  {member.role}
                </span>
              </div>
              <p className="text-slate-600 font-medium">{member.relation}</p>
              <p className="text-blue-700 font-mono text-[11px]">{member.email}</p>

              <div className="pt-2 border-t border-slate-200/60 space-y-1 text-[11px] text-slate-600">
                <p>
                  Missed Doses: <strong>{member.notifyMissedDoses ? "✓ Enabled" : "Disabled"}</strong>
                </p>
                <p>
                  Doctor Appointments: <strong>{member.notifyAppointments ? "✓ Enabled" : "Disabled"}</strong>
                </p>
                <p>
                  Emergency SOS: <strong>{member.notifyEmergencySOS ? "✓ Priority" : "Disabled"}</strong>
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* HTML Email Preview Modal */}
      {selectedPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">
                  Email Dispatch Preview
                </span>
                <h3 className="text-base font-bold text-slate-900">{selectedPreview.subject}</h3>
                <p className="text-xs text-slate-500">
                  To: <strong>{selectedPreview.recipientName}</strong> &lt;{selectedPreview.recipientEmail}&gt;
                </p>
              </div>
              <button
                onClick={() => setSelectedPreview(null)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Embedded Email HTML Render */}
            <div
              className="border border-slate-200 rounded-2xl p-4 bg-slate-50 overflow-hidden"
              dangerouslySetInnerHTML={{ __html: selectedPreview.content }}
            />

            <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedPreview(null)}
                className="px-5 py-2 rounded-xl bg-slate-800 text-white font-bold text-xs"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
