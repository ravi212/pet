import { IsEmail, IsEnum, IsOptional, ValidateIf } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { CollaboratorRole } from 'generated/prisma/client';

export class AddCollaboratorDto {
  @ApiProperty({
    type: String,
    example: 'collaborator@example.com',
    description: 'Email of the user to add as collaborator',
  })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email: string;

  @ApiProperty({
    type: String,
    enum: ['editor', 'commenter', 'viewer'],
    example: 'editor',
    description: 'Role to assign to collaborator. Defaults to viewer if not specified.',
    required: false,
  })
  @IsEnum(['editor', 'commenter', 'viewer'], {
    message: 'Role must be one of: editor, commenter, viewer',
  })
  @ValidateIf((dto) => dto.role !== undefined)
  @IsOptional()
  role?: CollaboratorRole;
}
