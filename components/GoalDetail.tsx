import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, CheckCircle2, Circle, Trash2, Calendar, Clock, TrendingUp, X } from 'lucide-react';
import { Goal } from '../types/goal';
import { goalTaskApi, GoalTaskVO } from '../services/goalTaskApi';
import { Button } from './Button';

interface GoalDetailProps {
  goal: Goal;
  onBack: () => void;
}

export const GoalDetail: React.FC<GoalDetailProps> = ({ goal, onBack }) => {
  const [tasks, setTasks] = useState<GoalTaskVO[]>([]);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'timeline' | 'calendar'>('timeline');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [showAddTask, setShowAddTask] = useState(false);
  const [newTaskContent, setNewTaskContent] = useState('');
  const [newTaskDate, setNewTaskDate] = useState<string>(new Date().toISOString().split('T')[0]);

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
  }, [goal.id]);

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
      alert('添加任务失败');
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
      alert('更新任务失败');
    }
  };

  // 删除任务
  const handleDeleteTask = async (taskId: number) => {
    if (!window.confirm('确定删除这个任务？')) return;

    try {
      await goalTaskApi.deleteTask(taskId);
      await loadTasks();
    } catch (error) {
      console.error('Failed to delete task:', error);
      alert('删除任务失败');
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
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50/30 to-indigo-50/50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
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

        {/* 时间线视图 - iOS风格 */}
        {viewMode === 'timeline' && (
          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-16 text-slate-500 dark:text-slate-400">加载中...</div>
            ) : sortedDates.length === 0 ? (
              <div className="text-center py-16 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-3xl shadow-sm border border-slate-200/50 dark:border-slate-700/50">
                <p className="text-slate-500 dark:text-slate-400">还没有任务，点击"添加任务"开始吧！</p>
              </div>
            ) : (
              <div className="space-y-4">
                {sortedDates.map((date, dateIndex) => {
                  const dateTasks = tasksByDate[date];
                  const dateObj = new Date(date);
                  const isToday = date === new Date().toISOString().split('T')[0];
                  const isPast = dateObj < new Date() && !isToday;

                  return (
                    <div key={date} className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-3xl shadow-sm border border-slate-200/50 dark:border-slate-700/50 overflow-hidden">
                      {/* 日期标题 */}
                      <div className={`px-5 sm:px-6 py-4 border-b border-slate-200/50 dark:border-slate-700/50 ${
                        isToday ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''
                      }`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`w-2 h-2 rounded-full ${
                              isToday ? 'bg-blue-500' : isPast ? 'bg-slate-400' : 'bg-green-500'
                            }`} />
                            <h3 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-slate-100">
                              {dateObj.toLocaleDateString('zh-CN', { 
                                year: 'numeric', 
                                month: 'long', 
                                day: 'numeric',
                                weekday: 'long'
                              })}
                            </h3>
                            {isToday && (
                              <span className="px-2.5 py-1 text-xs font-medium bg-blue-500 text-white rounded-full">
                                今天
                              </span>
                            )}
                          </div>
                          <div className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
                            {dateTasks.filter(t => t.status === 'completed').length}/{dateTasks.length}
                          </div>
                        </div>
                      </div>

                      {/* 任务列表 */}
                      <div className="p-4 sm:p-6 space-y-2.5">
                        {dateTasks.map((task) => (
                          <div
                            key={task.id}
                            className={`flex items-start gap-3 p-4 rounded-2xl border transition-all ${
                              task.status === 'completed'
                                ? 'bg-green-50/50 dark:bg-green-900/10 border-green-200/50 dark:border-green-800/30'
                                : 'bg-slate-50/50 dark:bg-slate-700/30 border-slate-200/50 dark:border-slate-700/50'
                            }`}
                          >
                            <button
                              onClick={() => handleToggleTask(task)}
                              className="mt-0.5 flex-shrink-0 active:scale-95 transition-transform"
                            >
                              {task.status === 'completed' ? (
                                <CheckCircle2 size={22} className="text-green-500" />
                              ) : (
                                <Circle size={22} className="text-slate-400" />
                              )}
                            </button>

                            <div className="flex-1 min-w-0">
                              <p
                                className={`text-slate-900 dark:text-slate-100 leading-relaxed ${
                                  task.status === 'completed' ? 'line-through opacity-60' : ''
                                }`}
                              >
                                {task.content}
                              </p>
                              {task.completedTime && (
                                <div className="flex items-center gap-1.5 mt-2 text-xs text-slate-500 dark:text-slate-400">
                                  <Clock size={12} />
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
                              className="flex-shrink-0 p-1.5 rounded-full text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all active:scale-95"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* 日历视图 - iOS风格 */}
        {viewMode === 'calendar' && (
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-3xl shadow-sm border border-slate-200/50 dark:border-slate-700/50 p-5 sm:p-6">
            <div className="mb-6">
              <h3 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
                最近7天
              </h3>
              <div className="grid grid-cols-7 gap-2">
                {recentStats.map((stat) => {
                  const dateObj = new Date(stat.date);
                  const isToday = stat.date === new Date().toISOString().split('T')[0];
                  const dayName = dateObj.toLocaleDateString('zh-CN', { weekday: 'short' });
                  const dayNum = dateObj.getDate();

                  return (
                    <div
                      key={stat.date}
                      className={`p-2.5 sm:p-3 rounded-2xl border text-center transition-all ${
                        isToday
                          ? 'bg-blue-500 text-white border-blue-600 shadow-lg shadow-blue-500/25'
                          : 'bg-slate-50/50 dark:bg-slate-700/50 border-slate-200/50 dark:border-slate-700/50'
                      }`}
                    >
                      <div className={`text-xs mb-1 font-medium ${isToday ? 'text-blue-100' : 'text-slate-500 dark:text-slate-400'}`}>
                        {dayName}
                      </div>
                      <div className={`text-base sm:text-lg font-semibold mb-1 ${isToday ? 'text-white' : 'text-slate-900 dark:text-slate-100'}`}>
                        {dayNum}
                      </div>
                      <div className={`text-xs font-medium ${isToday ? 'text-blue-100' : 'text-slate-600 dark:text-slate-400'}`}>
                        {stat.completed}/{stat.total}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 选中日期的任务 */}
            <div>
              <h3 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
                选择日期
              </h3>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="mb-4 w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-2xl bg-slate-50 dark:bg-slate-700/50 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />

              {loading ? (
                <div className="text-center py-12 text-slate-500 dark:text-slate-400">加载中...</div>
              ) : tasksByDate[selectedDate] ? (
                <div className="space-y-2.5">
                  {tasksByDate[selectedDate].map((task) => (
                    <div
                      key={task.id}
                      className={`flex items-start gap-3 p-4 rounded-2xl border ${
                        task.status === 'completed'
                          ? 'bg-green-50/50 dark:bg-green-900/10 border-green-200/50 dark:border-green-800/30'
                          : 'bg-slate-50/50 dark:bg-slate-700/30 border-slate-200/50 dark:border-slate-700/50'
                      }`}
                    >
                      <button
                        onClick={() => handleToggleTask(task)}
                        className="mt-0.5 flex-shrink-0 active:scale-95 transition-transform"
                      >
                        {task.status === 'completed' ? (
                          <CheckCircle2 size={22} className="text-green-500" />
                        ) : (
                          <Circle size={22} className="text-slate-400" />
                        )}
                      </button>

                      <div className="flex-1 min-w-0">
                        <p
                          className={`text-slate-900 dark:text-slate-100 leading-relaxed ${
                            task.status === 'completed' ? 'line-through opacity-60' : ''
                          }`}
                        >
                          {task.content}
                        </p>
                        {task.completedTime && (
                          <div className="flex items-center gap-1.5 mt-2 text-xs text-slate-500 dark:text-slate-400">
                            <Clock size={12} />
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
                        className="flex-shrink-0 p-1.5 rounded-full text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all active:scale-95"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-slate-500 dark:text-slate-400">
                  该日期没有任务
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GoalDetail;

