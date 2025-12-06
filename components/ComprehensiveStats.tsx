import React, { useMemo, useEffect, useState } from 'react';
import { Target, BookOpen, CheckCircle2, TrendingUp, Calendar, Clock, BarChart3, Activity, Sparkles, Network } from 'lucide-react';
import { ReviewEntry } from '../types';
import { Goal } from '../types/goal';
import { KnowledgePoint } from '../types';
import { goalTaskApi, GoalTaskVO } from '../services/goalTaskApi';

interface ComprehensiveStatsProps {
  entries: ReviewEntry[];
  goals: Goal[];
  knowledgePoints: KnowledgePoint[];
}

export const ComprehensiveStats: React.FC<ComprehensiveStatsProps> = ({ 
  entries, 
  goals, 
  knowledgePoints 
}) => {
  const [allTasks, setAllTasks] = useState<GoalTaskVO[]>([]);
  const [loading, setLoading] = useState(false);

  // 加载所有目标的任务
  useEffect(() => {
    const loadAllTasks = async () => {
      setLoading(true);
      try {
        const taskPromises = goals.map(goal => 
          goalTaskApi.getTasksByGoalId(parseInt(goal.id)).catch(() => [])
        );
        const taskArrays = await Promise.all(taskPromises);
        const allTasksData = taskArrays.flat();
        setAllTasks(allTasksData);
      } catch (error) {
        console.error('Failed to load tasks:', error);
      } finally {
        setLoading(false);
      }
    };

    if (goals.length > 0) {
      loadAllTasks();
    }
  }, [goals]);

  // 复盘统计
  const reviewStats = useMemo(() => {
    const total = entries.length;
    const thisMonth = entries.filter(e => {
      const entryDate = new Date(e.date);
      const now = new Date();
      return entryDate.getMonth() === now.getMonth() && 
             entryDate.getFullYear() === now.getFullYear();
    }).length;
    const thisWeek = entries.filter(e => {
      const entryDate = new Date(e.date);
      const now = new Date();
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return entryDate >= weekAgo;
    }).length;
    const avgScore = total > 0 
      ? (entries.reduce((acc, e) => acc + (e.aiAnalysis?.sentimentScore || 0), 0) / total).toFixed(1)
      : '0';
    
    return { total, thisMonth, thisWeek, avgScore };
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
    const topCategories = Object.entries(categories)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3);
    
    return { total, topCategories };
  }, [knowledgePoints]);

  // 任务统计
  const taskStats = useMemo(() => {
    const total = allTasks.length;
    const completed = allTasks.filter(t => t.status === 'completed').length;
    const thisWeek = allTasks.filter(t => {
      const taskDate = new Date(t.taskDate);
      const now = new Date();
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return taskDate >= weekAgo;
    }).length;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    return { total, completed, thisWeek, completionRate };
  }, [allTasks]);

  // 最近活动
  const recentActivity = useMemo(() => {
    const activities: Array<{
      type: 'review' | 'goal' | 'knowledge' | 'task';
      title: string;
      date: Date;
      icon: React.ReactNode;
      color: string;
    }> = [];

    // 最近的复盘
    entries.slice(-5).forEach(entry => {
      activities.push({
        type: 'review',
        title: `复盘记录：${entry.framework}`,
        date: new Date(entry.date),
        icon: <Sparkles size={14} />,
        color: 'indigo'
      });
    });

    // 最近完成的目标
    goals.filter(g => g.status === 'completed')
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 3)
      .forEach(goal => {
        activities.push({
          type: 'goal',
          title: `完成目标：${goal.title}`,
          date: new Date(goal.updatedAt),
          icon: <CheckCircle2 size={14} />,
          color: 'green'
        });
      });

    // 最近的知识点
    knowledgePoints
      .sort((a, b) => new Date(b.updateTime || b.createTime || '').getTime() - new Date(a.updateTime || a.createTime || '').getTime())
      .slice(0, 3)
      .forEach(kp => {
        activities.push({
          type: 'knowledge',
          title: `新增知识点：${kp.title}`,
          date: new Date(kp.updateTime || kp.createTime || ''),
          icon: <BookOpen size={14} />,
          color: 'blue'
        });
      });

    return activities
      .sort((a, b) => b.date.getTime() - a.date.getTime())
      .slice(0, 8);
  }, [entries, goals, knowledgePoints]);

  return (
    <div className="space-y-4">
      {/* 主要统计卡片 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {/* 复盘统计 */}
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-3xl p-4 sm:p-5 border border-slate-200/50 dark:border-slate-700/50 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 rounded-2xl bg-indigo-100 dark:bg-indigo-900/30">
              <Sparkles size={18} className="text-indigo-600 dark:text-indigo-400" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-semibold text-slate-900 dark:text-slate-100 mb-1">
            {reviewStats.total}
          </div>
          <div className="text-xs text-slate-600 dark:text-slate-400 font-medium">复盘记录</div>
          <div className="mt-2 text-xs text-slate-500 dark:text-slate-500">
            本月 {reviewStats.thisMonth} 篇
          </div>
        </div>

        {/* 目标统计 */}
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-3xl p-4 sm:p-5 border border-slate-200/50 dark:border-slate-700/50 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 rounded-2xl bg-blue-100 dark:bg-blue-900/30">
              <Target size={18} className="text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-semibold text-slate-900 dark:text-slate-100 mb-1">
            {goalStats.total}
          </div>
          <div className="text-xs text-slate-600 dark:text-slate-400 font-medium">目标总数</div>
          <div className="mt-2 text-xs text-slate-500 dark:text-slate-500">
            {goalStats.active} 个进行中
          </div>
        </div>

        {/* 知识点统计 */}
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-3xl p-4 sm:p-5 border border-slate-200/50 dark:border-slate-700/50 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 rounded-2xl bg-purple-100 dark:bg-purple-900/30">
              <BookOpen size={18} className="text-purple-600 dark:text-purple-400" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-semibold text-slate-900 dark:text-slate-100 mb-1">
            {knowledgeStats.total}
          </div>
          <div className="text-xs text-slate-600 dark:text-slate-400 font-medium">知识点</div>
          <div className="mt-2 text-xs text-slate-500 dark:text-slate-500">
            {knowledgeStats.topCategories.length} 个分类
          </div>
        </div>

        {/* 任务统计 */}
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-3xl p-4 sm:p-5 border border-slate-200/50 dark:border-slate-700/50 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 rounded-2xl bg-green-100 dark:bg-green-900/30">
              <CheckCircle2 size={18} className="text-green-600 dark:text-green-400" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-semibold text-slate-900 dark:text-slate-100 mb-1">
            {taskStats.total}
          </div>
          <div className="text-xs text-slate-600 dark:text-slate-400 font-medium">任务总数</div>
          <div className="mt-2 text-xs text-slate-500 dark:text-slate-500">
            完成率 {taskStats.completionRate}%
          </div>
        </div>
      </div>

      {/* 详细统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 目标进度 */}
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-3xl p-5 sm:p-6 border border-slate-200/50 dark:border-slate-700/50 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={18} className="text-blue-600 dark:text-blue-400" />
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">目标进度</h3>
          </div>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-600 dark:text-slate-400">平均进度</span>
                <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">{goalStats.avgProgress}%</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2.5 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-blue-600 h-2.5 rounded-full transition-all duration-500"
                  style={{ width: `${goalStats.avgProgress}%` }}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="bg-blue-50/50 dark:bg-blue-900/10 rounded-2xl p-3">
                <div className="text-lg font-semibold text-blue-600 dark:text-blue-400">{goalStats.active}</div>
                <div className="text-xs text-slate-600 dark:text-slate-400 mt-1">进行中</div>
              </div>
              <div className="bg-green-50/50 dark:bg-green-900/10 rounded-2xl p-3">
                <div className="text-lg font-semibold text-green-600 dark:text-green-400">{goalStats.completed}</div>
                <div className="text-xs text-slate-600 dark:text-slate-400 mt-1">已完成</div>
              </div>
            </div>
          </div>
        </div>

        {/* 知识点分类 */}
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-3xl p-5 sm:p-6 border border-slate-200/50 dark:border-slate-700/50 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Network size={18} className="text-purple-600 dark:text-purple-400" />
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">知识点分类</h3>
          </div>
          <div className="space-y-3">
            {knowledgeStats.topCategories.length > 0 ? (
              knowledgeStats.topCategories.map(([category, count], idx) => (
                <div key={category} className="flex items-center gap-3">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm font-medium text-slate-900 dark:text-slate-100">{category}</span>
                      <span className="text-sm font-semibold text-slate-600 dark:text-slate-400">{count}</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-1.5 overflow-hidden">
                      <div 
                        className={`h-1.5 rounded-full transition-all duration-500 ${
                          idx === 0 ? 'bg-purple-500' : idx === 1 ? 'bg-purple-400' : 'bg-purple-300'
                        }`}
                        style={{ width: `${(count / knowledgeStats.total) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-4 text-slate-400 dark:text-slate-500 text-sm">
                暂无分类数据
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 最近活动 */}
      <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-3xl p-5 sm:p-6 border border-slate-200/50 dark:border-slate-700/50 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Activity size={18} className="text-slate-600 dark:text-slate-400" />
          <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">最近活动</h3>
        </div>
        <div className="space-y-3">
          {recentActivity.length > 0 ? (
            recentActivity.map((activity, idx) => {
              const getColorClasses = (color: string) => {
                switch (color) {
                  case 'indigo':
                    return {
                      bg: 'bg-indigo-100 dark:bg-indigo-900/30',
                      text: 'text-indigo-600 dark:text-indigo-400'
                    };
                  case 'green':
                    return {
                      bg: 'bg-green-100 dark:bg-green-900/30',
                      text: 'text-green-600 dark:text-green-400'
                    };
                  case 'blue':
                    return {
                      bg: 'bg-blue-100 dark:bg-blue-900/30',
                      text: 'text-blue-600 dark:text-blue-400'
                    };
                  case 'purple':
                    return {
                      bg: 'bg-purple-100 dark:bg-purple-900/30',
                      text: 'text-purple-600 dark:text-purple-400'
                    };
                  default:
                    return {
                      bg: 'bg-blue-100 dark:bg-blue-900/30',
                      text: 'text-blue-600 dark:text-blue-400'
                    };
                }
              };
              
              const colors = getColorClasses(activity.color);
              
              return (
              <div key={idx} className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50/50 dark:bg-slate-700/30 hover:bg-slate-100/50 dark:hover:bg-slate-700/50 transition-colors">
                <div className={`p-1.5 rounded-xl ${colors.bg} flex-shrink-0`}>
                  <div className={colors.text}>
                    {activity.icon}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
                    {activity.title}
                  </div>
                  <div className="flex items-center gap-1.5 mt-1 text-xs text-slate-500 dark:text-slate-400">
                    <Clock size={12} />
                    <span>
                      {activity.date.toLocaleDateString('zh-CN', { 
                        month: 'short', 
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                </div>
              </div>
              );
            })
          ) : (
            <div className="text-center py-8 text-slate-400 dark:text-slate-500 text-sm">
              暂无活动记录
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

