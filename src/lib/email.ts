import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

let transporter: Transporter | null = null;

export function getTransporter() {
  if (transporter) return transporter;

  const host = process.env.SMTP_HOST || 'localhost';
  const port = parseInt(process.env.SMTP_PORT || '1025', 10);
  const user = process.env.SMTP_USER || '';
  const pass = process.env.SMTP_PASS || '';
  const secure = process.env.SMTP_SECURE === 'true';

  transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: user ? { user, pass } : undefined,
  });

  return transporter;
}

export async function sendEmail({ to, subject, html, text }: EmailOptions) {
  const transport = getTransporter();
  await transport.sendMail({
    from: process.env.SMTP_FROM || 'noreply@registromercantil.cu',
    to,
    subject,
    text,
    html,
  });
}
