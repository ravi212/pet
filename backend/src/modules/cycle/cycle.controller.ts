import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  Req,
} from '@nestjs/common';
import { CycleService } from './cycle.service';
import { CreateCycleDto } from './dto/create-cycle.dto';
import { UpdateCycleDto } from './dto/update-cycle.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('cycles')
export class CycleController {
  constructor(private readonly cycleService: CycleService) {}

  @Post()
  create(@Body() createCycleDto: CreateCycleDto, @Req() req) {
    return this.cycleService.create(createCycleDto, req.user.id);
  }

  @Get()
  findAll(
    @Req() req,
    @Query('projectId') projectId: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Query('orderBy') orderBy?: 'asc' | 'desc',
  ) {
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 10));

    const pagination = {
      page: pageNum,
      limit: limitNum,
      orderBy,
    };

    return this.cycleService.findAll(projectId, req.user.id, pagination);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req) {
    return this.cycleService.findOne(id, req.user.id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateCycleDto: UpdateCycleDto,
    @Req() req
  ) {
    return this.cycleService.update(id, updateCycleDto, req.user.id);
  }

  @Patch(':id/toggle-lock')
  toggleLock(@Param('id') id: string, @Req() req) {
    return this.cycleService.toggleLock(id, req.user.id);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req) {
    return this.cycleService.remove(id, req.user.id);
  }
}
