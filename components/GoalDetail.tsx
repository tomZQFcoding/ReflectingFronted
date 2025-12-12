import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, CheckCircle2, Circle, Trash2, Calendar, Clock, TrendingUp, X } from 'lucide-react';
import { Goal } from '../types/goal';
import { goalTaskApi, GoalTaskVO } from '../services/goalTaskApi';
import { Button } from './Button';
import { AlertDialog } from './AlertDialog';

interface GoalDetailProps {
  goal: Goal;
  onBack: () => void;
  onUpdateGoal: (id: string, updates: Partial<Goal>) => Promise<void> | void;
}

export const GoalDetail: React.FC<GoalDetailProps> = ({ goal, onBack, onUpdateGoal }) => {
  const [tasks, setTasks] = useState<GoalTaskVO[]>([]);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'timeline' | 'calendar'>('timeline');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [showAddTask, setShowAddTask] = useState(false);
  const [newTaskContent, setNewTaskContent] = useState('');
  const [newTaskDate, setNewTaskDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [progressValue, setProgressValue] = useState<number>(goal.progress || 0);
  const [savingProgress, setSavingProgress] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<number | null>(null);
  const [alertDialog, setAlertDialog] = useState<{isOpen: boolean, title: string, message: string, type?: 'success' | 'error' | 'warning' | 'info'}>({
    isOpen: false,
    title: '',
    message: '',
    type: 'info',
  });

  // 加载任务
  const loadTasks = async () => {
    setLoading(true);
    try {
      const tasksData = await goalTaskApi.getTasksByGoalId(parseInt(goal.id));
      setTasks(tasksData);
    } catch (error) {
      console.error('Failed to load tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
    setProgressValue(goal.progress || 0);
  }, [goal.id, goal.progress]);

  // 添加任务
  const handleAddTask = async () => {
    if (!newTaskContent.trim() || !newTaskDate) return;

    try {
      await goalTaskApi.addTask({
        goalId: parseInt(goal.id),
        taskDate: newTaskDate,
        content: newTaskContent.trim(),
      });
      setNewTaskContent('');
      setNewTaskDate(new Date().toISOString().split('T')[0]);
      setShowAddTask(false);
      await loadTasks();
    } catch (error) {
      console.error('Failed to add task:', error);
      setAlertDialog({
        isOpen: true,
        title: '添加失败',
        message: '添加任务失败，请重试',
        type: 'error',
      });
    }
  };

  // 切换任务状态
  const handleToggleTask = async (task: GoalTaskVO) => {
    try {
      await goalTaskApi.updateTask({
        id: task.id,
        status: task.status === 'completed' ? 'pending' : 'completed',
      });
      await loadTasks();
    } catch (error) {
      console.error('Failed to update task:', error);
      setAlertDialog({
        isOpen: true,
        title: '更新失败',
        message: '更新任务失败，请重试',
        type: 'error',
      });
    }
  };

  // 删除任务
  const handleDeleteTask = async (taskId: number) => {
    setTaskToDelete(taskId);
  };

  // 确认删除任务
  const confirmDeleteTask = async () => {
    if (!taskToDelete) return;

    try {
      await goalTaskApi.deleteTask(taskToDelete);
      await loadTasks();
      setTaskToDelete(null);
    } catch (error) {
      console.error('Failed to delete task:', error);
      setAlertDialog({
        isOpen: true,
        title: '删除失败',
        message: '删除任务失败，请重试',
        type: 'error',
      });
      setTaskToDelete(null);
    }
  };

  // 按日期分组任务
  const tasksByDate = tasks.reduce((acc, task) => {
    // 处理日期格式，可能是 "yyyy-MM-dd" 或 "yyyy-MM-ddTHH:mm:ss"
    const date = task.taskDate.includes('T') ? task.taskDate.split('T')[0] : task.taskDate;
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(task);
    return acc;
  }, {} as Record<string, GoalTaskVO[]>);

  // 获取日期排序后的键
  const sortedDates = Object.keys(tasksByDate).sort((a, b) => 
    new Date(b).getTime() - new Date(a).getTime()
  );

  // 计算统计信息
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  // 保存进度（手动百分比或任务计算）
  const handleSaveProgress = async (value: number, autoStatus?: Goal['status']) => {
    setSavingProgress(true);
    try {
      const newStatus = autoStatus
        ? autoStatus
        : value >= 100
        ? 'completed'
        : goal.status === 'completed' && value < 100
        ? 'active'
        : goal.status;
      await onUpdateGoal(goal.id, { progress: value, status: newStatus });
    } finally {
      setSavingProgress(false);
    }
  };


  // 获取最近7天的任务统计
  const getRecentStats = () => {
    const today = new Date();
    const stats = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const dayTasks = tasksByDate[dateStr] || [];
      const completed = dayTasks.filter(t => t.status === 'completed').length;
      stats.push({
        date: dateStr,
        total: dayTasks.length,
        completed,
      });
    }
    return stats;
  };

  const recentStats = getRecentStats();

  return (
    <>
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
      `}</style>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-indigo-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* iOS风格导航栏 */}
        <div className="sticky top-0 z-40 mb-6 -mx-4 sm:-mx-6 px-4 sm:px-6 pt-4 pb-2 backdrop-blur-xl bg-white/70 dark:bg-slate-900/70 border-b border-slate-200/50 dark:border-slate-700/50">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all active:scale-95"
          >
            <div className="p-1.5 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
              <ArrowLeft size={18} />
            </div>
            <span className="font-medium">返回</span>
          </button>
        </div>

        {/* 头部卡片 - iOS风格 */}
        <div className="mb-6">
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-3xl shadow-sm border border-slate-200/50 dark:border-slate-700/50 p-6 sm:p-8">
            <div className="mb-6">
              <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900 dark:text-slate-100 mb-3 leading-tight">
                {goal.title}
              </h1>
              {goal.description && (
                <p className="text-slate-600 dark:text-slate-400 mb-4 leading-relaxed">
                  {goal.description}
                </p>
              )}
              <div className="flex flex-wrap items-center gap-4 text-sm">
                {goal.targetDate && (
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-700/50 text-slate-600 dark:text-slate-400">
                    <Calendar size={14} />
                    <span>{new Date(goal.targetDate).toLocaleDateString('zh-CN')}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                  <TrendingUp size={14} />
                  <span>{goal.progress}%</span>
                </div>
              </div>
            </div>

            {/* 统计卡片 - iOS风格 */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-900/20 dark:to-blue-800/10 rounded-2xl p-4 border border-blue-200/50 dark:border-blue-800/30">
                <div className="text-2xl font-semibold text-blue-600 dark:text-blue-400 mb-1">{totalTasks}</div>
                <div className="text-xs text-slate-600 dark:text-slate-400 font-medium">总任务</div>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-900/20 dark:to-green-800/10 rounded-2xl p-4 border border-green-200/50 dark:border-green-800/30">
                <div className="text-2xl font-semibold text-green-600 dark:text-green-400 mb-1">{completedTasks}</div>
                <div className="text-xs text-slate-600 dark:text-slate-400 font-medium">已完成</div>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-900/20 dark:to-purple-800/10 rounded-2xl p-4 border border-purple-200/50 dark:border-purple-800/30">
                <div className="text-2xl font-semibold text-purple-600 dark:text-purple-400 mb-1">{completionRate}%</div>
                <div className="text-xs text-slate-600 dark:text-slate-400 font-medium">完成率</div>
              </div>
            </div>

        {/* 进度控制 - 支持手动设置或按任务计算 */}
        <div className="mt-6 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-3xl shadow-sm border border-slate-200/50 dark:border-slate-700/50 p-4 sm:p-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-2">目标进度</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                可手动调整，或点击「按任务计算」自动更新
              </p>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min={0}
                max={100}
                value={progressValue}
                onChange={(e) => setProgressValue(parseInt(e.target.value) || 0)}
                className="w-40 accent-indigo-500"
              />
              <input
                type="number"
                min={0}
                max={100}
                value={progressValue}
                onChange={(e) => {
                  const v = Math.min(100, Math.max(0, parseInt(e.target.value) || 0));
                  setProgressValue(v);
                }}
                className="w-16 px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-right"
              />
              <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">%</span>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-3">
            <Button
              onClick={() => handleSaveProgress(progressValue)}
              disabled={savingProgress}
              className="rounded-xl px-4 py-2"
            >
              {savingProgress ? '保存中...' : '保存进度'}
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                const autoProgress = completionRate;
                setProgressValue(autoProgress);
                handleSaveProgress(autoProgress, autoProgress >= 100 ? 'completed' : undefined);
              }}
              disabled={savingProgress}
              className="rounded-xl px-4 py-2"
            >
              按任务计算（{completionRate}%）
            </Button>
          </div>
        </div>
          </div>
        </div>

        {/* 视图切换和添加任务 - iOS风格 */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-6">
          <div className="flex gap-1.5 bg-slate-100 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl p-1.5 border border-slate-200/50 dark:border-slate-700/50">
            <button
              onClick={() => setViewMode('timeline')}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                viewMode === 'timeline'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              时间线
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                viewMode === 'calendar'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              日历
            </button>
          </div>

          <button
            onClick={() => setShowAddTask(true)}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white rounded-2xl shadow-lg shadow-blue-500/25 transition-all active:scale-95 font-medium"
          >
            <Plus size={18} />
            <span>添加任务</span>
          </button>
        </div>

        {/* 添加任务模态框 - iOS风格 */}
        {showAddTask && (
          <div 
            className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 transition-opacity duration-300"
            onClick={() => {
              setShowAddTask(false);
              setNewTaskContent('');
            }}
          >
            <div 
              className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl rounded-t-3xl sm:rounded-3xl shadow-2xl w-full max-w-md sm:mx-4 transform transition-all duration-300"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-slate-200/50 dark:border-slate-700/50">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">添加任务</h2>
                  <button
                    onClick={() => {
                      setShowAddTask(false);
                      setNewTaskContent('');
                    }}
                    className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-5">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    任务日期
                  </label>
                  <input
                    type="date"
                    value={newTaskDate}
                    onChange={(e) => setNewTaskDate(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-2xl bg-slate-50 dark:bg-slate-700/50 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    任务内容
                  </label>
                  <textarea
                    value={newTaskContent}
                    onChange={(e) => setNewTaskContent(e.target.value)}
                    placeholder="输入任务内容..."
                    rows={4}
                    className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-2xl bg-slate-50 dark:bg-slate-700/50 text-slate-900 dark:text-slate-100 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => {
                      setShowAddTask(false);
                      setNewTaskContent('');
                    }}
                    className="flex-1 px-4 py-3 rounded-2xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 font-medium transition-all active:scale-95"
                  >
                    取消
                  </button>
                  <button
                    onClick={handleAddTask}
                    className="flex-1 px-4 py-3 rounded-2xl bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white font-medium shadow-lg shadow-blue-500/25 transition-all active:scale-95"
                  >
                    添加
                  </button>
                </div>
              </div>
            </div>
          </div>
         )}

         {/* 删除确认弹窗 - iOS风格 */}
         {taskToDelete !== null && (
           <div 
             className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 transition-opacity duration-300"
             onClick={() => setTaskToDelete(null)}
           >
             <div 
               className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl rounded-3xl shadow-2xl w-full max-w-sm mx-4 transform transition-all duration-300"
               onClick={(e) => e.stopPropagation()}
             >
               <div className="p-6">
                 <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
                   删除任务
                 </h3>
                 <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
                   确定要删除这个任务吗？此操作无法撤销。
                 </p>
                 <div className="flex gap-3">
                   <button
                     onClick={() => setTaskToDelete(null)}
                     className="flex-1 px-4 py-3 rounded-2xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 font-medium transition-all active:scale-95"
                   >
                     取消
                   </button>
                   <button
                     onClick={confirmDeleteTask}
                     className="flex-1 px-4 py-3 rounded-2xl bg-red-500 hover:bg-red-600 active:bg-red-700 text-white font-medium shadow-lg shadow-red-500/25 transition-all active:scale-95"
                   >
                     删除
                   </button>
                 </div>
               </div>
             </div>
           </div>
         )}

         {/* 提示弹窗 */}
         <AlertDialog
           isOpen={alertDialog.isOpen}
           title={alertDialog.title}
           message={alertDialog.message}
           type={alertDialog.type}
           onClose={() => setAlertDialog({ ...alertDialog, isOpen: false })}
         />

         {/* 时间线视图 - 小卡片居中（去除前置圆点） */}
        {viewMode === 'timeline' && (
          <div className="relative py-4">
            {/* 中心竖线 */}
            <div className="hidden md:block absolute inset-y-0 left-1/2 w-px bg-slate-200 dark:bg-slate-700 pointer-events-none" />
            <div className="space-y-6 relative z-10">
              {loading ? (
                <div className="text-center py-16 text-slate-500 dark:text-slate-400">加载中...</div>
              ) : sortedDates.length === 0 ? (
                <div className="text-center py-16 bg-white/90 dark:bg-slate-800/90 backdrop-blur-2xl rounded-3xl shadow-lg border border-slate-200/60 dark:border-slate-700/60">
                  <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-slate-100 dark:bg-slate-700/50 flex items-center justify-center">
                    <Clock size={24} className="text-slate-400 dark:text-slate-500" />
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 font-medium mb-1">还没有任务</p>
                  <p className="text-sm text-slate-500 dark:text-slate-500">点击“添加任务”开始吧</p>
                </div>
              ) : (
                sortedDates.map((date, dateIndex) => {
                  const dateTasks = tasksByDate[date];
                  const dateObj = new Date(date);
                  const isToday = date === new Date().toISOString().split('T')[0];
                  const isFuture = dateObj > new Date();
                  const isLeft = dateIndex % 2 === 0;

                  return (
                    <div
                      key={date}
                      className="md:flex md:items-center md:justify-center"
                      style={{ animation: `fadeInUp 0.35s ease-out ${dateIndex * 0.04}s both` }}
                    >
                      {/* 卡片容器 */}
                      <div
                        className={`md:w-[calc(50%-24px)] ${isLeft ? 'md:mr-auto' : 'md:ml-auto'}`}
                      >
                        <div className="bg-white/95 dark:bg-slate-800/95 border border-slate-200/60 dark:border-slate-700/60 rounded-2xl shadow-sm px-4 py-3">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                                {dateObj.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })}
                              </span>
                              {isToday && (
                                <span className="px-2 py-0.5 text-[11px] font-semibold bg-blue-500 text-white rounded-full">
                                  今天
                                </span>
                              )}
                              {isFuture && !isToday && (
                                <span className="px-2 py-0.5 text-[11px] font-semibold bg-emerald-500 text-white rounded-full">
                                  计划
                                </span>
                              )}
                            </div>
                            <span className="text-xs text-slate-500 dark:text-slate-400">
                              {dateTasks.filter(t => t.status === 'completed').length}/{dateTasks.length}
                            </span>
                          </div>

                          <div className="space-y-2">
                            {dateTasks.map((task, taskIndex) => (
                              <div
                                key={task.id}
                                className={`group flex items-start gap-3 p-3 rounded-xl border transition-all ${
                                  task.status === 'completed'
                                    ? 'bg-emerald-50/60 dark:bg-emerald-900/15 border-emerald-200/60 dark:border-emerald-800/40'
                                    : 'bg-slate-50/60 dark:bg-slate-700/30 border-slate-200/60 dark:border-slate-700/50 hover:bg-slate-100/80 dark:hover:bg-slate-700/50'
                                }`}
                                style={{ animation: `fadeIn 0.3s ease-out ${(dateIndex * 0.04 + taskIndex * 0.03)}s both` }}
                              >
                                <button
                                  onClick={() => handleToggleTask(task)}
                                  className="mt-0.5 flex-shrink-0 active:scale-90 transition-all"
                                >
                                  {task.status === 'completed' ? (
                                    <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center shadow-sm shadow-emerald-500/30">
                                      <CheckCircle2 size={14} className="text-white" strokeWidth={2.5} />
                                    </div>
                                  ) : (
                                    <div className="w-5 h-5 rounded-full border-2 border-slate-300 dark:border-slate-600 hover:border-blue-500 dark:hover:border-blue-500 transition-colors" />
                                  )}
                                </button>

                                <div className="flex-1 min-w-0">
                                  <p
                                    className={`text-sm leading-relaxed font-medium ${
                                      task.status === 'completed'
                                        ? 'line-through text-slate-500 dark:text-slate-500'
                                        : 'text-slate-900 dark:text-slate-100'
                                    }`}
                                  >
                                    {task.content}
                                  </p>
                                  {task.completedTime && (
                                    <div className="flex items-center gap-1.5 mt-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                                      <Clock size={11} className="opacity-70" />
                                      <span>
                                        {new Date(task.completedTime).toLocaleString('zh-CN', {
                                          month: 'short',
                                          day: 'numeric',
                                          hour: '2-digit',
                                          minute: '2-digit',
                                        })}
                                      </span>
                                    </div>
                                  )}
                                </div>

                                <button
                                  onClick={() => handleDeleteTask(task.id)}
                                  className="flex-shrink-0 p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all active:scale-90 opacity-0 group-hover:opacity-100"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* 日历视图 - iOS风格优化 */}
        {viewMode === 'calendar' && (
          <div className="space-y-6">
            {/* 最近7天日历卡片 - iOS风格 */}
            <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-2xl rounded-[2rem] shadow-lg shadow-slate-200/50 dark:shadow-black/20 border border-slate-200/60 dark:border-slate-700/60 p-6">
              <div className="mb-5">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-5 tracking-tight">
                  最近7天
                </h3>
                <div className="grid grid-cols-7 gap-2.5">
                  {recentStats.map((stat, index) => {
                    const dateObj = new Date(stat.date);
                    const isToday = stat.date === new Date().toISOString().split('T')[0];
                    const dayName = dateObj.toLocaleDateString('zh-CN', { weekday: 'short' });
                    const dayNum = dateObj.getDate();
                    const isWeekend = dateObj.getDay() === 0 || dateObj.getDay() === 6;
                    const allCompleted = stat.total > 0 && stat.completed === stat.total;

                    return (
                      <button
                        key={stat.date}
                        onClick={() => setSelectedDate(stat.date)}
                        className={`relative p-3 rounded-2xl border text-center transition-all duration-200 active:scale-95 ${
                          isToday
                            ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white border-blue-600 shadow-lg shadow-blue-500/30 scale-105'
                            : selectedDate === stat.date
                            ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-300 dark:border-blue-700'
                            : 'bg-slate-50/80 dark:bg-slate-700/50 border-slate-200/60 dark:border-slate-700/60 hover:bg-slate-100 dark:hover:bg-slate-700'
                        }`}
                        style={{
                          animation: `fadeIn 0.3s ease-out ${index * 0.05}s both`
                        }}
                      >
                        {/* 完成状态指示器 */}
                        {allCompleted && !isToday && (
                          <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-emerald-500 shadow-sm" />
                        )}
                        
                        <div className={`text-[11px] mb-1.5 font-semibold ${
                          isToday 
                            ? 'text-blue-100' 
                            : isWeekend 
                            ? 'text-slate-400 dark:text-slate-500' 
                            : 'text-slate-500 dark:text-slate-400'
                        }`}>
                          {dayName}
                        </div>
                        <div className={`text-lg font-bold mb-1.5 ${
                          isToday 
                            ? 'text-white' 
                            : 'text-slate-900 dark:text-slate-100'
                        }`}>
                          {dayNum}
                        </div>
                        <div className={`text-[10px] font-semibold ${
                          isToday 
                            ? 'text-blue-100' 
                            : stat.total > 0
                            ? 'text-slate-600 dark:text-slate-400'
                            : 'text-slate-400 dark:text-slate-500'
                        }`}>
                          {stat.total > 0 ? `${stat.completed}/${stat.total}` : '—'}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* 选中日期的任务卡片 - iOS风格 */}
            <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-2xl rounded-[2rem] shadow-lg shadow-slate-200/50 dark:shadow-black/20 border border-slate-200/60 dark:border-slate-700/60 p-6">
              <div className="mb-5">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4 tracking-tight">
                  选择日期
                </h3>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full px-4 py-3.5 border border-slate-200/60 dark:border-slate-700/60 rounded-2xl bg-slate-50/80 dark:bg-slate-700/50 text-slate-900 dark:text-slate-100 text-[15px] font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all shadow-sm"
                />
              </div>

              {loading ? (
                <div className="text-center py-16">
                  <div className="inline-flex items-center gap-2 text-slate-500 dark:text-slate-400">
                    <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-sm font-medium">加载中...</span>
                  </div>
                </div>
              ) : tasksByDate[selectedDate] && tasksByDate[selectedDate].length > 0 ? (
                <div className="space-y-3">
                  {tasksByDate[selectedDate].map((task, index) => (
                    <div
                      key={task.id}
                      className={`group flex items-start gap-4 p-4 rounded-2xl border transition-all duration-200 ${
                        task.status === 'completed'
                          ? 'bg-emerald-50/60 dark:bg-emerald-900/15 border-emerald-200/60 dark:border-emerald-800/40'
                          : 'bg-slate-50/60 dark:bg-slate-700/30 border-slate-200/60 dark:border-slate-700/50 hover:bg-slate-100/80 dark:hover:bg-slate-700/50'
                      }`}
                      style={{
                        animation: `fadeIn 0.3s ease-out ${index * 0.05}s both`
                      }}
                    >
                      {/* iOS风格复选框 */}
                      <button
                        onClick={() => handleToggleTask(task)}
                        className="mt-0.5 flex-shrink-0 active:scale-90 transition-all duration-200"
                      >
                        {task.status === 'completed' ? (
                          <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center shadow-sm shadow-emerald-500/30">
                            <CheckCircle2 size={18} className="text-white" strokeWidth={2.5} />
                          </div>
                        ) : (
                          <div className="w-6 h-6 rounded-full border-2 border-slate-300 dark:border-slate-600 hover:border-blue-500 dark:hover:border-blue-500 transition-colors" />
                        )}
                      </button>

                      <div className="flex-1 min-w-0">
                        <p
                          className={`text-[15px] leading-relaxed font-medium ${
                            task.status === 'completed' 
                              ? 'line-through text-slate-500 dark:text-slate-500' 
                              : 'text-slate-900 dark:text-slate-100'
                          }`}
                        >
                          {task.content}
                        </p>
                        {task.completedTime && (
                          <div className="flex items-center gap-2 mt-2.5 text-xs text-slate-500 dark:text-slate-400">
                            <Clock size={12} className="opacity-60" />
                            <span>
                              {new Date(task.completedTime).toLocaleString('zh-CN', { 
                                month: 'short', 
                                day: 'numeric', 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </span>
                          </div>
                        )}
                      </div>

                      <button
                        onClick={() => handleDeleteTask(task.id)}
                        className="flex-shrink-0 p-2 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200 active:scale-90 opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 dark:bg-slate-700/50 flex items-center justify-center">
                    <Calendar size={28} className="text-slate-400 dark:text-slate-500" />
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 font-medium mb-1">该日期没有任务</p>
                  <p className="text-sm text-slate-500 dark:text-slate-500">选择其他日期或添加新任务</p>
                </div>
              )}
            </div>
          </div>
        )}
        </div>
      </div>
    </>
  );
};

export default GoalDetail;

