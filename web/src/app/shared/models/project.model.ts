
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

export interface Project {
  id: string;
  title: string;
  description?: string;
  type: ProjectType;
  updatedAt: Date;
}

export interface PaginatedProjects {
  data: Project[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

import { ProjectCollaborator } from './project-collaborator.model';
import { ProjectCycle } from './cycle.model';
import { Expense } from './expense.model';import { ProjectType } from '../enums';

