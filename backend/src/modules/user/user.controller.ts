import { Body, Controller, Get, Patch, Post } from '@nestjs/common';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('profile')
  async getProfile() {
    // Will implement after JWT guard
    return { message: 'Coming soon' };
  }

  @Patch('profile')
  async updateProfile(@Body() updateDto: any) {
    // Will implement after JWT guard
    return { message: 'Coming soon' };
  }

  @Post('change-password')
  async changePassword(@Body() changePasswordDto: any) {
    // Will implement after JWT guard
    return { message: 'Coming soon' };
  }
}
