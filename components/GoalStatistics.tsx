import React, { useMemo, useState, useEffect } from 'react';
import { Target, TrendingUp, CheckCircle2, Clock, Calendar, BarChart3 } from 'lucide-react';
import { Goal } from '../types/goal';
import { goalTaskApi, GoalTaskVO } from '../services/goalTaskApi';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Area, AreaChart } from 'recharts';

interface GoalStatisticsProps {
  goals: Goal[];
}

export const GoalStatistics: React.FC<GoalStatisticsProps> = ({ goals }) => {
  const [allTasks, setAllTasks] = useState<GoalTaskVO[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<'all' | 'month' | 'week'>('all');

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

  // 基础统计
  const stats = useMemo(() => {
    const total = goals.length;
    const active = goals.filter(g => g.status === 'active').length;
    const completed = goals.filter(g => g.status === 'completed').length;
    const archived = goals.filter(g => g.status === 'archived').length;
    const avgProgress = total > 0
      ? Math.round(goals.reduce((acc, g) => acc + g.progress, 0) / total)
      : 0;
    
    // 按进度分组
    const progressGroups = {
      '0-25%': goals.filter(g => g.progress >= 0 && g.progress <= 25).length,
      '26-50%': goals.filter(g => g.progress > 25 && g.progress <= 50).length,
      '51-75%': goals.filter(g => g.progress > 50 && g.progress <= 75).length,
      '76-100%': goals.filter(g => g.progress > 75 && g.progress <= 100).length,
    };

    return { total, active, completed, archived, avgProgress, progressGroups };
  }, [goals]);

  // 任务统计
  const taskStats = useMemo(() => {
    const now = new Date();
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    let filteredTasks = allTasks;
    if (selectedPeriod === 'month') {
      filteredTasks = allTasks.filter(t => new Date(t.taskDate) >= monthAgo);
    } else if (selectedPeriod === 'week') {
      filteredTasks = allTasks.filter(t => new Date(t.taskDate) >= weekAgo);
    }

    const total = filteredTasks.length;
    const completed = filteredTasks.filter(t => t.status === 'completed').length;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    // 每日任务完成趋势
    const dailyStats: Record<string, { total: number; completed: number }> = {};
    filteredTasks.forEach(task => {
      const date = task.taskDate;
      if (!dailyStats[date]) {
        dailyStats[date] = { total: 0, completed: 0 };
      }
      dailyStats[date].total++;
      if (task.status === 'completed') {
        dailyStats[date].completed++;
      }
    });

    const trendData = Object.entries(dailyStats)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, stats]) => ({
        date: new Date(date).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' }),
        completed: stats.completed,
        total: stats.total,
        rate: stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0,
      }));

    return { total, completed, completionRate, trendData };
  }, [allTasks, selectedPeriod]);

  // 目标完成时间分析
  const completionAnalysis = useMemo(() => {
    const completedGoals = goals.filter(g => g.status === 'completed');
    if (completedGoals.length === 0) return null;

    const completionTimes = completedGoals.map(goal => {
      const created = new Date(goal.createdAt);
      const updated = new Date(goal.updatedAt);
      const days = Math.ceil((updated.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
      return days;
    });

    const avgDays = Math.round(completionTimes.reduce((a, b) => a + b, 0) / completionTimes.length);
    const minDays = Math.min(...completionTimes);
    const maxDays = Math.max(...completionTimes);

    return { avgDays, minDays, maxDays, count: completedGoals.length };
  }, [goals]);

  const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];

  return (
    <div className="space-y-6">
      {/* 统计卡片 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-900/20 dark:to-blue-800/10 rounded-2xl p-4 border border-blue-200/50 dark:border-blue-800/30">
          <div className="text-2xl font-semibold text-blue-600 dark:text-blue-400 mb-1">{stats.total}</div>
          <div className="text-xs text-slate-600 dark:text-slate-400 font-medium">目标总数</div>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-900/20 dark:to-green-800/10 rounded-2xl p-4 border border-green-200/50 dark:border-green-800/30">
          <div className="text-2xl font-semibold text-green-600 dark:text-green-400 mb-1">{stats.active}</div>
          <div className="text-xs text-slate-600 dark:text-slate-400 font-medium">进行中</div>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-900/20 dark:to-purple-800/10 rounded-2xl p-4 border border-purple-200/50 dark:border-purple-800/30">
          <div className="text-2xl font-semibold text-purple-600 dark:text-purple-400 mb-1">{stats.completed}</div>
          <div className="text-xs text-slate-600 dark:text-slate-400 font-medium">已完成</div>
        </div>
        <div className="bg-gradient-to-br from-amber-50 to-amber-100/50 dark:from-amber-900/20 dark:to-amber-800/10 rounded-2xl p-4 border border-amber-200/50 dark:border-amber-800/30">
          <div className="text-2xl font-semibold text-amber-600 dark:text-amber-400 mb-1">{stats.avgProgress}%</div>
          <div className="text-xs text-slate-600 dark:text-slate-400 font-medium">平均进度</div>
        </div>
      </div>

      {/* 目标状态分布 */}
      {(() => {
        // 只统计进行中和已完成，过滤掉已归档和0值
        const statusData = [
          { name: '进行中', value: stats.active },
          { name: '已完成', value: stats.completed },
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

      {/* 进度分布 */}
      <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-3xl p-6 border border-slate-200/50 dark:border-slate-700/50">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">进度分布</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={Object.entries(stats.progressGroups).map(([name, value]) => ({ name, value }))}>
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
            <Bar dataKey="value" fill="#6366f1" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* 任务统计 */}
      <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-3xl p-6 border border-slate-200/50 dark:border-slate-700/50">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">任务完成情况</h3>
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedPeriod('all')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                selectedPeriod === 'all'
                  ? 'bg-blue-500 text-white'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
              }`}
            >
              全部
            </button>
            <button
              onClick={() => setSelectedPeriod('month')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                selectedPeriod === 'month'
                  ? 'bg-blue-500 text-white'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
              }`}
            >
              本月
            </button>
            <button
              onClick={() => setSelectedPeriod('week')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                selectedPeriod === 'week'
                  ? 'bg-blue-500 text-white'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
              }`}
            >
              本周
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="bg-blue-50/50 dark:bg-blue-900/10 rounded-2xl p-4">
            <div className="text-2xl font-semibold text-blue-600 dark:text-blue-400">{taskStats.total}</div>
            <div className="text-xs text-slate-600 dark:text-slate-400 mt-1">任务总数</div>
          </div>
          <div className="bg-green-50/50 dark:bg-green-900/10 rounded-2xl p-4">
            <div className="text-2xl font-semibold text-green-600 dark:text-green-400">{taskStats.completed}</div>
            <div className="text-xs text-slate-600 dark:text-slate-400 mt-1">已完成</div>
          </div>
          <div className="bg-purple-50/50 dark:bg-purple-900/10 rounded-2xl p-4">
            <div className="text-2xl font-semibold text-purple-600 dark:text-purple-400">{taskStats.completionRate}%</div>
            <div className="text-xs text-slate-600 dark:text-slate-400 mt-1">完成率</div>
          </div>
        </div>

        {taskStats.trendData.length > 0 && (
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={taskStats.trendData}>
              <defs>
                <linearGradient id="colorTaskRate" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12, fill: '#64748b' }}
              />
              <YAxis 
                domain={[0, 100]} 
                tick={{ fontSize: 12, fill: '#64748b' }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#fff', 
                  borderRadius: '8px', 
                  border: '1px solid #e2e8f0',
                  fontSize: '12px'
                }}
              />
              <Area
                type="monotone"
                dataKey="rate"
                stroke="#6366f1"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorTaskRate)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* 完成时间分析 */}
      {completionAnalysis && (
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-3xl p-6 border border-slate-200/50 dark:border-slate-700/50">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">完成时间分析</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-900/20 dark:to-blue-800/10 rounded-2xl p-4 border border-blue-200/50 dark:border-blue-800/30">
              <div className="text-2xl font-semibold text-blue-600 dark:text-blue-400 mb-1">{completionAnalysis.avgDays}</div>
              <div className="text-xs text-slate-600 dark:text-slate-400 font-medium">平均天数</div>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-900/20 dark:to-green-800/10 rounded-2xl p-4 border border-green-200/50 dark:border-green-800/30">
              <div className="text-2xl font-semibold text-green-600 dark:text-green-400 mb-1">{completionAnalysis.minDays}</div>
              <div className="text-xs text-slate-600 dark:text-slate-400 font-medium">最快完成</div>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-900/20 dark:to-purple-800/10 rounded-2xl p-4 border border-purple-200/50 dark:border-purple-800/30">
              <div className="text-2xl font-semibold text-purple-600 dark:text-purple-400 mb-1">{completionAnalysis.maxDays}</div>
              <div className="text-xs text-slate-600 dark:text-slate-400 font-medium">最长完成</div>
            </div>
          </div>
        </div>
      )}

      {/* 空状态 */}
      {stats.total === 0 && (
        <div className="text-center py-16 bg-slate-50/50 dark:bg-slate-700/30 rounded-3xl border border-dashed border-slate-200 dark:border-slate-700">
          <Target size={48} className="mx-auto text-slate-300 dark:text-slate-600 mb-4" />
          <h3 className="text-slate-600 dark:text-slate-400 font-medium mb-1">暂无目标数据</h3>
          <p className="text-slate-400 dark:text-slate-500 text-sm">开始设定目标，追踪你的成长</p>
        </div>
      )}
    </div>
  );
};

