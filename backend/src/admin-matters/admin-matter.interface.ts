export interface AdminMatter {
  id: string;
  dimensionId: string;
  title: string;
  organism: string;
  status: 'pending' | 'in_progress' | 'completed' | 'blocked';
  deadline?: string;
  notes?: string;
  createdAt: string;
}
