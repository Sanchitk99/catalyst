import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (id) {
      const profile = await prisma.elderlyProfile.findUnique({
        where: { id },
        include: {
          careCircle: true,
          medications: {
            where: { active: true },
          },
          appointments: {
            where: { status: "UPCOMING" },
            orderBy: { appointmentDate: "asc" },
          },
          routines: true,
          loveNotes: {
            orderBy: { createdAt: "desc" },
            take: 10,
          },
        },
      });

      if (!profile) {
        return NextResponse.json({ error: "Profile not found" }, { status: 404 });
      }

      return NextResponse.json(profile);
    }

    // Default: Return the first active profile or all profiles
    const profiles = await prisma.elderlyProfile.findMany({
      include: {
        careCircle: true,
        medications: {
          where: { active: true },
        },
        appointments: {
          where: { status: "UPCOMING" },
          orderBy: { appointmentDate: "asc" },
        },
      },
    });

    return NextResponse.json(profiles);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error fetching profiles";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, ...data } = body;

    if (!id) {
      return NextResponse.json({ error: "Profile ID is required" }, { status: 400 });
    }

    const updated = await prisma.elderlyProfile.update({
      where: { id },
      data,
    });

    return NextResponse.json(updated);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error updating profile";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
