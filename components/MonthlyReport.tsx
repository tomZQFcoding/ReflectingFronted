import React, { useMemo } from 'react';
import { Calendar, TrendingUp, BarChart3, Target, Award } from 'lucide-react';
import { ReviewEntry } from '../types';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface MonthlyReportProps {
  entries: ReviewEntry[];
  month: Date;
}

export const MonthlyReport: React.FC<MonthlyReportProps> = ({ entries, month }) => {
  const monthStart = new Date(month.getFullYear(), month.getMonth(), 1);
  const monthEnd = new Date(month.getFullYear(), month.getMonth() + 1, 0);

  const monthEntries = useMemo(() => {
    return entries.filter(entry => {
      const entryDate = new Date(entry.date);
      return entryDate >= monthStart && entryDate <= monthEnd;
    });
  }, [entries, monthStart, monthEnd]);

  const stats = useMemo(() => {
    const totalEntries = monthEntries.length;
    const avgScore = monthEntries.length > 0
      ? (monthEntries.reduce((sum, e) => sum + (e.aiAnalysis?.sentimentScore || 0), 0) / totalEntries).toFixed(1)
      : 0;
    
    const daysWithEntries = new Set(monthEntries.map(e => new Date(e.date).getDate())).size;
    const consistency = ((daysWithEntries / monthEnd.getDate()) * 100).toFixed(1);
    
    const frameworkCounts: Record<string, number> = {};
    monthEntries.forEach(e => {
      frameworkCounts[e.framework] = (frameworkCounts[e.framework] || 0) + 1;
    });
    const topFramework = Object.entries(frameworkCounts)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || '无';
    
    const tagCounts: Record<string, number> = {};
    monthEntries.forEach(e => {
      e.tags?.forEach(tag => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    });
    const topTags = Object.entries(tagCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([tag]) => tag);
    
    // 每日评分趋势
    const dailyScores: Record<number, number[]> = {};
    monthEntries.forEach(e => {
      const day = new Date(e.date).getDate();
      if (!dailyScores[day]) dailyScores[day] = [];
      if (e.aiAnalysis?.sentimentScore) {
        dailyScores[day].push(e.aiAnalysis.sentimentScore);
      }
    });
    const trendData = Array.from({ length: monthEnd.getDate() }, (_, i) => {
      const day = i + 1;
      const scores = dailyScores[day] || [];
      const avg = scores.length > 0
        ? scores.reduce((sum, s) => sum + s, 0) / scores.length
        : null;
      return {
        day: `${day}日`,
        score: avg,
        date: day,
      };
    }).filter(d => d.score !== null);

    return {
      totalEntries,
      avgScore: parseFloat(avgScore),
      consistency: parseFloat(consistency),
      topFramework,
      topTags,
      trendData,
      frameworkCounts,
    };
  }, [monthEntries, monthEnd]);

  const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-1">
            {month.getFullYear()}年{month.getMonth() + 1}月报告
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {monthStart.toLocaleDateString('zh-CN')} - {monthEnd.toLocaleDateString('zh-CN')}
          </p>
        </div>
        <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl">
          <Calendar size={24} className="text-white" />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 size={18} className="text-indigo-600 dark:text-indigo-400" />
            <span className="text-xs text-slate-500 dark:text-slate-400">复盘次数</span>
          </div>
          <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">{stats.totalEntries}</p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp size={18} className="text-emerald-600 dark:text-emerald-400" />
            <span className="text-xs text-slate-500 dark:text-slate-400">平均评分</span>
          </div>
          <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">{stats.avgScore}</p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2 mb-2">
            <Target size={18} className="text-purple-600 dark:text-purple-400" />
            <span className="text-xs text-slate-500 dark:text-slate-400">坚持度</span>
          </div>
          <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">{stats.consistency}%</p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2 mb-2">
            <Award size={18} className="text-amber-600 dark:text-amber-400" />
            <span className="text-xs text-slate-500 dark:text-slate-400">常用模型</span>
          </div>
          <p className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate">{stats.topFramework}</p>
        </div>
      </div>

      {/* Trend Chart */}
      {stats.trendData.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4">每日状态趋势</h3>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={stats.trendData}>
              <defs>
                <linearGradient id="colorScoreMonthly" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="day" 
                tick={{ fontSize: 12, fill: '#64748b' }}
                interval="preserveStartEnd"
              />
              <YAxis 
                domain={[0, 10]} 
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
                dataKey="score"
                stroke="#6366f1"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorScoreMonthly)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Framework Distribution */}
      {Object.keys(stats.frameworkCounts).length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4">模型使用分布</h3>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={Object.entries(stats.frameworkCounts).map(([name, value]) => ({ name, value }))}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {Object.entries(stats.frameworkCounts).map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Top Tags */}
          {stats.topTags.length > 0 && (
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4">高频标签</h3>
              <div className="flex flex-wrap gap-2">
                {stats.topTags.map((tag, index) => (
                  <span
                    key={tag}
                    className="px-3 py-1.5 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-lg text-sm font-medium"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Empty State */}
      {stats.totalEntries === 0 && (
        <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
          <Calendar size={48} className="mx-auto text-slate-300 dark:text-slate-600 mb-4" />
          <h3 className="text-slate-600 dark:text-slate-400 font-medium mb-1">本月暂无记录</h3>
          <p className="text-slate-400 dark:text-slate-500 text-xs">开始记录，生成你的月度报告</p>
        </div>
      )}
    </div>
  );
};

