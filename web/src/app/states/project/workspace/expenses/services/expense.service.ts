import { inject, Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiService } from '../../../../../core/services/api.service';
import { endpoints } from '../../../../../shared/constants/endpoints.const';
import { ApiResponse, Category, ProjectCycle, Task } from '../../../../../shared/models';
import { Receipt } from '../../receipts/services/receipts.service';

/* =======================
   Models / Interfaces
======================= */

export interface Expense {
  id: string;
  projectId: string;
  categoryId?: string;
  category?: Category;
  taskId?: string;
  task?: Task;
  cycle?: ProjectCycle;
  amount: string;
  currency: string;
  vendor?: string;
  note?: string;
  isReimbursable: boolean;
  reimbursedAmount?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  incurredAt: string;
  cycleId?: string;
  receiptId?: string;
  receipt?: Receipt;
}

export interface PaginatedExpenses {
  data: Expense[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ExpenseFilters {
  projectId: string;
  page?: number;
  limit?: number;
  search?: string;
  startDate?: string;
  endDate?: string;
  categoryId?: string;
  taskId?: string;
  minAmount?: string;
  maxAmount?: string;
  isReimbursable?: boolean;
  createdBy?: string;
  orderBy?: 'asc' | 'desc';
}

/* =======================
   Service
======================= */

@Injectable({ providedIn: 'root' })
export class ExpensesService {
  private api = inject(ApiService);

  create(expense: Partial<Expense>): Observable<ApiResponse<Expense>> {
    return this.api.post<ApiResponse<Expense>>(
      endpoints.expenses.expenses,
      expense
    );
  }

  findAll(filters: ExpenseFilters): Observable<PaginatedExpenses> {
    let params = new HttpParams()
      .set('projectId', filters.projectId)
      .set('page', filters.page ?? 1)
      .set('limit', filters.limit ?? 10);

    if (filters.search) params = params.set('search', filters.search);
    if (filters.startDate) params = params.set('startDate', filters.startDate);
    if (filters.endDate) params = params.set('endDate', filters.endDate);
    if (filters.categoryId) params = params.set('categoryId', filters.categoryId);
    if (filters.taskId) params = params.set('taskId', filters.taskId);
    if (filters.minAmount) params = params.set('minAmount', filters.minAmount);
    if (filters.maxAmount) params = params.set('maxAmount', filters.maxAmount);
    if (filters.isReimbursable !== undefined) {
      params = params.set('isReimbursable', filters.isReimbursable);
    }
    if (filters.createdBy) params = params.set('createdBy', filters.createdBy);
    if (filters.orderBy) params = params.set('orderBy', filters.orderBy);

    return this.api.get<PaginatedExpenses>(
      endpoints.expenses.expenses,
      { params }
    );
  }

  findOne(expenseId: string): Observable<ApiResponse<Expense>> {
    return this.api.get<ApiResponse<Expense>>(
      endpoints.expenses.expenseById(expenseId)
    );
  }

  update(expenseId: string, payload: Partial<Expense>): Observable<ApiResponse<Partial<Expense>>> {
    return this.api.patch<ApiResponse<Partial<Expense>>>(
      endpoints.expenses.expenseById(expenseId),
      payload
    );
  }

  remove(expenseId: string): Observable<ApiResponse<Partial<Expense>>> {
    return this.api.delete<ApiResponse<Partial<Expense>>>(
      endpoints.expenses.expenseById(expenseId)
    );
  }
}
