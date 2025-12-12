import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  ChevronLeft,
  Search,
  X,
  LayoutGrid,
  Calendar as CalendarIcon,
  History,
  Sparkles,
  BarChart3,
  Quote,
  Clock,
  Settings,
  Download,
  Upload,
  Bell,
  BellOff
} from 'lucide-react';
import { ReviewEntry, FrameworkType, WeeklyAnalysisResult } from '../types';
import { FRAMEWORKS } from '../constants';
import { Button } from './Button';
import { Stats } from './Stats';
import { HabitTracker } from './HabitTracker';
import { EntryCard } from './EntryCard';
import { CalendarView } from './CalendarView';
import { AdvancedSearch, SearchFilters } from './AdvancedSearch';
import { ThemeToggle } from './ThemeToggle';
import { exportToMarkdown, exportToImage, downloadFile } from '../utils/exportUtils';
import { generateWeeklyReport } from '../services/aiService';
import { weeklyReportApi } from '../services/weeklyReportApi';
import { AlertDialog } from './AlertDialog';

interface ReviewDashboardProps {
  entries: ReviewEntry[];
  isLoadingEntries: boolean;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  frameworkFilter: FrameworkType | 'ALL';
  setFrameworkFilter: (filter: FrameworkType | 'ALL') => void;
  calendarMonth: Date;
  setCalendarMonth: (month: Date) => void;
  dashboardMode: 'LIST' | 'CALENDAR';
  setDashboardMode: (mode: 'LIST' | 'CALENDAR') => void;
  searchFilters: SearchFilters | null;
  setSearchFilters: (filters: SearchFilters | null) => void;
  showSettings: boolean;
  setShowSettings: (show: boolean) => void;
  showWeeklyReport: boolean;
  setShowWeeklyReport: (show: boolean) => void;
  notificationsEnabled: boolean;
  handleToggleNotifications: () => void;
  handleStartNew: () => void;
  handleCalendarDateClick: (date: Date) => void;
  handleExportData: () => void;
  handleExportMarkdown: () => void;
  handleImportData: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleGenerateWeeklyReport: () => Promise<void>;
  onEntryClick: (entry: ReviewEntry) => void;
  onBack: () => void;
  greeting: string;
  dailyQuote: { text: string; author?: string };
  randomMemory: ReviewEntry | null;
  weeklyReport: WeeklyAnalysisResult | null;
  isGeneratingReport: boolean;
  triggerToast?: (msg: string, type?: 'success' | 'error') => void;
}

export const ReviewDashboard: React.FC<ReviewDashboardProps> = ({
  entries,
  isLoadingEntries,
  searchQuery,
  setSearchQuery,
  frameworkFilter,
  setFrameworkFilter,
  calendarMonth,
  setCalendarMonth,
  dashboardMode,
  setDashboardMode,
  searchFilters,
  setSearchFilters,
  showSettings,
  setShowSettings,
  showWeeklyReport,
  setShowWeeklyReport,
  notificationsEnabled,
  handleToggleNotifications,
  handleStartNew,
  handleCalendarDateClick,
  handleExportData,
  handleExportMarkdown,
  handleImportData,
  handleGenerateWeeklyReport,
  onEntryClick,
  onBack,
  greeting,
  dailyQuote,
  randomMemory,
  weeklyReport,
  isGeneratingReport,
  triggerToast,
}) => {
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [isSavingReport, setIsSavingReport] = useState(false);
  const [alertDialog, setAlertDialog] = useState<{isOpen: boolean, title: string, message: string, type?: 'success' | 'error' | 'warning' | 'info'}>({
    isOpen: false,
    title: '',
    message: '',
    type: 'info',
  });
  const availableTags = useMemo(() => {
    const set = new Set<string>();
    entries.forEach(e => e.tags?.forEach(t => set.add(t)));
    return Array.from(set);
  }, [entries]);

  // 保存周报
  const handleSaveWeeklyReport = async () => {
    if (!weeklyReport) return;
    
    setIsSavingReport(true);
    try {
      // 计算开始和结束日期（最近7天）
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 6);
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(23, 59, 59, 999);

      await weeklyReportApi.saveWeeklyReport(weeklyReport, startDate, endDate);
      if (triggerToast) {
        triggerToast('周报已保存成功！');
      } else {
        setAlertDialog({
          isOpen: true,
          title: '保存成功',
          message: '周报已保存成功！',
          type: 'success',
        });
      }
    } catch (error) {
      console.error('Failed to save weekly report:', error);
      if (triggerToast) {
        triggerToast('保存周报失败，请重试', 'error');
      } else {
        setAlertDialog({
          isOpen: true,
          title: '保存失败',
          message: '保存周报失败，请重试',
          type: 'error',
        });
      }
    } finally {
      setIsSavingReport(false);
    }
  };

  // 过滤复盘记录
  const filteredEntries = useMemo(() => {
    let filtered = [...entries];

    // 框架筛选
    if (frameworkFilter !== 'ALL') {
      filtered = filtered.filter(e => e.framework === frameworkFilter);
    }

    // 搜索查询
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
    // 将复盘内容对象拼成单个字符串用于搜索
    const matchesContent = (contentObj: ReviewEntry['content']) => {
      if (!contentObj) return false;
      const combined = Object.values(contentObj).join(' ').toLowerCase();
      return combined.includes(query);
    };
      filtered = filtered.filter(e => 
      matchesContent(e.content) ||
      e.tags?.some(tag => tag.toLowerCase().includes(query)) ||
        FRAMEWORKS[e.framework].label.toLowerCase().includes(query)
      );
    }

    // 高级搜索筛选
    if (searchFilters) {
      if (searchFilters.dateFrom) {
        filtered = filtered.filter(e => new Date(e.date) >= new Date(searchFilters.dateFrom!));
      }
      if (searchFilters.dateTo) {
        filtered = filtered.filter(e => new Date(e.date) <= new Date(searchFilters.dateTo!));
      }
      if (searchFilters.minScore !== undefined) {
        filtered = filtered.filter(e => (e.aiAnalysis?.sentimentScore || 0) >= searchFilters.minScore!);
      }
      if (searchFilters.maxScore !== undefined) {
        filtered = filtered.filter(e => (e.aiAnalysis?.sentimentScore || 0) <= searchFilters.maxScore!);
      }
      if (searchFilters.tags && searchFilters.tags.length > 0) {
        filtered = filtered.filter(e => 
          e.tags && searchFilters.tags!.some(tag => e.tags!.includes(tag))
        );
      }
    }

    return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [entries, frameworkFilter, searchQuery, searchFilters]);

  return (
    <div className="max-w-6xl mx-auto px-6 py-10 relative">
      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-slate-900/20 dark:bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowSettings(false)}>
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-6 max-w-sm w-full animate-in fade-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center"><Settings className="mr-2" size={18}/> 设置</h3>
                
                <div className="space-y-3">
                    {/* Theme Toggle */}
                    <div className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
                        <div className="flex items-center gap-2 font-medium text-sm text-slate-700 dark:text-slate-300">
                            <Settings size={18} />
                            主题模式
                        </div>
                        <ThemeToggle />
                    </div>
                    
                    {/* Notification Toggle */}
                    <button 
                        onClick={handleToggleNotifications}
                        className={`w-full flex items-center justify-between p-3 rounded-xl border transition-colors ${notificationsEnabled ? 'bg-indigo-50 dark:bg-indigo-900/30 border-indigo-100 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300' : 'bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'}`}
                    >
                        <div className="flex items-center gap-2 font-medium text-sm">
                            {notificationsEnabled ? <Bell size={18} /> : <BellOff size={18} />}
                            每日提醒 (20:00)
                        </div>
                        <div className={`w-10 h-5 rounded-full relative transition-colors ${notificationsEnabled ? 'bg-indigo-500' : 'bg-slate-300 dark:bg-slate-600'}`}>
                            <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${notificationsEnabled ? 'left-6' : 'left-1'}`}></div>
                        </div>
                    </button>
                    
                    <div className="h-px bg-slate-100 dark:bg-slate-700 my-2"></div>

                    <div className="space-y-2">
                        <button onClick={handleExportData} className="w-full flex items-center justify-center gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium transition-colors text-sm border border-slate-100 dark:border-slate-700">
                        <Download size={18} /> 导出备份 (JSON)
                    </button>
                        <button onClick={handleExportMarkdown} className="w-full flex items-center justify-center gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium transition-colors text-sm border border-slate-100 dark:border-slate-700">
                            <Download size={18} /> 导出 Markdown
                        </button>
                    </div>
                    <label className="w-full flex items-center justify-center gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium transition-colors cursor-pointer text-sm border border-slate-100 dark:border-slate-700">
                        <Upload size={18} /> 导入恢复 (JSON)
                        <input type="file" accept=".json" onChange={handleImportData} className="hidden" />
                    </label>
                </div>
            </div>
        </div>
      )}

      {/* Weekly Report Modal */}
      {showWeeklyReport && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
             <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl relative overflow-hidden min-h-[400px] animate-in fade-in zoom-in-95 duration-300">
                <button onClick={() => setShowWeeklyReport(false)} className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 text-slate-400 z-10"><X size={20}/></button>
                
                {isGeneratingReport ? (
                    <div className="flex flex-col items-center justify-center h-[400px] text-indigo-600">
                        <div className="animate-spin mb-4"><Sparkles size={32} /></div>
                        <p className="font-medium animate-pulse">正在回顾你的成长轨迹...</p>
                    </div>
                ) : weeklyReport ? (
                    <div className="p-8">
                        <div className="flex items-center gap-2 text-indigo-600 font-bold tracking-widest text-xs uppercase mb-2">
                             <BarChart3 size={14}/> 阶段性成长报告
                        </div>
                        <h2 className="text-3xl font-extrabold text-slate-800 mb-1">{weeklyReport.dateRange}</h2>
                        <p className="text-slate-500 mb-8 text-sm">基于最近复盘记录的智能洞察</p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                            <div className="bg-indigo-50 p-6 rounded-2xl border border-indigo-100">
                                <h4 className="font-bold text-indigo-900 mb-2 text-sm">关键词</h4>
                                <div className="flex flex-wrap gap-2">
                                    {weeklyReport.keywords.map(k => (
                                        <span key={k} className="bg-white text-indigo-600 px-2 py-1 rounded text-xs font-bold shadow-sm">{k}</span>
                                    ))}
                                </div>
                            </div>
                            <div className="bg-purple-50 p-6 rounded-2xl border border-purple-100">
                                <h4 className="font-bold text-purple-900 mb-2 text-sm">情绪趋势</h4>
                                <p className="text-purple-800 text-sm leading-relaxed">{weeklyReport.emotionalTrend}</p>
                            </div>
                        </div>

                        <div className="mb-8">
                             <h4 className="font-bold text-slate-800 mb-3 flex items-center"><BarChart3 size={16} className="mr-2 text-rose-500"/> 成长聚焦</h4>
                             <div className="bg-rose-50 border-l-4 border-rose-300 p-4 rounded-r-lg">
                                <p className="text-slate-700 text-sm leading-relaxed">{weeklyReport.growthFocus}</p>
                             </div>
                        </div>

                        <div className="bg-gradient-to-r from-slate-800 to-slate-900 text-white p-6 rounded-2xl shadow-lg relative overflow-hidden">
                             <Quote size={48} className="absolute -top-2 -right-2 text-white/5 rotate-12" />
                             <h4 className="font-bold text-indigo-200 text-xs uppercase mb-2">教练建议</h4>
                             <p className="font-medium leading-relaxed font-serif text-lg">"{weeklyReport.suggestion}"</p>
                        </div>

                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                onClick={handleSaveWeeklyReport}
                                disabled={isSavingReport}
                                className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-xl shadow-sm transition-all active:scale-95"
                            >
                                {isSavingReport ? (
                                    <>
                                        <div className="animate-spin"><Sparkles size={16} /></div>
                                        <span>保存中...</span>
                                    </>
                                ) : (
                                    <>
                                        <Download size={16} />
                                        <span>保存周报</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                ) : null}
             </div>
          </div>
      )}

      {/* Header */}
      <header className="flex flex-col md:flex-row md:justify-between md:items-center mb-10 gap-6">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-4">
            <button
              onClick={onBack}
              className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            >
              <ChevronLeft size={20} className="text-slate-500 dark:text-slate-400" />
            </button>
            <h1 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">{greeting}</h1>
          </div>
          <div className="mt-4 relative pl-6 border-l-2 border-indigo-200">
            <Quote size={20} className="text-indigo-400 absolute -left-2 top-0 bg-white dark:bg-slate-900 p-0.5" />
            <div className="space-y-1.5">
              <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed font-serif italic tracking-wide">
                {dailyQuote.text}
              </p>
              {dailyQuote.author && (
                <p className="text-slate-500 dark:text-slate-400 text-xs font-medium">
                  — {dailyQuote.author}
                </p>
              )}
            </div>
          </div>
        </div>
        <div className="flex gap-3 w-full md:w-auto items-center">
          <Button 
              onClick={() => setShowSettings(true)}
              variant="secondary"
              className="w-12 px-0 flex items-center justify-center rounded-xl"
          >
              <Settings size={20} />
          </Button>
          <Button 
              onClick={handleStartNew} 
              icon={<Plus size={20} />} 
              size="lg"
              className="bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200/50 rounded-xl px-6 flex-1 md:flex-none"
          >
          开始复盘
          </Button>
        </div>
      </header>

      {/* Stats & Tools */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
        <div className="lg:col-span-2 space-y-6">
             <HabitTracker entries={entries} />
             <Stats entries={entries} />
        </div>
        
        {/* Sidebar */}
        <div className="space-y-6">
             {/* AI Insight Card */}
             <div 
                className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl p-6 text-white shadow-xl shadow-indigo-200 cursor-pointer hover:scale-[1.02] transition-transform relative overflow-hidden group"
                onClick={handleGenerateWeeklyReport}
             >
                <div className="absolute top-0 right-0 p-20 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
                <h3 className="font-bold text-lg mb-2 flex items-center relative z-10">
                    <Sparkles size={18} className="mr-2 text-yellow-300"/> 生成周报
                </h3>
                <p className="text-indigo-100 text-sm leading-relaxed opacity-90 relative z-10 mb-4">
                    让 AI 帮你回顾最近一周的状态、成就与潜在问题。
                </p>
                <div className="inline-flex items-center text-xs font-bold bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm">
                    点击生成 <BarChart3 size={12} className="ml-1"/>
                </div>
             </div>
             
             {/* Memory Capsule Widget */}
             {randomMemory && (
                 <div className="bg-amber-50 dark:bg-amber-900/20 rounded-2xl p-6 border border-amber-100 dark:border-amber-800 relative overflow-hidden hover:shadow-md transition-shadow">
                     <div className="absolute top-0 right-0 -mt-4 -mr-4 text-amber-200 dark:text-amber-800 opacity-50">
                         <Clock size={80} />
                     </div>
                     <div className="relative z-10">
                         <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-bold text-xs uppercase mb-3">
                             <History size={14} /> 往昔回响
                         </div>
                         <p className="text-slate-500 dark:text-slate-400 text-xs mb-2">
                             {new Date(randomMemory.date).toLocaleDateString()} · {FRAMEWORKS[randomMemory.framework].label}
                         </p>
                         <div 
                            className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl p-3 text-sm text-slate-700 dark:text-slate-300 line-clamp-3 mb-3 cursor-pointer hover:bg-white dark:hover:bg-slate-800 transition-colors border border-amber-100/50 dark:border-amber-800/50"
                            onClick={() => onEntryClick(randomMemory)}
                        >
                             {randomMemory.aiAnalysis?.summary || "点击查看详情..."}
                         </div>
                         <button 
                            onClick={() => onEntryClick(randomMemory)}
                            className="text-amber-700 dark:text-amber-400 text-xs font-bold hover:underline"
                        >
                             查看那时的我 &rarr;
                         </button>
                     </div>
                 </div>
             )}
        </div>
      </div>

      {/* Main Content Area */}
      <section>
        {/* Loading Indicator */}
        {isLoadingEntries && (
          <div className="text-center py-20">
            <div className="inline-flex items-center gap-2 text-indigo-600">
              <div className="animate-spin"><Sparkles size={20} /></div>
              <span className="font-medium">加载中...</span>
            </div>
          </div>
        )}
        
        {/* Toolbar */}
        {!isLoadingEntries && (
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4 sticky top-4 z-30 bg-slate-50/95 dark:bg-slate-900/95 backdrop-blur-sm py-2 -mx-2 px-2 rounded-xl border border-slate-200/50 dark:border-slate-700/50">
          <div className="flex items-center gap-2">
            <div className="flex bg-white dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
                 <button 
                    onClick={() => setDashboardMode('LIST')}
                    className={`p-2 rounded-md transition-all ${dashboardMode === 'LIST' ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-400'}`}
                 >
                    <LayoutGrid size={18} />
                 </button>
                 <button 
                    onClick={() => setDashboardMode('CALENDAR')}
                    className={`p-2 rounded-md transition-all ${dashboardMode === 'CALENDAR' ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-400'}`}
                 >
                    <CalendarIcon size={18} />
                 </button>
            </div>
            
            <div className="flex items-center gap-2">
            <div className="relative group hidden sm:block">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                <input 
                    type="text" 
                    placeholder="搜索..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900 focus:border-indigo-400 w-48 transition-all dark:text-slate-100"
                />
              </div>
              <button
                onClick={() => setShowAdvancedSearch(true)}
                className="p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                title="高级搜索"
              >
                <Search size={16} className="text-slate-400" />
              </button>
            </div>
          </div>

          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 md:pb-0 items-center">
                {(searchFilters || searchQuery) && (
                  <button
                    onClick={() => {
                      setSearchFilters(null);
                      setSearchQuery('');
                      setFrameworkFilter('ALL');
                    }}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap border bg-rose-50 dark:bg-rose-900/30 border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/50 transition-all flex items-center gap-1"
                  >
                    <X size={12} />
                    清除筛选
                  </button>
                )}
                <button 
                    onClick={() => setFrameworkFilter('ALL')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap border transition-all ${frameworkFilter === 'ALL' ? 'bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-200' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
                >
                    全部
                </button>
                {Object.values(FRAMEWORKS).map(fw => (
                    <button 
                        key={fw.id}
                        onClick={() => setFrameworkFilter(fw.id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap border transition-all ${frameworkFilter === fw.id ? 'bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-200' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
                    >
                        {fw.label}
                    </button>
                ))}
          </div>
        </div>
        )}

        {/* View Content */}
        {!isLoadingEntries && dashboardMode === 'CALENDAR' ? (
             <CalendarView 
                entries={entries} 
                onDateClick={handleCalendarDateClick}
                currentDate={calendarMonth}
                onMonthChange={setCalendarMonth}
             />
        ) : !isLoadingEntries ? (
            <>
                {filteredEntries.length === 0 ? (
                <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-3xl border border-dashed border-slate-200 dark:border-slate-700 shadow-sm">
                    <History className="mx-auto text-slate-300 dark:text-slate-600 mb-4" size={48} />
                    <h3 className="text-slate-600 dark:text-slate-400 font-medium mb-1">暂无记录</h3>
                    <p className="text-slate-400 dark:text-slate-500 text-xs mb-6">所有的伟大，都源于一次开始。</p>
                    <Button onClick={handleStartNew} variant="secondary">新建复盘</Button>
                </div>
                ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20 animate-in fade-in duration-500">
                    {filteredEntries.map(entry => (
                    <EntryCard key={entry.id} entry={entry} onClick={() => onEntryClick(entry)} />
                    ))}
                </div>
                )}
            </>
        ) : null}
      </section>

      {/* Advanced Search Modal */}
      {showAdvancedSearch && (
        <AdvancedSearch
          isOpen={showAdvancedSearch}
          availableTags={availableTags}
          onClose={() => setShowAdvancedSearch(false)}
          onSearch={(filters) => {
            setSearchFilters(filters);
            setSearchQuery(filters.query || '');
          }}
        />
      )}

      {/* 提示弹窗 */}
      <AlertDialog
        isOpen={alertDialog.isOpen}
        title={alertDialog.title}
        message={alertDialog.message}
        type={alertDialog.type}
        onClose={() => setAlertDialog({ ...alertDialog, isOpen: false })}
      />
    </div>
  );
};

