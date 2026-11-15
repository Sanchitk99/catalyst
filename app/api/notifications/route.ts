import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import {
  generateMissedDoseEmail,
  generateUpcomingDoseEmail,
  generateAppointmentEmail,
} from "@/lib/emailTemplates";
import { sendCareNotification } from "@/lib/emailService";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const profileId = searchParams.get("profileId");

    const whereClause: { profileId?: string } = {};
    if (profileId) {
      whereClause.profileId = profileId;
    }

    const notifications = await prisma.notificationLog.findMany({
      where: whereClause,
      orderBy: { sentAt: "desc" },
      take: 50,
    });

    return NextResponse.json(notifications);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error fetching notifications";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { profileId, type, recipientEmail, recipientName } = body;

    if (!profileId || !type) {
      return NextResponse.json(
        { error: "profileId and notification type are required" },
        { status: 400 }
      );
    }

    const profile = await prisma.elderlyProfile.findUnique({
      where: { id: profileId },
      include: {
        careCircle: true,
        medications: true,
        appointments: true,
      },
    });

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const seniorName = profile.preferredName || profile.fullName;
    const targetEmail = recipientEmail || profile.careCircle[0]?.email || "family@example.com";
    const targetName = recipientName || profile.careCircle[0]?.name || "Care Circle Member";

    let htmlContent = "";
    let subject = "";

    if (type === "MISSED_DOSE") {
      const sampleMed = profile.medications[0] || {
        name: "Metformin HCl",
        dosage: "500 mg",
        instructions: "Take with breakfast",
      };

      subject = `⚠️ Urgent: Missed Medication Alert for ${seniorName} (${sampleMed.name})`;
      htmlContent = generateMissedDoseEmail({
        seniorName,
        medicationName: sampleMed.name,
        dosage: sampleMed.dosage,
        scheduledTime: "08:00 AM",
        instructions: sampleMed.instructions,
        profileId: profile.id,
      });
    } else if (type === "UPCOMING_DOSE") {
      const sampleMed = profile.medications[0] || {
        name: "Lisinopril",
        dosage: "10 mg",
        instructions: "Take with water",
      };

      subject = `⏰ Upcoming Medication Dose: ${sampleMed.name} at 08:00 AM`;
      htmlContent = generateUpcomingDoseEmail({
        seniorName,
        medicationName: sampleMed.name,
        dosage: sampleMed.dosage,
        scheduledTime: "08:00 AM",
        instructions: sampleMed.instructions,
      });
    } else if (type === "APPOINTMENT_REMINDER") {
      const sampleAppt = profile.appointments[0] || {
        doctorName: "Dr. Arthur Campbell",
        specialty: "Internal Medicine & Geriatrics",
        clinicName: "St. Jude Medical Pavilion, Suite 305",
        appointmentDate: new Date(Date.now() + 86400000),
        preVisitNotes: "Fasting required for 8 hours prior. Bring daily blood pressure log.",
        companionRequired: true,
      };

      subject = `📅 Doctor Appointment Reminder for ${seniorName}: ${sampleAppt.doctorName}`;
      htmlContent = generateAppointmentEmail({
        seniorName,
        doctorName: sampleAppt.doctorName,
        specialty: sampleAppt.specialty,
        clinicName: sampleAppt.clinicName,
        appointmentDate: new Date(sampleAppt.appointmentDate).toLocaleString("en-US", {
          dateStyle: "medium",
          timeStyle: "short",
        }),
        preVisitNotes: sampleAppt.preVisitNotes,
        companionRequired: sampleAppt.companionRequired,
      });
    }

    const sendResult = await sendCareNotification({
      profileId: profile.id,
      recipientEmail: targetEmail,
      recipientName: targetName,
      type,
      subject,
      htmlContent,
    });

    return NextResponse.json({
      success: true,
      sendResult,
      targetEmail,
      targetName,
      subject,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error triggering notification";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
