import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsISO8601,
  IsNumberString,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  IsNumber,
} from 'class-validator';

export class CreateExpenseDto {
  @IsUUID()
  projectId!: string;

  @IsOptional()
  @IsUUID()
  cycleId?: string;

  @IsNumberString()
  amount!: string;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsISO8601()
  @Type(() => Date)
  incurredAt!: Date;

  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @IsOptional()
  @IsUUID()
  taskId?: string;

  @IsOptional()
  @IsString()
  vendor?: string;

  @IsOptional()
  @IsString()
  note?: string;

  @IsOptional()
  @IsUUID()
  receiptId?: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;

  @IsOptional()
  @IsString()
  modelSuggestedCategory?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  suggestionConfidence?: number;

  @IsOptional()
  @IsBoolean()
  isReimbursable?: boolean;

  @IsOptional()
  @IsNumberString()
  reimbursedAmount?: string;
}