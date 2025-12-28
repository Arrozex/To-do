export interface Task {
  id: string;
  content: string;
  deadline: string; // ISO Date String
  executionStart: string; // ISO Date String
  executionEnd: string; // ISO Date String
  isCompleted: boolean;
  createdAt: number;
}

export enum ViewMode {
  LIST = 'LIST',
  CALENDAR = 'CALENDAR',
  STATS = 'STATS',
  EXPENSES = 'EXPENSES'
}

export interface AIGeneratedTask {
  content: string;
  estimatedDurationHours: number;
  priority: 'high' | 'medium' | 'low';
}

export type ExpenseCategory = 'FOOD' | 'ESSENTIAL' | 'ENTERTAINMENT' | 'SUPPLIES';

export interface Expense {
  id: string;
  amount: number;
  category: ExpenseCategory;
  date: string; // ISO Date String
  note: string;
}
