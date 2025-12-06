import React, { useMemo, useState } from 'react';
import { Calendar, TrendingUp, BarChart3, Award, Target, ChevronLeft } from 'lucide-react';
import { ReviewEntry } from '../types';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, ComposedChart } from 'recharts';
import { FRAMEWORKS } from '../constants';

interface YearlyReportProps {
  entries: ReviewEntry[];
}

export const YearlyReport: React.FC<YearlyReportProps> = ({ entries }) => {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // 获取指定年份的复盘记录
  const yearEntries = useMemo(() => {
    return entries.filter(entry => {
      const entryDate = new Date(entry.date);
      return entryDate.getFullYear() === selectedYear;
    });
  }, [entries, selectedYear]);

  // 计算年度统计数据
  const stats = useMemo(() => {
    const totalEntries = yearEntries.length;
    const avgScore = totalEntries > 0
      ? (yearEntries.reduce((sum, e) => sum + (e.aiAnalysis?.sentimentScore || 0), 0) / totalEntries).toFixed(1)
      : 0;
    
    // 每月统计
    const monthlyStats: Record<number, { count: number; avgScore: number; totalScore: number }> = {};
    yearEntries.forEach(e => {
      const month = new Date(e.date).getMonth();
      if (!monthlyStats[month]) {
        monthlyStats[month] = { count: 0, avgScore: 0, totalScore: 0 };
      }
      monthlyStats[month].count++;
      if (e.aiAnalysis?.sentimentScore) {
        monthlyStats[month].totalScore += e.aiAnalysis.sentimentScore;
      }
    });
    
    const monthlyData = Array.from({ length: 12 }, (_, i) => {
      const month = monthlyStats[i];
      return {
        month: `${i + 1}月`,
        count: month?.count || 0,
        avgScore: month && month.count > 0 ? parseFloat((month.totalScore / month.count).toFixed(1)) : null,
      };
    });

    // 框架使用分布
    const frameworkCounts: Record<string, number> = {};
    yearEntries.forEach(e => {
      frameworkCounts[e.framework] = (frameworkCounts[e.framework] || 0) + 1;
    });

    // 标签统计
    const tagCounts: Record<string, number> = {};
    yearEntries.forEach(e => {
      e.tags?.forEach(tag => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    });
    const topTags = Object.entries(tagCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10);

    // 最佳月份（复盘次数最多）
    const bestMonth = monthlyData.reduce((best, current) => 
      current.count > best.count ? current : best
    , monthlyData[0]);

    // 坚持度（有记录的天数 / 总天数）
    const daysWithEntries = new Set(yearEntries.map(e => {
      const d = new Date(e.date);
      return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    })).size;
    const totalDays = new Date(selectedYear, 11, 31).getTime() - new Date(selectedYear, 0, 1).getTime();
    const daysInYear = Math.ceil(totalDays / (1000 * 60 * 60 * 24)) + 1;
    const consistency = ((daysWithEntries / daysInYear) * 100).toFixed(1);

    return {
      totalEntries,
      avgScore: parseFloat(avgScore),
      monthlyData,
      frameworkCounts,
      topTags,
      bestMonth: bestMonth.month,
      consistency: parseFloat(consistency),
      daysWithEntries,
    };
  }, [yearEntries, selectedYear]);

  const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4', '#f97316', '#84cc16'];

  return (
    <div className="space-y-6">
      {/* 年份选择器 */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">年度报告</h2>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSelectedYear(selectedYear - 1)}
            className="p-2 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
          >
            <ChevronLeft size={18} className="text-slate-600 dark:text-slate-400" />
          </button>
          <div className="px-4 py-2 bg-slate-50 dark:bg-slate-700 rounded-lg">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
              {selectedYear}年
            </span>
          </div>
          <button
            onClick={() => setSelectedYear(selectedYear + 1)}
            disabled={selectedYear >= new Date().getFullYear()}
            className="p-2 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft size={18} className="text-slate-600 dark:text-slate-400 rotate-180" />
          </button>
        </div>
      </div>

      {/* 年度统计卡片 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-900/20 dark:to-blue-800/10 rounded-2xl p-4 border border-blue-200/50 dark:border-blue-800/30">
          <div className="text-2xl font-semibold text-blue-600 dark:text-blue-400 mb-1">{stats.totalEntries}</div>
          <div className="text-xs text-slate-600 dark:text-slate-400 font-medium">总复盘次数</div>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-900/20 dark:to-green-800/10 rounded-2xl p-4 border border-green-200/50 dark:border-green-800/30">
          <div className="text-2xl font-semibold text-green-600 dark:text-green-400 mb-1">{stats.avgScore}</div>
          <div className="text-xs text-slate-600 dark:text-slate-400 font-medium">年度平均分</div>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-900/20 dark:to-purple-800/10 rounded-2xl p-4 border border-purple-200/50 dark:border-purple-800/30">
          <div className="text-2xl font-semibold text-purple-600 dark:text-purple-400 mb-1">{stats.consistency}%</div>
          <div className="text-xs text-slate-600 dark:text-slate-400 font-medium">坚持度</div>
        </div>
        <div className="bg-gradient-to-br from-amber-50 to-amber-100/50 dark:from-amber-900/20 dark:to-amber-800/10 rounded-2xl p-4 border border-amber-200/50 dark:border-amber-800/30">
          <div className="text-2xl font-semibold text-amber-600 dark:text-amber-400 mb-1">{stats.bestMonth}</div>
          <div className="text-xs text-slate-600 dark:text-slate-400 font-medium">最佳月份</div>
        </div>
      </div>

      {/* 月度趋势图 */}
      {stats.monthlyData.some(m => m.count > 0) && (
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-3xl p-6 border border-slate-200/50 dark:border-slate-700/50">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">月度复盘趋势</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={stats.monthlyData}>
              <XAxis 
                dataKey="month" 
                tick={{ fontSize: 12, fill: '#64748b' }}
              />
              <YAxis 
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
              <Bar dataKey="count" fill="#6366f1" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* 月度评分趋势 */}
      {stats.monthlyData.some(m => m.avgScore !== null) && (
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-3xl p-6 border border-slate-200/50 dark:border-slate-700/50">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">月度平均评分趋势</h3>
          <ResponsiveContainer width="100%" height={250}>
            <ComposedChart data={stats.monthlyData.filter(m => m.avgScore !== null)}>
              <defs>
                <linearGradient id="colorYearlyScore" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="month" 
                tick={{ fontSize: 12, fill: '#64748b' }}
              />
              <YAxis 
                yAxisId="left"
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
                yAxisId="left"
                type="monotone"
                dataKey="avgScore"
                stroke="#6366f1"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorYearlyScore)"
              />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="avgScore"
                stroke="#6366f1"
                strokeWidth={3}
                dot={{ fill: '#6366f1', r: 5 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* 框架使用分布和标签统计 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 框架使用分布 */}
        {Object.keys(stats.frameworkCounts).length > 0 && (
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-3xl p-6 border border-slate-200/50 dark:border-slate-700/50">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">模型使用分布</h3>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={Object.entries(stats.frameworkCounts).map(([name, value]) => ({ 
                    name: FRAMEWORKS[name as keyof typeof FRAMEWORKS]?.label || name, 
                    value 
                  }))}
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
        )}

        {/* 高频标签 */}
        {stats.topTags.length > 0 && (
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-3xl p-6 border border-slate-200/50 dark:border-slate-700/50">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">年度高频标签</h3>
            <div className="flex flex-wrap gap-2">
              {stats.topTags.map(([tag, count], index) => (
                <span
                  key={tag}
                  className={`px-3 py-1.5 rounded-xl text-sm font-medium border ${
                    index < 3
                      ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-600'
                  }`}
                >
                  {tag} <span className="opacity-60">({count})</span>
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 空状态 */}
      {stats.totalEntries === 0 && (
        <div className="text-center py-16 bg-slate-50/50 dark:bg-slate-700/30 rounded-3xl border border-dashed border-slate-200 dark:border-slate-700">
          <Calendar size={48} className="mx-auto text-slate-300 dark:text-slate-600 mb-4" />
          <h3 className="text-slate-600 dark:text-slate-400 font-medium mb-1">本年度暂无记录</h3>
          <p className="text-slate-400 dark:text-slate-500 text-sm">开始记录，生成你的年度报告</p>
        </div>
      )}
    </div>
  );
};

