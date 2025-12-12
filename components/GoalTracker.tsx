import React, { useState, useEffect } from 'react';
import { Target, Plus, CheckCircle2, X, Edit2, Trash2, Calendar, TrendingUp } from 'lucide-react';
import { Button } from './Button';
import { GoalDetail } from './GoalDetail';
import { Goal } from '../types/goal';

export type { Goal };

interface GoalTrackerProps {
  goals: Goal[];
  onAddGoal: (goal: Omit<Goal, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onUpdateGoal: (id: string, goal: Partial<Goal>) => void;
  onDeleteGoal: (id: string) => void;
}

export const GoalTracker: React.FC<GoalTrackerProps> = ({
  goals,
  onAddGoal,
  onUpdateGoal,
  onDeleteGoal,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    targetDate: '',
    progress: 0,
    status: 'active' as Goal['status'],
  });

  const activeGoals = goals.filter(g => g.status === 'active');
  const completedGoals = goals.filter(g => g.status === 'completed');

  // 如果选中了目标，显示详情页
  if (selectedGoal) {
    return (
      <GoalDetail
        goal={selectedGoal}
        onBack={() => setSelectedGoal(null)}
        onUpdateGoal={async (id, updates) => {
          await onUpdateGoal(id, updates);
          // 本地同步选中项的进度/状态，提升即时反馈
          setSelectedGoal((prev) =>
            prev ? { ...prev, ...updates } as Goal : null
          );
        }}
      />
    );
  }

  const handleSubmit = () => {
    if (!formData.title.trim()) return;

    if (editingGoal) {
      onUpdateGoal(editingGoal.id, formData);
    } else {
      onAddGoal({
        ...formData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }

    setFormData({
      title: '',
      description: '',
      targetDate: '',
      progress: 0,
      status: 'active',
    });
    setShowAddModal(false);
    setEditingGoal(null);
  };

  const handleEdit = (goal: Goal) => {
    setEditingGoal(goal);
    setFormData({
      title: goal.title,
      description: goal.description || '',
      targetDate: goal.targetDate || '',
      progress: goal.progress,
      status: goal.status,
    });
    setShowAddModal(true);
  };

  const handleComplete = (goal: Goal) => {
    onUpdateGoal(goal.id, { status: 'completed', progress: 100 });
  };

  const renderGoalCard = (goal: Goal) => (
    <div
      key={goal.id}
      onClick={() => setSelectedGoal(goal)}
      className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all cursor-pointer hover:border-blue-300 dark:hover:border-blue-600"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="font-bold text-slate-800 dark:text-slate-100 text-lg mb-1">
            {goal.title}
          </h3>
          {goal.description && (
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
              {goal.description}
            </p>
          )}
          {goal.targetDate && (
            <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-500 mb-2">
              <Calendar size={12} />
              {new Date(goal.targetDate).toLocaleDateString('zh-CN')}
            </div>
          )}
        </div>
        <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
          {goal.status === 'active' && (
            <button
              onClick={() => handleComplete(goal)}
              className="p-1.5 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-900/30 transition-colors"
              title="完成目标"
            >
              <CheckCircle2 size={16} className="text-emerald-600 dark:text-emerald-400" />
            </button>
          )}
          <button
            onClick={() => handleEdit(goal)}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            title="编辑"
          >
            <Edit2 size={16} className="text-slate-600 dark:text-slate-400" />
          </button>
          <button
            onClick={() => onDeleteGoal(goal.id)}
            className="p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-900/30 transition-colors"
            title="删除"
          >
            <Trash2 size={16} className="text-rose-600 dark:text-rose-400" />
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-600 dark:text-slate-400">进度</span>
          <span className="font-bold text-slate-800 dark:text-slate-100">{goal.progress}%</span>
        </div>
        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${
              goal.progress === 100
                ? 'bg-emerald-500'
                : goal.progress >= 50
                ? 'bg-indigo-500'
                : 'bg-amber-500'
            }`}
            style={{ width: `${goal.progress}%` }}
          />
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl">
            <Target size={20} className="text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">目标追踪</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {activeGoals.length} 个进行中，{completedGoals.length} 个已完成
            </p>
          </div>
        </div>
        <Button
          onClick={() => {
            setEditingGoal(null);
            setFormData({
              title: '',
              description: '',
              targetDate: '',
              progress: 0,
              status: 'active',
            });
            setShowAddModal(true);
          }}
          icon={<Plus size={18} />}
          className="rounded-xl"
        >
          新建目标
        </Button>
      </div>

      {/* Active Goals */}
      {activeGoals.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-3 flex items-center gap-2">
            <TrendingUp size={14} />
            进行中
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeGoals.map(renderGoalCard)}
          </div>
        </div>
      )}

      {/* Completed Goals */}
      {completedGoals.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-3 flex items-center gap-2">
            <CheckCircle2 size={14} />
            已完成
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 opacity-75">
            {completedGoals.map(renderGoalCard)}
          </div>
        </div>
      )}

      {/* Empty State */}
      {goals.length === 0 && (
        <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
          <Target size={48} className="mx-auto text-slate-300 dark:text-slate-600 mb-4" />
          <h3 className="text-slate-600 dark:text-slate-400 font-medium mb-1">还没有目标</h3>
          <p className="text-slate-400 dark:text-slate-500 text-xs mb-4">设定目标，让复盘更有方向</p>
          <Button onClick={() => setShowAddModal(true)} variant="secondary" className="rounded-xl">
            创建第一个目标
          </Button>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          style={{
            background: 'rgba(0, 0, 0, 0.4)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
          }}
          onClick={() => {
            setShowAddModal(false);
            setEditingGoal(null);
          }}
        >
          <div
            className="relative w-full max-w-md bg-white dark:bg-slate-800 rounded-3xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">
                  {editingGoal ? '编辑目标' : '新建目标'}
                </h3>
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingGoal(null);
                  }}
                  className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                >
                  <X size={20} className="text-slate-400" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    目标标题 *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="例如：每天复盘30天"
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    目标描述
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="详细描述你的目标..."
                    rows={3}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 dark:text-slate-100"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                      目标日期
                    </label>
                    <input
                      type="date"
                      value={formData.targetDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, targetDate: e.target.value }))}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 dark:text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                      当前进度 (%)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={formData.progress}
                      onChange={(e) => setFormData(prev => ({ ...prev, progress: parseInt(e.target.value) || 0 }))}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 dark:text-slate-100"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={() => {
                      setShowAddModal(false);
                      setEditingGoal(null);
                    }}
                    variant="secondary"
                    className="flex-1 rounded-xl"
                  >
                    取消
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    disabled={!formData.title.trim()}
                    className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white border-0 shadow-lg shadow-indigo-500/30 rounded-xl"
                  >
                    {editingGoal ? '保存' : '创建'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

