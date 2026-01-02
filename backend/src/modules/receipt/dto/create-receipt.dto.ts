import { IsUUID, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateReceiptDto {
  @IsUUID()
  projectId: string;

  @IsOptional()
  @IsUUID()
  expenseId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;
}
