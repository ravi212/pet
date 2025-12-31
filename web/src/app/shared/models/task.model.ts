export type TaskStatus = 'todo' | 'in_progress' | 'done';

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description?: string;
  assignedTo?: string;
  budgetAmount: number;
  status: TaskStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateTaskDto {
  title: string;
  description?: string;
  assignedTo?: string;
  budgetAmount: number;
  status?: TaskStatus;
}

export interface UpdateTaskDto {
  title?: string;
  description?: string;
  assignedTo?: string;
  budgetAmount?: number;
  status?: TaskStatus;
}

export interface TaskWithExpenses extends Task {
  expenses?: Expense[];
  totalSpent?: number;
  remainingBudget?: number;
}

import { Expense } from './expense.model';
