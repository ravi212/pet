import {
  Injectable,
  BadRequestException,
  ForbiddenException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { Prisma } from 'generated/prisma/client';

type TaskWithRelations = Prisma.TaskGetPayload<{
  include: {
    project: true;
    assignee: {
      select: { id: true; email: true; firstName: true; lastName: true };
    };
  };
}>;

@Injectable()
export class TaskService {
  constructor(private prisma: PrismaService) {}

  /**
   * Convert BigInt fields to strings for JSON serialization
   */
  private toTaskResponse(task: TaskWithRelations) {
    return {
      ...task,
      budgetAmount: task.budgetAmount ? task.budgetAmount.toString() : null,
    };
  }

  /**
   * Create a new task
   */
  async create(createTaskDto: CreateTaskDto, userId: string) {
    try {
      const { projectId, assignedTo, budgetAmount, ...rest } = createTaskDto;

      const project = await this.prisma.project.findUnique({
        where: { id: projectId },
        include: { collaborators: true },
      });

      if (!project) {
        throw new BadRequestException('Project not found');
      }

      const isOwner = project.ownerId === userId;
      const isCollaborator = project.collaborators.some(
        (c) => c.userId === userId,
      );

      if (!isOwner && !isCollaborator) {
        throw new ForbiddenException('You do not have access to this project');
      }

      if (assignedTo) {
        const assignee = await this.prisma.user.findUnique({
          where: { id: assignedTo },
        });

        if (!assignee) {
          throw new BadRequestException('Assignee not found');
        }

        const assigneeIsOwner = project.ownerId === assignedTo;
        const assigneeIsCollaborator = project.collaborators.some(
          (c) => c.userId === assignedTo,
        );

        if (!assigneeIsOwner && !assigneeIsCollaborator) {
          throw new BadRequestException(
            'Assignee does not have access to this project',
          );
        }
      }

      const task = await this.prisma.task.create({
        data: {
          projectId,
          title: rest.title,
          description: rest.description,
          assignedTo: assignedTo || undefined,
          budgetAmount: budgetAmount ? BigInt(budgetAmount) : undefined,
          status: rest.status ?? 'todo',
        },
        include: {
          project: true,
          assignee: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      });

      return this.toTaskResponse(task);
    } catch (err) {
      if (
        err instanceof BadRequestException ||
        err instanceof ForbiddenException
      ) {
        throw err;
      }
      throw new InternalServerErrorException('Internal Server Error');
    }
  }

  async findAll(
    projectId: string,
    userId: string,
    filters?: {
      search?: string;
      status?: string;
      assignedTo?: string;
    },
    pagination?: { page?: number; limit?: number; orderBy?: 'asc' | 'desc' },
  ) {
    try {

      const project = await this.prisma.project.findUnique({
        where: { id: projectId },
        include: { collaborators: true },
      });

      if (!project) {
        throw new BadRequestException('Project not found');
      }

      const isOwner = project.ownerId === userId;
      const isCollaborator = project.collaborators.some(
        (c) => c.userId === userId,
      );

      if (!isOwner && !isCollaborator) {
        throw new ForbiddenException('You do not have access to this project');
      }

      const where: any = {
        projectId,
      };

      if (filters) {
        if (filters.search) {
          where.OR = [
            { title: { contains: filters.search, mode: 'insensitive' } },
            { description: { contains: filters.search, mode: 'insensitive' } },
          ];
        }
        if (filters.status) {
          where.status = filters.status;
        }
        if (filters.assignedTo) {
          where.assignedTo = filters.assignedTo;
        }
      }

      const page = pagination?.page ?? 1;
      const limit = pagination?.limit ?? 10;
      const skip = (page - 1) * limit;
      const orderByDir = pagination?.orderBy ?? 'desc';

      const [tasks, total] = await Promise.all([
        this.prisma.task.findMany({
          where,
          include: {
            project: true,
            assignee: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
              },
            },
          },
          orderBy: { createdAt: orderByDir },
          skip,
          take: limit,
        }),
        this.prisma.task.count({ where }),
      ]);

      const totalPages = Math.ceil(total / limit);

      return {
        data: tasks.map((t) => this.toTaskResponse(t)),
        pagination: { page, limit, total, totalPages },
      };
    } catch (err) {
      if (err instanceof BadRequestException || err instanceof ForbiddenException) {
        throw err;
      }
      throw new InternalServerErrorException('Internal Server Error');
    }
  }

  async findOne(id: string, userId: string) {
    try {
      const task = await this.prisma.task.findUnique({
        where: { id },
        include: {
          project: { include: { collaborators: true } },
          assignee: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      });

      if (!task) {
        throw new NotFoundException('Task not found');
      }

      const isOwner = task.project.ownerId === userId;
      const isCollaborator = task.project.collaborators.some(
        (c) => c.userId === userId,
      );

      if (!isOwner && !isCollaborator) {
        throw new ForbiddenException('You do not have access to this task');
      }

      return this.toTaskResponse(task);
    } catch (err) {
      if (
        err instanceof NotFoundException ||
        err instanceof ForbiddenException
      ) {
        throw err;
      }
      throw new InternalServerErrorException('Internal Server Error');
    }
  }

  async update(id: string, updateTaskDto: UpdateTaskDto, userId: string) {
    try {
      const task = await this.prisma.task.findUnique({
        where: { id },
        include: { project: { include: { collaborators: true } } },
      });

      if (!task) {
        throw new NotFoundException('Task not found');
      }

      // Check permissions
      const isOwner = task.project.ownerId === userId;
      const isEditor = task.project.collaborators.some(
        (c) =>
          c.userId === userId && (c.role === 'editor' || c.role === 'owner'),
      );

      if (!isOwner && !isEditor) {
        throw new ForbiddenException(
          'You do not have permission to update this task',
        );
      }

      // Validate changes
      if (
        updateTaskDto.projectId &&
        updateTaskDto.projectId !== task.projectId
      ) {
        throw new BadRequestException('Cannot change project after creation');
      }

      // Validate new assignee if provided
      if (updateTaskDto.assignedTo) {
        const assignee = await this.prisma.user.findUnique({
          where: { id: updateTaskDto.assignedTo },
        });

        if (!assignee) {
          throw new BadRequestException('Assignee not found');
        }

        // Check if assignee has access to project
        const assigneeIsOwner = task.project.ownerId === updateTaskDto.assignedTo;
        const assigneeIsCollaborator = task.project.collaborators.some(
          (c) => c.userId === updateTaskDto.assignedTo,
        );

        if (!assigneeIsOwner && !assigneeIsCollaborator) {
          throw new BadRequestException(
            'Assignee does not have access to this project',
          );
        }
      }

      // Update task
      const updated = await this.prisma.task.update({
        where: { id },
        data: {
          ...(updateTaskDto.title && { title: updateTaskDto.title }),
          ...(updateTaskDto.description !== undefined && {
            description: updateTaskDto.description,
          }),
          ...(updateTaskDto.assignedTo !== undefined && {
            assignedTo: updateTaskDto.assignedTo || null,
          }),
          ...(updateTaskDto.budgetAmount !== undefined && {
            budgetAmount: updateTaskDto.budgetAmount
              ? BigInt(updateTaskDto.budgetAmount)
              : null,
          }),
          ...(updateTaskDto.status && { status: updateTaskDto.status }),
        },
        include: {
          project: true,
          assignee: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      });

      return this.toTaskResponse(updated);
    } catch (err) {
      if (
        err instanceof NotFoundException ||
        err instanceof ForbiddenException ||
        err instanceof BadRequestException
      ) {
        throw err;
      }
      throw new InternalServerErrorException('Internal Server Error');
    }
  }

  async remove(id: string, userId: string) {
    try {
      const task = await this.prisma.task.findUnique({
        where: { id },
        include: { project: { include: { collaborators: true } } },
      });

      if (!task) {
        throw new NotFoundException('Task not found');
      }

      // Check permissions
      const isOwner = task.project.ownerId === userId;
      const isEditor = task.project.collaborators.some(
        (c) =>
          c.userId === userId && (c.role === 'editor' || c.role === 'owner'),
      );

      if (!isOwner && !isEditor) {
        throw new ForbiddenException(
          'You do not have permission to delete this task',
        );
      }

      await this.prisma.task.delete({
        where: { id },
      });

      return { message: 'Task deleted successfully' };
    } catch (err) {
      if (
        err instanceof NotFoundException ||
        err instanceof ForbiddenException
      ) {
        throw err;
      }
      throw new InternalServerErrorException('Internal Server Error');
    }
  }
}
