export type CollaboratorRole = 'owner' | 'editor' | 'commenter' | 'viewer';

export interface ProjectCollaborator {
  id: string;
  projectId: string;
  userId: string;
  role: CollaboratorRole;
  joinedAt: Date;
}

export interface AddCollaboratorDto {
  userId: string;
  role: CollaboratorRole;
}

export interface UpdateCollaboratorRoleDto {
  role: CollaboratorRole;
}
