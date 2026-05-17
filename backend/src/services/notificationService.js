const nodemailer = require('nodemailer');
const twilio = require('twilio');

const env = require('../config/env');

let emailTransporter;
let smsClient;

const getEmailTransporter = () => {
  if (emailTransporter) return emailTransporter;

  if (!env.smtpHost || !env.smtpPort || !env.smtpUser || !env.smtpPass || !env.smtpFrom) {
    return null;
  }

  emailTransporter = nodemailer.createTransport({
    host: env.smtpHost,
    port: env.smtpPort,
    secure: env.smtpPort === 465,
    auth: {
      user: env.smtpUser,
      pass: env.smtpPass,
    },
  });

  return emailTransporter;
};

const getSmsClient = () => {
  if (smsClient) return smsClient;

  if (!env.twilioAccountSid || !env.twilioAuthToken || !env.twilioPhoneNumber) {
    return null;
  }

  smsClient = twilio(env.twilioAccountSid, env.twilioAuthToken);
  return smsClient;
};

const normalizePhoneNumber = (contact) => {
  if (contact.startsWith('+')) return contact;
  return `${env.smsDefaultCountryCode}${contact}`;
};

const buildOtpMessage = (otp, expiresAt) => {
  const expiresAtText = new Date(expiresAt).toLocaleString();
  return [
    'OTP Verification Code',
    '',
    `Your one-time password is: ${otp}`,
    `This code expires at: ${expiresAtText}`,
    '',
    'If you did not request this code, please ignore this message.',
    'Do not share this OTP with anyone.',
  ].join('\n');
};

const buildOtpEmailHtml = ({ otp, expiresAt, contact }) => {
  const expiresAtText = new Date(expiresAt).toLocaleString();

  return `
  <!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>OTP Verification Code</title>
    </head>
    <body style="margin:0;padding:0;background:#f4f6fb;font-family:Segoe UI,Arial,sans-serif;color:#1f2937;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#f4f6fb;padding:24px 12px;">
        <tr>
          <td align="center">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:620px;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e5e7eb;box-shadow:0 12px 36px rgba(15,23,42,0.12);">
              <tr>
                <td style="padding:28px 32px;background:linear-gradient(135deg,#0f8b7d,#14b8a6);color:#ffffff;">
                  <p style="margin:0;font-size:12px;letter-spacing:1.4px;text-transform:uppercase;opacity:0.9;">Secure Verification</p>
                  <h1 style="margin:8px 0 0;font-size:24px;line-height:1.2;font-weight:700;">Your OTP Code</h1>
                </td>
              </tr>

              <tr>
                <td style="padding:30px 32px 10px;">
                  <p style="margin:0 0 14px;font-size:15px;line-height:1.65;">Hi,</p>
                  <p style="margin:0 0 22px;font-size:15px;line-height:1.65;">
                    Use the verification code below to complete your login or account action for
                    <strong>${contact}</strong>.
                  </p>

                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin:0 0 22px;">
                    <tr>
                      <td align="center" style="padding:20px;border:1px solid #ccfbf1;background:#f0fdfa;border-radius:14px;">
                        <p style="margin:0 0 8px;font-size:12px;color:#0f766e;text-transform:uppercase;letter-spacing:1.2px;font-weight:700;">One-Time Password</p>
                        <p style="margin:0;font-size:36px;line-height:1;letter-spacing:10px;font-weight:800;color:#0f172a;">${otp}</p>
                      </td>
                    </tr>
                  </table>

                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin:0 0 20px;">
                    <tr>
                      <td style="padding:14px 16px;background:#fff7ed;border:1px solid #fed7aa;border-radius:10px;font-size:13px;line-height:1.5;color:#9a3412;">
                        This OTP is valid until <strong>${expiresAtText}</strong>.
                      </td>
                    </tr>
                  </table>

                  <p style="margin:0 0 10px;font-size:13px;line-height:1.6;color:#6b7280;">
                    Security tip: Never share this OTP with anyone, including support staff.
                  </p>
                </td>
              </tr>

              <tr>
                <td style="padding:18px 32px 26px;border-top:1px solid #f1f5f9;">
                  <p style="margin:0;font-size:12px;line-height:1.6;color:#94a3b8;">
                    If you did not request this code, you can safely ignore this email.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
  </html>
  `;
};

const sendEmailOtp = async ({ contact, otp, expiresAt }) => {
  const transporter = getEmailTransporter();

  if (!transporter) {
    console.warn('SMTP is not fully configured. OTP will be logged instead of emailed.');
    console.log(`OTP for ${contact}: ${otp} (expires at ${new Date(expiresAt).toISOString()})`);
    return;
  }

  const message = buildOtpMessage(otp, expiresAt);
  const htmlMessage = buildOtpEmailHtml({ otp, expiresAt, contact });

  await transporter.sendMail({
    from: `OTP Verification System <${env.smtpFrom}>`,
    to: contact,
    subject: 'Your OTP Verification Code',
    text: message,
    html: htmlMessage,
  });
};

const sendSmsOtp = async ({ contact, otp, expiresAt }) => {
  const client = getSmsClient();

  if (!client) {
    throw new Error(
      'SMS delivery is not configured. Please set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_PHONE_NUMBER in backend/.env',
    );
  }

  const to = normalizePhoneNumber(contact);
  const message = buildOtpMessage(otp, expiresAt);

  try {
    await client.messages.create({
      body: message,
      from: env.twilioPhoneNumber,
      to,
    });
  } catch (error) {
    throw new Error(`Failed to send SMS OTP: ${error.message}`);
  }
};

const sendOtpNotification = async ({ contact, contactType, otp, expiresAt }) => {
  if (contactType === 'email') {
    await sendEmailOtp({ contact, otp, expiresAt });
    return;
  }

  if (contactType === 'phone') {
    await sendSmsOtp({ contact, otp, expiresAt });
    return;
  }

  throw new Error('Unsupported contact type for OTP delivery');
};

module.exports = {
  sendOtpNotification,
};
