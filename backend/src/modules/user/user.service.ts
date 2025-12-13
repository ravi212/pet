import { Get, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}
  
  // TODO: Implement user profile methods
  // - getUserProfile(userId)
  // - updateUserProfile(userId, updateDto)
  // - changePassword(userId, oldPassword, newPassword)
}
