import nodemailer from "nodemailer";
import prisma from "./prisma";

// Cache test transporter if using Ethereal
let cachedTransporter: nodemailer.Transporter | null = null;

export async function getTransporter() {
  if (cachedTransporter) return cachedTransporter;

  if (process.env.EMAIL_SERVER_USER && process.env.EMAIL_SERVER_PASSWORD) {
    cachedTransporter = nodemailer.createTransport({
      host: process.env.EMAIL_SERVER_HOST || "smtp.ethereal.email",
      port: Number(process.env.EMAIL_SERVER_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_SERVER_USER,
        pass: process.env.EMAIL_SERVER_PASSWORD,
      },
    });
  } else {
    // Generate automatic Ethereal test account for dev mode
    try {
      const testAccount = await nodemailer.createTestAccount();
      cachedTransporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
    } catch {
      // Fallback: Sendmail or json transport
      cachedTransporter = nodemailer.createTransport({
        jsonTransport: true,
      });
    }
  }

  return cachedTransporter;
}

export interface SendEmailOptions {
  profileId: string;
  recipientEmail: string;
  recipientName: string;
  type: "MISSED_DOSE" | "UPCOMING_DOSE" | "APPOINTMENT_REMINDER" | "REFILL_ALERT" | "SOS_EMERGENCY";
  subject: string;
  htmlContent: string;
  textContent?: string;
}

export async function sendCareNotification({
  profileId,
  recipientEmail,
  recipientName,
  type,
  subject,
  htmlContent,
  textContent,
}: SendEmailOptions) {
  try {
    const transporter = await getTransporter();
    const fromAddress = process.env.EMAIL_FROM || "CareRing Alerts <alerts@carering.health>";

    const info = await transporter.sendMail({
      from: fromAddress,
      to: `"${recipientName}" <${recipientEmail}>`,
      subject: subject,
      text: textContent || subject,
      html: htmlContent,
    });

    let etherealUrl: string | null = null;
    const testUrl = nodemailer.getTestMessageUrl(info);
    if (testUrl) {
      etherealUrl = testUrl.toString();
    }

    // Persist to NotificationLog so users, caretakers, and family can review email audit trails
    const log = await prisma.notificationLog.create({
      data: {
        profileId,
        recipientEmail,
        recipientName,
        type,
        subject,
        content: htmlContent,
        status: "SENT",
        etherealUrl: etherealUrl,
      },
    });

    return { success: true, messageId: info.messageId, etherealUrl, logId: log.id };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Unknown error";
    console.error("Failed to send email notification:", errorMsg);

    // Still record failed notification for transparency
    const log = await prisma.notificationLog.create({
      data: {
        profileId,
        recipientEmail,
        recipientName,
        type,
        subject,
        content: htmlContent,
        status: "FAILED",
      },
    });

    return { success: false, error: errorMsg, logId: log.id };
  }
}
