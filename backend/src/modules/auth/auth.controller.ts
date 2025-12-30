import { Body, Controller, Post, Get, Query, Req} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody, ApiQuery } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { SignUpDto, LoginDto, ResendVerificationEmailDto } from './dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ 
    summary: 'User signup - create new account',
    description: 'curl -X POST http://localhost:3000/auth/signup -H "Content-Type: application/json" -d \'{"email":"user@example.com","password":"SecurePass123!","firstName":"John","lastName":"Doe"}\''
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: { type: 'string', example: 'user@example.com' },
        password: { type: 'string', example: 'SecurePass123!' },
        firstName: { type: 'string', example: 'John' },
        lastName: { type: 'string', example: 'Doe' }
      }
    }
  })
  @ApiResponse({ 
    status: 201, 
    description: 'User created successfully',
    schema: {
      example: {
        accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        user: { id: 'uuid', email: 'user@example.com', firstName: 'John', lastName: 'Doe' }
      }
    }
  })
  @Post('signup')
  async signup(@Body() signupDto: SignUpDto) {
    return this.authService.signup(signupDto);
  }

  @ApiOperation({ 
    summary: 'User login - authenticate and get tokens',
    description: 'curl -X POST http://localhost:3000/auth/login -H "Content-Type: application/json" -d \'{"email":"user@example.com","password":"SecurePass123!"}\'',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: { type: 'string', example: 'user@example.com' },
        password: { type: 'string', example: 'SecurePass123!' }
      }
    }
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Login successful',
    schema: {
      example: {
        accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        user: { id: 'uuid', email: 'user@example.com' }
      }
    }
  })
  @Post('login')
  async login(@Body() loginDto: LoginDto, @Req() req: Request) {
    const ipAddress = req.headers['x-forwarded-for']?.toString() || '';
    const userAgent = req.headers['user-agent']?.toString() || '';
    const deviceType = userAgent?.includes('Mobile') ? 'mobile' : 'web';
    return this.authService.login(loginDto, {
      userAgent,
      ipAddress,
      deviceType,
    });
  }

  @ApiOperation({ 
    summary: 'Refresh access token',
    description: 'curl -X POST http://localhost:3000/auth/refresh-token -H "Content-Type: application/json" -d \'{"refreshToken":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."}\''
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        refreshToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' }
      }
    }
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Token refreshed successfully',
    schema: {
      example: {
        accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
      }
    }
  })
  @Post('refresh-token')
  async refreshToken(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refreshToken(refreshTokenDto.refreshToken);
  }
    
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Get all active sessions',
    description: 'curl -X GET http://localhost:3000/auth/sessions -H "Authorization: Bearer {jwt-token}"'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Sessions retrieved successfully',
    schema: {
      example: [{
        id: 'session-uuid',
        deviceType: 'web',
        userAgent: 'Mozilla/5.0...',
        ipAddress: '192.168.1.1',
        lastActiveAt: '2024-12-30T10:30:00Z',
        createdAt: '2024-12-30T09:00:00Z'
      }]
    }
  })
  @Get('sessions')
  async getSessions(@Req() req: Request) {
    const userId = req['user'].id;
    return this.authService.getSessions(userId);
  }

  @ApiOperation({ 
    summary: 'Verify email with token',
    description: 'curl -X GET "http://localhost:3000/auth/verify-email?token=verification-token-here"'
  })
  @ApiQuery({ name: 'token', description: 'Email verification token' })
  @ApiResponse({ 
    status: 200, 
    description: 'Email verified successfully',
    schema: { example: { message: 'Email verified successfully' } }
  })
  @Get('verify-email')
  async verifyEmail(@Query('token') token: string) {
    return this.authService.verifyEmail(token);
  }

  @ApiOperation({ 
    summary: 'Resend verification email',
    description: 'curl -X POST http://localhost:3000/auth/resend-verification-email -H "Content-Type: application/json" -d \'{"email":"user@example.com"}\''
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: { type: 'string', example: 'user@example.com' }
      }
    }
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Verification email sent',
    schema: { example: { message: 'Verification email sent' } }
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

  @Get('me')
  getUser() {
    // Will implement after JWT guard
    return { message: 'Coming soon' };
  }
}
