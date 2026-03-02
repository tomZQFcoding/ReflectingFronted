/** 用户角色 - 用于权限划分 */
export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
}

export enum FrameworkType {
  DAILY = 'DAILY',
  KPT = 'KPT', // Keep, Problem, Try
  GRAI = 'GRAI', // Goal, Result, Analysis, Insight
  FOUR_LS = 'FOUR_LS', // Liked, Learned, Lacked, Longed for
  SWOT = 'SWOT', // Strengths, Weaknesses, Opportunities, Threats
  FREEFORM = 'FREEFORM'
}

export interface ReviewEntry {
  id: string;
  date: string;
  framework: FrameworkType;
  content: Record<string, string>; // Key corresponds to framework prompts
  tags: string[];
  aiAnalysis?: AIAnalysisResult;
}

export interface AIAnalysisResult {
  summary: string;
  sentimentScore: number; // 0 to 10
  actionItems: string[];
  keyInsight: string;
}

export interface WeeklyAnalysisResult {
  dateRange: string;
  keywords: string[];
  emotionalTrend: string;
  growthFocus: string; // Replaced achievements with growthFocus
  suggestion: string;
}

export interface FrameworkConfig {
  id: FrameworkType;
  label: string;
  description: string;
  prompts: {
    key: string;
    label: string;
    placeholder: string;
    minHeight?: string;
  }[];
}

export type ViewState =
  | 'DASHBOARD'
  | 'NEW_ENTRY'
  | 'ENTRY_DETAIL'
  | 'KNOWLEDGE_POINTS'
  | 'KNOWLEDGE_POINT_DETAIL'
  | 'KNOWLEDGE_POINT_EDIT'
  | 'MINDMAP'
  | 'GOALS'
  | 'MONTHLY_REPORT'
  | 'THINKING_CONTENT'
  | 'THINKING_CONTENT_DETAIL'
  | 'THINKING_CONTENT_EDIT'
  | 'MEMO_INBOX'
  | 'HABITS'
  | 'CAREER'
  | 'ADMIN'; // 管理员面板，仅管理员可见

export enum AIModel {
  OPENROUTER_OLMO = 'OPENROUTER_OLMO',
  ZHIPU_GLM45 = 'ZHIPU_GLM45'
}

export interface AIModelInfo {
  id: AIModel;
  name: string;
  description: string;
  provider: string;
}

export interface KnowledgePoint {
  id: string;
  title: string;
  content: string;
  category?: string;
  tags?: string[];
  isStarred?: boolean;
  viewCount?: number;
  createTime?: string;
  updateTime?: string;
}

export interface ThinkingContent {
  id: string;
  title: string;
  content: string;
  category?: string; // 例如：'AE技巧', 'UE学习', '创意灵感', '技术笔记'等
  tags?: string[];
  isStarred?: boolean;
  createTime: string;
  updateTime: string;
}

export interface Memo {
  id: string;
  title?: string;
  content: string;
  tags?: string[];
  color?: string;
  isPinned?: boolean;
  captureTime?: string;
  createTime?: string;
  updateTime?: string;
}

export enum HabitGoalType {
  CHECK_IN = 'CHECK_IN', // 打卡类型：当天完成打卡即可
  QUANTITY = 'QUANTITY' // 数量类型：需要完成一定量
}

export enum HabitDurationType {
  FOREVER = 'FOREVER', // 永远
  ONE_MONTH = 'ONE_MONTH', // 一个月
  THREE_MONTHS = 'THREE_MONTHS', // 三个月
  SIX_MONTHS = 'SIX_MONTHS', // 六个月
  ONE_YEAR = 'ONE_YEAR', // 一年
  CUSTOM = 'CUSTOM' // 自定义天数
}

export interface Habit {
  id: string;
  name: string;
  description?: string;
  icon?: string; // 图标名称（lucide-react图标名）
  color?: string;
  targetDays?: number; // 目标天数（如每周7天）
  reminderTime?: string; // 提醒时间，格式：HH:mm
  goalType?: HabitGoalType; // 目标类型：打卡或数量
  goalAmount?: number; // 目标数量（当goalType为QUANTITY时使用）
  goalUnit?: string; // 目标单位（如：次、分钟、页等）
  startDate?: string; // 开始日期，ISO日期字符串
  durationType?: HabitDurationType; // 坚持天数类型
  customDuration?: number; // 自定义天数（当durationType为CUSTOM时使用）
  isActive: boolean;
  createTime?: string;
  updateTime?: string;
}

export interface HabitCheckIn {
  id: string;
  habitId: string;
  date: string; // ISO日期字符串
  completed: boolean;
  quantity?: number; // 打卡数量（当习惯类型为QUANTITY时使用）
  note?: string;
  createTime?: string;
}

export interface HabitWithStats extends Habit {
  currentStreak: number; // 当前连续天数
  longestStreak: number; // 最长连续天数
  totalCheckIns: number; // 总打卡次数
  completionRate: number; // 完成率（0-100）
  recentCheckIns: HabitCheckIn[]; // 最近的打卡记录
}

// 职业规划 - 面试经历
export type InterviewStatus = 'OFFER' | 'PENDING' | 'REJECTED';

export interface InterviewRecord {
  id: string;
  company: string;
  position: string;
  city?: string;
  date: string; // yyyy-MM-dd
  status: InterviewStatus;
  round?: string;
  difficulty?: 'EASY' | 'MEDIUM' | 'HARD';
  tags?: string[];
  notes?: string;
  createTime?: string;
}

// 刷题训练 - 题目
export type QuestionType = 'SINGLE' | 'MULTI' | 'TEXT';

export interface QuestionOption {
  key: string;
  text: string;
}

export interface PracticeQuestion {
  id: string;
  title: string;
  type: QuestionType;
  options?: QuestionOption[];
  answer: string | string[];
  analysis?: string;
  difficulty?: 'EASY' | 'MEDIUM' | 'HARD';
  tags?: string[];
}

