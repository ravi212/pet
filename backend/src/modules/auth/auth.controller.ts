import { Body, Controller, Post, Get, Query } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignUpDto, LoginDto, ResendVerificationEmailDto } from './dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  async signup(@Body() signupDto: SignUpDto) {
    return this.authService.signup(signupDto);
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Get('verify-email')
  async verifyEmail(@Query('token') token: string) {
    return this.authService.verifyEmail(token);
  }

  @Post('resend-verification-email')
  async resendVerificationEmail(@Body() resendDto: ResendVerificationEmailDto) {
    return this.authService.resendVerificationEmail(resendDto.email)
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
