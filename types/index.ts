export type UserRole = "SENIOR" | "FAMILY" | "CARETAKER";

export interface ProfileData {
  id: string;
  fullName: string;
  preferredName: string;
  age: number;
  gender: string;
  avatarUrl?: string | null;
  bloodType: string;
  allergies: string;
  emergencyPhone: string;
  primaryDoctor: string;
  doctorPhone: string;
  hospitalPreference: string;
  elderlyPasscode: string;
  familyPasscode: string;
  caretakerPasscode: string;
  accessibilityVoice: boolean;
  highContrast: boolean;
  fontSizeMode: "normal" | "large" | "extra-large";
}

export interface CareCircleMemberData {
  id: string;
  profileId: string;
  name: string;
  role: "FAMILY" | "CARETAKER" | "PRIMARY_CAREGIVER" | "DOCTOR";
  relation: string;
  email: string;
  phone?: string | null;
  notifyMissedDoses: boolean;
  notifyUpcomingDoses: boolean;
  notifyAppointments: boolean;
  notifyEmergencySOS: boolean;
}

export interface MedicationData {
  id: string;
  profileId: string;
  name: string;
  brandName?: string | null;
  dosage: string;
  form: string;
  color: string;
  shape: string;
  instructions: string;
  purpose: string;
  prescribingDoctor?: string | null;
  totalPills: number;
  remainingPills: number;
  refillThreshold: number;
  refillPharmacy?: string | null;
  pharmacyPhone?: string | null;
  active: boolean;
  scheduleTimes: string; // JSON string e.g. '["08:00"]'
  scheduleType: string;
  daysOfWeek?: string | null;
}

export interface DoseScheduleData {
  id: string;
  profileId: string;
  medicationId: string;
  scheduledDate: string;
  scheduledTime: string;
  status: "PENDING" | "TAKEN" | "MISSED" | "SNOOZED" | "SKIPPED";
  takenAt?: string | null;
  takenBy?: string | null;
  snoozedUntil?: string | null;
  missedAlertSent: boolean;
  reminderAlertSent: boolean;
  notes?: string | null;
  medication: MedicationData;
}

export interface AppointmentData {
  id: string;
  profileId: string;
  doctorName: string;
  specialty: string;
  clinicName: string;
  address: string;
  contactPhone?: string | null;
  appointmentDate: string;
  status: "UPCOMING" | "COMPLETED" | "CANCELLED" | "RESCHEDULED";
  purpose: string;
  preVisitNotes?: string | null;
  postVisitSummary?: string | null;
  companionRequired: boolean;
  companionName?: string | null;
  transportArranged: boolean;
  reminderSent24h: boolean;
  reminderSent2h: boolean;
}

export interface HealthcareRoutineData {
  id: string;
  profileId: string;
  title: string;
  category: "VITAL_CHECK" | "EXERCISE" | "HYDRATION" | "MENTAL_WELLNESS" | "PHYSIOTHERAPY";
  targetTime?: string | null;
  frequency: string;
  notes?: string | null;
  completedToday: boolean;
  lastCompletedAt?: string | null;
}

export interface VitalLogData {
  id: string;
  profileId: string;
  type: "BLOOD_PRESSURE" | "BLOOD_SUGAR" | "HEART_RATE" | "WEIGHT" | "OXYGEN" | "TEMPERATURE";
  value: string;
  unit: string;
  measuredAt: string;
  measuredBy: string;
  status: "NORMAL" | "ELEVATED" | "CRITICAL";
  notes?: string | null;
}

export interface LoveNoteData {
  id: string;
  profileId: string;
  senderName: string;
  senderRole: "FAMILY" | "CARETAKER";
  message: string;
  mediaEmoji: string;
  isRead: boolean;
  createdAt: string;
}

export interface NotificationLogData {
  id: string;
  profileId: string;
  recipientEmail: string;
  recipientName: string;
  type: "MISSED_DOSE" | "UPCOMING_DOSE" | "APPOINTMENT_REMINDER" | "REFILL_ALERT" | "SOS_EMERGENCY";
  subject: string;
  content: string;
  status: "SENT" | "SIMULATED" | "FAILED";
  etherealUrl?: string | null;
  sentAt: string;
}
