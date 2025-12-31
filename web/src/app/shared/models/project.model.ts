export type ProjectType = 'one_time' | 'recurring';

export interface Project {
  id: string;
  ownerId: string;
  title: string;
  description?: string;
  type: ProjectType;
  currency: string;
  timezone?: string;
  isArchived: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateProjectDto {
  title: string;
  description?: string;
  type: ProjectType;
  currency: string;
  timezone?: string;
}

export interface UpdateProjectDto {
  title?: string;
  description?: string;
  type?: ProjectType;
  currency?: string;
  timezone?: string;
  isArchived?: boolean;
}

export interface ProjectWithCollaborators extends Project {
  collaborators?: ProjectCollaborator[];
  cycles?: ProjectCycle[];
  expenses?: Expense[];
}

import { ProjectCollaborator } from './project-collaborator.model';
import { ProjectCycle } from './cycle.model';
import { Expense } from './expense.model';
