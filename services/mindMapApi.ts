import { get, post } from './apiClient';
import { MindMapNodeData } from '../components/MindMapNode';

/**
 * 后端返回的MindMapVO结构
 */
export interface MindMapVO {
  id: number;
  title: string;
  data: string; // JSON字符串
  createTime?: string;
  updateTime?: string;
}

/**
 * 更新思维导图的请求
 */
export interface MindMapUpdateRequest {
  title?: string;
  data: string; // JSON字符串
  categoryId?: number;
}

/**
 * 思维导图API
 */
export const mindMapApi = {
  /**
   * 获取当前用户的思维导图
   */
  async getMyMindMap(categoryId?: number): Promise<MindMapNodeData> {
    const vo = await get<MindMapVO>('/mindMap/get', categoryId ? { categoryId } : undefined);
    try {
      const data = JSON.parse(vo.data);
      return data as MindMapNodeData;
    } catch (e) {
      console.error('Failed to parse mind map data:', e);
      // 返回默认数据
      return {
        id: "root-1",
        label: "我的目标",
        type: "root",
        icon: "User",
        children: []
      };
    }
  },

  /**
   * 更新当前用户的思维导图
   */
  async updateMyMindMap(data: MindMapNodeData, title?: string, categoryId?: number): Promise<boolean> {
    const request: MindMapUpdateRequest = {
      title: title || "思维导图",
      data: JSON.stringify(data),
      categoryId
    };
    return await post<boolean>('/mindMap/update', request);
  },
};

