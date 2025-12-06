import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Plus, 
  ChevronLeft, 
  Sparkles, 
  Lightbulb,
  CheckCircle2,
  PenLine,
  Search,
  Trash2,
  Copy,
  X,
  History,
  Tag,
  Save,
  LayoutGrid,
  Calendar as CalendarIcon,
  Settings,
  Download,
  Upload,
  BarChart3,
  Quote,
  Mic,
  Maximize2,
  Minimize2,
  Share2,
  Clock,
  Target,
  AlignLeft,
  Bell,
  BellOff,
  BookOpen,
  Network
} from 'lucide-react';
import { Button } from './components/Button';
import { Stats } from './components/Stats';
import { HabitTracker } from './components/HabitTracker';
import { EntryCard } from './components/EntryCard';
import { CalendarView } from './components/CalendarView';
import { AuthModal } from './components/AuthModal';
import { ProfileModal } from './components/ProfileModal';
import { AdvancedSearch, SearchFilters } from './components/AdvancedSearch';
import { ThemeToggle } from './components/ThemeToggle';
import { GoalTracker } from './components/GoalTracker';
import { Goal } from './types/goal';
import { MonthlyReport } from './components/MonthlyReport';
import { exportToMarkdown, exportToImage, downloadFile } from './utils/exportUtils';
import { FRAMEWORKS, QUOTES } from './constants';
import { ReviewEntry, FrameworkType, ViewState, WeeklyAnalysisResult, AIAnalysisResult, KnowledgePoint, AIModel, AIModelInfo } from './types';
import { analyzeEntry, generateWeeklyReport, checkModelApiKey } from './services/aiService';
import { goalApi, GoalVO } from './services/goalApi';
import { reviewEntryApi } from './services/reviewEntryApi';
import { userApi, LoginUserVO } from './services/userApi';
import { knowledgePointApi } from './services/knowledgePointApi';
import { KnowledgePointCard } from './components/KnowledgePointCard';
import { KnowledgePointEditor } from './components/KnowledgePointEditor';
import { KnowledgePointDetail } from './components/KnowledgePointDetail';
import { MindMap } from './components/MindMap';
import { ComprehensiveStats } from './components/ComprehensiveStats';
import { ReviewDashboard } from './components/ReviewDashboard';
import { Statistics } from './components/Statistics';

// Declare standard speech recognition for TS
declare global {
  interface Window {
    webkitSpeechRecognition: any;
    SpeechRecognition: any;
  }
}

const App = () => {
  // --- STATE ---
  const [view, setView] = useState<ViewState>('DASHBOARD');
  const [dashboardMode, setDashboardMode] = useState<'LIST' | 'CALENDAR'>('LIST');
  const [entries, setEntries] = useState<ReviewEntry[]>([]);
  const [selectedEntry, setSelectedEntry] = useState<ReviewEntry | null>(null);

  // Filter & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [frameworkFilter, setFrameworkFilter] = useState<FrameworkType | 'ALL'>('ALL');
  const [calendarMonth, setCalendarMonth] = useState(new Date());

  // AI Model Selection
  const [selectedModel, setSelectedModel] = useState<AIModel>(AIModel.OPENROUTER_OLMO);

  // New/Edit Entry
  const [activeFramework, setActiveFramework] = useState<FrameworkType>(FrameworkType.DAILY);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  // Manual AI Analysis Fields
  const [manualAnalysis, setManualAnalysis] = useState<{
    summary: string;
    sentimentScore: number | '';
    actionItems: string[];
    keyInsight: string;
  }>({
    summary: '',
    sentimentScore: '',
    actionItems: [],
    keyInsight: ''
  });
  const [actionItemInput, setActionItemInput] = useState("");
  
  // Zen Mode & Voice
  const [isZenMode, setIsZenMode] = useState(false);
  const [isListening, setIsListening] = useState<string | null>(null); // Key of the prompt being listened to

  // Settings & Notifications
  const [showSettings, setShowSettings] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  // Modals & Overlays
  const [showWeeklyReport, setShowWeeklyReport] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [weeklyReport, setWeeklyReport] = useState<WeeklyAnalysisResult | null>(null);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [searchFilters, setSearchFilters] = useState<SearchFilters | null>(null);
  
  // Goals
  const [goals, setGoals] = useState<Goal[]>([]);
  
  // Knowledge Points
  const [knowledgePoints, setKnowledgePoints] = useState<KnowledgePoint[]>([]);
  const [selectedKnowledgePoint, setSelectedKnowledgePoint] = useState<KnowledgePoint | null>(null);
  const [knowledgePointSearchQuery, setKnowledgePointSearchQuery] = useState("");
  const [knowledgePointCategoryFilter, setKnowledgePointCategoryFilter] = useState<string>('ALL');
  const [isLoadingKnowledgePoints, setIsLoadingKnowledgePoints] = useState(true);
  
  // UI Feedback
  const [showToast, setShowToast] = useState<{msg: string, type: 'success' | 'error'} | null>(null);
  const [dailyQuote, setDailyQuote] = useState(QUOTES[0]);
  const [randomMemory, setRandomMemory] = useState<ReviewEntry | null>(null);
  const [isLoadingEntries, setIsLoadingEntries] = useState(true);
  
  // Auth
  const [currentUser, setCurrentUser] = useState<LoginUserVO | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // --- EFFECTS ---

  // 检查登录状态
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await userApi.getCurrentUser();
        setCurrentUser(user);
      } catch (error) {
        // 未登录或登录已过期
        setCurrentUser(null);
      } finally {
        setIsCheckingAuth(false);
      }
    };
    checkAuth();
  }, []);

  // 从后端加载复盘记录（仅当用户已登录时）
  useEffect(() => {
    // 如果用户未登录，不加载数据
    if (!currentUser) {
      setEntries([]);
      setKnowledgePoints([]);
      setIsLoadingEntries(false);
      setIsLoadingKnowledgePoints(false);
      return;
    }

    const loadEntries = async () => {
      try {
        setIsLoadingEntries(true);
        const loadedEntries = await reviewEntryApi.listMyEntries();
        setEntries(loadedEntries);
        
        // Find a random entry from > 3 days ago for "Memory Capsule"
        if (loadedEntries.length > 0) {
            const oldEntries = loadedEntries.filter(e => {
                const diffTime = Math.abs(Date.now() - new Date(e.date).getTime());
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
                return diffDays > 3;
            });
            
            if (oldEntries.length > 0) {
                setRandomMemory(oldEntries[Math.floor(Math.random() * oldEntries.length)]);
            }
        }
      } catch (error) {
        console.error("Failed to load entries from backend", error);
        triggerToast("加载数据失败，请检查后端服务是否启动", "error");
      } finally {
        setIsLoadingEntries(false);
      }
    };

    loadEntries();
    
    // 从后端加载知识点
    const loadKnowledgePoints = async () => {
      try {
        setIsLoadingKnowledgePoints(true);
        const loadedKnowledgePoints = await knowledgePointApi.listMyKnowledgePoints();
        setKnowledgePoints(loadedKnowledgePoints);
      } catch (error) {
        console.error("Failed to load knowledge points from backend", error);
        triggerToast("加载知识点失败", "error");
      } finally {
        setIsLoadingKnowledgePoints(false);
      }
    };
    loadKnowledgePoints();
  }, [currentUser]);

  // 加载用户偏好设置（这些可以在未登录时加载，因为是本地设置）
  useEffect(() => {
    // Load notification setting
    const notifPref = localStorage.getItem('reflect_ai_notifications_enabled');
    if (notifPref === 'true') {
        setNotificationsEnabled(true);
    }

    // Random quote on load
    setDailyQuote(QUOTES[Math.floor(Math.random() * QUOTES.length)]);

    // Load saved AI model preference
    const savedModel = localStorage.getItem('reflect_ai_selected_model');
    if (savedModel && Object.values(AIModel).includes(savedModel as AIModel)) {
      setSelectedModel(savedModel as AIModel);
    }
  }, [currentUser]);

  // 转换后端目标数据到前端格式
  const convertGoalVOToGoal = (goal: GoalVO): Goal => ({
    id: goal.id.toString(),
    title: goal.title,
    description: goal.description,
    targetDate: goal.targetDate,
    progress: goal.progress,
    status: goal.status,
    createdAt: goal.createTime || new Date().toISOString(),
    updatedAt: goal.updateTime || new Date().toISOString(),
  });

  // Load goals from API (only if user is logged in)
  useEffect(() => {
    const loadGoals = async () => {
    if (currentUser) {
        try {
          const goalsData = await goalApi.getMyGoals();
          const convertedGoals = goalsData.map(convertGoalVOToGoal);
          setGoals(convertedGoals);
        } catch (error) {
          console.error('Failed to load goals:', error);
          setGoals([]);
    }
      } else {
        setGoals([]);
      }
    };
    loadGoals();
  }, [currentUser]);

  // Save selected model to localStorage
  useEffect(() => {
    localStorage.setItem('reflect_ai_selected_model', selectedModel);
  }, [selectedModel]);

  // Reminder Logic
  useEffect(() => {
    if (!notificationsEnabled) return;

    const checkReminder = () => {
        const now = new Date();
        const hour = now.getHours();
        const todayStr = now.toDateString();
        
        // Target: 20:00 - 23:59
        if (hour >= 20) {
            const lastNotifDate = localStorage.getItem('reflect_ai_last_notification_date');
            
            // Only notify if we haven't notified today
            if (lastNotifDate !== todayStr) {
                 // Check if entry exists for today
                const hasEntryToday = entries.some(e => new Date(e.date).toDateString() === todayStr);
                
                if (!hasEntryToday) {
                    if (Notification.permission === 'granted') {
                        new Notification("ReflectAI - 该复盘了", {
                            body: "今天过得怎么样？花几分钟记录一下吧。",
                            icon: "/favicon.ico"
                        });
                        localStorage.setItem('reflect_ai_last_notification_date', todayStr);
                    }
                }
            }
        }
    };

    // Check immediately and then every minute
    checkReminder();
    const interval = setInterval(checkReminder, 60000);

    return () => clearInterval(interval);
  }, [notificationsEnabled, entries]);

  // --- HELPERS ---

  const triggerToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setShowToast({ msg, type });
    setTimeout(() => setShowToast(null), 3000);
  };

  const filteredEntries = useMemo(() => {
    return entries.filter(entry => {
      // 基础搜索
      let matchesSearch = true;
      if (searchQuery) {
        matchesSearch = 
        (entry.aiAnalysis?.summary || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        Object.values(entry.content).some(val => val.toLowerCase().includes(searchQuery.toLowerCase()));
      }
      
      // 高级搜索过滤
      if (searchFilters) {
        // 关键词搜索
        if (searchFilters.query) {
          const queryLower = searchFilters.query.toLowerCase();
          const matchesQuery = 
            (entry.aiAnalysis?.summary || "").toLowerCase().includes(queryLower) ||
            (entry.aiAnalysis?.keyInsight || "").toLowerCase().includes(queryLower) ||
            Object.values(entry.content).some(val => val.toLowerCase().includes(queryLower));
          if (!matchesQuery) return false;
        }
        
        // 框架筛选
        if (searchFilters.framework && entry.framework !== searchFilters.framework) {
          return false;
        }
        
        // 标签筛选
        if (searchFilters.tags.length > 0) {
          const hasAllTags = searchFilters.tags.every(tag => entry.tags?.includes(tag));
          if (!hasAllTags) return false;
        }
        
        // 日期范围筛选
        if (searchFilters.dateFrom || searchFilters.dateTo) {
          const entryDate = new Date(entry.date);
          if (searchFilters.dateFrom && entryDate < searchFilters.dateFrom) return false;
          if (searchFilters.dateTo) {
            const toDate = new Date(searchFilters.dateTo);
            toDate.setHours(23, 59, 59, 999);
            if (entryDate > toDate) return false;
          }
        }
        
        // 评分范围筛选
        const score = entry.aiAnalysis?.sentimentScore || 0;
        if (searchFilters.minScore !== undefined && score < searchFilters.minScore) return false;
        if (searchFilters.maxScore !== undefined && score > searchFilters.maxScore) return false;
      }
      
      // 基础框架筛选
      const matchesFilter = frameworkFilter === 'ALL' || entry.framework === frameworkFilter;
      
      return matchesSearch && matchesFilter;
    });
  }, [entries, searchQuery, frameworkFilter, searchFilters]);

  // 获取所有可用标签
  const availableTags = useMemo(() => {
    const tagSet = new Set<string>();
    entries.forEach(entry => {
      entry.tags?.forEach(tag => tagSet.add(tag));
    });
    return Array.from(tagSet).sort();
  }, [entries]);

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 5) return "夜深了";
    if (hour < 11) return "早上好";
    if (hour < 13) return "中午好";
    if (hour < 18) return "下午好";
    return "晚上好";
  }, []);

  // --- ACTION HANDLERS ---

  const handleToggleNotifications = async () => {
      if (!notificationsEnabled) {
          if (!('Notification' in window)) {
              triggerToast("您的浏览器不支持通知功能", "error");
              return;
          }
          const permission = await Notification.requestPermission();
          if (permission === 'granted') {
              setNotificationsEnabled(true);
              localStorage.setItem('reflect_ai_notifications_enabled', 'true');
              triggerToast("每日提醒已开启 (20:00)");
              
              // Test notification
              new Notification("ReflectAI", { body: "提醒已开启，我们将会在每天 20:00 提醒您复盘。" });
          } else {
              triggerToast("需要通知权限才能开启提醒", "error");
          }
      } else {
          setNotificationsEnabled(false);
          localStorage.setItem('reflect_ai_notifications_enabled', 'false');
          triggerToast("每日提醒已关闭");
      }
  };

  const handleStartNew = (dateOverride?: Date) => {
    setFormData({});
    setTags([]);
    setTagInput("");
    setIsEditing(false);
    setIsZenMode(false);
    setView('NEW_ENTRY');
    setActiveFramework(FrameworkType.DAILY);
    setManualAnalysis({
      summary: '',
      sentimentScore: '',
      actionItems: [],
      keyInsight: ''
    });
    setActionItemInput("");
  };

  const handleStartEdit = (entry: ReviewEntry) => {
    setFormData(entry.content);
    setTags(entry.tags || []);
    setTagInput("");
    setActiveFramework(entry.framework);
    setSelectedEntry(entry);
    setIsEditing(true);
    setIsZenMode(false);
    setView('NEW_ENTRY');
    // 加载已有的AI分析数据
    if (entry.aiAnalysis) {
      setManualAnalysis({
        summary: entry.aiAnalysis.summary || '',
        sentimentScore: entry.aiAnalysis.sentimentScore ?? '',
        actionItems: entry.aiAnalysis.actionItems || [],
        keyInsight: entry.aiAnalysis.keyInsight || ''
      });
    } else {
      setManualAnalysis({
        summary: '',
        sentimentScore: '',
        actionItems: [],
        keyInsight: ''
      });
    }
    setActionItemInput("");
  };

  const handleInputChange = (key: string, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleVoiceInput = (key: string) => {
      if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
          triggerToast("您的浏览器不支持语音输入", "error");
          return;
      }

      if (isListening === key) {
          setIsListening(null);
          return;
      }

      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.lang = 'zh-CN';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => setIsListening(key);
      recognition.onend = () => setIsListening(null);
      recognition.onerror = () => {
          setIsListening(null);
          triggerToast("语音识别错误", "error");
      };

      recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          if (transcript) {
              setFormData(prev => ({
                  ...prev,
                  [key]: (prev[key] || '') + transcript
              }));
          }
      };

      recognition.start();
  };

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
        e.preventDefault();
        if (!tags.includes(tagInput.trim())) {
            setTags([...tags, tagInput.trim()]);
        }
        setTagInput("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  const handleAddActionItem = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && actionItemInput.trim()) {
      e.preventDefault();
      if (!manualAnalysis.actionItems.includes(actionItemInput.trim())) {
        setManualAnalysis(prev => ({
          ...prev,
          actionItems: [...prev.actionItems, actionItemInput.trim()]
        }));
      }
      setActionItemInput("");
    }
  };

  const removeActionItem = (itemToRemove: string) => {
    setManualAnalysis(prev => ({
      ...prev,
      actionItems: prev.actionItems.filter(item => item !== itemToRemove)
    }));
  };

  // 直接保存，不进行AI分析（但可以包含手动填写的分析）
  const handleSubmitWithoutAI = async () => {
    setIsSaving(true);
    try {
      // 构建AI分析对象（如果用户填写了相关字段）
      let aiAnalysis: AIAnalysisResult | undefined = undefined;
      if (manualAnalysis.summary.trim() || 
          manualAnalysis.sentimentScore !== '' || 
          manualAnalysis.actionItems.length > 0 || 
          manualAnalysis.keyInsight.trim()) {
        aiAnalysis = {
          summary: manualAnalysis.summary.trim() || '未填写',
          sentimentScore: typeof manualAnalysis.sentimentScore === 'number' 
            ? manualAnalysis.sentimentScore 
            : 5, // 默认值
          actionItems: manualAnalysis.actionItems.length > 0 
            ? manualAnalysis.actionItems 
            : [],
          keyInsight: manualAnalysis.keyInsight.trim() || '未填写'
        };
      }

      if (isEditing && selectedEntry) {
        const updatedEntry: ReviewEntry = {
            ...selectedEntry,
            content: formData,
            tags: tags,
            aiAnalysis: aiAnalysis
        };
        
        // 调用后端API更新
        await reviewEntryApi.updateEntry(updatedEntry);
        
        // 更新本地状态
        setEntries(prev => prev.map(e => e.id === selectedEntry.id ? updatedEntry : e));
        setSelectedEntry(updatedEntry);
        triggerToast("更新成功");
        setView('ENTRY_DETAIL');
      } else {
        const newEntry: ReviewEntry = {
            id: Date.now().toString(), // 临时ID，后端会返回真实ID
            date: new Date().toISOString(),
            framework: activeFramework,
            content: formData,
            tags: tags,
            aiAnalysis: aiAnalysis
        };
        
        // 调用后端API保存
        const savedId = await reviewEntryApi.addEntry(newEntry);
        
        // 更新ID为后端返回的真实ID
        newEntry.id = savedId.toString();
        
        // 更新本地状态
        setEntries(prev => [newEntry, ...prev]);
        triggerToast("复盘已保存");
        setView('REVIEW');
      }
    } catch (error) {
      console.error(error);
      triggerToast(error instanceof Error ? error.message : "操作失败", "error");
    } finally {
      setIsSaving(false);
      setIsZenMode(false);
    }
  };

  // 生成AI分析报告并提交
  const handleSubmit = async () => {
    // 检查选定的模型是否有API Key
    const { checkModelApiKey } = await import('./services/aiService');
    if (!checkModelApiKey(selectedModel)) {
      const modelName = selectedModel === AIModel.OPENROUTER_OLMO ? 'OpenRouter' : '智谱AI';
      triggerToast(`${modelName} API Key 缺失，无法进行AI分析`, "error");
        return;
    }

    setIsAnalyzing(true);
    try {
      const analysis = await analyzeEntry(selectedModel, activeFramework, formData);
      
      // 更新手动分析字段，方便用户查看和编辑
      setManualAnalysis({
        summary: analysis.summary,
        sentimentScore: analysis.sentimentScore,
        actionItems: analysis.actionItems,
        keyInsight: analysis.keyInsight
      });
      
      if (isEditing && selectedEntry) {
        const updatedEntry: ReviewEntry = {
            ...selectedEntry,
            content: formData,
            tags: tags,
            aiAnalysis: analysis,
        };
        
        // 调用后端API更新
        await reviewEntryApi.updateEntry(updatedEntry);
        
        // 更新本地状态
        setEntries(prev => prev.map(e => e.id === selectedEntry.id ? updatedEntry : e));
        setSelectedEntry(updatedEntry);
        triggerToast("更新成功");
        setView('ENTRY_DETAIL');
      } else {
        const newEntry: ReviewEntry = {
            id: Date.now().toString(), // 临时ID，后端会返回真实ID
            date: new Date().toISOString(),
            framework: activeFramework,
            content: formData,
            tags: tags,
            aiAnalysis: analysis
        };
        
        // 调用后端API保存
        const savedId = await reviewEntryApi.addEntry(newEntry);
        
        // 更新ID为后端返回的真实ID
        newEntry.id = savedId.toString();
        
        // 更新本地状态
        setEntries(prev => [newEntry, ...prev]);
        triggerToast("复盘已保存");
        setView('REVIEW');
      }
    } catch (error) {
      console.error(error);
      triggerToast(error instanceof Error ? error.message : "操作失败", "error");
    } finally {
      setIsAnalyzing(false);
      setIsZenMode(false);
    }
  };

  const handleCalendarDateClick = (date: Date, entry?: ReviewEntry) => {
      if (entry) {
          setSelectedEntry(entry);
          setView('ENTRY_DETAIL');
      } else {
          handleStartNew(date);
      }
  };

  const handleDeleteEntry = async (id: string) => {
    if (window.confirm("确定删除？")) {
      try {
        await reviewEntryApi.deleteEntry(id);
      setEntries(prev => prev.filter(e => e.id !== id));
      if (view === 'ENTRY_DETAIL') setView('REVIEW');
      triggerToast("已删除");
      } catch (error) {
        console.error(error);
        triggerToast(error instanceof Error ? error.message : "删除失败", "error");
      }
    }
  };

  const handleCopyMarkdown = (entry: ReviewEntry) => {
    const config = FRAMEWORKS[entry.framework];
    let md = `# ${entry.aiAnalysis?.summary}\n**日期**: ${new Date(entry.date).toLocaleDateString()}\n\n`;
    md += `> ${entry.aiAnalysis?.keyInsight}\n\n`;
    Object.entries(entry.content).forEach(([k, v]) => md += `### ${config.prompts.find(p => p.key === k)?.label}\n${v}\n\n`);
    navigator.clipboard.writeText(md);
    triggerToast("已复制 Markdown");
  };

  const handleExportData = () => {
      downloadFile(JSON.stringify(entries, null, 2), `reflect_ai_backup_${new Date().toISOString().slice(0,10)}.json`, 'application/json');
      triggerToast("数据已导出");
  };

  const handleExportMarkdown = () => {
      const markdown = exportToMarkdown(entries);
      downloadFile(markdown, `复盘记录_${new Date().toISOString().slice(0,10)}.md`, 'text/markdown');
      triggerToast("Markdown已导出");
  };

  const handleExportImage = async (entry: ReviewEntry) => {
      try {
          await exportToImage(entry);
          triggerToast("图片已导出");
      } catch (error) {
          triggerToast("导出失败", "error");
      }
  };

  // 重新加载目标列表
  const reloadGoals = async () => {
      try {
          const goalsData = await goalApi.getMyGoals();
          const convertedGoals = goalsData.map(convertGoalVOToGoal);
          setGoals(convertedGoals);
      } catch (error) {
          console.error('Failed to reload goals:', error);
      }
  };

  // Goals handlers
  const handleAddGoal = async (goalData: Omit<Goal, 'id' | 'createdAt' | 'updatedAt'>) => {
      try {
          await goalApi.addGoal({
              title: goalData.title,
              description: goalData.description,
              targetDate: goalData.targetDate,
              progress: goalData.progress,
              status: goalData.status,
          });
          
          await reloadGoals();
      triggerToast("目标已创建");
      } catch (error) {
          console.error('Failed to add goal:', error);
          triggerToast("创建目标失败", "error");
      }
  };

  const handleUpdateGoal = async (id: string, updates: Partial<Goal>) => {
      try {
          await goalApi.updateGoal({
              id: parseInt(id),
              title: updates.title,
              description: updates.description,
              targetDate: updates.targetDate,
              progress: updates.progress,
              status: updates.status,
          });
          
          await reloadGoals();
      triggerToast("目标已更新");
      } catch (error) {
          console.error('Failed to update goal:', error);
          triggerToast("更新目标失败", "error");
      }
  };

  const handleDeleteGoal = async (id: string) => {
      if (window.confirm("确定删除这个目标？")) {
          try {
              await goalApi.deleteGoal(parseInt(id));
              await reloadGoals();
          triggerToast("目标已删除");
          } catch (error) {
              console.error('Failed to delete goal:', error);
              triggerToast("删除目标失败", "error");
          }
      }
  };

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (e) => {
          try {
              const imported = JSON.parse(e.target?.result as string);
              if (Array.isArray(imported)) {
                  if(window.confirm(`确认导入 ${imported.length} 条数据？现有数据将被覆盖。`)) {
                      setEntries(imported);
                      triggerToast("数据导入成功");
                      setShowSettings(false);
                  }
              }
          } catch (err) {
              triggerToast("文件格式错误", "error");
          }
      };
      reader.readAsText(file);
  };

  const handleGenerateWeeklyReport = async () => {
      if (entries.length < 3) {
          triggerToast("记录太少，无法生成周报 (至少3条)", "error");
          return;
      }
      
      // 检查选定的模型是否有API Key
      const { checkModelApiKey } = await import('./services/aiService');
      if (!checkModelApiKey(selectedModel)) {
        const modelName = selectedModel === AIModel.OPENROUTER_OLMO ? 'OpenRouter' : '智谱AI';
        triggerToast(`${modelName} API Key 缺失，无法生成周报`, "error");
        return;
      }
      
      setIsGeneratingReport(true);
      setShowWeeklyReport(true);
      try {
          const recentEntries = entries.slice(0, 10);
          const result = await generateWeeklyReport(selectedModel, recentEntries);
          setWeeklyReport(result);
      } catch (e) {
          triggerToast("生成失败，请重试", "error");
          setShowWeeklyReport(false);
      } finally {
          setIsGeneratingReport(false);
      }
  };

  const handleAuthSuccess = (user: LoginUserVO) => {
    setCurrentUser(user);
    setShowAuthModal(false);
    triggerToast(`欢迎回来，${user.userName || user.userAccount}！`);
  };

  const handleLogout = async () => {
    try {
      await userApi.logout();
      setCurrentUser(null);
      // 清空数据
      setEntries([]);
      setKnowledgePoints([]);
      setGoals([]);
      setSelectedEntry(null);
      triggerToast("已退出登录");
    } catch (error) {
      console.error(error);
      // 即使失败也清除本地状态
      setCurrentUser(null);
      setEntries([]);
      setKnowledgePoints([]);
      setGoals([]);
      setSelectedEntry(null);
    }
  };

  const handleProfileUpdate = (updatedUser: LoginUserVO) => {
    setCurrentUser(updatedUser);
    triggerToast("资料更新成功");
  };

  // Knowledge Point Handlers
  const handleCreateKnowledgePoint = () => {
    setSelectedKnowledgePoint(null);
    setView('KNOWLEDGE_POINT_EDIT');
  };

  const handleViewKnowledgePoint = (kp: KnowledgePoint) => {
    setSelectedKnowledgePoint(kp);
    setView('KNOWLEDGE_POINT_DETAIL');
  };

  const handleEditKnowledgePoint = () => {
    if (selectedKnowledgePoint) {
      setView('KNOWLEDGE_POINT_EDIT');
    }
  };

  const handleSaveKnowledgePoint = async (kp: Omit<KnowledgePoint, 'id' | 'createTime' | 'updateTime'>) => {
    try {
      if (selectedKnowledgePoint) {
        await knowledgePointApi.updateKnowledgePoint({ ...selectedKnowledgePoint, ...kp });
        triggerToast("知识点已更新");
        // 重新加载知识点列表和当前知识点
        const loadedKnowledgePoints = await knowledgePointApi.listMyKnowledgePoints();
        setKnowledgePoints(loadedKnowledgePoints);
        // 更新当前选中的知识点
        const updatedKp = loadedKnowledgePoints.find(p => p.id === selectedKnowledgePoint.id);
        if (updatedKp) {
          setSelectedKnowledgePoint(updatedKp);
          setView('KNOWLEDGE_POINT_DETAIL');
        } else {
          setView('KNOWLEDGE_POINTS');
          setSelectedKnowledgePoint(null);
        }
      } else {
        await knowledgePointApi.addKnowledgePoint(kp);
        triggerToast("知识点已创建");
        // 重新加载知识点列表
        const loadedKnowledgePoints = await knowledgePointApi.listMyKnowledgePoints();
        setKnowledgePoints(loadedKnowledgePoints);
        setView('KNOWLEDGE_POINTS');
        setSelectedKnowledgePoint(null);
      }
    } catch (error) {
      console.error(error);
      triggerToast(error instanceof Error ? error.message : "操作失败", "error");
    }
  };

  const handleDeleteKnowledgePoint = async (id: string) => {
    try {
      await knowledgePointApi.deleteKnowledgePoint(id);
      triggerToast("知识点已删除");
      // 重新加载知识点列表
      const loadedKnowledgePoints = await knowledgePointApi.listMyKnowledgePoints();
      setKnowledgePoints(loadedKnowledgePoints);
      if (view === 'KNOWLEDGE_POINT_EDIT') {
        setView('KNOWLEDGE_POINTS');
        setSelectedKnowledgePoint(null);
      }
    } catch (error) {
      console.error(error);
      triggerToast(error instanceof Error ? error.message : "删除失败", "error");
    }
  };

  // 过滤知识点
  const filteredKnowledgePoints = useMemo(() => {
    return knowledgePoints.filter(kp => {
      // 搜索过滤
      let matchesSearch = true;
      if (knowledgePointSearchQuery) {
        const queryLower = knowledgePointSearchQuery.toLowerCase();
        matchesSearch = 
          kp.title.toLowerCase().includes(queryLower) ||
          kp.content.toLowerCase().includes(queryLower) ||
          (kp.category && kp.category.toLowerCase().includes(queryLower));
      }
      
      // 分类过滤
      const matchesCategory = knowledgePointCategoryFilter === 'ALL' || kp.category === knowledgePointCategoryFilter;
      
      return matchesSearch && matchesCategory;
    });
  }, [knowledgePoints, knowledgePointSearchQuery, knowledgePointCategoryFilter]);

  // 获取所有分类
  const availableCategories = useMemo(() => {
    const categorySet = new Set<string>();
    knowledgePoints.forEach(kp => {
      if (kp.category) {
        categorySet.add(kp.category);
      }
    });
    return Array.from(categorySet).sort();
  }, [knowledgePoints]);

  // --- RENDER SECTIONS ---

  // 渲染复盘界面
  const renderReview = () => {
    return (
      <ReviewDashboard
        entries={entries}
        isLoadingEntries={isLoadingEntries}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        frameworkFilter={frameworkFilter}
        setFrameworkFilter={setFrameworkFilter}
        calendarMonth={calendarMonth}
        setCalendarMonth={setCalendarMonth}
        dashboardMode={dashboardMode}
        setDashboardMode={setDashboardMode}
        searchFilters={searchFilters}
        setSearchFilters={setSearchFilters}
        showSettings={showSettings}
        setShowSettings={setShowSettings}
        showWeeklyReport={showWeeklyReport}
        setShowWeeklyReport={setShowWeeklyReport}
        notificationsEnabled={notificationsEnabled}
        handleToggleNotifications={handleToggleNotifications}
        handleStartNew={handleStartNew}
        handleCalendarDateClick={handleCalendarDateClick}
        handleExportData={handleExportData}
        handleExportMarkdown={handleExportMarkdown}
        handleImportData={handleImportData}
        handleGenerateWeeklyReport={handleGenerateWeeklyReport}
        onEntryClick={(entry) => {
          setSelectedEntry(entry);
          setView('ENTRY_DETAIL');
        }}
        onBack={() => setView('DASHBOARD')}
        greeting={greeting}
        dailyQuote={dailyQuote}
        randomMemory={randomMemory}
        weeklyReport={weeklyReport}
        isGeneratingReport={isGeneratingReport}
      />
    );
  };

  // 综合型主界面
  const renderDashboard = () => (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* 左侧主内容区 */}
          <div className="lg:col-span-3 space-y-6">
            {/* Header */}
            <header className="flex flex-col md:flex-row md:justify-between md:items-center gap-6">
              <div className="flex-1">
                <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight mb-2">
                  {greeting}
                </h1>
                <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base">
                  综合型个人成长管理平台
                </p>
              </div>
              <div className="flex gap-3 items-center">
                {currentUser ? (
                  <div 
                    className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => setShowProfileModal(true)}
                  >
                    {currentUser.userAvatar ? (
                      <img 
                        src={currentUser.userAvatar} 
                        alt={currentUser.userName || currentUser.userAccount}
                        className="w-10 h-10 rounded-full border-2 border-indigo-200 dark:border-indigo-700"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm border-2 border-indigo-200 dark:border-indigo-700">
                        {(currentUser.userName || currentUser.userAccount || 'U').charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="hidden sm:block">
                      <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">{currentUser.userName || currentUser.userAccount}</p>
                    </div>
                  </div>
                ) : (
                  <Button 
                    onClick={() => setShowAuthModal(true)}
                    variant="secondary"
                    className="rounded-xl px-4 text-sm"
                  >
                    登录
                  </Button>
                )}
                <Button 
                  onClick={() => setShowSettings(true)}
                  variant="secondary"
                  className="w-12 px-0 flex items-center justify-center rounded-xl"
                >
                  <Settings size={20} />
                </Button>
              </div>
            </header>

            {/* 综合统计 */}
            <div>
              <ComprehensiveStats 
                entries={entries} 
                goals={goals} 
                knowledgePoints={knowledgePoints}
              />
            </div>

          </div>

          {/* 右侧功能栏 */}
          <div className="lg:col-span-1">
            <div className="sticky top-6 space-y-4">
              <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-3xl p-5 border border-slate-200/50 dark:border-slate-700/50 shadow-sm">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">功能模块</h2>
                <div className="space-y-3">
                  {/* 复盘记录 */}
                  <button
                    onClick={() => setView('REVIEW')}
                    className="group w-full bg-slate-50/50 dark:bg-slate-700/30 rounded-2xl p-4 border border-slate-200/50 dark:border-slate-700/50 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:border-indigo-200 dark:hover:border-indigo-800 transition-all text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 group-hover:scale-110 transition-transform">
                        <Sparkles size={20} className="text-indigo-600 dark:text-indigo-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-0.5">复盘记录</h3>
                        <p className="text-xs text-slate-600 dark:text-slate-400 truncate">
                          记录每日思考
                        </p>
                      </div>
                      <ChevronLeft size={16} className="text-slate-400 rotate-180 flex-shrink-0" />
                    </div>
                  </button>

                  {/* 目标追踪 */}
                  <button
                    onClick={() => setView('GOALS')}
                    className="group w-full bg-slate-50/50 dark:bg-slate-700/30 rounded-2xl p-4 border border-slate-200/50 dark:border-slate-700/50 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-200 dark:hover:border-blue-800 transition-all text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-900/30 group-hover:scale-110 transition-transform">
                        <Target size={20} className="text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-0.5">目标追踪</h3>
                        <p className="text-xs text-slate-600 dark:text-slate-400 truncate">
                          设定追踪目标
                        </p>
                      </div>
                      <ChevronLeft size={16} className="text-slate-400 rotate-180 flex-shrink-0" />
                    </div>
                  </button>

                  {/* 知识点 */}
                  <button
                    onClick={() => setView('KNOWLEDGE_POINTS')}
                    className="group w-full bg-slate-50/50 dark:bg-slate-700/30 rounded-2xl p-4 border border-slate-200/50 dark:border-slate-700/50 hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:border-purple-200 dark:hover:border-purple-800 transition-all text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-purple-100 dark:bg-purple-900/30 group-hover:scale-110 transition-transform">
                        <BookOpen size={20} className="text-purple-600 dark:text-purple-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-0.5">知识点</h3>
                        <p className="text-xs text-slate-600 dark:text-slate-400 truncate">
                          整理知识体系
                        </p>
                      </div>
                      <ChevronLeft size={16} className="text-slate-400 rotate-180 flex-shrink-0" />
                    </div>
                  </button>

                  {/* 思维导图 */}
                  <button
                    onClick={() => setView('MINDMAP')}
                    className="group w-full bg-slate-50/50 dark:bg-slate-700/30 rounded-2xl p-4 border border-slate-200/50 dark:border-slate-700/50 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:border-emerald-200 dark:hover:border-emerald-800 transition-all text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 group-hover:scale-110 transition-transform">
                        <Network size={20} className="text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-0.5">思维导图</h3>
                        <p className="text-xs text-slate-600 dark:text-slate-400 truncate">
                          可视化思考
                        </p>
                      </div>
                      <ChevronLeft size={16} className="text-slate-400 rotate-180 flex-shrink-0" />
                    </div>
                  </button>

                  {/* 统计 */}
                  <button
                    onClick={() => setView('STATISTICS')}
                    className="group w-full bg-slate-50/50 dark:bg-slate-700/30 rounded-2xl p-4 border border-slate-200/50 dark:border-slate-700/50 hover:bg-amber-50 dark:hover:bg-amber-900/20 hover:border-amber-200 dark:hover:border-amber-800 transition-all text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-900/30 group-hover:scale-110 transition-transform">
                        <BarChart3 size={20} className="text-amber-600 dark:text-amber-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-0.5">统计</h3>
                        <p className="text-xs text-slate-600 dark:text-slate-400 truncate">
                          数据统计分析
                        </p>
                      </div>
                      <ChevronLeft size={16} className="text-slate-400 rotate-180 flex-shrink-0" />
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

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
                </div>
            </div>
        </div>
      )}
    </div>
  );

  const renderNewEntry = () => {
    const config = FRAMEWORKS[activeFramework];
    const isFilled = config.prompts.every(p => (formData[p.key] || '').trim().length > 0);
    const totalChars = Object.values(formData).reduce((acc, curr) => acc + (curr || '').length, 0);

    return (
      <div className={`transition-all duration-500 ease-in-out ${isZenMode ? 'fixed inset-0 z-[60] bg-[#fdfbf7]' : 'max-w-4xl mx-auto px-6 py-8 min-h-screen flex flex-col bg-white/50'}`}>
        
        {/* Header Area */}
        <header className={`flex items-center justify-between mb-8 shrink-0 ${isZenMode ? 'p-6 max-w-4xl mx-auto w-full' : ''}`}>
          <div className="flex items-center">
            <button 
                onClick={() => isEditing && selectedEntry ? setView('ENTRY_DETAIL') : setView('REVIEW')}
                className={`flex items-center hover:text-indigo-600 transition-colors font-medium px-4 py-2 hover:bg-slate-100 rounded-lg -ml-4 ${isZenMode ? 'text-slate-400' : 'text-slate-500'}`}
            >
                <ChevronLeft size={20} className="mr-1" />
                {isZenMode ? null : (isEditing ? "取消" : "返回")}
            </button>
            {isZenMode && <span className="ml-4 text-slate-400 text-sm font-medium tracking-widest uppercase">Zen Mode</span>}
          </div>
          
          <div className="flex items-center gap-3">
             <button
                onClick={() => setIsZenMode(!isZenMode)}
                className={`p-2 rounded-full transition-all ${isZenMode ? 'bg-indigo-50 text-indigo-600' : 'bg-white text-slate-400 hover:text-indigo-600 hover:bg-slate-100 shadow-sm border border-slate-100'}`}
                title={isZenMode ? "退出专注模式" : "进入专注模式"}
             >
                 {isZenMode ? <Minimize2 size={20}/> : <Maximize2 size={20}/>}
             </button>

            {!isZenMode && !isEditing && (
                <div className="flex gap-1 bg-slate-100/80 p-1 rounded-xl backdrop-blur-sm overflow-x-auto max-w-[220px] sm:max-w-none no-scrollbar">
                    {Object.values(FRAMEWORKS).map(fw => (
                    <button
                        key={fw.id}
                        onClick={() => { setActiveFramework(fw.id); setFormData({}); }}
                        className={`px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-lg transition-all duration-300 whitespace-nowrap ${
                        activeFramework === fw.id 
                            ? 'bg-white text-indigo-600 shadow-sm' 
                            : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
                        }`}
                    >
                        {fw.label}
                    </button>
                    ))}
                </div>
            )}
          </div>
        </header>

        <div className={`flex-1 overflow-y-auto ${isZenMode ? 'px-6 pb-40' : 'pb-32'}`}>
            {!isZenMode && (
                <div className="mb-10 text-center animate-in slide-in-from-bottom-4 duration-500">
                    <h2 className="text-3xl font-extrabold text-slate-800 mb-2">{isEditing ? '编辑复盘' : config.label}</h2>
                    <p className="text-slate-500 max-w-lg mx-auto leading-relaxed text-sm">{config.description}</p>
                </div>
            )}

            <div className={`space-y-8 mx-auto ${isZenMode ? 'max-w-2xl mt-10' : 'max-w-3xl'}`}>
                {/* Tag Input - Only show in normal mode or if it has tags */}
                {(!isZenMode || tags.length > 0) && (
                    <div className={`relative group ${isZenMode ? 'opacity-50 hover:opacity-100 transition-opacity' : ''}`}>
                        <label className="block text-sm font-bold text-slate-700 mb-2 ml-1 flex items-center">
                            <Tag size={14} className="mr-2 text-indigo-500"/> 标签
                        </label>
                        <div className={`flex flex-wrap items-center gap-2 p-3 rounded-xl transition-all ${isZenMode ? 'bg-transparent border-b border-slate-200 rounded-none px-0' : 'bg-white border border-slate-200 shadow-sm focus-within:ring-2 focus-within:ring-indigo-100 focus-within:border-indigo-400'}`}>
                            {tags.map(tag => (
                                <span key={tag} className="flex items-center bg-indigo-50 text-indigo-600 px-2.5 py-1 rounded-lg text-sm font-medium animate-in zoom-in duration-200">
                                    {tag}
                                    <button onClick={() => removeTag(tag)} className="ml-1.5 hover:text-indigo-800"><X size={12}/></button>
                                </span>
                            ))}
                            <input 
                                type="text" 
                                value={tagInput}
                                onChange={(e) => setTagInput(e.target.value)}
                                onKeyDown={handleAddTag}
                                placeholder={tags.length === 0 ? "输入标签后回车..." : "添加..."}
                                className="flex-1 min-w-[100px] bg-transparent outline-none text-sm py-1 placeholder-slate-400"
                            />
                        </div>
                    </div>
                )}

                {/* Manual AI Analysis Fields - Only show in normal mode */}
                {!isZenMode && (
                    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-6 border border-indigo-100 shadow-sm">
                        <div className="flex items-center gap-2 mb-4">
                            <Lightbulb size={16} className="text-indigo-600" />
                            <h3 className="text-sm font-bold text-slate-700">复盘分析（可选）</h3>
                            <span className="text-xs text-slate-400 ml-auto">可手动填写或使用AI生成</span>
                        </div>
                        
                        <div className="space-y-4">
                            {/* 摘要 */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                                    摘要 <span className="text-slate-400 font-normal">(一句话总结)</span>
                                </label>
                                <input
                                    type="text"
                                    value={manualAnalysis.summary}
                                    onChange={(e) => setManualAnalysis(prev => ({ ...prev, summary: e.target.value }))}
                                    placeholder="例如：今天完成了重要项目，感觉很有成就感"
                                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400"
                                />
                            </div>

                            {/* 情绪评分 */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                                    情绪评分 <span className="text-slate-400 font-normal">(0-10分)</span>
                                </label>
                                <div className="flex items-center gap-3">
                                    <input
                                        type="number"
                                        min="0"
                                        max="10"
                                        value={manualAnalysis.sentimentScore}
                                        onChange={(e) => setManualAnalysis(prev => ({ 
                                            ...prev, 
                                            sentimentScore: e.target.value === '' ? '' : parseInt(e.target.value) || 0 
                                        }))}
                                        placeholder="5"
                                        className="w-20 px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400"
                                    />
                                    {typeof manualAnalysis.sentimentScore === 'number' && (
                                        <div className="flex-1 flex items-center gap-2">
                                            <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                                                <div 
                                                    className={`h-full transition-all ${
                                                        manualAnalysis.sentimentScore >= 8 ? 'bg-emerald-500' :
                                                        manualAnalysis.sentimentScore >= 5 ? 'bg-indigo-500' :
                                                        'bg-amber-500'
                                                    }`}
                                                    style={{ width: `${(manualAnalysis.sentimentScore / 10) * 100}%` }}
                                                />
                                            </div>
                                            <span className="text-xs text-slate-500 w-8">{manualAnalysis.sentimentScore}/10</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* 行动建议 */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                                    行动建议 <span className="text-slate-400 font-normal">(可添加多条)</span>
                                </label>
                                <div className="flex flex-wrap items-center gap-2 p-2 bg-white border border-slate-200 rounded-lg min-h-[44px]">
                                    {manualAnalysis.actionItems.map((item, idx) => (
                                        <span key={idx} className="flex items-center bg-indigo-50 text-indigo-600 px-2.5 py-1 rounded-lg text-xs font-medium">
                                            {item}
                                            <button onClick={() => removeActionItem(item)} className="ml-1.5 hover:text-indigo-800"><X size={12}/></button>
                                        </span>
                                    ))}
                                    <input 
                                        type="text" 
                                        value={actionItemInput}
                                        onChange={(e) => setActionItemInput(e.target.value)}
                                        onKeyDown={handleAddActionItem}
                                        placeholder={manualAnalysis.actionItems.length === 0 ? "输入建议后回车..." : "添加..."}
                                        className="flex-1 min-w-[120px] bg-transparent outline-none text-xs py-1 placeholder-slate-400"
                                    />
                                </div>
                            </div>

                            {/* 核心洞察 */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                                    核心洞察 <span className="text-slate-400 font-normal">(深刻的思考或感悟)</span>
                                </label>
                                <textarea
                                    value={manualAnalysis.keyInsight}
                                    onChange={(e) => setManualAnalysis(prev => ({ ...prev, keyInsight: e.target.value }))}
                                    placeholder="例如：坚持复盘让我更清楚地认识自己，每一次反思都是成长的机会"
                                    rows={3}
                                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400"
                                />
                            </div>
                        </div>
                    </div>
                )}

                {config.prompts.map(prompt => (
                    <div key={prompt.key} className="group relative animate-in fade-in duration-700">
                        <label className={`block font-bold text-slate-700 mb-3 ml-1 flex items-center justify-between ${isZenMode ? 'text-lg' : 'text-sm'}`}>
                            <span className="flex items-center">
                                {!isZenMode && <span className="w-1 h-4 bg-indigo-500 rounded-full mr-2 opacity-0 group-focus-within:opacity-100 transition-opacity"></span>}
                                {prompt.label}
                            </span>
                            <button 
                                onClick={() => handleVoiceInput(prompt.key)}
                                className={`p-1.5 rounded-full transition-all ${isListening === prompt.key ? 'bg-rose-100 text-rose-500 animate-pulse' : 'text-slate-300 hover:text-indigo-500 hover:bg-indigo-50'}`}
                                title="语音输入"
                            >
                                <Mic size={isZenMode ? 20 : 16} />
                            </button>
                        </label>
                        <textarea
                            value={formData[prompt.key] || ''}
                            onChange={(e) => handleInputChange(prompt.key, e.target.value)}
                            placeholder={prompt.placeholder}
                            className={`w-full rounded-xl outline-none transition-all resize-none leading-relaxed
                                ${isZenMode 
                                    ? 'bg-transparent text-xl text-slate-700 placeholder-slate-300 border-none p-0 focus:ring-0 min-h-[200px]' 
                                    : `p-4 border border-slate-200 bg-white text-slate-800 placeholder-slate-300 focus:ring-4 focus:ring-indigo-50/50 focus:border-indigo-400 shadow-sm ${prompt.minHeight} text-base`
                                }
                            `}
                        />
                        {isZenMode && <div className="h-px w-full bg-slate-200 mt-4" />}
                    </div>
                ))}
            </div>
        </div>

        <div className={`fixed bottom-0 left-0 right-0 p-4 transition-all duration-500 ${isZenMode ? 'bg-transparent' : 'bg-white/80 backdrop-blur-md border-t border-slate-100'} flex items-center justify-center z-40`}>
           <div className={`w-full max-w-3xl flex items-center justify-between gap-4 ${isZenMode ? 'opacity-20 hover:opacity-100 transition-opacity' : ''}`}>
                <div className={`text-slate-400 text-xs hidden sm:flex items-center ${isZenMode ? 'invisible' : ''}`}>
                    {totalChars > 0 && (
                        <span className="mr-4 flex items-center bg-slate-100 px-2 py-1 rounded-md text-slate-500">
                             <AlignLeft size={12} className="mr-1"/> {totalChars} 字
                        </span>
                    )}
                    {checkModelApiKey(selectedModel) && (
                        <>
                    <Sparkles size={14} className="mr-1 text-indigo-400" />
                            <span>AI 智能分析可用</span>
                        </>
                    )}
                </div>
                
                {/* Model Selector - Toggle Switch */}
                <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-700">
                    <button
                        onClick={() => setSelectedModel(AIModel.OPENROUTER_OLMO)}
                        className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-200 flex items-center gap-1.5 ${
                            selectedModel === AIModel.OPENROUTER_OLMO
                                ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                        }`}
                        title="OpenRouter - Olmo 3 32B Think"
                    >
                        <Sparkles size={12} className={selectedModel === AIModel.OPENROUTER_OLMO ? 'text-indigo-500' : 'text-slate-400'} />
                        <span>OpenRouter</span>
                    </button>
                    <button
                        onClick={() => setSelectedModel(AIModel.ZHIPU_GLM45)}
                        className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-200 flex items-center gap-1.5 ${
                            selectedModel === AIModel.ZHIPU_GLM45
                                ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                        }`}
                        title="智谱AI - GLM-4.5-Flash"
                    >
                        <Sparkles size={12} className={selectedModel === AIModel.ZHIPU_GLM45 ? 'text-indigo-500' : 'text-slate-400'} />
                        <span>智谱AI</span>
                    </button>
                </div>
                
                <div className="flex items-center gap-3 flex-1 sm:flex-none justify-end">
                    {/* 直接保存按钮 */}
                    <Button 
                        onClick={handleSubmitWithoutAI} 
                        disabled={!isFilled || isAnalyzing || isSaving} 
                        loading={isSaving}
                        size="lg"
                        icon={<Save size={18} />}
                        className={`rounded-xl px-6 shadow-lg transition-all ${
                            isFilled && !isAnalyzing && !isSaving 
                                ? "bg-slate-600 hover:bg-slate-700 shadow-slate-200 hover:-translate-y-1" 
                                : "bg-slate-200 text-slate-400 shadow-none"
                        }`}
                    >
                        {isSaving ? '保存中...' : isEditing ? '保存修改' : '直接保存'}
                    </Button>
                    
                    {/* AI分析并提交按钮（仅在配置了API_KEY时显示） */}
                    {checkModelApiKey(selectedModel) && (
                <Button 
                    onClick={handleSubmit} 
                            disabled={!isFilled || isAnalyzing || isSaving} 
                    loading={isAnalyzing}
                    size="lg"
                            icon={<Sparkles size={18} />}
                            className={`rounded-xl px-6 shadow-lg transition-all ${
                                isFilled && !isAnalyzing && !isSaving
                                    ? "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200 hover:-translate-y-1" 
                                    : "bg-slate-200 text-slate-400 shadow-none"
                    }`}
                >
                            {isAnalyzing ? '分析中...' : isEditing ? '重新分析' : '生成报告'}
                </Button>
                    )}
                </div>
            </div>
        </div>
      </div>
    );
  };

  const renderEntryDetail = () => {
    if (!selectedEntry) return null;
    const config = FRAMEWORKS[selectedEntry.framework];

    return (
      <div className="max-w-5xl mx-auto px-6 py-10 relative">
        {/* Share Modal */}
        {showShareModal && (
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4" onClick={() => setShowShareModal(false)}>
                <div className="relative w-full max-w-sm animate-in zoom-in-95 duration-300" onClick={e => e.stopPropagation()}>
                    <div className="bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-1.5 rounded-3xl shadow-2xl">
                         <div className="bg-white/95 backdrop-blur-xl rounded-[22px] p-8 text-center relative overflow-hidden">
                             {/* Decorative Background */}
                             <div className="absolute -top-20 -left-20 w-40 h-40 bg-indigo-300 rounded-full blur-3xl opacity-20"></div>
                             <div className="absolute top-10 -right-10 w-32 h-32 bg-pink-300 rounded-full blur-3xl opacity-20"></div>
                             
                             <Quote size={40} className="text-indigo-200 mx-auto mb-6 fill-indigo-50" />
                             
                             <h2 className="text-xl font-serif font-bold text-slate-800 leading-relaxed mb-6 italic">
                                "{selectedEntry.aiAnalysis?.keyInsight || "复盘是最好的成长。"}"
                             </h2>
                             
                             <div className="w-10 h-1 bg-gradient-to-r from-indigo-400 to-pink-400 mx-auto rounded-full mb-6"></div>
                             
                             <p className="text-slate-500 text-sm mb-2">{selectedEntry.aiAnalysis?.summary}</p>
                             <p className="text-slate-400 text-xs font-medium uppercase tracking-widest">
                                {new Date(selectedEntry.date).toLocaleDateString()} · ReflectAI
                             </p>
                         </div>
                    </div>
                    <div className="mt-4 text-center">
                        <p className="text-white/80 text-xs mb-2">截图保存分享</p>
                        <button onClick={() => setShowShareModal(false)} className="bg-white/10 hover:bg-white/20 text-white rounded-full p-2 backdrop-blur-sm transition-colors">
                            <X size={24}/>
                        </button>
                    </div>
                </div>
            </div>
        )}

        <header className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
          <div className="flex items-start sm:items-center gap-4">
            <button 
                onClick={() => setView('DASHBOARD')}
                className="p-2 rounded-full bg-white border border-slate-100 shadow-sm hover:text-indigo-600 text-slate-500 transition-all shrink-0"
            >
                <ChevronLeft size={20} />
            </button>
            <div>
                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-800 leading-tight">
                    {selectedEntry.aiAnalysis?.summary || "复盘详情"}
                </h1>
                <div className="flex items-center gap-2 mt-2 flex-wrap text-sm text-slate-500">
                    <span>{new Date(selectedEntry.date).toLocaleDateString('zh-CN')}</span>
                    <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                    <span>{config.label}</span>
                </div>
            </div>
          </div>

          <div className="flex gap-2 self-end sm:self-auto">
            <button onClick={() => setShowShareModal(true)} className="p-2 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors" title="生成分享卡片"><Share2 size={18} /></button>
            <div className="w-px h-6 bg-slate-200 mx-1"></div>
            <button onClick={() => handleStartEdit(selectedEntry)} className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"><PenLine size={18} /></button>
            <button onClick={() => handleCopyMarkdown(selectedEntry)} className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"><Copy size={18} /></button>
            <button 
              onClick={() => handleExportImage(selectedEntry)} 
              className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              title="导出为图片"
            >
              <Download size={18} />
            </button>
            <button onClick={() => handleDeleteEntry(selectedEntry.id)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-lg transition-colors"><Trash2 size={18} /></button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pb-20">
            <div className="lg:col-span-7 space-y-6">
                {Object.entries(selectedEntry.content).map(([key, value]) => {
                    const prompt = config.prompts.find(p => p.key === key);
                    return (
                        <div key={key} className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm">
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                                {prompt?.label || key}
                            </h3>
                            <p className="text-slate-700 whitespace-pre-wrap leading-loose">
                                {value}
                            </p>
                        </div>
                    );
                })}
            </div>

            <div className="lg:col-span-5 space-y-6">
                {selectedEntry.aiAnalysis ? (
                    <div className="sticky top-24 space-y-6">
                        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-8 text-white shadow-xl shadow-slate-200 relative overflow-hidden group">
                             <Quote size={60} className="absolute -top-4 -right-4 text-white/5 rotate-12 group-hover:rotate-0 transition-transform duration-500" />
                            <div className="flex items-center gap-2 mb-4 text-indigo-300 text-xs font-bold uppercase tracking-widest relative z-10">
                                <Lightbulb size={14} className="text-yellow-400" /> 核心洞察
                            </div>
                            <p className="text-lg font-medium leading-relaxed relative z-10 font-serif opacity-90">
                                "{selectedEntry.aiAnalysis.keyInsight}"
                            </p>
                        </div>

                        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
                            <h3 className="font-bold text-slate-800 mb-4 flex items-center text-sm">
                                <CheckCircle2 size={16} className="text-emerald-500 mr-2" />
                                建议行动
                            </h3>
                            <ul className="space-y-3">
                                {selectedEntry.aiAnalysis.actionItems.map((item, i) => (
                                    <li key={i} className="flex items-start text-slate-600 bg-slate-50 p-3 rounded-xl text-sm leading-relaxed">
                                        <span className="font-bold text-indigo-500 mr-2">{i+1}.</span>
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        
                        <div className="flex justify-center">
                            <div className={`px-4 py-2 rounded-full border text-sm font-bold flex items-center gap-2 ${
                                selectedEntry.aiAnalysis.sentimentScore >= 8 ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                                selectedEntry.aiAnalysis.sentimentScore >= 5 ? "bg-indigo-50 text-indigo-600 border-indigo-100" :
                                "bg-amber-50 text-amber-600 border-amber-100"
                            }`}>
                                状态评分: {selectedEntry.aiAnalysis.sentimentScore} / 10
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="p-8 bg-slate-50 rounded-3xl text-center text-slate-500 border border-dashed border-slate-200">
                        <Button variant="secondary" onClick={() => handleStartEdit(selectedEntry)}>
                            生成 AI 分析
                        </Button>
                    </div>
                )}
            </div>
        </div>
      </div>
    );
  };

  const renderGoals = () => (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">目标追踪</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2">设定目标，让复盘更有方向</p>
        </div>
        <button
          onClick={() => setView('DASHBOARD')}
          className="p-2 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
        >
          <ChevronLeft size={20} className="text-slate-500 dark:text-slate-400" />
        </button>
      </div>
      <GoalTracker
        goals={goals}
        onAddGoal={handleAddGoal}
        onUpdateGoal={handleUpdateGoal}
        onDeleteGoal={handleDeleteGoal}
      />
    </div>
  );


  const renderStatistics = () => (
    <Statistics 
      entries={entries}
      goals={goals}
      knowledgePoints={knowledgePoints}
      selectedModel={selectedModel}
      onBack={() => setView('DASHBOARD')}
    />
  );

  const renderKnowledgePoints = () => (
    <div className="max-w-6xl mx-auto px-6 py-10">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">知识点</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2">记录和整理你的知识卡片</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setView('DASHBOARD')}
            className="p-2 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            <ChevronLeft size={20} className="text-slate-500 dark:text-slate-400" />
          </button>
          <Button
            onClick={handleCreateKnowledgePoint}
            icon={<Plus size={20} />}
            size="lg"
            className="bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200/50 rounded-xl px-6"
          >
            新建知识点
          </Button>
        </div>
      </header>

      {/* Search and Filter */}
      <div className="mb-8 flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="搜索知识点..."
            value={knowledgePointSearchQuery}
            onChange={(e) => setKnowledgePointSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all dark:text-slate-100"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 sm:pb-0">
          <button
            onClick={() => setKnowledgePointCategoryFilter('ALL')}
            className={`px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap border transition-all ${
              knowledgePointCategoryFilter === 'ALL'
                ? 'bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-200'
                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'
            }`}
          >
            全部
          </button>
          {availableCategories.map(category => (
            <button
              key={category}
              onClick={() => setKnowledgePointCategoryFilter(category)}
              className={`px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap border transition-all ${
                knowledgePointCategoryFilter === category
                  ? 'bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-200'
                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Knowledge Points Grid */}
      {isLoadingKnowledgePoints ? (
        <div className="text-center py-20">
          <div className="inline-flex items-center gap-2 text-indigo-600">
            <div className="animate-spin"><Sparkles size={20} /></div>
            <span className="font-medium">加载中...</span>
          </div>
        </div>
      ) : filteredKnowledgePoints.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-3xl border border-dashed border-slate-200 dark:border-slate-700 shadow-sm">
          <BookOpen className="mx-auto text-slate-300 dark:text-slate-600 mb-4" size={48} />
          <h3 className="text-slate-600 dark:text-slate-400 font-medium mb-1">暂无知识点</h3>
          <p className="text-slate-400 dark:text-slate-500 text-xs mb-6">开始创建你的第一个知识点吧</p>
          <Button onClick={handleCreateKnowledgePoint} variant="secondary">新建知识点</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20 animate-in fade-in duration-500">
          {filteredKnowledgePoints.map(kp => (
            <KnowledgePointCard
              key={kp.id}
              knowledgePoint={kp}
              onClick={() => handleViewKnowledgePoint(kp)}
              onEdit={(e) => {
                e.stopPropagation();
                setSelectedKnowledgePoint(kp);
                setView('KNOWLEDGE_POINT_EDIT');
              }}
              onDelete={(e) => {
                e.stopPropagation();
                handleDeleteKnowledgePoint(kp.id);
              }}
            />
          ))}
        </div>
      )}
    </div>
  );

  const renderKnowledgePointDetail = () => {
    if (!selectedKnowledgePoint) return null;
    return (
      <KnowledgePointDetail
        knowledgePoint={selectedKnowledgePoint}
        onEdit={handleEditKnowledgePoint}
        onDelete={() => handleDeleteKnowledgePoint(selectedKnowledgePoint.id)}
        onBack={() => {
          setSelectedKnowledgePoint(null);
          setView('KNOWLEDGE_POINTS');
        }}
      />
    );
  };

  const renderKnowledgePointEdit = () => (
    <KnowledgePointEditor
      knowledgePoint={selectedKnowledgePoint || undefined}
      onSave={handleSaveKnowledgePoint}
      onCancel={() => {
        if (selectedKnowledgePoint) {
          setView('KNOWLEDGE_POINT_DETAIL');
        } else {
          setSelectedKnowledgePoint(null);
          setView('KNOWLEDGE_POINTS');
        }
      }}
      onDelete={selectedKnowledgePoint ? handleDeleteKnowledgePoint : undefined}
    />
  );

  const renderMindMap = () => (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">思维导图</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2">可视化你的目标和计划</p>
        </div>
        <button
          onClick={() => setView('DASHBOARD')}
          className="p-2 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
        >
          <ChevronLeft size={20} className="text-slate-500 dark:text-slate-400" />
        </button>
      </div>
      <div className="h-[calc(100vh-200px)] min-h-[600px]">
        <MindMap 
          title="思维导图"
          description="点击节点进行编辑、添加或删除"
          storageKey="reflect_ai_mindmap"
        />
      </div>
    </div>
  );

  // 显示加载状态
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-slate-50/50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 mb-4 shadow-lg animate-pulse">
            <Sparkles size={28} className="text-white" />
          </div>
          <p className="text-slate-500 text-sm">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 font-sans text-slate-900 selection:bg-indigo-100 selection:text-indigo-900">
      {/* Auth Modal */}
      <AuthModal 
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={handleAuthSuccess}
      />

      {/* Profile Modal */}
      <ProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        user={currentUser}
        onUpdate={handleProfileUpdate}
      />

      {/* Advanced Search Modal */}
      <AdvancedSearch
        isOpen={showAdvancedSearch}
        onClose={() => setShowAdvancedSearch(false)}
        onSearch={(filters) => {
          setSearchFilters(filters);
          setSearchQuery(filters.query);
          if (filters.framework) {
            setFrameworkFilter(filters.framework);
          }
        }}
        availableTags={availableTags}
      />

      {/* Toast */}
      {showToast && (
        <div className={`fixed top-6 right-6 z-[100] px-6 py-3 rounded-xl shadow-xl flex items-center gap-3 animate-bounce-in ${showToast.type === 'error' ? 'bg-rose-500 text-white' : 'bg-slate-800 text-white'}`}>
            {showToast.type === 'success' ? <CheckCircle2 size={18} /> : <X size={18} />}
            <span className="font-medium text-sm">{showToast.msg}</span>
        </div>
      )}

      {view === 'DASHBOARD' && renderDashboard()}
      {view === 'REVIEW' && renderReview()}
      {view === 'NEW_ENTRY' && renderNewEntry()}
      {view === 'ENTRY_DETAIL' && renderEntryDetail()}
      {view === 'GOALS' && renderGoals()}
      {view === 'STATISTICS' && renderStatistics()}
      {view === 'KNOWLEDGE_POINTS' && renderKnowledgePoints()}
      {view === 'KNOWLEDGE_POINT_DETAIL' && renderKnowledgePointDetail()}
      {view === 'KNOWLEDGE_POINT_EDIT' && renderKnowledgePointEdit()}
      {view === 'MINDMAP' && renderMindMap()}
      
      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes bounce-in {
            0% { transform: translateY(-20px); opacity: 0; }
            50% { transform: translateY(5px); opacity: 1; }
            100% { transform: translateY(0); }
        }
        .animate-bounce-in { animation: bounce-in 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
      `}</style>
    </div>
  );
};

export default App;