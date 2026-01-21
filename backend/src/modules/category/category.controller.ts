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
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { REQUEST_MODE } from 'src/enums/common.enum';

@ApiTags('Categories')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @ApiOperation({
    summary: 'Create a new category',
    description:
      'curl -X POST "http://localhost:3000/categories?projectId=project-uuid" ' +
      '-H "Authorization: Bearer {jwt-token}" ' +
      '-H "Content-Type: application/json" ' +
      '-d \'{"name":"Food & Beverages","color":"#FF5733"}\'',
  })
  @ApiQuery({
    name: 'projectId',
    description: 'Project ID',
    example: 'project-uuid',
    required: true,
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'Food & Beverages' },
        color: { type: 'string', example: '#FF5733' },
        parentId: { type: 'string', nullable: true, example: null },
      },
      required: ['name'],
    },
  })
  @Post()
  create(@Req() req, @Body() category: CreateCategoryDto) {
    return this.categoryService.create(req.user.id, category);
  }

  @ApiOperation({
    summary: 'List all categories with pagination',
    description:
      'curl -X GET "http://localhost:3000/categories?projectId=project-uuid&page=1&limit=20&search=food" ' +
      '-H "Authorization: Bearer {jwt-token}"',
  })
  @ApiQuery({
    name: 'projectId',
    description: 'Project ID',
    example: 'project-uuid',
    required: true,
  })
  @ApiQuery({
    name: 'page',
    description: 'Page number',
    example: 1,
    required: false,
  })
  @ApiQuery({
    name: 'limit',
    description: 'Items per page',
    example: 20,
    required: false,
  })
  @ApiQuery({
    name: 'search',
    description: 'Search by category name',
    example: 'food',
    required: false,
  })
  @Get()
  findAll(
    @Req() req,
    @Query('projectId') projectId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('mode') mode?: REQUEST_MODE,
  ) {
    return this.categoryService.findAll(
      req.user.id,
      projectId,
      page ? Number(page) : 1,
      limit ? Number(limit) : 20,
      search,
      mode,
    );
  }

  @ApiOperation({
    summary: 'Get single category by ID',
    description:
      'curl -X GET "http://localhost:3000/categories/category-uuid?projectId=project-uuid" ' +
      '-H "Authorization: Bearer {jwt-token}"',
  })
  @ApiQuery({
    name: 'projectId',
    description: 'Project ID',
    example: 'project-uuid',
    required: true,
  })
  @Get(':id')
  findOne(@Req() req, @Param('id') id: string) {
    return this.categoryService.findOne(req.user.id, id);
  }

  @ApiOperation({
    summary: 'Update category details',
    description:
      'curl -X PATCH "http://localhost:3000/categories/category-uuid?projectId=project-uuid" ' +
      '-H "Authorization: Bearer {jwt-token}" ' +
      '-H "Content-Type: application/json" ' +
      '-d \'{"name":"Updated Category Name","color":"#00FF00"}\'',
  })
  @ApiQuery({
    name: 'projectId',
    description: 'Project ID',
    example: 'project-uuid',
    required: true,
  })
  @Patch(':id')
  update(@Req() req, @Param('id') id: string, @Body() dto: UpdateCategoryDto) {
    return this.categoryService.update(req.user.id, id, dto);
  }

  @ApiOperation({
    summary: 'Delete a category',
    description:
      'curl -X DELETE "http://localhost:3000/categories/category-uuid?projectId=project-uuid" ' +
      '-H "Authorization: Bearer {jwt-token}"',
  })
  @ApiQuery({
    name: 'projectId',
    description: 'Project ID',
    example: 'project-uuid',
    required: true,
  })
  @Delete(':id')
  remove(@Req() req, @Param('id') id: string) {
    return this.categoryService.remove(req.user.id, id);
  }
}
