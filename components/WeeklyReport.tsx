import React, { useEffect, useMemo, useState } from 'react';
import { Calendar, TrendingUp, BarChart3, Sparkles, Clock, ChevronLeft } from 'lucide-react';
import { ReviewEntry, WeeklyAnalysisResult, AIModel } from '../types';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { generateWeeklyReport, checkModelApiKey } from '../services/aiService';
import { weeklyReportApi } from '../services/weeklyReportApi';
import { AlertDialog } from './AlertDialog';

interface WeeklyReportProps {
  entries: ReviewEntry[];
  selectedModel: AIModel;
}

export const WeeklyReport: React.FC<WeeklyReportProps> = ({ entries, selectedModel }) => {
  // 强制使用智谱AI生成周报
  const weeklyReportModel = AIModel.ZHIPU_GLM45;
  const [selectedWeek, setSelectedWeek] = useState(new Date());
  const [weeklyReport, setWeeklyReport] = useState<WeeklyAnalysisResult | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [alertDialog, setAlertDialog] = useState<{isOpen: boolean, title: string, message: string, type?: 'success' | 'error' | 'warning' | 'info'}>({
    isOpen: false,
    title: '',
    message: '',
    type: 'info',
  });

  // 计算当前周的开始和结束日期
  const getWeekRange = (date: Date) => {
    const start = new Date(date);
    const day = start.getDay();
    const diff = start.getDate() - day + (day === 0 ? -6 : 1); // 周一开始
    start.setDate(diff);
    start.setHours(0, 0, 0, 0);
    
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    end.setHours(23, 59, 59, 999);
    
    return { start, end };
  };

  const { start: weekStart, end: weekEnd } = getWeekRange(selectedWeek);

  // 加载已保存的周报（当前周或最近一条）
  useEffect(() => {
    const loadSavedReport = async () => {
      try {
        const list = await weeklyReportApi.listMyWeeklyReports();
        if (!list || list.length === 0) {
          setWeeklyReport(null);
          return;
        }

        const startKey = weekStart.toISOString().slice(0, 10);
        const endKey = weekEnd.toISOString().slice(0, 10);

        const match = list.find(
          (r) =>
            r.startDate.slice(0, 10) === startKey &&
            r.endDate.slice(0, 10) === endKey
        );

        const target = match || list[0]; // 当前周匹配不到则显示最近一条
        if (!target) {
          setWeeklyReport(null);
          return;
        }

        let keywords: string[] = [];
        try {
          keywords = JSON.parse(target.keywords || '[]');
        } catch (e) {
          console.error('Failed to parse weekly report keywords', e);
        }

        setWeeklyReport({
          dateRange: target.dateRange,
          keywords,
          emotionalTrend: target.emotionalTrend,
          growthFocus: target.growthFocus,
          suggestion: target.suggestion,
        });
      } catch (error) {
        console.error('Failed to load saved weekly reports:', error);
      }
    };

    loadSavedReport();
  // 仅在选中周变化时加载，避免因 weekStart/weekEnd 引用变动导致重复请求
  }, [selectedWeek]);

  // 获取本周的复盘记录
  const weekEntries = useMemo(() => {
    return entries.filter(entry => {
      const entryDate = new Date(entry.date);
      return entryDate >= weekStart && entryDate <= weekEnd;
    });
  }, [entries, weekStart, weekEnd]);

  // 生成周报 - 使用智谱AI
  const handleGenerateReport = async () => {
    if (!checkModelApiKey(weeklyReportModel)) {
      setAlertDialog({
        isOpen: true,
        title: '配置缺失',
        message: '请先配置智谱AI的API Key',
        type: 'warning',
      });
      return;
    }

    if (weekEntries.length < 3) {
      setAlertDialog({
        isOpen: true,
        title: '记录不足',
        message: '本周复盘记录不足3条，无法生成周报',
        type: 'warning',
      });
      return;
    }

    setIsGenerating(true);
    try {
      const result = await generateWeeklyReport(weeklyReportModel, weekEntries);
      setWeeklyReport(result);
      // 自动保存，覆盖同一时间范围内的周报
      await weeklyReportApi.saveWeeklyReport(result, weekStart, weekEnd);
    } catch (error) {
      console.error('Failed to generate weekly report:', error);
      setAlertDialog({
        isOpen: true,
        title: '生成失败',
        message: '生成周报失败，请重试',
        type: 'error',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // 计算统计数据
  const { stats, trendData } = useMemo(() => {
    const totalEntries = weekEntries.length;
    const avgScore = totalEntries > 0
      ? (weekEntries.reduce((sum, e) => sum + (e.aiAnalysis?.sentimentScore || 0), 0) / totalEntries).toFixed(1)
      : 0;
    
    const daysWithEntries = new Set(weekEntries.map(e => new Date(e.date).getDate())).size;
    const consistency = ((daysWithEntries / 7) * 100).toFixed(1);
    
    // 每日评分数据
    const dailyScores: Record<number, number[]> = {};
    weekEntries.forEach(e => {
      const entryDate = new Date(e.date);
      const dayOfWeek = entryDate.getDay() || 7; // 0=周日，转换为1-7 (周一到周日)
      const day = dayOfWeek === 0 ? 7 : dayOfWeek;
      if (!dailyScores[day]) dailyScores[day] = [];
      if (e.aiAnalysis?.sentimentScore) {
        dailyScores[day].push(e.aiAnalysis.sentimentScore);
      }
    });
    
    const trendDataArray = Array.from({ length: 7 }, (_, i) => {
      const day = i + 1;
      const scores = dailyScores[day] || [];
      const avg = scores.length > 0
        ? scores.reduce((sum, s) => sum + s, 0) / scores.length
        : null;
      return {
        day: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'][i],
        score: avg,
        date: day,
      };
    }).filter(d => d.score !== null);

    return {
      stats: {
        totalEntries,
        avgScore: parseFloat(avgScore),
        consistency: parseFloat(consistency),
        daysWithEntries,
      },
      trendData: trendDataArray,
    };
  }, [weekEntries]);

  // 切换到上一周/下一周
  const changeWeek = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedWeek);
    newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
    setSelectedWeek(newDate);
    setWeeklyReport(null); // 切换周时清除报告
  };

  // 保存周报
  const handleSaveReport = async () => {
    if (!weeklyReport) return;
    
    setIsSaving(true);
    try {
      await weeklyReportApi.saveWeeklyReport(weeklyReport, weekStart, weekEnd);
      setAlertDialog({
        isOpen: true,
        title: '保存成功',
        message: '周报已保存成功！',
        type: 'success',
      });
    } catch (error) {
      console.error('Failed to save weekly report:', error);
      setAlertDialog({
        isOpen: true,
        title: '保存失败',
        message: '保存周报失败，请重试',
        type: 'error',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const weekRangeStr = `${weekStart.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })} - ${weekEnd.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })}`;

  return (
    <div className="space-y-6">
      {/* 提示弹窗 */}
      <AlertDialog
        isOpen={alertDialog.isOpen}
        title={alertDialog.title}
        message={alertDialog.message}
        type={alertDialog.type}
        onClose={() => setAlertDialog({ ...alertDialog, isOpen: false })}
      />
      {/* 周选择器和生成按钮 */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => changeWeek('prev')}
            className="p-2 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
          >
            <ChevronLeft size={18} className="text-slate-600 dark:text-slate-400" />
          </button>
          <div className="px-4 py-2 bg-slate-50 dark:bg-slate-700 rounded-lg">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
              {weekRangeStr}
            </span>
          </div>
          <button
            onClick={() => changeWeek('next')}
            className="p-2 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
          >
            <ChevronLeft size={18} className="text-slate-600 dark:text-slate-400 rotate-180" />
          </button>
        </div>
        <button
          onClick={handleGenerateReport}
          disabled={isGenerating || weekEntries.length < 3}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-xl shadow-sm transition-all active:scale-95"
        >
          {isGenerating ? (
            <>
              <div className="animate-spin"><Sparkles size={16} /></div>
              <span>生成中...</span>
            </>
          ) : (
            <>
              <Sparkles size={16} />
              <span>生成AI周报</span>
            </>
          )}
        </button>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-900/20 dark:to-blue-800/10 rounded-2xl p-4 border border-blue-200/50 dark:border-blue-800/30">
          <div className="text-2xl font-semibold text-blue-600 dark:text-blue-400 mb-1">{stats.totalEntries}</div>
          <div className="text-xs text-slate-600 dark:text-slate-400 font-medium">复盘次数</div>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-900/20 dark:to-green-800/10 rounded-2xl p-4 border border-green-200/50 dark:border-green-800/30">
          <div className="text-2xl font-semibold text-green-600 dark:text-green-400 mb-1">{stats.avgScore}</div>
          <div className="text-xs text-slate-600 dark:text-slate-400 font-medium">平均评分</div>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-900/20 dark:to-purple-800/10 rounded-2xl p-4 border border-purple-200/50 dark:border-purple-800/30">
          <div className="text-2xl font-semibold text-purple-600 dark:text-purple-400 mb-1">{stats.consistency}%</div>
          <div className="text-xs text-slate-600 dark:text-slate-400 font-medium">坚持度</div>
        </div>
        <div className="bg-gradient-to-br from-amber-50 to-amber-100/50 dark:from-amber-900/20 dark:to-amber-800/10 rounded-2xl p-4 border border-amber-200/50 dark:border-amber-800/30">
          <div className="text-2xl font-semibold text-amber-600 dark:text-amber-400 mb-1">{stats.daysWithEntries}</div>
          <div className="text-xs text-slate-600 dark:text-slate-400 font-medium">有记录天数</div>
        </div>
      </div>

      {/* 趋势图表 */}
      {trendData.length > 0 && (
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-3xl p-6 border border-slate-200/50 dark:border-slate-700/50">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">本周状态趋势</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={trendData}>
              <defs>
                <linearGradient id="colorScoreWeekly" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="day" 
                tick={{ fontSize: 12, fill: '#64748b' }}
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
                stroke="#3b82f6"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorScoreWeekly)"
              />
              <Line
                type="monotone"
                dataKey="score"
                stroke="#3b82f6"
                strokeWidth={3}
                dot={{ fill: '#3b82f6', r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* AI生成的周报 */}
      {weeklyReport ? (
        <div className="space-y-4">
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-3xl p-6 border border-indigo-200/50 dark:border-indigo-800/30">
            <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-xs uppercase mb-3">
              <Sparkles size={14} /> AI智能分析
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">{weeklyReport.dateRange}</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="bg-white/80 dark:bg-slate-800/80 rounded-2xl p-4 border border-indigo-100 dark:border-indigo-800/30">
                <h4 className="font-semibold text-indigo-900 dark:text-indigo-300 mb-2 text-sm">关键词</h4>
                <div className="flex flex-wrap gap-2">
                  {weeklyReport.keywords.map(k => (
                    <span key={k} className="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 px-2 py-1 rounded-lg text-xs font-medium">
                      {k}
                    </span>
                  ))}
                </div>
              </div>
              <div className="bg-white/80 dark:bg-slate-800/80 rounded-2xl p-4 border border-purple-100 dark:border-purple-800/30">
                <h4 className="font-semibold text-purple-900 dark:text-purple-300 mb-2 text-sm">情绪趋势</h4>
                <p className="text-purple-800 dark:text-purple-200 text-sm leading-relaxed">{weeklyReport.emotionalTrend}</p>
              </div>
            </div>

            <div className="mt-4 bg-white/80 dark:bg-slate-800/80 rounded-2xl p-4 border border-rose-100 dark:border-rose-800/30">
              <h4 className="font-semibold text-rose-900 dark:text-rose-300 mb-2 text-sm flex items-center gap-2">
                <TrendingUp size={14} /> 成长聚焦
              </h4>
              <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed">{weeklyReport.growthFocus}</p>
            </div>

            <div className="mt-4 bg-gradient-to-r from-slate-800 to-slate-900 dark:from-slate-700 dark:to-slate-800 rounded-2xl p-5 text-white">
              <h4 className="font-semibold text-indigo-200 text-xs uppercase mb-2">教练建议</h4>
              <p className="font-medium leading-relaxed text-base">"{weeklyReport.suggestion}"</p>
            </div>

          </div>
        </div>
      ) : weekEntries.length >= 3 && (
        <div className="text-center py-12 bg-slate-50/50 dark:bg-slate-700/30 rounded-3xl border border-dashed border-slate-200 dark:border-slate-700">
          <Sparkles size={48} className="mx-auto text-slate-300 dark:text-slate-600 mb-4" />
          <h3 className="text-slate-600 dark:text-slate-400 font-medium mb-2">点击"生成AI周报"获取智能分析</h3>
          <p className="text-slate-400 dark:text-slate-500 text-sm">基于本周复盘记录生成个性化报告</p>
        </div>
      )}

      {/* 空状态 */}
      {weekEntries.length === 0 && (
        <div className="text-center py-16 bg-slate-50/50 dark:bg-slate-700/30 rounded-3xl border border-dashed border-slate-200 dark:border-slate-700">
          <Calendar size={48} className="mx-auto text-slate-300 dark:text-slate-600 mb-4" />
          <h3 className="text-slate-600 dark:text-slate-400 font-medium mb-1">本周暂无记录</h3>
          <p className="text-slate-400 dark:text-slate-500 text-sm">开始记录，生成你的周报</p>
        </div>
      )}
    </div>
  );
};

