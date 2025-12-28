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
import { ExpenseService } from './expense.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('expenses')
export class ExpenseController {
  constructor(private readonly expenseService: ExpenseService) {}

  @Post()
  create(@Body() createExpenseDto: CreateExpenseDto,  @Req() req,) {
    return this.expenseService.create(createExpenseDto, req.user.id);
  }

  @Get()
  findAll(
    @Req() req,
    @Query('projectId') projectId: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Query('search') search?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('categoryId') categoryId?: string,
    @Query('taskId') taskId?: string,
    @Query('minAmount') minAmount?: string,
    @Query('maxAmount') maxAmount?: string,
    @Query('isReimbursable') isReimbursable?: string,
    @Query('createdBy') createdBy?: string,
    @Query('orderBy') orderBy?: 'asc' | 'desc',
  ) {
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 10));

    const filters = {
      search,
      ...(startDate && { startDate: new Date(startDate) }),
      ...(endDate && { endDate: new Date(endDate) }),
      categoryId,
      taskId,
      minAmount,
      maxAmount,
      ...(isReimbursable && { isReimbursable: isReimbursable === 'true' }),
      createdBy,
    };

    const pagination = {
      page: pageNum,
      limit: limitNum,
      orderBy,
    };

    return this.expenseService.findAll(projectId, req.user.id, filters, pagination);
  }

  @Get(':id')
  findOne(@Param('id') id: string,  @Req() req) {
    return this.expenseService.findOne(id, req.user.id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateExpenseDto: UpdateExpenseDto,
     @Req() req,
  ) {
    return this.expenseService.update(id, updateExpenseDto, req.user.id);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req,) {
    return this.expenseService.remove(id, req.user.id);
  }
}
