import prisma from "./prisma";
import {
  generateMissedDoseEmail,
  generateUpcomingDoseEmail,
  generateAppointmentEmail,
} from "./emailTemplates";
import { sendCareNotification } from "./emailService";

export async function runHealthcareSchedulerCheck() {
  const now = new Date();
  const todayStr = now.toISOString().split("T")[0]; // YYYY-MM-DD
  const currentHours = String(now.getHours()).padStart(2, "0");
  const currentMinutes = String(now.getMinutes()).padStart(2, "0");
  const currentTimeStr = `${currentHours}:${currentMinutes}`;
  const nowTotalMinutes = now.getHours() * 60 + now.getMinutes();

  const results = {
    checkedAt: now.toISOString(),
    missedDosesFound: 0,
    upcomingRemindersSent: 0,
    missedAlertsSent: 0,
    appointmentRemindersSent: 0,
    errors: [] as string[],
  };

  try {
    // 1. Check for Overdue Doses (Scheduled time was > 30 minutes ago, still PENDING)
    const pendingDoses = await prisma.doseScheduleLog.findMany({
      where: {
        scheduledDate: todayStr,
        status: "PENDING",
      },
      include: {
        medication: true,
        profile: {
          include: {
            careCircle: true,
          },
        },
      },
    });

    for (const dose of pendingDoses) {
      const [doseHour, doseMin] = dose.scheduledTime.split(":").map(Number);
      const doseTotalMinutes = doseHour * 60 + doseMin;

      // If scheduled time was more than 30 minutes ago, mark as MISSED and alert Care Circle
      if (nowTotalMinutes - doseTotalMinutes >= 30) {
        results.missedDosesFound++;

        // Update status to MISSED
        await prisma.doseScheduleLog.update({
          where: { id: dose.id },
          data: {
            status: "MISSED",
          },
        });

        // Send missed dose alerts if not already sent
        if (!dose.missedAlertSent) {
          const emailRecipients = dose.profile.careCircle.filter(
            (m) => m.notifyMissedDoses && m.email
          );

          for (const member of emailRecipients) {
            const html = generateMissedDoseEmail({
              seniorName: dose.profile.preferredName || dose.profile.fullName,
              medicationName: dose.medication.name,
              dosage: dose.medication.dosage,
              scheduledTime: dose.scheduledTime,
              instructions: dose.medication.instructions,
              profileId: dose.profile.id,
            });

            await sendCareNotification({
              profileId: dose.profile.id,
              recipientEmail: member.email,
              recipientName: member.name,
              type: "MISSED_DOSE",
              subject: `⚠️ Urgent: Missed Medication Alert for ${dose.profile.preferredName || dose.profile.fullName} (${dose.medication.name})`,
              htmlContent: html,
            });

            results.missedAlertsSent++;
          }

          // Mark missed alert as sent
          await prisma.doseScheduleLog.update({
            where: { id: dose.id },
            data: { missedAlertSent: true },
          });
        }
      }
      // Check for upcoming doses (due in 0 to 30 mins)
      else if (
        doseTotalMinutes - nowTotalMinutes >= 0 &&
        doseTotalMinutes - nowTotalMinutes <= 30 &&
        !dose.reminderAlertSent
      ) {
        const emailRecipients = dose.profile.careCircle.filter(
          (m) => m.notifyUpcomingDoses && m.email
        );

        for (const member of emailRecipients) {
          const html = generateUpcomingDoseEmail({
            seniorName: dose.profile.preferredName || dose.profile.fullName,
            medicationName: dose.medication.name,
            dosage: dose.medication.dosage,
            scheduledTime: dose.scheduledTime,
            instructions: dose.medication.instructions,
          });

          await sendCareNotification({
            profileId: dose.profile.id,
            recipientEmail: member.email,
            recipientName: member.name,
            type: "UPCOMING_DOSE",
            subject: `⏰ Upcoming Medication Dose: ${dose.medication.name} at ${dose.scheduledTime}`,
            htmlContent: html,
          });

          results.upcomingRemindersSent++;
        }

        await prisma.doseScheduleLog.update({
          where: { id: dose.id },
          data: { reminderAlertSent: true },
        });
      }
    }

    // 2. Check for Upcoming Appointments in the next 24 Hours
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const upcomingAppointments = await prisma.appointment.findMany({
      where: {
        appointmentDate: {
          gte: now,
          lte: tomorrow,
        },
        status: "UPCOMING",
        reminderSent24h: false,
      },
      include: {
        profile: {
          include: {
            careCircle: true,
          },
        },
      },
    });

    for (const appt of upcomingAppointments) {
      const emailRecipients = appt.profile.careCircle.filter(
        (m) => m.notifyAppointments && m.email
      );

      const formattedDate = new Date(appt.appointmentDate).toLocaleString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });

      for (const member of emailRecipients) {
        const html = generateAppointmentEmail({
          seniorName: appt.profile.preferredName || appt.profile.fullName,
          doctorName: appt.doctorName,
          specialty: appt.specialty,
          clinicName: appt.clinicName,
          appointmentDate: formattedDate,
          preVisitNotes: appt.preVisitNotes,
          companionRequired: appt.companionRequired,
        });

        await sendCareNotification({
          profileId: appt.profile.id,
          recipientEmail: member.email,
          recipientName: member.name,
          type: "APPOINTMENT_REMINDER",
          subject: `📅 Doctor Appointment Reminder for ${appt.profile.preferredName || appt.profile.fullName}: ${appt.doctorName}`,
          htmlContent: html,
        });

        results.appointmentRemindersSent++;
      }

      await prisma.appointment.update({
        where: { id: appt.id },
        data: { reminderSent24h: true },
      });
    }

    return { success: true, ...results };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Scheduler error";
    results.errors.push(errorMsg);
    return { success: false, ...results, error: errorMsg };
  }
}
