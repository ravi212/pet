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
import { ReceiptService } from './receipt.service';
import { CreateReceiptDto } from './dto/create-receipt.dto';
import { UpdateReceiptDto } from './dto/update-receipt.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('receipts')
@UseGuards(JwtAuthGuard)
export class ReceiptController {
  constructor(private readonly receiptService: ReceiptService) {}

  /**
   * Upload receipt file
   * POST /receipts/upload
   * Requires: file (multipart), projectId, optionally expenseId, description
   */
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

  /**
   * Get all receipts for a project
   * GET /receipts?projectId=xxx&page=1&limit=10&ocrStatus=pending
   */
  @Get()
  async findAll(
    @Request() req: any,
    @Query('projectId') projectId: string,
    @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit: number = 10,
    @Query('ocrStatus') ocrStatus?: string,
  ): Promise<any> {
    return this.receiptService.findAll(
      projectId,
      req.user.id,
      page,
      limit,
      ocrStatus,
    );
  }

  /**
   * Get single receipt by ID
   * GET /receipts/:id
   */
  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @Request() req: any,
  ): Promise<any> {
    return this.receiptService.findOne(id, req.user.id);
  }

  /**
   * Update receipt
   * PATCH /receipts/:id
   */
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateReceiptDto: UpdateReceiptDto,
    @Request() req: any,
  ): Promise<any> {
    return this.receiptService.update(id, updateReceiptDto, req.user.id);
  }

  /**
   * Delete receipt
   * DELETE /receipts/:id
   */
  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req: any) {
    await this.receiptService.remove(id, req.user.id);
    return { message: 'Receipt deleted successfully' };
  }
}
