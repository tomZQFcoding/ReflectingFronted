import { get, post } from './apiClient';
import { ReviewEntry, AIAnalysisResult } from '../types';

/**
 * 后端返回的ReviewEntryVO结构
 */
export interface ReviewEntryVO {
  id: string;
  date: string;
  framework: string;
  content: string; // JSON字符串
  tags: string; // JSON字符串
  aiAnalysis?: {
    summary: string;
    sentimentScore: number;
    actionItems: string; // JSON字符串
    keyInsight: string;
  };
}

/**
 * 创建复盘记录的请求
 */
export interface ReviewEntryAddRequest {
  date: string; // ISO日期字符串
  framework: string;
  content: string; // JSON字符串
  tags: string; // JSON字符串
  summary?: string;
  sentimentScore?: number;
  actionItems?: string; // JSON字符串
  keyInsight?: string;
}

/**
 * 更新复盘记录的请求
 */
export interface ReviewEntryUpdateRequest {
  id: number;
  date?: string;
  framework?: string;
  content?: string;
  tags?: string;
  summary?: string;
  sentimentScore?: number;
  actionItems?: string;
  keyInsight?: string;
}

/**
 * 将ReviewEntryVO转换为前端ReviewEntry格式
 */
function convertVOToEntry(vo: ReviewEntryVO): ReviewEntry {
  let content: Record<string, string> = {};
  let tags: string[] = [];
  let aiAnalysis: AIAnalysisResult | undefined;

  try {
    content = JSON.parse(vo.content || '{}');
  } catch (e) {
    console.error('Failed to parse content:', e);
  }

  try {
    tags = JSON.parse(vo.tags || '[]');
  } catch (e) {
    console.error('Failed to parse tags:', e);
  }

  if (vo.aiAnalysis) {
    let actionItems: string[] = [];
    try {
      actionItems = JSON.parse(vo.aiAnalysis.actionItems || '[]');
    } catch (e) {
      console.error('Failed to parse actionItems:', e);
    }

    aiAnalysis = {
      summary: vo.aiAnalysis.summary,
      sentimentScore: vo.aiAnalysis.sentimentScore,
      actionItems,
      keyInsight: vo.aiAnalysis.keyInsight,
    };
  }

  return {
    id: vo.id,
    date: vo.date,
    framework: vo.framework as any,
    content,
    tags,
    aiAnalysis,
  };
}

/**
 * 将前端ReviewEntry转换为后端请求格式
 */
function convertEntryToAddRequest(entry: ReviewEntry): ReviewEntryAddRequest {
  const request: ReviewEntryAddRequest = {
    date: entry.date,
    framework: entry.framework,
    content: JSON.stringify(entry.content),
    tags: JSON.stringify(entry.tags || []),
  };

  if (entry.aiAnalysis) {
    request.summary = entry.aiAnalysis.summary;
    request.sentimentScore = entry.aiAnalysis.sentimentScore;
    request.actionItems = JSON.stringify(entry.aiAnalysis.actionItems);
    request.keyInsight = entry.aiAnalysis.keyInsight;
  }

  return request;
}

/**
 * 将前端ReviewEntry转换为更新请求格式
 */
function convertEntryToUpdateRequest(entry: ReviewEntry): ReviewEntryUpdateRequest {
  const request: ReviewEntryUpdateRequest = {
    id: parseInt(entry.id),
    date: entry.date,
    framework: entry.framework,
    content: JSON.stringify(entry.content),
    tags: JSON.stringify(entry.tags || []),
  };

  if (entry.aiAnalysis) {
    request.summary = entry.aiAnalysis.summary;
    request.sentimentScore = entry.aiAnalysis.sentimentScore;
    request.actionItems = JSON.stringify(entry.aiAnalysis.actionItems);
    request.keyInsight = entry.aiAnalysis.keyInsight;
  }

  return request;
}

/**
 * 复盘记录API
 */
export const reviewEntryApi = {
  /**
   * 获取当前用户的所有复盘记录
   */
  async listMyEntries(): Promise<ReviewEntry[]> {
    const vos = await get<ReviewEntryVO[]>('/reviewEntry/my/list');
    return vos.map(convertVOToEntry);
  },

  /**
   * 根据ID获取复盘记录
   */
  async getById(id: string): Promise<ReviewEntry> {
    const vo = await get<ReviewEntryVO>(`/reviewEntry/get?id=${id}`);
    return convertVOToEntry(vo);
  },

  /**
   * 创建复盘记录
   */
  async addEntry(entry: ReviewEntry): Promise<number> {
    const request = convertEntryToAddRequest(entry);
    return await post<number>('/reviewEntry/add', request);
  },

  /**
   * 更新复盘记录
   */
  async updateEntry(entry: ReviewEntry): Promise<boolean> {
    const request = convertEntryToUpdateRequest(entry);
    return await post<boolean>('/reviewEntry/edit', request);
  },

  /**
   * 删除复盘记录
   */
  async deleteEntry(id: string): Promise<boolean> {
    return await post<boolean>('/reviewEntry/delete', { id: parseInt(id) });
  },
};

