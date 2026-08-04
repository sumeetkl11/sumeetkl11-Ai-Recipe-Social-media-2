import nodemailer from 'nodemailer';

const isDev = process.env.NODE_ENV !== 'production';

let transporter = null;
let testAccountPromise = null;

const getTestAccount = async () => {
  if (!testAccountPromise) {
    testAccountPromise = nodemailer.createTestAccount();
  }
  return testAccountPromise;
};

const getTransporter = async () => {
  if (transporter) return transporter;

  if (process.env.SMTP_HOST && process.env.SMTP_PORT) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  } else if (isDev) {
    // Development: use Ethereal Email (fake SMTP for testing)
    const testAccount = await getTestAccount();
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });

    console.log('📧 Ethereal Email test account created:', testAccount.user);
    console.log('📧 View emails at: https://ethereal.email');
  } else {
    // Production fallback - log only (configure real SMTP)
    console.warn('⚠️  No SMTP configured - emails will be logged only');
    transporter = {
      sendMail: async (options) => {
        console.log('📧 [EMAIL LOG]', {
          to: options.to,
          subject: options.subject,
          html: options.html?.substring(0, 200) + '...',
        });
        return { messageId: 'dev-logged' };
      },
    };
  }

  return transporter;
};

    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });

    console.log('📧 Ethereal Email test account created:', testAccount.user);
    console.log('📧 View emails at: https://ethereal.email');
  } else {
    // Production fallback - log only (configure real SMTP)
    console.warn('⚠️  No SMTP configured - emails will be logged only');
    transporter = {
      sendMail: async (options) => {
        console.log('📧 [EMAIL LOG]', {
          to: options.to,
          subject: options.subject,
          html: options.html?.substring(0, 200) + '...',
        });
        return { messageId: 'dev-logged' };
      },
    };
  }

  return transporter;
};

const emailTemplates = {
  verifyEmail: (name, verifyUrl) => ({
    subject: 'Verify your Tastebuds account',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1f2937; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #f59e0b 0%, #f97316 100%); padding: 30px; border-radius: 16px 16px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">🍳 Tastebuds</h1>
        </div>
        <div style="background: #fefce8; padding: 30px; border-radius: 0 0 16px 16px; border: 1px solid #fde68a;">
          <h2 style="color: #1f2937; margin-top: 0;">Welcome, ${name}!</h2>
          <p style="color: #4b5563; font-size: 16px;">Thanks for joining Tastebuds. Please verify your email address to unlock all features:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verifyUrl}" style="background: linear-gradient(135deg, #f59e0b 0%, #f97316 100%); color: white; padding: 14px 28px; border-radius: 12px; text-decoration: none; font-weight: 600; display: inline-block; box-shadow: 0 4px 14px rgba(245, 158, 11, 0.3);">
              Verify Email Address
            </a>
          </div>
          <p style="color: #6b7280; font-size: 14px;">Or copy this link: <br><a href="${verifyUrl}" style="color: #f59e0b; word-break: break-all;">${verifyUrl}</a></p>
          <hr style="border: none; border-top: 1px solid #fde68a; margin: 24px 0;">
          <p style="color: #9ca3af; font-size: 12px;">This link expires in 24 hours. If you didn't create an account, you can safely ignore this email.</p>
        </div>
      </body>
      </html>
    `,
  }),

  resetPassword: (name, resetUrl) => ({
    subject: 'Reset your Tastebuds password',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1f2937; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #f59e0b 0%, #f97316 100%); padding: 30px; border-radius: 16px 16px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">🍳 Tastebuds</h1>
        </div>
        <div style="background: #fefce8; padding: 30px; border-radius: 0 0 16px 16px; border: 1px solid #fde68a;">
          <h2 style="color: #1f2937; margin-top: 0;">Hi ${name},</h2>
          <p style="color: #4b5563; font-size: 16px;">You requested to reset your password. Click the button below to create a new one:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background: linear-gradient(135deg, #f59e0b 0%, #f97316 100%); color: white; padding: 14px 28px; border-radius: 12px; text-decoration: none; font-weight: 600; display: inline-block; box-shadow: 0 4px 14px rgba(245, 158, 11, 0.3);">
              Reset Password
            </a>
          </div>
          <p style="color: #6b7280; font-size: 14px;">Or copy this link: <br><a href="${resetUrl}" style="color: #f59e0b; word-break: break-all;">${resetUrl}</a></p>
          <hr style="border: none; border-top: 1px solid #fde68a; margin: 24px 0;">
          <p style="color: #9ca3af; font-size: 12px;">This link expires in 1 hour. If you didn't request this, please ignore this email or contact support if concerned.</p>
        </div>
      </body>
      </html>
    `,
  }),

  passwordChanged: (name) => ({
    subject: 'Your Tastebuds password was changed',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1f2937; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #f59e0b 0%, #f97316 100%); padding: 30px; border-radius: 16px 16px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">🍳 Tastebuds</h1>
        </div>
        <div style="background: #fefce8; padding: 30px; border-radius: 0 0 16px 16px; border: 1px solid #fde68a;">
          <h2 style="color: #1f2937; margin-top: 0;">Hi ${name},</h2>
          <p style="color: #4b5563; font-size: 16px;">Your password was successfully changed. If you didn't make this change, please contact support immediately.</p>
          <hr style="border: none; border-top: 1px solid #fde68a; margin: 24px 0;">
          <p style="color: #9ca3af; font-size: 12px;">For security, this action was logged with timestamp and IP information.</p>
        </div>
      </body>
      </html>
    `,
  }),
};

export const sendEmail = async ({ to, subject, html, template, templateData }) => {
  const transporter = getTransporter();

  let emailContent = { subject, html };
  if (template && emailTemplates[template]) {
    emailContent = emailTemplates[template](templateData.name, templateData.url);
  }

  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || '"Tastebuds" <noreply@tastebuds.app>',
      to,
      subject: emailContent.subject,
      html: emailContent.html,
    });

    if (isDev && info.messageId && !info.messageId.includes('dev-logged')) {
      console.log('📧 Preview URL:', nodemailer.getTestMessageUrl(info));
    }

    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Email send failed:', error);
    return { success: false, error: error.message };
  }
};

export const sendVerificationEmail = (email, name, verifyUrl) =>
  sendEmail({ to: email, template: 'verifyEmail', templateData: { name, url: verifyUrl } });

export const sendPasswordResetEmail = (email, name, resetUrl) =>
  sendEmail({ to: email, template: 'resetPassword', templateData: { name, url: resetUrl } });

export const sendPasswordChangedEmail = (email, name) =>
  sendEmail({ to: email, template: 'passwordChanged', templateData: { name } });