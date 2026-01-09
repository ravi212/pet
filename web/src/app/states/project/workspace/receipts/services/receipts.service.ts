import { inject, Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiService } from '../../../../../core/services/api.service';
import { ApiResponse } from '../../../../../shared/models';
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
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ReceiptFilters {
  projectId: string;
  page?: number;
  limit?: number;
  ocrStatus?: 'pending' | 'done' | 'failed';
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
      expiresAt?: string;
    }
  ): Observable<ApiResponse<Receipt>> {
    return this.api.patch<ApiResponse<Receipt>>(endpoints.receipts.receiptById(receiptId), payload);
  }

  remove(receiptId: string): Observable<ApiResponse<void>> {
    return this.api.delete<ApiResponse<void>>(endpoints.receipts.receiptById(receiptId));
  }
}
