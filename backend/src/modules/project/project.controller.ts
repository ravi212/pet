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
import { ProjectService } from './project.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Projects')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('projects')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @ApiOperation({ 
    summary: 'Create a new project',
    description: 'curl -X POST http://localhost:3000/projects -H "Authorization: Bearer {jwt-token}" -H "Content-Type: application/json" -d \'{"title":"Team Outing Budget","description":"Budget for annual team outing","type":"one_time","currency":"INR","timezone":"Asia/Kolkata"}\''
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string', example: 'Team Outing Budget' },
        description: { type: 'string', example: 'Budget for annual team outing' },
        type: { type: 'string', example: 'one_time' },
        currency: { type: 'string', example: 'INR' },
        timezone: { type: 'string', example: 'Asia/Kolkata' }
      }
    }
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Project created successfully',
    schema: {
      example: {
        id: 'project-uuid',
        title: 'Team Outing Budget',
        description: 'Budget for annual team outing',
        type: 'one_time',
        currency: 'INR',
        timezone: 'Asia/Kolkata',
        isArchived: false,
        createdAt: '2024-12-30T10:30:00Z'
      }
    }
  })
  @Post()
  create(@Req() req, @Body() createProjectDto: CreateProjectDto) {
    return this.projectService.create(req.user.id, createProjectDto);
  }

  @ApiOperation({ 
    summary: 'List all projects with pagination',
    description: 'curl -X GET "http://localhost:3000/projects?page=1&limit=10&search=budget" -H "Authorization: Bearer {jwt-token}"'
  })
  @ApiQuery({ name: 'page', description: 'Page number', example: 1, required: false })
  @ApiQuery({ name: 'limit', description: 'Items per page', example: 10, required: false })
  @ApiQuery({ name: 'search', description: 'Search by project title/description', required: false })
  @ApiResponse({ 
    status: 200, 
    description: 'Projects retrieved successfully',
    schema: {
      example: {
        data: [{ id: 'project-uuid', title: 'Team Outing Budget' }],
        page: 1,
        limit: 10,
        total: 5
      }
    }
  })
  @Get()
  findAll(
    @Req() req,
    @Query('page') page: string,
    @Query('limit') limit: string,
    @Query('search') search: string,
  ) {
    return this.projectService.findAll(
      req.user.id,
      +page || 1,
      +limit || 10,
      search,
    );
  }

  @ApiOperation({ 
    summary: 'Get single project by ID',
    description: 'curl -X GET http://localhost:3000/projects/project-uuid -H "Authorization: Bearer {jwt-token}"'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Project retrieved successfully',
    schema: {
      example: {
        id: 'project-uuid',
        title: 'Team Outing Budget',
        description: 'Budget for annual team outing'
      }
    }
  })
  @Get(':id')
  findOne(@Req() req, @Param('id') id: string) {
    return this.projectService.findOne(req.user.id, id);
  }

  @ApiOperation({ 
    summary: 'Update project details',
    description: 'curl -X PATCH http://localhost:3000/projects/project-uuid -H "Authorization: Bearer {jwt-token}" -H "Content-Type: application/json" -d \'{"title":"Updated Title","description":"Updated description"}\''
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string', example: 'Updated Title' },
        description: { type: 'string', example: 'Updated description' },
        timezone: { type: 'string', example: 'Asia/Kolkata' },
        isArchived: { type: 'boolean', example: false }
      }
    }
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Project updated successfully',
    schema: { example: { message: 'Project updated successfully' } }
  })
  @Patch(':id')
  update(
    @Req() req,
    @Param('id') id: string,
    @Body() updateProjectDto: UpdateProjectDto,
  ) {
    return this.projectService.update(req.user.id, id, updateProjectDto);
  }

  @ApiOperation({ 
    summary: 'Delete a project',
    description: 'curl -X DELETE http://localhost:3000/projects/project-uuid -H "Authorization: Bearer {jwt-token}"'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Project deleted successfully',
    schema: { example: { message: 'Project deleted successfully' } }
  })
  @Delete(':id')
  remove(@Req() req, @Param('id') id: string) {
    return this.projectService.remove(req.user.id, id);
  }
}
