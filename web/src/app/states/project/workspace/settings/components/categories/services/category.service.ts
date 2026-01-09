import { inject, Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse, Category } from '../../../../../../../shared/models';
import { ApiService } from '../../../../../../../core/services/api.service';
import { endpoints } from '../../../../../../../shared/constants/endpoints.const';

export interface PaginatedCategories {
  data: Category[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface CategoryFilters {
  projectId: string;
  page?: number;
  limit?: number;
  search?: string;
  createdBy?: string;
  orderBy?: 'asc' | 'desc';
}

@Injectable({ providedIn: 'root' })
export class CategoriesService {
  private api = inject(ApiService);

  create(payload: Partial<Category>): Observable<Category> {
    return this.api.post<Category>(endpoints.categories.categories, payload);
  }

  findAll(filters: CategoryFilters): Observable<PaginatedCategories> {
    let params = new HttpParams()
      .set('projectId', filters.projectId)
      .set('page', filters.page ?? 1)
      .set('limit', filters.limit ?? 10);

    if (filters.search) params = params.set('search', filters.search);
    if (filters.createdBy) params = params.set('createdBy', filters.createdBy);
    if (filters.orderBy) params = params.set('orderBy', filters.orderBy);

    return this.api.get<PaginatedCategories>(endpoints.categories.categories, { params });
  }

  findOne(categoryId: string): Observable<ApiResponse<Category>> {
    return this.api.get<ApiResponse<Category>>(endpoints.categories.categoryById(categoryId));
  }

  update(categoryId: string, payload: Partial<Category>): Observable<Partial<Category>> {
    return this.api.patch<Partial<Category>>(
      endpoints.categories.categoryById(categoryId),
      payload
    );
  }

  remove(categoryId: string): Observable<ApiResponse<any>> {
    return this.api.delete<ApiResponse<any>>(endpoints.categories.categoryById(categoryId));
  }
}
