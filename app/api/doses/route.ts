import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const profileId = searchParams.get("profileId");
    const date = searchParams.get("date") || new Date().toISOString().split("T")[0];

    if (!profileId) {
      return NextResponse.json({ error: "Profile ID required" }, { status: 400 });
    }

    // 1. Fetch existing dose logs for the date
    let doseLogs = await prisma.doseScheduleLog.findMany({
      where: {
        profileId,
        scheduledDate: date,
      },
      include: {
        medication: true,
      },
      orderBy: { scheduledTime: "asc" },
    });

    // 2. If no doses logged yet for this date, automatically initialize from active medications
    if (doseLogs.length === 0) {
      const activeMeds = await prisma.medication.findMany({
        where: { profileId, active: true },
      });

      for (const med of activeMeds) {
        try {
          const times = JSON.parse(med.scheduleTimes) as string[];
          for (const time of times) {
            await prisma.doseScheduleLog.create({
              data: {
                profileId,
                medicationId: med.id,
                scheduledDate: date,
                scheduledTime: time,
                status: "PENDING",
              },
            });
          }
        } catch {
          // In case scheduleTimes was single string
          await prisma.doseScheduleLog.create({
            data: {
              profileId,
              medicationId: med.id,
              scheduledDate: date,
              scheduledTime: "08:00",
              status: "PENDING",
            },
          });
        }
      }

      // Re-fetch after generation
      doseLogs = await prisma.doseScheduleLog.findMany({
        where: {
          profileId,
          scheduledDate: date,
        },
        include: {
          medication: true,
        },
        orderBy: { scheduledTime: "asc" },
      });
    }

    // Calculate adherence statistics
    const totalDoses = doseLogs.length;
    const takenDoses = doseLogs.filter((d) => d.status === "TAKEN").length;
    const missedDoses = doseLogs.filter((d) => d.status === "MISSED").length;
    const pendingDoses = doseLogs.filter((d) => d.status === "PENDING" || d.status === "SNOOZED").length;
    const adherenceRate = totalDoses > 0 ? Math.round((takenDoses / totalDoses) * 100) : 100;

    return NextResponse.json({
      date,
      totalDoses,
      takenDoses,
      missedDoses,
      pendingDoses,
      adherenceRate,
      doses: doseLogs,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error fetching doses";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id, status, takenBy, notes } = body;

    if (!id || !status) {
      return NextResponse.json({ error: "Dose ID and status are required" }, { status: 400 });
    }

    const currentDose = await prisma.doseScheduleLog.findUnique({
      where: { id },
      include: { medication: true },
    });

    if (!currentDose) {
      return NextResponse.json({ error: "Dose not found" }, { status: 404 });
    }

    const updated = await prisma.doseScheduleLog.update({
      where: { id },
      data: {
        status,
        takenAt: status === "TAKEN" ? new Date() : null,
        takenBy: status === "TAKEN" ? takenBy || "Self" : null,
        notes: notes !== undefined ? notes : currentDose.notes,
      },
      include: { medication: true },
    });

    // If marked as TAKEN, reduce medication inventory by 1 pill
    if (status === "TAKEN" && currentDose.status !== "TAKEN") {
      await prisma.medication.update({
        where: { id: currentDose.medicationId },
        data: {
          remainingPills: {
            decrement: 1,
          },
        },
      });
    }

    return NextResponse.json(updated);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error updating dose";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
