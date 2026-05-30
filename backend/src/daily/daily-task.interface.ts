export interface DailyTask {
  id: string;
  dimensionId: string;
  title: string;
  description?: string;
  done: boolean;
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;
  createdAt: string;
}
