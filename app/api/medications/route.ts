import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const profileId = searchParams.get("profileId");

    if (!profileId) {
      return NextResponse.json({ error: "Profile ID required" }, { status: 400 });
    }

    const medications = await prisma.medication.findMany({
      where: { profileId, active: true },
      orderBy: { name: "asc" },
    });

    return NextResponse.json(medications);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error fetching medications";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      profileId,
      name,
      brandName,
      dosage,
      form,
      color,
      shape,
      instructions,
      purpose,
      prescribingDoctor,
      totalPills,
      remainingPills,
      refillThreshold,
      refillPharmacy,
      pharmacyPhone,
      scheduleTimes,
      scheduleType,
      daysOfWeek,
    } = body;

    if (!profileId || !name || !dosage || !scheduleTimes) {
      return NextResponse.json(
        { error: "Required fields missing (profileId, name, dosage, scheduleTimes)" },
        { status: 400 }
      );
    }

    const medication = await prisma.medication.create({
      data: {
        profileId,
        name,
        brandName: brandName || null,
        dosage,
        form: form || "Tablet",
        color: color || "White",
        shape: shape || "Round",
        instructions: instructions || "Take as directed",
        purpose: purpose || "General health",
        prescribingDoctor: prescribingDoctor || null,
        totalPills: Number(totalPills) || 30,
        remainingPills: Number(remainingPills) || 30,
        refillThreshold: Number(refillThreshold) || 7,
        refillPharmacy: refillPharmacy || null,
        pharmacyPhone: pharmacyPhone || null,
        scheduleTimes: typeof scheduleTimes === "string" ? scheduleTimes : JSON.stringify(scheduleTimes),
        scheduleType: scheduleType || "DAILY",
        daysOfWeek: daysOfWeek ? (typeof daysOfWeek === "string" ? daysOfWeek : JSON.stringify(daysOfWeek)) : null,
      },
    });

    // Also auto-generate dose schedule entries for today for this new medication
    const todayStr = new Date().toISOString().split("T")[0];
    const times = JSON.parse(medication.scheduleTimes) as string[];

    for (const time of times) {
      await prisma.doseScheduleLog.create({
        data: {
          profileId,
          medicationId: medication.id,
          scheduledDate: todayStr,
          scheduledTime: time,
          status: "PENDING",
        },
      });
    }

    return NextResponse.json(medication, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error creating medication";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, action, ...data } = body;

    if (!id) {
      return NextResponse.json({ error: "Medication ID required" }, { status: 400 });
    }

    // Refill action
    if (action === "REFILL") {
      const refillAmount = Number(body.refillAmount) || 30;
      const updated = await prisma.medication.update({
        where: { id },
        data: {
          remainingPills: { increment: refillAmount },
        },
      });
      return NextResponse.json(updated);
    }

    const updated = await prisma.medication.update({
      where: { id },
      data,
    });

    return NextResponse.json(updated);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error updating medication";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Medication ID required" }, { status: 400 });
    }

    // Soft delete: mark inactive
    const updated = await prisma.medication.update({
      where: { id },
      data: { active: false },
    });

    return NextResponse.json(updated);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error deleting medication";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
