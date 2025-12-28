import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { TaskService } from './task.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('tasks')
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @Post()
  create(@Body() createTaskDto: CreateTaskDto, @Request() req: any) {
    return this.taskService.create(createTaskDto, req.user.id);
  }

  @Get()
  findAll(
    @Query('projectId') projectId: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Query('search') search?: string,
    @Query('status') status?: string,
    @Query('assignedTo') assignedTo?: string,
    @Query('orderBy') orderBy?: 'asc' | 'desc',
    @Request() req?: any,
  ) {
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 10));

    const filters = {
      search,
      status,
      assignedTo,
    };

    const pagination = {
      page: pageNum,
      limit: limitNum,
      orderBy,
    };

    return this.taskService.findAll(projectId, req.user.id, filters, pagination);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req: any) {
    return this.taskService.findOne(id, req.user.id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateTaskDto: UpdateTaskDto,
    @Request() req: any,
  ) {
    return this.taskService.update(id, updateTaskDto, req.user.id);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req: any) {
    return this.taskService.remove(id, req.user.id);
  }
}
