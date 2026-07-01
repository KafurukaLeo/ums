import * as nodemailer from 'nodemailer';

class Logger {
  constructor(private context: string) {}
  log(msg: string) { console.log(`[${this.context}] ${msg}`); }
  warn(msg: string) { console.warn(`[${this.context}] ${msg}`); }
  error(msg: string, err?: any) { console.error(`[${this.context}] ${msg}`, err || ''); }
}

export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter | null = null;

  constructor() {
    const host = process.env.SMTP_HOST;
    const port = process.env.SMTP_PORT;
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    const PLACEHOLDERS = ['your-app-password', 'your-password', 'your-smtp-pass', ''];
    const isRealCredential = host && port && user && pass && !PLACEHOLDERS.includes(pass.trim());

    if (isRealCredential) {
      this.transporter = nodemailer.createTransport({
        host,
        port: parseInt(port.toString(), 10),
        auth: { user, pass },
      });
      this.logger.log('SMTP transporter initialized — real emails will be sent.');
    } else {
      this.logger.warn(
        'SMTP credentials are missing or using placeholder values. Emails will be logged to the console (mock mode).',
      );
    }
  }

  async sendVerificationEmail(to: string, code: string): Promise<void> {
    const from = process.env.SMTP_FROM || 'no-reply@university.com';
    const subject = '🎓 Verify your email — University Management System';
    const text = `Welcome! Your email verification code is: ${code}. This code is valid for 24 hours.`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9f9f9; padding: 30px; border-radius: 10px;">
        <div style="background: #1a237e; padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 22px;">🎓 University Management System</h1>
        </div>
        <div style="background: #ffffff; padding: 30px; border-radius: 0 0 8px 8px; border: 1px solid #e0e0e0;">
          <h2 style="color: #1a237e;">Verify Your Email Address</h2>
          <p style="color: #555; line-height: 1.6;">Thank you for registering! Please use the verification code below to confirm your email address and activate your account.</p>
          <div style="font-size: 32px; font-weight: bold; background: #e8eaf6; padding: 20px; text-align: center; border-radius: 8px; margin: 25px 0; color: #1a237e; letter-spacing: 8px; border: 2px dashed #3949ab;">
            ${code}
          </div>
          <p style="color: #777; font-size: 14px;">⏳ This code expires in <strong>24 hours</strong>.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="font-size: 12px; color: #aaa;">If you did not create an account, please ignore this email.</p>
        </div>
      </div>
    `;

    if (this.transporter) {
      try {
        await this.transporter.sendMail({ from, to, subject, text, html });
        this.logger.log(`Verification email sent to ${to}`);
      } catch (error) {
        this.logger.error(`Failed to send verification email to ${to}`, error);
      }
    } else {
      this.logger.log('\n==================================================');
      this.logger.log(`[EMAIL MOCK] To: ${to}`);
      this.logger.log(`[EMAIL MOCK] Subject: ${subject}`);
      this.logger.log(`[EMAIL MOCK] Verification Code: ${code}`);
      this.logger.log('==================================================\n');
    }
  }

  async sendEmailVerifiedNotification(to: string, name: string): Promise<void> {
    const from = process.env.SMTP_FROM || 'no-reply@university.com';
    const subject = '✅ Email Verified — You can now log in';
    const text = `Hi ${name}, your email has been verified successfully. You can now log in to the University Management System.`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9f9f9; padding: 30px; border-radius: 10px;">
        <div style="background: #1b5e20; padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 22px;">✅ Email Verified Successfully</h1>
        </div>
        <div style="background: #ffffff; padding: 30px; border-radius: 0 0 8px 8px; border: 1px solid #e0e0e0;">
          <h2 style="color: #1b5e20;">Welcome aboard, ${name}!</h2>
          <p style="color: #555; line-height: 1.6;">Your email address has been <strong>successfully verified</strong>. Your account is now fully active.</p>
          <p style="color: #555;">You can now log in to access your university portal, view courses, and manage your academic activities.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="font-size: 12px; color: #aaa;">This is an automated notification from the University Management System.</p>
        </div>
      </div>
    `;

    if (this.transporter) {
      try {
        await this.transporter.sendMail({ from, to, subject, text, html });
        this.logger.log(`Email verified notification sent to ${to}`);
      } catch (error) {
        this.logger.error(`Failed to send email verified notification to ${to}`, error);
      }
    } else {
      this.logger.log('\n==================================================');
      this.logger.log(`[EMAIL MOCK] To: ${to}`);
      this.logger.log(`[EMAIL MOCK] Subject: ${subject}`);
      this.logger.log(`[EMAIL MOCK] Email verified — welcome ${name}!`);
      this.logger.log('==================================================\n');
    }
  }

  async sendPasswordResetEmail(to: string, token: string): Promise<void> {
    const from = process.env.SMTP_FROM || 'no-reply@university.com';
    const subject = '🔐 Password Reset Request — University Management System';
    const text = `You requested a password reset. Use this token: ${token}. This token is valid for 1 hour.`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9f9f9; padding: 30px; border-radius: 10px;">
        <div style="background: #b71c1c; padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 22px;">🔐 Password Reset Request</h1>
        </div>
        <div style="background: #ffffff; padding: 30px; border-radius: 0 0 8px 8px; border: 1px solid #e0e0e0;">
          <h2 style="color: #b71c1c;">Reset Your Password</h2>
          <p style="color: #555; line-height: 1.6;">We received a request to reset your password. Use the token below in the password reset form:</p>
          <div style="font-size: 13px; font-family: monospace; word-break: break-all; background: #fce4ec; padding: 15px; text-align: center; border-radius: 8px; margin: 20px 0; color: #c62828; border: 1px solid #ef9a9a;">
            ${token}
          </div>
          <p style="color: #777; font-size: 14px;">⏳ This token expires in <strong>1 hour</strong>.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="font-size: 12px; color: #aaa;">If you did not request a password reset, please ignore this email. Your password will remain unchanged.</p>
        </div>
      </div>
    `;

    if (this.transporter) {
      try {
        await this.transporter.sendMail({ from, to, subject, text, html });
        this.logger.log(`Password reset email sent to ${to}`);
      } catch (error) {
        this.logger.error(`Failed to send password reset email to ${to}`, error);
      }
    } else {
      this.logger.log('\n==================================================');
      this.logger.log(`[EMAIL MOCK] To: ${to}`);
      this.logger.log(`[EMAIL MOCK] Subject: ${subject}`);
      this.logger.log(`[EMAIL MOCK] Password Reset Token: ${token}`);
      this.logger.log('==================================================\n');
    }
  }

  async sendPasswordResetSuccessEmail(to: string, name: string): Promise<void> {
    const from = process.env.SMTP_FROM || 'no-reply@university.com';
    const subject = '✅ Password Reset Successful — University Management System';
    const text = `Hi ${name}, your password has been reset successfully. You can now log in with your new password.`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9f9f9; padding: 30px; border-radius: 10px;">
        <div style="background: #1b5e20; padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 22px;">✅ Password Reset Successful</h1>
        </div>
        <div style="background: #ffffff; padding: 30px; border-radius: 0 0 8px 8px; border: 1px solid #e0e0e0;">
          <h2 style="color: #1b5e20;">Your password has been changed</h2>
          <p style="color: #555; line-height: 1.6;">Hi <strong>${name}</strong>, your password was <strong>successfully reset</strong>. You can now log in using your new password.</p>
          <p style="color: #e53935; font-size: 14px;">⚠️ If you did not make this change, please contact university support immediately.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="font-size: 12px; color: #aaa;">This is an automated security notification from the University Management System.</p>
        </div>
      </div>
    `;

    if (this.transporter) {
      try {
        await this.transporter.sendMail({ from, to, subject, text, html });
        this.logger.log(`Password reset success email sent to ${to}`);
      } catch (error) {
        this.logger.error(`Failed to send password reset success email to ${to}`, error);
      }
    } else {
      this.logger.log('\n==================================================');
      this.logger.log(`[EMAIL MOCK] To: ${to}`);
      this.logger.log(`[EMAIL MOCK] Subject: ${subject}`);
      this.logger.log(`[EMAIL MOCK] Password reset confirmed for ${name}`);
      this.logger.log('==================================================\n');
    }
  }
}

export const emailService = new EmailService();
