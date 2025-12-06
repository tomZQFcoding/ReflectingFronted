import { get } from './apiClient';

/**
 * 健康检查API
 */
export const healthApi = {
  /**
   * 健康检查
   */
  async check(): Promise<{ status: string; timestamp: number }> {
    return await get('/health');
  },

  /**
   * 详细健康信息
   */
  async detail(): Promise<any> {
    return await get('/health/detail');
  },
};

