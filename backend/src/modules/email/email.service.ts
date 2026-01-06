import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
}

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT),
      secure: false,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  async sendEmail(options: SendEmailOptions): Promise<void> {
    try {
      this.transporter.sendMail({ ...options, from: process.env.EMAIL_FROM });
    } catch (error) {
      console.error('Email send failed:', error);
      throw new InternalServerErrorException('Failed to send email');
    }
  }

  async sendVerificationEmail(
    to: string,
    verificationToken: string,
  ): Promise<void> {
    const subject = 'Verify your email';
    const verificationLink = `${process.env.FRONTEND_URL}/auth/verify-email/${verificationToken}`;
    const html = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6">
        <h2>Email Verification</h2>
        <p>Thank you for signing up!</p>
        <p>Please verify your email by clicking the button below:</p>
        <a
          href="${verificationLink}"
          style="
            display: inline-block;
            padding: 10px 20px;
            background-color: #4f46e5;
            color: white;
            text-decoration: none;
            border-radius: 5px;
          "
        >
          Verify Email
        </a>
        <p>If you did not create an account, please ignore this email.</p>
      </div>
    `;
    await this.sendEmail({ to, subject, html });
  }

  async sendWelcomeEmail(to: string, name: string): Promise<void> {
    const subject = "Welcome to our platform"
    const html = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6">
        <h2>Welcome, ${name}! 🎉</h2>
        <p>Your account has been successfully created.</p>
        <p>We’re excited to have you on board.</p>
        <p>
          If you have any questions, feel free to reply to this email.
        </p>
        <p>— The Team</p>
      </div>
    `;

    await this.sendEmail({
      to,
      subject,
      html,
    });
  }

  async sendForgotPasswordEmail(to: string, resetToken: string): Promise<void> {
    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    const subject = "Reset Password"
    const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6">
      <h2>Password Reset Request</h2>
      <p>We received a request to reset your password.</p>
      <p>Click the button below to reset your password:</p>
      <a
        href="${resetLink}"
        style="
          display: inline-block;
          padding: 10px 20px;
          background-color: #dc2626;
          color: white;
          text-decoration: none;
          border-radius: 5px;
        "
      >
        Reset Password
      </a>
      <p>This link will expire in 15 minutes.</p>
      <p>If you did not request this, you can safely ignore this email.</p>
    </div>
  `;

    await this.sendEmail({
      to,
      subject,
      html,
    });
  }

  async sendPasswordResetSuccessEmail(to: string): Promise<void> {
    const subject = 'Your password has been changed';
    const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6">
      <h2>Password Changed Successfully</h2>
      <p>Your password has been updated.</p>
      <p>If you did not make this change, please contact support immediately.</p>
      <p>— The Team</p>
    </div>
  `;

    await this.sendEmail({
      to,
      subject,
      html,
    });
  }
}
