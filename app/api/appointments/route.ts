import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const profileId = searchParams.get("profileId");

    if (!profileId) {
      return NextResponse.json({ error: "Profile ID required" }, { status: 400 });
    }

    const appointments = await prisma.appointment.findMany({
      where: { profileId },
      orderBy: { appointmentDate: "asc" },
    });

    return NextResponse.json(appointments);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error fetching appointments";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      profileId,
      doctorName,
      specialty,
      clinicName,
      address,
      contactPhone,
      appointmentDate,
      purpose,
      preVisitNotes,
      companionRequired,
      companionName,
      transportArranged,
    } = body;

    if (!profileId || !doctorName || !appointmentDate || !clinicName) {
      return NextResponse.json(
        { error: "Required fields missing (profileId, doctorName, clinicName, appointmentDate)" },
        { status: 400 }
      );
    }

    const appointment = await prisma.appointment.create({
      data: {
        profileId,
        doctorName,
        specialty: specialty || "General Physician",
        clinicName,
        address: address || "",
        contactPhone: contactPhone || null,
        appointmentDate: new Date(appointmentDate),
        purpose: purpose || "General Consultation",
        preVisitNotes: preVisitNotes || null,
        companionRequired: companionRequired !== undefined ? Boolean(companionRequired) : true,
        companionName: companionName || null,
        transportArranged: transportArranged !== undefined ? Boolean(transportArranged) : false,
      },
    });

    return NextResponse.json(appointment, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error creating appointment";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, appointmentDate, ...data } = body;

    if (!id) {
      return NextResponse.json({ error: "Appointment ID required" }, { status: 400 });
    }

    const updatePayload: Record<string, unknown> = { ...data };
    if (appointmentDate) {
      updatePayload.appointmentDate = new Date(appointmentDate);
    }

    const updated = await prisma.appointment.update({
      where: { id },
      data: updatePayload,
    });

    return NextResponse.json(updated);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error updating appointment";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
