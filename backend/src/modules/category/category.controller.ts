import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody, ApiQuery } from '@nestjs/swagger';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Categories')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('projects/:projectId/categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @ApiOperation({ 
    summary: 'Create a new category',
    description: 'curl -X POST http://localhost:3000/projects/project-uuid/categories -H "Authorization: Bearer {jwt-token}" -H "Content-Type: application/json" -d \'{"name":"Food & Beverages","color":"#FF5733"}\''
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'Food & Beverages' },
        color: { type: 'string', example: '#FF5733' },
        parentId: { type: 'string', example: null }
      }
    }
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Category created successfully',
    schema: {
      example: {
        id: 'category-uuid',
        projectId: 'project-uuid',
        name: 'Food & Beverages',
        color: '#FF5733',
        createdAt: '2024-12-30T10:30:00Z'
      }
    }
  })
  @Post()
  create(
    @Req() req,
    @Param('projectId') projectId: string,
    @Body() dto: CreateCategoryDto,
  ) {
    return this.categoryService.create(req.user.id, {
      ...dto,
      projectId,
    });
  }

  @ApiOperation({ 
    summary: 'List all categories with pagination',
    description: 'curl -X GET "http://localhost:3000/projects/project-uuid/categories?page=1&limit=20&search=food" -H "Authorization: Bearer {jwt-token}"'
  })
  @ApiQuery({ name: 'page', description: 'Page number', example: 1, required: false })
  @ApiQuery({ name: 'limit', description: 'Items per page', example: 20, required: false })
  @ApiQuery({ name: 'search', description: 'Search by category name', required: false })
  @ApiResponse({ 
    status: 200, 
    description: 'Categories retrieved successfully',
    schema: {
      example: {
        data: [{ id: 'category-uuid', name: 'Food & Beverages', color: '#FF5733' }],
        page: 1,
        limit: 20,
        total: 3
      }
    }
  })
  @Get()
  findAll(
    @Req() req,
    @Param('projectId') projectId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ) {
    return this.categoryService.findAll(
      req.user.id,
      projectId,
      page ? Number(page) : 1,
      limit ? Number(limit) : 20,
      search,
    );
  }

  @ApiOperation({ 
    summary: 'Get single category by ID',
    description: 'curl -X GET http://localhost:3000/projects/project-uuid/categories/category-uuid -H "Authorization: Bearer {jwt-token}"'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Category retrieved successfully',
    schema: {
      example: {
        id: 'category-uuid',
        projectId: 'project-uuid',
        name: 'Food & Beverages',
        color: '#FF5733'
      }
    }
  })
  @Get(':id')
  findOne(
    @Req() req,
    @Param('id') id: string,
  ) {
    return this.categoryService.findOne(req.user.id, id);
  }

  @ApiOperation({ 
    summary: 'Update category details',
    description: 'curl -X PATCH http://localhost:3000/projects/project-uuid/categories/category-uuid -H "Authorization: Bearer {jwt-token}" -H "Content-Type: application/json" -d \'{"name":"Updated Category Name","color":"#00FF00"}\''
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'Updated Category Name' },
        color: { type: 'string', example: '#00FF00' }
      }
    }
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Category updated successfully',
    schema: { example: { message: 'Category updated successfully' } }
  })
  @Patch(':id')
  update(
    @Req() req,
    @Param('id') id: string,
    @Body() dto: UpdateCategoryDto,
  ) {
    return this.categoryService.update(req.user.id, id, dto);
  }

  @ApiOperation({ 
    summary: 'Delete a category',
    description: 'curl -X DELETE http://localhost:3000/projects/project-uuid/categories/category-uuid -H "Authorization: Bearer {jwt-token}"'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Category deleted successfully',
    schema: { example: { message: 'Category deleted successfully' } }
  })
  @Delete(':id')
  remove(
    @Req() req,
    @Param('id') id: string,
  ) {
    return this.categoryService.remove(req.user.id, id);
  }
}
  
