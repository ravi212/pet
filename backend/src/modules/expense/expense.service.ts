import {
  Injectable,
  BadRequestException,
  ForbiddenException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { Prisma } from 'generated/prisma/client';
import { REQUEST_MODE } from 'src/enums/common.enum';

type ExpenseWithRelations = Prisma.ExpenseGetPayload<{
  include: {
    creator: {
      select: { id: true; email: true; firstName: true; lastName: true };
    };
    category: true;
    task: true;
    receipt: true;
    cycle: true;
  };
}>;

@Injectable()
export class ExpenseService {
  constructor(private prisma: PrismaService) {}

  /**
   * Convert BigInt fields to strings for JSON serialization
   */
  private toExpenseResponse(expense: ExpenseWithRelations, mode: REQUEST_MODE = REQUEST_MODE.LIST) {
    return mode == REQUEST_MODE.LIST ? {
      ...expense,
      amount: expense.amount.toString(),
      cycle: expense.cycle? {
        ...expense.cycle,
        budgetAmount: expense.cycle.budgetAmount ? expense.cycle.budgetAmount.toString() : null,
      }: null,
      task: expense.task ? {
        ...expense.task,
        budgetAmount: expense.task.budgetAmount ? expense.task.budgetAmount.toString() : null,
      }: null,
      reimbursedAmount: expense.reimbursedAmount.toString(),
      receipt: expense.receipt ? {
        originalFileName: expense.receipt?.originalFileName,
        fileUrl: expense.receipt?.fileUrl,
      }: null,
    } : {
      label: `${expense.vendor} - ${expense.amount.toString()}`,
      value: expense.id
    };
  }

  /**
   * Create a new expense
   */
  async create(createExpenseDto: CreateExpenseDto, userId: string) {
    try {
      const {
        projectId,
        cycleId,
        categoryId,
        taskId,
        receiptId,
        amount,
        reimbursedAmount,
        incurredAt,
        ...rest
      } = createExpenseDto;

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

      if (cycleId) {
        const cycle = await this.prisma.projectCycle.findUnique({
          where: { id: cycleId },
        });

        if (!cycle || cycle.projectId !== projectId) {
          throw new BadRequestException(
            'Cycle not found or does not belong to this project',
          );
        }

        if (cycle.isLocked) {
          throw new ForbiddenException('Cycle is locked; cannot add expenses');
        }

        // Check if incurredAt is within cycle range
        if (incurredAt < cycle.cycleStart || incurredAt > cycle.cycleEnd) {
          throw new BadRequestException(
            'Expense date must be within cycle range',
          );
        }
      }

      if (categoryId) {
        const category = await this.prisma.category.findUnique({
          where: { id: categoryId },
        });

        if (!category || category.projectId !== projectId) {
          throw new BadRequestException(
            'Category not found or does not belong to this project',
          );
        }
      }

      if (taskId) {
        const task = await this.prisma.task.findUnique({
          where: { id: taskId },
        });

        if (!task || task.projectId !== projectId) {
          throw new BadRequestException(
            'Task not found or does not belong to this project',
          );
        }
      }

      if (receiptId) {
        const receipt = await this.prisma.receipt.findUnique({
          where: { id: receiptId },
        });

        if (!receipt || receipt.projectId !== projectId) {
          throw new BadRequestException(
            'Receipt not found or does not belong to this project',
          );
        }
      }

      const expense = await this.prisma.$transaction(async (prisma) => {
        return prisma.expense.create({
          data: {
            projectId,
            cycleId: cycleId || undefined,
            createdBy: userId,
            amount: BigInt(amount),
            currency: createExpenseDto.currency ?? 'INR',
            incurredAt,
            categoryId: categoryId || undefined,
            taskId: taskId || undefined,
            vendor: rest.vendor,
            note: rest.note,
            receiptId: receiptId || undefined,
            metadata: rest.metadata ?? {},
            modelSuggestedCategory: rest.modelSuggestedCategory,
            suggestionConfidence: rest.suggestionConfidence,
            isReimbursable: rest.isReimbursable ?? false,
            reimbursedAmount: reimbursedAmount
              ? BigInt(reimbursedAmount)
              : BigInt(0),
          },
          include: {
            creator: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
              },
            },
            category: true,
            task: true,
            receipt: true,
            cycle: true,
          },
        });
      });

      return {
        data: this.toExpenseResponse(expense),
        message: 'Expense created successfully',
      };
    } catch (err) {
      throw new InternalServerErrorException('Internal Server Error');
    }
  }

  /**
   * Find all expenses with filters and pagination
   */
  async findAll(
    projectId: string,
    userId: string,
    filters?: {
      search?: string;
      startDate?: Date;
      endDate?: Date;
      categoryId?: string;
      taskId?: string;
      minAmount?: string;
      maxAmount?: string;
      isReimbursable?: boolean;
      createdBy?: string;
    },
    pagination?: { page?: number; limit?: number; orderBy?: 'asc' | 'desc', mode?: REQUEST_MODE },
  ) 
  {
    try {
      // Verify user has access to project
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

      // Build where clause
      const where: any = {
        projectId,
        deletedAt: null,
      };

      // Handle search across vendor, note, and category name
      if (filters?.search) {
        where.OR = [
          { vendor: { contains: filters.search, mode: 'insensitive' } },
          { note: { contains: filters.search, mode: 'insensitive' } },
          {
            category: {
              name: { contains: filters.search, mode: 'insensitive' },
            },
          },
          {
            task: {
              title: { contains: filters.search, mode: 'insensitive' },
            },
          },
          {
            modelSuggestedCategory: {
              contains: filters.search,
              mode: 'insensitive',
            },
          },
        ];
      }

      if (filters) {
        if (filters.startDate || filters.endDate) {
          where.incurredAt = {};
          if (filters.startDate) where.incurredAt.gte = filters.startDate;
          if (filters.endDate) where.incurredAt.lte = filters.endDate;
        }
        if (filters.categoryId) where.categoryId = filters.categoryId;
        if (filters.taskId) where.taskId = filters.taskId;
        if (filters.isReimbursable !== undefined)
          where.isReimbursable = filters.isReimbursable;
        if (filters.createdBy) where.createdBy = filters.createdBy;
        if (filters.minAmount || filters.maxAmount) {
          where.amount = {};
          if (filters.minAmount) where.amount.gte = BigInt(filters.minAmount);
          if (filters.maxAmount) where.amount.lte = BigInt(filters.maxAmount);
        }
      }

      const page = pagination?.page ?? 1;
      const limit = pagination?.limit ?? 10;
      const skip = (page - 1) * limit;
      const orderByDir = pagination?.orderBy ?? 'desc';
      const include = {
            creator: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
              },
            },
            category: true,
            task: true,
            receipt: true,
            cycle: true,
          }
      const [expenses, total] = await Promise.all([
        this.prisma.expense.findMany({
          where,
          include,
          orderBy: { incurredAt: orderByDir },
          skip,
          take: limit,
        }),
        this.prisma.expense.count({ where }),
      ]);

      const totalPages = Math.ceil(total / limit);
      const mode = pagination?.mode ?? REQUEST_MODE.LIST;

      return {
        data: expenses.map((e) => this.toExpenseResponse(e, mode)),
        pagination: { page, limit, total, totalPages },
      };
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

  /**
   * Find a single expense by ID
   */
  async findOne(id: string, userId: string) {
    try {
      const expense = await this.prisma.expense.findUnique({
        where: { id, deletedAt: null },
        include: {
          creator: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
          category: true,
          task: true,
          receipt: true,
          cycle: true,
          project: { include: { collaborators: true } },
        },
      });

      if (!expense) {
        throw new NotFoundException('Expense not found');
      }

      // Check access
      const isOwner = expense.project.ownerId === userId;
      const isCollaborator = expense.project.collaborators.some(
        (c) => c.userId === userId,
      );

      if (!isOwner && !isCollaborator) {
        throw new ForbiddenException('You do not have access to this expense');
      }

      return this.toExpenseResponse(expense);
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

  /**
   * Update an expense
   */
  async update(id: string, updateExpenseDto: UpdateExpenseDto, userId: string) {
    try {
      const expense = await this.prisma.expense.findUnique({
        where: { id, deletedAt: null },
        include: { project: { include: { collaborators: true } } },
      });

      if (!expense) {
        throw new NotFoundException('Expense not found');
      }

      // Check permissions (creator or project editor/owner)
      const isCreator = expense.createdBy === userId;
      const project = expense.project;
      const isOwner = project.ownerId === userId;
      const isEditor = project.collaborators.some(
        (c) =>
          c.userId === userId && (c.role === 'editor' || c.role === 'owner'),
      );

      if (!isCreator && !isOwner && !isEditor) {
        throw new ForbiddenException(
          'You do not have permission to update this expense',
        );
      }

      // Validate changes
      if (
        updateExpenseDto.projectId &&
        updateExpenseDto.projectId !== expense.projectId
      ) {
        throw new BadRequestException('Cannot change project after creation');
      }

      if (updateExpenseDto.cycleId) {
        const cycle = await this.prisma.projectCycle.findUnique({
          where: { id: updateExpenseDto.cycleId },
        });
        if (!cycle || cycle.projectId !== expense.projectId) {
          throw new BadRequestException(
            'Cycle not found or does not belong to this project',
          );
        }
        if (cycle.isLocked) {
          throw new ForbiddenException('Cycle is locked');
        }
      }

      // Validate incurredAt is within cycle if cycle is set or already assigned
      const cycleId = updateExpenseDto.cycleId ?? expense.cycleId;
      const incurredAt = updateExpenseDto.incurredAt ?? expense.incurredAt;

      if (cycleId) {
        const cycle = await this.prisma.projectCycle.findUnique({
          where: { id: cycleId },
        });
        if (incurredAt < cycle!.cycleStart || incurredAt > cycle!.cycleEnd) {
          throw new BadRequestException(
            'Expense date must be within cycle range',
          );
        }
      }

      // Update in transaction
      const updated = await this.prisma.$transaction(async (prisma) => {
        return prisma.expense.update({
          where: { id },
          data: {
            ...(updateExpenseDto.amount && {
              amount: BigInt(updateExpenseDto.amount),
            }),
            ...(updateExpenseDto.reimbursedAmount && {
              reimbursedAmount: BigInt(updateExpenseDto.reimbursedAmount),
            }),
            ...(updateExpenseDto.cycleId !== undefined && {
              cycleId: updateExpenseDto.cycleId || null,
            }),
            ...(updateExpenseDto.categoryId !== undefined && {
              categoryId: updateExpenseDto.categoryId || null,
            }),
            ...(updateExpenseDto.taskId !== undefined && {
              taskId: updateExpenseDto.taskId || null,
            }),
            ...(updateExpenseDto.receiptId !== undefined && {
              receiptId: updateExpenseDto.receiptId || null,
            }),
            ...(updateExpenseDto.incurredAt && {
              incurredAt: updateExpenseDto.incurredAt,
            }),
            ...(updateExpenseDto.vendor !== undefined && {
              vendor: updateExpenseDto.vendor,
            }),
            ...(updateExpenseDto.note !== undefined && {
              note: updateExpenseDto.note,
            }),
            ...(updateExpenseDto.currency && {
              currency: updateExpenseDto.currency,
            }),
            ...(updateExpenseDto.metadata && {
              metadata: updateExpenseDto.metadata,
            }),
            ...(updateExpenseDto.isReimbursable !== undefined && {
              isReimbursable: updateExpenseDto.isReimbursable,
            }),
            ...(updateExpenseDto.modelSuggestedCategory !== undefined && {
              modelSuggestedCategory: updateExpenseDto.modelSuggestedCategory,
            }),
            ...(updateExpenseDto.suggestionConfidence !== undefined && {
              suggestionConfidence: updateExpenseDto.suggestionConfidence,
            }),
          },
          include: {
            creator: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
              },
            },
            category: true,
            task: true,
            receipt: true,
            cycle: true,
          },
        });
      });

      return {
        data: this.toExpenseResponse(updated),
        message: 'Expense updated successfully',
      };
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

  /**
   * Soft delete an expense
   */
  async remove(id: string, userId: string) {
    try {
      const expense = await this.prisma.expense.findUnique({
        where: { id, deletedAt: null },
        include: { project: { include: { collaborators: true } } },
      });

      if (!expense) {
        throw new NotFoundException('Expense not found');
      }

      // Check permissions (creator or project editor/owner)
      const isCreator = expense.createdBy === userId;
      const project = expense.project;
      const isOwner = project.ownerId === userId;
      const isEditor = project.collaborators.some(
        (c) =>
          c.userId === userId && (c.role === 'editor' || c.role === 'owner'),
      );

      if (!isCreator && !isOwner && !isEditor) {
        throw new ForbiddenException(
          'You do not have permission to delete this expense',
        );
      }

      const deleted = await this.prisma.expense.update({
        where: { id },
        data: { deletedAt: new Date() },
        include: {
          creator: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
          category: true,
          task: true,
          receipt: true,
          cycle: true,
        },
      });

      return {
        data: this.toExpenseResponse(deleted),
        message: 'Expense deleted successfully',
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
}
