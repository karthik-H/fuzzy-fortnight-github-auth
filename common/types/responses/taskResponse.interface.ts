import type { TaskStatus } from '../../constants/appConstants';

export interface ITaskGet {
  id: number;
  title: string;
  description: string | null;
  status: TaskStatus;
  userId: number;
  createdAt: string;
}
