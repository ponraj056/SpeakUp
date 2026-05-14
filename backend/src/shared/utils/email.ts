import sgMail from '@sendgrid/mail';
import { config } from '../../config/env';

if (config.SENDGRID_API_KEY) {
  sgMail.setApiKey(config.SENDGRID_API_KEY);
}

const FROM_EMAIL = config.SENDGRID_FROM_EMAIL || 'noreply@speakup.app';

export async function sendVerificationEmail(email: string, token: string) {
  const verificationUrl = `${config.FRONTEND_URL}/verify?token=${token}`;

  const msg = {
    to: email,
    from: FROM_EMAIL,
    subject: 'Verify your SpeakUp account',
    text: `Welcome to SpeakUp! Please verify your email by clicking here: ${verificationUrl}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <h2 style="color: #6C5CE7;">Welcome to SpeakUp!</h2>
        <p>Thank you for joining SpeakUp, the platform where you can master English speaking with AI and real people.</p>
        <p>Please click the button below to verify your email address and activate your account:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationUrl}" style="background-color: #6C5CE7; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Verify Email Address</a>
        </div>
        <p style="color: #666; font-size: 12px;">If the button doesn't work, copy and paste this link into your browser: ${verificationUrl}</p>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="color: #999; font-size: 10px;">Speak better. Every day. With everyone.</p>
      </div>
    `,
  };

  try {
    if (config.SENDGRID_API_KEY) {
      await sgMail.send(msg);
      console.log(`✅ Verification email sent to ${email}`);
    } else {
      console.warn(`⚠️  SendGrid API key missing — verification email for ${email} logged to console: ${verificationUrl}`);
    }
  } catch (error) {
    console.error('❌ Failed to send verification email:', error);
  }
}
