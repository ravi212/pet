import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { CollaboratorRole } from 'generated/prisma/client';

export class UpdateRoleDto {
  @ApiProperty({
    type: String,
    enum: ['editor', 'commenter', 'viewer'],
    example: 'commenter',
    description: 'New role to assign to the collaborator',
  })
  @IsEnum(['editor', 'commenter', 'viewer'], {
    message: 'Role must be one of: editor, commenter, viewer',
  })
  role: CollaboratorRole;
}
