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
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('projects/:projectId/categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

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

  @Get(':id')
  findOne(
    @Req() req,
    @Param('id') id: string,
  ) {
    return this.categoryService.findOne(req.user.id, id);
  }

  @Patch(':id')
  update(
    @Req() req,
    @Param('id') id: string,
    @Body() dto: UpdateCategoryDto,
  ) {
    return this.categoryService.update(req.user.id, id, dto);
  }

  @Delete(':id')
  remove(
    @Req() req,
    @Param('id') id: string,
  ) {
    return this.categoryService.remove(req.user.id, id);
  }
}
