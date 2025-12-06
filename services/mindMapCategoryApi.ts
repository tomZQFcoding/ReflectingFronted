import { get, post, del } from './apiClient';

/**
 * 分类视图对象
 */
export interface MindMapCategoryVO {
  id: number;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  sortOrder?: number;
  createTime?: string;
  updateTime?: string;
}

/**
 * 添加分类请求
 */
export interface MindMapCategoryAddRequest {
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  sortOrder?: number;
}

/**
 * 更新分类请求
 */
export interface MindMapCategoryUpdateRequest {
  id: number;
  name?: string;
  description?: string;
  icon?: string;
  color?: string;
  sortOrder?: number;
}

/**
 * 思维导图分类API
 */
export const mindMapCategoryApi = {
  /**
   * 获取当前用户的所有分类
   */
  async getMyCategories(): Promise<MindMapCategoryVO[]> {
    return await get<MindMapCategoryVO[]>('/mindMap/category/list');
  },

  /**
   * 添加分类
   */
  async addCategory(request: MindMapCategoryAddRequest): Promise<number> {
    return await post<number>('/mindMap/category/add', request);
  },

  /**
   * 更新分类
   */
  async updateCategory(request: MindMapCategoryUpdateRequest): Promise<boolean> {
    return await post<boolean>('/mindMap/category/update', request);
  },

  /**
   * 删除分类
   */
  async deleteCategory(id: number): Promise<boolean> {
    return await del<boolean>('/mindMap/category/delete', { id });
  },
};

