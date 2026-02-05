export type Priority = 'low' | 'medium' | 'high' | 'critical';
export type Column = 'backlog' | 'in-progress' | 'review' | 'done';

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  dueDate: string | null;
  column: Column;
  subtasks: Subtask[];
  createdAt: string;
  updatedAt: string;
  tags: string[];
}

export interface KanbanData {
  tasks: Task[];
  columns: {
    [key in Column]: {
      id: Column;
      title: string;
      taskIds: string[];
    };
  };
}
