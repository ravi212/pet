export type OCRStatus = 'pending' | 'done' | 'failed';

export interface Receipt {
  id: string;
  userId: string;
  projectId: string;
  expenseId?: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  ocrStatus: OCRStatus;
  ocrConfidence?: number;
  uploadedAt: Date;
  description?: string;
  extractedData?: Record<string, any>;
}

export interface CreateReceiptDto {
  projectId: string;
  expenseId?: string;
  description?: string;
}

export interface ReceiptUploadResponse {
  id: string;
  fileUrl: string;
  ocrStatus: OCRStatus;
}
