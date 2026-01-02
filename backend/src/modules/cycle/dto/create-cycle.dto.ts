import {
  IsUUID,
  IsDateString,
  IsNumberString,
  IsOptional,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';
import { RolloverMode } from 'generated/prisma/enums';

export class CreateCycleDto {
  @IsUUID()
  projectId!: string;

  @IsDateString()
  @Type(() => Date)
  cycleStart!: Date;

  @IsDateString()
  @Type(() => Date)
  cycleEnd!: Date;

  @IsOptional()
  @IsNumberString()
  budgetAmount?: string;

  @IsOptional()
  @IsEnum(RolloverMode)
  rolloverMode?: RolloverMode;
}
