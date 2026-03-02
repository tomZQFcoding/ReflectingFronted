import { get, post, del } from './apiClient';
import { Habit, HabitCheckIn, HabitWithStats } from '../types';

/**
 * 后端返回的HabitVO结构
 */
export interface HabitVO {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  targetDays?: number;
  goalType?: string;
  goalAmount?: number;
  goalUnit?: string;
  startDate?: string;
  durationType?: string;
  customDuration?: number;
  reminderTime?: string;
  isActive: boolean;
  createTime?: string;
  updateTime?: string;
}

/**
 * 后端返回的HabitCheckInVO结构
 */
export interface HabitCheckInVO {
  id: number | string;
  habitId: number | string;
  date: string;
  completed: number | boolean;
  quantity?: number;
  note?: string;
  createTime?: string;
}

/**
 * 创建习惯的请求
 */
export interface HabitAddRequest {
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  targetDays?: number;
  goalType?: string;
  goalAmount?: number;
  goalUnit?: string;
  startDate?: string;
  durationType?: string;
  customDuration?: number;
  reminderTime?: string;
  isActive?: boolean;
}

/**
 * 更新习惯的请求
 */
export interface HabitUpdateRequest {
  id: string;
  name?: string;
  description?: string;
  icon?: string;
  color?: string;
  targetDays?: number;
  goalType?: string;
  goalAmount?: number;
  goalUnit?: string;
  startDate?: string;
  durationType?: string;
  customDuration?: number;
  reminderTime?: string;
  isActive?: boolean;
}

/**
 * 打卡请求
 */
export interface HabitCheckInRequest {
  habitId: string;
  date: string; // ISO日期字符串
  completed: boolean;
  quantity?: number; // 打卡数量（当习惯类型为QUANTITY时使用）
  note?: string;
}

/**
 * 格式化日期为 YYYY-MM-DD 格式（避免时区问题）
 * 关键：对于 ISO 格式的日期，使用 UTC 方法提取日期部分，而不是本地时区
 */
function formatDateString(dateValue: string | undefined): string | undefined {
  if (!dateValue) return undefined;
  
  // 如果已经是 YYYY-MM-DD 格式，直接返回
  if (dateValue.match(/^\d{4}-\d{2}-\d{2}$/)) {
    return dateValue;
  }
  
  // 如果是 ISO 格式（包含 T），直接提取日期部分
  // 这是最安全的方法，避免时区转换导致的日期偏移
  // 例如：2025-12-14T00:00:00Z 或 2025-12-14T16:00:00Z 都提取为 2025-12-14
  if (dateValue.includes('T')) {
    // 直接提取 T 之前的日期部分，不进行任何时区转换
    const datePart = dateValue.split('T')[0];
    // 验证提取的日期格式是否正确
    if (datePart.match(/^\d{4}-\d{2}-\d{2}$/)) {
      return datePart;
    }
  }
  
  // 如果是 YYYY/MM/DD 格式，转换为 YYYY-MM-DD
  if (dateValue.match(/^\d{4}\/\d{2}\/\d{2}$/)) {
    return dateValue.replace(/\//g, '-');
  }
  
  // 其他格式，尝试解析但使用 UTC 方法（避免时区问题）
  const date = new Date(dateValue);
  if (!isNaN(date.getTime())) {
    // 优先使用 UTC 方法
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  
  return dateValue;
}

/**
 * 将HabitVO转换为前端Habit格式
 */
function convertVOToHabit(vo: HabitVO): Habit {
  return {
    id: vo.id,
    name: vo.name,
    description: vo.description,
    icon: vo.icon,
    color: vo.color,
    targetDays: vo.targetDays,
    goalType: vo.goalType as any,
    goalAmount: vo.goalAmount,
    goalUnit: vo.goalUnit,
    startDate: formatDateString(vo.startDate), // 格式化日期，避免时区问题
    durationType: vo.durationType as any,
    customDuration: vo.customDuration,
    reminderTime: vo.reminderTime,
    isActive: vo.isActive,
    createTime: vo.createTime,
    updateTime: vo.updateTime,
  };
}

/**
 * 将HabitCheckInVO转换为前端HabitCheckIn格式
 */
function convertVOToCheckIn(vo: HabitCheckInVO): HabitCheckIn {
  return {
    id: String(vo.id),
    habitId: String(vo.habitId),
    date: vo.date,
    completed: vo.completed === 1 || vo.completed === true,
    quantity: vo.quantity,
    note: vo.note,
    createTime: vo.createTime,
  };
}

/**
 * 习惯打卡API
 */
export const habitApi = {
  /**
   * 获取当前用户的所有习惯
   */
  async listMyHabits(): Promise<Habit[]> {
    const vos = await get<HabitVO[]>('/habit/my/list');
    return vos.map(convertVOToHabit);
  },

  /**
   * 获取习惯详情（包含统计数据）
   */
  async getHabitWithStats(id: string): Promise<HabitWithStats> {
    const data = await get<{
      habit: HabitVO;
      stats: {
        currentStreak: number;
        longestStreak: number;
        totalCheckIns: number;
        completionRate: number;
      };
      recentCheckIns: HabitCheckInVO[];
    }>(`/habit/getWithStats?id=${id}`);
    
    return {
      ...convertVOToHabit(data.habit),
      currentStreak: data.stats.currentStreak,
      longestStreak: data.stats.longestStreak,
      totalCheckIns: data.stats.totalCheckIns,
      completionRate: data.stats.completionRate,
      recentCheckIns: data.recentCheckIns.map(convertVOToCheckIn),
    };
  },

  /**
   * 创建习惯
   */
  async addHabit(habit: Omit<Habit, 'id' | 'createTime' | 'updateTime'>): Promise<string> {
    const request: HabitAddRequest = {
      name: habit.name,
      description: habit.description,
      icon: habit.icon,
      color: habit.color,
      targetDays: habit.targetDays,
      goalType: habit.goalType,
      goalAmount: habit.goalAmount,
      goalUnit: habit.goalUnit,
      startDate: habit.startDate,
      durationType: habit.durationType,
      customDuration: habit.customDuration,
      reminderTime: habit.reminderTime,
      isActive: habit.isActive ?? true,
    };
    return await post<string>('/habit/add', request);
  },

  /**
   * 更新习惯
   */
  async updateHabit(habit: Partial<Habit> & { id: string }): Promise<boolean> {
    const request: HabitUpdateRequest = {
      id: typeof habit.id === 'string' ? parseInt(habit.id) : habit.id,
      name: habit.name,
      description: habit.description,
      icon: habit.icon,
      color: habit.color,
      targetDays: habit.targetDays,
      goalType: habit.goalType,
      goalAmount: habit.goalAmount,
      goalUnit: habit.goalUnit,
      startDate: habit.startDate,
      durationType: habit.durationType,
      customDuration: habit.customDuration,
      reminderTime: habit.reminderTime,
      isActive: typeof habit.isActive === 'boolean' ? (habit.isActive ? 1 : 0) : habit.isActive,
    };
    return await post<boolean>('/habit/edit', request);
  },

  /**
   * 删除习惯
   */
  async deleteHabit(id: string): Promise<boolean> {
    return await post<boolean>('/habit/delete', { id });
  },

  /**
   * 打卡
   */
  async checkIn(request: HabitCheckInRequest): Promise<string> {
    // 确保habitId和completed类型正确
    const apiRequest: any = {
      habitId: typeof request.habitId === 'string' ? request.habitId : String(request.habitId),
      date: request.date,
      completed: typeof request.completed === 'boolean' ? request.completed : Boolean(request.completed),
    };
    if (request.note) {
      apiRequest.note = request.note;
    }
    if (request.quantity !== undefined) {
      apiRequest.quantity = request.quantity;
    }
    return await post<string>('/habit/checkIn', apiRequest);
  },

  /**
   * 获取指定日期范围的打卡记录
   */
  async getCheckIns(habitId: string, startDate: string, endDate: string): Promise<HabitCheckIn[]> {
    const vos = await get<HabitCheckInVO[]>('/habit/checkIns', {
      habitId,
      startDate,
      endDate,
    });
    return vos.map(convertVOToCheckIn);
  },

  /**
   * 删除打卡记录
   */
  async deleteCheckIn(id: string | number): Promise<boolean> {
    // 后端期望 Long 类型，需要转换为数字
    let numericId: number;
    if (typeof id === 'string') {
      if (id.startsWith('temp-')) {
        throw new Error('临时记录不能删除');
      }
      numericId = parseInt(id, 10);
      if (isNaN(numericId)) {
        throw new Error('无效的打卡记录ID');
      }
    } else {
      numericId = id;
    }
    return await post<boolean>('/habit/checkIn/delete', { id: numericId });
  },
};

