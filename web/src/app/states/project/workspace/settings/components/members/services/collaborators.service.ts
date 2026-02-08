import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { endpoints } from '../../../../../../../shared/constants/endpoints.const';
import { ApiService } from '../../../../../../../core/services/api.service';

export interface AddCollaboratorRequest {
  email: string;
  role?: 'editor' | 'commenter' | 'viewer';
}

export interface UpdateRoleRequest {
  role: 'editor' | 'commenter' | 'viewer';
}

export interface Collaborator {
  id: string;
  userId: string;
  projectId: string;
  role: 'editor' | 'commenter' | 'viewer';
  createdAt: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    avatarUrl?: string;
  };
}

export interface GetCollaboratorsResponse {
  statusCode: number;
  data: {
    owner: {
      id: string;
      email: string;
      firstName: string;
      lastName: string;
      avatarUrl?: string;
    };
    collaborators: Collaborator[];
    total: number;
  };
}

@Injectable({
  providedIn: 'root',
})
export class CollaboratorsService {
  private apiService = inject(ApiService);
  addCollaborator(projectId: string, request: AddCollaboratorRequest): Observable<any> {
    return this.apiService.post(
      `${endpoints.Collaboration.collaborators(projectId)}`,
      request
    );
  }

  getCollaborators(projectId: string): Observable<GetCollaboratorsResponse> {
    return this.apiService.get<GetCollaboratorsResponse>(
      `${endpoints.Collaboration.collaborators(projectId)}`
    );
  }

  updateCollaboratorRole(
    projectId: string,
    userId: string,
    request: UpdateRoleRequest
  ): Observable<any> {
    return this.apiService.patch(
      `${endpoints.Collaboration.collaboratorById(projectId, userId)}`,
      request
    );
  }

  removeCollaborator(projectId: string, userId: string): Observable<any> {
    return this.apiService.delete(
      `${endpoints.Collaboration.collaboratorById(projectId, userId)}`
    );
  }
}
