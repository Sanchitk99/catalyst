export function generateMissedDoseEmail({
  seniorName,
  medicationName,
  dosage,
  scheduledTime,
  instructions,
  profileId,
}: {
  seniorName: string;
  medicationName: string;
  dosage: string;
  scheduledTime: string;
  instructions: string;
  profileId: string;
}) {
  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background-color: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0;">
      <div style="background-color: #e11d48; color: white; padding: 16px 20px; border-radius: 8px 8px 0 0; text-align: center;">
        <h2 style="margin: 0; font-size: 20px;">⚠️ Missed Medication Alert</h2>
        <p style="margin: 4px 0 0 0; opacity: 0.9; font-size: 14px;">CareRing Elderly Safety Network</p>
      </div>
      <div style="background-color: white; padding: 24px; border: 1px solid #fecdd3; border-top: none; border-radius: 0 0 8px 8px;">
        <p style="font-size: 16px; color: #334155;">Hello Care Circle Member,</p>
        <p style="font-size: 16px; color: #334155;">
          This is an automated safety alert regarding <strong>${seniorName}</strong>. A scheduled medication dose was not marked as taken within the designated window.
        </p>
        
        <div style="background-color: #fff1f2; border-left: 4px solid #e11d48; padding: 16px; margin: 20px 0; border-radius: 4px;">
          <h3 style="margin: 0 0 8px 0; color: #9f1239; font-size: 18px;">${medicationName} (${dosage})</h3>
          <p style="margin: 4px 0; color: #475569;"><strong>Scheduled Time:</strong> ${scheduledTime}</p>
          <p style="margin: 4px 0; color: #475569;"><strong>Instructions:</strong> ${instructions || "Take as directed"}</p>
          <p style="margin: 4px 0; color: #e11d48; font-weight: 600;">Status: OVERDUE / UNCONFIRMED</p>
        </div>

        <p style="font-size: 15px; color: #475569; line-height: 1.5;">
          Please reach out to ${seniorName} to check in gently and ensure they are feeling well, or check the CareRing platform to verify if the dose was taken or needs to be safely rescheduled.
        </p>

        <div style="margin-top: 24px; text-align: center;">
          <a href="http://localhost:3000?profile=${profileId}" style="display: inline-block; background-color: #1e3a8a; color: white; padding: 12px 24px; font-weight: bold; border-radius: 8px; text-decoration: none; font-size: 15px;">Open Senior Care Profile</a>
        </div>
      </div>
      <div style="text-align: center; margin-top: 16px; color: #94a3b8; font-size: 12px;">
        CareRing Health &bull; Keeping Loved Ones Connected &amp; Safe
      </div>
    </div>
  `;
}

export function generateUpcomingDoseEmail({
  seniorName,
  medicationName,
  dosage,
  scheduledTime,
  instructions,
}: {
  seniorName: string;
  medicationName: string;
  dosage: string;
  scheduledTime: string;
  instructions: string;
}) {
  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background-color: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0;">
      <div style="background-color: #2563eb; color: white; padding: 16px 20px; border-radius: 8px 8px 0 0; text-align: center;">
        <h2 style="margin: 0; font-size: 20px;">⏰ Upcoming Medication Reminder</h2>
        <p style="margin: 4px 0 0 0; opacity: 0.9; font-size: 14px;">CareRing Daily Schedule</p>
      </div>
      <div style="background-color: white; padding: 24px; border-radius: 0 0 8px 8px;">
        <p style="font-size: 16px; color: #334155;">Hello,</p>
        <p style="font-size: 16px; color: #334155;">
          Upcoming dose reminder for <strong>${seniorName}</strong> scheduled at <strong>${scheduledTime}</strong>:
        </p>
        
        <div style="background-color: #eff6ff; border-left: 4px solid #2563eb; padding: 16px; margin: 20px 0; border-radius: 4px;">
          <h3 style="margin: 0 0 8px 0; color: #1e40af; font-size: 18px;">${medicationName} (${dosage})</h3>
          <p style="margin: 4px 0; color: #475569;"><strong>Time:</strong> ${scheduledTime}</p>
          <p style="margin: 4px 0; color: #475569;"><strong>Notes:</strong> ${instructions || "Take with water"}</p>
        </div>
      </div>
    </div>
  `;
}

export function generateAppointmentEmail({
  seniorName,
  doctorName,
  specialty,
  clinicName,
  appointmentDate,
  preVisitNotes,
  companionRequired,
}: {
  seniorName: string;
  doctorName: string;
  specialty: string;
  clinicName: string;
  appointmentDate: string;
  preVisitNotes?: string | null;
  companionRequired: boolean;
}) {
  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background-color: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0;">
      <div style="background-color: #059669; color: white; padding: 16px 20px; border-radius: 8px 8px 0 0; text-align: center;">
        <h2 style="margin: 0; font-size: 20px;">📅 Upcoming Doctor Appointment</h2>
        <p style="margin: 4px 0 0 0; opacity: 0.9; font-size: 14px;">Healthcare Calendar Alert</p>
      </div>
      <div style="background-color: white; padding: 24px; border-radius: 0 0 8px 8px;">
        <p style="font-size: 16px; color: #334155;">Hello Care Circle,</p>
        <p style="font-size: 16px; color: #334155;">
          A medical appointment is scheduled for <strong>${seniorName}</strong>:
        </p>
        
        <div style="background-color: #ecfdf5; border-left: 4px solid #059669; padding: 16px; margin: 20px 0; border-radius: 4px;">
          <h3 style="margin: 0 0 8px 0; color: #065f46; font-size: 18px;">${doctorName} &bull; ${specialty}</h3>
          <p style="margin: 4px 0; color: #334155;"><strong>Date &amp; Time:</strong> ${appointmentDate}</p>
          <p style="margin: 4px 0; color: #334155;"><strong>Clinic / Location:</strong> ${clinicName}</p>
          ${preVisitNotes ? `<p style="margin: 8px 0 4px 0; color: #b45309; font-weight: 500;"><strong>Preparation Notes:</strong> ${preVisitNotes}</p>` : ""}
          <p style="margin: 4px 0; color: #475569;"><strong>Companion Needed:</strong> ${companionRequired ? "Yes (Please coordinate who will accompany)" : "No"}</p>
        </div>
      </div>
    </div>
  `;
}

export function generateSosAlertEmail({
  seniorName,
  emergencyPhone,
  hospitalPreference,
  allergies,
}: {
  seniorName: string;
  emergencyPhone: string;
  hospitalPreference: string;
  allergies: string;
}) {
  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background-color: #f8fafc; border-radius: 12px; border: 2px solid #dc2626;">
      <div style="background-color: #dc2626; color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
        <h1 style="margin: 0; font-size: 24px; letter-spacing: 1px;">🚨 EMERGENCY SOS BEACON ACTIVATED</h1>
        <p style="margin: 6px 0 0 0; font-size: 15px;">Immediate Care Circle Action Requested</p>
      </div>
      <div style="background-color: white; padding: 24px; border-radius: 0 0 8px 8px;">
        <p style="font-size: 18px; color: #1e293b; font-weight: 600;">
          ${seniorName} has pressed the Emergency SOS Assistance Button on their CareRing device.
        </p>

        <div style="background-color: #fef2f2; border: 1px solid #fecaca; padding: 16px; border-radius: 8px; margin: 20px 0;">
          <h4 style="margin: 0 0 8px 0; color: #991b1b;">Immediate Medical Profile Data:</h4>
          <p style="margin: 4px 0; color: #374151;"><strong>Emergency Phone:</strong> ${emergencyPhone}</p>
          <p style="margin: 4px 0; color: #374151;"><strong>Preferred Hospital:</strong> ${hospitalPreference}</p>
          <p style="margin: 4px 0; color: #991b1b; font-weight: 600;"><strong>Known Allergies:</strong> ${allergies}</p>
        </div>

        <p style="font-size: 15px; color: #475569;">
          Please immediately call ${seniorName} or your local emergency response service if they cannot be reached.
        </p>
      </div>
    </div>
  `;
}
