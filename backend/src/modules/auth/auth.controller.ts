import { Body, Controller, Post, Get, Query, Req, Delete, Param } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignUpDto, LoginDto, ResendVerificationEmailDto } from './dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  async signup(@Body() signupDto: SignUpDto) {
    return this.authService.signup(signupDto);
  }

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

  @Post('refresh-token')
  async refreshToken(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refreshToken(refreshTokenDto.refreshToken);
  }
    
  @Get('sessions')
  async getSessions(@Req() req: Request) {
    const userId = req['user'].id;
    return this.authService.getSessions(userId);
  }

  // @Delete(':sessionId')
  // revokeSession(
  //   @Param('sessionId') sessionId: string,
  //   @Req() req: Request,
  // ) {
  //   return this.authService.revokeSession(
  //     req.user.sub,
  //     sessionId,
  //   );
  // }

  // @Delete()
  // revokeAllSessions(
  //   @Req() req: Request,
  // ) {
  //   return this.authService.revokeAllSessions(req.user.sub);
  // }

  @Get('verify-email')
  async verifyEmail(@Query('token') token: string) {
    return this.authService.verifyEmail(token);
  }

  @Post('resend-verification-email')
  async resendVerificationEmail(@Body() resendDto: ResendVerificationEmailDto) {
    return this.authService.resendVerificationEmail(resendDto.email);
  }

  @Post('enable-2fa')
  async enableTwoFactorAuth() {
    // Will implement after JWT guard
    return { message: 'Coming soon' };
  }

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
