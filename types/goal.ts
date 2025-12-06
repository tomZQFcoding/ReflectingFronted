export interface Goal {
  id: string;
  title: string;
  description?: string;
  targetDate?: string;
  progress: number; // 0-100
  status: 'active' | 'completed' | 'archived';
  createdAt: string;
  updatedAt: string;
}

