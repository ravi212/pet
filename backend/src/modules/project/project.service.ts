import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { Prisma } from 'generated/prisma/client';

@Injectable()
export class ProjectService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, createProjectDto: CreateProjectDto) {
    try {
      const project = await this.prisma.project.create({
        data: {
          ...createProjectDto,
          ownerId: userId,
        },
        select: {
          id: true,
          title: true,
        },
      });

      return {
        data: project,
        message: 'Project created successfully',
      };
    } catch (e) {
      throw new InternalServerErrorException('Something went wrong');
    }
  }

  async findAll(userId: string, page = 1, limit = 10, search?: string) {
    try {
      const skip = (page - 1) * limit;

      const where: Prisma.ProjectWhereInput = {
        ownerId: userId,
      };

      if (search) {
        where.OR = [
          { title: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ];
      }

      const [projects, total] = await Promise.all([
        this.prisma.project.findMany({
          where,
          skip,
          take: limit,
          orderBy: { updatedAt: 'desc' },
        }),
        this.prisma.project.count({ where }),
      ]);

      return {
        data: projects,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (e) {
      throw new InternalServerErrorException('Something went wrong');
    }
  }

  async findOne(userId: string, id: string) {
    try {
      const project = await this.prisma.project.findFirstOrThrow({
        where: {
          id,
          ownerId: userId,
        },
      });
      return {
        data: project,
        message: 'Project fetched successfully',
      };
    } catch (e) {
      throw new InternalServerErrorException('Something went wrong');
    }
  }

  async update(userId: string, id: string, updateProjectDto: UpdateProjectDto) {
    try {
      const project = await this.prisma.project.update({
        where: {
          id,
          ownerId: userId,
        },
        data: updateProjectDto,
        select: {
          id: true,
          title: true,
        },
      });

      return {
        data: project,
        message: 'Project updated successfully',
      };
    } catch (e) {
      throw new InternalServerErrorException('Something went wrong');
    }
  }

  async remove(userId: string, id: string) {
    try {
      const project = await this.prisma.project.delete({
        where: {
          id,
          ownerId: userId,
        },
        select: {
          id: true,
          title: true,
        },
      });

      return {
        data: project,
        message: 'Project deleted successfully',
      };
    } catch (e) {
      throw new InternalServerErrorException('Something went wrong');
    }
  }
}
