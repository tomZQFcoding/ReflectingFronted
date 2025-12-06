import React, { useMemo } from 'react';
import { TrendingUp, TrendingDown, Calendar, Target, Award, Flame, BarChart3, Activity, Clock } from 'lucide-react';
import { ReviewEntry } from '../types';

interface DataInsightsProps {
  entries: ReviewEntry[];
  goals: any[];
}

export const DataInsights: React.FC<DataInsightsProps> = ({ entries, goals }) => {
  // 计算最近7天的复盘趋势
  const recentTrend = useMemo(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return date.toISOString().split('T')[0];
    });

    const dailyCounts = last7Days.map(date => {
      return entries.filter(entry => entry.date === date).length;
    });

    const firstHalf = dailyCounts.slice(0, 3).reduce((a, b) => a + b, 0);
    const secondHalf = dailyCounts.slice(3).reduce((a, b) => a + b, 0);
    
    if (firstHalf === 0) return { trend: 'stable', percentage: 0 };
    const change = ((secondHalf - firstHalf) / firstHalf) * 100;
    
    return {
      trend: change > 10 ? 'up' : change < -10 ? 'down' : 'stable',
      percentage: Math.abs(Math.round(change))
    };
  }, [entries]);

  // 计算最活跃的时间段
  const activeTimeSlot = useMemo(() => {
    const timeSlots: Record<string, number> = {
      '早晨 (6-12)': 0,
      '下午 (12-18)': 0,
      '晚上 (18-24)': 0,
      '深夜 (0-6)': 0
    };

    entries.forEach(entry => {
      if (entry.createTime) {
        const hour = new Date(entry.createTime).getHours();
        if (hour >= 6 && hour < 12) timeSlots['早晨 (6-12)']++;
        else if (hour >= 12 && hour < 18) timeSlots['下午 (12-18)']++;
        else if (hour >= 18 && hour < 24) timeSlots['晚上 (18-24)']++;
        else timeSlots['深夜 (0-6)']++;
      }
    });

    const maxSlot = Object.entries(timeSlots).reduce((a, b) => 
      timeSlots[a[0]] > timeSlots[b[0]] ? a : b
    );

    return {
      slot: maxSlot[0],
      count: maxSlot[1],
      total: entries.length
    };
  }, [entries]);

  // 计算连续复盘天数
  const streakDays = useMemo(() => {
    if (entries.length === 0) return 0;
    
    const sortedDates = [...new Set(entries.map(e => e.date))].sort().reverse();
    let streak = 0;
    const today = new Date().toISOString().split('T')[0];
    let checkDate = today;

    for (const date of sortedDates) {
      if (date === checkDate || date === new Date(new Date(checkDate).getTime() - 86400000).toISOString().split('T')[0]) {
        streak++;
        checkDate = date;
      } else {
        break;
      }
    }

    return streak;
  }, [entries]);

  // 计算平均状态指数
  const avgSentiment = useMemo(() => {
    const sentiments = entries
      .filter(e => e.aiAnalysis?.sentimentScore !== undefined)
      .map(e => e.aiAnalysis!.sentimentScore);
    
    if (sentiments.length === 0) return null;
    return Math.round(sentiments.reduce((a, b) => a + b, 0) / sentiments.length);
  }, [entries]);

  // 计算目标完成率
  const goalCompletionRate = useMemo(() => {
    if (goals.length === 0) return null;
    const completed = goals.filter(g => g.status === 'completed').length;
    return Math.round((completed / goals.length) * 100);
  }, [goals]);

  // 最常用的标签
  const topTags = useMemo(() => {
    const tagCounts: Record<string, number> = {};
    entries.forEach(entry => {
      entry.tags?.forEach(tag => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    });

    return Object.entries(tagCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([tag, count]) => ({ tag, count }));
  }, [entries]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <BarChart3 size={20} className="text-blue-500" />
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">数据洞察</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* 复盘趋势 */}
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-3xl p-5 border border-slate-200/50 dark:border-slate-700/50">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              {recentTrend.trend === 'up' ? (
                <TrendingUp size={18} className="text-green-500" />
              ) : recentTrend.trend === 'down' ? (
                <TrendingDown size={18} className="text-red-500" />
              ) : (
                <Activity size={18} className="text-slate-400" />
              )}
              <span className="text-sm font-medium text-slate-600 dark:text-slate-400">复盘趋势</span>
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            {recentTrend.trend === 'up' && '+'}
            {recentTrend.trend !== 'stable' && `${recentTrend.percentage}%`}
            {recentTrend.trend === 'stable' && '稳定'}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">最近7天变化</div>
        </div>

        {/* 连续天数 */}
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-3xl p-5 border border-slate-200/50 dark:border-slate-700/50">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Flame size={18} className="text-orange-500" />
              <span className="text-sm font-medium text-slate-600 dark:text-slate-400">连续复盘</span>
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            {streakDays} 天
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">保持记录</div>
        </div>

        {/* 平均状态 */}
        {avgSentiment !== null && (
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-3xl p-5 border border-slate-200/50 dark:border-slate-700/50">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <TrendingUp size={18} className="text-blue-500" />
                <span className="text-sm font-medium text-slate-600 dark:text-slate-400">平均状态</span>
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {avgSentiment}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">状态指数</div>
          </div>
        )}

        {/* 活跃时段 */}
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-3xl p-5 border border-slate-200/50 dark:border-slate-700/50">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Clock size={18} className="text-purple-500" />
              <span className="text-sm font-medium text-slate-600 dark:text-slate-400">活跃时段</span>
            </div>
          </div>
          <div className="text-lg font-bold text-slate-900 dark:text-slate-100">
            {activeTimeSlot.slot}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {activeTimeSlot.count} 次复盘
          </div>
        </div>

        {/* 目标完成率 */}
        {goalCompletionRate !== null && (
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-3xl p-5 border border-slate-200/50 dark:border-slate-700/50">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Target size={18} className="text-indigo-500" />
                <span className="text-sm font-medium text-slate-600 dark:text-slate-400">目标完成</span>
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {goalCompletionRate}%
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {goals.filter(g => g.status === 'completed').length}/{goals.length} 已完成
            </div>
          </div>
        )}

        {/* 总复盘数 */}
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-3xl p-5 border border-slate-200/50 dark:border-slate-700/50">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Calendar size={18} className="text-green-500" />
              <span className="text-sm font-medium text-slate-600 dark:text-slate-400">总复盘数</span>
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            {entries.length}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">累计记录</div>
        </div>
      </div>

      {/* 热门标签 */}
      {topTags.length > 0 && (
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-3xl p-5 border border-slate-200/50 dark:border-slate-700/50">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-3">热门标签</h3>
          <div className="flex flex-wrap gap-2">
            {topTags.map(({ tag, count }) => (
              <div
                key={tag}
                className="px-3 py-1.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-medium"
              >
                {tag} <span className="text-blue-500 dark:text-blue-400">({count})</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

