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
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody, ApiQuery } from '@nestjs/swagger';
import { TaskService } from './task.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Tasks')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('tasks')
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @ApiOperation({ 
    summary: 'Create a new task',
    description: 'curl -X POST http://localhost:3000/tasks -H "Authorization: Bearer {jwt-token}" -H "Content-Type: application/json" -d \'{"projectId":"project-uuid","title":"Arrange transportation","description":"Book buses for team outing","status":"todo"}\''
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        projectId: { type: 'string', example: 'project-uuid' },
        title: { type: 'string', example: 'Arrange transportation' },
        description: { type: 'string', example: 'Book buses for team outing' },
        status: { type: 'string', example: 'todo' },
        budgetAmount: { type: 'string', example: '50000' }
      }
    }
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Task created successfully',
    schema: {
      example: {
        id: 'task-uuid',
        projectId: 'project-uuid',
        title: 'Arrange transportation',
        status: 'todo',
        createdAt: '2024-12-30T10:30:00Z'
      }
    }
  })
  @Post()
  create(@Body() createTaskDto: CreateTaskDto, @Request() req: any) {
    return this.taskService.create(createTaskDto, req.user.id);
  }

  @ApiOperation({ 
    summary: 'List all tasks with filtering and pagination',
    description: 'curl -X GET "http://localhost:3000/tasks?projectId=project-uuid&page=1&limit=10&search=transport&status=todo" -H "Authorization: Bearer {jwt-token}"'
  })
  @ApiQuery({ name: 'projectId', description: 'Filter by project ID' })
  @ApiQuery({ name: 'page', description: 'Page number', example: 1, required: false })
  @ApiQuery({ name: 'limit', description: 'Items per page', example: 10, required: false })
  @ApiQuery({ name: 'search', description: 'Search by title/description', required: false })
  @ApiQuery({ name: 'status', description: 'Filter by status (todo/in_progress/done)', required: false })
  @ApiQuery({ name: 'assignedTo', description: 'Filter by assignee', required: false })
  @ApiQuery({ name: 'orderBy', description: 'Sort order (asc/desc)', required: false })
  @ApiResponse({ 
    status: 200, 
    description: 'Tasks retrieved successfully',
    schema: {
      example: {
        data: [{ id: 'task-uuid', title: 'Arrange transportation', status: 'todo' }],
        page: 1,
        limit: 10,
        total: 12
      }
    }
  })
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

  @ApiOperation({ 
    summary: 'Get single task by ID',
    description: 'curl -X GET http://localhost:3000/tasks/task-uuid -H "Authorization: Bearer {jwt-token}"'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Task retrieved successfully',
    schema: {
      example: {
        id: 'task-uuid',
        projectId: 'project-uuid',
        title: 'Arrange transportation',
        description: 'Book buses for team outing',
        status: 'todo'
      }
    }
  })
  @Get(':id')
  findOne(@Param('id') id: string, @Request() req: any) {
    return this.taskService.findOne(id, req.user.id);
  }

  @ApiOperation({ 
    summary: 'Update task details',
    description: 'curl -X PATCH http://localhost:3000/tasks/task-uuid -H "Authorization: Bearer {jwt-token}" -H "Content-Type: application/json" -d \'{"title":"Updated title","status":"in_progress"}\''
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string', example: 'Updated title' },
        description: { type: 'string', example: 'Updated description' },
        status: { type: 'string', example: 'in_progress' },
        assignedTo: { type: 'string', example: 'user-uuid' }
      }
    }
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Task updated successfully',
    schema: { example: { message: 'Task updated successfully' } }
  })
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateTaskDto: UpdateTaskDto,
    @Request() req: any,
  ) {
    return this.taskService.update(id, updateTaskDto, req.user.id);
  }

  @ApiOperation({ 
    summary: 'Delete a task',
    description: 'curl -X DELETE http://localhost:3000/tasks/task-uuid -H "Authorization: Bearer {jwt-token}"'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Task deleted successfully',
    schema: { example: { message: 'Task deleted successfully' } }
  })
  @Delete(':id')
  remove(@Param('id') id: string, @Request() req: any) {
    return this.taskService.remove(id, req.user.id);
  }
}
