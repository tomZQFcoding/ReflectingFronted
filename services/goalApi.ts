import { get, post, del } from './apiClient';

/**
 * 目标视图对象
 */
export interface GoalVO {
  id: number;
  title: string;
  description?: string;
  targetDate?: string;
  progress: number;
  status: 'active' | 'completed' | 'archived';
  createTime?: string;
  updateTime?: string;
}

/**
 * 添加目标请求
 */
export interface GoalAddRequest {
  title: string;
  description?: string;
  targetDate?: string;
  progress?: number;
  status?: 'active' | 'completed' | 'archived';
}

/**
 * 更新目标请求
 */
export interface GoalUpdateRequest {
  id: number;
  title?: string;
  description?: string;
  targetDate?: string;
  progress?: number;
  status?: 'active' | 'completed' | 'archived';
}

/**
 * 目标API
 */
export const goalApi = {
  /**
   * 获取当前用户的所有目标
   */
  async getMyGoals(): Promise<GoalVO[]> {
    return await get<GoalVO[]>('/goal/list');
  },

  /**
   * 添加目标
   */
  async addGoal(request: GoalAddRequest): Promise<number> {
    return await post<number>('/goal/add', request);
  },

  /**
   * 更新目标
   */
  async updateGoal(request: GoalUpdateRequest): Promise<boolean> {
    return await post<boolean>('/goal/update', request);
  },

  /**
   * 删除目标
   */
  async deleteGoal(id: number): Promise<boolean> {
    return await del<boolean>('/goal/delete', { id });
  },
};

