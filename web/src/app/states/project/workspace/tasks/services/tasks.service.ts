import { inject, Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { ApiService } from '../../../../../core/services/api.service';
import { endpoints } from '../../../../../shared/constants/endpoints.const';
import { ApiResponse } from '../../../../../shared/models';

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description?: string;
  assignedTo?: string;
  status: 'todo' | 'in-progress' | 'done';
  budgetAmount?: string;
  createdAt: string;
  updatedAt: string;
  assignee?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
  project?: {
    id: string;
    name: string;
  };
}

export interface PaginatedTasks {
  data: Task[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface TaskFilters {
  projectId: string;
  page?: number;
  limit?: number;
  search?: string;
  status?: 'todo' | 'in-progress' | 'done';
  assignedTo?: string;
  orderBy?: 'asc' | 'desc';
}

@Injectable({ providedIn: 'root' })
export class TasksService {
  private api = inject(ApiService);

  create(task: Partial<Task>): Observable<ApiResponse<Task>> {
    return this.api.post<ApiResponse<Task>>(endpoints.tasks.tasks, task);
  }

  findAll(filters: TaskFilters): Observable<PaginatedTasks> {
    let params = new HttpParams()
      .set('projectId', filters.projectId)
      .set('page', filters.page ?? 1)
      .set('limit', filters.limit ?? 10);

    if (filters.search) params = params.set('search', filters.search);
    if (filters.status) params = params.set('status', filters.status);
    if (filters.assignedTo) params = params.set('assignedTo', filters.assignedTo);
    if (filters.orderBy) params = params.set('orderBy', filters.orderBy);

    return this.api.get<PaginatedTasks>(endpoints.tasks.tasks, { params });
  }

  findOne(taskId: string): Observable<ApiResponse<Task>> {
    return this.api.get<ApiResponse<Task>>(endpoints.tasks.taskById(taskId));
  }

  update(taskId: string, payload: Partial<Task>): Observable<ApiResponse<Partial<Task>>> {
    return this.api.patch<ApiResponse<Partial<Task>>>(endpoints.tasks.taskById(taskId), payload);
  }

  remove(taskId: string): Observable<ApiResponse<Partial<Task>>> {
    return this.api.delete<ApiResponse<Partial<Task>>>(endpoints.tasks.taskById(taskId));
  }

  getDropdown(params: { projectId: string; page: number; limit: number; search?: string }) {
    let httpParams = new HttpParams()
      .set('projectId', params.projectId)
      .set('page', params.page)
      .set('limit', params.limit)
      .set('mode', 'select');

    if (params.search) {
      httpParams = httpParams.set('search', params.search);
    }

    return this.api
      .get<{
        data: { label: string; value: string }[];
        pagination: { total: number };
      }>(endpoints.tasks.tasks, { params: httpParams })
      .pipe(
        map((res) => ({
          data: res.data,
          total: res.pagination.total,
        }))
      );
  }
}
