import {
  BadRequestException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateProfileDto } from './dto/update-profile';
import { ChangePasswordDto } from './dto/change-password';
import { compare, hash } from 'bcrypt-ts';
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs';
import * as path from 'path';

interface MultipartFile {
  buffer: Buffer;
  size: number;
  mimetype: string;
  originalname: string;
  path?: string;
}

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async getProfile(id: string) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          avatarUrl: true,
          timezone: true,
          locale: true,
          provider: true,
          emailVerified: true,
          createdAt: true,
        },
      });

      if (!user) throw new NotFoundException('User not found');

      return { message: 'Profile fetched successfully', data: user };
    } catch (e) {
      console.log(e);
      throw new InternalServerErrorException('Something went wrong');
    }
  }

  async updateProfile(id: string, dto: UpdateProfileDto) {
    try {
      const user = await this.prisma.user.update({
        where: { id },
        data: dto,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          avatarUrl: true,
          timezone: true,
          locale: true,
        },
      });

      if (!user) throw new NotFoundException('User not found');

      return { message: 'Profile updated successfully', data: user };
    } catch (e) {}
    return;
  }

  async uploadAvatar(userId: string, file: MultipartFile) {
    if (!file) {
      throw new BadRequestException('Avatar file is required');
    }

    if (file.size > 5 * 1024 * 1024) {
      throw new BadRequestException('Avatar must be under 5MB');
    }

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype)) {
      throw new BadRequestException('Only JPG, PNG and WEBP allowed');
    }

    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) throw new NotFoundException('User not found');

      const ext = file.originalname.split('.').pop();
      const filename = `${Date.now()}-${uuidv4()}.${ext}`;
      const userDir = path.join('storage/avatars', userId);

      if (!fs.existsSync(userDir)) {
        fs.mkdirSync(userDir, { recursive: true });
      }

      const storagePath = path.join(userDir, filename);
      fs.writeFileSync(storagePath, file.buffer);

      // delete old avatar
      if (user.avatarUrl) {
        const oldPath = user.avatarUrl.replace('/storage', 'storage');
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }

      const avatarUrl = `/storage/avatars/${userId}/${filename}`;

      const updated = await this.prisma.user.update({
        where: { id: userId },
        data: { avatarUrl },
        select: {
          id: true,
          avatarUrl: true,
        },
      });

      return {
        message: 'Avatar updated successfully',
        data: updated,
      };
    } catch (e) {
      console.error('Avatar upload error:', e);
      throw new InternalServerErrorException('Failed to upload avatar');
    }
  }

  async removeAvatar(userId: string) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) throw new NotFoundException('User not found');

      if (!user.avatarUrl) {
        return {
          message: 'Avatar already removed',
          data: { id: userId, avatarUrl: null },
        };
      }

      // Convert public URL → filesystem path
      const filePath = user.avatarUrl.replace('/storage', 'storage');

      // Delete file if it exists
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }

      // Remove from DB
      const updated = await this.prisma.user.update({
        where: { id: userId },
        data: { avatarUrl: null },
        select: {
          id: true,
          avatarUrl: true,
        },
      });

      return {
        message: 'Avatar removed successfully',
        data: updated,
      };
    } catch (e) {
      console.error('Avatar remove error:', e);
      throw new InternalServerErrorException('Failed to remove avatar');
    }
  }

  async changePassword(id: string, dto: ChangePasswordDto) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id },
      });

      if (!user || !user.password) {
        throw new BadRequestException(
          'Password change not allowed for OAuth users',
        );
      }

      const valid = await compare(dto.currentPassword, user.password);

      if (!valid) {
        throw new BadRequestException('Current password is incorrect');
      }

      const hashed = await hash(dto.newPassword, 10);

      await this.prisma.user.update({
        where: { id },
        data: { password: hashed },
      });

      return { message: 'Password updated successfully' };
    } catch (e) {
      if (e instanceof HttpException) {
        throw e;
      }
      console.error('Unexpected error:', e);
      throw new InternalServerErrorException('Something went wrong');
    }
  }
}
