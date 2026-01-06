import { inject, Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiService } from '../../../../core/services/api.service';
import { endpoints } from '../../../../shared/constants/endpoints.const';

export interface Project {
  id: string;
  title: string;
  description?: string;
  type: 'one_time' | 'recurring';
  updatedAt: string;
}

export interface PaginatedProjects {
  data: Project[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

@Injectable({ providedIn: 'root' })
export class ProjectsService {
  private api = inject(ApiService);

  findAll(page = 1, limit = 10, search?: string): Observable<PaginatedProjects> {
    let params = new HttpParams().set('page', page).set('limit', limit);
    if (search) params = params.set('search', search);
    return this.api.get<PaginatedProjects>(endpoints.projects.projects, { params });
  }

  create(project: Partial<Project>) {
    return this.api.post<Project>(endpoints.projects.projects, project);
  }

  update(projectId: string, project: Partial<Project>) {
    return this.api.patch<Project>(`${endpoints.projects.projectById(projectId)}`, project);
  }

  remove(projectId: string) {
    return this.api.delete(`${endpoints.projects.projectById(projectId)}`);
  }

  findOne(projectId: string) {
    return this.api.get<Project>(`${endpoints.projects.projectById(projectId)}`);
  }
}
