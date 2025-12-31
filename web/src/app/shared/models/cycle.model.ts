export type RolloverMode = 'none' | 'rollover_positive' | 'rollover_negative';

export interface ProjectCycle {
  id: string;
  projectId: string;
  cycleStart: Date;
  cycleEnd: Date;
  budgetAmount: number;
  rolloverMode: RolloverMode;
  isLocked: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCycleDto {
  cycleStart: Date;
  cycleEnd: Date;
  budgetAmount: number;
  rolloverMode: RolloverMode;
}

export interface UpdateCycleDto {
  cycleStart?: Date;
  cycleEnd?: Date;
  budgetAmount?: number;
  rolloverMode?: RolloverMode;
  isLocked?: boolean;
}

export interface CycleWithExpenses extends ProjectCycle {
  expenses?: Expense[];
  totalSpent?: number;
  remainingBudget?: number;
}

import { Expense } from './expense.model';
