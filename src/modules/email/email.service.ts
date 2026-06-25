import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter | null = null;

  constructor(private readonly configService: ConfigService) {
    const host = this.configService.get<string>('SMTP_HOST');
    const port = this.configService.get<number>('SMTP_PORT');
    const user = this.configService.get<string>('SMTP_USER');
    const pass = this.configService.get<string>('SMTP_PASS');

    if (host && port && user && pass) {
      this.transporter = nodemailer.createTransport({
        host,
        port: parseInt(port.toString(), 10),
        auth: { user, pass },
      });
      this.logger.log('SMTP transporter initialized successfully');
    } else {
      this.logger.warn(
        'SMTP environment variables are not fully configured. Emails will be logged to the console.',
      );
    }
  }

  async sendVerificationEmail(to: string, code: string): Promise<void> {
    const from = this.configService.get<string>('SMTP_FROM') || 'no-reply@university.com';
    const subject = 'Verify your email address';
    const text = `Welcome! Your email verification code is: ${code}. This code is valid for 24 hours.`;
    const html = `
      <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 5px; max-width: 600px;">
        <h2 style="color: #333;">Welcome to University Management System</h2>
        <p>Thank you for registering. Please verify your email by entering the verification code below:</p>
        <div style="font-size: 24px; font-weight: bold; background: #f4f4f4; padding: 15px; text-align: center; border-radius: 5px; margin: 20px 0; color: #1e88e5; letter-spacing: 2px;">
          ${code}
        </div>
        <p>This code is valid for 24 hours.</p>
        <hr style="border: none; border-top: 1px solid #eee;" />
        <p style="font-size: 12px; color: #888;">If you did not request this email, please ignore it.</p>
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

  async sendPasswordResetEmail(to: string, token: string): Promise<void> {
    const from = this.configService.get<string>('SMTP_FROM') || 'no-reply@university.com';
    const subject = 'Reset your password';
    const text = `You requested a password reset. Please use the following token to reset your password: ${token}. This token is valid for 1 hour.`;
    const html = `
      <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 5px; max-width: 600px;">
        <h2 style="color: #333;">Password Reset Request</h2>
        <p>You requested a password reset. Please use the following token to reset your password:</p>
        <div style="font-size: 16px; font-family: monospace; word-break: break-all; background: #f4f4f4; padding: 15px; text-align: center; border-radius: 5px; margin: 20px 0; color: #d32f2f;">
          ${token}
        </div>
        <p>This token is valid for 1 hour.</p>
        <hr style="border: none; border-top: 1px solid #eee;" />
        <p style="font-size: 12px; color: #888;">If you did not request a password reset, please ignore this email.</p>
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
}
