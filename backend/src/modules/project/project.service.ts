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

      // Build where clause - only projects where user is owner OR collaborator
      const where: Prisma.ProjectWhereInput = {
        OR: [
          { ownerId: userId },
          { collaborators: { some: { userId } } },
        ],
      };

      // Add search filter if provided
      if (search) {
        where.AND = [
          {
            OR: [
              { title: { contains: search, mode: 'insensitive' } },
              { description: { contains: search, mode: 'insensitive' } },
            ],
          },
        ];
      }

      const [projects, total] = await Promise.all([
        this.prisma.project.findMany({
          where,
          skip,
          take: limit,
          orderBy: { updatedAt: 'desc' },
          include: {
            owner: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
              },
            },
            collaborators: {
              where: { userId },
              select: {
                userId: true,
                role: true,
              },
            },
          },
        }),
        this.prisma.project.count({ where }),
      ]);

      // Add userRole field to differentiate owner vs collaborator
      const projectsWithRole = projects.map((project) => ({
        ...project,
        userRole: project.ownerId === userId ? 'owner' : 'collaborator',
      }));

      return {
        data: projectsWithRole,
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
          OR: [
            { ownerId: userId },
            { collaborators: { some: { userId } } },
          ],
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
