import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const { profileId, passcode } = await request.json();

    if (!profileId || !passcode) {
      return NextResponse.json(
        { error: "Profile ID and passcode are required" },
        { status: 400 }
      );
    }

    const profile = await prisma.elderlyProfile.findUnique({
      where: { id: profileId },
      select: {
        id: true,
        fullName: true,
        preferredName: true,
        elderlyPasscode: true,
        familyPasscode: true,
        caretakerPasscode: true,
      },
    });

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const cleanPasscode = String(passcode).trim();

    if (cleanPasscode === profile.elderlyPasscode) {
      return NextResponse.json({
        valid: true,
        role: "SENIOR",
        seniorName: profile.preferredName || profile.fullName,
      });
    }

    if (cleanPasscode === profile.familyPasscode) {
      return NextResponse.json({
        valid: true,
        role: "FAMILY",
        seniorName: profile.preferredName || profile.fullName,
      });
    }

    if (cleanPasscode === profile.caretakerPasscode) {
      return NextResponse.json({
        valid: true,
        role: "CARETAKER",
        seniorName: profile.preferredName || profile.fullName,
      });
    }

    return NextResponse.json(
      { valid: false, error: "Incorrect passcode. Please try again." },
      { status: 401 }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Passcode verification failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
