import {
  Injectable,
  BadRequestException,
  ForbiddenException,
  InternalServerErrorException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCycleDto } from './dto/create-cycle.dto';
import { UpdateCycleDto } from './dto/update-cycle.dto';
import { Prisma } from 'generated/prisma/client';

type CycleWithRelations = Prisma.ProjectCycleGetPayload<{
  include: {
    project: true;
    expenses: true;
  };
}>;

@Injectable()
export class CycleService {
  constructor(private prisma: PrismaService) {}

  /**
   * Convert BigInt fields to strings for JSON serialization
   */
  private toCycleResponse(cycle: CycleWithRelations) {
    return {
      ...cycle,
      budgetAmount: cycle.budgetAmount.toString(),
    };
  }

  async create(createCycleDto: CreateCycleDto, userId: string) {
    try {
      const { projectId, cycleStart, cycleEnd, budgetAmount, rolloverMode } =
        createCycleDto;

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

      const startDate = new Date(cycleStart);
      const endDate = new Date(cycleEnd);

      if (startDate >= endDate) {
        throw new BadRequestException(
          'cycleStart must be before cycleEnd',
        );
      }

      const existingCycle = await this.prisma.projectCycle.findUnique({
        where: {
          ux_project_cycle_start: {
            projectId,
            cycleStart: startDate,
          },
        },
      });

      if (existingCycle) {
        throw new ConflictException(
          'A cycle with this start date already exists for this project',
        );
      }

      const cycle = await this.prisma.projectCycle.create({
        data: {
          projectId,
          cycleStart: startDate,
          cycleEnd: endDate,
          budgetAmount: budgetAmount ? BigInt(budgetAmount) : BigInt(0),
          rolloverMode: rolloverMode ?? 'none',
        },
        include: {
          project: true,
          expenses: true,
        },
      });

      return this.toCycleResponse(cycle);
    } catch (err) {
      if (
        err instanceof BadRequestException ||
        err instanceof ForbiddenException ||
        err instanceof ConflictException
      ) {
        throw err;
      }
      throw new InternalServerErrorException('Internal Server Error');
    }
  }

  async findAll(
    projectId: string,
    userId: string,
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

      const page = pagination?.page ?? 1;
      const limit = pagination?.limit ?? 10;
      const skip = (page - 1) * limit;
      const orderByDir = pagination?.orderBy ?? 'desc';

      const [cycles, total] = await Promise.all([
        this.prisma.projectCycle.findMany({
          where: { projectId },
          include: {
            project: true,
            expenses: true,
          },
          orderBy: { cycleStart: orderByDir },
          skip,
          take: limit,
        }),
        this.prisma.projectCycle.count({ where: { projectId } }),
      ]);

      const totalPages = Math.ceil(total / limit);

      return {
        data: cycles.map((c) => this.toCycleResponse(c)),
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
      const cycle = await this.prisma.projectCycle.findUnique({
        where: { id },
        include: {
          project: { include: { collaborators: true } },
          expenses: true,
        },
      });

      if (!cycle) {
        throw new NotFoundException('Cycle not found');
      }

      const isOwner = cycle.project.ownerId === userId;
      const isCollaborator = cycle.project.collaborators.some(
        (c) => c.userId === userId,
      );

      if (!isOwner && !isCollaborator) {
        throw new ForbiddenException('You do not have access to this cycle');
      }

      return this.toCycleResponse(cycle);
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

  async update(id: string, updateCycleDto: UpdateCycleDto, userId: string) {
    try {
      const cycle = await this.prisma.projectCycle.findUnique({
        where: { id },
        include: { project: { include: { collaborators: true } } },
      });

      if (!cycle) {
        throw new NotFoundException('Cycle not found');
      }

      const isOwner = cycle.project.ownerId === userId;
      const isEditor = cycle.project.collaborators.some(
        (c) =>
          c.userId === userId && (c.role === 'editor' || c.role === 'owner'),
      );

      if (!isOwner && !isEditor) {
        throw new ForbiddenException(
          'You do not have permission to update this cycle',
        );
      }

      // Prevent changes if cycle is locked
      if (cycle.isLocked) {
        throw new ForbiddenException(
          'Cannot update a locked cycle. Unlock it first.',
        );
      }

      // Validate date changes
      const cycleStart = updateCycleDto.cycleStart ?? cycle.cycleStart;
      const cycleEnd = updateCycleDto.cycleEnd ?? cycle.cycleEnd;

      if (cycleStart >= cycleEnd) {
        throw new BadRequestException(
          'cycleStart must be before cycleEnd',
        );
      }

      // If cycleStart is changing, check for duplicate
      if (
        updateCycleDto.cycleStart &&
        updateCycleDto.cycleStart.getTime() !== cycle.cycleStart.getTime()
      ) {
        const existingCycle = await this.prisma.projectCycle.findUnique({
          where: {
            ux_project_cycle_start: {
              projectId: cycle.projectId,
              cycleStart: new Date(updateCycleDto.cycleStart),
            },
          },
        });

        if (existingCycle) {
          throw new ConflictException(
            'A cycle with this start date already exists for this project',
          );
        }
      }

      // Update cycle
      const updated = await this.prisma.projectCycle.update({
        where: { id },
        data: {
          ...(updateCycleDto.cycleStart && {
            cycleStart: new Date(updateCycleDto.cycleStart),
          }),
          ...(updateCycleDto.cycleEnd && {
            cycleEnd: new Date(updateCycleDto.cycleEnd),
          }),
          ...(updateCycleDto.budgetAmount && {
            budgetAmount: BigInt(updateCycleDto.budgetAmount),
          }),
          ...(updateCycleDto.rolloverMode && {
            rolloverMode: updateCycleDto.rolloverMode,
          }),
        },
        include: {
          project: true,
          expenses: true,
        },
      });

      return this.toCycleResponse(updated);
    } catch (err) {
      if (
        err instanceof NotFoundException ||
        err instanceof ForbiddenException ||
        err instanceof BadRequestException ||
        err instanceof ConflictException
      ) {
        throw err;
      }
      throw new InternalServerErrorException('Internal Server Error');
    }
  }


  async toggleLock(id: string, userId: string) {
    try {
      const cycle = await this.prisma.projectCycle.findUnique({
        where: { id },
        include: { project: { include: { collaborators: true } } },
      });

      if (!cycle) {
        throw new NotFoundException('Cycle not found');
      }

      // Check permissions - only owner can lock/unlock
      const isOwner = cycle.project.ownerId === userId;

      if (!isOwner) {
        throw new ForbiddenException(
          'Only project owner can lock/unlock cycles',
        );
      }

      const updated = await this.prisma.projectCycle.update({
        where: { id },
        data: { isLocked: !cycle.isLocked },
        include: {
          project: true,
          expenses: true,
        },
      });

      return {
        ...this.toCycleResponse(updated),
        message: updated.isLocked ? 'Cycle locked' : 'Cycle unlocked',
      };
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

  async remove(id: string, userId: string) {
    try {
      const cycle = await this.prisma.projectCycle.findUnique({
        where: { id },
        include: {
          project: { include: { collaborators: true } },
          expenses: true,
        },
      });

      if (!cycle) {
        throw new NotFoundException('Cycle not found');
      }

      // Check permissions
      const isOwner = cycle.project.ownerId === userId;
      const isEditor = cycle.project.collaborators.some(
        (c) =>
          c.userId === userId && (c.role === 'editor' || c.role === 'owner'),
      );

      if (!isOwner && !isEditor) {
        throw new ForbiddenException(
          'You do not have permission to delete this cycle',
        );
      }

      // Prevent deletion if expenses exist
      if (cycle.expenses.length > 0) {
        throw new BadRequestException(
          `Cannot delete cycle with ${cycle.expenses.length} expense(s). Remove all expenses first.`,
        );
      }

      await this.prisma.projectCycle.delete({
        where: { id },
      });

      return { message: 'Cycle deleted successfully' };
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
}
