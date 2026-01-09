import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Prisma } from 'generated/prisma/client';

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
  ) {
    try {
      const skip = (page - 1) * limit;

      const where: Prisma.CategoryWhereInput = {
        project: {
          ownerId: userId,
        },
        projectId,
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

      return {
        data: categories,
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
      const category = await this.prisma.category.findFirst({
        where: {
          id,
          project: {
            ownerId: userId,
          },
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
      const category = await this.prisma.category.update({
        where: {
          id,
          project: {
            ownerId: userId,
          },
        },
        data: dto,
        select: {
          id: true,
          name: true,
          parentId: true,
        },
      });

      return {
        data: category,
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
       */
      const category = await this.prisma.category.delete({
        where: {
          id,
          project: {
            ownerId: userId,
          },
        },
        select: {
          id: true,
          name: true,
        },
      });

      return {
        data: category,
        message: 'Category deleted successfully',
      };
    } catch (e) {
      throw new InternalServerErrorException('Something went wrong');
    }
  }
}
