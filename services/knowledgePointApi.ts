import { get, post } from './apiClient';
import { KnowledgePoint } from '../types';

/**
 * 后端返回的KnowledgePointVO结构
 */
export interface KnowledgePointVO {
  id: string;
  title: string;
  content: string;
  category?: string;
  tags?: string; // JSON字符串
  createTime?: string;
  updateTime?: string;
}

/**
 * 创建知识点的请求
 */
export interface KnowledgePointAddRequest {
  title: string;
  content: string;
  category?: string;
  tags?: string; // JSON字符串
}

/**
 * 更新知识点的请求
 */
export interface KnowledgePointUpdateRequest {
  id: number;
  title?: string;
  content?: string;
  category?: string;
  tags?: string; // JSON字符串
}

/**
 * 将KnowledgePointVO转换为前端KnowledgePoint格式
 */
function convertVOToKnowledgePoint(vo: KnowledgePointVO): KnowledgePoint {
  let tags: string[] = [];

  try {
    tags = JSON.parse(vo.tags || '[]');
  } catch (e) {
    console.error('Failed to parse tags:', e);
  }

  return {
    id: vo.id,
    title: vo.title,
    content: vo.content,
    category: vo.category,
    tags,
    createTime: vo.createTime,
    updateTime: vo.updateTime,
  };
}

/**
 * 将前端KnowledgePoint转换为后端请求格式
 */
function convertKnowledgePointToAddRequest(kp: Omit<KnowledgePoint, 'id' | 'createTime' | 'updateTime'>): KnowledgePointAddRequest {
  return {
    title: kp.title,
    content: kp.content,
    category: kp.category,
    tags: JSON.stringify(kp.tags || []),
  };
}

/**
 * 将前端KnowledgePoint转换为更新请求格式
 */
function convertKnowledgePointToUpdateRequest(kp: KnowledgePoint): KnowledgePointUpdateRequest {
  return {
    id: parseInt(kp.id),
    title: kp.title,
    content: kp.content,
    category: kp.category,
    tags: JSON.stringify(kp.tags || []),
  };
}

/**
 * 知识点API
 */
export const knowledgePointApi = {
  /**
   * 获取当前用户的所有知识点
   */
  async listMyKnowledgePoints(): Promise<KnowledgePoint[]> {
    const vos = await get<KnowledgePointVO[]>('/knowledgePoint/my/list');
    return vos.map(convertVOToKnowledgePoint);
  },

  /**
   * 根据ID获取知识点
   */
  async getById(id: string): Promise<KnowledgePoint> {
    const vo = await get<KnowledgePointVO>(`/knowledgePoint/get?id=${id}`);
    return convertVOToKnowledgePoint(vo);
  },

  /**
   * 创建知识点
   */
  async addKnowledgePoint(kp: Omit<KnowledgePoint, 'id' | 'createTime' | 'updateTime'>): Promise<number> {
    const request = convertKnowledgePointToAddRequest(kp);
    return await post<number>('/knowledgePoint/add', request);
  },

  /**
   * 更新知识点
   */
  async updateKnowledgePoint(kp: KnowledgePoint): Promise<boolean> {
    const request = convertKnowledgePointToUpdateRequest(kp);
    return await post<boolean>('/knowledgePoint/edit', request);
  },

  /**
   * 删除知识点
   */
  async deleteKnowledgePoint(id: string): Promise<boolean> {
    return await post<boolean>('/knowledgePoint/delete', { id: parseInt(id) });
  },
};

