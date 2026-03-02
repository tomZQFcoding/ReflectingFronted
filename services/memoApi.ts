import { get, post } from './apiClient';
import { Memo } from '../types';

export interface MemoVO {
  id: string;
  title?: string;
  content: string;
  tags?: string; // JSON字符串
  color?: string;
  isPinned?: number;
  captureTime?: string;
  createTime?: string;
  updateTime?: string;
}

export interface MemoAddRequest {
  title?: string;
  content: string;
  tags?: string;
  color?: string;
  isPinned?: number;
  captureTime?: string;
}

export interface MemoUpdateRequest extends MemoAddRequest {
  id: number;
}

function convertVOToMemo(vo: MemoVO): Memo {
  let tags: string[] = [];
  try {
    tags = JSON.parse(vo.tags || '[]');
  } catch (error) {
    console.error('Failed to parse memo tags', error);
  }

  return {
    id: vo.id,
    title: vo.title,
    content: vo.content,
    tags,
    color: vo.color,
    isPinned: vo.isPinned ? vo.isPinned === 1 : false,
    captureTime: vo.captureTime,
    createTime: vo.createTime,
    updateTime: vo.updateTime,
  };
}

function convertMemoToAddRequest(memo: Omit<Memo, 'id' | 'createTime' | 'updateTime'>): MemoAddRequest {
  return {
    title: memo.title,
    content: memo.content,
    tags: JSON.stringify(memo.tags || []),
    color: memo.color,
    isPinned: memo.isPinned ? 1 : 0,
    captureTime: memo.captureTime,
  };
}

function convertMemoToUpdateRequest(memo: Memo): MemoUpdateRequest {
  return {
    id: parseInt(memo.id),
    title: memo.title,
    content: memo.content,
    tags: JSON.stringify(memo.tags || []),
    color: memo.color,
    isPinned: memo.isPinned ? 1 : 0,
    captureTime: memo.captureTime,
  };
}

export const memoApi = {
  async listMyMemos(): Promise<Memo[]> {
    const vos = await get<MemoVO[]>('/memo/my/list');
    return vos.map(convertVOToMemo);
  },

  async getById(id: string): Promise<Memo> {
    const vo = await get<MemoVO>(`/memo/get?id=${id}`);
    return convertVOToMemo(vo);
  },

  async addMemo(memo: Omit<Memo, 'id' | 'createTime' | 'updateTime'>): Promise<number> {
    const request = convertMemoToAddRequest(memo);
    return await post<number>('/memo/add', request);
  },

  async updateMemo(memo: Memo): Promise<boolean> {
    const request = convertMemoToUpdateRequest(memo);
    return await post<boolean>('/memo/edit', request);
  },

  async deleteMemo(id: string): Promise<boolean> {
    return await post<boolean>('/memo/delete', { id: parseInt(id) });
  },
};


