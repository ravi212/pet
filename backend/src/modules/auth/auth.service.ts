import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { SignUpDto } from './dto';
import { EmailService } from '../email/email.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
  ) {}

  async signup(signupDto: SignUpDto) {
    try {
      // Check if email already exists
      const existingUser = await this.prisma.user.findUnique({
        where: { email: signupDto.email },
      });
      if (existingUser) {
        throw new ConflictException('Email already in use');
      }

      // Hash the password using bcrypt
      const hashedPassword = await bcrypt.hash(signupDto.password, 10);

      // Generate email verification token (valid for 24 hours)
      const emailVerificationToken = crypto.randomBytes(32).toString('hex');
      const emailVerificationExpiresAt = new Date(
        Date.now() + 24 * 60 * 60 * 1000,
      );

      // Create user in database with email verification token
      const newUser = await this.prisma.user.create({
        data: {
          email: signupDto.email,
          password: hashedPassword,
          firstName: signupDto.firstName,
          lastName: signupDto.lastName,
          timezone: signupDto.timezone || 'Asia/Kolkata',
          locale: signupDto.locale || 'en-IN',
          avatarUrl: signupDto.avatarUrl || null,
          aiOptIn: signupDto.aiOptIn || false,
          provider: 'local',
          emailVerificationToken,
          emailVerificationExpiresAt,
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
        },
      });

      let verificationEmailSent = false;
      try {
        await this.emailService.sendVerificationEmail(
          newUser.email,
          emailVerificationToken,
        );
        verificationEmailSent = true;
      } catch (error) {
        // Log but DO NOT fail signup
        console.error('Verification email failed:', error);
      }

      // Return success response (no sensitive data)
      return {
        id: newUser.id,
        email: newUser.email,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        message: 'Signup successful. Please verify your email.',
        verificationEmailSent,
      };
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to create user');
    }
  }

  async verifyEmail(token: string) {
    try {
      // Find user by emailVerificationToken
      const user = await this.prisma.user.findUnique({
        where: { emailVerificationToken: token },
      });

      // Check if user exists
      if (!user) {
        throw new BadRequestException('Invalid verification token');
      }

      // Check if token is expired
      if (
        user.emailVerificationExpiresAt &&
        new Date() > user.emailVerificationExpiresAt
      ) {
        throw new BadRequestException('Verification token has expired');
      }

      // Update user - mark email as verified and clear token fields
      const updatedUser = await this.prisma.user.update({
        where: { id: user.id },
        data: {
          emailVerified: true,
          emailVerificationToken: null,
          emailVerificationExpiresAt: null,
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          emailVerified: true,
        },
      });

      // Return success response
      return {
        success: true,
        message: 'Email verified successfully',
        user: updatedUser,
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to verify email');
    }
  }

  async login(loginDto: any) {
    try {
      // Find user by email
      const user = await this.prisma.user.findUnique({
        where: { email: loginDto.email },
      });

      // Check if user exists
      if (!user) {
        throw new UnauthorizedException('Invalid credentials');
      }

      // Compare passwords using bcrypt
      const passwordValid = await bcrypt.compare(
        loginDto.password,
        user.password || '',
      );

      // If password doesn't match, throw error
      if (!passwordValid) {
        throw new UnauthorizedException('Invalid credentials');
      }

      // Check if email is verified
      if (!user.emailVerified) {
        throw new UnauthorizedException(
          'Please verify your email before logging in',
        );
      }

      // Return user data (without sensitive fields)
      return {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        timezone: user.timezone,
        locale: user.locale,
        twoFactorEnabled: user.twoFactorEnabled,
        message: 'Login successful',
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new InternalServerErrorException('Login failed');
    }
  }

  async resendVerificationEmail(email: string) {
    try {
      // Find user by email
      const user = await this.prisma.user.findUnique({
        where: { email },
      });

      // Check if user exists
      if (!user) {
        // For security, don't reveal if email exists or not
        // Still return success to prevent email enumeration attacks
        return {
          success: true,
          message:
            'If this email exists and is unverified, verification link has been sent',
        };
      }

      // Check if email is already verified
      if (user.emailVerified) {
        throw new BadRequestException('Email is already verified');
      }

      // Check if token is still valid (hasn't expired yet)
      // If token is still valid, reuse it; otherwise generate new one
      let emailVerificationToken = user.emailVerificationToken;
      let emailVerificationExpiresAt = user.emailVerificationExpiresAt;

      if (
        !emailVerificationToken ||
        (emailVerificationExpiresAt && new Date() > emailVerificationExpiresAt)
      ) {
        // Generate new token with 24-hour expiry
        emailVerificationToken = crypto.randomBytes(32).toString('hex');
        emailVerificationExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
      }

      // Update user with new/existing token
      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          emailVerificationToken,
          emailVerificationExpiresAt,
        },
      });

      let verificationEmailSent = false;
      try {
        await this.emailService.sendVerificationEmail(
          email,
          emailVerificationToken,
        );
        verificationEmailSent = true;
      } catch (error) {
        // Log but DO NOT fail signup
        console.error('Verification email failed:', error);
      }
      // Return success response
      return {
        success: verificationEmailSent,
        message: 'Verification email has been resent',
        // verificationToken: emailVerificationToken, // Remove in production (send via email only)
        // expiresIn: '24 hours',
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Failed to resend verification email',
      );
    }
  }

  async enableTwoFactorAuth(userId: string) {
    // Step 1: Get user by id
    // const user = await this.prisma.user.findUnique({where: {id:}})
    // Step 2: Generate 2FA secret (placeholder for now)
    // const secret = "placeholder-secret"
    // Step 3: Generate 10 backup codes
    // Use: Array.from({ length: 10 }, () => crypto.randomBytes(8).toString('hex'))
    // Step 4: Update user (store secret and codes but don't enable yet)
    // Use: this.prisma.user.update({
    //   where: { id: userId },
    //   data: { twoFactorSecret: secret, twoFactorBackupCodes: backupCodes }
    // })
    // Step 5: Return QR code URL and backup codes
  }

  async verifyTwoFactorCode(userId: string, code: string) {
    // Step 1: Get user by id
    // Step 2: Verify code (placeholder for now - just check if 6 digits)
    // Step 3: If valid, update user - set twoFactorEnabled: true
    // Step 4: Return success message
  }

  async disableTwoFactorAuth(userId: string, password: string) {
    // Step 1: Get user by id
    // Step 2: Verify password for security
    // Step 3: If password invalid, throw UnauthorizedException
    // Step 4: Update user - clear 2FA fields
    // Step 5: Return success message
  }
}
