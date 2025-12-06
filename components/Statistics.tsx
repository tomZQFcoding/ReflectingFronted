import React, { useState, useMemo } from 'react';
import { ChevronLeft, BarChart3, Target, BookOpen, Sparkles, TrendingUp } from 'lucide-react';
import { ReviewEntry, AIModel, KnowledgePoint } from '../types';
import { Goal } from '../types/goal';
import { MonthlyReport } from './MonthlyReport';
import { WeeklyReport } from './WeeklyReport';
import { YearlyReport } from './YearlyReport';
import { GoalStatistics } from './GoalStatistics';
import { ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';

interface StatisticsProps {
  entries: ReviewEntry[];
  goals?: Goal[];
  knowledgePoints?: KnowledgePoint[];
  selectedModel?: AIModel;
  onBack: () => void;
}

export const Statistics: React.FC<StatisticsProps> = ({ 
  entries, 
  goals = [], 
  knowledgePoints = [],
  selectedModel = AIModel.ZHIPU_GLM45, 
  onBack 
}) => {
  const [reportMonth, setReportMonth] = useState(new Date());
  const [activeTab, setActiveTab] = useState<'review' | 'goals' | 'knowledge' | 'overview'>('overview');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <button
                onClick={onBack}
                className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                <ChevronLeft size={20} className="text-slate-500 dark:text-slate-400" />
              </button>
              <h1 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">数据统计</h1>
            </div>
            <p className="text-slate-500 dark:text-slate-400 mt-2 ml-12">查看详细的统计数据和分析报告</p>
          </div>
        </div>

        {/* 标签页切换 */}
        <div className="mb-6">
          <div className="flex gap-2 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl p-1.5 border border-slate-200/50 dark:border-slate-700/50 shadow-sm inline-flex flex-wrap">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
                activeTab === 'overview'
                  ? 'bg-blue-500 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <BarChart3 size={16} />
              综合概览
            </button>
            <button
              onClick={() => setActiveTab('review')}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
                activeTab === 'review'
                  ? 'bg-indigo-500 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Sparkles size={16} />
              复盘统计
            </button>
            <button
              onClick={() => setActiveTab('goals')}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
                activeTab === 'goals'
                  ? 'bg-blue-500 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Target size={16} />
              目标统计
            </button>
            <button
              onClick={() => setActiveTab('knowledge')}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
                activeTab === 'knowledge'
                  ? 'bg-purple-500 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <BookOpen size={16} />
              知识点统计
            </button>
          </div>
        </div>

        {/* 内容区域 */}
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-3xl shadow-sm border border-slate-200/50 dark:border-slate-700/50 p-6 sm:p-8">
          {activeTab === 'overview' && (
            <OverviewStatistics 
              entries={entries}
              goals={goals}
              knowledgePoints={knowledgePoints}
            />
          )}

          {activeTab === 'review' && (
            <ReviewStatistics 
              entries={entries}
              selectedModel={selectedModel}
              reportMonth={reportMonth}
              setReportMonth={setReportMonth}
            />
          )}

          {activeTab === 'goals' && (
            <div>
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-6">目标统计</h2>
              {goals.length > 0 ? (
                <GoalStatistics goals={goals} />
              ) : (
                <div className="text-center py-16 bg-slate-50/50 dark:bg-slate-700/30 rounded-3xl border border-dashed border-slate-200 dark:border-slate-700">
                  <Target size={48} className="mx-auto text-slate-300 dark:text-slate-600 mb-4" />
                  <h3 className="text-slate-600 dark:text-slate-400 font-medium mb-1">暂无目标数据</h3>
                  <p className="text-slate-400 dark:text-slate-500 text-sm">开始设定目标，追踪你的成长</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'knowledge' && (
            <KnowledgeStatistics knowledgePoints={knowledgePoints} />
          )}
        </div>
      </div>
    </div>
  );
};

// 综合概览统计组件
interface OverviewStatisticsProps {
  entries: ReviewEntry[];
  goals: Goal[];
  knowledgePoints: KnowledgePoint[];
}

const OverviewStatistics: React.FC<OverviewStatisticsProps> = ({ entries, goals, knowledgePoints }) => {
  // 复盘统计
  const reviewStats = useMemo(() => {
    const total = entries.length;
    const thisMonth = entries.filter(e => {
      const entryDate = new Date(e.date);
      const now = new Date();
      return entryDate.getMonth() === now.getMonth() && 
             entryDate.getFullYear() === now.getFullYear();
    }).length;
    const avgScore = total > 0 
      ? (entries.reduce((acc, e) => acc + (e.aiAnalysis?.sentimentScore || 0), 0) / total).toFixed(1)
      : '0';
    return { total, thisMonth, avgScore };
  }, [entries]);

  // 目标统计
  const goalStats = useMemo(() => {
    const total = goals.length;
    const active = goals.filter(g => g.status === 'active').length;
    const completed = goals.filter(g => g.status === 'completed').length;
    const avgProgress = total > 0
      ? Math.round(goals.reduce((acc, g) => acc + g.progress, 0) / total)
      : 0;
    return { total, active, completed, avgProgress };
  }, [goals]);

  // 知识点统计
  const knowledgeStats = useMemo(() => {
    const total = knowledgePoints.length;
    const categories = knowledgePoints.reduce((acc, kp) => {
      const cat = kp.category || '未分类';
      acc[cat] = (acc[cat] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const categoryData = Object.entries(categories)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([name, value]) => ({ name, value }));
    return { total, categoryData };
  }, [knowledgePoints]);

  const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-6">综合概览</h2>
      
      {/* 主要统计卡片 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-indigo-50 to-indigo-100/50 dark:from-indigo-900/20 dark:to-indigo-800/10 rounded-2xl p-4 border border-indigo-200/50 dark:border-indigo-800/30">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles size={18} className="text-indigo-600 dark:text-indigo-400" />
            <div className="text-xs text-slate-600 dark:text-slate-400 font-medium">复盘记录</div>
          </div>
          <div className="text-2xl font-semibold text-indigo-600 dark:text-indigo-400 mb-1">{reviewStats.total}</div>
          <div className="text-xs text-slate-500 dark:text-slate-500">本月 {reviewStats.thisMonth} 篇</div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-900/20 dark:to-blue-800/10 rounded-2xl p-4 border border-blue-200/50 dark:border-blue-800/30">
          <div className="flex items-center gap-2 mb-2">
            <Target size={18} className="text-blue-600 dark:text-blue-400" />
            <div className="text-xs text-slate-600 dark:text-slate-400 font-medium">目标总数</div>
          </div>
          <div className="text-2xl font-semibold text-blue-600 dark:text-blue-400 mb-1">{goalStats.total}</div>
          <div className="text-xs text-slate-500 dark:text-slate-500">{goalStats.active} 个进行中</div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-900/20 dark:to-purple-800/10 rounded-2xl p-4 border border-purple-200/50 dark:border-purple-800/30">
          <div className="flex items-center gap-2 mb-2">
            <BookOpen size={18} className="text-purple-600 dark:text-purple-400" />
            <div className="text-xs text-slate-600 dark:text-slate-400 font-medium">知识点</div>
          </div>
          <div className="text-2xl font-semibold text-purple-600 dark:text-purple-400 mb-1">{knowledgeStats.total}</div>
          <div className="text-xs text-slate-500 dark:text-slate-500">{knowledgeStats.categoryData.length} 个分类</div>
        </div>

        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-900/20 dark:to-emerald-800/10 rounded-2xl p-4 border border-emerald-200/50 dark:border-emerald-800/30">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp size={18} className="text-emerald-600 dark:text-emerald-400" />
            <div className="text-xs text-slate-600 dark:text-slate-400 font-medium">平均评分</div>
          </div>
          <div className="text-2xl font-semibold text-emerald-600 dark:text-emerald-400 mb-1">{reviewStats.avgScore}</div>
          <div className="text-xs text-slate-500 dark:text-slate-500">情绪评分</div>
        </div>
      </div>

      {/* 图表区域 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 目标状态分布 */}
        {goalStats.total > 0 && (() => {
          // 只统计进行中和已完成，过滤掉已归档
          const statusData = [
            { name: '进行中', value: goalStats.active },
            { name: '已完成', value: goalStats.completed },
          ].filter(item => item.value > 0);

          return statusData.length > 0 ? (
            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-3xl p-6 border border-slate-200/50 dark:border-slate-700/50">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">目标状态分布</h3>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {statusData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : null;
        })()}

        {/* 知识点分类分布 */}
        {knowledgeStats.categoryData.length > 0 && (
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-3xl p-6 border border-slate-200/50 dark:border-slate-700/50">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">知识点分类</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={knowledgeStats.categoryData}>
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 12, fill: '#64748b' }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    borderRadius: '8px', 
                    border: '1px solid #e2e8f0',
                    fontSize: '12px'
                  }}
                />
                <Bar dataKey="value" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
};

// 复盘统计组件
interface ReviewStatisticsProps {
  entries: ReviewEntry[];
  selectedModel: AIModel;
  reportMonth: Date;
  setReportMonth: (date: Date) => void;
}

const ReviewStatistics: React.FC<ReviewStatisticsProps> = ({ 
  entries, 
  selectedModel, 
  reportMonth, 
  setReportMonth 
}) => {
  const [reviewTab, setReviewTab] = useState<'monthly' | 'weekly' | 'yearly'>('monthly');

  return (
    <div>
      {/* 复盘统计标签页 */}
      <div className="mb-6">
        <div className="flex gap-2 bg-slate-50 dark:bg-slate-700/50 rounded-xl p-1 inline-flex">
          <button
            onClick={() => setReviewTab('monthly')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              reviewTab === 'monthly'
                ? 'bg-white dark:bg-slate-600 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            月度报告
          </button>
          <button
            onClick={() => setReviewTab('weekly')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              reviewTab === 'weekly'
                ? 'bg-white dark:bg-slate-600 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              周报
            </button>
            <button
            onClick={() => setReviewTab('yearly')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              reviewTab === 'yearly'
                ? 'bg-white dark:bg-slate-600 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              年度报告
            </button>
          </div>
        </div>

      {reviewTab === 'monthly' && (
            <div>
              {/* 月份选择器 */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">月度报告</h2>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      const prevMonth = new Date(reportMonth);
                      prevMonth.setMonth(prevMonth.getMonth() - 1);
                      setReportMonth(prevMonth);
                    }}
                    className="p-2 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                  >
                    <ChevronLeft size={18} className="text-slate-600 dark:text-slate-400" />
                  </button>
                  <div className="px-4 py-2 bg-slate-50 dark:bg-slate-700 rounded-lg">
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      {reportMonth.getFullYear()}年{reportMonth.getMonth() + 1}月
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      const nextMonth = new Date(reportMonth);
                      nextMonth.setMonth(nextMonth.getMonth() + 1);
                      setReportMonth(nextMonth);
                    }}
                    className="p-2 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                  >
                    <ChevronLeft size={18} className="text-slate-600 dark:text-slate-400 rotate-180" />
                  </button>
                </div>
              </div>
              <MonthlyReport entries={entries} month={reportMonth} />
            </div>
          )}

      {reviewTab === 'weekly' && (
            <WeeklyReport entries={entries} selectedModel={selectedModel} />
          )}

      {reviewTab === 'yearly' && (
            <YearlyReport entries={entries} />
          )}
        </div>
  );
};

// 知识点统计组件
interface KnowledgeStatisticsProps {
  knowledgePoints: KnowledgePoint[];
}

const KnowledgeStatistics: React.FC<KnowledgeStatisticsProps> = ({ knowledgePoints }) => {
  const stats = useMemo(() => {
    const total = knowledgePoints.length;
    const categories = knowledgePoints.reduce((acc, kp) => {
      const cat = kp.category || '未分类';
      acc[cat] = (acc[cat] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const categoryData = Object.entries(categories)
      .sort(([,a], [,b]) => b - a)
      .map(([name, value]) => ({ name, value }));
    
    const starred = knowledgePoints.filter(kp => kp.isStarred).length;
    const withTags = knowledgePoints.filter(kp => kp.tags && kp.tags.length > 0).length;
    
    // 按创建时间统计
    const monthlyData: Record<string, number> = {};
    knowledgePoints.forEach(kp => {
      if (kp.createTime) {
        const date = new Date(kp.createTime);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        monthlyData[monthKey] = (monthlyData[monthKey] || 0) + 1;
      }
    });
    
    const monthlyChartData = Object.entries(monthlyData)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-6)
      .map(([date, count]) => ({
        date: date.slice(5), // 只显示月份
        count
      }));

    return { total, categoryData, starred, withTags, monthlyChartData };
  }, [knowledgePoints]);

  const COLORS = ['#8b5cf6', '#a78bfa', '#c4b5fd', '#ddd6fe', '#ede9fe'];

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-6">知识点统计</h2>
      
      {/* 统计卡片 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-900/20 dark:to-purple-800/10 rounded-2xl p-4 border border-purple-200/50 dark:border-purple-800/30">
          <div className="text-2xl font-semibold text-purple-600 dark:text-purple-400 mb-1">{stats.total}</div>
          <div className="text-xs text-slate-600 dark:text-slate-400 font-medium">知识点总数</div>
        </div>
        <div className="bg-gradient-to-br from-amber-50 to-amber-100/50 dark:from-amber-900/20 dark:to-amber-800/10 rounded-2xl p-4 border border-amber-200/50 dark:border-amber-800/30">
          <div className="text-2xl font-semibold text-amber-600 dark:text-amber-400 mb-1">{stats.categoryData.length}</div>
          <div className="text-xs text-slate-600 dark:text-slate-400 font-medium">分类数量</div>
        </div>
        <div className="bg-gradient-to-br from-pink-50 to-pink-100/50 dark:from-pink-900/20 dark:to-pink-800/10 rounded-2xl p-4 border border-pink-200/50 dark:border-pink-800/30">
          <div className="text-2xl font-semibold text-pink-600 dark:text-pink-400 mb-1">{stats.starred}</div>
          <div className="text-xs text-slate-600 dark:text-slate-400 font-medium">已收藏</div>
        </div>
        <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-900/20 dark:to-blue-800/10 rounded-2xl p-4 border border-blue-200/50 dark:border-blue-800/30">
          <div className="text-2xl font-semibold text-blue-600 dark:text-blue-400 mb-1">{stats.withTags}</div>
          <div className="text-xs text-slate-600 dark:text-slate-400 font-medium">已标记</div>
      </div>
      </div>

      {/* 图表区域 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 分类分布 */}
        {stats.categoryData.length > 0 && (
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-3xl p-6 border border-slate-200/50 dark:border-slate-700/50">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">分类分布</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={stats.categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {stats.categoryData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* 月度创建趋势 */}
        {stats.monthlyChartData.length > 0 && (
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-3xl p-6 border border-slate-200/50 dark:border-slate-700/50">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">创建趋势</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={stats.monthlyChartData}>
                <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 12, fill: '#64748b' }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    borderRadius: '8px', 
                    border: '1px solid #e2e8f0',
                    fontSize: '12px'
                  }}
                />
                <Bar dataKey="count" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* 空状态 */}
      {stats.total === 0 && (
        <div className="text-center py-16 bg-slate-50/50 dark:bg-slate-700/30 rounded-3xl border border-dashed border-slate-200 dark:border-slate-700">
          <BookOpen size={48} className="mx-auto text-slate-300 dark:text-slate-600 mb-4" />
          <h3 className="text-slate-600 dark:text-slate-400 font-medium mb-1">暂无知识点数据</h3>
          <p className="text-slate-400 dark:text-slate-500 text-sm">开始创建知识点，构建你的知识体系</p>
        </div>
      )}
    </div>
  );
};

