import { post, get, del } from './apiClient';
import { UserRole } from '../types';

/**
 * 登录请求
 */
export interface UserLoginRequest {
  userAccount: string;
  userPassword: string;
}

/**
 * 注册请求
 */
export interface UserRegisterRequest {
  userAccount: string;
  userPassword: string;
  checkPassword: string;
}

/**
 * 登录用户信息
 */
export interface LoginUserVO {
  id: number;
  userAccount?: string; // 账号，后端可能返回
  userName: string;
  userAvatar?: string;
  userProfile?: string;
  /** 用户角色：admin | user，与 UserRole 枚举对应 */
  userRole: string;
  createTime: string;
  updateTime: string;
}

/** 判断是否为管理员 */
export function isAdmin(user: LoginUserVO | null): boolean {
  return user?.userRole?.toLowerCase() === UserRole.ADMIN;
}

/** 判断是否为普通用户 */
export function isUser(user: LoginUserVO | null): boolean {
  const role = user?.userRole?.toLowerCase();
  return role === UserRole.USER || (!!role && role !== UserRole.ADMIN);
}

/**
 * 更新个人信息请求
 */
export interface UserUpdateMyRequest {
  userName?: string;
  userAvatar?: string;
  userProfile?: string;
}

/**
 * 用户API
 */
export const userApi = {
  /**
   * 用户登录
   */
  async login(request: UserLoginRequest): Promise<LoginUserVO> {
    return await post<LoginUserVO>('/user/login', request);
  },

  /**
   * 用户注册
   */
  async register(request: UserRegisterRequest): Promise<number> {
    return await post<number>('/user/register', request);
  },

  /**
   * 用户注销
   */
  async logout(): Promise<boolean> {
    return await post<boolean>('/user/logout', {});
  },

  /**
   * 获取当前登录用户
   */
  async getCurrentUser(): Promise<LoginUserVO> {
    return await get<LoginUserVO>('/user/get/login');
  },

  /**
   * 更新个人信息
   */
  async updateProfile(request: UserUpdateMyRequest): Promise<boolean> {
    return await post<boolean>('/user/update/my', request);
  },

  // ---------- 管理员专用 API ----------
  /**
   * 分页查询用户列表（仅管理员）
   */
  async listUsers(params?: { current?: number; pageSize?: number; userName?: string; sortOrder?: string }): Promise<{
    records: LoginUserVO[];
    total: number;
  }> {
    return await get<{ records: LoginUserVO[]; total: number }>('/user/list/page', params);
  },

  /**
   * 根据 id 删除用户（仅管理员）
   */
  async deleteUser(id: number): Promise<boolean> {
    return await del(`/user/delete/${id}`);
  },

  /**
   * 更新用户角色（仅管理员）
   */
  async updateUserRole(id: number, userRole: string, banDays?: number | null): Promise<boolean> {
    const body: any = { id, userRole };
    if (typeof banDays === 'number') {
      body.banDays = banDays;
    }
    return await post<boolean>('/user/update', body);
  },

  /**
   * 更新用户信息（仅管理员，支持昵称、头像、简介、角色）
   */
  async updateUser(request: { id: number; userName?: string; userAvatar?: string; userProfile?: string; userRole?: string }): Promise<boolean> {
    return await post<boolean>('/user/update', request);
  },
};

export interface PlatformStats {
  totalUsers: number;
  adminUsers: number;
  normalUsers: number;
  bannedUsers: number;
  totalReviewEntries: number;
  totalGoals: number;
  totalKnowledgePoints: number;
  totalMemos: number;
  totalHabits: number;
}

export interface DailyTrendItem {
  date: string;
  reviewEntries: number;
  newUsers: number;
  goals: number;
  knowledgePoints: number;
  memos: number;
  habits: number;
}

export interface AdminTrends {
  dailyTrends: DailyTrendItem[];
  activeUsersLast7Days: number;
  reviewFrameworkDistribution: Record<string, number>;
}

export interface WeeklyRetentionItem {
  weekLabel: string;
  newUsers: number;
  retainedUsers: number;
  retentionRate: number;
}

export interface HeatmapCell {
  hour: number;
  dayOfWeek: number;
  count: number;
}

export interface ActivityHeatmap {
  cells: HeatmapCell[];
}

export const adminApi = {
  /**
   * 获取平台数据概览（仅管理员）
   */
  async getPlatformStats(): Promise<PlatformStats> {
    return await get<PlatformStats>('/admin/stats/overview');
  },

  /**
   * 获取每日趋势与用户行为统计（仅管理员）
   */
  async getTrends(days?: number): Promise<AdminTrends> {
    return await get<AdminTrends>('/admin/stats/trends', { days: days ?? 14 });
  },

  /**
   * 获取按周留存率（仅管理员）
   */
  async getRetention(weeks?: number): Promise<WeeklyRetentionItem[]> {
    return await get<WeeklyRetentionItem[]>('/admin/stats/retention', { weeks: weeks ?? 8 });
  },

  /**
   * 获取按时间段活跃热力图（仅管理员）
   */
  async getHeatmap(): Promise<ActivityHeatmap> {
    return await get<ActivityHeatmap>('/admin/stats/heatmap');
  },
};

