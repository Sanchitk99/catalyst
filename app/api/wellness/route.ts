import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { sendCareNotification } from "@/lib/emailService";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const profileId = searchParams.get("profileId");

    if (!profileId) {
      return NextResponse.json({ error: "profileId is required" }, { status: 400 });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const logs = await prisma.vitalLog.findMany({
      where: {
        profileId,
        measuredAt: { gte: today },
        type: { in: ["MOOD", "PAIN_LEVEL", "HYDRATION"] },
      },
      orderBy: { measuredAt: "desc" },
    });

    const latestMood = logs.find((l) => l.type === "MOOD")?.value || "GOOD";
    const latestPain = logs.find((l) => l.type === "PAIN_LEVEL")?.value || "NONE";
    const hydrationLogs = logs.filter((l) => l.type === "HYDRATION");
    const glassesLogged = hydrationLogs.length > 0 ? Number(hydrationLogs[0].value) || 0 : 0;

    return NextResponse.json({
      date: today.toISOString().split("T")[0],
      mood: latestMood,
      painLevel: latestPain,
      waterGlasses: glassesLogged,
      targetWaterGlasses: 8,
      recentLogs: logs,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error fetching wellness data";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { profileId, mood, painLevel, waterGlasses, notes } = body;

    if (!profileId) {
      return NextResponse.json({ error: "profileId is required" }, { status: 400 });
    }

    const results = [];

    // 1. Log Mood
    if (mood) {
      const moodLog = await prisma.vitalLog.create({
        data: {
          profileId,
          type: "MOOD",
          value: mood,
          unit: "state",
          measuredBy: "Self (Check-in)",
          status: mood === "DIZZY" || mood === "UNWELL" ? "ELEVATED" : "NORMAL",
          notes: notes || `Senior feeling: ${mood}`,
        },
      });
      results.push(moodLog);

      // If senior feels DIZZY or UNWELL, trigger immediate email notification to Care Circle!
      if (mood === "DIZZY" || mood === "UNWELL") {
        const profile = await prisma.elderlyProfile.findUnique({
          where: { id: profileId },
          include: { careCircle: true },
        });

        if (profile) {
          const recipients = profile.careCircle.filter((m) => m.email);
          for (const member of recipients) {
            await sendCareNotification({
              profileId: profile.id,
              recipientEmail: member.email,
              recipientName: member.name,
              type: "SOS_EMERGENCY",
              subject: `⚠️ Health Advisory: ${profile.preferredName || profile.fullName} reported feeling ${mood}`,
              htmlContent: `
                <div style="font-family: sans-serif; max-width: 600px; padding: 20px; border: 1px solid #fecaca; border-radius: 8px;">
                  <h3 style="color: #b91c1c;">Daily Check-In Symptom Alert</h3>
                  <p><strong>${profile.preferredName || profile.fullName}</strong> just checked in on CareRing reporting feeling <strong>${mood}</strong>.</p>
                  <p>Please check in by phone to confirm their well-being and hydration.</p>
                  <p>Emergency Contact: ${profile.emergencyPhone}</p>
                </div>
              `,
            });
          }
        }
      }
    }

    // 2. Log Pain Level
    if (painLevel) {
      const painLog = await prisma.vitalLog.create({
        data: {
          profileId,
          type: "PAIN_LEVEL",
          value: painLevel,
          unit: "scale",
          measuredBy: "Self (Check-in)",
          status: painLevel === "SEVERE" ? "CRITICAL" : "NORMAL",
          notes: notes || `Pain level: ${painLevel}`,
        },
      });
      results.push(painLog);
    }

    // 3. Log Hydration
    if (waterGlasses !== undefined) {
      const waterLog = await prisma.vitalLog.create({
        data: {
          profileId,
          type: "HYDRATION",
          value: String(waterGlasses),
          unit: "glasses",
          measuredBy: "Self (Check-in)",
          status: "NORMAL",
          notes: `${waterGlasses} of 8 glasses logged`,
        },
      });
      results.push(waterLog);
    }

    return NextResponse.json({ success: true, results }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error saving wellness data";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
