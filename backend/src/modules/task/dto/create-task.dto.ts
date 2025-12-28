import { IsUUID, IsNotEmpty, IsString, IsOptional, IsEnum, IsNumberString} from "class-validator";
import { TaskStatus } from "generated/prisma/enums";

export class CreateTaskDto {
  @IsUUID()
  projectId!: string;

  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsUUID()
  assignedTo?: string;

  @IsOptional()
  @IsNumberString()
  budgetAmount?: string;

  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus = TaskStatus.todo;
}