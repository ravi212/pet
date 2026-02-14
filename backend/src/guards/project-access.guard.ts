import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../modules/prisma/prisma.service';

/**
 * Guard that verifies:
 * 1. User is authenticated (handled by JwtAuthGuard)
 * 2. User is owner or collaborator of the project
 * 3. Sets user role on request for downstream RBAC checks
 */
@Injectable()
export class ProjectAccessGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const userId = request.user?.id;
    const projectId = request.params?.projectId;

    if (!userId || !projectId) {
      throw new ForbiddenException('Missing userId or projectId');
    }

    // Check if user is project owner
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      select: { ownerId: true },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    if (project.ownerId === userId) {
      request.userRole = 'owner';
      return true;
    }

    // Check if user is collaborator
    const collaborator = await this.prisma.projectCollaborator.findUnique({
      where: {
        ux_project_user: {
          projectId,
          userId,
        },
      },
      select: { role: true },
    });

    if (!collaborator) {
      throw new ForbiddenException(
        'You do not have access to this project',
      );
    }

    request.userRole = collaborator.role;
    return true;
  }
}
