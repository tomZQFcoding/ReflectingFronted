import React, { useMemo } from 'react';
import { AreaChart, Area, Tooltip, ResponsiveContainer } from 'recharts';
import { ReviewEntry, FrameworkType } from '../types';
import { FRAMEWORKS } from '../constants';
import { Tag, PieChart, Activity } from 'lucide-react';

interface StatsProps {
  entries: ReviewEntry[];
}

export const Stats: React.FC<StatsProps> = ({ entries }) => {
  
  const data = useMemo(() => {
    // Sort entries by date ascending
    const sorted = [...entries].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    // Take last 14 entries for the sparkline
    return sorted.slice(-14).map(e => ({
      date: new Date(e.date).toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric' }),
      score: e.aiAnalysis?.sentimentScore || 0
    }));
  }, [entries]);

  const averageScore = useMemo(() => {
    if (entries.length === 0) return 0;
    const total = entries.reduce((acc, curr) => acc + (curr.aiAnalysis?.sentimentScore || 0), 0);
    return (total / entries.length).toFixed(1);
  }, [entries]);

  // Framework Usage Calculation
  const frameworkUsage = useMemo(() => {
    const usage: Record<string, number> = {};
    entries.forEach(e => {
        usage[e.framework] = (usage[e.framework] || 0) + 1;
    });
    // Sort by usage count desc
    return Object.entries(usage)
        .sort(([,a], [,b]) => b - a)
        .map(([key, count]) => ({
            key: key as FrameworkType,
            label: FRAMEWORKS[key as FrameworkType]?.label || key,
            count
        }));
  }, [entries]);

  // Tag Cloud Calculation
  const topTags = useMemo(() => {
      const tagCounts: Record<string, number> = {};
      entries.forEach(e => {
          if (e.tags) {
              e.tags.forEach(t => {
                  tagCounts[t] = (tagCounts[t] || 0) + 1;
              });
          }
      });
      return Object.entries(tagCounts)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 8); // Top 8 tags
  }, [entries]);

  return (
    <div className="space-y-6 mb-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Stat 1: Total Reviews */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] flex flex-col justify-between hover:shadow-lg transition-shadow duration-300">
            <div>
            <p className="text-sm font-medium text-slate-500 tracking-wide">累计复盘 (篇)</p>
            <p className="text-4xl font-bold text-slate-800 mt-2">{entries.length}</p>
            </div>
            <div className="mt-4 text-xs text-slate-400 font-medium bg-slate-50 inline-block px-2 py-1 rounded w-fit">
                持续记录，看见改变
            </div>
        </div>

        {/* Stat 2: Average Sentiment */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] flex flex-col justify-between hover:shadow-lg transition-shadow duration-300">
            <div>
            <p className="text-sm font-medium text-slate-500 tracking-wide">平均状态指数</p>
            <div className="flex items-end gap-2 mt-2">
                <p className="text-4xl font-bold text-indigo-600">{averageScore}</p>
                <span className="text-sm text-slate-400 mb-1.5 font-medium">/ 10</span>
            </div>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2 mt-4 overflow-hidden">
                <div 
                className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full transition-all duration-1000 ease-out" 
                style={{ width: `${(Number(averageScore) / 10) * 100}%` }}
                ></div>
            </div>
        </div>

        {/* Stat 3: Mood Trend Chart */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] relative overflow-hidden flex flex-col hover:shadow-lg transition-shadow duration-300">
            <p className="text-sm font-medium text-slate-500 tracking-wide mb-2 relative z-10">情绪走势</p>
            <div className="flex-1 min-h-[60px] relative">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                <defs>
                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                </defs>
                <Tooltip 
                    contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', fontSize: '12px' }} 
                    itemStyle={{ color: '#4f46e5' }}
                    cursor={{ stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '4 4' }}
                />
                <Area type="monotone" dataKey="score" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorScore)" />
                </AreaChart>
            </ResponsiveContainer>
            </div>
        </div>
      </div>
      
      {/* Analytics Section: Frameworks & Tags */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Framework Distribution */}
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)]">
             <h3 className="font-bold text-slate-800 mb-4 flex items-center text-sm">
                <PieChart className="mr-2 text-indigo-500" size={16} /> 模型偏好
             </h3>
             <div className="space-y-3">
                 {frameworkUsage.length > 0 ? (
                     frameworkUsage.map((item, idx) => (
                         <div key={item.key} className="flex items-center text-sm">
                             <div className="w-24 text-slate-500 font-medium truncate">{item.label}</div>
                             <div className="flex-1 mx-3 h-2 bg-slate-50 rounded-full overflow-hidden">
                                 <div 
                                    className={`h-full rounded-full ${idx === 0 ? 'bg-indigo-500' : 'bg-slate-300'}`}
                                    style={{ width: `${(item.count / entries.length) * 100}%` }}
                                 ></div>
                             </div>
                             <div className="text-slate-700 font-mono font-bold">{item.count}</div>
                         </div>
                     ))
                 ) : (
                     <p className="text-slate-400 text-xs text-center py-4">暂无数据</p>
                 )}
             </div>
          </div>

          {/* Tag Cloud */}
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)]">
             <h3 className="font-bold text-slate-800 mb-4 flex items-center text-sm">
                <Activity className="mr-2 text-rose-500" size={16} /> 高频词 / 标签
             </h3>
             <div className="flex flex-wrap gap-2">
                 {topTags.length > 0 ? (
                     topTags.map(([tag, count], idx) => (
                         <span 
                            key={tag} 
                            className={`
                                px-3 py-1.5 rounded-lg text-xs font-medium border flex items-center
                                ${idx === 0 
                                    ? 'bg-rose-50 text-rose-600 border-rose-100' 
                                    : idx < 3 
                                        ? 'bg-indigo-50 text-indigo-600 border-indigo-100'
                                        : 'bg-slate-50 text-slate-500 border-slate-100'
                                }
                            `}
                         >
                             <Tag size={10} className="mr-1.5 opacity-50"/> 
                             {tag}
                             <span className="ml-1.5 opacity-40 text-[10px]">{count}</span>
                         </span>
                     ))
                 ) : (
                     <p className="text-slate-400 text-xs text-center w-full py-4">添加标签后在此显示</p>
                 )}
             </div>
          </div>
      </div>
    </div>
  );
};
