import { Module } from '@nestjs/common';
import { ReceiptService } from './receipt.service';
import { ReceiptController } from './receipt.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { OcrService } from './ocr.service';

@Module({
  imports: [PrismaModule],
  controllers: [ReceiptController],
  providers: [ReceiptService, OcrService],
  exports: [ReceiptService, OcrService],
})
export class ReceiptModule {}
