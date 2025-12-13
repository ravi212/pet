import { IsEmail, IsString, MinLength, IsOptional, IsBoolean } from 'class-validator';

export class SignUpDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  password: string;

  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsString()
  @IsOptional()
  timezone?: string = 'Asia/Kolkata';

  @IsString()
  @IsOptional()
  locale?: string = 'en-IN';

  @IsString()
  @IsOptional()
  avatarUrl?: string;

  @IsBoolean()
  @IsOptional()
  aiOptIn?: boolean = false;
}
