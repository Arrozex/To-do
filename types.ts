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
  STATS = 'STATS'
}

export interface AIGeneratedTask {
  content: string;
  estimatedDurationHours: number;
  priority: 'high' | 'medium' | 'low';
}
