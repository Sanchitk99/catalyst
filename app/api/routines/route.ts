import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const profileId = searchParams.get("profileId");

    if (!profileId) {
      return NextResponse.json({ error: "Profile ID required" }, { status: 400 });
    }

    const routines = await prisma.healthcareRoutine.findMany({
      where: { profileId },
      orderBy: { targetTime: "asc" },
    });

    const vitals = await prisma.vitalLog.findMany({
      where: { profileId },
      orderBy: { measuredAt: "desc" },
      take: 20,
    });

    return NextResponse.json({ routines, vitals });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error fetching routines & vitals";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action } = body;

    // 1. Toggle or update routine
    if (action === "TOGGLE_ROUTINE") {
      const { routineId, completed } = body;
      const updated = await prisma.healthcareRoutine.update({
        where: { id: routineId },
        data: {
          completedToday: completed,
          lastCompletedAt: completed ? new Date() : null,
        },
      });
      return NextResponse.json(updated);
    }

    // 2. Add a new routine
    if (action === "ADD_ROUTINE") {
      const { profileId, title, category, targetTime, notes } = body;
      const created = await prisma.healthcareRoutine.create({
        data: {
          profileId,
          title,
          category: category || "VITAL_CHECK",
          targetTime: targetTime || "09:00",
          notes: notes || "",
          completedToday: false,
        },
      });
      return NextResponse.json(created, { status: 201 });
    }

    // 3. Log a new vital measurement
    if (action === "LOG_VITAL") {
      const { profileId, type, value, unit, measuredBy, notes } = body;
      const created = await prisma.vitalLog.create({
        data: {
          profileId,
          type: type || "BLOOD_PRESSURE",
          value,
          unit: unit || "",
          measuredBy: measuredBy || "Self",
          notes: notes || "",
        },
      });
      return NextResponse.json(created, { status: 201 });
    }

    return NextResponse.json({ error: "Invalid action specified" }, { status: 400 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error updating routine or vital";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
