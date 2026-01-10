import { inject, Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { ApiService } from '../../../../../core/services/api.service';
import { ApiResponse, OCRStatus } from '../../../../../shared/models';
import { endpoints } from '../../../../../shared/constants/endpoints.const';

export interface Receipt {
  id: string;
  userId: string;
  projectId: string;
  fileUrl: string;
  fileType: string | null;
  fileSize: string | null;
  originalFileName: string | null;

  ocrStatus: 'pending' | 'done' | 'failed';
  ocrResult: any;
  ocrConfidence: number | null;
  processingError: string | null;

  description?: string | null;
  expenseId?: string | null;

  processedAt: string | null;
  expiresAt: string | null;
  uploadedAt: string;
  createdAt: string;
}

export interface PaginatedReceipts {
  data: Receipt[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ReceiptResponse {
  id: string;
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ReceiptFilters {
  projectId: string;
  page?: number;
  limit?: number;
  ocrStatus?: OCRStatus;
}

@Injectable({ providedIn: 'root' })
export class ReceiptsService {
  private api = inject(ApiService);

  upload(
    file: File,
    payload: {
      projectId: string;
      description?: string;
      expenseId?: string;
    }
  ): Observable<ApiResponse<Receipt>> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('projectId', payload.projectId);

    if (payload.description) {
      formData.append('description', payload.description);
    }

    if (payload.expenseId) {
      formData.append('expenseId', payload.expenseId);
    }

    return this.api.post<ApiResponse<Receipt>>(endpoints.receipts.upload, formData);
  }

  findAll(filters: ReceiptFilters): Observable<PaginatedReceipts> {
    let params = new HttpParams()
      .set('projectId', filters.projectId)
      .set('page', filters.page ?? 1)
      .set('limit', filters.limit ?? 10);

    if (filters.ocrStatus) {
      params = params.set('ocrStatus', filters.ocrStatus);
    }

    return this.api.get<PaginatedReceipts>(endpoints.receipts.receipts, { params });
  }

  findOne(receiptId: string): Observable<ApiResponse<Receipt>> {
    return this.api.get<ApiResponse<Receipt>>(endpoints.receipts.receiptById(receiptId));
  }

  update(
    receiptId: string,
    payload: {
      description?: string;
      expenseId?: string;
      expiresAt?: string;
    }
  ): Observable<ApiResponse<Receipt>> {
    return this.api.patch<ApiResponse<Receipt>>(endpoints.receipts.receiptById(receiptId), payload);
  }

  remove(receiptId: string): Observable<ApiResponse<void>> {
    return this.api.delete<ApiResponse<void>>(endpoints.receipts.receiptById(receiptId));
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
        data: { label: string; value: string, meta: any }[];
        pagination: { total: number };
      }>(endpoints.receipts.receipts, { params: httpParams })
      .pipe(
        map((res) => ({
          data: res.data,
          total: res.pagination.total,
        }))
      );
  }
}
