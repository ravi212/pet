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
  UseInterceptors,
  UploadedFile,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery, ApiBody } from '@nestjs/swagger';
import { ReceiptService } from './receipt.service';
import { CreateReceiptDto } from './dto/create-receipt.dto';
import { UpdateReceiptDto } from './dto/update-receipt.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { REQUEST_MODE } from 'src/enums/common.enum';

@ApiTags('Receipts')
@ApiBearerAuth()
@Controller('receipts')
@UseGuards(JwtAuthGuard)
export class ReceiptController {
  constructor(private readonly receiptService: ReceiptService) {}

  @ApiOperation({ 
    summary: 'Upload receipt file with OCR processing',
    description: 'curl -X POST http://localhost:3000/receipts/upload -H "Authorization: Bearer {jwt-token}" -F "file=@/path/to/receipt.jpg" -F "projectId=project-uuid" -F "description=Office supplies receipt"'
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Receipt uploaded and OCR processing initiated',
    schema: {
      example: {
        id: 'receipt-uuid',
        projectId: 'project-uuid',
        fileUrl: '/uploads/receipts/user-uuid/1704000600000-abc123.jpg',
        ocrStatus: 'pending',
        uploadedAt: '2024-12-30T10:30:00Z'
      }
    }
  })
  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async upload(
    @UploadedFile() file: any,
    @Body() createReceiptDto: CreateReceiptDto,
    @Request() req: any,
  ): Promise<any> {
    return this.receiptService.upload(
      file,
      createReceiptDto,
      req.user.id,
    );
  }

  @ApiOperation({ 
    summary: 'List all receipts with filtering and pagination',
    description: 'curl -X GET "http://localhost:3000/receipts?projectId=project-uuid&page=1&limit=10&ocrStatus=done" -H "Authorization: Bearer {jwt-token}"'
  })
  @ApiQuery({ name: 'projectId', description: 'Filter by project ID' })
  @ApiQuery({ name: 'page', description: 'Page number', example: 1, required: false })
  @ApiQuery({ name: 'limit', description: 'Items per page', example: 10, required: false })
  @ApiQuery({ name: 'ocrStatus', description: 'Filter by OCR status (pending/done/failed)', required: false })
  @ApiResponse({ 
    status: 200, 
    description: 'Receipts retrieved successfully',
    schema: {
      example: {
        data: [{
          id: 'receipt-uuid',
          ocrStatus: 'done',
          ocrConfidence: 0.95,
          uploadedAt: '2024-12-30T10:30:00Z'
        }],
        page: 1,
        limit: 10,
        total: 5
      }
    }
  })
  @Get()
  async findAll(
    @Request() req: any,
    @Query('projectId') projectId: string,
    @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit: number = 10,
    @Query('ocrStatus') ocrStatus?: string,
    @Query('mode') mode?: REQUEST_MODE,
  ): Promise<any> {
    return this.receiptService.findAll(
      projectId,
      req.user.id,
      page,
      limit,
      ocrStatus,
      mode,
    );
  }

  @ApiOperation({ 
    summary: 'Get single receipt by ID with OCR data',
    description: 'curl -X GET http://localhost:3000/receipts/receipt-uuid -H "Authorization: Bearer {jwt-token}"'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Receipt retrieved successfully',
    schema: {
      example: {
        id: 'receipt-uuid',
        ocrStatus: 'done',
        ocrResult: [
          { description: 'Full text detected', confidence: 0.95 },
          { description: 'Individual word', confidence: 0.93 }
        ],
        ocrConfidence: 0.95
      }
    }
  })
  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @Request() req: any,
  ): Promise<any> {
    return this.receiptService.findOne(id, req.user.id);
  }

  @ApiOperation({ 
    summary: 'Update receipt details',
    description: 'curl -X PATCH http://localhost:3000/receipts/receipt-uuid -H "Authorization: Bearer {jwt-token}" -H "Content-Type: application/json" -d \'{"description":"Updated description"}\''
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        description: { type: 'string', example: 'Updated description' },
        expiresAt: { type: 'string', example: '2025-12-30T23:59:59Z' }
      }
    }
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Receipt updated successfully',
    schema: { example: { message: 'Receipt updated successfully' } }
  })
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateReceiptDto: UpdateReceiptDto,
    @Request() req: any,
  ): Promise<any> {
    return this.receiptService.update(id, updateReceiptDto, req.user.id);
  }

  @ApiOperation({ 
    summary: 'Delete a receipt',
    description: 'curl -X DELETE http://localhost:3000/receipts/receipt-uuid -H "Authorization: Bearer {jwt-token}"'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Receipt deleted successfully',
    schema: { example: { message: 'Receipt deleted successfully' } }
  })
  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req: any) {
    await this.receiptService.remove(id, req.user.id);
    return { message: 'Receipt deleted successfully' };
  }
}
