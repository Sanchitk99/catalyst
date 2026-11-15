# 🌸 CareRing - Elderly Care & Medication Management Platform

> **A smart, interconnected healthcare management platform designed to help elderly individuals manage their daily medications, medical appointments, and healthcare routines while keeping their family members and caretakers informed.**

CareRing places the senior at the center of their own care decisions through accessible, dignity-affirming technology, while seamlessly synchronizing a shared care ecosystem with **passcode-based access** and **proactive email escalation alerts**.

---

## 🌟 Key Features & Creative Innovations

### 1. 👵 Senior-First Accessible Experience ("My Day")
- **Visual Pill Indicators**: Medications categorized by color (White, Pink, Yellow, etc.) and shape (Round, Oval, Oblong, Capsule) so seniors who struggle with complex chemical names can easily identify pills.
- **Voice Companion (Web Speech API)**: Tap the speaker icon on any dose or routine to hear spoken instructions in a calm, clear cadence (e.g. *"Time for Metformin 500mg. Take with breakfast."*).
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

### 3. ⏰ Proactive Email Reminders & Escalation Engine
- **Missed Medication Escalation**: Background scheduler identifies doses overdue by >30 minutes and dispatches urgent warning emails to designated family members and visiting nurses.
- **Upcoming Dose Reminders**: Proactive 30-minute advance notices so seniors and caregivers prepare meal-time medications.
- **Doctor Appointment Reminders**: Comprehensive 24-hour reminders containing clinic address, transportation status, assigned family companion, and pre-visit fasting instructions.
- **Notification Audit Hub**: Complete log with live HTML preview viewer and Ethereal email test links.

### 4. 🩺 Caretaker & Clinical Command Center
- **Prescription Regimen Manager**: Add, edit, and deactivate medications with frequency, schedule times, and pharmacy phone numbers.
- **Auto-Refill Tracking**: Monitors remaining pill counts and alerts caregivers when inventory drops below safety thresholds (e.g., `< 7 pills`), with 1-click `+30 Refill` action.
- **Clinical Vitals Log**: Records Blood Pressure, Blood Sugar, and Resting Heart Rate with normal vs. warning threshold flags.
- **Administration Audit Table**: Complete audit history with timestamps and nurse override options.

### 5. 👨‍👩‍👧 Family Peace-of-Mind & "Notes of Love"
- **Real-Time Adherence Gauge**: Live percentage showing today's completion rate and exact dose timestamps.
- **Notes of Love Board**: Family members can send short encouraging messages with emojis (❤️, 🌸, ⭐) that immediately pop up on the senior's tablet screen.
- **Companion Coordination**: Family members can claim responsibility to accompany their loved one to upcoming medical appointments.

---

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router) + React 18
- **Language**: TypeScript
- **Styling**: Tailwind CSS with custom elderly accessibility themes
- **Database & ORM**: SQLite (`dev.db`) + Prisma ORM
- **Email Engine**: Nodemailer (Ethereal test transporter with instant HTML preview links)
- **Audio & Accessibility**: Web Speech API (TTS) & Web Audio API (Chimes & Alarms)
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
*Seeds profile for **Eleanor Vance (Nana Eleanor)**, 78 yrs old, with active prescriptions (Metformin, Lisinopril, Atorvastatin, Calcium), doctor appointments, care circle contacts, and routines.*

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Testing & Evaluation Scenarios

1. **Test Senior Dose Confirmation**:
   - Go to **Senior Portal (My Day)**.
   - Click the **speaker icon** on *Calcium Citrate* to hear instructions read aloud.
   - Click **"I Took This Medicine"** to see confetti and hear the auditory chime. Notice the inventory automatically decrements!

2. **Test Proactive Email Engine**:
   - Navigate to the **Proactive Email Engine** tab.
   - Click **"Simulate Missed Dose"** or **"Run Scheduler Check Now"**.
   - Check the **Notification Audit Log** table and click **"Preview"** to inspect the rich email delivered to the care circle!

3. **Test Caretaker Inventory & Vitals**:
   - Go to **Caretaker Hub**.
   - Notice *Lisinopril* has a "Low Stock" warning. Click **"+30 Refill"** to update inventory.
   - Click **"Record Vitals"** and enter a blood pressure reading (e.g. `124/82 mmHg`).

4. **Test Family Notes of Love**:
   - Go to **Family Peace-of-Mind**.
   - Type a message: *"Proud of you Mom! Enjoy the sunny garden walk! ❤️"* and click **"Post Message to Nana"**.
   - Switch back to the **Senior Portal** to see the message appear on Eleanor's screen!

5. **Test Role Switching & Passcode Lock**:
   - Click the role pill in the header.
   - Enter `9999` for Nurse, `4321` for Family, or `1234` for Senior.
