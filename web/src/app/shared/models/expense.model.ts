export interface Expense {
  id: string;
  projectId: string;
  cycleId: string;
  createdBy: string;
  amount: number;
  currency: string;
  incurredAt: Date;
  categoryId: string;
  taskId?: string;
  description?: string;
  receiptId?: string;
  reimbursedAmount: number;
  reimbursedBy?: string;
  reimbursedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateExpenseDto {
  amount: number;
  currency: string;
  incurredAt: Date;
  categoryId: string;
  taskId?: string;
  description?: string;
  receiptId?: string;
}

export interface UpdateExpenseDto {
  amount?: number;
  categoryId?: string;
  taskId?: string;
  description?: string;
  receiptId?: string;
  incurredAt?: Date;
}

export interface ReimbursementDto {
  expenseId: string;
  amount: number;
}
