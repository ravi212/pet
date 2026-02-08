import {
  Injectable,
  BadRequestException,
  ForbiddenException,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AddCollaboratorDto } from './dto/add-collaborator.dto';
import { UpdateRoleDto } from './dto/update-role.dto';

@Injectable()
export class CollaboratorsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Add a collaborator to a project
   * Only project owner can add collaborators
   */
  async addCollaborator(
    requesterId: string,
    projectId: string,
    dto: AddCollaboratorDto,
  ) {
    try {
      // Verify requester is project owner
      const project = await this.prisma.project.findUnique({
        where: { id: projectId },
        select: { ownerId: true, title: true },
      });

      if (!project) {
        throw new NotFoundException('Project not found');
      }

      if (project.ownerId !== requesterId) {
        throw new ForbiddenException('Only project owner can add collaborators');
      }

      // Find user by email
      const user = await this.prisma.user.findUnique({
        where: { email: dto.email },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          avatarUrl: true,
        },
      });

      if (!user) {
        throw new NotFoundException(
          `User with email "${dto.email}" not found. Please ensure the user has an account.`,
        );
      }

      // Cannot add owner as collaborator again
      if (user.id === project.ownerId) {
        throw new ConflictException('The project owner is already the owner');
      }

      // Check if already a collaborator
      const existingCollaborator =
        await this.prisma.projectCollaborator.findUnique({
          where: {
            ux_project_user: {
              projectId,
              userId: user.id,
            },
          },
        });

      if (existingCollaborator) {
        throw new ConflictException(
          `User "${dto.email}" is already a collaborator on this project`,
        );
      }

      // Create collaborator
      const collaborator = await this.prisma.projectCollaborator.create({
        data: {
          projectId,
          userId: user.id,
          role: dto.role ?? 'viewer',
        },
        select: {
          id: true,
          userId: true,
          projectId: true,
          role: true,
          createdAt: true,
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              avatarUrl: true,
            },
          },
        },
      });

      return {
        statusCode: 201,
        data: collaborator,
        message: `${user.email} added as ${collaborator.role}`,
      };
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof ForbiddenException ||
        error instanceof NotFoundException ||
        error instanceof ConflictException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to add collaborator');
    }
  }

  /**
   * Get all collaborators for a project
   * Accessible to owner and collaborators
   */
  async getCollaborators(requesterId: string, projectId: string) {
    try {
      // Verify project exists
      const project = await this.prisma.project.findUnique({
        where: { id: projectId },
        select: { ownerId: true },
      });

      if (!project) {
        throw new NotFoundException('Project not found');
      }

      // Verify requester has access (handled by guard)
      // This method will only be called after guard passes

      const collaborators = await this.prisma.projectCollaborator.findMany({
        where: { projectId },
        select: {
          id: true,
          userId: true,
          projectId: true,
          role: true,
          createdAt: true,
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              avatarUrl: true,
            },
          },
        },
        orderBy: { createdAt: 'asc' },
      });

      // Add owner to response
      const owner = await this.prisma.user.findUnique({
        where: { id: project.ownerId },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          avatarUrl: true,
        },
      });

      return {
        statusCode: 200,
        data: {
          owner,
          collaborators,
          total: collaborators.length,
        },
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Failed to fetch collaborators',
      );
    }
  }

  /**
   * Update collaborator role
   * Only project owner can update roles
   */
  async updateCollaboratorRole(
    requesterId: string,
    projectId: string,
    userId: string,
    dto: UpdateRoleDto,
  ) {
    try {
      // Verify requester is project owner
      const project = await this.prisma.project.findUnique({
        where: { id: projectId },
        select: { ownerId: true },
      });

      if (!project) {
        throw new NotFoundException('Project not found');
      }

      if (project.ownerId !== requesterId) {
        throw new ForbiddenException(
          'Only project owner can change collaborator roles',
        );
      }

      // Cannot change owner's role
      if (userId === project.ownerId) {
        throw new ForbiddenException('Cannot change project owner role');
      }

      // Verify collaborator exists
      const collaborator = await this.prisma.projectCollaborator.findUnique({
        where: {
          ux_project_user: {
            projectId,
            userId,
          },
        },
        select: {
          id: true,
          userId: true,
          role: true,
        },
      });

      if (!collaborator) {
        throw new NotFoundException(
          'Collaborator not found on this project',
        );
      }

      // Update role
      const updated = await this.prisma.projectCollaborator.update({
        where: { id: collaborator.id },
        data: { role: dto.role },
        select: {
          id: true,
          userId: true,
          projectId: true,
          role: true,
          createdAt: true,
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              avatarUrl: true,
            },
          },
        },
      });

      return {
        statusCode: 200,
        data: updated,
        message: `${updated.user.email}'s role updated to ${updated.role}`,
      };
    } catch (error) {
      if (
        error instanceof ForbiddenException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Failed to update collaborator role',
      );
    }
  }

  /**
   * Remove collaborator from project
   * Only project owner can remove collaborators
   */
  async removeCollaborator(
    requesterId: string,
    projectId: string,
    userId: string,
  ) {
    try {
      // Verify requester is project owner
      const project = await this.prisma.project.findUnique({
        where: { id: projectId },
        select: { ownerId: true },
      });

      if (!project) {
        throw new NotFoundException('Project not found');
      }

      if (project.ownerId !== requesterId) {
        throw new ForbiddenException(
          'Only project owner can remove collaborators',
        );
      }

      // Cannot remove owner
      if (userId === project.ownerId) {
        throw new ForbiddenException('Cannot remove project owner');
      }

      // Verify collaborator exists
      const collaborator = await this.prisma.projectCollaborator.findUnique({
        where: {
          ux_project_user: {
            projectId,
            userId,
          },
        },
        select: {
          id: true,
          user: {
            select: {
              email: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      });

      if (!collaborator) {
        throw new NotFoundException(
          'Collaborator not found on this project',
        );
      }

      // Remove collaborator
      await this.prisma.projectCollaborator.delete({
        where: { id: collaborator.id },
      });

      return {
        statusCode: 200,
        message: `${collaborator.user.email} removed from project`,
      };
    } catch (error) {
      if (
        error instanceof ForbiddenException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Failed to remove collaborator',
      );
    }
  }
}
