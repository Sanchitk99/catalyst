# 🌸 CareRing - Elderly Care & Medication Management Platform

> **A smart, interconnected healthcare management platform designed to help elderly individuals manage their daily medications, medical appointments, and healthcare routines while keeping their family members and caretakers informed.**

CareRing places the senior at the center of their own care decisions through accessible, dignity-affirming technology, while seamlessly synchronizing a shared care ecosystem with **passcode-based access**, **proactive email escalation alerts**, and **clinical drug safety intelligence**.

---

## 🌟 Key Features & Creative Innovations

### 1. 👵 Senior-First Accessible Experience ("My Day")
- **Visual Pill Identifiers**: Medications categorized by color (White, Pink, Yellow, etc.) and shape (Round, Oval, Oblong, Capsule) so seniors who struggle with complex pharmaceutical names can easily identify pills.
- **Two-Way Voice Companion (Web Speech API)**: 
  - **Spoken Guidance**: Speaks dose instructions in a calm, clear cadence (e.g. *"Time for Metformin 500mg. Take with breakfast."*).
  - **Voice Recognition (Dictation)**: Senior can tap the microphone and speak naturally: *"I took my medicine"*, *"What do I take next?"*, *"Water"*, or *"Emergency"*.
- **Daily Mood, Pain & Hydration Tracking**:
  - One-tap emoji mood check-in (😊 Great, 🙂 Good, 🥱 Tired, 😵 Dizzy). Selecting "Dizzy" or "Unwell" automatically triggers an urgent alert to family and caretakers.
  - Interactive 8-glass water tracker with audio chimes.
- **One-Touch Dose Confirmation**: Large high-contrast touch targets with celebratory audio chimes and confetti bursts to positively reinforce adherence.
- **Senior Font Modes & High Contrast**: Built-in 1-click toggles for standard, large, extra-large typography and black/yellow ultra-high contrast for visual impairments.
- **Emergency SOS Beacon**: A single prominent button that alerts all care circle members instantly via email and displays immediate emergency medical details.

### 2. 🔐 Shared Ecosystem with Passcode-Based Access
Secure, friction-free role switching using simple passcodes:
| Role | Purpose | Default Demo PIN |
|---|---|---|
| **Senior (Elderly)** | Daily doses, routines, large touch targets, voice guidance | `1234` |
| **Family Member** | Peace-of-mind dashboard, adherence logs, send love notes | `4321` |
| **Caretaker / Nurse** | Prescription management, refills, vitals, clinic scheduler | `9999` |

### 3. 🔬 Intelligent Drug Safety & Dietary Precaution Engine
- **Polypharmacy Cross-Check**: Automatically cross-references senior prescriptions for potential adverse contraindications (e.g. ACE Inhibitors + Potassium, Statin + Clarithromycin).
- **Dietary & Substance Advisories**: Identifies critical food interactions (e.g. Grapefruit inhibition of statin enzymes, taking Metformin with meals to avoid gastrointestinal stress).

### 4. ⏰ Proactive Email Reminders & Escalation Engine
- **Missed Medication Escalation**: Background scheduler identifies doses overdue by >30 minutes and dispatches urgent warning emails to designated family members and visiting nurses.
- **Upcoming Dose Reminders**: Proactive 30-minute advance notices so seniors and caregivers prepare meal-time medications.
- **Doctor Appointment Reminders**: Comprehensive 24-hour reminders containing clinic address, transportation status, assigned family companion, and pre-visit fasting instructions.
- **Notification Audit Hub**: Complete log with live HTML preview viewer and Ethereal email test links.

### 5. 🩺 Caretaker & Clinical Command Center
- **Prescription Regimen Manager**: Add, edit, and deactivate medications with frequency, schedule times, and pharmacy phone numbers.
- **Auto-Refill Tracking & Pharmacy Ordering**: Monitors remaining pill counts and alerts caregivers when inventory drops below safety thresholds (e.g., `< 7 pills`), with 1-click `+30 Refill` action and Walgreens pharmacy ordering flow.
- **Biometric Vitals Longitudinal Analytics**: Interactive visual SVG graphs for Systolic/Diastolic Blood Pressure, Fasting Glucose, and Resting Heart Rate with clinical target zones.
- **Doctor Visit Summary (Print / PDF)**: 1-click exportable clinical summary sheet featuring 30-day adherence compliance, full prescription list, and recent vitals for physician checkups.

### 6. 👨‍👩‍👧 Family Peace-of-Mind & "Notes of Love"
- **Real-Time Adherence Gauge**: Live percentage showing today's completion rate and exact dose timestamps.
- **Notes of Love Board**: Family members can send short encouraging messages with emojis (❤️, 🌸, ⭐) that immediately pop up on the senior's tablet screen.
- **Care Circle Task Handover Board**: Collaborative coordination for driving loved ones to appointments and providing groceries.

---

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router) + React 18
- **Language**: TypeScript
- **Styling**: Tailwind CSS with custom elderly accessibility themes
- **Database & ORM**: SQLite (`dev.db`) + Prisma ORM
- **Email Engine**: Nodemailer (Ethereal test transporter with instant HTML preview links)
- **Audio & Accessibility**: Web Speech API (TTS + Recognition) & Web Audio API (Synthesized Chimes & Sirens)
- **Icons**: Lucide React
- **Celebration Feedback**: Canvas Confetti

---

## 🚀 Quick Start Guide

### 1. Install Dependencies
```bash
npm install
```

### 2. Initialize Database & Seed Sample Profile
```bash
npx prisma generate
npx prisma db push
node prisma/seed.js
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.
