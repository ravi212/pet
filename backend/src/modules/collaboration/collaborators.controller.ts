import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  Req,
  HttpCode,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiBody,
} from '@nestjs/swagger';
import { CollaboratorsService } from './collaborators.service';
import { AddCollaboratorDto } from './dto/add-collaborator.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { ProjectAccessGuard } from '../../guards/project-access.guard';

@ApiTags('Collaborators')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, ProjectAccessGuard)
@Controller('projects/:projectId/collaborators')
export class CollaboratorsController {
  constructor(private readonly collaboratorsService: CollaboratorsService) {}

  @Post()
  @HttpCode(201)
  @ApiOperation({
    summary: 'Add a collaborator to a project',
    description:
      'Only the project owner can add collaborators. The user must already have an account in the system.',
  })
  @ApiBody({
    type: AddCollaboratorDto,
    description: 'Collaborator details',
    examples: {
      example1: {
        value: {
          email: 'john.doe@example.com',
          role: 'editor',
        },
      },
      example2: {
        value: {
          email: 'jane.smith@example.com',
          role: 'viewer',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Collaborator added successfully',
    schema: {
      example: {
        statusCode: 201,
        data: {
          id: '123e4567-e89b-12d3-a456-426614174000',
          userId: 'user-uuid',
          projectId: 'project-uuid',
          role: 'editor',
          createdAt: '2026-02-08T10:30:00Z',
          user: {
            id: 'user-uuid',
            email: 'john.doe@example.com',
            firstName: 'John',
            lastName: 'Doe',
            avatarUrl: null,
          },
        },
        message: 'john.doe@example.com added as editor',
      },
    },
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - only owner can add collaborators',
    schema: {
      example: {
        statusCode: 403,
        message: 'Only project owner can add collaborators',
        error: 'Forbidden',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Project or user not found',
    schema: {
      example: {
        statusCode: 404,
        message: 'User with email "test@example.com" not found',
        error: 'Not Found',
      },
    },
  })
  @ApiResponse({
    status: 409,
    description: 'User already a collaborator or is the owner',
    schema: {
      example: {
        statusCode: 409,
        message: 'User "john@example.com" is already a collaborator on this project',
        error: 'Conflict',
      },
    },
  })
  async addCollaborator(
    @Req() req,
    @Param('projectId') projectId: string,
    @Body() dto: AddCollaboratorDto,
  ) {
    return this.collaboratorsService.addCollaborator(
      req.user.id,
      projectId,
      dto,
    );
  }

  @Get()
  @HttpCode(200)
  @ApiOperation({
    summary: 'List all collaborators for a project',
    description:
      'Get all collaborators including the project owner. Accessible to project owner and collaborators.',
  })
  @ApiResponse({
    status: 200,
    description: 'Collaborators retrieved successfully',
    schema: {
      example: {
        statusCode: 200,
        data: {
          owner: {
            id: 'owner-uuid',
            email: 'owner@example.com',
            firstName: 'Alice',
            lastName: 'Owner',
            avatarUrl: null,
          },
          collaborators: [
            {
              id: 'collab-id-1',
              userId: 'user-uuid-1',
              projectId: 'project-uuid',
              role: 'editor',
              createdAt: '2026-02-08T10:30:00Z',
              user: {
                id: 'user-uuid-1',
                email: 'john.doe@example.com',
                firstName: 'John',
                lastName: 'Doe',
                avatarUrl: null,
              },
            },
            {
              id: 'collab-id-2',
              userId: 'user-uuid-2',
              projectId: 'project-uuid',
              role: 'viewer',
              createdAt: '2026-02-08T10:31:00Z',
              user: {
                id: 'user-uuid-2',
                email: 'jane.smith@example.com',
                firstName: 'Jane',
                lastName: 'Smith',
                avatarUrl: null,
              },
            },
          ],
          total: 2,
        },
      },
    },
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - you do not have access to this project',
  })
  @ApiResponse({
    status: 404,
    description: 'Project not found',
  })
  async getCollaborators(
    @Req() req,
    @Param('projectId') projectId: string,
  ) {
    return this.collaboratorsService.getCollaborators(req.user.id, projectId);
  }

  @Patch(':userId')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Update collaborator role',
    description:
      'Change the role of a collaborator. Only project owner can perform this action.',
  })
  @ApiBody({
    type: UpdateRoleDto,
    description: 'New role for the collaborator',
    examples: {
      example1: {
        value: {
          role: 'editor',
        },
      },
      example2: {
        value: {
          role: 'commenter',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Collaborator role updated successfully',
    schema: {
      example: {
        statusCode: 200,
        data: {
          id: 'collab-id',
          userId: 'user-uuid',
          projectId: 'project-uuid',
          role: 'commenter',
          createdAt: '2026-02-08T10:30:00Z',
          user: {
            id: 'user-uuid',
            email: 'john.doe@example.com',
            firstName: 'John',
            lastName: 'Doe',
            avatarUrl: null,
          },
        },
        message: 'john.doe@example.com\'s role updated to commenter',
      },
    },
  })
  @ApiResponse({
    status: 403,
    description:
      'Forbidden - only owner can update roles or cannot change owner role',
    schema: {
      example: {
        statusCode: 403,
        message: 'Only project owner can change collaborator roles',
        error: 'Forbidden',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Project or collaborator not found',
  })
  async updateCollaboratorRole(
    @Req() req,
    @Param('projectId') projectId: string,
    @Param('userId') userId: string,
    @Body() dto: UpdateRoleDto,
  ) {
    return this.collaboratorsService.updateCollaboratorRole(
      req.user.id,
      projectId,
      userId,
      dto,
    );
  }

  @Delete(':userId')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Remove a collaborator from a project',
    description:
      'Remove a user from the project. Only project owner can perform this action. The owner cannot be removed.',
  })
  @ApiResponse({
    status: 200,
    description: 'Collaborator removed successfully',
    schema: {
      example: {
        statusCode: 200,
        message: 'john.doe@example.com removed from project',
      },
    },
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - only owner can remove collaborators',
    schema: {
      example: {
        statusCode: 403,
        message: 'Only project owner can remove collaborators',
        error: 'Forbidden',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Project or collaborator not found',
  })
  async removeCollaborator(
    @Req() req,
    @Param('projectId') projectId: string,
    @Param('userId') userId: string,
  ) {
    return this.collaboratorsService.removeCollaborator(
      req.user.id,
      projectId,
      userId,
    );
  }
}
