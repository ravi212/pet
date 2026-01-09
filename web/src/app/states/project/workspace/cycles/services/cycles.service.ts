import { inject, Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiService } from '../../../../../core/services/api.service';
import { endpoints } from '../../../../../shared/constants/endpoints.const';
import { ApiResponse } from '../../../../../shared/models';
import { Expense } from '../../expenses/services/expense.service';
import { RolloverMode } from '../../../../../shared/enums';

/* =======================
   Models / Interfaces
======================= */

export interface Cycle {
  id: string;
  projectId: string;
  cycleStart: string;
  cycleEnd: string;
  budgetAmount: string;
  rolloverMode?: RolloverMode;
  isLocked: boolean;
  createdAt: string;
  updatedAt: string;
  expenses?: Expense[];
  project?: {
    id: string;
    name: string;
  };
}

export interface PaginatedCycles {
  data: Cycle[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface CycleFilters {
  projectId: string;
  page?: number;
  limit?: number;
  orderBy?: 'asc' | 'desc';
  search?: string;
}


/* =======================
   Service
======================= */

@Injectable({ providedIn: 'root' })
export class CyclesService {
  private api = inject(ApiService);

  create(cycle: Partial<Cycle>): Observable<ApiResponse<Cycle>> {
    return this.api.post<ApiResponse<Cycle>>(
      endpoints.cycles.cycles,
      cycle
    );
  }

  findAll(filters: CycleFilters): Observable<PaginatedCycles> {
    let params = new HttpParams()
      .set('projectId', filters.projectId)
      .set('page', filters.page ?? 1)
      .set('limit', filters.limit ?? 10);

    if (filters.orderBy) params = params.set('orderBy', filters.orderBy);

    return this.api.get<PaginatedCycles>(
      endpoints.cycles.cycles,
      { params }
    );
  }

  findOne(cycleId: string): Observable<ApiResponse<Cycle>> {
    return this.api.get<ApiResponse<Cycle>>(
      endpoints.cycles.cycleById(cycleId)
    );
  }

  update(cycleId: string, payload: Partial<Cycle>): Observable<ApiResponse<Partial<Cycle>>> {
    return this.api.patch<ApiResponse<Partial<Cycle>>>(
      endpoints.cycles.cycleById(cycleId),
      payload
    );
  }

  toggleLock(cycleId: string): Observable<ApiResponse<Cycle>> {
    return this.api.patch<ApiResponse<Cycle>>(
      endpoints.cycles.toggleLock(cycleId),
      {}
    );
  }

  remove(cycleId: string): Observable<ApiResponse<Partial<Cycle>>> {
    return this.api.delete<ApiResponse<Partial<Cycle>>>(
      endpoints.cycles.cycleById(cycleId)
    );
  }
}
