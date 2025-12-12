import { get, post } from './apiClient';
import { WeeklyAnalysisResult } from '../types';

/**
 * 后端返回的WeeklyReportVO结构
 */
export interface WeeklyReportVO {
  id: number;
  dateRange: string;
  keywords: string; // JSON字符串
  emotionalTrend: string;
  growthFocus: string;
  suggestion: string;
  startDate: string;
  endDate: string;
  createTime: string;
  updateTime: string;
}

/**
 * 创建周报的请求
 */
export interface WeeklyReportAddRequest {
  dateRange: string;
  keywords: string; // JSON字符串
  emotionalTrend: string;
  growthFocus: string;
  suggestion: string;
  startDate: string; // ISO日期字符串
  endDate: string; // ISO日期字符串
}

/**
 * 将WeeklyAnalysisResult转换为WeeklyReportAddRequest
 */
function convertToAddRequest(
  weeklyReport: WeeklyAnalysisResult,
  startDate: Date,
  endDate: Date
): WeeklyReportAddRequest {
  return {
    dateRange: weeklyReport.dateRange,
    keywords: JSON.stringify(weeklyReport.keywords || []),
    emotionalTrend: weeklyReport.emotionalTrend || '',
    growthFocus: weeklyReport.growthFocus || '',
    suggestion: weeklyReport.suggestion || '',
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
  };
}

/**
 * 周报API
 */
export const weeklyReportApi = {
  /**
   * 保存周报
   */
  async saveWeeklyReport(
    weeklyReport: WeeklyAnalysisResult,
    startDate: Date,
    endDate: Date
  ): Promise<number> {
    const request = convertToAddRequest(weeklyReport, startDate, endDate);
    return await post<number>('/weeklyReport/add', request);
  },

  /**
   * 获取当前用户的所有周报
   */
  async listMyWeeklyReports(): Promise<WeeklyReportVO[]> {
    return await get<WeeklyReportVO[]>('/weeklyReport/list');
  },
};

