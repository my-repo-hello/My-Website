import nodemailer from 'nodemailer';

let transporter: nodemailer.Transporter;

const getTransporter = async (): Promise<nodemailer.Transporter> => {
  if (transporter) return transporter;

  if (process.env.SMTP_USER && process.env.SMTP_PASS) {
    // Use configured SMTP
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.ethereal.email',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  } else {
    // Create Ethereal test account
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
    console.log('📧 Ethereal email account created:', testAccount.user);
  }

  return transporter;
};

export const sendEmail = async (
  to: string,
  subject: string,
  html: string
): Promise<void> => {
  try {
    const transport = await getTransporter();
    const info = await transport.sendMail({
      from: process.env.SMTP_FROM || '"Team Hub" <noreply@teamhub.dev>',
      to,
      subject,
      html,
    });

    // Log preview URL for Ethereal
    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.log('📧 Email preview URL:', previewUrl);
    }
  } catch (error) {
    console.error('Email send error:', error);
    throw new Error('Failed to send email');
  }
};

export const sendOTPEmail = async (to: string, otp: string): Promise<void> => {
  const html = `
    <div style="font-family: 'Segoe UI', sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #1a1a2e; color: #e0e0e0; border-radius: 12px;">
      <h1 style="color: #818cf8; margin-bottom: 8px;">🔐 Password Reset</h1>
      <p style="color: #a0a0b0;">You requested a password reset for your Team Hub account.</p>
      <div style="background: #16213e; padding: 24px; border-radius: 8px; text-align: center; margin: 24px 0;">
        <p style="margin: 0 0 8px; color: #a0a0b0; font-size: 14px;">Your verification code:</p>
        <h2 style="margin: 0; font-size: 36px; letter-spacing: 8px; color: #818cf8; font-family: monospace;">${otp}</h2>
      </div>
      <p style="color: #a0a0b0; font-size: 14px;">This code expires in <strong>10 minutes</strong>.</p>
      <p style="color: #666; font-size: 12px; margin-top: 24px;">If you didn't request this, you can safely ignore this email.</p>
    </div>
  `;
  await sendEmail(to, 'Team Hub - Password Reset Code', html);
};

export const sendReminderEmail = async (
  to: string,
  title: string,
  description: string,
  time: string
): Promise<void> => {
  const html = `
    <div style="font-family: 'Segoe UI', sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #1a1a2e; color: #e0e0e0; border-radius: 12px;">
      <h1 style="color: #818cf8; margin-bottom: 8px;">⏰ Reminder</h1>
      <div style="background: #16213e; padding: 24px; border-radius: 8px; margin: 24px 0;">
        <h2 style="margin: 0 0 8px; color: #f0f0f0;">${title}</h2>
        <p style="margin: 0 0 16px; color: #a0a0b0;">${description || 'No description'}</p>
        <p style="margin: 0; color: #818cf8; font-weight: 600;">📅 ${time}</p>
      </div>
      <p style="color: #666; font-size: 12px;">This is an automated reminder from Team Hub.</p>
    </div>
  `;
  await sendEmail(to, `Reminder: ${title}`, html);
};
