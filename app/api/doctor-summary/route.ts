import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const profileId = searchParams.get("profileId");

    if (!profileId) {
      return NextResponse.json({ error: "profileId is required" }, { status: 400 });
    }

    const profile = await prisma.elderlyProfile.findUnique({
      where: { id: profileId },
      include: {
        careCircle: true,
        medications: {
          where: { active: true },
          orderBy: { name: "asc" },
        },
        appointments: {
          where: { status: "UPCOMING" },
          orderBy: { appointmentDate: "asc" },
        },
        routines: true,
        vitalLogs: {
          orderBy: { measuredAt: "desc" },
          take: 20,
        },
      },
    });

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    // Calculate 30-day adherence
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split("T")[0];

    const recentDoses = await prisma.doseScheduleLog.findMany({
      where: {
        profileId,
        scheduledDate: { gte: thirtyDaysAgoStr },
      },
    });

    const totalRecent = recentDoses.length;
    const takenRecent = recentDoses.filter((d) => d.status === "TAKEN").length;
    const missedRecent = recentDoses.filter((d) => d.status === "MISSED").length;
    const adherenceRate30d = totalRecent > 0 ? Math.round((takenRecent / totalRecent) * 100) : 100;

    return NextResponse.json({
      generatedAt: new Date().toISOString(),
      profile,
      adherence: {
        adherenceRate30d,
        totalDosesScheduled: totalRecent,
        takenCount: takenRecent,
        missedCount: missedRecent,
      },
      medications: profile.medications,
      vitals: profile.vitalLogs,
      upcomingAppointments: profile.appointments,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error generating clinical summary";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
