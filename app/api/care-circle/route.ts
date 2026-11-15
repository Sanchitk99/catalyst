import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { generateSosAlertEmail } from "@/lib/emailTemplates";
import { sendCareNotification } from "@/lib/emailService";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const profileId = searchParams.get("profileId");

    if (!profileId) {
      return NextResponse.json({ error: "Profile ID required" }, { status: 400 });
    }

    const members = await prisma.careCircleMember.findMany({
      where: { profileId },
      orderBy: { createdAt: "asc" },
    });

    const loveNotes = await prisma.loveNote.findMany({
      where: { profileId },
      orderBy: { createdAt: "desc" },
      take: 25,
    });

    return NextResponse.json({ members, loveNotes });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error fetching care circle";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action } = body;

    // 1. Post a Love Note / Reassurance Message
    if (action === "SEND_NOTE") {
      const { profileId, senderName, senderRole, message, mediaEmoji } = body;
      if (!profileId || !senderName || !message) {
        return NextResponse.json(
          { error: "profileId, senderName, and message are required" },
          { status: 400 }
        );
      }

      const note = await prisma.loveNote.create({
        data: {
          profileId,
          senderName,
          senderRole: senderRole || "FAMILY",
          message,
          mediaEmoji: mediaEmoji || "❤️",
        },
      });
      return NextResponse.json(note, { status: 201 });
    }

    // 2. Add a new Care Circle Member
    if (action === "ADD_MEMBER") {
      const {
        profileId,
        name,
        role,
        relation,
        email,
        phone,
        notifyMissedDoses,
        notifyUpcomingDoses,
        notifyAppointments,
        notifyEmergencySOS,
      } = body;

      if (!profileId || !name || !email) {
        return NextResponse.json(
          { error: "profileId, name, and email are required" },
          { status: 400 }
        );
      }

      const member = await prisma.careCircleMember.create({
        data: {
          profileId,
          name,
          role: role || "FAMILY",
          relation: relation || "Care Circle Member",
          email,
          phone: phone || null,
          notifyMissedDoses: notifyMissedDoses !== undefined ? Boolean(notifyMissedDoses) : true,
          notifyUpcomingDoses: notifyUpcomingDoses !== undefined ? Boolean(notifyUpcomingDoses) : false,
          notifyAppointments: notifyAppointments !== undefined ? Boolean(notifyAppointments) : true,
          notifyEmergencySOS: notifyEmergencySOS !== undefined ? Boolean(notifyEmergencySOS) : true,
        },
      });
      return NextResponse.json(member, { status: 201 });
    }

    // 3. Emergency SOS Trigger
    if (action === "EMERGENCY_SOS") {
      const { profileId } = body;
      const profile = await prisma.elderlyProfile.findUnique({
        where: { id: profileId },
        include: { careCircle: true },
      });

      if (!profile) {
        return NextResponse.json({ error: "Profile not found" }, { status: 404 });
      }

      const seniorName = profile.preferredName || profile.fullName;
      const html = generateSosAlertEmail({
        seniorName,
        emergencyPhone: profile.emergencyPhone,
        hospitalPreference: profile.hospitalPreference,
        allergies: profile.allergies,
      });

      const sosRecipients = profile.careCircle.filter((m) => m.notifyEmergencySOS && m.email);
      const emailResults = [];

      for (const member of sosRecipients) {
        const res = await sendCareNotification({
          profileId: profile.id,
          recipientEmail: member.email,
          recipientName: member.name,
          type: "SOS_EMERGENCY",
          subject: `🚨 CRITICAL EMERGENCY SOS: ${seniorName} needs assistance!`,
          htmlContent: html,
        });
        emailResults.push(res);
      }

      // Also create an urgent LoveNote / alert item
      await prisma.loveNote.create({
        data: {
          profileId: profile.id,
          senderName: "EMERGENCY BEACON",
          senderRole: "CARETAKER",
          message: `🚨 Emergency SOS beacon triggered at ${new Date().toLocaleTimeString()}. Care circle email alerts dispatched immediately!`,
          mediaEmoji: "🚨",
        },
      });

      return NextResponse.json({
        success: true,
        seniorName,
        recipientsNotified: sosRecipients.length,
        emailResults,
      });
    }

    // 4. Mark Love Note as Read
    if (action === "MARK_READ") {
      const { noteId } = body;
      const updated = await prisma.loveNote.update({
        where: { id: noteId },
        data: { isRead: true },
      });
      return NextResponse.json(updated);
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error processing care circle request";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
