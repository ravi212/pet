import {
  Body,
  Controller,
  Post,
  Get,
  Query,
  Req,
  Res,
  UseGuards,
  HttpCode,
  Logger,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { SignUpDto, LoginDto, ResendVerificationEmailDto } from './dto';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { AuthGuard } from '@nestjs/passport';
import { GoogleAuthGuard } from 'src/guards/google-auth.guard';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({
    summary: 'User signup - create new account',
    description:
      'curl -X POST http://localhost:3000/auth/signup -H "Content-Type: application/json" -d \'{"email":"user@example.com","password":"SecurePass123!","firstName":"John","lastName":"Doe"}\'',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: { type: 'string', example: 'user@example.com' },
        password: { type: 'string', example: 'SecurePass123!' },
        firstName: { type: 'string', example: 'John' },
        lastName: { type: 'string', example: 'Doe' },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'User created successfully',
    schema: {
      example: {
        accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        user: {
          id: 'uuid',
          email: 'user@example.com',
          firstName: 'John',
          lastName: 'Doe',
        },
      },
    },
  })
  @Post('signup')
  async signup(@Body() signupDto: SignUpDto) {
    return this.authService.signup(signupDto);
  }

  @ApiOperation({
    summary: 'User login - authenticate and get tokens',
    description:
      'curl -X POST http://localhost:3000/auth/login -H "Content-Type: application/json" -d \'{"email":"user@example.com","password":"SecurePass123!"}\'',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: { type: 'string', example: 'user@example.com' },
        password: { type: 'string', example: 'SecurePass123!' },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Login successful',
    schema: {
      example: {
        accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        user: { id: 'uuid', email: 'user@example.com' },
      },
    },
  })
  @HttpCode(200)
  @Post('login')
  async login(
    @Body() loginDto: LoginDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res,
  ) {
    try {
      const ipAddress = req.headers['x-forwarded-for']?.toString() || '';
      const userAgent = req.headers['user-agent']?.toString() || '';
      const deviceType = userAgent?.includes('Mobile') ? 'mobile' : 'web';
      const { accessToken, refreshToken } = await this.authService.login(
        loginDto,
        {
          userAgent,
          ipAddress,
          deviceType,
        },
      );

      res.cookie('access_token', accessToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        domain:
          process.env.NODE_ENV === 'production' ? process.env.DOMAIN || '' : '',
        maxAge: 15 * 60 * 1000,
      });

      res.cookie('refresh_token', refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        domain:
          process.env.NODE_ENV === 'production' ? process.env.DOMAIN || '' : '',
        path: '/auth/refresh',
        maxAge: 30 * 24 * 60 * 60 * 1000,
      });

      return { message: 'Login successful' };
    } catch (err) {
      console.log('Error during login:', err);
      throw err;
    }
  }

  @ApiOperation({
    summary: 'Refresh access token',
    description:
      'curl -X POST http://localhost:3000/auth/refresh -H "Content-Type: application/json" -d \'{"refreshToken":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."}\'',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        refreshToken: {
          type: 'string',
          example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Token refreshed successfully',
    schema: {
      example: {
        accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
      },
    },
  })
  @HttpCode(200)
  @Post('refresh')
  async refresh(@Req() req, @Res({ passthrough: true }) res) {
    const refreshToken = req.cookies['refresh_token'];

    const { accessToken, refreshToken: newRefresh } =
      await this.authService.refreshToken(refreshToken);

    res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      domain:
        process.env.NODE_ENV === 'production' ? process.env.DOMAIN || '' : '',
      maxAge: 15 * 60 * 1000,
    });

    res.cookie('refresh_token', newRefresh, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      domain:
        process.env.NODE_ENV === 'production' ? process.env.DOMAIN || '' : '',
      path: '/auth/refresh',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    return { success: true };
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get all active sessions',
    description:
      'curl -X GET http://localhost:3000/auth/sessions -H "Authorization: Bearer {jwt-token}"',
  })
  @ApiResponse({
    status: 200,
    description: 'Sessions retrieved successfully',
    schema: {
      example: [
        {
          id: 'session-uuid',
          deviceType: 'web',
          userAgent: 'Mozilla/5.0...',
          ipAddress: '192.168.1.1',
          lastActiveAt: '2024-12-30T10:30:00Z',
          createdAt: '2024-12-30T09:00:00Z',
        },
      ],
    },
  })
  @Get('sessions')
  async getSessions(@Req() req: Request) {
    const userId = req['user'].id;
    return this.authService.getSessions(userId);
  }

  @ApiOperation({
    summary: 'Verify email with token',
    description:
      'curl -X GET "http://localhost:3000/auth/verify-email?token=verification-token-here"',
  })
  @ApiQuery({ name: 'token', description: 'Email verification token' })
  @ApiResponse({
    status: 200,
    description: 'Email verified successfully',
    schema: { example: { message: 'Email verified successfully' } },
  })
  @Get('verify-email')
  async verifyEmail(@Query('token') token: string) {
    return this.authService.verifyEmail(token);
  }

  @ApiOperation({
    summary: 'Resend verification email',
    description:
      'curl -X POST http://localhost:3000/auth/resend-verification-email -H "Content-Type: application/json" -d \'{"email":"user@example.com"}\'',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: { type: 'string', example: 'user@example.com' },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Verification email sent',
    schema: { example: { message: 'Verification email sent' } },
  })
  @Post('resend-verification-email')
  async resendVerificationEmail(@Body() resendDto: ResendVerificationEmailDto) {
    return this.authService.resendVerificationEmail(resendDto.email);
  }

  @ApiOperation({ summary: 'Enable two-factor authentication' })
  @Post('enable-2fa')
  async enableTwoFactorAuth() {
    // Will implement after JWT guard
    return { message: 'Coming soon' };
  }

  @ApiOperation({ summary: 'Verify two-factor code' })
  @Post('verify-2fa')
  async verifyTwoFactorCode() {
    // Will implement after JWT guard
    return { message: 'Coming soon' };
  }

  @Post('disable-2fa')
  async disableTwoFactorAuth() {
    // Will implement after JWT guard
    return { message: 'Coming soon' };
  }

  @HttpCode(200)
  @Post('logout')
  @UseGuards(JwtAuthGuard)
  async logout(@Req() req, @Res({ passthrough: true }) res) {
    const sessionId = req.user.sessionId;
    await this.authService.logout(sessionId);

    res.clearCookie('access_token');
    res.clearCookie('refresh_token');

    return { message: 'Logged out successfully' };
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  getUser(@Req() req) {
    // req.user comes from JwtStrategy's validate()
    return {
      id: req.user.id,
      email: req.user.email,
      sessionId: req.user.sessionId,
      twoFactorEnabled: req.user.twoFactorEnabled,
      displayName: req.user.displayName,
    };
  }
  @UseGuards(GoogleAuthGuard)
  @Get('google')
  googleLogin() {
    // Initiates OAuth flow
  }
  @UseGuards(GoogleAuthGuard)
  @Get('google/callback')
  async googleCallback(@Req() req, @Res({ passthrough: true }) res) {
    const { accessToken, refreshToken } = req.user;

    res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 15 * 60 * 1000,
    });

    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      path: '/auth/refresh',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    let callbackUrl = 'http://localhost:3000/auth/google/callback';
    if (process.env.FRONTEND_URL) {
      callbackUrl = `${process.env.FRONTEND_URL}/auth/google/callback`;
    }

    return res.redirect(callbackUrl);
  }
}
