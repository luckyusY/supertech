import "server-only";
import nodemailer from "nodemailer";

type EmailPayload = {
  to: string;
  subject: string;
  text: string;
  html: string;
};

function getSmtpPort() {
  const value = Number.parseInt(process.env.SMTP_PORT ?? "465", 10);
  return Number.isFinite(value) ? value : 465;
}

export function hasEmailConfig() {
  return Boolean(
    process.env.RESEND_API_KEY ||
      (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASSWORD),
  );
}

export async function sendEmail({ to, subject, text, html }: EmailPayload) {
  if (!hasEmailConfig()) {
    throw new Error("Email sending is not configured.");
  }

  if (process.env.RESEND_API_KEY) {
    const fromEmail = process.env.FROM_EMAIL ?? "support@supertech.africa";
    const fromName = process.env.FROM_NAME ?? "SuperTech";

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: `${fromName} <${fromEmail}>`,
        to,
        subject,
        text,
        html,
      }),
    });

    if (!response.ok) {
      const message = await response.text();
      throw new Error(`Resend email failed: ${message}`);
    }

    return;
  }

  const port = getSmtpPort();
  const secure =
    process.env.SMTP_SECURE === "true" ||
    (!process.env.SMTP_SECURE && port === 465);

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  const fromEmail = process.env.FROM_EMAIL ?? process.env.SMTP_USER;
  const fromName = process.env.FROM_NAME ?? "SuperTech";

  await transporter.sendMail({
    from: `"${fromName}" <${fromEmail}>`,
    to,
    subject,
    text,
    html,
  });
}
