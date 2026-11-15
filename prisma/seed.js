const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  console.log("Seeding CareRing elderly care database with multi-profile and historical adherence data...");

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

  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];

  // Helper for generating dates relative to today
  const getDateStr = (offsetDays) => {
    const d = new Date(today);
    d.setDate(d.getDate() + offsetDays);
    return d.toISOString().split("T")[0];
  };

  // ==========================================
  // 1. Profile 1: Eleanor Vance ("Nana Eleanor", 78)
  // ==========================================
  const eleanor = await prisma.elderlyProfile.create({
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

  // Care Circle for Eleanor
  await prisma.careCircleMember.createMany({
    data: [
      {
        profileId: eleanor.id,
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
      {
        profileId: eleanor.id,
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
      {
        profileId: eleanor.id,
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
    ],
  });

  // Medications for Eleanor
  const metformin = await prisma.medication.create({
    data: {
      profileId: eleanor.id,
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
      profileId: eleanor.id,
      name: "Lisinopril",
      brandName: "Prinivil",
      dosage: "10 mg",
      form: "Tablet",
      color: "Pink",
      shape: "Round",
      instructions: "Take once daily in the morning with water. Helps maintain steady blood pressure.",
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
      profileId: eleanor.id,
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
      profileId: eleanor.id,
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

  // Generate 14 Days of Historical Doses for Eleanor for the Adherence Heatmap!
  for (let offset = -13; offset <= -1; offset++) {
    const dayStr = getDateStr(offset);
    // 08:00 Lisinopril
    await prisma.doseScheduleLog.create({
      data: {
        profileId: eleanor.id,
        medicationId: lisinopril.id,
        scheduledDate: dayStr,
        scheduledTime: "08:00",
        status: "TAKEN",
        takenAt: new Date(new Date().setHours(8, 15 + Math.floor(Math.random() * 15))),
        takenBy: "Eleanor (Self)",
      },
    });

    // 08:00 Metformin
    await prisma.doseScheduleLog.create({
      data: {
        profileId: eleanor.id,
        medicationId: metformin.id,
        scheduledDate: dayStr,
        scheduledTime: "08:00",
        status: "TAKEN",
        takenAt: new Date(new Date().setHours(8, 16 + Math.floor(Math.random() * 15))),
        takenBy: "Eleanor (Self)",
      },
    });

    // 13:00 Calcium (mostly taken, occasional snooze)
    await prisma.doseScheduleLog.create({
      data: {
        profileId: eleanor.id,
        medicationId: calcium.id,
        scheduledDate: dayStr,
        scheduledTime: "13:00",
        status: offset === -4 ? "MISSED" : "TAKEN",
        takenAt: offset === -4 ? null : new Date(new Date().setHours(13, 20)),
        takenBy: offset === -4 ? null : "Eleanor (Self)",
      },
    });

    // 19:30 Metformin
    await prisma.doseScheduleLog.create({
      data: {
        profileId: eleanor.id,
        medicationId: metformin.id,
        scheduledDate: dayStr,
        scheduledTime: "19:30",
        status: "TAKEN",
        takenAt: new Date(new Date().setHours(19, 45)),
        takenBy: "Eleanor (Self)",
      },
    });

    // 21:00 Atorvastatin
    await prisma.doseScheduleLog.create({
      data: {
        profileId: eleanor.id,
        medicationId: atorvastatin.id,
        scheduledDate: dayStr,
        scheduledTime: "21:00",
        status: offset === -8 ? "MISSED" : "TAKEN",
        takenAt: offset === -8 ? null : new Date(new Date().setHours(21, 10)),
        takenBy: offset === -8 ? null : "Eleanor (Self)",
      },
    });
  }

  // Today's Doses for Eleanor
  await prisma.doseScheduleLog.create({
    data: {
      profileId: eleanor.id,
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
      profileId: eleanor.id,
      medicationId: metformin.id,
      scheduledDate: todayStr,
      scheduledTime: "08:00",
      status: "TAKEN",
      takenAt: new Date(new Date().setHours(8, 14, 0, 0)),
      takenBy: "Eleanor (Self)",
      notes: "Morning dose taken with meal",
    },
  });

  await prisma.doseScheduleLog.create({
    data: {
      profileId: eleanor.id,
      medicationId: calcium.id,
      scheduledDate: todayStr,
      scheduledTime: "13:00",
      status: "PENDING",
    },
  });

  await prisma.doseScheduleLog.create({
    data: {
      profileId: eleanor.id,
      medicationId: metformin.id,
      scheduledDate: todayStr,
      scheduledTime: "19:30",
      status: "PENDING",
    },
  });

  await prisma.doseScheduleLog.create({
    data: {
      profileId: eleanor.id,
      medicationId: atorvastatin.id,
      scheduledDate: todayStr,
      scheduledTime: "21:00",
      status: "PENDING",
    },
  });

  // Eleanor's Appointments
  const inTwoDays = new Date();
  inTwoDays.setDate(inTwoDays.getDate() + 2);
  inTwoDays.setHours(10, 30, 0, 0);

  const inTenDays = new Date();
  inTenDays.setDate(inTenDays.getDate() + 10);
  inTenDays.setHours(14, 0, 0, 0);

  await prisma.appointment.createMany({
    data: [
      {
        profileId: eleanor.id,
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
      {
        profileId: eleanor.id,
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
    ],
  });

  // Eleanor's Healthcare Routines
  await prisma.healthcareRoutine.createMany({
    data: [
      {
        profileId: eleanor.id,
        title: "Morning Blood Pressure & Pulse Log",
        category: "VITAL_CHECK",
        targetTime: "08:30",
        frequency: "DAILY",
        notes: "Rest quietly for 5 minutes prior to measuring cuff on left arm.",
        completedToday: true,
        lastCompletedAt: new Date(new Date().setHours(8, 32, 0, 0)),
      },
      {
        profileId: eleanor.id,
        title: "Midday Hydration & Herbal Tea (500 ml)",
        category: "HYDRATION",
        targetTime: "13:30",
        frequency: "DAILY",
        notes: "Stay well hydrated throughout the afternoon.",
        completedToday: false,
      },
      {
        profileId: eleanor.id,
        title: "Gentle 15-Minute Garden Walk",
        category: "EXERCISE",
        targetTime: "16:00",
        frequency: "DAILY",
        notes: "Wear comfortable walking shoes with rubber soles. Use walking cane if feeling unsteady.",
        completedToday: false,
      },
      {
        profileId: eleanor.id,
        title: "Evening Foot & Ankle Circulation Inspection",
        category: "PHYSIOTHERAPY",
        targetTime: "20:30",
        frequency: "DAILY",
        notes: "Inspect for any swelling or dry skin; apply moisturizing cream.",
        completedToday: false,
      },
    ],
  });

  // Eleanor's Vitals
  await prisma.vitalLog.createMany({
    data: [
      {
        profileId: eleanor.id,
        type: "BLOOD_PRESSURE",
        value: "122/80",
        unit: "mmHg",
        measuredAt: new Date(new Date().setHours(8, 30, 0, 0)),
        measuredBy: "Self",
        status: "NORMAL",
        notes: "Within normal target range. Pulse 72 bpm.",
      },
      {
        profileId: eleanor.id,
        type: "BLOOD_SUGAR",
        value: "108",
        unit: "mg/dL",
        measuredAt: new Date(new Date().setHours(7, 45, 0, 0)),
        measuredBy: "Self",
        status: "NORMAL",
        notes: "Fasting morning glucose check.",
      },
      {
        profileId: eleanor.id,
        type: "HEART_RATE",
        value: "72",
        unit: "bpm",
        measuredAt: new Date(new Date().setHours(8, 30, 0, 0)),
        measuredBy: "Self",
        status: "NORMAL",
      },
    ],
  });

  // Eleanor's Love Notes
  await prisma.loveNote.createMany({
    data: [
      {
        profileId: eleanor.id,
        senderName: "Marcus Vance (Son)",
        senderRole: "FAMILY",
        message: "Good morning Mom! I checked the dashboard and saw you took your morning medicine. Elena is stopping by around 2 PM. Love you!",
        mediaEmoji: "❤️",
        isRead: false,
      },
      {
        profileId: eleanor.id,
        senderName: "Chloe (Granddaughter)",
        senderRole: "FAMILY",
        message: "Nana, don't forget your garden walk today! The roses in the front yard look magnificent! 🌹",
        mediaEmoji: "🌸",
        isRead: false,
      },
    ],
  });

  // ==========================================
  // 2. Profile 2: Robert Chen ("Grandpa Robert", 82)
  // ==========================================
  const robert = await prisma.elderlyProfile.create({
    data: {
      fullName: "Robert Chen",
      preferredName: "Grandpa Robert",
      age: 82,
      gender: "Male",
      avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80",
      bloodType: "B+",
      allergies: "Codeine, NSAIDs (Aspirin sensitivity)",
      emergencyPhone: "+1 (555) 911-3344",
      primaryDoctor: "Dr. Evelyn Ross, MD (Cardiology)",
      doctorPhone: "+1 (555) 672-8811",
      hospitalPreference: "Swedish Medical Center - Cherry Hill",
      elderlyPasscode: "5678",
      familyPasscode: "8765",
      caretakerPasscode: "9999",
      accessibilityVoice: true,
      highContrast: false,
      fontSizeMode: "large",
    },
  });

  // Care Circle for Robert
  await prisma.careCircleMember.createMany({
    data: [
      {
        profileId: robert.id,
        name: "David Chen",
        role: "FAMILY",
        relation: "Son (Power of Attorney)",
        email: "david.chen@example.com",
        phone: "+1 (555) 723-9900",
        notifyMissedDoses: true,
        notifyUpcomingDoses: true,
        notifyAppointments: true,
        notifyEmergencySOS: true,
      },
      {
        profileId: robert.id,
        name: "Nurse Elena Gomez, RN",
        role: "CARETAKER",
        relation: "Home Visiting Nurse",
        email: "nurse.elena@caregivers-network.org",
        phone: "+1 (555) 778-4321",
        notifyMissedDoses: true,
        notifyUpcomingDoses: false,
        notifyAppointments: true,
        notifyEmergencySOS: true,
      },
    ],
  });

  // Medications for Robert
  const carvedilol = await prisma.medication.create({
    data: {
      profileId: robert.id,
      name: "Carvedilol",
      brandName: "Coreg",
      dosage: "12.5 mg",
      form: "Tablet",
      color: "White",
      shape: "Round",
      instructions: "Take with food twice daily for heart health. Avoid sudden standing up.",
      purpose: "Congestive Heart Support & Rate Control",
      prescribingDoctor: "Dr. Evelyn Ross",
      totalPills: 60,
      remainingPills: 18,
      refillThreshold: 10,
      refillPharmacy: "CVS Pharmacy #882",
      pharmacyPhone: "+1 (555) 420-1122",
      active: true,
      scheduleTimes: JSON.stringify(["09:00", "20:00"]),
      scheduleType: "DAILY",
    },
  });

  const furosemide = await prisma.medication.create({
    data: {
      profileId: robert.id,
      name: "Furosemide",
      brandName: "Lasix",
      dosage: "20 mg",
      form: "Tablet",
      color: "White",
      shape: "Round",
      instructions: "Take early in morning with banana or potassium. Promotes fluid balance.",
      purpose: "Diuretic & Edema Prevention",
      prescribingDoctor: "Dr. Evelyn Ross",
      totalPills: 30,
      remainingPills: 5,
      refillThreshold: 7,
      refillPharmacy: "CVS Pharmacy #882",
      pharmacyPhone: "+1 (555) 420-1122",
      active: true,
      scheduleTimes: JSON.stringify(["09:00"]),
      scheduleType: "DAILY",
    },
  });

  // Today's Doses for Robert
  await prisma.doseScheduleLog.createMany({
    data: [
      {
        profileId: robert.id,
        medicationId: carvedilol.id,
        scheduledDate: todayStr,
        scheduledTime: "09:00",
        status: "TAKEN",
        takenAt: new Date(new Date().setHours(9, 15)),
        takenBy: "Robert (Self)",
      },
      {
        profileId: robert.id,
        medicationId: furosemide.id,
        scheduledDate: todayStr,
        scheduledTime: "09:00",
        status: "TAKEN",
        takenAt: new Date(new Date().setHours(9, 15)),
        takenBy: "Robert (Self)",
      },
      {
        profileId: robert.id,
        medicationId: carvedilol.id,
        scheduledDate: todayStr,
        scheduledTime: "20:00",
        status: "PENDING",
      },
    ],
  });

  // Vitals for Robert
  await prisma.vitalLog.createMany({
    data: [
      {
        profileId: robert.id,
        type: "BLOOD_PRESSURE",
        value: "118/74",
        unit: "mmHg",
        measuredAt: new Date(),
        measuredBy: "Nurse Elena",
        status: "NORMAL",
        notes: "Good fluid balance, no peripheral edema.",
      },
      {
        profileId: robert.id,
        type: "WEIGHT",
        value: "168.5",
        unit: "lbs",
        measuredAt: new Date(),
        measuredBy: "Nurse Elena",
        status: "NORMAL",
        notes: "Daily dry weight check.",
      },
    ],
  });

  // Notification Log for Robert
  await prisma.notificationLog.create({
    data: {
      profileId: robert.id,
      recipientEmail: "david.chen@example.com",
      recipientName: "David Chen",
      type: "REFILL_ALERT",
      subject: "⚠️ Low Prescription Inventory: Furosemide (5 pills left)",
      content: "CareRing Refill Alert: Robert Chen has 5 pills remaining for Furosemide 20mg.",
      status: "SENT",
    },
  });

  console.log("Seeding complete! Initialized Eleanor Vance and Robert Chen with rich clinical records.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
