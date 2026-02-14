import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Prisma } from 'generated/prisma/client';
import { REQUEST_MODE } from 'src/enums/common.enum';

@Injectable()
export class CategoryService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateCategoryDto) {
    try {
      /**
       * Optional but IMPORTANT:
       * Validate that user owns the project (or is collaborator).
       * For now, owner-only like ProjectService.
       */
      await this.prisma.project.findFirstOrThrow({
        where: {
          id: dto.projectId,
          ownerId: userId,
        },
      });

      const category = await this.prisma.category.create({
        data: {
          projectId: dto.projectId,
          name: dto.name,
          color: dto.color,
          parentId: dto.parentId,
        },
        select: {
          id: true,
          name: true,
          parentId: true,
        },
      });

      return {
        data: category,
        message: 'Category created successfully',
      };
    } catch (e) {
      throw new InternalServerErrorException('Something went wrong');
    }
  }

  async findAll(
    userId: string,
    projectId: string,
    page = 1,
    limit = 10,
    search?: string,
    mode: REQUEST_MODE = REQUEST_MODE.LIST
  ) {
    try {
      const skip = (page - 1) * limit;

      // Allow any user with access to the project (owner or collaborator) to view categories
      const where: Prisma.CategoryWhereInput = {
        projectId,
        OR: [
          {
            project: {
              ownerId: userId,
            },
          },
          {
            project: {
              collaborators: {
                some: {
                  userId: userId,
                },
              },
            },
          },
        ],
      };

      if (search) {
        where.name = {
          contains: search,
          mode: 'insensitive',
        };
      }

      const [categories, total] = await Promise.all([
        this.prisma.category.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: 'asc' },
          include: {
            children: true, 
          },
        }),
        this.prisma.category.count({ where }),
      ]);

      let finalCategories: any[] = categories;

      if (mode == REQUEST_MODE.SELECT) {
        finalCategories = categories.map((c) => ({
          label: c.name,
          value: c.id,
        }));
      }

      return {
        data: finalCategories,
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
      // Allow any user with access to the project (owner or collaborator) to view category
      const category = await this.prisma.category.findFirst({
        where: {
          id,
          OR: [
            {
              project: {
                ownerId: userId,
              },
            },
            {
              project: {
                collaborators: {
                  some: {
                    userId: userId,
                  },
                },
              },
            },
          ],
        },
        include: {
          children: true,
          parent: true,
        },
      });

      if (!category) {
        throw new NotFoundException('Category not found');
      }

      return {
        data: category,
        message: 'Category found',
      };
    } catch (e) {
      throw new InternalServerErrorException('Something went wrong');
    }
  }

  async update(
    userId: string,
    id: string,
    dto: UpdateCategoryDto,
  ) {
    try {
      // Editors and owners can update; need to check user role via project access
      const category = await this.prisma.category.findFirst({
        where: {
          id,
        },
        include: {
          project: {
            select: {
              ownerId: true,
              collaborators: {
                where: { userId },
                select: { role: true },
              },
            },
          },
        },
      });

      if (!category) {
        throw new NotFoundException('Category not found');
      }

      // Check authorization: owner or editor
      const isOwner = category.project.ownerId === userId;
      const collaboratorRole = category.project.collaborators[0]?.role;
      const isEditor = collaboratorRole === 'editor' || collaboratorRole === 'owner';

      if (!isOwner && !isEditor) {
        throw new NotFoundException('Category not found');
      }

      const updated = await this.prisma.category.update({
        where: {
          id,
        },
        data: dto,
        select: {
          id: true,
          name: true,
          parentId: true,
        },
      });

      return {
        data: updated,
        message: 'Category updated successfully',
      };
    } catch (e) {
      throw new InternalServerErrorException('Something went wrong');
    }
  }

  async remove(userId: string, id: string) {
    try {
      /**
       * IMPORTANT DESIGN NOTE:
       * Deleting a category will SET NULL on:
       * - expenses.categoryId
       * - children.parentId
       * because of onDelete: SetNull
       * 
       * Only project owner can delete
       */
      const category = await this.prisma.category.findFirst({
        where: { id },
        include: {
          project: {
            select: { ownerId: true },
          },
        },
      });

      if (!category) {
        throw new NotFoundException('Category not found');
      }

      if (category.project.ownerId !== userId) {
        throw new ForbiddenException('Only project owner can delete categories');
      }

      const deleted = await this.prisma.category.delete({
        where: { id },
        select: {
          id: true,
          name: true,
        },
      });

      return {
        data: deleted,
        message: 'Category deleted successfully',
      };
    } catch (e) {
      if (e instanceof NotFoundException || e instanceof ForbiddenException) {
        throw e;
      }
      throw new InternalServerErrorException('Something went wrong');
    }
  }
}
