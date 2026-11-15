import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { checkDrugInteractions, checkFoodAdvisories } from "@/lib/drugSafetyEngine";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const profileId = searchParams.get("profileId");

    if (!profileId) {
      return NextResponse.json({ error: "profileId is required" }, { status: 400 });
    }

    const activeMeds = await prisma.medication.findMany({
      where: { profileId, active: true },
      select: { name: true, dosage: true, purpose: true },
    });

    const medNames = activeMeds.map((m) => m.name);
    const interactions = checkDrugInteractions(medNames);
    const foodAdvisories = checkFoodAdvisories(medNames);

    return NextResponse.json({
      medicationCount: activeMeds.length,
      medications: activeMeds,
      interactions,
      foodAdvisories,
      safetyScore: interactions.some((i) => i.severity === "HIGH")
        ? "ACTION_REQUIRED"
        : interactions.length > 0
        ? "MONITOR"
        : "OPTIMAL",
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error checking drug safety";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { newMedName, existingMedNames } = body;

    if (!newMedName) {
      return NextResponse.json({ error: "newMedName is required" }, { status: 400 });
    }

    const testNames = [newMedName, ...(existingMedNames || [])];
    const interactions = checkDrugInteractions(testNames);
    const foodAdvisories = checkFoodAdvisories([newMedName]);

    return NextResponse.json({
      newMedication: newMedName,
      potentialInteractions: interactions,
      foodAdvisories,
      isSafe: !interactions.some((i) => i.severity === "HIGH"),
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error evaluating drug interaction";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
