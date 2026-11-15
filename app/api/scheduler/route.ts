import { NextResponse } from "next/server";
import { runHealthcareSchedulerCheck } from "@/lib/schedulerService";

export async function POST() {
  try {
    const checkResult = await runHealthcareSchedulerCheck();
    return NextResponse.json(checkResult);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error executing scheduler";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET() {
  try {
    const checkResult = await runHealthcareSchedulerCheck();
    return NextResponse.json(checkResult);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error executing scheduler";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
