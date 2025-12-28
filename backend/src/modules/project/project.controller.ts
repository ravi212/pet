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
import { ProjectService } from './project.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('projects')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @Post()
  create(@Req() req, @Body() createProjectDto: CreateProjectDto) {
    return this.projectService.create(req.user.id, createProjectDto);
  }

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

  @Get(':id')
  findOne(@Req() req, @Param('id') id: string) {
    return this.projectService.findOne(req.user.id, id);
  }

  @Patch(':id')
  update(
    @Req() req,
    @Param('id') id: string,
    @Body() updateProjectDto: UpdateProjectDto,
  ) {
    return this.projectService.update(req.user.id, id, updateProjectDto);
  }

  @Delete(':id')
  remove(@Req() req, @Param('id') id: string) {
    return this.projectService.remove(req.user.id, id);
  }
}
