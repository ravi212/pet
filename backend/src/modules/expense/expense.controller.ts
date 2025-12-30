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
import { ExpenseService } from './expense.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Expenses')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('expenses')
export class ExpenseController {
  constructor(private readonly expenseService: ExpenseService) {}

  @ApiOperation({ 
    summary: 'Create a new expense',
    description: 'curl -X POST http://localhost:3000/expenses -H "Authorization: Bearer {jwt-token}" -H "Content-Type: application/json" -d \'{"projectId":"project-uuid","amount":"5000","currency":"INR","categoryId":"category-uuid","vendor":"Restaurant ABC","note":"Team lunch","isReimbursable":true}\''
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        projectId: { type: 'string', example: 'project-uuid' },
        amount: { type: 'string', example: '5000' },
        currency: { type: 'string', example: 'INR' },
        categoryId: { type: 'string', example: 'category-uuid' },
        vendor: { type: 'string', example: 'Restaurant ABC' },
        note: { type: 'string', example: 'Team lunch' },
        isReimbursable: { type: 'boolean', example: true }
      }
    }
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Expense created successfully',
    schema: {
      example: {
        id: 'expense-uuid',
        projectId: 'project-uuid',
        amount: '5000',
        vendor: 'Restaurant ABC',
        isReimbursable: true,
        createdAt: '2024-12-30T10:30:00Z'
      }
    }
  })
  @Post()
  create(@Body() createExpenseDto: CreateExpenseDto,  @Req() req,) {
    return this.expenseService.create(createExpenseDto, req.user.id);
  }

  @ApiOperation({ 
    summary: 'List all expenses with filtering and pagination',
    description: 'curl -X GET "http://localhost:3000/expenses?projectId=project-uuid&page=1&limit=10&search=lunch&startDate=2024-12-01&endDate=2024-12-31&minAmount=1000&maxAmount=10000&isReimbursable=true" -H "Authorization: Bearer {jwt-token}"'
  })
  @ApiQuery({ name: 'projectId', description: 'Filter by project ID' })
  @ApiQuery({ name: 'page', description: 'Page number', example: 1, required: false })
  @ApiQuery({ name: 'limit', description: 'Items per page', example: 10, required: false })
  @ApiQuery({ name: 'search', description: 'Search by vendor/note', required: false })
  @ApiQuery({ name: 'startDate', description: 'Filter from date (ISO 8601)', required: false })
  @ApiQuery({ name: 'endDate', description: 'Filter to date (ISO 8601)', required: false })
  @ApiQuery({ name: 'categoryId', description: 'Filter by category', required: false })
  @ApiQuery({ name: 'minAmount', description: 'Minimum amount', required: false })
  @ApiQuery({ name: 'maxAmount', description: 'Maximum amount', required: false })
  @ApiQuery({ name: 'isReimbursable', description: 'Filter by reimbursable status', required: false })
  @ApiResponse({ 
    status: 200, 
    description: 'Expenses retrieved successfully',
    schema: {
      example: {
        data: [{ id: 'expense-uuid', vendor: 'Restaurant ABC', amount: '5000' }],
        page: 1,
        limit: 10,
        total: 25
      }
    }
  })
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

  @ApiOperation({ 
    summary: 'Get single expense by ID',
    description: 'curl -X GET http://localhost:3000/expenses/expense-uuid -H "Authorization: Bearer {jwt-token}"'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Expense retrieved successfully',
    schema: {
      example: {
        id: 'expense-uuid',
        projectId: 'project-uuid',
        amount: '5000',
        vendor: 'Restaurant ABC',
        note: 'Team lunch',
        isReimbursable: true
      }
    }
  })
  @Get(':id')
  findOne(@Param('id') id: string,  @Req() req) {
    return this.expenseService.findOne(id, req.user.id);
  }

  @ApiOperation({ 
    summary: 'Update expense details',
    description: 'curl -X PATCH http://localhost:3000/expenses/expense-uuid -H "Authorization: Bearer {jwt-token}" -H "Content-Type: application/json" -d \'{"amount":"5500","note":"Updated note","isReimbursable":false}\''
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        amount: { type: 'string', example: '5500' },
        note: { type: 'string', example: 'Updated note' },
        isReimbursable: { type: 'boolean', example: false },
        reimbursedAmount: { type: 'string', example: '2500' }
      }
    }
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Expense updated successfully',
    schema: { example: { message: 'Expense updated successfully' } }
  })
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateExpenseDto: UpdateExpenseDto,
     @Req() req,
  ) {
    return this.expenseService.update(id, updateExpenseDto, req.user.id);
  }

  @ApiOperation({ 
    summary: 'Delete an expense',
    description: 'curl -X DELETE http://localhost:3000/expenses/expense-uuid -H "Authorization: Bearer {jwt-token}"'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Expense deleted successfully',
    schema: { example: { message: 'Expense deleted successfully' } }
  })
  @Delete(':id')
  remove(@Param('id') id: string, @Req() req,) {
    return this.expenseService.remove(id, req.user.id);
  }
}
