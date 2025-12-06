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

export type ViewState = 'DASHBOARD' | 'NEW_ENTRY' | 'ENTRY_DETAIL' | 'KNOWLEDGE_POINTS' | 'KNOWLEDGE_POINT_DETAIL' | 'KNOWLEDGE_POINT_EDIT' | 'MINDMAP' | 'GOALS' | 'MONTHLY_REPORT';

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
