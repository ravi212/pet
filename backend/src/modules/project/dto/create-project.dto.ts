import { IsString, IsNotEmpty, IsEnum, IsOptional, Length } from 'class-validator';
import { ProjectType } from 'generated/prisma/enums';

export class CreateProjectDto {
  @IsString()
  @IsNotEmpty()
  @Length(3, 50)
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(ProjectType)
  type: ProjectType;

  @IsString()
  @IsOptional()
  @Length(3, 3)
  currency?: string;

  @IsString()
  @IsOptional()
  timezone?: string;
}
