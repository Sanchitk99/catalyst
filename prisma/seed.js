const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  console.log("Seeding CareRing elderly care database...");

  // Clean existing data for clean idempotent run
  await prisma.notificationLog.deleteMany({});
  await prisma.loveNote.deleteMany({});
  await prisma.vitalLog.deleteMany({});
  await prisma.healthcareRoutine.deleteMany({});
  await prisma.appointment.deleteMany({});
  await prisma.doseScheduleLog.deleteMany({});
  await prisma.medication.deleteMany({});
  await prisma.careCircleMember.deleteMany({});
  await prisma.elderlyProfile.deleteMany({});

  const todayStr = new Date().toISOString().split("T")[0];

  // 1. Create Eleanor's Profile
  const profile = await prisma.elderlyProfile.create({
    data: {
      fullName: "Eleanor Vance",
      preferredName: "Nana Eleanor",
      age: 78,
      gender: "Female",
      avatarUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80",
      bloodType: "A+",
      allergies: "Penicillin, Sulfa drugs",
      emergencyPhone: "+1 (555) 911-0022",
      primaryDoctor: "Dr. Arthur Campbell, MD",
      doctorPhone: "+1 (555) 234-8901",
      hospitalPreference: "St. Jude Metropolitan Medical Center",
      elderlyPasscode: "1234",
      familyPasscode: "4321",
      caretakerPasscode: "9999",
      accessibilityVoice: true,
      highContrast: false,
      fontSizeMode: "large",
    },
  });

  console.log(`Created Elderly Profile: ${profile.fullName} (${profile.id})`);

  // 2. Create Care Circle Members
  const marcus = await prisma.careCircleMember.create({
    data: {
      profileId: profile.id,
      name: "Marcus Vance",
      role: "FAMILY",
      relation: "Son (Primary Contact)",
      email: "marcus.vance@example.com",
      phone: "+1 (555) 441-2099",
      notifyMissedDoses: true,
      notifyUpcomingDoses: false,
      notifyAppointments: true,
      notifyEmergencySOS: true,
    },
  });

  const chloe = await prisma.careCircleMember.create({
    data: {
      profileId: profile.id,
      name: "Chloe Vance",
      role: "FAMILY",
      relation: "Granddaughter",
      email: "chloe.vance@example.com",
      phone: "+1 (555) 332-9011",
      notifyMissedDoses: true,
      notifyUpcomingDoses: false,
      notifyAppointments: false,
      notifyEmergencySOS: true,
    },
  });

  const nurseElena = await prisma.careCircleMember.create({
    data: {
      profileId: profile.id,
      name: "Elena Gomez, RN",
      role: "CARETAKER",
      relation: "Visiting Home Nurse",
      email: "nurse.elena@caregivers-network.org",
      phone: "+1 (555) 778-4321",
      notifyMissedDoses: true,
      notifyUpcomingDoses: true,
      notifyAppointments: true,
      notifyEmergencySOS: true,
    },
  });

  // 3. Create Core Medications
  const metformin = await prisma.medication.create({
    data: {
      profileId: profile.id,
      name: "Metformin HCl",
      brandName: "Glucophage",
      dosage: "500 mg",
      form: "Tablet",
      color: "White",
      shape: "Oval",
      instructions: "Take with breakfast and dinner with a glass of water. Never take on an empty stomach.",
      purpose: "Type 2 Blood Sugar Regulation",
      prescribingDoctor: "Dr. Arthur Campbell",
      totalPills: 60,
      remainingPills: 14,
      refillThreshold: 10,
      refillPharmacy: "Walgreens Pharmacy #419",
      pharmacyPhone: "+1 (555) 300-8800",
      active: true,
      scheduleTimes: JSON.stringify(["08:00", "19:30"]),
      scheduleType: "DAILY",
    },
  });

  const lisinopril = await prisma.medication.create({
    data: {
      profileId: profile.id,
      name: "Lisinopril",
      brandName: "Prinivil",
      dosage: "10 mg",
      form: "Tablet",
      color: "Pink",
      shape: "Round",
      instructions: "Take once daily in the morning with or without food. Helps maintain steady blood pressure.",
      purpose: "Hypertension / Blood Pressure Support",
      prescribingDoctor: "Dr. Arthur Campbell",
      totalPills: 30,
      remainingPills: 8,
      refillThreshold: 7,
      refillPharmacy: "Walgreens Pharmacy #419",
      pharmacyPhone: "+1 (555) 300-8800",
      active: true,
      scheduleTimes: JSON.stringify(["08:00"]),
      scheduleType: "DAILY",
    },
  });

  const atorvastatin = await prisma.medication.create({
    data: {
      profileId: profile.id,
      name: "Atorvastatin",
      brandName: "Lipitor",
      dosage: "20 mg",
      form: "Tablet",
      color: "White",
      shape: "Oblong",
      instructions: "Take once daily at bedtime. Avoid drinking grapefruit juice.",
      purpose: "Cholesterol & Cardiovascular Protection",
      prescribingDoctor: "Dr. Arthur Campbell",
      totalPills: 30,
      remainingPills: 22,
      refillThreshold: 5,
      refillPharmacy: "Walgreens Pharmacy #419",
      pharmacyPhone: "+1 (555) 300-8800",
      active: true,
      scheduleTimes: JSON.stringify(["21:00"]),
      scheduleType: "DAILY",
    },
  });

  const calcium = await prisma.medication.create({
    data: {
      profileId: profile.id,
      name: "Calcium Citrate + Vit D3",
      brandName: "Citracal",
      dosage: "600 mg / 400 IU",
      form: "Tablet",
      color: "Yellow",
      shape: "Oval",
      instructions: "Take midday with lunch for optimal bone density absorption.",
      purpose: "Bone Density & Osteoporosis Prevention",
      prescribingDoctor: "Dr. Arthur Campbell",
      totalPills: 90,
      remainingPills: 45,
      refillThreshold: 15,
      refillPharmacy: "Walgreens Pharmacy #419",
      pharmacyPhone: "+1 (555) 300-8800",
      active: true,
      scheduleTimes: JSON.stringify(["13:00"]),
      scheduleType: "DAILY",
    },
  });

  // 4. Create Dose Schedule Logs for Today
  // 08:00 doses: Taken
  await prisma.doseScheduleLog.create({
    data: {
      profileId: profile.id,
      medicationId: lisinopril.id,
      scheduledDate: todayStr,
      scheduledTime: "08:00",
      status: "TAKEN",
      takenAt: new Date(new Date().setHours(8, 12, 0, 0)),
      takenBy: "Eleanor (Self)",
      notes: "Taken with fresh oatmeal and orange juice",
    },
  });

  await prisma.doseScheduleLog.create({
    data: {
      profileId: profile.id,
      medicationId: metformin.id,
      scheduledDate: todayStr,
      scheduledTime: "08:00",
      status: "TAKEN",
      takenAt: new Date(new Date().setHours(8, 14, 0, 0)),
      takenBy: "Eleanor (Self)",
      notes: "Morning dose taken with meal",
    },
  });

  // 13:00 dose: Pending
  await prisma.doseScheduleLog.create({
    data: {
      profileId: profile.id,
      medicationId: calcium.id,
      scheduledDate: todayStr,
      scheduledTime: "13:00",
      status: "PENDING",
    },
  });

  // 19:30 dose: Pending
  await prisma.doseScheduleLog.create({
    data: {
      profileId: profile.id,
      medicationId: metformin.id,
      scheduledDate: todayStr,
      scheduledTime: "19:30",
      status: "PENDING",
    },
  });

  // 21:00 dose: Pending
  await prisma.doseScheduleLog.create({
    data: {
      profileId: profile.id,
      medicationId: atorvastatin.id,
      scheduledDate: todayStr,
      scheduledTime: "21:00",
      status: "PENDING",
    },
  });

  // 5. Create Doctor Appointments
  const inTwoDays = new Date();
  inTwoDays.setDate(inTwoDays.getDate() + 2);
  inTwoDays.setHours(10, 30, 0, 0);

  const inTenDays = new Date();
  inTenDays.setDate(inTenDays.getDate() + 10);
  inTenDays.setHours(14, 0, 0, 0);

  await prisma.appointment.create({
    data: {
      profileId: profile.id,
      doctorName: "Dr. Arthur Campbell",
      specialty: "Internal Medicine & Geriatrics",
      clinicName: "St. Jude Medical Pavilion, Suite 305",
      address: "1024 Healthcare Parkway, Seattle, WA",
      contactPhone: "+1 (555) 234-8901",
      appointmentDate: inTwoDays,
      status: "UPCOMING",
      purpose: "6-Month Comprehensive Geriatric Wellness & Blood Panel Review",
      preVisitNotes: "Fasting required for 8 hours prior. Remember to bring daily blood pressure journal.",
      companionRequired: true,
      companionName: "Marcus Vance (Son)",
      transportArranged: true,
    },
  });

  await prisma.appointment.create({
    data: {
      profileId: profile.id,
      doctorName: "Dr. Rebecca Weiss",
      specialty: "Ophthalmology & Retinal Care",
      clinicName: "ClearVision Eye Institute",
      address: "550 West Mercer St, Seattle, WA",
      contactPhone: "+1 (555) 880-9944",
      appointmentDate: inTenDays,
      status: "UPCOMING",
      purpose: "Annual Glaucoma Pressure Testing & Lens Check",
      preVisitNotes: "Pupil dilation drops will be administered. Sunglasses recommended for the ride home.",
      companionRequired: true,
      companionName: "Chloe Vance (Granddaughter)",
      transportArranged: false,
    },
  });

  // 6. Create Daily Healthcare Routines
  await prisma.healthcareRoutine.createMany({
    data: [
      {
        profileId: profile.id,
        title: "Morning Blood Pressure & Pulse Log",
        category: "VITAL_CHECK",
        targetTime: "08:30",
        frequency: "DAILY",
        notes: "Rest quietly for 5 minutes prior to measuring cuff on left arm.",
        completedToday: true,
        lastCompletedAt: new Date(new Date().setHours(8, 32, 0, 0)),
      },
      {
        profileId: profile.id,
        title: "Midday Hydration & Herbal Tea (500 ml)",
        category: "HYDRATION",
        targetTime: "13:30",
        frequency: "DAILY",
        notes: "Stay well hydrated throughout the afternoon.",
        completedToday: false,
      },
      {
        profileId: profile.id,
        title: "Gentle 15-Minute Garden Walk",
        category: "EXERCISE",
        targetTime: "16:00",
        frequency: "DAILY",
        notes: "Wear comfortable walking shoes with rubber soles. Use walking cane if feeling unsteady.",
        completedToday: false,
      },
      {
        profileId: profile.id,
        title: "Evening Foot & Ankle Circulation Inspection",
        category: "PHYSIOTHERAPY",
        targetTime: "20:30",
        frequency: "DAILY",
        notes: "Inspect for any swelling or dry skin; apply moisturizing cream.",
        completedToday: false,
      },
    ],
  });

  // 7. Create Vital Logs
  await prisma.vitalLog.createMany({
    data: [
      {
        profileId: profile.id,
        type: "BLOOD_PRESSURE",
        value: "122/80",
        unit: "mmHg",
        measuredAt: new Date(new Date().setHours(8, 30, 0, 0)),
        measuredBy: "Self",
        status: "NORMAL",
        notes: "Within normal target range. Pulse 72 bpm.",
      },
      {
        profileId: profile.id,
        type: "BLOOD_SUGAR",
        value: "108",
        unit: "mg/dL",
        measuredAt: new Date(new Date().setHours(7, 45, 0, 0)),
        measuredBy: "Self",
        status: "NORMAL",
        notes: "Fasting morning glucose check.",
      },
      {
        profileId: profile.id,
        type: "HEART_RATE",
        value: "72",
        unit: "bpm",
        measuredAt: new Date(new Date().setHours(8, 30, 0, 0)),
        measuredBy: "Self",
        status: "NORMAL",
      },
    ],
  });

  // 8. Create Love Notes / Care Circle Messages
  await prisma.loveNote.createMany({
    data: [
      {
        profileId: profile.id,
        senderName: "Marcus Vance (Son)",
        senderRole: "FAMILY",
        message: "Good morning Mom! I checked the dashboard and saw you took your morning medicine. Elena is stopping by around 2 PM. Love you!",
        mediaEmoji: "❤️",
        isRead: false,
      },
      {
        profileId: profile.id,
        senderName: "Chloe (Granddaughter)",
        senderRole: "FAMILY",
        message: "Nana, don't forget your garden walk today! The roses in the front yard look magnificent! 🌹",
        mediaEmoji: "🌸",
        isRead: false,
      },
      {
        profileId: profile.id,
        senderName: "Elena Gomez, RN",
        senderRole: "CARETAKER",
        message: "Great job keeping your morning BP below 125/80 Eleanor. See you this afternoon for vitals check!",
        mediaEmoji: "⭐",
        isRead: false,
      },
    ],
  });

  // 9. Create a Sample Notification Log
  await prisma.notificationLog.create({
    data: {
      profileId: profile.id,
      recipientEmail: "marcus.vance@example.com",
      recipientName: "Marcus Vance",
      type: "UPCOMING_DOSE",
      subject: "⏰ Upcoming Medication Dose: Lisinopril at 08:00",
      content: "CareRing reminder: Eleanor's morning medication is scheduled for 08:00.",
      status: "SENT",
      etherealUrl: "https://ethereal.email/message/sample-test-id",
    },
  });

  console.log("Seeding complete! Database initialized with complete senior care profile.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
