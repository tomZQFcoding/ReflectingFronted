import { get, post, del } from './apiClient';

/**
 * 目标任务视图对象
 */
export interface GoalTaskVO {
  id: number;
  goalId: number;
  taskDate: string;
  content: string;
  status: 'pending' | 'completed';
  completedTime?: string;
  createTime?: string;
  updateTime?: string;
}

/**
 * 添加目标任务请求
 */
export interface GoalTaskAddRequest {
  goalId: number;
  taskDate: string; // yyyy-MM-dd
  content: string;
}

/**
 * 更新目标任务请求
 */
export interface GoalTaskUpdateRequest {
  id: number;
  content?: string;
  status?: 'pending' | 'completed';
}

/**
 * 目标任务API
 */
export const goalTaskApi = {
  /**
   * 获取目标的所有任务
   */
  async getTasksByGoalId(goalId: number): Promise<GoalTaskVO[]> {
    return await get<GoalTaskVO[]>('/goal/task/list', { goalId });
  },

  /**
   * 获取指定日期的任务
   */
  async getTasksByDate(goalId: number, taskDate: string): Promise<GoalTaskVO[]> {
    return await get<GoalTaskVO[]>('/goal/task/listByDate', { goalId, taskDate });
  },

  /**
   * 添加任务
   */
  async addTask(request: GoalTaskAddRequest): Promise<number> {
    return await post<number>('/goal/task/add', request);
  },

  /**
   * 更新任务
   */
  async updateTask(request: GoalTaskUpdateRequest): Promise<boolean> {
    return await post<boolean>('/goal/task/update', request);
  },

  /**
   * 删除任务
   */
  async deleteTask(id: number): Promise<boolean> {
    return await del<boolean>('/goal/task/delete', { id });
  },
};

