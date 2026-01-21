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
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody, ApiQuery } from '@nestjs/swagger';
import { CycleService } from './cycle.service';
import { CreateCycleDto } from './dto/create-cycle.dto';
import { UpdateCycleDto } from './dto/update-cycle.dto';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { REQUEST_MODE } from 'src/enums/common.enum';

@ApiTags('Cycles')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('cycles')
export class CycleController {
  constructor(private readonly cycleService: CycleService) {}

  @ApiOperation({ 
    summary: 'Create a new cycle',
    description: 'curl -X POST http://localhost:3000/cycles -H "Authorization: Bearer {jwt-token}" -H "Content-Type: application/json" -d \'{"projectId":"project-uuid","cycleStart":"2024-12-01","cycleEnd":"2024-12-31","budgetAmount":"100000","rolloverMode":"none"}\''
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        projectId: { type: 'string', example: 'project-uuid' },
        cycleStart: { type: 'string', example: '2024-12-01' },
        cycleEnd: { type: 'string', example: '2024-12-31' },
        budgetAmount: { type: 'string', example: '100000' },
        rolloverMode: { type: 'string', example: 'none' }
      }
    }
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Cycle created successfully',
    schema: {
      example: {
        id: 'cycle-uuid',
        projectId: 'project-uuid',
        budgetAmount: '100000',
        isLocked: false,
        createdAt: '2024-12-30T10:30:00Z'
      }
    }
  })
  @Post()
  create(@Body() createCycleDto: CreateCycleDto, @Req() req) {
    return this.cycleService.create(createCycleDto, req.user.id);
  }

  @ApiOperation({ 
    summary: 'List all cycles with pagination',
    description: 'curl -X GET "http://localhost:3000/cycles?projectId=project-uuid&page=1&limit=10" -H "Authorization: Bearer {jwt-token}"'
  })
  @ApiQuery({ name: 'projectId', description: 'Filter by project ID' })
  @ApiQuery({ name: 'page', description: 'Page number', example: 1, required: false })
  @ApiQuery({ name: 'limit', description: 'Items per page', example: 10, required: false })
  @ApiQuery({ name: 'orderBy', description: 'Sort order (asc/desc)', required: false })
  @ApiResponse({ 
    status: 200, 
    description: 'Cycles retrieved successfully',
    schema: {
      example: {
        data: [{ id: 'cycle-uuid', cycleStart: '2024-12-01', cycleEnd: '2024-12-31', budgetAmount: '100000' }],
        page: 1,
        limit: 10,
        total: 3
      }
    }
  })
  @Get()
  findAll(
    @Req() req,
    @Query('projectId') projectId: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Query('orderBy') orderBy?: 'asc' | 'desc',
    @Query('mode') mode?: REQUEST_MODE,
  ) {
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 10));

    const pagination = {
      page: pageNum,
      limit: limitNum,
      orderBy,
      mode,
    };

    return this.cycleService.findAll(projectId, req.user.id, pagination);
  }

  @ApiOperation({ 
    summary: 'Get single cycle by ID',
    description: 'curl -X GET http://localhost:3000/cycles/cycle-uuid -H "Authorization: Bearer {jwt-token}"'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Cycle retrieved successfully',
    schema: {
      example: {
        id: 'cycle-uuid',
        projectId: 'project-uuid',
        cycleStart: '2024-12-01',
        cycleEnd: '2024-12-31',
        budgetAmount: '100000',
        isLocked: false
      }
    }
  })
  @Get(':id')
  findOne(@Param('id') id: string, @Req() req) {
    return this.cycleService.findOne(id, req.user.id);
  }

  @ApiOperation({ 
    summary: 'Update cycle details',
    description: 'curl -X PATCH http://localhost:3000/cycles/cycle-uuid -H "Authorization: Bearer {jwt-token}" -H "Content-Type: application/json" -d \'{"budgetAmount":"150000","rolloverMode":"rollover_positive"}\''
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        budgetAmount: { type: 'string', example: '150000' },
        rolloverMode: { type: 'string', example: 'rollover_positive' }
      }
    }
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Cycle updated successfully',
    schema: { example: { message: 'Cycle updated successfully' } }
  })
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateCycleDto: UpdateCycleDto,
    @Req() req
  ) {
    return this.cycleService.update(id, updateCycleDto, req.user.id);
  }

  @ApiOperation({ 
    summary: 'Toggle cycle lock status',
    description: 'curl -X PATCH http://localhost:3000/cycles/cycle-uuid/toggle-lock -H "Authorization: Bearer {jwt-token}"'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Cycle lock status toggled successfully',
    schema: { example: { message: 'Cycle lock toggled' } }
  })
  @Patch(':id/toggle-lock')
  toggleLock(@Param('id') id: string, @Req() req) {
    return this.cycleService.toggleLock(id, req.user.id);
  }

  @ApiOperation({ 
    summary: 'Delete a cycle',
    description: 'curl -X DELETE http://localhost:3000/cycles/cycle-uuid -H "Authorization: Bearer {jwt-token}"'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Cycle deleted successfully',
    schema: { example: { message: 'Cycle deleted successfully' } }
  })
  @Delete(':id')
  remove(@Param('id') id: string, @Req() req) {
    return this.cycleService.remove(id, req.user.id);
  }
}
